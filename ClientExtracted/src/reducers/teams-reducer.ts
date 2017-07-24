/**
 * @module Reducers
 */ /** for typedoc */

import * as fs from 'graceful-fs';
import { merge, pick, pickBy } from 'lodash';
import * as url from 'url';

import { MIGRATIONS, SETTINGS, TEAMS } from '../actions';
import { Action } from '../actions/action';
import { Team, TeamBase } from '../actions/team-actions';
import { p } from '../get-path';
import { SLACK_CORP_TEAM_ID, StringMap } from '../utils/shared-constants';

let savedTsDevMenu = false;

export type TeamsState = StringMap<Team>;

/**
 * @hidden
 */
export function reduce(teams: TeamsState = {}, action: Action<any>): TeamsState {
  switch (action.type) {
  case TEAMS.ADD_NEW_TEAM:
    return addTeam(teams, action.data);
  case TEAMS.ADD_NEW_TEAMS:
    return addTeams(teams, action.data);
  case TEAMS.REMOVE_TEAM:
    return removeTeamWithId(teams, action.data);
  case TEAMS.REMOVE_TEAMS:
    return removeTeamsWithIds(teams, action.data);

  case TEAMS.UPDATE_TEAM_THEME:
    return updateFieldOnTeam(teams, action.data.teamId, 'theme', action.data.theme);
  case TEAMS.UPDATE_TEAM_ICONS:
    return updateFieldOnTeam(teams, action.data.teamId, 'icons', action.data.icons);
  case TEAMS.UPDATE_TEAM_USAGE:
    return updateTeamUsage(teams, action.data);
  case TEAMS.UPDATE_TEAM_NAME:
    return updateTeamName(teams, action.data.name, action.data.teamId);
  case TEAMS.UPDATE_TEAM_URL:
    return updateFieldOnTeam(teams, action.data.teamId, 'team_url', action.data.url);
  case TEAMS.UPDATE_USER_ID:
    return updateFieldOnTeam(teams, action.data.teamId, 'id', action.data.userId);
  case TEAMS.UPDATE_TEAM_LOCALE:
    return updateFieldOnTeam(teams, action.data.teamId, 'locale', action.data.locale);
  case SETTINGS.UPDATE_SETTINGS:
    return updateTeamsForDevEnvironment(teams, action.data);
  case MIGRATIONS.REDUX_STATE:
    return merge(teams, action.data.teams);
  default:
    return teams;
  }
}

/**
 * Returns the initial characters of the first `maxLength` words of `name`.
 *
 * @param  {String} name        The name to abbreviate
 * @param  {Number} maxLength   The maximum length of the result
 * @return {String}             The team initials
 */
export function getInitialsOfName(name: string, maxLength: number = 2): string {
  if (!name) return '';

  const initials = [];
  const words = name.split(' ');

  for (const word of words) {
    if (word.length < 1) continue;
    initials.push([...word][0]);
  }

  maxLength = (initials.length < maxLength) ? initials.length : maxLength;
  return initials.slice(0, maxLength).join('');
}

function parseTeamFromSsb(ssbTeam: any) {
  // The initial team data from the webapp (via `didSignIn`) won't have icons or theme
  const team = pick<any, any>(ssbTeam, [
    'name', 'id', 'team_id', 'team_name', 'team_url', 'theme'
  ]);

  if (ssbTeam.team_icon && Object.keys(ssbTeam.team_icon).length > 0) {
    team.icons = ssbTeam.team_icon;
  }

  team.initials = getInitialsOfName(team.team_name);
  team.user_id = ssbTeam.id;

  // NB: This is the secret handshake to enable the developer menu for Tiny Speck
  // even in production
  if (team.team_id === SLACK_CORP_TEAM_ID &&
    process.type === 'browser' &&
    !savedTsDevMenu) {
    fs.writeFileSync(p`${'userData'}/.devMenu`, 'yep');
    savedTsDevMenu = true;
  }

  return team;
}

function addTeam(teamList: TeamsState, team: Team) {
  if (teamList[team.team_id]) return teamList;

  return {
    ...teamList,
    [team.team_id]: parseTeamFromSsb(team)
  };
}

function addTeams(teamList: TeamsState, newTeams: Array<Team>) {
  const update = newTeams.reduce((acc, team) => {
    acc[team.team_id] = parseTeamFromSsb(team);
    return acc;
  }, {});

  return { ...teamList, ...update };
}

function removeTeamWithId(teamList: TeamsState, teamId: string) {
  return pickBy<TeamsState, TeamsState>(teamList, (team: TeamBase) => team.team_id !== teamId);
}

function removeTeamsWithIds(teamList: TeamsState, teamIds: Array<string>) {
  return pickBy<TeamsState, TeamsState>(teamList, (team: TeamBase) => !teamIds.includes(team.team_id)) as TeamsState;
}

function updateTeamName(teams: TeamsState, team_name: string, teamId: string) {
  const team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      team_name,
      initials: getInitialsOfName(team_name)
    }
  };
}

function updateFieldOnTeam(teams: TeamsState, teamId: string, key: string, value: any) {
  const team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      [key]: value
    }
  };
}

function updateTeamUsage(teams: TeamsState, usagePerTeam: StringMap<any>) {
  const update = {};
  for (const teamId of Object.keys(usagePerTeam)) {
    if (!teams[teamId]) continue;

    const usage = (teams[teamId].usage || 0) + usagePerTeam[teamId];
    update[teamId] = { ...teams[teamId], usage };
  }
  return { ...teams, ...update };
}

function updateTeamsForDevEnvironment(teams: TeamsState, { devEnv }: {devEnv: boolean}) {
  if (!devEnv) return teams;
  return Object.keys(teams).reduce((acc, teamId) => {
    const team = teams[teamId];
    const domain = url.parse(team.team_url).host!.split('.')[0];
    const team_url = `https://${domain}.${devEnv}.slack.com`;

    acc[team.team_id] = {
      ...team,
      team_url
    };

    return acc;
  }, {});
}
