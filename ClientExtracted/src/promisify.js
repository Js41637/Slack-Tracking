import _ from 'lodash';

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
export default function promisify(funcOrObject) {
  if (typeof funcOrObject === 'function') {
    return function(...args) {
      return new Promise(function(resolve, reject) {
        args.push((err, ...rest) => {
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
    return _.reduce(Object.keys(funcOrObject), (acc, x) => {
      acc[x] = promisify(funcOrObject[x]);
      return acc;
    }, {});
  }

  // Neither a func or an object, just return itself
  return funcOrObject;
}
