/**
 * The Slack Desktop App uses Redux to manage the application state.
 *
 * [Redux](https://github.com/reactjs/redux) is what we use for our model layer.In Redux, your model is contained
 * in a single state tree (in our case, a plain-old JavaScript object), and you write "reducers," which are just
 * functions that modify a portion of that tree. Reducers should not mutate state directly, but should return a
 * new object for each modification. In other words, model data must be treated as immutable. React components
 * call `shouldComponentUpdate` before re-rendering, and because of immutable models, we can do a simple reference
 * check (`prevState !== newState`) rather than a deep equality check.
 *
 * Redux has a strong focus on __unidirectional data flow__, where all changes in an app must follow the same
 * sequence of `An Action (a label and a payload) is fired` -> `Reducers watch for action specific action labels
 * and change their data to respond to it` -> `The Views (React Components) react to those changes in the stores`.
 * The biggest benefit to this architecture is that there is a __single source of truth for all data and data
 * mutations__.
 *
 * If a component isn't behaving to specification, something is either wrong in:
 * 1. The Component behavior itself (for example its `render` function)
 * 1. The Component's inputs (either its props or its state).
 *
 * The developer now needs only consider these locations for determining the cause of the bug
 *  - If the issue is in the Component, the fix can be applied there.
 *  - If it is in the props, then the two possibilities should be checked in the parent component.
 *  - If the issue is in the state, then there is incorrect data being given by the Reducer. Reducers
 *    handle all possible changes to the data they provide, therefore an issue in the Reducer data can
 *    only originate from something it itself does.
 *
 * ### Actions
 * Every mutation to the data stored in the app should be initiated through an Action. An action is simply a function
 * which takes some input and sends a bundle of the action type and its payload to all the reducers. All actions must
 * follow this structure of `{type: string, data: *}`
 *
 * ```js
 * export const UPDATE_TEAMS = 'UPDATE_TEAMS'
 * class TeamActions {
 *   updateTeams(teamList) {
 *     Dispatcher.dispatch({type: UPDATE_TEAMS, data: teamList});
 *   }
 * }
 * export default new TeamActions();
 * ```
 *
 * Actions are usually very simple and are often just one liners. They are sometimes more complex if there
 * are situations such as asynchronous events which need handling.
 *
 * __Actions can only be called by Views__. This is a critical rule to maintaining unidirectional flow.
 *
 * @preferred
 * @module Actions
 */
/** for typedoc */

export type appType =
  | 'SET_SUSPEND_STATUS'
  | 'SET_NETWORK_STATUS'
  | 'SET_UPDATE_STATUS'
  | 'MARK_DEVTOOLS_STATE'
  | 'SET_CUSTOM_MENU_ITEMS'
  | 'CUSTOM_MENU_ITEM_CLICKED'
  | 'UPDATE_NO_DRAG_REGION'
  | 'SET_LAST_ERROR'
  | 'SHOW_QUIT_WARNING';

export const APP = {
  SET_SUSPEND_STATUS: 'SET_SUSPEND_STATUS' as appType,
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS' as appType,
  SET_UPDATE_STATUS: 'SET_UPDATE_STATUS' as appType,
  MARK_DEVTOOLS_STATE: 'MARK_DEVTOOLS_STATE' as appType,
  SET_CUSTOM_MENU_ITEMS: 'SET_CUSTOM_MENU_ITEMS' as appType,
  CUSTOM_MENU_ITEM_CLICKED: 'CUSTOM_MENU_ITEM_CLICKED' as appType,
  UPDATE_NO_DRAG_REGION: 'UPDATE_NO_DRAG_REGION' as appType,
  SET_LAST_ERROR: 'SET_LAST_ERROR' as appType,
  SHOW_QUIT_WARNING: 'SHOW_QUIT_WARNING' as appType
};

export type appTeamsType =
  | 'SELECT_TEAM'
  | 'SELECT_TEAM_BY_USER_ID'
  | 'SET_TEAMS_BY_INDEX'
  | 'SELECT_CHANNEL'
  | 'SELECT_NEXT_TEAM'
  | 'SELECT_PREVIOUS_TEAM'
  | 'SELECT_TEAM_BY_INDEX'
  | 'REPAIR_TEAMS_BY_INDEX'
  | 'SIGNED_OUT_TEAM';

export const APP_TEAMS = {
  SELECT_TEAM: 'SELECT_TEAM' as appTeamsType,
  SELECT_TEAM_BY_USER_ID: 'SELECT_TEAM_BY_USER_ID' as appTeamsType,
  SELECT_TEAM_BY_INDEX: 'SELECT_TEAM_BY_INDEX' as appTeamsType,
  SET_TEAMS_BY_INDEX: 'SET_TEAMS_BY_INDEX' as appTeamsType,
  SELECT_CHANNEL: 'SELECT_CHANNEL' as appTeamsType,
  SELECT_NEXT_TEAM: 'SELECT_NEXT_TEAM' as appTeamsType,
  SELECT_PREVIOUS_TEAM: 'SELECT_PREVIOUS_TEAM' as appTeamsType,
  REPAIR_TEAMS_BY_INDEX: 'REPAIR_TEAMS_BY_INDEX' as appTeamsType,
  SIGNED_OUT_TEAM: 'SIGNED_OUT_TEAM' as appTeamsType
};

/**
 * Set of actions considered as certain team is selected.
 */
export const SELECTED_TEAM_ACTION: Array<appTeamsType> = [
  APP_TEAMS.SELECT_TEAM,
  APP_TEAMS.SELECT_TEAM_BY_USER_ID,
  APP_TEAMS.SELECT_NEXT_TEAM,
  APP_TEAMS.SELECT_PREVIOUS_TEAM,
  APP_TEAMS.SELECT_TEAM_BY_INDEX
];

export type dialogType =
  | 'SET_LOGIN_DIALOG'
  | 'SHOW_AUTH_DIALOG'
  | 'SHOW_URL_SCHEME_MODAL'
  | 'TOGGLE_DEV_TOOLS'
  | 'SUBMIT_CREDENTIALS'
  | 'SHOW_TRAY_BALLOON';

export const DIALOG = {
  SET_LOGIN_DIALOG: 'SET_LOGIN_DIALOG' as dialogType,
  SHOW_AUTH_DIALOG: 'SHOW_AUTH_DIALOG' as dialogType,
  SHOW_URL_SCHEME_MODAL: 'SHOW_URL_SCHEME_MODAL' as dialogType,
  SUBMIT_CREDENTIALS: 'SUBMIT_CREDENTIALS' as dialogType,
  SHOW_TRAY_BALLOON: 'SHOW_TRAY_BALLOON' as dialogType
};

export type downloadsType =
  | 'START_DOWNLOAD'
  | 'CANCEL_DOWNLOAD'
  | 'RETRY_DOWNLOAD'
  | 'REVEAL_DOWNLOAD'
  | 'CLEAR_DOWNLOADS'
  | 'DOWNLOAD_STARTED'
  | 'DOWNLOAD_FINISHED';

export const DOWNLOADS = {
  START_DOWNLOAD: 'START_DOWNLOAD' as downloadsType,
  CANCEL_DOWNLOAD: 'CANCEL_DOWNLOAD' as downloadsType,
  RETRY_DOWNLOAD: 'RETRY_DOWNLOAD' as downloadsType,
  REVEAL_DOWNLOAD: 'REVEAL_DOWNLOAD' as downloadsType,
  CLEAR_DOWNLOADS: 'CLEAR_DOWNLOADS' as downloadsType,
  DOWNLOAD_STARTED: 'DOWNLOAD_STARTED' as downloadsType,
  DOWNLOAD_FINISHED: 'DOWNLOAD_FINISHED' as downloadsType
};

export type eventsType =
  | 'EDITING_COMMAND'
  | 'APP_COMMAND'
  | 'MAIN_WINDOW_FOCUSED'
  | 'FOREGROUND_APP'
  | 'HANDLE_DEEP_LINK'
  | 'HANDLE_EXTERNAL_LINK'
  | 'HANDLE_REPLY_LINK'
  | 'HANDLE_SETTINGS_LINK'
  | 'QUIT_APP'
  | 'RELOAD'
  | 'TOGGLE_FULL_SCREEN'
  | 'SHOW_ABOUT'
  | 'SHOW_RELEASE_NOTES'
  | 'SHOW_WEBAPP_DIALOG'
  | 'SIGN_OUT_TEAM'
  | 'REFRESH_TEAM'
  | 'CONFIRM_AND_RESET_APP'
  | 'CLEAR_CACHE_RESTART_APP'
  | 'REPORT_ISSUE'
  | 'PREPARE_AND_REVEAL_LOGS'
  | 'POPUP_APP_MENU'
  | 'TOGGLE_DEV_TOOLS'
  | 'SYSTEM_TEXT_SETTINGS_CHANGED'
  | 'UNLOAD_TEAM'
  | 'TICKLE_MESSAGE_SERVER'
  | 'APP_STARTED';

export const EVENTS = {
  EDITING_COMMAND: 'EDITING_COMMAND' as eventsType,
  APP_COMMAND: 'APP_COMMAND' as eventsType,
  MAIN_WINDOW_FOCUSED: 'MAIN_WINDOW_FOCUSED' as eventsType,
  FOREGROUND_APP: 'FOREGROUND_APP' as eventsType,
  HANDLE_DEEP_LINK: 'HANDLE_DEEP_LINK' as eventsType,
  HANDLE_REPLY_LINK: 'HANDLE_REPLY_LINK' as eventsType,
  HANDLE_SETTINGS_LINK: 'HANDLE_SETTINGS_LINK' as eventsType,
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
  CLEAR_CACHE_RESTART_APP: 'CLEAR_CACHE_RESTART_APP' as eventsType,
  REPORT_ISSUE: 'REPORT_ISSUE' as eventsType,
  PREPARE_AND_REVEAL_LOGS: 'PREPARE_AND_REVEAL_LOGS' as eventsType,
  POPUP_APP_MENU: 'POPUP_APP_MENU' as eventsType,
  TOGGLE_DEV_TOOLS: 'TOGGLE_DEV_TOOLS' as eventsType,
  SYSTEM_TEXT_SETTINGS_CHANGED: 'SYSTEM_TEXT_SETTINGS_CHANGED' as eventsType,
  UNLOAD_TEAM: 'UNLOAD_TEAM' as eventsType,
  TICKLE_MESSAGE_SERVER: 'TICKLE_MESSAGE_SERVER' as eventsType,
  APP_STARTED: 'APP_STARTED' as eventsType,
};

export type notificationsType =
  | 'NEW_NOTIFICATION'
  | 'REMOVE_NOTIFICATION'
  | 'CLICK_NOTIFICATION'
  | 'REPLY_TO_NOTIFICATION';

export const NOTIFICATIONS = {
  NEW_NOTIFICATION: 'NEW_NOTIFICATION' as notificationsType,
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION' as notificationsType,
  CLICK_NOTIFICATION: 'CLICK_NOTIFICATION' as notificationsType,
  REPLY_TO_NOTIFICATION: 'REPLY_TO_NOTIFICATION' as notificationsType
};

export type settingsType =
  | 'UPDATE_SETTINGS'
  | 'SET_DEV_MODE'
  | 'SET_DEV_ENVIRONMENT'
  | 'SET_TITLE_BAR_HIDDEN'
  | 'ZOOM_IN'
  | 'ZOOM_OUT'
  | 'RESET_ZOOM';

export const SETTINGS = {
  UPDATE_SETTINGS: 'UPDATE_SETTINGS' as settingsType,
  SET_DEV_MODE: 'SET_DEV_MODE' as settingsType,
  SET_DEV_ENVIRONMENT: 'SET_DEV_ENVIRONMENT' as settingsType,
  SET_TITLE_BAR_HIDDEN: 'SET_TITLE_BAR_HIDDEN' as settingsType,
  ZOOM_IN: 'ZOOM_IN' as settingsType,
  ZOOM_OUT: 'ZOOM_OUT' as settingsType,
  RESET_ZOOM: 'RESET_ZOOM' as settingsType
};

export type teamsType =
  | 'ADD_NEW_TEAM'
  | 'ADD_NEW_TEAMS'
  | 'REMOVE_TEAM'
  | 'REMOVE_TEAMS'
  | 'UPDATE_TEAM_THEME'
  | 'UPDATE_TEAM_ICONS'
  | 'UPDATE_TEAM_USAGE'
  | 'UPDATE_TEAM_NAME'
  | 'UPDATE_TEAM_URL'
  | 'UPDATE_USER_ID'
  | 'SET_TEAM_IDLE_TIMEOUT'
  | 'UPDATE_TEAM_LOCALE';

export const TEAMS = {
  ADD_NEW_TEAM: 'ADD_NEW_TEAM' as teamsType,
  ADD_NEW_TEAMS: 'ADD_NEW_TEAMS' as teamsType,
  REMOVE_TEAM: 'REMOVE_TEAM' as teamsType,
  REMOVE_TEAMS: 'REMOVE_TEAMS' as teamsType,
  UPDATE_TEAM_THEME: 'UPDATE_TEAM_THEME' as teamsType,
  UPDATE_TEAM_ICONS: 'UPDATE_TEAM_ICONS' as teamsType,
  UPDATE_TEAM_USAGE: 'UPDATE_TEAM_USAGE' as teamsType,
  UPDATE_TEAM_NAME: 'UPDATE_TEAM_NAME' as teamsType,
  UPDATE_TEAM_URL: 'UPDATE_TEAM_URL' as teamsType,
  UPDATE_USER_ID: 'UPDATE_USER_ID' as teamsType,
  SET_TEAM_IDLE_TIMEOUT: 'SET_TEAM_IDLE_TIMEOUT' as teamsType,
  UPDATE_TEAM_LOCALE: 'UPDATE_TEAM_LOCALE' as teamsType
};

export type unreadsType = 'UPDATE_UNREADS';

export const UNREADS = {
  UPDATE_UNREADS: 'UPDATE_UNREADS' as unreadsType
};

export type windowFrameType = 'SET_FULL_SCREEN' | 'SAVE_WINDOW_SETTINGS';

export const WINDOW_FRAME = {
  SAVE_WINDOW_SETTINGS: 'SAVE_WINDOW_SETTINGS' as windowFrameType,
  SET_FULL_SCREEN: 'SET_FULL_SCREEN' as windowFrameType
};

export type windowsType = 'ADD_WINDOW' | 'REMOVE_WINDOW';

export const WINDOWS = {
  ADD_WINDOW: 'ADD_WINDOW' as windowsType,
  REMOVE_WINDOW: 'REMOVE_WINDOW' as windowsType
};

export type migrationsType = 'REDUX_STATE' | 'COMPLETED';

export const MIGRATIONS = {
  /**
   * Performs one-time migration from the redux-state.json file
   */
  REDUX_STATE: 'REDUX_STATE' as migrationsType,

  /**
   * Occurs when migrations are finished running
   */
  COMPLETED: 'COMPLETED' as migrationsType
};
