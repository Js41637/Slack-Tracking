/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';
import { appTeamsActions } from '../actions/app-teams-actions';

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

  public getTeamsByIndex(): Array<string> {
    return this.appTeams.teamsByIndex;
  }

  public getTeamsToSignOut(): Array<string> {
    return this.appTeams.teamsToSignOut;
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
  const { teams, appTeams } = Store.getState();
  const { teamsByIndex, selectedTeamId } = appTeams;
  const teamIds = Object.keys(teams);

  if (teamsByIndex.length !== teamIds.length ||
    teamsByIndex.some((teamId: string) => teamId === null) ||
    (teamIds.length > 0 && !(teamIds.includes as any)(...teamsByIndex)) ||
    (!selectedTeamId && teamIds.length > 0)) {
    appTeamsActions.repairTeamsByIndex(teamIds);
  }

  return new AppTeamsStore();
}

const appTeamsStore = getCheckedStore();
export {
  appTeamsStore
};
