/**
 * @module Main/EdgeLoader
 */ /** for typedoc */

import * as fs from 'graceful-fs';
import * as path from 'path';
import { promisify } from './promisify';
import { StringMap } from './utils/shared-constants';

// NB: edge-loader is used super early, so we have to delay-initialize these libraries
let edge: any = null;

/**
 * Runs an Edge.js script that contains C# code.
 *
 * @param  {Object} options
 * @param  {String} options.absolutePath  The absolute path to the script
 * @param  {Boolean} options.isSync  True to run this script synchronously,
 * false to return an awaitable `Promise`
 * @param  {Object} options.args  An object to pass to the script's `Invoke`
 * method
 *
 * @return {Object}   The result of the script, if run synchronously, or a
 * `Promise` if run async. Null if the script could not be run.
 */
export function runScript(options: {
  absolutePath: string,
  isSync: boolean,
  args: any
}): Promise<object> | object | null {
  if (process.platform !== 'win32') {
    throw new Error("Don't try to load Edge.js on non-Windows");
  }

  edge = edge || require('edge-atom-shell');

  const { absolutePath, isSync, args } = options;
  let slackNotifierLocation = path.join(path.dirname(process.execPath), 'SlackNotifier.dll');

  // NB: We can't dely on `loadSettings` until the application is created, and
  // we call some Edge.js scripts even earlier than that.
  if (global.loadSettings && global.loadSettings.devMode) {
    const devNotifier = path.join(
      __dirname, '..', 'resources', 'win', 'notifier', 'src', 'bin', 'Release', 'SlackNotifier.dll');

    if (fs.statSyncNoException(devNotifier)) slackNotifierLocation = devNotifier;
  }

  let edgeFunc: StringMap<any> = {
    source: fs.readFileSync(absolutePath, 'utf8'),
    references: [slackNotifierLocation]
  };

  const precompiledDll = absolutePath
    .replace('.csx', '.dll')
    .replace('app.asar', 'app.asar.unpacked');

  if (fs.statSyncNoException(precompiledDll)) {
    edgeFunc = {
      assemblyFile: precompiledDll,
      typeName: 'Startup',
      methodName: 'Invoke'
    };
  }

  const script = edge.func(edgeFunc);

  try {
    return isSync ?
      script(args, true) :
      promisify(script)(args).then((notifyOrError: any) => {
        if (typeof notifyOrError === 'string') {
          return Promise.reject(new Error(notifyOrError));
        }

        if (typeof notifyOrError === 'function') {
          return promisify(notifyOrError);
        }

        return Promise.resolve(notifyOrError);
      });
  } catch (error) {
    console.log(`Unable to execute ${absolutePath}: ${error}`); //tslint:disable-line:no-console
    return null;
  }
}
