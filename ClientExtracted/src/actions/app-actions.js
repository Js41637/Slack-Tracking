import Store from '../lib/store';
import {APP} from './';

class AppActions {

  setNetworkStatus(status) {
    Store.dispatch({type: APP.SET_NETWORK_STATUS, data: status});
  }

  setSuspendStatus(isAwake) {
    Store.dispatch({type: APP.SET_SUSPEND_STATUS, data: isAwake});
  }

  showLoginDialog() {
    Store.dispatch({type: APP.SET_LOGIN_DIALOG, data: true});
  }

  hideLoginDialog() {
    Store.dispatch({type: APP.SET_LOGIN_DIALOG, data: false});
  }

  showAuthenticationDialog(authInfo) {
    Store.dispatch({type: APP.SHOW_AUTH_DIALOG, data: authInfo});
  }

  submitCredentials(credentials) {
    Store.dispatch({
      type: APP.SUBMIT_CREDENTIALS,
      shouldSaveToKeychain: true,
      data: credentials,
      omitFromLog: ['password']
    });
  }

  showBalloon(balloon) {
    Store.dispatch({type: APP.SHOW_TRAY_BALLOON, data: balloon});
  }

  toggleDevTools() {
    Store.dispatch({type: APP.TOGGLE_DEV_TOOLS});
  }

  selectTeam(teamId) {
    Store.dispatch({type: APP.SELECT_TEAM, data: teamId});
  }

  selectTeamByUserId(userId) {
    Store.dispatch({type: APP.SELECT_TEAM_BY_USER_ID, data: userId});
  }

  selectNextTeam() {
    Store.dispatch({type: APP.SELECT_NEXT_TEAM});
  }

  selectPreviousTeam() {
    Store.dispatch({type: APP.SELECT_PREVIOUS_TEAM});
  }

  selectTeamByIndex(teamIndex) {
    Store.dispatch({type: APP.SELECT_TEAM_BY_INDEX, data: teamIndex});
  }

  setTeamsByIndex(teamsByIndex) {
    Store.dispatch({type: APP.SET_TEAMS_BY_INDEX, data: teamsByIndex});
  }

  loadTeams(teams) {
    Store.dispatch({type: APP.LOAD_TEAMS, data: teams});
  }

  saveWindowSettings(settings) {
    Store.dispatch({type: APP.SAVE_WINDOW_SETTINGS, data: settings});
  }

  resetStore() {
    Store.dispatch({type: APP.RESET_STORE});
  }

  updateSearchBoxSize(newSize) {
    Store.dispatch({type: APP.UPDATE_SEARCH_BOX_SIZE, data: {newSize}});
  }
}

export default new AppActions();
