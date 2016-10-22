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
   * @param  {Object} data          The data that will be attached to the `Event`   
   * @return {Promise}              A Promise indicating completion   
   */   
  postMessage(data) {
    let code =
      `var evt = new Event('message');` +
      `evt.origin = '${document.location.origin}';` +
      `evt.data = ${JSON.stringify(data)};` +
      `window.dispatchEvent(evt);`;
    
    let callback = () => { };
    return this.executeJavaScript({code, callback});
  }
}
