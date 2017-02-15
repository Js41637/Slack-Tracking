import * as fs from 'graceful-fs';
import * as url from 'url';

import {p} from '../get-path';
import {pick} from '../utils/pick';
import {pickBy} from '../utils/pick-by';
import {objectMerge} from '../utils/object-merge';
import {StringMap} from '../utils/string-map';

import {Action} from '../actions/action';
import {TEAMS, SETTINGS, MIGRATIONS} from '../actions';
import {Team, TeamBase} from '../actions/team-actions';
import {SLACK_CORP_TEAM_ID} from '../utils/shared-constants';

let savedTsDevMenu = false;

export function reduce(teams: StringMap<Team> = {}, action: Action): StringMap<Team> {
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
  case TEAMS.UPDATE_UNREADS_INFO:
    return updateUnreadsInfo(teams, action.data);
  case TEAMS.UPDATE_TEAM_USAGE:
    return updateTeamUsage(teams, action.data);
  case TEAMS.UPDATE_TEAM_NAME:
    return updateTeamName(teams, action.data.name, action.data.teamId);
  case TEAMS.UPDATE_TEAM_URL:
    return updateFieldOnTeam(teams, action.data.teamId, 'team_url', action.data.url);
  case TEAMS.UPDATE_USER_ID:
    return updateFieldOnTeam(teams, action.data.teamId, 'id', action.data.userId);
  case TEAMS.SET_TEAM_IDLE_TIMEOUT:
    return setTeamIdleTimeout(teams, action.data.teamId, action.data.timeout);
  case SETTINGS.UPDATE_SETTINGS:
    return updateTeamsForDevEnvironment(teams, action.data);
  case MIGRATIONS.REDUX_STATE:
    return objectMerge(teams, action.data.teams);
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
  const team = pick<TeamBase, any>(ssbTeam, [
    'name', 'id', 'team_id', 'team_name', 'team_url', 'theme'
  ]);

  if (ssbTeam.team_icon && Object.keys(ssbTeam.team_icon).length > 0) {
    team.icons = ssbTeam.team_icon;
  }

  team.unreads = 0;
  team.unreadHighlights = 0;
  team.showBullet = false;
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

function addTeam(teamList: StringMap<Team>, team: Team) {
  if (teamList[team.team_id]) return teamList;

  return {
    ...teamList,
    [team.team_id]: parseTeamFromSsb(team)
  };
}

function addTeams(teamList: StringMap<Team>, newTeams: Array<Team>) {
  const update = newTeams.reduce((acc, team) => {
    acc[team.team_id] = parseTeamFromSsb(team);
    return acc;
  }, {});

  return {...teamList, ...update};
}

function removeTeamWithId(teamList: StringMap<Team>, teamId: string) {
  return pickBy<StringMap<Team>, StringMap<Team>>(teamList, (team) => team.team_id !== teamId);
}

function removeTeamsWithIds(teamList: StringMap<Team>, teamIds: Array<string>) {
  return pickBy<StringMap<Team>, StringMap<Team>>(teamList, (team) => !teamIds.includes(team.team_id));
}

function updateTeamName(teams: StringMap<Team>, team_name: string, teamId: string) {
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

function updateFieldOnTeam(teams: StringMap<Team>, teamId: string, key: string, value: any) {
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

function updateUnreadsInfo(teams: StringMap<Team>, {unreads, unreadHighlights, showBullet, teamId}: Partial<Team> & {teamId: string}) {
  const team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      unreads,
      unreadHighlights,
      showBullet
    }
  };
}

function updateTeamUsage(teams: StringMap<Team>, usagePerTeam: StringMap<any>) {
  const update = {};
  for (const teamId of Object.keys(usagePerTeam)) {
    if (!teams[teamId]) continue;

    const usage = (teams[teamId].usage || 0) + usagePerTeam[teamId];
    update[teamId] = {...teams[teamId], usage};
  }
  return {...teams, ...update};
}

function setTeamIdleTimeout(teams: StringMap<Team>, singleTeamId: string, timeout: number) {
  if (singleTeamId) {
    return updateFieldOnTeam(teams, singleTeamId, 'idle_timeout', timeout);
  } else {
    return Object.keys(teams).reduce((acc, teamId) => {
      return updateFieldOnTeam(acc, teamId, 'idle_timeout', timeout);
    }, teams as any);
  }
}

function updateTeamsForDevEnvironment(teams: StringMap<Team>, {devEnv}: {devEnv: boolean}) {
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
