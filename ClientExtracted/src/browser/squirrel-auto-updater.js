import {dialog, shell} from 'electron';
import logger from '../logger';
import {Observable, Disposable, SerialDisposable} from 'rx';

import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import EventActions from '../actions/event-actions';
import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';

import {UPDATE_STATUS} from '../utils/shared-constants';

/**
 * Check for updates every six hours
 */
export const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;

export function getReleaseNotesUrl(isBetaChannel) {
  let url = 'https://www.slack.com/apps/';
  switch (process.platform) {
  case 'win32': url += 'windows'; break;
  case 'darwin': url += 'mac'; break;
  case 'linux': url += 'linux'; break;
  }
  url += isBetaChannel ? '/release-notes-beta' : '/release-notes';
  return url;
}

export default class SquirrelAutoUpdater extends ReduxComponent {

  constructor() {
    super();
    this.autoUpdateDisp = new SerialDisposable();
    this.autoUpdateDisp.setDisposable(this.setupAutomaticUpdates());
    this.disposables.add(this.autoUpdateDisp);
  }

  syncState() {
    return {
      appVersion: SettingStore.getSetting('appVersion'),
      isDevMode: SettingStore.getSetting('isDevMode'),
      disableUpdatesCheck: SettingStore.getSetting('isWindowsStore') ||
        SettingStore.getSetting('isMacAppStore'),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      updateStatus: AppStore.getUpdateStatus()
    };
  }

  /**
   * Starts a timer that will check for updates every 6 hours.
   *
   * @return {Disposable}  A `Disposable` that cancels the timer
   */
  setupAutomaticUpdates() {
    // NB: Store builds will update themselves
    if (this.state.disableUpdatesCheck) {
      return Disposable.empty;
    }

    return Observable.timer(0, UPDATE_CHECK_INTERVAL).subscribe(() => {
      if (this.state.isDevMode) return;
      if (process.env.SLACK_NO_AUTO_UPDATES) return;

      let tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
      if (process.execPath.indexOf(tmpDir) >= 0) {
        logger.warn("Would've updated, but appears that we are running from temp dir, skipping!");
        return;
      }

      let updater = this.getSquirrelUpdater();
      if (!updater) return;

      // NB: There are some differences between the platform-specific updater
      // implementations. On Windows, `checkForUpdates` is just the check, it
      // doesn't actually spawn an update process. On Mac, `checkForUpdates`
      // does everything we need.
      switch (process.platform) {
      case 'win32':
        updater.doBackgroundUpdate().subscribe(
          (x) => logger.debug(`Background update returned ${x}`),
          (e) => {
            logger.error(`Failed to check for updates: ${e.message}`);
            AppActions.setUpdateStatus(UPDATE_STATUS.ERROR);
          }
        );
        break;

      case 'darwin':
        AppActions.setUpdateStatus(UPDATE_STATUS.CHECKING_FOR_UPDATE);
        updater.checkForUpdates().subscribe(
          (x) => logger.info(`Squirrel update returned ${x}`),
          (e) => {
            logger.error(`Failed to check for updates: ${e.message}`);
            AppActions.setUpdateStatus(UPDATE_STATUS.ERROR);
          }
        );
        break;
      }
    });
  }

  /**
   * Checks for available updates using Squirrel and displays a message box
   * based on the result. If an update is available the user is given the
   * option to upgrade immediately.
   */
  manualCheckForUpdate() {
    if (this.state.disableUpdatesCheck) {
      logger.warn('Checking for updates should not happen on Store builds');
      return;
    }

    let updater = this.getSquirrelUpdater();
    let updateInformation = getReleaseNotesUrl(this.state.releaseChannel === 'beta');
    if (!updater) return;

    let hasAnUpdate = () => {
      AppActions.setUpdateStatus(UPDATE_STATUS.UPDATE_AVAILABLE);
      let options = {
        title: 'An update is available',
        buttons: ['Close', "What's New", "Update Now"],
        message: 'A new version of Slack is available!'
      };

      dialog.showMessageBox(options, (response) => {
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

      let options = {
        title: "You're all good",
        buttons: ['OK'],
        message: "You've got the latest version of Slack; thanks for staying on the ball."
      };

      dialog.showMessageBox(options);
    };

    let somethingBadHappened = (error) => {
      AppActions.setUpdateStatus(UPDATE_STATUS.ERROR);

      let options = {
        title: "We couldn't check for updates",
        buttons: ['OK'],
        message: "Check your Internet connection, and contact support if this issue persists.",
        detail: error
      };

      dialog.showMessageBox(options);
    };

    updater.checkForUpdates().subscribe(
      (update) => {
        if (update) {
          hasAnUpdate();
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
  getSquirrelUpdater() {
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

  restartToApplyUpdate() {
    let updater = this.getSquirrelUpdater();
    updater.forceUpdateAndRestart(() => EventActions.quitApp());
  }

  update(prevState={}) {
    if (this.state.releaseChannel !== prevState.releaseChannel) {
      this.autoUpdateDisp.setDisposable(this.setupAutomaticUpdates());
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
