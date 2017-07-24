/**
 * @module Bugsnag
 */ /** for typedoc */

import { BrowserWindow, app, dialog } from 'electron';
import * as fs from 'graceful-fs';
import * as path from 'path';

import { logger } from '../logger';
import * as bugsnag from './bugsnag/bugsnag';
import { restartApp } from './restart-app';

import { LOCALE_NAMESPACE, intl as $intl } from '../i18n/intl';
import { TELEMETRY_EVENT, flushTelemetry, track } from '../telemetry';
import { getInstanceUuid } from '../uuid';

export class BugsnagReporter {
  private handlingFatalError: boolean;

  constructor(resourcePath: string, devMode: boolean) {
    const packageJson = path.resolve(resourcePath, 'package.json');
    const version = JSON.parse(fs.readFileSync(packageJson, 'utf-8')).version;

    if (devMode && !!process.env.DEBUG) {
      logger.debug(`BugsnagReporter: skipping setup bugsnag for main process.
        If this is production build, ensure package is generated correctly`);
    }

    (bugsnag as any).register('acaff8df67924f677747922423057034', {
      releaseStage: devMode ? 'development' : 'production',
      appVersion: version,
      packageJson,
      projectRoot: resourcePath,
      metaData: {
        user: {
          id: getInstanceUuid()
        }
      },
      onUncaughtError: (e: Error) => {
        logger.error('**** ABOUT TO CRASH ****');
        if (!e) {
          logger.error('e is null?!');
          this.handleFatalError();
          return;
        }

        if (!e.message && !e.stack) {
          logger.error(e as any);
          this.handleFatalError(e.name);
          return;
        }

        if (e.message) logger.error(e.message);
        if (e.stack) logger.error(e.stack);

        this.handleFatalError(e.message);
      }
    });
  }

  public autoNotify(callback: Function) {
    (bugsnag as any).autoNotify(callback);
  }

  public showDialogOfShame(): Promise<any> {
    return new Promise((resolve) => {
      dialog.showMessageBox(BrowserWindow.getFocusedWindow() || null, {
        type: 'error',
        title: $intl.t('Slack crashed!', LOCALE_NAMESPACE.MESSAGEBOX)(),
        message: $intl.t('We’re terribly sorry, but we’ve run into trouble and need to restart Slack.', LOCALE_NAMESPACE.MESSAGEBOX)(),
        detail: $intl.t('If the problem persists, you can report an issue or contact us at feedback@slack.com.', LOCALE_NAMESPACE.MESSAGEBOX)(),
        buttons: [$intl.t('Close', LOCALE_NAMESPACE.GENERAL)(),
        $intl.t('Restart', LOCALE_NAMESPACE.GENERAL)(),
        process.platform === 'win32' ?
          // @i18n double ampersand is for windows platform. if translated string does not need ampersand can ignore it.
          $intl.t('Restart && Report Issue', LOCALE_NAMESPACE.MESSAGEBOX)() :
          $intl.t('Restart & Report Issue', LOCALE_NAMESPACE.MESSAGEBOX)()
        ],
        defaultId: 2,
        cancelId: 0,
      }, resolve);
    });
  }

  private async handleFatalError(telemetryMessage?: string): Promise<void> {
    // If we haven't opened any windows, just die
    if (BrowserWindow.getAllWindows().length < 1) {
      setTimeout(() => {
        app.quit();
        process.exit(0);
      }, 750);
      return;
    }

    // Prevent >1 dialog from showing up
    if (this.handlingFatalError) return;
    this.handlingFatalError = true;
    try {
      track(TELEMETRY_EVENT.DESKTOP_CRASH, {
        crashOrigin: 'browser',
        crashMessage: telemetryMessage || 'empty',
        crashes: 1
      });

      await flushTelemetry();

      const button = await this.showDialogOfShame();
      if (button === 2) {
        const SettingActions = require('../actions/setting-actions').settingActions;
        SettingActions.updateSettings({ reportIssueOnStartup: true });
      }

      if (button === 0) {
        app.exit(0);
        process.exit(0);
      } else {
        restartApp();
      }
    } catch (e) {
      logger.error(e.message);
      logger.error(e.stack);
    }
  }
}
