import {app, Menu, MenuItem, Tray} from 'electron';
import {requireTaskPool} from 'electron-remote';
import {Observable} from 'rxjs/Observable';

import {appStore} from '../stores/app-store';
import {appTeamsActions} from '../actions/app-teams-actions';
import {appTeamsStore} from '../stores/app-teams-store';
import {dialogStore} from '../stores/dialog-store';
import {eventActions} from '../actions/event-actions';
import {getMenuItemForUpdateStatus} from './updater-utils';
import {isEqualArrays} from '../utils/array-is-equal';
import {logger} from '../logger';
import {notificationActions} from '../actions/notification-actions';
import {ReduxComponent} from '../lib/redux-component';
import {resolveImage} from '../utils/resolve-image';
import {settingStore} from '../stores/setting-store';
import {teamStore} from '../stores/team-store';

const {repairTrayRegistryKey} = requireTaskPool(require.resolve('../csx/tray-repair'));
import {nativeInterop} from '../native-interop';

import {intl as $intl, LOCALE_NAMESPACE} from '../i18n/intl';

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
    const unreadInfo = teamStore.getCombinedUnreadInfo();
    const devEnv = settingStore.getSetting('devEnv');
    const {icon, tooltip, badge} = this.getTrayStateFromUnreadInfo(unreadInfo, devEnv);

    return {
      icon, tooltip, badge, devEnv,
      lastBalloon: dialogStore.getLastBalloon(),
      hasRunApp: settingStore.getSetting('hasRunApp'),
      isMac: settingStore.isMac(),
      isLinux: settingStore.isLinux(),
      isWindows: settingStore.isWindows(),
      teams: teamStore.teams,
      teamsByIndex: appTeamsStore.getTeamsByIndex({visibleTeamsOnly: true}),
      updateStatus: appStore.getUpdateStatus(),
      releaseChannel: settingStore.getSetting('releaseChannel'),
      isDevMode: settingStore.getSetting('isDevMode'),
      disableUpdateCheck: !!(process.windowsStore || process.mas)
    };
  }

  update(prevState={}) {
    const {icon, tooltip, badge, lastBalloon, hasRunApp, isMac, teamsByIndex,
      updateStatus, releaseChannel} = this.state;

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
      const didTeamsChange = !isEqualArrays(prevState.teamsByIndex, teamsByIndex);
      const didUpdateStatusChange = updateStatus !== prevState.updateStatus;
      if (didTeamsChange || didUpdateStatusChange) this.createTrayMenu();
    }

    if (prevState.releaseChannel && releaseChannel !== prevState.releaseChannel) {
      this.showReleaseChannelNotification();
    }

    if (hasRunApp !== prevState.hasRunApp && !hasRunApp && !isMac) {
      this.showBalloon({
        title: $intl.t(`Welcome to Slack!`, LOCALE_NAMESPACE.BROWSER)(),
        content: $intl.t(`This icon will show a blue dot for unread messages, and a red one for notifications. ` +
          `If you'd like Slack to appear here all the time, drag the icon out of the overflow area.`, LOCALE_NAMESPACE.BROWSER)()
      });
    }
  }

  /**
   * Indicates to the user whether or not joining a certain release channel
   * has worked.
   */
  showReleaseChannelNotification() {
    let message;
    const {releaseChannel, isMac} = this.state;

    if ((process.mas || process.windowsStore) && releaseChannel === 'beta') {
      message = $intl.t(`😔 To join the beta, please install Slack directly from slack.com/download.`, LOCALE_NAMESPACE.BROWSER)();
    } else {
      message = releaseChannel === 'beta' ?
        $intl.t(`You’ve been added to the beta! 🎉 Your app will receive beta updates as they’re available.`, LOCALE_NAMESPACE.BROWSER)() :
        $intl.t(`You’ve been removed from the beta. Back to your regularly scheduled program…`, LOCALE_NAMESPACE.BROWSER)();
    }

    if (!isMac && !isWindows10OrHigher()) {
      message = message.replace(' 🎉 ', ' ');
    }

    this.showBetaNotification(message);
  }

  alreadyOnBetaChannelNotification() {
    const message = $intl.t(`You’re already in the beta! Your app will receive updates as they’re available.`, LOCALE_NAMESPACE.BROWSER)();
    this.showBetaNotification(message);
  }

  showBetaNotification(message) {
    if (this.state.isWindows) {
      this.showBalloon({
        title: $intl.t(`Slack for Windows Beta`, LOCALE_NAMESPACE.BROWSER)(),
        content: message
      });
    } else {
      setImmediate(() => notificationActions.newNotification({
        title: $intl.t(`Slack Beta`, LOCALE_NAMESPACE.BROWSER)(),
        content: message
      }));
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
    let tooltip = $intl.t(`No unread messages`, LOCALE_NAMESPACE.BROWSER)();
    let badge = '';

    $intl.t(`{unreadHighlights,plural,=1{{unreadHighlights} unread mention}other{{unreadHighlights} unread mentions}}`, LOCALE_NAMESPACE.BROWSER)({
      unreadHighlights: unreadHighlights
    });

    if (unreadHighlights > 0) {
      icon = 'highlight';
      tooltip = $intl.t(`{unreadHighlights,plural,=1{# unread mention}other{# unread mentions}}`, LOCALE_NAMESPACE.BROWSER)({unreadHighlights});
      badge = String(unreadHighlights);
    } else if (unreads > 0) {
      icon = 'unread';
      tooltip = $intl.t(`{unreads,plural,=1{# unread message}other{# unread messages}}`, LOCALE_NAMESPACE.BROWSER)({unreads});
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
      label: $intl.t(`&Preferences`, LOCALE_NAMESPACE.MENU)(),
      click: () => eventActions.showWebappDialog('prefs'),
      accelerator: 'CommandOrControl+,'
    }));

    menu.append(new MenuItem({type: 'separator'}));

    menu.append(new MenuItem({
      label: $intl.t(`&Quit`, LOCALE_NAMESPACE.MENU)(),
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
