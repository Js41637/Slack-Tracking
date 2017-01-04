import {remote, webFrame} from 'electron';
import {executeJavaScriptMethod} from 'electron-remote';

import {logger} from '../logger';
import {getMemoryUsage} from '../memory-usage';
import {windowFrameStore} from '../stores/window-frame-store';

export default class Stats {

  /**
   * Attempts to free memory that is no longer being used (like images from a
   * previous navigation).
   */
  clearCache() {
    webFrame.clearCache();
  }

  /**
   * Returns memory stats for the current team.
   *
   * @return {CombinedStats}  The stats Object
   */
  getMemoryUsage() {
    return getMemoryUsage();
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  getCombinedMemoryUsage() {
    let browserWindow = remote.getCurrentWindow();
    return executeJavaScriptMethod(browserWindow, 'global.application.getCombinedMemoryUsage')
      .catch((error) => logger.warn(`Unable to get memory usage: ${error.message}`));
  }

  /**
   * Returns an object containing information about the current display configuration
   * and window settings.
   *
   * @returns {Object}      Object       Information about the display and current window
   * @property {Display[]}  diplays      https://github.com/electron/electron/blob/master/docs/api/structures/display.md
   * @property {Object}     windowFrame  Object containing details about the current window (size, position, etc)
   */
  getDisplayInformation() {
    const displays = remote.screen.getAllDisplays();
    const windowFrame = windowFrameStore.getWindowSettings();

    return {displays, windowFrame};
  }
}
