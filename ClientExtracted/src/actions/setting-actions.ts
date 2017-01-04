import {Store} from '../lib/store';
import {SETTINGS} from './';

export class SettingActions {
  public initializeSettings(settings: any): void {
    Store.dispatch({type: SETTINGS.INITIALIZE_SETTINGS, data: settings});
  }

  public updateSettings(settings: any): void {
    Store.dispatch({type: SETTINGS.UPDATE_SETTINGS, data: settings});
  }

  /**
   * windowId seems not actively used currently
   */
  public zoomIn(windowId?: string): void {
    Store.dispatch({type: SETTINGS.ZOOM_IN, data: windowId});
  }

  /**
   * windowId seems not actively used currently
   */
  public zoomOut(windowId?: string): void {
    Store.dispatch({type: SETTINGS.ZOOM_OUT, data: windowId});
  }

  public resetZoom(windowId?: string): void {
    Store.dispatch({type: SETTINGS.RESET_ZOOM, data: windowId});
  }
}

const settingActions = new SettingActions();
export {
  settingActions
};
