/**
 * @module Utilities
 */ /** for typedoc */

import * as path from 'path';
import electronType = require('electron');

let electronApp: typeof electronType.app;

if ('type' in process) {
  if (process.type === 'renderer') {
    electronApp = require('electron').remote.app;
  } else {
    electronApp = require('electron').app;
  }
}

// NB: Some environment variables are known to app.getPath and we don't have
// to worry about them disappearing on us. Use them instead.
const environmentVariableAliases = {
  HOME: 'home',
  USERPROFILE: 'home',
  APPDATA: 'appData',
  TEMP: 'temp',
  TMPDIR: 'temp'
};

const pathCache = { };

// Public: This method attempts to replace uses of 'process.env' in order to get
// locations of system folders such as the home directory, in a way that is more
// reliable and less prone to being messed with by system settings.
//
// key - Either a key that Electron's `app.getPath` accepts directly, or the name
//       of an environment variable. Unlike `app.getPath`, this method can be
//       called in both the browser and renderer processes.
//
// Returns a {String} which is the path for the given key.
export function getPath(key: string): string {
  if (pathCache[key]) return pathCache[key];

  let aliasKey = null;
  if (environmentVariableAliases[key]) {
    aliasKey = environmentVariableAliases[key];
  }

  let result = null;

  if (electronApp) {
    try {
      result = electronApp.getPath(aliasKey || key);
    } catch (e) {
      // NB: We'd like to log this but this method gets called too early
      //logger.debug(`Failed to get path for key, this may be expected: ${aliasKey || key}`);
    }
  }

  result = result || process.env[key];
  if (!result) {
    // NB: Try to fix up the most commonly fucked environment variables
    if (key.toLowerCase() === 'appdata' && process.env.USERPROFILE) {
      result = path.join(process.env.USERPROFILE, 'AppData', 'Roaming');
    }

    if (key.toLowerCase() === 'localappdata' && process.env.USERPROFILE) {
      result = path.join(process.env.USERPROFILE, 'AppData', 'Local');
    }
  }

  if (result) pathCache[key] = result;
  return result;
}

// Public: This method is a method that processes Tagged Template Strings
// (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings),
// that will take the values extracted from the string and pass them to
// {getPath}, convert the path to an absolute path, and return it. For example:
//
// p`${'HOME'}/Desktop` will get converted to "C:\Users\NAME\Desktop" on Win32.
//
// Note that all of the parameters in the template must be {String}s, because they
// will be sent to {getPath} as a parameter (so ${HOME} will be an error, but
// ${'HOME'} will work correctly).
//
// Returns a fully qualified path
export function p(literals: TemplateStringsArray, ...placeholders: Array<string| Array<string>>): string {
  const newVals = placeholders.map((x: string) => getPath(x) || x);
  let newPath = String.raw(literals, ...newVals);

  // Trim any number of trailing slashes. If included in path.resolve they will
  // reset the path to root.
  while (newPath.match(/[\\\/]$/)) newPath = newPath.slice(0, newPath.length - 1);
  const parts = newPath.split(/[\\\/]/).map((x) => x || '/');

  // Normalize `C:` to `C:\`, necessary when running from cmd.exe.
  if (process.platform === 'win32' && /:$/.test(parts[0])) parts[0] += '\\';

  try {
    return path.resolve(...parts);
  } catch (e) {
    return path.join(...parts);
  }
}

export function pn(literals: TemplateStringsArray, ...placeholders: Array<string| Array<string>>): string {
  const newPath = String.raw(literals, ...placeholders);
  const parts = newPath.split(/[\\\/]/).map((x) => x || '/');

  return path.join(...parts);
}
