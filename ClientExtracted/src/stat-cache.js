/**
 * @hidden
 */ /** for typedoc */

// NB: This is loaded very very early, so we don't use nice things like import
var lru = require('lru-cache')({max: 256, maxAge: 250/*ms*/});
var fs = require('fs');
var origLstat = fs.lstatSync.bind(fs);

// NB: The biggest offender of thrashing lstatSync is the node module system
// itself, which we can't get into via any sane means.
require('fs').lstatSync = function(p) {
  let r = lru.get(p);
  if (r) return r;

  r = origLstat(p);
  lru.set(p, r);
  return r;
};
