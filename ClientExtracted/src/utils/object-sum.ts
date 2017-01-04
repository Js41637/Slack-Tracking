import {isObject} from './is-object';

/**
 * An accumulator function that will keep a running sum of all keys defined on
 * the iteratee object. This can be passed to `reduce` directly. If any key is
 * not defined on the accumulator, it will be created.
 *
 * @example
 *  let acc = objectSum({a: 1, b: 2, c: 3}, {a: 3, b: 2, c: 1});
 *  console.log(acc); // {a: 4, b: 4, c: 4}
 *
 * @param  {Object} acc The accumulated object
 * @param  {Object} x   The iteratee
 * @return {Object}     The accumulated object
 */
export function objectSum<T extends {}, U extends {}>(acc: T, x: U): T & U | T {
  if (!isObject(x)) return acc;

  for (const key of Object.keys(x)) {

    acc[key] = (typeof x[key] === 'number') ?
      (acc[key] || 0) + x[key] :
      objectSum(acc[key] || {}, x[key]);
  }

  return acc;
}
