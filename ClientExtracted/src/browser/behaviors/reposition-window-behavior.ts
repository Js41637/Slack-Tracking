import {screen} from 'electron';
import {WindowBehavior, WindowGeometrySetting} from './window-behavior';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {Scheduler} from 'rxjs/Scheduler';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/throttleTime';

const d = require('debug')('reposition-window-behavior');

export type recalculateWinPositionFnType = (browserWindow: Electron.BrowserWindow) => void;

export class RepositionWindowBehavior extends WindowBehavior {
  /**
   * Determines whether window geometry is within the bounds of a monitor.
   *
   * @param  {WindowGeometrySetting} settings  An object containing window geometry
   * @return {Boolean}           True if the window is within bounds, false if
   * the window is mostly off-screen
   */
  public static windowPositionInBounds({position, size}: WindowGeometrySetting): boolean {
    const [x, y] = position;
    const [width, height] = size;
    const windowRect = [x, y, width, height];

    // NB: Check for bizarro sizes and fail them
    if (width < 10 || height < 10) return false;

    return !!screen.getAllDisplays().find(({bounds}) => {
      const displayRect = [
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      ];

      const result = RepositionWindowBehavior.rectIsMostlyContainedIn(windowRect as Array<number>, displayRect);
      d(`Window ${JSON.stringify(windowRect)} is mostly contained in ${JSON.stringify(displayRect)}: ${result}`);
      return result;
    });
  }

  /**
   * Calculates a reasonable window position / size based on the geometry of
   * the primary window.
   *
   * @param  {WindowGeometrySetting} settings  The current size and position of the window
   * @param  {Object} percentSize              Determines the percentage of the display the
   * window should be resized to fill
   * @return {WindowGeometrySetting}           An object with window geometry
   */
  public static calculateDefaultPosition(settings?: WindowGeometrySetting,
                                         percentSize: {x: number, y: number} = {x: 0.6, y: 0.8}): WindowGeometrySetting {
    let activeDisplay = screen.getPrimaryDisplay();

    // If we were given existing window metrics, try to return a position
    // within the same display.
    if (settings) {
      const centerPoint = {
        x: Math.round(settings.position[0] + settings.size[0] / 2.0),
        y: Math.round(settings.position[1] + settings.size[1] / 2.0)
      };
      activeDisplay = screen.getDisplayNearestPoint(centerPoint);
    }

    const bounds = activeDisplay.workArea;

    const windowWidth = Math.round(bounds.width * percentSize.x);
    const windowHeight = Math.round(bounds.height * percentSize.y);

    const centerX = bounds.x + bounds.width / 2.0;
    const centerY = bounds.y + bounds.height / 2.0;

    const pos = [Math.round(centerX - (windowWidth / 2.0)), Math.round(centerY - (windowHeight / 2.0))];

    return { position: pos, size: [windowWidth, windowHeight] };
  }

  /**
   * Takes an object containing BrowserWindow parameters (x, y, width, height) and
   * ensures that the resulting BrowserWindow would show up on an active screen.
   *
   * @param {Object} Window parameters
   * @returns {Object} Window parameters
   *
   * @memberOf WindowCreator
   */
  public static getValidWindowPositionAndSize(params: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } = {}) {
    // Windows & Linux only, macOS does this itself
    if (process.platform === 'darwin' && !global.loadSettings.testMode) return params;

    // Ensure valid pair
    if ((params.x === undefined && (params.y || params.y === 0))) params.y = undefined;
    if ((params.y === undefined && (params.x || params.x === 0))) params.x = undefined;
    if (params.x === undefined && params.y === undefined) return params;

    const position = [params.x, params.y];
    const size = [params.width, params.height];
    const inDisplay = this.windowPositionInBounds({position, size});

    if (!inDisplay) {
      const newPos = this.calculateDefaultPosition({position, size});

      // Should never happen, but better save then sorry
      if (!newPos.position || newPos.position.length < 2 || !newPos.size || newPos.size.length < 2) return params;

      params.x = newPos.position[0];
      params.y = newPos.position[1];
      params.width = newPos.size[0];
      params.height = newPos.size[1];
    }

    return params;
  }

  /**
   * Takes a rectangle {x, y, width, height} and moves it to the same
   * display as a given BrowserWindow, if necessary.
   *
   * @static
   * @param {Electron.Rectangle} rect
   * @param {Electron.BrowserWindow} browserWindow
   * @returns {Electron.Rectangle}
   */
  public static moveRectToDisplay(rect: Electron.Rectangle,
                                  browserWindow: Electron.BrowserWindow): Electron.Rectangle {
    if (!rect || !browserWindow) {
      d('Called moveRectToDisplay with insufficient parameters');
      return rect;
    }

    if (!rect.x || !rect.y) {
      d('Rect does not contain values to determine display matching');
      return rect;
    }

    let ret = (Object.assign as any)(...Object.keys(rect).map(key => ({[key]: Math.round(rect[key])})));

    const senderDisplay = screen.getDisplayMatching(browserWindow.getBounds());
    const paramsDisplay = screen.getDisplayMatching(ret);

    if (!senderDisplay || !paramsDisplay || senderDisplay.id !== paramsDisplay.id) {
      const displayCenter = this.getCenterForDisplay(senderDisplay);
      ret = Object.assign(ret, displayCenter);
    }
    return ret;
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
  private static rectIsMostlyContainedIn(
    [x, y, width, height]: Array<number>,
    [hostX, hostY, hostWidth, hostHeight]: Array<number>,
    fudgeFactor: {width: number, height: number} = {width: 0.2, height: 0.2}): boolean {

    const leftMost = x + (width * fudgeFactor.width);
    const topMost = y + (height * fudgeFactor.height);

    if (leftMost < hostX) {
      d(`Window too far left for display`);
      return false;
    }

    if (topMost < hostY) {
      d(`Window too far top for display`);
      return false;
    }

    const rightMost = x + width - (width * fudgeFactor.width);
    const bottomMost = y + height - (height * fudgeFactor.height);

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

  /**
   * Returns the center point for a given display
   *
   * @param {Electron.Display} display
   * @returns {Object} center
   * @property {number} x
   * @property {number} y
   */
  private static getCenterForDisplay(display: Electron.Display) {
    const bounds = display.workArea;

    return {
      x: bounds.x + bounds.width / 2.0,
      y: bounds.y + bounds.height / 2.0
    };
  }

  private shouldRecheckWindowPos: Observable<any>;

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
  constructor(recalculateWindowPositionFunc?: recalculateWinPositionFnType) {
    super();

    if (recalculateWindowPositionFunc) {
      this.recalculateWindowPositionFunc = recalculateWindowPositionFunc;
    }
  }

  /**
   * Causes the window to reposition once screen geometry changes. When the
   * window's position / size are garbage, we'll ask the window to pick a new
   * size and position.
   *
   * @param  {BrowserWindow} browserWindow The window to attach the behavior to
   * @param  {Scheduler}     scheduler to schdeule window position check
   * @return {Subscription}            A Subscription that will detach this behavior
   */
  public setup(browserWindow: Electron.BrowserWindow, scheduler?: Scheduler): Subscription {
    if (process.platform === 'darwin' && !global.loadSettings.testMode) {
      d("Don't reposition windows on Mac");
      return Subscription.EMPTY;
    }

    d('Attaching behavior to window');

    if (!this.shouldRecheckWindowPos) {
      // `power-monitor` can only be used from the browser process.
      const resumeFromSleepEvent = process.type === 'browser' ?
        Observable.fromEvent(require('electron').powerMonitor, 'resume') :
        Observable.empty();

      this.shouldRecheckWindowPos =
        Observable.merge(
          Observable.fromEvent(screen, 'display-removed'),
          Observable.fromEvent(screen, 'display-metrics-changed'),
          resumeFromSleepEvent)
        .filter(() => browserWindow.isVisible())
        .throttleTime(1000, scheduler);
    }

    return this.shouldRecheckWindowPos
      .do(() => d('About to check window bounds against display'))
      .filter(() => {
        const coords = {
          position: browserWindow.getPosition(),
          size: browserWindow.getSize()
        };
        return coords.position && coords.size &&
          !RepositionWindowBehavior.windowPositionInBounds(coords);
      })
      .do(() => this.recalculateWindowPositionFunc(browserWindow))
      .catch(() => Observable.of(null))
      .subscribe();
  }

  /**
   * The default function used to calculate a valid window position / size when
   * screen geometry changes.
   */
  private recalculateWindowPositionFunc: recalculateWinPositionFnType = (browserWindow: Electron.BrowserWindow) => {
    const {position, size} = RepositionWindowBehavior.calculateDefaultPosition();
    d(`Setting new window bounds: ${JSON.stringify(position)}, ${JSON.stringify(size)}`);

    browserWindow.setPosition(position[0]!, position[1]!);
    browserWindow.setSize(size[0]!, size[1]!);
  }
}