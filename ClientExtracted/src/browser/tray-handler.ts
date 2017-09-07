/**
 * @module Browser
 */ /** for typedoc */

import { Menu, MenuItem, Tray, app } from 'electron';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs/Observable';

import { appTeamsActions } from '../actions/app-teams-actions';
import { BalloonContent } from '../actions/dialog-actions';
import { eventActions } from '../actions/event-actions';
import { notificationActions } from '../actions/notification-actions';
import { UnreadsInfo } from '../actions/unreads-actions';
import { ReduxComponent } from '../lib/redux-component';
import { logger } from '../logger';
import { TeamsState } from '../reducers/teams-reducer';
import { appStore } from '../stores/app-store';
import { appTeamsStore } from '../stores/app-teams-store';
import { dialogStore } from '../stores/dialog-store';
import { settingStore } from '../stores/setting-store';
import { teamStore } from '../stores/team-store';
import { unreadsStore } from '../stores/unreads-store';
import { resolveImage } from '../utils/resolve-image';
import { IS_WINDOWS_STORE, updateStatusType } from '../utils/shared-constants';
import { getMenuItemForUpdateStatus } from './updater-utils';

import { nativeInterop } from '../native-interop';

import { LOCALE_NAMESPACE, intl as $intl } from '../i18n/intl';

const { isWindows10OrHigher } = nativeInterop;

const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';
const isWindows = process.platform === 'win32';

const darwinTrayImageMapping = {
  'slack-taskbar-highlight.png': 'slack-menubar-highlight.png',
  'slack-taskbar-rest.png': 'slack-menubar-rest-Template.png',
  'slack-taskbar-unread.png': 'slack-menubar-unread-Template.png',
};

type iconStateType = 'rest' | 'hidden' | 'unread' | 'highlight';
export interface TrayHandlerState {
  icon: iconStateType;
  tooltip: string;
  badge: string;
  devEnv: string;
  lastBalloon: BalloonContent | null;
  hasRunApp: boolean;
  teams: TeamsState;
  teamsByIndex: Array<string>;
  updateStatus: updateStatusType;
  releaseChannel: string;
  isDevMode: boolean;
  disableUpdateCheck: boolean;
  locale: string;
}

export class TrayHandler extends ReduxComponent<TrayHandlerState> {
  private readonly dock: Electron.Dock = app.dock;
  private tray: Electron.Tray | null;

  constructor() {
    super();
    this.update();
  }

  public syncState(): TrayHandlerState {
    const unreadsInfo = unreadsStore.getCombinedUnreadsInfo();
    const devEnv = settingStore.getSetting<string>('devEnv');
    const { icon, tooltip, badge } = this.getTrayStateFromUnreadsInfo(unreadsInfo, devEnv);

    return {
      icon, tooltip, badge, devEnv,
      locale: settingStore.getSetting<string>('locale'),
      lastBalloon: dialogStore.getLastBalloon(),
      hasRunApp: settingStore.getSetting<boolean>('hasRunApp'),
      teams: teamStore.teams,
      teamsByIndex: appTeamsStore.getTeamsByIndex(),
      updateStatus: appStore.getUpdateStatus(),
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      isDevMode: settingStore.getSetting<boolean>('isDevMode'),
      disableUpdateCheck: !!(IS_WINDOWS_STORE || process.mas)
    };
  }

  public update(prevState: Partial<TrayHandlerState> = {}): void {
    const { icon, tooltip, badge, lastBalloon, hasRunApp, teamsByIndex,
      updateStatus, releaseChannel } = this.state;

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
      const didTeamsChange = !isEqual(prevState.teamsByIndex, teamsByIndex);
      const didUpdateStatusChange = updateStatus !== prevState.updateStatus;
      if (didTeamsChange || didUpdateStatusChange) this.createTrayMenu();

      if (prevState.locale !== this.state.locale) {
        this.createTrayMenu();
      }
    }

    if (!isLinux && prevState.releaseChannel && releaseChannel !== prevState.releaseChannel) {
      this.showReleaseChannelNotification(
        this.joinedOrLeftReleaseChannelMessage(prevState.releaseChannel),
        releaseChannel
      );
    }

    if (hasRunApp !== prevState.hasRunApp && !hasRunApp && !isMac) {
      this.showBalloon({
        title: $intl.t('Welcome to Slack!', LOCALE_NAMESPACE.BROWSER)(),
        content: $intl.t('This icon will show a blue dot for unread messages, and a red one for notifications. If you’d like Slack to appear here all the time, drag the icon out of the overflow area.', LOCALE_NAMESPACE.BROWSER)() //tslint:disable-line:max-line-length
      });
    }
  }

  public alreadyOnBetaChannelNotification(): void {
    if (isLinux) return;
    const messagesForChannel = {
      alpha: $intl.t('You’re already in the Slack Alpha! Your app will receive updates as they’re available.', LOCALE_NAMESPACE.BROWSER)(),
      beta: $intl.t('You’re already in the Slack Beta! Your app will receive updates as they’re available.', LOCALE_NAMESPACE.BROWSER)(),
      prod: $intl.t('You’re already in the Slack! Your app will receive updates as they’re available.', LOCALE_NAMESPACE.BROWSER)()
    };

    this.showReleaseChannelNotification(messagesForChannel[this.state.releaseChannel], this.state.releaseChannel);
  }

  /**
   * Gives indication to the user that they have changed release channels.
   */
  private showReleaseChannelNotification(content: string, channel: string): void {
    const titleForChannel = {
      alpha: $intl.t('Slack Alpha', LOCALE_NAMESPACE.BROWSER)(),
      beta: $intl.t('Slack Beta', LOCALE_NAMESPACE.BROWSER)(),
      prod: $intl.t('Slack', LOCALE_NAMESPACE.GENERAL)()
    };
    const notificationArgs = { title: titleForChannel[channel], content };

    // NB: If the release channel changes early enough we'll try to notify
    // before the NativeNotificationManager is running in the renderer.
    setTimeout(() => {
      if (isWindows) {
        this.showBalloon(notificationArgs);
      } else {
        notificationActions.newNotification(notificationArgs);
      }
    }, 250);
  }

  private joinedOrLeftReleaseChannelMessage(previousChannel: string): string {
    let message;
    const releaseChannel = this.state.releaseChannel;
    const isPreRelease = releaseChannel === 'alpha' || releaseChannel === 'beta';

    if ((process.mas || IS_WINDOWS_STORE) && isPreRelease) {
      message = releaseChannel === 'alpha' ?
        $intl.t('😔 To join the alpha, please install Slack directly from slack.com/download.', LOCALE_NAMESPACE.RENDERER)() :
        $intl.t('😔 To join the beta, please install Slack directly from slack.com/download.', LOCALE_NAMESPACE.RENDERER)();
    } else {
      if (isPreRelease) {
        message = releaseChannel === 'alpha' ?
          $intl.t('You’ve been added to the alpha! 🎉 Your app will receive alpha updates as they’re available.', LOCALE_NAMESPACE.RENDERER)() :
          $intl.t('You’ve been added to the beta! 🎉 Your app will receive beta updates as they’re available.', LOCALE_NAMESPACE.RENDERER)();
      } else {
        message = previousChannel === 'alpha' ?
          $intl.t('You’ve been removed from the alpha. Back to your regularly scheduled program…', LOCALE_NAMESPACE.RENDERER)() :
          $intl.t('You’ve been removed from the beta. Back to your regularly scheduled program…', LOCALE_NAMESPACE.RENDERER)();
      }
    }

    if (!isMac && !isWindows10OrHigher()) {
      message = message.replace(' 🎉 ', ' ');
    }

    return message;
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
  private getTrayStateFromUnreadsInfo({ unreads, unreadHighlights, showBullet }: UnreadsInfo, devEnv: string) {
    let icon: iconStateType = 'rest';
    let tooltip = $intl.t('No unread messages', LOCALE_NAMESPACE.BROWSER)();
    let badge = '';

    $intl.t('{unreadHighlights,plural,=1{{unreadHighlights} unread mention}other{{unreadHighlights} unread mentions}}', LOCALE_NAMESPACE.BROWSER)({
      unreadHighlights
    });

    if (unreadHighlights > 0) {
      icon = 'highlight';
      tooltip = $intl.t('{unreadHighlights,plural,=1{# unread mention}other{# unread mentions}}', LOCALE_NAMESPACE.BROWSER)({ unreadHighlights });
      badge = String(unreadHighlights);
    } else if (unreads > 0) {
      icon = 'unread';
      tooltip = $intl.t('{unreads,plural,=1{# unread message}other{# unread messages}}', LOCALE_NAMESPACE.BROWSER)({ unreads });
      badge = showBullet ? '•' : '';
    }

    if (devEnv) {
      badge = devEnv;
    }

    return { icon, tooltip, badge };
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
  private setTrayIcon(state: iconStateType, tooltip: string): void {
    if (state === 'hidden') {
      if (this.tray) {
        logger.debug('Tray Handler: Destroying tray.');
        this.tray.destroy();
        this.tray = null;
      }
      return;
    }

    if (!state) return;

    let img: Electron.NativeImage | null = null;
    let pressedImg: Electron.NativeImage | null = null;
    if (isMac) {
      img = resolveImage(darwinTrayImageMapping[`slack-taskbar-${state}.png`]) as Electron.NativeImage;
      pressedImg = resolveImage(`slack-menubar-pressed.png`) as Electron.NativeImage;
    } else {
      img = resolveImage(`slack-taskbar-${state}.png`) as Electron.NativeImage;
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
  private createTrayIcon(image: Electron.NativeImage, pressedImage: Electron.NativeImage | null, tooltip: string): void {
    logger.debug(`Tray Handler: Tray doesn't exist, making it with '${tooltip}'`);

    this.tray = new Tray(image);
    this.tray.setImage(image);
    if (pressedImage) this.tray.setPressedImage(pressedImage);

    if (tooltip) {
      this.tray.setToolTip(tooltip);
    }

    this.createTrayMenu();

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
  private createTrayMenu(): void {
    const menu = new Menu();

    const teamMenuItems: Array<Partial<Electron.MenuItemConstructorOptions>> = this.state.teamsByIndex.map((teamId) => {
      return {
        label: this.state.teams[teamId].team_name,
        click: () => {
          appTeamsActions.selectTeam(teamId);
          eventActions.foregroundApp();
        }
      };
    });

    if (teamMenuItems.length > 0) {
      teamMenuItems.push({ type: 'separator' });
    }

    teamMenuItems.forEach((x) => menu.append(new MenuItem(x)));

    if (!isLinux && !this.state.disableUpdateCheck) {
      const menuArgs = getMenuItemForUpdateStatus(this.state.updateStatus);
      menu.append(new MenuItem(menuArgs));
    }

    menu.append(new MenuItem({
      label: $intl.t('&Preferences', LOCALE_NAMESPACE.MENU)(),
      click: () => eventActions.showWebappDialog('prefs'),
      accelerator: 'CommandOrControl+,'
    }));

    menu.append(new MenuItem({ type: 'separator' }));

    menu.append(new MenuItem({
      label: $intl.t('&Quit', LOCALE_NAMESPACE.MENU)(),
      click: () => eventActions.quitApp(),
      accelerator: 'CommandOrControl+Q'
    }));

    this.tray!.setContextMenu(menu);
  }

  /**
   * Shows a balloon prompt using the given arguments. Make sure to call this
   * after `setTrayIcon`.
   *
   * @param  {String} {title      The title to use for the balloon
   * @param  {String} content     The message content to display
   * @param  {NativeImage} icon}  The icon to display; defaults to the app icon
   */
  private showBalloon({ title, content, icon }: { title: string, content: string, icon?: Electron.NativeImage }): void {
    if (!this.tray) {
      logger.warn(`Tray Handler: Attempted to show a balloon before the tray icon exists.`);
      return;
    }

    logger.info(`Tray Handler: Showing a tray balloon with title: ${title}`);
    this.tray.displayBalloon({
      title,
      content,
      icon: icon || resolveImage('slack.png') as Electron.NativeImage
    });
  }
}
