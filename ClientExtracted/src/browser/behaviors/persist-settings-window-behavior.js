import logger from '../../logger';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {async} from 'rxjs/scheduler/async';
import {screen as atomScreen} from 'electron';
import isObject from '../../utils/is-object';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import WindowBehavior from './window-behavior';
import RepositionWindowBehavior from './reposition-window-behavior';

/**
 * Save every thirty minutes.
 */
const SAVE_INTERVAL_MS = 30 * 60 * 1000;

export default class PersistSettingsWindowBehavior extends WindowBehavior {

  syncState() {
    return {
      windowSettings: AppStore.getWindowSettings()
    };
  }

  /**
   * Causes the window to persist its position and size, and restores any
   * values from a local file if they exist.
   *
   * @param  {BrowserWindow} browserWindow  The window to attach the behavior to
   * @return {Subscription}                   A Subscription that will write these settings
   */
  setup(browserWindow) {
    this.window = browserWindow;

    let {position, size, isMaximized} = this.loadSettings();
    let [x, y] = position;
    let [width, height] = size;

    let [minWidth, minHeight] = browserWindow.getMinimumSize();
    let defaultSizeIsSmallerThanMinimum = !isObject(this.state.windowSettings) &&
      (width < minWidth || height < minHeight);

    if (defaultSizeIsSmallerThanMinimum) {
      browserWindow.setSize(minWidth, minHeight);
    } else {
      browserWindow.setPosition(x, y);
      browserWindow.setSize(width, height);
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
  loadSettings() {
    let settings = this.state.windowSettings;
    logger.info(`Loading windowMetrics: ${JSON.stringify(settings)}`);

    // Beta releases of 2.0 had window settings divided between windows.
    // TODO: Remove this once everyone's on 2.0.
    if (settings && settings.hasOwnProperty('MAIN')) {
      settings = settings.MAIN;
    }

    // If this is the first time the app was run or the window was out of
    // bounds, clear out the settings object (we'll use a default position).
    if (!isObject(settings) ||
      !RepositionWindowBehavior.windowPositionInBounds(atomScreen, settings)) {
      settings = null;
    }

    // Go back to the default window position, and save it for posterity.
    if (!settings) {
      settings = RepositionWindowBehavior.calculateDefaultPosition(atomScreen);
      AppActions.saveWindowSettings(settings);
    }

    return settings;
  }

  /**
   * Saves the current window size and position.
   */
  saveSettings() {
    let settings = {
      size: this.window.getSize(),
      position: this.window.getPosition(),
      isMaximized: this.window.isMaximized()
    };

    // If maximized, we don't actually want the size `BrowserWindow` gives us,
    // because restoring the window will use that size. We'll just remember
    // that we're maximized, and keep the restored size as the default.
    if (settings.isMaximized) {
      settings = RepositionWindowBehavior.calculateDefaultPosition(atomScreen, settings);
      settings.isMaximized = true;
    }

    AppActions.saveWindowSettings(settings);
  }

  /**
   * Save window settings once in a while because, even though we're supposed
   * to save on exit, if the user logs out of Windows or shuts the app down in
   * an obscene manner, they'd never be saved.
   *
   * @return {Subscription}  A Subscription that will end this timer
   */
  saveSettingsOccasionally() {
    return Observable
      .timer(SAVE_INTERVAL_MS, SAVE_INTERVAL_MS)
      .subscribe(() => this.saveSettings());
  }
}
