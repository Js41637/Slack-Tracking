import {Action} from '../actions/action';
import {DOWNLOADS} from '../actions';

export interface DownloadEventState {
  timestamp: number;
  token: string | null;
}

export interface DownloadState {
  startDownload: DownloadEventState & {url: string | null, teamId: string | null};
  cancelDownload: DownloadEventState;
  retryDownload: DownloadEventState;
  revealDownload: DownloadEventState;
  clearDownloads: {timestamp: number, tokens: Array<string> | null};
  downloadStarted: DownloadEventState & {filePath: string | null};
  downloadFinished: DownloadEventState & {state: string | null};
}

const initialState: DownloadState = {
  startDownload: {timestamp: 0, token: null, url: null, teamId: null},
  cancelDownload: {timestamp: 0, token: null},
  retryDownload: {timestamp: 0, token: null},
  revealDownload: {timestamp: 0, token: null},
  clearDownloads: {timestamp: 0, tokens: null},

  downloadStarted: {timestamp: 0, token: null, filePath: null},
  downloadFinished: {timestamp: 0, token: null, state: null}
};

export function reduce(state: DownloadState = initialState, action: Action): DownloadState {
  switch (action.type) {
  case DOWNLOADS.START_DOWNLOAD:
    return downloadEvent(state, 'startDownload', action.data);
  case DOWNLOADS.CANCEL_DOWNLOAD:
    return downloadEvent(state, 'cancelDownload', {token: action.data});
  case DOWNLOADS.RETRY_DOWNLOAD:
    return downloadEvent(state, 'retryDownload', {token: action.data});
  case DOWNLOADS.REVEAL_DOWNLOAD:
    return downloadEvent(state, 'revealDownload', {token: action.data});
  case DOWNLOADS.CLEAR_DOWNLOADS:
    return downloadEvent(state, 'clearDownloads', {tokens: action.data});

  case DOWNLOADS.DOWNLOAD_STARTED:
    return downloadEvent(state, 'downloadStarted', action.data);
  case DOWNLOADS.DOWNLOAD_FINISHED:
    return downloadEvent(state, 'downloadFinished', action.data);
  default:
    return state;
  }
}

function downloadEvent(state: DownloadState, eventName: string, data: any = {}) {
  const update = {};
  update[eventName] = {timestamp: Date.now(), ...data};
  return {...state, ...update};
}
