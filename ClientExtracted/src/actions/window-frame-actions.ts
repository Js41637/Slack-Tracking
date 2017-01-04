import {Store} from '../lib/store';
import {WINDOW_FRAME} from './';
import {WindowSetting, Region} from '../browser/behaviors/window-behavior';

export class WindowFrameActions {
  public saveWindowSettings(settings: WindowSetting): void {
    Store.dispatch({type: WINDOW_FRAME.SAVE_WINDOW_SETTINGS, data: settings});
  }

  public updateNoDragRegion(region: Region): void {
    Store.dispatch({type: WINDOW_FRAME.UPDATE_NO_DRAG_REGION, data: {region}});
  }

  public setFullScreen(isFullScreen: boolean): void {
    Store.dispatch({type: WINDOW_FRAME.SET_FULL_SCREEN, data: isFullScreen});
  }
}

const windowFrameActions = new WindowFrameActions();
export {
  windowFrameActions
};
