/**
 * @module Notifications
 */ /** for typedoc */

import { NativeNotificationOptions } from './interfaces';
import { NotificationBase } from './native-base-notification';

/**
 * Uses window.Notification, which is implemented directly in Electron.
 * On Windows 7, it uses custom HWND notifications.
 * On Windows 8-10, it uses lightweight WinRT notifications.
 * On macOS, it uses leightweight macOS notifications.
 *
 * @class NativeWindowNotification
 * @extends {NotificationBase}
 */
export class NativeWindowNotification extends NotificationBase {
  public readonly toast: any;

  /**
   * Creates a notification and dispatches it (per HTML5 Notification).
   *
   * @param  {String} title   The notification title
   * @param  {Object} options Additional arguments to create the notification
   */
  constructor(title: string, options: NativeNotificationOptions) {
    super();

    this.toast = new window.Notification(title, options);
    this.toast.onclick = (event: MouseEvent) => this.emit('click', event);
    this.toast.onclose = (event: CloseEvent) => this.emit('close', event);
    this.toast.onerror = (error: Error) => this.emit('error', error);
  }

  public close() {
    if (this.toast) this.toast.close();
  }
}
