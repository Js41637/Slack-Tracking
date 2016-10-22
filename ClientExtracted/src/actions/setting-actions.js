import Store from '../lib/store';
import {SETTINGS} from './';

class SettingActions {

  initializeSettings(settings) {
    Store.dispatch({type: SETTINGS.INITIALIZE_SETTINGS, data: settings});
  }
  
  updateSettings(settings) {
    Store.dispatch({type: SETTINGS.UPDATE_SETTINGS, data: settings});
  }

  zoomIn(windowId) {
    Store.dispatch({type: SETTINGS.ZOOM_IN, data: windowId});
  }

  zoomOut(windowId) {
    Store.dispatch({type: SETTINGS.ZOOM_OUT, data: windowId});
  }

  resetZoom(windowId) {
    Store.dispatch({type: SETTINGS.RESET_ZOOM, data: windowId});
  }
}

export default new SettingActions();
