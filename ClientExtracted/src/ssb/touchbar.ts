/**
 * @module SSBIntegration
 */ /** for typedoc */

import { remote } from 'electron';
import { logger } from '../logger';
import { ITouchBarButton,
  ITouchBarColorPicker,
  ITouchBarGroup,
  ITouchBarLabel,
  ITouchBarPopover,
  ITouchBarSlider,
  ITouchBarSpacer
} from './touchbar-interfaces';

// To be replaced once Electron's typings are up-to-date:
// Electron.TouchBarButton | Electron.TouchBarColorPicker |
// Electron.TouchBarGroup | Electron.TouchBarLabel | Electron.TouchBarPopover |
// Electron.TouchBarSlider | Electron.TouchBarSpacer
export type TouchBarItem = any;

let TouchBar: any;

/**
 * The TouchBarIntegration exposes a number of simple APIs to allow the webapp
 * to constuct a touch bar for Apple's newer MacBooks. One can use fairly
 * straightforward JavaScript objects to represent elements inside the TouchBar,
 * which will then be turned into a "real" TouchBar representation on the
 * Desktop App's side.
 *
 * ### QuickStart
 *
 * Basically, you simply create an array of elements (all found as constructors
 * on [[TouchBarIntegration]]) and call `window.desktop.touchbar.set()` with the
 * array as a parameter.
 *
 * ```js
 * const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = window.desktop.touchbar;
 *
 * const button = new TouchBarButton({
 *   label: 'Press me!',
 *   backgroundColor: '#7851A9',
 *   click: () => console.log('Touch bar button pressed!')
 * });
 * const label = new TouchBarLabel({
 *  label: '😍'
 * });
 *
 * window.desktop.touchbar.set([button, label]);
 * ```
 *
 * ### Developing with the TouchBar
 * You *do not need a MacBook with a TouchBar*. Many emulators are available - they display
 * natively what the TouchBar would display. We'd recommend one of the following two:
 *
 * [Touch Bar Simulator](https://github.com/sindresorhus/touch-bar-simulator) uses the one
 * that comes with Xcode, [Touché](https://red-sweater.com/touche/) is a bit more
 * fully-featured.
 *
 * ### Composing a TouchBar
 * You have the following elements at your disposal:
 *
 * - [[TouchBarButton]]: Simple button
 * - [[TouchBarColorPicker]]: Apple's native Color Picker
 * - [[TouchBarGroup]]: Group of other TouchBar elements
 * - [[TouchBarLabel]]: Simple label (can also hold images)
 * - [[TouchBarPopover]]: Popover, basically a mini-menu
 * - [[TouchBarSlider]]: Numerical slider
 * - [[TouchBarSpacer]]: Spacer
 *
 * The main job of the TouchBar is to provide quick access to contextually relevant actions.
 * In the case of Slack, the use cases are usually obvious - depending on what is in focus,
 * we should display buttons and labels that allow quick access to relevant information or
 * interactions.
 *
 * You can check the currently set TouchBar (represented by an array of items) by calling `get()`.
 * To set a TouchBar - again, represented as an array of items - simply call set with the array
 * as the first parameter. The operation is immediately translated into a native one and is
 * extremely fast and lightweight. We can therefore quickly and easily switch between various
 * TouchBars.
 *
 * @class TouchBarIntegration
 */
export class TouchBarIntegration {
  public TouchBarButton: ITouchBarButton;
  public TouchBarColorPicker: ITouchBarColorPicker;
  public TouchBarGroup: ITouchBarGroup;
  public TouchBarLabel: ITouchBarLabel;
  public TouchBarPopover: ITouchBarPopover;
  public TouchBarSlider: ITouchBarSlider;
  public TouchBarSpacer: ITouchBarSpacer;

  public currentItems: Array<TouchBarItem> = [];
  public isEnabled: boolean = !!(process.platform === 'darwin');
  private browserWindow: Electron.BrowserWindow;

  constructor() {
    this.initialize();
  }

  /**
   * Update the current touch bar for the current browserWindow.
   *
   * @param {Array<TouchBarItem>} items
   */
  public set(items: Array<TouchBarItem>) {
    if (!this.isEnabled) return;

    const touchBar = new TouchBar(items);

    if (this.browserWindow && touchBar) {
      this.browserWindow.setTouchBar(touchBar);
      this.currentItems = items;
    }
  }

  /**
   * Returns the current touch bar.
   *
   * @returns {Array<TouchBarItem>}
   */
  public get(): Array<TouchBarItem> {
    return this.currentItems || [];
  }

  /**
   * Perform one-time initialization of TouchBar classes.
   */
  private initialize(): void {
    logger.info('TouchBarIntegration: Initializing TouchBar classes');
    this.browserWindow = remote.getCurrentWindow();

    TouchBar = remote.TouchBar;
    this.TouchBarButton = TouchBar.TouchBarButton;
    this.TouchBarColorPicker = TouchBar.TouchBarColorPicker;
    this.TouchBarGroup = TouchBar.TouchBarGroup;
    this.TouchBarLabel = TouchBar.TouchBarLabel;
    this.TouchBarPopover = TouchBar.TouchBarPopover;
    this.TouchBarSlider = TouchBar.TouchBarSlider;
    this.TouchBarSpacer = TouchBar.TouchBarSpacer;
  }
}
