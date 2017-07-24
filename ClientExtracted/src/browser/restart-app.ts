/**
 * @module Browser
 */ /** for typedoc */

import { app } from 'electron';
import { closeAllWindows } from './close-windows';

/**
 * Causes the app to restart on exit, then exits.
 */
export function restartApp(options?: { destroyWindows: boolean }): void {
  if (!process.mas) app.relaunch();

  if (options && options.destroyWindows) {
    closeAllWindows({ destroyWindows: true });
  }

  app.exit(0);
  process.exit(0);
}
