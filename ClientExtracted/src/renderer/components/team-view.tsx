/**
 * @module RendererComponents
 */ /** for typedoc */

import * as theURL from 'url';
import * as assignIn from 'lodash.assignin';
import { clipboard, remote } from 'electron';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { executeJavaScriptMethod } from 'electron-remote';

import * as profiler from '../../utils/profiler';
import { logger } from '../../logger';
import { omit } from '../../utils/omit';
import '../../custom-operators';

import { appTeamsActions } from '../../actions/app-teams-actions';
import { appTeamsStore } from '../../stores/app-teams-store';
import { Component } from '../../lib/component';
import { DownloadManager } from './download-manager';
import { dialogStore } from '../../stores/dialog-store';
import { eventStore, StoreEvent } from '../../stores/event-store';
import { LoadingScreen } from './loading-screen';
import { settingStore } from '../../stores/setting-store';
import { teamActions } from '../../actions/team-actions';
import { teamStore } from '../../stores/team-store';
import { WebViewContext } from './web-view-ctx';
import { windowStore } from '../../stores/window-store';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';
import { CALLS_WINDOW_TYPES } from '../../utils/shared-constants';

import * as React from 'react'; // tslint:disable-line
import { getInstanceUuid } from '../../uuid';

const LOCAL_WEBAPP_ASSETS_PARAM = 'local_assets';
const RELOAD_RETRIES = 5;

let hasStoppedProfiling = !profiler.shouldProfile();

export interface TeamViewProps {
  teamId: string;
  loadWebView: boolean;
  loadMinWeb: boolean;
}

export interface TeamViewState {
  team: any;
  selectedTeamId: string;
  isShowingLoginDialog: boolean;
  isDevMode: boolean;
  webappSrcPath: string;
  webappParams: object;
  showWebappDialogEvent: StoreEvent;
  clickNotificationEvent: StoreEvent;
  replyToNotificationEvent: StoreEvent;
  mainWindowFocusedEvent: StoreEvent;
  appCommandEvent: StoreEvent;
  editingCommandEvent: StoreEvent;
  refreshTeamEvent: StoreEvent;
  refreshTeamsEvent: StoreEvent;
  reloadEvent: StoreEvent;
  reportCrashTelemetryEvent: StoreEvent;
  isWebViewLoaded: boolean;
  hasConnectionTrouble: boolean;
  isTeamUnloaded: boolean;
}

export interface NotificationClickArgs {
  teamId: string;
  channel: string;
  messageId: string;
  threadTimestamp: string;
}

export interface NotificationReplyArgs extends NotificationClickArgs {
  response: string;
}

export class TeamView extends Component<TeamViewProps, Partial<TeamViewState>> {
  private readonly issueReload = new Subject<void>();
  private _webAppHasLoaded = new AsyncSubject<boolean>();
  public get webAppHasLoaded() {
    return this._webAppHasLoaded.asObservable();
  }
  private downloadManager: DownloadManager;

  private webViewElement: WebViewContext;
  private readonly refHandlers = {
    webView: (ref: WebViewContext) => this.webViewElement = ref
  };

  private readonly eventHandlers = {
    onPageLoad: () => this.onWebViewLoaded(),
    onWebappLoad: () => this.onWebappLoaded(),
    onPageEmptyAfterLoad: (webViewURL: string) => this.onWebViewEmpty(webViewURL),
    onRedirect: (e: HashChangeEvent) => this.onRedirect(e),
    onPageError: ({ errorCode, errorDescription, validatedURL }: {
      errorCode: number, errorDescription: string, validatedURL: string
    }) => this.onWebViewError({ errorCode, errorDescription, validatedURL }),
  };

  constructor(props: TeamViewProps) {
    super(props);
    this.state = assignIn({
      isWebViewLoaded: false,
      isTeamUnloaded: props.loadMinWeb
    }, this.state);
  }

  public syncState(): Partial<TeamViewState> {
    return {
      team: teamStore.getTeam(this.props.teamId),
      selectedTeamId: appTeamsStore.getSelectedTeamId(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog(),
      isDevMode: settingStore.getSetting<boolean>('isDevMode'),
      webappSrcPath: settingStore.getSetting<string>('webappSrcPath'),
      webappParams: settingStore.getSetting<object>('webappParams'),

      showWebappDialogEvent: eventStore.getEvent('showWebappDialog'),
      clickNotificationEvent: eventStore.getEvent('clickNotification'),
      replyToNotificationEvent: eventStore.getEvent('replyToNotification'),
      mainWindowFocusedEvent: eventStore.getEvent('mainWindowFocused'),
      appCommandEvent: eventStore.getEvent('appCommand'),
      editingCommandEvent: eventStore.getEvent('editingCommand'),
      refreshTeamEvent: eventStore.getEvent('refreshTeam'),
      refreshTeamsEvent: eventStore.getEvent('refreshTeams'),
      reloadEvent: eventStore.getEvent('reload'),
      reportCrashTelemetryEvent: eventStore.getEvent('reportCrashTelemetry')
    };
  }

  public componentDidMount(): void {
    this.disposables.add(this.showConnectionTroubleAfterMultipleReloads());
  }

  public componentDidUpdate(_prevProps: TeamViewProps, prevState: TeamViewState) {
    const { selectedTeamId, team, isShowingLoginDialog } = this.state;

    if (selectedTeamId === this.props.teamId) {
      this.setBugsnagMetadata(team);

      // Make sure we focus the newly visible WebView
      if (prevState.selectedTeamId !== selectedTeamId ||
        (prevState.isShowingLoginDialog && !isShowingLoginDialog)) {
        this.focus();
      }
    }
  }

  /**
   * Executes some JavaScript code inside the team's {WebViewContext}.
   *
   * @param  {string} code  The code to execute
   * @return {Promise<any>} The result of the code
   */
  public executeJavaScript(code: string): Promise<any> {
    return this._webAppHasLoaded
      .flatMap(() => this.webViewElement.executeJavaScript(code))
      .toPromise();
  }

  /**
   * Executes an interop method on the appropriate webapp global, given the
   * current state of the team. If unloaded, use min-web, otherwise use the
   * full TSSSB object.
   *
   * @returns {Promise<any>}
   */
  public executeInteropMethod(method: string, ...args: Array<any>): Promise<any> {
    const interopGlobal = this.isTeamUnloaded() ? 'MW' : 'TSSSB';
    const pathToObject = `${interopGlobal}.${method}`;

    return this._webAppHasLoaded
      .flatMap(() => this.webViewElement.executeJavaScriptMethod(pathToObject, ...args))
      .toPromise();
  }

  /**
   * Executes a JavaScript method inside the team view's <WebView>.
   *
   * @param {string} pathToObject - Path to the method to be called
   * @param {any} ...args - Arguments passed on to the method
   */
  public executeJavaScriptMethod(pathToObject: string, ...args: Array<any>): Promise<any> {
    return this._webAppHasLoaded
      .flatMap(() => this.webViewElement.executeJavaScriptMethod(pathToObject, ...args))
      .toPromise();
  }

  public downloadURL(url: string): void {
    if (this.webViewElement) {
      this.webViewElement.downloadURL(url);
    } else {
      logger.warn(`Tried to download url, but webViewElement is not ready`);
    }
  }

  public focus(): void {
    if (!!this.webViewElement) {
      this.webViewElement.focus();
    } else {
      logger.warn('Tried to focus, but webViewElement is not ready');
    }
  }

  public refreshTeamEvent({ teamId }: {teamId: string}): void {
    if (teamId === this.props.teamId) this.loadTeamURL();
  }

  public refreshTeamsEvent({ teamIds }: {teamIds: Array<string>}): void {
    if (teamIds.includes(this.props.teamId)) this.loadTeamURL();
  }

  public reloadEvent({ everything }: {everything: boolean}): void {
    // Check if reload target
    if (everything ||
      !remote.getCurrentWindow().isFocused() ||
      this.state.selectedTeamId !== this.props.teamId) return;

    if (this.isCallActive()) {
      this.reloadWithActiveCall();
    } else {
      this.webViewElement.reload();
    }
  }

  public reportCrashTelemetryEvent({ count }: {count: number}): void {
    if (this.state.selectedTeamId === this.props.teamId) {
      this.executeJavaScriptMethod(`TS.clog.track`, 'DESKTOP_CRASH', { instanceUid: getInstanceUuid(), crashes: count });
    }
  }

  public showWebappDialogEvent({ dialogType }: {dialogType: string}): Promise<string> {
    if (this.state.selectedTeamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.openDialog', dialogType);
    }
    return Promise.resolve('');
  }

  public mainWindowFocusedEvent(): void {
    if (!this.state.isShowingLoginDialog &&
      this.state.selectedTeamId === this.props.teamId) {
      this.focus();
    }
  }

  public appCommandEvent({ command }: {command: string}): void {
    if (this.state.selectedTeamId === this.props.teamId) {
      switch (command) {
      case 'browser-backward':
        this.webViewElement.goToOffset(-1);
        break;
      case 'browser-forward':
        this.webViewElement.goToOffset(1);
        break;
      }
    }
  }

  /**
   * Handles the Find and Use Selection for Find commands.
   *
   * @param  {String} {command}   The type of command being handled
   */
  public editingCommandEvent({ command }: {command: string}): void {
    if (this.state.selectedTeamId === this.props.teamId) {
      switch (command) {
      case 'find':
        this.executeJavaScriptMethod('TSSSB.searchForTxt', clipboard.readFindText())
          .catch((err) => logger.warn(`TeamView: searchForTxt failed.`, err));
        break;
      case 'use-selection-for-find':
        this.executeJavaScriptMethod('TSSSB.getSelectedInputTxt')
          .then((text) => clipboard.writeFindText(text))
          .catch((err) => logger.warn(`TeamView: getSelectedInputTxt failed.`, err));
        break;
      }
    }
  }

  /**
   * When a notification is clicked, check if its `teamId` matches this team
   * and if so, tell the webapp to switch to the appropriate channel.
   *
   * @param  {NotificationClickArgs} clickArgs   Contains arguments to pass through
   */
  public async clickNotificationEvent(clickArgs: NotificationClickArgs): Promise<void> {
    if (clickArgs.teamId === this.props.teamId) {
      const { teamId, channel, messageId, threadTimestamp } = clickArgs;
      const method = this.isTeamUnloaded() ?
        'MW.setClientPathForNotificationClick' :
        'TSSSB.focusTabAndSwitchToChannel';

      try {
        logger.info(`TeamView: Dispatching click notification event to webapp.`);
        logger.debug('TeamView: Dispath details', method, channel, messageId, threadTimestamp);
        await this.executeJavaScriptMethod(method, channel, messageId, threadTimestamp);
      } catch (err) {
        logger.warn(`TeamView: ${method}(${channel}) failed.`, err);
      }

      appTeamsActions.selectTeam(teamId);
    }
  }

  /**
   * Occurs when the user replies to a notification.
   *
   * @param  {NotificationReplyArgs} replyArgs  Contains arguments to pass through
   */
  public async replyToNotificationEvent(replyArgs: NotificationReplyArgs): Promise<void> {
    if (replyArgs.teamId === this.props.teamId) {
      try {
        const { channel, response, messageId, threadTimestamp } = replyArgs;
        await this.executeInteropMethod('sendMsgFromUser', channel, response, messageId, threadTimestamp);
      } catch (err) {
        logger.warn('TeamView: sendMsgFromUser failed.', err);
      }
    }
  }

  /**
   * Returns true if this team was loaded directly into /min or if it was
   * unloaded due to inactivity.
   *
   * @return {Boolean}  True if the team is unloaded, false otherwise
   */
  public isTeamUnloaded(): boolean {
    return this.state.isTeamUnloaded!;
  }

  /**
   * Once the team has been unloaded, reset the loaded signal and take note of
   * it in our state.
   *
   * @param  {Boolean} isTeamUnloaded True if the team is unloaded, false otherwise
   */
  public setTeamUnloaded(isTeamUnloaded: boolean): void {
    this._webAppHasLoaded = new AsyncSubject();
    this.setState({ isTeamUnloaded });
  }

  /**
   * Checks whether a call is currently active.
   *
   * @returns {boolean}   Whether or not a call is active
   */
  public isCallActive(): boolean {
    return window.localStorage.getItem('deviceStorage_isCallWindowBusy') === 'true';
  }

  /**
   * Checks whether a call window is open that belongs to this team.
   *
   * @returns {boolean}   Whether or not a call is active
   */
  public isCallActiveForTeam(): boolean {
    if (!this.isCallActive()) return false;

    const windowMetadata = windowStore.getWindowsForTeam(this.props.teamId);
    return Object.keys(windowMetadata)
      .some((windowId) => CALLS_WINDOW_TYPES.includes(windowMetadata[windowId].subType));
  }

  public getTeamName(): string {
    return this.state.team.team_name;
  }

  public render(): JSX.Element | null {
    const { team, selectedTeamId, isWebViewLoaded, hasConnectionTrouble } = this.state;
    if (!team || (team && !team.team_url)) {
      logger.warn(`Team url is missing in state, cannot render team view`, this.state);
      return null;
    }

    const webViewOptions = {
      src: this.getTeamURL(team.team_url)
    };

    let webViewContext = null;

    if (this.props.loadWebView ||
      isWebViewLoaded ||
      selectedTeamId === this.props.teamId) {
      webViewContext = (
        <WebViewContext
          options={webViewOptions}
          id={this.props.teamId}
          onPageLoad={this.eventHandlers.onPageLoad}
          onWebappLoad={this.eventHandlers.onWebappLoad}
          onPageError={this.eventHandlers.onPageError}
          onPageEmptyAfterLoad={this.eventHandlers.onPageEmptyAfterLoad}
          onRedirect={this.eventHandlers.onRedirect}
          ref={this.refHandlers.webView}
        />
      );
    }

    // Show the Connecting screen during load, or an error page when something
    // goes wrong.
    let preloadOverlay = null;
    if (!isWebViewLoaded && selectedTeamId === this.props.teamId) {
      preloadOverlay = (
        <LoadingScreen
          className='TeamView-preload'
          hasConnectionTrouble={hasConnectionTrouble}
        />
      );
    }

    return (
      <div className='TeamView'>
        <ReactCSSTransitionGroup
          transitionName='anim'
          transitionEnter={false}
          transitionAppearTimeout={500}
          transitionLeaveTimeout={200}
        >
          {preloadOverlay}
        </ReactCSSTransitionGroup>
        {webViewContext}
      </div>
    );
  }

  private issueReloadWithReason(reason: string, ...meta: Array<any>): void {
    logger.error(reason, ...meta);
    this.issueReload.next();
  }

  /**
   * Occurs when the webview dom-ready event fires. Here we set up
   * subscriptions that rely on the webview.
   */
  private onWebViewLoaded(): void {
    this.setState({ isWebViewLoaded: true });

    if (!this.state.team.id) this.patchUserIdFromWebapp();

    const sub = new Subscription();
    sub.add(this.assignTeamIdInWebapp());
    sub.add(this.setupLoadTimeout());
    this.disposables.add(sub);
  }

  /**
   * Occurs when the webapp `didFinishLoading` signal fires.
   */
  private onWebappLoaded(): void {
    logger.info(`Webapp finished loading`);

    this._webAppHasLoaded.next(true);
    this._webAppHasLoaded.complete();

    if (this.downloadManager) this.downloadManager.dispose();
    this.downloadManager = new DownloadManager({ teamView: this });

    if (hasStoppedProfiling) return;
    hasStoppedProfiling = true;
    if (profiler.shouldProfile()) profiler.stopProfiling('renderer');
  }

  private onRedirect(e: HashChangeEvent): void {
    const url = e.newURL;
    if (!!url) {
      if (this.shouldPatchTeamURL(url)) {
        this.webViewElement.loadURL(this.getTeamURL(url));
      }
    } else {
      logger.warn(`HashChangedEvent doesn't carry correct url, cannot redirect`, e);
    }
  }

  private shouldPatchTeamURL(url: string): boolean {
    return !!this.state.webappSrcPath &&
      !url.includes(`${LOCAL_WEBAPP_ASSETS_PARAM}=1`) &&
      url.includes(this.state.team.team_url);
  }

  /**
   * Constructs the real client URL to /min or /messages and optionally append
   * query parameters.
   *
   * @param url The original team URL
   */
  private getTeamURL(url: string): string {
    const clientUrl = this.props.loadMinWeb ?
      theURL.resolve(url, 'min') :
      theURL.resolve(url, 'messages');

    const query = this.state.webappParams || {};
    if (this.shouldPatchTeamURL(url)) {
      query[LOCAL_WEBAPP_ASSETS_PARAM] = 1;
    }

    return Object.keys(query).length > 0 ?
      theURL.format({ ...theURL.parse(clientUrl), query }) :
      clientUrl;
  }

  /**
   * Occurs when some error happened within the webapp.
   *
   * @param  {Number} {errorCode       The underlying Chromium error code
   * @param  {String} errorDescription A string describing the error
   * @param  {String} validatedURL}    The URL where the error occurred
   */
  private onWebViewError({ errorCode, errorDescription, validatedURL }: {
    errorCode: number, errorDescription: string, validatedURL: string
  }): void {
    if (validatedURL.startsWith(this.state.team.team_url)) {
      this.issueReloadWithReason(`WebView ${validatedURL} failed to load, issuing refresh.`, { errorCode, errorDescription });
    } else {
      logger.info(`WebView ${validatedURL} encountered error, but not team url - not issuing refresh.`, { errorCode, errorDescription });
    }
  }

  private onWebViewEmpty(webViewURL: string) {
    const isTeamUnloading = webViewURL.startsWith(theURL.resolve(this.state.team.team_url, 'min'));
    const isSigninURL = this.isSigninURL(webViewURL);

    if (!isSigninURL && !isTeamUnloading) {
      this.issueReloadWithReason('WebView was empty after did-stop-loading; issuing refresh.');
    } else {
      logger.info(`Determined that the webView ${webViewURL} is empty, but not issuing a refresh.`, { isSigninURL, isTeamUnloading });
    }
  }

  private isSigninURL(url: string = ''): boolean {
    return /^https:\/\/(\w*\.?)slack\.com\/(signin|signout)/.test(url);
  }

  private loadTeamURL(): Observable<boolean> {
    const team = this.state.team;
    if (!team || (team && !team.team_url)) {
      logger.warn(`Team url is missing in state, cannot load team url`, this.state);
    } else if (!!this.webViewElement && !!this.webViewElement.loadURL) {
      this.webViewElement.loadURL(this.getTeamURL(this.state.team.team_url));
    }
    return this._webAppHasLoaded;
  }

  /**
   * Reloads the Window if a call is active, by asking the user first
   * and closing appropriate calls windows on confirmation.
   */
  private reloadWithActiveCall(): void {
    remote.dialog.showMessageBox({
      type: 'question',
      title: $intl.t(`Reload Slack and end call?`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      buttons: [$intl.t(`Cancel`, LOCALE_NAMESPACE.GENERAL)(), $intl.t(`Reload`, LOCALE_NAMESPACE.GENERAL)()],
      message: $intl.t(`Are you sure?`, LOCALE_NAMESPACE.MESSAGEBOX)(),
      detail: $intl.t(`Heads up! Reloading Slack will also disconnect you from the call you’re on. Are you sure you want to reload?`,
        LOCALE_NAMESPACE.GENERAL)(),
      noLink: true
    }, (result) => {
      if (result !== 0) {
        const callBrowserWindow = remote.BrowserWindow.fromId(windowStore.getCallWindow()!.id);

        executeJavaScriptMethod(callBrowserWindow, 'TS.calls.closeCall')
          .then(() => {
            this.webViewElement.reload();
          })
          .catch((e: Error) => {
            logger.warn('TeamView: Could not close call before reloading.', e);
          });
      }
    });
  }

  /**
   * Sets some metadata on Bugsnag errors that we can search for.
   *
   * @param  {Object} team The currently selected team
   */
  private setBugsnagMetadata(team: any): void {
    if (global.Bugsnag) {
      if (!global.Bugsnag.user) {
        logger.info(`TeamView: Bugsnag user: ${team.id}`);
      }

      global.Bugsnag.user = {
        id: getInstanceUuid(),
        name: `${team.id}:${team.team_name}`
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
  private assignTeamIdInWebapp(): Subscription {
    const command = `window.teamId = \"${this.props.teamId}\"`;

    return Observable.fromPromise(this.webViewElement.executeJavaScript(command))
      .retryAtIntervals()
      .catch((e) => {
        logger.error(`TeamView: Unable to set teamId.`, e);
        return Observable.of(false);
      })
      .subscribe();
  }

  /**
   * After a migration from the legacy Mac app, some team properties might not
   * be set. If we don't find a user ID associated with a team, for example, we
   * look it up in the webapp and add it to our model.
   */
  private async patchUserIdFromWebapp(): Promise<void> {
    try {
      const userId = await this.executeJavaScriptMethod('TS.model.user.id');
      if (userId) teamActions.updateUserId(userId, this.props.teamId);
    } catch (e) {
      logger.error('TeamView: Unable to patch userId', e);
    }
  }

  /**
   * Waits for the webapp to load for a set amount of time and issue a page
   * reload if it doesn't make it.
   *
   * @param  {Number} waitTime  The amount of time, in seconds, to wait
   * @return {Subscription}     A Subscription that will disconnect this listener
   */
  private setupLoadTimeout(waitTime: number = 80): Subscription {
    return this._webAppHasLoaded.mapTo(true)
      .timeout(waitTime * 1000)
      .catch(() => Observable.of(false))
      .filter((x) => x === false)
      .subscribe(() => logger.warn(`TeamView: Took over ${waitTime} seconds to load.`));
  }

  /**
   * Monitor webView reloads as a result of page failures to make sure we don't
   * get caught in a reload loop.
   */
  private showConnectionTroubleAfterMultipleReloads(): Subscription {
    return this.issueReload
      .takeWhile((_, idx) => idx < RELOAD_RETRIES)
      .subscribe(() => this.webViewElement.reload(),
        (err) => logger.warn('TeamView: Unable to reload.', err),
        () => this.setState({
          isWebViewLoaded: false,
          hasConnectionTrouble: true
        })
      );
  }
}
