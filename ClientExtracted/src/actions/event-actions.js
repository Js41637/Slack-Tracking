import Store from '../lib/store';
import {EVENTS} from './';

class EventActions {
  checkForUpdate() {
    Store.dispatch({type: EVENTS.CHECK_FOR_UPDATE});
  }

  editingCommand(command, windowId) {
    Store.dispatch({type: EVENTS.EDITING_COMMAND, data: {windowId, command}});
  }

  appCommand(command) {
    Store.dispatch({type: EVENTS.APP_COMMAND, data: {command}});
  }

  focusPrimaryTeam() {
    Store.dispatch({type: EVENTS.FOCUS_PRIMARY_TEAM});
  }

  foregroundApp() {
    Store.dispatch({type: EVENTS.FOREGROUND_APP});
  }

  handleDeepLink(url) {
    Store.dispatch({type: EVENTS.HANDLE_DEEP_LINK, data: {url}});
  }

  quitApp() {
    Store.dispatch({type: EVENTS.QUIT_APP});
  }

  reloadMainWindow() {
    Store.dispatch({type: EVENTS.RELOAD_MAIN_WINDOW});
  }

  toggleFullScreen() {
    Store.dispatch({type: EVENTS.TOGGLE_FULL_SCREEN});
  }

  runSpecs() {
    Store.dispatch({type: EVENTS.RUN_SPECS});
  }

  showAbout() {
    Store.dispatch({type: EVENTS.SHOW_ABOUT});
  }
  
  showReleaseNotes() {
    Store.dispatch({type: EVENTS.SHOW_RELEASE_NOTES});
  }

  showPreferences() {
    Store.dispatch({type: EVENTS.SHOW_PREFERENCES});
  }

  signOutTeam(teamId) {
    Store.dispatch({type: EVENTS.SIGN_OUT_TEAM, data: {teamId}});
  }

  refreshTeam(teamId) {
    Store.dispatch({type: EVENTS.REFRESH_TEAM, data: {teamId}});
  }

  confirmAndResetApp() {
    Store.dispatch({type: EVENTS.CONFIRM_AND_RESET_APP});
  }
}

export default new EventActions();
