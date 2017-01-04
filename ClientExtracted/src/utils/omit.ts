import {pickBy} from './pick-by';
import * as includes from 'lodash.includes';

/**
 * The opposite of `pick`; this method creates an object composed of the
 * own and inherited enumerable string keyed properties of `object` that are
 * not omitted.
 *
 * @param {Object} object The source object.
 * @param {...(string|string[])} [props] The property identifiers to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
export function omit<TResult extends {}, T extends {}>(object: T, ...props: Array<string | number | Array<string>>): TResult {
  const keys = props.map(String);
  return pickBy<TResult, T>(object, (_v: any, key: string) => !includes(keys, key));
}
