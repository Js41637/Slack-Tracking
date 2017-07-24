/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { WindowMetadata } from '../utils/shared-constants';
import { WINDOWS } from './';

export class WindowActions {
  public addWindow(options: WindowMetadata): void {
    Store.dispatch({
      type: WINDOWS.ADD_WINDOW,
      data: options
    });
  }

  public removeWindow(id: number): void {
    Store.dispatch({
      type: WINDOWS.REMOVE_WINDOW,
      data: id
    });
  }
}

const windowActions = new WindowActions();
export {
  windowActions
};
