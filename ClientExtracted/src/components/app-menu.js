import _ from 'lodash';
import logger from '../logger';
import season from 'season';
import {app, BrowserWindow, Menu, MenuItem} from 'electron';

import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import EventActions from '../actions/event-actions';
import ReduxComponent from '../lib/redux-component';
import SettingActions from '../actions/setting-actions';
import SettingStore from '../stores/setting-store';
import TeamStore from '../stores/team-store';

export default class AppMenu extends ReduxComponent {

  commandMap = {
    'application:quit': EventActions.quitApp,
    'application:about': EventActions.showAbout,
    'application:release-notes': EventActions.showReleaseNotes,
    'application:reset-app-data': EventActions.confirmAndResetApp,
    'window:reload': EventActions.reloadMainWindow,
    'window:toggle-dev-tools': AppActions.toggleDevTools,
    'application:run-specs': EventActions.runSpecs,
    'application:check-for-update': EventActions.checkForUpdate,
    'window:toggle-full-screen': EventActions.toggleFullScreen,
    'window:actual-size': SettingActions.resetZoom,
    'window:zoom-in': SettingActions.zoomIn,
    'window:zoom-out': SettingActions.zoomOut,
    'application:show-settings': EventActions.showPreferences,
    'window:select-next-team': AppActions.selectNextTeam,
    'window:select-previous-team': AppActions.selectPreviousTeam,
    'window:signin': AppActions.showLoginDialog,
    'window:auto-hide-menu-bar': () => SettingActions.updateSettings({
      autoHideMenuBar: !this.state.autoHideMenuBar
    }),

    // Editor commands used on Windows/Linux
    'core:undo': (id) => EventActions.editingCommand('undo', id),
    'core:redo': (id) => EventActions.editingCommand('redo', id),
    'core:cut': (id) => EventActions.editingCommand('cut', id),
    'core:copy': (id) => EventActions.editingCommand('copy', id),
    'core:paste': (id) => EventActions.editingCommand('paste', id),
    'core:delete': (id) => EventActions.editingCommand('delete', id),
    'core:select-all': (id) => EventActions.editingCommand('select-all', id),

    // History commands
    'history:back': () => EventActions.appCommand('browser-backward'),
    'history:forward': () => EventActions.appCommand('browser-forward')
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

    this.template = season.readFileSync(
      require.resolve(`../menus/${this.state.platform}.cson`)
    ).menu;

    if (!this.state.isDevMode && !process.env.SLACK_DEVELOPER_MENU) {
      this.removeMenuItems(/&?View/, /&?Developer/);
    }

    if (this.state.disableUpdatesCheck) {
      switch (this.state.platform) {
      case 'darwin':
        this.removeMenuItems(/Slack/, /Check for Updates…/u);
        break;
      case 'win32':
        this.removeMenuItems(/&Help/, /Check for Updates…/u);
        break;
      }
    }

    this.wireUpTemplate(this.template);
    this.update();
  }

  syncState() {
    return {
      teams: TeamStore.getTeams(),
      teamsByIndex: AppStore.getTeamsByIndex(),
      isMac: SettingStore.isMac(),
      platform: SettingStore.getSetting('platform'),
      autoHideMenuBar: SettingStore.getSetting('autoHideMenuBar'),
      isDevMode: SettingStore.getSetting('isDevMode') ||
        SettingStore.getSetting('openDevToolsOnStart'),
      disableUpdatesCheck: SettingStore.getSetting('isWindowsStore') ||
        SettingStore.getSetting('isMacAppStore')
    };
  }

  wireUpTemplate(template) {
    for (let item of template) {
      if (item.command && this.commandMap[item.command]) {
        item.click = (menu) => this.commandMap[item.command](this.windowId, menu);
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
  }

  updateDockMenu(menuItems) {
    let dockMenu = new Menu();

    menuItems.forEach((item, index) => {
      dockMenu.insert(index, new MenuItem(item));
    });

    dockMenu.insert(menuItems.length, new MenuItem({
      label: "Sign in to Another Team...",
      click: () => AppActions.showLoginDialog()
    }));

    app.dock.setMenu(dockMenu);
  }

  updateTeamItems(menu) {
    let teamMenuItems = this.state.teamsByIndex.map((teamId, index) => {
      let teamName = this.state.teams[teamId].team_name;
      if (!teamName) return null;

      return {
        label: teamName.replace('&','&&&'), // & is special for accelerators, &&& escapes it
        accelerator: `CommandOrControl+${index + 1}`,
        click: () => {
          AppActions.selectTeam(teamId);
          EventActions.foregroundApp();
        }
      };
    });

    if (_.some(teamMenuItems, (item) => item === null)) {
      logger.fatal(`Corrupt team state: ${JSON.stringify(this.state.teams)}`);
      return;
    }

    teamMenuItems.push({type: 'separator'});

    let windowMenu = _.find(menu.items, (item) => item.label.match(/&?Window/));
    let separatorIndex = _.findIndex(windowMenu.submenu.items, (item) => item.id === 'team-list');
    let startIndexForTeams = separatorIndex + 1;

    teamMenuItems.forEach((item, index) => {
      windowMenu.submenu.insert(startIndexForTeams + index, new MenuItem(item));
    });

    if (!this.windowId) { // If global, assign to app dock as well
      this.updateDockMenu(teamMenuItems);
    }
  }

  /**
   * Removes the menu item that matches certain labels, and optionally any
   * adjoining separators.
   *
   * @param  {Regex} menuLabel      Describes the top-level menu to match
   * @param  {Regex} itemLabel      Describes the submenu item to match
   */
  removeMenuItems(menuLabel, itemLabel, removeAdjacentSeparator = true) {
    let {menuIndex, itemIndex} = this.findIndexByLabels(menuLabel, itemLabel);
    let submenu = this.template[menuIndex].submenu;
    submenu.splice(itemIndex, 1);

    if (removeAdjacentSeparator) {
      let adjacentItem = submenu[itemIndex];

      if (adjacentItem && adjacentItem.type === 'separator') {
        submenu.splice(itemIndex, 1);
      }
    }
  }

  /**
   * Returns the menu and submenu indices for the first item that matches the
   * given labels.
   *
   * @param  {Regex} menuLabel      Describes the top-level menu to match
   * @param  {Regex} itemLabel      Describes the submenu item to match
   */
  findIndexByLabels(menuLabel, itemLabel) {
    let menuIndex = _.findIndex(this.template, (item) => {
      return item.label.match(menuLabel);
    });

    let itemIndex = _.findIndex(this.template[menuIndex].submenu, (item) => {
      return item.label && item.label.match(itemLabel);
    });

    return {menuIndex, itemIndex};
  }

  /**
   * We have to rebuild the menu from scratch in order to update any item.
   */
  update(prevState = {}) {
    if (!this.state.isMac && this.state.autoHideMenuBar !== prevState.autoHideMenuBar) {
      let {menuIndex, itemIndex} = this.findIndexByLabels(/&?Window/, /Always Show &Menu Bar/);
      this.template[menuIndex].submenu[itemIndex].checked = !this.state.autoHideMenuBar;
      let menu = Menu.buildFromTemplate(_.cloneDeep(this.template));
      this.updateMenu(menu);
    }

    if (this.state.teamsByIndex !== prevState.teamsByIndex) {
      let menu = Menu.buildFromTemplate(_.cloneDeep(this.template));
      this.updateTeamItems(menu);
      this.updateMenu(menu);
    }
  }
}
