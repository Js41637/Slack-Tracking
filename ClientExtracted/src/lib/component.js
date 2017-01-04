import clone from 'lodash.clone';
import {logger} from '../logger';
import React from 'react';
import {Subscription} from 'rxjs/Subscription';
import {shallowEqual} from '../utils/shallow-equal';
import {stateEventHandler} from './state-events';
import {Store} from './store';
import {settingStore} from '../stores/setting-store';

export default class Component extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.syncState() || {};
    this._mounted = true;

    let unsubscribe = Store.subscribe(this._update.bind(this));
    this.disposables = new Subscription(unsubscribe);

    this.isDevMode = settingStore.getSetting('isDevMode') === true;
  }

  _update() {
    if (this._mounted) {
      let prevState = clone(this.state);
      let stateUpdates = this.syncState() || {};

      if (this.isDevMode) {
        Object.keys(stateUpdates).forEach((key) => {
          let value = stateUpdates[key];
          if (value === undefined) {
            throw new Error(`${this.constructor.name}.state.${key} is undefined.  The data may not have been included in the update shape in WindowStore`);
          }
        });
      }

      this.setState(stateUpdates);

      Object.keys(stateUpdates).forEach((key) => {
        let value = stateUpdates[key];
        let handler = stateEventHandler(this, value, key, prevState);
        if (handler) handler(value);
      });
    } else {
      logger.warn(`Attempting to update ${this.constructor.name} when unmounted`);
    }
  }

  // Update is called at every change, so avoid React having to
  // rerender the DOM to find out if anything changed by doing a
  // shallow equals here (Which we can do since we use immutability)
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }

  componentWillUnmount() {
    this._mounted = false;
    this.disposables.unsubscribe();
  }

  syncState() {
  }
}
