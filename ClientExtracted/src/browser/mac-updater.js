import {BrowserWindow} from 'electron';
import {Observable} from 'rx';
import connect from 'connect';
import semver from 'semver';
import _ from 'lodash';
import fs from 'fs';
import http from 'http';
import temp from 'temp';
import uuid from 'node-uuid';
import logger from '../logger';
import {channel, version as appVersion} from '../../package.json';
import {requireTaskPool} from 'electron-remote';
import {UPDATE_STATUS} from '../utils/shared-constants';

import AppActions from '../actions/app-actions';
import ReduxComponent from '../lib/redux-component';
import WindowStore from '../stores/window-store';

const {fetchFileOrUrl, downloadFileOrUrl} = requireTaskPool(require.resolve('electron-remote/remote-ajax'));
const isAppStore = (channel === 'mas');

/**
 * This class handles updates via Squirrel for Mac (aka the 'auto-updater'
 * module in Atom Shell). This class is complicated because we create a fake
 * update server for Squirrel to find, so that we can just use S3 for updates.
 */
export default class MacSquirrelUpdater extends ReduxComponent {

  /**
   * Creates an instance of MacSquirrelUpdater
   *
   * @param  {Object} options optional parameters
   *
   * @param  {String} options.version           The version of the local app
   * @param  {Boolean} options.useBetaChannel   If true, use the beta update channel
   * @param  {Number} options.port              The port to create the local HTTP server on
   * @param  {String} options.ssbUpdateUrl      The base URL or path to check updates on
   * @param  {Object} options.autoUpdater       An optional mock implementation of
   *                                            Electron's auto-updater
   */
  constructor(options) {
    super();
    if (isAppStore) return;

    let updateUrl = 'https://slack-ssb-updates.global.ssl.fastly.net/mac_releases';

    // NB: Everyone is on the beta channel right now
    if (options.useBetaChannel || true) updateUrl += '_beta';

    // NB: Bust the cache once on this version to force getting the latest copy
    const VERSION_TO_BUST_CACHE = '2.2.3-beta1';
    this.bustUpdateCache = appVersion === VERSION_TO_BUST_CACHE;

    this.version = options.version;
    this.port = options.port || 10203 + Math.floor(Math.random() * 100);
    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
    this.autoUpdater = options.autoUpdater || require('electron').autoUpdater;
  }

  syncState() {
    return {
      mainWindow: WindowStore.getMainWindow()
    };
  }

  /**
   * Initiates and completes updates.
   * @return {Observable<Boolean>} - An Observable Promise that returns true if
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
      AppActions.setUpdateStatus(UPDATE_STATUS.NONE);
      return false;
    }

    let releases = `${this.ssbUpdateUrl}/releases.json`;

    // NB: Bust the cache on this update file to force getting the latest copy
    if (this.bustUpdateCache) {
      this.bustUpdateCache = false;
      releases += `?v=${uuid.v4()}`;
    }

    logger.info(`Checking for update against ${releases}`);

    // 1. Fetch the update file
    let versionText = await fetchFileOrUrl(releases);
    let versionJson = JSON.parse(versionText);

    // The shape of versionJson is doc'd at http://is.gd/27TbWK, with an extra 'version'
    // field that we can use to find the latest version
    if (versionJson.length < 1) {
      logger.info("Remote version info has no entries?!");
      AppActions.setUpdateStatus(UPDATE_STATUS.NONE);
      return false;
    }

    let newestRemoteUpdate = _.reduce(versionJson, (acc, x) => {
      return (x && x.version && semver.gt(x.version, acc.version)) ? x : acc;
    });

    // 2. Check the version
    if (!newestRemoteUpdate) {
      logger.info("newestRemoteUpdate is null");
      AppActions.setUpdateStatus(UPDATE_STATUS.NONE);
      return false;
    }

    if (!semver.gt(newestRemoteUpdate.version, this.version)) {
      logger.info("We've got the latest version");
      AppActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);
      return false;
    }

    let jsonToServe = Object.assign({}, newestRemoteUpdate, {
      url: `${this.updateServerUrl()}/download`
    });

    // 3. Spin up a server which will serve up fake updates
    let updateServer;
    try {
      updateServer = this.startUpdateServer(jsonToServe, newestRemoteUpdate.url);
      await updateServer.listening;

      let feedUrl = `${this.updateServerUrl()}/json`;
      logger.info('Starting up autoUpdater against the update server');

      // Despite the event name, this also means that the update's started downloading
      Observable.fromEvent(this.autoUpdater, 'update-available').subscribe(() => {
        AppActions.setUpdateStatus(UPDATE_STATUS.DOWNLOADING_UPDATE);
      });

      // 4. Call autoUpdater, wait for it to finish
      this.autoUpdater.setFeedURL(feedUrl);
      this.autoUpdater.checkForUpdates();

      await this.autoUpdaterFinishedEvent(this.autoUpdater).toPromise();
      AppActions.setUpdateStatus(UPDATE_STATUS.UPDATE_DOWNLOADED);
      logger.info('autoUpdater completed successfully');
    } finally {
      updateServer.shutdown();
    }

    return true;
  }

  /**
   * At this point, we've checked for updates and downloaded the available one.
   * This method will quit the app and apply the update.
   */
  forceUpdateAndRestart() {
    let browserWindow = BrowserWindow.fromId(this.state.mainWindow.id);
    browserWindow.exitApp = true;
    this.autoUpdater.quitAndInstall();
  }

  /**
   * Returns the update server URL
   *
   * @return {String}   The update server URL
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
   * @param  {Object} jsonToServe       The JSON to serve on the /json endpoint
   * @param  {String} fileOrUrlToServe  The URL or File to serve on the /download
   *                                    endpoint
   *
   * @return {Object}
   * @return {Object}.listening         A Promise that starts the server, and
   *                                    resolves when the server is listening
   * @return {Object}.shutdown          A method that will shutdown the server
   *
   * @private
   */
  startUpdateServer(jsonToServe, fileOrUrlToServe) {
    let server = null;

    let listening = new Promise((resolve, reject) => {
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

        app.use('/json', (req, res) => {
          logger.info(`Serving up JSON: ${JSON.stringify(jsonToServe)}`);
          res.end(JSON.stringify(jsonToServe));
        });

        logger.info(`Starting fake update server on port ${this.port}`);

        server = http.createServer(app);
        server.listen(this.port, '127.0.0.1');
        server.once('listening', resolve);
      } catch (e) {
        logger.warn(`Couldn't start update server: ${e.message}`);
        reject(e);
      }
    });

    let shutdown = () => {
      logger.info(`Shutting down fake update server on port ${this.port}`);
      if (server) server.close();
    };

    return { listening, shutdown };
  }

  /**
   * Returns an Observable that hooks several Squirrel events and turns them
   * into something that indicates update success.
   *
   * @param  {Object} autoUpdater   The auto-updater to use (typically from Electron)
   * @return {Observable<Boolean>}  An Observable which yields a single value, one of:
   *
   *    true - Squirrel succeeded and applied an update
   *    false - Squirrel succeeded, but did not apply an update
   *    (OnError) - Squirrel failed while trying to download / apply the update
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
