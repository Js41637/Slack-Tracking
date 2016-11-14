import logger from '../logger';
import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {electronEnhancer} from 'redux-electron-store';
import {p} from '../get-path';
import * as reducers from '../reducers';
import fillShape from '../utils/fill-shape';
import {isPrebuilt} from '../utils/process-helpers';

import BaseStore from './base-store';
import KeychainStorage from '../browser/keychain-storage';
import LocalStorage from '../browser/local-storage';
import MigrationManager from '../browser/migration-manager';

import {BASE, TEAMS, SETTINGS} from '../actions';

// The shape of the data to persist in local storage
const persistShape = {
  app: {
    selectedTeamId: true,
    teamsByIndex: true,
    windowSettings: true
  },
  settings: true,
  teams: true
};

// The shape of the data to persist in the OS keychain
const keychainShape = {
  app: {
    credentials: true
  }
};

/**
 * This store is for the browser / main process which loads data from
 * `localStorage` and handles all updates through the reducers.
 */
export default class BrowserStore extends BaseStore {
  constructor() {
    super();

    let toCompose = [
      applyMiddleware(this.logDispatches),
      electronEnhancer({
        postDispatchCallback: this.postDispatchCallback.bind(this)
      })
    ];

    this.store = createStore(
      combineReducers(reducers.default),
      compose(...toCompose)
    );

    // Specify what data is to be saved to and loaded from localStorage
    this.persistShape = persistShape;
    this.keychainShape = keychainShape;

    this.subscribePostDispatch((action) => {
      if (action.shouldSave) {
        logger.info(`Saving store due to ${action.type}`);
        this.saveSync();
      }
    });

    this.localStorage = new LocalStorage(p`${'userData'}/redux-state.json`);
    this.keychainStorage = new KeychainStorage(this.localStorage);
    this.loadPersistentStores();
    this.loadKeychainStores();

    let isDev = global.loadSettings.devMode && isPrebuilt();
    let hasDevEnv = global.loadSettings.devEnv && global.loadSettings.devEnv.length > 1;

    let settings = this.getState().settings;

    if (process.platform === 'darwin' && !settings.hasMigratedData.macgap && !hasDevEnv) {
      this.loadMacGapData(isDev);
    } else if (process.platform !== 'darwin' && !settings.hasMigratedData.browser) {
      this.loadLegacyData();
    }
  }

  dispatch(action) {
    super.dispatch(action);
    this.throttledSave();
  }

  loadPersistentStores() {
    let storedData = this.load() || {};
    let updatePayload = {updated: fillShape(storedData, this.persistShape)};

    this.dispatch({
      type: BASE.LOAD_PERSISTENT,
      data: updatePayload
    });
  }

  loadKeychainStores() {
    let storedData = this.loadFromKeychain() || {};
    let updatePayload = {updated: fillShape(storedData, this.keychainShape)};

    this.dispatch({
      type: BASE.LOAD_PERSISTENT,
      data: updatePayload,
      omitKeysFromLog: ['password']
    });
  }

  loadLegacyData() {
    let updated = MigrationManager.getBrowserData();
    updated.settings = updated.settings || { hasMigratedData: { browser: true }};
    updated.settings.hasMigratedData = updated.settings.hasMigratedData || { browser: true};
    updated.settings.hasMigratedData.browser = true;

    if (updated) {
      this.dispatch({
        type: BASE.LOAD_LEGACY,
        data: {updated}
      });
    }
  }

  loadMacGapData(isDevMode) {
    let newTeams = MigrationManager.getMacGapData(isDevMode);
    if (newTeams) {
      this.dispatch({
        type: TEAMS.ADD_NEW_TEAMS,
        data: newTeams
      });
    }

    this.dispatch({
      type: SETTINGS.UPDATE_SETTINGS,
      data: {
        hasMigratedData: {
          macgap: true
        }
      }
    });
  }

  load() {
    let data = null;
    try {
      data = JSON.parse(this.localStorage.getItem('state'));
    } catch (e) {
      logger.info('No state in localStorage, starting from scratch');
    }
    return data;
  }

  loadFromKeychain() {
    let data = null;
    try {
      data = this.keychainStorage.load();
    } catch (e) {
      logger.info('No state in keychain, starting from scratch');
    }
    return data;
  }

  throttledSave() {
    try {
      let dataToSave = fillShape(this.getState(), this.persistShape);
      this.localStorage.setItem('state', JSON.stringify(dataToSave));
    } catch (e) {
      logger.error(`Couldn't save storage: ${e}`);
    }
  }

  /**
   * Saves the store synchronously. This is necessary when, for example, we
   * are exiting the app.
   */
  saveSync() {
    let dataToSave = fillShape(this.getState(), this.persistShape);
    this.localStorage.setItemSync('state', JSON.stringify(dataToSave));
    this.saveToKeychainSync();
  }

  saveToKeychainSync() {
    try {
      let dataToSave = fillShape(this.getState(), this.keychainShape);
      this.keychainStorage.save(dataToSave);
    } catch (e) {
      logger.error(`Couldn't save to keychain: ${e}`);
    }
  }
}
