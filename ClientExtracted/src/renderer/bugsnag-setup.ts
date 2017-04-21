/**
 * @module Renderer
 */ /** for typedoc */

// The API key linked to slack-winssb.
const apiKey = 'acaff8df67924f677747922423057034';

import * as nslog from 'nslog';
import * as errorParser from 'error-stack-parser';

import { sanitizeStacks } from '../sanitize-stacks';
import { logger } from '../logger';

function buildEnhancedContext(payload: {
  stacktrace?: string;
  context: string;
}): string {
  try {
    if (!payload) {
      logger.error('payload to report into bugsnag is empty, do not proceed to build context');
      return '';
    }

    if (!payload.stacktrace || !(payload.stacktrace.length > 0)) {
      return payload.context;
    }

    const error = new Error();
    error.stack = payload.stacktrace;
    const parsedStack = errorParser.parse(error);

    if (parsedStack && parsedStack.length > 0) {
      const root = parsedStack[0];
      return `${root.fileName}`;
    } else {
      //bugsnag urlencodes context, makes sanitizing doesn't work correctly.
      //return decoded to get accurate sanitized.
      return decodeURI(payload.context);
    }
  } catch (e) {
    logger.error(`failed to parse stack trace to build context, return original context`, e);
    return decodeURI(payload.context);
  }
}

export function setupBugsnag(shouldSuppressErrors: boolean, version: string): void {
  const resolvedVersion = version || global.loadSettings.version;
  if (!resolvedVersion) {
    logger.error(`version string is not available, bugsnag report might not be sent correctly`);
  }
  window.Bugsnag.apiKey = apiKey;
  window.Bugsnag.appVersion = resolvedVersion || '';
  window.Bugsnag.releaseStage = shouldSuppressErrors ? 'development' : 'production';
  window.Bugsnag.projectRoot = 'https://renderer';

  window.Bugsnag.beforeNotify = (payload) => {
    if (shouldSuppressErrors) {
      nslog('Unhandled Exception: \n');
      nslog(`${payload.stacktrace}\n`);
    }

    const context = buildEnhancedContext(payload);
    payload.context = sanitizeStacks(context);
    payload.stacktrace = sanitizeStacks(payload.stacktrace);
    payload.file = sanitizeStacks(payload.file);
    delete payload.url;

    logger.error(`Bugsnag payload:`, payload);
    return payload;
  };
}
