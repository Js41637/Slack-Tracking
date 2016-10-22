import {app, dialog, Menu, MenuItem, Tray} from 'electron';
import _ from 'lodash';
import logger from '../logger';
import {Observable, Disposable} from 'rx';

import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import EventActions from '../actions/event-actions';
import ReduxComponent from '../lib/redux-component';
import resolveImage from '../utils/resolve-image';
import SettingStore from '../stores/setting-store';
import TeamStore from '../stores/team-store';

import {requireTaskPool} from 'electron-remote';
const {repairTrayRegistryKey} = requireTaskPool(require.resolve('../csx/tray-repair'));

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
    let devEnv = SettingStore.getSetting('devEnv');
    let {icon, tooltip, badge} = this.getTrayStateFromUnreadInfo(unreadInfo, devEnv);

    return {
      icon, tooltip, badge, devEnv,
      lastBalloon: AppStore.getLastBalloon(),
      hasRunApp: SettingStore.getSetting('hasRunApp'),
      isMac: SettingStore.isMac(),
      isLinux: SettingStore.isLinux(),
      isWindows: SettingStore.isWindows(),
      teams: TeamStore.getTeams(),
      teamsByIndex: AppStore.getTeamsByIndex(),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      isDevMode: SettingStore.getSetting('isDevMode')
    };
  }

  update(prevState={}) {
    let {icon, tooltip, badge, lastBalloon, hasRunApp, isWindows, releaseChannel} = this.state;

    if (icon !== prevState.icon) {
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

    if (!_.isEqual(prevState.teamsByIndex, this.state.teamsByIndex)) {
      this.createTrayMenu();
    }

    if (prevState.releaseChannel && releaseChannel !== prevState.releaseChannel) {
      let message = releaseChannel === 'beta' ?
        "You have been added to the Beta Release Channel! Contact Slack Support at https://my.slack.com/help if you have any issues." :
        'You have been removed from the Beta Release Channel. Back to your regularly scheduled program…';

      if (isWindows) {
        this.showBalloon({
          title: 'Slack for Windows Beta',
          content: message
        });
      } else if (this.state.isDevMode) {
        dialog.showMessageBox({
          title: 'Slack for Windows Beta',
          buttons: ['Ok'],
          message: message
        });
      }
    }

    if (hasRunApp !== prevState.hasRunApp && !hasRunApp) {
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

    setTimeout(async function() {
      try {
        await repairTrayRegistryKey();
      } catch (e) {
        logger.error(`Failed to repair tray: ${e.message}`);
      }
    }, 2*1000);

    this.disposables.add(Observable.fromEvent(this.tray, 'click')
      .subscribe(() => EventActions.foregroundApp()));

    this.disposables.add(Disposable.create(() => {
      if (!this.tray) return;
      this.tray.destroy();
      this.tray = null;
    }));
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
          AppActions.selectTeam(teamId);
          EventActions.foregroundApp();
        }
      };
    });

    if (teamMenuItems.length > 0) {
      teamMenuItems.push({type: 'separator'});
    }

    teamMenuItems.forEach((x) => menu.append(new MenuItem(x)));

    if (!this.state.isMac) {
      menu.append(new MenuItem({
        label: '&Preferences',
        click: () => EventActions.showPreferences(),
        accelerator: 'CommandOrControl+,'
      }));

      menu.append(new MenuItem({
        label: '&Check for Updates...',
        click: () => EventActions.checkForUpdate()
      }));

      menu.append(new MenuItem({type: 'separator'}));
    }

    menu.append(new MenuItem({
      label: '&Quit',
      click: () => EventActions.quitApp(),
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
