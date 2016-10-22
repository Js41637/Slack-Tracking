  /*eslint callback-return:0 */

import crypto from 'crypto';
import ipc from '../ipc-rx';

import rx from 'rx';

global.ga = () => {};

// Public: Reporter handles sending metrics and command information to Google
// Analytics.
export default class Reporter {
  constructor() {
    this.reporterStartTime = Date.now();

    this.getCachedUserId().subscribe((userId) => {
      global.ga('set', 'appId', 'slack-winssb');
      global.ga('set', 'appVersion', this.version());
      global.ga('set', 'userId', userId);
      global.ga('set', 'forceSSL', true);
      global.ga('set', 'useBeacon', true);
      global.ga('send', 'pageview');
    });

    this.disp = rx.Disposable.create(() => {
      this.sendEvent('session', 'ended', Date.now() - this.reporterStartTime);
    });
  }

  // Public: Sends an event to GA. An event is a single instance of something
  // happening with an associated optional integer value with it
  //
  // category - Typically the object that was interacted with (e.g. button)
  // action - The type of interaction (e.g. click)
  // label - (Optional) Useful for categorizing events (e.g. nav buttons)
  // value - An optional value that must be a non-negative {Number} (specifically, an int)
  //
  // Returns an {Observable} that signals completion
  sendEvent(category, action, label, value) {
    //return global.ga('send', 'event', category, action, label, value);
  }

  // Public: Send a performance-related timing event, whose timing is determined
  // by a {Disposable}. The clock starts when you call the method, and stops when
  // you Dispose the return value
  //
  // category - the category of event to bucket the event under.
  // name - the name of the perfomance event to log.
  //
  // Returns a {Disposable} that will log the event when disposed.
  sendTimingDisposable(category, name) {
    let start = Date.now();

    return rx.Disposable.create(() => {
      let elapsed = Date.now() - start;
      this.sendTiming(category, name, elapsed);
    });
  }

  // Public: Disposes the reporter and sends an event indicating the session has
  // completed.
  dispose() {
    this.disp.dispose();
  }

  // Public: Sets us up to handle events remoted from the browser process.
  //
  // Returns a {Disposable} which unhooks the events
  handleBrowserEvents() {
    let ret = new rx.CompositeDisposable();

/*
    ret.add(ipc.listen('reporter:sendEvent').subscribe((args) => {
      let {category, action, label, value} = args[0];
      this.sendEvent(category, action, label, value);
    }));

    ret.add(ipc.listen('reporter:sendTiming').subscribe((args) => {
      let {category, name, label, value} = args[0];
      this.sendTiming(category, name, value, label);
    }));
*/

    return ret;
  }

  // Private: Sends a performance-related event via an explicit value.
  // category - A string for categorizing all user timing variables into logical
  //            groups (e.g jQuery).
  // name - A string to identify the variable being recorded. (e.g. JavaScript
  //        Load).
  // value - The elapsed time in milliseconds
  // label - (Optional) A string that can be used to add flexibility in visualizing user
  //         timings in the reports. (e.g. Google CDN)
  //
  // Returns an {Observable} that signals completion
  sendTiming(category, name, value, label) {
    //return global.ga('send', 'timing', category, name, value, label);
  }

  // Private: Determines the app version via the package.json
  //
  // Returns a version {String}
  version() {
    return require('../../package.json').version;
  }

  // Private: Creates a unique ID that we can correlate users under. We use a
  // combination of MAC address and user ID, but combined in such a way so that
  // it's not identifiable
  //
  // Returns an {Observable} Promise which provides a user ID
  createUserId() {
    let ret = new rx.AsyncSubject();
    ret.onNext(require('node-uuid').v4());
    ret.onCompleted();
    /*

    let callback = (error, macAddress) => {
      let username = process.env.USER || process.env.USERNAME || 'dunnolol';

      if (error) {
        ret.onNext(require('node-uuid').v4());
      } else {
        // NB: If we don't include another piece of information, the MAC address
        // could be extracted from this SHA1 simply by generating all SHA1s from
        // every possible MAC address
        ret.onNext(crypto.createHash('sha1').update(macAddress + username, 'utf8').digest('hex'));
      }

      ret.onCompleted();
    };

    try {
      require('getmac').getMac(callback);
    } catch (error) {
      callback(error);
    }
    */

    return ret;
  }

  getCachedUserId() {
    this._userId = this._userId || this.createUserId();
    return this._userId;
  }
}
