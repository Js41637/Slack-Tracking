import {APP} from '../actions';
import {UPDATE_STATUS} from '../utils/shared-constants';

const initialState = {
  networkStatus: 'online', // One of [trying, online, slackDown, offline]
  updateStatus: UPDATE_STATUS.NONE,
  updateInfo: null, // Has {releaseName: string}, others on macOS
  isMachineAwake: true
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
  case APP.SET_SUSPEND_STATUS:
    return Object.assign({}, state, {isMachineAwake: action.data});
  case APP.SET_NETWORK_STATUS:
    return Object.assign({}, state, {networkStatus: action.data});
  case APP.SET_UPDATE_STATUS:
    return setUpdateStatus(state, action.data, action.updateInfo);
  default:
    return state;
  }
}

function setUpdateStatus(state, updateStatus, updateInfo) {
  return {
    ...state,
    updateStatus,
    updateInfo
  };
}
