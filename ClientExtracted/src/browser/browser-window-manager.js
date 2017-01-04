import {nativeImage, BrowserWindow} from 'electron';
import ipc from '../ipc-rx';
import {logger} from '../logger';

import AppStore from '../stores/app-store';
import AppTeamsStore from '../stores/app-teams-store';
import {dialogStore} from '../stores/dialog-store';
import EventStore from '../stores/event-store';
import ReduxComponent from '../lib/redux-component';
import {settingStore} from '../stores/setting-store';
import TeamStore from '../stores/team-store';
import {WindowHelpers} from '../components/helpers/window-helpers';
import WindowStore from '../stores/window-store';

import {WINDOW_TYPES, UPDATE_STATUS} from '../utils/shared-constants';
const CHILD_WINDOWS = [WINDOW_TYPES.WEBAPP];

/**
 * Handles window interactions that need to occur within the browser process.
 */
export default class BrowserWindowManager extends ReduxComponent {
  constructor() {
    super();
    this.disposables.add(this.handleOverlayIcon());
    this.update();
  }

  /**
   * Closes all child windows on exit.
   */
  dispose() {
    this.forEachWindowOfType(CHILD_WINDOWS,
      (browserWindow) => browserWindow.close());
    super.dispose();
  }

  syncState() {
    let selectedTeamId = AppTeamsStore.getSelectedTeamId();
    return {
      mainWindow: WindowStore.getMainWindow(),
      childWindows: WindowStore.getWindows(CHILD_WINDOWS),
      selectedTeam: TeamStore.getTeam(selectedTeamId) || null,
      autoHideMenuBar: settingStore.getSetting('autoHideMenuBar'),
      isShowingDevTools: dialogStore.isShowingDevTools(),
      isMac: settingStore.isMac(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),

      quitAppEvent: EventStore.getEvent('quitApp'),
      signOutTeamEvent: EventStore.getEvent('signOutTeam'),
      reloadEvent: EventStore.getEvent('reload'),
      editingCommandEvent: EventStore.getEvent('editingCommand'),
      toggleFullScreenEvent: EventStore.getEvent('toggleFullScreen'),

      // Events that foreground the main app window
      foregroundAppEvent: EventStore.getEvent('foregroundApp'),
      clickNotificationEvent: EventStore.getEvent('clickNotification'),
      handleDeepLinkEvent: EventStore.getEvent('handleDeepLink'),
      updateStatus: AppStore.getUpdateStatus(),
      showWebappDialogEvent: EventStore.getEvent('showWebappDialog')
    };
  }

  getMainWindow() {
    return BrowserWindow.fromId(this.state.mainWindow.id);
  }

  callOnFocusedWindow(func) {
    let browserWindow = BrowserWindow.getFocusedWindow();
    if (browserWindow) {
      func(browserWindow);
    }
  }

  focusMainWindow() {
    let mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    let restoredFromTray = !mainWindow.isVisible();
    WindowHelpers.bringToForeground(mainWindow);

    // If we recreated the taskbar icon we also need to redraw the overlay
    if (restoredFromTray && this.overlay) {
      mainWindow.setOverlayIcon(this.overlay, this.overlayDescription);
    }
  }

  /**
   * Closing the main window will trigger app shutdown.
   */
  quitAppEvent() {
    this.forEachWindowOfType(CHILD_WINDOWS,
      (browserWindow) => browserWindow.hide());

    // Setting this overrides the `MainWindowCloseBehavior`
    let mainWindow = this.getMainWindow();
    mainWindow.exitApp = true;
    mainWindow.close();
  }

  /**
   * Ensures that child windows of a team are closed when the user signs out
   *
   * @param {Object.string} {teamId}
   */
  signOutTeamEvent({teamId}) {
    if (!teamId) return;

    this.forEachWindowOfTeam([teamId], (win) => {
      if (win && win.close && !win.isDestroyed()) win.close();
    });
  }

  /**
   * Reload the main window, or the focused child window. Individual team views
   * handle this event separately.
   *
   * @param  {Bool} {everything}  True to reload the main window, false to reload
   *                              just the focused window or a single team
   */
  reloadEvent({everything}) {
    const mainWindow = this.getMainWindow();

    if (everything) {
      mainWindow.reload();
      return;
    }

    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;

    let windowParams = this.state.childWindows[focusedWindow.id];

    // NB: Calls windows do not support being reloaded
    if (windowParams && !WindowStore.isCallsWindow(windowParams.subType)) {
      focusedWindow.reload();
    }
  }

  /**
   * Perform an action on each window that matches the given types.
   *
   * @param {Array}     types   An array of types specifying which windows to act on
   * @param {Function}  action  The action to take on the BrowserWindow
   */
  forEachWindowOfType(types, action) {
    let windowSet = new Set(types);

    Object.keys(this.state.childWindows).forEach((key) => {
      let entry = this.state.childWindows[key];
      if (!windowSet.has(entry.type)) return;

      try {
        let browserWindow = BrowserWindow.fromId(entry.id);
        if (browserWindow) action(browserWindow);
      } catch (e) {
        logger.warn(`Could not act on browser window ${JSON.stringify(entry)}: ${e.stack}`);
      }
    });
  }

  /**
   * Perform an action on each child window that matches the given team.
   *
   * @param {Array}     teams   An array of teams specifying which windows to act on
   * @param {Function}  action  The action to take on the BrowserWindow
   */
  forEachWindowOfTeam(teams = [], action) {
    teams.forEach((team) => {
      Object.keys(WindowStore.getWindowsForTeam(team)).forEach((key) => {
        let entry = this.state.childWindows[key];

        try {
          let browserWindow = BrowserWindow.fromId(entry.id);
          if (browserWindow) action(browserWindow);
        } catch (e) {
          logger.warn(`Could not act on browser window ${JSON.stringify(entry)}: ${e.stack}`);
        }
      });
    });
  }

  /**
   * Passes editing commands to the specified window or the currently focused
   * window, if no ID is provided.
   */
  editingCommandEvent({command, windowId}) {
    let webContentFunctions = {
      'undo': (w) => w.undo(),
      'redo': (w) => w.redo(),
      'cut': (w) => w.cut(),
      'copy': (w) => w.copy(),
      'paste': (w) => w.paste(),
      'delete': (w) => w.delete(),
      'select-all': (w) => w.selectAll()
    };

    // Otherwise let the renderer handle it
    if (!webContentFunctions[command]) return;

    if (windowId) {
      let browserWindow = BrowserWindow.fromId(windowId);
      webContentFunctions[command](browserWindow.webContents);
    } else {
      this.callOnFocusedWindow((browserWindow) => {
        webContentFunctions[command](browserWindow.webContents);
      });
    }
  }

  toggleFullScreenEvent() {
    let focusedWindow = BrowserWindow.getFocusedWindow();

    if (!focusedWindow) return;

    let focusedWindowType = WindowStore.typeOfWindow(focusedWindow.id);

    if (focusedWindowType === WINDOW_TYPES.WEBAPP && !WindowStore.isCallsWindow(focusedWindow)) {
      return focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    }

    let mainWindow = this.getMainWindow();
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }

  foregroundAppEvent() {
    this.focusMainWindow();
  }

  clickNotificationEvent() {
    this.focusMainWindow();
  }

  handleDeepLinkEvent() {
    this.focusMainWindow();
  }

  showWebappDialogEvent() {
    this.focusMainWindow();
  }

  /**
   * Listen to messages from the renderer describing the overlay icon and set
   * it accordingly. This is deeply un-React, but it's too expensive to put
   * the image buffer into state.
   *
   * @return {Subscription}  A Subscription that will unsubscribe the listener
   */
  handleOverlayIcon() {
    return ipc.listen('window:set-overlay-icon').subscribe((buf) => {
      let mainWindow = this.getMainWindow();
      if (buf) {
        this.overlay = nativeImage.createFromBuffer(buf, 96);
        this.overlayDescription = 'You have unread messages';
        mainWindow.setOverlayIcon(this.overlay, this.overlayDescription);
      } else {
        this.overlay = null;
        this.overlayDescription = '';
        mainWindow.setOverlayIcon(this.overlay, this.overlayDescription);
      }
    });
  }

  /**
   * Sets the main window title to match the currently selected team.
   *
   * @param  {Object} prevSelectedTeam = null The previously selected team
   */
  handleMainWindowTitle(prevSelectedTeam = null) {
    let mainWindow;

    if (!this.state.selectedTeam) {
      mainWindow = this.getMainWindow();
      mainWindow.setTitle(`Slack`);
    } else if (!prevSelectedTeam && this.state.selectedTeam ||
      prevSelectedTeam.team_name !== this.state.selectedTeam.team_name) {
      mainWindow = this.getMainWindow();
      mainWindow.setTitle(`Slack - ${this.state.selectedTeam.team_name}`);
    }
  }

  update(prevState = {}) {
    this.handleMainWindowTitle(prevState.selectedTeam);

    let mainWindow = this.getMainWindow();
    let focusedWindow = BrowserWindow.getFocusedWindow();
    WindowHelpers.updateDevTools(mainWindow, prevState, this.state);
    if (mainWindow !== focusedWindow) {
      WindowHelpers.updateDevTools(focusedWindow, prevState, this.state);
    }

    if (!this.state.isMac && this.state.autoHideMenuBar !== prevState.autoHideMenuBar) {
      mainWindow.setAutoHideMenuBar(this.state.autoHideMenuBar);
      mainWindow.setMenuBarVisibility(!this.state.autoHideMenuBar);
    }

    // Focus main window when the login dialog is shown
    if (!prevState.isShowingLoginDialog && this.state.isShowingLoginDialog) {
      this.focusMainWindow();
    }

    if (prevState.updateStatus !== this.state.updateStatus && this.state.updateStatus === UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL) {
      this.focusMainWindow();
    }
  }
}
