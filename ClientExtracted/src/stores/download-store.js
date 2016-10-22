import Store from '../lib/store';

class DownloadStore {
  getEvent(eventName) {
    let downloads = Store.getState().downloads;
    
    if (downloads[eventName] === undefined) {
      throw new Error(`Event ${eventName} does not exist. Check for typo in DownloadStore or the appropriate shape in WindowStore`);
    }
    return downloads[eventName];
  }
}

export default new DownloadStore();
