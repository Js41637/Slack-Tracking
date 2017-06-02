/**
 * @module Utilities
 */ /** for typedoc */

 import * as url from 'url';

/**
 * Check if the given URL has a hostname that includes 'slack.com'. This will
 * succeed for /messages, /min, & Enterprise URLs, but not third-party sites.
 *
 * @param {String} [url=''] The URL to test
 * @returns {Boolean}       The result of the test
 */
export function isSlackURL(input: string = '') {
  const hostname = url.parse(input || '').hostname || '';
  return hostname.toLowerCase().includes('slack.com');
}
