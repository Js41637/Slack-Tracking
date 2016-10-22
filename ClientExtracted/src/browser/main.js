global.shellStartTime = Date.now();

import {app, protocol} from 'electron';
import {channel} from '../../package.json';
import {getMemoryUsage} from '../memory-usage';
import {initializeEvalHandler} from 'electron-remote';
import {parseCommandLine} from '../parse-command-line';
import {parseProtocolUrl} from '../parse-protocol-url';
import {p} from '../get-path';
import {spawn} from 'spawn-rx';
import {createShortcuts, removeShortcuts, updateShortcuts} from './squirrel-shortcuts';

import _ from 'lodash';
import BugsnagReporter from './bugsnag-reporter';
import fs from 'fs';
import logger from '../logger';
import mkdirp from 'mkdirp';
import path from 'path';
import setupCrashReporter from '../setup-crash-reporter';
import WindowHelpers from '../components/helpers/window-helpers';

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
  let options = process.argv.slice(1);

  if (!(options && options.length >= 1)) return true;

  let m = options[0].match(/--squirrel-([a-z]+)/);
  if (!(m && m[1])) return true;

  if (m[1] === 'firstrun') return true;

  let defaultLocations = 'Desktop,StartMenu,Startup';

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

    let taskKill = p`${'SYSTEMROOT'}/system32/taskkill.exe`;
    let args = ['/F', '/IM', 'slack.exe', '/T'];
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
function handleDisableGpuOnLinux(shouldRun) {
  if (!shouldRun || process.platform !== 'linux') return shouldRun;

  let LocalStorage = require('./local-storage');
  let localStorage = new LocalStorage();

  let disableGpu = localStorage.getItem('useHwAcceleration') === false;
  if (!disableGpu) return shouldRun;

  if (_.find(process.argv, (x) => x.match(/disable-gpu/))) {
    // We've already been relaunched, bye!
    return shouldRun;
  }

  app.relaunch({args: process.argv.slice(1) + ['--disable-gpu']});
  return false;
}

/**
 * Ensure only a single instance of the app is open and deal with shuffling
 * arguments for deep links, protocol URLs, etc.
 */
function handleSingleInstance(shouldRun) {
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
    logger.info(`Got open-url with: ${url}`);

    // NB: If the user is supplying a dev environment using our protocol URL,
    // open-url comes in too late for us to be able to set the user data path.
    // So we need to relaunch ourselves with the URL appended as args.
    if (url.match(/devEnv=(dev\d+)/)) {
      app.relaunch({args: process.argv.slice(1) + [url]});
    } else {
      // NB: We can't hit the store from here, so we have to reach into
      // `Application` directly
      global.application.handleDeepLinkEvent({url});
      if (global.application.mainWindow) {
        WindowHelpers.bringToForeground(global.application.mainWindow);
      }
    }
  });

  if (!shouldRun || weAreSecondary) {
    app.quit();
    process.exit(0);
  }

  let args = parseCommandLine();
  _.extend(args, parseProtocolUrl(args.protoUrl));

  protocol.registerStandardSchemes(['slack-resources', 'slack-webapp-dev']);

  return args;
}

/**
 * Override our temp directory and wait for the app ready event.
 *
 * @param  {Object} args Contains the command-line arguments
 */
function startTheAppOnReady(args) {
  app.commandLine.appendSwitch('disable-pinch');

  if (!args.devEnv && !args.devMode) {
    let teamBasedSlackDevMenu = p`${'userData'}/.devMenu`;

    if (fs.statSyncNoException(teamBasedSlackDevMenu)) {
      process.env.SLACK_DEVELOPER_MENU = 'true';
    }
  }

  // NB: Too many people mess with the system Temp directory and constantly are
  // breaking it on Windows. We're gonna use our own instead and dodge like 40
  // bullets.
  if (process.platform !== 'linux') {
    let newTemp = p`${'userData'}/temp`;

    mkdirp.sync(newTemp);
    app.setPath('temp', newTemp);

    process.env.TMPDIR = newTemp;
    process.env.TMP = newTemp;
  }

  app.on('ready', () => createSlackApplication(args));
}

/**
 * Set our app user model ID and create the Application component, the main
 * browser-side component for the app.
 *
 * @param  {Object} args Contains the command-line arguments
 */
function createSlackApplication(args) {
  // Set our AppUserModelId based on the Squirrel shortcut
  let appId = 'com.squirrel.slack.slack';
  if (args.devMode) {
    appId += '-dev';
  } else {
    if (!process.windowsStore) app.setAsDefaultProtocolClient('slack');
  }

  // NB: Work around electron/electron#6643
  app.on('web-contents-created', (e, wc) => {
    wc.on('context-menu', (ee, params) => {
      wc.send('context-menu-ipc', params);
    });
  });

  if (!process.windowsStore) app.setAppUserModelId(appId);

  global.loadSettings = args;
  global.reporter = new BugsnagReporter(args.resourcePath, args.devMode);
  global.getMemoryUsage = getMemoryUsage;

  console.log('Creating Slack Application');

  global.reporter.autoNotify(() => {
    let Application = null;

    setupCrashReporter(args);

    if (args.devMode) {
      Application = require(path.join(args.resourcePath, 'src', 'browser', 'application')).default;
    } else {
      Application = require('../browser/application').default;
    }

    global.application = new Application(args);

    logger.info(`App load time: ${Date.now() - global.shellStartTime}ms`);
  });
}

/**
 * The main point of entry.
 */
async function main() {
  try {
    let shouldRun = await handleSquirrelEvents();
    shouldRun = await handleDisableGpuOnLinux(shouldRun);
    let commandLineArgs = await handleSingleInstance(shouldRun);
    await startTheAppOnReady(commandLineArgs);
  } catch (e) {
    console.error(e);
    app.quit(0);
    process.exit(0);
  }
}

// NB: This will be overwritten by SlackApplication once we start up for reals
global.secondaryParamsReceived = [];
global.secondaryParamsHandler = (cmd) => {
  global.secondaryParamsReceived.push(cmd);
};

main();
