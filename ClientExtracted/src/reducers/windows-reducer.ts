/**
 * @module Reducers
 */ /** for typedoc */

import { Window } from '../actions/window-actions';
import { Action } from '../actions/action';
import { WINDOWS } from '../actions/index';
import { omit } from '../utils/omit';
import { StringMap } from '../utils/shared-constants';

/**
 * @hidden
 */
export function reduce(windows: StringMap<Window> = {}, action: Action<any>): StringMap<Window> {
  switch (action.type) {
    case WINDOWS.ADD_WINDOW:
      return addWindow(windows, action.data);
    case WINDOWS.REMOVE_WINDOW:
      return omit<StringMap<Window>, StringMap<Window>>(windows, action.data);
    default:
      return windows;
  }
};

function addWindow(windowList: StringMap<Window>, { windowId, windowType, subType, teamId = '' }: Window): StringMap<Window> {
  return {
    ...windowList,
    [windowId]: {
      id: windowId,
      type: windowType,
      subType,
      teamId
    }
  };
}
