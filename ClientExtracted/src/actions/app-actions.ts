import {Store} from '../lib/store';
import {APP} from './';
import {UPDATE_STATUS, updateStatusType} from '../utils/shared-constants';

export type networkStatusType = 'online' | 'slackDown' | 'offline';

export interface UpdateInformation {
  releaseNotes: string;
  releaseName: string;
  releaseDate: string;
}

export class AppActions {
  public setNetworkStatus(status: networkStatusType): void {
    Store.dispatch({type: APP.SET_NETWORK_STATUS, data: status});
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
    Store.dispatch({type: APP.SET_UPDATE_STATUS, data: status});
  }

  public setSuspendStatus(isAwake: boolean): void {
    Store.dispatch({type: APP.SET_SUSPEND_STATUS, data: isAwake});
  }
}

const appActions = new AppActions();
export {
  appActions
};
