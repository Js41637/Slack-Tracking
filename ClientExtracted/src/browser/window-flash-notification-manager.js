import {BrowserWindow} from 'electron';
import {getIdleTimeInMs} from '../native-interop';

import NotificationStore from '../stores/notification-store';
import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';
import WindowStore from '../stores/window-store';

// The amount of time (in milliseconds) that a user must be inactive before
// we'll flash their taskbar icon.
const idleThresholdMs = 10 * 1000;

// This component flashes the window when a notification comes in, on Windows
export default class WindowFlashNotificationManager extends ReduxComponent {
  syncState() {
    return {
      newNotificationEvent: NotificationStore.getNewNotificationEvent(),
      windowFlashBehavior: SettingStore.getSetting('windowFlashBehavior'),
      isWindows: SettingStore.isWindows(),
      mainWindow: BrowserWindow.fromId(WindowStore.getMainWindow().id)
    };
  }

  // Flash the current window on Windows when a notification comes in
  newNotificationEvent() {
    switch (this.state.windowFlashBehavior) {
    case 'always':
      break;
    case 'idle': {
      let idleTime = getIdleTimeInMs();
      if (idleTime < idleThresholdMs) return;

      // If flash is set to 'always', the window is never hidden
      // - but if it's set to idle, we'll have to revive it
      if (this.state.isWindows && !this.state.mainWindow.isVisible()) {
        this.state.mainWindow.showInactive();
        this.state.mainWindow.minimize();
      }

      break;
    }
    default:
      return;
    }

    this.state.mainWindow.flashFrame(true);
  }
}
