/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import { remote } from 'electron';
import { difference, sum, values } from 'lodash';
import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import * as url from 'url';

import { eventActions } from '../../actions/event-actions';
import { settingActions } from '../../actions/setting-actions';
import { TeamBase, teamActions } from '../../actions/team-actions';
import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { logger } from '../../logger';
import { CombinedStats, TeamLoadedState, TeamMemoryStats } from '../../memory-usage';
import { appTeamsStore } from '../../stores/app-teams-store';
import { StoreEvent, eventStore } from '../../stores/event-store';
import { settingStore } from '../../stores/setting-store';
import { teamStore } from '../../stores/team-store';
import { windowStore } from '../../stores/window-store';
import { isReplyLink, isSettingsLink, isSlackLink } from '../../utils/protocol-link';
import {
  IS_SIGNED_IN_EVAL,
  SLACK_CORP_TEAM_ID,
  SLACK_PROTOCOL,
  StringMap,
  WINDOW_TYPES
} from '../../utils/shared-constants';
import { DoomedError } from './doomed-error';
import { TeamSidebar } from './team-sidebar';
import { TeamView } from './team-view';

const { BrowserWindow } = remote;

export interface TeamsDisplayProps { } // tslint:disable-line:no-empty-interface

export interface TeamsDisplayState {
  teams: StringMap<TeamBase>;
  selectedTeamId: string | null;
  numTeams: number;
  isTitleBarHidden: boolean;
  releaseChannel: string;
  launchedWithLink: string;
  devEnv: string;
  handleDeepLinkEvent: StoreEvent;
  handleSettingsLinkEvent: StoreEvent;
}

export class TeamsDisplay extends Component<TeamsDisplayProps, Partial<TeamsDisplayState>> {
  private readonly teamSelected: Subject<string | null> = new Subject<string | null>();
  private teamElements: StringMap<TeamView> = {};
  private readonly refHandlers = {
    team: (teamId: string) => (ref: TeamView) => this.teamElements[teamId] = ref
  };

  public syncState(): Partial<TeamsDisplayState> {
    return {
      teams: teamStore.teams,
      selectedTeamId: appTeamsStore.getSelectedTeamId(),
      numTeams: teamStore.getNumTeams(),
      isTitleBarHidden: settingStore.getSetting<boolean>('isTitleBarHidden'),
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      launchedWithLink: settingStore.getSetting<string>('launchedWithLink'),
      devEnv: settingStore.getSetting<string>('devEnv'),

      handleDeepLinkEvent: eventStore.getEvent('handleDeepLink'),
      handleSettingsLinkEvent: eventStore.getEvent('handleSettingsLink')
    };
  }

  public componentDidMount(): void {
    this.maybePromoteReleaseChannel();

    this.disposables.add(this.trackTeamUsage());
    this.disposables.add(this.closeWindowsOnUnload());
    this.disposables.add(this.redirectFocusOnClick());

    if (this.state.launchedWithLink) {
      logger.info('TeamsDisplay: App launched with link, now immediately handling (mount phase).');
      this.handleLaunchedWithLink(this.state.launchedWithLink);
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
      this.handleLaunchedWithLink(this.state.launchedWithLink);
    }
  }

  /**
   * 99% of all deep links need to be handed directly to the webapp.
   * If we were launched with a url, we choose the appropriate handler here.
   *
   * @param {string} link
   */
  public handleLaunchedWithLink(link: string) {
    logger.debug('Handle launch with deep link', link);

    if (isReplyLink(link)) {
      eventActions.handleReplyLink(link);
    } else if (isSettingsLink(link)) {
      eventActions.handleSettingsLink(link);
    } else if (isSlackLink(link)) {
      eventActions.handleDeepLink(link);
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
      .reduce(sum, {})
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
   * Displays a notification if Slack received a settings link.
   * See guides/settings-link.md for details.
   */
  public handleSettingsLinkEvent() {
    const options = {
      title: $intl.t('Slack Corp', LOCALE_NAMESPACE.GENERAL)(),
      body: $intl.t('Your settings have been updated. Restart Slack for these changes to take effect.', LOCALE_NAMESPACE.GENERAL)()
    };

    // tslint:disable-next-line:no-unused-expression-chai
    new window.Notification(options.title, { body: options.body });
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

  public render(): JSX.Element | null {
    const {
      numTeams,
      teams,
      selectedTeamId,
      isTitleBarHidden
    } = this.state;

    const focusSelectedTeamBySidebar = () => this.focusSelectedTeam(true);

    const teamSelector = isTitleBarHidden || (numTeams || 0) > 1 ?
      <TeamSidebar sidebarClicked={focusSelectedTeamBySidebar}/> :
      <span/>;

    // All webviews are displayed on top of each other but only the selected one
    // is displayed, since we cannot let the webviews be unmounted
    const teamViews = Object.keys(teams).map((key) => {
      const team = teams![key];
      const className = classNames('TeamsDisplay-teamView', {
        isSelected: selectedTeamId === team.team_id
      });

      return (
        <div className={className} key={team.team_id}>
          <TeamView teamId={team.team_id} ref={this.refHandlers.team(team.team_id)} />
        </div>
      );
    });

    const doomedError = teamViews && teamViews.length > 0 ? <DoomedError /> : null;

    return (
      <div className='TeamsDisplay'>
        {teamSelector}
        <div className='TeamsDisplay-teamDisplay'>
          {teamViews}
        </div>
        {doomedError}
      </div>
    );
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
        if (!value) return acc;
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
   * When this component is unloaded (e.g., loss of network or before exit),
   * close all child windows. The webapp will ask to reopen the ones it owns.
   * This is necessary because all of our `webview` tags will be lost, and the
   * new ones will not have a connection to the existing windows.
   *
   * @return {Subscription}  A Subscription that will do the work
   */
  private closeWindowsOnUnload(): Subscription {
    return new Subscription(() => {
      try {
        values(windowStore.getWindows([WINDOW_TYPES.WEBAPP]))
          .map(({ id }) => BrowserWindow.fromId(id))
          .forEach((browserWindow) => browserWindow.close());
      } catch (err) {
        logger.warn('TeamsDisplay: Could not close windows', err);
      }
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

  /**
   * Focuses the webview that belongs to the current selected team.
   *
   * @param  {Boolean} sidebarClicked True if this occurred by clicking the team sidebar
   */
  private focusSelectedTeam(sidebarClicked: boolean = false): void {
    if (!this.state.selectedTeamId) return;

    eventActions.mainWindowFocused();

    const teamView = this.teamElements[this.state.selectedTeamId];
    if (!teamView) return;

    if (sidebarClicked) {
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

    const memory: Electron.ProcessMemoryInfo = await teamView.executeJavaScriptMethod('process.getProcessMemoryInfo') as any;
    const isBooted = await teamView.executeJavaScript(IS_SIGNED_IN_EVAL);

    const state: TeamLoadedState = isBooted
      ? 'full_client'
      : 'signed_out';

    return { memory, teamId, teamName, state, isBooted, isUnloaded: false };
  }
}
