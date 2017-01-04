import {Store} from '../lib/store';
import {appTeamsActions} from '../actions/app-teams-actions';

class AppTeamsStore {
  getAppTeams() {
    return Store.getState().appTeams;
  }

  getSelectedTeamId() {
    return this.getAppTeams().selectedTeamId;
  }

  getSelectedChannelId() {
    return this.getAppTeams().selectedChannelId;
  }

  getTeamsByIndex() {
    return this.getAppTeams().teamsByIndex;
  }

  getHiddenTeams() {
    return this.getAppTeams().hiddenTeams;
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
    (teamIds.length > 0 && !teamIds.includes(...appTeams.teamsByIndex)) ||
    (!appTeams.selectedTeamId && teamIds.length > 0)) {
    appTeamsActions.repairTeamsByIndex(teamIds);
  }

  return new AppTeamsStore();
}

export default getCheckedStore();
