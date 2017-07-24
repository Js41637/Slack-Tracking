/**
 * @module Notifications
 */ /** for typedoc */

import * as NodeMacNotifier from 'node-mac-notifier';
import { NativeNotificationOptions } from './interfaces';
import { NotificationBase } from './native-base-notification';

/**
 * Native macOS notifications, using `node-mac-notifier`.
 *
 * @class NativeNotification
 * @extends {NotificationBase}
 */
export class NativeMacNotification extends NotificationBase {
  public readonly toast: any;

  /**
   * Creates a notification and dispatches it (per HTML5 Notification).
   *
   * @param  {String} title   The notification title
   * @param  {Object} options Additional arguments to create the notification
   */
  constructor(title: string, options: NativeNotificationOptions) {
    super();

    this.toast = this.createNotification(title, options);
  }

  public close(): void {
    if (this.toast) this.toast.close();
  }

  /**
   * Creates a notification using the native node-mac-notifier
   *
   * @param  {Object} options Arguments to create the notification
   */
  private createNotification(title: string, options: NativeNotificationOptions) {
    const toast = new NodeMacNotifier(title, options);

    toast.addEventListener('close', () => this.emit('close'));
    toast.addEventListener('click', () => {
      this.close();
      this.emit('click');
    });
    toast.addEventListener('reply', (...args: Array<any>) => {
      this.close();
      this.emit('reply', ...args);
    });

    return toast;
  }
}
