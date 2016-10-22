import fs from 'fs';
import path from 'path';

import {app} from 'electron';
import {spawn} from 'child_process';

function quitApp() {
  app.exit(0);
  process.exit(0);
  return Promise.resolve(true);
}

export default function restartApp() {
  // NB: Without our Update.exe trampoline, we can't restart ourselves properly
  if (process.platform !== 'win32') {
    return quitApp();
  }

  let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  if (!fs.statSyncNoException(updateDotExe)) {
    return quitApp();
  }

  // Uses Squirrel to find the latest app version folder, then starts the
  // given executable once the parent process exits
  spawn(updateDotExe, ['--processStartAndWait', path.basename(process.execPath)]);

  // Wait long enough for the process to start up, unfortunately
  // `child_process` doesn't give us an event
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  }).then(() => quitApp());
}