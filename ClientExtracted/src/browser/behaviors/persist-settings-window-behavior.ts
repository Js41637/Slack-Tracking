import {logger} from '../../logger';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {async} from 'rxjs/scheduler/async';
import {isObject} from '../../utils/is-object';
import 'rxjs/add/observable/timer';

import {windowFrameActions} from '../../actions/window-frame-actions';
import {windowFrameStore} from '../../stores/window-frame-store';
import {WindowBehavior, WindowSetting} from './window-behavior';
import {RepositionWindowBehavior} from './reposition-window-behavior';

/**
 * Save every eight hours.
 */
const SAVE_INTERVAL_MS = 8 * 60 * 60 * 1000;

export interface PersistSettingsWindowBehaviorState {
  windowSettings: WindowSetting;
}

export class PersistSettingsWindowBehavior extends WindowBehavior {
  public readonly state: PersistSettingsWindowBehaviorState;
  private window: Electron.BrowserWindow;

  public syncState(): PersistSettingsWindowBehaviorState {
    return {
      windowSettings: windowFrameStore.getWindowSettings()
    };
  }

  /**
   * Causes the window to persist its position and size, and restores any
   * values from a local file if they exist.
   *
   * @param  {BrowserWindow} browserWindow  The window to attach the behavior to
   * @return {Subscription}                   A Subscription that will write these settings
   */
  public setup(browserWindow: Electron.BrowserWindow): Subscription {
    this.window = browserWindow;

    const {position, size, isMaximized} = this.loadSettings();
    const [x, y] = position;
    const [width, height] = size;

    const [minWidth, minHeight] = browserWindow.getMinimumSize();
    const defaultSizeIsSmallerThanMinimum = !isObject(this.state.windowSettings) &&
      (width < minWidth || height < minHeight);

    if (defaultSizeIsSmallerThanMinimum) {
      browserWindow.setSize(minWidth, minHeight);
    } else {
      browserWindow.setPosition(x!, y!);
      browserWindow.setSize(width!, height!);
    }

    // Maximizing the window immediately has no effect; delay it a bit.
    if (isMaximized) {
      async.schedule(() => browserWindow.maximize(), 200);
    }

    const ret = new Subscription();
    ret.add(() => this.saveSettings());
    ret.add(this.saveSettingsOccasionally());
    return ret;
  }

  /**
   * Loads serialized window geometry from a local file, or returns
   * canned values if this fails.
   *
   * @return {Object}  Returns an object with keys for size and position
   */
  private loadSettings() {
    let settings: WindowSetting | null = this.state.windowSettings;
    logger.info(`Loading windowMetrics: ${JSON.stringify(settings)}`);

    // Beta releases of 2.0 had window settings divided between windows.
    // TODO: Remove this once everyone's on 2.0.
    if (settings && settings.hasOwnProperty('MAIN')) {
      settings = (settings as any).MAIN;
    }

    // If this is the first time the app was run or the window was out of
    // bounds, clear out the settings object (we'll use a default position).
    if (!isObject(settings) ||
      !RepositionWindowBehavior.windowPositionInBounds(settings!)) {
      settings = null;
    }

    // Go back to the default window position, and save it for posterity.
    if (!settings) {
      settings = RepositionWindowBehavior.calculateDefaultPosition() as WindowSetting;
      windowFrameActions.saveWindowSettings(settings);
    }

    return settings;
  }

  /**
   * Saves the current window size and position.
   */
  private saveSettings(): void {
    let settings: WindowSetting = {
      size: this.window.getSize(),
      position: this.window.getPosition(),
      isMaximized: this.window.isMaximized()
    };

    // If maximized, we don't actually want the size `BrowserWindow` gives us,
    // because restoring the window will use that size. We'll just remember
    // that we're maximized, and keep the restored size as the default.
    if (settings.isMaximized) {
      settings = RepositionWindowBehavior.calculateDefaultPosition(settings) as WindowSetting;
      settings.isMaximized = true;
    }

    windowFrameActions.saveWindowSettings(settings);
  }

  /**
   * Save window settings once in a while because, even though we're supposed
   * to save on exit, if the user logs out of Windows or shuts the app down in
   * an obscene manner, they'd never be saved.
   *
   * @return {Subscription}  A Subscription that will end this timer
   */
  private saveSettingsOccasionally(): Subscription {
    return Observable
      .timer(SAVE_INTERVAL_MS, SAVE_INTERVAL_MS)
      .subscribe(() => this.saveSettings());
  }
}
