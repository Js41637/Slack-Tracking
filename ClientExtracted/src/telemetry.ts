import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { logger } from './logger';
import './rx-operators';
import { noop } from './utils/noop';
import { StringMap } from './utils/shared-constants';
import { getInstanceUuid } from './uuid';

// telemetry request will be periodically trigger request per minute (60sec),
// instead of immeidately trigger for each. This will reduce load to backend server,
// especially buffered telemetry queue will be flattened
// so will have less numbers of actual request.
const TELEMETRY_QUEUE_BUFFERTIME = 60000;
const MAX_URL_LENGTH = 1500;
const REQUEST_TIMEOUT = 3000;

type telemetryEventType =
  'DESKTOP_TEAM_SWITCH' | 'DESKTOP_CLIENT_LAUNCH' |
  'DESKTOP_CRASH' | 'DESKTOP_CLIENT_RELOAD' |
  'DESKTOP_CLIENT_RESET';

const TELEMETRY_EVENT = {
  DESKTOP_TEAM_SWITCH: 'DESKTOP_TEAM_SWITCH' as telemetryEventType,
  DESKTOP_CLIENT_LAUNCH: 'DESKTOP_CLIENT_LAUNCH' as telemetryEventType,
  DESKTOP_CRASH: 'DESKTOP_CRASH' as telemetryEventType,
  DESKTOP_CLIENT_RELOAD: 'DESKTOP_CLIENT_RELOAD' as telemetryEventType,
  DESKTOP_CLIENT_RESET: 'DESKTOP_CLIENT_RESET' as telemetryEventType
};

/**
 * Payload definition for telemetry request.
 *
 */
interface TelemetryPayload {
  /**
   * Timestamp of telemetry payload.
   */
  tstamp: number;
  /**
   * Desktop client instance id.
   */
  instanceUid: string;
  /**
   * Telemetry event type
   */
  event: string;
  /**
   * Additional property to be delivered
   */
  args: StringMap<any>;
}

let windowSession: Electron.Session;
let userAgent: string;

/**
 * memoize session for main process telemetry request.
 *
 */
const setTelemetrySession = (window: Electron.BrowserWindow) => {
  if (process.type !== 'browser') {
    throw new Error('Only main process can set sessions');
  } else if (!!windowSession) {
    throw new Error('Session is already set');
  }
  windowSession = window.webContents.session;
  userAgent = window.webContents.getUserAgent();
};

/**
 * Operator to catch individual request to not break telemetry queue subscription.
 *
 */
const catchRequest = (o: Observable<any>) =>
  o.catch((e: any) => Observable.of(e).do((x) => logger.error(`Telemetry: Failed to send telemetry request`, x)));

/**
 * Provides interface to send telemetry information to our data warehouse
 *
 */
class Telemetry {
  private queue: Subject<TelemetryPayload>;
  private queueAwaiter: Promise<void>;
  private readonly endpoint: string;

  constructor() {
    this.endpoint = this.getTelemetryEndpoint();
    this.initializeRequestQueue();

    if (!this.endpoint) {
      logger.debug(`Telemetry: telemetry will not be sent, will be logged instead`);
    }
  }

  /**
   * Send telemetry request payload to data warehouse.
   *
   * To prevent simultaneous http request hit backend from single client,
   * each request will be queued instead of immediate flush.
   *
   * Note: This queue is unique per process.
   *
   * @param {string} event type of event
   * @param {StringMap<any>} args additional data to be delivered with event
   */
  public track(event: telemetryEventType, args: StringMap<any>): void {
    const payload = {
      tstamp: Date.now(),
      instanceUid: getInstanceUuid(),
      event,
      args
    };

    this.queue.next(payload);
  }

  /**
   * Flush out all existing queue and setup new one.
   *
   * It is highly recommended flush only for destructive application state.
   * i.e browserwindow closing, crash, process exiting
   */
  public async flush(): Promise<void> {
    this.queue.complete();

    await this.queueAwaiter;
    this.initializeRequestQueue();
  }

  /**
   * Create request function using net module for main process.
   *
   * This request attempts to use the current `BrowserWindow` session
   * if in the main process (with the `Set-Cookie` header), to workaround
   * https://github.com/electron/electron/issues/8891.
   */
  private createNetRequestFunction(): (url: string) => Observable<any> {
    const { net } = require('electron');

    const triggerRequest = (request: Electron.ClientRequest, observer: Observer<any>) => {
      let timeoutId: NodeJS.Timer | null = setTimeout(() => {
        if (!observer.closed) {
          request.abort();
          observer.error(new Error(`telemetry request aborted due to timeout`));
        }
      }, REQUEST_TIMEOUT);

      const clear = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      [`error`, `abort`, `close`]
        .forEach((err: any) => request.once(err, (x: any) => {
          clear();
          observer.error(x);
        }));

      request.once('response', (res) => {
        observer.next(res.statusCode);
        observer.complete();
        clear();
      });

      request.end();
    };

    return (url: string) =>
      Observable.create((observer: Observer<any>) => {
        const request = net.request({ url, method: 'GET' });

        if (!!userAgent) {
          request.setHeader('User-Agent', userAgent);
        }

        if (!!windowSession) {

          windowSession.cookies.get({}, (_e: Error, cookies) => {
            request.setHeader('Cookie', cookies.map((x: any) => `${x.name}=${x.value}`).join('; '));
            triggerRequest(request, observer);
          });
        } else {
          triggerRequest(request, observer);
        }
      }).let(catchRequest);
  }

  /**
   * Returns function to trigger request based on process type.
   *
   */
  private createRequestFunction(): (url: string) => Observable<any> {
    if (!this.endpoint) {
      return (url: string) =>
        Observable.of(url)
          .do((x) => logger.debug(`track: telemetry logged`, decodeURIComponent(x)))
          .ignoreElements();
    } else if (process.type === 'browser') {
      return this.createNetRequestFunction();
    } else {
      return (url: string) => //use fetch instead of Rx.Ajax as cancellation is not required
        Observable.fromPromise(fetch(url, { credentials: 'include' }))
          .map((x) => x.status).let(catchRequest);
    }
  }

  /**
   * Subscribe to telemetry request queue to send telemetry in given order.
   *
   */
  private initializeRequestQueue(): void {
    const request = this.createRequestFunction();

    //telemetry accepts array of payload in a single request,
    //flatten queued payload as much until it reaches max url length
    const flattenPayloads = (payloads: Array<TelemetryPayload>) =>
      payloads.reduce((acc: Array<Array<TelemetryPayload>>, value) => {
        const lastPayloadArray = acc[acc.length - 1];
        const length = encodeURIComponent(JSON.stringify(lastPayloadArray)).length;

        if (length < MAX_URL_LENGTH) {
          lastPayloadArray.push(value);
        } else {
          acc.push([value]);
        }
        return acc;
      }, [[]]);

    const getRequestUrlWithPayload = (payloads: Array<Array<TelemetryPayload>>) =>
      payloads.map((x) => `${this.endpoint}${encodeURIComponent(JSON.stringify(x))}`);

    this.queue = new Subject<TelemetryPayload>();

    const requestObservable = this.queue.bufferTime(TELEMETRY_QUEUE_BUFFERTIME)
      .filter((x) => x.length > 0)
      .map(flattenPayloads)
      .map(getRequestUrlWithPayload)
      .do((x) => {
        if (x.length >= 50) {
          logger.warn(`Telemetry: too many events are queued in one buffer time, bail out some of them`);
        }
      })
      .concatMap((urls) => Observable.from(urls.slice(0, 50)).concatMap(request))
      .publish()
      .refCount();

    this.queueAwaiter = requestObservable.toPromise();
    requestObservable.subscribe(noop, (e) => logger.error(`Telemetry: unexpected error occurred`, e));
  }

  /**
   * Construct endpoint to telemetry based on current instance configuration.
   *
   * @return {String} URL of endpoint.
   * If client started via `npm start` without dev instance, returns empty.
   */
  private getTelemetryEndpoint(): string {
    const { devMode, devEnv } =
      (global && global.loadSettings) ?
        global.loadSettings :
        require('./parse-command-line').parseCommandLine();

    return (devMode && !devEnv) ?
      '' : `https://${devEnv ? `${devEnv}.` : ''}slack.com/clog/track/?logs=`;
  }
}

const telemetry = new Telemetry();

const track = telemetry.track.bind(telemetry) as typeof telemetry.track;
const flushTelemetry = telemetry.flush.bind(telemetry) as typeof telemetry.flush;

export {
  telemetryEventType,
  TELEMETRY_EVENT,
  track,
  flushTelemetry,
  setTelemetrySession
};
