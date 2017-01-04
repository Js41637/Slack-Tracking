import {DIALOG, MIGRATIONS} from '../actions';

const initialState = {
  isShowingLoginDialog: false,
  lastBalloon: null,
  urlSchemeModal: null, // Has {disposition: {string}, url: {string}, isShowing: {bool}
  authInfo: null,
  credentials: null, // Has {username, password}
  isShowingDevTools: false
};

export default function reduce(state = initialState, action) {
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
  case DIALOG.TOGGLE_DEV_TOOLS:
    return Object.assign({}, state, {isShowingDevTools: !state.isShowingDevTools});

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
