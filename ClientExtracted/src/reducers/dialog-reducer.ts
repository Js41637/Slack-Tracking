/**
 * @module Reducers
 */ /** for typedoc */

import { DIALOG, MIGRATIONS } from '../actions';
import { Action } from '../actions/action';
import { BalloonContent, UrlScheme } from '../actions/dialog-actions';
import { Credentials } from '../utils/shared-constants';

export interface DialogState {
  isShowingLoginDialog: boolean;
  lastBalloon: BalloonContent | null;
  urlSchemeModal: UrlScheme | null;
  authInfo: Electron.AuthInfo | null;
  credentials: Credentials | null;
}

const initialState: DialogState = {
  isShowingLoginDialog: false,
  lastBalloon: null,
  urlSchemeModal: null,
  authInfo: null,
  credentials: null,
};

/**
 * @hidden
 */
export function reduce(state: DialogState = initialState, action: Action<any>): DialogState {
  switch (action.type) {
  case DIALOG.SET_LOGIN_DIALOG:
    return { ...state, isShowingLoginDialog: action.data };
  case DIALOG.SHOW_AUTH_DIALOG:
    return { ...state, authInfo: action.data };
  case DIALOG.SHOW_URL_SCHEME_MODAL:
    return { ...state, urlSchemeModal: action.data };
  case DIALOG.SUBMIT_CREDENTIALS:
    return {
      ...state,
      authInfo: null,
      credentials: action.data
    };
  case DIALOG.SHOW_TRAY_BALLOON:
    return { ...state, lastBalloon: action.data };

  case MIGRATIONS.REDUX_STATE:
    return {
      ...state,
      credentials: action.data.app.credentials ?
        action.data.app.credentials : null
    };
  default:
    return state;
  }
}
