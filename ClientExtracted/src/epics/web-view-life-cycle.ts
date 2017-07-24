import { MiddlewareAPI } from 'redux';
import { ActionsObservable } from 'redux-observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Scheduler } from 'rxjs/Scheduler';
import { TimeInterval } from 'rxjs/operator/timeInterval';

import { logger } from '../logger';
import { StringMap, WEBVIEW_LIFECYCLE, webViewLifeCycleType } from '../utils/shared-constants';

import '../rx-operators';

/**
 * Defines context information on each web view status change to allow to carry additional information if needed.
 */
export interface WebViewLifeCycleContext {
  readonly type: webViewLifeCycleType;
  readonly event?: React.SyntheticEvent<any> | Event | Electron.Event;
  readonly data?: any;
}

/**
 * Custom epic types to have WebViewLifeCycleBase as dependency.
 */
export type WebViewLifeCycleEpic<T, S, U, R = Scheduler> = (
  action$: ActionsObservable<T>,
  store: MiddlewareAPI<S>,
  state: U,
  scheduler?: R
) => Observable<T>;

export interface WebViewLifeCycleBase {
  /**
   * Returns Observable object emits status of web view changes for corresponding id.
   * If object is not created at the moment requested, it'll return newly created instance and WebViewStateMixin will reuse instance.
   * Returned observable will emit current status of web view as soon as subscription starts,
   * by behavior of underlying BehaviorSubject<webViewStatusType>
   *
   * Once React component is unmounted (at the moment of `componentWillUnmount`), object will be destroyed.
   */
  get(id: string): Observable<WebViewLifeCycleContext>;

  /**
   * Returns latest known state of webapp lifecycle for corresponding id, provides synchronous way to read state for certain epics.
   *
   * This doesn't gaurantee to work outside of component lifecycle since object itself will be disposed after component unmounted.
   */
  getState(id: string): WebViewLifeCycleContext;

  /**
   * Returns id of component corresponding to given web view.
   * This is utiliy functions to allow query component-webview pair relations.
   */
  getComponentId(id: string): number;

  /**
   * Returns an Observable emits id of webview as soon as any lifecycle object matches to given predicate.
   * Returned Observable will emit single item and completes.
   * If there isn't any matching object, returned observable will not completes.
   */
  first(predicate: (value: WebViewLifeCycleContext) => boolean): Observable<string>;
}

/**
 * Defines interfaces to be used inside of mixin lifecycle, separate from actual public interface to be consumed in epics.
 */
export interface WebViewLifeCycleHandlerBase {
  /**
   * Register new webViewContext into state handler, creating new lifecycle object to correspond to webView.
   *
   * This should be called in renderer process only since it'll lookup webview element directly to register lifecycle events
   */
  registerComponent(id: string): boolean;

  /**
   * Push current status for web view of corresponding id. This interface is strictly for mixin base class, should not be used directly in most cases.
   */
  setState(id: string, status: WebViewLifeCycleContext): void;

  /**
   *  Remove Observable object from storage. This is handled automatically by mixin component's lifecycle, should not be used directly in most cases.
   */
  remove(id: string): void;
}

interface LifecycleComponent {
  /**
   * Id of 'component' contains actual webViewElement.
   * This is interger always increases for each time new lifecycle object is being created by lifecycle mixin,
   * allows pairing web view element's state with react component's lifecycle.
   */
  componentId: number;
  value: BehaviorSubject<WebViewLifeCycleContext>;
}

/**
 * Webview `did-fail-load` happens in many cases we don't care about. See
 * https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 * for the complete list of codes.
 */
const CHROME_ERROR_EXCLUDE_LIST: Readonly<Array<string>> = [
  'NAME_NOT_RESOLVED',
  'INTERNET_DISCONNECTED',
  'TUNNEL_CONNECTION_FAILED'
];

/**
 * Storage object to contain subscribable object of each web view element's status.
 * WebViewStateMixin provides component interface to WebViewContext, meanwhile automatically registers
 * given component's webview status into this storage object instance.
 *
 * If lifecycle management is not needed, can opt-out by instantiate WebViewContext directly.
 */
class WebViewLifeCycle implements WebViewLifeCycleBase, WebViewLifeCycleHandlerBase {
  private static count: number = 0;
  private readonly state: StringMap<LifecycleComponent> = {};

  public get(id: string): Observable<WebViewLifeCycleContext> {
    return this.getSubject(id).asObservable();
  }

  public getState(id: string): WebViewLifeCycleContext {
    return this.getSubject(id).getValue();
  }

  public getComponentId(id: string): number {
    const item = this.state[id];
    if (!item) {
      throw new Error(`WebViewLifeCycle: not able to lookup lifecycle object for '${id}', shouldn't happen`);
    }
    return this.state[id].componentId;
  }

  public registerComponent(id: string): boolean {
    const existingItem = this.state[id];
    if (existingItem) {
      logger.warn(`WebViewLifeCycle: tried to register lifecycle object multiple times`, { id });
      return false;
    }

    const item = this.state[id] = this.createSubject(id);
    this.registerEvents(id, item.componentId);

    return true;
  }

  public setState(id: string, status: WebViewLifeCycleContext): void {
    const subject = this.getSubject(id);
    const componentId = this.getComponentId(id);

    if (subject.isStopped) {
      throw new Error(`cannot set state to lifecycle object '${id}:${componentId}' cause it's already disposed`);
    }

    logger.info('WebViewLifeCycle: State changed', { id, componentId, newState: status.type, data: status.data || null });
    subject.next(status);
  }

  public remove(id: string): void {
    if (this.state[id]) {
      const item = this.state[id];
      logger.info('WebViewLifeCycle: Removing lifecycle object from storage', { componentId: item.componentId, id });

      item.value.complete();
      delete this.state[id];
    } else {
      logger.warn(`WebViewLifeCycle: Given id does not contain lifecycle object to remove, skipping`, { id });
    }
  }

  public first(predicate: (value: WebViewLifeCycleContext) => boolean): Observable<string> {
    //filter to be applied into each lifecycle observable object which executes filter on lifecycle stream, then maps matched event into id of object.
    const filterLifeCycleWithPredicate = (id: string, p: (value: WebViewLifeCycleContext) => boolean) =>
      (o: Observable<WebViewLifeCycleContext>) =>
      o.filter(p).mapTo(id).take(1).catch(() => Observable.empty());

    //create list of lifecycle objects applies filter with given predicate, to find matching element
    const filteredLifeCycleObjects = Object.keys(this.state).map((x) => this.state[x].value.let(filterLifeCycleWithPredicate(x, predicate)));

    //apply `race` into list of lifecycle objects, to get earlist object matches given prediciate.
    return filteredLifeCycleObjects.length > 0 ? Observable.race<string>(...filteredLifeCycleObjects) : Observable.empty();
  }

  private createSubject(id: string): LifecycleComponent {
    WebViewLifeCycle.count += 1;
    logger.info(`WebViewLifeCycle: Creating subscribable lifecycle object`, { objectId: id, assignedId: WebViewLifeCycle.count });

    return {
      componentId: WebViewLifeCycle.count,
      value: new BehaviorSubject<WebViewLifeCycleContext>({ type: WEBVIEW_LIFECYCLE.UNLOADED })
    };
  }

  private registerEvents(id: string, componentId: number): void {
    let webView: Electron.WebviewTag;
    const tag = `${id}:${componentId}`;

    //each event subscription listens to own component's `COMPONENT_DISPOSED` event to stop subscriptions
    const subscribeToEvents =
      (...events: Array<Observable<WebViewLifeCycleContext>>) =>
        events.forEach((o: Observable<WebViewLifeCycleContext>) =>
          o.takeUntil(this.getSubject(id).filter((x) => x.type === WEBVIEW_LIFECYCLE.COMPONENT_DISPOSED).take(1))
            .timeInterval()
            .subscribe(
              (state: TimeInterval<WebViewLifeCycleContext>) => {
                logger.debug(`WebViewLifeCycle: Timed change from '${this.getState(id).type}' to '${state.value.type}'`, {
                  took: `${state.interval}ms`,
                  tag
                });

                this.setState(id, state.value);
              },
              (error: any) => logger.error(`WebViewLifeCycle: Something went wrong while listening for event`, { error, tag })
            )
        );
    try {
      webView = document.querySelector(`[id='webview:${id}']`) as Electron.WebviewTag;
    } catch (e) {
      logger.error(`WebViewLifeCycle: Failed to query actual webview element, will not able to listen lifecycle events`, { tag });
      return;
    }

    // Setup listeners for events we're interested
    const didFinishLoading = Observable.fromEvent<{channel: string, args: Array<string>}>(webView, 'ipc-message')
      .filter(({ channel }) => channel === 'didFinishLoading')
      .map((x) => ({ type: x.args[0] }));

    const domReady = Observable.fromEvent(webView, 'dom-ready').mapTo({ type: WEBVIEW_LIFECYCLE.PAGE_LOADED });

    const didFailLoad = Observable.fromEvent(webView, 'did-fail-load')
      // Exclude non-errors (like 0, aka "OK")
      .filter(({ errorCode }) => parseInt(errorCode, 10) < 0)
      .filter(({ errorDescription }) => !CHROME_ERROR_EXCLUDE_LIST.includes(errorDescription || ''))
      .map((data) => ({ type: WEBVIEW_LIFECYCLE.PAGE_FAIL_LOAD, data }));

    const redirect = Observable.fromEvent(webView, 'did-get-redirect-request')
      .filter(({ isMainFrame }) => isMainFrame)
      .map((event: HashChangeEvent) => ({ type: WEBVIEW_LIFECYCLE.PAGE_REDIRECT, event }));

    const close = Observable.fromEvent(webView, 'close').mapTo({ type: WEBVIEW_LIFECYCLE.PAGE_CLOSED });

    subscribeToEvents(didFinishLoading, domReady, didFailLoad, redirect, close);
  }

  private getSubject(id: string): BehaviorSubject<WebViewLifeCycleContext> {
    const item = this.state[id];
    if (!item) {
      throw new Error(`WebViewLifeCycle: not able to lookup lifecycle object for '${id}', shouldn't happen`);
    }
    return item.value;
  }
}

const webViewLifeCycle: WebViewLifeCycleBase = new WebViewLifeCycle();

export {
  CHROME_ERROR_EXCLUDE_LIST,
  webViewLifeCycle
};
