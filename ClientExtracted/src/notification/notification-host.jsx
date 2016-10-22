import _ from 'lodash';
import {remote, webFrame} from 'electron';
import {Observable, Subject} from 'rx';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Component from '../lib/component';
import NotificationItem from './notification-item.jsx';
import NotificationStore from '../stores/notification-store';
import NotificationWindowHelpers from '../components/helpers/notification-window-helpers';
import SettingStore from '../stores/setting-store';
import WindowStore from '../stores/window-store';

const {BrowserWindow} = remote;
const {showPositionedNotificationWindow} = NotificationWindowHelpers;

export default class NotificationHost extends Component {

  static defaultProps = {
    idleTimeoutMs: 400,
    notificationSize: {width: 375, height: 88},
    maxItems: 3
  };

  static propTypes = {
    idleTimeoutMs: React.PropTypes.number,
    notificationSize: React.PropTypes.shape({
      width: React.PropTypes.number,
      height: React.PropTypes.number
    }),
    maxItems: React.PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state.displayedNotifs = this.state.notifications.splice(0, this.props.maxItems);

    this.windowState = new Subject();

    this.disposables.add(
      this.windowState.where(({shouldHide}) => shouldHide)
        .flatMap(() => Observable.timer(this.props.idleTimeoutMs))
        .map(() => this.getNotificationsWindow())
        .where((browserWindow) => browserWindow)
        .subscribe((browserWindow) => browserWindow.hide())
    );

    this.disposables.add(
      this.windowState.where(({shouldShow}) => shouldShow)
        .map(() => this.getNotificationsWindow())
        .where((browserWindow) => browserWindow)
        .subscribe((browserWindow) => {
          let mainWindowId = this.state.mainWindow.id;
          let mainWindow = BrowserWindow.fromId(mainWindowId);

          showPositionedNotificationWindow(browserWindow, mainWindow,
            this.state.zoomLevel, this.state.notifyPosition);
        })
    );
  }

  syncState() {
    return {
      notifications: NotificationStore.getNotifications(),
      notificationsWindow: WindowStore.getNotificationsWindow(),
      mainWindow: WindowStore.getMainWindow(),
      zoomLevel: SettingStore.getSetting('zoomLevel'),
      notifyPosition: SettingStore.getSetting('notifyPosition')
    };
  }

  componentDidMount() {
    webFrame.setZoomLevel(this.state.zoomLevel);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.zoomLevel != this.state.zoomLevel) {
      webFrame.setZoomLevel(this.state.zoomLevel);
    }

    let maxItems = this.props.maxItems;
    let prevNotifs = prevState.notifications;
    let notifs = this.state.notifications;

    this.windowState.onNext({
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
    if (prevNotifs != notifs) {
      let displayed = this.state.displayedNotifs;

      // Since we maintain immutability, a changed array will have different
      // values even if they are actually the same, so we need to filter using
      // the notification keys rather than _.difference or _.intersection
      let displayedKeys = _.reduce(displayed, (set, notif) => {
        set.add(notif.id);
        return set;
      }, new Set());

      let remaining = _.filter(notifs, (notif) => displayedKeys.has(notif.id));

      let added = _.filter(notifs, (notif) => !displayedKeys.has(notif.id))
                    .splice(0, maxItems - remaining.length);

      displayed = _.union(displayed, added);
      this.setState({displayedNotifs: displayed});
      displayed = _.union(remaining, added);
      requestAnimationFrame(() => this.setState({displayedNotifs: displayed}));
    }
  }

  getNotificationsWindow() {
    let entry = this.state.notificationsWindow;
    if (!entry) return null;
    return BrowserWindow.fromId(entry.id);
  }

  render() {
    let notifications = this.state.displayedNotifs.map((item) => (
      <NotificationItem
        notification={item}
        key={item.id}
      />
    ));

    let style = {flexDirection: 'column'};

    let isTop = this.state.notifyPosition.corner.split('_')[0] == 'top';
    if (!isTop) {
      notifications = notifications.reverse();
      style.flexDirection = 'column-reverse';
    }

    return (
      <div className="NotificationHost" ref="host" style={style}>
        <ReactCSSTransitionGroup
          className="NotificationHost-list"
          transitionName="spin"
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}>
          {notifications}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
