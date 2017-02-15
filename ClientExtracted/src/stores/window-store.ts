import {pickBy} from '../utils/pick-by';
import {Store} from '../lib/store';
import {getWindowOfType, Window, getWindows} from './window-store-helper';

import {WINDOW_TYPES, CALLS_WINDOW_TYPES, windowType} from '../utils/shared-constants';
import {StringMap} from '../utils/string-map';

const CURRENT_WINDOW_ID = process.type === 'renderer' ?
  require('electron').remote.getCurrentWindow().id : null;

/**
 * This store handles all metadata about Windows, however the BrowserWindow
 * objects themselves are kept outside of app Actions or State, since they are
 * objects we do not control.
 */
export class WindowStore {
  public getWindows(windowTypes: Array<windowType> | null = null): StringMap<Window> {
    return windowTypes ? getWindows(Store, windowTypes) :
                         Store.getState().windows;
  }

  public getWindowsForTeam(teamId: string = ''): StringMap<Window> {
    const windows = Store.getState().windows as StringMap<Window>;
    return pickBy<StringMap<Window>, StringMap<Window>>(windows, (win: Window) => win.teamId === teamId);
  }

  public getWindowOfSubType(subType: string) {
    const windows = Store.getState().windows as StringMap<Window>;
    const foundKey = Object.keys(windows).find((key) => {
      return windows[key] && windows[key].type === WINDOW_TYPES.WEBAPP && windows[key].subType === subType;
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

  public typeOfWindow(id: number): windowType {
    return this.getWindows()[id] ? this.getWindows()[id].type : null;
  }

  public subTypeOfWindow(id: number | null = CURRENT_WINDOW_ID) {
    const metadata = this.getWindows()[id!];
    if (!metadata) return null;
    return metadata.subType || null;
  }

  public isCallsWindow(subType: windowType | null = null): boolean {
    return CALLS_WINDOW_TYPES.includes(subType || this.subTypeOfWindow());
  }

  public getCallWindow() {
    return this.getWindowOfSubType('calls');
  }
}

const windowStore = new WindowStore();
export {
  windowStore
};
