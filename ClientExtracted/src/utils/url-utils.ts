/**
 * @module Utilities
 */ /** for typedoc */

import * as url from 'url';
import { localeType } from '../i18n/intl';

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
 * @param  {localeType} locale  A locale string
 * @return {String}             The release notes URL
 */
export function getReleaseNotesUrl(isPreRelease: boolean, locale: localeType): string {
  const urlPrefix = 'https://www.slack.com';
  const langCode = locale.substr(0, 2).toLowerCase();

  let releaseNotesPrefix = urlPrefix;
  switch (langCode) {
    case 'en':
    default:
      releaseNotesPrefix += '/release-notes';
      break;
    case 'es':
      releaseNotesPrefix += `/intl/es-es/release-notes`;
      break;
    case 'de':
      releaseNotesPrefix += `/intl/de-de/release-notes`;
      break;
    case 'fr':
      releaseNotesPrefix += `/intl/fr-fr/release-notes`;
      break;
  }

  let url = releaseNotesPrefix;
  switch (process.platform) {
    case 'win32':
    default:
      url += '/windows';
      break;
    case 'darwin':
      url += '/mac';
      break;
    case 'linux':
      url += '/linux';
      break;
  }
  url += isPreRelease ? 'beta' : '';

  return url;
}

/**
 * Returns the appropriate Help Center URL for the user's current
 * locale.
 *
 * @param  {localeType}         A locale string
 * @return {String}             The Help Center URL
 */
export function getHelpCenterURL(locale: localeType): string {
  const helpCenterPrefix = 'https://get.slack.help/hc/';

  const langCode = locale.substr(0, 2).toLowerCase();
  switch (langCode) {
    case 'ja':
      return `${helpCenterPrefix}ja`;
    case 'es':
      return `${helpCenterPrefix}es`;
    case 'fr':
      return `${helpCenterPrefix}fr-fr`;
    case 'de':
      return `${helpCenterPrefix}de`;
    default:
      return `${helpCenterPrefix}en-us`;
  }
}
