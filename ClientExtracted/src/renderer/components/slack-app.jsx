import {executeJavaScriptMethod} from 'electron-remote';
import {getMemoryUsage} from '../../memory-usage';
import objectSum from '../../utils/object-sum';
import {Observable} from 'rxjs/Observable';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {remote, webFrame} from 'electron';
import {isPrebuilt} from '../../utils/process-helpers';
import zoomlevelToFactor from '../../utils/zoomlevel-to-factor';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import BasicAuthView from './basic-auth-view';
import Component from '../../lib/component';
import DraggableRegion from './draggable-region';
import LoadingScreen from './loading-screen';
import LoginView from './login-view';
import NativeNotificationManager from './native-notification-manager';
import NetworkStatus from '../../network-status';
import NonDraggableRegion from './non-draggable-region';
import OverlayManager from './overlay-manager';
import SettingActions from '../../actions/setting-actions';
import SettingStore from '../../stores/setting-store';
import Store from '../../lib/store';
import TeamsDisplay from './teams-display';
import TeamStore from '../../stores/team-store';
import UrlSchemeModal from './url-scheme-modal';

const ESCAPE_KEYCODE = 27;
const EQUALS_KEYCODE = 187;
const V_KEYCODE = 86;

import {SIDEBAR_WIDTH, SIDEBAR_WIDTH_NO_TITLE_BAR,
  CHANNEL_HEADER_HEIGHT} from '../../utils/shared-constants';

export default class SlackApp extends Component {

  syncState() {
    return {
      networkStatus: AppStore.getNetworkStatus(),
      isShowingLoginDialog: AppStore.isShowingLoginDialog(),
      isTitleBarHidden: SettingStore.getSetting('isTitleBarHidden'),
      noDragRegions: AppStore.getNoDragRegions(),

      authInfo: AppStore.getInfoForAuthDialog(),
      urlSchemeModal: AppStore.getUrlSchemeModal(),

      numTeams: TeamStore.getNumTeams(),
      selectedTeamId: AppStore.getSelectedTeamId(),

      isDevMode: SettingStore.getSetting('isDevMode'),
      isShowingDevTools: AppStore.isShowingDevTools(),
      isShowingHtmlNotifications: SettingStore.isShowingHtmlNotifications(),
      isMac: SettingStore.isMac(),
      zoomLevel: SettingStore.getSetting('zoomLevel')
    };
  }

  componentDidMount() {
    // Disable pinch-to-zoom (should still allow manual zooming via menu commands)
    webFrame.setVisualZoomLevelLimits(1, 1);

    this.disposables.add(this.setupNetwork());
    this.disposables.add(this.setupKeyDownHandlers());

    // Otherwise we'll use {HtmlNotificationManager} in the browser process
    if (!SettingStore.isShowingHtmlNotifications()) {
      this.notificationManager = new NativeNotificationManager();
    }

    if (SettingStore.isWindows()) {
      this.overlayManager = new OverlayManager();
    }
  }

  /**
   * Observes network status until we're online, at which point we'll stop
   * monitoring changes and let the webapp handle reconnects.
   *
   * @return {Subscription}  A Subscription that will clean up this subscription
   */
  setupNetwork() {
    this.networkStatus = new NetworkStatus();

    return this.networkStatus.statusObservable()
      .subscribe((online) => {
        if (online) {
          AppActions.setNetworkStatus('online');
          this.setState({wasConnected: true});
        } else if (this.networkStatus.browserIsOnline() && this.networkStatus.reason === 'slackDown') {
          AppActions.setNetworkStatus('slackDown');
        } else {
          AppActions.setNetworkStatus('offline');
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
        SettingActions.zoomIn();
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
    let zoomFactor = zoomlevelToFactor(this.state.zoomLevel);

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
    let {numTeams, networkStatus, authInfo, isShowingLoginDialog, isShowingDevTools, urlSchemeModal} = this.state;
    let hasTeams = numTeams > 0;
    let isOnline = networkStatus === 'online';

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
            onCancel={() => AppActions.hideLoginDialog()}/>;
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
      <div ref="main" className="SlackApp">
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
