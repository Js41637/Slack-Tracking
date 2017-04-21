/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';

export class DownloadStore {
  public getEvent(eventName: string): any  {
    const downloads = Store.getState().downloads;

    if (downloads[eventName] === undefined) {
      throw new Error(`Event ${eventName} does not exist. Check for typo in DownloadStore or the appropriate shape in WindowStore`);
    }
    return downloads[eventName];
  }
}

const downloadStore = new DownloadStore();
export {
  downloadStore
};
