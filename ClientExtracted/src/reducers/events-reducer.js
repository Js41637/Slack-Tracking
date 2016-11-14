import omit from '../utils/omit';

import {APP, EVENTS, NOTIFICATIONS} from '../actions';

const eventSignatures = {};

// Simple events, no additional data
eventSignatures[EVENTS.FOCUS_PRIMARY_TEAM] = {name: 'focusPrimaryTeam'};
eventSignatures[EVENTS.FOREGROUND_APP] = {name: 'foregroundApp'};
eventSignatures[EVENTS.TOGGLE_FULL_SCREEN] = {name: 'toggleFullScreen'};
eventSignatures[EVENTS.RUN_SPECS] = {name: 'runSpecs'};
eventSignatures[EVENTS.SHOW_ABOUT] = {name: 'showAbout'};
eventSignatures[EVENTS.SHOW_RELEASE_NOTES] = {name: 'showReleaseNotes'};
eventSignatures[EVENTS.QUIT_APP] = {name: 'quitApp'};
eventSignatures[EVENTS.CONFIRM_AND_RESET_APP] = {name: 'confirmAndResetApp'};
eventSignatures[EVENTS.REPORT_ISSUE] = {name: 'reportIssue'};
eventSignatures[EVENTS.PREPARE_AND_REVEAL_LOGS] = {name: 'prepareAndRevealLogs'};
eventSignatures[EVENTS.SIDEBAR_CLICKED] = {name: 'sidebarClicked'};
eventSignatures[EVENTS.CLOSE_ALL_UPDATE_BANNERS] = {name: 'closeAllUpdateBanners'};

// Aliased events
eventSignatures[APP.SHOW_AUTH_DIALOG] = {name: 'foregroundApp'};

// Events which require additional arguments
eventSignatures[NOTIFICATIONS.CLICK_NOTIFICATION] = {
  name: 'clickNotification',
  notificationId: null,
  channel: null,
  teamId: null
};
eventSignatures[NOTIFICATIONS.REPLY_TO_NOTIFICATION] = {
  name: 'replyToNotification',
  response: null,
  channel: null,
  userId: null,
  teamId: null,
  inReplyToId: null
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

const initialState = Object.keys(eventSignatures).reduce((result, key) => {
  let evt = eventSignatures[key];

  // The initial state of each event is a zero timestamp, in addition to
  // the keys defined in the signature
  result[evt.name] = {timestamp: 0, ...omit(evt, 'name')};
  return result;
}, {});

// Typically we'd switch on the action type, but in this case we'll handle
// every event with a signature in the same way: update the timestamp and
// blindly append the additional arguments from the action.
export default function reduce(state = initialState, action) {
  let evt = eventSignatures[action.type];
  if (evt) {
    let update = {};
    update[evt.name] = {timestamp: Date.now(), ...action.data};
    return {...state, ...update};
  } else {
    return state;
  }
}
