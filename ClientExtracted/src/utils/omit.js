import pickBy from './pick-by';

/**
 * The opposite of `pick`; this method creates an object composed of the
 * own and inherited enumerable string keyed properties of `object` that are
 * not omitted.
 *
 * @param {Object} object The source object.
 * @param {...(string|string[])} [props] The property identifiers to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
function omit(object, ...props) {
  let keys = props.map(String);
  return pickBy(object, (v, key) => !keys.includes(key));
}

export default omit;
