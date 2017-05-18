/**
 * @module Utilities
 */ /** for typedoc */

import { logger } from '../logger';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { async } from 'rxjs/scheduler/async';
import { settingStore } from '../stores/setting-store';

import * as assignIn from 'lodash.assignin';
import * as url from 'url';

import { MetricsReporter } from '../browser/metrics-reporter';
import 'rxjs/add/observable/fromEvent';

declare const global: any;

export abstract class WindowHelpers {
  /**
   * Sends events regarding window size and position to Google Analytics.
   *
   * @param  {BrowserWindow} browserWindow  The window being tracked
   * @param  {MetricsReporter} reporter Used to send GA events
   * @return {Subscription} A Subscription that will unsubscribe any listeners
   */
  public static reportWindowMetrics(browserWindow: Electron.BrowserWindow, reporter: MetricsReporter): Subscription {
    const ret = new Subscription();
    ret.add(
      Observable.fromEvent(browserWindow, 'move').throttleTime(750).subscribe(() => {
        const { x, y } = browserWindow.getBounds();
        reporter.sendEvent('window', 'x', null, x);
        reporter.sendEvent('window', 'y', null, y);
      }));

    ret.add(
      Observable.fromEvent(browserWindow, 'resize').throttleTime(750).subscribe(() => {
        const { width, height } = browserWindow.getBounds();
        reporter.sendEvent('window', 'width', null, width);
        reporter.sendEvent('window', 'height', null, height);
      }));

    return ret;
  }

  /**
   * Reports renderer crashes to Google Analytics.
   *
   * @param  {BrowserWindow}    browserWindow The window being tracked
   * @param  {MetricsReporter}  reporter      Used to send GA events
   * @return {Subscription} A Subscription that will unsubscribe any listeners
   */
  public static reportRendererCrashes(browserWindow: Electron.BrowserWindow, reporter: MetricsReporter) {
    let crashCount = 0;

    return Observable.fromEvent(browserWindow.webContents, 'crashed').subscribe(() => {
      crashCount++;

      // NB: Metrics in the browser are remoted to the main window and here, we
      // *know* it's currently hosed. Wait till it reloads, then send the metric
      async.schedule(() => {
        if (reporter) {
          reporter.sendEvent('crash', 'renderer', null, crashCount);
        }
      }, 2000);

      logger.warn('WindowHelpers: Renderer process died, attempting to restart');
      browserWindow.webContents.reloadIgnoringCache();
    });
  }

  /**
   * Loads the URL for the window. If a pathname was provided in the options
   * this is navigated to instead.
   *
   * @param  {BrowserWindow} browserWindow The window
   * @param  {Object} options       Contains `pathname` or `resourcePath`
   */
  public static loadWindowFileUrl(browserWindow: Electron.BrowserWindow, options: {pathname?: string, resourcePath?: string}): void {
    if (!options.pathname && !options.resourcePath) {
      throw new Error('Options must have either a pathname or resourcePath');
    }

    const pathname = options.pathname || `${options.resourcePath}/src/static/index.jade`;
    const loadSettings = assignIn({}, global.loadSettings, options);

    const targetUrl = url.format({
      protocol: 'file',
      slashes: true,
      query: { loadSettings: JSON.stringify(loadSettings) },
      pathname
    });

    browserWindow.loadURL(targetUrl);
  }

  /**
   * Shows or restores the given window, if necessary, then focuses it.
   *
   * @param  {BrowserWindow} browserWindow The window
   */
  public static bringToForeground(browserWindow: Electron.BrowserWindow) {
    if (!browserWindow.isVisible()) browserWindow.show();
    if (browserWindow.isMinimized()) browserWindow.restore();
    if (process.platform === 'win32') this.bringToForegroundWithHack(browserWindow);

    browserWindow.focus();
    browserWindow.flashFrame(false);
  }

  /**
   * Hack: Workaround for https://github.com/electron/electron/issues/9291
   * We'll need to focus the window _harder_
   *
   * @param {Electron.BrowserWindow} browserWindow
   */
  public static bringToForegroundWithHack(browserWindow: Electron.BrowserWindow) {
    const { major, build } = (settingStore.getSetting('platformVersion') || { major: 0, build: 0 }) as { major: number, build: number };

    if (major >= 10 && build >= 15000) {
      try {
        browserWindow.setAlwaysOnTop(true);
        browserWindow.setAlwaysOnTop(false);
      } catch (error) {
        logger.warn('Tried to bring the window to the foreground using setAlwaysOnTop, but failed', error);
      }
    }
  }
}
