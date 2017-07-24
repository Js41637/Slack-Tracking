/**
 * @module Browser
 */ /** for typedoc */

import { BrowserWindow } from 'electron';

import { logger } from '../logger';

/**
 * Closes all windows, optionally using `destroy()` instead of `close()`.
 *
 * @param {{ destroyWindows: boolean }} [options]
 */
export function closeAllWindows(options?: { destroyWindows: boolean }): void {
  const browserWindows: Array<Electron.BrowserWindow> = BrowserWindow.getAllWindows() || [];
  const destroy = options && options.destroyWindows;

  browserWindows.filter((bw) => bw && !bw.isDestroyed()).forEach((browserWindow) => {
    try {
      destroy ? browserWindow.destroy() : browserWindow.close();
    } catch (e) {
      logger.error(`Tried to ${destroy ? 'destroy' : 'close'} window, but failed`, e);
    }
  });
}
