import {Store} from '../lib/store';
import {DOWNLOADS} from './';

export interface DownloadInfo {
  token: string;
  url: string;
  teamId: string;
}

export class DownloadActions {
  public startDownload(info: DownloadInfo): void {
    Store.dispatch({type: DOWNLOADS.START_DOWNLOAD, data: info});
  }

  public cancelDownload(token: string): void {
    Store.dispatch({type: DOWNLOADS.CANCEL_DOWNLOAD, data: token});
  }

  public retryDownload(token: string): void {
    Store.dispatch({type: DOWNLOADS.RETRY_DOWNLOAD, data: token});
  }

  public revealDownload(token: string): void {
    Store.dispatch({type: DOWNLOADS.REVEAL_DOWNLOAD, data: token});
  }

  public clearDownloads(tokens: any): void {
    Store.dispatch({type: DOWNLOADS.CLEAR_DOWNLOADS, data: tokens});
  }

  public downloadStarted(info: DownloadInfo): void {
    Store.dispatch({type: DOWNLOADS.DOWNLOAD_STARTED, data: info});
  }

  public downloadFinished(info: DownloadInfo): void {
    Store.dispatch({type: DOWNLOADS.DOWNLOAD_FINISHED, data: info});
  }
}

const downloadActions = new DownloadActions();
export {
  downloadActions
};
