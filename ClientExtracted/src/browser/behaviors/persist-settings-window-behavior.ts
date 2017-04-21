/**
 * @module BrowserBehaviors
 */ /** for typedoc */

import { logger } from '../../logger';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { async } from 'rxjs/scheduler/async';
import { isObject } from '../../utils/is-object';
import 'rxjs/add/observable/timer';

import { windowFrameActions } from '../../actions/window-frame-actions';
import { windowFrameStore } from '../../stores/window-frame-store';
import { WindowBehavior, WindowSetting } from './window-behavior';
import { RepositionWindowBehavior } from './reposition-window-behavior';

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
   * @return {Subscription}                 A Subscription that manages any event listeners
   */
  public setup(browserWindow: Electron.BrowserWindow): Subscription {
    this.window = browserWindow;

    const { position, size, isMaximized } = this.loadSettings();
    const [x, y] = position;
    const width = size[0] || 0;
    const height = size[1] || 0;

    const [minWidth, minHeight] = browserWindow.getMinimumSize();
    const defaultSizeIsSmallerThanMinimum = !isObject(this.state.windowSettings) &&
      (width < minWidth || height < minHeight);

    if (defaultSizeIsSmallerThanMinimum) {
      browserWindow.setSize(minWidth, minHeight);
    } else {
      if (x && y) {
        browserWindow.setPosition(x, y);
      }
      browserWindow.setSize(width, height);
    }

    // Maximizing the window immediately has no effect; delay it a bit.
    if (isMaximized) {
      async.schedule(() => browserWindow.maximize(), 200);
    }

    return this.saveSettingsOnWindowChange(browserWindow);
  }

  /**
   * Loads serialized window geometry from a local file, or returns
   * canned values if this fails.
   *
   * @return {Object}  Returns an object with keys for size and position
   */
  private loadSettings() {
    let settings: WindowSetting | null = this.state.windowSettings;
    logger.info(`Loading windowMetrics`, settings);

    // If this is the first time the app was run or the window was out of
    // bounds, clear out the settings object (we'll use a default position).
    // Also handle stale (pre-2.0) window settings – those folks are out there!
    if (!isObject(settings) ||
      (settings as any).MAIN ||
      (settings as any).SINGLE_TEAM ||
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
   * Save settings when the window size or position changes.
   *
   * @param  {BrowserWindow} browserWindow  The window being monitored
   * @return {Subscription}                 A Subscription that manages any event listeners
   */
  private saveSettingsOnWindowChange(browserWindow: Electron.BrowserWindow): Subscription {
    const eventsThatMatter = [
      'maximize',
      'unmaximize',
      'restore',
      'resize',
      'move'
    ];

    return Observable.from(eventsThatMatter)
      .mergeMap((eventName) => Observable.fromEvent(browserWindow, eventName))
      .debounceTime(1000)
      .subscribe(() => this.saveSettings());
  }
}
