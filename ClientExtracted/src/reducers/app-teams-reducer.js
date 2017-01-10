import url from 'url';
import clone from 'lodash.clone';

import {union} from '../utils/union';
import TeamStore from '../stores/team-store';

import {APP_TEAMS, TEAMS, EVENTS, MIGRATIONS} from '../actions';

export const SLACK_PROTOCOL = 'slack:';

export const initialState = {
  selectedTeamId: null,
  selectedChannelId: null,
  teamsByIndex: [],
  hiddenTeams: []
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
  case TEAMS.ADD_NEW_TEAM:
    return handleNewTeam(state, action.data.team_id, action.selectTeam);
  case TEAMS.ADD_NEW_TEAMS:
    return handleNewTeams(state, action.data, action.selectTeam);
  case TEAMS.REMOVE_TEAM:
    return handleRemoveTeam(state, action.data);
  case TEAMS.REMOVE_TEAMS:
    return action.data.reduce((acc, teamId) => handleRemoveTeam(acc, teamId), state);

  case APP_TEAMS.SELECT_TEAM:
    return {...state, selectedTeamId: action.data};
  case APP_TEAMS.SELECT_TEAM_BY_USER_ID:
    return selectTeamByUserId(state, action.data);
  case APP_TEAMS.SELECT_NEXT_TEAM:
    return selectNextTeam(state);
  case APP_TEAMS.SELECT_PREVIOUS_TEAM:
    return selectPreviousTeam(state);
  case APP_TEAMS.SELECT_TEAM_BY_INDEX:
    return {...state, selectedTeamId: getTeamAtIndex(state, action.data)};
  case APP_TEAMS.SET_TEAMS_BY_INDEX:
    return {...state, teamsByIndex: action.data};
  case APP_TEAMS.SELECT_CHANNEL:
    return {...state, selectedChannelId: action.data};
  case APP_TEAMS.REPAIR_TEAMS_BY_INDEX:
    return {...state, teamsByIndex: action.data, selectedTeamId: action.data[0]};
  case APP_TEAMS.HIDE_TEAM:
    return handleHideTeam(state, action.data);

  case EVENTS.HANDLE_DEEP_LINK:
    return parseTeamFromDeepLink(state, action.data);
  case MIGRATIONS.REDUX_STATE:
    return handleMigration(state, action.data.app);
  default:
    return state;
  }
}

// Move the indices back to fill the space left over, and
// assign a new selectedTeamId if needed
function handleRemoveTeam(state, removedTeamId) {
  const hiddenTeams = state.hiddenTeams.filter((team) => team !== removedTeamId);
  let teamsByIndex = clone(state.teamsByIndex);
  let removedIndex = teamsByIndex.findIndex((teamId) => teamId === removedTeamId);
  teamsByIndex.splice(removedIndex, 1);

  let selectedTeamId = state.selectedTeamId;
  if (selectedTeamId === removedTeamId) {
    selectedTeamId = teamsByIndex[0] || null;
  }

  return {...state, selectedTeamId, teamsByIndex, hiddenTeams};
}

function handleNewTeam(state, selectedTeamId, selectTeam = true) {
  const hiddenTeams = state.hiddenTeams.filter((team) => team !== selectedTeamId);

  return {
    ...state,
    selectedTeamId: selectTeam ? selectedTeamId : state.selectedTeamId,
    teamsByIndex: union(state.teamsByIndex, [selectedTeamId]),
    hiddenTeams
  };
}

function handleNewTeams(state, newTeams, selectTeam = true) {
  let teamIds = newTeams.map((team) => team.team_id);

  return {
    ...state,
    selectedTeamId: selectTeam ? teamIds[0] : state.selectedTeamId,
    teamsByIndex: union(state.teamsByIndex, teamIds)
  };
}

function handleHideTeam(state, teamId) {
  const hiddenTeams = state.hiddenTeams.concat(teamId);
  const selectedTeamId = state.selectedTeamId === teamId ? state.teamsByIndex[0] : state.selectedTeamId;

  return {...state, selectedTeamId, hiddenTeams};
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

function handleMigration(state, {selectedTeamId, teamsByIndex}) {
  return {
    ...state,
    selectedTeamId,
    teamsByIndex
  };
}

// The default javascript modulo handles negative numbers annoyingly,
// where (-1) % 2 = -1 instead of 1
function mod(a, n) {
  return ((a % n) + n) % n;
}
