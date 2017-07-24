/**
 * @module Browser
 */ /** for typedoc */

import { Observable } from 'rxjs/Observable';
import * as semver from 'semver';

import { logger } from '../logger';
import { nativeInterop } from '../native-interop';
import { getLatestReleaseVersion } from '../releases-helpers';
import { UpdateInformation, UpdaterOption } from '../utils/shared-constants';
import { autoUpdaterFinished } from './updater-utils';

const { is64BitOperatingSystem } = nativeInterop;

const UPDATE_URL_PREFIX = 'https://downloads.slack-edge.com/releases';

export class WindowsSquirrelUpdater {
  private version: string;
  private ssbUpdateUrl: string;
  private autoUpdater: Electron.AutoUpdater;

  /**
   * Creates an instance of `WindowsSquirrelUpdater`.
   *
   * @param  {UpdaterOption} options
   * @param  {String} options.version         The version string (i.e. '0.1.2-0f3d3ac')
   * @param  {String} options.ssbUpdateUrl    Used to override the update URL, for testing
   * @param  {String} options.releaseChannel  The release channel to use
   */
  constructor(options: UpdaterOption) {
    this.version = options.version;
    this.autoUpdater = require('electron').autoUpdater;

    let updateUrl = UPDATE_URL_PREFIX;
    if (options.releaseChannel !== 'prod') updateUrl += `_${options.releaseChannel}`;
    if (is64BitOperatingSystem()) updateUrl += '_x64';

    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;

    logger.info(`WindowsUpdater: Created updater with URL ${this.ssbUpdateUrl}`);
  }

  /**
   * Initiates and completes updates.
   *
   * @return {Observable<UpdateInformation | null>}  An Observable to an available update, or null
   */
  public checkForUpdates(): Observable<UpdateInformation | null> {
    return Observable.fromPromise(this.isUpdateAvailable())
      .flatMap((updateAvailable) => {
        if (!updateAvailable) return Observable.of(null);

        this.autoUpdater.setFeedURL(this.ssbUpdateUrl);
        this.autoUpdater.checkForUpdates();

        return autoUpdaterFinished(this.autoUpdater);
      });
  }

  /**
   * On Windows the `autoUpdater` module will show an update available if your
   * current version is greater than the available one. Basically it's looking
   * for an exact version match. To workaround this, we'll do our own update
   * check that pulls down the RELEASES file and checks it.
   *
   * @return {Promise<Boolean>}  A Promise that returns false if our current
   * version is >= than the latest available one, and true otherwise.
   */
  public async isUpdateAvailable(): Promise<boolean> {
    const latestVersion = await getLatestReleaseVersion(`${this.ssbUpdateUrl}/RELEASES`);
    const updateAvailable = semver.gt(latestVersion, this.version);
    logger.info(`WindowsUpdater: Current version ${this.version} ${updateAvailable ? '<' : '>='} ${latestVersion} Latest available`);
    return updateAvailable;
  }
}
