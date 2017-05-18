/**
 * @module RendererComponents
 */ /** for typedoc */

import * as assignIn from 'lodash.assignin';
import * as path from 'path';
import * as url from 'url';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { executeJavaScriptMethod, setParentInformation } from 'electron-remote';

import { getUserAgent } from '../../ssb-user-agent';
import { releaseDocumentFocus } from '../../utils/document-focus';
import { logger, Logger } from '../../logger';
import { noop } from '../../utils/noop';
import { WEBAPP_MESSAGES_URL } from '../../utils/shared-constants';

import { Component } from '../../lib/component';
import { dialogStore } from '../../stores/dialog-store';
import { eventActions } from '../../actions/event-actions';
import { WebViewBehavior } from '../behaviors/webView-behavior';
import { contextMenuBehavior } from '../behaviors/context-menu-behavior';
import { externalLinkBehavior } from '../behaviors/external-link-behavior';
import { settingStore } from '../../stores/setting-store';
import { setZoomLevelAndLimits } from '../../utils/zoomlevels';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

/**
 * Webview `did-fail-load` happens in many cases we don't care about. See
 * https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 * for the complete list of codes.
 */
const ERROR_CODES_TO_IGNORE: Array<number> = [
  0,    // We're not actually hitting an error (lolwut)
  -3,   // Redirect responses give an aborted code, see https://github.com/atom/electron/issues/4396
  -105, // Host name not resolved (no network)
  -106, // Internet disconnected
  -111  // Behind a proxy
];

 /**
  * Sometimes when network changes we end up navigating to a blank page with
  * this URL. We'll filter these out and reload automatically, like Chrome.
  */
const CHROMIUM_BLANK_PAGE_URL = 'data:text/html,chromewebdata';

export interface WebViewContextOptions extends Electron.LoadURLOptions {
  src: string;
}

// View a complete list of webview options at
// https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
export interface WebViewContextProps {
  options: WebViewContextOptions;
  className?: string;
  id?: string;
  login?: boolean;
  onPageLoad?: typeof noop;
  onWebappLoad?: typeof noop;
  onRedirect?: typeof noop;
  onPageError?: typeof noop;
  onPageEmptyAfterLoad?: typeof noop;
  onRequestClose?: typeof noop;
}

export interface WebViewContextState {
  zoomLevel: number;
  isMac: boolean;
  authInfo: Electron.LoginAuthInfo;
}

export class WebViewContext extends Component<WebViewContextProps, Partial<WebViewContextState>> {
  public static readonly defaultProps = {
    id: null,
    login: false,
    onPageLoad: noop,
    onWebappLoad: noop,
    onRedirect: noop,
    onPageError: noop,
    onPageEmptyAfterLoad: noop,
    onRequestClose: noop
  };

  private static numberOfWebViews = 0;

  private currentViewId = 0;
  private consoleLogger: Logger;
  private behaviors: Array<WebViewBehavior> = [contextMenuBehavior, externalLinkBehavior];
  private authDialogClosed: Subject<boolean> = new Subject();
  private webViewElement: Electron.WebViewElement;
  private readonly refHandlers = {
    webView: (ref: Electron.WebViewElement) => this.webViewElement = ref
  };

  private get WebContents(): Electron.WebContents {
    return this.WebView.getWebContents();
  }

  constructor(props: WebViewContextProps) {
    super(props);

    this.currentViewId = WebViewContext.numberOfWebViews++;
    this.consoleLogger = new Logger({
      identifierOverride: `webapp-${props.id}`,
      showTimestamp: false
    });
  }

  public syncState(): Partial<WebViewContextState> {
    return {
      zoomLevel: settingStore.getSetting<number>('zoomLevel'),
      isMac: settingStore.isMac(),
      authInfo: dialogStore.getInfoForAuthDialog()
    };
  }

  public componentDidMount(): void {
    // NB: Need to assign the user agent here, it won't take if set in `render`
    const webView = this.webViewElement;
    webView.useragent = getUserAgent();

    this.disposables.add(
      Observable.fromEvent(webView, 'ipc-message')
        .filter(({ channel }) => channel === 'didFinishLoading')
        .subscribe(this.props.onWebappLoad)
    );

    this.disposables.add(this.logConsoleMessages(webView));

    this.disposables.add(Observable.fromEvent(webView, 'dom-ready').subscribe(() => {
      setParentInformation(webView);
      setZoomLevelAndLimits(webView, this.state.zoomLevel!);
      this.props.onPageLoad!();
    }));

    // Chromium's WebView does not respond well to interactions
    // immediately after issuing an event. This is terrible, but
    // for now, we circumvent this by manually delaying subscribed
    // operations by an artificial 100ms.
    this.disposables.add(Observable.fromEvent(webView, 'did-fail-load')
      .filter(({ errorCode }) => !ERROR_CODES_TO_IGNORE.includes(errorCode))
      .flatMap((e) => Observable.timer(100).map(() => e))
      .subscribe((e) => this.props.onPageError!(e)));

    this.disposables.add(Observable.fromEvent(webView, 'close').subscribe(() => {
      this.props.onRequestClose!();
    }));

    this.disposables.add(this.setupLoadChecks(webView));
    this.disposables.add(this.setupErrorHandling(webView));

    this.disposables.add(Observable.fromEvent(webView, 'did-get-redirect-request')
      .filter(({ isMainFrame }) => isMainFrame)
      .subscribe((e: HashChangeEvent) => {
        logger.info(`WebView: Received redirect request from ${e.oldURL} to ${e.newURL}.`);
        this.props.onRedirect!(e);
      })
    );

    this.behaviors.forEach((behavior) => {
      this.disposables.add(behavior.setup(webView));
    });
  }

  public componentDidUpdate(_prevProps: WebViewContextProps, prevState: WebViewContextState) {
    if (prevState.zoomLevel !== this.state.zoomLevel) {
      setZoomLevelAndLimits(this.webViewElement, this.state.zoomLevel!);
    }

    if (prevState.authInfo && !this.state.authInfo) {
      this.authDialogClosed.next();
    }
  }

  public openDevTools(): void {
    this.webViewElement.openDevTools();
  }

  public closeDevTools(): void {
    this.webViewElement.closeDevTools();
  }

  public get WebView(): Electron.WebViewElement {
    return this.webViewElement;
  }

  /**
   * Executes a JavaScript method inside the <WebView>.
   *
   * @param {string} pathToObject - Path to the method to be called
   * @param {any} ...args - Arguments passed on to the method
   * @returns {Promise}
   */
  public executeJavaScriptMethod(pathToObject: string, ...args: Array<any>): Promise<any> {
    return executeJavaScriptMethod(this.webViewElement, pathToObject, ...args);
  }

  public executeJavaScript(str: string): Promise<any> {
    return new Promise((resolve) => this.webViewElement.executeJavaScript(str, false, resolve));
  }

  public getURL() {
    return this.webViewElement.getURL() || '';
  }

  public isMessagesURL() {
    return !!this.getURL().match(WEBAPP_MESSAGES_URL);
  }

  public downloadURL(theUrl: string): void {
    this.WebContents.downloadURL(theUrl);
  }

  public loadURL(theURL: string): void {
    this.webViewElement.src = theURL;
  }

  public reload(): void {
    this.webViewElement.reloadIgnoringCache();
  }

  /**
   * Focus is a tricky beast with `webview` tags, as we have to dodge a bunch
   * of Chromium bugs. We don't focus the `webview` itself to avoid an
   * apparently unstylable focus rectangle. In addition, we need the host page
   * to release document focus in order for focus to propagate to any of its
   * `webview` children. Refer to
   * https://github.com/javan/electron-webview-ime-fix for details.
   */
  public focus(): void {
    const defaultFocusMethod = () => this.webViewElement.shadowRoot!.querySelector('object')!.focus();

    if (this.state.isMac) {
      //somehow direct focus to webview and its contents in mac os causes synchronous ipc blocking,
      //falls back to legacy focus instead
      defaultFocusMethod();
    } else {
      try {
        const contents = this.webViewElement.getWebContents();
        if (!!contents && !contents.isFocused()) {
          this.webViewElement.focus();
          (contents as any).focus();
        }
      } catch (e) {
        defaultFocusMethod();
        logger.warn(e);
      }
    }

    releaseDocumentFocus();
  }

  public replaceMisspelling(correction: string): void {
    this.webViewElement.replaceMisspelling(correction);
  }

  public inspectElement(x: number, y: number): void {
    this.webViewElement.inspectElement(x, y);
  }

  public canGoBack(): boolean {
    return this.webViewElement.canGoBack();
  }

  public goBack(): void {
    this.webViewElement.goBack();
  }

  public canGoForward(): boolean {
    return this.webViewElement.canGoForward();
  }

  public goForward(): void {
    this.webViewElement.goForward();
  }

  public goToOffset(offset: number): void {
    this.webViewElement.goToOffset(offset);
  }

  public render(): JSX.Element | null {
    const id = `webview${this.currentViewId}${this.props.id ? `:${this.props.id}` : ''}`;

    const options = assignIn({
      id,
      preload: url.format({
        protocol: 'file',
        pathname: path.resolve(__dirname, '..', '..', 'static',
          this.props.login ? 'ssb-interop-lite' : 'ssb-interop'),
        slashes: true
      })
    }, this.props.options);

    return (
      <webview
        {...options}
        style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
        className='WebViewContext'
        ref={this.refHandlers.webView}
      />
    );
  }

  /**
   * Listen for any crash events from the webView and reload in response.
   *
   * @param  {WebView} webView  The webview tag
   * @return {Subscription}     A Subscription that will clean up this listener
   */
  private setupErrorHandling(webView: Electron.WebViewElement): Subscription {
    return Observable.merge(
      Observable.fromEvent(webView, 'crashed').mapTo('Renderer'),
      Observable.fromEvent(webView, 'gpu-crashed').mapTo('GPU'),
      Observable.fromEvent(webView, 'plugin-crashed').map((n, v) => `Plugin ${n} ${v}`))
      .filter((type) => !type.startsWith('Plugin'))
      .subscribe((type) => {
        logger.error(`WebView: ${type} crash occurred in webView: ${JSON.stringify(this.props.options)}`);

        // NB: Reload the entire window. We can't reload the webView in this
        // case because we can't even access it.
        eventActions.reload(true);
      });
  }

  /**
   * Listen for the `did-stop-loading` event and ensure that we are on a real
   * page. ERR_NETWORK_CHANGED seems to result in a white screen in many cases,
   * so guard against that here.
   *
   * @param {any} webView
   * @returns {Subscription}
   */
  private setupLoadChecks(webView: Electron.WebViewElement): Subscription {
    const checkBlankPage = `document.location.href !== '${CHROMIUM_BLANK_PAGE_URL}'`;
    const didStopLoading = Observable.fromEvent(webView, 'did-stop-loading');

    return Observable.merge(didStopLoading, this.authDialogClosed)
      .debounceTime(1000)
      .filter(() => !this.shouldSkipLoadCheck(webView))
      .flatMap(() => this.executeJavaScript(checkBlankPage))
      .catch(() => Observable.of(null))
      .filter((isFullyLoaded: boolean | null) => isFullyLoaded === false)
      .do(() => logger.error(`${webView.getURL()} was stuck at ${CHROMIUM_BLANK_PAGE_URL}`))
      .subscribe(() => this.props.onPageEmptyAfterLoad!(webView.getURL()));
  }

  /**
   * Give us an escape hatch for the empty page check. If the user is behind a
   * proxy, it turns out that their URL matches the Chromium blank page URL.
   *
   * @return {Boolean}  True to bypass the empty page check, false otherwise
   */
  private shouldSkipLoadCheck(webView: Electron.WebViewElement): boolean {
    if (!webView || !this.isMessagesURL()) {
      return true;
    }

    if (this.state.authInfo) {
      logger.warn('WebView: Skipping empty page check during basic auth');
      return true;
    }

    return false;
  }

  /**
   * Write out any console messages from the guest content to a custom logger
   * instance.
   *
   * @param  {WebView} webView  The webview tag
   * @return {Subscription}     A Subscription that will clean up this listener
   */
  private logConsoleMessages(webView: Electron.WebViewElement): Subscription {
    return Observable.fromEvent(webView, 'console-message')
      .subscribe(({ level, message }) => {
        switch (level) {
        case 0:
          this.consoleLogger.info(message);
          break;
        case 1:
          this.consoleLogger.warn(message);
          break;
        case 2:
          this.consoleLogger.error(message);
          break;
        }
      });
  }
}
