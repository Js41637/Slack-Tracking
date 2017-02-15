import {Store} from '../lib/store';
import {StoreEvent} from './event-store';

export class NotificationStore {
  public getNotifications(): any {
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
