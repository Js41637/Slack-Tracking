/**
 * @module SSBIntegration
 */ /** for typedoc */

import { ipcRenderer, remote, screen as Screen } from 'electron';
import { getSenderIdentifier } from 'electron-remote';
import { difference } from 'lodash';
import { Signal } from 'signals';

import { logger } from '../logger';
import { getUserAgent } from '../ssb-user-agent';
import { RemoteEvalOption, executeRemoteEval } from './execute-remote-eval';
import { canAccessLocalStorage } from './post-dom-tasks';
import { getPostMessageTemplate } from './post-message';

import { ReduxComponent } from '../lib/redux-component';
import { Store } from '../lib/store';
import { windowStore } from '../stores/window-store';
import { StringMap, WINDOW_TYPES, WindowMetadata } from '../utils/shared-constants';
import { WindowHelpers } from '../utils/window-helpers';

const { BrowserWindow } = remote;

const LOCAL_STORAGE_PREFIX = 'webappWindowManager';
const LOCAL_STORAGE_REGEX = new RegExp(`^${LOCAL_STORAGE_PREFIX}_(\\d*)`);
const CLOSE_DEFERRAL_NEEDED = ['www.dropbox.com'];

function browserWindowFromToken(token: string): Electron.BrowserWindow {
  return BrowserWindow.fromId(parseInt(token, 10));
}

export interface WebappWindowManagerState {
  windows: StringMap<WindowMetadata>;
  subType: any;
}

export interface WebAppWindowOpenOptions {
  title: string;
  url: string;
  show: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  allowThirdPartyNavigation: boolean;
}
/**
 * Implements the Window API that allows the web app to open popup windows and
 * push them around.
 */
export class WebappWindowManager extends ReduxComponent<WebappWindowManagerState> {
  private readonly receiveMessageSignal = new Signal();
  private willNavigate: boolean = false;
  private closeRequested: boolean = false;
  private closingTimeout: string | NodeJS.Timer;
  private getActiveProcessName: () => string;

  constructor() {
    super();
    if (canAccessLocalStorage()) {
      this.doConsistencyCheck();
    }

    ipcRenderer.on('inter-window-message', (_event: Electron.Event, ...args: Array<any>) => {
      this.receiveMessageSignal.dispatch(...args);
    });

    if (CLOSE_DEFERRAL_NEEDED.includes(window.location.host)) this.deferClose();
  }

  public syncState(): Partial<WebappWindowManagerState> {
    return {
      windows: windowStore.getWindows([WINDOW_TYPES.WEBAPP]),
      subType: windowStore.subTypeOfWindow()
    };
  }

  /**
   * Stop tracking windows that the user just closed.
   */
  public update(prevState: Partial<WebappWindowManagerState> = {}): void {
    if (this.state.windows !== prevState.windows) {
      const removedWindows = difference(Object.keys(prevState.windows), Object.keys(this.state.windows));
      removedWindows.forEach((win: any) => this.removeKeyForWindowId(win));
    }
  }

  /**
   * Opens a new popup window.
   *
   * @param {Object}  params
   * @param {String}  params.title                      The window title
   * @param {String}  params.url                        The URL to navigate to
   * @param {Boolean} params.show                       True to show the window immediately, false to keep it hidden
   * @param {Number}  params.x                          The x coordinate of the window
   * @param {Number}  params.y                          The y coordinate of the window
   * @param {Number}  params.width                      The width of the window
   * @param {Number}  params.height                     The height of the window
   * @param {Boolean} params.allowThirdPartyNavigation  True if trying to open an non-Slack URL
   *
   * @return {Number} A token identifying the window for future calls
   */
  public open(params: Partial<WebAppWindowOpenOptions> = {}): number {
    Object.assign(params, {
      teamId: (global as any).teamId,
      userAgent: getUserAgent(),
      parentInfo: getSenderIdentifier(),
      isPopupWindow: params.allowThirdPartyNavigation || window.TSSSB.canUrlBeOpenedInSSBWindow(params.url!)
    });

    try {
      // Create the window in the main process, and use a synchronous IPC call
      // to get the ID back to us. We create it there to avoid attaching remote
      // event handlers.
      const windowId = (ipcRenderer.sendSync as any)('create-webapp-window', params);

      // Stash the parameters used to create this window in localStorage, so
      // that we can tell the webapp about them later.
      if (canAccessLocalStorage()) {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}_${windowId}`, JSON.stringify(params));
      }

      // Return the token to the webapp, so we're all on the same page.
      return windowId;
    } catch (error) {
      logger.error(`Creating webapp window failed: ${error}`);
      return -1;
    }
  }

  /**
   * Takes a "open in Browser" Slack url, authenticates it using the API, and then opens
   * the returned url in a browser, if the returned url begins with https.
   *
   * @param {string} url
   * @returns {Promise<void>} Promise that resolves once the link is opened
   */
  public async openAuthenticatedInBrowser(url: string): Promise<void> {
    const response = await fetch(url, { credentials: 'include' });

    if (response.status === 404) {
      throw new Error(`Response not valid: url does not exist`);
    }

    let result;

    try {
      result = await response.json();
    } catch (error) {
      throw new Error(`Couldn't parse response: ${error.message}`);
    }

    if (!result || !result.url) {
      throw new Error('Response not valid: Did not contain url');
    }

    if (!result.url.startsWith('https://')) {
      throw new Error('Response not valid: Url did not start with https://');
    }

    try {
      logger.info(`Opening authenticated Slack url in browser ${result.url}`);
      remote.shell.openExternal(result.url);
    } catch (error) {
      logger.error('Tried to open authenticated url in browser, but failed', error);
      throw new Error('Tried to open authenticated url in browser, but failed');
    }
  }

  /**
   * Returns a list of all currently active windows created with `open`.
   *
   * @return {String}  A stringified JSON dictionary whose keys are window
   * tokens, and whose values are the original metadata values passed to `open`
   */
  public list(): string {
    if (!canAccessLocalStorage()) return '{}';

    const windowMetadata = Object.keys(localStorage).reduce((acc, key) => {
      const match = key.match(LOCAL_STORAGE_REGEX);
      if (match) {
        const [, windowToken] = match;
        acc[windowToken] = JSON.parse(localStorage.getItem(key)!);
      }
      return acc;
    }, {});

    return JSON.stringify(windowMetadata);
  }

  /**
   * Dispatches an event from the parent window to the popup's context, using
   * the `executeJavaScript` method
   *
   * @param  {String} data            Data to attach to the `Event`
   * @param  {Object} data            Data to attach to the `Event`
   * @param  {String} window_token    The value you got from `open`
   */
  public postMessage(data: string | object = '', window_token: string = ''): void {
    if (!window_token || !data) {
      throw new Error('Missing parameters, needs window_token and data');
    }

    const code = getPostMessageTemplate(data, document.location.origin, window.winssb.browserWindowId!);
    const opts = { code, window_token };

    logger.info(`Signaling child from postMessage: ${window_token}`);
    this.executeJavaScriptInWindow(opts);
  }

  /**
   * Sends an IPC message to the window with the given token or subtype.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got from `open`
   * @param  {String} options.window_type   A string describing the type of window
   * @param  {Object} ...args               The message to send
   */
  public sendMessage(options: {
                    window_token: string,
                    window_type: string
                  }, ...args: Array<any>): void {
    const { window_token, window_type } = options;

    if (!window_token && !window_type) {
      throw new Error('Missing parameters, needs window_token or window_type');
    }

    ipcRenderer.send('inter-window-message', window_token, window_type, ...args);
  }

  /**
   * Sets a callback for when messages are received through the `sendMessage()` API
   *
   * @param  {Function} receiveMessageCallback  The function to call on message receipt
   */
  public setReceiveMessageCallback(receiveMessageCallback: Function): void {
    this.receiveMessageSignal.add(receiveMessageCallback);
  }

  /**
   * Removes the callback set in `setReceiveMessageCallback`
   *
   * @param  {Function} receiveMessageCallback  The function to remove
   */
  public removeReceiveMessageCallback(receiveMessageCallback: Function): void {
    this.receiveMessageSignal.remove(receiveMessageCallback);
  }

  /**
   * Executes JavaScript code in the context of the opened popup window.
   *
   * @param {Object} options
   * @param {String} options.window_token The value you got from `open`
   * @param {String} options.code         The code to execute
   * @param {Function} options.callback   A method that will be called with the
   * return value of the code you executed, or an `Error` if the call fails.
   * The return value must be JSON-serializable.
   *
   * @return {Promise}         A Promise with the result of the code
   */
  public executeJavaScriptInWindow(options: RemoteEvalOption & {window_token: string}): Promise<string> {
    return executeRemoteEval(options, browserWindowFromToken(options.window_token));
  }

  /**
   * Shows a popup window created with `open` and hidden with `hide`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public show(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd: Electron.BrowserWindow) => wnd.show());
  }

  /**
   * Shows a popup window without focusing it.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public showInactive(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd: Electron.BrowserWindow) => wnd.showInactive());
  }

  /**
   * Hides a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public hide(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd: Electron.BrowserWindow) => wnd.hide());
  }

  /**
   * Closes a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public close(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.close());
  }

  /**
   * Moves a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @param  {String} options.x New left coordinate of the window
   * @param  {String} options.y New top coordinate of the window
   */
  public move(options: {
    window_token: string,
    x: string,
    y: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd) => {
      wnd.setPosition(parseInt(options.x, 10), parseInt(options.y, 10));
    });
  }

  /**
   * Resizes a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @param  {String} options.width         New horizontal size of the window
   * @param  {String} options.height        New vertical size of the window
   */
  public resize(options: {
    window_token: string,
    width: string,
    height: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd) => {
      wnd.setSize(parseInt(options.width, 10), parseInt(options.height, 10));
    });
  }

  /**
   * Brings a popup window to the foreground.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public focus(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd) => WindowHelpers.bringToForeground(wnd, Store));
  }

  /**
   * Moves a popup window to the center of the screen.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public center(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.center());
  }

  /**
   * Toggles developer tools on a popup window.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  public toggleDevTools(options: {
    window_token: string
  }): void {
    this.safeInvokeOnWindow(options.window_token, (wnd) => (wnd as any).toggleDevTools());
  }

  /**
   * Returns the display where the app window is located.
   *
   * @return {Object}  A display object
   */
  public getAppDisplay(): Electron.Display {
    const position = [window.screenX, window.screenY];
    const size = [window.outerWidth, window.outerHeight];
    return this.getDisplayForCoordinates(position, size);
  }

  /**
   * Returns the display where the given popup window is located.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @return {Object}         A display object
   */
  public getDisplayForWindow(options: {
    window_token: string
  }): void {
    return this.safeInvokeOnWindow(options.window_token, (wnd) => {
      return this.getDisplayForCoordinates(wnd.getPosition(), wnd.getSize());
    });
  }

  /**
   * Returns the window metrics for a given window.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @return {Object}         An object describing the window metrics, with keys
   * `x`, `y`, `width`, and `height`
   */
  public getGeometryForWindow(options: {
    window_token: string
  }) {
    return this.safeInvokeOnWindow(options.window_token, (wnd) => {
      const [x, y] = wnd.getPosition();
      const [width, height] = wnd.getSize();
      return { x, y, width, height };
    });
  }

  /**
   * Is Slack the currently active process? Windows only.
   *
   * @return {boolean|null} A boolean if known, null if unknown.
   */
  public getIsSlackActiveProcess(): boolean | null {
    if (process.platform !== 'win32') return null;

    try {
      this.getActiveProcessName = this.getActiveProcessName || require('windows-active-process').getActiveProcessName;
      const activeProcess = this.getActiveProcessName();

      return activeProcess ? activeProcess.includes('slack.exe') : null;
    } catch (error) {
      logger.warn(`Tried to determine whether or not Slack is the active process, but failed`);

      return null;
    }
  }

  /**
   * Returns the display that most closely matches the given coordinates.
   *
   * @param  {Array} position An array with values specifying x and y
   * @param  {Array} size     An array with values specifying width and height
   * @return {Object}         A display object
   */
  private getDisplayForCoordinates(position: Array<number>, size: Array<number>): Electron.Display {
    const centerPoint = {
      x: Math.round(position[0] + size[0] / 2.0),
      y: Math.round(position[1] + size[1] / 2.0)
    };

    return Screen.getDisplayNearestPoint(centerPoint);
  }

  /**
   * Check our current localStorage keys and make sure we're not referencing
   * any closed windows. This can happen if the app is force quit or crashes
   * while child windows are open.
   */
  private doConsistencyCheck(): void {
    const openWindowTokens = BrowserWindow.getAllWindows()
      .map((wnd) => wnd.id.toString());

    Object.keys(localStorage)
      .map((key) => key.match(LOCAL_STORAGE_REGEX))
      .filter((match) => match !== null)
      .map((match) => match![1])
      .filter((token) => !openWindowTokens.includes(token))
      .forEach(this.removeKeyForWindowId);
  }

  private removeKeyForWindowId(id: string): void {
    if (canAccessLocalStorage()) {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}_${id}`);
    }
  }

  /**
   * Defer window closure
   */
  private deferClose(): void {
    const webContents = remote.getCurrentWebContents();

    remote.app.on('before-quit', () => this.willNavigate = true);
    webContents.once('will-navigate', () => this.willNavigate = true);
    window.onbeforeunload = () => this.deferCloseEvent();
  }

  /**
   * Handles a window beforeunload event, hiding the window and delaying
   * the actual close by 600ms. This allows all remaining IPC calls to
   * succeed before the window is actually closed.
   *
   * This is only necessary for windows that call IPC methods right before
   * closing (like `window.parent.postMessage(); window.close();`)
   *
   * @returns {any} If {void}, will exit - if {string}, will cancel
   */
  private deferCloseEvent(): void | string {
    if (this.closeRequested || this.willNavigate) return;
    if (this.closingTimeout) return 'noop';

    const currentWindow = remote.getCurrentWindow();
    currentWindow.hide();

    this.closingTimeout = setTimeout(() => {
      this.closeRequested = true;
      if (currentWindow && !currentWindow.isDestroyed()) currentWindow.destroy();
    }, 600);

    return 'noop';
  }

  /**
   * Invokes some method on a window, if it exists.
   *
   * @param  {String}   token The value you got in `open`
   * @param  {Function} func  The method to invoke
   */
  private safeInvokeOnWindow(token: string, func: (wnd: Electron.BrowserWindow) => void): void {
    const browserWindow = browserWindowFromToken(token);
    if (browserWindow) {
      try {
        return func(browserWindow);
      } catch (e) {
        logger.error(e.message);
      }
    } else {
      logger.warn(`No window for token ${token}`);
    }
  }
}
