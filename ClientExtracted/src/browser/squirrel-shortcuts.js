import fs from 'fs';
import path from 'path';
import {filter} from 'lodash';

import {p} from '../get-path';
import {spawn} from 'spawn-rx';
import {isWindows10OrHigher} from '../native-interop';
import {copySmallFileSync} from '../utils/file-helpers';

/**
 * Forks to Squirrel in order to install or update our app shortcuts.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to install or update
 */
export async function createShortcuts(locations) {
  let target = path.basename(process.execPath);
  let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  let shouldInstallStartup = false;

  // NB: 'Startup' is a special snowflake, because we need to add our hint to
  // the app that we're being started on startup
  if (locations.match(/Startup/)) {
    locations = filter(locations.split(','), (x) => x !== 'Startup').join(',');
    shouldInstallStartup = true;
  }

  let args = ['--createShortcut', target, '-l', locations];

  if (isWindows10OrHigher()) {
    try {
      // NB: Ensure that the icon file always exists forever and ever
      let targetIcon = path.resolve(path.dirname(process.execPath), '..', 'app-win10.ico');

      copySmallFileSync(
        require.resolve('../static/app-win10.ico').replace('app.asar', 'app.asar.unpacked'),
        targetIcon
      );

      args.push('--icon');
      args.push(targetIcon);
    } catch (e) {
      // NB: We can't even log stuff at this point :(
      console.log(`Failed to write icon: ${e.message}, continuing anyways`);
    }
  }

  await spawn(updateDotExe, args).toPromise();

  if (shouldInstallStartup) {
    args = ['--createShortcut', target, '-l', 'Startup', '-a', '--startup'];
    await spawn(updateDotExe, args).toPromise();
  }
}

/**
 * Forks to Squirrel in order to remove our app shortcuts.
 * Called on app uninstall AND app update.
 *
 * @param  {String} locations A comma-separated string of shortcut locations remove
 */
export async function removeShortcuts(locations) {
  let target = path.basename(process.execPath);
  let updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  let args = ['--removeShortcut', target, '-l', locations];

  await spawn(updateDotExe, args).toPromise();
}

/**
 * Updates all app shortcuts by calling `createShortcuts`, then removes any
 * inadvertently created shortcuts that didn't exist before.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to update
 */
export async function updateShortcuts(locations) {
  let startupShortcut = p`${'appData'}/Microsoft/Windows/Start Menu/Programs/Startup/Slack.lnk`;
  let hasStartupShortcut = fs.statSyncNoException(startupShortcut);

  let desktopShortcut = p`${'userDesktop'}/Slack.lnk`;
  let hasDesktopShortcut = fs.statSyncNoException(desktopShortcut);

  // NB: We need to keep track of which shortcuts don't exist, because
  // update.exe will add them all.
  let toRemove = [];
  if (!hasStartupShortcut) toRemove.push('Startup');
  if (!hasDesktopShortcut) toRemove.push('Desktop');

  await createShortcuts(locations);

  if (toRemove.length > 0) {
    await removeShortcuts(toRemove.join(','));
  }
}
