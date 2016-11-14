import assignIn from 'lodash.assignin';
import getUserAgent from '../../ssb-user-agent';
import logger from '../../logger';
import path from 'path';
import React from 'react';
import {Observable} from 'rxjs/Observable';
import url from 'url';
import {executeJavaScriptMethod, remoteEval, setParentInformation} from 'electron-remote';

import SettingStore from '../../stores/setting-store';
import Component from '../../lib/component';
import ContextMenuBehavior from '../behaviors/context-menu-behavior';
import EventActions from '../../actions/event-actions';
import ExternalLinkBehavior from '../behaviors/external-link-behavior';

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

let numberOfWebViews = 0;

export default class WebViewContext extends Component {

  static defaultProps = {
    id: `webView${numberOfWebViews++}`,
    onPageLoad: () => {},
    onWebappLoad: () => {},
    onRedirect: () => {},
    onPageError: () => {},
    onPageEmptyAfterLoad: () => {},
    onRequestClose: () => {}
  };

  // View a complete list of webview options at
  // https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md
  static propTypes = {
    options: React.PropTypes.object.isRequired,
    id: React.PropTypes.string,
    onPageLoad: React.PropTypes.func,
    onWebappLoad: React.PropTypes.func,
    onRedirect: React.PropTypes.func,
    onPageError: React.PropTypes.func,
    onPageEmptyAfterLoad: React.PropTypes.func,
    onRequestClose: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.behaviors = [ContextMenuBehavior, ExternalLinkBehavior];
  }

  syncState() {
    return {
      isWindows: SettingStore.isWindows()
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

    this.disposables.add(Observable.fromEvent(webView, 'dom-ready').subscribe(() => {
      setParentInformation(webView);

      // NB: For whatever reason, we sometimes cannot intercept the drag-drop event
      // and attempt to navigate to the dropped file. Prevent it!
      let preventNavigation = (e, navUrl) => {
        if (navUrl.match(/^https?:\/\//i))  return;

        logger.info(`Preventing WebView navigation to: ${navUrl}`);
        e.preventDefault();
      };

      this.getWebContents().on('will-navigate', preventNavigation);
      this.props.onPageLoad();
    }));

    this.disposables.add(Observable.fromEvent(webView, 'did-fail-load')
      .filter(({errorCode}) => !ERROR_CODES_TO_IGNORE.includes(errorCode))
      .subscribe((e) => this.props.onPageError(e)));

    // We stopped loading - ensure that we actually received anything.
    // This protects against a loss of internet right when we think
    // that the WebView loaded successfully. ERR_NETWORK_CHANGED does
    // not always bubble up appropriately.
    this.disposables.add(Observable.fromEvent(webView, 'did-stop-loading')
      .debounceTime(1000)
      .flatMap(() => this.executeJavaScript('document.body.childElementCount'))
      .catch((err) => {
        if (err.name !== 'TimeoutError') logger.warn(`Could not check webview's body child count: ${err.message}`);
        return Observable.of(null);
      })
      .filter((count) => count === 0)
      .subscribe(() => this.props.onPageEmptyAfterLoad(webView.getURL())));

    this.disposables.add(Observable.fromEvent(webView, 'close').subscribe(() => {
      this.props.onRequestClose();
    }));

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
   * @return {Subscription}     A Subscription that will clean up this subscription
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
        EventActions.reload(true);
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
    let cmd = `!!(typeof TSSSB !== 'undefined' && process && TS && TS._did_full_boot)`;

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
    return remoteEval(this.refs.webView, str);
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

  focus() {
    // NB: We do this instead of focusing the webView, because otherwise the
    // webView's frame will get a focus rectangle around it which is Odd
    this.refs.webView.shadowRoot.querySelector('object').focus();
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
    let options = assignIn({
      id: this.props.id,
      preload: url.format({
        protocol: 'file',
        pathname: path.resolve(__dirname, '..', '..', 'static', 'ssb-interop'),
        slashes: true
      })
    }, this.props.options);

    return (
      <webview {...options} style={{width: '100%', height: '100%', backgroundColor: 'white'}}
        className='WebViewContext' ref='webView'/>
    );
  }
}
