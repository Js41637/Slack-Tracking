import _ from 'lodash';
import {Disposable} from 'rx';
import fs from 'fs';
import {remote, ipcRenderer} from 'electron';

import DownloadStore from '../../stores/download-store';
import ObservableStorage from '../observable-storage';
import ReduxComponent from '../../lib/redux-component';

const d = require('debug-electron')('downloads:manager');

/** @class DownloadManager
  * Initiates downloads based on events from the webapp. Receives progress and
  * completed events from {DownloadListener}, and forwards those to the webapp
  * using `executeJavaScriptMethod`.
  */
export default class DownloadManager extends ReduxComponent {

  constructor(options={}) {
    super();
    this.teamView = options.teamView;
    this.teamId = options.teamView.props.teamId;

    let storageKey = `download-manager-${this.teamId}`;
    this.storage = options.storage || new ObservableStorage(storageKey);
    d(`Creating DownloadManager with storage key ${storageKey}`);

    this.downloadsByToken = {};
    this.update();

    // Restore download metadata that was previously saved from `localStorage`
    if (this.storage.data.downloadsByToken) {
      _.extend(this, this.storage.data);
      d(`Restoring previous download metadata: ${JSON.stringify(this.downloadsByToken)}`);
    }

    // We use standard `ipc` rather than a Store dispatch for progress events,
    // because they occur so frequently
    let onProgress = (e, info) => this.downloadUpdated(info);
    ipcRenderer.on('download-progress', onProgress);

    this.disposables.add(new Disposable(() => {
      ipcRenderer.removeListener('download-progress', onProgress);
    }));

    this.syncWebApp();
    this.retryFailedDownloads();
  }

  syncState() {
    return {
      startDownload: DownloadStore.getEvent('startDownload'),
      retryDownload: DownloadStore.getEvent('retryDownload'),
      revealDownload: DownloadStore.getEvent('revealDownload'),
      clearDownloads: DownloadStore.getEvent('clearDownloads'),

      downloadStarted: DownloadStore.getEvent('downloadStarted'),
      downloadFinished: DownloadStore.getEvent('downloadFinished'),
    };
  }

  startDownload({token, url, teamId}) {
    // {DownloadListener} tracks downloads for all teams, so we'll receive
    // events that might not pertain to us
    if (this.teamId !== teamId) return;

    this.downloadsByToken[token] = {
      href: url,
      token: token,
      progress: 0,
      start_ts: Date.now(),
      file_exists: false
    };

    d(`Starting download from URL: ${url}`);
    ipcRenderer.send('set-download-token', token);
    this.teamView.downloadURL(url);
  }

  retryDownload({token}) {
    let metadata = this.downloadsByToken[token];
    if (metadata && metadata.href) {
      this.startDownload({
        token: token,
        url: metadata.href,
        teamId: this.teamId
      });
    } else {
      d(`Unable to retry download: ${JSON.stringify(metadata)}`);
    }
  }

  revealDownload({token}) {
    let metadata = this.downloadsByToken[token];
    if (metadata && fs.statSyncNoException(metadata.file_path)) {
      d(`Showing download in folder: ${metadata.file_path}`);
      remote.shell.showItemInFolder(metadata.file_path);
    }
  }

  clearDownloads({tokens}) {
    d('Clearing all downloads');

    let shouldSave = false;
    for (let token of tokens) {
      if (this.downloadsByToken[token]) {
        delete this.downloadsByToken[token];
        shouldSave = true;
      }
    }

    if (shouldSave) this.save();
  }

  // Based on the {Session} `will-download` event from the browser process
  downloadStarted({token, filePath}) {
    let metadata = this.downloadsByToken[token];
    if (!metadata) return;

    d(`Download of ${filePath} has begun`);
    metadata.state = 'in_progress';
    metadata.file_path = filePath;
    this.save();

    return this.teamView.executeJavaScriptMethod(
      'winssb.downloads.downloadWithTokenDidSelectFilepath',
      token, filePath);
  }

  // Based on the {DownloadItem} `updated` event
  downloadUpdated({token, progress}) {
    let metadata = this.downloadsByToken[token];
    if (!metadata) return;

    d(`Download progress: ${progress}`);
    metadata.progress = progress;

    return this.teamView.executeJavaScriptMethod(
      'TSSSB.downloadWithTokenProgress',
      token, progress);
  }

  // Based on the {DownloadItem} `done` event
  async downloadFinished({token, state}) {
    let metadata = this.downloadsByToken[token];
    if (!metadata) return;

    d(`Download finished: ${state}`);
    metadata.state = this.mapDownloadItemStateToWebapp(state);
    let result;

    if (metadata.state === 'completed') {
      metadata.end_ts = Date.now();
      metadata.file_exists = true;

      result = this.teamView.executeJavaScriptMethod('TSSSB.downloadWithTokenDidFinish', token);
    } else if (metadata.state === 'failed') {
      result = this.teamView.executeJavaScriptMethod(
        'TSSSB.downloadWithTokenDidFailWithReasonAndCode',
        token, metadata.state);
    }

    await this.save();
    return result;
  }

  // Saves the download metadata to {ObservableStorage}
  async save() {
    this.storage.data = {downloadsByToken: this.downloadsByToken};
    this.storage.save();
    await this.syncWebApp();
  }

  // Persists the download metadata in the webapp's `localStorage` so that it
  // can be accessed synchronously
  async syncWebApp() {
    try {
      await this.teamView.executeJavaScriptMethod(
        'winssb.downloads.syncMetadata',
        this.downloadsByToken);
    } catch (e) {
      d(`Unable to sync download metadata: ${e.message}`);
    }
  }

  // Restarts any downloads that failed previously
  retryFailedDownloads() {
    for (let token of _.keys(this.downloadsByToken)) {
      let state = this.downloadsByToken[token].state;
      if (state === 'failed') {
        this.retryDownload({token});
      }
    }
  }

  // Translates the completion state of a {DownloadItem} to the appropriate
  // webapp state
  mapDownloadItemStateToWebapp(state) {
    switch (state) {
    case 'cancelled':
      return 'canceled';
    case 'interrupted':
      return 'failed';
    default:
      return state;
    }
  }
}
