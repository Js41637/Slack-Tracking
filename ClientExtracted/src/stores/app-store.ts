import {Region} from '../region';
import {Store} from '../lib/store';

import {networkStatusType, UpdateInformation, updateStatusType} from '../utils/shared-constants';

export class AppStore {
  private get app() {
    return Store.getState().app;
  }

  public getNetworkStatus(): networkStatusType {
    return this.app.networkStatus;
  }

  public getUpdateStatus(): updateStatusType {
    return this.app.updateStatus;
  }

  public getUpdateInfo(): UpdateInformation {
    return this.app.updateInfo;
  }

  public getSuspendStatus(): boolean {
    return this.app.isMachineAwake;
  }

  public areDevToolsOpen(): boolean {
    return this.app.areDevToolsOpen;
  }

  public getNoDragRegions(): Array<Region> {
    return this.app.noDragRegions;
  }
}

const appStore = new AppStore();
export {
  appStore
};
