/**
 * @module SSBIntegration
 */ /** for typedoc */

import { getPostMessageTemplate } from './post-message';
import { executeRemoteEval, RemoteEvalOption } from './execute-remote-eval';

export class WindowOpener {
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
  public executeJavaScript(options: RemoteEvalOption): Promise<any> {
    return executeRemoteEval(options);
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
  public postMessage(data: string | Object = ''): Promise<any> {
    const code = getPostMessageTemplate(data, document.location.origin, window.winssb.browserWindowId!);

    return this.executeJavaScript({ code });
  }
}
