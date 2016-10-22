import _ from 'lodash';

import {WINDOWS} from '../actions';

export default function reduce(windows = {}, action) {
  switch(action.type) {
  case WINDOWS.ADD_WINDOW:
    return addWindow(windows, action.data.windowId, action.data.windowType);
  case WINDOWS.REMOVE_WINDOW:
    return _.omit(windows, action.data);
  default:
    return windows;
  }
}

function addWindow(windowList, windowId, type) {
  let update = {};
  update[windowId] = {
    id: windowId,
    type: type
  };
  return _.assign({}, windowList, update);
}
