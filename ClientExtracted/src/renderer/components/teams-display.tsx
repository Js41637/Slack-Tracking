/**
 * @module RendererComponents
 */ /** for typedoc */

import * as url from 'url';
import * as difference from 'lodash.difference';
import { remote } from 'electron';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
const { BrowserWindow } = remote;

import { logger } from '../../logger';
import { nativeInterop } from '../../native-interop';
import { objectSum } from '../../utils/object-sum';
import { getMostUsedTeams } from '../most-used-teams';

import { appTeamsStore } from '../../stores/app-teams-store';
import { Component } from '../../lib/component';
import { eventActions } from '../../actions/event-actions';
import { eventStore, StoreEvent } from '../../stores/event-store';
import { settingActions } from '../../actions/setting-actions';
import { settingStore } from '../../stores/setting-store';
import { teamActions, TeamBase } from '../../actions/team-actions';
import { TeamSidebar } from './team-sidebar';
import { teamStore } from '../../stores/team-store';
import { TeamUnloadingBehavior } from './team-unloading-behavior';
import { TeamView } from './team-view';
import { windowStore } from '../../stores/window-store';
import { Window } from '../../stores/window-store-helper';
import { noop } from '../../utils/noop';

import { CombinedStats, TeamMemoryStats, TeamLoadedState } from '../../memory-usage';

import {StringMap, SLACK_PROTOCOL, WINDOW_TYPES, TEAM_UNLOADING_DISABLED,
  IS_SIGNED_IN_EVAL, SLACK_CORP_TEAM_ID} from '../../utils/shared-constants';

import * as React from 'react'; // tslint:disable-line

export interface TeamsDisplayProps {
}

export interface TeamsDisplayState {
  teams: StringMap<TeamBase>;
  teamsToLoad: Array<string>;
  leastUsedTeams: Array<string>;
  selectedTeamId: string;
  numTeams: number;
  childWindows: StringMap<Window>;
  isTitleBarHidden: boolean;
  releaseChannel: string;
  launchedWithLink: string;
  devEnv: string;
  handleDeepLinkEvent: StoreEvent;
  closeAllUpdateBannersEvent: StoreEvent;
}

export class TeamsDisplay extends Component<TeamsDisplayProps, Partial<TeamsDisplayState>> {
  private readonly teamSelected: Subject<string> = new Subject();
  private teamElements: StringMap<TeamView> = {};
  private readonly refHandlers = {
    team: (teamId: string) => (ref: TeamView) => this.teamElements[teamId] = ref
  };

  public syncState(): Partial<TeamsDisplayState> {
    const teams = teamStore.teams;
    const selectedTeamId = appTeamsStore.getSelectedTeamId();

    const teamsToLoad = this.state ? this.state.teamsToLoad : getMostUsedTeams(teams);
    const leastUsedTeams = this.state ? this.state.leastUsedTeams :
      difference(Object.keys(teams), teamsToLoad)
        .filter((teamId: string) => teamId !== selectedTeamId);

    return {
      teams,
      teamsToLoad,
      leastUsedTeams,
      selectedTeamId,
      numTeams: teamStore.getNumTeams(),

      childWindows: windowStore.getWindows([WINDOW_TYPES.WEBAPP]),
      isTitleBarHidden: settingStore.getSetting<boolean>('isTitleBarHidden'),
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      launchedWithLink: settingStore.getSetting<string>('launchedWithLink'),
      devEnv: settingStore.getSetting<string>('devEnv'),

      handleDeepLinkEvent: eventStore.getEvent('handleDeepLink'),
      closeAllUpdateBannersEvent: eventStore.getEvent('closeAllUpdateBanners')
    };
  }

  public componentDidMount(): void {
    this.disposables.add(this.loadTeamsByUsage());
    this.maybePromoteReleaseChannel();

    this.disposables.add(this.trackTeamUsage());
    this.disposables.add(this.setupIdleTickle());
    this.disposables.add(this.closeWindowsOnUnload());
    this.disposables.add(this.redirectFocusOnClick());

    if (this.state.launchedWithLink) {
      logger.info('TeamsDisplay: App launched with link, now immediately handling (mount phase).');
      eventActions.handleDeepLink(this.state.launchedWithLink);
    }
  }

  public componentDidUpdate(_prevProps: Partial<TeamsDisplayProps>, prevState: Partial<TeamsDisplayState>): void {
    if (this.didTeamsChange(prevState)) {
      this.maybePromoteReleaseChannel();
    }

    if (prevState.selectedTeamId !== this.state.selectedTeamId) {
      this.teamSelected.next(prevState.selectedTeamId);
    }

    if (!prevState.launchedWithLink && this.state.launchedWithLink) {
      logger.info('TeamsDisplay: App launched with link, now immediately handling (update phase).');
      eventActions.handleDeepLink(this.state.launchedWithLink);
    }
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * DEPRECATED in favor of getTeamsMemoryUsage.
   * Remove this once the webapp is no longer using it.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  public getCombinedMemoryUsage(): Promise<CombinedStats> {
    return Observable.from(Object.keys(this.state.teams))
      .flatMap((teamId) => {
        const teamView = this.teamElements[teamId];
        return teamView.executeJavaScript(
          `window.desktop ? desktop.stats.getMemoryUsage() : null`
        );
      })
      .reduce(objectSum, {})
      .toPromise();
  }

  /**
   * Returns memory stats for individual teams, and their current state (min vs
   * full client).
   *
   * @return {Promise<StringMap<TeamMemoryStats>>}  A map of teams to their stats
   */
  public getTeamsMemoryUsage(): Promise<StringMap<TeamMemoryStats>> {
    return Observable.from(Object.keys(this.state.teams))
      .flatMap((teamId) => this.collectMemoryAndLoadedState(teamId)
        .catch((err) => ({ teamId, memory: null, state: 'error', reason: err.message })))
      .reduce((acc, x) => {
        acc[x.teamId] = x;
        return acc;
      }, {})
      .toPromise();
  }

  /**
   * Forwards valid Slack protocol URLs to the webapp.
   *
   * @param  {Object} evt Contains a single key, `url`
   */
  public handleDeepLinkEvent(evt: {url: string}): Promise<string> {
    const urlString = evt.url;
    if (!(typeof urlString === 'string')) return Promise.resolve('');

    logger.debug('TeamsDisplay: Handling deep link', evt.url);

    const theUrl = url.parse(urlString, true);
    if (theUrl.protocol !== SLACK_PROTOCOL) {
      logger.warn(`TeamsDisplay: Unable to handle ${urlString} because no slack: protocol.`);
      return Promise.resolve('');
    }

    if (this.state.numTeams === 0) {
      logger.warn(`TeamsDisplay: Unable to handle ${urlString} because no teams are signed in.`);
      return Promise.resolve('');
    }

    const args = theUrl.query;
    args.cmd = theUrl.host;

    // If a team was specified in the URL, find the relevant {TeamView}
    // or just use the first
    let teamId = Object.keys(this.state.teams)[0];
    if (args.team && this.state.teams![args.team]) {
      teamId = args.team;
    }

    logger.info(`TeamsDisplay: Instructing team ${teamId} to handle the deep link ${urlString}`);
    const teamView = this.teamElements[teamId];
    return teamView.executeJavaScriptMethod('TSSSB.handleDeepLinkWithArgs', JSON.stringify(args));
  }

  /**
   * Calls a method in the webapp context that will close any visible update
   * banners in every signed-in team.
   */
  public closeAllUpdateBannersEvent(): void {
    Observable.from(Object.keys(this.state.teams))
      .map((teamId) => this.teamElements[teamId])
      .filter((teamView) => teamView && !teamView.isTeamUnloaded())
      .mergeMap((teamView) => teamView.executeJavaScriptMethod('TSSSB.closeUpdateBanner'))
      .subscribe(noop, (error: Error) => {
        logger.warn('TeamsDisplay: Couldn\'t close all update banners.', error);
      }, () => {
        logger.info('TeamsDisplay: Closed update banners in all teams.');
      });
  }

  public render(): JSX.Element | null {
    const { numTeams, teams, selectedTeamId, teamsToLoad, leastUsedTeams, isTitleBarHidden } = this.state;
    const focusSelectedTeambySidebar = () => this.focusSelectedTeam(true);

    const teamSelector = isTitleBarHidden || (numTeams || 0) > 1 ?
      <TeamSidebar sidebarClicked={focusSelectedTeambySidebar}/> :
      <span/>;

    // All webviews are displayed on top of each other but only the selected one
    // is displayed, since we cannot let the webviews be unmounted
    const teamViews = Object.keys(teams).map((key) => {
      const team = teams![key];
      const teamSupportsUnloading = team.idle_timeout > 0 &&
        team.idle_timeout !== TEAM_UNLOADING_DISABLED;

      const teamView = (
        <TeamView
          teamId={team.team_id}
          ref={this.refHandlers.team(team.team_id)}
          loadWebView={teamsToLoad!.includes(team.team_id)}
          loadMinWeb={teamSupportsUnloading && leastUsedTeams!.includes(team.team_id)}
        />
      );

      const isTeamUnloaded = () => this.isTeamUnloaded(team.team_id);
      const setTeamUnloaded = (isUnloaded: boolean) => this.setTeamUnloaded(team.team_id, isUnloaded);
      const canUnloadTeam = () => this.canUnloadTeam(team.team_id);
      const unloadTeam = () => this.unloadTeam(team.team_id);
      const reloadTeam = () => this.reloadTeam(team.team_id);

      const result = teamSupportsUnloading ? (
        <TeamUnloadingBehavior
          teamId={team.team_id}
          isTeamUnloaded={isTeamUnloaded}
          setTeamUnloaded={setTeamUnloaded}
          canUnloadTeam={canUnloadTeam}
          unloadTeam={unloadTeam}
          reloadTeam={reloadTeam}
        >
          {teamView}
        </TeamUnloadingBehavior>
      ) : teamView;

      const teamStyle = selectedTeamId === team.team_id ? {
        width: '100%',
        height: '100%'
      } : {
        flex: '0 1',
        width: '0px',
        height: '0px'
      };

      return (
        <div
          className='TeamsDisplay-teamView'
          key={team.team_id}
          style={teamStyle}
        >
          {result}
        </div>
      );
    });

    return (
      <div className='TeamsDisplay'>
        {teamSelector}
        <div className='TeamsDisplay-teamDisplay'>
          {teamViews}
        </div>
      </div>
    );
  }

  /**
   * Most used teams will load their webview automatically and other teams will
   * wait until they have finished loading. Note that the initially selected
   * team overrides this behavior.
   *
   * @return {Subscription}  A Subscription that will disconnect this listener
   */
  private loadTeamsByUsage(): Subscription {
    const { teams, teamsToLoad, leastUsedTeams } = this.state;

    const teamsFinishedLoading = Observable.from(teamsToLoad!)
      .flatMap((teamId: string) => this.teamElements[teamId].webAppHasLoaded)
      .reduce(() => true);

    return leastUsedTeams!.length > 0 ?
      teamsFinishedLoading.subscribe(() => this.setState({
        teamsToLoad: Object.keys(teams)
      })) : Subscription.EMPTY;
  }

  /**
   * Starts tracking team usage by listening for selected team events.
   *
   * @return {Subscription}  A Subscription that will disconnect this listener
   */
  private trackTeamUsage(): Subscription {
    Object.keys(this.state.teams).forEach((teamId) => {
      logger.info(`TeamsDisplay: ${teamId} usage: ${this.state.teams![teamId].usage || 0}`);
    });

    this.teamSelected.filter((teamId: string) => !!teamId)
      .timeInterval()
      .do(({ value, interval }) => logger.info(`TeamsDisplay: Team ${value} was active for ${interval}ms`))
      .reduce((acc, { value, interval }) => {
        if (acc[value]) acc[value] += interval;
        else acc[value] = interval;
        return acc;
      }, {})
      .subscribe((teamUsage) => teamActions.updateTeamUsage(teamUsage));

    // Make sure we include the team that is selected when the app is quit
    return new Subscription(() => {
      this.teamSelected.next(this.state.selectedTeamId);
      this.teamSelected.complete();
    });
  }

  /**
   * Sets up a timer to ping the message server at a fixed interval so that the
   * idle timer for the webapp is based on the user's machine, not whether
   * they've looked at a particular team.
   *
   * @return {Subscription}  A Subscription that will kill the timer
   */
  private setupIdleTickle(): Subscription {
    const maxTimeBeforeIdle = 10 * 60 * 1000;
    const idlePollingTime = 1 * 60 * 1000;
    let idlePollingId: NodeJS.Timer;

    const notifyAllTeams = async () => {
      for (const teamId of Object.keys(this.state.teams)) {
        const teamView = this.teamElements[teamId];
        try {
          await teamView.executeInteropMethod('maybeTickleMS');
        } catch (e) {
          logger.info(`TeamsDisplay: Couldn't tickle MS for team ${teamId}`, e);
        }
      }
    };

    const doNextCheck = () => {
      const currentIdleTime = nativeInterop.getIdleTimeInMs();
      if (currentIdleTime > maxTimeBeforeIdle) {
        idlePollingId = setTimeout(doNextCheck, idlePollingTime);
        return;
      }

      notifyAllTeams();
      idlePollingId = setTimeout(doNextCheck, idlePollingTime);
    };

    doNextCheck();
    return new Subscription(() => clearTimeout(idlePollingId));
  }

  /**
   * When this component is unloaded (e.g., loss of network or before exit),
   * close all child windows. The webapp will ask to reopen the ones it owns.
   * This is necessary because all of our `webview` tags will be lost, and the
   * new ones will not have a connection to the existing windows.
   *
   * @return {Subscription}  A Subscription that will do the work
   */
  private closeWindowsOnUnload(): Subscription {
    return new Subscription(() => {
      // NB: We mostly do this to capture a snapshot of the child IDs
      const childWindows = Object.keys(this.state.childWindows).map((key) => this.state.childWindows![key].id);

      childWindows.forEach((entry) => {
        try {
          BrowserWindow.fromId(entry).close();
        } catch (err) {
          logger.warn('TeamsDisplay: Could not close window.', err);
        }
      });
    });
  }

  /**
   * Ensures the IME and other popups appear near the appropriate input.
   *
   * @return {Subscription}  A Subscription that manages the listener
   */
  private redirectFocusOnClick(): Subscription {
    return Observable.fromEvent(document.body, 'mousedown', true)
      .filter(({ target }) => target.tagName === 'WEBVIEW')
      .subscribe(() => this.focusSelectedTeam());
  }

  /**
   * Check all teams for a feature flag that tells us whether or not they opted
   * in to the beta channel and save that state. Also auto-promote Slack Corp
   * users to the alpha channel.
   *
   * @return {Promise<void>} A Promise that indicates completion
   */
  private async maybePromoteReleaseChannel(): Promise<void> {
    if (this.state.releaseChannel === 'alpha') return;

    const isAlphaChannel = Object.keys(this.state.teams)
      .some((teamId) => teamId === SLACK_CORP_TEAM_ID);

    if (isAlphaChannel) {
      logger.info(`TeamsDisplay: User signed into Slack Corp, setting channel to alpha`);
      settingActions.updateSettings({ releaseChannel: 'alpha' });
      return;
    }

    if (this.state.releaseChannel === 'beta') return;

    const isBetaChannel = await this.forAnyTeam('window.TSSSB && TSSSB.isOnBetaReleaseChannel()');
    if (isBetaChannel) {
      logger.info(`TeamsDisplay: User signed into a team with the beta feature flag, setting channel to beta`);
      settingActions.updateSettings({ releaseChannel: 'beta' });
    }
  }

  private isTeamUnloaded(teamId: string): boolean {
    return this.teamElements[teamId].isTeamUnloaded();
  }

  private setTeamUnloaded(teamId: string, isUnloaded: boolean): void {
    logger.info(`TeamsDisplay: Marking team ${teamId} as ${isUnloaded ? 'un' : ''}loaded`);
    this.teamElements[teamId].setTeamUnloaded(isUnloaded);
  }

  private canUnloadTeam(teamId: string): boolean {
    return !this.isTeamUnloaded(teamId) && !this.teamElements[teamId].isCallActiveForTeam();
  }

  private unloadTeam(teamId: string): Promise<boolean> {
    const code = `${IS_SIGNED_IN_EVAL} && TSSSB.unloadTeam()`;
    return this.teamElements[teamId].executeJavaScript(code).catch((err) => {
      logger.warn('Unable to unload team', teamId, err);
      return false;
    });
  }

  private reloadTeam(teamId: string): Promise<boolean> {
    const code = `window.MW && MW.loadTeam()`;
    return this.teamElements[teamId].executeJavaScript(code).catch((err) => {
      logger.warn('Unable to reload team', teamId, err);
      return false;
    });
  }

  /**
   * Focuses the webview that belongs to the current selected team.
   *
   * @param  {Boolean} sidebarClicked True if this occurred by clicking the team sidebar
   */
  private focusSelectedTeam(sidebarClicked: boolean = false): void {
    if (!this.state.selectedTeamId) return;

    const teamView = this.teamElements[this.state.selectedTeamId];
    if (!teamView) return;

    teamView.focus();

    if (sidebarClicked && !teamView.isTeamUnloaded()) {
      const code = `${IS_SIGNED_IN_EVAL} && TSSSB.ssbChromeClicked()`;
      teamView.executeJavaScript(code);
    }
  }

  /**
   * Wait for each team to load, then execute some code in that team's webView.
   * If any execution returns true, stop iterating.
   *
   * @param  {String} code      The code to execute in that team context
   * @return {Promise<Boolean>} A Promise with the result
   */
  private async forAnyTeam(code: string): Promise<boolean> {
    let result = false;

    for (const teamId of Object.keys(this.state.teams)) {
      const teamView = this.teamElements[teamId];

      try {
        result = !!(await teamView.executeJavaScript(code));
      } catch (err) {
        logger.warn(`TeamsDisplay: Unable to call ${code} on ${teamId}.`, err);
      }

      if (result) break;
    }

    return result;
  }

  private didTeamsChange(prevState: Partial<TeamsDisplayState>): boolean {
    const newTeams = Object.keys(this.state.teams);
    const oldTeams = Object.keys(prevState.teams);

    const addedTeams = difference(newTeams, oldTeams).length > 0;
    const removedTeams = difference(oldTeams, newTeams).length > 0;

    return addedTeams || removedTeams;
  }

  /**
   * Returns memory stats for a single team, along with its client state.
   *
   * @return {Promise<TeamMemoryStats>}  The stats object
   */
  private async collectMemoryAndLoadedState(teamId: string): Promise<TeamMemoryStats> {
    const teamView = this.teamElements[teamId];
    const teamName = teamView.getTeamName();

    const memory: NodeJS.ProcessMemoryInfo = await teamView.executeJavaScriptMethod('process.getProcessMemoryInfo') as any;
    const isBooted = await teamView.executeJavaScript(IS_SIGNED_IN_EVAL);
    const isUnloaded = this.isTeamUnloaded(teamId);

    let state: TeamLoadedState;
    if (isBooted && !isUnloaded) {
      state = 'full_client';
    } else if (!isBooted && isUnloaded) {
      state = 'unloaded';
    } else {
      state = 'signed_out';
    }

    return { memory, teamId, teamName, state, isBooted, isUnloaded };
  }
}
