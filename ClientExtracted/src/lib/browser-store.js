import assignIn from 'lodash.assignin';
import {applyMiddleware, createStore, combineReducers, compose} from 'redux';
import {persistStore, autoRehydrate} from 'redux-persist';
import {AsyncNodeStorage} from 'redux-persist-node-storage';
import {electronEnhancer} from 'redux-electron-store';
import createFilter from 'redux-persist-transform-filter';
import createEncryptor from 'redux-persist-transform-encrypt';
import fs from 'graceful-fs';
import promisify from '../promisify';

import {logger} from '../logger';
import {p} from '../get-path';
import {isPrebuilt} from '../utils/process-helpers';
import {shallowEqual} from '../utils/shallow-equal';
import * as reducers from '../reducers';

import {BaseStore} from './base-store';
import {LocalStorage} from '../browser/local-storage';
import MigrationManager from '../browser/migration-manager';

import {TEAMS, SETTINGS, MIGRATIONS} from '../actions';

const pfs = promisify(fs);

// The keys to persist in local storage.
const persistWhitelist = [
  'appTeams',
  'dialog',
  'settings',
  'teams',
  'windowFrame'
];

// Controls the subkeys that are persisted. If a filter isn't defined, all of
// the state is persisted.
const filterByReducer = {
  appTeams: ['selectedTeamId', 'teamsByIndex'],
  dialog: ['credentials'],
  windowFrame: ['windowSettings']
};

// We're more interested in obfuscating the user's proxy credentials than
// encrypting them, so we just keep this key here.
const encryptor = createEncryptor({
  secretKey: '7c5f5fc4-eae8-4edf-89b6-abd01cfd0f10',
  whitelist: ['dialog']
});

// The prefix to use for our storage filenames.
const keyPrefix = 'slack-';

/**
 * This store is for the browser / main process which persists state using
 * redux-persist.
 */
export default class BrowserStore extends BaseStore {

  /**
   * Creates a new BrowserStore instance.
   *
   * @param  {Object} options
   * @param  {String} options.storagePath     The path to persist data files to
   * @param  {String} options.reduxStatePath  The path to the legacy Redux state file
   */
  constructor({storagePath, reduxStatePath} = {}) {
    super();
    this.storagePath = storagePath || p`${'userData'}/storage`;
    this.reduxStatePath = reduxStatePath || p`${'userData'}/redux-state.json`;
    this.isTestMode = !!reduxStatePath;

    let toCompose = [
      applyMiddleware(this.logDispatches),
      electronEnhancer({
        postDispatchCallback: this.postDispatchCallback.bind(this)
      }),
      autoRehydrate()
    ];

    this.store = createStore(
      combineReducers(reducers.default),
      compose(...toCompose)
    );
  }

  /**
   * Returns the store to its default state.
   */
  async resetStore() {
    if (this.persistor) await this.persistor.purge();
  }

  /**
   * Causes the store to persist certain keys to local files and hydrates the
   * store from the given storage directory.
   *
   * @return {Promise}  A Promise indicating completion
   */
  async loadPersistentState() {
    let filters = Object.keys(filterByReducer).map((reducer) => {
      return createFilter(reducer, filterByReducer[reducer]);
    });

    await new Promise((res, rej) => {
      this.persistor = persistStore(this.store, {
        whitelist: persistWhitelist,
        storage: new AsyncNodeStorage(this.storagePath),
        transforms: [...filters, encryptor],
        keyPrefix
      }, (err, restoredState) => {
        if (err) {
          rej(err);
        } else {
          res(restoredState);
        }
      });
    });
  }

  /**
   * Migrates state from older versions of the app, specifically the MacGap app
   * and versions that relied on our redux-state JSON file.
   *
   * @return {Promise}  A Promise indicating completion
   */
  async migrateLegacyState() {
    let {devMode, devEnv} = global.loadSettings;
    if (devEnv && devEnv.length > 1) return;

    let {hasMigratedData} = this.getState().settings;
    let didMigrateData = {...hasMigratedData};

    if (!hasMigratedData.redux) {
      hasMigratedData = this.populateStoreFromReduxState(hasMigratedData);

      // Because the legacy state file also kept track of migrations, we need
      // to copy that forward into `didMigrateData`.
      assignIn(didMigrateData, {
        redux: true,
        macgap: hasMigratedData.macgap
      });
    }

    if (!hasMigratedData.macgap && process.platform === 'darwin') {
      await this.populateStoreFromMacGap(devMode && isPrebuilt());
      assignIn(didMigrateData, {macgap: true});
    }

    if (!shallowEqual(hasMigratedData, didMigrateData)) {
      this.dispatch({
        type: SETTINGS.UPDATE_SETTINGS,
        data: {hasMigratedData: didMigrateData}
      });
    }
  }

  /**
   * Performs one-time migration from our legacy redux-state JSON file.
   *
   * @param  {Object} hasMigratedData An object that specifies which migrations are done
   * @return {Object}                 An object that specifies which migrations are done,
   *                                  taking into account the legacy state
   */
  populateStoreFromReduxState(hasMigratedData) {
    let localStorage = new LocalStorage(this.reduxStatePath);
    let stateBlob = localStorage.getItem('state');

    if (stateBlob) {
      try {
        let data = JSON.parse(stateBlob);
        this.dispatch({type: MIGRATIONS.REDUX_STATE, data});

        // So, we have state to migrate. That means its notion of what
        // migrations have already run is accurate, rather than our current.
        hasMigratedData = data.settings.hasMigratedData;

        // These are from old migrations that we no longer need to do.
        delete hasMigratedData['browser'];
        delete hasMigratedData['renderer'];

        // Delete old redux state file
        this.pruneOldReduxStore();
      } catch (err) {
        logger.warn(`Migrating Redux state failed: ${err.message}`);
      }
    }

    return hasMigratedData;
  }

  /**
   * Performs one-time migration from the legacy Mac app (built on MacGap).
   *
   * @param  {Boolean} isDevMode  True if running in developer mode
   * @return {Promise}            A Promise indicating completion
   */
  async populateStoreFromMacGap(isDevMode) {
    let newTeams = await MigrationManager.getMacGapData(isDevMode);

    if (newTeams) {
      this.dispatch({
        type: TEAMS.ADD_NEW_TEAMS,
        data: newTeams,
        selectTeam: true
      });
    }
  }

  /**
   * Performs a one-time deletion of a no longer needed redux-store.json
   */
  async pruneOldReduxStore() {
    if (this.isTestMode) return;
    const hasOldFile = !!fs.statSyncNoException(this.reduxStatePath);

    if (hasOldFile) {
      try {
        await pfs.unlink(this.reduxStatePath);
      } catch (err) {
        logger.warn(`Could not remove old redux-state file: ${err ? err.message : '(no error)'}`);
      }
    }
  }
}
