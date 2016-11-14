import assignIn from 'lodash.assignin';
import {Subscription} from 'rxjs/Subscription';
import shallowEqual from '../utils/shallow-equal';
import stateEventHandler from './state-events';

import Store from './store';
import SettingStore from '../stores/setting-store';

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
export default class ReduxComponent {

  /* This function handles ALL data that is obtained from Stores
   * @returns {object} - An object where each key is a variable for this.state,
   *                     and each value is a value from the Store
   */
  syncState() {
  }

  /* Handles subscribing the component to the Store
   * @param {object} args - The this. variables that get assigned prior to running syncState
   */
  constructor(args = {}) {
    assignIn(this, args);
    this.state = this.syncState() || {};

    if (SettingStore.getSetting('isDevMode') === true) {
      Object.keys(this.state).forEach((key) => {
        let value = this.state[key];
        if (value === undefined) {
          throw new Error(`${this.constructor.name}.state.${key} is undefined.  The data may not have been included in the update shape in WindowStore`);
        }
      });
    }

    /* In order to allow redux components to directly call each other
     * we must ensure that all state is updated first before update
     * methods are called, that way no two components will have
     * different data from the stores
     */
    this.disposables = new Subscription();
    this.disposables.add(new Subscription(Store.subscribe(this._updateState.bind(this)))); // Subscribe returns a function to unsub
    this.disposables.add(new Subscription(Store.subscribePostDispatch(this._runUpdateCallbacks.bind(this))));

    /* In updateState, we figure out if the component has had its state changed
     * if it has, we add the update function as a callback to this set.
     * A post dispatch subscription is made to run all the callbacks in this function
     */
    this.updateCallbacks = new Set();
  }

  dispose() {
    this.disposables.unsubscribe();
  }

  // Updates the state variable of this component, as well as checks all the
  // state events to see if they need to be fired
  _updateState() {
    if (this.disposables.isDisposed) return; // Sometimes update is called even after unsubscribed

    let prevState = this.state;
    let newState = this.syncState() || {};
    if (!shallowEqual(prevState, newState)) {
      this.state = {...this.state, ...newState};

      Object.keys(newState).forEach((key) => {
        let value = newState[key];
        let handler = stateEventHandler(this, value, key, prevState);
        if (handler) this.updateCallbacks.add(() => handler(value));
      });

      this.updateCallbacks.add(() => this.update(prevState));
    }
  }

  _runUpdateCallbacks() {
    for (let callback of this.updateCallbacks) {
      callback(); // eslint-disable-line
    }
    this.updateCallbacks.clear();
  }

  /* This function gets ran any time the component's state has changed (from syncState)
   * @param {object} prevState - The previous state of the component
   */
  update(prevState) { // eslint-disable-line
  }
}
