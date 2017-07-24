/**
 * @module Renderer
 */ /** for typedoc */

// The API key linked to slack-winssb.
const apiKey = 'acaff8df67924f677747922423057034';
import * as errorParser from 'error-stack-parser';

import { logger } from '../logger';
import { sanitizeStacks } from '../sanitize-stacks';
import { TELEMETRY_EVENT, track } from '../telemetry';

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

  if (!window.Bugsnag) {
    logger.debug(`setupBugsnag: Bugsnag reporter is not loaded, skipping reporter setup.
      If this is a production build, ensure the package was generated correctly`);
    return;
  }

  window.Bugsnag.apiKey = apiKey;
  window.Bugsnag.appVersion = resolvedVersion || '';
  window.Bugsnag.releaseStage = shouldSuppressErrors ? 'development' : 'production';
  window.Bugsnag.projectRoot = 'https://renderer';

  window.Bugsnag.beforeNotify = (payload) => {
    if (shouldSuppressErrors) {
      let nslog;
      try {
        nslog = require('nslog');
      } catch (err) {
        nslog = console.log.bind(console);
      }
      nslog('Unhandled Exception: \n');
      nslog(`${payload.stacktrace}\n`);
    }

    const context = buildEnhancedContext(payload);
    payload.context = sanitizeStacks(context);
    payload.stacktrace = sanitizeStacks(payload.stacktrace);
    payload.file = sanitizeStacks(payload.file);
    delete payload.url;

    track(TELEMETRY_EVENT.DESKTOP_CRASH, {
      crashOrigin: 'renderer',
      crashMessage: payload.context,
      crashes: 1
    });

    logger.error(`Bugsnag payload:`, payload);
    return payload;
  };
}
