/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';

export class NotificationStore {
  private get notifications() {
    return Store.getState().notifications;
  }

  public getNotifications() {
    return this.notifications.notifications;
  }

  public getNewNotificationEvent() {
    return this.notifications.newNotification;
  }
}

const notificationStore = new NotificationStore();
export {
  notificationStore
};
