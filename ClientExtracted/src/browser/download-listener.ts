/**
 * @module Browser
 */ /** for typedoc */

import * as fs from 'graceful-fs';
import { ipc } from '../ipc-rx';
import * as mkdirp from 'mkdirp';
import { Observable } from 'rxjs/Observable';
import { p } from '../get-path';
import * as path from 'path';

import { downloadActions } from '../actions/download-actions';
import { downloadStore } from '../stores/download-store';
import { ReduxComponent } from '../lib/redux-component';
import { settingActions } from '../actions/setting-actions';
import { settingStore } from '../stores/setting-store';

const d = require('debug')('downloads:listener');

export interface DownloadListenerState {
  downloadsDirectory: string;
  platform: string;
  cancelDownloadEvent: any;
}
/**
 * Listens for the `will-download` event of the main window's `Session` and
 * propagates {@link DownloadItem} updates to the {@link DownloadStore}. This
 * class must live in the browser process to access `Session`.
 */
export class DownloadListener extends ReduxComponent<DownloadListenerState> {
  private readonly downloadItems: {
    [token: string]: Electron.DownloadItem;
  } = {};
  private readonly webContents: Electron.WebContents;

  constructor(private readonly mainWindow: Electron.BrowserWindow) {
    super();

    if (!this.state.downloadsDirectory) {
      this.initializeDownloadsDirectory(this.state.platform);
      d(`Downloads directory set to ${this.state.downloadsDirectory}`);
    }

    this.webContents = mainWindow.webContents;

    const willDownloadEvent = Observable.fromEvent(
      this.webContents.session, 'will-download',
      (_e: Event, item: Electron.DownloadItem) => this.setUniqueSavePath(item));

    const tokenEvent = ipc.listen('set-download-token');

    // We track downloads using a UUID token, and the `will-download` event
    // from Electron gives us the {DownloadItem}. We need both before we can
    // track a download, so zip them up.
    this.disposables.add(
      Observable.zip<{
        item: Electron.DownloadItem;
        filePath: string;
      }, string>(willDownloadEvent, tokenEvent)
        .subscribe(([downloadEvent, token]) => this.monitorDownload(downloadEvent.item, downloadEvent.filePath, token)));
  }

  public syncState(): DownloadListenerState {
    return {
      platform: settingStore.getSetting<string>('platform'),
      cancelDownloadEvent: downloadStore.getEvent('cancelDownload'),
      downloadsDirectory: settingStore.getSetting<string>('PrefSSBFileDownloadPath')
    };
  }

  public cancelDownloadEvent({ token }: {token: number}): void {
    if (this.downloadItems[token]) {
      d(`Canceling download with ${token}`);
      this.downloadItems[token].cancel();
    } else {
      d(`No download item to cancel for ${token}`);
    }
  }

  /**
   * Sets a unique file path for the given item, potentially appending a (1),
   * (2), etc. if the file already exists. This must be done synchronously to
   * prevent Electron from showing a File Save dialog.
   *
   * @param  {DownloadItem} item The `DownloadItem`
   * @return {Object}      An object containing the original item and its
   * chosen destination path.
   */
  private setUniqueSavePath(item: Electron.DownloadItem): {
    item: Electron.DownloadItem;
    filePath: string;
  } {
    const fileName = item.getFilename();
    let filePath = path.join(this.state.downloadsDirectory, fileName);

    if (fs.statSyncNoException(this.state.downloadsDirectory)) {
      const extension = path.extname(fileName);
      const baseName = path.basename(fileName, extension);
      let counter = 1;

      // Keep incrementing the counter until we get a unique filename.
      while (fs.statSyncNoException(filePath)) {
        filePath = path.join(this.state.downloadsDirectory, `${baseName} (${counter++})${extension}`);
      }

      d(`Saving item at ${filePath}`);
      item.setSavePath(filePath);
    } else {
      d(`Unable to set save path for: ${this.state.downloadsDirectory}`);
    }

    return { item, filePath };
  }

  /**
   * Propagates changes in the `DownloadItem` to the store.
   *
   * @param  {DownloadItem} item  The `DownloadItem`
   * @param  {String} filePath    The destination path for the item
   * @param  {String} token       The token identifying the download
   */
  private monitorDownload(item: Electron.DownloadItem, filePath: string, token: string) {
    d(`Monitoring download at: ${filePath}`);
    this.downloadItems[token] = item;

    downloadActions.downloadStarted({ token, filePath });

    const progressListener = () => {
      this.updateMainWindowProgress();

      const progress = this.getDownloadItemProgress(item);
      d(`Download progress: ${progress}`);
      this.webContents.send('download-progress', { token, progress });
    };

    const finishedListener = (_e: Event, state: any) => {
      item.removeListener('updated', progressListener);
      item.removeListener('done', finishedListener);

      d(`Download finished: ${state}`);
      downloadActions.downloadFinished({ token, state });

      delete this.downloadItems[token];
      this.updateMainWindowProgress();
    };

    item.on('updated', progressListener);
    item.on('done', finishedListener);
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
        d(`No download directory at ${downloadDir}, creating one`);
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
        d(`Falling back to ${directory}`);
        mkdirp.sync(directory);

        settingActions.updateSettings({
          PrefSSBFileDownloadPath: directory
        });

        return;
      } catch (err) {
        d(`Unable to create download directory ${directory}: ${err.message}`);
      }
    }
  }

  /**
   * Maps download progress from Electron to what the webapp expects.
   *
   * @param  {DownloadItem} item The `DownloadItem`
   * @return {number}      A number between 0 and 1 describing the download
   * progress, or -1 for indeterminate progress
   */
  private getDownloadItemProgress(item: Electron.DownloadItem): number {
    return item.getTotalBytes() > 0 ?
      item.getReceivedBytes() / item.getTotalBytes() :
      -1;
  }

  /**
   * Sets taskbar progress to match the maximum in-progress download.
   */
  private updateMainWindowProgress(): void {
    if (this.state.platform === 'darwin') return;
    let maxProgress = -1;

    const downloadItemsKey = this.downloadItems ? Object.keys(this.downloadItems) : [];
    if (downloadItemsKey.length > 0) {
      const itemProgress = downloadItemsKey.map((token) => this.getDownloadItemProgress(this.downloadItems[token]));
      maxProgress = Math.max(...itemProgress);

      // NB: Electron uses -1 to hide the progress bar and 2 for indeterminate,
      // so translate that here
      if (maxProgress === -1) maxProgress = 2;
    }

    this.mainWindow.setProgressBar(maxProgress);
  }
}
