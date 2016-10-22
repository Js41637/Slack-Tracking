import {executeJavaScriptMethod} from 'electron-remote';
import {getMemoryUsage} from '../../memory-usage';
import objectSum from '../../utils/object-sum';
import {Observable} from 'rx';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {reduce} from 'lodash';
import {remote, webFrame} from 'electron';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import BasicAuthView from './basic-auth-view';
import Component from '../../lib/component';
import LoadingScreen from './loading-screen';
import LoginView from './login-view';
import NativeNotificationManager from './native-notification-manager';
import NetworkStatus from '../../network-status';
import OverlayManager from './overlay-manager';
import SettingActions from '../../actions/setting-actions';
import SettingStore from '../../stores/setting-store';
import Store from '../../lib/store';
import TeamsDisplay from './teams-display';
import TeamStore from '../../stores/team-store';

const ESCAPE_KEYCODE = 27;
const EQUALS_KEYCODE = 187;
const V_KEYCODE = 86;

export default class SlackApp extends Component {

  syncState() {
    return {
      isShowingLoginDialog: AppStore.isShowingLoginDialog(),
      authInfo: AppStore.getInfoForAuthDialog(),
      isShowingHtmlNotifications: SettingStore.isShowingHtmlNotifications(),
      networkStatus: AppStore.getNetworkStatus(),
      numTeams: TeamStore.getNumTeams(),
      selectedTeamId: AppStore.getSelectedTeamId(),
      isDevMode: SettingStore.getSetting('isDevMode'),
      isShowingDevTools: AppStore.isShowingDevTools(),
      isMac: SettingStore.isMac()
    };
  }

  componentDidMount() {
    // Disable pinch-to-zoom (should still allow manual zooming via menu commands)
    webFrame.setZoomLevelLimits(1, 1);

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
   * @return {Disposable}  A Disposable that will clean up this subscription
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
    let keyDown = Observable.fromEvent(document.body, 'keydown', null, true);

    return keyDown.subscribe((e) => {
      if (e.keyCode === ESCAPE_KEYCODE && this.state.numTeams > 0 && this.state.isShowingLoginDialog) {
        e.preventDefault();
        AppActions.hideLoginDialog();
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

    let combinedMemory = reduce([rendererMemory, browserMemory, allTeamsMemory], objectSum);

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

  render() {
    let {numTeams, networkStatus, authInfo, isShowingLoginDialog, isShowingDevTools} = this.state;
    let hasTeams = numTeams > 0;
    let isOnline = networkStatus === 'online';

    let teamContent = <LoadingScreen />;
    let loginContent = null;

    // NB: If we were ever connected before, let the webapp handle disconnects
    // rather than showing the "No internet" screen. This keeps us from
    // unloading any teams, resulting in faster reconnects.
    if (isOnline || this.state.wasConnected) {
      teamContent = <TeamsDisplay ref="teamsDisplay"/>;

      if (!hasTeams || isShowingLoginDialog) {
        loginContent =
          <LoginView fadeInOnEnter={hasTeams}
            showAsOverlay={hasTeams}
            cancelable={hasTeams}
            onCancel={() => AppActions.hideLoginDialog()}/>;
      }
    }

    if (authInfo) {
      loginContent = <BasicAuthView authInfo={authInfo}/>;
    }

    let debugPanel = null;

    let isPrebuilt = process.execPath.match(/[\\\/]electron-prebuilt[\\\/]/);
    if (isShowingDevTools && global.loadSettings.devMode && isPrebuilt) {
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
        {teamContent}
        <ReactCSSTransitionGroup transitionName="anim" transitionEnter={false}
          transitionLeaveTimeout={200}>
          {loginContent}
        </ReactCSSTransitionGroup>
        {debugPanel}
      </div>
    );
  }
}
