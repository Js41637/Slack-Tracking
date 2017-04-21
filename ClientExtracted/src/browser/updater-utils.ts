/**
 * @module Browser
 */ /** for typedoc */

import { Observable } from 'rxjs/Observable';

import { logger } from '../logger';
import { appActions } from '../actions/app-actions';
import { UPDATE_STATUS, updateStatusType, UpdateInformation } from '../utils/shared-constants';

import { intl as $intl, LOCALE_NAMESPACE } from '../i18n/intl';

/**
 * Returns an Observable that hooks several Squirrel events and turns them
 * into something that indicates update success.
 *
 * @param  {Object} autoUpdater             The auto-updater to use (typically from Electron)
 * @return {Observable<UpdateInformation>}  An Observable which yields a single value, one of:
 *
 *    UpdateInformation - Contains details about the downloaded release
 *    null - No update was available
 *    (OnError) - We failed while trying to download or apply the update
 */
export function autoUpdaterFinished(autoUpdater: Electron.AutoUpdater): Observable<UpdateInformation | null> {
  const notAvailable = Observable.fromEvent(autoUpdater, 'update-not-available').mapTo(null);
  const downloaded = Observable.fromEvent(autoUpdater, 'update-downloaded', updateDownloadedSelector);
  const error = Observable.fromEvent(autoUpdater, 'error').flatMap((e: Error) => {
    logger.info(e.message);
    logger.info(e.stack!);

    return Observable.throw(e);
  });

  const ret = Observable.merge(notAvailable, downloaded, error)
    .take(1)
    .publishLast();

  ret.connect();
  return ret;
}

/**
 * Returns arguments to create a menu item based on the current update status.
 *
 * @param  {String} updateStatus  The current update status
 * @return {MenuItemOptions}      Arguments for creating a {Electron.MenuItem}
 */
export function getMenuItemForUpdateStatus(updateStatus: updateStatusType): Electron.MenuItemOptions {
  switch (updateStatus) {
  case UPDATE_STATUS.CHECKING_FOR_UPDATE:
  case UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL:
    return {
      label: $intl.t(`Checking for Update`, LOCALE_NAMESPACE.MENU)(),
      enabled: false
    };
  case UPDATE_STATUS.DOWNLOADING_UPDATE:
    return {
      label: $intl.t(`Downloading Update`, LOCALE_NAMESPACE.MENU)(),
      enabled: false
    };
  case UPDATE_STATUS.UPDATE_AVAILABLE:
    return {
      label: $intl.t(`An Update Is Available`, LOCALE_NAMESPACE.MENU)(),
      enabled: false
    };
  case UPDATE_STATUS.UPDATE_DOWNLOADED:
    return {
      label: $intl.t(`Restart to Apply Update`, LOCALE_NAMESPACE.MENU)(),
      enabled: true,
      click: () => appActions.setUpdateStatus(UPDATE_STATUS.RESTART_TO_APPLY)
    };
  case UPDATE_STATUS.NONE:
  case UPDATE_STATUS.UP_TO_DATE:
  case UPDATE_STATUS.ERROR:
  default:
    return {
      label: $intl.t(`&Check for Updates…`, LOCALE_NAMESPACE.MENU)(),
      enabled: true,
      click: () => appActions.checkForUpdate()
    };
  }
}

/**
 * Returns the appropriate release notes URL for the current platform and
 * release channel.
 *
 * @param  {Bool} isPreRelease  True if on the alpha or beta channel
 * @return {String}             The release notes URL
 */
export function getReleaseNotesUrl(isPreRelease: boolean): string {
  let url = 'https://www.slack.com/apps/';
  switch (process.platform) {
  case 'win32': url += 'windows'; break;
  case 'darwin': url += 'mac'; break;
  case 'linux': url += 'linux'; break;
  }
  url += isPreRelease ? '/release-notes-beta' : '/release-notes';
  return url;
}

function updateDownloadedSelector(_e: Error, releaseNotes: string, releaseName: string, releaseDate: Date, _updateURL: string): UpdateInformation {
  return { releaseNotes, releaseName, releaseDate };
}
