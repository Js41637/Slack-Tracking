/**
 * Compares two arrays, returning true if equal, false if not equal.
 * Why not lodash? We got modern JS and can just use `every`.
 *
 * @param {Array} [a=[]]
 * @param {Array} [b=[]]
 * @returns {boolean} - The two arrays are equal
 */
function isEqualArrays(a = [], b = []) {
  if (a === b) return true;
  if (!a.length || !b.length || a.length !== b.length) return false;
  return a.every((e, i) => e === b[i]);
}

export default isEqualArrays;