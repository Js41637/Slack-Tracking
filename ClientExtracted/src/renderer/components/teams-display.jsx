import _ from 'lodash';
import logger from '../../logger';
import nativeInterop from '../../native-interop';
import objectSum from '../../utils/object-sum';
import React from 'react';
import {remote} from 'electron';
import {Disposable, Observable, SerialDisposable, Subject} from 'rx';
import url from 'url';

const {BrowserWindow} = remote;

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import DraggableRegion from './draggable-region';
import NonDraggableRegion from './non-draggable-region';
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

// NB: Must match height of .channel_header in webapp
const CHANNEL_HEADER_HEIGHT = 53;
const SEARCH_BOX_DEFAULT_WIDTH = 374;
const SEARCH_BOX_POSITION_FROM_RIGHT = 109;

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
      childWindows: WindowStore.getWindows([WindowStore.WEBAPP]),
      isTitleBarHidden: SettingStore.getSetting('isTitleBarHidden'),
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      searchBoxWidth: AppStore.getSearchBoxSize(),

      handleDeepLinkEvent: EventStore.getEvent('handleDeepLink'),
      signOutTeamEvent: EventStore.getEvent('signOutTeam'),
      devEnv: SettingStore.getSetting('devEnv'),
    };
  }

  componentDidMount() {
    this.disposables.add(this.loadTeamsByUsage());

    this.releaseChannelDisp = new SerialDisposable();
    this.releaseChannelDisp.setDisposable(this.checkForBetaReleaseChannel());
    this.disposables.add(this.releaseChannelDisp);

    this.disposables.add(this.trackTeamUsage());
    this.disposables.add(this.setupIdleTickle());
    this.disposables.add(this.closeWindowsOnUnload());
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.didTeamsChange(prevState)) {
      this.releaseChannelDisp.setDisposable(this.checkForBetaReleaseChannel());
    }

    if (prevState.selectedTeamId !== this.state.selectedTeamId) {
      this.teamSelected.onNext(prevState.selectedTeamId);
    }
  }

  /**
   * Load most used teams first and any other teams after the most used have
   * finished loading. Note that we need to skip the initially selected team as
   * it will always load immediately.
   *
   * @return {Disposable}  A Disposable that will clean up this subscription
   */
  loadTeamsByUsage() {
    let {teams, selectedTeamId} = this.state;

    let mostUsedTeams = getMostUsedTeams(teams);
    let otherTeams = _.difference(_.keys(teams), mostUsedTeams);
    otherTeams = _.without(otherTeams, selectedTeamId);

    AppActions.loadTeams(mostUsedTeams);

    let teamsFinishedLoading = Observable.fromArray(mostUsedTeams)
      .flatMap((teamId) => this.refs[teamId].webAppHasLoaded)
      .reduce(() => true);

    return otherTeams.length > 0 ?
      teamsFinishedLoading.subscribe(() => AppActions.loadTeams(otherTeams)) :
      Disposable.empty;
  }

  /**
   * Starts tracking team usage by listening for selected team events.
   *
   * @return {Disposable}  A Disposable that will run when this component is unmounted
   */
  trackTeamUsage() {
    _.forEach(_.keys(this.state.teams), (teamId) => {
      logger.info(`${teamId} usage: ${this.state.teams[teamId].usage || 0}`);
    });

    this.teamSelected.where((teamId) => teamId)
      .timeInterval()
      .do(({value, interval}) => logger.info(`Team ${value} was active for ${interval}`))
      .reduce((acc, {value, interval}) => {
        if (acc[value]) acc[value] += interval;
        else acc[value] = interval;
        return acc;
      }, {})
      .subscribe((teamUsage) => TeamActions.updateTeamUsage(teamUsage));

    // Make sure we include the team that is selected when the app is quit
    return new Disposable(() => {
      this.teamSelected.onNext(this.state.selectedTeamId);
      this.teamSelected.onCompleted();
    });
  }

  /**
   * Sets up a timer to ping the message server at a fixed interval so that the
   * idle timer for the webapp is based on the user's machine, not whether
   * they've looked at a particular team.
   *
   * @return {Disposable}  A Disposable that will kill the timer
   */
  setupIdleTickle() {
    const time = 1 * 60 * 1000;

    return Observable.timer(time, time)
      .where(() => nativeInterop.getIdleTimeInMs() < 10 * 1000)
      .flatMap(() => Observable.fromArray(_.keys(this.state.teams)))
      .flatMap((teamId) => {
        let teamView = this.refs[teamId];
        return teamView.executeJavaScriptMethod('TSSSB.maybeTickleMS');
      })
      .catch(Observable.return(null))
      .subscribe();
  }

  /**
   * When this component is unloaded (e.g., loss of network or before exit),
   * close all child windows. The webapp will ask to reopen the ones it owns.
   * This is necessary because all of our `webview` tags will be lost, and the
   * new ones will not have a connection to the existing windows.
   *
   * @return {Disposable}  A Disposable that will do the work
   */
  closeWindowsOnUnload() {
    return new Disposable(() => {
      // NB: We mostly do this to capture a snapshot of the child IDs
      let childWindows = _.map(this.state.childWindows, (x) => x.id);

      _.forEach(childWindows, (entry) => {
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
   * @return {Disposable}  A Disposable that will clean up this subscription
   */
  checkForBetaReleaseChannel() {
    if (this.state.devEnv) {
      return Disposable.empty;
    }

    return Observable.fromArray(_.keys(this.state.teams))
      .concatMap((teamId) => {
        let teamView = this.refs[teamId];
        return teamView.executeJavaScriptMethod('TSSSB.isOnBetaReleaseChannel');
      })
      .some((useBetaChannel) => useBetaChannel)
      .catch(Observable.return(null))
      .where((useBetaChannel) => useBetaChannel !== null &&
        useBetaChannel && this.state.releaseChannel !== 'beta')
      .subscribe(() => SettingActions.updateSettings({releaseChannel: 'beta'}));
  }

  didTeamsChange(prevState) {
    let newTeams = _.keys(this.state.teams);
    let oldTeams = _.keys(prevState.teams);

    let addedTeams = _.difference(newTeams, oldTeams).length > 0;
    let removedTeams = _.difference(oldTeams, newTeams).length > 0;

    return addedTeams || removedTeams;
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  getCombinedMemoryUsage() {
    return Observable.fromArray(_.keys(this.state.teams))
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
    if (!_.isString(urlString)) return;

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
    let teamId = _.keys(this.state.teams)[0];
    if (args.team && this.state.teams[args.team]) {
      teamId = args.team;
    }

    let teamView = this.refs[teamId];
    return teamView.executeJavaScriptMethod('TSSSB.handleDeepLinkWithArgs', JSON.stringify(args));
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
    Observable.just(this.refs[teamId])
      .flatMap((teamView) => teamView.executeJavaScriptMethod('winssb.teams.signOutTeam'))
      .catch(Observable.return(false))
      .take(1)
      .where((success) => !success)
      .subscribe(() => {
        logger.warn('Signing out of team failed, removing team anyway');
        TeamActions.removeTeam(teamId);
      });
  }

  render() {
    let {numTeams, teams, teamsToLoad, isTitleBarHidden} = this.state;
    let teamSelector = isTitleBarHidden || numTeams > 1 ?
      <TeamSelector /> : <span/>;

    // All webviews are displayed on top of each other but only the selected one
    // is displayed, since we cannot let the webviews be unmounted
    let teamViews = _.map(teams, (team) => {
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

    let searchBoxWidth = this.state.searchBoxWidth || SEARCH_BOX_DEFAULT_WIDTH;
    let draggableRegion = null;

    if (this.state.isTitleBarHidden) {
      draggableRegion =
        <DraggableRegion height={CHANNEL_HEADER_HEIGHT}>
          <NonDraggableRegion width={searchBoxWidth} right={SEARCH_BOX_POSITION_FROM_RIGHT} />
        </DraggableRegion>;
    }

    return (
      <div className="TeamsDisplay">
        {draggableRegion}
        {teamSelector}
        <div className="TeamsDisplay-teamDisplay">
          {teamViews}
        </div>
      </div>
    );
  }
}
