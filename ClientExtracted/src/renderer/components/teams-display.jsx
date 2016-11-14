import difference from 'lodash.difference';
import logger from '../../logger';
import nativeInterop from '../../native-interop';
import objectSum from '../../utils/object-sum';
import React from 'react';
import {remote} from 'electron';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import SerialSubscription from 'rxjs-serial-subscription';
import url from 'url';

const {BrowserWindow} = remote;

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import EventActions from '../../actions/event-actions';
import EventStore from '../../stores/event-store';
import SettingActions from '../../actions/setting-actions';
import SettingStore from '../../stores/setting-store';
import TeamActions from '../../actions/team-actions';
import TeamSelector from './team-selector';
import TeamStore from '../../stores/team-store';
import TeamView from './team-view';
import WindowStore from '../../stores/window-store';

import getMostUsedTeams from '../most-used-teams';
import {SLACK_PROTOCOL} from '../../reducers/app-reducer';
import {WINDOW_TYPES} from '../../utils/shared-constants';

export default class TeamsDisplay extends Component {

  constructor() {
    super();
    this.teamSelected = new Subject();
  }

  syncState() {
    return {
      teams: TeamStore.getTeams(),
      teamsToLoad: AppStore.getTeamsToLoad(),
      selectedTeamId: AppStore.getSelectedTeamId(),
      numTeams: TeamStore.getNumTeams(),
      childWindows: WindowStore.getWindows([WINDOW_TYPES.WEBAPP]),
      isTitleBarHidden: SettingStore.getSetting('isTitleBarHidden'),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      launchedWithLink: SettingStore.getSetting('launchedWithLink'),
      devEnv: SettingStore.getSetting('devEnv'),

      handleDeepLinkEvent: EventStore.getEvent('handleDeepLink'),
      signOutTeamEvent: EventStore.getEvent('signOutTeam'),
      closeAllUpdateBannersEvent: EventStore.getEvent('closeAllUpdateBanners')
    };
  }

  componentDidMount() {
    this.disposables.add(this.loadTeamsByUsage());

    this.releaseChannelDisp = new SerialSubscription();
    this.releaseChannelDisp.add(this.checkForBetaReleaseChannel());
    this.disposables.add(this.releaseChannelDisp);

    this.disposables.add(this.trackTeamUsage());
    this.disposables.add(this.setupIdleTickle());
    this.disposables.add(this.closeWindowsOnUnload());

    if (this.state.launchedWithLink) {
      EventActions.handleDeepLink(this.state.launchedWithLink);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.didTeamsChange(prevState)) {
      this.releaseChannelDisp.add(this.checkForBetaReleaseChannel());
    }

    if (prevState.selectedTeamId !== this.state.selectedTeamId) {
      this.teamSelected.next(prevState.selectedTeamId);
    }

    if (!prevState.launchedWithLink && this.state.launchedWithLink) {
      EventActions.handleDeepLink(this.state.launchedWithLink);
    }
  }

  /**
   * Load most used teams first and any other teams after the most used have
   * finished loading. Note that we need to skip the initially selected team as
   * it will always load immediately.
   *
   * @return {Subscription}  A Subscription that will clean up this subscription
   */
  loadTeamsByUsage() {
    let {teams, selectedTeamId} = this.state;

    let mostUsedTeams = getMostUsedTeams(teams);
    let otherTeams = difference(Object.keys(teams), mostUsedTeams);
    otherTeams = otherTeams.filter((team) => team !== selectedTeamId);

    AppActions.loadTeams(mostUsedTeams);

    let teamsFinishedLoading = Observable.from(mostUsedTeams)
      .flatMap((teamId) => this.refs[teamId].webAppHasLoaded)
      .reduce(() => true);

    return otherTeams.length > 0 ?
      teamsFinishedLoading.subscribe(() => AppActions.loadTeams(otherTeams)) :
      Subscription.EMPTY;
  }

  /**
   * Starts tracking team usage by listening for selected team events.
   *
   * @return {Subscription}  A Subscription that will run when this component is unmounted
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
      .subscribe((teamUsage) => TeamActions.updateTeamUsage(teamUsage));

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
        await teamView.executeJavaScriptMethod('TSSSB.maybeTickleMS');
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
   * Wait for each team to load, then check for a feature flag that tells us
   * whether or not the team has opted into the beta program. If any team has,
   * put the app on the beta release channel.
   *
   * @return {Subscription}  A Subscription that will clean up this subscription
   */
  checkForBetaReleaseChannel() {
    if (this.state.devEnv) {
      return Subscription.EMPTY;
    }

    return Observable.from(Object.keys(this.state.teams))
      .concatMap((teamId) => {
        let teamView = this.refs[teamId];
        return teamView.executeJavaScriptMethodWhenBooted('TSSSB.isOnBetaReleaseChannel');
      })
      .reduce((acc, useBetaChannel) => useBetaChannel || acc, false)
      .catch(() => Observable.of(null))
      .filter((useBetaChannel) => useBetaChannel !== null &&
        useBetaChannel && this.state.releaseChannel !== 'beta')
      .subscribe(() => SettingActions.updateSettings({releaseChannel: 'beta'}));
  }

  didTeamsChange(prevState) {
    let newTeams = Object.keys(this.state.teams);
    let oldTeams = Object.keys(prevState.teams);

    let addedTeams = difference(newTeams, oldTeams).length > 0;
    let removedTeams = difference(oldTeams, newTeams).length > 0;

    return addedTeams || removedTeams;
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  getCombinedMemoryUsage() {
    return Observable.from(Object.keys(this.state.teams))
      .flatMap((teamId) => {
        let teamView = this.refs[teamId];
        return teamView.executeJavaScriptMethod('winssb.stats.getMemoryUsage');
      })
      .reduce(objectSum, {})
      .toPromise();
  }

  /**
   * Forwards valid Slack protocol URLs to the webapp.
   *
   * @param  {Object} evt Contains a single key, `url`
   */
  handleDeepLinkEvent(evt) {
    let urlString = evt.url;
    if (!(typeof urlString === 'string')) return;

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

    let teamView = this.refs[teamId];
    return teamView.executeJavaScriptMethodWhenBooted('TSSSB.handleDeepLinkWithArgs', JSON.stringify(args));
  }

  /**
   * Calls a method in the webapp context that will navigate to the sign out
   * URL and return a boolean indicating sucess. If this fails, we assume that
   * the team is tombstoned and remove it from the sidebar.
   *
   * @param  {Object}
   * @param  {Object}.teamId  The ID of the team to sign out
   */
  signOutTeamEvent({teamId}) {
    Observable.of(this.refs[teamId])
      .flatMap((teamView) => teamView.executeJavaScriptMethod('TSSSB.signOutAndRemoveTeam', teamId))
      .take(1)
      .subscribe(() => {
        logger.info(`Signed out of team ${teamId}`);
      }, (error) => {
        logger.warn(`Signing out of team failed: ${error.message}`);
        TeamActions.removeTeam(teamId);
      });
  }

  /**
   * Calls a method in the webapp context that will close any visible update
   * banners in every signed-in team.
   */
  closeAllUpdateBannersEvent() {
    Observable.from(Object.keys(this.state.teams))
      .map((teamId) => this.refs[teamId])
      .filter((teamView) => teamView)
      .mergeMap((teamView) => teamView.executeJavaScriptMethod('TSSSB.closeUpdateBanner'))
      .subscribe(null, (error) => {
        logger.warn(`Couldn't close all update banners: ${error}`);
      }, () => {
        logger.info(`Closed update banners in all teams`);
      });
  }

  render() {
    let {numTeams, teams, teamsToLoad, isTitleBarHidden} = this.state;
    let teamSelector = isTitleBarHidden || numTeams > 1 ?
      <TeamSelector /> : <span/>;

    // All webviews are displayed on top of each other but only the selected one
    // is displayed, since we cannot let the webviews be unmounted
    let teamViews = Object.keys(teams).map((key) => {
      let team = teams[key];

      return (
        <div className="TeamsDisplay-teamView" key={team.team_id} style={{
          visibility: (this.state.selectedTeamId == team.team_id ? 'visible' : 'hidden'),
          position: 'absolute'}}>
          <TeamView teamId={team.team_id}
            ref={`${team.team_id}`}
            loadWebView={teamsToLoad.includes(team.team_id)} />
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
