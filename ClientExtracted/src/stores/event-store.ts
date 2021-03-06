/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';

export interface StoreEvent {
  name: string;
  timestamp?: number;
}

/**
 * A store for temporal actions, which do not persist state, but still need to
 * notify subscribers. We attach a timestamp indicating when the event last
 * occurred. Additional data can be included with the event, but it must adhere
 * to the signature defined here.
 */
export class EventStore {
  public getEvent(eventName: string): StoreEvent {
    const events = Store.getState().events;

    if (events[eventName] === undefined) {
      throw new Error(`Event ${eventName} does not exist. Check for typo, EventStore or the appropriate shape in WindowStore`);
    }
    return events[eventName];
  }
}

const eventStore = new EventStore();
export {
  eventStore
};
