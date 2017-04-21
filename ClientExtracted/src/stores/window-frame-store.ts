/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';
import { WindowSetting } from '../browser/behaviors/window-behavior';
/**
 * Handles all data related to Slack's window frame.
 *
 * @class WindowFrameStore
 */
export class WindowFrameStore {
  private get WindowFrame() {
    return Store.getState().windowFrame;
  }

  public getWindowSettings(): WindowSetting {
    return this.WindowFrame.windowSettings;
  }

  public isFullScreen(): boolean {
    return this.WindowFrame.isFullScreen;
  }
}

const windowFrameStore = new WindowFrameStore();

export {
  windowFrameStore
};
