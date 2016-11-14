import { Observable } from 'rxjs/Observable';
import connect from 'connect';
import semver from 'semver';
import fs from 'fs';
import http from 'http';
import temp from 'temp';
import uuid from 'node-uuid';

import logger from '../logger';
import ReduxComponent from '../lib/redux-component';

import { autoUpdaterFinished } from './updater-utils';
import { channel } from '../../package.json';
import { requireTaskPool } from 'electron-remote';
import { getOSVersion } from '../native-interop';

const { fetchFileOrUrl, downloadFileOrUrl } = requireTaskPool(require.resolve('electron-remote/remote-ajax'));
const isAppStore = channel === 'mas';

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

    if (options.useBetaChannel) updateUrl += '_beta';

    this.version = options.version;
    this.port = options.port || 10203 + Math.floor(Math.random() * 100);

    // NB: Revert once we figure out why releases.json is cached so hard
    this.bustUpdateCache = true;

    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
    this.autoUpdater = options.autoUpdater || require('electron').autoUpdater;
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
   * The async/await implementation of {checkForUpdates}.
   * @return {Promise<Boolean>}
   *
   * @private
   */
  async checkForUpdatesAsync() {
    if (isAppStore) return false;

    let releases = `${this.ssbUpdateUrl}/releases.json`;

    // NB: Bust the cache on this update file one time, to get the latest
    if (this.bustUpdateCache) {
      this.bustUpdateCache = false;
      releases += `?v=${uuid.v4()}`;
    }

    logger.info(`Checking for update against ${releases}`);

    // 1. Fetch the update file
    let versionJson;
    try {
      let versionText = await fetchFileOrUrl(releases);
      versionJson = JSON.parse(versionText);
    } catch (error) {
      logger.warn(`Unable to download ${releases}: ${error.message}`);
      return false;
    }

    // The shape of versionJson is doc'd at http://is.gd/27TbWK, with an extra 'version'
    // field that we can use to find the latest version
    if (versionJson.length < 1) {
      logger.warn('Remote version info has no entries?!');
      return false;
    }

    let newestRemoteUpdate = this.getNewestRemoteUpdate(versionJson);
    if (!(await this.isUpdateValid(newestRemoteUpdate))) return false;

    let jsonToServe = {
      url: `${this.updateServerUrl()}/download`,
      ...newestRemoteUpdate
    };

    // 3. Spin up a server which will serve up fake updates
    let updateServer;
    try {
      updateServer = this.startUpdateServer(jsonToServe, newestRemoteUpdate.url);
      await updateServer.listening;

      let feedUrl = `${this.updateServerUrl()}/json`;
      logger.info('Starting up autoUpdater against the update server');

      // 4. Call autoUpdater, wait for it to finish
      this.autoUpdater.setFeedURL(feedUrl);
      this.autoUpdater.checkForUpdates();

      await autoUpdaterFinished(this.autoUpdater).toPromise();
      logger.info('autoUpdater completed successfully');
    } finally {
      updateServer.shutdown();
    }

    return true;
  }

  /**
   * Finds the latest update from a list of all available releases.
   *
   * @param {Object[]} versionJson     An array of objects parsed from a releases manifest file.
   *
   * @return {Object}
   */
  getNewestRemoteUpdate(versionJson) {
    return versionJson.reduce((acc, x) => {
      return (x && x.version && semver.gt(x.version, acc.version)) ? x : acc;
    });
  }

  /**
   * Checks to see if the updater should report that an update's available (and proceed with the
   * update)
   *
   * @param {Object} newestRemoteUpdate     The latest update available from
   *                                        {@link MacSquirrelUpdater#getNewestRemoteUpdate}
   * @return {Promise<Boolean>}
   */
  async isUpdateValid(newestRemoteUpdate) {
    if (!newestRemoteUpdate) {
      logger.info('newestRemoteUpdate is null');
      return false;
    }

    if (newestRemoteUpdate.supportedOS) {
      let {major, minor, build} = await getOSVersion();
      let osVersion = `${major}.${minor}.${build}`;

      // Don't try updating if we have the latest version, or if the latest update is unsupported
      // on this version of macOS
      try {
        if (!semver.satisfies(osVersion, newestRemoteUpdate.supportedOS)) {
          logger.info("New version available, but it's not supported on this version of macOS");
          return false;
        }
      } catch(e) {
        logger.error(`Something went wrong when checking the user's current OS against the supported OS version range: ${e}`);
        return false;
      }
    }

    // Check the version
    if (!semver.gt(newestRemoteUpdate.version, this.version)) {
      logger.info("We've got the latest version");
      return false;
    }

    return true;
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
}
