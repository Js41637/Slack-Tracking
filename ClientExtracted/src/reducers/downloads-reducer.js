import _ from 'lodash';

import {DOWNLOADS, APP} from '../actions';

const initialState = {
  startDownload: {timestamp: 0, token: null, url: null, teamId: null},
  cancelDownload: {timestamp: 0, token: null},
  retryDownload: {timestamp: 0, token: null},
  revealDownload: {timestamp: 0, token: null},
  clearDownloads: {timestamp: 0, tokens: null},

  downloadStarted: {timestamp: 0, token: null, filePath: null},
  downloadFinished: {timestamp: 0, token: null, state: null}
};

export default function reduce(state = initialState, action) {
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

  case APP.RESET_STORE:
    return _.assign({}, initialState);
  default:
    return state;
  }
}

function downloadEvent(state, eventName, data = {}) {
  let update = {};
  update[eventName] = _.assign({}, {timestamp: Date.now()}, data);
  return _.assign({}, state, update);
}
