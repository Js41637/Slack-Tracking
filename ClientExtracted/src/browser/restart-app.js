import {app} from 'electron';

/**
 * Causes the app to restart on exit, then exits.
 */
export default function restartApp() {
  if (!process.mas) app.relaunch();
  app.exit(0);
  process.exit(0);
}
