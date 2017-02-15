import * as fs from 'graceful-fs';
import * as path from 'path';
import {Subject} from 'rxjs/Subject';
import {sync as writeFileSync} from 'write-file-atomic-fsync';

import {logger} from '../logger';

/**
 * Since we're doing an expensive fsync every time we write a file, let's
 * debounce it a bunch.
 */
const SAVE_DEBOUNCE_MS = 2000;

export type StorageOperationCallback = (error?: NodeJS.ErrnoException | undefined, data?: any) => void;

interface SetItemArguments {
  key: string;
  value: any;
  callback: StorageOperationCallback;
}

/**
 * Acts as a drop-in replacement for https://github.com/pellejacobs/redux-persist-node-storage,
 * removing all the cruft from https://github.com/lmaccherone/node-localstorage
 * and using a crash safe method for writing files.
 */
export class ReduxPersistStorage {
  private readonly reducerKeys: Array<string> = [];
  private readonly saveDebounce: Subject<SetItemArguments> = new Subject();

  constructor(private readonly storagePath: string,
              private readonly saveImmediateWhitelist: Array<string>) {

    if (fs.statSyncNoException(storagePath)) {
      this.reducerKeys = fs.readdirSync(storagePath);
    } else {
      fs.mkdirSync(storagePath);
    }

    // Group save calls by their reducer, since each has its own file. Then
    // debounce each file individually.
    this.saveDebounce
      .groupBy(({ key }) => key)
      .mergeMap((group) => group.debounceTime(SAVE_DEBOUNCE_MS))
      .subscribe(({ key, value, callback }) => this.setItemImmediately(key, value, callback));
  }

  public getItem(key: string, callback: StorageOperationCallback): void {
    const fileName = path.join(this.storagePath, key);
    const data = fs.readFileSync(fileName, 'utf8');
    callback(undefined, data);
  }

  public setItem(key: string, value: any, callback: StorageOperationCallback): void {
    if (this.saveImmediateWhitelist.includes(key)) {
      this.setItemImmediately(key, value, callback);
    } else {
      this.saveDebounce.next({ key, value, callback });
    }
  }

  public removeItem(key: string, callback: StorageOperationCallback): void {
    const fileName = path.join(this.storagePath, key);
    fs.unlinkSync(fileName);
    delete this.reducerKeys[key];
    callback();
  }

  public getAllKeys(callback: StorageOperationCallback): void {
    callback(undefined, this.reducerKeys);
  }

  private setItemImmediately(key: string, value: any, callback: StorageOperationCallback): void {
    try {
      const startTime = Date.now();
      const fileName = path.join(this.storagePath, key);
      writeFileSync(fileName, value.toString());
      const elapsed = Date.now() - startTime;
      logger.debug(`Writing reducer ${key} to file took ${elapsed} ms`);
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
