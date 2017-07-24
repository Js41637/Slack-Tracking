/**
 * @module Browser
 */ /** for typedoc */

import * as assert from 'assert';
import { app } from 'electron';
import * as fs from 'graceful-fs';
import { isEqual } from 'lodash';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';

import { settingActions } from '../actions/setting-actions';
import { p } from '../get-path';
import { ReduxComponent } from '../lib/redux-component';
import { Store } from '../lib/store';
import { logger } from '../logger';
import '../rx-operators';
import { settingStore } from '../stores/setting-store';

import {
  DownloadInfo,
  DownloadKey,
  getAllDownloads,
  getMaxDownloadProgress,
  removeDownload,
  updateDownload
} from '../reducers/downloads-reducer';

export interface DownloadListenerState {
  newDownloads: Array<DownloadInfo>;
  inProgressDownloads: Array<DownloadInfo>;
  downloadsToCancel: Array<DownloadInfo>;
  downloadsToPause: Array<DownloadInfo>;
  downloadsToResume: Array<DownloadInfo>;
  downloadsDirectory: string;
  maxDownloadProgress?: number;
}

export type DownloadItemWithKey = DownloadKey & {
  item: Electron.DownloadItem
};

/**
 * Initiates & updates downloads for all teams. This component tracks downloads
 * that have yet to be started and calls {@link WebContents.downloadURL} on
 * them, then waits for {@link session.will-download} and tracks the corresponding
 * {@link Electron.DownloadItem}.
 *
 * See {@link guides/downloads-design-doc.md} for more info.
 *
 * @export
 * @class DownloadListener
 * @extends {ReduxComponent<DownloadListenerState>}
 */
export class DownloadListener extends ReduxComponent<DownloadListenerState> {
  private readonly webContents: Electron.WebContents;
  private readonly session: Electron.Session;
  private readonly urlsToDownload = new Map<string, DownloadKey>();
  private readonly downloadItems = new Map<string, Electron.DownloadItem>();

  constructor(private readonly mainWindow: Electron.BrowserWindow) {
    super();

    if (!this.state.downloadsDirectory) {
      this.initializeDownloadsDirectory(process.platform);
      logger.info('DownloadListener: Downloads directory set to',
        this.state.downloadsDirectory);
    }

    this.webContents = this.mainWindow.webContents;
    this.session = this.mainWindow.webContents.session;

    this.disposables.add(Observable.fromEvent(this.session,
      'will-download',
      (_e: Event, item: Electron.DownloadItem) => item)
      .subscribe((item) => this.onWillDownloadItem(item)));
  }

  /**
   * Cancel in-progress downloads on exit.
   */
  public dispose() {
    super.dispose();
    this.performActionOnDownloads(this.state.inProgressDownloads, (item) => item.cancel());
  }

  public syncState(): DownloadListenerState {
    const allDownloads = getAllDownloads(Store);

    const state: DownloadListenerState = {
      newDownloads: allDownloads.filter(({ downloadState }) => downloadState === 'not_started'),
      inProgressDownloads: allDownloads.filter(({ downloadState }) => downloadState === 'progressing'),

      downloadsToCancel: allDownloads.filter(({ requestState }) => requestState === 'cancel'),
      downloadsToPause: allDownloads.filter(({ requestState }) => requestState === 'pause'),
      downloadsToResume: allDownloads.filter(({ requestState }) => requestState === 'resume'),

      downloadsDirectory: settingStore.getSetting<string>('PrefSSBFileDownloadPath'),
    };

    if (process.platform !== 'darwin') {
      state.maxDownloadProgress = getMaxDownloadProgress(allDownloads);
    }

    return state;
  }

  /**
   * Use a deep equal here to avoid equality checks in `update`.
   */
  public shouldComponentUpdate(prevState: DownloadListenerState, newState: DownloadListenerState) {
    return !isEqual(prevState, newState);
  }

  public update(prevState: Partial<DownloadListenerState> = {}) {
    const {
      newDownloads,
      downloadsToCancel,
      downloadsToPause,
      downloadsToResume,
      maxDownloadProgress
    } = this.state;

    newDownloads.forEach((download) => this.startDownload(download));

    this.performActionOnDownloads(downloadsToCancel, (item) => item.cancel());
    this.performActionOnDownloads(downloadsToPause, (item) => item.pause());
    this.performActionOnDownloads(downloadsToResume, (item) => {
      if (item.canResume()) item.resume();
    });

    if (maxDownloadProgress &&
      maxDownloadProgress !== prevState.maxDownloadProgress) {
      // Electron uses -1 to hide the progress bar and 2 for indeterminate
      this.mainWindow.setProgressBar(maxDownloadProgress === -1 ? 2 : maxDownloadProgress);
    }
  }

  /**
   * Download the given resource, which will trigger the {@link will-download}
   * event.
   *
   * @param {DownloadInfo} { id, teamId, url } Info about the download
   */
  private startDownload({ id, teamId, url }: DownloadInfo) {
    logger.info('DownloadListener: Starting download for file', id);
    logger.debug(`DownloadListener: (${url})`);

    Store.dispatch(updateDownload({
      id,
      teamId,
      downloadState: 'started'
    }));

    this.urlsToDownload.set(url, { id, teamId });
    this.webContents.downloadURL(url);
  }

  /**
   * Look up this item's team ID + file ID using its URL, set a save path and
   * start tracking updates.
   *
   * @param {Electron.DownloadItem} item The item that started downloading
   */
  private onWillDownloadItem(item: Electron.DownloadItem) {
    const downloadURL = item.getURL();
    const key = this.urlsToDownload.get(downloadURL);
    if (!!key) {
      logger.info('Got will-download event for file', key.id);

      // The file ID should be in the slack-files URL, riiiight?
      assert(downloadURL.includes(key.id));
      this.urlsToDownload.delete(downloadURL);

      this.setUniqueSavePath(item);
      this.trackDownloadItem(key, item);
    } else {
      logger.error('DownloadListener: Got will-download event but found no corresponding URL');
      logger.debug(`DownloadListener: (${downloadURL})`);
    }
  }

  /**
   * Performs an action on a set of download items.
   *
   * @param {Array<DownloadInfo>} downloads The downloads to act on
   * @param {Function} action               The action to take
   */
  private performActionOnDownloads(
    downloads: Array<DownloadInfo>,
    action: (item: Electron.DownloadItem) => void
  ) {
    for (const { id, teamId } of downloads) {
      const item = this.downloadItems.get(id);
      if (item) {
        try {
          action(item);
        } catch (err) {
          logger.error(`DownloadListener: Unable to act on download ${id}, removing it`, err.message);
          this.removeDownload({ id, teamId });
        }
      } else {
        logger.error(`DownloadListener: Missing item for download ${id}, removing it`);
        this.removeDownload({ id, teamId });
      }
    }
  }

  /**
   * Tracks updates to the {@link Electron.DownloadItem} and propagates changes
   * to the store.
   *
   * @param  {DownloadKey}            key   The file ID & team ID
   * @param  {Electron.DownloadItem}  item  The DownloadItem from Electron
   */
  private trackDownloadItem(key: DownloadKey, item: Electron.DownloadItem) {
    this.downloadItems.set(key.id, item);
    logger.info('DownloadListener: Tracking download for', key);

    Store.dispatch(updateDownload({
      ...key,
      downloadState: item.getState(),
      downloadPath: item.getSavePath(),
      requestState: null
    }));

    item.on('updated', (_e: Event, downloadState: string) => {
      if (downloadState === 'interrupted') {
        this.onDownloadCompleted(key, downloadState);
      } else {
        this.onDownloadUpdated(key, item);
      }
    });

    item.on('done', (_e: Event, downloadState: string) => {
      this.onDownloadCompleted(key, downloadState);
    });
  }

  private onDownloadUpdated(key: DownloadKey, item: Electron.DownloadItem) {
    const progress = this.getItemProgress(item);
    logger.debug('Download progress', progress);

    Store.dispatch(updateDownload({
      ...key,
      progress,
      isPaused: item.isPaused()
    }));
  }

  private onDownloadCompleted(key: DownloadKey, downloadState: string) {
    logger.info('Download completed', key, downloadState);
    const item = this.downloadItems.get(key.id);
    this.downloadItems.delete(key.id);

    Store.dispatch(updateDownload({
      ...key,
      downloadState,
      requestState: null,
      endTime: Date.now()
    }));

    if (item && downloadState === 'completed' && process.platform === 'darwin') {
      app.dock.downloadFinished(item.getSavePath());
    }
  }

  private removeDownload(key: DownloadKey) {
    Store.dispatch(removeDownload(key));
    this.downloadItems.delete(key.id);
  }

  /**
   * Sets a unique file path for the given item, potentially appending a (1),
   * (2), etc. if the file already exists. This must be done synchronously to
   * prevent Electron from showing a File Save dialog.
   *
   * @param  {DownloadItem} item The `DownloadItem`
   */
  private setUniqueSavePath(item: Electron.DownloadItem) {
    const fileName = item.getFilename();
    let filePath = path.join(this.state.downloadsDirectory, fileName);

    if (fs.statSyncNoException(this.state.downloadsDirectory)) {
      const extension = path.extname(fileName);
      const baseName = path.basename(fileName, extension);

      // Check for a pre-existing counter to avoid '(1) (1)' situations
      const existingPostfix = baseName.match(/\((\d*)\)$/);
      let counter = existingPostfix ? parseInt(existingPostfix[1], 10) : 1;

      // Keep incrementing the counter until we get a unique filename
      while (fs.statSyncNoException(filePath)) {
        const newFileName = `${baseName} (${counter++})${extension}`;
        filePath = path.join(this.state.downloadsDirectory, newFileName);
      }

      logger.debug('DownloadListener: Saving item at', filePath);
      item.setSavePath(filePath);
    } else {
      logger.warn('DownloadListener: Unable to set save path to', this.state.downloadsDirectory);
    }
  }

  /**
   * Sets up the directory where downloads will be stored. We can't completely
   * rely on `Users\<User>\Downloads` existing, so we may need to create it or
   * (gods forbid) use a temp directory.
   *
   * @param  {string} platform The current platform, e.g., 'win32'
   */
  private initializeDownloadsDirectory(platform: string) {
    let downloadDir = '';

    switch (platform) {
    case 'win32':
      downloadDir = p`${'downloads'}` || p`${'HOME'}/Downloads`;
      break;
    case 'darwin':
      downloadDir = p`${'HOME'}/Downloads`;
      break;
    case 'linux':
      downloadDir = process.env.XDG_DOWNLOAD_DIR || p`${'HOME'}/Downloads`;
      break;
    }

    settingActions.updateSettings({
      PrefSSBFileDownloadPath: downloadDir
    });

    // If the downloads directory somehow doesn't exist, try to create one, then
    // fallback to increasingly worse choices.
    if (!fs.statSyncNoException(downloadDir)) {
      try {
        logger.warn('DownloadListener: No download directory at', downloadDir);
        mkdirp.sync(downloadDir);
      } catch (err) {
        this.tryFallbackDirectories([
          p`${'userDesktop'}`,
          p`${'TEMP'}`
        ]);
      }
    }
  }

  private tryFallbackDirectories(directories: Array<string>) {
    for (const directory of directories) {
      try {
        logger.warn('DownloadListener: Falling back to', directory);
        mkdirp.sync(directory);

        settingActions.updateSettings({
          PrefSSBFileDownloadPath: directory
        });

        return;
      } catch (err) {
        logger.error(`DownloadListener: Unable to create ${directory}`, err.message);
      }
    }
  }

  /**
   * Calculates the progress of an {@link Electron.DownloadItem}.
   *
   * @param  {DownloadItem} item  The `DownloadItem`
   * @return {number}             A number between 0 and 1 describing the download
   *                              progress, or -1 for indeterminate progress
   */
  private getItemProgress(item: Electron.DownloadItem): number {
    return item.getTotalBytes() > 0 ?
      item.getReceivedBytes() / item.getTotalBytes() :
      -1;
  }
}
