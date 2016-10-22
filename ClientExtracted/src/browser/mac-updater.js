import {Disposable, Observable} from 'rx';
import connect from 'connect';
import semver from 'semver';
import _ from 'lodash';
import fs from 'fs';
import http from 'http';
import temp from 'temp';
import logger from '../logger';
import {channel} from '../../package.json';
import {requireTaskPool} from 'electron-remote';

const {fetchFileOrUrl, downloadFileOrUrl} = requireTaskPool(require.resolve('electron-remote/remote-ajax'));
const isAppStore = (channel === 'mas');

/**
 * This class handles updates via Squirrel for Mac (aka the 'auto-updater'
 * module in Atom Shell). This class is complicated because we create a fake
 * update server for Squirrel to find, so that we can just use S3 for updates.
 */
export default class MacSquirrelUpdater {

  /**
   * Creates an instance of MacSquirrelUpdater
   *
   * @param  {object} options - optional parameters
   *
   * @param  {string} options.version - The version of the local app
   * @param  {boolean} options.useBetaChannel - If true, use the beta update channel
   * @param  {number} options.port - The port to create the local HTTP server on
   * @param  {string} options.ssbUpdateUrl - The base URL or path to check updates on
   * @param  {Object} options.autoUpdater - An optional mock implementation of
   *                                        Electron's auto-updater
   */
  constructor(options) {
    if (isAppStore) return;

    let updateUrl = 'https://slack-ssb-updates.global.ssl.fastly.net/mac_releases';

    // NB: Everyone is on the beta channel right now
    if (options.useBetaChannel || true) updateUrl += '_beta';

    this.version = options.version;
    this.port = options.port || 10203 + Math.floor(Math.random() * 100);
    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
    this.autoUpdater = options.autoUpdater || require('electron').autoUpdater;
  }

  /**
   * Initiates and completes updates.
   * @return {Observable<boolean>} - An Observable Promise that returns true if
   *                                 an update has been applied, or false if none
   *                                 was required.
   */
  checkForUpdates() {
    return Observable.fromPromise(this.checkForUpdatesAsync());
  }

  /**
   * The async/await implementation of {checkForUpdates}
   * @return {Promise<boolean>}
   *
   * @private
   */
  async checkForUpdatesAsync() {
    if (isAppStore) {
      return false;
    }

    let releases = `${this.ssbUpdateUrl}/releases.json`;
    logger.info(`Checking for update against ${releases}`);

    // 1. Fetch the update file
    let versionText = await fetchFileOrUrl(releases);
    let versionJson = JSON.parse(versionText);

    // The shape of versionJson is doc'd at http://is.gd/27TbWK, with an extra 'version'
    // field that we can use to find the latest version
    if (versionJson.length < 1) {
      logger.info("Remote version info has no entries?!");
      return false;
    }

    let newestRemoteUpdate = _.reduce(versionJson, (acc, x) => {
      return (x && x.version && semver.gt(x.version, acc.version)) ? x : acc;
    });

    // 2. Check the version
    if (!newestRemoteUpdate) {
      logger.info("newestRemoteUpdate is null");
      return false;
    }

    if (!semver.gt(newestRemoteUpdate.version, this.version)) {
      logger.info("We've got the latest version");
      return false;
    }

    // 3. Spin up a server which will serve up fake updates
    let updateServer = this.startUpdateServer(
        _.extend({}, newestRemoteUpdate, { url: `${this.updateServerUrl()}/download` }),
        newestRemoteUpdate.url)
      .subscribe();

    // 4. Call autoUpdater, wait for it to finish
    let feedUrl = `${this.updateServerUrl()}/json`;
    try {
      let finished = this.autoUpdaterFinishedEvent(this.autoUpdater).toPromise();
      logger.info("Starting up autoUpdater against the update server");

      this.autoUpdater.setFeedURL(feedUrl);
      this.autoUpdater.checkForUpdates();
      await finished;

      logger.info("autoUpdater finished");
    } finally {
      updateServer.dispose();
    }

    return true;
  }

  /**
   * Checks for updates then restarts the application if they succeed.
   * @param  {Function} closeApp - a Function that knows how to close the app,
   *                               usually mapped to `app.quit`
   *
   * @return {Promise} - You'll never see it
   */
  async forceUpdateAndRestart(closeApp) {
    try {
      if (await this.checkForUpdates().toPromise()) {
        this.autoUpdater.quitAndInstall();
        closeApp();
      }
    } catch (e) {
      logger.error(`Failed to force update and restart: ${e.message}`);
      logger.debug(e.stack);
    }
  }

  /**
   * Returns the update server URL
   *
   * @return {String} - The update server URL
   * @private
   */
  updateServerUrl() {
    return `http://localhost:${this.port}`;
  }

  /**
   * Starts an update server that serves out the content that Squirrel expects.
   * Right now this consists of a '/json' endpoint which Squirrel checks to get
   * the download URL to use, and a '/download' endpoint which will serve out
   * the actual data (by proxying it from another source, like a URL or file).
   *
   * @param  {object} jsonToServe - The JSON to serve on the /json endpoint
   * @param  {string} fileOrUrlToServe - The URL or File to serve on the /download
   *                                     endpoint.
   *
   * @return {Observable} - an Observable that *starts* the server when
   * subscribing, then yields a 'true' to indicate the server is started. When
   * the Subscription is disposed, the server will shut down. This means that
   * it's important to dispose, either implicitly via a `take` / `takeUntil` /
   * etc, or explicitly via `dispose`.
   *
   * @private
   */
  startUpdateServer(jsonToServe, fileOrUrlToServe) {
    let server = null;

    return Observable.create((subj) => {
      try {
        let app = connect();
        app.use('/download', async function(req, res) {
          logger.info(`Serving up download: ${fileOrUrlToServe}`);

          let {path} = temp.openSync('update');
          try {
            await downloadFileOrUrl(fileOrUrlToServe, path);
            fs.createReadStream(path).pipe(res);
          } catch (e) {
            res.writeHead(500, e.message);
            res.end();
          }
        });

        app.use('/json', (req,res) => {
          logger.info(`Serving up JSON: ${JSON.stringify(jsonToServe)}`);
          res.end(JSON.stringify(jsonToServe));
        });

        logger.info(`Starting fake update server on port ${this.port}`);

        server = http.createServer(app);
        server.listen(this.port);
        subj.onNext(true);
      } catch (e) {
        logger.warn(`Couldn't start update server: ${e.message}`);
        subj.onError(e);
      }

      return Disposable.create(() => {
        logger.info(`Shutting down fake update server on port ${this.port}`);
        if (server) server.close();
      });
    });
  }

  /**
   * Returns an Observable that hooks several Squirrel events and turns them
   * into something that indicates update success.
   *
   * @param  {object} autoUpdater - the auto-updater to use (usually
   *                                this.autoUpdater)
   * @return {Observable<boolean>} - an Observable which yields a single value, one of:
   *                                 	true - Squirrel succeeded and applied an
   *                                 				 update
   *                                 	false - Squirrel succeeded, but did
   *                                 					not apply an update
   *                                 	(OnError) - Squirrel failed while trying
   *                                 							to download / apply the update
   */
  autoUpdaterFinishedEvent(autoUpdater) {
    let notAvailable = Observable.fromEvent(autoUpdater, 'update-not-available').map(() => false);
    let downloaded = Observable.fromEvent(autoUpdater, 'update-downloaded').map(() => true);
    let error = Observable.fromEvent(autoUpdater, 'error').flatMap((e) => {
      logger.info(e);
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
}
