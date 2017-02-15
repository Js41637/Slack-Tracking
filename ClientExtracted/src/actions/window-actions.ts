import {Store} from '../lib/store';
import {WINDOWS} from './';
import {windowType} from '../utils/shared-constants';

export interface WindowCreationOptions {
  windowId: number;
  windowType: windowType;
  subType?: string;
  teamId?: string;
}

export class WindowActions {
  public addWindow(options: WindowCreationOptions): void {
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
