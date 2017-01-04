import fs from 'fs';
import {app, BrowserWindow, Menu, MenuItem} from 'electron';
import cloneDeep from 'lodash.clonedeep';
import {isEqualArrays} from '../utils/array-is-equal';

import {appActions} from '../actions/app-actions';
import {appTeamsActions} from '../actions/app-teams-actions';
import AppStore from '../stores/app-store';
import AppTeamsStore from '../stores/app-teams-store';
import {dialogActions} from '../actions/dialog-actions';
import EventStore from '../stores/event-store';
import {eventActions} from '../actions/event-actions';
import ReduxComponent from '../lib/redux-component';
import {settingActions} from '../actions/setting-actions';
import {settingStore} from '../stores/setting-store';
import TeamStore from '../stores/team-store';

import {getMenuItemForUpdateStatus} from '../browser/updater-utils';

export default class AppMenu extends ReduxComponent {

  commandMap = {
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
    'application:prepare-and-reveal-logs': eventActions.prepareAndRevealLogs,

    // Window menu commands
    'window:reload': () => eventActions.reload(),
    'window:reload-everything': () => eventActions.reload(true),
    'window:toggle-dev-tools': dialogActions.toggleDevTools,
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
    'core:undo': (id) => eventActions.editingCommand('undo', id),
    'core:redo': (id) => eventActions.editingCommand('redo', id),
    'core:cut': (id) => eventActions.editingCommand('cut', id),
    'core:copy': (id) => eventActions.editingCommand('copy', id),
    'core:paste': (id) => eventActions.editingCommand('paste', id),
    'core:delete': (id) => eventActions.editingCommand('delete', id),
    'core:select-all': (id) => eventActions.editingCommand('select-all', id),
    'core:find': () => eventActions.editingCommand('find'),
    'core:use-selection-for-find': () => eventActions.editingCommand('use-selection-for-find'),

    // History commands
    'history:back': () => eventActions.appCommand('browser-backward'),
    'history:forward': () => eventActions.appCommand('browser-forward')
  };

  /**
   * Creates a new instance of `AppMenu`.
   *
   * @param  {BrowserWindow} parentWindow The window this menu is attached to. On
   * Mac, this will be null, as menus apply to all application windows.
   */
  constructor(parentWindow = null) {
    super();
    this.windowId = parentWindow ? parentWindow.id : null;

    this.template = JSON.parse(
      fs.readFileSync(
        require.resolve(`../menus/${this.state.platform}.json`),
        'utf8')).menu;
    
    let removed;

    if (!this.state.isDevMode && !process.env.SLACK_DEVELOPER_MENU) {
      removed = this.removeMenuItem(/&?View/, /&?Developer/);
      this.removeSeparator(removed.menuIndex, removed.itemIndex - 1);
    }

    if (this.state.isWin10) {
      removed = this.removeMenuItem(/&Window/, /Always Show &Menu Bar/);
      this.removeSeparator(removed.menuIndex, removed.itemIndex, { hide: true });
    }

    if (this.state.disableUpdatesCheck) {
      switch (this.state.platform) {
      case 'darwin':
        this.removeMenuItem(/Slack/, /Check for Updates…/u);
        break;
      case 'win32':
        this.removeMenuItem(/&Help/, /Check for Updates…/u);
        break;
      }
    }

    this.wireUpTemplate(this.template);
    this.update();
  }

  syncState() {
    return {
      teams: TeamStore.getTeams(),
      teamsByIndex: AppTeamsStore.getTeamsByIndex(),
      isMac: settingStore.isMac(),
      isWin10: settingStore.getSetting('isWin10'),
      platform: settingStore.getSetting('platform'),
      autoHideMenuBar: settingStore.getSetting('autoHideMenuBar'),
      updateStatus: AppStore.getUpdateStatus(),
      popupAppMenuEvent: EventStore.getEvent('popupAppMenu'),
      isDevMode: settingStore.getSetting('isDevMode') ||
        settingStore.getSetting('openDevToolsOnStart'),
      disableUpdatesCheck: settingStore.getSetting('isWindowsStore') ||
        settingStore.getSetting('isMacAppStore')
    };
  }

  /**
   * We have to rebuild the menu from scratch in order to update any item.
   * Make changes to the template, then rebuild the menu one time at the end
   * for performance reasons.
   */
  update(prevState = {}) {
    let menuChanged = false;

    if (!this.state.isMac && !this.state.isWin10 && this.state.autoHideMenuBar !== prevState.autoHideMenuBar) {
      let {menuIndex, itemIndex} = this.findIndexByLabels(/&?Window/, /Always Show &Menu Bar/);
      this.template[menuIndex].submenu[itemIndex].checked = !this.state.autoHideMenuBar;
      menuChanged = true;
    }

    let teamNames = Object.keys(this.state.teams || {}).map((teamId) => this.state.teams[teamId].team_name);
    let previousTeamNames = Object.keys(prevState.teams || {}).map((teamId) => prevState.teams[teamId].team_name);

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
      let menu = Menu.buildFromTemplate(cloneDeep(this.template));
      this.updateMenu(menu);
    }
  }

  /**
   * Modifies our menu template to add the ordered teams from the store. We
   * look for a separator with a certain ID and use that as the insertion index.
   */
  updateTeamItems() {
    let teamMenuItems = this.state.teamsByIndex.reduce((acc, teamId, index) => {
      let teamName = this.state.teams[teamId].team_name;
      if (!teamName) return acc;

      acc.push({
        label: teamName.replace('&','&&&'), // & is special for accelerators, &&& escapes it
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          appTeamsActions.selectTeam(teamId);
          eventActions.foregroundApp();
        }
      });

      return acc;
    }, []);

    let {menuIndex, itemIndex} = this.findIndexById(/&?Window/, 'team-list');
    let submenu = this.template[menuIndex].submenu;
    let startIndex = itemIndex + 1;

    // NB: If we haven't added teams before, this separator won't exist.
    let endIndex = this.findIndexById(/&?Window/, 'team-list-end').itemIndex;
    if (endIndex === -1) {
      if (teamMenuItems.length > 0) teamMenuItems.push({type: 'separator', id: 'team-list-end'});
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
  updateDockMenu(teamItems) {
    let dockMenu = new Menu();

    teamItems.forEach((item, index) => {
      dockMenu.insert(index, new MenuItem(item));
    });

    dockMenu.insert(teamItems.length, new MenuItem({
      label: "Sign in to Another Team...",
      click: () => dialogActions.showLoginDialog()
    }));

    app.dock.setMenu(dockMenu);
  }

  /**
   * Replaces the "Check for Updates" menu item based on the current update
   * status. This provides some feedback to the user.
   */
  updateUpdateStatus() {
    let {updateStatus, platform} = this.state;
    let newUpdateStatusItem = getMenuItemForUpdateStatus(updateStatus);

    if (platform === 'darwin') {
      this.replaceMenuItem(/Slack/, /update-status/, newUpdateStatusItem);
    } else if (platform === 'win32') {
      this.replaceMenuItem(/Help/, /update-status/, newUpdateStatusItem);
    }
  }

  /**
   * Recursively iterates the menu template, hooking up the `click` event to
   * the `command` specified.
   *
   * @param  {Object} template An object that can be passed to `Menu.buildFromTemplate`
   */
  wireUpTemplate(template) {
    for (let item of template) {
      if (item.command && this.commandMap[item.command]) {
        item.click = (menuItem) => this.commandMap[item.command](this.windowId, menuItem);
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
  updateMenu(menu) {
    if (!this.windowId) {
      Menu.setApplicationMenu(menu);
    } else {
      let browserWindow = BrowserWindow.fromId(this.windowId);
      browserWindow.setMenu(menu);
    }

    this.menu = menu;
  }

  /**
   * Overwrites an existing menu item with a new one.
   */
  replaceMenuItem(menuLabel, itemId, newMenuItem) {
    let {menuIndex, itemIndex} = this.findIndexById(menuLabel, itemId);
    let submenu = this.template[menuIndex].submenu;

    submenu[itemIndex] = {
      ...submenu[itemIndex],
      ...newMenuItem
    };
  }

  /**
   * Removes the menu item that matches certain labels, and optionally any
   * adjoining separators.
   *
   * @param    {Regex}  menuLabel      Describes the top-level menu to match
   * @param    {Regex}  itemLabel      Describes the submenu item to match
   * @returns  {Object} removed        Information about the removed item
   * @property {number} menuIndex      Index of the menu of the removed item
   * @property {number} itemIndex      Index of the removed item
   */
  removeMenuItem(menuLabel, itemLabel) {
    const {menuIndex, itemIndex} = this.findIndexByLabels(menuLabel, itemLabel);
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
  removeSeparator(menuIndex, itemIndex, options = { hide: false }) {
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
   * @param  {Regex} menuLabel      Describes the top-level menu to match
   * @param  {Regex} itemId         Describes the submenu item id to match
   */
  findIndexById(menuLabel, itemId) {
    let menuIndex = this.template.findIndex((item) => item.label.match(menuLabel));
    let itemIndex = this.template[menuIndex].submenu.findIndex((item) => {
      return item.id && item.id.match(itemId);
    });

    return {menuIndex, itemIndex};
  }

  /**
   * Returns the menu and submenu indices for the first item that matches the
   * given labels.
   *
   * @param  {Regex} menuLabel      Describes the top-level menu to match
   * @param  {Regex} itemLabel      Describes the submenu item to match
   */
  findIndexByLabels(menuLabel, itemLabel) {
    let menuIndex = this.template.findIndex((item) => {
      return item.label.match(menuLabel);
    });

    let itemIndex = this.template[menuIndex].submenu.findIndex((item) => {
      return item.label && item.label.match(itemLabel);
    });

    return {menuIndex, itemIndex};
  }

  /**
   * Opens the app menu as a context menu at the current mouse
   * position, using the currently focused BrowserWindow.
   */
  popupAppMenuEvent({invokedViaKeyboard}) {
    if (!this.menu) return;

    if (invokedViaKeyboard) {
      this.menu.popup(BrowserWindow.fromId(this.windowId), 20, 15);
    } else {
      this.menu.popup();
    }
  }
}
