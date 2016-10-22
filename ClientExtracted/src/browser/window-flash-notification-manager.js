import {getIdleTimeInMs} from '../native-interop';
import logger from '../logger';

import NotificationStore from '../stores/notification-store';
import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';

// The amount of time (in milliseconds) that a user must be inactive before
// we'll flash their taskbar icon.
const idleThresholdMs = 10 * 1000;

// This component flashes the window when a notification comes in, on Windows
export default class WindowFlashNotificationManager extends ReduxComponent {
  
  constructor(mainWindow) {
    super();
    this.mainWindow = mainWindow;
  }

  syncState() {
    return {
      newNotificationEvent: NotificationStore.getNewNotificationEvent(),
      windowFlashBehavior: SettingStore.getSetting('windowFlashBehavior')
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
      break;
    }
    default:
      return;
    }

    logger.info('About to flash window!');
    this.mainWindow.flashFrame(true);
  }
}
