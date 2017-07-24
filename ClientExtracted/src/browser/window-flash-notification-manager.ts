/**
 * @module Browser
 */ /** for typedoc */

import { BrowserWindow } from 'electron';

import { ReduxComponent } from '../lib/redux-component';
import { nativeInterop } from '../native-interop';
import { NotificationEvent } from '../reducers/notifications-reducer';
import { notificationStore } from '../stores/notification-store';
import { settingStore } from '../stores/setting-store';
import { windowStore } from '../stores/window-store';
import { windowFlashBehaviorType } from './behaviors/main-window-close-behavior';

const { getIdleTimeInMs } = nativeInterop;

// The amount of time (in milliseconds) that a user must be inactive before
// we'll flash their taskbar icon.
const idleThresholdMs = 10 * 1000;

export interface WindowFlashNotificationManagerState {
  newNotificationEvent: NotificationEvent;
  windowFlashBehavior: windowFlashBehaviorType;
  isWindows: boolean;
  mainWindow: Electron.BrowserWindow;
}

// This component flashes the window when a notification comes in, on Windows
export class WindowFlashNotificationManager extends ReduxComponent<WindowFlashNotificationManagerState> {
  public syncState(): WindowFlashNotificationManagerState {
    return {
      newNotificationEvent: notificationStore.getNewNotificationEvent(),
      windowFlashBehavior: settingStore.getSetting<windowFlashBehaviorType>('windowFlashBehavior'),
      isWindows: settingStore.isWindows(),
      mainWindow: BrowserWindow.fromId(windowStore.getMainWindow()!.id)
    };
  }

  // Flash the current window on Windows when a notification comes in
  public newNotificationEvent(): void {
    switch (this.state.windowFlashBehavior) {
    case 'always':
      break;
    case 'idle': {
      const idleTime = getIdleTimeInMs();
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
