import {Observable, Scheduler} from 'rx';

const newCoolOperators = {
  guaranteedThrottle: function(time, scheduler=Scheduler.timeout) {
    return this
      .map((x) => Observable.timer(time, scheduler).map(() => x))
      .switch();
  },

  retryAtIntervals: function(maxRetries=3) {
    return this.retryWhen((errors) => retryWithDelayOrError(errors, maxRetries));
  }
};

/**
 * Use in conjunction with `Observable.retryWhen` to retry a sequence some
 * number of times with a delay between each retry. If `maxRetries` is
 * exceeded, this sequence will error out.
 *
 * @param  {Observable} errors  An Observable sequence of errors from `retryWhen`
 * @param  {Number} maxRetries  Maximum number of times to try before throwing an error
 * @return {Observable}         An Observable sequence of retries with a delay
 */
function retryWithDelayOrError(errors, maxRetries) {
  return Observable.range(1, maxRetries + 1)
    .zip(errors, (i, e) => {
      return { attempts: i, error: e };
    })
    .flatMap(({attempts, error}) => {
      return attempts <= maxRetries ?
        Observable.timer(attempts * 1000) :
        Observable.throw(error);
    });
}

for (let key of Object.keys(newCoolOperators)) {
  Observable.prototype[key] = newCoolOperators[key];
}
