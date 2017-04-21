/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { WINDOWS } from './';
import { windowType } from '../utils/shared-constants';

export interface Window {
  windowId: number;
  windowType: windowType;
  subType?: string;
  teamId?: string;
}

export class WindowActions {
  public addWindow(options: Window): void {
    Store.dispatch({
      type: WINDOWS.ADD_WINDOW,
      data: options
    });
  }

  public removeWindow(windowId: number): void {
    Store.dispatch({
      type: WINDOWS.REMOVE_WINDOW,
      data: windowId
    });
  }
}

const windowActions = new WindowActions();
export {
  windowActions
};
