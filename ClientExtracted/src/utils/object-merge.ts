import {isObject} from './is-object';

export function objectMerge<T extends {}, U extends {}>(objA: T, objB: U): T & U {
  const merged = {};
  Object.keys(objA).forEach((key) => {
    const a = objA[key];
    const b = objB[key];

    if (a === b) {
      merged[key] = a;
    } else if (!Array.isArray(a) && !Array.isArray(b) && isObject(a) && isObject(b)) {
      merged[key] = objectMerge(a, b);
    } else {
      merged[key] = b !== undefined ? b : a; // default to b if it exists
    }
  });

  Object.keys(objB).forEach((key) => {
    if (objA[key] === undefined) // fill in the rest
      merged[key] = objB[key];
  });

  return merged as T & U;
}
