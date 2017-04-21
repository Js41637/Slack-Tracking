/**
 * @module Browser
 */ /** for typedoc */

import { ipcMain, BrowserWindow } from 'electron';
import * as profiler from '../utils/profiler';

const { app } = require('electron');
import { omit } from '../utils/omit';
import * as assignIn from 'lodash.assignin';
import * as kebabCase from 'lodash.kebabcase';
import { logger } from '../logger';
import { executeJavaScriptMethod, remoteEval } from 'electron-remote';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AppMenu } from './app-menu';
import { BrowserWindowManager } from './browser-window-manager';
import { DownloadListener } from './download-listener';
import { eventActions } from '../actions/event-actions';
import { behaviors as windowBehaviors } from './behaviors';
import { externalLinkBehavior } from '../renderer/behaviors/external-link-behavior';
import { WindowBehavior } from './behaviors/window-behavior';
import { MainWindowCloseBehavior } from './behaviors/main-window-close-behavior';
import { MetricsReporter } from './metrics-reporter';
import { NotificationWindowManager } from './notification-window-manager';
import { ReduxComponent } from '../lib/redux-component';
import { RepositionWindowBehavior } from './behaviors/reposition-window-behavior';
import { settingStore } from '../stores/setting-store';
import { windowActions } from '../actions/window-actions';
import { windowFrameActions } from '../actions/window-frame-actions';
import { WindowFlashNotificationManager } from './window-flash-notification-manager';
import { WindowHelpers } from '../utils/window-helpers';
import { windowStore } from '../stores/window-store';
import { resolveImage } from '../utils/resolve-image';

import { SLACK_PROTOCOL, WINDOW_TYPES, SIDEBAR_WIDTH } from '../utils/shared-constants';
import { WindowCreatorBase } from './window-creator-base';

import { intl as $intl, LOCALE_NAMESPACE } from '../i18n/intl';

const { reportRendererCrashes, reportWindowMetrics, loadWindowFileUrl } = WindowHelpers;

export interface WindowCreatorState {
  title: string;
  isMac: boolean;
  platform: string;
  isWindows: boolean;
  isWin10: boolean;
  appVersion: string;
  resourcePath: string;
  autoHideMenuBar: boolean;
  isTitleBarHidden: boolean;
  useHwAcceleration: boolean;
  isShowingHtmlNotifications: boolean;
  isDevMode: boolean;
}

/**
 * Singleton that creates windows. Handles some basic Slack window behaviors.
 */
export class WindowCreator extends ReduxComponent<WindowCreatorState> implements WindowCreatorBase {
  private isQuitting: boolean = false;

  constructor() {
    super();

    /**
     * We only want to create windows in the main process (remote event
     * handlers are unreliable). But the webapp needs to know the ID of the
     * created window synchronously, so set the `returnValue`.
     */
    ipcMain.on('create-webapp-window', (e: Electron.IpcMainEvent, options) => {
      const webappWindow = this.createWebappWindow(options, e.sender);
      e.returnValue = webappWindow.id;
    });

    ipcMain.on('inter-window-message', (_event, window_token, window_type, ...args) => {
      let browserWindow = null;
      if (window_token) {
        browserWindow = BrowserWindow.fromId(parseInt(window_token, 10));
      } else if (window_type) {
        const metadata = windowStore.getWindowOfSubType(window_type);
        if (metadata) browserWindow = BrowserWindow.fromId(metadata.id);
      }
      if (browserWindow) {
        if (browserWindow.webContents.isDestroyed() || browserWindow.webContents.isCrashed()) return;

        browserWindow.webContents.send('inter-window-message', ...args);
      } else {
        logger.error("inter-window-message: couldn't find browserWindow");
      }
    });
  }

  public syncState(): WindowCreatorState {
    return {
      title: $intl.t(`Slack`, LOCALE_NAMESPACE.BROWSER)(),
      isMac: settingStore.isMac(),
      platform: settingStore.getSetting<string>('platform'),
      isWindows: settingStore.isWindows(),
      isWin10: settingStore.getSetting<boolean>('isWin10'),
      appVersion: settingStore.getSetting<string>('appVersion'),
      resourcePath: settingStore.getSetting<string>('resourcePath'),
      autoHideMenuBar: settingStore.getSetting<boolean>('autoHideMenuBar'),
      isTitleBarHidden: settingStore.getSetting<boolean>('isTitleBarHidden'),
      useHwAcceleration: settingStore.isUsingHardwareAcceleration(),
      isShowingHtmlNotifications: settingStore.isShowingHtmlNotifications(),
      isDevMode: settingStore.getSetting<boolean>('isDevMode')
    };
  }

  /**
   * Creates and initializes the main app window.
   *
   * @param  {Object} params An object containing BrowserWindow arguments
   * @return {BrowserWindow}  The created window
   */
  public createMainWindow(params: any): Electron.BrowserWindow {
    const options = { ...this.getSlackWindowOpts(), ...params };
    options.windowType = WINDOW_TYPES.MAIN;
    options.bootstrapScript = require.resolve('../renderer/main');

    if (this.state.isWin10) {
      options.frame = false;
    }

    if (this.state.isMac) {
      // Minimum webapp size + the sidebar width, if it is visible
      options.minWidth = 600 + (this.state.isTitleBarHidden ? SIDEBAR_WIDTH : 0);
      options.minHeight = 400;
    } else {
      // Windows'ers tend to have lower resolutions and care about this
      options.minWidth = 400;
      options.minHeight = 300;
    }

    if (this.state.isTitleBarHidden) {
      options.titleBarStyle = 'hidden';
    }

    const browserWindow = new BrowserWindow(options);
    const disposable = new Subscription();

    windowActions.addWindow({ windowId: browserWindow.id, windowType: WINDOW_TYPES.MAIN });

    const behaviors: Array<WindowBehavior> = windowBehaviors
                                              .filter((x) => x.isSupported(this.state.platform))
                                              .map((behavior) => {
                                                const ret = new behavior();
                                                disposable.add(ret.setup(browserWindow));
                                                return ret;
                                              });
    const windowCloseBehavior = behaviors.filter((x) => x instanceof MainWindowCloseBehavior)[0] as MainWindowCloseBehavior;

    browserWindow.on('enter-full-screen', () => {
      windowFrameActions.setFullScreen(true);
    });

    //once main window appears and if there's any crash report generated before application starts,
    //ask any team (current selected team will picks up this event) to send clogs, then flush out reported crashes
    //NOTE: disabled until get clarification from https://github.com/electron/electron/issues/9100,
    //since this failure prevents user to use slack at all
    /*
    browserWindow.once('show', () => {
      const report = crashReporter.getUploadedReports();
      const count = Array.isArray(report) ? report.length : 0;

      if (count > 0) {
        logger.info('WindowCreator: Found native crash reports, reporting to webapp');
        eventActions.reportCrashLogs(count);
        flushCurrentReports();
      }
    });*/

    browserWindow.on('leave-full-screen', () => {
      windowFrameActions.setFullScreen(false);
    });

    browserWindow.on('focus', eventActions.mainWindowFocused);
    browserWindow.on('app-command', (_e: Electron.Event, cmd) => {
      if (cmd !== 'unknown') eventActions.appCommand(cmd);
    });

    this.windowReadyEvent(browserWindow).subscribe(() => {
      this.onMainWindowReady(browserWindow, options);
    });

    browserWindow.on('close', (e) => {
      if (windowCloseBehavior.canWindowBeClosed(browserWindow)) {
        this.isQuitting = true;

        // Hide immediately to appear more responsive.
        browserWindow.hide();

        // Unsubscribe all the child components and attached behaviors. Note that
        // this disposes `BrowserWindowManager`, which first closes all other
        // windows. So we can guarantee we're the last survivor.
        disposable.unsubscribe();
      } else {
        // The window was hidden by the behavior, just cancel the close.
        e.preventDefault();
      }
    });

    browserWindow.once('closed', app.quit);

    loadWindowFileUrl(browserWindow, options);
    this.preventWindowNavigation(browserWindow);

    disposable.add(this.createChildComponents(browserWindow));

    disposable.add(() => {
      global.application.dispose();
      windowActions.removeWindow(browserWindow.id);
    });

    return browserWindow;
  }

  /**
   * Creates a new window used for the About box.
   *
   * @return {BrowserWindow}  The created window
   */
  public createAboutWindow(): Electron.BrowserWindow {
    return this.createComponentWindow({
      width: 320,
      height: 304,
      name: 'AboutBox',
      parent: null,
      windowType: WINDOW_TYPES.OTHER,
      title: $intl.t(`About Slack`, LOCALE_NAMESPACE.BROWSER)()
    })!;
  }

  /**
   * Creates and initializes the window used for HTML notifications.
   *
   * @return {BrowserWindow}  The created window
   */
  public createNotificationsWindow(): Electron.BrowserWindow {
    logger.info('Creating notifications window');

    const options = this.getNotificationWindowOpts();
    const browserWindow = new BrowserWindow(options);
    const windowId = browserWindow.id;
    const disposable = new Subscription();

    loadWindowFileUrl(browserWindow, options);
    this.preventWindowNavigation(browserWindow);

    windowActions.addWindow({ windowId, windowType: WINDOW_TYPES.NOTIFICATIONS });
    disposable.add(() => windowActions.removeWindow(windowId));

    browserWindow.once('close', () => {
      logger.info('Notifications window closed, disposing');
      disposable.unsubscribe();
    });

    return browserWindow;
  }

  /**
   * Creates a Main Window that the QA tests can kick around via ChromeDriver that
   * is similar to the Webapp's SSB interop context.
   *
   * @return {BrowserWindow} A Browser Window that looks like the webapp SSB context
   */
  public createChromeDriverWindow(): Electron.BrowserWindow {
    logger.info('Creating main window for ChromeDriver in webapp mode');

    // NB: Normally we'd be calling this method from a renderer, where we can get
    // our existing User Agent, but since we'll be calling it from the Browser
    // where we can't get the user agent, we'll have to fake it up.
    const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Slack/2.0.2 Chrome/47.0.2526.110 AtomShell/0.36.9 Safari/537.36 Slack_SSB/2.0.2'; // tslint:disable-line

    return this.createWebappWindow({
      url: 'about:blank',
      width: 1024,
      height: 768,
      userAgent
    });
  }

  /**
   * The ready-to-show event is broken since Electron 1.3.7, but when it's
   * fixed we should switch back to it.
   */
  private windowReadyEvent(browserWindow: Electron.BrowserWindow): Observable<Electron.Event> {
    return Observable.merge(
      Observable.fromEvent(browserWindow.webContents, 'dom-ready'),
      Observable.fromEvent(browserWindow, 'ready-to-show')
        .do(() => logger.info('ready-to-show is back in action'))
    ).take(1);
  }

  /**
   * Occurs when the main app window finishes loading.
   *
   * @param  {BrowserWindow} mainWindow The main window
   * @param  {Object} options An object containing BrowserWindow arguments
   */
  private onMainWindowReady(mainWindow: Electron.BrowserWindow, options: {
    invokedOnStartup: boolean;
    openDevToolsOnStart: boolean
  }): void {
    logger.info(`Main window finished load. Launched on login: ${options.invokedOnStartup}`);

    // NB: We have to wait for the window to finish load before minimizing,
    // otherwise the app never loads.
    if (options.invokedOnStartup) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    if (options.openDevToolsOnStart) {
      eventActions.toggleDevTools(true /* forAllWebContents */);
    }

    if (profiler.shouldProfile()) profiler.stopProfiling('main');
  }

  /**
   * Creates browser components that depend on the main app window.
   *
   * @param  {BrowserWindow} mainWindow The main window
   * @return {Subscription} A Subscription that will clean up all child components
   */
  private createChildComponents(mainWindow: Electron.BrowserWindow): Subscription {
    const disp = new Subscription();
    const windowManager = new BrowserWindowManager(mainWindow);
    disp.add(() => windowManager.dispose());

    if (!this.state.isMac) {
      const appMenu = new AppMenu(mainWindow);
      disp.add(() => appMenu.dispose());
    }

    if (this.state.isWindows) {
      const windowFlashManager = new WindowFlashNotificationManager(mainWindow);
      disp.add(() => windowFlashManager.dispose());
    }

    if (this.state.isShowingHtmlNotifications) {
      const notificationWindowManager = new NotificationWindowManager(this, mainWindow);
      disp.add(() => notificationWindowManager.dispose());
    }

    const downloadListener = new DownloadListener(mainWindow);
    disp.add(() => downloadListener.dispose());

    const metricsReporter = new MetricsReporter(mainWindow);
    disp.add(() => metricsReporter.dispose());

    disp.add(reportWindowMetrics(mainWindow, metricsReporter));
    disp.add(reportRendererCrashes(mainWindow, metricsReporter));
    return disp;
  }

  /**
   * Creates a new window used by the webapp `window` API.
   *
   * @param {Object}      params  Contains standard BrowserWindow params, the
   * ones detailed in customParamsMap, and a `url` property
   * @param {WebContents} sender  The `WebContents` that requested this window
   *
   * @return {BrowserWindow}  The created window
   */
  private createWebappWindow(params: any = {},
                             sender: Electron.WebContents | null = null): Electron.BrowserWindow {
    let options = this.getWebappWindowOpts() as any;

    // Override default options with params, handling any custom options
    const customParamsMap = {
      hideMenuBar: 'autoHideMenuBar'
    };

    // Ensure that the new window pops up on the same screen as the app
    const rect: Electron.Rectangle = { x: params.x!, y: params.y!, width: params.width!, height: params.height! };
    const senderWindow = (sender ? BrowserWindow.fromWebContents(sender!) : null) || BrowserWindow.getFocusedWindow();
    Object.assign(params, RepositionWindowBehavior.moveRectToDisplay(rect, senderWindow));

    Object.keys(params).forEach((key) => {
      const value = params[key];
      const option = customParamsMap[key] === undefined ? key : customParamsMap[key];
      options[option] = value;
    });

    options.fullscreen = (params.fullscreen !== undefined) ? params.fullscreen : false;
    options.fullscreenable = (params.fullscreenable !== undefined) ? params.fullscreenable : true;
    options = RepositionWindowBehavior.getValidWindowPositionAndSize(options) as any;

    logger.info('Creating webapp window.', omit(options, 'url', 'content_html'));

    const browserWindow = new BrowserWindow(options);
    const windowId = browserWindow.id;
    const disposable = new Subscription();

    const repositionWindow = new RepositionWindowBehavior(browserWindow.center);
    disposable.add(repositionWindow.setup(browserWindow));
    disposable.add(externalLinkBehavior.setup(browserWindow.webContents));

    if (!params.isPopupWindow) {
      this.preventWindowNavigation(browserWindow);
    }
    browserWindow.webContents.setUserAgent(params.userAgent);

    if (options.url) {
      browserWindow.loadURL(options.url);
    }

    disposable.add(this.setParentInformation(browserWindow, params.parentInfo));

    if (!params.isPopupWindow && sender) {
      disposable.add(this.relayWindowEvents(browserWindow, sender));
    }

    disposable.add(() => windowActions.removeWindow(windowId));

    browserWindow.once('close', () => {
      browserWindow.hide();

      logger.info('Webapp window closed, disposing');
      disposable.unsubscribe();
    });

    const windowCreationOptions = {
      windowId,
      windowType: WINDOW_TYPES.WEBAPP,
      subType: params.windowType,
      teamId: params.teamId
    };

    windowActions.addWindow(windowCreationOptions);
    return browserWindow;
  }

  /**
   * Create a component window (about box, modals) that automatically renders a
   * React Component. Place component files in ../renderer/components, using
   * the component's dasherized name as filename.
   *
   * @param ...{Object} params          Options applied to the BrowserWindow.
   * @param {string} params.name        Name of the component (camelCase)
   * @param {string} params.component   Component file (overrides dasherized version of name)
   *
   * @returns {Electron.BrowserWindow}
   */

  private createComponentWindow(...params: Array<any>): Electron.BrowserWindow | null {
    const mainWindow = windowStore.getMainWindow();
    if (!mainWindow) {
      throw new Error(`Unexpectedly, main window cannot be located in store while trying to
                       create component window with given option ${params}`);
    }

    const options = assignIn(this.getSlackWindowOpts(), {
      show: false,
      center: true,
      height: 300,
      width: 300,
      resizable: false,
      minimizable: false,
      maximizable: false,
      parent: BrowserWindow.fromId(mainWindow.id),
      bootstrapScript: require.resolve('../renderer/components/component-window-main'),
    }, ...params);

    if (this.state.isTitleBarHidden) {
      options.titleBarStyle = 'hidden-inset';
    }

    // Add titlebar height
    options.height = this.state.isMac ? options.height : options.height + 24;

    // Add bootstrap script
    if (options.name && !options.component) {
      options.component = `./${kebabCase(options.name)}`;
    } else {
      logger.error('createComponentWindow requires either a name or a component property');
      return null;
    }

    const browserWindow = new BrowserWindow(options);
    browserWindow.on('ready-to-show', () => browserWindow.show());
    browserWindow.setMenu(null as any);

    this.preventWindowNavigation(browserWindow);
    loadWindowFileUrl(browserWindow, options);
    return browserWindow;
  }

  private getSlackWindowOpts() {
    return {
      webPreferences: {
        preload: require.resolve('../static/index.js')
      },
      show: false,
      icon: this.state.isWin10 ? resolveImage('app-win10.ico') : undefined,
      resourcePath: this.state.resourcePath,
      title: this.state.title,
      version: this.state.appVersion,
      useHwAcceleration: this.state.useHwAcceleration,
      autoHideMenuBar: this.state.autoHideMenuBar,
      acceptFirstMouse: !this.state.isMac
    };
  }

  private getNotificationWindowOpts() {
    return assignIn(this.getSlackWindowOpts(), {
      windowType: WINDOW_TYPES.NOTIFICATIONS,
      bootstrapScript: require.resolve('../notification/main'),
      show: false,
      frame: false,
      transparent: true,
      resizable: false,
      title: this.state.title,
      acceptFirstMouse: true,
      alwaysOnTop: true,
      skipTaskbar: true
    });
  }

  private getWebappWindowOpts() {
    return {
      windowType: WINDOW_TYPES.WEBAPP,
      show: true,
      center: true,
      title: '',
      x: Number.NaN,
      y: Number.NaN,
      width: 500,
      height: 500,
      autoHideMenuBar: true,
      minWidth: 200,
      minHeight: 80,
      webPreferences: {
        preload: require.resolve('../static/ssb-interop'),
        nodeIntegration: false
      },
      fullscreen: false,
      fullscreenable: false
    };
  }

  /**
   * Waits for the window to load, then sets information that enables
   * `executeJavaScriptMethod`.
   *
   * @param  {BrowserWindow} browserWindow  The child window
   * @param  {Object}         senderInfo    Identifies the `WebContents`
   * @return {Subscription}                   A Subscription that will unsubscribe the event
   */
  private setParentInformation(browserWindow: Electron.BrowserWindow, senderInfo: object): Subscription {
    const parentInfoFailed = (error: Error) => {
      logger.error(`Setting parentInfo failed: ${error.message}`);
      return Observable.of(false);
    };

    const jsonSenderInfo = JSON.stringify(senderInfo);

    return Observable.fromEvent(browserWindow.webContents, 'dom-ready')
      .flatMap(() => remoteEval(browserWindow, `window.parentInfo = ${jsonSenderInfo}`)
        .catch((e: Error) => parentInfoFailed(e)))
      .catch((e) => parentInfoFailed(e))
      .subscribe();
  }

  /**
   * Forwards events from a child window to the sender's JavaScript context.
   *
   * @param  {BrowserWindow}  browserWindow The child window
   * @param  {WebContents}    sender        The `WebContents` that requested the window
   *
   * @return {Subscription} A Subscription that will clean up what this method did
   */
  private relayWindowEvents(browserWindow: Electron.BrowserWindow, sender: Electron.WebContents): Subscription {
    const windowId = browserWindow.id;
    const disp = new Subscription();

    const executeJavaScriptFailed = (eventName: string, error: Error) => {
      logger.error(`exec-js after ${eventName} failed: ${error.message}`);
      return Observable.of(false);
    };

    executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenBeganLoading', windowId)
      .catch((e: Error) => executeJavaScriptFailed('loading', e));

    disp.add(Observable.fromEvent(browserWindow.webContents, 'did-finish-load')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenFinishedLoading', windowId)
        .catch((e: Error) => executeJavaScriptFailed('didFinishLoad', e)))
      .catch((e) => executeJavaScriptFailed('didFinishLoad', e))
      .subscribe());

    disp.add(Observable.fromEvent(browserWindow.webContents, 'crashed')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenCrashed', windowId)
        .catch((e: Error) => executeJavaScriptFailed('crashed', e)))
      .catch((e) => executeJavaScriptFailed('crashed', e))
      .subscribe());

    const resizedOrMoved = Observable.merge(
      Observable.fromEvent(browserWindow, 'resize'),
      Observable.fromEvent(browserWindow, 'move')
    );

    disp.add(resizedOrMoved.throttleTime(250)
      .map(() => {
        const [x, y] = browserWindow.getPosition();
        const [width, height] = browserWindow.getSize();
        return { x, y, width, height };
      })
      .flatMap((geometry) => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenDidChangeGeometry', windowId, geometry)
        .catch((e: Error) => executeJavaScriptFailed('resizedOrMoved', e)))
      .catch((e) => executeJavaScriptFailed('resizedOrMoved', e))
      .subscribe());

    disp.add(Observable.fromEvent(browserWindow, 'focus')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenBecameKey', windowId)
        .catch((e: Error) => executeJavaScriptFailed('focus', e)))
      .catch((e) => executeJavaScriptFailed('focus', e))
      .subscribe());

    disp.add(Observable.fromEvent(browserWindow, 'blur')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenResignedKey', windowId)
        .catch((e: Error) => executeJavaScriptFailed('blur', e)))
      .catch((e) => executeJavaScriptFailed('blur', e))
      .subscribe());

    // NB: This will remove the window from the webapp's internal list, but on
    // quit we should make sure that list keeps its content. That way, the next
    // time around the webapp will ask to restore those windows.
    disp.add(Observable.fromEvent(browserWindow, 'close')
      .filter(() => !this.isQuitting)
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenWillClose', windowId)
        .catch((e: Error) => executeJavaScriptFailed('close', e)))
      .catch((e) => executeJavaScriptFailed('close', e))
      .subscribe());

    return disp;
  }

  private preventWindowNavigation(browserWindow: Electron.BrowserWindow): void {
    browserWindow.webContents.on('will-navigate', (e, url) => {
      // NB: Let page reloads through.
      if (url === browserWindow.webContents.getURL()) return;

      e.preventDefault();

      if (url.startsWith(SLACK_PROTOCOL)) {
        eventActions.handleDeepLink(url);
      } else {
        logger.info(`Preventing navigation to: ${url}`);
      }
    });
  }
}

const windowCreator = new WindowCreator();
export {
  windowCreator
};
