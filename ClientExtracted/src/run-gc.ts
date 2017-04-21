/**
 * @module Utilities
 */ /** for typedoc */

import * as collect from '@paulcbetts/gc';
import { Module } from 'module';
import { Subject } from 'rxjs/Subject';
import './rx-operators';

const gcSignal = new Subject();
gcSignal.throttleTime(1000).subscribe(() => runGCNow());

export function runGCNow(): void {
  const keys = Object.keys(Module._pathCache);
  for (let i = 0; i < keys.length; i++) { delete Module._pathCache[keys[i]]; } //tslint:disable-line:prefer-for-of

  collect();
}

export function requestGC(): void {
  gcSignal.next(true);
}
