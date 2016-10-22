import {app, BrowserWindow, dialog} from 'electron';
import fs from 'fs';
import path from 'path';

import bugsnag from './bugsnag/bugsnag';
import logger from '../logger';
import restartApp from './restart-app';

export default class BugsnagReporter {
  constructor(resourcePath, devMode) {
    let packageJson = path.resolve(resourcePath, 'package.json');
    let version = JSON.parse(fs.readFileSync(packageJson)).version;

    bugsnag.register('acaff8df67924f677747922423057034', {
      releaseStage: devMode ? 'development' : 'production',
      appVersion: version,
      packageJson: packageJson,
      projectRoot: resourcePath,
      onUncaughtError: (e) => {
        logger.error("**** ABOUT TO CRASH ****");
        if (!e) {
          logger.error("e is null?!");
          this.handleFatalError();
          return;
        }

        if (!e.message && !e.stack) {
          logger.error(e);
          this.handleFatalError();
          return;
        }

        if (e.message) logger.error(e.message);
        if (e.stack) logger.error(e.stack);

        this.handleFatalError();
      }
    });
  }

  autoNotify(callback) {
    bugsnag.autoNotify(callback);
  }

  showDialogOfShame() {
    return new Promise((resolve) => {
      dialog.showMessageBox(BrowserWindow.getFocusedWindow() || null, {
        type: 'error',
        title: 'Slack crashed!',
        message: "We're terribly sorry, but we've run into trouble and need to restart.",
        detail: "If the problem persists, you can report an issue or contact us at feedback@slack.com.",
        buttons: ['Close', 'Restart', `Restart ${process.platform === 'darwin' ? '&' : '&&'} Report Issue`],
        defaultId: 2,
        cancelId: 0,
      }, resolve);
    });
  }

  async handleFatalError() {
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
      let button = await this.showDialogOfShame();
      if (button === 2) {
        let SettingActions = require('../actions/setting-actions').default;
        SettingActions.updateSettings({reportIssueOnStartup: true});
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
