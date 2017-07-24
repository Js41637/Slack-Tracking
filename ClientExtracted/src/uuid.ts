/**
 * @module Utilities
 */ /** for typedoc */

import * as fs from 'fs';
import { p } from './get-path';
import { logger } from './logger';
import { UUID_FILENAME } from './utils/shared-constants';

const uuidLocation = p`${'userData'}/${UUID_FILENAME}`;

//memoize value to not read file system every time
let uuidValue: string;
let sessionIdValue: string;
/**
 * Returns uuid value of given installation, generate one if not exists.
 * If there isn't available uuid stored in memory, this function will try to attempt
 * 1. read stored file `${userData}/installation`
 * 2. if not, generate new uuid and store into file via b64 encoded
 * and return generated value.
 *
 * Generated uuid file is not being removed by `reset app data`, only cleared when
 * user uninstalls either manually remove storage data. This will allow to preserve
 * single user machine regardless of client is being updated.
 */
function getInstanceUuid(): string {
  if (!!uuidValue) {
    logger.debug(`return memoized uuidValue`);
    return uuidValue;
  }

  logger.debug(`There is no memoized uuid, try to read from uuidLocation at ${uuidLocation}`);

  if (fs.statSyncNoException(uuidLocation)) {
    try {
      const fileContents = fs.readFileSync(uuidLocation, 'utf-8');
      uuidValue = (Buffer.from(fileContents, 'base64')).toString('utf-8');

      logger.debug(`read uuid from file successful`);
      return uuidValue;
    } catch (e) {
      logger.warn('failed to read uuid from stored location, generating new one', e);
    }
  } else {
    logger.debug(`could not located uuid from location, generate new one`);
  }

  //lazy-require uuid module only if uuid is not available
  uuidValue = require('uuid/v4')();

  try {
    fs.writeFileSync(uuidLocation, Buffer.from(uuidValue!).toString('base64'));
  } catch (e) {
    logger.warn('failed to write uuid into file', e);
  }

  return uuidValue;
}

/**
 * Returns `session` id of desktop client, which represents one lifetime cycle of
 * desktop applition from start to exit. This value is volatile and recreates each time
 * application starts.
 *
 * To establish multi-process singleton, it uses internal memoized value as well as
 * our global.loadSettings object for lightweight access and allow bailing to return empty string
 * if value is not ready.
 */
function getSessionId(): string {
  if (sessionIdValue) {
    return sessionIdValue;
  }

  if (global && global.loadSettings && global.loadSettings.sessionId) {
    return global.loadSettings.sessionId;
  }

  return '';
}

/**
 * Initialize new session id to be used for getSessionId.
 * Unlike uuid value, this will be explicitly initialize only once in application creation
 * in `main` function.
 */
const initializeSessionId = () => {
  if (!!getSessionId()) {
    throw new Error('Do not attempt initialize session id more than once');
  }
  sessionIdValue = Buffer.from(`${getInstanceUuid()}_${(new Date()).getTime()}`).toString('base64');
};

export {
  getInstanceUuid,
  getSessionId,
  initializeSessionId,
};
