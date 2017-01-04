import {Store} from '../lib/store';

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

  getNetworkStatus() {
    return this.getApp().networkStatus;
  }

  getUpdateStatus() {
    return this.getApp().updateStatus;
  }

  getUpdateInfo() {
    return this.getApp().updateInfo;
  }

  getSuspendStatus() {
    return this.getApp().isMachineAwake;
  }
}

export default new AppStore();
