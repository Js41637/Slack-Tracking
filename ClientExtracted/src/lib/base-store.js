import logger from '../logger';
import traverse from 'traverse';

/**
 * Provides some basic functionality for every store.
 */
export default class BaseStore {

  constructor() {
    this.postDispatchListeners = new Set();
    this.postDispatchCallback = (action) => {
      for (let listener of this.postDispatchListeners) {
        listener(action);
      }
    };
  }

  getState() {
    return this.store.getState();
  }

  subscribe(listener) {
    return this.store.subscribe(listener);
  }

  dispatch(action) {
    this.store.dispatch(action);
  }

  getStore() {
    return this.store;
  }

  /**
   * Subscribe a function to run as a second stage of updates, after the
   * usual subscriptions have run. We do this in order to update non-React
   * components.
   *
   * @param  {Function} listener The listener to add
   * @return {Function}          A method that will unsubscribe
   */
  subscribePostDispatch(listener) {
    this.postDispatchListeners.add(listener);
    return () => this.postDispatchListeners.delete(listener);
  }

  /**
   * Returns a shape describing the type of data the webapp should listen to.
   *
   * @return {Object}  A filter object with keys matching store entries
   */
  getWebViewShape() {
    return {
      app: true,
      settings: true,
      teams: true,
      events: {
        reload: true,
        editingCommand: true,
        sidebarClicked: true
      },
      windows: true
    };
  }

  /**
   * Middleware that logs an action along with its payload, after omitting PII.
   *
   * @return {Function}  A function that applies the next middleware
   */
  logDispatches() {
    return (next) => (action) => {
      if (action.omitFromLog) return next(action);

      let payload;

      if (action.omitKeysFromLog) {
        payload = traverse(action.data).map(function() {
          if (action.omitKeysFromLog.includes(this.key)) {
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
