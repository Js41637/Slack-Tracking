global.shellStartTime = Date.now();

import {app, protocol} from 'electron';
import {channel} from '../../package.json';
import {getMemoryUsage} from '../memory-usage';
import {initializeEvalHandler} from 'electron-remote';
import {isWindows10OrHigher} from '../native-interop';
import {parseCommandLine} from '../parse-command-line';
import {parseProtocolUrl} from '../parse-protocol-url';
import {p} from '../get-path';
import {spawn} from 'spawn-rx';

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

function createSlackApplication(args) {
  global.loadSettings = args;
  global.reporter = new BugsnagReporter(args.resourcePath, args.devMode);
  global.getMemoryUsage = getMemoryUsage;

  console.log("Creating Slack Application");
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
 * The main entry point for the application, in the case where we are not
 * handling Squirrel events.
 *
 * @param  {Object} args Contains the command-line arguments
 */
function start(args) {
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

  app.on('ready', () => {
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
    createSlackApplication(args);
  });
}

function copySmallFileSync(from, to) {
  let buf = fs.readFileSync(from);
  fs.writeFileSync(to, buf);
}

/**
 * Forks to Squirrel in order to install or update our app shortcuts.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to install or update
 */
async function createShortcuts(locations) {
  let target = path.basename(process.execPath);
  let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  let shouldInstallStartup = false;

  // NB: 'Startup' is a special snowflake, because we need to add our hint to
  // the app that we're being started on startup
  if (locations.match(/Startup/)) {
    locations = _.filter(locations.split(','), (x) => x !== 'Startup').join(',');
    shouldInstallStartup = true;
  }

  let args = ['--createShortcut', target, '-l', locations];

  if (isWindows10OrHigher()) {
    try {
      // NB: Ensure that the icon file always exists forever and ever
      let targetIcon = path.resolve(path.dirname(process.execPath), '..', 'app-win10.ico');

      copySmallFileSync(
        require.resolve('../static/app-win10.ico').replace('app.asar', 'app.asar.unpacked'),
        targetIcon
      );

      args.push('--icon');
      args.push(targetIcon);
    } catch (e) {
      // NB: We can't even log stuff at this point :(
      console.log(`Failed to write icon: ${e.message}, continuing anyways`);
    }
  }

  await spawn(updateDotExe, args).toPromise();

  if (shouldInstallStartup) {
    args = ['--createShortcut', target, '-l', 'Startup', '-a', '--startup'];
    await spawn(updateDotExe, args).toPromise();
  }
}

/**
 * Forks to Squirrel in order to remove our app shortcuts.
 * Called on app uninstall AND app update.
 *
 * @param  {String} locations A comma-separated string of shortcut locations remove
 */
async function removeShortcuts(locations) {
  let target = path.basename(process.execPath);
  let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  let args = ['--removeShortcut', target, '-l', locations];

  await spawn(updateDotExe, args).toPromise();
}

/**
 * Updates all app shortcuts by calling `createShortcuts`, then removes any
 * inadvertently created shortcuts that didn't exist before.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to update
 */
async function updateShortcuts(locations) {
  let startupShortcut = p`${'appData'}/Microsoft/Windows/Start Menu/Programs/Startup/Slack.lnk`;
  let hasStartupShortcut = fs.statSyncNoException(startupShortcut);

  let desktopShortcut = p`${'userDesktop'}/Slack.lnk`;
  let hasDesktopShortcut = fs.statSyncNoException(desktopShortcut);

  // NB: We need to keep track of which shortcuts don't exist, because
  // update.exe will add them all.
  let toRemove = [];
  if (!hasStartupShortcut) toRemove.push('Startup');
  if (!hasDesktopShortcut) toRemove.push('Desktop');

  await createShortcuts(locations);

  if (toRemove.length > 0) {
    await removeShortcuts(toRemove.join(','));
  }
}

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

// NB: This will be overwritten by SlackApplication once we start up for reals
global.secondaryParamsReceived = [];
global.secondaryParamsHandler = (cmd) => {
  global.secondaryParamsReceived.push(cmd);
};

// Go go go go go go go
handleSquirrelEvents()
  .then((shouldRun) => {
    if (!shouldRun || process.platform !== 'linux') return shouldRun;

    let LocalStorage = require('./local-storage');
    let localStorage = new LocalStorage();

    // NB: Linux handles Disable hardware acceleration differently; it requires a
    // command-line switch rather than a window option.
    let disableGpu = localStorage.getItem('useHwAcceleration') === false;
    if (!disableGpu) return shouldRun;

    console.log(`Disabling GPU: ready = ${app.isReady()}`);

    // NB: By the time we figure this out, it's too late, we have to re-exec
    // ourselves. How inconvenient!
    if (_.find(process.argv, (x) => x.match(/disable-gpu/))) {
      return shouldRun;
    }

    console.log("About to fork to disable GPU");
    process.argv.push('--disable-gpu');
    spawn(process.execPath, process.argv).subscribe();

    // We don't want to wait for completion of spawn (since it'll only exit once
    // the app exits), we're just waiting long enough for spawn to init a new
    // process
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), 1000);
    });
  })
  .then((shouldRun) => {
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
        spawn(process.execPath, [url], {detached: true}).subscribe();
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

    start(args);
  })
  .catch((e) => {
    console.log(`Inevitable Demise! ${e.message}`);
    console.log(e.stack);

    app.quit();
    process.exit(0);
  });
