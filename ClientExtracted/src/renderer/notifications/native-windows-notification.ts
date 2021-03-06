/**
 * @module Notifications
 */ /** for typedoc */

import * as crypto from 'crypto';
import * as fs from 'graceful-fs';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

import { p } from '../../get-path';
import { logger } from '../../logger';
import { nativeInterop } from '../../native-interop';
import { settingStore } from '../../stores/setting-store';
import { IS_WINDOWS_STORE, StringMap } from '../../utils/shared-constants';
import { downloadURL } from '../download-url';

import { NativeNotificationOptions } from './interfaces';
import { NotificationBase } from './native-base-notification';
import { NativeWindowNotification } from './native-window-notification';
import { NodeRTTileNotification } from './node-rt-tile-notification';
import { NodeRTToastNotification } from './node-rt-toast-notification';

const isWindows10OrHigher = nativeInterop.isWindows10OrHigher();

/**
 * Use our own temp folder for storing notification images, to dodge AV.
 * Wipe it clean each time the app runs.
 */
const tempImagesDir = p`${'temp'}/Notification Cache`;
if (fs.existsSync(tempImagesDir)) rimraf.sync(tempImagesDir);
mkdirp.sync(tempImagesDir);

let ToastNotification: typeof NodeRTToastNotification | typeof NativeWindowNotification | undefined;
let TileNotification: typeof NodeRTTileNotification | undefined;

export class NativeWindowsNotification extends NotificationBase {
  /**
   * Creates a notification and dispatches it (per HTML5 Notification).
   *
   * @param  {String} title   The notification title
   * @param  {Object} options Additional arguments to create the notification
   */
  constructor(title: string, options: NativeNotificationOptions) {
    super();

    const toSend = { ...options, title };
    logger.debug('Constructing new Windows NativeNotification', { ...options, body: '[redacted]' });

    this.setupDependencies();

    this.downloadImages(toSend, ['imageUri', 'avatarImage'])
      .then((opts: NativeNotificationOptions) => this.createNotification(opts))
      .catch((e) => this.dispatchError(e));
  }

  /**
   * Closing toasts after creation is unsupported.
   */
  public close(): void {
    // Not implemented
  }

  private setupDependencies() {
    if (this.isUsingToastNotification()) {
      try {
        ToastNotification = ToastNotification || require('./node-rt-toast-notification').NodeRTToastNotification;
      } catch (error) {
        logger.warn(`Tried to require node-rt-toast-notification, but failed`, error);
      }

      if (IS_WINDOWS_STORE) {
        try {
          TileNotification = TileNotification || require('./node-rt-tile-notification').NodeRTTileNotification;
        } catch (error) {
          TileNotification = undefined;
          logger.warn(`Tried to require node-rt-tile-notification, but failed`, error);
        }
      }
    } else {
      ToastNotification = ToastNotification || require('./native-window-notification').NativeWindowNotification;
    }
  }

  /**
   * Creates a notification using the native modules generated by NodeRT.
   *
   * @param  {Object} options Arguments to create the notification
   */
  private async createNotification(options: NativeNotificationOptions) {
    this.createToastNotification(options);
    this.createTileNotification(options);
  }

  private createToastNotification(options: NativeNotificationOptions): void {
    if (!ToastNotification) {
      return logger.warn('Tried to create toast notification, but no notification method setup');
    }

    try {
      const toast = new (ToastNotification as typeof NativeWindowNotification)(options.title || '', options);
      toast.on('click', () => this.emit('click'));
      toast.on('close', () => this.emit('close'));
    } catch (error) {
      logger.warn(`Tried to create toast notification, but failed`, error);
    }
  }

  private createTileNotification(options: NativeNotificationOptions): void {
    if (!TileNotification) return;

    try {
      new TileNotification(options.title || '', options); // tslint:disable-line:no-unused-expression-chai
    } catch (e) {
      logger.warn('NativeNotification: Sending tile notification failed with error.', e);
    }
  }

  /**
   * Download the images specified by the keys and set them as file URLs on the
   * options object.
   *
   * @param  {Object} options Arguments to create the notification
   * @param  {Array} keys     An array of keys that describe the image URls
   * @return {Object}         The modified options object
   */
  private async downloadImages(options: StringMap<any>, keys: Array<string>) {
    // If we're not showing toasts, don't bother downloading the images
    if (!this.isUsingToastNotification()) return options;

    for (const key of keys) {
      if (!options[key]) continue;

      const imageUrl = options[key];

      const fileId = crypto.createHash('md5')
        .update(imageUrl)
        .digest('hex');

      const filePath = p`${tempImagesDir}/${fileId}`;

      if (!fs.existsSync(filePath)) {
        logger.debug('NativeNotification: Downloading image', imageUrl);

        try {
          await downloadURL(imageUrl, filePath);
        } catch (error) {
          this.dispatchError(error);
        }
      }

      options[`${key}Web`] = imageUrl;
      options[key] = `file:///${filePath.replace(/\\/g, '/')}`;
    }

    return options;
  }

  /**
   * Marshals an error to the 'error' event.
   *
   * @param  {Exception} error The exception thrown
   */
  private dispatchError(error: Error): void {
    if (isWindows10OrHigher) {
      // WinRT only returns an errorCode, so that's what we get from NodeRT
      logger.warn('NativeNotification: Error while showing notification: WinRT error.', error);
    } else {
      logger.warn('NativeNotification: Error while showing notification:', error);
    }

    this.removeAllListeners();
  }

  private isUsingToastNotification(): boolean {
    return isWindows10OrHigher &&
      settingStore.getSetting('notificationMethod') !== 'window';
  }
}
