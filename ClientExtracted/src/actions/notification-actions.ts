/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { NativeNotificationOptions } from '../renderer/notifications/interfaces';
import { uniqueId } from '../utils/unique-id';
import { NOTIFICATIONS } from './';

// NB: Don't log personally-identifying information
const keysToOmit = ['content', 'title', 'onclick', 'onclick_arg', 'subtitle'];

export class NotificationActions {
  public newNotification(notification: Partial<NativeNotificationOptions>): void {
    notification = { id: uniqueId(), ...notification };

    Store.dispatch({
      type: NOTIFICATIONS.NEW_NOTIFICATION,
      data: notification,
      omitKeysFromLog: keysToOmit
    });
  }

  public removeNotification(notificationId: string): void {
    Store.dispatch({
      type: NOTIFICATIONS.REMOVE_NOTIFICATION,
      data: notificationId
    });
  }

  public clickNotification(
    notificationId: string,
    channel: string,
    teamId: string,
    messageId: string,
    threadTimestamp?: string): void {
    Store.dispatch({
      type: NOTIFICATIONS.CLICK_NOTIFICATION,
      data: {
        notificationId,
        channel,
        teamId,
        messageId,
        threadTimestamp
      }
    });
  }

  public replyToNotification(
    response: string,
    channel: string,
    userId: string,
    teamId: string,
    messageId: string,
    threadTimestamp?: string): void {
    Store.dispatch({
      type: NOTIFICATIONS.REPLY_TO_NOTIFICATION,
      omitKeysFromLog: ['response'],
      data: {
        response,
        channel,
        userId,
        teamId,
        messageId,
        threadTimestamp
      }
    });
  }
}

const notificationActions = new NotificationActions();

export {
  notificationActions
};
