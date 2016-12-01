import AppStore from '../stores/app-store';
import EventStore from '../stores/event-store';
import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';

import {getReleaseNotesUrl} from '../browser/updater-utils';
import {UPDATE_STATUS} from '../utils/shared-constants';

// NB: This is a Do Everything Component solely because having too many Redux
// Components in the webapp layer is expensive on IPC dispatch, so we want to
// just have one. Yes, this _does_ suck. Sorry.
export default class ReduxHelper extends ReduxComponent {
  constructor() {
    super();
    this.lastSelectedTeams = [];
    this.update();
  }

  syncState() {
    return {
      isMachineAwake: AppStore.getSuspendStatus(),
      currentTeamId: AppStore.getSelectedTeamId(),
      sidebarClickedEvent: EventStore.getEvent('sidebarClicked'),
      updateStatus: AppStore.getUpdateStatus(),
      updateInfo: AppStore.getUpdateInfo(),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      canUpdate: !SettingStore.isLinux() &&
        !SettingStore.getSetting('isWindowsStore') &&
        !SettingStore.getSetting('isMacAppStore')
    };
  }

  update(prevState = {}) {
    this.updateLastActiveTeam(prevState);
    this.updateSuspendResume(prevState);
    this.updateUpdateStatus(prevState);
  }

  updateLastActiveTeam(prevState) {
    if (this.state.currentTeamId && this.state.currentTeamId != prevState.currentTeamId) {
      this.lastSelectedTeams.unshift(this.state.currentTeamId);
    }

    while (this.lastSelectedTeams.length > 16) {
      this.lastSelectedTeams.pop();
    }
  }

  updateSuspendResume(prevState) {
    if (this.state.isMachineAwake === prevState.isMachineAwake) return;

    let eventName = this.state.isMachineAwake ? 'wake' : 'sleep';
    window.dispatchEvent(new Event(eventName));
  }

  /**
   * Potentially show an update banner in the webapp. We send an object wite
   * the following keys:
   *
   *    canUpdate       True if the current app supports auto-updates
   *    learnMoreUrl    URL to the release notes for this platform
   *    releaseVersion  The version number for the available update
   */
  updateUpdateStatus(prevState) {
    let {updateStatus, updateInfo, releaseChannel, canUpdate} = this.state;
    if (updateStatus === prevState.updateStatus) return;

    if (window.TSSSB &&
      window.TSSSB.showUpdateBanner &&
      updateStatus === UPDATE_STATUS.UPDATE_DOWNLOADED) {

      window.TSSSB.showUpdateBanner({
        canUpdate,
        learnMoreUrl: getReleaseNotesUrl(releaseChannel === 'beta'),
        releaseVersion: updateInfo.releaseName
      });
    }
  }

  getLastActiveTeamIdForTeamIds(teamsToSelect) {
    let teamLookup = teamsToSelect.reduce((acc,x) => {
      if (x) acc[x] = true;
      return acc;
    }, {});

    return this.lastSelectedTeams.filter((x) => x in teamLookup);
  }

  sidebarClickedEvent() {
    if (window.TSSSB && window.TSSSB.ssbChromeClicked) {
      window.TSSSB.ssbChromeClicked();
    }
  }
}
