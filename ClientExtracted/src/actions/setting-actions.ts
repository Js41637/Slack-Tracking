import {Store} from '../lib/store';
import {SETTINGS} from './';

export class SettingActions {
  public updateSettings(settings: any): void {
    Store.dispatch({type: SETTINGS.UPDATE_SETTINGS, data: settings});
  }

  public zoomIn(): void {
    Store.dispatch({type: SETTINGS.ZOOM_IN});
  }

  public zoomOut(): void {
    Store.dispatch({type: SETTINGS.ZOOM_OUT});
  }

  public resetZoom(): void {
    Store.dispatch({type: SETTINGS.RESET_ZOOM});
  }
}

const settingActions = new SettingActions();
export {
  settingActions
};
