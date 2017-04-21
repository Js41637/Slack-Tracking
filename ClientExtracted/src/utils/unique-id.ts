/**
 * @module Utilities
 */ /** for typedoc */

const Hashids = require('hashids');
const hashIds = new Hashids();
const pid = process.pid;

let currentId = 1;

export function uniqueId(): string {
  return hashIds.encode(pid, ++currentId, Date.now());
}
