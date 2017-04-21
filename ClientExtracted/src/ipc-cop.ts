/**
 * @module IPC
 */ /** for typedoc */

const v8Util = (global.process as any).atomBinding('v8_util');
const now = (window && window.performance ? () => window.performance.now() : require('performance-now'));

let isSetup = false;

const overrideThreshold: any = {
  sendSync: 100
};

function stubMethod(origMethod: Function, methodName: string): Function {
  return (...args: Array<any>) => {
    const startTime = now();
    const retval = origMethod(...args);
    const endTime = now();

    const threshold = overrideThreshold[origMethod as any] || 250;
    if (endTime - startTime > threshold) {
      console.log(`*** IPC Method ${methodName} took ${endTime - startTime}ms! ***`); //tslint:disable-line:no-console

      let stack = null;
      try { throw new Error(); } catch (e) { stack = e.stack; }
      console.log(`Parameters: ${JSON.stringify(args)}\nStack:\n${stack}`); //tslint:disable-line:no-console
    } else {
      console.log(`IPC Method ${methodName} took ${endTime - startTime}ms, that's cool`); //tslint:disable-line:no-console
    }

    return retval;
  };
}

export function start() {
  if (isSetup) return;

  const toProfile = ['send', 'sendSync', 'sendtoHost'];
  const origIpc = v8Util.getHiddenValue(global, 'ipc');

  for (const key of toProfile) {
    if (!origIpc[key]) continue;
    origIpc[key] = stubMethod(origIpc[key], key);
  }

  isSetup = true;
}
