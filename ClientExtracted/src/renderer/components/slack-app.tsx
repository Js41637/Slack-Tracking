/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import { ipcRenderer, remote, shell, webFrame } from 'electron';
import { executeJavaScriptMethod, getSenderIdentifier } from 'electron-remote';
import { sum } from 'lodash';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { getUserAgent } from '../../ssb-user-agent';
import { isPrebuilt } from '../../utils/process-helpers';
import { zoomLevelToFactor } from '../../utils/zoomlevels';

import { appActions } from '../../actions/app-actions';
import { appTeamsActions } from '../../actions/app-teams-actions';
import { UrlScheme, dialogActions } from '../../actions/dialog-actions';
import { eventActions } from '../../actions/event-actions';
import { settingActions } from '../../actions/setting-actions';
import { TeamBase } from '../../actions/team-actions';
import { Component } from '../../lib/component';
import { Store } from '../../lib/store';
import { TeamMemoryStats, getMemoryUsage } from '../../memory-usage';
import { NetworkStatus } from '../../network-status';
import { appStore } from '../../stores/app-store';
import { appTeamsStore } from '../../stores/app-teams-store';
import { dialogStore } from '../../stores/dialog-store';
import { StoreEvent, eventStore } from '../../stores/event-store';
import { settingStore } from '../../stores/setting-store';
import { teamStore } from '../../stores/team-store';
import { windowFrameStore } from '../../stores/window-frame-store';
import { windowStore } from '../../stores/window-store';
import { Region, StringMap, WindowMetadata } from '../../utils/shared-constants';
import { WindowHelpers } from '../../utils/window-helpers';
import { BasicAuthView } from './basic-auth-view';
import { DraggableRegion } from './draggable-region';
import { LoadingScreen } from './loading-screen';
import { LoginView } from './login-view';
import { NativeNotificationManager } from './native-notification-manager';
import { NonDraggableRegion } from './non-draggable-region';
import { OverlayManager } from './overlay-manager';
import { TeamsDisplay } from './teams-display';
import { UrlSchemeModal } from './url-scheme-modal';
import { WinTitlebar } from './win-titlebar';

import {CHANNEL_HEADER_HEIGHT, REPORT_ISSUE_WINDOW_TYPE, SIDEBAR_ICON_SIZE,
  SIDEBAR_ITEM_MARGIN_TOP_NO_TITLE_BAR, SIDEBAR_WIDTH, networkStatusType} from '../../utils/shared-constants';

import * as React from 'react'; // tslint:disable-line

const KeyCodes = {
  Esc: 27,
  Zero: 48,
  One: 49,
  Nine: 57,
  V: 86,
  NumOne: 97,
  NumNine: 105,
  Equals: 187,
  Dash: 189
};

function keyCodeInRange({ keyCode }: { keyCode: number }, min: number, max: number): boolean {
  return keyCode >= min && keyCode <= max;
}

export interface SlackAppProps { } //tslint:disable-line:no-empty-interface

export interface SlackAppState {
  networkStatus: networkStatusType;
  isShowingLoginDialog: boolean;
  isTitleBarHidden: boolean;
  noDragRegions: Array<Region>;
  authInfo: Electron.AuthInfo | null;
  urlSchemeModal: UrlScheme | null;
  selectedTeam: TeamBase | null;
  selectedTeamId: string | null;
  numTeams: number;
  isDevMode: boolean;
  areDevToolsOpen: boolean;
  isShowingHtmlNotifications: boolean;
  isMac: boolean;
  isFullScreen: boolean;
  zoomLevel: number;
  reportIssueWindow: WindowMetadata | null;
  reportIssueEvent: StoreEvent;
  reportIssueOnStartup: boolean;
  isWin10: boolean;
  isMaximized?: boolean;
  wasConnected?: boolean;
}

export class SlackApp extends Component<SlackAppProps, Partial<SlackAppState>> {
  private notificationManager: NativeNotificationManager;
  private networkStatus: NetworkStatus;
  private networkStatusSubscription: Subscription;
  private overlayManager: OverlayManager;
  private loginViewElement: LoginView;
  private teamsDisplayElement: TeamsDisplay;
  private mainElement: HTMLElement;
  /**
   * Capture state `reportIssueOnStartup` to `reportIssueEvent` can read values before state changed.
   * Report issue will append tag based on state of this flag.
   *
   * Note : this is immediate solution for 2.7 until migrated `reportIssueEvent` into epics
   */
  private reportIssueOnStartup: boolean = false;


  private readonly refHandlers = {
    loginView: (ref: LoginView) => this.loginViewElement = ref,
    teamDisplay: (ref: TeamsDisplay) => this.teamsDisplayElement = ref,
    main: (ref: HTMLElement) => this.mainElement = ref
  };

  private readonly eventHandlers = {
    onCancelLogin: () => dialogActions.hideLoginDialog()
  };

  public syncState(): SlackAppState {
    const selectedTeamId = appTeamsStore.getSelectedTeamId();
    const selectedTeam = teamStore.getTeam(selectedTeamId) || null;
    const reportIssueWindow = windowStore.getWindowOfSubType(REPORT_ISSUE_WINDOW_TYPE);

    return {
      networkStatus: appStore.getNetworkStatus(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),
      isTitleBarHidden: settingStore.getSetting<boolean>('isTitleBarHidden'),
      noDragRegions: appStore.getNoDragRegions(),

      authInfo: dialogStore.getInfoForAuthDialog(),
      urlSchemeModal: dialogStore.getUrlSchemeModal(),

      selectedTeam,
      selectedTeamId,
      numTeams: teamStore.getNumTeams(),

      isDevMode: settingStore.getSetting<boolean>('isDevMode'),
      areDevToolsOpen: appStore.areDevToolsOpen(),
      isShowingHtmlNotifications: settingStore.isShowingHtmlNotifications(),
      isMac: settingStore.isMac(),
      isFullScreen: windowFrameStore.isFullScreen(),
      zoomLevel: settingStore.getSetting<number>('zoomLevel'),

      reportIssueWindow,
      reportIssueEvent: eventStore.getEvent('reportIssue'),
      reportIssueOnStartup: settingStore.getSetting<boolean>('reportIssueOnStartup'),

      isWin10: settingStore.getSetting<boolean>('isWin10')
    };
  }

  public componentDidMount(): void {
    // Disable pinch-to-zoom (should still allow manual zooming via menu commands)
    webFrame.setVisualZoomLevelLimits(1, 1);

    this.networkStatusSubscription = this.setupNetworkStatus();
    this.disposables.add(this.networkStatusSubscription);
    this.disposables.add(this.setupKeyDownHandlers());

    // Otherwise we'll use {HtmlNotificationManager} in the browser process
    if (!settingStore.isShowingHtmlNotifications()) {
      this.notificationManager = new NativeNotificationManager();
    }

    if (settingStore.isWindows()) {
      this.overlayManager = new OverlayManager();
    }

    this.disposables.add(this.setupWindowWatcher());
    if (this.state.reportIssueOnStartup) {
      this.reportIssueOnStartup = true;
      eventActions.reportIssue();
    }
  }

  public componentDidUpdate(_prevProps: Partial<SlackAppProps>, prevState: Partial<SlackAppState>): void {
    if (this.state.isShowingHtmlNotifications && !prevState.isShowingHtmlNotifications) {
      this.notificationManager.dispose();
    } else if (!this.state.isShowingHtmlNotifications && prevState.isShowingHtmlNotifications) {
      this.notificationManager = new NativeNotificationManager();
    }

    // Don't thrash the network while we're waiting for the user to login.
    if (this.state.authInfo && !prevState.authInfo) {
      this.networkStatusSubscription.unsubscribe();
    } else if (!this.state.authInfo && prevState.authInfo) {
      this.networkStatusSubscription = this.setupNetworkStatus();
      this.disposables.add(this.networkStatusSubscription);
    }
  }

  /**
   * Focuses the existing Report Issue window or creates a new one.
   */
  public reportIssueEvent(): void {
    const { selectedTeam, reportIssueWindow } = this.state;

    const baseUrl = require('url').resolve(
      selectedTeam ? selectedTeam.team_url : `https://slack.com`,
      `help/requests/new`
    );
    const helpUrl = `${baseUrl}${this.reportIssueOnStartup ? `?crash_report=1` : ''}`;

    if (reportIssueWindow) {
      const browserWindow = remote.BrowserWindow.fromId(reportIssueWindow.id);
      WindowHelpers.bringToForeground(browserWindow, Store);
    } else if (selectedTeam) {
      this.createReportIssueWindow(helpUrl);
    } else {
      shell.openExternal(helpUrl);
    }

    this.reportIssueOnStartup = false;
  }

  /**
   * Returns memory stats aggregated across all teams, the main renderer, and
   * the browser process.
   *
   * NB: This method must be defined on `global.application` to be called from
   * the webapp process.
   */
  public async getCombinedMemoryUsage() {
    const rendererMemory = getMemoryUsage();
    const browserMemory = await executeJavaScriptMethod(null, 'getMemoryUsage');
    const allTeamsMemory = this.teamsDisplayElement ?
      await this.teamsDisplayElement.getCombinedMemoryUsage() : null;

    const combinedMemory = [rendererMemory, browserMemory, allTeamsMemory].reduce(sum);

    return { ...combinedMemory, numTeams: this.state.numTeams };
  }

  /**
   * Returns memory stats for the current teams. Does not include stats on
   * resource usage.
   *
   * NB: This method must be defined on `global.application` to be called from
   * the webapp process.
   */
  public getTeamsMemoryUsage(): Promise<StringMap<TeamMemoryStats>> {
    return this.teamsDisplayElement.getTeamsMemoryUsage();
  }

  public render(): JSX.Element | null {
    const {
      numTeams,
      networkStatus,
      authInfo,
      isShowingLoginDialog,
      urlSchemeModal,
      isWin10,
      isMaximized,
      isFullScreen
    } = this.state;

    const hasTeams = (numTeams || 0) > 0;
    const isOnline = networkStatus === 'online';
    const className = classNames('SlackApp', {
      'fancy-frame': isWin10 && !isFullScreen
    }, { isMaximized });

    let teamContent = <LoadingScreen />;
    let loginContent = null;
    let authContent = null;
    let urlSchemeContent = null;

    // NB: If we were ever connected before, let the webapp handle disconnects
    // rather than showing the "No internet" screen. This keeps us from
    // unloading any teams, resulting in faster reconnects.
    if (isOnline || this.state.wasConnected) {
      teamContent = <TeamsDisplay ref={this.refHandlers.teamDisplay}/>;

      if (!hasTeams || isShowingLoginDialog) {
        loginContent = (
          <LoginView
            ref={this.refHandlers.loginView}
            cancelable={hasTeams}
            onCancel={this.eventHandlers.onCancelLogin}
          />);
      }
    }

    if (authInfo) {
      authContent = <BasicAuthView authInfo={authInfo}/>;
    }

    if (urlSchemeModal && urlSchemeModal.isShowing) {
      urlSchemeContent =
        <UrlSchemeModal url={urlSchemeModal.url} disposition={urlSchemeModal.disposition} />;
    }

    return (
      <div ref={this.refHandlers.main} className={className}>
        {isWin10 && !isFullScreen ? <WinTitlebar /> : ''}
        {this.renderDraggableRegion(loginContent !== null)}
        {teamContent}
        {loginContent}
        <ReactCSSTransitionGroup
          transitionName='anim'
          transitionEnter={false}
          transitionLeaveTimeout={200}
        >
          {urlSchemeContent}
          {authContent}
        </ReactCSSTransitionGroup>
        {this.renderReduxDevTools()}
      </div>
    );
  }

  /**
   * Observes window maximize and full-screen events and sets some state
   * accordingly. We need to track this for rendering the window frame.
   *
   * @return {Subscription}  Manages the event subscription
   */
  private setupWindowWatcher(): Subscription {
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
  private setupNetworkStatus(): Subscription {
    this.networkStatus = new NetworkStatus();

    const sub = this.networkStatus.firstSuccessfulNetworkCheck()
      .subscribe(() => this.setState({ wasConnected: true }));

    sub.add(this.networkStatus.statusObservable()
      .subscribe((online) => {
        if (online) {
          appActions.setNetworkStatus('online');
        } else if (this.networkStatus.isBrowserOnline && this.networkStatus.reason === 'slackDown') {
          appActions.setNetworkStatus('slackDown');
        } else {
          appActions.setNetworkStatus('offline');
        }
      }));

    return sub;
  }

  private setupKeyDownHandlers(): Subscription {
    const keyDown = Observable.fromEvent(document.body, 'keydown', true);

    return keyDown.subscribe((e: KeyboardEvent) => {
      const { numTeams, isShowingLoginDialog, isMac } = this.state;

      if (e.metaKey && this.state.numTeams! > 0) {
        const isNumberKey = keyCodeInRange(e, KeyCodes.One, KeyCodes.Nine);
        const isNumPadKey = keyCodeInRange(e, KeyCodes.NumOne, KeyCodes.NumNine);

        if (isNumberKey || isNumPadKey) {
          e.preventDefault();
          const index = e.keyCode - (isNumberKey ? KeyCodes.One : KeyCodes.NumOne);
          if (this.state.numTeams! > index) appTeamsActions.selectTeamByIndex(index);
        }
      }

      if (e.keyCode === KeyCodes.Esc && numTeams! > 0 && isShowingLoginDialog) {
        e.preventDefault();
        this.loginViewElement.cancel();
      }

      if (e.keyCode === KeyCodes.Dash && !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        settingActions.zoomOut();
      }

      if (e.keyCode === KeyCodes.Equals && !e.shiftKey && !e.altKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        settingActions.zoomIn();
      }

      if (e.keyCode === KeyCodes.Zero && !e.shiftKey && !e.altKey && e.ctrlKey && isMac) {
        e.preventDefault();
        settingActions.resetZoom();
      }

      if (e.keyCode === KeyCodes.V && e.shiftKey && e.metaKey && isMac) {
        e.preventDefault();
        remote.getCurrentWebContents().paste();
      }
    });
  }

  /**
   * Delegate to the main process to create a popup window pointed at our Help
   * request URL.
   */
  private createReportIssueWindow(url: string): void {
    ipcRenderer.send('create-webapp-window', {
      url,
      userAgent: getUserAgent(),
      parentInfo: getSenderIdentifier(),
      windowType: REPORT_ISSUE_WINDOW_TYPE,
      fullscreenable: false,
      isPopupWindow: true,
      width: 925,
      height: 800
    });
  }

  /**
   * Render the Redux DevTools on developer builds only.
   *
   * @return {JSX.Element | null}  The Redux devTools element, or null
   */
  private renderReduxDevTools(): JSX.Element | null {
    if (isPrebuilt() &&
      this.state.areDevToolsOpen &&
      global.loadSettings.devMode) {
      const DevTools = require('./dev-tools').DevTools;
      const { Provider } = require('react-redux');
      return (
        <Provider store={(Store as any).getStore()}>
          <DevTools />
        </Provider>
      );
    } else {
      return null;
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
  private renderDraggableRegion(hasLoginContent: boolean): JSX.Element | null {
    const { isTitleBarHidden, noDragRegions } = this.state;
    const zoomFactor = zoomLevelToFactor(this.state.zoomLevel);

    if (!isTitleBarHidden) return null;

    let noDragElements = null;
    if (!hasLoginContent) {
      // All drag regions will be offset by the width of the sidebar
      noDragElements = noDragRegions!.map((region) => {
        return (
          <NonDraggableRegion
            id={region.id}
            key={region.id}
            left={region.left * zoomFactor + SIDEBAR_WIDTH}
            top={region.top * zoomFactor}
            width={region.width * zoomFactor}
            height={region.height * zoomFactor}
          />
        );
      });

      // NB: Add a non-drag region covering the first item in the sidebar, so
      // you don't move the window when you intended to rearrange a team.
      noDragElements.push(
        <NonDraggableRegion
          id={'sidebarNoDragRegion'}
          key={'sidebarNoDragRegion'}
          left={0}
          top={SIDEBAR_ITEM_MARGIN_TOP_NO_TITLE_BAR}
          width={SIDEBAR_WIDTH}
          height={SIDEBAR_ICON_SIZE}
        />
      );
    }

    return (
      <DraggableRegion height={CHANNEL_HEADER_HEIGHT * zoomFactor}>
        {noDragElements}
      </DraggableRegion>
    );
  }
}
