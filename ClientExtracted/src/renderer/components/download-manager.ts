import * as assignIn from 'lodash.assignin';
import * as fs from 'graceful-fs';
import {remote, ipcRenderer} from 'electron';

import {downloadStore} from '../../stores/download-store';
import {ObservableStorage} from '../observable-storage';
import {ReduxComponent} from '../../lib/redux-component';
import {Component} from '../../lib/component';

const d = require('debug')('downloads:manager');

export interface TeamViewProps {
  teamId: string;
  loadWebView?: boolean;
  loadMinWeb?: boolean;
}

export interface TeamViewState {
}

export interface TeamViewBase extends Component<TeamViewProps, TeamViewState> {
  downloadURL(url: string): void;
  executeJavaScript(code: string, ...args: Array<any>): Promise<any>;
  executeJavaScriptMethod(code: string, ...args: Array<any>): Promise<any>;
}

export interface DownloadManagerState {
}

export interface DownloadInformation {
  token: string;
  url?: string;
  teamId?: string;
  filePath?: string;
  progress?: number;
  state?: string;
}

/** @class DownloadManager
 * Initiates downloads based on events from the webapp. Receives progress and
 * completed events from {DownloadListener}, and forwards those to the webapp
 * using `executeJavaScriptMethod`.
 */
export class DownloadManager extends ReduxComponent<DownloadManagerState> {
  private readonly teamView: TeamViewBase;
  private readonly teamId: string;
  private readonly storage: ObservableStorage;
  private readonly downloadsByToken = {};

  constructor(options: {teamView: TeamViewBase, storage?: ObservableStorage} = {teamView: null as any}) {
    super();

    if (!options.teamView) {
      throw new Error('teamview should be supplied to initialize downloadmanager');
    }

    this.teamView = options.teamView;
    this.teamId = options.teamView.props.teamId;

    const storageKey = `download-manager-${this.teamId}`;
    this.storage = options.storage || new ObservableStorage(storageKey);
    d(`Creating DownloadManager with storage key ${storageKey}`);

    // Restore download metadata that was previously saved from `localStorage`
    if (this.storage.data.downloadsByToken) {
      assignIn(this, this.storage.data);
      d(`Restoring previous download metadata: ${JSON.stringify(this.downloadsByToken)}`);
    }

    // We use standard `ipc` rather than a Store dispatch for progress events,
    // because they occur so frequently
    const onProgress = (_e: Electron.IpcRendererEvent, info: {token: string, progress: number}) => this.downloadUpdated(info);
    ipcRenderer.on('download-progress', onProgress);

    this.disposables.add(() => ipcRenderer.removeListener('download-progress', onProgress));

    this.syncWebApp();
    this.retryFailedDownloads();
  }

  public syncState() {
    return {
      startDownload: downloadStore.getEvent('startDownload'),
      retryDownload: downloadStore.getEvent('retryDownload'),
      revealDownload: downloadStore.getEvent('revealDownload'),
      clearDownloads: downloadStore.getEvent('clearDownloads'),

      downloadStarted: downloadStore.getEvent('downloadStarted'),
      downloadFinished: downloadStore.getEvent('downloadFinished'),
    };
  }

  public startDownload({token, url, teamId}: DownloadInformation): void {
    // {DownloadListener} tracks downloads for all teams, so we'll receive
    // events that might not pertain to us
    if (this.teamId !== teamId) return;

    this.downloadsByToken[token] = {
      href: url,
      token,
      progress: 0,
      start_ts: Date.now(),
      file_exists: false
    };

    d(`Starting download from URL: ${url}`);
    ipcRenderer.send('set-download-token', token);
    this.teamView.downloadURL(url!);
  }

  public retryDownload({token}: DownloadInformation): void {
    const metadata = this.downloadsByToken[token];
    if (metadata && metadata.href) {
      this.startDownload({
        token,
        url: metadata.href,
        teamId: this.teamId
      });
    } else {
      d(`Unable to retry download: ${JSON.stringify(metadata)}`);
    }
  }

  public revealDownload({token}: DownloadInformation): void {
    const metadata = this.downloadsByToken[token];
    if (metadata && fs.statSyncNoException(metadata.file_path)) {
      d(`Showing download in folder: ${metadata.file_path}`);
      remote.shell.showItemInFolder(metadata.file_path);
    }
  }

  public clearDownloads({tokens}: {tokens: Array<string>}): void {
    d('Clearing all downloads');

    let shouldSave = false;
    for (const token of tokens) {
      if (this.downloadsByToken[token]) {
        delete this.downloadsByToken[token];
        shouldSave = true;
      }
    }

    if (shouldSave) this.save();
  }

  // Based on the {Session} `will-download` event from the browser process
  public downloadStarted({token, filePath}: DownloadInformation): Promise<any> {
    const metadata = this.downloadsByToken[token];
    if (!metadata) return Promise.resolve(null);

    d(`Download of ${filePath} has begun`);
    metadata.state = 'in_progress';
    metadata.file_path = filePath;
    this.save();

    return this.teamView.executeJavaScriptMethod(
      'winssb.downloads.downloadWithTokenDidSelectFilepath',
      token, filePath);
  }

  // Based on the {DownloadItem} `done` event
  public async downloadFinished({token, state}: DownloadInformation): Promise<any> {
    const metadata = this.downloadsByToken[token];
    if (!metadata) return;

    d(`Download finished: ${state}`);
    metadata.state = this.mapDownloadItemStateToWebapp(state!);
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

  // Persists the download metadata in the webapp's `localStorage` so that it
  // can be accessed synchronously
  public async syncWebApp(): Promise<void> {
    try {
      await this.teamView.executeJavaScriptMethod(
        'winssb.downloads.syncMetadata',
        this.downloadsByToken);
    } catch (e) {
      d(`Unable to sync download metadata: ${e.message}`);
    }
  }

  // Saves the download metadata to {ObservableStorage}
  private async save(): Promise<void> {
    this.storage.data = {downloadsByToken: this.downloadsByToken};
    this.storage.save();
    await this.syncWebApp();
  }

  // Restarts any downloads that failed previously
  private retryFailedDownloads(): void {
    for (const token of Object.keys(this.downloadsByToken)) {
      const state = this.downloadsByToken[token].state;
      if (state === 'failed') {
        this.retryDownload({token});
      }
    }
  }

  // Translates the completion state of a {DownloadItem} to the appropriate
  // webapp state
  private mapDownloadItemStateToWebapp(state: string) {
    switch (state) {
    case 'cancelled':
      return 'canceled';
    case 'interrupted':
      return 'failed';
    default:
      return state;
    }
  }

  // Based on the {DownloadItem} `updated` event
  private downloadUpdated({token, progress}: DownloadInformation): Promise<any> {
    const metadata = this.downloadsByToken[token];
    if (!metadata) return Promise.resolve(null);

    d(`Download progress: ${progress}`);
    metadata.progress = progress;

    return this.teamView.executeJavaScriptMethod(
      'TSSSB.downloadWithTokenProgress',
      token, progress);
  }
}
