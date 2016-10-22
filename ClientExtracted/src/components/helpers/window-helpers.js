import _ from 'lodash';
import logger from '../../logger';
import {Observable, CompositeDisposable, Scheduler} from 'rx';
import url from 'url';

export default class WindowHelpers {
  /**
   * Sends events regarding window size and position to Google Analytics.
   *
   * @param  {BrowserWindow} browserWindow  The window being tracked
   * @param  {MetricsReporter} reporter Used to send GA events
   * @return {Disposable} A Disposable that will unsubscribe any listeners
   */
  static reportWindowMetrics(browserWindow, reporter) {
    return new CompositeDisposable(
      Observable.fromEvent(browserWindow, 'move').throttle(750).subscribe(() => {
        let {x, y} = browserWindow.getBounds();
        reporter.sendEvent('window', 'x', null, x);
        reporter.sendEvent('window', 'y', null, y);
      }),

      Observable.fromEvent(browserWindow, 'resize').throttle(750).subscribe(() => {
        let {width, height} = browserWindow.getBounds();
        reporter.sendEvent('window', 'width', null, width);
        reporter.sendEvent('window', 'height', null, height);
      })
    );
  }

  /**
   * Reports renderer crashes to Google Analytics.
   *
   * @param  {BrowserWindow}    browserWindow The window being tracked
   * @param  {MetricsReporter}  reporter      Used to send GA events
   * @return {Disposable} A Disposable that will unsubscribe any listeners
   */
  static reportRendererCrashes(browserWindow, reporter) {
    let crashCount = 0;

    return Observable.fromEvent(browserWindow.webContents, 'crashed').subscribe(() => {
      crashCount++;

      // NB: Metrics in the browser are remoted to the main window and here, we
      // *know* it's currently hosed. Wait till it reloads, then send the metric
      Scheduler.default.scheduleFuture(null, 2000, () => {
        if (reporter) {
          reporter.sendEvent('crash', 'renderer', null, crashCount);
        }
      });

      logger.warn('Renderer process died, attempting to restart');
      browserWindow.webContents.reload();
    });
  }

  /**
   * Loads the URL for the window. If a pathname was provided in the options
   * this is navigated to instead.
   *
   * @param  {BrowserWindow} browserWindow The window
   * @param  {Object} options       Contains `pathname` or `resourcePath`
   */
  static loadWindowFileUrl(browserWindow, options) {
    if (!options.pathname && !options.resourcePath) {
      throw new Error("Options must have either a pathname or resourcePath");
    }

    let pathname = options.pathname || `${options.resourcePath}/src/static/index.html`;
    let loadSettings = _.extend({}, global.loadSettings, options);

    let targetUrl = url.format({
      protocol: 'file',
      pathname: pathname,
      slashes: true,
      query: {loadSettings: JSON.stringify(loadSettings)}
    });

    browserWindow.loadURL(targetUrl);
  }

  /**
   * Shows or restores the given window, if necessary, then focuses it.
   *
   * @param  {BrowserWindow} browserWindow The window
   */
  static bringToForeground(browserWindow) {
    if (!browserWindow.isVisible())
      browserWindow.show();

    if (browserWindow.isMinimized())
      browserWindow.restore();

    browserWindow.focus();
    browserWindow.flashFrame(false);
  }

  /**
   * Sets developer tools' visibility for a component based on its state. Call
   * this from within `componentDidUpdate`, and check that the component has
   * `isShowingDevTools` in its state.
   *
   * @param  {BrowserWindow|WebContents} windowOrWebView  Holds web contents
   * @param  {Object} prevState     The previous state of the component
   * @param  {Object} currentState  The current state of the component
   */
  static updateDevTools(windowOrWebView, prevState, currentState) {
    if (!windowOrWebView) return;

    let webContents = ('webContents' in windowOrWebView) ?
      windowOrWebView.webContents :
      windowOrWebView;

    if (prevState.isShowingDevTools !== currentState.isShowingDevTools) {
      if (currentState.isShowingDevTools) {
        webContents.openDevTools();
      } else {
        webContents.closeDevTools();
      }
    }
  }
}
