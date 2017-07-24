/**
 * @module Component
 */ /** for typedoc */

import { assignIn } from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { settingStore } from '../stores/setting-store';
import { noop } from '../utils/noop';
import { shallowEqual } from '../utils/shallow-equal';
import { ComponentBase } from './component-base';
import { stateEventHandler } from './state-events';
import { Store } from './store';

/**
 * This is our way of extending the goodness of React Components to the Browser
 * process (or any class that doesn't render to the DOM).
 *
 * The main concept we want to maintain is that if you make a change to data in
 * the store, the rest of the app will react accordingly to it.  Since we don't
 * have React's autoupdating to props/state changes, we need to have our own way
 * of updating these components.
 *
 * What this base class does is automatically link the `syncState` function that
 * child classes will use to the stores that they require.  Whenever this data
 * is updated, a component's `update` function will be called, with the old
 * state provided as a parameter.
 */
export class ReduxComponent<S extends object = {}> implements ComponentBase {
  protected state: S;
  protected disposables: Subscription = new Subscription();

  /**
   * In updateState, we figure out if the component state has changed. If it
   * has, we add the update function as a callback to this set. After the
   * dispatch completes, we'll run all of the component updates.
   */
  private readonly updateCallbacks: Array<Function> = [];

  /**
   * Create a new `ReduxComponent` and subscribe it to store updates.
   *
   * @param {Object} args Values to assign to `this`
   */
  constructor(args: Partial<S> = {}) {
    assignIn(this, args);
    this.state = (this.syncState() || {}) as S;

    if (settingStore.getSetting('isDevMode') === true) {
      Object.keys(this.state).forEach((key) => {
        const value = this.state[key];
        if (value === undefined) {
          throw new Error(`${this.constructor.name}.state.${key} is undefined.
            The data may not have been included in the update shape in WindowStore`);
        }
      });
    }

    /**
     * To support chained Redux components calling each other in an update
     * cycle, we must ensure that all state is updated _before_ any individual
     * component's update method is called. Otherwise two different components
     * could be out of sync.
     */
    this.disposables.add(new Subscription(
      Store.subscribe(this.updateState.bind(this))));
    this.disposables.add(new Subscription(
      Store.subscribePostDispatch(this.runUpdateCallbacks.bind(this))));
  }

  /**
   * Request all data from stores or reducer accessors here.
   * Called after each store dispatch.
   *
   * @returns {Partial<S>} The new state for this component
   */
  public syncState(): Partial<S> | null {
    return null;
  }

  /**
   * Occurs when a component's state (calculated in `syncState`) has changed.
   */
  public update(_prevState: Partial<S>): void {
    noop();
  }

  /**
   * Allow components to override the shallow equality check.
   */
  public shouldComponentUpdate(prevState: Partial<S>, newState: Partial<S>): boolean {
    return !shallowEqual(prevState, newState);
  }

  /**
   * Dispose this component, unsubscribing it from the store.
   */
  public dispose(): void {
    this.disposables.unsubscribe();
  }

  /**
   * Updates the state of this component, and checks any events declared within
   * `syncState` and fires them if necessary.
   */
  private updateState(): void {
    // NB: Sometimes update is called even after unsubscribed
    if (this.disposables.closed) return;

    // TODO: https://github.com/Microsoft/TypeScript/issues/10727
    const prevState = this.state as any;
    const newState = (this.syncState() || {}) as any;

    if (this.shouldComponentUpdate(prevState, newState)) {
      this.state = { ...newState };

      Object.keys(newState).forEach((key) => {
        const value = newState[key] as any;
        const handler = stateEventHandler(this, value, key, prevState);
        if (handler) this.updateCallbacks.push(() => handler(value));
      });

      this.updateCallbacks.push(() => this.update(prevState));
    }
  }

  private runUpdateCallbacks(): void {
    let cb = this.updateCallbacks.shift();
    while (cb) { cb(); cb = this.updateCallbacks.shift(); }
  }
}
