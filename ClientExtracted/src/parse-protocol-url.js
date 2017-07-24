'use strict';

const url = require('url');
const querystring = require('querystring');

const expressionsToMatch = [{
  regex: /devEnv=(dev\d*|staging|qa\d*)/,
  onMatch: (match) => ({ devMode: true, devEnv: match[1] })
}, {
  regex: /releaseChannel=(beta|prod)/,
  onMatch: (match) => ({ releaseChannel: match[1] })
}, {
  regex: /openDevToolsOnStart/,
  onMatch: () => ({ openDevToolsOnStart: true })
}, {
  regex: /notReallyWindows10/,
  onMatch: () => ({ pretendNotReallyWindows10: true })
}, {
  regex: /magic-login/,
  onMatch: parseMagicLoginUrl
}, {
  regex: /\?(feature_.*=1)|(pri=\d*)/,
  onMatch: (match, theUrl) => ({
    webappParams: querystring.parse(theUrl.query)
  })
}];

/**
 * Parses a slack: protocol URL looking for certain items.
 *
 * @param {String} protoUrl The URL to parse
 *
 * @returns   An {Object} that may contain any of the following keys:
 *
 *            devMode - True if running in developer mode, which exposes devTools
 *            devEnv - The dev environment we are pointed at, e.g., 'dev13'
 *            releaseChannel - The release channel we are using, 'beta' or 'prod'
 *            magicLogin - An object with magic login details: the teamId and token
 *            openDevToolsOnStart - True to open devTools on app start
 *            pretendNotReallyWindows10 - True to act like older versions of Windows
 *            webappParams - An object with query parameters to forward to the webapp
 */
function parseProtocolUrl(protoUrl) {
  protoUrl = protoUrl || '';

  const theUrl = url.parse(protoUrl);
  if (theUrl.protocol !== 'slack:') return {};

  return expressionsToMatch.reduce((result, { regex, onMatch }) => {
    const match = protoUrl.match(regex);
    if (match) result = Object.assign(result, onMatch(match, theUrl));
    return result;
  }, {});
}

function parseMagicLoginUrl(match, theUrl) {
  const teamId = theUrl.host.toUpperCase();
  const pathComponents = theUrl.path.split('/');

  if (teamId.match(/T[A-Z0-9]{8}/) &&
    pathComponents.length === 3 &&
    pathComponents[1].match(/magic-login/)) {

    const magicLogin = {
      teamId: teamId,
      token: pathComponents[2]
    };

    return { magicLogin };
  }
}

module.exports = { parseProtocolUrl };
