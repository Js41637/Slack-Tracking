import {WindowSetting} from '../browser/behaviors/window-behavior';
import {remote, webFrame} from 'electron';
import {executeJavaScriptMethod} from 'electron-remote';

import {logger} from '../logger';
import {getMemoryUsage, CombinedStats} from '../memory-usage';
import {windowFrameStore} from '../stores/window-frame-store';

export class Stats {

  /**
   * Attempts to free memory that is no longer being used (like images from a
   * previous navigation).
   */
  public clearCache(): void {
    webFrame.clearCache();
  }

  /**
   * Returns memory stats for the current team.
   *
   * @return {CombinedStats}  The stats Object
   */
  public getMemoryUsage(): CombinedStats {
    return getMemoryUsage();
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * DEPRECATED in favor of getTeamsMemoryUsage.
   * Remove this once the webapp is no longer using it.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  public getCombinedMemoryUsage(): Promise<CombinedStats> {
    const browserWindow = remote.getCurrentWindow();
    return executeJavaScriptMethod(browserWindow, 'global.application.getCombinedMemoryUsage')
      .catch((error: Error) => logger.warn(`Unable to get memory usage: ${error.message}`));
  }

  /**
   * Returns memory stats for individual teams, and their current state (min vs
   * full client).
   *
   * @return {Promise<StringMap<TeamMemoryStats>>}  A map of teams to their stats
   */
  public getTeamsMemoryUsage() {
    const browserWindow = remote.getCurrentWindow();
    return executeJavaScriptMethod(browserWindow, 'global.application.getTeamsMemoryUsage')
      .catch((error: Error) => logger.warn(`Unable to get memory usage: ${error.message}`));
  }

  /**
   * Returns an object containing information about the current display configuration
   * and window settings.
   *
   * @returns {Object}      Object       Information about the display and current window
   * @property {Display[]}  diplays      https://github.com/electron/electron/blob/master/docs/api/structures/display.md
   * @property {Object}     windowFrame  Object containing details about the current window (size, position, etc)
   */
  public getDisplayInformation(): {
    displays: Array<Electron.Display>;
    windowFrame: WindowSetting
  } {
    const displays = remote.screen.getAllDisplays();
    const windowFrame = windowFrameStore.getWindowSettings();

    return {displays, windowFrame};
  }
}
