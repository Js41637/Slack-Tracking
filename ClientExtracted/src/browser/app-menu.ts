import * as fs from 'graceful-fs';
import {app, BrowserWindow, Menu, MenuItem, shell} from 'electron';
import * as cloneDeep from 'lodash.clonedeep';
import {isEqualArrays} from '../utils/array-is-equal';

import {appActions} from '../actions/app-actions';
import {appTeamsActions} from '../actions/app-teams-actions';
import {appStore} from '../stores/app-store';
import {appTeamsStore} from '../stores/app-teams-store';
import {dialogActions} from '../actions/dialog-actions';
import {eventStore} from '../stores/event-store';
import {eventActions} from '../actions/event-actions';
import {ReduxComponent} from '../lib/redux-component';
import {settingActions} from '../actions/setting-actions';
import {settingStore} from '../stores/setting-store';
import {teamStore} from '../stores/team-store';

import {MENU_ITEM_ID, MENU_PARENT_ID, menuItemIdType, menuParentIdType} from '../menus/menu-item-id';
import {getMenuItemForUpdateStatus} from '../browser/updater-utils';
import {updateStatusType, IS_STORE_BUILD} from '../utils/shared-constants';
import {intl as $intl, LOCALE_NAMESPACE} from '../i18n/intl';

export interface AppMenuState {
  autoHideMenuBar: boolean;
  platform: string;
  isDevMode: boolean;
  isWin10: boolean;
  isMac: boolean;
  updateStatus: updateStatusType;
  popupAppMenuEvent: any;
  disableUpdatesCheck: boolean;
  teams: Array<any>;
  teamsByIndex: Array<any>;
}

export class AppMenu extends ReduxComponent<AppMenuState> {
  private readonly commandMap = {
    // App & Help menu commands
    'application:quit': eventActions.quitApp,
    'application:about': eventActions.showAbout,
    'application:release-notes': eventActions.showReleaseNotes,
    'application:reset-app-data': eventActions.confirmAndResetApp,
    'application:report-issue': eventActions.reportIssue,
    'application:check-for-update': appActions.checkForUpdate,
    'application:show-settings': () => {
      eventActions.showWebappDialog('prefs');
    },
    'application:keyboard-shortcuts': () => {
      eventActions.showWebappDialog('shortcuts');
    },
    'application:help-center': () => {
      shell.openExternal('https://get.slack.help');
    },
    'application:prepare-and-reveal-logs': eventActions.prepareAndRevealLogs,

    // Window menu commands
    'window:reload': () => eventActions.reload(),
    'window:reload-everything': () => eventActions.reload(true),
    'window:toggle-dev-tools': () => eventActions.toggleDevTools(),
    'window:toggle-all-dev-tools': () => eventActions.toggleDevTools(true),
    'window:toggle-full-screen': eventActions.toggleFullScreen,
    'window:actual-size': settingActions.resetZoom,
    'window:zoom-in': settingActions.zoomIn,
    'window:zoom-out': settingActions.zoomOut,
    'window:select-next-team': appTeamsActions.selectNextTeam,
    'window:select-previous-team': appTeamsActions.selectPreviousTeam,
    'window:signin': dialogActions.showLoginDialog,
    'window:auto-hide-menu-bar': () => settingActions.updateSettings({
      autoHideMenuBar: !this.state.autoHideMenuBar
    }),

    // Commands handled by the WebContents
    'core:undo': (id: number) => eventActions.editingCommand('undo', id),
    'core:redo': (id: number) => eventActions.editingCommand('redo', id),
    'core:cut': (id: number) => eventActions.editingCommand('cut', id),
    'core:copy': (id: number) => eventActions.editingCommand('copy', id),
    'core:paste': (id: number) => eventActions.editingCommand('paste', id),
    'core:paste-and-match-style': (id: number) => eventActions.editingCommand('paste-and-match-style', id),
    'core:delete': (id: number) => eventActions.editingCommand('delete', id),
    'core:select-all': (id: number) => eventActions.editingCommand('select-all', id),
    'core:find': () => eventActions.editingCommand('find'),
    'core:use-selection-for-find': () => eventActions.editingCommand('use-selection-for-find'),

    // History commands
    'history:back': () => eventActions.appCommand('browser-backward'),
    'history:forward': () => eventActions.appCommand('browser-forward')
  };

  private readonly windowId: number | null;
  private readonly template: any;
  private menu: Electron.Menu;

  /**
   * Creates a new instance of `AppMenu`.
   *
   * @param  {BrowserWindow} parentWindow The window this menu is attached to. On
   * Mac, this will be null, as menus apply to all application windows.
   */
  constructor(parentWindow?: Electron.BrowserWindow) {
    super();
    this.windowId = parentWindow ? parentWindow.id : null;

    this.template = JSON.parse(
      fs.readFileSync(require.resolve(`../menus/${this.state.platform}.json`), 'utf8')
    ).menu;

    let removed;

    if (!this.state.isDevMode && !process.env.SLACK_DEVELOPER_MENU) {
      removed = this.removeMenuItem(MENU_PARENT_ID.VIEW, MENU_ITEM_ID.DEVELOPER);
      this.removeSeparator(removed.menuIndex, removed.itemIndex - 1);
    }

    if (this.state.isWin10) {
      removed = this.removeMenuItem(MENU_PARENT_ID.WINDOW, MENU_ITEM_ID.AUTO_HIDE_MENU_BAR);
      this.removeSeparator(removed.menuIndex, removed.itemIndex, { hide: true });
    }

    if (IS_STORE_BUILD) {
      switch (this.state.platform) {
      case 'darwin':
        this.removeMenuItem(MENU_PARENT_ID.SLACK, MENU_ITEM_ID.CHECK_FOR_UPDATES);
        break;
      case 'win32':
        this.removeMenuItem(MENU_PARENT_ID.HELP, MENU_ITEM_ID.CHECK_FOR_UPDATES);
        break;
      }
    }

    this.wireUpTemplate(this.template);
    this.update();
  }

  public syncState(): Partial<AppMenuState> | null {
    return {
      teams: teamStore.teams,
      teamsByIndex: appTeamsStore.getTeamsByIndex({visibleTeamsOnly: true}),
      isMac: settingStore.isMac(),
      isWin10: settingStore.getSetting<boolean>('isWin10'),
      platform: settingStore.getSetting<string>('platform'),
      autoHideMenuBar: settingStore.getSetting<boolean>('autoHideMenuBar'),
      updateStatus: appStore.getUpdateStatus(),
      popupAppMenuEvent: eventStore.getEvent('popupAppMenu'),
      isDevMode: settingStore.getSetting<boolean>('isDevMode') ||
        settingStore.getSetting<boolean>('openDevToolsOnStart')
    };
  }

  /**
   * We have to rebuild the menu from scratch in order to update any item.
   * Make changes to the template, then rebuild the menu one time at the end
   * for performance reasons.
   */
  public update(prevState: Partial<AppMenuState> = {}): void {
    let menuChanged = false;

    if (!this.state.isMac && !this.state.isWin10 && this.state.autoHideMenuBar !== prevState.autoHideMenuBar) {
      const {menuIndex, itemIndex} = this.findMenuIndexById(MENU_PARENT_ID.WINDOW, MENU_ITEM_ID.AUTO_HIDE_MENU_BAR);
      this.template[menuIndex].submenu[itemIndex].checked = !this.state.autoHideMenuBar;
      menuChanged = true;
    }

    const teamNames = Object.keys(this.state.teams || {}).map((teamId) => this.state.teams[teamId].team_name);
    const previousTeamNames = Object.keys(prevState.teams || {}).map((teamId) => prevState.teams![teamId].team_name);

    if (this.state.teamsByIndex !== prevState.teamsByIndex ||
      !isEqualArrays(teamNames, previousTeamNames)) {
      this.updateTeamItems();
      menuChanged = true;
    }

    if (this.state.updateStatus !== prevState.updateStatus) {
      this.updateUpdateStatus();
      menuChanged = true;
    }

    if (menuChanged) {
      const menu = Menu.buildFromTemplate(cloneDeep(this.template));
      this.updateMenu(menu);
    }
  }

  /**
   * Opens the app menu as a context menu at the current mouse
   * position, using the currently focused BrowserWindow.
   */
  public popupAppMenuEvent({invokedViaKeyboard}: {invokedViaKeyboard: boolean}): void {
    if (!this.menu) return;

    if (invokedViaKeyboard && this.windowId) {
      this.menu.popup(BrowserWindow.fromId(this.windowId), 20, 15);
    } else {
      this.menu.popup();
    }
  }

  /**
   * Modifies our menu template to add the ordered teams from the store. We
   * look for a separator with a certain ID and use that as the insertion index.
   */
  private updateTeamItems(): void {
    const teamMenuItems = this.state.teamsByIndex.reduce((acc, teamId, index) => {
      const teamName = this.state.teams[teamId].team_name;
      if (!teamName) return acc;

      acc.push({
        label: teamName.replace('&', '&&&'), // & is special for accelerators, &&& escapes it
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          appTeamsActions.selectTeam(teamId);
          eventActions.foregroundApp();
        }
      });

      return acc;
    }, []);

    const {menuIndex, itemIndex} = this.findMenuIndexById(MENU_PARENT_ID.WINDOW, MENU_ITEM_ID.TEAM_LIST_START_SEPARATOR);
    const submenu = this.template[menuIndex].submenu;
    const startIndex = itemIndex + 1;

    // NB: If we haven't added teams before, this separator won't exist.
    let endIndex = this.findMenuIndexById(MENU_PARENT_ID.WINDOW, MENU_ITEM_ID.TEAM_LIST_END_SEPARATOR).itemIndex;
    if (endIndex === -1) {
      if (teamMenuItems.length > 0) teamMenuItems.push({type: 'separator', id: MENU_ITEM_ID.TEAM_LIST_END_SEPARATOR});
      endIndex = startIndex;
    }

    this.template[menuIndex].submenu = [
      ...submenu.slice(0, startIndex),
      ...teamMenuItems,
      ...submenu.slice(endIndex)
    ];

    // If Mac, populate the dock menu with these items as well.
    if (!this.windowId) {
      this.updateDockMenu(teamMenuItems);
    }
  }

  /**
   * Populates the dock menu with team-specific items.
   *
   * @param  {Array} teamItems  An array of Objects used to populate `MenuItem`s
   */
  private updateDockMenu(teamItems: Array<any>): void {
    const dockMenu = new Menu();

    teamItems.forEach((item, index) => {
      dockMenu.insert(index, new MenuItem(item));
    });

    dockMenu.insert(teamItems.length, new MenuItem({
      label: $intl.t(`Sign in to Another Team...`, LOCALE_NAMESPACE.MENU)(),
      click: () => dialogActions.showLoginDialog()
    }));

    app.dock.setMenu(dockMenu);
  }

  /**
   * Replaces the "Check for Updates" menu item based on the current update
   * status. This provides some feedback to the user.
   */
  private updateUpdateStatus(): void {
    const {updateStatus, platform} = this.state;
    const newUpdateStatusItem = getMenuItemForUpdateStatus(updateStatus);

    if (platform === 'darwin') {
      this.replaceMenuItem(MENU_PARENT_ID.SLACK, MENU_ITEM_ID.CHECK_FOR_UPDATES, newUpdateStatusItem);
    } else if (platform === 'win32') {
      this.replaceMenuItem(MENU_PARENT_ID.HELP, MENU_ITEM_ID.CHECK_FOR_UPDATES, newUpdateStatusItem);
    }
  }

  /**
   * Recursively iterates the menu template, hooking up the `click` event to
   * the `command` specified.
   *
   * @param  {Object} template An object that can be passed to `Menu.buildFromTemplate`
   */
  private wireUpTemplate(template: any): void {
    for (const item of template) {
      if (item.command && this.commandMap[item.command]) {
        item.click = (menuItem: any) => this.commandMap[item.command](this.windowId, menuItem);
      }

      if (item.submenu) {
        this.wireUpTemplate(item.submenu);
      }
    }
  }

  /**
   * Mac uses a global application menu. Other platforms have a menu
   * attached to the main window.
   */
  private updateMenu(menu: Electron.Menu): void {
    if (!this.windowId) {
      Menu.setApplicationMenu(menu);
    } else {
      const browserWindow = BrowserWindow.fromId(this.windowId);
      // NB: This can get unset when the app's in teardown (ie. after a reset app data)
      if (browserWindow) browserWindow.setMenu(menu);
    }

    this.menu = menu;
  }

  /**
   * Overwrites an existing menu item with a new one.
   */
  private replaceMenuItem(parentMenuId: menuParentIdType, itemId: menuItemIdType, newMenuItem: Partial<Electron.MenuItem>): void {
    const {menuIndex, itemIndex} = this.findMenuIndexById(parentMenuId, itemId);
    const submenu = this.template[menuIndex].submenu;

    submenu[itemIndex] = {
      ...submenu[itemIndex],
      ...newMenuItem
    };
  }

  /**
   * Removes the menu item that matches certain labels, and optionally any
   * adjoining separators.
   *
   * @param    {menuParentIdType}  parentMenuId      Describes the top-level menu to match
   * @param    {menuItemIdType}      itemLabel      Describes the submenu item to match
   * @returns  {Object} removed        Information about the removed item
   * @property {number} menuIndex      Index of the menu of the removed item
   * @property {number} itemIndex      Index of the removed item
   */
  private removeMenuItem(parentMenuId: menuParentIdType, itemId: menuItemIdType): {
    menuIndex: number,
    itemIndex: number
  } {
    const {menuIndex, itemIndex} = this.findMenuIndexById(parentMenuId, itemId);
    const submenu = this.template[menuIndex].submenu;
    submenu.splice(itemIndex, 1);

    return { menuIndex, itemIndex };
  }

  /**
   * Removes a seperator at the given index, optionally by hiding it
   *
   * @param {number} menuIndex
   * @param {number} itemIndex
   * @param {boolean} [options={ hide: false }]
   */
  private removeSeparator(menuIndex: number, itemIndex: number, options: {hide: boolean} = { hide: false }): void {
    const submenu = this.template[menuIndex].submenu;
    const item = submenu[itemIndex];

    if (item && item.type === 'separator') {
      if (options.hide) {
        item.type = 'normal';
        item.visible = false;
      } else {
        submenu.splice(itemIndex, 1);
      }
    }
  }

  /**
   * Returns the menu and submenu indices for the first item that matches the
   * given menu label and item id.
   *
   * @param  {menuParentIdType} parentMenuId     Describes the top-level menu id to match
   * @param  {menuItemIdType}    itemId          Describes the submenu item id to match
   */
  private findMenuIndexById(parentMenuId: menuParentIdType, itemId: menuItemIdType): {
    menuIndex: number,
    itemIndex: number
  } {
    const menuIndex = this.template.findIndex((item: Electron.MenuItem) => item.id === parentMenuId);
    const itemIndex = this.template[menuIndex].submenu.findIndex((item: Electron.MenuItem) => item.id && item.id === itemId);

    return {menuIndex, itemIndex};
  }
}
