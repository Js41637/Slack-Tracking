import {Store} from '../lib/store';
import {TEAMS} from './';
import {StringMap} from '../utils/string-map';

export interface TeamBase {
  id?: string;
  name: string;
  team_id: string;
  team_name: string;
  team_url: string;
  unreads: number;
  unreadHighlights: number;
  showBullet: boolean;
  initials: string;
  user_id: string;
  theme: StringMap<string>;
  icons: StringMap<string>;
  usage: number;
  idle_timeout: number;
}

export type Team = Readonly<TeamBase>;

export class TeamActions {
  public addTeam(team: Team, selectTeam: boolean): void {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAM,
      data: team,
      selectTeam
    });
  }

  public addTeams(teams: Array<Team>, selectTeam: boolean): void {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAMS,
      data: teams,
      selectTeam
    });
  }

  public removeTeam(teamId: string): void {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAM,
      data: teamId
    });
  }

  public removeTeams(teamIds: Array<string>): void {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAMS,
      data: teamIds
    });
  }

  public updateTheme(theme: StringMap<string>, teamId: string): void {
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

  public updateTeamUsage(usagePerTeam: StringMap<any>): void {
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

  public setTeamIdleTimeout(timeout: number, teamId: string): void {
    Store.dispatch({
      type: TEAMS.SET_TEAM_IDLE_TIMEOUT,
      data: {timeout, teamId}
    });
  }
}

const teamActions = new TeamActions();
export {
  teamActions
};
