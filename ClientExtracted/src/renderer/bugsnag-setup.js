// The API key linked to slack-winssb.
const apiKey = 'acaff8df67924f677747922423057034';

import sanitizeStacks from '../sanitize-stacks';
import nslog from 'nslog';
import {logger} from '../logger';

export default function setupBugsnag(shouldSuppressErrors, version) {
  window.Bugsnag.apiKey = apiKey;
  window.Bugsnag.appVersion = version || global.loadSettings.version;
  window.Bugsnag.releaseStage = shouldSuppressErrors ? 'development' : 'production';
  window.Bugsnag.projectRoot = 'https://renderer';

  window.Bugsnag.beforeNotify = (payload) => {
    if (shouldSuppressErrors) {
      nslog("Unhandled Exception: \n");
      nslog(`${payload.stacktrace}\n`);
    }

    payload.context = sanitizeStacks(payload.context);
    payload.stacktrace = sanitizeStacks(payload.stacktrace);
    payload.file = sanitizeStacks(payload.file);
    delete payload.url;

    logger.error(`Bugsnag payload: ${JSON.stringify(payload, null, 2)}`);
    return payload;
  };
}
