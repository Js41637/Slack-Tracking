/**
 * @module Reducers
 */ /** for typedoc */

import { Action } from '../actions/action';
import { APP } from '../actions';
import { Region, StringMap, MenuItemsMap, UpdateInformation,
   updateStatusType, networkStatusType, UPDATE_STATUS } from '../utils/shared-constants';

export interface AppState {
  networkStatus: networkStatusType;
  updateStatus: updateStatusType;
  updateInfo: UpdateInformation | null;
  customMenuItems: StringMap<MenuItemsMap> | null;
  isMachineAwake: boolean;
  areDevToolsOpen: boolean;
  noDragRegions: Array<Region>;
}

const initialState: AppState = {
  networkStatus: 'online',
  updateStatus: UPDATE_STATUS.NONE,
  updateInfo: null,
  customMenuItems: null,
  isMachineAwake: true,
  areDevToolsOpen: false,
  noDragRegions: []
};

/**
 * @hidden
 */
export function reduce(
  state: AppState = initialState,
  action: Action<any> & { updateInfo: UpdateInformation }
): AppState {
  switch (action.type) {
  case APP.SET_SUSPEND_STATUS:
    return { ...state, isMachineAwake: action.data };
  case APP.SET_NETWORK_STATUS:
    return { ...state, networkStatus: action.data };
  case APP.SET_UPDATE_STATUS:
    return setUpdateStatus(state, action.data, action.updateInfo || null);
  case APP.SET_CUSTOM_MENU_ITEMS:
    return addMenuItemsForTeam(state, action.data.customItems, action.data.teamId);
  case APP.MARK_DEVTOOLS_STATE:
    return { ...state, areDevToolsOpen: action.data };
  case APP.UPDATE_NO_DRAG_REGION:
    return updateNoDragRegion(state, action.data.region);
  default:
    return state;
  }
};

function setUpdateStatus(
  state: AppState,
  updateStatus: updateStatusType,
  updateInfo: UpdateInformation
): AppState {
  return {
    ...state,
    updateStatus,
    updateInfo
  };
}

function addMenuItemsForTeam(state: AppState, newItems: MenuItemsMap, teamId: string): AppState {
  return {
    ...state,
    customMenuItems: {
      ...state.customMenuItems,
      [teamId]: newItems
    }
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
