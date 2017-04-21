/**
 * @module Browser
 */ /** for typedoc */

import { app, BrowserWindow } from 'electron';

import { logger } from '../logger';

/**
 * Causes the app to restart on exit, then exits.
 */
export function restartApp(options?: { destroyWindows: boolean }): void {
  if (!process.mas) app.relaunch();

  if (options && options.destroyWindows) {
    // Burn windows to the ground
    const browserWindows = BrowserWindow.getAllWindows() || [];
    browserWindows.forEach((browserWindow) => {
      if (browserWindow && !browserWindow.isDestroyed()) {
        try {
          browserWindow.destroy();
        } catch (e) {
          logger.error(`Tried to destroy window during restart app, but failed`, e);
        }
      }
    });
  }

  app.exit(0);
  process.exit(0);
}
