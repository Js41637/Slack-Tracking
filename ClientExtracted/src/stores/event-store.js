import Store from '../lib/store';

/**
 * A store for temporal actions, which do not persist state, but still need to
 * notify subscribers. We attach a timestamp indicating when the event last
 * occurred. Additional data can be included with the event, but it must adhere
 * to the signature defined here.
 */ 
class EventStore {
  getEvent(eventName) {
    let events = Store.getState().events;
    
    if (events[eventName] === undefined) {
      throw new Error(`Event ${eventName} does not exist. Check for typo, EventStore or the appropriate shape in WindowStore`);
    }
    return events[eventName];
  }
}

export default new EventStore();
