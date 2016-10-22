import {remote, webFrame} from 'electron';
import {executeJavaScriptMethod} from 'electron-remote';

import logger from '../logger';
import {getMemoryUsage} from '../memory-usage';

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
}
