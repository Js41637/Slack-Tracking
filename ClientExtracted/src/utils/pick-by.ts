/**
 * A more lightweight implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @param {Object} object The source object.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
export function pickBy<TResult extends {}, T extends {}>(object: T = {} as T,
                                                         predicate: (element: any, key?: string) => boolean = (_element) => true): TResult {
  const result: TResult = {} as TResult;

  Object.keys(object).forEach((key) => {
    const value = object[key];

    if (predicate(value, key)) result[key] = value;
  });

  return result;
}
