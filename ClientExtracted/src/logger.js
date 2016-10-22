import fs from 'fs';
import path from 'path';
import {p} from './get-path';
import winston from 'winston';

const isBrowser = process.type === 'browser';
const identifier = process.guestInstanceId ? 'webapp' : process.type;

// 30 days
const LOG_EXPIRY = 30 * 24 * 3600000;

let d;

class Logger {
  constructor() {
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
    if (!logFile) this.pruneLogs();
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

  /**
   * Delete logs older than `LOG_EXPIRY`, so we don't leak logs forever and eat users' disk space.
   */
  pruneLogs() {
    let logFiles = [];

    try {
      logFiles = fs.readdirSync(this.logLocation)
        .filter((file) => path.extname(file) === '.log');
    } catch(e) {
      this.error(`Couldn't read from logs directory at ${this.logLocation}: ${e}`);
      return;
    }

    for (let logFile of logFiles) {
      let logFilePath = path.join(this.logLocation, logFile);

      try {
        let {mtime} = fs.statSync(logFilePath);

        if (Date.now() - mtime.getTime() >= LOG_EXPIRY) {
          this.info(`Removed log file at ${logFilePath} because it was old`);
          fs.unlink(logFilePath);
        }
      } catch(e) {
        this.error(`Couldn't remove log file at ${logFilePath}: ${e}`);
      }
    }
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
}

// NB: The logger is a singleton per process
let logger = new Logger();
export default logger;
