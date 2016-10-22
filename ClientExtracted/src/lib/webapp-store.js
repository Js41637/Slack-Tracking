import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {electronEnhancer} from 'redux-electron-store';
import * as reducers from '../reducers';

import BaseStore from './base-store';

export default class WebappStore extends BaseStore {
  constructor() {
    super();

    let toCompose = [
      applyMiddleware(this.logDispatches),
      electronEnhancer({
        filter: this.getWebViewShape(),
        postDispatchCallback: this.postDispatchCallback.bind(this)
      })
    ];

    this.store = createStore(
      combineReducers(reducers.default),
      compose(...toCompose)
    );
  }
}
