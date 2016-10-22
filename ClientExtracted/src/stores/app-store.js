import Store from '../lib/store';

/*
  Handles all data related to the current state of the user's app, for example
  even though `selectedTeam` is related to team data, it is in this store
  because it has to do with the app's current state, rather than something
  intrinsic to the teams list.
*/
class AppStore {
  getApp() {
    return Store.getState().app;
  }

  isShowingLoginDialog() {
    return this.getApp().isShowingLoginDialog;
  }

  getInfoForAuthDialog() {
    return this.getApp().authInfo;
  }

  getAuthCredentials() {
    return this.getApp().credentials;
  }

  getLastBalloon() {
    return this.getApp().lastBalloon;
  }

  getNetworkStatus() {
    return this.getApp().networkStatus;
  }

  getUpdateStatus() {
    return this.getApp().updateStatus;
  }

  getSuspendStatus() {
    return this.getApp().isMachineAwake;
  }

  getSelectedTeamId() {
    return this.getApp().selectedTeamId;
  }

  getSelectedChannelId() {
    return this.getApp().selectedChannelId;
  }

  isShowingDevTools() {
    return this.getApp().isShowingDevTools;
  }

  getTeamsByIndex() {
    let {teams, app} = Store.getState();
    let teamsByIndex = app.teamsByIndex;

    // NB: If ever in a case where teamsByIndex is corrupted, get the state
    // from the teams themselves. It will remain this way until the user
    // rearranges their team icons.
    return isTeamsByIndexValid(teams, teamsByIndex) ?
      teamsByIndex :
      Object.keys(teams);
  }

  getTeamsToLoad() {
    return this.getApp().teamsToLoad;
  }

  getWindowSettings() {
    return this.getApp().windowSettings;
  }

  getSearchBoxSize() {
    return this.getApp().searchBoxWidth;
  }
}

export default new AppStore();

export function isTeamsByIndexValid(teams, teamsByIndex) {
  let teamIds = Object.keys(teams);

  return teamIds.length === teamsByIndex.length &&
    teamIds.includes(...teamsByIndex);
}
