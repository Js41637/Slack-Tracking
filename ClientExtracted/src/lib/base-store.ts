/**
 * @module Stores
 */ /** for typedoc */

import { omit } from 'lodash';
import { Reducer, Store, Unsubscribe } from 'redux';
import * as traverse from 'traverse';

import { Action } from '../actions/action';
import { logger } from '../logger';
import { RootState } from '../reducers';
import { noop } from '../utils/noop';

/**
 * Provides some basic functionality for every store.
 */
export class BaseStore implements Store<RootState> {
  protected store: Store<RootState>;
  protected readonly postDispatchCallback: (action: Action<any>) => void;
  private postDispatchListeners: Set<(action: Action<any>) => void> = new Set();

  constructor() {
    this.postDispatchCallback = (action) => {
      this.postDispatchListeners.forEach((listener) => listener(action));
    };
  }

  public getState(): RootState {
    return this.store.getState();
  }

  public subscribe(listener: () => void): Unsubscribe {
    return this.store.subscribe(listener);
  }

  public dispatch<S extends Action<any>>(action: S): S {
    return this.store.dispatch(action);
  }

  public replaceReducer<S>(_nextReducer: Reducer<S>): void {
    noop();
  }

  public dispose(): void {
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
      downloads: true,
      teams: true,
      events: {
        reload: true,
        editingCommand: true,
        sidebarClicked: true,
        systemTextSettingsChanged: true,
        customMenuItemClicked: true
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
    return (next: (action: Action<any>) => any) => (action: Action<any>) => {
      if (action.omitFromLog) return next(action);

      let payload;

      if (action.omitKeysFromLog) {
        payload = traverse(action.data).map(function(this: any) {
          if (action.omitKeysFromLog!.includes(this.key)) {
            this.update('[REDACTED]');
          }
        });
      } else {
        payload = action.data && action.data.deleted ? omit(action.data, 'deleted') : action.data;
      }

      // Allow store actions to define a log level
      if (action.logLevel && typeof logger[action.logLevel] === 'function') {
        logger[action.logLevel](`Store: ${action.type}`, payload);
      } else {
        logger.info(`Store: ${action.type}`, payload);
      }

      return next(action);
    };
  }
}
