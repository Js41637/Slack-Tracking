/**
 * @module Stores
 */ /** for typedoc */

import { logger } from '../logger';
import { ComponentBase } from './component-base';

export interface State {
  timestamp?: number;
}
/**
 * Check if the given state change is an event (i.e., does it have a timestamp
 * and is the timestamp newer than the previous). If so, look for a method on
 * the component that matches the event name, and return it.
 *
 * @param  {Object} component The component being updated
 * @param  {Object} event     The new state (a value from `syncState`)
 * @param  {String} eventName The name of the event (a key from `syncState`)
 * @param  {Object} prevState The previous state
 * @return {Function}         The handler for the event, or null if none was found
 */
export function stateEventHandler(component: ComponentBase,
                                  event: State,
                                  eventName: string,
                                  prevState: State): Function | null {
  if (event &&
    event.timestamp &&
    event.timestamp > prevState[eventName].timestamp) {

    const handler = component[eventName];

    if (handler && typeof handler === 'function') {
      // NB: Ensure this event is asynchronous, otherwise we can fall into a
      // Redux dispatch loop
      return ((...args: Array<any | Array<any>>) => process.nextTick(handler.bind(component, ...args)));
    } else {
      logger.warn(`${component.constructor.name} declares an event named ${eventName} but no method to handle it`);
      return null;
    }
  }
  return null;
}
