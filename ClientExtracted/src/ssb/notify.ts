/**
 * @module SSBIntegration
 */ /** for typedoc */

import { logger } from '../logger';
import { nativeInterop } from '../native-interop';
import { notificationActions, Notification } from '../actions/notification-actions';

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
   * @param  {Object} args            Contains the notification data
   * @param  {String} args.title      The notification title, e.g., "[earth] in #tardis"
   * @param  {String} args.content    The notification content, e.g., "John Smith: Allons y alonso"
   * @param  {String} args.launchUri  A URI used to activate our app and focus the message, e.g.,
   *                                  "slack://channel?id=1234&message=123.231"
   * @param  {String} args.channel    The channel ID where the notification occurred, e.g., "C054787UZ"
   */
  public notify(args: Notification) {
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
    return process.platform === 'darwin';
  }
}
