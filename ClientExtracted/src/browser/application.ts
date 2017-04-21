/**
 * @module Browser
 */ /** for typedoc */

import * as assignIn from 'lodash.assignin';
import '../rx-operators';
import { dialog, shell, session, systemPreferences, powerMonitor } from 'electron';
import { requireTaskPool } from 'electron-remote';
import { ipc } from '../ipc-rx';
import { logger } from '../logger';
import * as fs from 'graceful-fs';
import * as os from 'os';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';
import * as packageJson from '../../package.json';
import { restartApp } from './restart-app';
import * as temp from 'temp';
import { promisify } from '../promisify';
import { getReleaseNotesUrl } from './updater-utils';
import { processMagicLoginLink } from '../magic-login/process-link';
import { parseProtocolUrl } from '../parse-protocol-url';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import SerialSubscription from 'rxjs-serial-subscription';
import { p } from '../get-path';
import { IS_WINDOWS_STORE, DEFAULT_CLEAR_STORAGE_OPTIONS } from '../utils/shared-constants';
import { createZipArchiver, createZipArchiveWithPowershell, copySmallFileSync } from '../utils/file-helpers';

import { appActions } from '../actions/app-actions';
import { AppMenu } from './app-menu';
import { AutoLaunch } from './auto-launch';
import { BasicAuthHandler } from './basic-auth-handler';
import { eventActions } from '../actions/event-actions';
import { eventStore, StoreEvent } from '../stores/event-store';
import { ReduxComponent } from '../lib/redux-component';
import { settingActions } from '../actions/setting-actions';
import { settingStore } from '../stores/setting-store';
import { SlackResourcesUrlHandler } from './slack-resources-url-handler';
import { SlackWebappDevHandler } from './slack-webapp-dev-handler';
import { SquirrelAutoUpdater } from './squirrel-auto-updater';
import { Store } from '../lib/store';
import { teamStore } from '../stores/team-store';
import { TrayHandler } from './tray-handler';
import { SignoutManager } from './signout-manager';
import { WebContentsMediator, WebContentsMediatorState } from './web-contents-mediator';
import { windowCreator } from './window-creator';
import { noop } from '../utils/noop';

import { intl as $intl, LOCALE_NAMESPACE } from '../i18n/intl';

const pmkdirp = promisify(mkdirp);
const primraf = promisify(rimraf);
const { repairTrayRegistryKey } = requireTaskPool(require.resolve('../csx/tray-repair'));

export interface ApplicationState {
  appVersion: string;
  releaseChannel: string;
  resourcePath: string;
  versionName: string;
  numTeams: number;
  hasRunApp: boolean;
  isBeforeWin10: boolean;
  launchOnStartup: boolean;
  pretendNotReallyWindows10: boolean;

  handleDeepLinkEvent: StoreEvent;
  showAboutEvent: StoreEvent;
  showReleaseNotesEvent: StoreEvent;
  clearCacheRestartAppEvent: StoreEvent;
  confirmAndResetAppEvent: StoreEvent;
  prepareAndRevealLogsEvent: StoreEvent;
}

export interface LinuxSettings {
  useHwAcceleration?: boolean;
  os: string;
  release: string;
  desktopEnvironment?: string;
}

export interface SettingsToInitialize {
  devMode: boolean;
  devEnv?: string | null;
  resourcePath?: string | null;
  platformVersion?: string | null;
  webappSrcPath?: string;
  webappParams?: object;
  magicLogin?: {
    teamId: string;
    token: string;
  };
  chromeDriver?: boolean;
  version?: string;
  protoUrl?: string;
  releaseChannel?: string;
  openDevToolsOnStart?: boolean;
  logFile?: string;
  pretendNotReallyWindows10?: boolean;
  linux?: LinuxSettings;
}

export class Application extends ReduxComponent<ApplicationState> {
  private readonly autoLaunch: AutoLaunch = new AutoLaunch(); // Initialize legacy handlers
  private readonly squirrelAutoUpdater: SquirrelAutoUpdater = new SquirrelAutoUpdater();
  private readonly trayHandler: TrayHandler = new TrayHandler();
  private readonly protocols: Subscription = new Subscription();
  private readonly resourceUrlHandler: SlackResourcesUrlHandler;
  private readonly webappDevHandler: SlackWebappDevHandler;
  private readonly webContentsMediator: WebContentsMediator<WebContentsMediatorState>;
  private readonly mainWindow: Electron.BrowserWindow;
  private readonly basicAuthHandler: BasicAuthHandler;
  private readonly signoutManager: SignoutManager;
  private readonly appMenu: AppMenu;
  private aboutBox: Electron.BrowserWindow | null;

  constructor(options: SettingsToInitialize = {
    devMode: false,
    devEnv: null,
    resourcePath: null,
    platformVersion: null
  }) {
    super();
    global.loadSettings = options as any;

    // Initialize Data
    this.initializeSettings(options);

    // Handle non-component tasks (maybe refactor into their own component later)
    temp.track(); // Track file changes
    this.setupSingleInstance();
    this.setupTracingByIpc();
    session.defaultSession.allowNTLMCredentialsForDomains('*');

    // Initialize Components
    this.resourceUrlHandler = new SlackResourcesUrlHandler();
    if (options.webappSrcPath) {
      this.webappDevHandler = new SlackWebappDevHandler();
    };

    this.webContentsMediator = new WebContentsMediator<WebContentsMediatorState>();

    if (process.platform === 'darwin') {
      this.appMenu = new AppMenu();
      require('electron-text-substitutions/preference-helpers')
        .onPreferenceChanged(eventActions.systemTextSettingsChanged);
    } else if (process.platform === 'win32') {
      repairTrayRegistryKey()
        .catch((e: Error) => {
          logger.warn(`App: Failed to repair tray registry key.`, e);
        });
    }

    if (options.chromeDriver) {
      this.mainWindow = windowCreator.createChromeDriverWindow();
      return;
    }

    if (!this.state.hasRunApp) {
      this.handleFirstExecution();
    }

    this.mainWindow = windowCreator.createMainWindow(options);
    this.basicAuthHandler = new BasicAuthHandler();
    this.signoutManager = new SignoutManager();

    if (options.magicLogin) {
      processMagicLoginLink(options.magicLogin);
    }

    Observable.merge(
      Observable.fromEvent(powerMonitor, 'suspend').mapTo(false),
      Observable.fromEvent(powerMonitor, 'resume').mapTo(true)
    ).subscribe((isAwake) => appActions.setSuspendStatus(isAwake));

    logger.info(`App: Welcome to Slack ${this.state.appVersion} ${process.arch}`);
  }

  public syncState(): ApplicationState {
    return {
      appVersion: settingStore.getSetting<string>('appVersion'),
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      resourcePath: settingStore.getSetting<string>('resourcePath'),
      versionName: settingStore.getSetting<string>('versionName'),
      numTeams: teamStore.getNumTeams(),
      hasRunApp: settingStore.getSetting<boolean>('hasRunApp'),
      isBeforeWin10: settingStore.getSetting<boolean>('isBeforeWin10'),
      launchOnStartup: settingStore.getSetting<boolean>('launchOnStartup'),
      pretendNotReallyWindows10: settingStore.getSetting<boolean>('pretendNotReallyWindows10'),

      handleDeepLinkEvent: eventStore.getEvent('handleDeepLink'),
      showAboutEvent: eventStore.getEvent('showAbout'),
      showReleaseNotesEvent: eventStore.getEvent('showReleaseNotes'),
      confirmAndResetAppEvent: eventStore.getEvent('confirmAndResetApp'),
      clearCacheRestartAppEvent: eventStore.getEvent('clearCacheRestartApp'),
      prepareAndRevealLogsEvent: eventStore.getEvent('prepareAndRevealLogs')
    };
  }

  public dispose(): void {
    logger.info('App: Disposing application');
    super.dispose();

    this.protocols.unsubscribe();
    this.resourceUrlHandler.dispose();
    this.squirrelAutoUpdater.dispose();
    this.trayHandler.dispose();

    if (this.appMenu) this.appMenu.dispose();
    if (this.webappDevHandler) this.webappDevHandler.dispose();
  }

  public handleDeepLink({ url }: { url: string }): void {
    eventActions.handleDeepLink(url);
  }

  public handleDeepLinkEvent({ url }: { url: string }): void {
    const args = parseProtocolUrl(url);

    if (args.releaseChannel) {
      if (this.state.releaseChannel !== args.releaseChannel) {
        settingActions.updateSettings({ releaseChannel: args.releaseChannel });
      } else if (this.state.releaseChannel === 'beta') {
        this.trayHandler.alreadyOnBetaChannelNotification();
      }
    } else if (args.magicLogin) {
      processMagicLoginLink(args.magicLogin);
    }
  }

  /**
   * Shows an about box with version and license information.
   */
  public showAboutEvent(): void {
    if (this.aboutBox) {
      this.aboutBox.show();
    } else {
      this.aboutBox = windowCreator.createAboutWindow();
      this.aboutBox.on('closed', () => this.aboutBox = null);
    }
  }

  public showReleaseNotesEvent(): void {
    const releaseNotesUrl = getReleaseNotesUrl(this.state.releaseChannel === 'beta');
    shell.openExternal(releaseNotesUrl);
  }

  /**
   * Executed when a user asks the application for logs. We'll assemble logs, create a zip
   * file, and present it to the user.
   *
   * @returns {Promise<void>}
   */
  public async prepareAndRevealLogsEvent(): Promise<void> {
    try {
      const filesToArchive = await logger.getFilesToArchive();

      // Bail out here if we're in Windows Store, we need a custom method
      if (IS_WINDOWS_STORE) return this.revealLogsInAppx(filesToArchive);

      const zipPath = p`${'temp'}/logs.zip`;
      createZipArchiver(filesToArchive).mergeMap((archiver) =>
        Observable.fromEvent((archiver as any)
          .generateNodeStream({
            compression: 'DEFLATE',
            compressionOptions: { level: 7 },
            type: 'nodebuffer',
            streamFiles: true
          })
          .pipe(fs.createWriteStream(zipPath)), 'finish').mapTo(true).catch((err) => {
            logger.error(`App: could not write zip archive into destination.`, err);
            return Observable.of(false);
          })
      ).subscribe(() => shell.showItemInFolder(zipPath), (err) => {
        logger.error(`App: could not write zip archive into destination.`, err);
      });
    } catch (e) {
      logger.error(`App: Couldn't prepare log files to zip.`, e);
    }
  }

  /**
   * Show a confirmation dialog and then clear session cache and local storage.
   * After that's finished, dispatch a reset action that will put all stores
   * back to their initial state (if they handle the action).
   *
   * @return {Promise}  A Promise that represents completion
   */
  public async confirmAndResetAppEvent(): Promise<void> {
    const options = {
      title: $intl.t(`Reset Slack?`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      buttons: [$intl.t(`Cancel`, LOCALE_NAMESPACE.GENERAL)(), $intl.t(`Yes`, LOCALE_NAMESPACE.GENERAL)()],
      message: $intl.t(`Are you sure?`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      detail: $intl.t(`This will sign you out from all of your teams, reset the app to its original state, and restart it.`,
        LOCALE_NAMESPACE.MESSAGEBOX)(),
      noLink: true
    };

    const confirmation = new Promise((resolve) => {
      dialog.showMessageBox(this.mainWindow, options, (response) => {
        resolve(response === 1);
      });
    });

    if (await confirmation) {
      logger.warn('App: User chose to clear all app data, say goodbye!');

      await this.clearCacheAndStorage();
      await (Store as any).resetStore();

      restartApp({ destroyWindows: true });
    }
  }

  /**
   * Handles the 'clear cache and restart app' event, which can be triggered from the window menu.
   * This will clear the cache and storage data (excluding cookies), followed by an app restart.
   */
  public async clearCacheRestartAppEvent() {
    const storageOptions = { ...DEFAULT_CLEAR_STORAGE_OPTIONS };
    storageOptions.storages = storageOptions.storages!.filter((v) => v !== 'cookies');

    await this.clearCacheAndStorage({ storageOptions });

    restartApp({ destroyWindows: true });
  }

  /**
   * Removes all storage data and cache.
   */
  public async clearCacheAndStorage(options?: { storageOptions: Electron.ClearStorageDataOptions }) {
    const storageOptions = options && options.storageOptions ? options!.storageOptions : DEFAULT_CLEAR_STORAGE_OPTIONS;

    if (this.mainWindow && this.mainWindow.webContents && this.mainWindow.webContents.session) {
      const mainSession = this.mainWindow.webContents.session;
      await new Promise((resolve) => mainSession.clearCache(resolve));
      await new Promise((resolve) => mainSession.clearStorageData(storageOptions, resolve));
    }
  }

  public update(prevState: Partial<ApplicationState> = {}): void {
    if (this.state.launchOnStartup && !prevState.launchOnStartup) {
      this.autoLaunch.enable();
    } else if (!this.state.launchOnStartup && prevState.launchOnStartup) {
      this.autoLaunch.disable();
    }

    if ((prevState.numTeams || 0) > 0 && this.state.numTeams === 0) {
      const mainSession = this.mainWindow.webContents.session;

      mainSession.clearStorageData(() => {
        logger.info('App: No teams left, cleared session storage.');
      });
    }
  }

  private initializeSettings(options: SettingsToInitialize) {
    const [major, minor, build] = os.release().split('.').map((part) => parseInt(part, 10));
    const platformVersion = { major, minor, build };

    // Darwin v14.0.0 corresponds to Yosemite v10.10.0:
    // https://en.wikipedia.org/wiki/Darwin_%28operating_system%29#Release_history
    const isTitleBarHidden = this.state.numTeams > 1 && platformVersion.major >= 14;
    const runningFromTempDir = process.execPath.indexOf('slack-build') >= 0;

    // NB: Supplying undefined for any setting will throw an error. Use null
    // rather than undefined for default values, as undefined is used to check
    // the existence of the setting.
    const payload = {
      isDevMode: runningFromTempDir || !!options.devMode,
      appVersion: options.version || packageJson.version,
      versionName: packageJson.versionName || null,
      devEnv: options.devEnv || null,
      resourcePath: options.resourcePath,
      launchedWithLink: options.protoUrl || null,
      webappSrcPath: options.webappSrcPath || null,
      webappParams: options.webappParams || null,
      launchOnStartup: this.autoLaunch.isEnabled(),
      releaseChannel: options.releaseChannel || this.state.releaseChannel,
      openDevToolsOnStart: !!options.openDevToolsOnStart,
      logFile: options.logFile || null,
      pretendNotReallyWindows10: options.pretendNotReallyWindows10 || this.state.pretendNotReallyWindows10,
      isAeroGlassEnabled: process.platform === 'win32' && systemPreferences.isAeroGlassEnabled(),
      platformVersion,
      isTitleBarHidden,
      linux: options.linux || undefined,
    };

    settingActions.updateSettings(payload);
    assignIn(global.loadSettings, payload);
  }

  private setupTracingByIpc(): void {
    let tracing: Electron.ContentTracing;
    const tracingSession = new SerialSubscription();

    ipc.listen('tracing:start').subscribe(() => {
      tracing = tracing || require('electron').contentTracing;

      const option: Electron.ContentTracingOptions = {
        categoryFilter: '*',
        traceOptions: 'enable-sampling,enable-systrace'
      };

      tracing.startRecording(option, noop);
      tracingSession.add(() => {
        tracing.stopRecording('', (tracingPath) => {
          logger.info(`App: Content logging written to ${tracingPath}`);
        });
      });
    });

    ipc.listen('tracing:stop').subscribe(() =>
      tracingSession.add(Subscription.EMPTY));
  }

  private handleFirstExecution(): void {
    settingActions.updateSettings({ hasRunApp: true });
  }

  /**
   * Listens for additional application launches.
   *
   * You can run the slack command multiple times, but after the first launch
   * the other launches will just pass their information to the single instance
   * server and close immediately.
   */
  private setupSingleInstance(): void {
    const otherAppSignaledUs = new Subject();
    global.secondaryParamsHandler = (cmd) => otherAppSignaledUs.next(cmd);

    otherAppSignaledUs.startWith(...global.secondaryParamsReceived)
      .filter((cmd: Array<string>) => Array.isArray(cmd) && cmd.length > 0)
      .subscribe((cmd: Array<string>) => {
        const re = /^slack:/i;
        const rs = /^slack:\/\/reply/i;
        let protoUrl: string | null = null;
        let replyUrl: string | null = null;

        try {
          protoUrl = cmd.find((x) => !!x.match(re))!;
          replyUrl = cmd.find((x) => !!x.match(rs))!;
        } catch (e) {
          logger.warn('App: not able to determine protocol ', cmd);
        }

        if (replyUrl) {
          logger.info('App: Received reply link protocol activation.');
          logger.debug('App: Link was:', protoUrl);
          if (protoUrl) {
            eventActions.handleReplyLink(protoUrl);
          } else {
            logger.warn('App: protocol url is empty, cannot activate reply link');
          }
        } else if (protoUrl) {
          logger.info('App: Received deep link protocol activation.');
          logger.debug('App: Link was:', protoUrl);
          eventActions.handleDeepLink(protoUrl);
        } else {
          logger.info('App: Otherwise signaled, foregrounding.');
          eventActions.foregroundApp();
        }
      });
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
  private async revealLogsInAppx(filesToArchive: Array<string>): Promise<void> {
    const downloadDir = p`${'downloads'}` || p`${'HOME'}/Downloads`;
    const desktopDir = p`${'userDesktop'}`;
    let outputFolder: string | null = downloadDir;

    // If the download dir doesn't exist, try to recover by using the desktop.
    // If that fails too, don't crash.
    if (!fs.statSyncNoException(downloadDir)) {
      try {
        logger.info(`App: No download directory at ${downloadDir}, creating one.`);
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
        logger.info('App: Tried to zip up and reveal log files, but failed.', e);
      }
    } else {
      logger.info(`App: Tried to reveal logs, but could not get hold of target location ${outputFolder}`);
    }
  }
}
