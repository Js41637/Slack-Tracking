import {isNumber, isObject} from 'lodash';

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
export default function objectSum(acc, x) {
  if (!isObject(x)) return acc;

  for (let key of Object.keys(x)) {

    acc[key] = isNumber(x[key]) ?
      (acc[key] || 0) + x[key] :
      objectSum(acc[key] || {}, x[key]);
  }

  return acc;
}
