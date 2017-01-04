import {Store} from '../lib/store';

class NotificationStore {
  getNotifications() {
    return Store.getState().notifications.notifications;
  }

  getNewNotificationEvent() {
    return Store.getState().notifications.newNotification;
  }
}

export default new NotificationStore();
