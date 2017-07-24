/**
 * @module Stores
 */ /** for typedoc */

import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import { RootState, reducers } from '../reducers';

import { BaseStore } from './base-store';

export class WebappStore extends BaseStore {
  constructor() {
    super();

    const toCompose = [
      applyMiddleware(this.logDispatches),
      electronEnhancer({
        filter: this.getWebViewShape(),
        postDispatchCallback: this.postDispatchCallback.bind(this)
      })
    ];

    this.store = createStore<RootState>(
      combineReducers<RootState>(reducers),
      (compose as any)(...toCompose)
    ) as any;
  }
}
