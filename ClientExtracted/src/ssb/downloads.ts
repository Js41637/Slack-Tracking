/**
 * @module SSBIntegration
 */ /** for typedoc */

import { shell } from 'electron';
import { uniqueId } from '../utils/unique-id';

import { downloadActions } from '../actions/download-actions';

export class DownloadIntegration {
  /**
   * start new download to given url.
   *
   * @param {string} url
   * @returns {number} unique id attached to specific download.
   *
   * @memberOf DownloadIntegration
   */
  public startDownload(url: string): string {
    const token = uniqueId();
    downloadActions.startDownload({ token, url, teamId: window.teamId });
    return token;
  }

  public cancelDownloadWithToken(token: string) {
    downloadActions.cancelDownload(token);
  }

  public retryDownloadWithToken(token: string) {
    downloadActions.retryDownload(token);
  }

  public clearHistory() {
    const metadata = JSON.parse(this.metadataForDownloads());
    const tokens = Object.keys(metadata);
    this.pruneTokensFromHistory(tokens);
  }

  public revealDownloadWithToken(token: string) {
    downloadActions.revealDownload(token);
  }

  public revealFileAtPath(filePath: string) {
    shell.showItemInFolder(filePath);
  }

  public openFileAtPath(filePath: string) {
    shell.openItem(filePath);
  }

  //
  // Trampolines for methods in download-manager
  //

  public syncMetadata(metaData: any) {
    localStorage.setItem('downloads:metadata', JSON.stringify(metaData));
    window.TSSSB.downloadMetadataChanged();
  }

  public downloadWithTokenDidSelectFilepath(token: string, filePath: string) {
    window.TSSSB.downloadWithTokenDidSelectFilepath(token, filePath);
  }

  private metadataForDownloads() {
    return localStorage.getItem('downloads:metadata') || '{}';
  }

  private pruneTokensFromHistory(tokens: Array<string>) {
    downloadActions.clearDownloads(JSON.parse(tokens as any));
  }
}
