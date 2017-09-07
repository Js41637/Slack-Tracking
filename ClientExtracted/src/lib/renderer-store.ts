/**
 * @module Stores
 */ /** for typedoc */

import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import { createEpicMiddleware } from 'redux-observable';

import { Action } from '../actions/action';
import { webViewLifeCycle } from '../epics/web-view-life-cycle';
import { RootState, reducers } from '../reducers';
import { isPrebuilt } from '../utils/process-helpers';
import { WINDOW_TYPES, windowType } from '../utils/shared-constants';
import { BaseStore } from './base-store';

// TODO: For some reason epics need to be declared after reducers or actions
// dispatched from epics don't make it to the main process.
import { epics } from '../epics/renderer';

/**
 * This store is used by any renderer process. It receives data from the
 * main process via redux-electron-store.
 */
export class RendererStore extends BaseStore {
  private windowType: windowType;

  constructor() {
    super();

    const { devMode, testMode, windowType } = global.loadSettings;
    this.windowType = windowType;

    /**
     * inject WebViewState storage object as dependency.
     * Each time epic is inovked, redux-observable will supply given instance into epic, allows
     * epic can lookup status of webview / webapp for given id as necessary.
     *
     * It is important to understand this is per-process storage and only renderer process owns it without
     * synchronize between processes, other process is still allowed to dispatch actions into renderer process via
     * dispatchProxy - so any specific webapp-related actions can be handled in renderer process side epics.
     * Which means, if action is being handled in other processes epic (like quit, toggle devtools),
     * It won't be able to access webview's status.
     *
     * Flowwise it'll looks like
     * - action is dispatched
     *  - if action is dispatched in other process, it'll be dispatched into renderer via dispatch proxy
     *  - if action is dispatched in renderer process, will passthrough
     * - action will invoke epics in renderer process
     *  - renderer process side epic can look up given dependency if needed
     */
    const epicMiddleware = createEpicMiddleware(epics, {
      dependencies: webViewLifeCycle
    });

    const toCompose = [
      applyMiddleware(this.logDispatches),
      applyMiddleware(epicMiddleware)
    ];

    // If running tests, we only have a renderer or a browser process, not
    // both. So we'll fail if we try to synchronize with the `BrowserStore`.
    if (!testMode) {
      toCompose.push(electronEnhancer({
        synchronous: false,
        excludeUnfilteredState: true,
        filter: this.getShapeForWindow(this.windowType),
        postDispatchCallback: this.postDispatchCallback.bind(this),
        // Allows synced actions to pass through all enhancers
        // check https://github.com/samiskin/redux-electron-store/issues/31#issuecomment-260240981 for details of this practice
        dispatchProxy: (action: Action<any>) => this.store.dispatch(action)
      }));
    }

    if (devMode && isPrebuilt()) {
      toCompose.push(require('../renderer/components/dev-tools').DevTools.instrument());
    }

    this.store = createStore<RootState>(
      combineReducers<RootState>(reducers),
      (compose as any)(...toCompose)
    );
  }

  /**
   * Returns a shape describing the type of data the window is interested in.
   *
   * @param  {String} type    The type of window
   * @return {Object}         A filter object with keys matching store entries
   */
  private getShapeForWindow(type: windowType) {
    switch (type) {
    case WINDOW_TYPES.MAIN:
      return true;
    case WINDOW_TYPES.NOTIFICATIONS:
      return {
        appTeams: true,
        notifications: true,
        settings: {
          zoomLevel: true,
          isDevMode: true,
          notifyPosition: true
        },
        teams: true,
        windows: true,
        windowFrame: true
      };
    case WINDOW_TYPES.WEBAPP:
      return this.getWebViewShape();
    case WINDOW_TYPES.OTHER:
      return {
        settings: true
      };
    }

    throw new Error(`unsupported window type ${type} is specified`);
  }
}
