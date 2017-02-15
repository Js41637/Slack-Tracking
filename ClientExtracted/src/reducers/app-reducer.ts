import {Action} from '../actions/action';
import {APP} from '../actions';
import {Region} from '../region';
import {UpdateInformation, updateStatusType, networkStatusType, UPDATE_STATUS} from '../utils/shared-constants';

export interface AppState {
  networkStatus: networkStatusType;
  updateStatus: updateStatusType;
  updateInfo: UpdateInformation | null;
  isMachineAwake: boolean;
  areDevToolsOpen: boolean;
  noDragRegions: Array<Region>;
}

const initialState: AppState = {
  networkStatus: 'online',
  updateStatus: UPDATE_STATUS.NONE,
  updateInfo: null,
  isMachineAwake: true,
  areDevToolsOpen: false,
  noDragRegions: []
};

export function reduce(state: AppState = initialState, action: Action & {updateInfo: UpdateInformation}): AppState {
  switch (action.type) {
  case APP.SET_SUSPEND_STATUS:
    return {...state, isMachineAwake: action.data};
  case APP.SET_NETWORK_STATUS:
    return {...state, networkStatus: action.data};
  case APP.SET_UPDATE_STATUS:
    return setUpdateStatus(state, action.data, action.updateInfo);
  case APP.MARK_DEVTOOLS_STATE:
    return {...state, areDevToolsOpen: action.data};
  case APP.UPDATE_NO_DRAG_REGION:
    return updateNoDragRegion(state, action.data.region);
  default:
    return state;
  }
}

function setUpdateStatus(state: AppState, updateStatus: updateStatusType, updateInfo: UpdateInformation) {
  return {
    ...state,
    updateStatus,
    updateInfo
  };
}

function updateNoDragRegion(state: AppState, region: Region): AppState {
  return {
    ...state,
    noDragRegions: [
      ...state.noDragRegions.filter((r) => r.id !== region.id),
      region
    ]
  };
}
