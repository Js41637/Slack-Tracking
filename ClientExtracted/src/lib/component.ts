/**
 * @module Component
 */ /** for typedoc */

import { clone } from 'lodash';
import * as React from 'react';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { logger } from '../logger';
import { settingStore } from '../stores/setting-store';
import { shallowEqual } from '../utils/shallow-equal';
import { ComponentBase } from './component-base';
import { stateEventHandler } from './state-events';
import { Store } from './store';

export class Component<P, S = {}> extends React.Component<P, S> implements ComponentBase {
  protected disposables: Subscription;
  private readonly mounted: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isDevMode: boolean;

  protected get componentMountedObservable(): Observable<boolean> {
    return this.mounted.asObservable();
  }

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

  public componentWillMount(): void {
    this.mounted.next(true);
  }

  public componentWillUnmount(): void {
    this.mounted.next(false);
    this.mounted.unsubscribe();
    this.disposables.unsubscribe();
  }

  public syncState(): Partial<S> | null {
    return null;
  }

  private update(): void {
    if (!this.mounted.closed && this.mounted.value) {
      const prevState = clone<S>(this.state);
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
        const handler = stateEventHandler(this, value, key, prevState as any);
        if (handler) handler(value);
      });
    } else {
      logger.warn(`Base Component: Attempting to update ${this.constructor.name} when unmounted.`);
    }
  }
}
