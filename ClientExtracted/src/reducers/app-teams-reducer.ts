/**
 * @module Reducers
 */ /** for typedoc */

import * as url from 'url';
import * as clone from 'lodash.clone';

import { Action } from '../actions/action';
import { union } from '../utils/union';

import { APP_TEAMS, TEAMS, EVENTS, MIGRATIONS } from '../actions';
import { Team } from '../actions/team-actions';

import { StringMap, SLACK_PROTOCOL } from '../utils/shared-constants';

export interface AppTeamsState {
  selectedTeamId: string | null;
  selectedChannelId: string | null;
  teamsByIndex: Array<string>;
  teamsToSignOut: Array<string>;
}

export const initialState: AppTeamsState = {
  selectedTeamId: null,
  selectedChannelId: null,
  teamsByIndex: [],
  teamsToSignOut: []
};

/**
 * @hidden
 */
export function reduce(state: AppTeamsState = initialState, action: Action<any> & {selectTeam: boolean}) {
  switch (action.type) {
  case TEAMS.ADD_NEW_TEAM:
    return handleNewTeam(state, action.data.team_id, action.selectTeam);
  case TEAMS.ADD_NEW_TEAMS:
    return handleNewTeams(state, action.data, action.selectTeam);
  case TEAMS.REMOVE_TEAM:
    return handleRemoveTeam(state, action.data);
  case TEAMS.REMOVE_TEAMS:
    return action.data.reduce((acc: AppTeamsState, teamId: string) => handleRemoveTeam(acc, teamId), state);

  case APP_TEAMS.SELECT_TEAM:
    return { ...state, selectedTeamId: action.data };
  case APP_TEAMS.SELECT_TEAM_BY_USER_ID:
    return selectTeamByUserId(state, action.data);
  case APP_TEAMS.SELECT_NEXT_TEAM:
    return selectNextTeam(state);
  case APP_TEAMS.SELECT_PREVIOUS_TEAM:
    return selectPreviousTeam(state);
  case APP_TEAMS.SELECT_TEAM_BY_INDEX:
    return { ...state, selectedTeamId: getTeamAtIndex(state, action.data) };
  case APP_TEAMS.SET_TEAMS_BY_INDEX:
    return { ...state, teamsByIndex: action.data };
  case APP_TEAMS.SELECT_CHANNEL:
    return { ...state, selectedChannelId: action.data };
  case APP_TEAMS.REPAIR_TEAMS_BY_INDEX:
    return { ...state, teamsByIndex: action.data, selectedTeamId: action.data[0] };
  case APP_TEAMS.SIGNED_OUT_TEAM:
    return handleSignedOutTeam(state, action.data);

  case EVENTS.SIGN_OUT_TEAM:
    return handleSignOutTeam(state, action.data.teamId);
  case EVENTS.HANDLE_DEEP_LINK:
    return parseTeamFromDeepLink(state, action.data);
  case MIGRATIONS.REDUX_STATE:
    return handleMigration(state, action.data.app);
  default:
    return state;
  }
};

// Move the indices back to fill the space left over, and
// assign a new selectedTeamId if needed
function handleRemoveTeam(state: AppTeamsState, removedTeamId: string) {
  const teamsByIndex: Array<string> = clone(state.teamsByIndex);
  const removedIndex = teamsByIndex.findIndex((teamId) => teamId === removedTeamId);
  teamsByIndex.splice(removedIndex, 1);

  let selectedTeamId = state.selectedTeamId;
  if (selectedTeamId === removedTeamId) {
    selectedTeamId = teamsByIndex[0] || null;
  }

  return { ...state, selectedTeamId, teamsByIndex };
}

function handleNewTeam(state: AppTeamsState, selectedTeamId: string, selectTeam: boolean = true) {
  const teamsToSignOut = state.teamsToSignOut.filter((team) => team !== selectedTeamId);

  return {
    ...state,
    selectedTeamId: selectTeam ? selectedTeamId : state.selectedTeamId,
    teamsByIndex: union(state.teamsByIndex, [selectedTeamId]),
    teamsToSignOut
  };
}

function handleNewTeams(state: AppTeamsState, newTeams: Array<Team>, selectTeam: boolean = true) {
  const teamIds = newTeams.map((team) => team.team_id);
  const teamsToSignOut = state.teamsToSignOut.filter((team) => !teamIds.includes(team));

  return {
    ...state,
    selectedTeamId: selectTeam ? teamIds[0] : state.selectedTeamId,
    teamsByIndex: union(state.teamsByIndex, teamIds),
    teamsToSignOut
  };
}

function handleSignedOutTeam(state: AppTeamsState, teamId: string) {
  const teamsToSignOut = state.teamsToSignOut.filter((currentTeamId) => currentTeamId !== teamId);

  return { ...state, teamsToSignOut };
}

function handleSignOutTeam(state: AppTeamsState, teamId: string) {
  const teamsToSignOut = state.teamsToSignOut.concat(teamId);
  const selectedTeamId = state.selectedTeamId === teamId ? state.teamsByIndex[0] : state.selectedTeamId;

  return { ...state, selectedTeamId, teamsToSignOut };
}

function getTeamAtIndex(state: AppTeamsState, index: number) {
  if (!state.teamsByIndex[index]) {
    throw new Error('Attempting to get team at a non-existent index');
  }
  return state.teamsByIndex[index];
}

function selectTeamByUserId(state: AppTeamsState, data: { userId: string, teamList: StringMap<Team> }) {
  const { userId, teamList } = data;
  const selectedTeam = Object.keys(teamList)
    .map((teamId) => teamList[teamId])
    .find((team) => team.id === userId);

  if (!selectedTeam) return state;

  return {
    ...state,
    selectedTeamId: selectedTeam.team_id
  };
}

function selectNextTeam(state: AppTeamsState) {
  const selectedIndex = state.teamsByIndex.findIndex((teamAtIndex) => teamAtIndex === state.selectedTeamId);
  if (selectedIndex === -1) return state;

  const nextIndex = mod(selectedIndex + 1, state.teamsByIndex.length);
  return Object.assign({}, state, { selectedTeamId: state.teamsByIndex[nextIndex] });
}

function selectPreviousTeam(state: AppTeamsState) {
  const selectedIndex = state.teamsByIndex.findIndex((teamAtIndex) => teamAtIndex === state.selectedTeamId);
  if (selectedIndex === -1) return state;

  const previousIndex = mod(selectedIndex - 1, state.teamsByIndex.length);
  return Object.assign({}, state, { selectedTeamId: state.teamsByIndex[previousIndex] });
}

// If a team was provided in a deep link, try to switch to it
function parseTeamFromDeepLink(state: AppTeamsState, evt: { url: string }) {
  const theUrl = url.parse(evt.url, true);
  if (theUrl.protocol === SLACK_PROTOCOL && theUrl.query && theUrl.query.team) {

    // Make sure the team exists before we assign it
    const index = state.teamsByIndex.findIndex((teamId) => teamId === theUrl.query.team);
    if (index >= 0) {
      return Object.assign({}, state, { selectedTeamId: theUrl.query.team });
    }
  }
  return state;
}

function handleMigration(state: AppTeamsState, { selectedTeamId, teamsByIndex }: { selectedTeamId: string, teamsByIndex: Array<string> }) {
  return {
    ...state,
    selectedTeamId,
    teamsByIndex
  };
}

// The default javascript modulo handles negative numbers annoyingly,
// where (-1) % 2 = -1 instead of 1
function mod(a: number, n: number) {
  return ((a % n) + n) % n;
}
