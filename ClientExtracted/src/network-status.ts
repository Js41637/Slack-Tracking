import {networkStatusType} from './utils/shared-constants';
import {logger} from './logger';
import {Observable} from 'rxjs/Observable';
import {async} from 'rxjs/scheduler/async';

import './custom-operators';

/**
 * This class provides a more reliable interface over the native offline API.
 */
export class NetworkStatus {
  private readonly onlineEventObservable = Observable.fromEvent(window, 'online');
  private readonly offlineEventObservable = Observable.fromEvent(window, 'offline');
  private readonly scheduler = async;
  private reason: networkStatusType;
  private currentStatus: boolean;

  /**
   * Constructs a new `NetworkStatus`.
   *
   * @param  {Object} options                   Allows you to inject replacements for the DOM APIs during tests
   * @param  {Observable} options.onlineEvent   Signals that we are now online
   * @param  {Observable} options.offlineEvent  Signals that we are now offline
   * @param  {Function} options.isOnline        Returns whether we are online according to `navigator.isOnLine`
   */
  constructor(options: any = {}) {
    const {onlineEvent, offlineEvent, isOnline, scheduler} = options;
    if (onlineEvent) this.onlineEventObservable = onlineEvent;
    if (offlineEvent) this.offlineEventObservable = offlineEvent;
    if (isOnline) this.isOnline = isOnline;
    if (scheduler) this.scheduler = scheduler;
  }

  /**
   * Returns whether the *browser* thinks we are online. This isn't generally
   * reliable - if it's 'false', you're definitely offline, but a 'true' value
   * doesn't mean that you're good to go.
   *
   * @return {Boolean}  The result of `navigator.onLine`
   */
  public get isBrowserOnline(): boolean {
    return this.isOnline();
  }

  /**
   * Gives you an ongoing update of the current state of the network. Yields
   * 'true' or 'false' as to whether the network is both connected, and
   * functional (i.e. Slack is online).
   *
   * @return {Observable}  An Observable which keeps yielding values when the
   * network goes online / offline
   */
  public statusObservable(): Observable<networkStatusType> {
    // The status that the browser reports to us is generally believable if
    // they say we're *offline*, but not super trustworthy when they say we're
    // *online*. We're gonna try to debounce their nonsense a bit, so that code
    // trying to make decisions about connectivity don't have to think about it
    const kickoffOnline = this.isOnline() ?
      Observable.of(true) :
      Observable.empty();

    const kickoffOffline = !this.isOnline() ?
      Observable.of(true) :
      Observable.empty();

    const online = kickoffOnline.concat(this.onlineEventObservable)
      .map(() => this.repeatCheckUntilInternetWorks().startWith(this.isOnline()))
      .switch();

    const offline = kickoffOffline.concat(this.offlineEventObservable).mapTo(false);
    return Observable.merge(online, offline)
      .guaranteedThrottle(400, this.scheduler)
      .startWith(this.isOnline())
      .distinctUntilChanged()
      .do((isOnline) => this.currentStatus = isOnline)
      .publish()
      .refCount();
  }

  /**
   * Checks for an Internet connection via `checkInternetConnection`. If the
   * call succeeds, we quit; if it fails, we keep trying until it succeeds.
   *
   * @return {Observable}  An Observable which will keep yielding 'false' until
   * the network is connected, then it will yield 'true' and complete
   */
  private repeatCheckUntilInternetWorks(): Observable<boolean> {
    return Observable.timer(0, 2500, this.scheduler)
      .mergeMap(() => this.checkInternetConnection().catch(() => Observable.of(false)))
      .takeWhile((x) => x === false)
      .concat(Observable.of(true));
  }

  /**
   * Makes a single request to Slack's API to verify if the network is up. This
   * method also sets the `reason` variable to give a hint as to why the
   * network might be broken.
   *
   * @return {Observable}  An Observable Promise indicating the network state.
   * Either 'true' if it is up, or onError if the network isn't working
   */
  private checkInternetConnection(): Observable<boolean> {
    logger.info('Checking network connection to Slack...');

    const ret = Observable.ajax.post('https://slack.com/api/api.test?error=')
      .mergeMap(({status, response}) => {

        // NB: DNS failure
        if (status === 0) {
          this.reason = 'offline';
          return Observable.throw(new Error('Bad Status'));
        }

        if (status > 499) {
          this.reason = 'slackDown';
        }

        if (status > 399) {
          return Observable.throw(new Error('Bad Status'));
        }

        if (!response.ok) {
          this.reason = 'slackDown';
          return Observable.throw(new Error('Bad Response'));
        }

        return Observable.of(true);
      })
      .publishLast();

    ret.connect();
    return ret;
  }

  private readonly isOnline: () => boolean = () => navigator.onLine;
}
