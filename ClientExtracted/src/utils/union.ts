import * as includes from 'lodash.includes';

/**
 * A lightweight implementation of `_.union`, creating an array of unique values,
 * in order, from all of the provided arrays.
 *
 * @static
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * union([1, 2], [4, 2], [2, 1]);
 * // => [1, 2, 4]
 */
export function union(...arrays: Array<Array<any>>): Array<any> {
  const result: Array<any> = [];

  arrays.forEach((v = []) => v.forEach((av) => {
    if (!includes(result, av)) result.push(av);
  }));

  return result;
}
