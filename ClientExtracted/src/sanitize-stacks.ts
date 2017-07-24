/**
 * @module Utilities
 */ /** for typedoc */

import * as path from 'path';

//Regex to flip all directory separators so stacks bucket correctly even if they're on disparate OSs
const separatorRegex = /\\/g;
export function sanitizeStacks(stackTraceString: string, appResourcePath?: string): string {
  const resolvedResourcePath = (appResourcePath || global.loadSettings.resourcePath);
  const resourcePath = resolvedResourcePath ? resolvedResourcePath.replace(separatorRegex, '/') : '';

  const stack = stackTraceString || '';

  // NB: If crashes happen in local ssb's JavaScript code (i.e. in team-sidebar, etcs),
  // we'll end up seeing full paths show up in crash stacks. Censor those
  // too, but make sure asar resource is the first part of the path
  const localResourcePath = path.resolve(resourcePath, '..').replace(separatorRegex, '/');

  // stack trace in payload comes with newline separated strings, split it,
  const lines = stack.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(separatorRegex, '/');

    while (line.indexOf(resourcePath) > -1) {
      line = line.replace(resourcePath, '');
    }

    while (line.indexOf(localResourcePath) > -1) {
      line = line.replace(localResourcePath, '');
    }

    lines[i] = line.replace(/^\/+/, '');
  }

  const sanitizedStack = lines.join('\n');
  return sanitizedStack;
}
