import _ from 'lodash';
import uuid from 'node-uuid';
import Store from '../lib/store';
import {NOTIFICATIONS} from './';

// NB: Don't log personally-identifying information
const keysToOmit = ['content', 'title', 'onclick', 'onclick_arg'];

class NotificationActions {
  newNotification(notification) {
    notification = _.assign({id: uuid.v4()}, notification);

    Store.dispatch({
      type: NOTIFICATIONS.NEW_NOTIFICATION,
      data: notification,
      omitFromLog: keysToOmit
    });
  }

  removeNotification(notificationId) {
    Store.dispatch({
      type: NOTIFICATIONS.REMOVE_NOTIFICATION,
      data: notificationId
    });
  }

  clickNotification(notificationId, channel, teamId) {
    Store.dispatch({
      type: NOTIFICATIONS.CLICK_NOTIFICATION,
      data: {notificationId, channel, teamId}
    });
  }

  replyToNotification(response, channel, userId, teamId, inReplyToId) {
    Store.dispatch({
      type: NOTIFICATIONS.REPLY_TO_NOTIFICATION,
      data: {response, channel, userId, teamId, inReplyToId},
      omitFromLog: ['response']
    });
  }
}

export default new NotificationActions();
