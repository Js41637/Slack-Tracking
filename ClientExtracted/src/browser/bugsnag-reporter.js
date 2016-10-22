import bugsnag from './bugsnag/bugsnag';
import fs from 'fs';
import logger from '../logger';
import path from 'path';
import restartApp from './restart-app';

import {app, BrowserWindow, dialog, shell} from 'electron';

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

  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  showDialogOfShame() {
    /*
    const buttonText = [
      "Alas",
      "D'oh",
      "We all have our bad days",
      "Ugh, the worst",
      "Sorry, srsly",
      "Zomg, the worst",
      "Slack is not so fetch",
      "We'll do better",
      "Restart rn",
      "Ugh",
    ];


    let thisButton = buttonText[this.getRandomInt(0, buttonText.length-1)];
    */

    return new Promise((resolve) => {
      dialog.showMessageBox(BrowserWindow.getFocusedWindow() || null, {
        type: 'error',
        title: 'Slack has crashed',
        message: "We're quite sorry, but Slack needs to restart.\n\nIf you run into this often, please drop us a line so that we can help figure out what's going on, at feedback@slack.com.",
        buttons: ["Send an email", "Ok"],
        defaultId: 1,
        cancelId: 1,
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
      if (button === 0) {
        shell.openExternal('mailto:feedback@slack.com');
      }

      await restartApp();
    } catch (e) {
      logger.error(e.message);
      logger.error(e.stack);
    }
  }
}
