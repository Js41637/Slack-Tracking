import * as assignIn from 'lodash.assignin';
import * as path from 'path';
import * as url from 'url';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {executeJavaScriptMethod, remoteEval, remoteEvalObservable, setParentInformation} from 'electron-remote';

import {getUserAgent} from '../../ssb-user-agent';
import {releaseDocumentFocus} from '../../utils/document-focus';
import {logger, Logger} from '../../logger';
import {noop} from '../../utils/noop';

import {Component} from '../../lib/component';
import {AuthenticationInfo} from '../../actions/dialog-actions';
import {dialogStore} from '../../stores/dialog-store';
import {eventActions} from '../../actions/event-actions';
import {WebViewBehavior} from '../behaviors/webView-behavior';
import {contextMenuBehavior} from '../behaviors/context-menu-behavior';
import {externalLinkBehavior} from '../behaviors/external-link-behavior';
import {settingStore} from '../../stores/setting-store';
import {setZoomLevelAndLimits} from '../../utils/zoomlevels';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

import {IS_BOOTED_EVAL} from '../../utils/shared-constants';

/**
 * Webview `did-fail-load` happens in many cases we don't care about. See
 * https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 * for the complete list of codes.
 */
const ERROR_CODES_TO_IGNORE: Array<number> = [
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

// View a complete list of webview options at
// https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
export interface WebViewContextProps {
  options: Electron.LoadURLOptions;
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
  authInfo: AuthenticationInfo;
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
        .filter(({channel}) => channel === 'didFinishLoading')
        .subscribe(this.props.onWebappLoad)
    );

    this.disposables.add(this.logConsoleMessages(webView));

    this.disposables.add(Observable.fromEvent(webView, 'dom-ready').subscribe(() => {
      setParentInformation(webView);
      setZoomLevelAndLimits(webView, this.state.zoomLevel!);
      this.props.onPageLoad!();
    }));

    this.disposables.add(Observable.fromEvent(webView, 'did-fail-load')
      .filter(({errorCode}) => !ERROR_CODES_TO_IGNORE.includes(errorCode))
      .subscribe((e) => this.props.onPageError!(e)));

    this.disposables.add(Observable.fromEvent(webView, 'close').subscribe(() => {
      this.props.onRequestClose!();
    }));

    this.disposables.add(this.setupLoadChecks(webView));
    this.disposables.add(this.setupErrorHandling(webView));

    this.disposables.add(Observable.fromEvent(webView, 'did-get-redirect-request')
      .filter(({isMainFrame}) => isMainFrame)
      .subscribe((e: HashChangeEvent) => {
        logger.info(`WebView received redirect request from ${e.oldURL} to ${e.newURL}`);
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
   * `executeJavaScriptMethod`, but with patience. Checks if the webapp is
   * fully booted, and if it isn't, waits until it is.
   *
   * @param {String} pathToObject Path to the method to be called
   * @param {Array} ...args       Arguments passed on to the method
   * @returns {Promise}           A Promise containing the result of the execution
   */
  public executeJavaScriptMethodWhenBooted(pathToObject: string, ...args: Array<any>): Promise<any> {
    const webView = this.webViewElement;

    return Observable.of(true)
      .flatMap(() => remoteEval(webView, IS_BOOTED_EVAL))
      .map((result: any) => {
        if (!result) throw new Error('WebApp not ready or not fully booted');
        else return result;
      })
      .retryAtIntervals(20)
      .flatMap(() => executeJavaScriptMethod(webView, pathToObject, ...args))
      .toPromise();
  }

  /**
   * `executeJavaScriptMethod`, but only if it given webview is allowed to execute.
   * If it's not ready and not able to, simply will skip execution.
   *
   * @param {String} pathToObject         Path to the method to be called
   * @param {Array} ...args               Arguments passed on to the method
   * @returns {Observable<any>}           An Observable containing the result of the execution
   */
  public executeJavaScriptIfBooted(pathToObject: string, ...args: Array<any>): Observable<any> {
    const webView = this.webViewElement;

    return remoteEvalObservable(webView, IS_BOOTED_EVAL)
      .filter((x: boolean) => !!x)
      .flatMap((_: boolean) => executeJavaScriptMethod(webView, pathToObject, ...args));
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

  public downloadURL(theUrl: string): void {
    this.WebContents.downloadURL(theUrl);
  }

  public loadURL(theURL: string): void {
    this.webViewElement.src = theURL;
  }

  public reload(): void {
    this.webViewElement.reload();
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
        style={{width: '100%', height: '100%', backgroundColor: 'white'}}
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
        logger.error(`${type} crash occurred in webView: ${JSON.stringify(this.props.options)}`);

        // NB: Reload the entire window. We can't reload the webView in this
        // case because we can't even access it.
        eventActions.reload(true);
      });
  }

  /**
   * Listen for the `did-stop-loading` event and ensure that we loaded correctly.
   *
   * We stopped loading - ensure that we actually received anything.
   * This protects against a loss of internet right when we think
   * that the WebView loaded successfully. ERR_NETWORK_CHANGED does
   * not always bubble up appropriately.
   *
   * Likewise, ensure that we loaded CSS stylesheets. The number of
   * stylesheets loaded should _always_ be greater or equal to the
   * number of stylesheets references in <head>.
   *
   * @param {any} webView
   * @returns {Subscription}
   */
  private setupLoadChecks(webView: Electron.WebViewElement): Subscription {
    const checkBlankPage = `document.location.href !== '${CHROMIUM_BLANK_PAGE_URL}'`;
    const checkForChildren = `document.body && document.body.childElementCount && document.body.childElementCount > 0`;
    const checkForLoadedCSS = `document.styleSheets.length >= [...document.head.children].filter(c => c.type === 'text/css').length`;
    const fullyLoadedCheck = `${checkBlankPage} && ${checkForChildren} && ${checkForLoadedCSS}`;

    const didStopLoading = Observable.fromEvent(webView, 'did-stop-loading');

    return Observable.merge(didStopLoading, this.authDialogClosed)
      .debounceTime(1000)
      .filter(() => !this.shouldSkipLoadCheck())
      .flatMap(() => this.executeJavaScript(fullyLoadedCheck))
      .catch((err) => {
        if (err.name !== 'TimeoutError') logger.warn(`Could not check document within webview: ${err.message}`);
        return Observable.of(null);
      })
      .filter((isFullyLoaded) => isFullyLoaded === false)
      .do(() => logger.error(`${webView.getURL()} failed the load check`))
      .subscribe(() => this.props.onPageEmptyAfterLoad!(webView.getURL()));
  }

  /**
   * Give us an escape hatch for the empty page check. If the user is behind a
   * proxy, it turns out that their URL matches the Chromium blank page URL.
   *
   * @return {Boolean}  True to bypass the empty page check, false otherwise
   */
  private shouldSkipLoadCheck(): boolean {
    if (this.state.authInfo || process.env.SLACK_SKIP_EMPTY_PAGE_CHECK) {
      const reason = this.state.authInfo ? 'basic auth' : 'environment variable';
      logger.warn(`Skipping empty page check because of ${reason}`);
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
      .subscribe(({level, message}) => {
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
