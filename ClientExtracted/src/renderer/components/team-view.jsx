import _ from 'lodash';
import logger from '../../logger';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Observable, Disposable, AsyncSubject} from 'rx';

import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import DownloadManager from './download-manager';
import EventStore from '../../stores/event-store';
import LoadingScreen from './loading-screen';
import SettingStore from '../../stores/setting-store';
import TeamStore from '../../stores/team-store';
import WebViewContext from './web-view-ctx';
import WindowHelpers from '../../components/helpers/window-helpers';

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

      showPreferencesEvent: EventStore.getEvent('showPreferences'),
      clickNotificationEvent: EventStore.getEvent('clickNotification'),
      replyToNotificationEvent: EventStore.getEvent('replyToNotification'),
      focusPrimaryTeamEvent: EventStore.getEvent('focusPrimaryTeam'),
      appCommandEvent: EventStore.getEvent('appCommand'),
      refreshTeamEvent: EventStore.getEvent('refreshTeam')
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedTeamId === this.props.teamId) {
      this.setBugsnagMetadata(this.state.team);
      WindowHelpers.updateDevTools(this.refs.webViewContext, prevState, this.state);

      // If the selected team has changed and a team view was in focus
      // before, focus this one instead to appear as if its the same
      // element thats in focus (if unfocused, keyboard shortcuts don't work)
      if (prevState.selectedTeamId !== this.state.selectedTeamId &&
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

  onWebViewLoaded() {
    this.setState({isWebViewLoaded: true});

    let command = `window.teamId = \"${this.props.teamId}\";`;

    this.disposables.add(Observable.fromPromise(this.refs.webViewContext.executeJavaScript(command))
      .retryWhen((errors) => this.retryWithDelayOrError(errors))
      .catch((e) => {
        logger.error(`Unable to set teamId: ${e.message}`);
        return Observable.return(false);
      })
      .subscribe());

    this.disposables.add(this.setupLoadTimeout());
  }

  onWebappLoaded() {
    this.webAppHasLoaded.onNext(true);
    this.webAppHasLoaded.onCompleted();

    this.focusPrimaryTeamEvent();

    this.downloadManager = new DownloadManager({teamView: this});
    this.disposables.add(new Disposable(() => this.downloadManager.dispose()));
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

  /**
   * Use in conjunction with `Observable.retryWhen` to retry a sequence some
   * number of times with a delay between each retry. If `maxRetries` is
   * exceeded, this sequence will error out.
   *
   * @param  {Observable} errors  An Observable sequence of errors from `retryWhen`
   * @param  {Number} maxRetries  Maximum number of times to try before throwing an error
   * @return {Observable}         An Observable sequence of retries with a delay
   */
  retryWithDelayOrError(errors, maxRetries = 3) {
    return Observable.range(1, maxRetries + 1)
      .zip(errors, (i, e) => {
        return { attempts: i, error: e };
      })
      .flatMap(({attempts, error}) => {
        return attempts <= maxRetries ?
          Observable.timer(attempts * 1000) :
          Observable.throw(error);
      });
  }

  refreshTeamEvent({teamId}) {
    if (teamId !== this.props.teamId) return;
    this.loadTeamURL();
  }

  showPreferencesEvent() {
    if (this.state.selectedTeamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.openDialog', 'prefs');
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
      .subscribe(() => this.refs.webViewContext.reload());
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
