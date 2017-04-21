/**
 * @module Browser
 */ /** for typedoc */

import { app } from 'electron';
import * as fs from 'graceful-fs';
import * as path from 'path';
import { spawn } from 'spawn-rx';

import { AutoLaunch } from './auto-launch';
import { copySmallFileSync } from '../utils/file-helpers';
import { logger } from '../logger';
import { nativeInterop } from '../native-interop';
import { p } from '../get-path';

/**
 * Create Run registry entry and shortcuts.
 *
 * @param  {String} locations A comma-separated string of shortcut locations
 */
export async function onInstall(locations: string, enableAutoLaunch: boolean = true): Promise<void> {
  if (enableAutoLaunch) {
    const autoLaunch = new AutoLaunch();
    autoLaunch.enable();
  }

  const target = path.basename(process.execPath);
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');

  const args = ['--createShortcut', target, '-l', locations];

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
      logger.error(`Failed to write icon: ${e.message}, continuing anyways`);
    }
  } else {
    logger.info('Operating system is Win7, using colorful icon');
  }

  await spawn(updateDotExe, args).toPromise();
}

/**
 * Pretty much the same as onInstall, with some logic to check for shortcuts
 * that were removed by the user.
 *
 * @param  {String} locations A comma-separated string of shortcut locations to update
 */
export async function onUpdate(locations: string): Promise<void> {
  const startupShortcut = p`${'appData'}/Microsoft/Windows/Start Menu/Programs/Startup/Slack.lnk`;
  const hasStartupShortcut = !!fs.statSyncNoException(startupShortcut);

  if (hasStartupShortcut) fs.unlinkSync(startupShortcut);

  const desktopShortcut = p`${'userDesktop'}/Slack.lnk`;
  const hasDesktopShortcut = !!fs.statSyncNoException(desktopShortcut);

  // If the user already removed the desktop shortcut don't re-create it.
  if (locations.match(/Desktop/) && !hasDesktopShortcut) {
    locations = locations.split(',').filter((x) => x !== 'Desktop').join(',');
  }

  // If the user already removed the Startup shortcut don't enable auto-launch.
  await onInstall(locations, hasStartupShortcut);
}

/**
 * Remove registry entries, shortcuts, and kill all running processes.
 *
 * @param  {String} locations A comma-separated string of shortcut locations
 */
export async function onUninstall(locations: string): Promise<void> {
  app.removeAsDefaultProtocolClient('slack');

  const autoLaunch = new AutoLaunch();
  autoLaunch.disable();

  const target = path.basename(process.execPath);
  const updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
  const args = ['--removeShortcut', target, '-l', locations];

  await spawn(updateDotExe, args).toPromise();

  removeStartMenuFolder();

  const taskKill = p`${'SYSTEMROOT'}/system32/taskkill.exe`;
  const killArgs = ['/F', '/IM', 'slack.exe', '/T'];
  await spawn(taskKill, killArgs);
}

/**
 * Checks if Start Menu has an empty "Slack Technologies" folder. If so, remove it.
 */
function removeStartMenuFolder(): void {
  const folderLocation = p`${'appData'}/Microsoft/Windows/Start Menu/Programs/Slack Technologies/`;
  const hasFolderLocation = fs.statSyncNoException(folderLocation);

  if (hasFolderLocation) {
    try {
      const contents = fs.readdirSync(folderLocation) || [];
      if (contents.length === 0) fs.rmdirSync(folderLocation);
    } catch (e) {
      logger.error('Failed to check "Slack Technologies" folder: ', e);
    }
  }
}
