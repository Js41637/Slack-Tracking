import logger from '../logger';
import {p} from '../get-path';
import {Subject} from 'rxjs/Subject';
import fs from 'graceful-fs';
import {sync as writeFileAtomicSync} from 'write-file-atomic';
import '../rx-operators';

// Public: This class is a copy of the DOM LocalStorage API, backed by our local
// settings file. Make sure to not use this directly, but use the instance in
// {SlackApplication} or else you'll have multiple instances competing with each
// other
class LocalStorage {
  constructor(storagePath=null) {
    this.storagePath = storagePath || p`${'userData'}/local-settings.json`;
    logger.info(`Creating local storage instance at path: ${this.storagePath}`);

    try {
      this.data = JSON.parse(fs.readFileSync(this.storagePath));
    } catch (e) {
      logger.error(`Couldn't load ${this.storagePath}: ${e.message}`);
      this.data = {};
    }

    this.saveDebounce = new Subject();
    this.saveDebounce.throttleTime(250).subscribe(() => this.save());
  }

  getItem(key) {
    return this.data[key];
  }

  key(index) {
    return Object.keys(this.data)[index];
  }

  setItem(key, value) {
    this.data[key] = value;
    this.length = Object.keys(this.data).length;
    this.saveDebounce.next(true);
  }

  removeItem(key) {
    delete this.data[key];
    this.length = Object.keys(this.data).length;
    this.saveDebounce.next(true);
  }

  clear() {
    this.data = {};
    this.length = 0;
    this.saveDebounce.next(true);
  }

  setItemSync(key, value) {
    this.data[key] = value;
    this.length = Object.keys(this.data).length;
    this.save();
  }

  save() {
    try {
      writeFileAtomicSync(this.storagePath, JSON.stringify(this.data));
    } catch (e) {
      logger.error(`Couldn't save to ${this.storagePath}: ${e.message}`);
    }
  }
}

module.exports = LocalStorage;
