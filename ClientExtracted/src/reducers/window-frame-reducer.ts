/**
 * @module Reducers
 */ /** for typedoc */

import { WindowSetting } from '../browser/behaviors/window-behavior';
import { Action } from '../actions/action';
import { WINDOW_FRAME, MIGRATIONS } from '../actions';

export interface WindowFrameState {
  windowSettings: WindowSetting | null;
  isFullScreen: boolean;
}

const initialState: WindowFrameState = {
  windowSettings: null,
  isFullScreen: false
};

/**
 * @hidden
 */
export function reduce(state: WindowFrameState = initialState, action: Action<any>): WindowFrameState {
  switch (action.type) {
  case WINDOW_FRAME.SAVE_WINDOW_SETTINGS:
    return { ...state, windowSettings: action.data };
  case WINDOW_FRAME.SET_FULL_SCREEN:
    return { ...state, isFullScreen: action.data };
  case MIGRATIONS.REDUX_STATE:
    return {
      ...state,
      windowSettings: action.data.app.windowSettings ?
        action.data.app.windowSettings :
        null
    };
  default:
    return state;
  }
};
