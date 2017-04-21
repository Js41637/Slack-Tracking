/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { APP } from './';
import { Region, StringMap, UPDATE_STATUS, updateStatusType,
  networkStatusType, UpdateInformation } from '../utils/shared-constants';

export class AppActions {
  public setNetworkStatus(status: networkStatusType): void {
    Store.dispatch({
      type: APP.SET_NETWORK_STATUS,
      data: status
    });
  }

  public checkForUpdate(): void {
    Store.dispatch({
      type: APP.SET_UPDATE_STATUS,
      data: UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL
    });
  }

  public updateDownloaded(updateInfo: UpdateInformation): void {
    Store.dispatch({
      type: APP.SET_UPDATE_STATUS,
      data: UPDATE_STATUS.UPDATE_DOWNLOADED,
      updateInfo
    });
  }

  public setUpdateStatus(status: updateStatusType): void {
    Store.dispatch({type:
      APP.SET_UPDATE_STATUS,
      data: status
    });
  }

  public setSuspendStatus(isAwake: boolean): void {
    Store.dispatch({
      type: APP.SET_SUSPEND_STATUS,
      data: isAwake
    });
  }

  public markDevToolsOpened(): void {
    Store.dispatch({
      type: APP.MARK_DEVTOOLS_STATE,
      data: true
    });
  }

  public markDevToolsClosed(): void {
    Store.dispatch({
      type: APP.MARK_DEVTOOLS_STATE,
      data: false
    });
  }

  public setCustomMenuItems(
    customItems: StringMap<Array<Electron.MenuItemOptions>>,
    teamId: string
  ): void {
    Store.dispatch({
      type: APP.SET_CUSTOM_MENU_ITEMS,
      data: { customItems, teamId }
    });
  }

  public customMenuItemClicked(itemId: string): void {
    Store.dispatch({
      type: APP.CUSTOM_MENU_ITEM_CLICKED,
      data: { itemId }
    });
  }

  public updateNoDragRegion(region: Region): void {
    Store.dispatch({
      type: APP.UPDATE_NO_DRAG_REGION,
      data: { region },
      omitFromLog: true
    });
  }
}

const appActions = new AppActions();
export {
  appActions
};
