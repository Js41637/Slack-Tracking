import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import React from 'react';
import SerialSubscription from 'rxjs-serial-subscription';

import {logger} from '../../logger';

import AppTeamsStore from '../../stores/app-teams-store';
import Component from '../../lib/component';
import TeamStore from '../../stores/team-store';

import {TEAM_UNLOADING_DISABLED} from '../../utils/shared-constants';

/**
 * This is a decorator that wraps a single `TeamView` and allows it to be
 * unloaded when inactive for a certain period (the idle timeout). It does not
 * change the way the team is rendered whatsoever.
 */
export default class TeamUnloadingBehavior extends Component {
  static propTypes = {
    teamId: React.PropTypes.string.isRequired,
    isTeamUnloaded: React.PropTypes.func.isRequired,
    setTeamUnloaded: React.PropTypes.func.isRequired,
    unloadTeam: React.PropTypes.func.isRequired,
    reloadTeam: React.PropTypes.func.isRequired
  };

  syncState() {
    const team = TeamStore.getTeam(this.props.teamId);
    return {
      teamName: team.team_name,
      idleTimeout: team.idle_timeout || TEAM_UNLOADING_DISABLED,
      selectedTeamId: AppTeamsStore.getSelectedTeamId()
    };
  }

  /**
   * If team unloading is already enabled, we need to set it up on mount.
   */
  componentDidMount() {
    this.teamSelected = new Subject();

    this.teamUnloadingSubscription = new SerialSubscription();
    this.addOrClearSubscription();
    this.disposables.add(this.teamUnloadingSubscription);

    this.teamSelected.next(this.state.selectedTeamId);
  }

  /**
   * If the team idle timeout changes, we need to dispose our subscription or
   * create a new one.
   */
  componentDidUpdate(prevProps, prevState) {
    let {idleTimeout, selectedTeamId} = this.state;

    if (idleTimeout !== prevState.idleTimeout) {
      this.addOrClearSubscription();
    }

    if (selectedTeamId !== prevState.selectedTeamId) {
      this.teamSelected.next(selectedTeamId);
    }
  }

  addOrClearSubscription() {
    if (this.state.idleTimeout === TEAM_UNLOADING_DISABLED) {
      this.teamUnloadingSubscription.add(Subscription.EMPTY);
    } else {
      this.teamUnloadingSubscription.add(this.setupTeamUnloading());
    }
  }

  /**
   * Handles loading and unloading of teams that remain inactive for some
   * duration.
   */
  setupTeamUnloading() {
    let [teamSelected, teamUnselected] = this.teamSelected
      .distinctUntilChanged()
      .partition((teamId) => teamId === this.props.teamId);

    const sub = new Subscription();
    sub.add(this.unloadTeamWhenInactive(teamSelected, teamUnselected, this.state.idleTimeout));
    sub.add(this.restoreTeamOn(teamSelected));
    return sub;
  }

  /**
   * When a team is unselected, start a timer that will unload the team unless
   * it is selected within that duration.
   *
   * @param  {Observable} teamSelected    Fires when this team is selected
   * @param  {Observable} teamUnselected  Fires when this team is unselected
   * @param  {Number}     timeout         Number of seconds before a team is considered inactive
   * @return {Subscription}               A Subscription that will disconnect this listener
   */
  unloadTeamWhenInactive(teamSelected, teamUnselected, timeout) {
    return teamUnselected
      .switchMap(() => Observable.timer(timeout * 1000))
      .takeUntil(teamSelected)
      .repeat()
      .filter(() => !this.props.isTeamUnloaded())
      .do(() => logger.info(`Unloading team ${this.state.teamName}`))
      .flatMap(() => this.props.unloadTeam())
      .filter((wasUnloaded) => wasUnloaded)
      .subscribe(
        () => this.props.setTeamUnloaded(true),
        (err) => logger.warn(`Unable to unload team: ${err.message}`)
      );
  }

  /**
   * When an unloaded team is selected, reload the full webapp.
   *
   * @param  {Observable} teamSelected  Fires when this team is selected
   * @return {Subscription}             A Subscription that will disconnect this listener
   */
  restoreTeamOn(teamSelected) {
    return teamSelected
      .filter(() => this.props.isTeamUnloaded())
      .do(() => logger.info(`Restoring team ${this.state.teamName}`))
      .flatMap(() => this.props.reloadTeam())
      .filter((wasReloaded) => wasReloaded)
      .subscribe(
        () => this.props.setTeamUnloaded(false),
        (err) => logger.warn(`Unable to reload team: ${err.message}`)
      );
  }

  render() {
    return this.props.children;
  }
}
