import pickBy from './pick-by';

/**
 * A more lightweight implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property identifiers to pick.
 * @returns {Object} Returns the new object.
 */
function pick(object = {}, ...props) {
  let _props = (props.length === 1 && Array.isArray(props[0])) ? props[0] : props;
  return pickBy(object, (v, key) => _props.includes(key));
}

export default pick;