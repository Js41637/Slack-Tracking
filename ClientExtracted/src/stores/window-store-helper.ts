/**
 * @module Stores
 */ /** for typedoc */

import { pickBy } from 'lodash';
import { MiddlewareAPI } from 'redux';
import { RootState } from '../reducers';
import { WindowsState } from '../reducers/windows-reducer';
import { WindowMetadata, windowType } from '../utils/shared-constants';

export function getWindowOfType(store: MiddlewareAPI<RootState>, windowType: windowType): WindowMetadata | null {
  const windows = store.getState().windows;
  const foundKey = Object.keys(windows).find((key) => windows[key].type === windowType);

  if (!foundKey) return null;
  return windows[foundKey] || null;
}

export function getWindows(store: MiddlewareAPI<RootState>, windowTypes: Array<windowType>): WindowsState {
  const windows = store.getState().windows;
  if (!windowTypes) return windows;
  return pickBy<WindowsState, WindowsState>(windows, ({ type }: WindowMetadata) => windowTypes.includes(type));
}
