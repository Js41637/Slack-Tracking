import _ from 'lodash';
import Store from '../lib/store';

import {WINDOW_TYPES, CALLS_WINDOW_TYPES} from '../utils/shared-constants';

const CURRENT_WINDOW_ID = process.type === 'renderer' ?
  require('electron').remote.getCurrentWindow().id : null;

/**
 * This store handles all metadata about Windows, however the BrowserWindow
 * objects themselves are kept outside of app Actions or State, since they are
 * objects we do not control.
 */
class WindowStore {
  getWindows(windowTypes = null) {
    let windows = Store.getState().windows;
    if (!windowTypes) return windows;
    return _.pick(windows, ({type}) => windowTypes.includes(type));
  }

  getWindowOfType(windowType) {
    let windows = Store.getState().windows;
    return _.find(windows, ({type}) => type === windowType) || null;
  }

  getWindowOfSubType(subType) {
    let windows = Store.getState().windows;
    return _.find(windows, (win) => {
      return win && win.type === WINDOW_TYPES.WEBAPP && win.subType === subType;
    }) || null;
  }

  getWindow(id) {
    return this.getWindows()[id];
  }

  getMainWindow() {
    return this.getWindowOfType(WINDOW_TYPES.MAIN);
  }

  getNotificationsWindow() {
    return this.getWindowOfType(WINDOW_TYPES.NOTIFICATIONS);
  }

  typeOfWindow(id) {
    return this.getWindows()[id].type || null;
  }

  subTypeOfWindow(id = CURRENT_WINDOW_ID) {
    let metadata = this.getWindows()[id];
    if (!metadata) return null;
    return metadata.subType || null;
  }

  isCallsWindow(subType = null) {
    return CALLS_WINDOW_TYPES.includes(subType || this.subTypeOfWindow());
  }
}

export default new WindowStore();
