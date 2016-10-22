import Store from '../lib/store';
import {DOWNLOADS} from './';

class DownloadActions {

  startDownload(info) {
    Store.dispatch({type: DOWNLOADS.START_DOWNLOAD, data: info});
  }

  cancelDownload(token) {
    Store.dispatch({type: DOWNLOADS.CANCEL_DOWNLOAD, data: token});
  }

  retryDownload(token) {
    Store.dispatch({type: DOWNLOADS.RETRY_DOWNLOAD, data: token});
  }

  revealDownload(token) {
    Store.dispatch({type: DOWNLOADS.REVEAL_DOWNLOAD, data: token});
  }

  clearDownloads(tokens) {
    Store.dispatch({type: DOWNLOADS.CLEAR_DOWNLOADS, data: tokens});
  }

  downloadStarted(info) {
    Store.dispatch({type: DOWNLOADS.DOWNLOAD_STARTED, data: info});
  }

  downloadFinished(info) {
    Store.dispatch({type: DOWNLOADS.DOWNLOAD_FINISHED, data: info});
  }
}

export default new DownloadActions();
