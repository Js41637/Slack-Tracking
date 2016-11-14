import {BrowserWindow, powerMonitor, screen} from 'electron';

import logger from '../logger';
import {Observable} from 'rxjs/Observable';
import '../custom-operators';

import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';
import WindowCreator from './window-creator';
import WindowStore from '../stores/window-store';

/**
 * Handles the lifecycle and visibility of the notifications window, which is
 * used on Windows 7 / 8 to render HTML notifications.
 */
export default class NotificationWindowManager extends ReduxComponent {
  constructor() {
    super();

    this.disposables.add(
      this.handleDisplayChanges()
    );

    if (this.state.isShowingHtmlNotifications) {
      WindowCreator.createNotificationsWindow();
    }
  }

  dispose() {
    this.closeNotificationsWindow();
    super.dispose();
  }

  syncState() {
    return {
      notificationsWindow: WindowStore.getNotificationsWindow(),
      isShowingHtmlNotifications: SettingStore.isShowingHtmlNotifications()
    };
  }

  /**
   * If any display has been changed, we need to recreate the notification
   * window to fit the new display.
   */
  handleDisplayChanges() {
    let anyDisplayChanged = Observable.merge(
      Observable.fromEvent(screen, 'display-added'),
      Observable.fromEvent(screen, 'display-removed'),
      Observable.fromEvent(screen, 'display-metrics-changed'),
      Observable.fromEvent(powerMonitor, 'resume')
    );

    // NB: Throttle will fire immediately for the first display change, since
    // it starts its timer when subscribed. `switch` ensures that we respond to
    // any event three seconds later.
    return anyDisplayChanged
      .guaranteedThrottle(3000)
      .filter(() => this.state.isShowingHtmlNotifications)
      .subscribe(() => {
        logger.info('Display changed! Recreating notifications window');
        this.closeNotificationsWindow();
        WindowCreator.createNotificationsWindow();
      });
  }

  closeNotificationsWindow() {
    let entry = this.state.notificationsWindow;
    if (!entry) return;
    try {
      let browserWindow = BrowserWindow.fromId(entry.id);
      browserWindow.close();
    } catch (error) {
      logger.warn(`Unable to close notifications window: ${error.message}`);
    }
  }
}
