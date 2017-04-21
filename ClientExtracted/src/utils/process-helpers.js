/**
 * @module Utilities
 */ /** for typedoc */

// NB: Memoize me cap'n!
let isRunningFromPrebuilt;

/**
 * Returns whether or not the Electron binary we're running was prebuilt or not (ie. what ships
 * with the `electron` package on npm).
 *
 * @return {Boolean}    Is the app running from a prebuilt binary?
 */
function isPrebuilt() {
  isRunningFromPrebuilt = isRunningFromPrebuilt || !!process.execPath.match(/[\\\/](electron-prebuilt|electron)[\\\/]/);
  return isRunningFromPrebuilt;
}

module.exports = { isPrebuilt };
