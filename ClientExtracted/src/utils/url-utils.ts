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

/**
 * Returns the appropriate release notes URL for the current platform and
 * release channel.
 *
 * @param  {Bool} isPreRelease  True if on the alpha or beta channel
 * @return {String}             The release notes URL
 */
export function getReleaseNotesUrl(isPreRelease: boolean): string {
  let url = 'https://www.slack.com/apps/';
  switch (process.platform) {
  case 'win32': url += 'windows'; break;
  case 'darwin': url += 'mac'; break;
  case 'linux': url += 'linux'; break;
  }
  url += isPreRelease ? '/release-notes-beta' : '/release-notes';
  return url;
}
