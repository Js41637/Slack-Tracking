/**
 * @module SSBIntegration
 */ /** for typedoc */

import { remoteEval } from 'electron-remote';
import { logger } from '../logger';

export interface RemoteEvalOption {
  code: string;
  callback?: (err: Error | null, res?: any) => void;
}

export const executeRemoteEval = (options: RemoteEvalOption, window?: Electron.BrowserWindow) => {
  const code = options.code;
  const callback = options.callback || ((err: Error | null, res?: any) => {
    if (err) {
      logger.error(`executing ${code} failed: ${err.message}`);
      logger.error(err.stack!);
      return null;
    }

    return res;
  });

  return remoteEval(window, options.code)
    .then((res: any) => callback(null, res), callback);
};
