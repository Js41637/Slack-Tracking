import {shell} from 'electron';
import uuid from 'node-uuid';

import DownloadActions from '../actions/download-actions';

export default class DownloadIntegration {
  startDownload(url) {
    let token = uuid.v4();
    DownloadActions.startDownload({token: token, url: url, teamId: window.teamId});
    return token;
  }

  cancelDownloadWithToken(token) {
    DownloadActions.cancelDownload(token);
  }

  retryDownloadWithToken(token) {
    DownloadActions.retryDownload(token);
  }

  metadataForDownloads() {
    return localStorage.getItem('downloads:metadata') || '{}';
  }

  pruneTokensFromHistory(tokens) {
    DownloadActions.clearDownloads(JSON.parse(tokens));
  }

  clearHistory() {
    let metadata = JSON.parse(this.metadataForDownloads());
    let tokens = Object.keys(metadata);
    this.pruneTokensFromHistory(tokens);
  }

  revealDownloadWithToken(token) {
    DownloadActions.revealDownload(token);
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
