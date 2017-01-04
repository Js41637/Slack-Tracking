import fs from 'fs';
import url from 'url';

import {p} from '../get-path';
import {pick} from '../utils/pick';
import {pickBy} from '../utils/pick-by';
import {objectMerge} from '../utils/object-merge';

import {TEAMS, SETTINGS, MIGRATIONS} from '../actions';
import {SLACK_CORP_TEAM_ID} from '../utils/shared-constants';

let savedTsDevMenu = false;

export default function reduce(teams = {}, action) {
  switch(action.type) {
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
  case SETTINGS.INITIALIZE_SETTINGS:
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
export function getInitialsOfName(name, maxLength=2) {
  if (!name) return '';

  let initials = [];
  let words = name.split(' ');

  for (var word of words) {
    if (word.length < 1) continue;
    initials.push([...word][0]);
  }

  maxLength = (initials.length < maxLength) ? initials.length : maxLength;
  return initials.slice(0, maxLength).join('');
}

function parseTeamFromSsb(ssbTeam) {
  // The initial team data from the webapp (via `didSignIn`) won't have icons or theme
  let team = pick(ssbTeam, [
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

function addTeam(teamList, team) {
  if (teamList[team.team_id]) return teamList;

  return {
    ...teamList,
    [team.team_id]: parseTeamFromSsb(team)
  };
}

function addTeams(teamList, newTeams) {
  let update = newTeams.reduce((acc, team) => {
    acc[team.team_id] = parseTeamFromSsb(team);
    return acc;
  }, {});

  return {...teamList, ...update};
}

function removeTeamWithId(teamList, teamId) {
  return pickBy(teamList, (team) => team.team_id !== teamId);
}

function removeTeamsWithIds(teamList, teamIds) {
  return pickBy(teamList, (team) => !teamIds.includes(team.team_id));
}

function updateTeamName(teams, team_name, teamId) {
  let team = teams[teamId];
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

function updateFieldOnTeam(teams, teamId, key, value) {
  let team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      [key]: value
    }
  };
}

function updateUnreadsInfo(teams, {unreads, unreadHighlights, showBullet, teamId}) {
  let team = teams[teamId];
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

function updateTeamUsage(teams, usagePerTeam) {
  let update = {};
  for (let teamId of Object.keys(usagePerTeam)) {
    if (!teams[teamId]) continue;

    let usage = (teams[teamId].usage || 0) + usagePerTeam[teamId];
    update[teamId] = {...teams[teamId], usage};
  }
  return {...teams, ...update};
}

function setTeamIdleTimeout(teams, singleTeamId, timeout) {
  if (singleTeamId) {
    return updateFieldOnTeam(teams, singleTeamId, 'idle_timeout', timeout);
  } else {
    return Object.keys(teams).reduce((acc, teamId) => {
      return updateFieldOnTeam(acc, teamId, 'idle_timeout', timeout);
    }, teams);
  }
}

function updateTeamsForDevEnvironment(teams, {devEnv}) {
  if (!devEnv) return teams;
  return Object.keys(teams).reduce((acc, teamId) => {
    let team = teams[teamId];
    let domain = url.parse(team.team_url).host.split('.')[0];
    let team_url = `https://${domain}.${devEnv}.slack.com`;

    acc[team.team_id] = {
      ...team,
      team_url
    };

    return acc;
  }, {});
}
