import Store from '../lib/store';
import {TEAMS} from './';

class TeamActions {

  addTeam(team) {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAM,
      data: team,
      shouldSave: true
    });
  }
  
  addTeams(teams) {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAMS,
      data: teams,
      shouldSave: true
    });
  }

  removeTeam(teamId) {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAM,
      data: teamId,
      shouldSave: true
    });
  }
  
  removeTeams(teamIds) {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAMS,
      data: teamIds,
      shouldSave: true
    });
  }

  updateTheme(theme, teamId) {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_THEME,
      data: {theme, teamId}
    });
  }

  updateIcons(icons, teamId) {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_ICONS,
      data: {icons, teamId}
    });
  }

  updateUnreadsInfo(unreads, unreadHighlights, showBullet, teamId) {
    Store.dispatch({
      type: TEAMS.UPDATE_UNREADS_INFO,
      data: {unreads, unreadHighlights, showBullet, teamId}
    });
  }

  updateTeamUsage(usagePerTeam) {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_USAGE,
      data: usagePerTeam
    });
  }
}

export default new TeamActions();
