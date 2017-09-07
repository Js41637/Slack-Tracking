/**
 * @module Notifications
 */ /** for typedoc */

import { remote, webFrame } from 'electron';
import { union } from 'lodash';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

import { Component } from '../../../lib/component';
import { notificationStore } from '../../../stores/notification-store';
import { settingStore } from '../../../stores/setting-store';
import { windowStore } from '../../../stores/window-store';
import { WindowMetadata } from '../../../utils/shared-constants';
import { NotifyPosition, WebappNotificationOptions } from '../interfaces';
import { NotificationItem } from './notification-item';
import { NotificationWindowHelpers } from './notification-window-helpers';

const { BrowserWindow } = remote;
const { showPositionedNotificationWindow } = NotificationWindowHelpers;

import * as React from 'react'; // tslint:disable-line

export interface NotificationHostProps {
  idleTimeoutMs: number;
  notificationSize: {
    width: number;
    height: number;
  };
  maxItems: number;
}

export interface NotificationHostState {
  notifications: Array<WebappNotificationOptions>;
  notificationsWindow: WindowMetadata | null;
  mainWindow: WindowMetadata | null;
  zoomLevel: number;
  notifyPosition: NotifyPosition;
  displayedNotifs: Array<WebappNotificationOptions>;
}

export class NotificationHost extends Component<Partial<NotificationHostProps>, Partial<NotificationHostState>> {
  public static defaultProps: NotificationHostProps = {
    idleTimeoutMs: 400,
    notificationSize: { width: 375, height: 88 },
    maxItems: 3
  };

  private hostElement: HTMLElement;
  private readonly refHandlers = {
    host: (ref: HTMLElement) => this.hostElement = ref
  };

  private readonly windowState: Subject<{ shouldShow: boolean, shouldHide: boolean }> = new Subject();
  private readonly notificationStateObservable: Subject<Partial<NotificationHostState>> = new Subject();
  private readonly componentUnmountedObservable: Subject<boolean> = new Subject();

  constructor(props: Partial<NotificationHostProps>) {
    super(props);

    //TODO: manipulate state is not recommended, should update logic
    (this.state as any).displayedNotifs = this.state.notifications!.splice(0, this.props.maxItems);

    this.disposables.add(
      this.windowState.filter(({ shouldHide }) => shouldHide)
        .flatMap(() => Observable.timer(this.props.idleTimeoutMs))
        .map(() => this.getNotificationsWindow())
        .filter((browserWindow: Electron.BrowserWindow) => !!browserWindow)
        .subscribe((browserWindow: Electron.BrowserWindow) => browserWindow.hide())
    );

    this.disposables.add(
      this.windowState.filter(({ shouldShow }) => shouldShow)
        .map(() => this.getNotificationsWindow())
        .filter((browserWindow: Electron.BrowserWindow) => !!browserWindow)
        .subscribe((browserWindow: Electron.BrowserWindow) => {
          const mainWindowId = this.state.mainWindow!.id;
          const mainWindow = BrowserWindow.fromId(mainWindowId);

          showPositionedNotificationWindow(browserWindow, mainWindow,
            this.state.zoomLevel!, this.state.notifyPosition!);
        })
    );

    this.notificationStateObservable
      .takeUntil(this.componentUnmountedObservable)
      .observeOn(animationFrame)
      .subscribe((state: Partial<NotificationHostState>) => this.setState(state));
  }

  public syncState(): Partial<NotificationHostState> {
    return {
      notifications: notificationStore.getNotifications(),
      notificationsWindow: windowStore.getNotificationsWindow(),
      mainWindow: windowStore.getMainWindow(),
      zoomLevel: settingStore.getSetting<number>('zoomLevel'),
      notifyPosition: settingStore.getSetting<NotifyPosition>('notifyPosition')
    };
  }

  public componentDidMount(): void {
    this.setZoomLevelAndLimits();
  }
  public componentWillUnmount(): void {
    super.componentWillUnmount();
    this.componentUnmountedObservable.next(true);
  }

  public componentDidUpdate(_prevProps: Partial<NotificationHostProps>, prevState: Partial<NotificationHostState>): void {
    if (prevState.zoomLevel !== this.state.zoomLevel) {
      this.setZoomLevelAndLimits();
    }

    const maxItems = this.props.maxItems;
    const prevNotifs = prevState.notifications!;
    const notifs = this.state.notifications!;

    this.windowState.next({
      shouldShow: prevNotifs.length === 0 && notifs.length > 0,
      shouldHide: prevNotifs.length > 0 && notifs.length === 0
    });

    // ReactCSSTransitionGroup currently does not have a more granular control
    // over the correct ordering of new elements vs deleted elements (they commented
    // that they might add more utilities in the future).  The default places the
    // new element above the old deleted one as the old one transitions away.
    // While this works when the notifications are at the bottom, when at the top
    // we want the new notification to be below the deleted notification as it animates
    // away so that the new notification slides up into place.  To work around this
    // we update with both the old removed elements and the new element being shown
    // then we update immediately after with the old element removed.
    if (prevNotifs !== notifs) {
      let displayed = this.state.displayedNotifs!;

      // Since we maintain immutability, a changed array will have different
      // values even if they are actually the same, so we need to filter using
      // the notification keys rather than _.difference or _.intersection
      const displayedKeys = displayed.reduce((set, notif) => {
        set.add(notif.id);
        return set;
      }, new Set());

      const remaining = notifs.filter((notif) => displayedKeys.has(notif.id));

      const added = notifs.filter((notif) => !displayedKeys.has(notif.id))
        .splice(0, (maxItems || NotificationHost.defaultProps.maxItems) - remaining.length);

      displayed = union<WebappNotificationOptions>(displayed, added);
      this.setState({ displayedNotifs: displayed });
      displayed = union<WebappNotificationOptions>(remaining, added);
      this.notificationStateObservable.next({ displayedNotifs: displayed });
    }
  }

  public render(): JSX.Element | null {
    let notifications = this.state.displayedNotifs!.map((item) => (
      <NotificationItem
        notification={item}
        key={item.id}
      />
    ));

    const style: React.CSSProperties = { flexDirection: 'column' };

    const isTop = this.state.notifyPosition!.corner.split('_')[0] === 'top';
    if (!isTop) {
      notifications = notifications.reverse();
      style.flexDirection = 'column-reverse';
    }

    return (
      <div className='NotificationHost' ref={this.refHandlers.host} style={style}>
        <ReactCSSTransitionGroup
          className='NotificationHost-list'
          transitionName='spin'
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          {notifications}
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  private setZoomLevelAndLimits(): void {
    const zoomLevel = this.state.zoomLevel!;
    webFrame.setLayoutZoomLevelLimits(zoomLevel, zoomLevel);
    webFrame.setZoomLevel(zoomLevel);
  }

  private getNotificationsWindow(): Electron.BrowserWindow | null {
    const entry = this.state.notificationsWindow;
    if (!entry) return null;
    return BrowserWindow.fromId(entry.id);
  }
}
