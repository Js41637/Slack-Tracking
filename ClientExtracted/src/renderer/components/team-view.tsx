/**
 * @module RendererComponents
 */ /** for typedoc */

import { clipboard, remote } from 'electron';
import { executeJavaScriptMethod } from 'electron-remote';
import { assignIn, omit } from 'lodash';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import * as theURL from 'url';

import '../../custom-operators';
import { logger } from '../../logger';
import * as profiler from '../../utils/profiler';
import { isSlackURL } from '../../utils/url-utils';

import { eventActions } from '../../actions/event-actions';
import { Component } from '../../lib/component';
import { appTeamsStore } from '../../stores/app-teams-store';
import { StoreEvent, eventStore } from '../../stores/event-store';
import { LoadingScreen } from './loading-screen';

import { TeamBase, teamActions } from '../../actions/team-actions';
import { settingStore } from '../../stores/setting-store';
import { teamStore } from '../../stores/team-store';
import { windowStore } from '../../stores/window-store';
import { WebViewContext } from './web-view-ctx';

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { IDLE_POLLING_TIME, MAX_TIME_BEFORE_IDLE } from '../../utils/shared-constants';

import * as React from 'react'; // tslint:disable-line
import { appActions } from '../../actions/app-actions';
import { nativeInterop } from '../../native-interop';
import { TELEMETRY_EVENT, track } from '../../telemetry';
import { getInstanceUuid } from '../../uuid';
import { WebViewLifeCycleComponent } from './web-view-life-cycle-component';

const LOCAL_WEBAPP_ASSETS_PARAM = 'local_assets';
const RELOAD_RETRIES = 5;

let hasStoppedProfiling = !profiler.shouldProfile();

export interface TeamViewProps {
  teamId: string;
}

export interface TeamViewState {
  team: TeamBase;
  selectedTeamId: string;
  isDevMode: boolean;
  webappSrcPath: string;
  webappParams: object;
  showWebappDialogEvent: StoreEvent;
  editingCommandEvent: StoreEvent;
  refreshTeamEvent: StoreEvent;
  refreshTeamsEvent: StoreEvent;
  reloadEvent: StoreEvent;
  isWebViewLoaded?: boolean;
  hasConnectionTrouble?: boolean;
}

export class TeamView extends Component<TeamViewProps, TeamViewState> {
  private readonly issueReload = new Subject<void>();
  private _webAppHasLoaded = new AsyncSubject<boolean>();
  public get webAppHasLoaded() {
    return this._webAppHasLoaded.asObservable();
  }

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
      isWebViewLoaded: false
    }, this.state);
  }

  public syncState(): Partial<TeamViewState> {
    return {
      team: teamStore.getTeam(this.props.teamId)!,
      selectedTeamId: appTeamsStore.getSelectedTeamId()!,
      isDevMode: settingStore.getSetting<boolean>('isDevMode'),
      webappSrcPath: settingStore.getSetting<string>('webappSrcPath'),
      webappParams: settingStore.getSetting<object>('webappParams'),

      showWebappDialogEvent: eventStore.getEvent('showWebappDialog'),
      editingCommandEvent: eventStore.getEvent('editingCommand'),
      refreshTeamEvent: eventStore.getEvent('refreshTeam'),
      refreshTeamsEvent: eventStore.getEvent('refreshTeams'),
      reloadEvent: eventStore.getEvent('reload')
    };
  }

  public componentDidMount(): void {
    this.disposables.add(this.showConnectionTroubleAfterMultipleReloads());
    this.setupIdleTickle();
  }

  public componentDidUpdate(_prevProps: TeamViewProps, _prevState: TeamViewState) {
    const { selectedTeamId, team } = this.state;

    if (selectedTeamId === this.props.teamId) {
      this.setBugsnagMetadata(team);
      eventActions.mainWindowFocused();
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

  public refreshTeamEvent({ teamId }: { teamId: string }): void {
    if (teamId === this.props.teamId) this.loadTeamURL();
  }

  public refreshTeamsEvent({ teamIds }: { teamIds: Array<string> }): void {
    if (teamIds.includes(this.props.teamId)) this.loadTeamURL();
  }

  public reloadEvent({ everything }: { everything: boolean }): void {
    // Check if reload target
    if (everything ||
      !remote.getCurrentWindow().isFocused() ||
      this.state.selectedTeamId !== this.props.teamId) return;

    if (this.isCallActive()) {
      this.reloadWithActiveCall();
    } else {
      this.webViewElement.reload();
      track(TELEMETRY_EVENT.DESKTOP_CLIENT_RELOAD, {
        reloadScope: 'team',
        selectedTeam: this.props.teamId
      });
    }
  }

  public showWebappDialogEvent({ dialogType }: { dialogType: string }): Promise<string> {
    if (this.state.selectedTeamId === this.props.teamId) {
      return this.executeJavaScriptMethod('TSSSB.openDialog', dialogType);
    }
    return Promise.resolve('');
  }

  /**
   * Handles the Find and Use Selection for Find commands.
   *
   * @param  {String} {command}   The type of command being handled
   */
  public editingCommandEvent({ command }: { command: string }): void {
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
   * Checks whether a call is currently active.
   *
   * @returns {boolean}   Whether or not a call is active
   */
  public isCallActive(): boolean {
    return window.localStorage.getItem('deviceStorage_isCallWindowBusy') === 'true';
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

    const webViewContext = (
      <WebViewLifeCycleComponent
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

    // Show the Connecting screen during load.
    // This includes the connection trouble screen for times we can't load.
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

  /**
   * Sets up a timer to ping the message server at a fixed interval so that the
   * idle timer for the webapp is based on the user's machine, not whether
   * they've looked at a particular team.
   *
   */
  private setupIdleTickle(): void {
    const unmountedObservable = this.componentMountedObservable.filter((mounted) => !mounted);

    Observable.interval(IDLE_POLLING_TIME)
      //prevent execution into deferred webview creation
      .filter(() => !!this.webViewElement)
      .map(() => nativeInterop.getIdleTimeInMs())
      .takeUntil(unmountedObservable)
      .filter((currentIdleTime) => currentIdleTime < MAX_TIME_BEFORE_IDLE)
      .subscribe(() => eventActions.tickleMessageServer(this.props.teamId));
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
    const clientUrl = theURL.resolve(url, 'messages');

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
    if (isSlackURL(validatedURL)) {
      this.issueReloadWithReason(`WebView ${validatedURL} failed to load, issuing refresh.`, { errorCode, errorDescription });
    } else {
      logger.info(`WebView ${validatedURL} encountered error, but not Slack URL - not issuing refresh.`, { errorCode, errorDescription });
    }

    appActions.setLastError({ errorCode, errorDescription });
  }

  private onWebViewEmpty(webViewURL: string) {
    const isSigninURL = this.isSigninURL(webViewURL);

    if (!isSigninURL) {
      this.issueReloadWithReason('WebView was empty after did-stop-loading; issuing refresh.');
    } else {
      logger.info(`${webViewURL} is empty, but not refreshing during sign-in.`);
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
      title: $intl.t('Reload Slack and end call?', LOCALE_NAMESPACE.MESSAGEBOX)(),
      buttons: [$intl.t('Cancel', LOCALE_NAMESPACE.GENERAL)(), $intl.t('Reload', LOCALE_NAMESPACE.GENERAL)()],
      message: $intl.t('Are you sure?', LOCALE_NAMESPACE.MESSAGEBOX)(),
      detail: $intl.t('Heads up! Reloading Slack will also disconnect you from the call you’re on. Are you sure you want to reload?',
        LOCALE_NAMESPACE.GENERAL)(),
      noLink: true
    }, (result) => {
      if (result !== 0) {
        const callBrowserWindow = remote.BrowserWindow.fromId(windowStore.getCallWindow()!.id);

        executeJavaScriptMethod(callBrowserWindow, 'TS.calls.closeCall')
          .then(() => {
            this.webViewElement.reload();
            track(TELEMETRY_EVENT.DESKTOP_CLIENT_RELOAD, {
              reloadScope: 'teamWithActiveCall',
              selectedTeam: this.props.teamId
            });
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
      .subscribe(
        () => this.webViewElement.reload(),
        (err) => logger.warn('TeamView: Unable to reload.', err),
        () => this.setState({
          isWebViewLoaded: false,
          hasConnectionTrouble: true
        })
      );
  }
}
