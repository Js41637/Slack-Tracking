import {appStore} from '../stores/app-store';
import {appTeamsStore} from '../stores/app-teams-store';
import {eventStore, StoreEvent} from '../stores/event-store';
import {ReduxComponent} from '../lib/redux-component';
import {settingStore} from '../stores/setting-store';

import {getReleaseNotesUrl} from '../browser/updater-utils';
import {UpdateInformation, updateStatusType, UPDATE_STATUS, IS_STORE_BUILD} from '../utils/shared-constants';

import {logger} from '../logger';

export interface ReduxHelperState {
  isMachineAwake: boolean;
  currentTeamId: string;
  updateStatus: updateStatusType;
  updateInfo: UpdateInformation;
  releaseChannel: string;
  canUpdate: boolean;
  systemTextSettingsChangedEvent: StoreEvent;
}

// NB: This is a Do Everything Component solely because having too many Redux
// Components in the webapp layer is expensive on IPC dispatch, so we want to
// just have one. Yes, this _does_ suck. Sorry.
export class ReduxHelper extends ReduxComponent<ReduxHelperState> {
  private readonly lastSelectedTeams: Array<string> = [];

  constructor() {
    super();
    this.update();
  }

  public syncState(): Partial<ReduxHelperState> | null {
    return {
      isMachineAwake: appStore.getSuspendStatus(),
      currentTeamId: appTeamsStore.getSelectedTeamId(),
      updateStatus: appStore.getUpdateStatus(),
      updateInfo: appStore.getUpdateInfo(),
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      systemTextSettingsChangedEvent: eventStore.getEvent('systemTextSettingsChanged'),
      canUpdate: process.platform !== 'linux' && !IS_STORE_BUILD
    };
  }

  public update(prevState: Partial<ReduxHelperState> = {}): void {
    this.updateLastActiveTeam(prevState);
    this.updateSuspendResume(prevState);
    this.updateUpdateStatus(prevState);
  }

  public updateLastActiveTeam(prevState: Partial<ReduxHelperState>): void {
    if (this.state.currentTeamId && this.state.currentTeamId !== prevState.currentTeamId) {
      this.lastSelectedTeams.unshift(this.state.currentTeamId);
    }

    while (this.lastSelectedTeams.length > 16) {
      this.lastSelectedTeams.pop();
    }
  }

  public updateSuspendResume(prevState: Partial<ReduxHelperState>): void {
    if (this.state.isMachineAwake === prevState.isMachineAwake) return;

    logger.info(`updateSuspendResume: ${this.state.isMachineAwake}`);
    const eventName = this.state.isMachineAwake ? 'wake' : 'sleep';
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
  public updateUpdateStatus(prevState: Partial<ReduxHelperState>) {
    const {updateStatus, updateInfo, releaseChannel, canUpdate} = this.state as ReduxHelperState;
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

  public getLastActiveTeamIdForTeamIds(teamsToSelect: Array<any>) {
    const teamLookup = teamsToSelect.reduce((acc, x) => {
      if (x) acc[x] = true;
      return acc;
    }, {});

    return this.lastSelectedTeams.filter((x) => x in teamLookup);
  }

  public systemTextSettingsChangedEvent(): void {
    if (window.TSSSB && window.TSSSB.systemTextSettingsChanged) {
      window.TSSSB.systemTextSettingsChanged();
    }
  }
}
