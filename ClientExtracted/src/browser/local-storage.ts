/**
 * @module Browser
 */ /** for typedoc */

import { logger } from '../logger';
import { p } from '../get-path';
import { Subject } from 'rxjs/Subject';
import * as fs from 'graceful-fs';
import { sync as writeFileAtomicSync } from 'write-file-atomic';
import 'rxjs/add/operator/throttleTime';
import '../rx-operators';

/**
 * Public: This class is a copy of the DOM LocalStorage API, backed by our local
 * settings file. Make sure to not use this directly, but use the instance in
 * {SlackApplication} or else you'll have multiple instances competing with each
 * other
 * @class LocalStorage
 */
export class LocalStorage {
  private readonly storagePath: string;
  private readonly saveDebounce: Subject<boolean> = new Subject();
  private data: any;
  private length: number = 0;

  constructor(storagePath?: string) {
    this.storagePath = storagePath || p`${'userData'}/local-settings.json`;
    logger.info(`Initializing local storage instance at path: ${this.storagePath}`);

    if (fs.statSyncNoException(this.storagePath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8'));
      } catch (err) {
        logger.error(`Couldn't load ${this.storagePath}: ${err.message}`);
        this.data = {};
      }
    } else {
      this.data = {};
    }

    this.saveDebounce.throttleTime(250).subscribe(() => this.save());
  }

  public getItem<T>(key: string): T | any {
    return this.data[key];
  }

  public key(index: number): string {
    return Object.keys(this.data)[index];
  }

  public setItem(key: string, value: any): void {
    this.data[key] = value;
    this.length = Object.keys(this.data).length;
    this.saveDebounce.next(true);
  }

  public removeItem(key: string): void {
    delete this.data[key];
    this.length = Object.keys(this.data).length;
    this.saveDebounce.next(true);
  }

  public clear(): void {
    this.data = {};
    this.length = 0;
    this.saveDebounce.next(true);
  }

  public setItemSync(key: string, value: any): void {
    this.data[key] = value;
    this.length = Object.keys(this.data).length;
    this.save();
  }

  public save(): void {
    try {
      writeFileAtomicSync(this.storagePath, JSON.stringify(this.data));
    } catch (e) {
      logger.error(`Couldn't save to ${this.storagePath}: ${e.message}`);
    }
  }
}
