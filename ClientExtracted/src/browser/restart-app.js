import {app} from 'electron';

/**
 * Causes the app to restart on exit, then exits.
 */
export default function restartApp() {
  app.relaunch();
  app.exit(0);
  process.exit(0);
}
