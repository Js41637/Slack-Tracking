/**
 * The actual Redux implementation and store facade are located in `src/lib/store`. We present a
 * different facade based on which process is accessing it, and synchronize stores using a
 * library called [`redux-electron-store`](https://github.com/samiskin/redux-electron-store).
 * The main store is the `BrowserStore`, which is in charge of saving and restoring state and
 * acts as the mediator for synchronization. Stores in the renderer processes see only a portion
 * of the state tree (the notification window, for example, only needs to know about notifications,
 * teams, and some preferences).
 *
 * We provide accessors or convenience functions for `Store.getState()` in classes that are also
 * (redundantly) called stores. Each class provides access to a different subkey of the state tree,
 * and are located in `src/stores`.
 *
 * @module Stores
 * @preferred
 */ /** for typedoc */

import { Store } from '../lib/store';
import { AppState } from '../reducers/app-reducer';
import { MenuItemsMap, Region, networkStatusType, UpdateInformation,
  updateStatusType } from '../utils/shared-constants';

export class AppStore {
  private get app(): AppState {
    return Store.getState().app;
  }

  public getNetworkStatus(): networkStatusType {
    return this.app.networkStatus;
  }

  public getUpdateStatus(): updateStatusType {
    return this.app.updateStatus;
  }

  public getUpdateInfo(): UpdateInformation | null {
    return this.app.updateInfo;
  }

  public getCustomMenuItems(teamId: string): MenuItemsMap {
    return this.app.customMenuItems ?
      this.app.customMenuItems[teamId] :
      null;
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
