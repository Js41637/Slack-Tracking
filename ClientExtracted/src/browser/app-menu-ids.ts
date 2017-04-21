/**
 * @module Browser
 */ /** for typedoc */

export type menuItemIdType = 'menuitem-about-slack' | 'menuitem-update-status' | 'menuitem-preferences' |
                             'menuitem-services' | 'menuitem-hide-slack' | 'menuitem-hide-others' | 'menuitem-show-all' |
                             'menuitem-quit' | 'menuitem-file-close' | 'menuitem-undo' | 'menuitem-redo' | 'menuitem-cut' |
                             'menuitem-copy' | 'menuitem-paste' | 'menuitem-paste-as' | 'menuitem-delete' | 'menuitem-select-all' |
                             'menuitem-find' | 'menuitem-selection-find' | 'menuitem-reload-current' | 'menuitem-toggle-fullscreen' |
                             'menuitem-zoom-reset' | 'menuitem-zoom-in' | 'menuitem-zoom-out' | 'menuitem-toggle-webapp-devtools' |
                             'menuitem-toggle-electron-devtools' | 'menuitem-reload-all' | 'menuitem-navigate-back' |
                             'menuitem-navigate-forward' | 'menuitem-window-minimize' | 'menuitem-window-perform-zoom' |
                             'menuitem-window-bring-front' | 'team-list-start-separator' | 'team-list-end-separator' |
                             'menuitem-select-next-team' | 'menuitem-select-previous-team' | 'menuitem-sign-in' |
                             'menuitem-keyboard-shortcut' | 'menuitem-open-help-center' | 'menuitem-report-issue' |
                             'menuitem-reveal-logs' | 'menuitem-reset-app-data' | 'menuitem-release-notes' |
                             'menuitem-developer' | 'menuitem-auto-hide-menu-bar' | 'menuitem-clear-cache';

export const MENU_ITEM_ID = {
  ABOUT_SLACK: 'menuitem-about-slack' as menuItemIdType,
  CHECK_FOR_UPDATES: 'menuitem-update-status' as menuItemIdType,
  PREFERENCES: 'menuitem-preferences' as menuItemIdType,
  SERVICES: 'menuitem-services' as menuItemIdType,
  HIDE_SLACK: 'menuitem-hide-slack' as menuItemIdType,
  HIDE_OTHERS: 'menuitem-hide-others' as menuItemIdType,
  SHOW_ALL: 'menuitem-show-all' as menuItemIdType,
  QUIT: 'menuitem-quit' as menuItemIdType,
  FILE_CLOSE: 'menuitem-file-close' as menuItemIdType,
  UNDO: 'menuitem-undo' as menuItemIdType,
  REDO: 'menuitem-redo' as menuItemIdType,
  CUT: 'menuitem-cut' as menuItemIdType,
  COPY: 'menuitem-copy' as menuItemIdType,
  PASTE: 'menuitem-paste' as menuItemIdType,
  PASTE_AS: 'menuitem-paste-as' as menuItemIdType,
  DELETE: 'menuitem-delete' as menuItemIdType,
  SELECT_ALL: 'menuitem-select-all' as menuItemIdType,
  FIND: 'menuitem-find' as menuItemIdType,
  SELECTION_FIND: 'menuitem-selection-find' as menuItemIdType,
  RELOAD_CURRENT: 'menuitem-reload-current' as menuItemIdType,
  TOGGLE_FULLSCREEN: 'menuitem-toggle-fullscreen' as menuItemIdType,
  ZOOM_RESET: 'menuitem-zoom-reset' as menuItemIdType,
  ZOOM_IN: 'menuitem-zoom-in' as menuItemIdType,
  ZOOM_OUT: 'menuitem-zoom-out' as menuItemIdType,
  TOGGLE_WEBAPP_DEVTOOLS: 'menuitem-toggle-webapp-devtools' as menuItemIdType,
  TOGGLE_ELECTRON_DEVTOOLS: 'menuitem-toggle-electron-devtools' as menuItemIdType,
  RELOAD_ALL: 'menuitem-reload-all' as menuItemIdType,
  NAVIGATE_BACK: 'menuitem-navigate-back' as menuItemIdType,
  NAVIGATE_FORWARD: 'menuitem-navigate-forward' as menuItemIdType,
  WINDOW_MINIMIZE: 'menuitem-window-minimize' as menuItemIdType,
  WINDOW_ZOOM: 'menuitem-window-perform-zoom' as menuItemIdType,
  WINDOW_BRING_FRONT: 'menuitem-window-bring-front' as menuItemIdType,
  TEAM_LIST_END_SEPARATOR: 'team-list-end-separator' as menuItemIdType,
  SELECT_NEXT_TEAM: 'menuitem-select-next-team' as menuItemIdType,
  SELECT_PREV_TEAM: 'menuitem-select-previous-team' as menuItemIdType,
  SIGN_IN: 'menuitem-sign-in' as menuItemIdType,
  KEYBOARD_SHORTCUT: 'menuitem-keyboard-shortcut' as menuItemIdType,
  OPEN_HELP_CENTER: 'menuitem-open-help-center' as menuItemIdType,
  REPORT_ISSUE: 'menuitem-report-issue' as menuItemIdType,
  REVEAL_LOGS: 'menuitem-reveal-logs' as menuItemIdType,
  RESET_APP_DATA: 'menuitem-reset-app-data' as menuItemIdType,
  CLEAR_CACHE: 'menuitem-clear-cache' as menuItemIdType,
  RELEASE_NOTES: 'menuitem-release-notes' as menuItemIdType,
  DEVELOPER: 'menuitem-developer' as menuItemIdType,
  AUTO_HIDE_MENU_BAR : 'menuitem-auto-hide-menu-bar' as menuItemIdType
};

export type menuParentIdType = 'menuitem-slack' | 'menuitem-file' | 'menuitem-edit' |
                               'menuitem-view' | 'menuitem-history' | 'menuitem-window' |
                               'menuitem-help';

export const MENU_PARENT_ID = {
  SLACK: 'menuitem-slack' as menuParentIdType,
  FILE: 'menuitem-file' as menuParentIdType,
  EDIT: 'menuitem-edit' as menuParentIdType,
  VIEW: 'menuitem-view' as menuParentIdType,
  HISTORY: 'menuitem-history' as menuParentIdType,
  WINDOW: 'menuitem-window' as menuParentIdType,
  HELP: 'menuitem-help' as menuParentIdType
};
