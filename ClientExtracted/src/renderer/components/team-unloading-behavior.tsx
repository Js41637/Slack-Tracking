import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import SerialSubscription from 'rxjs-serial-subscription';

import {logger} from '../../logger';

import {appTeamsStore} from '../../stores/app-teams-store';
import {Component} from '../../lib/component';
import {teamStore} from '../../stores/team-store';

export interface TeamUnloadingBehaviorProps {
  teamId: string;
  isTeamUnloaded: () => boolean;
  setTeamUnloaded: (isUnloaded: boolean) => void;
  canUnloadTeam: () => boolean;
  unloadTeam: () => Promise<boolean>;
  reloadTeam: () => Promise<boolean>;
}

export interface TeamUnloadingBehaviorState {
  teamName: string;
  idleTimeout: number;
  selectedTeamId: string;
}

/**
 * This is a decorator that wraps a single `TeamView` and allows it to be
 * unloaded when inactive for a certain period (the idle timeout). It does not
 * change the way the team is rendered whatsoever.
 */
export class TeamUnloadingBehavior extends Component<TeamUnloadingBehaviorProps, TeamUnloadingBehaviorState> {
  private teamSelected: Subject<string>;
  private teamUnloadingSubscription: Subscription;

  public syncState(): TeamUnloadingBehaviorState {
    const team = teamStore.getTeam(this.props.teamId);
    return {
      teamName: team.team_name,
      idleTimeout: team.idle_timeout,
      selectedTeamId: appTeamsStore.getSelectedTeamId()
    };
  }

  /**
   * If team unloading is already enabled, we need to set it up on mount.
   */
  public componentDidMount(): void {
    this.teamSelected = new Subject();

    this.teamUnloadingSubscription = new SerialSubscription();
    this.teamUnloadingSubscription.add(this.setupTeamUnloading());
    this.disposables.add(this.teamUnloadingSubscription);

    this.teamSelected.next(this.state.selectedTeamId);
  }

  /**
   * If the team idle timeout changes, we need to dispose our subscription or
   * create a new one.
   */
  public componentDidUpdate(_prevProps: TeamUnloadingBehaviorProps, prevState: TeamUnloadingBehaviorState): void {
    const {idleTimeout, selectedTeamId} = this.state;

    if (idleTimeout !== prevState.idleTimeout) {
      this.teamUnloadingSubscription.add(this.setupTeamUnloading());
    }

    if (selectedTeamId !== prevState.selectedTeamId) {
      this.teamSelected.next(selectedTeamId);
    }
  }

  public render(): JSX.Element | null {
    return this.props.children as JSX.Element;
  }

  /**
   * Handles loading and unloading of teams that remain inactive for some
   * duration.
   */
  private setupTeamUnloading(): Subscription {
    const [teamSelected, teamUnselected] = this.teamSelected
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
  private unloadTeamWhenInactive(teamSelected: Observable<any>, teamUnselected: Observable<any>, timeout: number): Subscription {
    return teamUnselected
      .switchMap(() => Observable.timer(timeout * 1000))
      .takeUntil(teamSelected)
      .repeat()
      .filter(() => this.props.canUnloadTeam())
      .do(() => logger.info(`Unloading team ${this.state.teamName}`))
      .flatMap(() => this.props.unloadTeam())
      .filter((wasUnloaded: boolean) => wasUnloaded)
      .subscribe(
        () => this.props.setTeamUnloaded(true),
        (err: Error) => logger.warn(`Unable to unload team: ${err.message}`)
      );
  }

  /**
   * When an unloaded team is selected, reload the full webapp.
   *
   * @param  {Observable} teamSelected  Fires when this team is selected
   * @return {Subscription}             A Subscription that will disconnect this listener
   */
  private restoreTeamOn(teamSelected: Observable<any>): Subscription {
    return teamSelected
      .filter(() => this.props.isTeamUnloaded())
      .do(() => logger.info(`Restoring team ${this.state.teamName}`))
      .flatMap(() => this.props.reloadTeam())
      .filter((wasReloaded: boolean) => wasReloaded)
      .subscribe(
        () => this.props.setTeamUnloaded(false),
        (err: Error) => logger.warn(`Unable to reload team: ${err.message}`)
      );
  }
}
