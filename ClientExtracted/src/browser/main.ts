/**
 * @module Browser
 */ /** for typedoc */

global.shellStartTime = Date.now();

import { app, protocol, session } from 'electron';
import { initializeEvalHandler } from 'electron-remote';
import { EventEmitter } from 'events';
import * as fs from 'graceful-fs';
import { assignIn } from 'lodash';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';

import { channel } from '../../package.json';
import { p } from '../get-path';
import { applyLocale } from '../i18n/apply-locale';
import { logger } from '../logger';
import { getMemoryUsage } from '../memory-usage';
import { parseCommandLine } from '../parse-command-line';
import { parseProtocolUrl } from '../parse-protocol-url';
import { setupCrashReporter } from '../setup-crash-reporter';
import { getAppId } from '../utils/app-id';
import { copySmallFileSync } from '../utils/file-helpers';
import { IS_WINDOWS_STORE, persistWhitelist } from '../utils/shared-constants';
import { getSessionId, initializeSessionId } from '../uuid';
import { OsInfo, getLinuxDistro } from '../webapp-shared/linux-distro';
import { BugsnagReporter } from './bugsnag-reporter';
import { localSettings } from './local-storage';
import { onInstall, onUninstall, onUpdate } from './squirrel-event-handlers';
import { traceRecorder } from './trace-recorder';

import '../custom-operators';
import '../rx-operators';

protocol.registerStandardSchemes(['slack-resources', 'slack-webapp-dev']);

// Increase EventEmitter limit: 0 would remove the warning completely, but we
// probably shouldn't have more than a hundred on anything
EventEmitter.defaultMaxListeners = 100;

initializeEvalHandler();

console.log = require('nslog');

/**
 * When our app is installed, Squirrel (our app install/update framework)
 * invokes our executable with specific parameters, usually of the form
 * '--squirrel-$EVENT $VERSION' (i.e. '--squirrel-install 0.1.0'). This is our
 * chance to do custom install / uninstall actions. Once these events are
 * handled, we **must** exit immediately.
 *
 * @return {Promise}  A Promise whose value is a Boolean - if 'true', start the
 * app. If 'false', quit immediately
 */
async function handleSquirrelEvents() {
  if (process.platform === 'linux') return true;

  const options = process.argv.slice(1);
  if (!(options && options.length >= 1)) return true;

  const m = options[0].match(/--squirrel-([a-z]+)/);
  if (!(m && m[1])) return true;

  if (m[1] === 'firstrun') return true;

  logger.info('In Squirrel event: ', m[1]);

  const defaultLocations = 'Desktop,StartMenu';
  const allLocations = 'Desktop,StartMenu,Startup';

  if (m[1] === 'install') {
    await onInstall(defaultLocations);
  } else if (m[1] === 'updated') {
    await onUpdate(defaultLocations);
  } else if (m[1] === 'uninstall') {
    await onUninstall(allLocations);
  }

  return false;
}

/**
 * Linux handles Disable hardware acceleration differently; it requires a
 * command-line switch rather than a window option. By the time we can see the
 * state of the switch it's too late, so we may have to relaunch ourselves.
 *
 * @param  {Bool} shouldRun If true, start the app, if false, quit immediately
 * @return {Bool}           The modified `shouldRun`
 */
function handleDisableGpuOnLinux(shouldRun: boolean): boolean {
  const disableGpu = localSettings.getItem('useHwAcceleration') === false;
  if (!disableGpu) return shouldRun;

  if (process.argv.find((x) => !!x.match(/disable-gpu/))) {
    // We've already been relaunched, bye!
    return shouldRun;
  }

  app.relaunch({ args: process.argv.slice(1).concat(['--disable-gpu']) });
  return false;
}

/**
 * To pass a process-level deep link URL to the application, it needs
 * to exist first. This function accepts a URL and acts on it when the main
 * window has loaded.
 *
 * @param {string} url  The URL from `open-url`
 */
function handleDeepLinkWhenReady(url: string = ''): void {
  logger.info(`Slack received protocol link (slack://), handling when ready`, url);

  // If the user is supplying a dev environment using our protocol URL,
  // open-url comes in too late for us to be able to set the user data path.
  // So we need to relaunch ourselves with the URL appended as args.
  if (url.match(/devEnv=(dev\d+)/)) {
    app.relaunch({ args: process.argv.slice(1).concat([url]) });
  } else {
    // Wait until the application is set up before we touch the Store. Because
    // the component that sends the link to the webapp might not be ready (if
    // the app was launched from a protocol link), we're going to stash this
    // link in the Store.
    Observable.of(true)
      .map(() => {
        if (!global.application) throw new Error('application not available');
        return global.application;
      })
      .retryAtIntervals(20)
      .delay(50)
      .subscribe(() => {
        const { updateSettings } = require('../actions/setting-actions').settingActions;
        updateSettings({ launchedWithLink: url });
      });
  }
}

/**
 * Ensure only a single instance of the app is open and deal with shuffling
 * arguments for deep links, protocol URLs, etc.
 */
function handleSingleInstance(shouldRun: boolean): any {
  // NB: We don't want to mess about with single instance if we're in the
  // process of forking to disable GPU
  if (!shouldRun) {
    app.quit();
    process.exit(0);
  }

  // NB: If we call makeSingleInstance in the App Store Sandbox, we will
  // instacrash
  if (channel !== 'mas') {
    const weAreSecondary = app.makeSingleInstance((commandLine) => {
      logger.info(`Main: Received ${commandLine} from another instance`);
      global.secondaryParamsHandler(commandLine);
    });

    if (weAreSecondary) {
      logger.info('Main: Another instance is running, exiting');
      app.quit();
      process.exit(0);
    }
  }

  app.on('open-url', (e, url) => {
    e.preventDefault();
    handleDeepLinkWhenReady(url);
  });

  const args = parseCommandLine();
  assignIn(args, parseProtocolUrl(args.protoUrl));

  return args;
}

/**
 * Override our temp directory and wait for the app ready event.
 *
 * @param  {Object} args Contains the command-line arguments
 * @return {Promise}  A Promise indicating completion
 */
async function waitForAppReady(args: any): Promise<any> {
  app.commandLine.appendSwitch('disable-pinch');

  if (process.platform === 'win32') {
    // NB: We need to have our own directory in PATH in order to affect DLL
    // search order so that Calls can find the UCRT that's in the same
    // directory as slack.exe
    const ourDir = path.dirname(process.execPath);
    process.env.PATH = `${ourDir};${process.env.PATH}`;
  }

  if (!args.devEnv && !args.devMode) {
    const teamBasedSlackDevMenu = p`${'userData'}/.devMenu`;

    if (fs.statSyncNoException(teamBasedSlackDevMenu)) {
      process.env.SLACK_DEVELOPER_MENU = 'true';
    }
  }

  // NB: Too many people mess with the system Temp directory and constantly are
  // breaking it on Windows. We're gonna use our own instead and dodge like 40
  // bullets.
  // But, we want to use the system Temp directory on Windows Store builds,
  // otherwise we'll end up trapped in a virtualized container.
  if (process.platform !== 'linux' && !IS_WINDOWS_STORE) {
    const newTemp = p`${'userData'}/temp`;

    mkdirp.sync(newTemp);
    app.setPath('temp', newTemp);

    process.env.TMPDIR = newTemp;
    process.env.TMP = newTemp;
  }

  global.loadSettings = args;
  global.reporter = new BugsnagReporter(args.resourcePath, args.devMode);
  global.getMemoryUsage = getMemoryUsage;

  traceRecorder.initializeListener();
  await new Promise((res) => app.once('ready', (e: any) => {
    applyLocale();
    res(e);
  }));
}

/**
 * If on a QA / Dev environment and special tsauth-token is passed then set it
 * on the default session. This allows automation tests to run without hitting
 * Slauth.
 */
function setTsAuthCookie({ tsaToken, devEnv }: { tsaToken: string, devEnv: string }) {
  const chromiumCookie = {
    url: 'https://*.' + devEnv + '.slack.com/',
    name: 'tsa-token',
    value: tsaToken,
    domain: '.slack.com',
    secure: true,
    session: false,
    expirationDate: Date.now() + 3600000
  };

  session.defaultSession!.cookies.set(chromiumCookie, (e) => {
    if (e) {
      throw e;
    } else {
      logger.info('TSAuth cookie set');
    }
  });
}

/**
 * When the app is started for the first time, check if a MAS Application Support directory
 * exists in the Containers folder and if the corresponding DDL folder (which should exist
 * even on first launch, since Logger creates it) has neither an existing 'storage' folder
 * nor an existing 'Local Storage' folder.
 *
 * If so, we take it to mean this is a MAS->DDL migration, so we copy 'Cookies',
 * 'storage/slack-*', and 'Local Storage/*' to the DDL Application Support folder, to migrate
 * teams and logins from MAS to DDL.
 *
 * @return {Boolean}  'true' if a migration occurred. 'false' otherwise.
 */
function migrateMasToDdlIfNeeded(args: any) {
  if (process.platform !== 'darwin') return false;
  if (channel === 'mas') return false;
  if (args.devEnv || args.devMode) return false;

  try {
    const ddlAppDataPath = app.getPath('userData');
    const masAppDataPath = p`${'HOME'}/Library/Containers/com.tinyspeck.slackmacgap/Data/Library/Application Support/Slack`;
    if (fs.existsSync(masAppDataPath)
        && !fs.existsSync(path.join(ddlAppDataPath, 'storage'))
        && !fs.existsSync(path.join(ddlAppDataPath, 'Local Storage'))) {
      copySmallFileSync(path.join(masAppDataPath, 'Cookies'), path.join(ddlAppDataPath, 'Cookies'));
      fs.mkdirSync(path.join(ddlAppDataPath, 'storage'));
      persistWhitelist.forEach((file) => {
        file = path.join('storage', 'slack-' + file);
        if (fs.existsSync(path.join(masAppDataPath, file))) {
          copySmallFileSync(path.join(masAppDataPath, file), path.join(ddlAppDataPath, file));
        }
      });
      fs.mkdirSync(path.join(ddlAppDataPath, 'Local Storage'));
      fs.readdirSync(path.join(masAppDataPath, 'Local Storage')).forEach((file) => {
        file = path.join('Local Storage', file);
        copySmallFileSync(path.join(masAppDataPath, file), path.join(ddlAppDataPath, file));
      });

      return true;
    }
  } catch (e) {
    logger.warn('Failed to migrate MAS to DDL: ', e);
  }
  return false;
}

/**
 * Before we create any components that access the store, hydrate the store.
 *
 * @return {Promise}  A Promise indicating completion
 */
async function createBrowserStore() {
  const { Store } = require('../lib/store');
  await Store.loadPersistentState();
  await Store.migrateLegacyState();
}

async function getLinuxInfo(): Promise<{
  os: string;
  release: string;
  desktopEnvironment?: string;
}> {
  try {
    const osInfo: OsInfo = await getLinuxDistro();
    const { os, release } = osInfo;

    if (!os || !release) throw new Error();

    const desktopEnvironment = process.env.XDG_CURRENT_DESKTOP;
    return {
      os,
      release,
      desktopEnvironment
    };
  } catch (err) {
    logger.error(`Couldn't get Linux distro info`, err);
    return {
      os: '',
      release: '',
      desktopEnvironment: ''
    };
  }
}

/**
 * Set our app user model ID and create the Application component, the main
 * browser-side component for the app.
 *
 * @param  {Object} args Contains the command-line arguments
 */
function createSlackApplication(args: any) {
  // Set our AppUserModelId based on the Squirrel shortcut
  if (!IS_WINDOWS_STORE && !args.devMode) app.setAsDefaultProtocolClient('slack');
  if (!IS_WINDOWS_STORE) app.setAppUserModelId(getAppId());

  console.log('Creating Slack Application'); //tslint:disable-line:no-console

  global.reporter.autoNotify(() => {
    let Application = null;

    setupCrashReporter(args);

    if (args.devMode) {
      Application = require(path.join(args.resourcePath, 'src', 'browser', 'application')).Application;
    } else {
      Application = require('../browser/application').Application;
      process.env.NODE_ENV = 'production';
    }

    global.application = new Application(args);
    if (args.tsaToken && args.devEnv) setTsAuthCookie(args);

    logger.info(`App load time: ${Date.now() - global.shellStartTime}ms`);

    // Clean up much later once the app has started
    setTimeout(() => logger.pruneLogs(), 30 * 1000);
  });
}

/**
 * The main point of entry.
 */
async function main() {
  try {
    let shouldRun = true;
    shouldRun = shouldRun && await handleSquirrelEvents();
    shouldRun = shouldRun &&
      process.platform === 'linux'
        ? handleDisableGpuOnLinux(shouldRun)
        : true;

    const commandLineArgs = handleSingleInstance(shouldRun);

    migrateMasToDdlIfNeeded(commandLineArgs);
    await waitForAppReady(commandLineArgs);
    await createBrowserStore();
    initializeSessionId();
    createSlackApplication({
      ...commandLineArgs,
      sessionId: getSessionId(),
      linux: process.platform === 'linux' && await getLinuxInfo()
    });
  } catch (e) {
    console.error(e); //tslint:disable-line:no-console
    app.quit();
    process.exit(0);
  }

  // Open up DevTools and type:
  //
  // browser = require('electron-remote').createProxyForRemote(null)
  // browser.debugProfiler.startProfiling();
  // browser.debugProfiler.stopProfiling('some-tag');
  let profiler: any = null;
  global.debugProfiler = {
    startProfiling: (...args: Array<any>) => {
      if (!profiler) profiler = require('../utils/profiler');
      profiler.startProfiling(...args);
    },
    stopProfiling: (...args: Array<any>) => {
      if (!profiler) profiler = require('../utils/profiler');
      profiler.stopProfiling(...args);
    },
  };
}

// NB: This will be overwritten by SlackApplication once we start up for reals
global.secondaryParamsReceived = [];
global.secondaryParamsHandler = (cmd: Array<string>) => {
  const newParams = global.secondaryParamsReceived.concat(cmd);
  global.secondaryParamsReceived = newParams;
};

main();
