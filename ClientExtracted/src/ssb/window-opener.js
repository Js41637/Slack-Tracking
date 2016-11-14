import {remoteEval} from 'electron-remote';

export default class WindowOpener {

  /**
   * This method is an API that we add solely to popup windows opened via
   * winssb.window.open, that allows the popup to eval JavaScript in the
   * context of its parent (usually a WebView, but could be another popup
   * window).
   *
   * It's basically the same as executeJavaScriptInWindow, except that its
   * options are only 'code' and 'callback'.
   *
   * @param  {Object} options
   * @param  {String} options.code        The code to evaluate
   * @param  {Function} options.callback  Callback to run on completion
   * @return {Promise}                    A Promise indicating completion
   */
  executeJavaScript(options) {
    if (!options.code) {
      throw new Error("Missing parameters, needs code");
    }

    let ret = remoteEval(null, options.code);

    if (options.callback) {
      return ret
        .then((x) => options.callback(null, x))
        .catch((e) => options.callback(e));
    } else {
      return ret;
    }
  }

  /**
   * Dispatches an event from the popup window to its parent context, using the
   * `executeJavaScript` method.
   *
   * @param  {String} data            Data to attach to the `Event`
   * @param  {Object} data            Data to attach to the `Event`
   *
   * @return {Promise}                A Promise indicating completion
   */
  postMessage(data = '') {
    data = (typeof data === 'string') ? `'${data}'` : JSON.stringify(data);

    let code =
      `(function () {` +
        `let evt = new Event('message');` +
        `evt.data = ${data};` +
        `evt.origin = '${document.location.origin}';` +
        `evt.source = {};` +
        `evt.source.postMessage = function (message) {` +
        `  if (!winssb || !winssb.window || !winssb.window.postMessage) throw 'winssb not ready';` +
        `  return winssb.window.postMessage(message, ${window.winssb.browserWindowId});` +
        `};` +
        `window.dispatchEvent(evt);` +
      `})();`;

    let callback = () => { };
    return this.executeJavaScript({code, callback});
  }
}
