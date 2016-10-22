import rx from 'rx';

// Public: Reporter handles sending metrics and command information to Google
// Analytics.
export default class MetricsReporter {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
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
  sendEvent(category, action, label, value=0) {
    if (!this.mainWindow) return;

    this.mainWindow.send('reporter:sendEvent', {category, action, label, value});
    return rx.Observable.return(true);
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
    return this.sendEvent('session', 'ended', Date.now() - this.reporterStartTime);
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
    if (!this.mainWindow) return;

    this.mainWindow.send('reporter:sendTiming', {category, name, value, label});
    return rx.Observable.return(true);
  }

  // Private: Sends an event indicating that a menu item or other command was
  // invoked.
  //
  // Returns an {Observable} that signals completion
  sendCommand(commandName) {
    this.commandCount = this.commandCount || {};
    this.commandCount[commandName] = this.commandCount[commandName] || 0;
    this.commandCount[commandName]++;

    this.sendEvent(commandName.split(':')[0], 'command', commandName, this.commandCount[commandName]);
  }
}
