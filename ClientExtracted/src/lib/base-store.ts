import * as traverse from 'traverse';
import {logger} from '../logger';

import {noop} from '../utils/noop';
import {Action} from '../actions/action';
import {Unsubscribe, Store, Reducer} from 'redux';
/**
 * Provides some basic functionality for every store.
 */
export class BaseStore<T> implements Store<T> {
  protected store: BaseStore<T>;
  protected readonly postDispatchCallback: (action: Action) => void;
  private postDispatchListeners: Set<(action: Action) => void> = new Set();

  constructor() {
    this.postDispatchCallback = (action) => {
      this.postDispatchListeners.forEach((listener) => listener(action));
    };
  }

  public getState(): T {
    return this.store.getState();
  }

  public subscribe(listener: () => void): Unsubscribe {
    return this.store.subscribe(listener);
  }

  public dispatch<S extends Action>(action: S): S {
    return this.store.dispatch(action);
  }

  public replaceReducer<S>(_nextReducer: Reducer<S>): void {
    noop();
  }

  /**
   * Subscribe a function to run as a second stage of updates, after the
   * usual subscriptions have run. We do this in order to update non-React
   * components.
   *
   * @param  {Function} listener The listener to add
   * @return {Function}          A method that will unsubscribe
   */
  public subscribePostDispatch(listener: <T>(action: T) => void): Unsubscribe{
    this.postDispatchListeners.add(listener);
    return () => this.postDispatchListeners.delete(listener);
  }

  protected getStore(): this {
    return this.store as this;
  }

  /**
   * Returns a shape describing the type of data the webapp should listen to.
   *
   * @return {Object}  A filter object with keys matching store entries
   */
  protected getWebViewShape() {
    return {
      app: true,
      appTeams: true,
      settings: true,
      dialog: true,
      teams: true,
      events: {
        reload: true,
        editingCommand: true,
        sidebarClicked: true,
        systemTextSettingsChanged: true
      },
      windows: true,
      windowFrame: true,
    };
  }

  /**
   * Middleware that logs an action along with its payload, after omitting PII.
   *
   * @return {Function}  A function that applies the next middleware
   */
  protected logDispatches() {
    return (next: (action: Action) => any) => (action: Action) => {
      if (action.omitFromLog) return next(action);

      let payload;

      if (action.omitKeysFromLog) {
        payload = traverse(action.data).map(function(this: any) {
          if ((action as any).omitKeysFromLog.includes(this.key)) {
            this.delete();
          }
        });
      } else {
        payload = action.data;
      }

      logger.info(`${action.type} ${payload != null ? `: ${JSON.stringify(payload, null, 2)}` : ''}`);
      return next(action);
    };
  }
}
