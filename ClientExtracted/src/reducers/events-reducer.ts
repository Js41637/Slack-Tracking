/**
 * @module Reducers
 */ /** for typedoc */

import { omit } from 'lodash';
import { APP, DIALOG, EVENTS, NOTIFICATIONS, TEAMS, eventsType } from '../actions';
import { Action } from '../actions/action';

const eventSignatures = {};

// Simple events, no additional data
eventSignatures[EVENTS.FOREGROUND_APP] = { name: 'foregroundApp' };
eventSignatures[EVENTS.TOGGLE_FULL_SCREEN] = { name: 'toggleFullScreen' };
eventSignatures[EVENTS.SHOW_ABOUT] = { name: 'showAbout' };
eventSignatures[EVENTS.SHOW_RELEASE_NOTES] = { name: 'showReleaseNotes' };
eventSignatures[EVENTS.CLEAR_CACHE_RESTART_APP] = { name: 'clearCacheRestartApp' };
eventSignatures[EVENTS.CONFIRM_AND_RESET_APP] = { name: 'confirmAndResetApp' };
eventSignatures[EVENTS.REPORT_ISSUE] = { name: 'reportIssue' };
eventSignatures[EVENTS.PREPARE_AND_REVEAL_LOGS] = { name: 'prepareAndRevealLogs' };
eventSignatures[EVENTS.SYSTEM_TEXT_SETTINGS_CHANGED] = { name: 'systemTextSettingsChanged' };

// Aliased events
eventSignatures[DIALOG.SHOW_AUTH_DIALOG] = { name: 'foregroundApp' };

eventSignatures[APP.CUSTOM_MENU_ITEM_CLICKED] = {
  name: 'customMenuItemClicked',
  itemId: null
};
eventSignatures[EVENTS.EDITING_COMMAND] = {
  name: 'editingCommand',
  windowId: null,
  command: null
};
eventSignatures[EVENTS.HANDLE_DEEP_LINK] = {
  name: 'handleDeepLink',
  url: null
};
eventSignatures[EVENTS.HANDLE_SETTINGS_LINK] = {
  name: 'handleSettingsLink',
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
    return { teamId: team.team_id };
  }
};
eventSignatures[TEAMS.ADD_NEW_TEAMS] = {
  name: 'refreshTeams',
  teamIds: null,
  actionMapper: (teams: Array<any>) => {
    return { teamIds: teams.map((team) => team.team_id) };
  }
};

const initialState = Object.keys(eventSignatures).reduce((result, key) => {
  const evt = eventSignatures[key];

  // The initial state of each event is a zero timestamp, in addition to
  // the keys defined in the signature
  result[evt.name] = { timestamp: 0, ...omit(evt, 'name') };
  return result;
}, {
  eventId: 0
}) as Readonly<Record<eventsType, any> & { eventId: number}>;

// Typically we'd switch on the action type, but in this case we'll handle
// every event with a signature in the same way: update the timestamp and
// blindly append the additional arguments from the action.
/**
 * @hidden
 */
export function reduce(state: Readonly<Record<eventsType, any> & { eventId: number }> = initialState, action: Action<any>) {
  const epicState = reduceEpicEvent(state, action);

  if (epicState) {
    return epicState;
  }

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

/**
 * get updated state for renderer-side events handled via epic.
 *
 * Why?
 * : redux-electron-store try to behave smart, forwarding actions only if there is state changes.
 * (https://github.com/samiskin/redux-electron-store/blob/ff5f9505f646a1a7096997455d8dac4dc5fc10a6/src/main-enhancer.js#L79)
 * So some of our event like focus, which only creates side effect but doesn't have any state updates are not forwarded from main process to renderer
 * (i.e, browserwindow.on('focus', triggerFocusEvent) in main process to renderer process forward). To overcome this,
 * this reducer simply creates new state only increase one state event counter just to make redux-electron-store considers it as state changed.
 *
 * Why events like TOGGLE_DEV_TOOLS doesn't need this? :
 * : Cause forwarding from renderer to main proc just works, doesn't to state diff and dispatchproxy forwards it.
 *
 * Our event reducer already does kind of similar thing, why epic does in different way?
 * : current event reducer attaches new state into each event action, like EVENT_NAME: { timestamp, ...actual data }
 * which
 * 1. does attach no longer necessary information to each event state(timestamp)
 * 2. and it makes all event state date consumption explicitly require spread by attaching timestamp all time
 * are overkill for epics. Once all event migration is done, we can simply get rid of current reducer and all events uses this approach.
 */
function reduceEpicEvent(state: Readonly<Record<eventsType, any> & { eventId: number }> = initialState, action: Action<any>) {
  switch (action.type) {
    case EVENTS.MAIN_WINDOW_FOCUSED:
    case EVENTS.APP_COMMAND:
    case EVENTS.APP_STARTED:
    case EVENTS.QUIT_APP:
    case NOTIFICATIONS.CLICK_NOTIFICATION:
    case NOTIFICATIONS.REPLY_TO_NOTIFICATION:
      const ret = { ...state };
      (ret as any).eventId = ret.eventId + 1;
      //interop action's data object to carry forward - each time epic received event with new event id, can pick up corresponding data via those id
      //Note: refine flows once all events are migrated to not to use existing event reducer
      ret[ret.eventId] = action.data;
      return ret;
  }

  return null;
}
