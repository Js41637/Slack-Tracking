import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {electronEnhancer} from 'redux-electron-store';
import * as reducers from '../reducers';
import {isPrebuilt} from '../utils/process-helpers';

import BaseStore from './base-store';
import MigrationManager from '../browser/migration-manager';

import {BASE} from '../actions';
import {WINDOW_TYPES} from '../utils/shared-constants';

/**
 * This store is used by any renderer process. It receives data from the
 * `BrowserStore` in the signature: {
 *    type: action_type,
 *    data: {
 *      updated: updatedData,
 *      deleted: deleteShape
 *    }
 * }
 */
export default class RendererStore extends BaseStore {
  constructor() {
    super();

    let {devMode, testMode, windowType} = global.loadSettings;
    this.windowType = windowType;

    let toCompose = [
      applyMiddleware(this.logDispatches)
    ];

    // If running tests, we only have a renderer or a browser process, not
    // both. So we'll fail if we try to synchronize with the `BrowserStore`.
    if (!testMode) {
      toCompose.push(electronEnhancer({
        synchronous: false,
        excludeUnfilteredState: true,
        filter: this.getShapeForWindow(this.windowType),
        postDispatchCallback: this.postDispatchCallback.bind(this)
      }));
    }

    if (devMode && isPrebuilt()) {
      toCompose.push(require('../renderer/components/dev-tools').default.instrument());
    }

    this.store = createStore(
      combineReducers(reducers.default),
      compose(...toCompose)
    );

    let settings = this.getState().settings;
    if (!settings.hasMigratedData.renderer) {
      this.loadLegacyData(settings);
    }
  }

  /**
   * Returns a shape describing the type of data the window is interested in.
   *
   * @param  {String} type    The type of window
   * @return {Object}         A filter object with keys matching store entries
   */
  getShapeForWindow(type) {
    switch (type) {
    case WINDOW_TYPES.MAIN:
      return {
        app: true,
        notifications: true,
        settings: true,
        events: true,
        teams: true,
        downloads: true,
        tray: true,
        windows: true
      };
    case WINDOW_TYPES.NOTIFICATIONS:
      return {
        notifications: true,
        windows: true,
        teams: true,
        settings: {
          zoomLevel: true,
          notifyPosition: true,
          hasMigratedData: true,
          isDevMode: true
        }
      };
    case WINDOW_TYPES.WEBAPP:
      return this.getWebViewShape();
    }
  }

  loadLegacyData(settings) {
    let updated = MigrationManager.getRendererData(settings);
    updated.settings = updated.settings || { hasMigratedData: { renderer: true }};
    updated.settings.hasMigratedData = updated.settings.hasMigratedData || { renderer: true };
    updated.settings.hasMigratedData.renderer = true;

    this.dispatch({
      type: BASE.LOAD_LEGACY,
      data: {updated}
    });
  }
}
