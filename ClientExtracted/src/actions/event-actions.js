import Store from '../lib/store';
import {EVENTS} from './';

class EventActions {
  editingCommand(command, windowId) {
    Store.dispatch({
      type: EVENTS.EDITING_COMMAND,
      data: {windowId, command}
    });
  }

  appCommand(command) {
    Store.dispatch({
      type: EVENTS.APP_COMMAND,
      data: {command}
    });
  }

  focusPrimaryTeam() {
    Store.dispatch({
      type: EVENTS.FOCUS_PRIMARY_TEAM,
      omitFromLog: true
    });
  }

  foregroundApp() {
    Store.dispatch({type: EVENTS.FOREGROUND_APP});
  }

  handleDeepLink(url) {
    Store.dispatch({
      type: EVENTS.HANDLE_DEEP_LINK,
      data: {url}
    });
  }

  handleExternalLink(url, disposition) {
    Store.dispatch({
      type: EVENTS.HANDLE_EXTERNAL_LINK,
      data: {url, disposition}
    });
  }

  quitApp() {
    Store.dispatch({type: EVENTS.QUIT_APP});
  }

  reload(everything = false) {
    Store.dispatch({
      type: EVENTS.RELOAD,
      data: {everything}
    });
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

  showWebappDialog(dialogType) {
    Store.dispatch({
      type: EVENTS.SHOW_WEBAPP_DIALOG,
      data: {dialogType}
    });
  }

  signOutTeam(teamId) {
    Store.dispatch({
      type: EVENTS.SIGN_OUT_TEAM,
      data: {teamId}
    });
  }

  refreshTeam(teamId) {
    Store.dispatch({
      type: EVENTS.REFRESH_TEAM,
      data: {teamId}
    });
  }

  confirmAndResetApp() {
    Store.dispatch({type: EVENTS.CONFIRM_AND_RESET_APP});
  }

  reportIssue() {
    Store.dispatch({type: EVENTS.REPORT_ISSUE});
  }

  prepareAndRevealLogs() {
    Store.dispatch({type: EVENTS.PREPARE_AND_REVEAL_LOGS});
  }

  sidebarClicked() {
    Store.dispatch({
      type: EVENTS.SIDEBAR_CLICKED,
      omitFromLog: true
    });
  }

  closeAllUpdateBanners() {
    Store.dispatch({type: EVENTS.CLOSE_ALL_UPDATE_BANNERS});
  }
}

export default new EventActions();
