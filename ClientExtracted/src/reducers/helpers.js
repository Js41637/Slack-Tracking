import objectMerge from '../utils/object-merge';
import {BASE} from '../actions';

/**
 * Handles actions that override existing state across reducers, for restoring
 * from a local file or migrating settings from an old version.
 *
 * @param  {Object} state The existing state
 * @param  {String} {type The type of action
 * @param  {Object} data} The data attached to the action
 * @param  {String} key   The subtree this action applies to. Because the data
 * attached to the action contains a root state tree, we want to pick off just
 * the key that applies to this reducer.
 *
 * @return {Object}       The new state
 */
export default function handlePersistenceForKey(state, {type, data}, key) {
  const isBrowser = process.type === 'browser';
  const isRenderer = process.type === 'renderer' && !process.guestInstanceId;

  switch (type) {
  case BASE.LOAD_PERSISTENT:
    // Only the store in the browser process should restore local state
    if (!isBrowser || !data.updated[key]) return state;
    return objectMerge(state, data.updated[key]);

  case BASE.LOAD_LEGACY:
    // Only the stores in the browser and main renderer processes should load
    // state from pre-2.0 versions
    if (!isBrowser && !isRenderer) return state;
    if (!data.updated[key]) return state;

    return objectMerge(state, data.updated[key]);
  default:
    return state;
  }
}
