global.shellStartTime = Date.now();

import {app, protocol} from 'electron';
import {channel} from '../../package.json';
import {getMemoryUsage} from '../memory-usage';
import {initializeEvalHandler} from 'electron-remote';
import {parseCommandLine} from '../parse-command-line';
import {parseProtocolUrl} from '../parse-protocol-url';
import {p} from '../get-path';
import {spawn} from 'spawn-rx';
import {createShortcuts, removeShortcuts, removeStartMenuFolder, updateShortcuts} from './squirrel-shortcuts';
import {Observable} from 'rxjs/Observable';

import * as assignIn from 'lodash.assignin';
import {BugsnagReporter} from './bugsnag-reporter';
import * as fs from 'graceful-fs';
import {logger} from '../logger';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import {setupCrashReporter} from '../setup-crash-reporter';
import {getAppId} from '../utils/app-id';

import '../rx-operators';
import '../custom-operators';

protocol.registerStandardSchemes(['slack-resources', 'slack-webapp-dev']);

initializeEvalHandler();

console.log = require('nslog');

/**
 * When our app is installed, Squirrel (our app install/update framework)
 * invokes our executable with specific parameters, usually of the form
 * '--squirrel-$EVENT $VERSION' (i.e. '--squirrel-install 0.1.0'). This is our
 * chance to do custom install / uninstall actions. Once these events are
 * handled, we **must** exit imediately
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

  const defaultLocations = 'Desktop,StartMenu,Startup';

  // NB: Babel currently hates switch + await, /shrug
  if (m[1] === 'install') {
    await createShortcuts(defaultLocations);
  }

  if (m[1] === 'updated') {
    await updateShortcuts(defaultLocations);
  }

  if (m[1] === 'uninstall') {
    app.removeAsDefaultProtocolClient('slack');
    await removeShortcuts(defaultLocations);
    removeStartMenuFolder();

    const taskKill = p`${'SYSTEMROOT'}/system32/taskkill.exe`;
    const args = ['/F', '/IM', 'slack.exe', '/T'];
    await spawn(taskKill, args);
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

  const LocalStorage = require('./local-storage').LocalStorage;
  const localStorage = new LocalStorage();

  const disableGpu = localStorage.getItem('useHwAcceleration') === false;
  if (!disableGpu) return shouldRun;

  if (process.argv.find((x) => !!x.match(/disable-gpu/))) {
    // We've already been relaunched, bye!
    return shouldRun;
  }

  app.relaunch({args: process.argv.slice(1).concat(['--disable-gpu'])});
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
  logger.info(`Got open-url with: ${url}`);

  // If the user is supplying a dev environment using our protocol URL,
  // open-url comes in too late for us to be able to set the user data path.
  // So we need to relaunch ourselves with the URL appended as args.
  if (url.match(/devEnv=(dev\d+)/)) {
    app.relaunch({args: process.argv.slice(1).concat([url])});
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
        const {updateSettings} = require('../actions/setting-actions').settingActions;
        updateSettings({launchedWithLink: url});
      });
  }
}

/**
 * Ensure only a single instance of the app is open and deal with shuffling
 * arguments for deep links, protocol URLs, etc.
 */
function handleSingleInstance(shouldRun: boolean): void {
  // NB: We don't want to mess about with single instance if we're in the
  // process of forking to disable GPU
  if (!shouldRun) {
    app.quit();
    process.exit(0);
  }

  let weAreSecondary = false;

  // NB: If we call makeSingleInstance in the App Store Sandbox, we will
  // instacrash
  if (channel !== 'mas') {
    weAreSecondary = app.makeSingleInstance((cmd) => {
      global.secondaryParamsHandler(cmd);
    });
  }

  app.on('open-url', (e, url) => {
    e.preventDefault();
    handleDeepLinkWhenReady(url);
  });

  if (!shouldRun || weAreSecondary) {
    app.quit();
    process.exit(0);
  }

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
    // Refer to https://github.com/electron/electron/issues/7655 for more info
    app.commandLine.appendSwitch('enable-use-zoom-for-dsf', 'false');

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
  if (process.platform !== 'linux') {
    const newTemp = p`${'userData'}/temp`;

    mkdirp.sync(newTemp);
    app.setPath('temp', newTemp);

    process.env.TMPDIR = newTemp;
    process.env.TMP = newTemp;
  }

  global.loadSettings = args;
  global.reporter = new BugsnagReporter(args.resourcePath, args.devMode);
  global.getMemoryUsage = getMemoryUsage;

  await new Promise((res) => app.on('ready', res));
}

/**
 * Before we create any components that access the store, hydrate the store.
 *
 * @return {Promise}  A Promise indicating completion
 */
async function createBrowserStore() {
  const {Store} = require('../lib/store');
  await Store.loadPersistentState();
  await Store.migrateLegacyState();
}

/**
 * Set our app user model ID and create the Application component, the main
 * browser-side component for the app.
 *
 * @param  {Object} args Contains the command-line arguments
 */
function createSlackApplication(args: any) {
  // Set our AppUserModelId based on the Squirrel shortcut
  if (!process.windowsStore && !args.devMode) app.setAsDefaultProtocolClient('slack');
  if (!process.windowsStore) app.setAppUserModelId(getAppId());

  console.log('Creating Slack Application'); //tslint:disable-line:no-console

  global.reporter.autoNotify(() => {
    let Application = null;

    setupCrashReporter(args);

    if (args.devMode) {
      Application = require(path.join(args.resourcePath, 'src', 'browser', 'application')).default;
    } else {
      Application = require('../browser/application').default;
      process.env.NODE_ENV = 'production';
    }

    global.application = new Application(args);

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
    shouldRun = shouldRun && (process.platform === 'linux' ? handleDisableGpuOnLinux(shouldRun) : true);

    const commandLineArgs = handleSingleInstance(shouldRun);

    await waitForAppReady(commandLineArgs);
    await createBrowserStore();
    createSlackApplication(commandLineArgs);
  } catch (e) {
    console.error(e);
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