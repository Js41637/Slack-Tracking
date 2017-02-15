import {Region} from '../region';
import * as fs from 'graceful-fs';
import {ipcRenderer, remote} from 'electron';
import * as path from 'path';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import * as profiler from '../utils/profiler';
import {logger} from '../logger';
import {channel} from '../../package.json';
import {domFileFromPath, createZipArchiver} from '../utils/file-helpers';
import '../rx-operators';

import {appActions} from '../actions/app-actions';
import {eventActions} from '../actions/event-actions';
import {settingActions} from '../actions/setting-actions';
import {settingStore} from '../stores/setting-store';

const globalProcess = (window as any).process;
const isDarwin = globalProcess.platform === 'darwin';
const isWin32 = globalProcess.platform === 'win32';

import {UPDATE_STATUS} from '../utils/shared-constants';

let dialog: Electron.Dialog;
let performTextSubstitution: (input: HTMLElement) => Subscription;
const textSubstitutionSubscriptions: { [input: string]: Subscription; } = {};

const safeProcessKeys = ['title', 'version', 'versions', 'arch', 'platform',
  'release', 'env', 'pid', 'features', 'execPath', 'cwd', 'hrtime', 'uptime',
  'memoryUsage', 'type', 'resourcesPath', 'helperExecPath', 'nextTick',
  'getProcessMemoryInfo', 'getSystemMemoryInfo', 'windowsStore'];

const safeProcess = safeProcessKeys.reduce((acc, k) => {
  if (typeof(process[k]) !== 'function') {
    acc[k] = process[k];
    return acc;
  }

  acc[k] = (...args: Array<any>) => process[k](...args);
  return acc;
}, {});

export interface TextSubstitution {
  replace: string;
  with: string;
  on: boolean;
}

export interface TextSubstitutionSettings {
  substitutions: Array<TextSubstitution>;
  useSmartQuotes: boolean;
  useSmartDashes: boolean;
}

export class AppIntegration {
  private readonly wnd: Electron.BrowserWindow;
  private readonly readSystemTextPreferences: () => TextSubstitutionSettings;

  private modifiers: {
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    meta: boolean
  };

  constructor(private lite: boolean = false) {
    if (lite) return;

    this.wnd = remote.getCurrentWindow();
    this.listenForModifierKeys();

    if (isDarwin) {
      this.readSystemTextPreferences =
        require('electron-text-substitutions/preference-helpers').readSystemTextPreferences;
    }
  }

  /**
   * Occurs when the SSB starts loading.
   */
  public didStartLoading(): void {
    ipcRenderer.sendToHost('didStartLoading');
  }

  /**
   * Occurs when the SSB finishes loading.
   */
  public didFinishLoading(): void {
    ipcRenderer.sendToHost('didFinishLoading');
    if (profiler.shouldProfile()) profiler.stopProfiling('webapp');

    try {
      // NB: Unfortunately, Electron's setImmediate assumes that global.process
      // still exists in Chrome 43, so we have to patch a modified version back
      // in
      (window as any).process = safeProcess;
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
  public hasPreference(name: string): boolean {
    return settingStore.getSettings()[name] !== undefined;
  }

  /**
   * Gets the value of a preference.
   *
   * @param  {String} name  The name of the preference
   * @return {Object}       The value
   */
  public getPreference<T>(name: string): T {
    return settingStore.getSettings()[name];
  }

  /**
   * Sets the value of a preference.
   *
   * @param  {Object} pref
   * @param  {Object} pref.name   The name of the preference
   * @param  {Object} pref.value  The new value of the preference
   */
  public setPreference(pref: {
    name: string,
    value: any
  }): void {
    const update = {};
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
  public showOpenDialog(options: any, callback?: (fileNames: Array<string>) => void): Promise<string> | void {
    dialog = dialog || remote.dialog;

    const {type, title, defaultPath, multiSelect, filters} = options;
    const properties = [type];
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
  public showSaveDialog(options: any, callback?: (fileName: string) => void): Promise<string> | void {
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
   * Focuses the currently selected team's webview element. This is necessary
   * in some cases (e.g., after a native file dialog was opened).
   */
  public focusWebView(): void {
    eventActions.mainWindowFocused();
  }

  /**
   * Quits the app, applies an available update, and restarts.
   */
  public quitAndInstallUpdate(): void {
    appActions.setUpdateStatus(UPDATE_STATUS.RESTART_TO_APPLY);
  }

  /**
   * Occurs when a new input field is added to the DOM; wire it up to text
   * substitutions.
   *
   * @param  {HTMLElement} input  The field that was added
   */
  public inputFieldCreated(input: HTMLElement): void {
    if (input && isDarwin) {
      performTextSubstitution = performTextSubstitution ||
        require('electron-text-substitutions').default;
      textSubstitutionSubscriptions[input.id] = performTextSubstitution(input);
    }
  }

  /**
   * Occurs when an input field is removed from the DOM.
   *
   * @param  {HTMLElement} input  The field that was removed
   */
  public inputFieldRemoved(input: HTMLElement): void {
    if (input && isDarwin && textSubstitutionSubscriptions[input.id]) {
      textSubstitutionSubscriptions[input.id].unsubscribe();
      delete textSubstitutionSubscriptions[input.id];
    }
  }

  /**
   * Reloads the current team.
   */
  public reload(): void {
    window.location.reload();
  }

  /**
   * Called by the webapp to determine whether or not HTML should be rendered
   * in notifications.
   *
   * @return {Boolean}  True if HTML notifications are being used, false otherwise
   */
  public canShowHtmlNotifications(): boolean {
    return settingStore.isShowingHtmlNotifications();
  }

  /**
   * Called by the webapp to determine if local Lato 2 is available - if it is,
   * the webapp should always use Lato 2.
   */
  public loadLatoFromResources(): void {
    const data = fs.readFileSync(path.resolve(__dirname, '..', 'static', 'lato.less'), 'utf8');

    const style = document.createElement('style');
    style.innerHTML = data;
    document.head.appendChild(style);
  }

  public isAppStoreBuild(): boolean {
    return (isDarwin && channel === 'mas') ||
      (isWin32 && process.windowsStore!);
  }

  public isBetaChannel(): boolean {
    return (isWin32 && channel === 'beta');
  }

  /**
   * Use this method to determine if you should create a transparent window or
   * not (transparent windows won't work correctly when DWM composition is
   * disabled).
   *
   * @return {Boolean}  True if transparent windows are supported, false otherwise
   */
  public areTransparentWindowsSupported(): boolean {
    if (isWin32) {
      return settingStore.getSetting<boolean>('isAeroGlassEnabled');
    } else {
      return true;
    }
  }

  /**
   * Allows the webapp to open devTools.
   */
  public toggleDevTools(forAllWebContents: boolean = true): void {
    eventActions.toggleDevTools(forAllWebContents);
  }

  /**
   * Returns our app log files zipped and as a DOM file element (or un-zipped if zipping fails
   * for some reason). The logs will be sorted by modification time, so we'll only grab the most
   * recent `n` files.
   *
   * @param  {Number} maxFiles      The maximum number of log files to retrieve
   * @return {Promise<Array<File>>} A Promise that resolves with an array of Files
   */
  public async getAppLogFiles(maxFiles: number = 8): Promise<Array<File>> {
    try {
      const logFiles = await logger.getMostRecentLogFiles(maxFiles);

      if (isWin32) {
        logFiles.push(`${process.execPath}/../SquirrelSetup.log`);
      }

      //convert in-memory zip archive buffer into dom file directly
      const archiver = await createZipArchiver(logFiles).toPromise();
      const archiveBuffer = await archiver.generateAsync({type: 'nodebuffer'});
      const file = new File([archiveBuffer], 'logs.zip', {type: 'text/plain'});

      return [file];
    } catch (error) {
      logger.warn(`Couldn't zip log files: ${error}`);

      return logger.getMostRecentLogFiles(maxFiles, (observable: Observable<any>) => {
        return observable.flatMap((logFile) => domFileFromPath(logFile)
          .catch((err: Error) => {
          logger.warn(`Unable to get file: ${err.message}`);
          return Observable.empty();
        }));
      }) as any;
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
  public getModifierKeys(): {
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    meta: boolean
  } {
    return this.modifiers;
  }

  public listenForModifierKeys(): void {
    this.modifiers = {
      ctrl: false,
      shift: false,
      alt: false,
      meta: false
    };

    const keyListener = (e: KeyboardEvent) => {
      this.modifiers.ctrl = e.ctrlKey;
      this.modifiers.shift = e.shiftKey;
      this.modifiers.alt = e.altKey;
      this.modifiers.meta = e.metaKey;
    };

    window.addEventListener('keydown', keyListener);
    window.addEventListener('keyup', keyListener);
  }

  /**
   * Updates or creates a "no drag region", which is a region
   * that can't be used to drag the window (like a search bar)
   *
   * @param {any} region
   */
  public updateNoDragRegion(region: Region): void {
    appActions.updateNoDragRegion(region);
  }

  /**
   * @returns {boolean} - Is the window frameless
   */
  public isMainWindowFrameless(): boolean {
    return settingStore.getSetting<boolean>('isTitleBarHidden');
  }

  public closeAllUpdateBanners(): void {
    eventActions.closeAllUpdateBanners();
  }

  /**
   * Get the current zoom level active in the SSB
   *
   * @returns {number} zoomLevel - The current zoom level
   */
  public getZoom(): number {
    return settingStore.getSetting<number>('zoomLevel');
  }

  /**
   * Set the new zoom level. Will be automatically clamped between
   * -2 and 3.
   *
   * @param {number} zoomLevel
   */
  public setZoom(zoomLevel: number): void {
    settingActions.updateSettings({zoomLevel: Math.max(-2, Math.min(zoomLevel, 3))});
  }

  /**
   * Zooms in. Will be automatically maxed at level 3.
   */
  public zoomIn(): void {
    settingActions.zoomIn();
  }

  /**
   * Zoom out. Will be automatically lowed at -2.
   */
  public zoomOut(): void {
    settingActions.zoomOut();
  }

  /**
   * Resets the current zoom level.
   */
  public zoomReset(): void {
    settingActions.resetZoom();
  }
}
