/**
 * @module SSBIntegration
 */ /** for typedoc */

import { NotifyNotificationOptions } from 'src/renderer/notifications/interfaces';
import { notificationActions } from '../actions/notification-actions';
import { logger } from '../logger';
import { nativeInterop } from '../native-interop';
import { settingStore } from '../stores/setting-store';

let getIsQuietHours = () => false;
try {
  getIsQuietHours = require('windows-quiet-hours').getIsQuietHours;
} catch (e) {
  logger.error(`Failed to load windows-quiet-hours: ${e.message}`);
}

export class NotificationIntegration {
  /**
   * Occurs when the webapp needs to display a notification.
   *
   * @param {NotifyNotificationOptions} args
   */
  public notify(args: NotifyNotificationOptions): void {
    if (nativeInterop.isWindows10OrHigher(true) || nativeInterop.shouldDisplayNotifications()) {
      const interactive = window.TS && window.TS.boot_data && window.TS.boot_data.feature_interactive_win_notifs;
      const options = { ...args, interactive, teamId: window.teamId };
      notificationActions.newNotification(options);
    }
  }

  /**
   * Return whether the webapp should not attempt to play notification sounds
   * because of Windows 10 Quiet Hours.
   *
   * @return {Bool}  True if they should be muted
   */
  public shouldMuteAudio(): boolean {
    try {
      return getIsQuietHours();
    } catch (error) {
      logger.warn(`Unable to read quiet hours setting: ${error.message}`);
      return false;
    }
  }

  /**
   * On Mac, we need to attach the sound file to the notification rather than
   * let the webapp play it. The OS will decide if the sound should be played,
   * based on system DND settings.
   *
   * @return {Bool}  True if sound need to be attached
   */
  public shouldAttachSoundToNotification(): boolean {
    if (process.platform === 'darwin') {
      return true;
    }

    if (nativeInterop.isWindows10OrHigher()) {
      const notificationMethod = settingStore.getSetting('notificationMethod');
      return !(notificationMethod && notificationMethod !== 'winrt');
    }

    return false;
  }
}
