import _ from 'lodash';
import url from 'url';
import handlePersistenceForKey from './helpers';
import TeamStore from '../stores/team-store';
import {isTeamsByIndexValid} from '../stores/app-store';
import logger from '../logger';

import {APP, TEAMS, NOTIFICATIONS, EVENTS} from '../actions';

export const SLACK_PROTOCOL = 'slack:';

const initialState = {
  isShowingLoginDialog: false,
  networkStatus: 'online', // One of [trying, online, slackDown, offline]
  isMachineAwake: true,
  selectedTeamId: null,
  lastBalloon: null,
  isShowingDevTools: false,
  teamsByIndex: [],
  teamsToLoad: [],
  windowSettings: null, // Has {position: [x,y], size: [width,height], isMaximized: bool}
  searchBoxWidth: null,

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
    return _.reduce(action.data, (acc, teamId) => handleRemoveTeam(acc, teamId), state);

  case APP.SELECT_TEAM:
    return _.assign({}, state, {selectedTeamId: action.data});
  case APP.SELECT_TEAM_BY_USER_ID:
    return selectTeamByUserId(state, action.data);
  case APP.SELECT_NEXT_TEAM:
    return selectNextTeam(state);
  case APP.SELECT_PREVIOUS_TEAM:
    return selectPreviousTeam(state);
  case APP.SELECT_TEAM_BY_INDEX:
    return _.assign({}, state, {selectedTeamId: getTeamAtIndex(state, action.data)});
  case APP.SET_TEAMS_BY_INDEX:
    return setTeamsByIndex(state, action.data);
  case APP.LOAD_TEAMS:
    return _.assign({}, state, {teamsToLoad: _.union(state.teamsToLoad, action.data)});

  case APP.SET_LOGIN_DIALOG:
    return _.assign({}, state, {isShowingLoginDialog: action.data});
  case APP.SHOW_AUTH_DIALOG:
    return _.assign({}, state, {authInfo: action.data});
  case APP.SUBMIT_CREDENTIALS:
    return _.assign({}, state, {
      authInfo: null,
      credentials: action.data
    });

  case APP.SHOW_TRAY_BALLOON:
    return _.assign({}, state, {lastBalloon: action.data});
  case APP.SET_SUSPEND_STATUS:
    return _.assign({}, state, {isMachineAwake: action.data});
  case APP.SET_NETWORK_STATUS:
    return _.assign({}, state, {networkStatus: action.data});
  case APP.TOGGLE_DEV_TOOLS:
    return _.assign({}, state, {isShowingDevTools: !state.isShowingDevTools});
  case APP.SAVE_WINDOW_SETTINGS:
    return _.assign({}, state, {windowSettings: action.data});
  case APP.RESET_STORE:
    return _.assign({}, initialState);
  case APP.UPDATE_SEARCH_BOX_SIZE:
    return _.assign({}, state, {searchBoxWidth: action.data.newSize.width});

  case NOTIFICATIONS.CLICK_NOTIFICATION:
    return _.assign({}, state, {selectedTeamId: action.data.teamId});
  case EVENTS.HANDLE_DEEP_LINK:
    return parseTeamFromDeepLink(state, action.data);
  default:
    return handlePersistenceForKey(state, action, 'app');
  }
}

// Move the indices back to fill the space left over, and
// assign a new selectedTeamId if needed
function handleRemoveTeam(state, removedTeamId) {
  let teamsByIndex = _.clone(state.teamsByIndex);
  let removedIndex = _.findIndex(teamsByIndex, (teamId) => teamId === removedTeamId);
  teamsByIndex.splice(removedIndex, 1);

  let selectedTeamId = state.selectedTeamId;
  if (selectedTeamId === removedTeamId) {
    selectedTeamId = teamsByIndex[0] || null;
  }

  return _.assign({}, state, {selectedTeamId, teamsByIndex});
}

function handleNewTeam(state, teamId) {
  return _.assign({}, state, {
    selectedTeamId: teamId,
    teamsByIndex: _.union(state.teamsByIndex, [teamId])
  });
}

function handleNewTeams(state, newTeams) {
  let teamIds = newTeams.map((team) => team.team_id);

  return _.assign({}, state, {
    selectedTeamId: teamIds[0],
    teamsByIndex: _.union(state.teamsByIndex, teamIds)
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
  let selectedTeam = _.find(teamList, (team) => team.id === userId);
  if (selectedTeam) {
    return _.assign({}, state, {selectedTeamId: selectedTeam.team_id});
  } else {
    return state;
  }
}

function selectNextTeam(state) {
  let selectedIndex = _.findIndex(state.teamsByIndex, (teamAtIndex) => teamAtIndex === state.selectedTeamId);
  if (selectedIndex === -1) return state;

  let nextIndex = mod(selectedIndex + 1, state.teamsByIndex.length);
  return _.assign({}, state, {selectedTeamId: state.teamsByIndex[nextIndex]});
}

function selectPreviousTeam(state) {
  let selectedIndex = _.findIndex(state.teamsByIndex, (teamAtIndex) => teamAtIndex === state.selectedTeamId);
  if (selectedIndex === -1) return state;

  let previousIndex = mod(selectedIndex - 1, state.teamsByIndex.length);
  return _.assign({}, state, {selectedTeamId: state.teamsByIndex[previousIndex]});
}

function setTeamsByIndex(state, teamsByIndex) {
  let teamList = TeamStore.getTeams();

  if (isTeamsByIndexValid(teamList, teamsByIndex)) {
    return _.assign({}, state, {teamsByIndex});
  } else {
    logger.warn(`teamsByIndex wasn't valid – starting from scratch`);
    return _.assign({}, state, {
      teamsByIndex: Object.keys(teamList)
    });
  }
}

// If a team was provided in a deep link, try to switch to it
function parseTeamFromDeepLink(state, evt) {
  let theUrl = url.parse(evt.url, true);
  if (theUrl.protocol === SLACK_PROTOCOL && theUrl.query && theUrl.query.team) {

    // Make sure the team exists before we assign it
    let index = _.findIndex(state.teamsByIndex, (teamId) => teamId === theUrl.query.team);
    if (index >= 0) {
      return _.assign({}, state, {selectedTeamId: theUrl.query.team});
    }
  }
  return state;
}

// The default javascript modulo handles negative numbers annoyingly,
// where (-1) % 2 = -1 instead of 1
function mod(a, n) {
  return ((a % n) + n) % n;
}
