import assignIn from 'lodash.assignin';
import '../rx-operators';
import {dialog, shell, session, systemPreferences, powerMonitor} from 'electron';
import {requireTaskPool} from 'electron-remote';
import {ipc} from '../ipc-rx';
import {logger} from '../logger';
import fs from 'graceful-fs';
import os from 'os';
import path from 'path';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import packageJson from '../../package.json';
import {restartApp} from './restart-app';
import temp from 'temp';
import promisify from '../promisify';
import {getReleaseNotesUrl} from './updater-utils';
import {processMagicLoginLink} from '../magic-login/process-link';
import {parseProtocolUrl} from '../parse-protocol-url';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import SerialSubscription from 'rxjs-serial-subscription';
import {p} from '../get-path';
import {createZipArchiver, createZipArchiveWithPowershell, copySmallFileSync} from '../utils/file-helpers';

import {appActions} from '../actions/app-actions';
import {AppMenu} from './app-menu';
import {AutoLaunch} from '../auto-launch';
import {BasicAuthHandler} from './basic-auth-handler';
import {eventActions} from '../actions/event-actions';
import {eventStore} from '../stores/event-store';
import {ReduxComponent} from '../lib/redux-component';
import {settingActions} from '../actions/setting-actions';
import {settingStore} from '../stores/setting-store';
import SlackResourcesUrlHandler from './slack-resources-url-handler';
import SlackWebappDevHandler from './slack-webapp-dev-handler';
import SquirrelAutoUpdater from './squirrel-auto-updater';
import {Store} from '../lib/store';
import {teamStore} from '../stores/team-store';
import TrayHandler from './tray-handler';
import {WebContentsMediator} from './web-contents-mediator';
import {windowCreator} from './window-creator';
import {DEFAULT_CLEAR_STORAGE_OPTIONS} from '../utils/shared-constants';

import {intl as $intl, LOCALE_NAMESPACE} from '../i18n/intl';

const pmkdirp = promisify(mkdirp);
const primraf = promisify(rimraf);
const {repairTrayRegistryKey} = requireTaskPool(require.resolve('../csx/tray-repair'));

export default class Application extends ReduxComponent {
  constructor(options = {
    devMode: false,
    devEnv: null,
    resourcePath: null,
    platformVersion: null
  }){
    super();
    global.loadSettings = options;

    // Initialize legacy handlers
    this.autoLaunch = new AutoLaunch();

    // Initialize Data
    this.initializeSettings(options);

    // Handle non-component tasks (maybe refactor into their own component later)
    temp.track(); // Track file changes
    this.setupSingleInstance();
    this.setupTracingByIpc();
    session.defaultSession.allowNTLMCredentialsForDomains('*');

    // Initialize Components
    this.protocols = new Subscription();

    this.protocols.add(new SlackResourcesUrlHandler());
    if (options.webappSrcPath) this.protocols.add(new SlackWebappDevHandler());

    this.squirrelAutoUpdater = new SquirrelAutoUpdater();
    this.trayHandler = new TrayHandler();
    this.webContentsMediator = new WebContentsMediator();

    if (this.state.isMac) {
      this.appMenu = new AppMenu();
      require('electron-text-substitutions/preference-helpers')
        .onPreferenceChanged(eventActions.systemTextSettingsChanged);
    }

    repairTrayRegistryKey()
      .catch((e) => {
        logger.warn(`Failed to repair tray registry key: ${e.message}`);
      });

    if (options.chromeDriver) {
      this.mainWindow = windowCreator.createChromeDriverWindow(options);
      return;
    }

    if (!this.state.hasRunApp) {
      this.handleFirstExecution();
    }

    this.mainWindow = windowCreator.createMainWindow(options);
    this.basicAuthHandler = new BasicAuthHandler();

    if (options.magicLogin) {
      processMagicLoginLink(options.magicLogin);
    }

    Observable.merge(
      Observable.fromEvent(powerMonitor, 'suspend').mapTo(false),
      Observable.fromEvent(powerMonitor, 'resume').mapTo(true)
    ).subscribe((isAwake) => appActions.setSuspendStatus(isAwake));

    logger.info(`Welcome to Slack ${this.state.appVersion} ${process.arch}`);
  }

  syncState() {
    return {
      appVersion: settingStore.getSetting('appVersion'),
      releaseChannel: settingStore.getSetting('releaseChannel'),
      resourcePath: settingStore.getSetting('resourcePath'),
      versionName: settingStore.getSetting('versionName'),
      numTeams: teamStore.getNumTeams(),
      hasRunApp: settingStore.getSetting('hasRunApp'),
      isWindows: settingStore.isWindows(),
      isMac: settingStore.isMac(),
      isBeforeWin10: settingStore.getSetting('isBeforeWin10'),
      launchOnStartup: settingStore.getSetting('launchOnStartup'),
      hasMigratedData: settingStore.getSetting('hasMigratedData'),
      pretendNotReallyWindows10: settingStore.getSetting('pretendNotReallyWindows10'),

      handleDeepLinkEvent: eventStore.getEvent('handleDeepLink'),
      showAboutEvent: eventStore.getEvent('showAbout'),
      showReleaseNotesEvent: eventStore.getEvent('showReleaseNotes'),
      confirmAndResetAppEvent: eventStore.getEvent('confirmAndResetApp'),
      clearCacheRestartAppEvent: eventStore.getEvent('clearCacheRestartApp'),
      prepareAndRevealLogsEvent: eventStore.getEvent('prepareAndRevealLogs')
    };
  }

  dispose() {
    logger.info('Disposing application');
    super.dispose();

    this.protocols.unsubscribe();
    this.squirrelAutoUpdater.dispose();
    this.trayHandler.dispose();

    if (this.appMenu) this.appMenu.dispose();
  }

  handleDeepLink({url}) {
    eventActions.handleDeepLink(url);
  }

  handleDeepLinkEvent({url}) {
    let args = parseProtocolUrl(url);

    if (args.releaseChannel) {
      if (this.state.releaseChannel !== args.releaseChannel) {
        settingActions.updateSettings({releaseChannel: args.releaseChannel});
      } else if (this.state.releaseChannel === 'beta') {
        this.trayHandler.alreadyOnBetaChannelNotification(args.releaseChannel);
      }
    } else if (args.magicLogin) {
      processMagicLoginLink(args.magicLogin);
    }
  }

  initializeSettings(options) {
    let [major, minor, build] = os.release().split('.').map((part) => parseInt(part));
    let platformVersion = { major, minor, build };

    // Darwin v14.0.0 corresponds to Yosemite v10.10.0:
    // https://en.wikipedia.org/wiki/Darwin_%28operating_system%29#Release_history
    let isTitleBarHidden = this.state.numTeams > 1 && platformVersion.major >= 14;
    let runningFromTempDir = process.execPath.indexOf('slack-build') >= 0;

    // NB: Supplying undefined for any setting will throw an error. Use null
    // rather than undefined for default values, as undefined is used to check
    // the existence of the setting.
    let payload = {
      isDevMode: runningFromTempDir || !!options.devMode,
      appVersion: options.version || packageJson.version,
      versionName: packageJson.versionName || null,
      devEnv: options.devEnv || null,
      resourcePath: options.resourcePath,
      launchedWithLink: options.protoUrl || null,
      webappSrcPath: options.webappSrcPath || null,
      launchOnStartup: this.autoLaunch.isEnabled(),
      releaseChannel: options.releaseChannel || this.state.releaseChannel,
      openDevToolsOnStart: !!options.openDevToolsOnStart,
      logFile: options.logFile || null,
      pretendNotReallyWindows10: options.pretendNotReallyWindows10 || this.state.pretendNotReallyWindows10,
      isAeroGlassEnabled: process.platform === 'win32' && systemPreferences.isAeroGlassEnabled(),
      platformVersion,
      isTitleBarHidden
    };

    settingActions.updateSettings(payload);
    assignIn(global.loadSettings, payload);
  }

  setupTracingByIpc() {
    let tracing = null;
    let tracingSession = new SerialSubscription();

    ipc.listen('tracing:start').subscribe(() => {
      tracing = tracing || require('electron').contentTracing;

      tracing.startRecording('*', 'enable-sampling,enable-systrace', () => {});
      tracingSession.add(() => {
        tracing.stopRecording('', (tracingPath) => {
          logger.info(`Content logging written to ${tracingPath}`);
        });
      });
    });

    ipc.listen('tracing:stop').subscribe(() =>
      tracingSession.add(Subscription.EMPTY));
  }

  handleFirstExecution() {
    settingActions.updateSettings({hasRunApp: true});
  }

  /**
   * Listens for additional application launches.
   *
   * You can run the slack command multiple times, but after the first launch
   * the other launches will just pass their information to the single instance
   * server and close immediately.
   */
  setupSingleInstance() {
    var otherAppSignaledUs = new Subject();
    global.secondaryParamsHandler = (cmd) => otherAppSignaledUs.next(cmd);

    otherAppSignaledUs.startWith(...global.secondaryParamsReceived)
      .subscribe((cmd) => {
        const re = /^slack:/i;
        const rs = /^slack:\/\/reply/i;
        const protoUrl = cmd.find((x) => x.match(re));
        const replyUrl = cmd.find((x) => x.match(rs));

        if (replyUrl) {
          logger.info('Application received reply link protocol activation.');
          logger.debug('Link was:', protoUrl);
          eventActions.handleReplyLink(protoUrl);
        } else if (protoUrl) {
          logger.info('Application received deep link protocol activation.');
          logger.debug('Link was:', protoUrl);
          eventActions.handleDeepLink(protoUrl);
        } else {
          logger.info('Application otherwise signaled, foregrounding.');
          eventActions.foregroundApp();
        }
      });
  }

  /**
   * Shows an about box with version and license information.
   */
  showAboutEvent() {
    if (this.aboutBox) {
      this.aboutBox.show();
    } else {
      this.aboutBox = windowCreator.createAboutWindow();
      this.aboutBox.on('closed', () => this.aboutBox = null);
    }
  }

  showReleaseNotesEvent() {
    let releaseNotesUrl = getReleaseNotesUrl(this.state.releaseChannel === 'beta');
    shell.openExternal(releaseNotesUrl);
  }

  async prepareAndRevealLogsEvent() {
    try {
      let storagePath = p`${'userData'}/storage`;
      let storageFiles = fs.readdirSync(storagePath)
        .map((file) => p`${storagePath}/${file}`);
      let logFiles = await logger.getMostRecentLogFiles();

      let filesToArchive = [
        ...logFiles,
        ...storageFiles
      ];

      // Bail out here if we're in Windows Store, we need a
      // custom method
      if (process.windowsStore) {
        return this.revealLogsInAppx(filesToArchive);
      } else if (process.platform === 'win32') {
        filesToArchive.push(`${process.execPath}/../SquirrelSetup.log`);
      }

      const zipPath = p`${'temp'}/logs.zip`;
      createZipArchiver(filesToArchive).mergeMap((archiver) =>
        Observable.fromEvent(archiver
          .generateNodeStream({
            compression: 'DEFLATE',
            compressionOptions: { level: 7 },
            type: 'nodebuffer',
            streamFiles: true
          })
          .pipe(fs.createWriteStream(zipPath)), 'finish').mapTo(true).catch((err) => {
            logger.error(`could not write zip archive into destination ${err}`);
            return Observable.of(false);
          })
      ).subscribe(() => shell.showItemInFolder(zipPath), (err) => {
        logger.error(`could not write zip archive into destination ${err.message}`);
      });
    } catch(e) {
      logger.error(`Couldn't prepare log files to zip: ${e.message}`);
    }
  }

  /**
   * Reveals the logs when running in a Windows Store container (appx),
   * which virtualizes the file system. We therefore need to "download"
   * the files before we can reveal them.
   *
   * You might also be wondering why we don't zip using Yazl - Yazl has
   * trouble with the virtual file systems and the various bytes all
   * around.
   *
   * @param {string[]} filesToArchive
   */
  async revealLogsInAppx(filesToArchive) {
    const downloadDir = p`${'downloads'}` || p`${'HOME'}/Downloads`;
    const desktopDir = p`${'userDesktop'}`;
    let outputFolder = downloadDir;

    // If the download dir doesn't exist, try to recover by using the desktop.
    // If that fails too, don't crash.
    if (!fs.statSyncNoException(downloadDir)) {
      try {
        logger.info(`No download directory at ${downloadDir}, creating one`);
        mkdirp.sync(downloadDir);
      } catch (err) {
        outputFolder = fs.statSyncNoException(desktopDir) ? desktopDir : null;
      }
    }

    if (outputFolder) {
      const time = Date.now();
      const targetDirectory = path.join(outputFolder, `slack-logs-${time}`);
      const zipPath = path.join(outputFolder, `slack-logs-${time}.zip`);

      try {
        await pmkdirp(targetDirectory);

        filesToArchive.forEach((file) => {
          copySmallFileSync(file, path.join(targetDirectory, path.basename(file)));
        });

        await createZipArchiveWithPowershell(targetDirectory, zipPath);
        await primraf(targetDirectory);
        shell.showItemInFolder(zipPath);
      } catch (e) {
        logger.info(`Tried to zip up and reveal log files, but failed: ${e}`);
      }
    } else {
      logger.info(`Tried to reveal logs, but could not get hold of target location ${outputFolder}`);
    }
  }

  /**
   * Show a confirmation dialog and then clear session cache and local storage.
   * After that's finished, dispatch a reset action that will put all stores
   * back to their initial state (if they handle the action).
   *
   * @return {Promise}  A Promise that represents completion
   */
  async confirmAndResetAppEvent() {
    const options = {
      title: $intl.t(`Reset Slack?`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      buttons: [$intl.t(`Cancel`, LOCALE_NAMESPACE.GENERAL)(), $intl.t(`Yes`, LOCALE_NAMESPACE.GENERAL)()],
      message: $intl.t(`Are you sure?`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      detail: $intl.t(`This will sign you out from all of your teams, reset the app to its original state, and restart it.`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      noLink: true
    };

    const confirmation = new Promise((resolve) => {
      dialog.showMessageBox(this.mainWindow, options, (response) => {
        resolve(response === 1);
      });
    });

    if (await confirmation) {
      logger.warn('User chose to clear all app data, say goodbye!');

      const hasMigratedData = this.state.hasMigratedData;

      await this.clearCacheAndStorage();
      await Store.resetStore();

      // NB: Don't migrate folks more than once.
      settingActions.updateSettings({hasMigratedData});
      restartApp();
    }
  }

  /**
   * Handles the 'clear cache and restart app' event, which can be triggered from the window menu.
   * This will clear the cache and storage data (excluding cookies), followed by an app restart.
   */
  async clearCacheRestartAppEvent() {
    const storageOptions = {...DEFAULT_CLEAR_STORAGE_OPTIONS};
    storageOptions.storages = storageOptions.storages.filter((v) => v !== 'cookies');

    await this.clearCacheAndStorage({ storageOptions });

    restartApp({ destroyWindows: true });
  }

  /**
   * Removes all storage data and cache.
   */
  async clearCacheAndStorage(options) {
    const storageOptions = options && options.storageOptions ? options.storageOptions : DEFAULT_CLEAR_STORAGE_OPTIONS;

    if (this.mainWindow && this.mainWindow.webContents && this.mainWindow.webContents.session) {
      const mainSession = this.mainWindow.webContents.session;
      await new Promise((resolve) => mainSession.clearCache(resolve));
      await new Promise((resolve) => mainSession.clearStorageData(storageOptions, resolve));
    }
  }

  update(prevState = {}) {
    if (this.state.launchOnStartup && !prevState.launchOnStartup) {
      this.autoLaunch.enable();
    } else if (!this.state.launchOnStartup && prevState.launchOnStartup) {
      this.autoLaunch.disable();
    }

    if (prevState.numTeams > 0 && this.state.numTeams === 0) {
      let mainSession = this.mainWindow.webContents.session;

      mainSession.clearStorageData(() => {
        logger.info('No teams left, cleared session storage');
      });
    }
  }
}
