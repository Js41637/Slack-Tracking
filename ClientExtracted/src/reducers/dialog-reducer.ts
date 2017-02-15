import {Action} from '../actions/action';
import {BalloonContent, UrlScheme, AuthenticationInfo, Credentials} from '../actions/dialog-actions';
import {DIALOG, MIGRATIONS} from '../actions';

export interface DialogState {
  isShowingLoginDialog: boolean;
  lastBalloon: BalloonContent | null;
  urlSchemeModal: UrlScheme | null;
  authInfo: AuthenticationInfo | null;
  credentials: Credentials | null;
}

const initialState: DialogState = {
  isShowingLoginDialog: false,
  lastBalloon: null,
  urlSchemeModal: null,
  authInfo: null,
  credentials: null,
};

export function reduce(state: DialogState = initialState, action: Action): DialogState {
  switch (action.type) {
  case DIALOG.SET_LOGIN_DIALOG:
    return Object.assign({}, state, {isShowingLoginDialog: action.data});
  case DIALOG.SHOW_AUTH_DIALOG:
    return Object.assign({}, state, {authInfo: action.data});
  case DIALOG.SHOW_URL_SCHEME_MODAL:
    return {...state, urlSchemeModal: action.data};
  case DIALOG.SUBMIT_CREDENTIALS:
    return Object.assign({}, state, {
      authInfo: null,
      credentials: action.data
    });
  case DIALOG.SHOW_TRAY_BALLOON:
    return Object.assign({}, state, {lastBalloon: action.data});

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
