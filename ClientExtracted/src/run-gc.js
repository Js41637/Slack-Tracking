import collect from '@paulcbetts/gc';
import {Module} from 'module';
import {Subject} from 'rxjs/Subject';
import './rx-operators';

let gcSignal = new Subject();
gcSignal.throttleTime(1000).subscribe(() => runGCNow());

export function runGCNow() {
  let keys = Object.keys(Module._pathCache);
  for (let i=0; i < keys.length; i++) { delete Module._pathCache[keys[i]]; }

  collect();
}

export function requestGC() {
  gcSignal.next(true);
}
