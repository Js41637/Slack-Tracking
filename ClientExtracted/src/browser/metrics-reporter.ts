/**
 * @module Browser
 */ /** for typedoc */

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

// Public: Reporter handles sending metrics and command information to Google
// Analytics.
export class MetricsReporter {
  public commandCount: object;
  public reporterStartTime: number;
  private readonly mainWindow: Electron.WebContents;

  constructor(mainWindow: Electron.BrowserWindow) {
    this.mainWindow = mainWindow.webContents;
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
  public sendEvent(category: string, action: string, label: string | number | null | undefined, value: number = 0): Observable<boolean> {
    if (!this.mainWindow) return Observable.of(false);
    this.mainWindow.send('reporter:sendEvent', { category, action, label, value });
    return Observable.of(true);
  }

  // Public: Send a performance-related timing event, whose timing is determined
  // by a {Subscription}. The clock starts when you call the method, and stops when
  // you Dispose the return value
  //
  // category - the category of event to bucket the event under.
  // name - the name of the perfomance event to log.
  //
  // Returns a {Subscription} that will log the event when disposed.
  public sendTimingDisposable(category: string, name: string): Subscription {
    const start = Date.now();

    return new Subscription(() => {
      const elapsed = Date.now() - start;
      this.sendTiming(category, name, elapsed);
    });
  }

  // Public: Disposes the reporter and sends an event indicating the session has
  // completed.
  public dispose(): Observable<boolean> {
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
  public sendTiming(category: string, name: string, value: number, label?: string): Observable<boolean> {
    if (!this.mainWindow) return Observable.of(false);

    this.mainWindow.send('reporter:sendTiming', { category, name, value, label });
    return Observable.of(true);
  }

  // Private: Sends an event indicating that a menu item or other command was
  // invoked.
  //
  // Returns an {Observable} that signals completion
  public sendCommand(commandName: string) {
    this.commandCount = this.commandCount || {};
    this.commandCount[commandName] = this.commandCount[commandName] || 0;
    this.commandCount[commandName]++;

    this.sendEvent(commandName.split(':')[0], 'command', commandName, this.commandCount[commandName]);
  }
}
