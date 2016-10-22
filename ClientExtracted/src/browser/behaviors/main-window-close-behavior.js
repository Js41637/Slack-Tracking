import {app} from 'electron';
import _ from 'lodash';
import {Observable, CompositeDisposable} from 'rx';
import logger from '../../logger';
import WindowBehavior from './window-behavior';

import AppActions from '../../actions/app-actions';
import SettingActions from '../../actions/setting-actions';
import SettingStore from '../../stores/setting-store';
import WindowHelpers from '../../components/helpers/window-helpers';

export default class MainWindowCloseBehavior extends WindowBehavior {

  syncState() {
    let state = {
      runFromTray: SettingStore.getSetting('runFromTray'),
      hasRunFromTray: SettingStore.getSetting('hasRunFromTray'),
      isWindows: SettingStore.isWindows()
    };

    if (state.isWindows) {
      _.extend(state, {
        windowFlashBehavior: SettingStore.getSetting('windowFlashBehavior'),
        hasExplainedWindowFlash: SettingStore.getSetting('hasExplainedWindowFlash')
      });
    }

    return state;
  }

  /**
   * Attaches this behavior to the given window. In addition to this, the main
   * window `close` event should first check `canWindowBeClosed`.
   *
   * @param  {BrowserWindow} mainWindow The window to attach the behavior to
   * @return {Disposable}               A Disposable that will unsubscribe any listeners
   */
  setup(mainWindow) {
    let disp = new CompositeDisposable();

    disp.add(Observable.fromEvent(app, 'before-quit').subscribe(() => {
      mainWindow.exitApp = true;
    }));

    disp.add(Observable.fromEvent(app, 'activate').subscribe(() => {
      WindowHelpers.bringToForeground(mainWindow);
    }));

    return disp;
  }

  /**
   * Call this on main window `close` to determine whether the event should be
   * prevented. This also handles hiding the window and showing a balloon that
   * explains the behavior to first-time users.
   *
   * @param  {BrowserWindow} mainWindow The window being closed
   * @return {Boolean}  True if the window can be closed, false to cancel it
   */
  canWindowBeClosed(mainWindow) {
    // NB: User chose to quit from the app or tray menu, or run from tray is
    // disabled. Also if window flash behavior is set to always, we keep the
    // app minimized.
    let keepAppInTaskbar = this.state.isWindows && this.state.windowFlashBehavior === 'always';
    let allowClose = mainWindow.exitApp || (!this.state.runFromTray && !keepAppInTaskbar);

    if (allowClose) {
      let reason = mainWindow.exitApp ?
        "user chose to quit" :
        "run from tray is disabled";
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
  maybeShowTrayBalloons(keepAppInTaskbar) {
    let args;

    if (keepAppInTaskbar && !this.state.hasExplainedWindowFlash) {
      SettingActions.updateSettings({hasExplainedWindowFlash: true});
      args = {
        title: "Why didn't Slack quit?",
        content: "Slack’s set to always flash when you get notifications. To change this, visit Preferences > Notifications."
      };
    } else if (!keepAppInTaskbar && !this.state.hasRunFromTray) {
      SettingActions.updateSettings({hasRunFromTray: true});
      args = {
        title: "Why didn't Slack quit?",
        content: `Slack's set to stay running in the notification area. To change this, visit Preferences > ${this.state.isWindows ? 'Windows' : 'Linux'} App.`
      };
    }

    if (args) AppActions.showBalloon(args);
  }
}
