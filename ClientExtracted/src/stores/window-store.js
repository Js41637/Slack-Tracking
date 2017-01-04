import {pickBy} from '../utils/pick-by';
import {Store} from '../lib/store';

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
    return pickBy(windows, ({type}) => windowTypes.includes(type));
  }

  getWindowsForTeam(teamId = '') {
    let windows = Store.getState().windows;
    return pickBy(windows, (win) => win.teamId === teamId);
  }

  getWindowOfType(windowType) {
    let windows = Store.getState().windows;
    let foundKey = Object.keys(windows).find((key) => windows[key].type === windowType);

    return windows[foundKey] || null;
  }

  getWindowOfSubType(subType) {
    let windows = Store.getState().windows;
    let foundKey = Object.keys(windows).find((key) => {
      return windows[key] && windows[key].type === WINDOW_TYPES.WEBAPP && windows[key].subType === subType;
    });

    return windows[foundKey] || null;
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
    return this.getWindows()[id] ? this.getWindows()[id].type : null;
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
