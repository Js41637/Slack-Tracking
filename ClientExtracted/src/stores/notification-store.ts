/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';
import { StoreEvent } from './event-store';
import { Notification } from '../actions/notification-actions';

export class NotificationStore {
  public getNotifications(): Array<Notification> {
    return Store.getState().notifications.notifications;
  }

  public getNewNotificationEvent(): StoreEvent {
    return Store.getState().notifications.newNotification;
  }
}

const notificationStore = new NotificationStore();
export {
  notificationStore
};
