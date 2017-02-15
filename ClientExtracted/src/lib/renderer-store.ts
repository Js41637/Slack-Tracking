import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {electronEnhancer} from 'redux-electron-store';
import {isPrebuilt} from '../utils/process-helpers';
import {reducers} from '../reducers';
import {BaseStore} from './base-store';
import {WINDOW_TYPES, windowType} from '../utils/shared-constants';

/**
 * This store is used by any renderer process. It receives data from the
 * main process via redux-electron-store.
 */
export class RendererStore<T> extends BaseStore<T> {
  private windowType: windowType;

  constructor() {
    super();

    const {devMode, testMode, windowType} = global.loadSettings;
    this.windowType = windowType;

    const toCompose = [
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
      toCompose.push(require('../renderer/components/dev-tools').DevTools.instrument());
    }

    this.store = createStore<T>(
      combineReducers<T>(reducers),
      (compose as any)(...toCompose)
    ) as BaseStore<T>;
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
      return {
        app: true,
        appTeams: true,
        notifications: true,
        settings: true,
        events: true,
        teams: true,
        dialog: true,
        downloads: true,
        tray: true,
        windows: true,
        windowFrame: true
      };
    case WINDOW_TYPES.NOTIFICATIONS:
      return {
        appTeams: true,
        notifications: true,
        windows: true,
        windowFrame: true,
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
    case WINDOW_TYPES.OTHER:
      return {
        settings: true
      };
    }

    throw new Error(`unsupported window type ${type} is specified`);
  }
}
