/**
 * @module Browser
 */ /** for typedoc */

import { BrowserWindow, dialog, shell } from 'electron';
import SerialSubscription from 'rxjs-serial-subscription';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { appActions } from '../actions/app-actions';
import { LOCALE_NAMESPACE, intl as $intl, localeType } from '../i18n/intl';
import { ReduxComponent } from '../lib/redux-component';
import { logger } from '../logger';
import { appStore } from '../stores/app-store';
import { dialogStore } from '../stores/dialog-store';
import { settingStore } from '../stores/setting-store';
import { windowStore } from '../stores/window-store';
import { getReleaseNotesUrl } from '../utils/url-utils';
import { closeAllWindows } from './close-windows';

import { Credentials, IS_STORE_BUILD, ReleaseChannel, UPDATE_STATUS,
  UpdateInformation, UpdaterOption, WindowMetadata, updateStatusType } from '../utils/shared-constants';

/**
 * Check for updates every six hours
 */
export const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;

export interface SquirrelUpdater {
  checkForUpdates: () => Observable<UpdateInformation | null>;
}

export interface SquirrelAutoUpdaterState {
  appVersion: string;
  isDevMode: boolean;
  releaseChannel: ReleaseChannel;
  credentials: Credentials | null;
  updateStatus: updateStatusType;
  mainWindow: WindowMetadata;
  locale: localeType;
}

export class SquirrelAutoUpdater extends ReduxComponent<SquirrelAutoUpdaterState> {
  private readonly autoUpdateSubscription: Subscription = new SerialSubscription();
  private autoUpdater: Electron.AutoUpdater;
  private squirrelUpdater: SquirrelUpdater | null;

  constructor() {
    super();

    this.autoUpdateSubscription.add(this.setupAutomaticUpdates());
    this.disposables.add(this.autoUpdateSubscription);

    if (this.isUpdateSupported()) {
      this.autoUpdater = require('electron').autoUpdater;

      Observable.fromEvent(this.autoUpdater, 'update-available').subscribe(() => {
        appActions.setUpdateStatus(UPDATE_STATUS.DOWNLOADING_UPDATE);
      });
    }
  }

  public syncState(): SquirrelAutoUpdaterState {
    return {
      appVersion: settingStore.getSetting<string>('appVersion'),
      isDevMode: settingStore.getSetting<boolean>('isDevMode'),
      locale: settingStore.getSetting<localeType>('locale'),
      releaseChannel: settingStore.getSetting<ReleaseChannel>('releaseChannel'),
      credentials: dialogStore.getAuthCredentials(),
      updateStatus: appStore.getUpdateStatus(),
      mainWindow: windowStore.getMainWindow()!
    };
  }

  public update(prevState: Partial<SquirrelAutoUpdaterState> = {}): void {
    if (this.state.releaseChannel !== prevState.releaseChannel) {
      this.squirrelUpdater = null;
      this.autoUpdateSubscription.add(this.setupAutomaticUpdates());
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

  /**
   * Starts a timer that will check for updates every 6 hours.
   *
   * @return {Subscription}  A `Subscription` that cancels the timer
   */
  private setupAutomaticUpdates(): Subscription {
    if (!this.isUpdateSupported()) return Subscription.EMPTY;

    return Observable.timer(0, UPDATE_CHECK_INTERVAL)
      .map(() => this.getUpdaterForCurrentPlatform())
      .do(() => appActions.setUpdateStatus(UPDATE_STATUS.CHECKING_FOR_UPDATE))
      .flatMap((updater) => updater.checkForUpdates())
      .subscribe((updateInfo) => {
        if (updateInfo) {
          logger.info(`Squirrel: Got an update!`, updateInfo);
          appActions.updateDownloaded(updateInfo);
        } else {
          appActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);
        }
      },
      (e: Error) => {
        logger.error(`Squirrel: Failed to check for updates: ${e.message}`);
        appActions.setUpdateStatus(UPDATE_STATUS.ERROR);
      });
  }

  /**
   * Checks for available updates using Squirrel and displays a message box
   * based on the result. If an update is available the user is given the
   * option to upgrade immediately.
   */
  private manualCheckForUpdate(): void {
    if (!this.isUpdateSupported()) {
      logger.warn('Squirrel: Updates are not supported on this build.');
      appActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);
      return;
    }

    const { locale } = this.state as SquirrelAutoUpdaterState;

    const updater = this.getUpdaterForCurrentPlatform();
    const releaseNotesUrl = getReleaseNotesUrl(this.state.releaseChannel !== 'prod', locale);
    const browserWindow = BrowserWindow.fromId(this.state.mainWindow.id);

    const hasAnUpdate = (updateInfo: UpdateInformation) => {
      logger.info(`Squirrel: Got an update!`, updateInfo);
      appActions.updateDownloaded(updateInfo);

      const options = {
        title: $intl.t('An update is available', LOCALE_NAMESPACE.MESSAGEBOX)(),
        buttons: [$intl.t('Close', LOCALE_NAMESPACE.GENERAL)(),
          $intl.t('What’s New', LOCALE_NAMESPACE.MESSAGEBOX)(),
          $intl.t('Update Now', LOCALE_NAMESPACE.MESSAGEBOX)()],
        message: $intl.t('A new version of Slack is available!', LOCALE_NAMESPACE.MESSAGEBOX)()
      };

      dialog.showMessageBox(browserWindow, options, (response) => {
        if (response === 0) {
          appActions.setUpdateStatus(UPDATE_STATUS.NONE);
        }

        if (response === 1) {
          appActions.setUpdateStatus(UPDATE_STATUS.NONE);
          shell.openExternal(releaseNotesUrl);
        }

        if (response === 2) {
          this.restartToApplyUpdate();
        }
      });
    };

    const alreadyUpToDate = () => {
      appActions.setUpdateStatus(UPDATE_STATUS.UP_TO_DATE);

      dialog.showMessageBox(browserWindow, {
        title: $intl.t('You’re all good', LOCALE_NAMESPACE.MESSAGEBOX)(),
        buttons: [$intl.t('OK', LOCALE_NAMESPACE.GENERAL)()],
        noLink: true,
        message: $intl.t('You’ve got the latest version of Slack; thanks for staying on the ball.', LOCALE_NAMESPACE.MESSAGEBOX)()
      });
    };

    const somethingBadHappened = (errorMessage: string) => {
      appActions.setUpdateStatus(UPDATE_STATUS.ERROR);

      dialog.showMessageBox(browserWindow, {
        title: $intl.t('We couldn’t check for updates', LOCALE_NAMESPACE.MESSAGEBOX)(),
        buttons: [$intl.t('OK', LOCALE_NAMESPACE.GENERAL)()],
        noLink: true,
        message: $intl.t('Check your Internet connection, and contact support if this issue persists.', LOCALE_NAMESPACE.MESSAGEBOX)(),
        detail: process.platform === 'darwin' ? errorMessage : undefined
      });
    };

    updater.checkForUpdates().subscribe(
      (update: UpdateInformation) => {
        if (update) {
          hasAnUpdate(update);
        } else {
          alreadyUpToDate();
        }
      },
      (e: Error) => {
        logger.error(`Squirrel: Failed to check for updates: ${e.message}\n${e.stack}`);
        somethingBadHappened(e.message);
      });
  }

  /**
   * Returns a platform-specific implementation of `SquirrelUpdater`.
   *
   * @return {SquirrelUpdater}
   */
  private getUpdaterForCurrentPlatform() {
    if (this.squirrelUpdater) return this.squirrelUpdater;

    let SquirrelUpdaterType: {
      new (updaterArgs: UpdaterOption): SquirrelUpdater;
    };

    switch (process.platform) {
    case 'win32':
      SquirrelUpdaterType = require('./windows-updater').WindowsSquirrelUpdater;
      break;
    case 'darwin':
      SquirrelUpdaterType = require('./mac-updater').MacSquirrelUpdater;
      break;
    default:
      throw new Error(`No updater for ${process.platform}!`);
    }

    this.squirrelUpdater = new SquirrelUpdaterType({
      version: this.state.appVersion,
      releaseChannel: this.state.releaseChannel,
      credentials: this.state.credentials
    });

    return this.squirrelUpdater;
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
   * @return {boolean}  true if supported, false otherwise
   */
  private isUpdateSupported(): boolean {
    if (this.state.isDevMode) return false;
    if (IS_STORE_BUILD) return false;
    if (process.platform === 'linux') return false;
    if (process.env.SLACK_NO_AUTO_UPDATES) return false;

    const tmpDir = process.env.TMPDIR || process.env.TEMP || '/tmp';
    if (process.execPath.indexOf(tmpDir) >= 0) {
      logger.warn('Squirrel: Updates are not supported when running from TEMP');
      return false;
    }

    return true;
  }

  /**
   * Make sure we'll exit rather than hide the main window, then do it.
   */
  private restartToApplyUpdate(): void {
    const browserWindow = BrowserWindow.fromId(this.state.mainWindow.id);
    browserWindow.exitApp = true;

    // Close all windows, making the `app.quit()` part of updating easier
    closeAllWindows({ destroyWindows: true });

    this.autoUpdater.quitAndInstall();
  }
}
