import clone from 'lodash.clone';
import union from '../utils/union';
import url from 'url';
import handlePersistenceForKey from './helpers';
import TeamStore from '../stores/team-store';
import {isTeamsByIndexValid} from '../stores/app-store';
import logger from '../logger';

import {APP, TEAMS, NOTIFICATIONS, EVENTS} from '../actions';
import {UPDATE_STATUS} from '../utils/shared-constants';

export const SLACK_PROTOCOL = 'slack:';

const initialState = {
  isShowingLoginDialog: false,
  networkStatus: 'online', // One of [trying, online, slackDown, offline]
  updateStatus: UPDATE_STATUS.NONE,
  updateInfo: null, // Has {releaseName: string}, others on macOS
  isMachineAwake: true,
  selectedTeamId: null,
  selectedChannelId: null,
  lastBalloon: null,
  isShowingDevTools: false,
  teamsByIndex: [],
  teamsToLoad: [],
  windowSettings: null, // Has {position: [x,y], size: [width,height], isMaximized: bool}
  noDragRegions: [],
  urlSchemeModal: null, // Has {disposition: {string}, url: {string}, isShowing: {bool}
  isFullScreen: false,

  authInfo: null,
  credentials: null // Has {username, password}
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
  case TEAMS.ADD_NEW_TEAM:
    return handleNewTeam(state, action.data.team_id);
  case TEAMS.ADD_NEW_TEAMS:
    return handleNewTeams(state, action.data);
  case TEAMS.REMOVE_TEAM:
    return handleRemoveTeam(state, action.data);
  case TEAMS.REMOVE_TEAMS:
    return action.data.reduce((acc, teamId) => handleRemoveTeam(acc, teamId), state);

  case APP.SELECT_TEAM:
    return Object.assign({}, state, {selectedTeamId: action.data});
  case APP.SELECT_TEAM_BY_USER_ID:
    return selectTeamByUserId(state, action.data);
  case APP.SELECT_NEXT_TEAM:
    return selectNextTeam(state);
  case APP.SELECT_PREVIOUS_TEAM:
    return selectPreviousTeam(state);
  case APP.SELECT_TEAM_BY_INDEX:
    return Object.assign({}, state, {selectedTeamId: getTeamAtIndex(state, action.data)});
  case APP.SET_TEAMS_BY_INDEX:
    return setTeamsByIndex(state, action.data);
  case APP.LOAD_TEAMS:
    return Object.assign({}, state, {teamsToLoad: union(state.teamsToLoad, action.data)});
  case APP.SELECT_CHANNEL:
    return Object.assign({}, state, {selectedChannelId: action.data});

  case APP.SET_LOGIN_DIALOG:
    return Object.assign({}, state, {isShowingLoginDialog: action.data});
  case APP.SHOW_AUTH_DIALOG:
    return Object.assign({}, state, {authInfo: action.data});
  case APP.SHOW_URL_SCHEME_MODAL:
    return {...state, urlSchemeModal: action.data};
  case APP.SUBMIT_CREDENTIALS:
    return Object.assign({}, state, {
      authInfo: null,
      credentials: action.data
    });

  case APP.SHOW_TRAY_BALLOON:
    return Object.assign({}, state, {lastBalloon: action.data});
  case APP.SET_SUSPEND_STATUS:
    return Object.assign({}, state, {isMachineAwake: action.data});
  case APP.SET_NETWORK_STATUS:
    return Object.assign({}, state, {networkStatus: action.data});
  case APP.SET_UPDATE_STATUS:
    return setUpdateStatus(state, action.data, action.updateInfo);
  case APP.TOGGLE_DEV_TOOLS:
    return Object.assign({}, state, {isShowingDevTools: !state.isShowingDevTools});
  case APP.SAVE_WINDOW_SETTINGS:
    return Object.assign({}, state, {windowSettings: action.data});
  case APP.RESET_STORE:
    return Object.assign({}, initialState);
  case APP.UPDATE_CHANNEL_EDIT_TOPIC_SIZE:
    return Object.assign({}, state, {channelEditTopicSize: action.data.newSizeAndPosition});
  case APP.UPDATE_NO_DRAG_REGION:
    return updateNoDragRegion(state, action.data.region);
  case APP.SET_FULL_SCREEN:
    return {...state, isFullScreen: action.data};

  case NOTIFICATIONS.CLICK_NOTIFICATION:
    return Object.assign({}, state, {selectedTeamId: action.data.teamId});
  case EVENTS.HANDLE_DEEP_LINK:
    return parseTeamFromDeepLink(state, action.data);
  default:
    return handlePersistenceForKey(state, action, 'app');
  }
}

// Move the indices back to fill the space left over, and
// assign a new selectedTeamId if needed
function handleRemoveTeam(state, removedTeamId) {
  let teamsByIndex = clone(state.teamsByIndex);
  let removedIndex = teamsByIndex.findIndex((teamId) => teamId === removedTeamId);
  teamsByIndex.splice(removedIndex, 1);

  let selectedTeamId = state.selectedTeamId;
  if (selectedTeamId === removedTeamId) {
    selectedTeamId = teamsByIndex[0] || null;
  }

  return Object.assign({}, state, {selectedTeamId, teamsByIndex});
}

function handleNewTeam(state, teamId) {
  return Object.assign({}, state, {
    selectedTeamId: teamId,
    teamsByIndex: union(state.teamsByIndex, [teamId])
  });
}

function handleNewTeams(state, newTeams) {
  let teamIds = newTeams.map((team) => team.team_id);

  return Object.assign({}, state, {
    selectedTeamId: teamIds[0],
    teamsByIndex: union(state.teamsByIndex, teamIds)
  });
}

function getTeamAtIndex(state, index) {
  if (!state.teamsByIndex[index]) {
    throw new Error("Attempting to get team at a non-existent index");
  }
  return state.teamsByIndex[index];
}

function selectTeamByUserId(state, userId) {
  let teamList = TeamStore.getTeams();
  let selectedTeam = Object.keys(teamList)
    .map((teamId) => teamList[teamId])
    .find((team) => team.id === userId);

  if (!selectedTeam) return state;

  return {
    ...state,
    selectedTeamId: selectedTeam.team_id
  };
}

function selectNextTeam(state) {
  let selectedIndex = state.teamsByIndex.findIndex((teamAtIndex) => teamAtIndex === state.selectedTeamId);
  if (selectedIndex === -1) return state;

  let nextIndex = mod(selectedIndex + 1, state.teamsByIndex.length);
  return Object.assign({}, state, {selectedTeamId: state.teamsByIndex[nextIndex]});
}

function selectPreviousTeam(state) {
  let selectedIndex = state.teamsByIndex.findIndex((teamAtIndex) => teamAtIndex === state.selectedTeamId);
  if (selectedIndex === -1) return state;

  let previousIndex = mod(selectedIndex - 1, state.teamsByIndex.length);
  return Object.assign({}, state, {selectedTeamId: state.teamsByIndex[previousIndex]});
}

function setTeamsByIndex(state, teamsByIndex) {
  let teamList = TeamStore.getTeams();

  if (isTeamsByIndexValid(teamList, teamsByIndex)) {
    return Object.assign({}, state, {teamsByIndex});
  } else {
    logger.warn(`teamsByIndex wasn't valid – starting from scratch`);
    return Object.assign({}, state, {
      teamsByIndex: Object.keys(teamList)
    });
  }
}

// If a team was provided in a deep link, try to switch to it
function parseTeamFromDeepLink(state, evt) {
  let theUrl = url.parse(evt.url, true);
  if (theUrl.protocol === SLACK_PROTOCOL && theUrl.query && theUrl.query.team) {

    // Make sure the team exists before we assign it
    let index = state.teamsByIndex.findIndex((teamId) => teamId === theUrl.query.team);
    if (index >= 0) {
      return Object.assign({}, state, {selectedTeamId: theUrl.query.team});
    }
  }
  return state;
}

function setUpdateStatus(state, updateStatus, updateInfo) {
  return {
    ...state,
    updateStatus,
    updateInfo
  };
}

function updateNoDragRegion(state, region) {
  return {
    ...state,
    noDragRegions: [
      ...state.noDragRegions.filter((r) => r.id !== region.id),
      region
    ]
  };
}

// The default javascript modulo handles negative numbers annoyingly,
// where (-1) % 2 = -1 instead of 1
function mod(a, n) {
  return ((a % n) + n) % n;
}
