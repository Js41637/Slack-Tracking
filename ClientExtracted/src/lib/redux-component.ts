/**
 * @module Component
 */ /** for typedoc */

import * as assignIn from 'lodash.assignin';
import { Subscription } from 'rxjs/Subscription';
import { shallowEqual } from '../utils/shallow-equal';
import { stateEventHandler } from './state-events';

import { noop } from '../utils/noop';
import { Store } from './store';
import { settingStore } from '../stores/setting-store';
import { ComponentBase } from './component-base';

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
export class ReduxComponent<S extends {}> implements ComponentBase {
  protected state: S;
  protected disposables: Subscription = new Subscription();

  /* In updateState, we figure out if the component has had its state changed
   * if it has, we add the update function as a callback to this set.
   * A post dispatch subscription is made to run all the callbacks in this function
   */
  private updateCallbacks: Set<() => void>;

  /* Handles subscribing the component to the Store
   * @param {object} args - The this. variables that get assigned prior to running syncState
   */
  constructor(args: any = {}) {
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

    /* In order to allow redux components to directly call each other
     * we must ensure that all state is updated first before update
     * methods are called, that way no two components will have
     * different data from the stores
     */
    this.disposables.add(new Subscription(Store.subscribe(this._updateState.bind(this)))); // Subscribe returns a function to unsub
    this.disposables.add(new Subscription(Store.subscribePostDispatch(this._runUpdateCallbacks.bind(this))));

    this.updateCallbacks = new Set();
  }

  /* This function handles ALL data that is obtained from Stores
   * @returns {object} - An object where each key is a variable for this.state,
   *                     and each value is a value from the Store
   */
  public syncState(): Partial<S> | null {
    return null;
  }

  /* This function gets ran any time the component's state has changed (from syncState)
   * @param {object} prevState - The previous state of the component
   */
  public update(_prevState: Partial<S>): void {
    noop();
  }

  public dispose(): void {
    this.disposables.unsubscribe();
  }

  /* Updates the state variable of this component, as well as checks all the
   * state events to see if they need to be fired
   */
  private _updateState(): void {
    if (this.disposables.closed) return; // Sometimes update is called even after unsubscribed

    const prevState = this.state as any; //TS 2.1 spread only support object type, not yet with <T> requires cast
    const newState = (this.syncState() || {}) as any;
    if (!shallowEqual(prevState, newState)) {
      const current = { ...prevState };
      this.state = { ...current, ...newState } as any;

      Object.keys(newState).forEach((key) => {
        const value = newState[key];
        const handler = stateEventHandler(this, value, key, prevState);
        if (handler) this.updateCallbacks.add(() => handler(value));
      });

      this.updateCallbacks.add(() => this.update(prevState));
    }
  }

  private _runUpdateCallbacks(): void {
    this.updateCallbacks.forEach((callback: Function) => callback());
    this.updateCallbacks.clear();
  }
}
