/**
 * @module CustomOperators
 */ /** for typedoc */

import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { async } from 'rxjs/scheduler/async';

  // Provides utility function to ActionsObservable for pure-side-effect epic does not need to dispatch further action
export const completeAction = (o: Observable<any>) => o.ignoreElements();

/* tslint:disable:object-literal-shorthand */
export const newCoolOperators = {
  guaranteedThrottle: function<T>(this: Observable<T>, time: number, scheduler: Scheduler = async) {
    return this
      .map((x: any) => Observable.timer(time, scheduler).map(() => x))
      .switch();
  },

  retryAtIntervals: function<T>(this: Observable<T>, maxRetries: number = 3) {
    return this.retryWhen((errors: any) => retryWithDelayOrError(errors, maxRetries));
  }
};
/* tslint:enable */

/**
 * Use in conjunction with `Observable.retryWhen` to retry a sequence some
 * number of times with a delay between each retry. If `maxRetries` is
 * exceeded, this sequence will error out.
 *
 * @param  {Observable} errors  An Observable sequence of errors from `retryWhen`
 * @param  {Number} maxRetries  Maximum number of times to try before throwing an error
 * @return {Observable}         An Observable sequence of retries with a delay
 */
function retryWithDelayOrError(errors: Observable<any>, maxRetries: number): Observable<number> {
  return Observable.range(1, maxRetries + 1)
    .zip(errors, (i, e) => {
      return { attempts: i, error: e };
    })
    .flatMap(({ attempts, error }) => {
      return attempts <= maxRetries ?
        Observable.timer(attempts * 1000) :
        Observable.throw(error);
    });
}

for (const key of Object.keys(newCoolOperators)) {
  Observable.prototype[key] = newCoolOperators[key];
}


//supply type definition of custom operators
declare module 'rxjs/Observable' {
  interface Observable<T> {
    guaranteedThrottle: typeof newCoolOperators.guaranteedThrottle;
    retryAtIntervals: typeof newCoolOperators.retryAtIntervals;
  }
}
