import {Subscription} from 'rxjs/Subscription';
import logger from '../logger';

export default class ObservableStorage {
  // Public: Constructs a new Observable Storage object.
  //
  // localStorageKey - the key to persist the data under in local storage
  // options - an {Object} containing optional values for testing. Currently:
  //
  //     :initialState - The initial data in the cache (for testing)
  //     :localStorage - The Local Storage implementation to use
  constructor(localStorageKey, options={}) {
    this.localStorageKey = localStorageKey;
    let {initialState, localStorage} = options;

    this.localStorage = localStorage || global.localStorage;
    this.data = initialState || this.load() || {};

    this.disp = new Subscription(() => this.save());
  }

  // Public: Reloads data from the backing storage. Normally not necessary to
  // call explicitly.
  //
  // Returns the data
  load() {
    let json = this.localStorage.getItem(this.localStorageKey);
    try {
      return JSON.parse(json);
    } catch (e) {
      logger.error(`Couldn't load storage for object: ${this.localStorageKey}: ${e}`);
      return {};
    }
  }

  // Public: Saves data to the backing storage. Normally not necessary to
  // call explicitly, as long as the class is Disposed properly
  //
  // Returns Nothing
  save() {
    try {
      logger.debug(`Attempting to save key: ${this.localStorageKey}`);
      this.localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
    } catch (e) {
      logger.error(`Couldn't save storage for object: ${this.localStorageKey}: ${e}`);
    }
  }

  // Public: Clean up the subscriptions taken out by {ObservableStorage}
  //
  // Returns Nothing
  dispose() {
    this.disp.unsubscribe();
  }
}