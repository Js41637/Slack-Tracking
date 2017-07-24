/**
 * @module Browser
 */ /** for typedoc */

import { BrowserWindow } from 'electron';
import { values } from 'lodash';

import { eventActions } from '../actions/event-actions';
import { Team } from '../actions/team-actions';
import { LOCALE_NAMESPACE, intl as $intl } from '../i18n/intl';
import { ReduxComponent } from '../lib/redux-component';
import { logger } from '../logger';
import { appStore } from '../stores/app-store';
import { appTeamsStore } from '../stores/app-teams-store';
import { dialogStore } from '../stores/dialog-store';
import { StoreEvent, eventStore } from '../stores/event-store';
import { settingStore } from '../stores/setting-store';
import { teamStore } from '../stores/team-store';
import { windowStore } from '../stores/window-store';
import { TELEMETRY_EVENT, track } from '../telemetry';
import { UPDATE_STATUS, WINDOW_TYPES } from '../utils/shared-constants';

export interface BrowserWindowManagerState {
  mainWindow: any;
  selectedTeam: Team | null;
  autoHideMenuBar: any;
  isMac: boolean;
  isShowingLoginDialog: boolean;
  signOutTeamEvent: StoreEvent;
  reloadEvent: StoreEvent;
  editingCommandEvent: StoreEvent;
  toggleFullScreenEvent: StoreEvent;
  updateStatus: any;
}

/**
 * Handles window interactions that need to occur within the browser process.
 */
export class BrowserWindowManager extends ReduxComponent<BrowserWindowManagerState> {
  constructor() {
    super();
    this.update();
  }

  public syncState(): Partial<BrowserWindowManagerState> | null {
    const selectedTeamId = appTeamsStore.getSelectedTeamId();

    return {
      mainWindow: windowStore.getMainWindow(),
      selectedTeam: teamStore.getTeam(selectedTeamId) || null,
      autoHideMenuBar: settingStore.getSetting('autoHideMenuBar'),
      isMac: settingStore.isMac(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),

      signOutTeamEvent: eventStore.getEvent('signOutTeam'),
      reloadEvent: eventStore.getEvent('reload'),
      editingCommandEvent: eventStore.getEvent('editingCommand'),
      toggleFullScreenEvent: eventStore.getEvent('toggleFullScreen'),

      // Events that foreground the main app window
      updateStatus: appStore.getUpdateStatus(),
    };
  }

  public getMainWindow() {
    return BrowserWindow.fromId(this.state.mainWindow.id);
  }

  public callOnFocusedWindow(func: (window: Electron.BrowserWindow) => void): void {
    const browserWindow = BrowserWindow.getFocusedWindow();
    if (browserWindow) {
      func(browserWindow);
    }
  }

  /**
   * Ensures that child windows of a team are closed when the user signs out
   *
   * @param {Object.string} {teamId}
   */
  public signOutTeamEvent({ teamId }: { teamId: string }): void {
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
  public async reloadEvent({ everything }: { everything: boolean }) {
    const mainWindow = this.getMainWindow();

    if (everything) {
      let scope: string;
      if (mainWindow && mainWindow.webContents) {
        scope = 'everythingIgnoreCache';
        mainWindow.webContents.reloadIgnoringCache();
      } else {
        scope = 'everything';
        mainWindow.reload();
      }

      track(TELEMETRY_EVENT.DESKTOP_CLIENT_RELOAD, { reloadScope: scope });
      return;
    }

    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;

    const childWindows = windowStore.getWindows([WINDOW_TYPES.WEBAPP]);
    const windowParams = childWindows[focusedWindow.id];

    // NB: Calls windows do not support being reloaded
    if (windowParams && !windowStore.isCallsWindow(windowParams.subType)) {
      let scope: string;
      if (focusedWindow && focusedWindow.webContents) {
        scope = 'focusedIgnoreCache';
        focusedWindow.webContents.reloadIgnoringCache();
      } else {
        scope = 'focused';
        focusedWindow.reload();
      }
      track(TELEMETRY_EVENT.DESKTOP_CLIENT_RELOAD, { reloadScope: scope });
    }
  }

  /**
   * Perform an action on each child window that matches the given team.
   *
   * @param {Array}     teams   An array of teams specifying which windows to act on
   * @param {Function}  action  The action to take on the BrowserWindow
   */
  public forEachWindowOfTeam(teams: Array<string> = [],
                             action: (window: Electron.BrowserWindow) => void) {
    teams.forEach((team) => {
      const teamWindows = windowStore.getWindowsForTeam(team);
      values(teamWindows).forEach((entry) => {
        try {
          const browserWindow = BrowserWindow.fromId(entry.id);
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
  public editingCommandEvent({ command, windowId }: { command: string, windowId: number }) {
    const webContentFunctions = {
      undo: (w: Electron.WebContents) => w.undo(),
      redo: (w: Electron.WebContents) => w.redo(),
      cut: (w: Electron.WebContents) => w.cut(),
      copy: (w: Electron.WebContents) => w.copy(),
      paste: (w: Electron.WebContents) => w.paste(),
      'paste-and-match-style': (w: Electron.WebContents) => w.pasteAndMatchStyle(),
      delete: (w: Electron.WebContents) => w.delete(),
      'select-all': (w: Electron.WebContents) => w.selectAll()
    };

    // Otherwise let the renderer handle it
    if (!webContentFunctions[command]) return;

    if (windowId) {
      const browserWindow = BrowserWindow.fromId(windowId);
      webContentFunctions[command](browserWindow.webContents);
    } else {
      this.callOnFocusedWindow((browserWindow: Electron.BrowserWindow) => {
        webContentFunctions[command](browserWindow.webContents);
      });
    }
  }

  public toggleFullScreenEvent(): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();

    if (!focusedWindow) return;

    const focusedWindowType = windowStore.typeOfWindow(focusedWindow.id);

    if (focusedWindowType === WINDOW_TYPES.WEBAPP && !windowStore.isCallsWindow(focusedWindowType)) {
      return focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
    }

    const mainWindow = this.getMainWindow();
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }

  /**
   * Sets the main window title to match the currently selected team.
   *
   * @param  {Object} prevSelectedTeam = null The previously selected team
   */
  public handleMainWindowTitle(prevSelectedTeam?: Team) {
    let mainWindow;

    if (!this.state.selectedTeam) {
      mainWindow = this.getMainWindow();
      mainWindow.setTitle($intl.t('Slack', LOCALE_NAMESPACE.GENERAL)());
    } else if (!prevSelectedTeam && this.state.selectedTeam ||
      prevSelectedTeam!.team_name !== this.state.selectedTeam.team_name) {
      mainWindow = this.getMainWindow();
      // @i18n Do not translate between {}
      mainWindow.setTitle($intl.t('Slack - {teamName}', LOCALE_NAMESPACE.GENERAL)({ teamName: this.state.selectedTeam.team_name }));
    }
  }

  public update(prevState: Partial<BrowserWindowManagerState> = {}) {
    this.handleMainWindowTitle(prevState.selectedTeam!);

    if (!this.state.isMac && this.state.autoHideMenuBar !== prevState.autoHideMenuBar) {
      const mainWindow = this.getMainWindow();

      mainWindow.setAutoHideMenuBar(this.state.autoHideMenuBar);
      mainWindow.setMenuBarVisibility(!this.state.autoHideMenuBar);
    }

    if (!prevState.isShowingLoginDialog && this.state.isShowingLoginDialog) {
      eventActions.foregroundApp();
    }

    if (prevState.updateStatus !== this.state.updateStatus &&
      this.state.updateStatus === UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL) {
      eventActions.foregroundApp();
    }
  }
}
