import _ from 'lodash';
import {Observable, Disposable} from 'rx';
import WindowBehavior from './window-behavior';

const d = require('debug-electron')('reposition-window-behavior');

export default class RepositionWindowBehavior extends WindowBehavior {

  /**
   * Creates a new instance of the behavior.
   *
   * @param  {Object} options
   * @param  {Function} options.recalculateWindowPositionFunc A function which
   * returns an x-y pair as an array, called when screen geometry is incompatible
   * with the current window position
   * @param  {Function} options.shouldRecheckWindowPos  An Observable that
   * represents when the window position should be rechecked
   * @param  {Function} options.screenApi Used to override Electron's screen
   * module for unit testing
   */
  constructor(options={}) {
    super();

    this.recalculateWindowPositionFunc = options.recalculateWindowPositionFunc ||
      RepositionWindowBehavior.recalculateWindowPositionFunc;
    this.shouldRecheckWindowPos = options.shouldRecheckWindowPos;
    this.screenApi = options.screenApi;
  }

  /**
   * Causes the window to reposition once screen geometry changes. When the
   * window's position / size are garbage, we'll ask the window to pick a new
   * size and position.
   *
   * @param  {BrowserWindow} browserWindow The window to attach the behavior to
   * @return {Disposable}            A Disposable that will detach this behavior
   */
  setup(browserWindow) {
    if (process.platform === 'darwin' && !global.loadSettings.testMode) {
      d("Don't reposition windows on Mac");
      return Disposable.empty;
    }

    d('Attaching behavior to window');

    if (!this.shouldRecheckWindowPos) {
      // Require these as late as possible, so that the unit tests (that can't
      // use browser modules) still function.
      let electronScreen = require('electron').screen;

      // `power-monitor` can only be used from the browser process.
      let resumeFromSleepEvent = process.type === 'browser' ?
        Observable.fromEvent(require('electron').powerMonitor, 'resume') :
        Observable.empty();

      this.shouldRecheckWindowPos =
        Observable.merge(
          Observable.fromEvent(electronScreen, 'display-removed'),
          Observable.fromEvent(electronScreen, 'display-metrics-changed'),
          resumeFromSleepEvent)
        .where(() => browserWindow.isVisible())
        .throttle(1000);

      this.screenApi = electronScreen;
    }

    return this.shouldRecheckWindowPos
      .do(() => d('About to check window bounds against display'))
      .where(() => {
        let coords = {
          position: browserWindow.getPosition(),
          size: browserWindow.getSize()
        };
        return coords.position && coords.size &&
          !RepositionWindowBehavior.windowPositionInBounds(this.screenApi, coords);
      })
      .do(() => this.recalculateWindowPositionFunc(this.screenApi, browserWindow))
      .catch(Observable.return(null))
      .subscribe();
  }

  /**
   * Determines whether window geometry is within the bounds of a monitor.
   *
   * @param  {Screen} screenApi Used to determine display coordinates
   * @param  {Object} settings  An object containing window geometry
   * @return {Boolean}           True if the window is within bounds, false if
   * the window is mostly off-screen
   */
  static windowPositionInBounds(screenApi, {position, size}) {
    let [x, y] = position;
    let [width, height] = size;
    let windowRect = [x, y, width, height];

    // NB: Check for bizarro sizes and fail them
    if (width < 10 || height < 10) return false;

    return _.find(screenApi.getAllDisplays(), ({bounds}) => {
      let displayRect = [
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      ];

      let result = RepositionWindowBehavior.rectIsMostlyContainedIn(windowRect, displayRect);
      d(`Window ${JSON.stringify(windowRect)} is mostly contained in ${JSON.stringify(displayRect)}: ${result}`);
      return result;
    });
  }

  /**
   * The default function used to calculate a valid window position / size when
   * screen geometry changes.
   */
  static recalculateWindowPositionFunc(screenApi, browserWindow) {
    let {position, size} = RepositionWindowBehavior.calculateDefaultPosition(screenApi);
    d(`Setting new window bounds: ${JSON.stringify(position)}, ${JSON.stringify(size)}`);

    browserWindow.setPosition(position[0], position[1]);
    browserWindow.setSize(size[0], size[1]);
  }

  /**
   * Calculates a reasonable window position / size based on the geometry of
   * the primary window.
   *
   * @param  {Screen} screenApi           Used to determine display coordinates
   * @param  {Object} settings            The current size and position of the window
   * @param  {Object} percentSize         Determines the percentage of the display the
   * window should be resized to fill
   * @return {Object}                     An object with window geometry
   */
  static calculateDefaultPosition(screenApi, settings, percentSize={x: 0.6, y: 0.8}) {
    let activeDisplay = screenApi.getPrimaryDisplay();

    // If we were given existing window metrics, try to return a position
    // within the same display.
    if (settings) {
      let centerPoint = {
        x: Math.round(settings.position[0] + settings.size[0] / 2.0),
        y: Math.round(settings.position[1] + settings.size[1] / 2.0)
      };
      activeDisplay = screenApi.getDisplayNearestPoint(centerPoint);
    }

    let bounds = activeDisplay.workArea;

    let windowWidth = Math.round(bounds.width * percentSize.x);
    let windowHeight = Math.round(bounds.height * percentSize.y);

    let centerX = bounds.x + bounds.width / 2.0;
    let centerY = bounds.y + bounds.height / 2.0;

    let pos = [Math.round(centerX - (windowWidth / 2.0)), Math.round(centerY - (windowHeight / 2.0))];

    return { position: pos, size: [windowWidth, windowHeight] };
  }

  /**
   * Checks two rectangles to determine whether one is mostly contained within
   * another.
   *
   * @param  {Array} targetRect The Rect which should be contained in hostRect
   * @param  {Array} hostRect   The Rect which should contain targetRect
   * @param  {Object} fudgeFactor   A percentage (width and height) to apply to
   * the target before comparing. Defaults to 20%. This means windows can be
   * positioned slightly out of bounds, which handles cases like snapped or
   * maximized windows.
   *
   * @return {Boolean}            True if mostly contained, false otherwise
   */
  static rectIsMostlyContainedIn(
    [x, y, width, height],
    [hostX, hostY, hostWidth, hostHeight],
    fudgeFactor={width: 0.2, height: 0.2}) {

    let leftMost = x + (width * fudgeFactor.width);
    let topMost = y + (height * fudgeFactor.height);

    if (leftMost < hostX) {
      d(`Window too far left for display`);
      return false;
    }

    if (topMost < hostY) {
      d(`Window too far top for display`);
      return false;
    }

    let rightMost = x + width - (width * fudgeFactor.width);
    let bottomMost = y + height - (height * fudgeFactor.height);

    if (rightMost > hostX + hostWidth) {
      d(`Window too far right for display`);
      return false;
    }

    if (bottomMost > hostY + hostHeight) {
      d(`Window too far bottom for display`);
      return false;
    }

    return true;
  }
}
