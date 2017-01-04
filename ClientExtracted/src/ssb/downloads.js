import {shell} from 'electron';
import {uniqueId} from '../utils/unique-id';

import {downloadActions} from '../actions/download-actions';

export default class DownloadIntegration {
  startDownload(url) {
    let token = uniqueId();
    downloadActions.startDownload({token: token, url: url, teamId: window.teamId});
    return token;
  }

  cancelDownloadWithToken(token) {
    downloadActions.cancelDownload(token);
  }

  retryDownloadWithToken(token) {
    downloadActions.retryDownload(token);
  }

  metadataForDownloads() {
    return localStorage.getItem('downloads:metadata') || '{}';
  }

  pruneTokensFromHistory(tokens) {
    downloadActions.clearDownloads(JSON.parse(tokens));
  }

  clearHistory() {
    let metadata = JSON.parse(this.metadataForDownloads());
    let tokens = Object.keys(metadata);
    this.pruneTokensFromHistory(tokens);
  }

  revealDownloadWithToken(token) {
    downloadActions.revealDownload(token);
  }

  revealFileAtPath(filePath) {
    shell.showItemInFolder(filePath);
  }

  openFileAtPath(filePath) {
    shell.openItem(filePath);
  }

  //
  // Trampolines for methods in download-manager
  //

  syncMetadata(metaData) {
    localStorage.setItem('downloads:metadata', JSON.stringify(metaData));
    window.TSSSB.downloadMetadataChanged();
  }

  downloadWithTokenDidSelectFilepath(token, filePath) {
    window.TSSSB.downloadWithTokenDidSelectFilepath(token, filePath);
  }
}
