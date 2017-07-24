/**
 * @module Notifications
 */ /** for typedoc */

import { assignIn } from 'lodash';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import * as url from 'url';

import { TeamBase } from 'src/actions/team-actions';
import { notificationActions } from '../../actions/notification-actions';
import { ReduxComponent } from '../../lib/redux-component';
import { logger } from '../../logger';
import { NotificationEvent } from '../../reducers/notifications-reducer';
import { StoreEvent, eventStore } from '../../stores/event-store';
import { notificationStore } from '../../stores/notification-store';
import { settingStore } from '../../stores/setting-store';
import { teamStore } from '../../stores/team-store';
import { NativeNotificationOptions, WebappNotificationOptions } from '../notifications/interfaces';
import { NodeRTNotificationHelpers } from '../notifications/node-rt-notification-helpers';

let NativeNotification: NativeNotificationCtor;

export interface NativeNotificationCtor {
  new(title: string, options: any): any;
}

export interface NativeNotificationManagerState {
  isMac: boolean;
  isWindows: boolean;
  newNotificationEvent: NotificationEvent;
  handleReplyLinkEvent: StoreEvent;
}

export interface NotificationUserData {
  key: string;
  value: string;
}

/**
 * This component takes care of all non-HTML notifications, i.e., those
 * not rendered by `NotificationHost`.
 */
export class NativeNotificationManager extends ReduxComponent<NativeNotificationManagerState> {
  constructor() {
    super();
    this.setup();
  }

  public syncState(): NativeNotificationManagerState {
    const state = {
      isMac: settingStore.isMac(),
      isWindows: settingStore.isWindows(),
      newNotificationEvent: notificationStore.getNewNotificationEvent(),
      handleReplyLinkEvent: eventStore.getEvent('handleReplyLink'),
    };

    return state;
  }

  /**
   * Let's setup our notifications
   */
  public setup() {
    if (this.state.isWindows) {
      NativeNotification = NativeNotification || require('../notifications/native-windows-notification').NativeWindowsNotification;
    } else if (this.state.isMac) {
      NativeNotification = NativeNotification || require('../notifications/native-mac-notification').NativeMacNotification;
    } else {
      NativeNotification = NativeNotification || require('../notifications/native-window-notification').NativeWindowNotification;
    }

    /**
     * Windows notifications are a delicate matter, so this method ensures
     * that native components are registered and active. We need to do this
     * before we're sending notifications, since old notifications (hanging
     * around in the Action Center) could be activated.
     */
    if (this.state.isWindows) {
      logger.info(`Setting up Windows notifications (activator & notification queue)`);

      // Activating the activator on launch is necessary to support sending replies
      // written while Slack was closed. However, its behavior is still a bit wonky,
      // so we're hiding it behind a global environment variable that can be enabled
      // by brave test pilots.
      if (process.env.SLACK_INTERACTIVE_REPLIES_ON_LAUNCH) {
        NodeRTNotificationHelpers.registerActivator();
      }

      NodeRTNotificationHelpers.enableNotificationQueue();
    }
  }

  /**
   * Each platform implements their own flavor of the HTML5 Notification API.
   * On Windows, this calls out to our own C# library via Edge.js. On Mac, we
   * call out to a native module. On Linux, no custom behavior.
   *
   * @param  {Object} {notification} Contains the webapp notification arguments
   */
  public newNotificationEvent({ notification }: { notification: WebappNotificationOptions }) {
    const { id, channel, msg, thread_ts } = notification;

    let team, userId: string | undefined, teamId: string | undefined;
    if (notification.teamId) {
      team = teamStore.getTeam(notification.teamId);
      if (team) {
        userId = team.id;
        teamId = team.team_id;
      }
    }

    const options = this.getNotificationOptionsForPlatform(notification, team);
    const element = new NativeNotification(notification.title, options);

    this.disposables.add(Observable.fromEvent(element, 'click').take(1)
      .subscribe(() => {
        notificationActions.clickNotification(id, channel, teamId!, msg, thread_ts);
      }));

    this.disposables.add(Observable.fromEvent(element, 'reply').take(1)
      .subscribe(({ response }) => {
        notificationActions.replyToNotification(response, channel, userId!, teamId!, msg, thread_ts);
      }));

    // When we close the window, we unload all notifications. This should be improved
    // soon, but for now, it ensures that the user doesn't see a 'Electron Helper is
    // no longer running' error when clicking an older notification.
    if (this.state.isMac) {
      this.disposables.add(Observable.fromEvent(window, 'beforeunload')
        .subscribe(() => element.close()));
    }
  }

  /**
   * Checks if a slack:// protocol url contains a reply, and if so,
   * parses it and kicks off a reply action. We expect the url to be in the
   * following format:
   *
   * slack://reply/?channel=D221YR34P&userId=U211G89NY&teamId=TW2104UHEX
   * &msg=122342344.333&userData=[{"key":"message","value":"Hello"}]
   *
   * @param {Object} event
   * @property {string} url
   * @property {number} timestamp
   */
  public handleReplyLinkEvent(event: {url: string, timestamp: number} = {} as any): void {
    const theUrl = url.parse(event.url, true);
    const args = { ...theUrl.query };

    let userData: Array<NotificationUserData> = [];

    try {
      userData = JSON.parse(decodeURIComponent(args.userData));
    } catch (error) {
      // We failed to parse the message, which is troublesome.
      logger.warn(`Native Notification Manager: Failed to parse reply from deeplink.`, error);
    }

    if (userData.length > 0 && userData[0].value && /\S/.test(userData[0].value)) {
      notificationActions.replyToNotification(userData[0].value,
        args.channel, args.userId, args.teamId, args.msg, args.threadTs);
    }
  }

  /**
   * Windows and Mac both require some non-standard notification arguments, for
   * things like the team icon, the theme, position on screen, or replies.
   *
   * @param  {Object} args The notification arguments from the webapp
   * @param  {Object} team Contains information about the notifying team
   * @return {Object}      A new object containing all arguments
   */
  private getNotificationOptionsForPlatform(args: WebappNotificationOptions, team?: TeamBase | null): Partial<NativeNotificationOptions> {
    const icons = team ? team.icons : null;
    const icon = icons ? (icons.image_512 || icons.image_132 || icons.image_102 || icons.image_68) : undefined;
    const teamId = team ? team.team_id : undefined;
    const soundName = args.ssbFilename ? path.basename(args.ssbFilename, '.mp3') : undefined;
    const canReply = !!args.channel;
    const body = args.content;
    const { channel, id } = args;

    const options = { id, channel, teamId, icon, body, soundName, canReply };

    if (this.state.isWindows) {
     assignIn(options, {
        avatarImage: args.avatarImage,
        channel: args.channel,
        imageUri: args.imageUri,
        initials: team ? team.initials : '',
        interactive: args.interactive,
        launchUri: args.launchUri,
        msg: args.msg,
        theme: team ? team.theme : '',
        thread_ts: args.thread_ts,
        userId: team ? team.id : null
      });
    } else if (this.state.isMac) {
     assignIn(options, {
        icon: undefined,
        subtitle: args.subtitle,
        bundleId: 'com.tinyspeck.slackmacgap'
      });
    }

    return options;
  }
}
