/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';
/**
 * Handles all data related to Slack's window frame.
 *
 * @class WindowFrameStore
 */
export class WindowFrameStore {
  private get windowFrame() {
    return Store.getState().windowFrame;
  }

  public getWindowSettings() {
    return this.windowFrame.windowSettings;
  }

  public isFullScreen() {
    return this.windowFrame.isFullScreen;
  }
}

const windowFrameStore = new WindowFrameStore();

export {
  windowFrameStore
};
