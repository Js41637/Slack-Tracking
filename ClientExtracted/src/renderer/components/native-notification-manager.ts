import * as assignIn from 'lodash.assignin';
import * as path from 'path';
import * as url from 'url';
import {Observable} from 'rxjs/Observable';

import {logger} from '../../logger';
import {appTeamsStore} from '../../stores/app-teams-store';
import {notificationActions, Notification} from '../../actions/notification-actions';
import {eventStore, StoreEvent} from '../../stores/event-store';
import {notificationStore} from '../../stores/notification-store';
import {ReduxComponent} from '../../lib/redux-component';
import {settingStore} from '../../stores/setting-store';
import {teamStore} from '../../stores/team-store';
import {NotifyPosition} from '../../notification/notification-window-helpers';
import {NodeRTNotificationHelpers} from './node-rt-notification-helpers';

let NativeNotification: NativeNotificationCtor;

export interface NativeNotificationCtor {
  new(title: string, options: any): any;
}
export interface NativeNotificationManagerState {
  isWindows: boolean;
  isMac: boolean;
  selectedChannelId: string;
  notifyPosition: NotifyPosition;
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
    this.update();

    // We need to do this eventually, but Windows will leave
    // us a bit of time, so let's  do this after initial boot.
    if (this.state.isWindows) setTimeout(() => this.setupWindowsNotifications(), 500);
  }

  public syncState() {
    const state = {
      newNotificationEvent: notificationStore.getNewNotificationEvent() as StoreEvent,
      handleReplyLinkEvent: eventStore.getEvent('handleReplyLink'),
      selectedChannelId: appTeamsStore.getSelectedChannelId(),
      isWindows: settingStore.isWindows(),
      isMac: settingStore.isMac()
    };

    // Notification position is only used on Windows 7 / 8.
    if (state.isWindows && settingStore.getSetting('isBeforeWin10')) {
      assignIn(state, {
        notifyPosition: settingStore.getSetting('notifyPosition')
      });
    }

    return state;
  }

  public update(prevState: Partial<NativeNotificationManagerState> = {}) {
    if (!this.state.isWindows) return;

    if (this.state.selectedChannelId &&
      this.state.selectedChannelId !== prevState.selectedChannelId) {
      logger.info(`Clearing Action Center for channel: ${this.state.selectedChannelId}`);
      NodeRTNotificationHelpers.clearToastNotificationsForChannel(this.state.selectedChannelId);
    }
  }

  /**
   * Each platform implements their own flavor of the HTML5 Notification API.
   * On Windows, this calls out to our own C# library via Edge.js. On Mac, we
   * call out to a native module. On Linux, no custom behavior.
   *
   * @param  {Object} {notification} Contains the webapp notification arguments
   */
  public newNotificationEvent({notification}: {notification: Notification}) {
    if (this.state.isWindows) {
      // NB: We delay-initialize notifications here because if we attempt to
      // load Edge.js and SlackNotifier during startup it hangs Electron.
      NativeNotification = require('../../csx/native-notifications').default;
    } else if (this.state.isMac) {
      NativeNotification = NativeNotification || require('node-mac-notifier');
    } else {
      NativeNotification = NativeNotification || (window as any).Notification;
    }

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
        const {id, channel, msg, thread_ts} = notification;

        if (this.state.isMac) element.close();
        notificationActions.clickNotification(id, channel, teamId!, msg, thread_ts);
      }));

    this.disposables.add(Observable.fromEvent(element, 'reply').take(1)
      .subscribe(({response}) => {
        const {channel, msg, thread_ts} = notification;

        if (this.state.isMac) element.close();
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
    const args = Object.assign({}, theUrl.query);

    let userData: Array<NotificationUserData> = [];

    try {
      userData = JSON.parse(decodeURIComponent(args.userData));
    } catch (e) {
      // We failed to parse the message, which is troublesome.
      logger.warn(`Failed to parse reply from deeplink: ${JSON.stringify(e)}`);
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
  private getNotificationOptionsForPlatform(args: Notification, team: any) {
    const icons = team ? team.icons : args.icons;
    const icon = icons ? (icons.image_512 || icons.image_132 || icons.image_102 || icons.image_68) : undefined;
    const teamId = team ? team.team_id : undefined;

    const options = { teamId, icon, body: args.content, canReply: !!args.channel };

    if (this.state.isWindows) {
      assignIn(options, {
        theme: team ? team.theme : args.theme,
        initials: team ? team.initials : args.initials,
        screenPosition: this.state.notifyPosition,
        channel: args.channel,
        imageUri: args.imageUri,
        interactive: args.interactive,
        launchUri: args.launchUri,
        avatarImage: args.avatarImage,
        msg: args.msg,
        userId: team ? team.id : null
      });
    } else if (this.state.isMac) {
      assignIn(options, {
        icon: undefined,
        subtitle: args.subtitle,
        soundName: args.ssbFilename ? path.basename(args.ssbFilename, '.mp3') : undefined,
        bundleId: 'com.tinyspeck.slackmacgap'
      });
    }

    return options;
  }

  /**
   * Windows notifications are a delicate matter, so this method ensures
   * that native components are registered and active. We need to do this
   * before we're sending notifications, since old notifications (hanging
   * around in the Action Center) could be activated.
   */
  private setupWindowsNotifications(): void {
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
