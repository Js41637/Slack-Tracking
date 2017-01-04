import * as theURL from 'url';
import assignIn from 'lodash.assignin';
import {clipboard, remote} from 'electron';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {AsyncSubject} from 'rxjs/AsyncSubject';

import profiler from '../../utils/profiler';
import {logger} from '../../logger';
import {omit} from '../../utils/omit';
import '../../custom-operators';

import {appTeamsActions} from '../../actions/app-teams-actions';
import AppTeamsStore from '../../stores/app-teams-store';
import Component from '../../lib/component';
import DownloadManager from './download-manager';
import {dialogStore} from '../../stores/dialog-store';
import {eventActions} from '../../actions/event-actions';
import EventStore from '../../stores/event-store';
import LoadingScreen from './loading-screen';
import {settingStore} from '../../stores/setting-store';
import {teamActions} from '../../actions/team-actions';
import TeamStore from '../../stores/team-store';
import WebViewContext from './web-view-ctx';
import {WindowHelpers} from '../../components/helpers/window-helpers';

const LOCAL_WEBAPP_ASSETS_PARAM = 'local_assets';
let hasStoppedProfiling = !profiler.shouldProfile();

export default class TeamView extends Component {
  static propTypes = {
    teamId: React.PropTypes.string.isRequired,
    loadWebView: React.PropTypes.bool,
    loadMinWeb: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = assignIn({
      isWebViewLoaded: false,
      isTeamUnloaded: props.loadMinWeb
    }, this.state);

    this.webAppHasLoaded = new AsyncSubject();
  }

  syncState() {
    return {
      team: TeamStore.getTeam(this.props.teamId),
      selectedTeamId: AppTeamsStore.getSelectedTeamId(),
      isShowingDevTools: dialogStore.isShowingDevTools(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),
      isDevMode: settingStore.getSetting('isDevMode'),
      webappSrcPath: settingStore.getSetting('webappSrcPath'),

      showWebappDialogEvent: EventStore.getEvent('showWebappDialog'),
      clickNotificationEvent: EventStore.getEvent('clickNotification'),
      replyToNotificationEvent: EventStore.getEvent('replyToNotification'),
      mainWindowFocusedEvent: EventStore.getEvent('mainWindowFocused'),
      appCommandEvent: EventStore.getEvent('appCommand'),
      editingCommandEvent: EventStore.getEvent('editingCommand'),
      refreshTeamEvent: EventStore.getEvent('refreshTeam'),
      refreshTeamsEvent: EventStore.getEvent('refreshTeams'),
      reloadEvent: EventStore.getEvent('reload')
    };
  }

  componentDidUpdate(prevProps, prevState) {
    let {selectedTeamId, team, isShowingLoginDialog} = this.state;

    if (selectedTeamId === this.props.teamId) {
      this.setBugsnagMetadata(team);
      WindowHelpers.updateDevTools(this.refs.webViewContext, prevState, this.state);

      // Make sure we focus the newly visible WebView
      if (prevState.selectedTeamId !== selectedTeamId ||
        (prevState.isShowingLoginDialog && !isShowingLoginDialog)) {
        this.focus();
      }
    }
  }

  getWebView() {
    return this.refs.webViewContext.getWebView();
  }

  /**
   * Executes some JavaScript code inside the team's {WebViewContext}.
   *
   * @param  {string} code  The code to execute
   * @return {Promise<any>} The result of the code
   */
  executeJavaScript(code) {
    return this.webAppHasLoaded
      .flatMap(() => this.refs.webViewContext.executeJavaScript(code))
      .toPromise();
  }

  /**
   * Executes an interop method on the appropriate webapp global, given the
   * current state of the team. If unloaded, use min-web, otherwise use the
   * full TSSSB object.
   *
   * @returns {Observable}
   */
  executeInteropMethod(method, ...args) {
    const interopGlobal = this.isTeamUnloaded() ? 'MW' : 'TSSSB';
    const pathToObject = `${interopGlobal}.${method}`;

    return this.webAppHasLoaded
      .flatMap(() => this.refs.webViewContext.executeJavaScriptMethod(pathToObject, ...args));
  }

  /**
   * Executes a JavaScript method inside the team view's <WebView>.
   *
   * @param {string} pathToObject - Path to the method to be called
   * @param {any} ...args - Arguments passed on to the method
   */
  executeJavaScriptMethod(pathToObject, ...args) {
    return this.webAppHasLoaded
      .flatMap(() => this.refs.webViewContext.executeJavaScriptMethod(pathToObject, ...args))
      .toPromise();
  }

  /**
   * `executeJavaScriptMethod`, but with patience. Checks if `pathToObject` is reachable.
   * If it isn't, it'll keep checking at 250ms intervals for up to one minute.
   *
   * @param {string} pathToObject - Path to the method to be called
   * @param {any} ...args - Arguments passed on to the method
   * @returns {Promise}
   */
  executeJavaScriptMethodWhenBooted(pathToObject, ...args) {
    return this.webAppHasLoaded
      .flatMap(() => this.refs.webViewContext.executeJavaScriptMethodWhenBooted(pathToObject, ...args))
      .toPromise();
  }

  shouldPatchTeamURL(url) {
    return this.state.webappSrcPath &&
      !url.includes(`${LOCAL_WEBAPP_ASSETS_PARAM}=1`) &&
      url.includes(this.state.team.team_url);
  }

  getTeamURL(url) {
    if (this.shouldPatchTeamURL(url)) {
      return `${url}?${LOCAL_WEBAPP_ASSETS_PARAM}=1`;
    }

    return this.props.loadMinWeb ?
      theURL.resolve(url, 'min') :
      theURL.resolve(url, 'messages');
  }

  isSigninURL(url = '') {
    return url.startsWith(theURL.resolve(this.state.team.team_url, 'signin')) ||
      url.startsWith(theURL.resolve(this.state.team.team_url, 'signout'));
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

    if (!this.state.team.id) this.patchUserIdFromWebapp();

    const sub = new Subscription();
    sub.add(this.assignTeamIdInWebapp());
    sub.add(this.setupLoadTimeout());
    this.disposables.add(sub);
  }

  /**
   * Occurs when the webapp `didFinishLoading` signal fires.
   */
  onWebappLoaded() {
    this.webAppHasLoaded.next(true);
    this.webAppHasLoaded.complete();

    if (this.downloadManager) this.downloadManager.dispose();
    this.downloadManager = new DownloadManager({teamView: this});

    if (hasStoppedProfiling) return;
    hasStoppedProfiling = true;
    if (profiler.shouldProfile()) profiler.stopProfiling('renderer');
  }

  onRedirect(e) {
    if (this.shouldPatchTeamURL(e.newURL)) {
      this.refs.webViewContext.loadURL(this.getTeamURL(e.newURL));
    }
  }

  /**
   * Occurs when some error happened within the webapp.
   *
   * @param  {Number} {errorCode       The underlying Chromium error code
   * @param  {String} errorDescription A string describing the error
   * @param  {String} validatedURL}    The URL where the error occurred
   */
  onWebViewError({errorCode, errorDescription, validatedURL}) {
    if (validatedURL.startsWith(this.state.team.team_url)) {
      this.issueReloadWithReason(`WebView failed to load ${validatedURL} with ${errorCode}: ${errorDescription}`);
    }
  }

  onWebViewEmpty(webViewURL) {
    let isTeamUnloading = webViewURL.startsWith(theURL.resolve(this.state.team.team_url, 'min'));

    if (!this.isSigninURL(webViewURL) && !isTeamUnloading) {
      this.issueReloadWithReason(`WebView was empty after did-stop-loading; issuing refresh`);
    }
  }

  issueReloadWithReason(reason) {
    logger.error(reason);
    this.refs.webViewContext.reload();
  }

  focus() {
    this.refs.webViewContext.focus();
  }

  refreshTeamEvent({teamId}) {
    if (teamId === this.props.teamId) this.loadTeamURL();
  }

  refreshTeamsEvent({teamIds}) {
    if (teamIds.includes(this.props.teamId)) this.loadTeamURL();
  }

  reloadEvent({everything}) {
    if (!everything &&
      remote.getCurrentWindow().isFocused() &&
      this.state.selectedTeamId === this.props.teamId) {
      this.refs.webViewContext.reload();
    }
  }

  showWebappDialogEvent({dialogType}) {
    if (this.state.selectedTeamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.openDialog', dialogType);
    }
  }

  mainWindowFocusedEvent() {
    if (!this.state.isShowingLoginDialog &&
      this.state.selectedTeamId === this.props.teamId) {
      this.focus();
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

  /**
   * Handles the Find and Use Selection for Find commands.
   *
   * @param  {String} {command}   The type of command being handled
   */
  editingCommandEvent({command}) {
    if (this.state.selectedTeamId === this.props.teamId) {
      switch (command) {
      case 'find':
        this.executeJavaScriptMethod('TSSSB.searchForTxt', clipboard.readFindText())
          .catch((err) => logger.warn(`searchForTxt failed: ${err.message}`));
        break;
      case 'use-selection-for-find':
        this.executeJavaScriptMethod('TSSSB.getSelectedInputTxt')
          .then((text) => clipboard.writeFindText(text))
          .catch((err) => logger.warn(`getSelectedInputTxt failed: ${err.message}`));
        break;
      }
    }
  }

  /**
   * When a notification is clicked, check if its `teamId` matches this team
   * and if so, tell the webapp to switch to the appropriate channel.
   *
   * @param  {String} {teamId     Identifies the team for this event
   * @param  {String} channel     Identifies the channel of the notification
   * @param  {String} messageId}  The ID of the message that triggered the notification
   */
  async clickNotificationEvent({teamId, channel, messageId}) {
    if (teamId === this.props.teamId) {
      const method = this.isTeamUnloaded() ?
        'MW.setClientPathByModelObId' :
        'TSSSB.focusTabAndSwitchToChannel';

      try {
        await this.executeJavaScriptMethod(method, channel, messageId);
      } catch (err) {
        logger.warn(`${method}(${channel}) failed: ${err.message}`);
      }

      appTeamsActions.selectTeam(teamId);
    }
  }

  /**
   * Occurs when the user replies to a notification. We need to use a different
   * method if the team is currently unloaded.
   *
   * @param  {String} {teamId           Identifies the team for this event
   * @param  {String} channel           Identifies the channel for the reply
   * @param  {String} response          The text the user replied with
   * @param  {String} inReplyToId       The ID of the message being replied to
   * @param  {String} threadTimestamp}  Identifies the thread this message belongs to, if any
   */
  async replyToNotificationEvent({teamId, channel, response, inReplyToId, threadTimestamp}) {
    if (teamId === this.props.teamId) {
      try {
        await this.executeInteropMethod('sendMsgFromUser', channel, response, inReplyToId, threadTimestamp)
          .toPromise();
      } catch (err) {
        logger.warn(`sendMsgFromUser failed: ${err.message}`);
      }
    }
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
        team: omit(team, 'theme', 'icons', 'unreadHighlights', 'unreads', 'initials', 'user_id')
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
        return Observable.of(false);
      })
      .subscribe();
  }

  /**
   * After a migration from the legacy Mac app, some team properties might not
   * be set. If we don't find a user ID associated with a team, for example, we
   * look it up in the webapp and add it to our model.
   */
  async patchUserIdFromWebapp() {
    try {
      let userId = await this.executeJavaScriptMethod('TS.model.user.id');
      if (userId) teamActions.updateUserId(userId, this.props.teamId);
    } catch (e) {
      logger.error(`Unable to patch userId: ${e.message}`);
    }
  }

  /**
   * Waits for the webapp to load for a set amount of time and issue a page
   * reload if it doesn't make it.
   *
   * @param  {Number} waitTime  The amount of time, in seconds, to wait
   * @return {Subscription}     A Subscription that will disconnect this listener
   */
  setupLoadTimeout(waitTime = 80) {
    return this.webAppHasLoaded.mapTo(true)
      .timeout(waitTime * 1000)
      .catch(() => Observable.of(false))
      .filter((x) => x === false)
      .do(() => logger.warn(`Took over ${waitTime} seconds to load, refreshing`))
      .subscribe(eventActions.reloadMainWindow);
  }

  /**
   * Returns true if this team was loaded directly into /min or if it was
   * unloaded due to inactivity.
   *
   * @return {Boolean}  True if the team is unloaded, false otherwise
   */
  isTeamUnloaded() {
    return this.state.isTeamUnloaded;
  }

  /**
   * Once the team has been unloaded, reset the loaded signal and take note of
   * it in our state.
   *
   * @param  {Boolean} isTeamUnloaded True if the team is unloaded, false otherwise
   */
  setTeamUnloaded(isTeamUnloaded) {
    this.webAppHasLoaded = new AsyncSubject();
    this.setState({ isTeamUnloaded });
  }

  render() {
    let webViewOptions = {
      src: this.getTeamURL(this.state.team.team_url)
    };

    let webViewContext = null;

    if (this.props.loadWebView ||
      this.state.isWebViewLoaded ||
      this.state.selectedTeamId === this.props.teamId) {
      webViewContext = (
        <WebViewContext
          options={webViewOptions}
          id={this.props.teamId}
          onPageLoad={this.onWebViewLoaded.bind(this)}
          onWebappLoad={this.onWebappLoaded.bind(this)}
          onPageError={this.onWebViewError.bind(this)}
          onPageEmptyAfterLoad={this.onWebViewEmpty.bind(this)}
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
