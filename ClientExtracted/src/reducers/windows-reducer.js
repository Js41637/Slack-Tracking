import omit from '../utils/omit';

import {WINDOWS} from '../actions';

export default function reduce(windows = {}, action) {
  switch(action.type) {
  case WINDOWS.ADD_WINDOW:
    return addWindow(windows, action.data);
  case WINDOWS.REMOVE_WINDOW:
    return omit(windows, action.data);
  default:
    return windows;
  }
}

function addWindow(windowList, {windowId, windowType, subType, teamId = ''}) {
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
