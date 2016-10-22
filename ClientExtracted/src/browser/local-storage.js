import _ from 'lodash';
import logger from '../logger';
import {p} from '../get-path';
import rx from 'rx';
import fs from 'graceful-fs';
import {sync as writeFileAtomicSync} from 'write-file-atomic';

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

    this.saveDebounce = new rx.Subject();
    this.saveDebounce.throttle(250).subscribe(() => this.save());
  }

  getItem(key) {
    return this.data[key];
  }

  key(index) {
    return _.keys(this.data)[index];
  }

  setItem(key, value) {
    this.data[key] = value;
    this.length = _.keys(this.data).length;
    this.saveDebounce.onNext(true);
  }

  removeItem(key) {
    delete this.data[key];
    this.length = _.keys(this.data).length;
    this.saveDebounce.onNext(true);
  }

  clear() {
    this.data = {};
    this.length = 0;
    this.saveDebounce.onNext(true);
  }

  setItemSync(key, value) {
    this.data[key] = value;
    this.length = _.keys(this.data).length;
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
