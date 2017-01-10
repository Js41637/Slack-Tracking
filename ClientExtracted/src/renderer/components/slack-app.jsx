import {ipcRenderer, shell, remote, webFrame} from 'electron';
import {executeJavaScriptMethod, getSenderIdentifier} from 'electron-remote';
import classNames from 'classnames';
import {Observable} from 'rxjs/Observable';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import getUserAgent from '../../ssb-user-agent';
import {isPrebuilt} from '../../utils/process-helpers';
import {zoomLevelToFactor} from '../../utils/zoomlevel-to-factor';
import {objectSum} from '../../utils/object-sum';

import {getMemoryUsage} from '../../memory-usage';
import {appActions} from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import AppTeamsStore from '../../stores/app-teams-store';
import BasicAuthView from './basic-auth-view';
import Component from '../../lib/component';
import DraggableRegion from './draggable-region';
import {dialogStore} from '../../stores/dialog-store';
import {dialogActions} from '../../actions/dialog-actions';
import {eventActions} from '../../actions/event-actions';
import EventStore from '../../stores/event-store';
import LoadingScreen from './loading-screen';
import LoginView from './login-view';
import NativeNotificationManager from './native-notification-manager';
import NetworkStatus from '../../network-status';
import NonDraggableRegion from './non-draggable-region';
import OverlayManager from './overlay-manager';
import {settingActions} from '../../actions/setting-actions';
import {settingStore} from '../../stores/setting-store';
import {Store} from '../../lib/store';
import TeamsDisplay from './teams-display';
import TeamStore from '../../stores/team-store';
import UrlSchemeModal from './url-scheme-modal';
import {windowFrameStore} from '../../stores/window-frame-store';
import {WindowHelpers} from '../../components/helpers/window-helpers';
import WindowStore from '../../stores/window-store';
import {WinTitlebar} from './win-titlebar';

const ESCAPE_KEYCODE = 27;
const EQUALS_KEYCODE = 187;
const V_KEYCODE = 86;

import {SIDEBAR_WIDTH, SIDEBAR_WIDTH_NO_TITLE_BAR,
  CHANNEL_HEADER_HEIGHT, REPORT_ISSUE_WINDOW_TYPE} from '../../utils/shared-constants';

export default class SlackApp extends Component {

  syncState() {
    let selectedTeamId = AppTeamsStore.getSelectedTeamId();
    let selectedTeam = TeamStore.getTeam(selectedTeamId) || null;

    return {
      networkStatus: AppStore.getNetworkStatus(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),
      isTitleBarHidden: settingStore.getSetting('isTitleBarHidden'),
      noDragRegions: windowFrameStore.getNoDragRegions(),

      authInfo: dialogStore.getInfoForAuthDialog(),
      urlSchemeModal: dialogStore.getUrlSchemeModal(),

      selectedTeam,
      selectedTeamId,
      numTeams: TeamStore.getNumTeams(),

      isDevMode: settingStore.getSetting('isDevMode'),
      isShowingDevTools: dialogStore.isShowingDevTools(),
      isShowingHtmlNotifications: settingStore.isShowingHtmlNotifications(),
      isMac: settingStore.isMac(),
      zoomLevel: settingStore.getSetting('zoomLevel'),

      reportIssueWindow: WindowStore.getWindowOfSubType(REPORT_ISSUE_WINDOW_TYPE),
      reportIssueEvent: EventStore.getEvent('reportIssue'),
      reportIssueOnStartup: settingStore.getSetting('reportIssueOnStartup'),

      isWin10: settingStore.getSetting('isWin10')
    };
  }

  componentDidMount() {
    // Disable pinch-to-zoom (should still allow manual zooming via menu commands)
    webFrame.setVisualZoomLevelLimits(1, 1);

    this.disposables.add(this.setupNetwork());
    this.disposables.add(this.setupKeyDownHandlers());

    // Otherwise we'll use {HtmlNotificationManager} in the browser process
    if (!settingStore.isShowingHtmlNotifications()) {
      this.notificationManager = new NativeNotificationManager();
    }

    if (settingStore.isWindows()) {
      this.overlayManager = new OverlayManager();
    }

    if (this.state.reportIssueOnStartup) {
      eventActions.reportIssue();
    }

    this.disposables.add(this.setupWindowWatcher());
  }

  /**
   * Observes window maximize and full-screen events and sets some state
   * accordingly. We need to track this for rendering the window frame.
   *
   * @return {Subscription}  Manages the event subscription
   */
  setupWindowWatcher() {
    const browserWindow = remote.getCurrentWindow();

    if (browserWindow.isMaximized()) {
      this.setState({ isMaximized: true });
    }

    const maximizedEvents = Observable.merge(
      Observable.fromEvent(browserWindow, 'enter-full-screen'),
      Observable.fromEvent(browserWindow, 'maximize')
    ).map(() => true);

    const minimizedEvents = Observable.merge(
      Observable.fromEvent(browserWindow, 'leave-full-screen'),
      Observable.fromEvent(browserWindow, 'unmaximize')
    ).map(() => false);

    return Observable.merge(maximizedEvents, minimizedEvents)
      .subscribe((isMaximized) => this.setState({ isMaximized }));
  }

  /**
   * Observes network status until we're online, at which point we'll stop
   * monitoring changes and let the webapp handle reconnects.
   *
   * @return {Subscription}  Manages the event subscription
   */
  setupNetwork() {
    this.networkStatus = new NetworkStatus();

    return this.networkStatus.statusObservable()
      .subscribe((online) => {
        if (online) {
          appActions.setNetworkStatus('online');
          this.setState({wasConnected: true});
        } else if (this.networkStatus.browserIsOnline() && this.networkStatus.reason === 'slackDown') {
          appActions.setNetworkStatus('slackDown');
        } else {
          appActions.setNetworkStatus('offline');
        }
      });
  }

  setupKeyDownHandlers() {
    let keyDown = Observable.fromEvent(document.body, 'keydown', true);

    return keyDown.subscribe((e) => {
      if (e.keyCode === ESCAPE_KEYCODE && this.state.numTeams > 0 && this.state.isShowingLoginDialog) {
        e.preventDefault();
        this.refs.loginView.cancel();
      }

      if (e.keyCode === EQUALS_KEYCODE && !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        settingActions.zoomIn();
      }

      if (e.keyCode === V_KEYCODE && e.shiftKey && e.metaKey && this.state.isMac) {
        e.preventDefault();
        remote.getCurrentWebContents().paste();
      }
    });
  }

  /**
   * Returns memory stats aggregated across all teams, the main renderer, and
   * the browser process.
   */
  async getCombinedMemoryUsage() {
    let rendererMemory = getMemoryUsage();
    let browserMemory = await executeJavaScriptMethod(null, 'getMemoryUsage');
    let allTeamsMemory = this.refs.teamsDisplay ?
      await this.refs.teamsDisplay.getCombinedMemoryUsage() : null;

    let combinedMemory = [rendererMemory, browserMemory, allTeamsMemory].reduce(objectSum);

    return Object.assign(combinedMemory, {
      numTeams: this.state.numTeams
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isShowingHtmlNotifications && !prevState.isShowingHtmlNotifications) {
      this.notificationManager.dispose();
    } else if (!this.state.isShowingHtmlNotifications && prevState.isShowingHtmlNotifications) {
      this.notificationManager = new NativeNotificationManager();
    }
  }

  /**
   * Focuses the existing Report Issue window or creates a new one.
   */
  reportIssueEvent() {
    let {selectedTeam, reportIssueWindow} = this.state;

    if (reportIssueWindow) {
      let browserWindow = remote.BrowserWindow.fromId(reportIssueWindow.id);
      WindowHelpers.bringToForeground(browserWindow);
    } else if (selectedTeam) {
      let helpUrl = require('url').resolve(selectedTeam.team_url, 'help/requests/new');
      this.createReportIssueWindow(helpUrl);
    } else {
      shell.openExternal(`https://slack.com/help/requests/new`);
    }
  }

  /**
   * Delegate to the main process to create a popup window pointed at our Help
   * request URL.
   */
  createReportIssueWindow(url) {
    ipcRenderer.send('create-webapp-window', {
      url,
      userAgent: getUserAgent(),
      parentInfo: getSenderIdentifier(),
      windowType: REPORT_ISSUE_WINDOW_TYPE,
      fullscreenable: false,
      isPopupWindow: true,
      width: 800,
      height: 900
    });
  }

  /**
   * Renders a draggable region that overlaps the channel header, if the
   * title-bar is hidden. There can be non-draggable regions within the header,
   * such as the search box or the topic field, unless a full-screen modal is
   * visible.
   *
   * @param  {Bool} hasLoginContent True if the login modal is visible
   * @return {HTMLElement}          A draggable region, or null if unnecessary
   */
  renderDraggableRegion(hasLoginContent) {
    let {isTitleBarHidden, numTeams, noDragRegions} = this.state;
    let zoomFactor = zoomLevelToFactor(this.state.zoomLevel);

    if (!isTitleBarHidden) return null;

    let noDragElements = null;
    if (!hasLoginContent) {
      let offset = isTitleBarHidden ?
        SIDEBAR_WIDTH_NO_TITLE_BAR :
        SIDEBAR_WIDTH;

      // All drag regions will be offset by the width of the sidebar
      noDragElements = noDragRegions.map((region) => {
        let left = isTitleBarHidden || numTeams > 1 ?
          region.left + offset :
          region.left;

        return (
          <NonDraggableRegion
            key={region.id}
            left={left * zoomFactor}
            top={region.top * zoomFactor}
            width={region.width * zoomFactor}
            height={region.height * zoomFactor} />
        );
      });
    }

    return (
      <DraggableRegion height={CHANNEL_HEADER_HEIGHT * zoomFactor}>
        {noDragElements}
      </DraggableRegion>
    );
  }

  render() {
    let {numTeams, networkStatus, authInfo, isShowingLoginDialog,
      isShowingDevTools, urlSchemeModal, isWin10, isMaximized} = this.state;
    let hasTeams = numTeams > 0;
    let isOnline = networkStatus === 'online';
    let className = classNames('SlackApp', { 'fancy-frame': isWin10 }, {isMaximized});

    let teamContent = <LoadingScreen />;
    let loginContent = null;
    let authContent = null;
    let urlSchemeContent = null;

    // NB: If we were ever connected before, let the webapp handle disconnects
    // rather than showing the "No internet" screen. This keeps us from
    // unloading any teams, resulting in faster reconnects.
    if (isOnline || this.state.wasConnected) {
      teamContent = <TeamsDisplay ref="teamsDisplay"/>;

      if (!hasTeams || isShowingLoginDialog) {
        loginContent =
          <LoginView ref="loginView"
            cancelable={hasTeams}
            onCancel={() => dialogActions.hideLoginDialog()}/>;
      }
    }

    if (authInfo) {
      authContent = <BasicAuthView authInfo={authInfo}/>;
    }

    if (urlSchemeModal && urlSchemeModal.isShowing) {
      urlSchemeContent =
        <UrlSchemeModal url={urlSchemeModal.url} disposition={urlSchemeModal.disposition} />;
    }

    let debugPanel = null;

    if (isShowingDevTools && global.loadSettings.devMode && isPrebuilt()) {
      let DevTools = require('./dev-tools').default;
      let { Provider } = require('react-redux');
      debugPanel = (
        <Provider store={Store.getStore()}>
          <DevTools/>
        </Provider>
      );
    }

    return (
      <div ref="main" className={className}>
        {isWin10 ? <WinTitlebar /> : ''}
        {this.renderDraggableRegion(loginContent !== null)}
        {teamContent}
        {loginContent}
        <ReactCSSTransitionGroup transitionName="anim"
          transitionEnter={false}
          transitionLeaveTimeout={200}>
          {urlSchemeContent}
          {authContent}
        </ReactCSSTransitionGroup>
        {debugPanel}
      </div>
    );
  }
}
