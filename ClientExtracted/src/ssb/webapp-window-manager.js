import difference from 'lodash.difference';
import logger from '../logger';
import getUserAgent from '../ssb-user-agent';
import {ipcRenderer, remote, screen as Screen} from 'electron';
import {getSenderIdentifier, remoteEval} from 'electron-remote';

import ReduxComponent from '../lib/redux-component';
import WindowHelpers from '../components/helpers/window-helpers';
import WindowStore from '../stores/window-store';

import {WINDOW_TYPES} from '../utils/shared-constants';

import {Signal} from 'signals';

const {BrowserWindow} = remote;

const LOCAL_STORAGE_PREFIX = 'webappWindowManager';
const LOCAL_STORAGE_REGEX = new RegExp(`^${LOCAL_STORAGE_PREFIX}_(\\d*)`);
const CLOSE_DEFERRAL_NEEDED = ['www.dropbox.com'];

function browserWindowFromToken(token) {
  return BrowserWindow.fromId(parseInt(token));
}

/**
 * Implements the Window API that allows the web app to open popup windows and
 * push them around.
 */
export default class WebappWindowManager extends ReduxComponent {

  constructor() {
    super();
    if (window.location.protocol !== 'data:' &&
      window.location.protocol !== 'about:') {
      this.doConsistencyCheck();
    }

    this.receiveMessageSignal = new Signal();
    ipcRenderer.on('inter-window-message', (event, ...args) => {
      this.receiveMessageSignal.dispatch(...args);
    });

    if (CLOSE_DEFERRAL_NEEDED.includes(window.location.host)) this.deferClose();
  }

  syncState() {
    return {
      windows: WindowStore.getWindows([WINDOW_TYPES.WEBAPP]),
      subType: WindowStore.subTypeOfWindow()
    };
  }

  /**
   * Stop tracking windows that the user just closed.
   */
  update(prevState = {}) {
    if (this.state.windows !== prevState.windows) {
      let removedWindows = difference(Object.keys(prevState.windows), Object.keys(this.state.windows));
      removedWindows.forEach((win) => this.removeKeyForWindowId(win));
    }
  }

  /**
   * Defer window closure
   */
  deferClose() {
    let webContents = remote.getCurrentWebContents();

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
  deferCloseEvent() {
    if (this.closeRequested || this.willNavigate) return;
    if (this.closingTimeout) return 'noop';

    let currentWindow = remote.getCurrentWindow();
    currentWindow.hide();

    this.closingTimeout = setTimeout(() => {
      this.closeRequested = true;
      if (currentWindow && !currentWindow.isDestroyed()) currentWindow.destroy();
    }, 600);

    return 'noop';
  }

  /**
   * Check our current localStorage keys and make sure we're not referencing
   * any closed windows. This can happen if the app is force quit or crashes
   * while child windows are open.
   */
  doConsistencyCheck() {
    let openWindowTokens = BrowserWindow.getAllWindows()
      .map((wnd) => wnd.id.toString());

    Object.keys(localStorage)
      .map((key) => key.match(LOCAL_STORAGE_REGEX))
      .filter((match) => match !== null)
      .map((match) => match[1])
      .filter((token) => !openWindowTokens.includes(token))
      .forEach(this.removeKeyForWindowId);
  }

  removeKeyForWindowId(id) {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}_${id}`);
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
  open(params = {}) {
    Object.assign(params, {
      teamId: global.teamId,
      userAgent: getUserAgent(),
      parentInfo: getSenderIdentifier(),
      isPopupWindow: params.allowThirdPartyNavigation || window.TSSSB.canUrlBeOpenedInSSBWindow(params.url)
    });

    try {
      // Create the window in the main process, and use a synchronous IPC call
      // to get the ID back to us. We create it there to avoid attaching remote
      // event handlers.
      let windowId = ipcRenderer.sendSync('create-webapp-window', params);

      // Stash the parameters used to create this window in localStorage, so
      // that we can tell the webapp about them later.
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}_${windowId}`, JSON.stringify(params));

      // Return the token to the webapp, so we're all on the same page.
      return windowId;
    } catch (error) {
      logger.error(`Creating webapp window failed: ${error}`);
      return -1;
    }
  }

  /**
   * Returns a list of all currently active windows created with `open`.
   *
   * @return {String}  A stringified JSON dictionary whose keys are window
   * tokens, and whose values are the original metadata values passed to `open`
   */
  list() {
    let windowMetadata = Object.keys(localStorage).reduce((acc, key) => {
      let match = key.match(LOCAL_STORAGE_REGEX);
      if (match) {
        let [,windowToken] = match;
        acc[windowToken] = JSON.parse(localStorage.getItem(key));
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
  postMessage(data = '', window_token = '') {
    if (!window_token || !data) {
      throw new Error("Missing parameters, needs window_token and data");
    }

    data = (typeof data === 'string') ? `'${data}'` : JSON.stringify(data);

    let code =
      `(function () {` +
        `let evt = new Event('message');` +
        `evt.data = ${data};` +
        `evt.origin = '${document.location.origin}';` +
        `evt.source = {};` +
        `evt.source.postMessage = function (message) {` +
        `  if (!winssb || !winssb.window || !winssb.window.postMessage) throw 'winssb not ready';` +
        `  return winssb.window.postMessage(message, ${window.winssb.browserWindowId});` +
        `};` +
        `window.dispatchEvent(evt);` +
      `})();`;

    let opts = { code, window_token };

    logger.info(`Signaling child from postMessage: ${opts.code}, ${window_token}`);
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
  sendMessage(options, ...args) {
    let {window_token, window_type} = options;

    if (!window_token && !window_type) {
      throw new Error("Missing parameters, needs window_token or window_type");
    }

    ipcRenderer.send('inter-window-message', window_token, window_type, ...args);
  }

  /**
   * Sets a callback for when messages are received through the `sendMessage()` API
   *
   * @param  {Function} receiveMessageCallback  The function to call on message receipt
   */
  setReceiveMessageCallback(receiveMessageCallback) {
    this.receiveMessageSignal.add(receiveMessageCallback);
  }

  /**
   * Removes the callback set in `setReceiveMessageCallback`
   *
   * @param  {Function} receiveMessageCallback  The function to remove
   */
  removeReceiveMessageCallback(receiveMessageCallback) {
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
  executeJavaScriptInWindow(options) {
    let browserWindow = browserWindowFromToken(options.window_token);
    let ret = remoteEval(browserWindow, options.code);

    if (options.callback) {
      return ret
        .then((x) => options.callback(null, x))
        .catch((e) => options.callback(e));
    } else {
      return ret;
    }
  }

  /**
   * Invokes some method on a window, if it exists.
   *
   * @param  {String}   token The value you got in `open`
   * @param  {Function} func  The method to invoke
   */
  safeInvokeOnWindow(token, func) {
    let browserWindow = browserWindowFromToken(token);
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

  /**
   * Shows a popup window created with `open` and hidden with `hide`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  show(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.show());
  }

  /**
   * Shows a popup window without focusing it.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  showInactive(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.showInactive());
  }

  /**
   * Hides a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  hide(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.hide());
  }

  /**
   * Closes a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  close(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.close());
  }

  /**
   * Moves a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @param  {Number} options.x New left coordinate of the window
   * @param  {Number} options.y New top coordinate of the window
   */
  move(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => {
      wnd.setPosition(parseInt(options.x), parseInt(options.y));
    });
  }

  /**
   * Resizes a popup window created with `open`.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @param  {Number} options.width         New horizontal size of the window
   * @param  {Number} options.height        New vertical size of the window
   */
  resize(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => {
      wnd.setSize(parseInt(options.width), parseInt(options.height));
    });
  }

  /**
   * Brings a popup window to the foreground.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  focus(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => WindowHelpers.bringToForeground(wnd));
  }

  /**
   * Moves a popup window to the center of the screen.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  center(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.center());
  }

  /**
   * Toggles developer tools on a popup window.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   */
  toggleDevTools(options) {
    this.safeInvokeOnWindow(options.window_token, (wnd) => wnd.toggleDevTools());
  }

  /**
   * Returns an object describing the primary display.
   *
   * @return {Object}
   * @return {Object}.bounds      Describes the size and position of the display
   * @return {Object}.workArea    Describes the available size (e.g., minus the taskbar)
   * @return {Object}.scaleFactor Describes the scaling of the display
   */
  getPrimaryDisplay() {
    return Screen.getPrimaryDisplay();
  }

  /**
   * Returns an array of displays that are currently active.
   *
   * @return {Array}  An array of display objects
   */
  getAllDisplays() {
    return Screen.getAllDisplays();
  }

  /**
   * Returns the display where the app window is located.
   *
   * @return {Object}  A display object
   */
  getAppDisplay() {
    let position = [window.screenX, window.screenY];
    let size = [window.outerWidth, window.outerHeight];
    return this.getDisplayForCoordinates(position, size);
  }

  /**
   * Returns the display where the given popup window is located.
   *
   * @param  {Object} options
   * @param  {String} options.window_token  The value you got in `open`
   * @return {Object}         A display object
   */
  getDisplayForWindow(options) {
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
  getGeometryForWindow(options) {
    return this.safeInvokeOnWindow(options.window_token, (wnd) => {
      let [x, y] = wnd.getPosition();
      let [width, height] = wnd.getSize();
      return { x, y, width, height };
    });
  }

  /**
   * Returns the display that most closely matches the given coordinates.
   *
   * @param  {Array} position An array with values specifying x and y
   * @param  {Array} size     An array with values specifying width and height
   * @return {Object}         A display object
   */
  getDisplayForCoordinates(position, size) {
    let centerPoint = {
      x: Math.round(position[0] + size[0] / 2.0),
      y: Math.round(position[1] + size[1] / 2.0)
    };

    return Screen.getDisplayNearestPoint(centerPoint);
  }
}
