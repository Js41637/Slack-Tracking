import fs from 'graceful-fs';
import path from 'path';
import winston from 'winston';
import {p} from './get-path';
import promisify from './promisify';

const pfs = promisify(fs);
const isBrowser = process.type === 'browser';
const identifier = process.guestInstanceId ? 'webapp' : process.type;

const LOG_EXPIRY = 30 * 24 * 3600000;

let d;

class Logger {
  constructor({autoPrune=true} = {}) {
    this.logApi = new winston.Logger();

    let {devMode, logFile, logLevel} = this.getLoggerConfiguration();
    logLevel = logLevel || (devMode ? 'debug' : 'info');

    if (devMode) {
      d = require('debug-electron')(`logger:${identifier}`);

      // `debug` occasionally throws exceptions early on because of this method
      d.useColors = () => false;
    } else {
      // In production we only rely on the log files; wipe out `debug`
      d = () => {};
    }

    // %AppData%/Slack/logs on Windows
    // ~/Library/Application Support/Slack/logs on OS X
    // ~/.config/Slack/logs on Linux

    this.logLocation = logFile ?
      path.resolve(path.dirname(logFile)) :
      p`${'userData'}/logs`;

    // NB: On early startup, `userData` may not actually exist yet
    if (!fs.statSyncNoException(this.logLocation)) {
      try {
        require('mkdirp').sync(this.logLocation);
      } catch (error) {
        this.logApi.error(`Unable to create logs directory: ${error}`);
      }
    }

    let uniqueId;
    if (isBrowser) {
      uniqueId = 'browser';
    } else if (process.guestInstanceId) {
      uniqueId = `webapp-${process.guestInstanceId}`;
    } else {
      uniqueId = `renderer-${process.pid}`;
    }

    this.logApi.add(winston.transports.File, {
      level: logLevel,
      filename: path.join(this.logLocation, `${uniqueId}.log`),
      maxsize: 5 * 1048576,
      json: false,
    });

    // NB: If the user specified a log file don't try to clean up anything from
    // that directory.
    if (isBrowser && autoPrune && !logFile) this.pruneLogs();
  }

  /**
   * In the browser process, `loadSettings` isn't defined until `Application`
   * is created. In that case, we'll parse the command line early so we know
   * how to setup the logger.
   *
   * @return {Object}
   * @return {Object}.devMode   True if run in developer mode
   * @return {Object}.logFile   Used by CI machines to override the log location
   * @return {Object}.logLevel  Used to override the default log level
   */
  getLoggerConfiguration() {
    if (!global.loadSettings) {
      let {parseCommandLine} = require('./parse-command-line');
      return parseCommandLine();
    }
    return global.loadSettings;
  }

  debug(message) {
    d(message);
    this.logApi.debug(message);
  }

  info(message) {
    d(message);
    this.logApi.info(message);
  }

  warn(message) {
    d(message);
    this.logApi.warn(message);
  }

  error(message) {
    d(message);
    this.logApi.error(message);
  }

  fatal(message) {
    try {
      throw new Error(message);
    } catch (e) {
      d(e.stack || e.message);
      this.logApi.error(e.stack || e.message);
    }
  }

  /**
   * Returns all log files from the current log location.
   *
   * @return {Array<String>}  An array of absolute paths to log files
   */
  getLogFiles() {
    try {
      return fs.readdirSync(this.logLocation)
        .filter((file) => path.extname(file) === '.log')
        .map((file) => path.join(this.logLocation, file));
    } catch (error) {
      this.logApi.warn(`Unable to retrieve logs: ${error.message}`);
      return [];
    }
  }

  /**
   * Delete logs older than `LOG_EXPIRY`, so we don't leak logs forever and
   * eat users' disk space.
   *
   * @param  {type} clearEverything Optional parameter to clear log file regardless of age
   */
  async pruneLogs(clearEverything = false) {
    let logFiles = this.getLogFiles();

    for (let logFile of logFiles) {
      try {
        let {mtime} = await pfs.stat(logFile);

        let hasLogFileExpired = Date.now() - mtime.getTime() >= LOG_EXPIRY;
        if (hasLogFileExpired || clearEverything) {
          try {
            await pfs.unlink(logFile);
            this.info(`Removed log file at ${logFile}`);
          } catch (err) {
            this.error(`Couldn't remove log file at ${logFile}: ${err}`);
          }
        }
      } catch (err) {
        this.error(`Couldn't stat ${logFile}: ${err}`);
        return;
      }
    }
  }
}

// NB: The logger is a singleton per process
let logger = new Logger();
export {logger as default, Logger};
