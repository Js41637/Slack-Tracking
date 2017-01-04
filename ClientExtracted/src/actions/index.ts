export type appType = 'SET_SUSPEND_STATUS' | 'SET_NETWORK_STATUS' |
                      'SET_UPDATE_STATUS';

export const APP = {
  SET_SUSPEND_STATUS: 'SET_SUSPEND_STATUS' as appType,
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS' as appType,
  SET_UPDATE_STATUS: 'SET_UPDATE_STATUS' as appType
};

export type appTeamsType = 'SELECT_TEAM' | 'SELECT_TEAM_BY_USER_ID' |
                      'SET_TEAMS_BY_INDEX' | 'SELECT_CHANNEL' |
                      'SELECT_NEXT_TEAM' | 'SELECT_PREVIOUS_TEAM' |
                      'SELECT_TEAM_BY_INDEX' | 'REPAIR_TEAMS_BY_INDEX' |
                      'HIDE_TEAM';

export const APP_TEAMS = {
  SELECT_TEAM: 'SELECT_TEAM' as appTeamsType,
  SELECT_TEAM_BY_USER_ID: 'SELECT_TEAM_BY_USER_ID' as appTeamsType,
  SELECT_TEAM_BY_INDEX: 'SELECT_TEAM_BY_INDEX' as appTeamsType,
  SET_TEAMS_BY_INDEX: 'SET_TEAMS_BY_INDEX' as appTeamsType,
  SELECT_CHANNEL: 'SELECT_CHANNEL' as appTeamsType,
  SELECT_NEXT_TEAM: 'SELECT_NEXT_TEAM' as appTeamsType,
  SELECT_PREVIOUS_TEAM: 'SELECT_PREVIOUS_TEAM' as appTeamsType,
  REPAIR_TEAMS_BY_INDEX: 'REPAIR_TEAMS_BY_INDEX' as appTeamsType,
  HIDE_TEAM: 'HIDE_TEAM' as appTeamsType
};

export type dialogType = 'SET_LOGIN_DIALOG' | 'SHOW_AUTH_DIALOG' |
                      'SHOW_URL_SCHEME_MODAL' | 'TOGGLE_DEV_TOOLS' |
                      'SUBMIT_CREDENTIALS' | 'SHOW_TRAY_BALLOON';

export const DIALOG = {
  SET_LOGIN_DIALOG: 'SET_LOGIN_DIALOG' as dialogType,
  SHOW_AUTH_DIALOG: 'SHOW_AUTH_DIALOG' as dialogType,
  SHOW_URL_SCHEME_MODAL: 'SHOW_URL_SCHEME_MODAL' as dialogType,
  SUBMIT_CREDENTIALS: 'SUBMIT_CREDENTIALS' as dialogType,
  SHOW_TRAY_BALLOON: 'SHOW_TRAY_BALLOON' as dialogType,
  TOGGLE_DEV_TOOLS: 'TOGGLE_DEV_TOOLS' as dialogType
};

export type downloadsType = 'START_DOWNLOAD' | 'CANCEL_DOWNLOAD' |
                            'RETRY_DOWNLOAD' | 'REVEAL_DOWNLOAD' |
                            'CLEAR_DOWNLOADS'| 'DOWNLOAD_STARTED' |
                            'DOWNLOAD_FINISHED';

export const DOWNLOADS = {
  START_DOWNLOAD: 'START_DOWNLOAD' as downloadsType,
  CANCEL_DOWNLOAD: 'CANCEL_DOWNLOAD' as downloadsType,
  RETRY_DOWNLOAD: 'RETRY_DOWNLOAD' as downloadsType,
  REVEAL_DOWNLOAD: 'REVEAL_DOWNLOAD' as downloadsType,
  CLEAR_DOWNLOADS: 'CLEAR_DOWNLOADS' as downloadsType,
  DOWNLOAD_STARTED: 'DOWNLOAD_STARTED' as downloadsType,
  DOWNLOAD_FINISHED: 'DOWNLOAD_FINISHED' as downloadsType
};

export type eventsType = 'EDITING_COMMAND' | 'APP_COMMAND' |
                         'MAIN_WINDOW_FOCUSED' | 'FOREGROUND_APP' |
                         'HANDLE_DEEP_LINK' | 'HANDLE_EXTERNAL_LINK' |
                         'QUIT_APP' | 'RELOAD' | 'TOGGLE_FULL_SCREEN' |
                         'SHOW_ABOUT' | 'SHOW_RELEASE_NOTES' |
                         'SHOW_WEBAPP_DIALOG' | 'SIGN_OUT_TEAM' |
                         'REFRESH_TEAM' | 'CONFIRM_AND_RESET_APP' |
                         'REPORT_ISSUE' | 'PREPARE_AND_REVEAL_LOGS' |
                         'SIDEBAR_CLICKED' | 'CLOSE_ALL_UPDATE_BANNERS' |
                         'POPUP_APP_MENU';

export const EVENTS = {
  EDITING_COMMAND: 'EDITING_COMMAND' as eventsType,
  APP_COMMAND: 'APP_COMMAND' as eventsType,
  MAIN_WINDOW_FOCUSED: 'MAIN_WINDOW_FOCUSED' as eventsType,
  FOREGROUND_APP: 'FOREGROUND_APP' as eventsType,
  HANDLE_DEEP_LINK: 'HANDLE_DEEP_LINK' as eventsType,
  HANDLE_EXTERNAL_LINK: 'HANDLE_EXTERNAL_LINK' as eventsType,
  QUIT_APP: 'QUIT_APP' as eventsType,
  RELOAD: 'RELOAD' as eventsType,
  TOGGLE_FULL_SCREEN: 'TOGGLE_FULL_SCREEN' as eventsType,
  SHOW_ABOUT: 'SHOW_ABOUT' as eventsType,
  SHOW_RELEASE_NOTES: 'SHOW_RELEASE_NOTES' as eventsType,
  SHOW_WEBAPP_DIALOG: 'SHOW_WEBAPP_DIALOG' as eventsType,
  SIGN_OUT_TEAM: 'SIGN_OUT_TEAM' as eventsType,
  REFRESH_TEAM: 'REFRESH_TEAM' as eventsType,
  CONFIRM_AND_RESET_APP: 'CONFIRM_AND_RESET_APP' as eventsType,
  REPORT_ISSUE: 'REPORT_ISSUE' as eventsType,
  PREPARE_AND_REVEAL_LOGS: 'PREPARE_AND_REVEAL_LOGS' as eventsType,
  SIDEBAR_CLICKED: 'SIDEBAR_CLICKED' as eventsType,
  CLOSE_ALL_UPDATE_BANNERS: 'CLOSE_ALL_UPDATE_BANNERS' as eventsType,
  POPUP_APP_MENU: 'POPUP_APP_MENU' as eventsType
};

export type notificationsType = 'NEW_NOTIFICATION' | 'REMOVE_NOTIFICATION' |
                                'CLICK_NOTIFICATION' | 'REPLY_TO_NOTIFICATION';
export const NOTIFICATIONS = {
  NEW_NOTIFICATION: 'NEW_NOTIFICATION' as notificationsType,
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION' as notificationsType,
  CLICK_NOTIFICATION: 'CLICK_NOTIFICATION' as notificationsType,
  REPLY_TO_NOTIFICATION: 'REPLY_TO_NOTIFICATION' as notificationsType
};

export type settingsType = 'INITIALIZE_SETTINGS' | 'UPDATE_SETTINGS' |
                           'SET_DEV_MODE' | 'SET_DEV_ENVIRONMENT' |
                           'SET_TITLE_BAR_HIDDEN' | 'ZOOM_IN' |
                           'ZOOM_OUT' | 'RESET_ZOOM';

export const SETTINGS = {
  INITIALIZE_SETTINGS: 'INITIALIZE_SETTINGS' as settingsType,
  UPDATE_SETTINGS: 'UPDATE_SETTINGS' as settingsType,
  SET_DEV_MODE: 'SET_DEV_MODE' as settingsType,
  SET_DEV_ENVIRONMENT: 'SET_DEV_ENVIRONMENT' as settingsType,
  SET_TITLE_BAR_HIDDEN: 'SET_TITLE_BAR_HIDDEN' as settingsType,
  ZOOM_IN: 'ZOOM_IN' as settingsType,
  ZOOM_OUT: 'ZOOM_OUT' as settingsType,
  RESET_ZOOM: 'RESET_ZOOM' as settingsType
};

export type teamsType = 'ADD_NEW_TEAM' | 'ADD_NEW_TEAMS' |
                        'REMOVE_TEAM' | 'REMOVE_TEAMS' |
                        'UPDATE_TEAM_THEME' | 'UPDATE_TEAM_ICONS' |
                        'UPDATE_UNREADS_INFO' | 'UPDATE_TEAM_USAGE' |
                        'UPDATE_TEAM_NAME' | 'UPDATE_TEAM_URL' |
                        'UPDATE_USER_ID' | 'SET_TEAM_IDLE_TIMEOUT';

export const TEAMS = {
  ADD_NEW_TEAM: 'ADD_NEW_TEAM' as teamsType,
  ADD_NEW_TEAMS: 'ADD_NEW_TEAMS' as teamsType,
  REMOVE_TEAM: 'REMOVE_TEAM' as teamsType,
  REMOVE_TEAMS: 'REMOVE_TEAMS' as teamsType,
  UPDATE_TEAM_THEME: 'UPDATE_TEAM_THEME' as teamsType,
  UPDATE_TEAM_ICONS: 'UPDATE_TEAM_ICONS' as teamsType,
  UPDATE_UNREADS_INFO: 'UPDATE_UNREADS_INFO' as teamsType,
  UPDATE_TEAM_USAGE: 'UPDATE_TEAM_USAGE' as teamsType,
  UPDATE_TEAM_NAME: 'UPDATE_TEAM_NAME' as teamsType,
  UPDATE_TEAM_URL: 'UPDATE_TEAM_URL' as teamsType,
  UPDATE_USER_ID: 'UPDATE_USER_ID' as teamsType,
  SET_TEAM_IDLE_TIMEOUT: 'SET_TEAM_IDLE_TIMEOUT' as teamsType
};

export type windowFrameType = 'SET_FULL_SCREEN' | 'SAVE_WINDOW_SETTINGS' | 'UPDATE_NO_DRAG_REGION';

export const WINDOW_FRAME = {
  SAVE_WINDOW_SETTINGS: 'SAVE_WINDOW_SETTINGS' as windowFrameType,
  SET_FULL_SCREEN: 'SET_FULL_SCREEN' as windowFrameType,
  UPDATE_NO_DRAG_REGION: 'UPDATE_NO_DRAG_REGION' as windowFrameType
};

export type windowsType = 'ADD_WINDOW' | 'REMOVE_WINDOW';

export const WINDOWS = {
  ADD_WINDOW: 'ADD_WINDOW' as windowsType,
  REMOVE_WINDOW: 'REMOVE_WINDOW' as windowsType
};

export type migrationsType = 'REDUX_STATE';

export const MIGRATIONS = {
  /**
   * Performs one-time migration from the redux-state.json file
   */
  REDUX_STATE: 'REDUX_STATE' as migrationsType
};
