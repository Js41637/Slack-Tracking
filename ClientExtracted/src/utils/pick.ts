/**
 * @module Utilities
 */ /** for typedoc */

import { pickBy } from './pick-by';

/**
 * A more lightweight implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} props The property identifiers to pick.
 * @returns {Object} Returns the new object.
 */
export function pick<TResult extends {}, T extends {}>(object: T = {} as T, ...props: Array<string | Array<string>>) {
  const _props = (props.length === 1 && Array.isArray(props[0])) ? props[0] as Array<string> : props;
  return pickBy<TResult, T>(object, (_v: any, key: string) => _props.includes(key));
}
