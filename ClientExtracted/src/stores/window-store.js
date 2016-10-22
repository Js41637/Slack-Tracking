import _ from 'lodash';
import Store from '../lib/store';

/**
 * This store handles all metadata about Windows, however the BrowserWindow
 * objects themselves are kept outside of app Actions or State, since they are
 * objects we do not control.
 */
class WindowStore {
  MAIN = 'MAIN';
  NOTIFICATIONS = 'NOTIFICATIONS';
  WEBAPP = 'WEBAPP';
  SPECS = 'SPECS';

  getWindows(windowTypes = [this.MAIN, this.NOTIFICATIONS, this.WEBAPP, this.SPECS]) {
    windowTypes = new Set(windowTypes);
    let windows = Store.getState().windows;
    windows = _.pick(windows, ({type}) => windowTypes.has(type));
    return windows;
  }

  getWindowOfType(windowType) {
    let windows = Store.getState().windows;
    return _.find(windows, ({type}) => type === windowType) || null;
  }

  getWindow(id) {
    return this.getWindows()[id];
  }

  getMainWindow() {
    return this.getWindowOfType(this.MAIN);
  }

  getNotificationsWindow() {
    return this.getWindowOfType(this.NOTIFICATIONS);
  }
}

export default new WindowStore();
