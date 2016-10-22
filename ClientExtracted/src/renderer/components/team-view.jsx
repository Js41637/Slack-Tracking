import _ from 'lodash';
import {clipboard, ipcRenderer, remote} from 'electron';
import {getSenderIdentifier} from 'electron-remote';
import getUserAgent from '../../ssb-user-agent';
import logger from '../../logger';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Observable, Disposable, CompositeDisposable,
  SerialDisposable, Subject, AsyncSubject} from 'rx';
import '../../custom-operators';

import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import DownloadManager from './download-manager';
import EventActions from '../../actions/event-actions';
import EventStore from '../../stores/event-store';
import LoadingScreen from './loading-screen';
import SettingStore from '../../stores/setting-store';
import TeamStore from '../../stores/team-store';
import WebViewContext from './web-view-ctx';
import WindowHelpers from '../../components/helpers/window-helpers';
import WindowStore from '../../stores/window-store';

import {FIND_PASTEBOARD_NAME} from '../../ssb/clipboard';
import {TEAM_IDLE_TIMEOUT, DEFAULT_TEAM_IDLE_TIMEOUT} from '../../utils/shared-constants';

const REPORT_ISSUE_WINDOW_TYPE = 'report-issue';

export default class TeamView extends Component {
  static propTypes = {
    teamId: React.PropTypes.string.isRequired,
    loadWebView: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = _.extend({
      isWebViewLoaded: false
    }, this.state);

    this.teamSelected = new Subject();
    this.webAppHasLoaded = new AsyncSubject();
  }

  syncState() {
    return {
      team: TeamStore.getTeam(this.props.teamId),
      selectedTeamId: AppStore.getSelectedTeamId(),
      isShowingDevTools: AppStore.isShowingDevTools(),
      isShowingLoginDialog: AppStore.isShowingLoginDialog(),
      isDevMode: SettingStore.getSetting('isDevMode'),
      webappSrcPath: SettingStore.getSetting('webappSrcPath'),

      showWebappDialogEvent: EventStore.getEvent('showWebappDialog'),
      clickNotificationEvent: EventStore.getEvent('clickNotification'),
      replyToNotificationEvent: EventStore.getEvent('replyToNotification'),
      focusPrimaryTeamEvent: EventStore.getEvent('focusPrimaryTeam'),
      appCommandEvent: EventStore.getEvent('appCommand'),
      editingCommandEvent: EventStore.getEvent('editingCommand'),
      refreshTeamEvent: EventStore.getEvent('refreshTeam'),
      reloadEvent: EventStore.getEvent('reload'),

      reportIssueWindow: WindowStore.getWindowOfSubType(REPORT_ISSUE_WINDOW_TYPE),
      reportIssueEvent: EventStore.getEvent('reportIssue'),
      reportIssueOnStartup: SettingStore.getSetting('reportIssueOnStartup')
    };
  }

  componentDidMount() {
    if (this.state.reportIssueOnStartup &&
      this.state.selectedTeamId === this.props.teamId) {
      EventActions.reportIssue();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let {selectedTeamId, team} = this.state;

    this.teamSelected.onNext(selectedTeamId);

    if (selectedTeamId === this.props.teamId) {
      this.setBugsnagMetadata(team);
      WindowHelpers.updateDevTools(this.refs.webViewContext, prevState, this.state);

      // If the selected team has changed and a team view was in focus
      // before, focus this one instead to appear as if its the same
      // element thats in focus (if unfocused, keyboard shortcuts don't work)
      if (prevState.selectedTeamId !== selectedTeamId &&
        this.constructor.focusedTeamView !== null) {
        this.refs.webViewContext.focus();
      }
    }
  }

  getWebView() {
    return this.refs.webViewContext.getWebView();
  }

  executeJavaScriptMethod(pathToObject, ...args) {
    return this.webAppHasLoaded
      .flatMap(() => this.refs.webViewContext.executeJavaScriptMethod(pathToObject, ...args))
      .toPromise();
  }

  shouldPatchTeamURL(url) {
    return this.state.webappSrcPath && !url.includes('local_js=1') && url.includes(this.state.team.team_url);
  }

  getTeamURL(url) {
    if (this.shouldPatchTeamURL(url)) {
      return `${url}?local_js=1`;
    }
    return url;
  }

  loadTeamURL() {
    this.refs.webViewContext.loadURL(this.getTeamURL(this.state.team.team_url));
    return this.webAppHasLoaded;
  }

  downloadURL(url) {
    this.refs.webViewContext.downloadURL(url);
  }

  /**
   * Occurs when the webview dom-ready event fires. Here we set up
   * subscriptions that rely on the webview.
   */
  onWebViewLoaded() {
    this.setState({isWebViewLoaded: true});

    let teamUnloadingDisposable = new SerialDisposable();
    teamUnloadingDisposable.setDisposable(this.setupTeamUnloading());

    this.webViewDisposable = new CompositeDisposable(
      this.assignTeamIdInWebapp(),
      this.setupLoadTimeout(),
      teamUnloadingDisposable,
      this.handleTeamIdleTimeoutChanged(teamUnloadingDisposable)
    );

    this.disposables.add(this.webViewDisposable);
  }

  /**
   * Occurs when the webapp `didFinishLoading` signal fires.
   */
  onWebappLoaded() {
    this.webAppHasLoaded.onNext(true);
    this.webAppHasLoaded.onCompleted();

    this.focusPrimaryTeamEvent();

    this.downloadManager = this.downloadManager || new DownloadManager({teamView: this});
    this.webViewDisposable.add(new Disposable(() => {
      if (this.downloadManager) this.downloadManager.dispose();
      this.downloadManager = null;
    }));
  }

  onRedirect(e) {
    if (this.shouldPatchTeamURL(e.newURL)) {
      this.refs.webViewContext.loadURL(this.getTeamURL(e.newURL));
    }
  }

  onWebViewError({errorCode, errorDescription, validatedURL}) {
    logger.error(`WebView failed to load ${validatedURL} with ${errorCode}: ${errorDescription}`);

    if (validatedURL.startsWith(this.state.team.team_url)) {
      logger.warn('Team failed to load, issuing refresh');
      this.refs.webViewContext.reload();
    }
  }

  refreshTeamEvent({teamId}) {
    if (teamId !== this.props.teamId) return;
    this.loadTeamURL();
  }

  reloadEvent({everything}) {
    if (!everything &&
      remote.getCurrentWindow().isFocused() &&
      this.state.selectedTeamId === this.props.teamId) {
      this.disposables.remove(this.webViewDisposable);
      this.refs.webViewContext.reload();
    }
  }

  showWebappDialogEvent({dialogType}) {
    if (this.state.selectedTeamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.openDialog', dialogType);
    }
  }

  focusPrimaryTeamEvent() {
    if (!this.state.isShowingLoginDialog &&
      this.state.selectedTeamId === this.props.teamId) {
      this.refs.webViewContext.focus();
    }
  }

  appCommandEvent({command}) {
    if (this.state.selectedTeamId === this.props.teamId) {
      switch (command) {
      case 'browser-backward':
        this.refs.webViewContext.goToOffset(-1);
        break;
      case 'browser-forward':
        this.refs.webViewContext.goToOffset(1);
        break;
      }
    }
  }

  editingCommandEvent({command}) {
    if (this.state.selectedTeamId === this.props.teamId) {
      switch (command) {
      case 'find':
        this.executeJavaScriptMethod('TSSSB.searchForTxt', clipboard.readText(FIND_PASTEBOARD_NAME))
          .catch((err) => logger.warn(`searchForTxt failed: ${err.message}`));
        break;
      case 'use-selection-for-find':
        this.executeJavaScriptMethod('TSSSB.getSelectedInputTxt')
          .then((text) => clipboard.writeText(text, FIND_PASTEBOARD_NAME))
          .catch((err) => logger.warn(`getSelectedInputTxt failed: ${err.message}`));
        break;
      }
    }
  }

  /**
   * When a notification is clicked, check if its `teamId` matches this team
   * and if so, tell the webapp to switch to the appropriate channel.
   *
   * @param  {type} {teamId  Identifies the team for this event
   * @param  {type} channel} Identifies the channel of the notification
   */
  clickNotificationEvent({teamId, channel}) {
    if (teamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.focusTabAndSwitchToChannel', channel);
    }
  }

  /**
   * Occurs when the user replies to a notification.
   *
   * @param  {String} {teamId       Identifies the team for this event
   * @param  {String} channel       Identifies the channel for the reply
   * @param  {String} response      The text the user replied with
   * @param  {String} inReplyToId}  The ID of the message being replied to
   */
  replyToNotificationEvent({teamId, channel, response, inReplyToId}) {
    if (teamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.sendMsgFromUser', channel, response, inReplyToId);
    }
  }

  /**
   * Focuses the existing Report Issue window or creates a new one.
   */
  reportIssueEvent() {
    let {selectedTeamId, team, reportIssueWindow} = this.state;
    if (selectedTeamId !== this.props.teamId) return;

    if (reportIssueWindow) {
      let browserWindow = remote.BrowserWindow.fromId(reportIssueWindow.id);
      WindowHelpers.bringToForeground(browserWindow);
    } else {
      this.createReportIssueWindow(team.team_url);
    }
  }

  /**
   * Delegate to the main process to create a popup window pointed at our Help
   * request URL.
   */
  createReportIssueWindow(teamUrl) {
    ipcRenderer.send('create-webapp-window', {
      url: require('url').resolve(teamUrl, 'help/requests/new'),
      userAgent: getUserAgent(),
      parentInfo: getSenderIdentifier(),
      windowType: REPORT_ISSUE_WINDOW_TYPE,
      isPopupWindow: true,
      width: 800,
      height: 900
    });
  }

  /**
   * Sets some metadata on Bugsnag errors that we can search for.
   *
   * @param  {Object} team The currently selected team
   */
  setBugsnagMetadata(team) {
    if (global.Bugsnag) {
      if (!global.Bugsnag.user) {
        logger.info(`Bugsnag user: ${team.id}`);
      }

      global.Bugsnag.user = {
        id: team.id,
        name: team.team_name
      };

      global.Bugsnag.metaData = {
        team: _.omit(team, 'theme', 'icons', 'unreadHighlights', 'unreads', 'initials', 'user_id')
      };
    }
  }

  /**
   * For actions broadcast from a single webview to all listeners, the webview
   * sometimes needs an identifier. So we define a global ID.
   */
  assignTeamIdInWebapp() {
    let command = `window.teamId = \"${this.props.teamId}\"`;

    return Observable.fromPromise(this.refs.webViewContext.executeJavaScript(command))
      .retryAtIntervals()
      .catch((e) => {
        logger.error(`Unable to set teamId: ${e.message}`);
        return Observable.return(false);
      })
      .subscribe();
  }

  /**
   * Waits for the webapp to load for a set amount of time and issue a page
   * reload if it doesn't make it.
   *
   * @param  {Number} waitTime  The amount of time, in seconds, to wait
   * @return {Disposable}       A Disposable that will disconnect this event
   */
  setupLoadTimeout(waitTime = 80) {
    return this.webAppHasLoaded.map(() => true)
      .timeout(waitTime * 1000)
      .catch(Observable.return(false))
      .where((x) => x === false)
      .do(() => logger.warn(`Took over ${waitTime} seconds to load, refreshing`))
      .subscribe(EventActions.reloadMainWindow);
  }

  /**
   * Handles loading and unloading of teams that remain inactive for some
   * duration.
   *
   * @param  {Number} timeout   Number of seconds before a team is considered inactive
   * @return {Disposable}       A Disposable that will clean up this subscription
   */
  setupTeamUnloading(timeout = DEFAULT_TEAM_IDLE_TIMEOUT) {
    let distinctTeam = this.teamSelected.distinctUntilChanged();
    let teamSelected = distinctTeam.where((teamId) => teamId === this.props.teamId);
    let teamUnselected = distinctTeam.where((teamId) => teamId !== this.props.teamId);

    return new CompositeDisposable(
      this.unloadTeamWhenInactive(teamSelected, teamUnselected, timeout),
      this.restoreTeamOn(teamSelected)
    );
  }

  /**
   * When a team is unselected, start a timer that will unload the team unless
   * it is selected within that duration.
   *
   * @param  {Observable} teamSelected    Fires when this team is selected
   * @param  {Observable} teamUnselected  Fires when this team is unselected
   * @param  {Number}     timeout         Number of seconds before a team is considered inactive
   * @return {Disposable}                 A Disposable that will clean up this subscription
   */
  unloadTeamWhenInactive(teamSelected, teamUnselected, timeout) {
    return teamUnselected.map(() => Observable.timer(timeout * 1000))
      .switch()
      .takeUntil(teamSelected)
      .repeat()
      .where(() => !this.state.isUnloaded)
      .flatMap(() => this.executeJavaScriptMethod('TSSSB.unloadTeam'))
      .catch((error) => {
        logger.warn(`TSSSB.unloadTeam failed: ${error.message}`);
        return Observable.return(false);
      })
      .where((wasUnloaded) => {
        if (wasUnloaded) logger.info(`Unloaded team ${this.state.team.team_name}`);
        else logger.info(`${this.state.team.team_name} does not support unloading`);
        return wasUnloaded;
      })
      .subscribe(() => {
        // NB: Reset `didFinishLoading`, as subsequent JavaScript executions
        // will need to wait for the webapp to load again.
        this.webAppHasLoaded = new AsyncSubject();
        this.setState({isUnloaded: true});
      });
  }

  /**
   * When an unloaded team is selected, reload the full webapp.
   *
   * @param  {Observable} shouldRestore An Observable that fires when the team should be restored
   * @return {Disposable}               A Disposable that will clean up this subscription
   */
  restoreTeamOn(shouldRestore) {
    return shouldRestore.where(() => this.state.isUnloaded)
      .do(() => logger.info(`Restoring team ${this.state.team.team_name}`))
      .flatMap(() => this.executeJavaScriptMethod('MW.loadTeam'))
      .catch((error) => {
        logger.error(`MW.loadTeam failed: ${error.message}`);
        return Observable.return(false);
      })
      .subscribe(() => this.setState({isUnloaded: false}));
  }

  /**
   * The team idle timeout is configurable by the webapp. When it changes, we
   * swap the old subscription out with a new one.
   *
   * @param  {SerialDisposable} disp  Holds the existing subscription
   * @return {Disposable}             A Disposable that will clean up this subscription
   */
  handleTeamIdleTimeoutChanged(disp) {
    return Observable.fromEvent(this.getWebView(), 'ipc-message')
      .where(({channel}) => channel === TEAM_IDLE_TIMEOUT)
      .subscribe(({args}) => {
        let [timeout] = args;
        disp.setDisposable(this.setupTeamUnloading(timeout));
      });
  }

  /**
   * Track whether a team view is in focus or not, since we need to track this
   * when we switch teams, to maintain the focus on the new team rather than
   * the old focused team.
   */
  static focusedTeamView = null;

  onFocus() {
    this.constructor.focusedTeamView = this.props.teamId;
  }

  onBlur() {
    if (this.constructor.focusedTeamView === this.props.teamId)
      this.constructor.focusedTeamView = null;
  }

  render() {
    let webViewOptions = {
      src: this.getTeamURL(this.state.team.team_url),
      onFocus: this.onFocus.bind(this),
      onBlur: this.onBlur.bind(this)
    };

    let webViewContext = null;

    if (this.props.loadWebView ||
      this.state.isWebViewLoaded ||
      this.state.selectedTeamId === this.props.teamId) {
      webViewContext = (
        <WebViewContext
          options={webViewOptions}
          onPageLoad={this.onWebViewLoaded.bind(this)}
          onWebappLoad={this.onWebappLoaded.bind(this)}
          onPageError={this.onWebViewError.bind(this)}
          onRedirect={this.onRedirect.bind(this)}
          ref="webViewContext"/>
      );
    }

    // Show a loading screen during load, or an error page if something went wrong
    let preloadOverlay;
    if (!this.state.isWebViewLoaded) {
      preloadOverlay = <LoadingScreen className="TeamView-preload"/>;
    } else {
      preloadOverlay = null;
    }

    return (
      <div className="TeamView">
        <ReactCSSTransitionGroup
          transitionName="anim"
          transitionEnter={false}
          transitionAppearTimeout={500}
          transitionLeaveTimeout={200}>
          {preloadOverlay}
        </ReactCSSTransitionGroup>
        {webViewContext}
      </div>
    );
  }
}
