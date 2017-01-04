import {uniqueId} from '../utils/unique-id';
import {Store} from '../lib/store';
import {NOTIFICATIONS} from './';

// NB: Don't log personally-identifying information
const keysToOmit = ['content', 'title', 'onclick', 'onclick_arg'];

class NotificationActions {
  newNotification(notification) {
    notification = {id: uniqueId(), ...notification};

    Store.dispatch({
      type: NOTIFICATIONS.NEW_NOTIFICATION,
      data: notification,
      omitKeysFromLog: keysToOmit
    });
  }

  removeNotification(notificationId) {
    Store.dispatch({
      type: NOTIFICATIONS.REMOVE_NOTIFICATION,
      data: notificationId
    });
  }

  clickNotification(notificationId, channel, teamId, messageId) {
    Store.dispatch({
      type: NOTIFICATIONS.CLICK_NOTIFICATION,
      data: {
        notificationId,
        channel,
        teamId,
        messageId
      }
    });
  }

  replyToNotification(response, channel, userId, teamId, inReplyToId, threadTimestamp) {
    Store.dispatch({
      type: NOTIFICATIONS.REPLY_TO_NOTIFICATION,
      omitKeysFromLog: ['response'],
      data: {
        response,
        channel,
        userId,
        teamId,
        inReplyToId,
        threadTimestamp
      }
    });
  }
}

export default new NotificationActions();
