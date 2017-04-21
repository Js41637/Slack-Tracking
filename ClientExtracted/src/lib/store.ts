/**
 * @module Stores
 */ /** for typedoc */

import { WINDOW_TYPES } from '../utils/shared-constants';
import { BaseStore } from '../lib/base-store';

const isBrowser = process.type === 'browser';
const isWebapp = process.guestInstanceId || global.loadSettings.windowType === WINDOW_TYPES.WEBAPP;

let StoreForProcess: any;

if (isBrowser) {
  StoreForProcess = require('./browser-store').BrowserStore;
} else if (isWebapp) {
  StoreForProcess = require('./webapp-store').WebappStore;
} else {
  StoreForProcess = require('./renderer-store').RendererStore;
}

/**
 * This Store class is based on the Redux architecture
 * (https://github.com/rackt/redux). It is the primary source of data for the
 * application. Any consumer that needs data should import this store and call
 * `getState` to retrieve the state tree.
 */
const Store: BaseStore<any> = new (StoreForProcess as any)();
export {
  Store
};
