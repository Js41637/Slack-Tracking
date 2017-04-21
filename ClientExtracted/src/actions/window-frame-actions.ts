/**
 * @module Actions
 */ /** for typedoc */
import { Store } from '../lib/store';
import { WINDOW_FRAME } from './';
import { WindowSetting } from '../browser/behaviors/window-behavior';

export class WindowFrameActions {
  public saveWindowSettings(settings: WindowSetting): void {
    Store.dispatch({ type: WINDOW_FRAME.SAVE_WINDOW_SETTINGS, data: settings });
  }

  public setFullScreen(isFullScreen: boolean): void {
    Store.dispatch({ type: WINDOW_FRAME.SET_FULL_SCREEN, data: isFullScreen });
  }
}

const windowFrameActions = new WindowFrameActions();
export {
  windowFrameActions
};
