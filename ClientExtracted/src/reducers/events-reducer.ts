import {omit} from '../utils/omit';
import {Action} from '../actions/action';
import {DIALOG, EVENTS, NOTIFICATIONS, TEAMS} from '../actions';

const eventSignatures = {};

// Simple events, no additional data
eventSignatures[EVENTS.MAIN_WINDOW_FOCUSED] = {name: 'mainWindowFocused'};
eventSignatures[EVENTS.FOREGROUND_APP] = {name: 'foregroundApp'};
eventSignatures[EVENTS.TOGGLE_FULL_SCREEN] = {name: 'toggleFullScreen'};
eventSignatures[EVENTS.SHOW_ABOUT] = {name: 'showAbout'};
eventSignatures[EVENTS.SHOW_RELEASE_NOTES] = {name: 'showReleaseNotes'};
eventSignatures[EVENTS.CONFIRM_AND_RESET_APP] = {name: 'confirmAndResetApp'};
eventSignatures[EVENTS.CLEAR_CACHE_RESTART_APP] = {name: 'clearCacheRestartApp'};
eventSignatures[EVENTS.REPORT_ISSUE] = {name: 'reportIssue'};
eventSignatures[EVENTS.PREPARE_AND_REVEAL_LOGS] = {name: 'prepareAndRevealLogs'};
eventSignatures[EVENTS.CLOSE_ALL_UPDATE_BANNERS] = {name: 'closeAllUpdateBanners'};
eventSignatures[EVENTS.SYSTEM_TEXT_SETTINGS_CHANGED] = {name: 'systemTextSettingsChanged'};

// Aliased events
eventSignatures[DIALOG.SHOW_AUTH_DIALOG] = {name: 'foregroundApp'};

// Events which require additional arguments
eventSignatures[NOTIFICATIONS.CLICK_NOTIFICATION] = {
  name: 'clickNotification',
  notificationId: null,
  channel: null,
  teamId: null,
  messageId: null,
  threadTimestamp: null
};
eventSignatures[NOTIFICATIONS.REPLY_TO_NOTIFICATION] = {
  name: 'replyToNotification',
  response: null,
  channel: null,
  userId: null,
  teamId: null,
  messageId: null,
  threadTimestamp: null
};
eventSignatures[EVENTS.EDITING_COMMAND] = {
  name: 'editingCommand',
  windowId: null,
  command: null
};
eventSignatures[EVENTS.APP_COMMAND] = {
  name: 'appCommand',
  command: null
};
eventSignatures[EVENTS.HANDLE_DEEP_LINK] = {
  name: 'handleDeepLink',
  url: null
};
eventSignatures[EVENTS.HANDLE_REPLY_LINK] = {
  name: 'handleReplyLink',
  url: null
};
eventSignatures[EVENTS.HANDLE_EXTERNAL_LINK] = {
  name: 'handleExternalLink',
  url: null,
  disposition: null
};
eventSignatures[EVENTS.SIGN_OUT_TEAM] = {
  name: 'signOutTeam',
  teamId: null
};
eventSignatures[EVENTS.REFRESH_TEAM] = {
  name: 'refreshTeam',
  teamId: null
};
eventSignatures[EVENTS.SHOW_WEBAPP_DIALOG] = {
  name: 'showWebappDialog',
  dialogType: null
};
eventSignatures[EVENTS.RELOAD] = {
  name: 'reload',
  everything: null
};
eventSignatures[EVENTS.POPUP_APP_MENU] = {
  name: 'popupAppMenu',
  invokedViaKeyboard: null
};

// NB: When a session ends, the webapp calls `didSignIn` again for that team,
// which maps to an ADD_NEW_TEAM(S) action. But in this case we don't want to
// do anything besides refresh the existing team.
eventSignatures[TEAMS.ADD_NEW_TEAM] = {
  name: 'refreshTeam',
  teamId: null,
  actionMapper: (team: any) => {
    return {teamId: team.team_id};
  }
};
eventSignatures[TEAMS.ADD_NEW_TEAMS] = {
  name: 'refreshTeams',
  teamIds: null,
  actionMapper: (teams: Array<any>) => {
    return {teamIds: teams.map((team) => team.team_id)};
  }
};

const initialState = Object.keys(eventSignatures).reduce((result, key) => {
  const evt = eventSignatures[key];

  // The initial state of each event is a zero timestamp, in addition to
  // the keys defined in the signature
  result[evt.name] = {timestamp: 0, ...omit(evt, 'name')};
  return result;
}, {});

// Typically we'd switch on the action type, but in this case we'll handle
// every event with a signature in the same way: update the timestamp and
// blindly append the additional arguments from the action.
export function reduce(state: {} = initialState, action: Action) {
  const evt = eventSignatures[action.type];
  if (evt) {
    const actionData = evt.actionMapper ?
      evt.actionMapper(action.data) :
      action.data;

    return {
      ...state,
      [evt.name]: {
        timestamp: Date.now(),
        ...actionData
      }
    };
  } else {
    return state;
  }
}
