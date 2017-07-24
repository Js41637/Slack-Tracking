/**
 * @module Stores
 */ /** for typedoc */

import { pickBy } from 'lodash';

import { Store } from '../lib/store';
import { WindowsState } from '../reducers/windows-reducer';
import {
  CALLS_WINDOW_TYPES,
  WINDOW_TYPES,
  WindowMetadata,
  windowType
} from '../utils/shared-constants';
import { getWindowOfType, getWindows } from './window-store-helper';

const CURRENT_WINDOW_ID = process.type === 'renderer'
  ? require('electron').remote.getCurrentWindow().id
  : null;

/**
 * This store keeps track of window metadata. The BrowserWindow objects
 * themselves are kept out of actions & state, since they aren't amenable to
 * serialization or sending via remote.
 */
export class WindowStore {
  public getWindows(windowTypes: Array<windowType> | null = null) {
    return windowTypes ?
      getWindows(Store, windowTypes) :
      Store.getState().windows as WindowsState;
  }

  public getWindowsForTeam(teamId: string = ''): WindowsState {
    const windows = Store.getState().windows as WindowsState;
    return pickBy<WindowsState, WindowsState>(windows, (win: WindowMetadata) => win.teamId === teamId);
  }

  public getWindowOfSubType(subType: string) {
    const windows = Store.getState().windows as WindowsState;
    const foundKey = Object.keys(windows).find((key) => {
      return windows[key] &&
        windows[key].type === WINDOW_TYPES.WEBAPP &&
        windows[key].subType === subType;
    });

    if (!foundKey) return null;
    return windows[foundKey] || null;
  }

  public getWindow(id: number) {
    return this.getWindows()[id];
  }

  public getMainWindow() {
    return getWindowOfType(Store, WINDOW_TYPES.MAIN);
  }

  public getNotificationsWindow() {
    return getWindowOfType(Store, WINDOW_TYPES.NOTIFICATIONS);
  }

  public typeOfWindow(id: number) {
    return this.getWindows()[id] ? this.getWindows()[id].type : null;
  }

  public subTypeOfWindow(id: number | null = CURRENT_WINDOW_ID) {
    const metadata = this.getWindows()[id!];
    if (!metadata) return null;
    return metadata.subType || null;
  }

  public isCallsWindow(subType: string | null = null) {
    return CALLS_WINDOW_TYPES.includes(subType || this.subTypeOfWindow()!);
  }

  public getCallWindow() {
    return this.getWindowOfSubType('calls');
  }
}

const windowStore = new WindowStore();
export {
  windowStore
};
