import fs from 'fs';
import {ipcRenderer, remote} from 'electron';
import path from 'path';
import {Observable} from 'rxjs/Observable';

import profiler from '../utils/profiler';
import {logger} from '../logger';
import {p} from '../get-path';
import {channel} from '../../package.json';
import {domFileFromPath, createZipArchive} from '../utils/file-helpers';
import '../rx-operators';

import AutoLaunch from '../auto-launch';
import {appActions} from '../actions/app-actions';
import {dialogActions} from '../actions/dialog-actions';
import {eventActions} from '../actions/event-actions';
import {settingActions} from '../actions/setting-actions';
import {settingStore} from '../stores/setting-store';
import {windowFrameActions} from '../actions/window-frame-actions';

const globalProcess = window.process;
const isDarwin = globalProcess.platform === 'darwin';
const isWin32 = globalProcess.platform === 'win32';

import {UPDATE_STATUS} from '../utils/shared-constants';

let dialog;

const safeProcessKeys = ["title", "version", "versions", "arch", "platform",
  "release", "env", "pid", "features", "execPath", "cwd", "hrtime", "uptime",
  "memoryUsage", "type", "resourcesPath", "helperExecPath", "nextTick",
  "getProcessMemoryInfo", "getSystemMemoryInfo", "windowsStore"];

const safeProcess = safeProcessKeys.reduce((acc, k) => {
  if (typeof(process[k]) !== 'function') {
    acc[k] = process[k];
    return acc;
  }

  acc[k] = (...args) => process[k](...args);
  return acc;
}, {});

export default class AppIntegration {
  constructor(lite=false) {
    this.lite = lite;
    if (lite) return;

    this.wnd = remote.getCurrentWindow();
    this.autoLaunch = new AutoLaunch();
    this.listenForModifierKeys();

    // This will after a throttled 10sec delay, run a V8 GC
    try {
      const {requestGC} = require('../run-gc');

      Observable.fromEvent(window, 'blur')
        .throttleTime(10 * 1000)
      .subscribe(() => requestGC());
    } catch (e) {
      logger.info("Failed to set up GC timer");
    }
  }

  /**
   * Occurs when the SSB starts loading.
   */
  didStartLoading() {
    ipcRenderer.sendToHost('didStartLoading');
  }

  /**
   * Occurs when the SSB finishes loading.
   */
  didFinishLoading() {
    ipcRenderer.sendToHost('didFinishLoading');
    if (profiler.shouldProfile()) profiler.stopProfiling('webapp');

    try {
      // NB: Unfortunately, Electron's setImmediate assumes that global.process
      // still exists in Chrome 43, so we have to patch a modified version back
      // in
      window.process = safeProcess;
      if (this.lite) return;

      window.winssb.teams.fetchContentForChannel(5/*retries to fetch content*/);
    } catch (error) {
      logger.error(`Spellchecking is busted, continuing: ${error.message}\n${error.stack}`);
    }
  }

  /**
   * Checks if a preference with the given name is supported.
   *
   * @param  {String} name  The name of the preference
   * @return {Boolean}      True if the preference is supported
   */
  hasPreference(name) {
    return settingStore.getSettings()[name] !== undefined;
  }

  /**
   * Gets the value of a preference.
   *
   * @param  {String} name  The name of the preference
   * @return {Object}       The value
   */
  getPreference(name) {
    return settingStore.getSettings()[name];
  }

  /**
   * Sets the value of a preference.
   *
   * @param  {Object} pref
   * @param  {Object} pref.name   The name of the preference
   * @param  {Object} pref.value  The new value of the preference
   */
  setPreference(pref) {
    let update = {};
    update[pref.name] = pref.value;
    settingActions.updateSettings(update);
  }

  /**
   * Shows a native open file / folder dialog, refer to
   * https://slack-github.com/slack/docs/blob/master/ssb-runtime-bridge/dialogs.md.
   *
   * @param  {Object}   options   Options to pass to the dialog
   * @param  {Function} callback  A method called with the filenames on completion
   * @return {Promise}            If a callback is specified, returns nothing.
   * Otherwise, returns a `Promise` that will be resolved with the filenames, or
   * undefined when the dialog is canceled
   */
  showOpenDialog(options, callback=null) {
    dialog = dialog || remote.dialog;

    let {type, title, defaultPath, multiSelect, filters} = options;
    let properties = [type];
    if (multiSelect) properties.push('multiSelections');

    if (callback) {
      dialog.showOpenDialog(this.wnd, {title, defaultPath, filters, properties}, callback);
      return;
    }

    return new Promise((resolve) => {
      dialog.showOpenDialog(this.wnd, {title, defaultPath, filters, properties}, (filenames) => {
        resolve(filenames);
      });
    });
  }

  /**
   * Shows a native file save dialog.
   *
   * @param  {Object}   options   Options to pass to the dialog
   * @param  {Function} callback  A method called with the filename on completion
   * @return {Promise}            If a callback is specified, returns nothing.
   * Otherwise, returns a `Promise` that will be resolved with the filename, or
   * undefined when the dialog is canceled
   */
  showSaveDialog(options, callback=null) {
    dialog = dialog || remote.dialog;

    if (callback) {
      dialog.showSaveDialog(this.wnd, options, callback);
      return;
    }

    return new Promise((resolve) => {
      dialog.showSaveDialog(this.wnd, options, (filename) => {
        resolve(filename);
      });
    });
  }

  /**
   * Quits the app, applies an available update, and restarts.
   */
  quitAndInstallUpdate() {
    appActions.setUpdateStatus(UPDATE_STATUS.RESTART_TO_APPLY);
  }

  /**
   * Occurs when a new input field is added to the DOM; wire it up to text
   * substitutions.
   *
   * @param  {HTMLElement} input  The field that was added
   */
  inputFieldCreated(input) {
    if (input && isDarwin) require('electron-text-substitutions').default(input);
  }

  /**
   * Reloads the current team.
   */
  reload() {
    window.location.reload();
  }

  /**
   * Called by the webapp to determine whether or not HTML should be rendered
   * in notifications.
   *
   * @return {Boolean}  True if HTML notifications are being used, false otherwise
   */
  canShowHtmlNotifications() {
    return settingStore.isShowingHtmlNotifications();
  }

  /**
   * Called by the webapp to determine if local Lato 2 is available - if it is,
   * the webapp should always use Lato 2.
   */
  loadLatoFromResources() {
    let data = fs.readFileSync(path.resolve(__dirname, '..', 'static', 'lato.less'), 'utf8');

    let style = document.createElement('style');
    style.innerHTML = data;
    document.head.appendChild(style);
  }

  isAppStoreBuild() {
    return (isDarwin && channel === 'mas') ||
      (isWin32 && process.windowsStore);
  }

  isBetaChannel() {
    return (isWin32 && channel === 'beta');
  }

  /**
   * Use this method to determine if you should create a transparent window or
   * not (transparent windows won't work correctly when DWM composition is
   * disabled).
   *
   * @return {Boolean}  True if transparent windows are supported, false otherwise
   */
  areTransparentWindowsSupported() {
    if (isWin32) {
      return settingStore.getSetting('isAeroGlassEnabled');
    } else {
      return true;
    }
  }

  /**
   * Allows the webapp to open devTools.
   */
  toggleDevTools() {
    dialogActions.toggleDevTools();
  }

  /**
   * Returns our app log files zipped and as a DOM file element (or un-zipped if zipping fails
   * for some reason). The logs will be sorted by modification time, so we'll only grab the most
   * recent `n` files.
   *
   * @param  {Number} maxFiles      The maximum number of log files to retrieve
   * @return {Promise<Array<File>>} A Promise that resolves with an array of Files
   */
  async getAppLogFiles(maxFiles = 8) {
    try {
      const logFiles = await logger.getMostRecentLogFiles(maxFiles);
      const zipPath = p`${'temp'}/logs.zip`;

      await createZipArchive(logFiles, zipPath);

      return [
        await domFileFromPath(zipPath)
      ];
    } catch(error) {
      logger.warn(`Couldn't zip log files: ${error}`);

      return logger.getMostRecentLogFiles(maxFiles, (observable) => {
        return observable.flatMap((logFile) => domFileFromPath(logFile)
          .catch((err) => logger.warn(`Unable to get file: ${err.message}`)));
      });
    }
  }

  /**
   * Modifier keys aren't being propagated to the webapp for some events, so we
   * give them a workaround here.
   *
   * @return {Object}
   * @return {Object}.ctrl  True if the `Ctrl` key is pressed
   * @return {Object}.shift True if the `Shift` key is pressed
   * @return {Object}.alt   True if the `Alt` key is pressed
   * @return {Object}.meta  True if the meta key is pressed
   */
  getModifierKeys() {
    return this.modifiers;
  }

  listenForModifierKeys() {
    this.modifiers = {
      ctrl: false,
      shift: false,
      alt: false,
      meta: false
    };

    let keyListener = (e) => {
      this.modifiers.ctrl = e.ctrlKey;
      this.modifiers.shift = e.shiftKey;
      this.modifiers.alt = e.altKey;
      this.modifiers.meta = e.metaKey;
    };

    window.addEventListener('keydown', keyListener);
    window.addEventListener('keyup', keyListener);
  }

  updateNoDragRegion(region) {
    windowFrameActions.updateNoDragRegion(region);
  }

  isMainWindowFrameless() {
    return settingStore.getSetting('isTitleBarHidden');
  }

  closeAllUpdateBanners() {
    eventActions.closeAllUpdateBanners();
  }
}
