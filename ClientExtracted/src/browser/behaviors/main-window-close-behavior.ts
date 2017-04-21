/**
 * @module BrowserBehaviors
 */ /** for typedoc */

import { app } from 'electron';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { logger } from '../../logger';
import { WindowBehavior } from './window-behavior';

import { dialogActions, BalloonContent } from '../../actions/dialog-actions';
import { settingActions } from '../../actions/setting-actions';
import { settingStore } from '../../stores/setting-store';
import { WindowHelpers } from '../../utils/window-helpers';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

export type windowFlashBehaviorType = 'idle' | 'always';

export interface MainWindowCloseBehaviorState {
  runFromTray: boolean;
  hasRunFromTray: boolean;
  isWindows: boolean;
  windowFlashBehavior?: windowFlashBehaviorType;
  hasExplainedWindowFlash?: boolean;
}

export class MainWindowCloseBehavior extends WindowBehavior {
  public readonly state: MainWindowCloseBehaviorState;

  public syncState(): MainWindowCloseBehaviorState {
    const state = {
      runFromTray: settingStore.getSetting<boolean>('runFromTray'),
      hasRunFromTray: settingStore.getSetting<boolean>('hasRunFromTray'),
      isWindows: settingStore.isWindows()
    };

    if (state.isWindows) {
      Object.assign(state, {
        windowFlashBehavior: settingStore.getSetting('windowFlashBehavior'),
        hasExplainedWindowFlash: settingStore.getSetting('hasExplainedWindowFlash')
      });
    }

    return state;
  }

  /**
   * Attaches this behavior to the given window. In addition to this, the main
   * window `close` event should first check `canWindowBeClosed`.
   *
   * @param  {BrowserWindow} mainWindow The window to attach the behavior to
   * @return {Subscription}               A Subscription that will unsubscribe any listeners
   */
  public setup(mainWindow: Electron.BrowserWindow): Subscription {
    const subscription = new Subscription();

    subscription.add(Observable.fromEvent(app, 'before-quit').subscribe(() => {
      mainWindow.exitApp = true;
    }));

    subscription.add(Observable.fromEvent(app, 'activate').subscribe(() => {
      WindowHelpers.bringToForeground(mainWindow);
    }));

    return subscription;
  }

  /**
   * Call this on main window `close` to determine whether the event should be
   * prevented. This also handles hiding the window and showing a balloon that
   * explains the behavior to first-time users.
   *
   * @param  {BrowserWindow} mainWindow The window being closed
   * @return {Boolean}  True if the window can be closed, false to cancel it
   */
  public canWindowBeClosed(mainWindow: Electron.BrowserWindow): boolean {
    // NB: User chose to quit from the app or tray menu, or run from tray is
    // disabled. Also if window flash behavior is set to always, we keep the
    // app minimized.
    const keepAppInTaskbar = this.state.isWindows && this.state!.windowFlashBehavior === 'always';
    const allowClose = mainWindow.exitApp || (!this.state.runFromTray && !keepAppInTaskbar);

    if (allowClose) {
      const reason = mainWindow.exitApp ?
        'user chose to quit' :
        'run from tray is disabled';
      logger.info(`Allowing window close because ${reason}`);
      return true;
    }

    if (keepAppInTaskbar) {
      logger.info('Attempted to close the window, minimizing due to window flash');
      mainWindow.minimize();
    } else {
      logger.info('Attempted to close the window, hiding due to run from tray');
      mainWindow.hide();
    }

    this.maybeShowTrayBalloons(keepAppInTaskbar);

    return false;
  }

  /**
   * The first time we ignore window close (due to any preference), show a
   * balloon / notification hinting that we're still there.
   */
  private maybeShowTrayBalloons(keepAppInTaskbar: boolean): void {
    let args: BalloonContent | null = null;

    if (keepAppInTaskbar && !this.state.hasExplainedWindowFlash) {
      settingActions.updateSettings({ hasExplainedWindowFlash: true });
      args = {
        title: $intl.t(`Why didn't Slack quit?`, LOCALE_NAMESPACE.BROWSER)(),
        content: $intl.t(`Slack’s set to always flash when you get notifications. To change this, visit Preferences > Notifications.`,
                          LOCALE_NAMESPACE.BROWSER)()
      };
    } else if (!keepAppInTaskbar && !this.state.hasRunFromTray) {
      settingActions.updateSettings({ hasRunFromTray: true });
      args = {
        title: $intl.t(`Why didn't Slack quit?`, LOCALE_NAMESPACE.BROWSER)(),
        content: $intl.t(`Slack's set to stay running in the notification area. To change this, visit Preferences > {platform} App.`, // tslint:disable-line:max-line-length
                          LOCALE_NAMESPACE.BROWSER)({
                            platform: this.state.isWindows ?
                                      $intl.t(`Windows`, LOCALE_NAMESPACE.GENERAL)() :
                                      $intl.t(`Linux`, LOCALE_NAMESPACE.GENERAL)()
                          })
      };
    }

    if (args) dialogActions.showBalloon(args);
  }
}
