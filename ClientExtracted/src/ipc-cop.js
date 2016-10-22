const v8Util = global.process.atomBinding('v8_util');
const now = (window && window.performance ? () => window.performance.now() : require('performance-now'));

let isSetup = false;

const overrideThreshold = {
  'sendSync': 100
};

function stubMethod(origMethod, methodName) {
  return (...args) => {
    let startTime = now();
    let retval = origMethod(...args);
    let endTime = now();
      
    let threshold = overrideThreshold[origMethod] || 250;
    if (endTime - startTime > threshold) {
      console.log(`*** IPC Method ${methodName} took ${endTime - startTime}ms! ***`);
      
      let stack = null;
      try { throw new Error();} catch(e) { stack = e.stack; }
      console.log(`Parameters: ${JSON.stringify(args)}\nStack:\n${stack}`);
    } else {
      console.log(`IPC Method ${methodName} took ${endTime - startTime}ms, that's cool`);
    }
    
    return retval;
  };
}

export default function start() {
  if (isSetup) return;
  
  const toProfile = ['send', 'sendSync', 'sendtoHost'];
  let origIpc = v8Util.getHiddenValue(global, 'ipc');
  
  for (let key of toProfile) { 
    if (!origIpc[key]) continue;
    origIpc[key] = stubMethod(origIpc[key], key);
  }
  
  isSetup = true;
}
