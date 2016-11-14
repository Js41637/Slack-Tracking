import pick from '../utils/pick';
import pickBy from '../utils/pick-by';
import fs from 'fs';
import url from 'url';
import {p} from '../get-path';
import handlePersistenceForKey from './helpers';

import {TEAMS, SETTINGS, APP} from '../actions';

const SLACK_CORP_TEAM_ID = 'T024BE7LD';

let EventActions, savedTsDevMenu = false;

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
    return updateTheme(teams, action.data.theme, action.data.teamId);
  case TEAMS.UPDATE_TEAM_ICONS:
    return updateTeamIcons(teams, action.data.icons, action.data.teamId);
  case TEAMS.UPDATE_UNREADS_INFO:
    return updateUnreadsInfo(teams, action.data);
  case TEAMS.UPDATE_TEAM_USAGE:
    return updateTeamUsage(teams, action.data);
  case TEAMS.UPDATE_TEAM_NAME:
    return updateTeamName(teams, action.data.name, action.data.teamId);
  case TEAMS.UPDATE_TEAM_URL:
    return updateTeamUrl(teams, action.data.url, action.data.teamId);
  case TEAMS.UPDATE_USER_ID:
    return updateUserId(teams, action.data.userId, action.data.teamId);

  case SETTINGS.INITIALIZE_SETTINGS:
    return updateTeamsForDevEnvironment(teams, action.data);
  case APP.RESET_STORE:
    return {};
  default:
    return handlePersistenceForKey(teams, action, 'teams');
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
  team = parseTeamFromSsb(team);

  // NB: When a session ends, we'll go through `didSignIn` again and try to
  // add the same team. This breaks Redux rules, but issue a refresh action.
  if (teamList[team.team_id]) {
    EventActions = EventActions || require('../actions/event-actions').default;
    setTimeout(() => EventActions.refreshTeam(team.team_id), 50);
    return teamList;
  }

  let update = {};
  update[team.team_id] = team;
  return Object.assign({}, teamList, update);
}

function addTeams(teamList, newTeams) {
  let update = newTeams.reduce((acc, x) => {
    acc[x.team_id] = parseTeamFromSsb(x);
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

function updateTheme(teams, theme, teamId) {
  let team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      theme
    }
  };
}

function updateTeamIcons(teams, icons, teamId) {
  let team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      icons
    }
  };
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

function updateTeamUrl(teams, team_url, teamId) {
  let team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      team_url
    }
  };
}

function updateUserId(teams, id, teamId) {
  let team = teams[teamId];
  if (!team) return teams;
  return {
    ...teams,
    [teamId]: {
      ...team,
      id
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
