import Store from '../lib/store';
import {WINDOWS} from './';

class WindowActions {
  addWindow(windowId, windowType) {
    Store.dispatch({type: WINDOWS.ADD_WINDOW, data: {windowId, windowType}});
  }

  removeWindow(windowId) {
    Store.dispatch({type: WINDOWS.REMOVE_WINDOW, data: windowId});
  }
}

export default new WindowActions();
