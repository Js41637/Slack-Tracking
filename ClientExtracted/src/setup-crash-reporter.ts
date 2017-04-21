/**
 * @module Bugsnag
 */ /** for typedoc */

import { getInstanceUuid } from './uuid';
import { logger } from './logger';
import { promisify } from './promisify';

export function setupCrashReporter(extras: any): void {
  // NB: App Store builds can't use the crashReporter
  if (process.platform === 'darwin' && process.mas) return;

  // NB: OS X version of Breakpad requires it to be set up erry'where
  if (process.type === 'renderer' && process.platform !== 'darwin') return;

  const extraParameter = Object.assign({ instanceUid: getInstanceUuid() }, extras);

  require('electron').crashReporter.start({
    productName: 'Slack',
    companyName: 'Slack Technologies',
    submitURL: 'https://slack.com/apps/breakpad',
    autoSubmit: true,
    extra: extraParameter
  });
}

/**
 * Provides way to force flush out already uploaded crash reports.
 */
export async function flushCurrentReports(): Promise<void> {
  logger.info('CrashReporter: clear uploaded crash reports');
  const reporter = require('electron').crashReporter;
  const primraf = promisify(require('rimraf'));
  const path = require('path');

  try {
    const crashReportPath = (reporter as any).getCrashesDirectory();
    const parsedPath = path.parse(crashReportPath);

    if (parsedPath && parsedPath.name && parsedPath.name === 'Slack Crashes') {
      await primraf(`${crashReportPath}/**/!(operation_log)`);
    } else {
      logger.warn(`CrashReporter: given crash report path ${crashReportPath} seems not valid, skipping flush`);
    }
  } catch (e) {
    logger.warn('CrashReporter: not able to clear crash reports, will retry next time application starts', e);
  }
}
