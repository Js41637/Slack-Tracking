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
function union(...arrays) {
  let result = [];

  arrays.forEach((v = []) => v.forEach((av) => {
    if (!result.includes(av)) result.push(av);
  }));

  return result;
}

export default union;