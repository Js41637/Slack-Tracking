import {WINDOW_TYPES} from '../utils/shared-constants';

const isBrowser = process.type === 'browser';
const isWebapp = process.guestInstanceId || global.loadSettings.windowType === WINDOW_TYPES.WEBAPP;

let StoreForProcess;

if (isBrowser) {
  StoreForProcess = require('./browser-store').default;
} else if (isWebapp) {
  StoreForProcess = require('./webapp-store').default;
} else {
  StoreForProcess = require('./renderer-store').default;
}

/**
 * This Store class is based on the Redux architecture
 * (https://github.com/rackt/redux). It is the primary source of data for the
 * application. Any consumer that needs data should import this store and call
 * `getState` to retrieve the state tree.
 */
export default new StoreForProcess();
