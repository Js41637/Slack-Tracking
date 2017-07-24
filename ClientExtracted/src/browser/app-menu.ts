/**
 * @module Browser
 */ /** for typedoc */

import { BrowserWindow, Menu, MenuItem, app, shell } from 'electron';

import { isEqual } from 'lodash';
import { appActions } from '../actions/app-actions';
import { appTeamsActions } from '../actions/app-teams-actions';
import { dialogActions } from '../actions/dialog-actions';
import { eventActions } from '../actions/event-actions';
import { settingActions } from '../actions/setting-actions';
import { TeamBase } from '../actions/team-actions';
import { ReduxComponent } from '../lib/redux-component';
import { appStore } from '../stores/app-store';
import { appTeamsStore } from '../stores/app-teams-store';
import { StoreEvent, eventStore } from '../stores/event-store';
import { settingStore } from '../stores/setting-store';
import { teamStore } from '../stores/team-store';

import { LOCALE_NAMESPACE, intl as $intl } from '../i18n/intl';
import { logger } from '../logger';
import { IS_STORE_BUILD, MenuItemsMap, StringMap, updateStatusType } from '../utils/shared-constants';
import { MENU_ITEM_ID, MENU_PARENT_ID, menuParentIdType } from './app-menu-ids';
import { getMenuItemForUpdateStatus } from './updater-utils';

//memoize frequently used platform variables
const isDarwin = process.platform === 'darwin';

// Exclude the Slack menu on non-macOS platforms.
const topLevelMenuItems = Object.keys(MENU_PARENT_ID)
  .map((key) => MENU_PARENT_ID[key])
  .filter((value: menuParentIdType) => isDarwin ?
    true : value !== MENU_PARENT_ID.SLACK);

export interface AppMenuState {
  teams: StringMap<TeamBase>;
  teamsByIndex: Array<string>;
  selectedTeamId: string | null;
  customMenuItems: MenuItemsMap;
  updateStatus: updateStatusType;
  popupAppMenuEvent: StoreEvent;
  autoHideMenuBar: boolean;
  isDevMode: boolean;
  isWin10: boolean;
  isStoreBuild: boolean;
}

export class AppMenu extends ReduxComponent<AppMenuState> {
  private menu: Electron.Menu;
  private menuMap: StringMap<Electron.MenuItemConstructorOptions>;

  /**
   * Creates a new instance of `AppMenu`.
   *
   * @param {BrowserWindow} associatedWindow The window to attach this menu to.
   *                                         On macOS this will be null, as menus
   *                                         apply to all application windows.
   */
  constructor(private readonly associatedWindow?: Electron.BrowserWindow) {
    super();
    this.buildMenu();
  }

  public syncState(): AppMenuState {
    const selectedTeamId = appTeamsStore.getSelectedTeamId();
    return {
      teams: teamStore.teams,
      teamsByIndex: appTeamsStore.getTeamsByIndex(),
      selectedTeamId,
      customMenuItems: appStore.getCustomMenuItems(selectedTeamId),
      updateStatus: appStore.getUpdateStatus(),
      popupAppMenuEvent: eventStore.getEvent('popupAppMenu'),
      autoHideMenuBar: settingStore.getSetting<boolean>('autoHideMenuBar'),
      isDevMode: settingStore.getSetting<boolean>('isDevMode') ||
        settingStore.getSetting<boolean>('openDevToolsOnStart') ||
        process.env.SLACK_DEVELOPER_MENU,
      isWin10: settingStore.getSetting<boolean>('isWin10'),
      isStoreBuild: IS_STORE_BUILD || false
    };
  }

  /**
   * Track the top-level menus we need to rebuild, and rebuild just those.
   */
  public update(prevState: Partial<AppMenuState> = {}): void {
    const changedKeys = new Set<string>();

    if (this.didAutoHideMenuBarChange(prevState) ||
      this.didTeamsChange(prevState)) {
      changedKeys.add(MENU_PARENT_ID.WINDOW);
    }

    if (this.state.customMenuItems !== prevState.customMenuItems) {
      const allKeys = [
        ...Object.keys(prevState.customMenuItems || {}),
        ...Object.keys(this.state.customMenuItems || {})
      ];
      allKeys.forEach((key) => changedKeys.add(key));
    }

    if (this.state.updateStatus !== prevState.updateStatus) {
      changedKeys.add(isDarwin ? MENU_PARENT_ID.SLACK : MENU_PARENT_ID.HELP);
    }

    if (changedKeys.size > 0) {
      this.buildMenu([...changedKeys]);
    }
  }

  /**
   * Opens the app menu as a context menu at the given position.
   */
  public popupAppMenuEvent({ invokedViaKeyboard }: { invokedViaKeyboard: boolean }): void {
    if (invokedViaKeyboard && this.associatedWindow && !this.associatedWindow.isDestroyed()) {
      try {
        this.menu.popup(this.associatedWindow, { x: 20, y: 15, async: true } as any);
        return;
      } catch (error) {
        logger.warn(`Tried to open app menu, but failed`, error);
      }
    }

    // We don't have a window, so we'll try without one. Sadly, Electron will just
    // try to get the window via BrowserWindow.getFocusedWindow(), and that fails
    // sometimes, too - race conditions can lead to the window being null.
    // Instead, we'll try to get the focussed Window, followed by the first window.
    // If everything fails, we'll give up, but won't crash.
    try {
      let browserWindow: Electron.BrowserWindow | null = BrowserWindow.getFocusedWindow();

      if (!browserWindow) {
        const allWindows = BrowserWindow.getAllWindows() || [];
        browserWindow = allWindows.length > 0 ? allWindows[0] : null;
      }

      // NB: browserWindow! can be null, but that's okay
      this.menu.popup(browserWindow!, { x: 20, y: 15, async: true } as any);
    } catch (error) {
      logger.warn(`Tried to open app menu (fallback), but failed`, error);
    }
  }

  /**
   * Rebuilds the entire menu or just the provided top-level items, e.g.,
   * `buildMenu([MENU_PARENT_ID.HELP])` rebuilds just the Help menu, and leaves
   * the rest of the menu unchanged.
   *
   * @param {Array<String>} changedKeys   The keys to rebuild, or null to
   *                                      rebuild the entire menu
   */
  private buildMenu(changedKeys?: Array<string>): void {
    const keysToBuild = changedKeys || topLevelMenuItems;

    this.menuMap = keysToBuild.reduce((map: StringMap<Electron.MenuItemConstructorOptions>, key: string) => {
      logger.debug(`AppMenu: Rebuilding ${key}`);

      map[key] = this.buildMenuForKey(key);
      this.addCustomMenuItems(key, map[key]);

      return map;
    }, this.menuMap || {});

    const template = Object.keys(this.menuMap)
      .map((key) => this.menuMap[key]);

    this.menu = Menu.buildFromTemplate(template);

    // On macOS, attach the menu to the application. On Windows / Linux, attach
    // it to a BrowserWindow.
    if (this.associatedWindow) {
      this.associatedWindow.setMenu(this.menu);
    } else {
      Menu.setApplicationMenu(this.menu);
    }
  }

  /**
   * Builds a menu template for a given a top-level key.
   *
   * @param {String} key  The key to build
   */
  private buildMenuForKey(key: string): Electron.MenuItemConstructorOptions {
    switch (key) {
      case MENU_PARENT_ID.SLACK:
        return this.buildSlackMenu();
      case MENU_PARENT_ID.FILE:
        return this.buildFileMenu();
      case MENU_PARENT_ID.EDIT:
        return this.buildEditMenu();
      case MENU_PARENT_ID.VIEW:
        return this.buildViewMenu();
      case MENU_PARENT_ID.HISTORY:
        return this.buildHistoryMenu();
      case MENU_PARENT_ID.WINDOW:
        return this.buildWindowMenu();
      case MENU_PARENT_ID.HELP:
        return this.buildHelpMenu();
      default:
        throw new Error(`${key} not defined!`);
    }
  }

  /**
   * Wires up each custom menu item to a generic click action that we can route
   * back to the webapp.
   *
   * @param {String} parentId               The top-level group to add items to
   * @param {Electron.MenuItemConstructorOptions} menu The menu template that pertains to that group
   */
  private addCustomMenuItems(parentId: string, menu: Electron.MenuItemConstructorOptions): void {
    const { customMenuItems } = this.state;

    if (!customMenuItems) return;
    if (!customMenuItems[parentId]) return;

    for (const item of customMenuItems[parentId]) {
      if (item.id) {
        item.click = () => {
          appActions.customMenuItemClicked(item.id!);
        };
      }
      (menu.submenu as any).push(item);
    }
  }

  private buildAboutBoxMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: $intl.t('About Slack', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.ABOUT_SLACK,
      click: eventActions.showAbout,
    };
  }

  private buildSlackMenu(): Electron.MenuItemConstructorOptions {
    const menu = {
      label: $intl.t('Slack', LOCALE_NAMESPACE.GENERAL)(),
      id: MENU_PARENT_ID.SLACK,
      submenu: [this.buildAboutBoxMenu(), {
        type: 'separator'
      }, this.buildPreferencesMenuItem(), {
        type: 'separator'
      }, {
        id: MENU_ITEM_ID.SERVICES,
        role: 'services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        id: MENU_ITEM_ID.HIDE_SLACK,
        role: 'hide'
      }, {
        id: MENU_ITEM_ID.HIDE_OTHERS,
        role: 'hideothers'
      }, {
        id: MENU_ITEM_ID.SHOW_ALL,
        role: 'unhide'
      }, {
        type: 'separator'
      },
      this.buildQuitMenuItem()] as Array<Electron.MenuItemConstructorOptions>
    };

    if (!this.state.isStoreBuild) {
      const checkForUpdatesItem = getMenuItemForUpdateStatus(this.state.updateStatus);
      checkForUpdatesItem.position = `after=${MENU_ITEM_ID.ABOUT_SLACK}`;
      menu.submenu.push(checkForUpdatesItem);
    }

    return menu;
  }

  private buildFileMenu(): Electron.MenuItemConstructorOptions {
    return isDarwin ? {
      label: $intl.t('&File', LOCALE_NAMESPACE.MENU)(),
      id: MENU_PARENT_ID.FILE,
      submenu: [this.buildCloseMenuItem()]
    } : {
      label: $intl.t('&File', LOCALE_NAMESPACE.MENU)(),
      submenu: [
        this.buildPreferencesMenuItem(),
        { type: 'separator' },
        this.buildCloseMenuItem(),
        this.buildQuitMenuItem()
      ]
    };
  }

  private buildEditMenu(): Electron.MenuItemConstructorOptions {
    const menu = {
      label: $intl.t('Edit', LOCALE_NAMESPACE.MENU)(),
      id: MENU_PARENT_ID.EDIT,
      submenu: [{
        id: MENU_ITEM_ID.UNDO,
        label: $intl.t('Undo', LOCALE_NAMESPACE.MENU)(),
        role: 'undo',
        accelerator: 'CmdOrCtrl+Z'
      }, {
        id: MENU_ITEM_ID.REDO,
        label: $intl.t('Redo', LOCALE_NAMESPACE.MENU)(),
        role: 'redo',
        accelerator: isDarwin ?
          'Command+Shift+Z' :
          'Ctrl+Y'
      }, {
        type: 'separator'
      }, {
        id: MENU_ITEM_ID.CUT,
        label: $intl.t('Cut', LOCALE_NAMESPACE.MENU)(),
        role: 'cut',
        accelerator: 'CmdOrCtrl+X'
      }, {
        id: MENU_ITEM_ID.COPY,
        label: $intl.t('Copy', LOCALE_NAMESPACE.MENU)(),
        role: 'copy',
        accelerator: 'CmdOrCtrl+C'
      }, {
        id: MENU_ITEM_ID.PASTE,
        label: $intl.t('Paste', LOCALE_NAMESPACE.MENU)(),
        role: 'paste',
        accelerator: 'CmdOrCtrl+V'
      }, {
        id: MENU_ITEM_ID.PASTE_AS,
        label: $intl.t('Paste and Match Style', LOCALE_NAMESPACE.MENU)(),
        role: 'pasteandmatchstyle',
        accelerator: 'CmdOrCtrl+Shift+V'
      }, {
        id: MENU_ITEM_ID.DELETE,
        label: $intl.t('Delete', LOCALE_NAMESPACE.MENU)(),
        role: 'delete'
      }, {
        id: MENU_ITEM_ID.SELECT_ALL,
        label: $intl.t('Select All', LOCALE_NAMESPACE.MENU)(),
        role: 'selectall',
        accelerator: 'CmdOrCtrl+A'
      }, {
        type: 'separator'
      }] as Array<Electron.MenuItemConstructorOptions>
    };

    menu.submenu.push(this.buildFindMenuItem());
    return menu;
  }

  private buildViewMenu(): Electron.MenuItemConstructorOptions {
    const menu = {
      label: $intl.t('&View', LOCALE_NAMESPACE.MENU)(),
      id: MENU_PARENT_ID.VIEW,
      submenu: [{
        label: $intl.t('&Reload', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.RELOAD_CURRENT,
        click: () => eventActions.reload(),
        accelerator: 'CmdOrCtrl+R'
      }, {
        type: 'separator'
      }, {
        label: $intl.t('Toggle &Full Screen', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.TOGGLE_FULLSCREEN,
        click: eventActions.toggleFullScreen,
        accelerator: isDarwin ?
          'Command+Control+F' :
          'Control+Shift+F'
      }, {
        type: 'separator'
      }, {
        label: $intl.t('&Actual Size', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.ZOOM_RESET,
        click: settingActions.resetZoom,
        accelerator: 'CmdOrCtrl+0'
      }, {
        label: $intl.t('Zoom &In', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.ZOOM_IN,
        click: settingActions.zoomIn,
        accelerator: 'CmdOrCtrl+Plus'
      }, {
        label: $intl.t('Zoom &Out', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.ZOOM_OUT,
        click: settingActions.zoomOut,
        accelerator: 'CmdOrCtrl+-'
      }] as Array<Electron.MenuItemConstructorOptions>
    };

    if (this.state.isDevMode) {
      menu.submenu.push(...this.buildDeveloperMenuItems());
    }

    return menu;
  }

  private buildHistoryMenu(): Electron.MenuItemConstructorOptions {
    return {
      label: $intl.t('H&istory', LOCALE_NAMESPACE.MENU)(),
      id: MENU_PARENT_ID.HISTORY,
      submenu: [{
        label: $intl.t('&Back', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.NAVIGATE_BACK,
        click: () => eventActions.appCommand('browser-backward'),
        accelerator: isDarwin ?
          'Command+[' :
          'Alt+Left'
      }, {
        label: $intl.t('&Forward', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.NAVIGATE_FORWARD,
        click: () => eventActions.appCommand('browser-forward'),
        accelerator: isDarwin ?
          'Command+]' :
          'Alt+Right'
      }
    ]};
  }

  private buildWindowMenu(): Electron.MenuItemConstructorOptions {
    const menu =  {
      label: $intl.t('&Window', LOCALE_NAMESPACE.MENU)(),
      id: MENU_PARENT_ID.WINDOW,
      role: 'window',
      submenu: [] as Array<Electron.MenuItemConstructorOptions>
    };

    let startWithSeparator = true;

    if (isDarwin) {
      menu.submenu.unshift(...this.buildMacWindowItems());
    } else if (!this.state.isWin10) {
      menu.submenu.unshift(this.buildWinLinuxWindowItems());
    } else {
      startWithSeparator = false;
    }

    const teamMenuItems = this.buildTeamMenuItems();

    // If we only have a single team, we don't need any team menu items.
    if (teamMenuItems.length > 1) {
      if (startWithSeparator) menu.submenu.push({ type: 'separator' });

      menu.submenu.push(...teamMenuItems);

      const getSeparator: () => Electron.MenuItemConstructorOptions =
        () => ({ type: 'separator' });

      menu.submenu.push(...[getSeparator(), {
        label: $intl.t('Select &Next Team', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.SELECT_NEXT_TEAM,
        click: appTeamsActions.selectNextTeam,
        accelerator: isDarwin ?
          'Command+}' :
          'Control+Tab'
      }, {
        label: $intl.t('Select &Previous Team', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.SELECT_PREV_TEAM,
        click: appTeamsActions.selectPreviousTeam,
        accelerator: isDarwin ?
          'Command+{' :
          'Control+Shift+Tab'
      }, getSeparator()]);
    }

    menu.submenu.push(this.buildSigninToTeamMenuItem());
    return menu;
  }

  private buildHelpMenu(): Electron.MenuItemConstructorOptions {
    const fileManagerLabel = isDarwin ?
      $intl.t('Show &Logs in Finder', LOCALE_NAMESPACE.MENU)() : process.platform === 'win32' ?
      $intl.t('Show &Logs in Explorer', LOCALE_NAMESPACE.MENU)() :
      $intl.t('Show &Logs in File Manager', LOCALE_NAMESPACE.MENU)();

    const menu = {
      label: $intl.t('&Help', LOCALE_NAMESPACE.MENU)(),
      id: MENU_PARENT_ID.HELP,
      role: 'help',
      submenu: [{
        label: $intl.t('&Keyboard Shortcuts', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.KEYBOARD_SHORTCUT,
        click: () => eventActions.showWebappDialog('shortcuts'),
        accelerator: 'CmdOrCtrl+/'
      }, {
        label: $intl.t('Open &Help Center', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.OPEN_HELP_CENTER,
        click: () => shell.openExternal('https://get.slack.help'),
      }, {
        type: 'separator'
      }, {
        label: $intl.t('&Report Issue…', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.REPORT_ISSUE,
        click: eventActions.reportIssue
      }, {
        label: fileManagerLabel,
        id: MENU_ITEM_ID.REVEAL_LOGS,
        click: eventActions.prepareAndRevealLogs
      }, {
        label: $intl.t('&Clear Cache and Restart', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.CLEAR_CACHE,
        click: eventActions.clearCacheRestartApp
      }, {
        label: $intl.t('Reset &App Data…', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.RESET_APP_DATA,
        click: eventActions.confirmAndResetApp
      }, {
        type: 'separator'
      }, {
        label: $intl.t('What’s &New…', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.RELEASE_NOTES,
        click: eventActions.showReleaseNotes
      }] as Array<Electron.MenuItemConstructorOptions>
    };

    if (process.platform === 'win32' && !this.state.isStoreBuild) {
      const checkForUpdatesItem = getMenuItemForUpdateStatus(this.state.updateStatus);
      checkForUpdatesItem.position = `before=${MENU_ITEM_ID.KEYBOARD_SHORTCUT}`;
      menu.submenu.push(checkForUpdatesItem);
    }

    //non mac os system lacks of `slack` menu, and `about slack` menu is belong to help menu instead
    if (!isDarwin) {
      const aboutBoxMenu = this.buildAboutBoxMenu();
      aboutBoxMenu.position = `after=${MENU_ITEM_ID.RELEASE_NOTES}`;
      menu.submenu.push(aboutBoxMenu);
    }

    return menu;
  }

  /**
   * Builds the team menu items that will be added to the Window menu, in
   * addition to populating the Dock on macOS.
   */
  private buildTeamMenuItems(): Array<Electron.MenuItemConstructorOptions> {
    const { teams, teamsByIndex } = this.state;

    const teamMenuItems = teamsByIndex.reduce((acc: Array<Electron.MenuItemConstructorOptions>, teamId, index) => {
      if (!teams[teamId]) return acc;
      const teamName = teams[teamId].team_name;
      acc.push(this.buildTeamMenuItem(teamName, teamId, index + 1));
      return acc;
    }, []);

    // If Mac, populate the dock menu with team items as well.
    if (!this.associatedWindow) {
      this.updateDockMenu([
        ...teamMenuItems,
        { type: 'separator' }
      ]);
    }

    return teamMenuItems;
  }

  /**
   * Build a menu template for a single team. Insert all teams before a
   * designated team list separator.
   */
  private buildTeamMenuItem(name: string, teamId: string, position: number): Electron.MenuItemConstructorOptions {
    return {
      label: name.replace('&', '&&&'), // & is special for accelerators, &&& escapes it
      accelerator: `CmdOrCtrl+${position}`,
      click: () => {
        appTeamsActions.selectTeam(teamId);
        eventActions.foregroundApp();
      }
    };
  }

  /**
   * Populates the dock menu with team-specific items.
   */
  private updateDockMenu(teamItems: Array<Electron.MenuItemConstructorOptions>): void {
    const dockMenu = new Menu();

    teamItems.forEach((item, index) => dockMenu.insert(index, new MenuItem(item)));
    dockMenu.insert(teamItems.length, new MenuItem(this.buildSigninToTeamMenuItem()));

    app.dock.setMenu(dockMenu);
  }

  private buildSigninToTeamMenuItem(): Electron.MenuItemConstructorOptions {
    return {
      label: $intl.t('&Sign in to Another Team...', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.SIGN_IN,
      click: dialogActions.showLoginDialog
    };
  }

  private buildCloseMenuItem(): Electron.MenuItemConstructorOptions {
    return {
      id: MENU_ITEM_ID.FILE_CLOSE,
      label: isDarwin ? $intl.t('Close Window', LOCALE_NAMESPACE.MENU)() : $intl.t('Close', LOCALE_NAMESPACE.MENU)(),
      role: 'close',
      accelerator: 'CmdOrCtrl+W'
    };
  }

  private buildPreferencesMenuItem(): Electron.MenuItemConstructorOptions {
    return {
      label: $intl.t('&Preferences…', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.PREFERENCES,
      click: () => eventActions.showWebappDialog('prefs'),
      accelerator: 'CmdOrCtrl+,'
    };
  }

  private buildQuitMenuItem(): Electron.MenuItemConstructorOptions {
    return {
      label: $intl.t('&Quit Slack', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.QUIT,
      click: eventActions.quitApp,
      accelerator: 'CmdOrCtrl+Q'
    };
  }

  private buildFindMenuItem(): Electron.MenuItemConstructorOptions {
    return isDarwin ? {
      label: $intl.t('Find', LOCALE_NAMESPACE.MENU)(),
      submenu: [{
        label: $intl.t('Find…', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.FIND,
        click: () => eventActions.editingCommand('find'),
        accelerator: 'Command+F'
      }, {
        label: $intl.t('Use Selection for Find', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.SELECTION_FIND,
        click: () => eventActions.editingCommand('use-selection-for-find'),
        accelerator: 'Command+E'
      }]
    } : {
      label: $intl.t('&Find…', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.FIND,
      click: () => eventActions.editingCommand('find'),
      accelerator: 'Control+F'
    };
  }

  private buildDeveloperMenuItems(): Array<Electron.MenuItemConstructorOptions> {
    return [{
      type: 'separator'
    }, {
      label: $intl.t('&Developer', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.DEVELOPER,
      submenu: [{
        label: $intl.t('Toggle &Webapp DevTools', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.TOGGLE_WEBAPP_DEVTOOLS,
        click: () => eventActions.toggleDevTools(),
        accelerator: 'CmdOrCtrl+Alt+I'
      }, {
        label: $intl.t('Toggle &Electron DevTools', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.TOGGLE_ELECTRON_DEVTOOLS,
        click: () => eventActions.toggleDevTools(true),
        accelerator: 'CmdOrCtrl+Shift+Alt+I'
      }, {
        label: $intl.t('&Reload Everything', LOCALE_NAMESPACE.MENU)(),
        id: MENU_ITEM_ID.RELOAD_ALL,
        click: () => eventActions.reload(true),
        accelerator: 'CmdOrCtrl+Shift+R'
      }
    ]}];
  }

  private buildMacWindowItems(): Array<Electron.MenuItemConstructorOptions> {
    return [{
      label: $intl.t('Minimize', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.WINDOW_MINIMIZE,
      role: 'minimize'
    }, {
      label: $intl.t('Zoom', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.WINDOW_ZOOM,
      role: 'zoom'
    }, {
      type: 'separator'
    }, {
      label: $intl.t('Bring all to front', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.WINDOW_BRING_FRONT,
      role: 'front'
    }];
  }

  private buildWinLinuxWindowItems(): Electron.MenuItemConstructorOptions {
    const autoHideMenuBar = this.state.autoHideMenuBar;
    return {
      label: $intl.t('Always Show &Menu Bar', LOCALE_NAMESPACE.MENU)(),
      id: MENU_ITEM_ID.AUTO_HIDE_MENU_BAR,
      click: () => settingActions.updateSettings({
        autoHideMenuBar: !autoHideMenuBar
      }),
      type: 'checkbox',
      checked: !autoHideMenuBar
    };
  }

  private didAutoHideMenuBarChange(prevState: Partial<AppMenuState>): boolean {
    return !this.state.isWin10 &&
      process.platform !== 'darwin' &&
      this.state.autoHideMenuBar !== prevState.autoHideMenuBar;
  }

  private didTeamsChange(prevState: Partial<AppMenuState>): boolean {
    if (!isEqual(this.state.teamsByIndex, prevState.teamsByIndex)) {
      return true;
    }

    const teamNames = Object.keys(this.state.teams || {})
      .map((teamId) => this.state.teams[teamId].team_name);
    const previousTeamNames = Object.keys(prevState.teams || {})
      .map((teamId) => prevState.teams![teamId].team_name);

    return !isEqual(teamNames, previousTeamNames);
  }
}
