import {MiddlewareAPI} from 'redux';
import {windowType} from '../utils/shared-constants';
import {pickBy} from '../utils/pick-by';
import {StringMap} from '../utils/string-map';

export interface Window {
  subType: any;
  type: any;
  id: number;
  teamId: string;
}

export function getWindowOfType(store: MiddlewareAPI<any>, windowType: windowType): Window | null {
  const windows: Array<any> = store.getState().windows;
  const foundKey = Object.keys(windows).find((key) => windows[key].type === windowType);

  if (!foundKey) return null;
  return windows[foundKey] || null;
}

export function getWindows(store: MiddlewareAPI<any>, windowTypes: Array<windowType>): StringMap<Window> {
  const windows = store.getState().windows;
  if (!windowTypes) return windows;
  return pickBy<StringMap<Window>, any>(windows, ({type}) => windowTypes.includes(type));
}
