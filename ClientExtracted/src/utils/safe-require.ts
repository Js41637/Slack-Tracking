/**
 * @module Utilities
 */ /** for typedoc */

import { logger } from '../logger';

/**
 * Catches any errors thrown from `require`-ing a module. This is especially
 * useful for native Node modules, which can often throw exceptions on `require`
 * if they are missing OS-level dependencies.
 *
 * @param  {string} modulePath - The path to the module. You may have to
 * `require.resolve` it, otherwise the path will be relative to this file.
 * @param {string} [errorMessage] - An optional custom error message for if
 * require-ing the module fails. The module path and stack trace will be logged
 * no matter what.
 */
export function safeRequire(modulePath: string, errorMessage?: string): any {
  let moduleToRequire = null;

  try {
    moduleToRequire = require(modulePath);
  } catch (e) {
    if (errorMessage) {
      logger.error(`Couldn't initialize ${modulePath}: ${e} ${errorMessage}`);
    } else {
      logger.error(`Couldn't initialize ${modulePath}: ${e}`);
    }
  }

  return moduleToRequire;
}
