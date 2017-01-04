import semver from 'semver';
import { Observable } from 'rxjs/Observable';

import { logger } from '../logger';
import { fetchURL } from './fetch-url';
import { autoUpdaterFinished } from './updater-utils';
import { nativeInterop } from '../native-interop';

const { is64BitOperatingSystem } = nativeInterop;
const UPDATE_URL_PREFIX = 'https://downloads.slack-edge.com/releases';

export default class WindowsSquirrelUpdater {

  /**
   * Creates an instance of `WindowsSquirrelUpdater`.
   *
   * @param  {Object} options
   * @param  {String} options.version         The version string (i.e. '0.1.2-0f3d3ac')
   * @param  {String} options.ssbUpdateUrl    Used to override the update URL, for testing
   * @param  {String} options.useBetaChannel  True to use the beta release channel
   */
  constructor(options) {
    this.version = options.version.split('-')[0];
    this.autoUpdater = require('electron').autoUpdater;

    let updateUrl = UPDATE_URL_PREFIX;
    if (options.useBetaChannel) updateUrl += '_beta';
    if (is64BitOperatingSystem()) updateUrl += '_x64';

    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
  }

  /**
   * Initiates and completes updates.
   *
   * @return {Observable<Boolean>}  An Observable Promise that returns true if
   *                                an update has been applied, or false if none
   *                                was required.
   */
  checkForUpdates() {
    return Observable.fromPromise(this.isUpdateAvailable())
      .flatMap((updateAvailable) => {
        if (!updateAvailable) return Observable.of(false);

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
  async isUpdateAvailable() {
    let body = await fetchURL(`${this.ssbUpdateUrl}/RELEASES`);

    // A single line from the body looks like:
    // 81D4BED4FD0FC59C3995D0CC8D8B35301D38851D slack-1.8.1-full.nupkg 60556480
    let versions = body.split('\n').map((line) => {
      let filename = line.split(/\s+/)[1];
      if (!filename) return null;

      let nameAndVersion = filename.substring(0, filename.lastIndexOf('-'));
      let version = nameAndVersion.substring(nameAndVersion.lastIndexOf('-') + 1);

      return version;
    });

    let latestVersion = versions.reduce((acc, x) => {
      // NB: At some point we released 0.7.1.1 which causes semver.gt to lose its mind
      if (!semver.valid(x)) return acc;
      return semver.gt(acc, x) ? acc : x;
    }, '0.0.0');

    let updateAvailable = semver.gt(latestVersion, this.version);
    logger.info(`Current version ${this.version} ${updateAvailable ? '<' : '>='} ${latestVersion} Latest available`);
    return updateAvailable;
  }
}
