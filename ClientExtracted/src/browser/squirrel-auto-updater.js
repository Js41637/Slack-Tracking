import {BrowserWindow, dialog, shell} from 'electron';
import {Observable} from 'rxjs/Observable';
import SerialSubscription from 'rxjs-serial-subscription';
import logger from '../logger';

import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';
import WindowStore from '../stores/window-store';

import {getReleaseNotesUrl} from './updater-utils';
import {UPDATE_STATUS} from '../utils/shared-constants';

/**
 * Check for updates every six hours
 */
export const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;

export default class SquirrelAutoUpdater extends ReduxComponent {

  constructor() {
    super();
    this.autoUpdateDisp = new SerialSubscription();
    this.autoUpdateDisp.add(this.setupAutomaticUpdates());
    this.disposables.add(this.autoUpdateDisp);

    if (this.isUpdateSupported()) {
      this.autoUpdater = require('electron').autoUpdater;

      Observable.fromEvent(this.autoUpdater, 'update-available').subscribe(() => {
        AppActions.setUpdateStatus(UPDATE_STATUS.DOWNLOADING_UPDATE);
      });
    }
  }

  syncState() {
    return {
      appVersion: SettingStore.getSetting('appVersion'),
      isDevMode: SettingStore.getSetting('isDevMode'),
      disableUpdatesCheck: SettingStore.getSetting('isWindowsStore') ||
        SettingStore.getSetting('isMacAppStore'),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      updateStatus: AppStore.getUpdateStatus(),
      mainWindow: WindowStore.getMainWindow()
    };
  }

  /**
   * Starts a timer that will check for updates every 6 hours.
   *
   * @return {Subscription}  A `Subscription` that cancels the timer
   */
  setupAutomaticUpdates() {
    return Observable.timer(0, UPDATE_CHECK_INTERVAL)
      .filter(() => this.isUpdateSupported())
      .map(() => this.getUpdaterForCurrentPlatform())
      .do(() => AppActions.setUpdateStatus(UPDATE_STATUS.CHECKING_FOR_UPDATE))
      .flatMap((updater) => updater.checkForUpdates())
      .subscribe((updateInfo) => {
        if (updateInfo) {
          logger.info(`Got an update: ${JSON.stringify(updateInfo)}`);
          AppActions.updateDownloaded(updateInfo);
        } else {
          AppActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);
        }
      },
      (e) => {
        logger.error(`Failed to check for updates: ${e.message}`);
        AppActions.setUpdateStatus(UPDATE_STATUS.ERROR);
      });
  }

  /**
   * Checks for available updates using Squirrel and displays a message box
   * based on the result. If an update is available the user is given the
   * option to upgrade immediately.
   */
  manualCheckForUpdate() {
    if (!this.isUpdateSupported()) {
      logger.warn('Updates are not supported on this build.');
      AppActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);
      return;
    }

    let updater = this.getUpdaterForCurrentPlatform();
    let updateInformation = getReleaseNotesUrl(this.state.releaseChannel === 'beta');
    let browserWindow = BrowserWindow.fromId(this.state.mainWindow.id);

    let hasAnUpdate = (updateInfo) => {
      logger.info(`Got an update: ${JSON.stringify(updateInfo)}`);
      AppActions.updateDownloaded(updateInfo);

      let options = {
        title: 'An update is available',
        buttons: ['Close', "What's New", "Update Now"],
        message: 'A new version of Slack is available!'
      };

      dialog.showMessageBox(browserWindow, options, (response) => {
        if (response === 0) {
          AppActions.setUpdateStatus(UPDATE_STATUS.NONE);
        }

        if (response === 1) {
          AppActions.setUpdateStatus(UPDATE_STATUS.NONE);
          shell.openExternal(updateInformation);
        }

        if (response === 2) {
          this.restartToApplyUpdate();
        }
      });
    };

    let alreadyUpToDate = () => {
      AppActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);

      dialog.showMessageBox(browserWindow, {
        title: "You're all good",
        buttons: ['OK'],
        message: "You've got the latest version of Slack; thanks for staying on the ball."
      });
    };

    let somethingBadHappened = (errorMessage) => {
      AppActions.setUpdateStatus(UPDATE_STATUS.ERROR);

      dialog.showMessageBox(browserWindow, {
        title: "We couldn't check for updates",
        buttons: ['OK'],
        message: "Check your Internet connection, and contact support if this issue persists.",
        detail: process.platform === 'darwin' ? errorMessage : undefined
      });
    };

    updater.checkForUpdates().subscribe(
      (update) => {
        if (update) {
          hasAnUpdate(update);
        } else {
          alreadyUpToDate();
        }
      },
      (e) => {
        logger.error(`Failed to check for updates: ${e.message}\n${e.stack}`);
        somethingBadHappened(e.message);
      });
  }

  /**
   * Returns a platform-specific implementation of `SquirrelUpdater`, or null
   * if updates are unsupported.
   *
   * @return {WindowsSquirrelUpdater|MacSquirrelUpdater}
   */
  getUpdaterForCurrentPlatform() {
    let SquirrelUpdater = null;
    switch (process.platform) {
    case 'linux':
      return null;
    case 'win32':
      SquirrelUpdater = require('./windows-updater').default;
      break;
    case 'darwin':
      SquirrelUpdater = require('./mac-updater').default;
      break;
    }

    return new SquirrelUpdater({
      version: this.state.appVersion,
      useBetaChannel: this.state.releaseChannel === 'beta'
    });
  }

  /**
   * Returns true if updates can be applied, false if:
   *
   * 1. Running in developer mode
   * 2. Running from a TEMP directory
   * 3. Running from a Store build (Windows or Mac)
   * 4. On Linux
   * 5. An environment variable override is set
   *
   * @return {type}  description
   */
  isUpdateSupported() {
    if (this.state.isDevMode) return false;
    if (this.state.disableUpdatesCheck) return false;
    if (process.platform === 'linux') return false;
    if (process.env.SLACK_NO_AUTO_UPDATES) return false;

    let tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
    if (process.execPath.indexOf(tmpDir) >= 0) {
      logger.warn('Updates are not supported when running from TEMP');
      return false;
    }

    return true;
  }

  /**
   * Make sure we'll exit rather than hide the main window, then do it.
   */
  restartToApplyUpdate() {
    let browserWindow = BrowserWindow.fromId(this.state.mainWindow.id);
    browserWindow.exitApp = true;
    this.autoUpdater.quitAndInstall();
  }

  update(prevState={}) {
    if (this.state.releaseChannel !== prevState.releaseChannel) {
      this.autoUpdateDisp.add(this.setupAutomaticUpdates());
    }

    if (prevState.updateStatus !== this.state.updateStatus) {
      switch (this.state.updateStatus) {
      case UPDATE_STATUS.CHECKING_FOR_UPDATE_MANUAL:
        this.manualCheckForUpdate();
        break;
      case UPDATE_STATUS.RESTART_TO_APPLY:
        this.restartToApplyUpdate();
        break;
      }
    }
  }
}
