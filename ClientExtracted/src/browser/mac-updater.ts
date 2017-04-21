/**
 * @module Browser
 */ /** for typedoc */

import * as connect from 'connect';
import * as semver from 'semver';
import * as fs from 'graceful-fs';
import * as http from 'http';
import * as temp from 'temp';
import * as path from 'path';
import * as runas from 'runas';

import { Observable } from 'rxjs/Observable';
import { getCurrentUser } from '../utils/file-helpers';
import { p } from '../get-path';

import { channel } from '../../package.json';
import { fetchURL, downloadURL } from './fetch-url';
import { logger } from '../logger';
import { uniqueId } from '../utils/unique-id';
import { autoUpdaterFinished } from './updater-utils';
import { nativeInterop } from '../native-interop';
import { ReduxComponent } from '../lib/redux-component';
import { Credentials, UpdaterOption, UpdateInformation } from '../utils/shared-constants';

const { getOSVersion } = nativeInterop;
const isAppStore = channel === 'mas';
const UPDATE_URL_PREFIX = 'https://downloads.slack-edge.com/mac_releases';

const shipItPath = p`${'HOME'}/Library/Caches/com.tinyspeck.slackmacgap.ShipIt`;

export interface MacSquirrelUpdaterOption extends UpdaterOption {
  port: number;
  autoUpdater: Electron.AutoUpdater;
};

export interface MacSquirrelVersionJsonEntry {
  url: string;
  version: string;

  name?: string;
  notes?: string;
  pub_date?: string;
  supportedOS?: string;
}

/**
 * This class handles updates via Squirrel for Mac (aka the 'auto-updater'
 * module in Atom Shell). This class is complicated because we create a fake
 * update server for Squirrel to find, so that we can just use S3 for updates.
 */
export class MacSquirrelUpdater extends ReduxComponent<MacSquirrelUpdaterOption> {
  private version: string;
  private port: number;
  private credentials?: Credentials;
  private ssbUpdateUrl: string;
  private autoUpdater: Electron.AutoUpdater;
  private bustUpdateCache: boolean;
  private repairFailedDontAskAgain: boolean;

  /**
   * Creates an instance of MacSquirrelUpdater
   *
   * @param  {MacSquirrelUpdaterOption} options
   * @param  {String}   options.version         The version of the local app
   * @param  {Boolean}  options.releaseChannel  The release channel to use
   * @param  {Number}   options.port            The port to create the local HTTP server on
   * @param  {String}   options.ssbUpdateUrl    The base URL or path to check updates on
   * @param  {Object}   options.autoUpdater     An optional implementation of Electron's autoUpdater
   */
  constructor(options: MacSquirrelUpdaterOption) {
    super();
    if (isAppStore) return;

    // NB: Updaters gonna update
    // Prevents Squirrel.Mac from being disabled system-wide
    if (process.env.DISABLE_UPDATE_CHECK) {
      delete process.env.DISABLE_UPDATE_CHECK;
    }

    const updateUrl = options.releaseChannel !== 'prod' ?
      `${UPDATE_URL_PREFIX}_${options.releaseChannel}` :
      UPDATE_URL_PREFIX;

    this.version = options.version || require('../../package.json').version;
    this.port = options.port || 10203 + Math.floor(Math.random() * 100);

    // NB: Revert once we figure out why releases.json is cached so hard
    this.bustUpdateCache = true;
    this.repairFailedDontAskAgain = false;

    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
    this.autoUpdater = options.autoUpdater || require('electron').autoUpdater;
    this.credentials = options.credentials;

    logger.info(`MacUpdater: Created updater with URL ${this.ssbUpdateUrl}`);
  }

  /**
   * Initiates and completes updates.
   *
   * @return {Observable<UpdateInformation | null>}  An Observable to an available update, or null
   */
  public checkForUpdates(): Observable<UpdateInformation | null> {
    return Observable.fromPromise(this.checkForUpdatesAsync());
  }

  /**
   * The async/await implementation of {checkForUpdates}.
   *
   * @return {Promise<UpdateInformation | null>}  The available update, or null
   */
  public async checkForUpdatesAsync() {
    if (isAppStore) return null;

    let releases = `${this.ssbUpdateUrl}/releases.json`;

    // NB: Bust the cache on this update file one time, to get the latest
    if (this.bustUpdateCache) {
      this.bustUpdateCache = false;
      releases += `?v=${uniqueId()}`;
    }

    logger.info(`Mac Updater: Checking for update.`, releases);

    // 1. Fetch the update file
    const versionJson = await fetchURL(releases, this.credentials);
    const versions: Array<MacSquirrelVersionJsonEntry> = JSON.parse(versionJson);

    // The shape of versionJson is doc'd at http://is.gd/27TbWK, with an extra 'version'
    // field that we can use to find the latest version
    if (versions.length < 1) {
      logger.warn('Mac Updater: Remote version info has no entries?!');
      return null;
    }

    const newestRemoteUpdate = this.getNewestRemoteUpdate(versions);
    if (!(await this.isUpdateValid(newestRemoteUpdate))) return null;

    logger.info('Mac Updater: Checking filesystem permissions before running update.');
    try {
      if (!this.repairFailedDontAskAgain) await this.repairFilesystemPermissionsIfNecessary();
    } catch (e) {
      this.repairFailedDontAskAgain = true;
      throw e;
    }

    const jsonToServe = {
      url: `${this.updateServerUrl()}/download`,
      ...newestRemoteUpdate
    };

    // 3. Spin up a server which will serve up fake updates
    let updateServer;
    let result;
    try {
      updateServer = this.startUpdateServer(jsonToServe, newestRemoteUpdate.url);
      await updateServer.listening;

      const feedUrl = `${this.updateServerUrl()}/json`;
      logger.info('Mac Updater: Starting up autoUpdater against the update server.');

      // 4. Call autoUpdater, wait for it to finish
      this.autoUpdater.setFeedURL(feedUrl);
      this.autoUpdater.checkForUpdates();

      result = await autoUpdaterFinished(this.autoUpdater).toPromise();
      logger.info('Mac Updater: autoUpdater completed successfully.');
    } finally {
      if (updateServer) updateServer.shutdown();
    }

    return result;
  }

  /**
   * Finds the latest update from a list of all available releases.
   *
   * @param {Object[]} versionJson     An array of objects parsed from a releases manifest file.
   *
   * @return {Object}
   */
  public getNewestRemoteUpdate(versionJson: Array<any>): MacSquirrelVersionJsonEntry {
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
  public async isUpdateValid(newestRemoteUpdate: MacSquirrelVersionJsonEntry): Promise<boolean> {
    if (!newestRemoteUpdate) {
      logger.info('Mac Updater: newestRemoteUpdate is null.');
      return false;
    }

    if (newestRemoteUpdate.supportedOS) {
      const { major, minor, build } = await getOSVersion();
      const osVersion = `${major}.${minor}.${build}`;

      // Don't try updating if we have the latest version, or if the latest update is unsupported
      // on this version of macOS
      try {
        if (!semver.satisfies(osVersion, newestRemoteUpdate.supportedOS)) {
          logger.info(`Mac Updater: New version available, but it's not supported on this version of macOS.`);
          return false;
        }
      } catch (e) {
        logger.error(`Mac Updater: Something went wrong when checking the user's current OS against the supported OS version range.`, e);
        return false;
      }
    }

    // Check the version
    if (!semver.gt(newestRemoteUpdate.version, this.version)) {
      logger.info(`Mac Updater: We've got the latest version.`);
      return false;
    }

    return true;
  }

  /**
   * Returns the update server URL
   *
   * @return {String}   The update server URL
   */
  public updateServerUrl() {
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
   */
  public startUpdateServer(jsonToServe: any, fileOrUrlToServe: string) {
    let server: any;

    const listening = new Promise((resolve, reject) => {
      try {
        const app = connect();
        app.use('/download', async (_: http.IncomingMessage, res: http.ServerResponse) => {
          logger.info(`Mac Updater: Serving up download: ${fileOrUrlToServe}.`);

          const { path } = temp.openSync('update');
          try {
            await downloadURL(fileOrUrlToServe, path, this.credentials);
            fs.createReadStream(path).pipe(res);
          } catch (e) {
            res.writeHead(500, e.message);
            res.end();
          }
        });

        app.use('/json', (_: http.IncomingMessage, res: http.ServerResponse) => {
          logger.info(`Mac Updater: Serving up JSON:`, jsonToServe);
          res.end(JSON.stringify(jsonToServe));
        });

        logger.info(`Mac Updater: Starting fake update server on port ${this.port}.`);

        server = http.createServer(app);
        server.listen(this.port, '127.0.0.1');
        server.once('listening', () => resolve(true));
      } catch (e) {
        logger.warn(`Mac Updater: Couldn't start update server.`, e);
        reject(e);
      }
    });

    const shutdown = () => {
      logger.info(`Mac Updater: Shutting down fake update server on port ${this.port}.`);
      if (server) server.close();
    };

    return { listening, shutdown };
  }

  private async repairFilesystemPermissionsIfNecessary(): Promise<void> {
    const { uid, gid } = await getCurrentUser();

    let appUid: number = Number.NaN;
    try {
      appUid = fs.lstatSync(process.execPath).uid;
    } catch (e) {
      logger.error(`MacUpdater: Failed to acquire process uid at ${process.execPath}, bail out`, e);
      return;
    }

    // NB: This path may or may not exist
    let shipItIsBorked;
    try {
      shipItIsBorked = fs.lstatSync(shipItPath).uid !== uid;
    } catch (e) {
      shipItIsBorked = false;
    }

    if (!shipItIsBorked && uid === appUid) {
      return;
    }

    const ourAppDir = path.resolve(path.dirname(process.resourcesPath), '..', '..');
    const args = ['-R', `${uid}:${gid}`, ourAppDir];
    if (shipItIsBorked) args.push(shipItPath);

    const { exitCode, stdout } = runas('/usr/sbin/chown', args, { admin: true, catchOutput: true });
    if (exitCode !== 0) throw new Error(stdout);
  }
}
