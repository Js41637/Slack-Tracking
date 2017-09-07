/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import { executeJavaScriptMethod, setParentInformation } from 'electron-remote';
import { assignIn } from 'lodash';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import * as url from 'url';

import { Logger, logger } from '../../logger';
import { getUserAgent } from '../../ssb-user-agent';
import { noop } from '../../utils/noop';
import { isSlackURL } from '../../utils/url-utils';

import { appActions } from '../../actions/app-actions';
import { eventActions } from '../../actions/event-actions';
import { Component } from '../../lib/component';
import { dialogStore } from '../../stores/dialog-store';
import { settingStore } from '../../stores/setting-store';
import { contextMenuBehavior } from '../../utils/context-menu-behavior';
import { setZoomLevelAndLimits } from '../../utils/zoomlevels';
import { Behavior } from '../behaviors/behavior';
import { externalLinkBehavior } from '../behaviors/external-link-behavior';

import * as React from 'react'; // tslint:disable-line:no-unused-variable
import { TELEMETRY_EVENT, track } from '../../telemetry';

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
  authInfo: Electron.AuthInfo | null;
  isLoading?: boolean;
  loadedWhileHidden?: boolean;
  locale: string;
}

export class WebViewContext extends Component<WebViewContextProps, WebViewContextState> {
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
  private behaviors: Array<Behavior<Electron.WebviewTag>> = [contextMenuBehavior, externalLinkBehavior];
  private authDialogClosed: Subject<boolean> = new Subject();
  private webViewElement: Electron.WebviewTag;
  private readonly refHandlers = {
    webView: (ref: Electron.WebviewTag) => this.webViewElement = ref
  };

  private get WebContents(): Electron.WebContents {
    return this.WebView.getWebContents();
  }

  constructor(props: WebViewContextProps) {
    super(props);
    // Paranoia: Always start out visible, just in case it helps with
    // https://github.com/electron/electron/issues/8505
    this.state = assignIn({
      isLoading: true,
    }, this.state);
    this.currentViewId = WebViewContext.numberOfWebViews++;
    this.consoleLogger = new Logger({
      identifierOverride: `webapp-${props.id}`,
      showTimestamp: false
    });
  }

  public syncState(): WebViewContextState {
    return {
      locale: settingStore.getSetting<string>('locale'),
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

    // Keep track of the loading state of the webview, because if we try to set
    // `visibility: hidden` while it's loading it won't render properly.
    // Refer to https://github.com/electron/electron/issues/8505.
    this.disposables.add(
      Observable.merge(
        Observable.fromEvent(webView, 'did-start-loading').mapTo(true),
        Observable.fromEvent(webView, 'did-stop-loading').mapTo(false)
      )
      .startWith(true)
      .subscribe((isLoading) => {
        if (isLoading && this.state.isMac) {
          // XXX: If we get did-start-loading and the webview is invisible,
          // then on Mac we will definitely fall into issue 8505.
          // Raise a flag to indicate that we may need to force reload
          // on shown.
          let loadedWhileHidden = false;
          try {
            if (window.getComputedStyle(webView).visibility === 'hidden') {
              loadedWhileHidden = true;
              logger.info('Setting loadedWhileHidden for webview');
            } else {
              logger.info('Clearing loadedWhileHidden for webview');
            }
          } catch (error) {
            logger.error('Failed to check webview visibility on load');
          }
          this.setState(() => ({
            isLoading,
            loadedWhileHidden,
          }));
        } else {
          this.setState(() => ({ isLoading }));
        }
      })
    );

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

  public get WebView(): Electron.WebviewTag {
    return this.webViewElement;
  }

  public get loadedWhileHidden(): boolean {
    return !!this.state.loadedWhileHidden;
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

  public loadURL(theURL: string): void {
    this.webViewElement.src = theURL;
  }

  public reload(): void {
    this.webViewElement.reloadIgnoringCache();
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
    const id = `webview:${this.props.id ? `${this.props.id}` : `${this.currentViewId}`}`;
    const className = classNames('WebViewContext', {
      isLoading: this.state.isLoading
    });

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
        tabIndex='-1'
        ref={this.refHandlers.webView}
        className={className}
        {...options}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  /**
   * Listen for any crash events from the webView and reload in response.
   *
   * @param  {WebView} webView  The webview tag
   * @return {Subscription}     A Subscription that will clean up this listener
   */
  private setupErrorHandling(webView: Electron.WebviewTag): Subscription {
    return Observable.merge(
      Observable.fromEvent(webView, 'crashed').mapTo('Renderer'),
      Observable.fromEvent(webView, 'gpu-crashed').mapTo('GPU'),
      Observable.fromEvent(webView, 'plugin-crashed').map((n, v) => `Plugin ${n} ${v}`))
      .filter((type) => !type.startsWith('Plugin'))
      .subscribe((type) => {
        const error = `WebView: ${type} crash occurred in webView: ${JSON.stringify(this.props.options)}`;
        logger.error(error);

        track(TELEMETRY_EVENT.DESKTOP_CRASH, {
          crashOrigin: 'webview',
          crashMessage: error,
          crashes: 1
        });

        appActions.setLastError({
          errorCode: -2, // -2 is Chrome's common error code for "something broke, we don't know what"
          errorDescription: error
        });

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
  private setupLoadChecks(webView: Electron.WebviewTag): Subscription {
    const checkBlankPage = `document.location.href !== '${CHROMIUM_BLANK_PAGE_URL}'`;
    const checkForLoadedCSS = `document.styleSheets.length >= [...document.head.children].filter(c => c.type === 'text/css').length`;
    const fullyLoadedCheck = `${checkBlankPage} && ${checkForLoadedCSS}`;
    const didStopLoading = Observable.fromEvent(webView, 'did-stop-loading');

    return Observable.merge(didStopLoading, this.authDialogClosed)
      .debounceTime(1000)
      .filter(() => !this.shouldSkipLoadCheck(webView))
      .flatMap(() => this.executeJavaScript(fullyLoadedCheck).catch())
      .catch(() => Observable.of(null))
      .filter((isFullyLoaded: boolean | null) => isFullyLoaded === false)
      .do(() => logger.error(`${webView.getURL()} failed the load check`))
      .subscribe(() => this.props.onPageEmptyAfterLoad!(webView.getURL()));
  }

  /**
   * Give us an escape hatch for the empty page check. If the user is behind a
   * proxy, it turns out that their URL matches the Chromium blank page URL.
   *
   * @return {Boolean}  True to bypass the empty page check, false otherwise
   */
  private shouldSkipLoadCheck(webView: Electron.WebviewTag): boolean {
    if (!webView || !isSlackURL(this.getURL())) {
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
  private logConsoleMessages(webView: Electron.WebviewTag): Subscription {
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
