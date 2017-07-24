/**
 * @module Reducers
 */ /** for typedoc */

import { omit } from 'lodash';
import { Action } from '../actions/action';
import { WINDOWS } from '../actions/index';
import { StringMap, WindowMetadata } from '../utils/shared-constants';

export type WindowsState = StringMap<WindowMetadata>;

/**
 * @hidden
 */
export function reduce(windows: WindowsState = {}, action: Action<any>): WindowsState {
  switch (action.type) {
    case WINDOWS.ADD_WINDOW:
      return addWindow(windows, action.data);
    case WINDOWS.REMOVE_WINDOW:
      return omit<WindowsState, WindowsState>(windows, action.data);
    default:
      return windows;
  }
}

function addWindow(windowList: WindowsState, metadata: WindowMetadata): WindowsState {
  return {
    ...windowList,
    [metadata.id]: {
      id: metadata.id,
      type: metadata.type,
      subType: metadata.subType,
      teamId: metadata.teamId || ''
    }
  };
}
