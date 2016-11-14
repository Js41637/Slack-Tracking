/**
 * A more lightweight implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @param {Object} object The source object.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function pickBy(object = {}, predicate = () => true) {
  let result = {};

  Object.keys(object).forEach((key) => {
    let value = object[key];

    if (predicate(value, key)) result[key] = value;
  });

  return result;
}

export default pickBy;