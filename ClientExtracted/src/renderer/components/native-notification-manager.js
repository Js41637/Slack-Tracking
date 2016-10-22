import _ from 'lodash';
import path from 'path';
import {Observable} from 'rx';
import clearNotificationsForChannel from '../../csx/clear-notifications';
import logger from '../../logger';

import AppStore from '../../stores/app-store';
import NotificationActions from '../../actions/notification-actions';
import NotificationStore from '../../stores/notification-store';
import ReduxComponent from '../../lib/redux-component';
import SettingStore from '../../stores/setting-store';
import TeamStore from '../../stores/team-store';

let NativeNotification;

/**
 * This component takes care of all non-HTML notifications, i.e., those
 * not rendered by `NotificationHost`.
 */
export default class NativeNotificationManager extends ReduxComponent {
  constructor() {
    super();
    this.update();
  }

  syncState() {
    let state = {
      newNotificationEvent: NotificationStore.getNewNotificationEvent(),
      selectedChannelId: AppStore.getSelectedChannelId(),
      isWindows: SettingStore.isWindows(),
      isMac: SettingStore.isMac()
    };

    // Notification position is only used on Windows 7 / 8.
    if (state.isWindows && SettingStore.getSetting('isBeforeWin10')) {
      _.extend(state, {
        notifyPosition: SettingStore.getSetting('notifyPosition')
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

    let team = TeamStore.getTeam(notification.teamId);
    let userId = team.id;
    let teamId = team.team_id;

    let options = this.getNotificationOptionsForPlatform(notification, team);
    let element = new NativeNotification(notification.title, options);

    this.disposables.add(Observable.fromEvent(element, 'click').take(1)
      .subscribe(() => {
        let {id, channel} = notification;

        if (this.state.isMac) element.close();
        NotificationActions.clickNotification(id, channel, teamId);
      }));

    this.disposables.add(Observable.fromEvent(element, 'reply').take(1)
      .subscribe(({response}) => {
        let {channel, msg} = notification;

        if (this.state.isMac) element.close();
        NotificationActions.replyToNotification(response, channel, userId, teamId, msg);
      }));

    // When we close the window, we unload all notifications. This should be improved
    // soon, but for now, it ensures that the user doesn't see a 'Electron Helper is
    // no longer running' error when clicking an older notification.
    if (this.state.isMac) {
      this.disposables.add(Observable.fromEvent(window, 'beforeunload')
        .where(() => (element && element.close))
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

    let options = {
      body: args.content,
      teamId: team.team_id,
      icon: icons.image_512 || icons.image_132 || icons.image_102 || icons.image_68
    };

    if (this.state.isWindows) {
      _.extend(options, {
        theme: team ? team.theme : args.theme,
        initials: team ? team.initials : args.initials,
        screenPosition: this.state.notifyPosition,
        channel: args.channel,
        imageUri: args.imageUri,
        launchUri: args.launchUri,
        avatarImage: args.avatarImage
      });
    } else if (this.state.isMac) {
      _.extend(options, {
        icon: undefined,
        subtitle: args.subtitle,
        canReply: !!args.channel,
        soundName: args.ssbFilename ? path.basename(args.ssbFilename, '.mp3') : undefined,
        bundleId: 'com.tinyspeck.slackmacgap'
      });
    }

    return options;
  }
}
