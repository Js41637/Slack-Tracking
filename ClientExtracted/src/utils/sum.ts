function sumArray<T, R>(array: Array<T> = [], iteratee: ((value: T) => T | R) | string = (v) => v) {
  if (!array || array.length === 0) return 0;
  const _iteratee = (typeof iteratee === 'string') ? (v: {}) => v[iteratee] : iteratee;
  return array.map(_iteratee).reduce((p = 0, c = 0) => p + (Number.isInteger(c) ? c : 0));
}

function sumObject<T, R>(object: any = {}, iteratee: ((value: T) => T | R) | string = (v) => v) {
  if (!object || Object.keys(object).length === 0) return 0;
  const _iteratee = (typeof iteratee === 'string') ? (v: {}) => v[iteratee] : iteratee;
  return sumArray(Object.keys(object).map((k) => _iteratee(object[k])));
}

export interface Dictionary<T> {
    [index: string]: T;
}

/**
 * A more lightweight implementation of `_.sum`
 *
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function|string} [iteratee] The function invoked per iteration.
 * @returns {number} Returns the sum.
 * @example
 *
 * sum([4, 6]);
 * // => 10
 *
 * var objects = [
 *   { 'n': 4 },
 *   { 'n': 6 }
 * ];
 *
 * sum(objects, function(object) {
 *   return object.n;
 * });
 * // => 10
 *
 * // using the `property` callback shorthand
 * sum(objects, 'n');
 * // => 10
 */
export function sum(): number;
export function sum<T>(collection?: Array<T> | Dictionary<T> | any): number;
export function sum<T>(collection?: Array<T> | Dictionary<T>, iteratee?: string): number;
export function sum<T>(collection?: Array<T> | Dictionary<T>, iteratee?: (value: T) => T | any): number;
export function sum<T, R>(collection?: Array<T> | Dictionary<T>, iteratee?: ((value: T) => T | R) | string): number {
  return (Array.isArray(collection)) ? sumArray(collection as Array<T>, iteratee) : sumObject(collection, iteratee);
}
