import {Store} from '../lib/store';
import {TEAMS} from './';

import {TEAM_UNLOADING_DISABLED, DEFAULT_TEAM_IDLE_TIMEOUT} from '../utils/shared-constants';

export class TeamActions {
  public addTeam(team: any, selectTeam: boolean): void {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAM,
      data: team,
      selectTeam,
      shouldSave: true
    });
  }

  public addTeams(teams: any, selectTeam: boolean): void {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAMS,
      data: teams,
      selectTeam,
      shouldSave: true
    });
  }

  public removeTeam(teamId: string): void {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAM,
      data: teamId,
      shouldSave: true
    });
  }

  public removeTeams(teamIds: Array<string>): void {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAMS,
      data: teamIds,
      shouldSave: true
    });
  }

  public updateTheme(theme: any, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_THEME,
      data: {theme, teamId}
    });
  }

  public updateIcons(icons: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_ICONS,
      data: {icons, teamId}
    });
  }

  public updateUnreadsInfo(unreads: number, unreadHighlights: number, showBullet: boolean, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_UNREADS_INFO,
      data: {unreads, unreadHighlights, showBullet, teamId}
    });
  }

  public updateTeamUsage(usagePerTeam: any): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_USAGE,
      data: usagePerTeam
    });
  }

  public updateTeamName(name: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_NAME,
      data: {name, teamId}
    });
  }

  public updateTeamUrl(url: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_URL,
      data: {url, teamId}
    });
  }

  public updateUserId(userId: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_USER_ID,
      data: {userId, teamId}
    });
  }

  public setTeamIdleTimeout(timeout: number = DEFAULT_TEAM_IDLE_TIMEOUT, teamId: string): void {
    Store.dispatch({
      type: TEAMS.SET_TEAM_IDLE_TIMEOUT,
      data: {timeout, teamId}
    });
  }

  public clearTeamIdleTimeout() {
    Store.dispatch({
      type: TEAMS.SET_TEAM_IDLE_TIMEOUT,
      data: {timeout: TEAM_UNLOADING_DISABLED}
    });
  }
}

const teamActions = new TeamActions();
export {
  teamActions
};
