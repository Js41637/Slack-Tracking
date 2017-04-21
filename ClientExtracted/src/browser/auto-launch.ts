/**
 * @module Browser
 */ /** for typedoc */

import { app } from 'electron';
import * as fs from 'graceful-fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';

import { p } from '../get-path';
import { logger } from '../logger';

export class AutoLaunch {
  private readonly updateExe: string;
  private readonly updateArgs: Array<string>;

  private readonly autostartDir: string;
  private readonly slackDesktopFile: string;
  private readonly targetSlackDesktopFile: string;

  constructor() {
    const appFolder = path.dirname(process.execPath);
    const exeName = path.basename(process.execPath);

    this.updateExe = path.resolve(appFolder, '..', 'Update.exe');
    this.updateArgs = [
      '--processStart', `"${exeName}"`,
      '--process-start-args', `"--startup"`
    ];

    if (process.platform === 'linux') {
      this.autostartDir = p`${'appData'}/autostart`;
      this.slackDesktopFile = p`/usr/share/applications/slack.desktop`;
      this.targetSlackDesktopFile = p`${this.autostartDir}/slack.desktop`;
    }
  }

  /**
   * Returns whether or not auto-launch is enabled.
   *
   * @returns {Boolean}   True if enabled, false otherwise
   */
  public isEnabled(): boolean {
    if (process.platform === 'win32') {
      try {
        return (app.getLoginItemSettings as any)({
          path: `"${this.updateExe}"`,
          args: this.updateArgs
        }).openAtLogin;
      } catch (e) {
        logger.error('AutoLaunch: Checking registry failed: ', e);
      }
    }

    if (process.platform === 'linux') {
      return !!fs.statSyncNoException(this.targetSlackDesktopFile);
    }

    return false;
  }

  /**
   * Enables auto-launch on login.
   */
  public enable(): void {
    if (!this.canModifyAutoLaunch()) return;

    try {
      if (process.platform === 'win32') {
        (app.setLoginItemSettings as any)({
          openAtLogin: true,
          path: `"${this.updateExe}"`,
          args: this.updateArgs
        });
      } else if (process.platform === 'linux') {
        mkdirp.sync(this.autostartDir);
        fs.symlinkSync(this.slackDesktopFile, this.targetSlackDesktopFile);
      }
      logger.info('AutoLaunch: Enabled');
    } catch (e) {
      logger.error('AutoLaunch: Enable failed: ', e);
    }
  }

  /**
   * Disables auto-launch on login.
   */
  public disable(): void {
    if (!this.canModifyAutoLaunch()) return;

    try {
      if (process.platform === 'win32') {
        (app.setLoginItemSettings as any)({
          openAtLogin: false,
          path: `"${this.updateExe}"`,
          args: this.updateArgs
        });
      } else if (process.platform === 'linux') {
        if (!fs.statSyncNoException(this.targetSlackDesktopFile)) return;
        fs.unlinkSync(this.targetSlackDesktopFile);
      }
      logger.info('AutoLaunch: Disabled');
    } catch (e) {
      logger.error('AutoLaunch: Disable failed: ', e);
    }
  }

  /**
   * Check for edge cases where Update.exe may not be accessible.
   *
   * @returns {Boolean}   True if we can modify shortcuts, false otherwise
   */
  public canModifyAutoLaunch(): boolean {
    if (process.platform === 'win32') {
      if (global.loadSettings && global.loadSettings.devMode) {
        logger.warn('AutoLaunch: Disabled in developer mode');
        return false;
      }

      if (!fs.statSyncNoException(this.updateExe)) {
        logger.error('AutoLaunch: Missing Update.exe, checked: ', this.updateExe);
        return false;
      }
    }

    if (process.platform === 'linux') {
      return !!fs.statSyncNoException(this.slackDesktopFile);
    }

    return true;
  }
}
