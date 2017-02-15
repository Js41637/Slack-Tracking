import * as clone from 'lodash.clone';
import * as React from 'react'; // tslint:disable-line

import {ComponentBase} from './component-base';
import {logger} from '../logger';
import {settingStore} from '../stores/setting-store';
import {shallowEqual} from '../utils/shallow-equal';
import {stateEventHandler} from './state-events';
import {Store} from './store';
import {Subscription} from 'rxjs/Subscription';

export class Component<P, S> extends React.Component<P, S> implements ComponentBase {
  protected disposables: Subscription;
  private mounted: boolean = true;
  private isDevMode: boolean;

  constructor(...args: Array<any>);
  constructor(props: P) {
    super(props);
    this.state = (this.syncState() || {}) as S;

    const unsubscribe = Store.subscribe(this.update.bind(this));
    this.disposables = new Subscription(unsubscribe);

    this.isDevMode = settingStore.getSetting('isDevMode') === true;
  }

  /**
   * Update is called at every change, so avoid React having to
   * rerender the DOM to find out if anything changed by doing a
   * shallow equals here (Which we can do since we use immutability)
   */
  public shouldComponentUpdate(nextProps: P, nextState: S): boolean {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }

  public componentWillUnmount(): void {
    this.mounted = false;
    this.disposables.unsubscribe();
  }

  public syncState(): Partial<S> | null {
    return null;
  }

  private update(): void {
    if (this.mounted) {
      const prevState = clone(this.state);
      const stateUpdates = (this.syncState() || {}) as S;

      if (this.isDevMode) {
        Object.keys(stateUpdates).forEach((key) => {
          const value = stateUpdates[key];
          if (value === undefined) {
            throw new Error(`${this.constructor.name}.state.${key} is undefined.
              The data may not have been included in the update shape in WindowStore`);
          }
        });
      }

      this.setState(stateUpdates);

      Object.keys(stateUpdates).forEach((key) => {
        const value = stateUpdates[key];
        const handler = stateEventHandler(this, value, key, prevState);
        if (handler) handler(value);
      });
    } else {
      logger.warn(`Attempting to update ${this.constructor.name} when unmounted`);
    }
  }
}
