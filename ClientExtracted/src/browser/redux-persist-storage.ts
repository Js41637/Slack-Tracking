/**
 * @module Browser
 */ /** for typedoc */

import * as fs from 'graceful-fs';
import * as path from 'path';
import { Storage } from 'redux-persist';
import { Subject } from 'rxjs/Subject';
import { Scheduler } from 'rxjs/Scheduler';
import { sync as writeFileSync } from 'write-file-atomic-fsync';

import { logger } from '../logger';
import '../rx-operators';

/**
 * Since we're doing an expensive fsync every time we write a file, let's
 * debounce it a bunch.
 */
const SAVE_DEBOUNCE_MS = 2000;
const EVENTUALLY_DEBOUNCE_MS = 30000;

export type StorageOperationCallback = (error?: NodeJS.ErrnoException | undefined, data?: any) => void;

interface SetItemArguments {
  key: string;
  value: any;
  callback: StorageOperationCallback;
}

export interface ReduxPersistStorageOptions {
  storagePath: string;
  saveImmediateWhitelist: Array<string>;
  saveEventuallyWhitelist: Array<string>;
  scheduler?: Scheduler;
}

/**
 * Acts as a drop-in replacement for https://github.com/pellejacobs/redux-persist-node-storage,
 * removing all the cruft from https://github.com/lmaccherone/node-localstorage
 * and using a crash safe method for writing files.
 */
export class ReduxPersistStorage implements Storage {
  private readonly storagePath: string;
  private readonly saveImmediateWhitelist: Array<string>;

  private readonly reducerKeys: Set<string> = new Set<string>();
  private readonly saveDebounce: Subject<SetItemArguments> = new Subject();

  constructor(options: ReduxPersistStorageOptions) {
    this.storagePath = options.storagePath;
    this.saveImmediateWhitelist = options.saveImmediateWhitelist;

    if (fs.statSyncNoException(this.storagePath)) {
      this.reducerKeys = new Set(fs.readdirSync(this.storagePath));
    } else {
      fs.mkdirSync(this.storagePath);
    }

    // Group save calls by their reducer, since each has its own file. Then
    // debounce each file individually.
    this.saveDebounce
      .groupBy(({ key }) => key)
      .mergeMap((group) => group.debounceTime(options.saveEventuallyWhitelist.includes(group.key) ?
        EVENTUALLY_DEBOUNCE_MS :
        SAVE_DEBOUNCE_MS,
        options.scheduler))
      .subscribe(({ key, value, callback }) => this.setItemImmediately(key, value, callback));
  }

  public getItem(key: string, callback: StorageOperationCallback): any {
    const fileName = path.join(this.storagePath, key);
    const data = fs.readFileSync(fileName, 'utf8');
    callback(undefined, data);
  }

  public setItem(key: string, value: any, callback: StorageOperationCallback): any {
    if (this.saveImmediateWhitelist.includes(key)) {
      this.setItemImmediately(key, value, callback);
    } else {
      this.saveDebounce.next({ key, value, callback });
    }
  }

  public removeItem(key: string, callback: StorageOperationCallback): any {
    try {
      logger.debug(`ReduxPersistStorage: Clearing ${key}`);
      const fileName = path.join(this.storagePath, key);
      fs.unlinkSync(fileName);
      this.reducerKeys.delete(key);
      callback();
    } catch (err) {
      callback(err);
    }
  }

  public getAllKeys(callback?: StorageOperationCallback): Promise<Array<string>> {
    if (callback) callback(undefined, [...this.reducerKeys]);
    return Promise.resolve([...this.reducerKeys]);
  }

  private setItemImmediately(key: string, value: any, callback: StorageOperationCallback): void {
    try {
      const startTime = Date.now();
      const fileName = path.join(this.storagePath, key);
      writeFileSync(fileName, value.toString());
      this.reducerKeys.add(key);
      const elapsed = Date.now() - startTime;
      logger.debug(`ReduxPersistStorage: Writing reducer ${key} to file took ${elapsed} ms`);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
