import assignIn from 'lodash.assignin';
import '../rx-operators';
import {dialog, shell, session, powerMonitor} from 'electron';
import {requireTaskPool} from 'electron-remote';
import ipc from '../ipc-rx';
import logger from '../logger';
import os from 'os';
import packageJson from '../../package.json';
import restartApp from './restart-app';
import semver from 'semver';
import temp from 'temp';
import {getReleaseNotesUrl} from './updater-utils';
import {processMagicLoginLink} from '../magic-login/process-link';
import {parseProtocolUrl} from '../parse-protocol-url';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import SerialSubscription from 'rxjs-serial-subscription';
import {p} from '../get-path';
import {createZipArchive} from '../utils/file-helpers';

import AppActions from '../actions/app-actions';
import AppMenu from '../components/app-menu';
import AutoLaunch from '../auto-launch';
import BasicAuthHandler from './basic-auth-handler';
import EventActions from '../actions/event-actions';
import EventStore from '../stores/event-store';
import ReduxComponent from '../lib/redux-component';
import SettingActions from '../actions/setting-actions';
import SettingStore from '../stores/setting-store';
import SlackResourcesUrlHandler from './slack-resources-url-handler';
import SlackWebappDevHandler from './slack-webapp-dev-handler';
import SquirrelAutoUpdater from './squirrel-auto-updater';
import TeamStore from '../stores/team-store';
import TrayHandler from './tray-handler';
import WebContentsMediator from './web-contents-mediator';
import WindowCreator from './window-creator';

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
      require('electron-text-substitutions').listenForPreferenceChanges();
    }

    repairTrayRegistryKey()
      .catch((e) => {
        logger.warn(`Failed to repair tray registry key: ${e.message}`);
      });

    if (options.chromeDriver) {
      this.mainWindow = WindowCreator.createChromeDriverWindow(options);
      return;
    }

    if (!this.state.hasRunApp) {
      this.handleFirstExecution();
    }

    /**
     * So, in 2.1.1 we accidentally logged message text when spell-checking. We
     * don't want that to stick around in a user's logs, so we're going to do a
     * one time clean up. We can remove this code sometime after 2.1.2.
     */
    if (semver.gte(this.state.appVersion, '2.1.2') && !this.state.hasCleanedLogFilesForSpellcheckBug) {
      logger.pruneLogs(true);
      SettingActions.updateSettings({hasCleanedLogFilesForSpellcheckBug: true});
    }

    this.mainWindow = WindowCreator.createMainWindow(options);
    this.basicAuthHandler = new BasicAuthHandler();

    if (options.magicLogin) {
      processMagicLoginLink(options.magicLogin);
    }

    Observable.merge(
      Observable.fromEvent(powerMonitor, 'suspend').mapTo(false),
      Observable.fromEvent(powerMonitor, 'resume').mapTo(true)
    ).subscribe((isAwake) => AppActions.setSuspendStatus(isAwake));

    logger.info(`Welcome to Slack ${this.state.appVersion} ${process.arch}`);
  }

  syncState() {
    return {
      appVersion: SettingStore.getSetting('appVersion'),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      resourcePath: SettingStore.getSetting('resourcePath'),
      versionName: SettingStore.getSetting('versionName'),
      numTeams: TeamStore.getNumTeams(),
      hasRunApp: SettingStore.getSetting('hasRunApp'),
      isWindows: SettingStore.isWindows(),
      isMac: SettingStore.isMac(),
      isBeforeWin10: SettingStore.getSetting('isBeforeWin10'),
      launchOnStartup: SettingStore.getSetting('launchOnStartup'),
      pretendNotReallyWindows10: SettingStore.getSetting('pretendNotReallyWindows10'),
      hasCleanedLogFilesForSpellcheckBug: SettingStore.getSetting('hasCleanedLogFilesForSpellcheckBug'),

      handleDeepLinkEvent: EventStore.getEvent('handleDeepLink'),
      runSpecsEvent: EventStore.getEvent('runSpecs'),
      showAboutEvent: EventStore.getEvent('showAbout'),
      showReleaseNotesEvent: EventStore.getEvent('showReleaseNotes'),
      confirmAndResetAppEvent: EventStore.getEvent('confirmAndResetApp'),
      prepareAndRevealLogsEvent: EventStore.getEvent('prepareAndRevealLogs')
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
    EventActions.handleDeepLink(url);
  }

  handleDeepLinkEvent({url}) {
    let args = parseProtocolUrl(url);

    if (args.releaseChannel && SettingStore.getSetting('releaseChannel') !== args.releaseChannel) {
      SettingActions.updateSettings({releaseChannel: args.releaseChannel});
    } else if (args.magicLogin) {
      processMagicLoginLink(args.magicLogin);
    }
  }

  runSpecsEvent() {
    WindowCreator.createSpecsWindow();
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
      platformVersion,
      isTitleBarHidden
    };

    SettingActions.initializeSettings(payload);
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
    SettingActions.updateSettings({hasRunApp: true});
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
        let re = /^slack:/i;
        let protoUrl = cmd.find((x) => x.match(re));
        if (protoUrl) EventActions.handleDeepLink(protoUrl);
        else EventActions.foregroundApp();
      });
  }

  /**
   * Shows an about box with version and license information.
   */
  showAboutEvent() {
    if (this.aboutBox) {
      this.aboutBox.show();
    } else {
      this.aboutBox = WindowCreator.createAboutWindow();
      this.aboutBox.on('closed', () => this.aboutBox = null);
    }
  }

  showReleaseNotesEvent() {
    let releaseNotesUrl = getReleaseNotesUrl(this.state.releaseChannel === 'beta');
    shell.openExternal(releaseNotesUrl);
  }

  async prepareAndRevealLogsEvent() {
    try {
      let logFiles = await logger.getMostRecentLogFiles();
      let filesToArchive = [
        ...logFiles,
        p`${'userData'}/redux-state.json`
      ];
      let zipPath = p`${'temp'}/logs.zip`;
      await createZipArchive(filesToArchive, zipPath);
      shell.showItemInFolder(zipPath);
    } catch(e) {
      logger.error(`Couldn't zip up log files: ${e}`);
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
    let options = {
      title: 'Reset Slack?',
      buttons: ['Cancel', 'Yes'],
      message: 'Are you sure?',
      detail: 'This will sign you out from all of your teams, reset the app to its original state, and restart it.',
      noLink: true
    };

    let confirmation = new Promise((resolve) => {
      dialog.showMessageBox(this.mainWindow, options, (response) => {
        resolve(response === 1);
      });
    });

    if (await confirmation) {
      logger.warn('User chose to clear all app data, say goodbye!');

      let mainSession = this.mainWindow.webContents.session;
      await new Promise((resolve) => mainSession.clearCache(resolve));
      await new Promise((resolve) => mainSession.clearStorageData(resolve));

      AppActions.resetStore();
      restartApp();
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
