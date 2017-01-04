import {Store} from '../lib/store';
import {APP_TEAMS} from './';

export class AppTeamsActions {
  public selectTeam(teamId: string): void {
    Store.dispatch({type: APP_TEAMS.SELECT_TEAM, data: teamId});
  }

  public selectTeamByUserId(userId: string): void {
    Store.dispatch({type: APP_TEAMS.SELECT_TEAM_BY_USER_ID, data: userId});
  }

  public hideTeam(teamId: string): void {
    Store.dispatch({type: APP_TEAMS.HIDE_TEAM, data: teamId});
  }

  public selectNextTeam(): void {
    Store.dispatch({type: APP_TEAMS.SELECT_NEXT_TEAM} as any);
  }

  public selectPreviousTeam(): void {
    Store.dispatch({type: APP_TEAMS.SELECT_PREVIOUS_TEAM} as any);
  }

  public selectTeamByIndex(teamIndex: number): void {
    Store.dispatch({type: APP_TEAMS.SELECT_TEAM_BY_INDEX, data: teamIndex});
  }

  public setTeamsByIndex(teamsByIndex: Array<string>): void {
    Store.dispatch({type: APP_TEAMS.SET_TEAMS_BY_INDEX, data: teamsByIndex});
  }

  public selectChannel(channel: string): void {
    Store.dispatch({type: APP_TEAMS.SELECT_CHANNEL, data: channel});
  }

  public repairTeamsByIndex(teamsByIndex: Array<string>): void {
    Store.dispatch({type: APP_TEAMS.REPAIR_TEAMS_BY_INDEX, data: teamsByIndex});
  }
}

const appTeamsActions = new AppTeamsActions();
export {
  appTeamsActions
};
