/**
 * @module Utilities
 */ /** for typedoc */

/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @example
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * mapValues(users, function(o) { return o.age; });
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 *
 * // The `_.property` iteratee shorthand.
 * mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */

export function mapValues<T, R>(object: T, iteratee: string | ((element: R) => any)): T;
export function mapValues<T, R, TMapped>(object: T, iteratee: string | ((element: R) => any)): T | TMapped {
  const result = {} as T | TMapped;
  const _iteratee = (typeof iteratee === 'string') ? (v: any) => v[iteratee] : iteratee;
  Object.keys(object).forEach((key) => result[key] = _iteratee(object[key]));

  return result;
}
