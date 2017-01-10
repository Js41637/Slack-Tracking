import {app, Menu, MenuItem, Tray} from 'electron';
import {Observable} from 'rxjs/Observable';

import {appTeamsActions} from '../actions/app-teams-actions';
import AppStore from '../stores/app-store';
import AppTeamsStore from '../stores/app-teams-store';
import {dialogStore} from '../stores/dialog-store';
import {eventActions} from '../actions/event-actions';
import NotificationActions from '../actions/notification-actions';
import ReduxComponent from '../lib/redux-component';
import {settingStore} from '../stores/setting-store';
import TeamStore from '../stores/team-store';

import {logger} from '../logger';
import {isEqualArrays} from '../utils/array-is-equal';
import {resolveImage} from '../utils/resolve-image';
import {getMenuItemForUpdateStatus} from './updater-utils';

import {requireTaskPool} from 'electron-remote';
const {repairTrayRegistryKey} = requireTaskPool(require.resolve('../csx/tray-repair'));
import {nativeInterop} from '../native-interop';
const {isWindows10OrHigher} = nativeInterop;

const darwinTrayImageMapping = {
  'slack-taskbar-highlight.png': 'slack-menubar-highlight.png',
  'slack-taskbar-rest.png': 'slack-menubar-rest-Template.png',
  'slack-taskbar-unread.png': 'slack-menubar-unread-Template.png',
};

export default class TrayHandler extends ReduxComponent {
  constructor() {
    super();

    this.dock = app.dock;
    this.update();
  }

  syncState() {
    let unreadInfo = TeamStore.getCombinedUnreadInfo();
    let devEnv = settingStore.getSetting('devEnv');
    let {icon, tooltip, badge} = this.getTrayStateFromUnreadInfo(unreadInfo, devEnv);

    return {
      icon, tooltip, badge, devEnv,
      lastBalloon: dialogStore.getLastBalloon(),
      hasRunApp: settingStore.getSetting('hasRunApp'),
      isMac: settingStore.isMac(),
      isLinux: settingStore.isLinux(),
      isWindows: settingStore.isWindows(),
      teams: TeamStore.getTeams(),
      teamsByIndex: AppTeamsStore.getTeamsByIndex({visibleTeamsOnly: true}),
      updateStatus: AppStore.getUpdateStatus(),
      releaseChannel: settingStore.getSetting('releaseChannel'),
      isDevMode: settingStore.getSetting('isDevMode'),
      disableUpdateCheck: !!(process.windowsStore || process.mas)
    };
  }

  update(prevState={}) {
    let {icon, tooltip, badge, lastBalloon, hasRunApp, isMac, isWindows,
      teamsByIndex, updateStatus, releaseChannel} = this.state;

    if (!isMac && icon !== prevState.icon) {
      this.setTrayIcon(icon, tooltip);
    }

    if (tooltip !== prevState.tooltip && this.tray) {
      this.tray.setToolTip(tooltip);
    }

    if (badge !== prevState.badge && this.dock) {
      this.dock.setBadge(badge);
    }

    if (lastBalloon && lastBalloon !== prevState.lastBalloon) {
      this.showBalloon(lastBalloon);
    }

    if (this.tray) {
      let didTeamsChange = !isEqualArrays(prevState.teamsByIndex, teamsByIndex);
      let didUpdateStatusChange = updateStatus !== prevState.updateStatus;
      if (didTeamsChange || didUpdateStatusChange) this.createTrayMenu();
    }

    if (prevState.releaseChannel && releaseChannel !== prevState.releaseChannel) {
      let message = releaseChannel === 'beta' ?
        "You’ve been added to the beta! 🎉 Your app will receive beta updates as they’re available." :
        "You’ve been removed from the beta. Back to your regularly scheduled program…";

      if (isWindows) {
        if (!isWindows10OrHigher()) {
          message = message.replace(' 🎉 ', ' ');
        }

        this.showBalloon({
          title: 'Slack for Windows Beta',
          content: message
        });
      } else {
        setImmediate(() => NotificationActions.newNotification({
          title: 'Slack Beta',
          content: message
        }));
      }
    }

    if (hasRunApp !== prevState.hasRunApp && !hasRunApp && !isMac) {
      this.showBalloon({
        title: 'Welcome to Slack!',
        content: "This icon will show a blue dot for unread messages, and a red one for notifications. If you'd like Slack to appear here all the time, drag the icon out of the overflow area."
      });
    }
  }

  /**
   * Sets the tray icon, its tooltip, and the dock badge based on the unread
   * messages and mentions for all teams.
   *
   * @param  {Number} {unreads          Count of unread messages
   * @param  {Number} unreadHighlights  Count of messages that mention you or DMs
   * @param  {Boolean} showBullet}      True to show a bullet for any unread activity
   * @param  {String} devEnv            The developer environment, if any
   *
   * @return {Object}
   * @return {Object}.icon              Indicates the state of the tray icon
   * @return {Object}.tooltip           The tooltip to show for the tray icon
   * @return {Object}.badge             The badge to display over the dock icon
   */
  getTrayStateFromUnreadInfo({unreads, unreadHighlights, showBullet}, devEnv) {
    let icon = 'rest';
    let tooltip = 'No unread messages';
    let badge = '';

    if (unreadHighlights > 0) {
      icon = 'highlight';
      tooltip = `${unreadHighlights} unread mention${unreadHighlights > 1 ? 's' : ''}`;
      badge = String(unreadHighlights);
    } else if (unreads > 0) {
      icon = 'unread';
      tooltip = `${unreads} unread message${unreads > 1 ? 's' : ''}`;
      badge = showBullet ? '•' : '';
    }

    if (devEnv) {
      badge = devEnv;
    }

    return {icon, tooltip, badge};
  }

  /**
   * Sets the state of the tray icon.
   *
   * @param  {String} state   Represents the state, one of:
   *                          'rest' - Tray icon is the normal Slack logo
   *                          'hidden' - Tray icon is removed from the tray completely
   *                          'unread' - Tray icon shows blue dot for unread messages
   *                          'highlight'  - Tray icon shows red dot for highlight messages
   * @param  {String} tooltip The tooltip to display for the tray icon
   */
  setTrayIcon(state, tooltip) {
    if (state === 'hidden') {
      if (this.tray) {
        logger.debug('Destroying tray');
        this.tray.destroy();
        this.tray = null;
      }
      return;
    }

    if (!state) return;

    let img = null;
    let pressedImg = null;
    if (this.state.isMac) {
      img = resolveImage(darwinTrayImageMapping[`slack-taskbar-${state}.png`]);
      pressedImg = resolveImage(`slack-menubar-pressed.png`);
    } else {
      img = resolveImage(`slack-taskbar-${state}.png`);
      pressedImg = null;
    }

    if (this.tray) {
      this.tray.setImage(img);
      if (pressedImg) this.tray.setPressedImage(pressedImg);
    } else {
      this.createTrayIcon(img, pressedImg, tooltip);
    }
  }

  /**
   * Creates the tray icon; should not be called on Mac
   *
   * @param  {NativeImage}  image         The image to use for the icon
   * @param  {NativeImage}  pressedImage  The image to use for the icon when pressed
   * @param  {String}       tooltip       The tooltip to display for the tray icon
   */
  createTrayIcon(image, pressedImage, tooltip) {
    logger.debug(`Tray doesn't exist, making it with '${tooltip}'`);

    this.tray = new Tray(image);
    this.tray.setImage(image);
    if (pressedImage) this.tray.setPressedImage(pressedImage);

    if (tooltip) {
      this.tray.setToolTip(tooltip);
    }

    this.createTrayMenu();

    setTimeout(async () => {
      try {
        await repairTrayRegistryKey();
      } catch (e) {
        logger.error(`Failed to repair tray: ${e.message}`);
      }
    }, 2*1000);

    this.disposables.add(Observable.fromEvent(this.tray, 'click')
      .subscribe(() => eventActions.foregroundApp()));

    this.disposables.add(() => {
      if (!this.tray) return;
      this.tray.destroy();
      this.tray = null;
    });
  }

  /**
   * Sets up the context menu for the tray icon.
   */
  createTrayMenu() {
    let menu = new Menu();

    let teamMenuItems = this.state.teamsByIndex.map((teamId) => {
      return {
        label: this.state.teams[teamId].team_name,
        click: () => {
          appTeamsActions.selectTeam(teamId);
          eventActions.foregroundApp();
        }
      };
    });

    if (teamMenuItems.length > 0) {
      teamMenuItems.push({type: 'separator'});
    }

    teamMenuItems.forEach((x) => menu.append(new MenuItem(x)));

    if (!this.state.isLinux && !this.state.disableUpdateCheck) {
      let menuArgs = getMenuItemForUpdateStatus(this.state.updateStatus);
      menu.append(new MenuItem(menuArgs));
    }

    menu.append(new MenuItem({
      label: '&Preferences',
      click: () => eventActions.showWebappDialog('prefs'),
      accelerator: 'CommandOrControl+,'
    }));

    menu.append(new MenuItem({type: 'separator'}));

    menu.append(new MenuItem({
      label: '&Quit',
      click: () => eventActions.quitApp(),
      accelerator: 'CommandOrControl+Q'
    }));

    this.tray.setContextMenu(menu);
  }

  /**
   * Shows a balloon prompt using the given arguments. Make sure to call this
   * after `setTrayIcon`.
   *
   * @param  {String} {title      The title to use for the balloon
   * @param  {String} content     The message content to display
   * @param  {NativeImage} icon}  The icon to display; defaults to the app icon
   */
  showBalloon({title, content, icon}) {
    if (!this.tray) {
      logger.warn(`Attempted to show a balloon before the tray icon exists.`);
      return;
    }

    logger.info(`Showing a tray balloon with title: ${title}`);
    this.tray.displayBalloon({
      title: title,
      content: content,
      icon: icon || resolveImage('slack.png')
    });
  }
}
