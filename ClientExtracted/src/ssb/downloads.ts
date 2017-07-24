/**
 * @module SSBIntegration
 */ /** for typedoc */

import { shell } from 'electron';
import { ReduxComponent } from '../lib/redux-component';
import { Store } from '../lib/store';
import {
  DownloadsList,
  getDownloadById,
  getDownloadsForTeam,
  getDownloadsToClear,
  removeDownload,
  removeDownloads,
  startDownload,
  updateDownload
} from '../reducers/downloads-reducer';

export class DownloadIntegration extends ReduxComponent<DownloadsList> {

  /**
   * Starts a download of the given file resource, or highlight a download that
   * already exists.
   *
   * @param {string} id   The file ID
   * @param {string} url  The URL of the resource
   */
  public startDownload({ id, url }: { id: string, url: string }) {
    const teamId = window.teamId!;
    const item = getDownloadById(Store, { id, teamId });

    if (item) {
      highlightDownload(id, teamId);
    } else {
      Store.dispatch(startDownload({ id, teamId, url }));
    }
  }

  /**
   * Shows a download in the file system. This will open the OS file browser.
   */
  public showDownload(id: string) {
    const item = getDownloadById(Store, { id, teamId: window.teamId! });
    if (item && item.downloadPath) shell.showItemInFolder(item.downloadPath);
  }

  /**
   * Opens a file using the OS.
   */
  public openDownload(id: string) {
    const item = getDownloadById(Store, { id, teamId: window.teamId! });
    if (item && item.downloadPath) shell.openItem(item.downloadPath);
  }

  /**
   * Retries a failed download.
   */
  public retryDownload(id: string) {
    const item = getDownloadById(Store, { id, teamId: window.teamId! });
    if (!item) return;

    Store.dispatch(startDownload({
      id,
      url: item.url,
      teamId: window.teamId,
      startTime: Date.now(),
      downloadState: 'not_started'
    }));
  }

  /**
   * Cancels a download with the given ID.
   */
  public cancelDownload(id: string) {
    Store.dispatch(updateDownload({ id, teamId: window.teamId, requestState: 'cancel' }));
  }

  /**
   * Pauses a download with the given ID.
   */
  public pauseDownload(id: string) {
    Store.dispatch(updateDownload({ id, teamId: window.teamId, requestState: 'pause' }));
  }

  /**
   * Resumes a download with the given ID.
   */
  public resumeDownload(id: string) {
    Store.dispatch(updateDownload({ id, teamId: window.teamId, requestState: 'resume' }));
  }

  /**
   * Removes a download with the given ID.
   */
  public removeDownload(id: string) {
    Store.dispatch(removeDownload({ id, teamId: window.teamId }));
  }

  /**
   * Clears all stopped downloads for this team.
   */
  public clearDownloads() {
    const ids = getDownloadsToClear(Store, window.teamId!).map(({ id }) => id);
    Store.dispatch(removeDownloads(ids));
  }

  /**
   * Keep the webapp in sync with the downloads it cares about.
   *
   * @returns {DownloadsIntegrationState}
   */
  public syncState() {
    return getDownloadsForTeam(Store, window.teamId!);
  }

  /**
   * Only update if our state changed and TSSSB is there.
   */
  public shouldComponentUpdate(prevState: DownloadsList, newState: DownloadsList) {
    if (!window.TSSSB || !window.TSSSB.updateDownloadsView) return false;
    return super.shouldComponentUpdate(prevState, newState);
  }

  /**
   * The webapp component uses our state to render its downloads view. Because
   * of that, we need to tell that component when to re-render.
   */
  public update() {
    window.TSSSB.updateDownloadsView(this.state);
  }
}

/**
 * This is a lulzy workaround to control item highlighting. We don't care to
 * wire up epics here, and we don't have a way to control webapp state without
 * passing a prop.
 */
function highlightDownload(id: string, teamId: string) {
  Store.dispatch(updateDownload({ id, teamId, highlight: true }));

  setTimeout(() => {
    Store.dispatch(updateDownload({ id, teamId, highlight: false }));
  }, 1000);
}
