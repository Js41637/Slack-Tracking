import {ipcMain, BrowserWindow} from 'electron';
const {app} = require('electron');
import _ from 'lodash';
import logger from '../logger';
import {executeJavaScriptMethod, remoteEval} from 'electron-remote';
import {Observable, Disposable, CompositeDisposable} from 'rx';

import AppActions from '../actions/app-actions';
import AppMenu from '../components/app-menu';
import BrowserWindowManager from './browser-window-manager';
import DownloadListener from './download-listener';
import EventActions from '../actions/event-actions';
import DarwinSwipeBehavior from './behaviors/darwin-swipe-behavior';
import ExternalLinkBehavior from '../renderer/behaviors/external-link-behavior';
import MainWindowCloseBehavior from './behaviors/main-window-close-behavior';
import MetricsReporter from './metrics-reporter';
import NotificationWindowManager from './notification-window-manager';
import PersistSettingsWindowBehavior from './behaviors/persist-settings-window-behavior';
import ReduxComponent from '../lib/redux-component';
import RepositionWindowBehavior from './behaviors/reposition-window-behavior';
import SettingStore from '../stores/setting-store';
import Store from '../lib/store';
import WindowActions from '../actions/window-actions';
import WindowFlashNotificationManager from './window-flash-notification-manager';
import WindowHelpers from '../components/helpers/window-helpers';
import WindowStore from '../stores/window-store';

import {SLACK_PROTOCOL} from '../reducers/app-reducer';
import {SIDEBAR_WIDTH_NO_TITLE_BAR} from '../utils/shared-constants';

const {reportRendererCrashes, reportWindowMetrics, loadWindowFileUrl} = WindowHelpers;

let electronScreen;

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
  }

  syncState() {
    return {
      title: 'Slack',
      isMac: SettingStore.isMac(),
      isWindows: SettingStore.isWindows(),
      isWin10: SettingStore.getSetting('isWin10'),
      appVersion: SettingStore.getSetting('appVersion'),
      resourcePath: SettingStore.getSetting('resourcePath'),
      autoHideMenuBar: SettingStore.getSetting('autoHideMenuBar'),
      isTitleBarHidden: SettingStore.getSetting('isTitleBarHidden'),
      useHwAcceleration: SettingStore.isUsingHardwareAcceleration(),
      isShowingHtmlNotifications: SettingStore.isShowingHtmlNotifications(),
      isDevMode: SettingStore.getSetting('isDevMode')
    };
  }

  /**
   * Creates and initializes the main app window.
   *
   * @param  {Object} params An object containing BrowserWindow arguments
   * @return {BrowserWindow}  The created window
   */
  createMainWindow(params) {
    let options = _.assign({}, this.getSlackWindowOpts(), params);
    options.windowType = WindowStore.MAIN;
    options.bootstrapScript = require.resolve('../renderer/main');

    if (this.state.isMac) {
      options.minWidth = 768 + SIDEBAR_WIDTH_NO_TITLE_BAR; // Minimum webapp size + sidebar width
      options.minHeight = 400;
    } else {
      options.minWidth = 400; // Windows'ers care about this
      options.minHeight = 300;
    }

    if (this.state.isTitleBarHidden) {
      options.titleBarStyle = 'hidden';
    }

    let setEmptyWindowIcon = this.actionToClearWindowIcon(options);

    let browserWindow = new BrowserWindow(options);
    let disposable = new CompositeDisposable();

    WindowActions.addWindow(browserWindow.id, WindowStore.MAIN);

    let windowCloseBehavior = new MainWindowCloseBehavior();
    let behaviors = [
      windowCloseBehavior,
      new RepositionWindowBehavior(),
      new PersistSettingsWindowBehavior()
    ];

    if (this.state.isMac) {
      behaviors.push(new DarwinSwipeBehavior());
    }

    _.forEach(behaviors, (behavior) => {
      disposable.add(behavior.setup(browserWindow));
    });

    browserWindow.on('focus', EventActions.focusPrimaryTeam);
    browserWindow.on('app-command', (e, cmd) => EventActions.appCommand(cmd));

    browserWindow.webContents.once('dom-ready', () => {
      this.mainWindowFinishedLoad(browserWindow, options, setEmptyWindowIcon);
    });

    browserWindow.on('close', (e) => {
      if (windowCloseBehavior.canWindowBeClosed(browserWindow)) {
        // Hide immediately to appear more responsive.
        browserWindow.hide();

        // Dispose all the child components and attached behaviors. Note that
        // this disposes `BrowserWindowManager`, which first closes all other
        // windows. So we can guarantee we're the last survivor.
        disposable.dispose();
      } else {
        // The window was hidden by the behavior, just cancel the close.
        e.preventDefault();
      }
    });

    browserWindow.once('closed', () => {
      // Save the store after the main window is closed, because settings can
      // change as a result of React components unmounting or window behaviors
      // being disposed.
      Store.saveSync();

      app.quit();
    });

    loadWindowFileUrl(browserWindow, options);
    this.preventWindowNavigation(browserWindow);

    disposable.add(this.createChildComponents(browserWindow));

    disposable.add(new Disposable(() => {
      global.application.dispose();
      WindowActions.removeWindow(browserWindow.id);
    }));

    return browserWindow;
  }

  /**
   * Occurs when the main app window finishes loading.
   *
   * @param  {BrowserWindow} mainWindow The main window
   * @param  {Object} options An object containing BrowserWindow arguments
   * @param  {Function} setEmptyWindowIcon A method used to clear the icon
   */
  mainWindowFinishedLoad(mainWindow, options, setEmptyWindowIcon) {
    logger.info(`Main window finished load. Launched on login: ${options.invokedOnStartup}`);
    setTimeout(setEmptyWindowIcon, 5 * 1000);

    if (options.protoUrl) {
      EventActions.handleDeepLink(options.protoUrl);
    }

    // NB: We have to wait for the window to finish load before minimizing,
    // otherwise the app never loads.
    if (options.invokedOnStartup) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    if (options.openDevToolsOnStart) {
      AppActions.toggleDevTools();
    }
  }

  /**
   * Creates browser components that depend on the main app window.
   *
   * @param  {BrowserWindow} mainWindow The main window
   * @return {Disposable} A Disposable that will clean up all child components
   */
  createChildComponents(mainWindow) {
    let disp = new CompositeDisposable();
    let windowManager = new BrowserWindowManager(mainWindow);
    disp.add(Disposable.create(() => windowManager.dispose()));

    if (!this.state.isMac) {
      let appMenu = new AppMenu(mainWindow);
      disp.add(Disposable.create(() => appMenu.dispose()));
    }

    if (this.state.isWindows) {
      let windowFlashManager = new WindowFlashNotificationManager(mainWindow);
      disp.add(Disposable.create(() => windowFlashManager.dispose()));
    }

    if (this.state.isShowingHtmlNotifications) {
      let notificationWindowManager = new NotificationWindowManager(mainWindow);
      disp.add(Disposable.create(() => notificationWindowManager.dispose()));
    }

    let downloadListener = new DownloadListener(mainWindow);
    disp.add(Disposable.create(() => downloadListener.dispose()));

    let metricsReporter = new MetricsReporter(mainWindow);
    disp.add(Disposable.create(() => metricsReporter.dispose()));

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
    let disposable = new CompositeDisposable();

    loadWindowFileUrl(browserWindow, options);
    this.preventWindowNavigation(browserWindow);

    WindowActions.addWindow(windowId, WindowStore.NOTIFICATIONS);
    disposable.add(new Disposable(() => WindowActions.removeWindow(windowId)));

    browserWindow.once('close', () => {
      logger.info('Notifications window closed, disposing');
      disposable.dispose();
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
    let agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Slack/2.0.2 Chrome/47.0.2526.110 AtomShell/0.36.9 Safari/537.36 Slack_SSB/2.0.2";

    return this.createWebappWindow({
      url: 'about:blank',
      width: 1024,
      height: 768,
      userAgent: agent
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
  createWebappWindow(params, sender=null) {
    let options = this.getWebappWindowOpts();

    // Override default options with params, handling any custom options
    let customParamsMap = {
      hideMenuBar: 'autoHideMenuBar'
    };

    _.forEach(params, (value, key) => {
      let option = customParamsMap[key] === undefined ? key : customParamsMap[key];
      options[option] = value;
    });

    logger.info(`Creating webapp window with ${JSON.stringify(_.omit(options, ['url', 'content_html']))}`);

    let browserWindow = new BrowserWindow(options);
    let windowId = browserWindow.id;
    let disposable = new CompositeDisposable();

    let repositionWindow = new RepositionWindowBehavior({
      recalculateWindowPositionFunc: browserWindow.center
    });
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

    disposable.add(new Disposable(() => WindowActions.removeWindow(windowId)));

    browserWindow.once('close', () => {
      browserWindow.hide();

      logger.info('Webapp window closed, disposing');
      disposable.dispose();
    });

    WindowActions.addWindow(windowId, WindowStore.WEBAPP);
    return browserWindow;
  }

  /**
   * Creates a new window used for the About box.
   *
   * @return {BrowserWindow}  The created window
   */
  createAboutWindow() {
    let options = _.extend(this.getSlackWindowOpts(), {
      show: false,
      center: true,
      width: 320,
      height: this.state.isMac ? 304 : 328, // Add the titlebar height
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      bootstrapScript: require.resolve('../renderer/components/about-box-main'),
    });

    if (this.state.isTitleBarHidden) {
      options.titleBarStyle = 'hidden-inset';
    }

    let browserWindow = new BrowserWindow(options);
    browserWindow.webContents.on('did-finish-load', () => browserWindow.show());
    browserWindow.setMenu(null);

    this.preventWindowNavigation(browserWindow);
    loadWindowFileUrl(browserWindow, options);
    return browserWindow;
  }

  /**
   * Creates a new window used for running tests.
   *
   * @return {BrowserWindow}  The created window
   */
  createSpecsWindow() {
    let size = this.getSpecsWindowSize();

    let options = _.extend(this.getSlackWindowOpts(), {
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
      resourcePath: this.state.resourcePath,
      title: this.state.title,
      version: this.state.appVersion,
      useHwAcceleration: this.state.useHwAcceleration,
      autoHideMenuBar: this.state.autoHideMenuBar,
      acceptFirstMouse: !this.state.isMac
    };
  }

  getNotificationWindowOpts() {
    return _.extend(this.getSlackWindowOpts(), {
      windowType: WindowStore.NOTIFICATIONS,
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
      windowType: WindowStore.WEBAPP,
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
    electronScreen = electronScreen || require('electron').screen;

    const minWidth = 700;
    const minHeight = 700;
    const displayFillPercentage = {
      x: 0.65,
      y: 0.65
    };

    let {size: [width, height]} = RepositionWindowBehavior.calculateDefaultPosition(electronScreen, null, displayFillPercentage);

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
   * @return {Disposable}                   A `Disposable` that will unsubscribe the event
   */
  setParentInformation(browserWindow, senderInfo) {
    let parentInfoFailed = (error) => {
      logger.error(`Setting parentInfo failed: ${error.message}`);
      return Observable.return(false);
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
   * @return {Disposable} A `Disposable` that will clean up what this method did
   */
  relayWindowEvents(browserWindow, sender) {
    let windowId = browserWindow.id;
    let disp = new CompositeDisposable();

    let executeJavaScriptFailed = (eventName, error) => {
      logger.error(`exec-js after ${eventName} failed: ${error.message}`);
      return Observable.return(false);
    };

    executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenBeganLoading', windowId);

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

    disp.add(resizedOrMoved.throttle(250)
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

    disp.add(Observable.fromEvent(browserWindow, 'close')
      .flatMap(() => executeJavaScriptMethod(sender, 'TSSSB.windowWithTokenWillClose', windowId)
        .catch((e) => executeJavaScriptFailed('close', e)))
      .catch((e) => executeJavaScriptFailed('close', e))
      .subscribe());

    return disp;
  }

  /**
   * Windows 10 apps don't display window icons, so replace the icon with an
   * empty one.
   *
   * @param  {Object} options Options to pass to the BrowserWindow
   * @return {function}       A method that will clear the icon
   */
  actionToClearWindowIcon(options) {
    if (this.state.isWin10 && !this.state.isDevMode) {
      options.icon = require.resolve('../static/spaceball.png')
        .replace('app.asar', 'app.asar.unpacked');

      return () => {
        let iconPath = require.resolve('../static/app-win10.ico')
          .replace('app.asar', 'app.asar.unpacked');
        require('../csx/set-window-icon').default(iconPath);
      };
    } else {
      return () => {};
    }
  }

  preventWindowNavigation(browserWindow) {
    browserWindow.webContents.on('will-navigate', (e, url) => {
      // NB: Let page reloads through.
      if (url === browserWindow.webContents.getURL()) return;

      e.preventDefault();

      if (url.startsWith(SLACK_PROTOCOL)) {
        EventActions.handleDeepLink(url);
      } else {
        logger.info(`Preventing navigation to: ${url}`);
      }
    });
  }
}

export default new WindowCreator();
