/**
 * @module Stores
 */ /** for typedoc */

import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import { persistStore, autoRehydrate, Persistor } from 'redux-persist';
import { electronEnhancer } from 'redux-electron-store';
import * as createFilter from 'redux-persist-transform-filter';
import createEncryptor from 'redux-persist-transform-encrypt';
import * as fs from 'graceful-fs';
import { promisify } from '../promisify';

import { logger } from '../logger';
import { p } from '../get-path';
import { isPrebuilt } from '../utils/process-helpers';
import { reducers } from '../reducers';
import { createEpicMiddleware } from 'redux-observable';
import { epics } from '../epics';

import { BaseStore } from './base-store';
import { LocalStorage } from '../browser/local-storage';
import { migrationManager } from '../browser/migration-manager';
import { MigrationType } from '../utils/shared-constants';
import { ReduxPersistStorage } from '../browser/redux-persist-storage';

import { TEAMS, MIGRATIONS } from '../actions';
import { Action } from '../actions/action';

const pfs = promisify(fs) as typeof fs;

// The keys to persist to local files.
const persistWhitelist = [
  'appTeams',
  'dialog',
  'migrations',
  'settings',
  'teams',
  'unreads',
  'windowFrame'
];

// Controls the subkeys that are persisted. If a filter isn't defined, all of
// the state is persisted.
const filterByReducer = {
  appTeams: ['selectedTeamId', 'teamsByIndex', 'teamsToSignOut'],
  dialog: ['credentials'],
  windowFrame: ['windowSettings']
};

// The prefix to use for our storage filenames.
const keyPrefix = 'slack-';

// Controls keys that are never reset.
const permanentKeys = [
  `${keyPrefix}migrations`
];

// Controls which keys are saved immediately. By default our storage mechanism
// debounces writes to avoid thrashing the file system. But some changes should
// take effect immediately (e.g., add / remove teams, team usage on exit).
const saveImmediateWhitelist = [
  `${keyPrefix}teams`,
  `${keyPrefix}settings`
];

const saveEventuallyWhitelist = [
  `${keyPrefix}unreads`
];

// We're more interested in obfuscating the user's proxy credentials than
// encrypting them, so we just keep this key here.
const encryptor = createEncryptor({
  secretKey: '7c5f5fc4-eae8-4edf-89b6-abd01cfd0f10',
  whitelist: ['dialog']
});

/**
 * This store is for the browser / main process which persists state using
 * redux-persist.
 */
export class BrowserStore<T> extends BaseStore<T> {
  private storagePath: string;
  private reduxStatePath: string;
  private persistor: Persistor;
  private storage: ReduxPersistStorage;

  /**
   * Creates a new BrowserStore instance.
   *
   * @param  {Object} options
   * @param  {String} options.storagePath     The path to persist data files to
   * @param  {String} options.reduxStatePath  The path to the legacy Redux state file
   */
  constructor({ storagePath, reduxStatePath }: {
    storagePath?: string;
    reduxStatePath?: string;
  } = {}) {
    super();
    this.storagePath = storagePath || p`${'userData'}/storage`;
    this.reduxStatePath = reduxStatePath || p`${'userData'}/redux-state.json`;

    const epicMiddleware = createEpicMiddleware(epics);

    const toCompose = [
      applyMiddleware(this.logDispatches),
      applyMiddleware(epicMiddleware),
      electronEnhancer({
        postDispatchCallback: this.postDispatchCallback.bind(this),
        // Allows synced actions to pass through all enhancers
        // check https://github.com/samiskin/redux-electron-store/issues/31#issuecomment-260240981 for details of this practice
        dispatchProxy: (action: Action<any>) => this.store.dispatch(action),
      }),
      autoRehydrate()
    ];

    this.store = createStore<T>(
      combineReducers<T>(reducers),
      (compose as any)(...toCompose)
    ) as BaseStore<T>;
  }

  /**
   * Returns the store to its default state.
   */
  public async resetStore(): Promise<void> {
    if (this.persistor) {
      const keys = await this.storage.getAllKeys();
      const keysToPurge = keys
        .filter((key) => !permanentKeys.includes(key))
        .map((key) => key.slice(keyPrefix.length));

      await this.persistor.purge(keysToPurge);
    }
  }

  /**
   * Causes the store to persist certain keys to local files and hydrates the
   * store from the given storage directory.
   *
   * @return {Promise}  A Promise indicating completion
   */
  public async loadPersistentState(): Promise<any> {
    const filters = Object.keys(filterByReducer).map((reducer) => {
      return createFilter.default(reducer, filterByReducer[reducer]);
    });

    this.storage = new ReduxPersistStorage({
      storagePath: this.storagePath,
      saveImmediateWhitelist,
      saveEventuallyWhitelist
    });

    await new Promise((res, rej) => {
      this.persistor = persistStore(this.store, {
        whitelist: persistWhitelist,
        storage: this.storage,
        transforms: [...filters, encryptor],
        keyPrefix
      } as any, (err: Error, restoredState: any) => {
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
  public async migrateLegacyState(): Promise<void> {
    const { devMode, devEnv } = global.loadSettings;
    if (devEnv && devEnv.length > 1) return;

    const state = this.getState() as any;
    const initialLaunch = !state.migrations.macgap && !state.migrations.redux;
    let wasMigrationPerformed = false;
    let hasMigratedRedux = this.hasMigrated(state, 'redux');
    let hasMigratedMacGap = this.hasMigrated(state, 'macgap');

    if (!hasMigratedRedux) {
      logger.info(`BrowserStore: Let's migrate Redux state`);

      // Because the legacy state file also kept track of migrations, we need
      // to take that into account
      hasMigratedMacGap = hasMigratedMacGap || this.populateStoreFromReduxState();
      hasMigratedRedux = true;
      wasMigrationPerformed = true;
    }

    if (!hasMigratedMacGap && process.platform === 'darwin') {
      logger.info(`BrowserStore: Let's migrate teams from MacGap`);

      await this.populateStoreFromMacGap(devMode && isPrebuilt());
      hasMigratedMacGap = true;
      wasMigrationPerformed = true;
    }

    if (wasMigrationPerformed || initialLaunch) {
      const migrationsPerformed = {
        redux: hasMigratedRedux,
        macgap: hasMigratedMacGap
      };

      logger.info(`BrowserStore: Finished migration, make a note of it`);

      this.dispatch({
        type: MIGRATIONS.COMPLETED,
        data: migrationsPerformed
      });
    }
  }

  /**
   * We've kept track of migrations in different places over time.
   *
   * @param state The current store state
   * @param type  The type of migration to check
   */
  private hasMigrated(state: any, type: MigrationType) {
    return (state.migrations && state.migrations[type]) ||
      (state.settings.hasMigratedData && state.settings.hasMigratedData[type]);
  }

  /**
   * Performs one-time migration from our legacy redux-state JSON file.
   *
   * @return {Boolean}  True if we already migrated MacGap, and made note of it
   *                    in the legacy state
   */
  private populateStoreFromReduxState() {
    const localStorage = new LocalStorage(this.reduxStatePath);
    const stateBlob = localStorage.getItem('state');
    let hasMigratedMacGap = false;

    if (stateBlob) {
      try {
        const data = JSON.parse(stateBlob);
        this.dispatch({ type: MIGRATIONS.REDUX_STATE, data });

        // So, we have state to migrate. That means its notion of what
        // migrations have already run is accurate, rather than our current.
        hasMigratedMacGap = data.settings.hasMigratedData.macgap;

        // Delete old redux state file
        this.pruneOldReduxStore();
      } catch (err) {
        logger.warn(`BrowserStore: Migrating Redux state failed:`, err);
      }
    }

    return hasMigratedMacGap;
  }

  /**
   * Performs one-time migration from the legacy Mac app (built on MacGap).
   *
   * @param  {Boolean} isDevMode  True if running in developer mode
   * @return {Promise}            A Promise indicating completion
   */
  private async populateStoreFromMacGap(isDevMode: boolean): Promise<void> {
    const newTeams = await migrationManager.getMacGapData(isDevMode);

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
  private async pruneOldReduxStore() {
    const hasOldFile = !!fs.statSyncNoException(this.reduxStatePath);

    if (hasOldFile) {
      try {
        await pfs.unlink(this.reduxStatePath);
      } catch (err) {
        logger.warn(`BrowserStore: Could not remove old redux-state file:`, err);
      }
    }
  }
}
