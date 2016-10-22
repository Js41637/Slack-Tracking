import path from 'path';
import fs from 'fs';
import {spawn} from 'spawn-rx';
import {Observable} from 'rx';
import _ from 'lodash';
import semver from 'semver';
import {is64BitOperatingSystem} from '../native-interop';
import {requireTaskPool} from 'electron-remote';

const {fetchFileOrUrl} = requireTaskPool(require.resolve('electron-remote/remote-ajax'));
import logger from '../logger';

/**
 * This class handles updates via Squirrel for Windows, basically just by
 * spawning a process. Note that this class must method-for-method match
 * `MacSquirrelUpdater` and vice-versa or else we're Gonna Have A Bad Time(tm).
 */
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

    let updateUrl = 'https://slack-ssb-updates.global.ssl.fastly.net/releases';
    if (options.useBetaChannel) updateUrl += '_beta';
    if (is64BitOperatingSystem()) updateUrl += '_x64';

    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
  }

  /**
   * Initiates a check for updates.
   *
   * @return {Observable}  An Observable which produces one of:
   *    true - The update worked, we'll run a new version next execution
   *    false - There were no updates
   *    (OnError) - Something went pear-shaped while checking for updates
   */
  checkForUpdates() {
    logger.info(`Starting check for updates from: ${this.ssbUpdateUrl}`);

    // NB: On Windows, request is using some certificate store that marks S3 as
    // invalid. This is hella shady, but the actual update will be done by C#
    // which will use the HTTPS url.
    return Observable.fromPromise(fetchFileOrUrl(`${this.ssbUpdateUrl.replace(/^https:/i, 'http:')}/RELEASES`)).map((body) => {
      // 81D4BED4FD0FC59C3995D0CC8D8B35301D38851D slack-1.8.1-full.nupkg 60556480
      let versions = _.map(body.split("\n"), (line) => {
        let filename = line.split(/\s+/)[1];
        if (!filename) return null;

        let nameAndVer = filename.substring(0, filename.lastIndexOf('-'));
        let ver = nameAndVer.substring(nameAndVer.lastIndexOf('-') + 1);

        logger.debug(`Found version: ${ver}`);
        return ver;
      });

      let latest = _.reduce(versions, (acc,x) => {
        // NB: At some point we released 0.7.1.1 which causes semver.gt to lose its mind
        if (!semver.valid(x)) return acc;
        logger.debug(`${acc} <=> ${x}`);
        return semver.gt(acc, x) ? acc : x;
      }, this.version);

      logger.info(`Finished manual update, local: ${this.version}, remote: ${latest}`);
      return semver.gt(latest, this.version);
    });
  }

  /**
   * Updates the app but keeps the current version running. The new version
   * will not be started until the next execution.
   *
   * @return {Observable}  An `Observable` signaling completion
   */
  doBackgroundUpdate() {
    return this.spawnUpdateDotExe(['--update', this.ssbUpdateUrl]);
  }

  /**
   * Updates the app and restarts it immediately thereafter
   *
   * @param  {Function} closeApp  A method that will shutdown the app
   */
  forceUpdateAndRestart(closeApp) {
    this.spawnUpdateDotExe(['--update', this.ssbUpdateUrl])
      .flatMap(() =>  {
        logger.debug("Update succeeded, starting new Slack");

        return this.spawnUpdateDotExe(['--processStartAndWait', 'slack.exe'])
          .takeLast(1)
          .timeout(2 * 1000)
          .catch(Observable.return(false));
      })
      .subscribe(
        () => closeApp(),
        (e) => logger.error(`Failed to force update: ${e.message}`));
  }

  /**
   * Maps an Update.exe process into an {Observable}
   *
   * @param  {Array} params Arguments passed to the process
   * @return {Observable}   An `Observable` with a single value, that is the
   * output of the spawned process
   */
  spawnUpdateDotExe(params) {
    let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
    if (!fs.statSyncNoException(updateDotExe)) {
      return Observable.return('');
    }

    return spawn(updateDotExe, params);
  }
}
