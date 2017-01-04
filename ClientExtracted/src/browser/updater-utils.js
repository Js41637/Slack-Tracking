  /*eslint no-unused-vars:0 */

import {Observable} from 'rxjs/Observable';

import {logger} from '../logger';
import {appActions} from '../actions/app-actions';
import {UPDATE_STATUS} from '../utils/shared-constants';

/**
 * Returns an Observable that hooks several Squirrel events and turns them
 * into something that indicates update success.
 *
 * @param  {Object} autoUpdater   The auto-updater to use (typically from Electron)
 * @return {Observable<Object>}  An Observable which yields a single value, one of:
 *
 *    Object - Contains details about the downloaded release
 *    null - No update was available
 *    (OnError) - We failed while trying to download or apply the update
 */
export function autoUpdaterFinished(autoUpdater) {
  let notAvailable = Observable.fromEvent(autoUpdater, 'update-not-available').mapTo(null);
  let downloaded = Observable.fromEvent(autoUpdater, 'update-downloaded', updateDownloadedSelector);
  let error = Observable.fromEvent(autoUpdater, 'error').flatMap((e) => {
    logger.info(e.message);
    logger.info(e.stack);

    return Observable.throw(e);
  });

  let ret = Observable.merge(notAvailable, downloaded, error)
    .take(1)
    .publishLast();

  ret.connect();
  return ret;
}

/**
 * Returns arguments to create a menu item based on the current update status.
 *
 * @param  {String} updateStatus  The current update status
 * @return {Object}               Arguments for creating a {MenuItem}
 */
export function getMenuItemForUpdateStatus(updateStatus) {
  switch (updateStatus) {
  case UPDATE_STATUS.CHECKING_FOR_UPDATE:
  case UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL:
    return {
      label: 'Checking for Update',
      enabled: false
    };
  case UPDATE_STATUS.DOWNLOADING_UPDATE:
    return {
      label: 'Downloading Update',
      enabled: false
    };
  case UPDATE_STATUS.UPDATE_AVAILABLE:
    return {
      label: 'An Update Is Available',
      enabled: false
    };
  case UPDATE_STATUS.UPDATE_DOWNLOADED:
    return {
      label: 'Restart to Apply Update',
      enabled: true,
      click: () => appActions.setUpdateStatus(UPDATE_STATUS.RESTART_TO_APPLY)
    };
  case UPDATE_STATUS.NONE:
  case UPDATE_STATUS.UP_TO_DATE:
  case UPDATE_STATUS.ERROR:
  default:
    return {
      label: 'Check for Updates…',
      enabled: true,
      click: () => appActions.checkForUpdate()
    };
  }
}

/**
 * Returns the appropriate release notes URL for the current platform and
 * release channel.
 *
 * @param  {Bool} isBetaChannel True if on the beta release channel
 * @return {String}             The release notes URL
 */
export function getReleaseNotesUrl(isBetaChannel) {
  let url = 'https://www.slack.com/apps/';
  switch (process.platform) {
  case 'win32': url += 'windows'; break;
  case 'darwin': url += 'mac'; break;
  case 'linux': url += 'linux'; break;
  }
  url += isBetaChannel ? '/release-notes-beta' : '/release-notes';
  return url;
}

function updateDownloadedSelector(e, releaseNotes, releaseName, releaseDate, updateURL) {
  return { releaseNotes, releaseName, releaseDate };
}
