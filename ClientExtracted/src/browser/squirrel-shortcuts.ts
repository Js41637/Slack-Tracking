import * as fs from 'graceful-fs';
import * as path from 'path';

import {p} from '../get-path';
import {spawn} from 'spawn-rx';

import {nativeInterop} from '../native-interop';
import {copySmallFileSync} from '../utils/file-helpers';

/**
 * Forks to Squirrel in order to install or update our app shortcuts.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to install or update
 */
export async function createShortcuts(locations: string): Promise<void> {
  const target = path.basename(process.execPath);
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  let shouldInstallStartup = false;

  // NB: 'Startup' is a special snowflake, because we need to add our hint to
  // the app that we're being started on startup
  if (locations.match(/Startup/)) {
    locations = locations.split(',').filter((x) => x !== 'Startup').join(',');
    shouldInstallStartup = true;
  }

  let args = ['--createShortcut', target, '-l', locations];

  if (nativeInterop.isWindows10OrHigher()) {
    try {
      // NB: Ensure that the icon file always exists forever and ever
      const targetIcon = path.resolve(path.dirname(process.execPath), '..', 'app-win10.ico');

      copySmallFileSync(
        require.resolve('../static/app-win10.ico').replace('app.asar', 'app.asar.unpacked'),
        targetIcon
      );

      args.push('--icon');
      args.push(targetIcon);
    } catch (e) {
      // NB: We can't even log stuff at this point :(
      console.log(`Failed to write icon: ${e.message}, continuing anyways`); //tslint:disable-line:no-console
    }
  } else {
    console.log('Operating system is Win7, using colorful icon'); // tslint:disable-line:no-console
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
export async function removeShortcuts(locations: string): Promise<void> {
  const target = path.basename(process.execPath);
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  const args = ['--removeShortcut', target, '-l', locations];

  await spawn(updateDotExe, args).toPromise();
}

/**
 * Checks if the start menu contains an empty "Slack Technologies" folder. If so, it removes it.
 */
export function removeStartMenuFolder(): void {
  const folderLocation = p`${'appData'}/Microsoft/Windows/Start Menu/Programs/Slack Technologies/`;
  const hasFolderLocation = fs.statSyncNoException(folderLocation);

  if (hasFolderLocation) {
    try {
      const contents = fs.readdirSync(folderLocation) || [];
      if (contents.length === 0) fs.rmdirSync(folderLocation);
    } catch (e) {
      console.log(`Failed to check "Slack Technologies" folder for contents, did not remove it: ${e.message}`); //tslint:disable-line:no-console
    }
  }
}

/**
 * Updates all app shortcuts by calling `createShortcuts`, then removes any
 * inadvertently created shortcuts that didn't exist before.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to update
 */
export async function updateShortcuts(locations: string): Promise<void> {
  const startupShortcut = p`${'appData'}/Microsoft/Windows/Start Menu/Programs/Startup/Slack.lnk`;
  const hasStartupShortcut = fs.statSyncNoException(startupShortcut);

  const desktopShortcut = p`${'userDesktop'}/Slack.lnk`;
  const hasDesktopShortcut = fs.statSyncNoException(desktopShortcut);

  // NB: We need to keep track of which shortcuts don't exist, because
  // update.exe will add them all.
  const toRemove = [];
  if (!hasStartupShortcut) toRemove.push('Startup');
  if (!hasDesktopShortcut) toRemove.push('Desktop');

  await createShortcuts(locations);

  if (toRemove.length > 0) {
    await removeShortcuts(toRemove.join(','));
  }
}
