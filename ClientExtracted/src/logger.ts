import * as fs from 'graceful-fs';
import * as path from 'path';
import * as winston from 'winston';
import {p} from './get-path';
import {noop} from './utils/noop';
import promisify from './promisify';
import {LoggerConfiguration} from './logger-configuration';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';

const pfs = promisify(fs);
const isBrowser = process.type === 'browser';
const isWebView = !!process.guestInstanceId;
const identifier = isWebView ? 'webview' : process.type;

const LOG_EXPIRY = 30 * 24 * 3600000;

let d: {
  (...args: Array<any>): void;
  useColors: () => boolean;
};

export interface LoggerOptions {
  identifierOverride?: string;
  showTimestamp?: boolean;
  dontSetUpWinston?: boolean;
}

export class Logger {
  public readonly logLocation: string;
  private readonly logApi: winston.LoggerInstance;
  private readonly sub: Subscription;
  private readonly consoleErrorExclusionList: Readonly<Array<string>> = ['Warning: Possible EventEmitter memory leak detected.'];

  /**
   * Creates a new logger instance.
   *
   * @param  {Object} options
   * @param  {Boolean} options.dontSetUpWinston   Winston does weird things in tests, give us a way to disable it
   * @param  {String} options.identifierOverride  Lets us specify the filename for a logger instance
   */
  constructor(options: LoggerOptions = {}) {
    this.logApi = new winston.Logger();

    const {identifierOverride, showTimestamp, dontSetUpWinston} = options;
    const loggerConfig = this.getLoggerConfiguration();
    const {devMode, logFile} = loggerConfig;
    const logLevel = loggerConfig.logLevel || process.env.SLACK_DEBUG_LEVEL || (devMode ? 'debug' : 'info');

    if (devMode) {
      d = require('debug')(`logger:${identifier}`);

      // `debug` occasionally throws exceptions early on because of this method
      d.useColors = () => false;
    } else {
      // In production we only rely on the log files; wipe out `debug`
      d = noop as any;
    }

    /**
     * Windows:   %AppData%/Slack/logs
     * Linux:     ~/.config/Slack/logs
     * macOS DDL: ~/Library/Application Support/Slack/logs
     * macOS MAS: ~/Library/Containers/com.tinyspeck.slackmacgap/Data/Library/Application Support/Slack/logs
     */
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

    let uniqueId: string;
    if (identifierOverride) {
      uniqueId = identifierOverride;
    } else if (isBrowser) {
      uniqueId = 'browser';
    } else if (isWebView) {
      uniqueId = `webview-${process.guestInstanceId}`;
    } else {
      uniqueId = `renderer-${process.pid}`;
      this.hookConsoleError();
    }

    if (!dontSetUpWinston) {
      this.logApi.add(winston.transports.File, {
        level: logLevel,
        timestamp: showTimestamp,
        filename: path.join(this.logLocation, `${uniqueId}.log`),
        maxsize: 5 * 1048576,
        json: false,
      });

      this.sub = new Subscription(() => this.logApi.close());
    } else {
      this.sub = new Subscription();
    }
  }

  public debug(message: string, ...meta: Array<any>): void {
    if (isBrowser) d(message, ...meta);
    this.logApi.debug(message, ...meta);
  }

  public info(message: string, ...meta: Array<any>): void {
    if (isBrowser) d(message, ...meta);
    this.logApi.info(message, ...meta);
  }

  public warn(message: string, ...meta: Array<any>): void {
    if (isBrowser) d(message, ...meta);
    this.logApi.warn(message, ...meta);
  }

  public error(message: string, ...meta: Array<any>): void {
    d(message, ...meta);
    this.logApi.error(message, ...meta);
  }

  public fatal(message: string): void {
    try {
      throw new Error(message);
    } catch (e) {
      d(e.stack || e.message);
      this.logApi.error(e.stack || e.message);
    }
  }

  public unsubscribe(): void {
    this.sub.unsubscribe();
  }

  /**
   * Returns our app log files. The logs will be sorted by
   * modification time, so we'll only grab the most recent `n` files.
   *
   * @param  {Number} days                The oldest modified day to pick up logs.
   * @param  {Function} [transform=null]  An optional function to apply to the Observable
   * @return {Promise<Array<File>>}       A Promise that resolves with an array of Files
   */
  public getMostRecentLogFiles(days: number = 7, transform: Function | null = null): Promise<Array<string>> {
    const transformFunction = transform || (<T>(observable: Observable<T>) => observable);

    type fileObject = { fileName: string, date: number }; //tslint:disable-line:interface-over-type-literal
    const recentLogs = this.getLogFiles()
      .map((file: string) => {
        const stat = fs.statSyncNoException(file);
        const ret = {
          fileName: file,
          date: Number.NaN
        };

        //we do not need accurate date calculation, take rough way to estimate it
        ret.date = (stat && stat.mtime) ? Math.floor((Date.now() - stat.mtime.getTime()) / 86400000) : Number.NEGATIVE_INFINITY;
        return ret;
      }).filter((file: fileObject) => file.date >= 0 && file.date < days)
      .sort((a: fileObject, b: fileObject) => {
        if (a.date === b.date) {
          return 0;
        }
        return a.date < b.date ? -1 : 1;
      }).map((x: fileObject) => x.fileName);

    return transformFunction(Observable.from(recentLogs))
      .catch(() => Observable.of(null))
      .filter((x: string) => !!x && x.length)
      .reduce((acc: Array<string>, file: string) => {
        if (file) acc.push(file);
        return acc;
      }, [])
      .toPromise();
  }

  /**
   * Delete logs older than `LOG_EXPIRY`, so we don't leak logs forever and
   * eat users' disk space.
   *
   * @param  {type} clearEverything Optional parameter to clear log file regardless of age
   */
  public async pruneLogs(clearEverything: boolean = false): Promise<void> {
    const logFiles = this.getLogFiles();

    for (const logFile of logFiles) {
      try {
        const {mtime} = await pfs.stat(logFile);
        const hasLogFileExpired = Date.now() - mtime.getTime() >= LOG_EXPIRY;
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
  private getLoggerConfiguration(): LoggerConfiguration {
    if (!global.loadSettings) {
      const {parseCommandLine} = require('./parse-command-line');
      return parseCommandLine();
    }
    return global.loadSettings;
  }

  /**
   * Returns all log files from the current log location.
   *
   * @return {Array<String>}  An array of absolute paths to log files
   */
  private getLogFiles(): Array<string> {
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
   * Wire console.error messages to logger instance setup, as well as report to bugsnag.
   *
   */
  private hookConsoleError(): void {
    const originalError = console.error;

    console.error = (message?: any, ...args: Array<any>) => {
      try {
        this.error(message, ...args);

        let excludeNotify = false;
        if (message && typeof message === 'string') {
          excludeNotify = this.consoleErrorExclusionList.some((value: string) => (message as string).indexOf(value) !== -1);
        }

        const reporter = window.Bugsnag || global.Bugsnag;
        if (!!reporter && !excludeNotify) {
          const metaData = (!!args && args.length > 0) ?
            args.reduce((acc: {}, value: any, index: number) => {
              acc[index] = value;
              return acc;
            }, {}) : {};
          reporter.notify(message, metaData);
        }
      } catch (e) {
        originalError('could not log console error into logger', e);
      }

      originalError(message, ...args);
    };
  }
}

// NB: The logger is a singleton per process
const logger = new Logger();
export {
  logger
};
