import _ from 'lodash';
import path from 'path';
import {Observable} from 'rx';
import clearNotificationsForTeam from '../../csx/clear-notifications';
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
      selectedTeamId: AppStore.getSelectedTeamId(),
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
    if (this.state.isWindows &&
      this.state.selectedTeamId &&
      this.state.selectedTeamId !== prevState.selectedTeamId) {
      logger.info(`Clearing notifications for team: ${this.state.selectedTeamId}`);
      clearNotificationsForTeam(this.state.selectedTeamId);
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
        NotificationActions.clickNotification(id, channel, teamId);
      }));

    this.disposables.add(Observable.fromEvent(element, 'reply').take(1)
      .subscribe(({response}) => {
        let {channel, msg} = notification;
        NotificationActions.replyToNotification(response, channel, userId, teamId, msg);
      }));
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
      icon: icons.image_512 || icons.image_132 || icons.image_102 || icons.image_68,
      imageUri: args.imageUri,
      avatarImage: args.avatarImage,
    };

    if (this.state.isWindows) {
      _.extend(options, {
        theme: team ? team.theme : args.theme,
        initials: team ? team.initials : args.initials,
        screenPosition: this.state.notifyPosition,
        launchUri: args.launchUri
      });
    } else if (this.state.isMac) {
      _.extend(options, {
        subtitle: args.subtitle,
        canReply: !!args.channel,
        soundName: path.basename(args.ssbFilename, '.mp3'),
        bundleId: 'com.tinyspeck.slackmacgap'
      });
    }

    return options;
  }
}
