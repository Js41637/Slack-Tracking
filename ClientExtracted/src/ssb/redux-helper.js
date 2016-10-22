import {webFrame} from 'electron';

import ReduxComponent from '../lib/redux-component';
import AppStore from '../stores/app-store';
import SettingStore from '../stores/setting-store';
import WindowStore from '../stores/window-store';

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
      zoomLevel: SettingStore.getSetting('zoomLevel'),
      isCallsWindow: WindowStore.isCallsWindow()
    };
  }

  update(prevState = {}) {
    this.updateLastActiveTeam(prevState);
    this.updateSuspendResume(prevState);
    if (!this.state.isCallsWindow) this.updateZoomLevel(prevState);
  }

  updateLastActiveTeam(prevState) {
    if (this.state.currentTeamId && this.state.currentTeamId != prevState.currentTeamId) {
      this.lastSelectedTeams.unshift(this.state.currentTeamId);
    }

    while (this.lastSelectedTeams.length > 16) {
      this.lastSelectedTeams.pop();
    }
  }

  updateZoomLevel(prevState) {
    if (prevState.zoomLevel !== this.state.zoomLevel) {
      webFrame.setZoomLevel(this.state.zoomLevel);
    }
  }

  updateSuspendResume(prevState) {
    if (this.state.isMachineAwake === prevState.isMachineAwake) return;

    let eventName = this.state.isMachineAwake ? 'wake' : 'sleep';
    window.dispatchEvent(new Event(eventName));
  }

  getLastActiveTeamIdForTeamIds(teamsToSelect) {
    let teamLookup = teamsToSelect.reduce((acc,x) => {
      if (x) acc[x] = true;
      return acc;
    }, {});

    return this.lastSelectedTeams.filter((x) => x in teamLookup);
  }
}
