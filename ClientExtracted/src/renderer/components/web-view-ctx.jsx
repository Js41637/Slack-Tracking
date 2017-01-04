import assignIn from 'lodash.assignin';
import path from 'path';
import React from 'react';
import url from 'url';
import {Observable} from 'rxjs/Observable';
import {executeJavaScriptMethod, remoteEval, setParentInformation} from 'electron-remote';

import getUserAgent from '../../ssb-user-agent';
import {releaseDocumentFocus} from '../../utils/document-focus';
import {logger, Logger} from '../../logger';

import Component from '../../lib/component';
import ContextMenuBehavior from '../behaviors/context-menu-behavior';
import {eventActions} from '../../actions/event-actions';
import ExternalLinkBehavior from '../behaviors/external-link-behavior';
import {settingStore} from '../../stores/setting-store';

/**
 * Webview `did-fail-load` happens in many cases we don't care about. See
 * https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
 * for the complete list of codes.
 */
const ERROR_CODES_TO_IGNORE = [
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

export default class WebViewContext extends Component {
  static numberOfWebViews = 0;

  static defaultProps = {
    id: null,
    onPageLoad: () => { },
    onWebappLoad: () => { },
    onRedirect: () => { },
    onPageError: () => { },
    onPageEmptyAfterLoad: () => { },
    onRequestClose: () => { }
  };

  // View a complete list of webview options at
  // https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
  static propTypes = {
    options: React.PropTypes.object.isRequired,
    login: React.PropTypes.bool,
    id: React.PropTypes.string,
    onPageLoad: React.PropTypes.func,
    onWebappLoad: React.PropTypes.func,
    onRedirect: React.PropTypes.func,
    onPageError: React.PropTypes.func,
    onPageEmptyAfterLoad: React.PropTypes.func,
    onRequestClose: React.PropTypes.func
  };

  currentViewId = 0;

  constructor(props) {
    super(props);
    this.behaviors = [ContextMenuBehavior, ExternalLinkBehavior];
    this.currentViewId = WebViewContext.numberOfWebViews++;

    this.consoleLogger = new Logger({
      identifierOverride: `webapp-${props.id}`,
      showTimestamp: false
    });
  }

  syncState() {
    return {
      zoomLevel: settingStore.getSetting('zoomLevel')
    };
  }

  componentDidMount() {
    // NB: Need to assign the user agent here, it won't take if set in `render`
    let webView = this.refs.webView;
    webView.useragent = getUserAgent();

    this.disposables.add(
      Observable.fromEvent(webView, 'ipc-message')
        .filter(({channel}) => channel === 'didFinishLoading')
        .subscribe(this.props.onWebappLoad)
    );

    this.disposables.add(this.logConsoleMessages(webView));

    this.disposables.add(Observable.fromEvent(webView, 'dom-ready').subscribe(() => {
      setParentInformation(webView);
      this.setZoomLevelAndLimits(webView);

      // NB: For whatever reason, we sometimes cannot intercept the drag-drop event
      // and attempt to navigate to the dropped file. Prevent it!
      let preventNavigation = (e, navUrl) => {
        if (navUrl.match(/^https?:\/\//i)) return;

        logger.info(`Preventing WebView navigation to: ${navUrl}`);
        e.preventDefault();
      };

      this.getWebContents().on('will-navigate', preventNavigation);
      this.props.onPageLoad();
    }));

    this.disposables.add(Observable.fromEvent(webView, 'did-fail-load')
      .filter(({errorCode}) => !ERROR_CODES_TO_IGNORE.includes(errorCode))
      .subscribe((e) => this.props.onPageError(e)));

    this.disposables.add(Observable.fromEvent(webView, 'close').subscribe(() => {
      this.props.onRequestClose();
    }));

    this.disposables.add(this.setupLoadChecks(webView));
    this.disposables.add(this.setupErrorHandling(webView));

    this.disposables.add(Observable.fromEvent(webView, 'did-get-redirect-request')
      .filter(({isMainFrame}) => isMainFrame)
      .subscribe((e) => {
        logger.info(`WebView received redirect request from ${e.oldURL} to ${e.newURL}`);
        this.props.onRedirect(e);
      })
    );

    this.behaviors.forEach((behavior) => {
      this.disposables.add(behavior.setup(webView));
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.zoomLevel !== this.state.zoomLevel) {
      this.setZoomLevelAndLimits(this.getWebView());
    }
  }

  setZoomLevelAndLimits(webView) {
    webView.setLayoutZoomLevelLimits(this.state.zoomLevel, this.state.zoomLevel);
    webView.setZoomLevel(this.state.zoomLevel);
  }

  openDevTools() {
    this.refs.webView.openDevTools();
  }

  closeDevTools() {
    this.refs.webView.closeDevTools();
  }

  /**
   * Listen for any crash events from the webView and reload in response.
   *
   * @param  {WebView} webView  The webview tag
   * @return {Subscription}     A Subscription that will clean up this listener
   */
  setupErrorHandling(webView) {
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
   * @param {WebView} webView
   * @returns {Subscription}
   */
  setupLoadChecks(webView) {
    const checkBlankPage = `document.location.href !== '${CHROMIUM_BLANK_PAGE_URL}'`;
    const checkForChildren = `document.body && document.body.childElementCount && document.body.childElementCount > 0`;
    const checkForLoadedCSS = `document.styleSheets.length >= [...document.head.children].filter(c => c.type === 'text/css').length`;
    const fullyLoadedCheck = `${checkBlankPage} && ${checkForChildren} && ${checkForLoadedCSS}`;

    return Observable.fromEvent(webView, 'did-stop-loading')
      .debounceTime(1000)
      .flatMap(() => this.executeJavaScript(fullyLoadedCheck))
      .catch((err) => {
        if (err.name !== 'TimeoutError') logger.warn(`Could not check document within webview: ${err.message}`);
        return Observable.of(null);
      })
      .filter((isFullyLoaded) => isFullyLoaded === false)
      .do(() => logger.error(`${webView.getURL()} failed the load check`))
      .subscribe(() => this.props.onPageEmptyAfterLoad(webView.getURL()));
  }

  /**
   * Write out any console messages from the guest content to a custom logger
   * instance.
   *
   * @param  {WebView} webView  The webview tag
   * @return {Subscription}     A Subscription that will clean up this listener
   */
  logConsoleMessages(webView) {
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

  getWebView() {
    return this.refs.webView;
  }

  getWebContents() {
    return this.getWebView().getWebContents();
  }

  /**
   * `executeJavaScriptMethod`, but with patience. Checks if the webapp is
   * fully booted, and if it isn't, waits until it is.
   *
   * @param {String} pathToObject Path to the method to be called
   * @param {Array} ...args       Arguments passed on to the method
   * @returns {Promise}           A Promise containing the result of the execution
   */
  executeJavaScriptMethodWhenBooted(pathToObject, ...args) {
    let webView = this.refs.webView;
    let cmd = `!!(typeof TSSSB !== 'undefined' && TS && TS._did_full_boot)`;

    return Observable.of(true)
      .flatMap(() => remoteEval(webView, cmd))
      .map((result) => {
        if (!result) throw 'WebApp not ready or not fully booted';
        else return result;
      })
      .retryAtIntervals(20)
      .flatMap(() => executeJavaScriptMethod(webView, pathToObject, ...args))
      .toPromise();
  }

  /**
   * Executes a JavaScript method inside the <WebView>.
   *
   * @param {string} pathToObject - Path to the method to be called
   * @param {any} ...args - Arguments passed on to the method
   * @returns {Promise}
   */
  executeJavaScriptMethod(pathToObject, ...args) {
    return executeJavaScriptMethod(this.refs.webView, pathToObject, ...args);
  }

  executeJavaScript(str) {
    return new Promise((resolve) => this.refs.webView.executeJavaScript(str, false, resolve));
  }

  downloadURL(theUrl) {
    this.refs.webView.downloadURL(theUrl);
  }

  loadURL(theURL) {
    this.refs.webView.src = theURL;
  }

  reload() {
    this.refs.webView.reload();
  }

  /**
   * Focus is a tricky beast with `webview` tags, as we have to dodge a bunch
   * of Chromium bugs. We don't focus the `webview` itself to avoid an
   * apparently unstylable focus rectangle. In addition, we need the host page
   * to release document focus in order for focus to propagate to any of its
   * `webview` children. Refer to
   * https://github.com/javan/electron-webview-ime-fix for details.
   */
  focus() {
    this.refs.webView.shadowRoot.querySelector('object').focus();
    releaseDocumentFocus();
  }

  replaceMisspelling(correction) {
    this.refs.webView.replaceMisspelling(correction);
  }

  inspectElement(x, y) {
    this.refs.webView.inspectElement(x, y);
  }

  canGoBack() {
    return this.refs.webView.canGoBack();
  }

  goBack() {
    this.refs.webView.goBack();
  }

  canGoForward() {
    return this.refs.webView.canGoForward();
  }

  goForward() {
    this.refs.webView.goForward();
  }

  goToOffset(offset) {
    this.refs.webView.goToOffset(offset);
  }

  render() {
    const id = `webview${this.currentViewId}${this.props.id ? `:${this.props.id}` : ''}`;

    const options = assignIn({
      id: id,
      preload: url.format({
        protocol: 'file',
        pathname: path.resolve(__dirname, '..', '..', 'static',
          this.props.login ? 'ssb-interop-lite' : 'ssb-interop'),
        slashes: true
      })
    }, this.props.options);

    return (
      <webview {...options} style={{width: '100%', height: '100%', backgroundColor: 'white'}}
        className='WebViewContext' ref='webView'/>
    );
  }
}
