import {nativeImage, BrowserWindow} from 'electron';
import {ipc} from '../ipc-rx';
import {logger} from '../logger';
import {Subscription} from 'rxjs/Subscription';

import {appStore} from '../stores/app-store';
import {appTeamsStore} from '../stores/app-teams-store';
import {dialogStore} from '../stores/dialog-store';
import {eventStore, StoreEvent} from '../stores/event-store';
import {ReduxComponent} from '../lib/redux-component';
import {settingStore} from '../stores/setting-store';
import {teamStore} from '../stores/team-store';
import {WindowHelpers} from '../utils/window-helpers';
import {windowStore} from '../stores/window-store';
import {Window} from '../stores/window-store-helper';
import {Team} from '../actions/team-actions';

import {WINDOW_TYPES, UPDATE_STATUS} from '../utils/shared-constants';
import {StringMap} from '../utils/string-map';
import {intl as $intl, LOCALE_NAMESPACE} from '../i18n/intl';

const CHILD_WINDOWS = [WINDOW_TYPES.WEBAPP];

export interface BrowserWindowManagerState {
  mainWindow: any;
  childWindows: StringMap<Window>;
  selectedTeam: Team;
  autoHideMenuBar: any;
  isMac: boolean;
  isShowingLoginDialog: boolean;
  quitAppEvent: StoreEvent;
  signOutTeamEvent: StoreEvent;
  reloadEvent: StoreEvent;
  editingCommandEvent: StoreEvent;
  toggleFullScreenEvent: StoreEvent;
  foregroundAppEvent: StoreEvent;
  clickNotificationEvent: StoreEvent;
  handleDeepLinkEvent: StoreEvent;
  updateStatus: any;
  showWebappDialogEvent: StoreEvent;
}
/**
 * Handles window interactions that need to occur within the browser process.
 */
export class BrowserWindowManager<S extends BrowserWindowManagerState> extends ReduxComponent<S> {
  private overlay: Electron.NativeImage | null;
  private overlayDescription: string;

  constructor(...args: Array<any>) {
    super(args);
    this.disposables.add(this.handleOverlayIcon());
    this.update();
  }

  public syncState(): Partial<S> | null {
    const selectedTeamId = appTeamsStore.getSelectedTeamId();

    return {
      mainWindow: windowStore.getMainWindow(),
      childWindows: windowStore.getWindows(CHILD_WINDOWS),
      selectedTeam: teamStore.getTeam(selectedTeamId) || null,
      autoHideMenuBar: settingStore.getSetting('autoHideMenuBar'),
      isMac: settingStore.isMac(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),

      signOutTeamEvent: eventStore.getEvent('signOutTeam'),
      reloadEvent: eventStore.getEvent('reload'),
      editingCommandEvent: eventStore.getEvent('editingCommand'),
      toggleFullScreenEvent: eventStore.getEvent('toggleFullScreen'),

      // Events that foreground the main app window
      foregroundAppEvent: eventStore.getEvent('foregroundApp'),
      clickNotificationEvent: eventStore.getEvent('clickNotification'),
      handleDeepLinkEvent: eventStore.getEvent('handleDeepLink'),
      updateStatus: appStore.getUpdateStatus(),
      showWebappDialogEvent: eventStore.getEvent('showWebappDialog')
    } as S;
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

  public focusMainWindow(): void {
    const mainWindow = this.getMainWindow();
    if (!mainWindow) return;

    const restoredFromTray = !mainWindow.isVisible();
    WindowHelpers.bringToForeground(mainWindow);

    // If we recreated the taskbar icon we also need to redraw the overlay
    if (restoredFromTray && this.overlay) {
      mainWindow.setOverlayIcon(this.overlay, this.overlayDescription);
    }
  }

  /**
   * Ensures that child windows of a team are closed when the user signs out
   *
   * @param {Object.string} {teamId}
   */
  public signOutTeamEvent({teamId}: {teamId: string}): void {
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
  public async reloadEvent({everything}: {everything: boolean}) {
    const mainWindow = this.getMainWindow();

    if (everything) {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.reloadIgnoringCache();
      } else {
        mainWindow.reload();
      }

      return;
    }

    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow) return;

    const windowParams = this.state.childWindows[focusedWindow.id];

    // NB: Calls windows do not support being reloaded
    if (windowParams && !windowStore.isCallsWindow(windowParams.subType)) {
      if (focusedWindow && focusedWindow.webContents) {
        focusedWindow.webContents.reloadIgnoringCache();
      } else {
        focusedWindow.reload();
      }
    }
  }

  /**
   * Perform an action on each child window that matches the given team.
   *
   * @param {Array}     teams   An array of teams specifying which windows to act on
   * @param {Function}  action  The action to take on the BrowserWindow
   */
  public forEachWindowOfTeam(teams: Array<any> = [],
                             action: (window: Electron.BrowserWindow) => void) {
    teams.forEach((team) => {
      Object.keys(windowStore.getWindowsForTeam(team)).forEach((key) => {
        const entry = this.state.childWindows[key];

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
  public editingCommandEvent({command, windowId}: {command: string, windowId: number}) {
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

  public foregroundAppEvent(): void {
    this.focusMainWindow();
  }

  public clickNotificationEvent(): void {
    this.focusMainWindow();
  }

  public handleDeepLinkEvent(): void {
    this.focusMainWindow();
  }

  public showWebappDialogEvent(): void {
    this.focusMainWindow();
  }

  /**
   * Listen to messages from the renderer describing the overlay icon and set
   * it accordingly. This is deeply un-React, but it's too expensive to put
   * the image buffer into state.
   *
   * @return {Subscription}  A Subscription that will unsubscribe the listener
   */
  public handleOverlayIcon(): Subscription {
    return ipc.listen('window:set-overlay-icon').subscribe((buf: Buffer) => {
      const mainWindow = this.getMainWindow();
      if (buf) {
        this.overlay = nativeImage.createFromBuffer(buf, 96);
        this.overlayDescription = $intl.t(`You have unread messages`, LOCALE_NAMESPACE.BROWSER)();
        mainWindow.setOverlayIcon(this.overlay, this.overlayDescription);
      } else {
        this.overlay = null;
        this.overlayDescription = '';
        mainWindow.setOverlayIcon(this.overlay!, this.overlayDescription);
      }
    }) as Subscription;
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

      if (!mainWindow) return;
      mainWindow.setTitle($intl.t(`Slack`, LOCALE_NAMESPACE.GENERAL)());
    } else if (!prevSelectedTeam && this.state.selectedTeam ||
      prevSelectedTeam!.team_name !== this.state.selectedTeam.team_name) {
      mainWindow = this.getMainWindow();

      if (!mainWindow) return;
      mainWindow.setTitle($intl.t(`Slack - {teamName}`, LOCALE_NAMESPACE.GENERAL)({teamName: this.state.selectedTeam.team_name}));
    }
  }

  public update(prevState: Partial<S> = {} as S) {
    this.handleMainWindowTitle(prevState.selectedTeam);

    if (!this.state.isMac && this.state.autoHideMenuBar !== prevState.autoHideMenuBar) {
      const mainWindow = this.getMainWindow();

      mainWindow.setAutoHideMenuBar(this.state.autoHideMenuBar);
      mainWindow.setMenuBarVisibility(!this.state.autoHideMenuBar);
    }

    if (!prevState.isShowingLoginDialog && this.state.isShowingLoginDialog) {
      this.focusMainWindow();
    }

    if (prevState.updateStatus !== this.state.updateStatus &&
      this.state.updateStatus === UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL) {
      this.focusMainWindow();
    }
  }
}
