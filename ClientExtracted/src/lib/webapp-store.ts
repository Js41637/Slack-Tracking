import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {electronEnhancer} from 'redux-electron-store';
import {reducers} from '../reducers';

import {BaseStore} from './base-store';

export class WebappStore<T> extends BaseStore<T> {
  constructor() {
    super();

    const toCompose = [
      applyMiddleware(this.logDispatches),
      electronEnhancer({
        filter: this.getWebViewShape(),
        postDispatchCallback: this.postDispatchCallback.bind(this)
      })
    ];

    this.store = createStore(
      combineReducers(reducers),
      (compose as any)(...toCompose)
    ) as any;
  }
}
