/**
 * @module Utilities
 */ /** for typedoc */

// Public: This method takes functions or objects which contain node.js-like
// async callback-based methods (i.e. methods whose last parameter is a callback,
// with parameters (err, rest...), where err is an {Error}), and turn them into
// methods that return a promise.
//
// For example:
//
//     void fs.readFile(path, opts, cb)
//
// becomes:
//
//     Promise fs.readFile(path, opts)
//
// This means that you can make Promise-based versions of node.js APIs directly via
// require:
//
//     const fs = promisify(require('fs'));
//
// funcOrObject - either a {Function} which is converted as described above, or
//                if an {Object}, every key that is a {Function} is converted via
//                promisify.
//
// Returns either a {Function} or an {Object}, based on funcOrObject.
export function promisify(funcOrObject: Function | Object): any {
  if (typeof funcOrObject === 'function') {
    return function(...args: Array<any>) {
      return new Promise(function(this: any, resolve: (reason: any) => void, reject: (reason: any) => void) {
        args.push((err: Error, ...rest: Array<any>) => {
          if (err) {
            reject(err);
          } else {
            resolve(rest.length === 1 ? rest[0] : rest);
          }
        });

        funcOrObject.apply(this, args);
      });
    };
  }

  if (typeof funcOrObject === 'object') {
    return Object.keys(funcOrObject).reduce((acc, x) => {
      acc[x] = promisify(funcOrObject[x]);
      return acc;
    }, {});
  }

  // Neither a func or an object, just return itself
  return funcOrObject;
}
