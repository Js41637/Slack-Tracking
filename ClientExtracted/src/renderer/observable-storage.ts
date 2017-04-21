/**
 * @module Renderer
 */ /** for typedoc */

import { Subscription } from 'rxjs/Subscription';
import { logger } from '../logger';

export class ObservableStorage {
  public data: any;
  private readonly localStorage: Storage;
  private readonly storageSubscription = new Subscription(() => this.save());

  /**
   * Creates an instance of ObservableStorage.
   *
   * @param {String} localStorageKey the key to persist the data under in local storage
   * @param {Object} options optional values for testing. Currently:
   *
   * @memberOf ObservableStorage
   */
  constructor(private readonly localStorageKey: string,
              options: {
                initialState?: any;
                localStorage?: Storage;
              } = {}) {
    const { initialState, localStorage } = options;

    this.localStorage = localStorage || global.localStorage;
    this.data = initialState || this.load() || {};
  }

  /**
   * Reloads data from the backing storage. Normally not necessary to
   * call explicitly.
   *
   * @returns {Object} stored data object
   *
   * @memberOf ObservableStorage
   */
  public load(): any {
    const json = this.localStorage.getItem(this.localStorageKey)!;
    try {
      return JSON.parse(json);
    } catch (e) {
      logger.error(`Couldn't load storage for object: ${this.localStorageKey}: ${e}`);
      return {};
    }
  }

  /**
   * Saves data to the backing storage. Normally not necessary to
   * call explicitly, as long as the class is Disposed properly
   *
   * @memberOf ObservableStorage
   */
  public save(): void {
    try {
      logger.debug(`Attempting to save key: ${this.localStorageKey}`);
      this.localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
    } catch (e) {
      logger.error(`Couldn't save storage for object: ${this.localStorageKey}: ${e}`);
    }
  }

  /**
   * Clean up the subscriptions taken out by {ObservableStorage}
   *
   * @memberOf ObservableStorage
   */
  public dispose(): void {
    this.storageSubscription.unsubscribe();
  }
}
