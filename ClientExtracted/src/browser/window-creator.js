import {ipcMain, BrowserWindow} from 'electron';
import profiler from '../utils/profiler';

const {app} = require('electron');
import {omit} from '../utils/omit';
import assignIn from 'lodash.assignin';
import kebabCase from 'lodash.kebabcase';
import {logger} from '../logger';
import {executeJavaScriptMethod, remoteEval} from 'electron-remote';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';

import AppMenu from '../components/app-menu';
import BrowserWindowManager from './browser-window-manager';
import {dialogActions} from '../actions/dialog-actions';
import DownloadListener from './download-listener';
import {eventActions} from '../actions/event-actions';
import {DarwinSwipeBehavior} from './behaviors/darwin-swipe-behavior';
import ExternalLinkBehavior from '../renderer/behaviors/external-link-behavior';
import {MainWindowCloseBehavior} from './behaviors/main-window-close-behavior';
import {MetricsReporter} from './metrics-reporter';
import NotificationWindowManager from './notification-window-manager';
import {PersistSettingsWindowBehavior} from './behaviors/persist-settings-window-behavior';
import ReduxComponent from '../lib/redux-component';
import {RepositionWindowBehavior} from './behaviors/reposition-window-behavior';
import {settingStore} from '../stores/setting-store';
import {windowActions} from '../actions/window-actions';
import {windowFrameActions} from '../actions/window-frame-actions';
import WindowFlashNotificationManager from './window-flash-notification-manager';
import {WindowHelpers} from '../components/helpers/window-helpers';
import WindowStore from '../stores/window-store';
import {resolveImage} from '../utils/resolve-image';

import {SLACK_PROTOCOL} from '../reducers/app-teams-reducer';
import {WINDOW_TYPES, SIDEBAR_WIDTH_NO_TITLE_BAR} from '../utils/shared-constants';

const {reportRendererCrashes, reportWindowMetrics, loadWindowFileUrl} = WindowHelpers;

/**
 * Singleton that creates windows. Handles some basic Slack window behaviors.
 */
class WindowCreator extends ReduxComponent {

  constructor() {
    super();

    /**
     * We only want to create windows in the main process (remote event
     * handlers are unreliable). But the webapp needs to know the ID of the
     * created window synchronously, so set the `returnValue`.
     */
    ipcMain.on('create-webapp-window', (e, options) => {
      let webappWindow = this.createWebappWindow(options, e.sender);
      e.returnValue = webappWindow.id;
    });

    ipcMain.on('inter-window-message', (event, window_token, window_type, ...args) => {
      let browserWindow = null;
      if (window_token) {
        browserWindow = BrowserWindow.fromId(parseInt(window_token));
      } else if (window_type) {
        let metadata = WindowStore.getWindowOfSubType(window_type);
        if (metadata) browserWindow = BrowserWindow.fromId(parseInt(metadata.id));
      }
      if (browserWindow) {
        if (browserWindow.webContents.isDestroyed() || browserWindow.webContents.isCrashed()) return;

        browserWindow.webContents.send('inter-window-message', ...args);
      } else {
        logger.error("inter-window-message: couldn't find browserWindow");
      }
    });
  }

  syncState() {
    return {
      title: 'Slack',
      isMac: settingStore.isMac(),
      isWindows: settingStore.isWindows(),
      isWin10: settingStore.getSetting('isWin10'),
      appVersion: settingStore.getSetting('appVersion'),
      resourcePath: settingStore.getSetting('resourcePath'),
      autoHideMenuBar: settingStore.getSetting('autoHideMenuBar'),
      isTitleBarHidden: settingStore.getSetting('isTitleBarHidden'),
      useHwAcceleration: settingStore.isUsingHardwareAcceleration(),
      isShowingHtmlNotifications: settingStore.isShowingHtmlNotifications(),
      isDevMode: settingStore.getSetting('isDevMode')
    };
  }

  /**
   * Creates and initializes the main app window.
   *
   * @param  {Object} params An object containing BrowserWindow arguments
   * @return {BrowserWindow}  The created window
   */
  createMainWindow(params) {
    let options = {...this.getSlackWindowOpts(), ...params};
    options.windowType = WINDOW_TYPES.MAIN;
    options.bootstrapScript = require.resolve('../renderer/main');

    if (this.state.isWin10) {
      options.frame = false;
    }

    if (this.state.isMac) {
      // Minimum webapp size + the sidebar width, if it is visible
      options.minWidth = 600 + (this.state.isTitleBarHidden ? SIDEBAR_WIDTH_NO_TITLE_BAR : 0);
      options.minHeight = 400;
    } else {
      // Windows'ers tend to have lower resolutions and care about this
      options.minWidth = 400;
      options.minHeight = 300;
    }

    if (this.state.isTitleBarHidden) {
      options.titleBarStyle = 'hidden';
    }

    let browserWindow = new BrowserWindow(options);
    let disposable = new Subscription();

    windowActions.addWindow({windowId: browserWindow.id, windowType: WINDOW_TYPES.MAIN});

    let windowCloseBehavior = new MainWindowCloseBehavior();
    let behaviors = [
      windowCloseBehavior,
      new RepositionWindowBehavior(),
      new PersistSettingsWindowBehavior()
    ];

    if (this.state.isMac) {
      behaviors.push(new DarwinSwipeBehavior());
    }

    behaviors.forEach((behavior) => {
      disposable.add(behavior.setup(browserWindow));
    });

    browserWindow.on('enter-full-screen', () => {
      windowFrameActions.setFullScreen(true);
    });

    browserWindow.on('leave-full-screen', () => {
      windowFrameActions.setFullScreen(false);
    });

    browserWindow.on('focus', eventActions.mainWindowFocused);
    browserWindow.on('app-command', (e, cmd) => {
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
   * The ready-to-show event is broken since Electron 1.3.7, but when it's
   * fixed we should switch back to it.
   */
  windowReadyEvent(browserWindow) {
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
  onMainWindowReady(mainWindow, options) {
    logger.info(`Main window finished load. Launched on login: ${options.invokedOnStartup}`);

    // NB: We have to wait for the window to finish load before minimizing,
    // otherwise the app never loads.
    if (options.invokedOnStartup) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    if (options.openDevToolsOnStart) {
      dialogActions.toggleDevTools();
    }

    if (profiler.shouldProfile()) profiler.stopProfiling('main');
  }

  /**
   * Creates browser components that depend on the main app window.
   *
   * @param  {BrowserWindow} mainWindow The main window
   * @return {Subscription} A Subscription that will clean up all child components
   */
  createChildComponents(mainWindow) {
    let disp = new Subscription();
    let windowManager = new BrowserWindowManager(mainWindow);
    disp.add(() => windowManager.dispose());

    if (!this.state.isMac) {
      let appMenu = new AppMenu(mainWindow);
      disp.add(() => appMenu.dispose());
    }

    if (this.state.isWindows) {
      let windowFlashManager = new WindowFlashNotificationManager(mainWindow);
      disp.add(() => windowFlashManager.dispose());
    }

    if (this.state.isShowingHtmlNotifications) {
      let notificationWindowManager = new NotificationWindowManager(mainWindow);
      disp.add(() => notificationWindowManager.dispose());
    }

    let downloadListener = new DownloadListener(mainWindow);
    disp.add(() => downloadListener.dispose());

    let metricsReporter = new MetricsReporter(mainWindow);
    disp.add(() => metricsReporter.dispose());

    disp.add(reportWindowMetrics(mainWindow, metricsReporter));
    disp.add(reportRendererCrashes(mainWindow, metricsReporter));
    return disp;
  }

  /**
   * Creates and initializes the window used for HTML notifications.
   *
   * @return {BrowserWindow}  The created window
   */
  createNotificationsWindow() {
    logger.info('Creating notifications window');

    let options = this.getNotificationWindowOpts();
    let browserWindow = new BrowserWindow(options);
    let windowId = browserWindow.id;
    let disposable = new Subscription();

    loadWindowFileUrl(browserWindow, options);
    this.preventWindowNavigation(browserWindow);

    windowActions.addWindow({windowId: windowId, windowType: WINDOW_TYPES.NOTIFICATIONS});
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
  createChromeDriverWindow() {
    logger.info("Creating main window for ChromeDriver in webapp mode");

    // NB: Normally we'd be calling this method from a renderer, where we can get
    // our existing User Agent, but since we'll be calling it from the Browser
    // where we can't get the user agent, we'll have to fake it up.
    let userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Slack/2.0.2 Chrome/47.0.2526.110 AtomShell/0.36.9 Safari/537.36 Slack_SSB/2.0.2";

    return this.createWebappWindow({
      url: 'about:blank',
      width: 1024,
      height: 768,
      userAgent
    });
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
  createWebappWindow(params = {}, sender=null) {
    let options = this.getWebappWindowOpts();

    // Override default options with params, handling any custom options
    let customParamsMap = {
      hideMenuBar: 'autoHideMenuBar'
    };

    // Ensure that the new window pops up on the same screen as the app
    let rect = {x: params.x, y: params.y, width: params.width, height: params.height};
    let senderWindow = BrowserWindow.fromWebContents(sender) || BrowserWindow.getFocusedWindow();
    Object.assign(params, RepositionWindowBehavior.moveRectToDisplay(rect, senderWindow));

    Object.keys(params).forEach((key) => {
      let value = params[key];
      let option = customParamsMap[key] === undefined ? key : customParamsMap[key];
      options[option] = value;
    });

    options.fullscreen = (params.fullscreen !== undefined) ? params.fullscreen : false;
    options.fullscreenable = (params.fullscreenable !== undefined) ? params.fullscreenable : true;
    options = RepositionWindowBehavior.getValidWindowPositionAndSize(options);

    logger.info(`Creating webapp window with ${JSON.stringify(omit(options, 'url', 'content_html'))}`);

    let browserWindow = new BrowserWindow(options);
    let windowId = browserWindow.id;
    let disposable = new Subscription();

    let repositionWindow = new RepositionWindowBehavior(browserWindow.center);
    disposable.add(repositionWindow.setup(browserWindow));
    disposable.add(ExternalLinkBehavior.setup(browserWindow.webContents));

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
      windowId: windowId,
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

  createComponentWindow(...params) {
    let options = assignIn(this.getSlackWindowOpts(), {
      show: false,
      center: true,
      height: 300,
      width: 300,
      resizable: false,
      minimizable: false,
      maximizable: false,
      parent: BrowserWindow.fromId(WindowStore.getMainWindow().id),
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
      return;
    }

    let browserWindow = new BrowserWindow(options);
    browserWindow.on('ready-to-show', () => browserWindow.show());
    browserWindow.setMenu(null);

    this.preventWindowNavigation(browserWindow);
    loadWindowFileUrl(browserWindow, options);
    return browserWindow;
  }

  /**
   * Creates a new window used for the About box.
   *
   * @return {BrowserWindow}  The created window
   */
  createAboutWindow() {
    return this.createComponentWindow({
      width: 320,
      height: 304,
      name: 'aboutBox',
      parent: null,
      windowType: WINDOW_TYPES.OTHER,
      title: 'About Slack'
    });
  }

  /**
   * Creates a new window used for running tests.
   *
   * @return {BrowserWindow}  The created window
   */
  createSpecsWindow() {
    let size = this.getSpecsWindowSize();

    let options = assignIn(this.getSlackWindowOpts(), {
      show: true,
      isSpec: true,
      width: size.width,
      height: size.height,
      minWidth: size.minWidth,
      minHeight: size.minHeight,
      pathname: `${this.state.resourcePath}/src/static/mocha.html`,
      devMode: this.state.isDevMode,
      logFile: this.state.logFile
    });

    let browserWindow = new BrowserWindow(options);
    loadWindowFileUrl(browserWindow, options);

    return browserWindow;
  }

  getSlackWindowOpts() {
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

  getNotificationWindowOpts() {
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

  getWebappWindowOpts() {
    return {
      windowType: WINDOW_TYPES.WEBAPP,
      show: true,
      center: true,
      title: "",
      x: "",
      y: "",
      width: 500,
      height: 500,
      autoHideMenuBar: true,
      minWidth: 200,
      minHeight: 80,
      webPreferences: {
        preload: require.resolve('../static/ssb-interop'),
        nodeIntegration: false
      }
    };
  }

  getSpecsWindowSize() {
    const minWidth = 700;
    const minHeight = 700;
    const displayFillPercentage = {
      x: 0.65,
      y: 0.65
    };

    let {size: [width, height]} = RepositionWindowBehavior.calculateDefaultPosition(null, displayFillPercentage);

    return {
      width: width < minWidth ? minWidth : width,
      height: height < minHeight ? minHeight : height,
      minWidth: minWidth,
      minHeight: minHeight
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
  setParentInformation(browserWindow, senderInfo) {
    let parentInfoFailed = (error) => {
      logger.error(`Setting parentInfo failed: ${error.message}`);
      return Observable.of(false);
    };

    let jsonSenderInfo = JSON.stringify(senderInfo);

    return Observable.fromEvent(browserWindow.webContents, 'dom-ready')
      .flatMap(() => remoteEval(browserWindow, `window.parentInfo = ${jsonSenderInfo}`)
        .catch((e) => parentInfoFailed(e)))
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
  relayWindowEvents(browserWindow, sender) {
    let windowId = browserWindow.id;
    let disp = new Subscription();

    let executeJavaScriptFailed = (eventName, error) => {
      logger.error(`exec-js after ${eventName} failed: ${error.message}`);
      return Observable.of(false);
    };

    executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenBeganLoading', windowId)
      .catch((e) => executeJavaScriptFailed('loading', e));

    disp.add(Observable.fromEvent(browserWindow.webContents, 'did-finish-load')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenFinishedLoading', windowId)
        .catch((e) => executeJavaScriptFailed('didFinishLoad', e)))
      .catch((e) => executeJavaScriptFailed('didFinishLoad', e))
      .subscribe());

    disp.add(Observable.fromEvent(browserWindow.webContents, 'crashed')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenCrashed', windowId)
        .catch((e) => executeJavaScriptFailed('crashed', e)))
      .catch((e) => executeJavaScriptFailed('crashed', e))
      .subscribe());

    let resizedOrMoved = Observable.merge(
      Observable.fromEvent(browserWindow, 'resize'),
      Observable.fromEvent(browserWindow, 'move')
    );

    disp.add(resizedOrMoved.throttleTime(250)
      .map(() => {
        let [x,y] = browserWindow.getPosition();
        let [width, height] = browserWindow.getSize();
        return { x, y, width, height };
      })
      .flatMap((geometry) => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenDidChangeGeometry', windowId, geometry)
        .catch((e) => executeJavaScriptFailed('resizedOrMoved', e)))
      .catch((e) => executeJavaScriptFailed('resizedOrMoved', e))
      .subscribe());

    disp.add(Observable.fromEvent(browserWindow, 'focus')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenBecameKey', windowId)
        .catch((e) => executeJavaScriptFailed('focus', e)))
      .catch((e) => executeJavaScriptFailed('focus', e))
      .subscribe());

    disp.add(Observable.fromEvent(browserWindow, 'blur')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenResignedKey', windowId)
        .catch((e) => executeJavaScriptFailed('blur', e)))
      .catch((e) => executeJavaScriptFailed('blur', e))
      .subscribe());

    // NB: This will remove the window from the webapp's internal list, but on
    // quit we should make sure that list keeps its content. That way, the next
    // time around the webapp will ask to restore those windows.
    disp.add(Observable.fromEvent(browserWindow, 'close')
      .filter(() => !this.isQuitting)
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenWillClose', windowId)
        .catch((e) => executeJavaScriptFailed('close', e)))
      .catch((e) => executeJavaScriptFailed('close', e))
      .subscribe());

    return disp;
  }

  preventWindowNavigation(browserWindow) {
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

export default new WindowCreator();
