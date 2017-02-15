import {Store} from '../lib/store';
import {DOWNLOADS} from './';

export interface DownloadInfo {
  token: string;
  url?: string;
  teamId?: string;
  filePath?: string;
  state?: any;
}

export class DownloadActions {
  public startDownload(info: DownloadInfo): void {
    Store.dispatch({
      type: DOWNLOADS.START_DOWNLOAD,
      data: info,
      omitKeysFromLog: ['filePath', 'url']
    });
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

  public clearDownloads(tokens: Array<string>): void {
    Store.dispatch({type: DOWNLOADS.CLEAR_DOWNLOADS, data: tokens});
  }

  public downloadStarted(info: DownloadInfo): void {
    Store.dispatch({
      type: DOWNLOADS.DOWNLOAD_STARTED,
      data: info,
      omitKeysFromLog: ['filePath']
    });
  }

  public downloadFinished(info: DownloadInfo): void {
    Store.dispatch({
      type: DOWNLOADS.DOWNLOAD_FINISHED,
      data: info,
      omitKeysFromLog: ['filePath']
    });
  }
}

const downloadActions = new DownloadActions();
export {
  downloadActions
};
