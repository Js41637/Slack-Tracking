import assignIn from 'lodash.assignin';
import path from 'path';
import {requireTaskPool} from 'electron-remote';
import {Observable} from 'rxjs/Observable';

import {logger} from '../../logger';
import AppTeamsStore from '../../stores/app-teams-store';
import NotificationActions from '../../actions/notification-actions';
import NotificationStore from '../../stores/notification-store';
import ReduxComponent from '../../lib/redux-component';
import {settingStore} from '../../stores/setting-store';
import TeamStore from '../../stores/team-store';

const {clearNotificationsForChannel} = requireTaskPool(require.resolve('../../csx/clear-notifications'));

let NativeNotification;

/**
 * This component takes care of all non-HTML notifications, i.e., those
 * not rendered by `NotificationHost`.
 */
export default class NativeNotificationManager extends ReduxComponent {
  constructor() {
    super();
    this.update();
    this.enableNotificationQueue();
  }

  syncState() {
    let state = {
      newNotificationEvent: NotificationStore.getNewNotificationEvent(),
      selectedChannelId: AppTeamsStore.getSelectedChannelId(),
      isWindows: settingStore.isWindows(),
      isWindowsStore: settingStore.getSetting('isWindowsStore'),
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

  update(prevState = {}) {
    if (!this.state.isWindows) return;

    if (this.state.selectedChannelId &&
      this.state.selectedChannelId !== prevState.selectedChannelId) {
      logger.info(`Clearing Action Center for channel: ${this.state.selectedChannelId}`);
      clearNotificationsForChannel(this.state.selectedChannelId);
    }
  }

  /**
   * Each platform implements their own flavor of the HTML5 Notification API.
   * On Windows, this calls out to our own C# library via Edge.js. On Mac, we
   * call out to a native module. On Linux, no custom behavior.
   *
   * @param  {Object} {notification} Contains the webapp notification arguments
   */
  newNotificationEvent({notification}) {
    if (this.state.isWindows) {
      // NB: We delay-initialize notifications here because if we attempt to
      // load Edge.js and SlackNotifier during startup it hangs Electron.
      NativeNotification = require('../../csx/native-notifications').default;
    } else if (this.state.isMac) {
      NativeNotification = NativeNotification || require('node-mac-notifier');
    } else {
      NativeNotification = NativeNotification || window.Notification;
    }

    let team = undefined, userId = undefined, teamId = undefined;
    if (notification.teamId) {
      team = TeamStore.getTeam(notification.teamId);
      if (team) {
        userId = team.id;
        teamId = team.team_id;
      }
    }

    let options = this.getNotificationOptionsForPlatform(notification, team);
    let element = new NativeNotification(notification.title, options);

    this.disposables.add(Observable.fromEvent(element, 'click').take(1)
      .subscribe(() => {
        let {id, channel, msg} = notification;

        if (this.state.isMac) element.close();
        NotificationActions.clickNotification(id, channel, teamId, msg);
      }));

    this.disposables.add(Observable.fromEvent(element, 'reply').take(1)
      .subscribe(({response}) => {
        let {channel, msg, thread_ts} = notification;

        if (this.state.isMac) element.close();
        NotificationActions.replyToNotification(response, channel, userId, teamId, msg, thread_ts);
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
   * Windows and Mac both require some non-standard notification arguments, for
   * things like the team icon, the theme, position on screen, or replies.
   *
   * @param  {Object} args The notification arguments from the webapp
   * @param  {Object} team Contains information about the notifying team
   * @return {Object}      A new object containing all arguments
   */
  getNotificationOptionsForPlatform(args, team) {
    let icons = team ? team.icons : args.icons;
    let icon = icons ? (icons.image_512 || icons.image_132 || icons.image_102 || icons.image_68) : undefined;
    let teamId = team ? team.team_id : undefined;

    let options = { teamId, icon, body: args.content };

    if (this.state.isWindows) {
      assignIn(options, {
        theme: team ? team.theme : args.theme,
        initials: team ? team.initials : args.initials,
        screenPosition: this.state.notifyPosition,
        channel: args.channel,
        imageUri: args.imageUri,
        launchUri: args.launchUri,
        avatarImage: args.avatarImage
      });
    } else if (this.state.isMac) {
      assignIn(options, {
        icon: undefined,
        subtitle: args.subtitle,
        canReply: !!args.channel,
        soundName: args.ssbFilename ? path.basename(args.ssbFilename, '.mp3') : undefined,
        bundleId: 'com.tinyspeck.slackmacgap'
      });
    }

    return options;
  }

  /**
   * Windows Store packages get to have up to five notifications rotating
   * on their tile. If we're such a package, we're enabling that feature
   * here.
   */
  enableNotificationQueue() {
    if (this.state.isWindows && this.state.isWindowsStore) {
      const {TileUpdater} = require('electron-windows-notifications');
      const tileUpdater = new TileUpdater();

      tileUpdater.enableNotificationQueue();
      this.disposables.add(() => tileUpdater.clear());
    }
  }
}
