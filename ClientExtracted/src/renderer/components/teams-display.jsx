import url from 'url';
import difference from 'lodash.difference';
import React from 'react';
import {remote} from 'electron';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
const {BrowserWindow} = remote;

import {logger} from '../../logger';
import {nativeInterop} from '../../native-interop';
import {objectSum} from '../../utils/object-sum';
import {getMostUsedTeams} from '../most-used-teams';

import {appTeamsStore} from '../../stores/app-teams-store';
import {appTeamsActions} from '../../actions/app-teams-actions';
import {Component} from '../../lib/component';
import {eventActions} from '../../actions/event-actions';
import {eventStore} from '../../stores/event-store';
import {settingActions} from '../../actions/setting-actions';
import {settingStore} from '../../stores/setting-store';
import {teamActions} from '../../actions/team-actions';
import {TeamSidebar} from './team-sidebar';
import {teamStore} from '../../stores/team-store';
import {TeamUnloadingBehavior} from './team-unloading-behavior';
import {TeamView} from './team-view';
import {windowStore} from '../../stores/window-store';

import {SLACK_PROTOCOL, WINDOW_TYPES, TEAM_UNLOADING_DISABLED,
  TEAM_SIGNOUT_TIMEOUT, IS_BOOTED_EVAL} from '../../utils/shared-constants';

export default class TeamsDisplay extends Component {

  constructor() {
    super();
    this.teamSelected = new Subject();
  }

  syncState() {
    let teams = teamStore.teams;
    let selectedTeamId = appTeamsStore.getSelectedTeamId();

    let teamsToLoad = this.state ? this.state.teamsToLoad : getMostUsedTeams(teams);
    let leastUsedTeams = this.state ? this.state.leastUsedTeams :
      difference(Object.keys(teams), teamsToLoad)
        .filter((teamId) => teamId !== selectedTeamId);

    return {
      teams,
      teamsToLoad,
      leastUsedTeams,
      selectedTeamId,
      numTeams: teamStore.getNumTeams(),

      childWindows: windowStore.getWindows([WINDOW_TYPES.WEBAPP]),
      isTitleBarHidden: settingStore.getSetting('isTitleBarHidden'),
      releaseChannel: settingStore.getSetting('releaseChannel'),
      launchedWithLink: settingStore.getSetting('launchedWithLink'),
      devEnv: settingStore.getSetting('devEnv'),

      handleDeepLinkEvent: eventStore.getEvent('handleDeepLink'),
      signOutTeamEvent: eventStore.getEvent('signOutTeam'),
      closeAllUpdateBannersEvent: eventStore.getEvent('closeAllUpdateBanners')
    };
  }

  componentDidMount() {
    this.disposables.add(this.loadTeamsByUsage());
    this.checkForBetaReleaseChannel();

    this.disposables.add(this.trackTeamUsage());
    this.disposables.add(this.setupIdleTickle());
    this.disposables.add(this.closeWindowsOnUnload());
    this.disposables.add(this.redirectFocusOnClick());

    if (this.state.launchedWithLink) {
      logger.info('TeamsDisplay: App launched with link, now immediately handling (mount phase).');
      eventActions.handleDeepLink(this.state.launchedWithLink);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.didTeamsChange(prevState)) {
      this.checkForBetaReleaseChannel();
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
   * Most used teams will load their webview automatically and other teams will
   * wait until they have finished loading. Note that the initially selected
   * team overrides this behavior.
   *
   * @return {Subscription}  A Subscription that will disconnect this listener
   */
  loadTeamsByUsage() {
    let {teams, teamsToLoad, leastUsedTeams} = this.state;

    let teamsFinishedLoading = Observable.from(teamsToLoad)
      .flatMap((teamId) => this.refs[teamId].webAppHasLoaded)
      .reduce(() => true);

    return leastUsedTeams.length > 0 ?
      teamsFinishedLoading.subscribe(() => this.setState({
        teamsToLoad: Object.keys(teams)
      })) : Subscription.EMPTY;
  }

  /**
   * Starts tracking team usage by listening for selected team events.
   *
   * @return {Subscription}  A Subscription that will disconnect this listener
   */
  trackTeamUsage() {
    Object.keys(this.state.teams).forEach((teamId) => {
      logger.info(`${teamId} usage: ${this.state.teams[teamId].usage || 0}`);
    });

    this.teamSelected.filter((teamId) => teamId)
      .timeInterval()
      .do(({value, interval}) => logger.info(`Team ${value} was active for ${interval}`))
      .reduce((acc, {value, interval}) => {
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
  setupIdleTickle() {
    const maxTimeBeforeIdle = 10 * 60 * 1000;
    const idlePollingTime = 1 * 60 * 1000;
    let idlePollingId;

    const that = this;
    const notifyAllTeams = async function() {
      for (let teamId in that.state.teams) {
        let teamView = that.refs[teamId];
        await teamView.executeInteropMethod('maybeTickleMS').toPromise();
      }
    };

    const doNextCheck = () => {
      let currentIdleTime = nativeInterop.getIdleTimeInMs();
      if (currentIdleTime > maxTimeBeforeIdle) {
        idlePollingId = setTimeout(doNextCheck, idlePollingTime);
        return;
      }

      notifyAllTeams().catch((e) => logger.info(`Couldn't tickle MS: ${e.message}`));
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
  closeWindowsOnUnload() {
    return new Subscription(() => {
      // NB: We mostly do this to capture a snapshot of the child IDs
      let childWindows = Object.keys(this.state.childWindows).map((key) => this.state.childWindows[key].id);

      childWindows.forEach((entry) => {
        try {
          BrowserWindow.fromId(entry).close();
        } catch (err) {
          logger.warn(`Could not close window: ${err.message}`);
        }
      });
    });
  }

  /**
   * Ensures the IME and other popups appear near the appropriate input.
   *
   * @return {Subscription}  A Subscription that manages the listener
   */
  redirectFocusOnClick() {
    return Observable.fromEvent(document.body, 'mousedown', true)
      .filter(({target}) => target.tagName === 'WEBVIEW')
      .subscribe(() => this.focusSelectedTeam());
  }

  /**
   * Check for a feature flag on any team that tells us whether or not they
   * opted into the beta release channel and save that state.
   *
   * @return {Promise<Boolean>} A Promise with the result
   */
  async checkForBetaReleaseChannel() {
    if (this.state.releaseChannel === 'beta') return Promise.resolve(true);

    let result = await this.forAnyTeam('window.TSSSB && TSSSB.isOnBetaReleaseChannel()');
    if (result) settingActions.updateSettings({releaseChannel: 'beta'});
    return result;
  }

  isTeamUnloaded(teamId) {
    return this.refs[teamId].isTeamUnloaded();
  }

  setTeamUnloaded(teamId, isUnloaded) {
    this.refs[teamId].setTeamUnloaded(isUnloaded);
  }

  canUnloadTeam(teamId) {
    return !this.isTeamUnloaded(teamId) && !this.refs[teamId].isCallActiveForTeam();
  }

  unloadTeam(teamId) {
    return this.refs[teamId].executeJavaScriptIfBooted('TSSSB.unloadTeam');
  }

  reloadTeam(teamId) {
    return this.refs[teamId].executeJavaScript('window.MW && MW.loadTeam()');
  }

  /**
   * Focuses the webview that belongs to the current selected team.
   *
   * @param  {Boolean} sidebarClicked True if this occurred by clicking the team sidebar
   */
  focusSelectedTeam(sidebarClicked = false) {
    if (!this.state.selectedTeamId) return;

    let teamView = this.refs[this.state.selectedTeamId];
    teamView.focus();

    if (sidebarClicked && !teamView.isTeamUnloaded()) {
      teamView.executeJavaScriptIfBooted('TSSSB.ssbChromeClicked');
    }
  }

  /**
   * Wait for each team to load, then execute some code in that team's webView.
   * If any execution returns true, stop iterating.
   *
   * @param  {String} code      The code to execute in that team context
   * @return {Promise<Boolean>} A Promise with the result
   */
  async forAnyTeam(code) {
    let result = false;

    for (let teamId of Object.keys(this.state.teams)) {
      let teamView = this.refs[teamId];

      try {
        result = await teamView.executeJavaScript(code);
      } catch (err) {
        logger.warn(`Unable to call ${code} on ${teamId}: ${err.message}`);
      }

      if (result) break;
    }

    return result;
  }

  didTeamsChange(prevState) {
    const newTeams = Object.keys(this.state.teams);
    const oldTeams = Object.keys(prevState.teams);

    const addedTeams = difference(newTeams, oldTeams).length > 0;
    const removedTeams = difference(oldTeams, newTeams).length > 0;

    return addedTeams || removedTeams;
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * DEPRECATED in favor of getTeamsMemoryUsage.
   * Remove this once the webapp is no longer using it.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  getCombinedMemoryUsage() {
    return Observable.from(Object.keys(this.state.teams))
      .flatMap((teamId) => {
        const teamView = this.refs[teamId];
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
  getTeamsMemoryUsage() {
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
   * Returns memory stats for a single team, along with its client state.
   *
   * @return {Promise<TeamMemoryStats>}  The stats object
   */
  async collectMemoryAndLoadedState(teamId) {
    const teamView = this.refs[teamId];
    const teamName = teamView.getTeamName();

    const memory = await teamView.executeJavaScriptMethod('process.getProcessMemoryInfo');
    const isBooted = await teamView.executeJavaScript(IS_BOOTED_EVAL);
    const isUnloaded = this.isTeamUnloaded(teamId);

    let state;
    if (isBooted && !isUnloaded) {
      state = 'full_client';
    } else if (!isBooted && isUnloaded) {
      state = 'unloaded';
    } else {
      state = 'signed_out';
    }

    return { memory, teamId, teamName, state, isBooted, isUnloaded };
  }

  /**
   * Forwards valid Slack protocol URLs to the webapp.
   *
   * @param  {Object} evt Contains a single key, `url`
   */
  handleDeepLinkEvent(evt) {
    let urlString = evt.url;
    if (!(typeof urlString === 'string')) return;

    logger.debug('TeamsDisplay: Handling deep link', evt.url);

    let theUrl = url.parse(urlString, true);
    if (theUrl.protocol !== SLACK_PROTOCOL) {
      logger.warn(`Unable to handle ${urlString} because no slack: protocol.`);
      return;
    }

    if (this.state.numTeams === 0) {
      logger.warn(`Unable to handle ${urlString} because no teams are signed in.`);
      return;
    }

    let args = theUrl.query;
    args.cmd = theUrl.host;

    // If a team was specified in the URL, find the relevant {TeamView}
    // or just use the first
    let teamId = Object.keys(this.state.teams)[0];
    if (args.team && this.state.teams[args.team]) {
      teamId = args.team;
    }

    logger.info(`TeamsDisplay: Instructing team ${teamId} to handle the deep link ${urlString}`);
    let teamView = this.refs[teamId];
    return teamView.executeJavaScriptMethodWhenBooted('TSSSB.handleDeepLinkWithArgs', JSON.stringify(args));
  }

  /**
   * Calls a method in the webapp context that signs the team out. The team
   * sidebar will hide the team right away, and we'll give the team a minute
   * to sign out and remove it if something goes wrong (say, if the team was
   * already signed out by 2FA being activated).
   *
   * @param  {Object}
   * @param  {Object}.teamId  The ID of the team to sign out
   */
  signOutTeamEvent({teamId}) {
    logger.info(`Hiding team ${teamId}, removing in ${TEAM_SIGNOUT_TIMEOUT}ms`);
    appTeamsActions.hideTeam(teamId);

    return this.refs[teamId].executeInteropMethod('signOutTeam', teamId)
      .timeout(TEAM_SIGNOUT_TIMEOUT)
      .subscribe(() => {
        logger.info(`Signed out of team ${teamId}`);
      }, (err) => {
        logger.warn(`Signing out of team ${teamId} failed: ${err.message}`);
        teamActions.removeTeam(teamId);
      });
  }

  /**
   * Calls a method in the webapp context that will close any visible update
   * banners in every signed-in team.
   */
  closeAllUpdateBannersEvent() {
    Observable.from(Object.keys(this.state.teams))
      .map((teamId) => this.refs[teamId])
      .filter((teamView) => teamView && !teamView.isTeamUnloaded())
      .mergeMap((teamView) => teamView.executeJavaScriptMethod('TSSSB.closeUpdateBanner'))
      .subscribe(null, (error) => {
        logger.warn(`Couldn't close all update banners: ${error}`);
      }, () => {
        logger.info(`Closed update banners in all teams`);
      });
  }

  render() {
    const {numTeams, teams, selectedTeamId, teamsToLoad, leastUsedTeams, isTitleBarHidden} = this.state;

    const teamSelector = isTitleBarHidden || numTeams > 1 ?
      <TeamSidebar sidebarClicked={() => this.focusSelectedTeam(true)}/> :
      <span/>;

    // All webviews are displayed on top of each other but only the selected one
    // is displayed, since we cannot let the webviews be unmounted
    let teamViews = Object.keys(teams).map((key) => {
      let team = teams[key];
      let teamSupportsUnloading = team.idle_timeout &&
        team.idle_timeout !== TEAM_UNLOADING_DISABLED;

      let teamView = (
        <TeamView teamId={team.team_id}
          ref={`${team.team_id}`}
          loadWebView={teamsToLoad.includes(team.team_id)}
          loadMinWeb={teamSupportsUnloading && leastUsedTeams.includes(team.team_id)} />
      );

      let result = teamSupportsUnloading ? (
        <TeamUnloadingBehavior teamId={team.team_id}
          isTeamUnloaded={() => this.isTeamUnloaded(team.team_id)}
          setTeamUnloaded={(isUnloaded) => this.setTeamUnloaded(team.team_id, isUnloaded)}
          canUnloadTeam={() => this.canUnloadTeam(team.team_id)}
          unloadTeam={() => this.unloadTeam(team.team_id)}
          reloadTeam={() => this.reloadTeam(team.team_id)}>
          {teamView}
        </TeamUnloadingBehavior>
      ) : teamView;

      return (
        <div className="TeamsDisplay-teamView" key={team.team_id} style={{
          visibility: selectedTeamId == team.team_id ? 'visible' : 'hidden',
          position: 'absolute'}}>
          {result}
        </div>
      );
    });

    return (
      <div className="TeamsDisplay">
        {teamSelector}
        <div className="TeamsDisplay-teamDisplay">
          {teamViews}
        </div>
      </div>
    );
  }
}
