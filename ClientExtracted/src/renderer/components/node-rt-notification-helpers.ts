import * as fs from 'fs';
import * as path from 'path';
import {spawnPromise} from 'spawn-rx';
import {requireTaskPool} from 'electron-remote';

import {logger} from '../../logger';
import {nativeInterop} from '../../native-interop';
import {getAppId} from '../../utils/app-id';

const isWindows10 = (process.platform === 'win32' && nativeInterop.isWindows10OrHigher(true));
const appId = getAppId();

/**
 * Helper class supporting activation of various code paths for
 * NodeRT notifications. Please see ./node-rt-toast-notification
 * for a detailed documentation.
 *
 * @export
 * @class NodeRTNotificationHelpers
 */
export class NodeRTNotificationHelpers {
  /**
   * `true` if registered, `false`, if not, `failed` if errored
   * We need to initialize the activator only once - and not at all
   * if we're running in the Windows Store.
   */
  public static activatorRegistered: boolean|string = false;

  /**
   * Safely tries to remove toast notifications for a given channel.
   *
   * @param {string} group
   * @returns {Promise<boolean|undefined>} success
   */
  public static clearToastNotificationsForChannel(group: string) {
    if (!isWindows10 || !group || group.length === 0 ) {
      return Promise.resolve();
    } else {
      return this.clearToastNotifications(group);
    }
  }

  /**
   * Safely tries to remove tile notifications.
   *
   * @returns {boolean|undefined} success
   */
  public static clearTileNotifications() {
    const prefix = 'Windows Notifications History: ';

    return new Promise((resolve) => {
      if (!isWindows10) return resolve();

      try {
        const windowsNotifications = requireTaskPool(require.resolve('electron-windows-notifications'));

        if (windowsNotifications) {
          logger.info(`${prefix}Successfully initialized electron-windows-notifications on rendererTaskPool.`);

          const {TileUpdater} = windowsNotifications;
          const tileUpdater = new TileUpdater();
          tileUpdater.clear();
          resolve();
        } else {
          logger.warn(`${prefix}Tried to clear tiles, but couldn't initialize electron-windows-notifications (no error)`);
          resolve(false);
        }
      } catch (error) {
        logger.warn(`${prefix}Tried to clear tiles, but encountered error:`, error);
        resolve(false);
      }
    });
  }

  /**
   * Safely tries to remove toast notifications for a given channel (or all notifications).
   *
   * @param {string} [group] - Group ID (optional)
   * @returns {boolean|null} success
   */
  public static clearToastNotifications(group?: string) {
    const prefix = 'Windows Notifications History: ';

    return new Promise((resolve) => {
      if (!isWindows10) return resolve();

      try {
        const windowsNotifications = requireTaskPool(require.resolve('electron-windows-notifications'));

        if (windowsNotifications) {
          logger.info(`${prefix}Successfully initialized electron-windows-notifications on rendererTaskPool.`);

          const {history} = windowsNotifications;
          let result: boolean|undefined;

          if (group && group.length > 0) {
            logger.info(`${prefix}Trying to clear notifications for channel ${group}.`);
            result = history.removeGroup({group, appId});
            logger.info(`${prefix}Tried to clear notifications for channel ${group}. Result: ${result}`);
          } else {
            // electron-windows-notifications will automatically drop the appId
            // for the right value if we're running in the Windows Store
            logger.info(`${prefix}Trying to clear notifications for app.`);
            result = history.clear(getAppId());
            logger.info(`${prefix}Tried to clear notifications for app. Result: ${result}`);
          }

          resolve(result);
        } else {
          logger.error(`${prefix}Tried to clear toasts, but couldn't initialize electron-windows-notifications (no error)`);
          resolve(false);
        }
      } catch (error) {
        logger.error(`${prefix}Tried to clear toasts, but encountered error:`, error);
        resolve(false);
      }
    });
  }

  /**
   * Registers a notifications activator with Windows - if we're running inside the Windows Store,
   * we'll go with a background task, if we're not, we'll go with a good old COM component.
   *
   * @returns {Promise<void>}
   */
  public static async registerActivator() {
    if (!isWindows10) return;

    if (!this.activatorRegistered && process.windowsStore) {
      logger.info('Windows Store Notifications: Background Task not already registered, attempting now.');

      try {
        const result = await this.registerBackgroundTask();
        logger.info('Windows Store Background Task registration result:', result);
      } catch (e) {
        // A failure here is no reason to take things down, but we should obviously log what's wrong
        logger.warn('Windows Store Background Task registration failed', e);
      }
    } else if (!this.activatorRegistered) {
      logger.info('Windows COM Notifications Component not already registered, attempting now.');
      this.registerCOMComponent();
    }
  }

  /**
   * Windows Store packages get to have up to five notifications rotating
   * on their tile. If we're such a package, we're enabling that feature
   * here.
   */
  public static enableNotificationQueue(): void {
    const prefix = 'Windows Store Tile Notifications Queue: ';

    if (!process.windowsStore) return;

    try {
      const windowsNotifications = require('electron-windows-notifications');

      if (windowsNotifications) {
        logger.info(`${prefix}Successfully initialized electron-windows-notifications .`);

        const {TileUpdater} = windowsNotifications;
        const tileUpdater = new TileUpdater();

        tileUpdater.enableNotificationQueue();
        logger.info(`${prefix}enabled.`);
      } else {
        logger.error(`${prefix}Tried to enable notification queue, but failed (no error).`);
      }
    } catch (error) {
      logger.error(`${prefix}Tried to enable notification queue, but failed.`, error);
    }
  }

  /**
   * Registers the background task with Windows, using BackgroundTaskRegisterer.exe
   *
   * @returns {Promise<string>}
   */
  private static registerBackgroundTask(): Promise<string> {
    return new Promise((resolve, reject) => {
      const prefix = 'Windows Store Background Task Registration: ';

      if (!process.windowsStore) {
        logger.warn(`${prefix}Tried to register background task, but is not Windows Store app!`);
        return reject('Cannot register background task in non-Windows Store context!');
      }

      const registerer = path.join(process.resourcesPath, '..', '..', 'BackgroundTaskRegisterer.exe');

      try {
        // Spawn BackgroundTaskRegisterer.exe, which hooks up the background task
        logger.info(`${prefix}Now attempting to spawn BackgroundTaskRegisterer.exe.`);
        if (fs.statSyncNoException(registerer)) {
          spawnPromise(registerer)
            .then((result: any) => {
              logger.info(`${prefix}BackgroundTaskRegisterer.exe returned`, result);
              resolve(`BackgroundTaskRegisterer: ${JSON.stringify(result)}`);
              this.activatorRegistered = true;
            })
            .catch((e: Error) => reject(e));
        } else {
          logger.warn(`${prefix}BackgroundTaskRegisterer.exe not found.`);
          reject('Could not find BackgroundTaskRegisterer.exe!');
        }
      } catch (e) {
        logger.error(`${prefix}Failed to register notification background task:`, e);
        reject(`Failed to register notification background task: ${JSON.stringify(e)}`);
      }
    });
  }

  /**
   * Registers the COM component with Windows, using 'electron-windows-interactive-notifications'
   */
  private static registerCOMComponent() {
    const prefix = 'Windows COM Notifications: ';

    if (!isWindows10) return;

    try {
      const winActivator = require('electron-windows-interactive-notifications');

      if (winActivator) {
        logger.info(`${prefix}Successfully initialized electron-windows-interactive-notifications.`);

        logger.info(`${prefix}Now registering COM server.`);
        winActivator.registerComServer();

        logger.info(`${prefix}Now registering activator.`);
        winActivator.registerActivator();

        this.activatorRegistered = true;
        logger.info(`${prefix}Successfully registered COM Server and activator.`);
      } else {
        logger.error(`${prefix}Tried to require electron-windows-interactive-notifications, but failed (no error).`);
      }
    } catch (error) {
      logger.error(`${prefix}Tried to register COM Component activators, but failed:`, error);
      this.activatorRegistered = 'failed';
    }
  }
}
