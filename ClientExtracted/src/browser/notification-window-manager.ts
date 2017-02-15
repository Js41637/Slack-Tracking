import {BrowserWindow, powerMonitor, screen} from 'electron';

import {logger} from '../logger';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import '../custom-operators';

import {ReduxComponent} from '../lib/redux-component';
import {settingStore} from '../stores/setting-store';
import {WindowCreatorBase} from './window-creator-base';
import {windowStore} from '../stores/window-store';

export interface NotificationWindowManagerState {
  isShowingHtmlNotifications: boolean;
  notificationsWindow: any;
}
/**
 * Handles the lifecycle and visibility of the notifications window, which is
 * used on Windows 7 / 8 to render HTML notifications.
 */
export class NotificationWindowManager extends ReduxComponent<NotificationWindowManagerState> {
  constructor(private readonly windowCreator: WindowCreatorBase, ..._args: Array<any>) {
    super();

    this.disposables.add(this.handleDisplayChanges());

    if (this.state.isShowingHtmlNotifications) {
      this.windowCreator.createNotificationsWindow();
    }
  }

  public dispose(): void {
    this.closeNotificationsWindow();
    super.dispose();
  }

  public syncState(): NotificationWindowManagerState {
    return {
      notificationsWindow: windowStore.getNotificationsWindow(),
      isShowingHtmlNotifications: settingStore.isShowingHtmlNotifications()
    };
  }

  /**
   * If any display has been changed, we need to recreate the notification
   * window to fit the new display.
   */
  private handleDisplayChanges(): Subscription {
    const anyDisplayChanged = Observable.merge(
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
        this.windowCreator.createNotificationsWindow();
      });
  }

  private closeNotificationsWindow(): void {
    const entry = this.state.notificationsWindow;
    if (!entry) return;
    try {
      const browserWindow = BrowserWindow.fromId(entry.id);
      browserWindow.close();
    } catch (error) {
      logger.warn(`Unable to close notifications window: ${error.message}`);
    }
  }
}
