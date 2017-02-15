import {Store} from '../lib/store';
import {appTeamsActions} from '../actions/app-teams-actions';

export class AppTeamsStore {
  private get appTeams() {
    return Store.getState().appTeams;
  }

  public getSelectedTeamId(): string {
    return this.appTeams.selectedTeamId;
  }

  public getSelectedChannelId(): string {
    return this.appTeams.selectedChannelId;
  }

  public getTeamsByIndex({visibleTeamsOnly = false}: {visibleTeamsOnly?: boolean} = {}): Array<string> {
    if (visibleTeamsOnly) {
      return this.appTeams.teamsByIndex.filter((teamId: string) => !this.appTeams.hiddenTeams.includes(teamId));
    }

    return this.appTeams.teamsByIndex;
  }

  public getHiddenTeams() {
    return this.appTeams.hiddenTeams;
  }
}

/**
 * We're seeing some cases where AppTeams state falls out of sync with the
 * actual teams, or cases where the selected team is cleared out. As a
 * workaround, make some sanity checks and possibly issue a repair action.
 *
 * @return {AppTeamsStore}  The store
 */
function getCheckedStore() {
  const {teams, appTeams} = Store.getState();
  const teamIds = Object.keys(teams);

  if (appTeams.teamsByIndex.length !== teamIds.length ||
    (teamIds.length > 0 && !(teamIds.includes as any)(...appTeams.teamsByIndex)) ||
    (!appTeams.selectedTeamId && teamIds.length > 0)) {
    appTeamsActions.repairTeamsByIndex(teamIds);
  }

  return new AppTeamsStore();
}

const appTeamsStore = getCheckedStore();
export {
  appTeamsStore
};
