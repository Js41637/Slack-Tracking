import * as connect from 'connect';
import * as semver from 'semver';
import * as fs from 'graceful-fs';
import * as http from 'http';
import * as temp from 'temp';
import * as path from 'path';
import * as runas from 'runas';

import { Observable } from 'rxjs/Observable';
import { requireTaskPool } from 'electron-remote';
import { getCurrentUser } from '../utils/file-helpers';
import { p } from '../get-path';

import { channel } from '../../package.json';
import { fetchURL } from './fetch-url';
import { logger } from '../logger';
import { uniqueId } from '../utils/unique-id';
import { autoUpdaterFinished } from './updater-utils';
import { nativeInterop } from '../native-interop';
import {ReduxComponent} from '../lib/redux-component';

const { getOSVersion } = nativeInterop;
const { downloadFileOrUrl } = requireTaskPool(require.resolve('electron-remote/remote-ajax'));
const isAppStore = channel === 'mas';
const UPDATE_URL_PREFIX = 'https://downloads.slack-edge.com/mac_releases';

const shipItPath = p`${'HOME'}/LibraryCaches/com.tinyspeck.slackmacgap.ShipIt`;

export interface MacSquirrelUpdaterOpts {
  version?: string;
  useBetaChannel?: boolean;
  port?: Number;
  ssbUpdateUrl?: string;
  autoUpdater?: Electron.AutoUpdater;
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
export class MacSquirrelUpdater extends ReduxComponent<Object> {
  private version: string;
  private port: Number;
  private ssbUpdateUrl: string;
  private autoUpdater: Electron.AutoUpdater;
  private bustUpdateCache: boolean;
  private repairFailedDontAskAgain: boolean;

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
  constructor(options: MacSquirrelUpdaterOpts) {
    super();
    if (isAppStore) return;

    // NB: Squirrel.Mac has a brain-dead way to disable itself system-wide
    // for any app using Squirrel. Nerf that shit so hard
    if (process.env.DISABLE_UPDATE_CHECK) {
      delete process.env.DISABLE_UPDATE_CHECK;
    }

    const updateUrl = options.useBetaChannel ?
      `${UPDATE_URL_PREFIX}_beta` :
      UPDATE_URL_PREFIX;

    this.version = options.version || require('../../package.json').version;
    this.port = options.port || 10203 + Math.floor(Math.random() * 100);

    // NB: Revert once we figure out why releases.json is cached so hard
    this.bustUpdateCache = true;
    this.repairFailedDontAskAgain = false;

    this.ssbUpdateUrl = options.ssbUpdateUrl || process.env.SLACK_UPDATE_URL || updateUrl;
    this.autoUpdater = options.autoUpdater || require('electron').autoUpdater;
  }

  /**
   * Initiates and completes updates.
   * @return {Observable<Boolean>} - An Observable Promise that returns true if
   *                                 an update has been applied, or false if none
   *                                 was required.
   */
  public checkForUpdates() {
    return Observable.fromPromise(this.checkForUpdatesAsync());
  }

  /**
   * The async/await implementation of {checkForUpdates}.
   * @return {Promise<Boolean>}
   *
   * @private
   */
  public async checkForUpdatesAsync() {
    if (isAppStore) return false;

    let releases = `${this.ssbUpdateUrl}/releases.json`;

    // NB: Bust the cache on this update file one time, to get the latest
    if (this.bustUpdateCache) {
      this.bustUpdateCache = false;
      releases += `?v=${uniqueId()}`;
    }

    logger.info(`Checking for update against ${releases}`);

    // 1. Fetch the update file
    const versionJson = await fetchURL(releases);
    const versions: Array<MacSquirrelVersionJsonEntry> = JSON.parse(versionJson);

    // The shape of versionJson is doc'd at http://is.gd/27TbWK, with an extra 'version'
    // field that we can use to find the latest version
    if (versions.length < 1) {
      logger.warn('Remote version info has no entries?!');
      return false;
    }

    const newestRemoteUpdate = this.getNewestRemoteUpdate(versions);
    if (!(await this.isUpdateValid(newestRemoteUpdate))) return false;

    logger.info('Checking filesystem permissions before running update');
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
    try {
      updateServer = this.startUpdateServer(jsonToServe, newestRemoteUpdate.url);
      await updateServer.listening;

      const feedUrl = `${this.updateServerUrl()}/json`;
      logger.info('Starting up autoUpdater against the update server');

      // 4. Call autoUpdater, wait for it to finish
      this.autoUpdater.setFeedURL(feedUrl);
      this.autoUpdater.checkForUpdates();

      await autoUpdaterFinished(this.autoUpdater).toPromise();
      logger.info('autoUpdater completed successfully');
    } finally {
      if (updateServer) updateServer.shutdown();
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
      logger.info('newestRemoteUpdate is null');
      return false;
    }

    if (newestRemoteUpdate.supportedOS) {
      const {major, minor, build} = await getOSVersion();
      const osVersion = `${major}.${minor}.${build}`;

      // Don't try updating if we have the latest version, or if the latest update is unsupported
      // on this version of macOS
      try {
        if (!semver.satisfies(osVersion, newestRemoteUpdate.supportedOS)) {
          logger.info("New version available, but it's not supported on this version of macOS");
          return false;
        }
      } catch (e) {
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
   *
   * @private
   */
  private startUpdateServer(jsonToServe: any, fileOrUrlToServe: string) {
    let server: any;

    const listening = new Promise((resolve, reject) => {
      try {
        const app = connect();
        app.use('/download', async (_: http.IncomingMessage, res: http.ServerResponse) => {
          logger.info(`Serving up download: ${fileOrUrlToServe}`);

          const {path} = temp.openSync('update');
          try {
            await downloadFileOrUrl(fileOrUrlToServe, path);
            fs.createReadStream(path).pipe(res);
          } catch (e) {
            res.writeHead(500, e.message);
            res.end();
          }
        });

        app.use('/json', (_: http.IncomingMessage, res: http.ServerResponse) => {
          logger.info(`Serving up JSON: ${JSON.stringify(jsonToServe)}`);
          res.end(JSON.stringify(jsonToServe));
        });

        logger.info(`Starting fake update server on port ${this.port}`);

        server = http.createServer(app);
        server.listen(this.port, '127.0.0.1');
        server.once('listening', () => resolve(true));
      } catch (e) {
        logger.warn(`Couldn't start update server: ${e.message}`);
        reject(e);
      }
    });

    const shutdown = () => {
      logger.info(`Shutting down fake update server on port ${this.port}`);
      if (server) server.close();
    };

    return { listening, shutdown };
  }

  private async repairFilesystemPermissionsIfNecessary(): Promise<void> {
    const {uid, gid} = await getCurrentUser();
    const appUid = fs.lstatSync(process.execPath).uid;

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
