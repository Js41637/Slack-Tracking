import {remoteEval} from 'electron-remote';
import {noop} from '../utils/noop';
import {getPostMessageTemplate} from './post-message';

export interface WindowOpenOptions {
  code: string;
  callback: (err: Error | null, result?: any) => void;
}

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
  public executeJavaScript(options: WindowOpenOptions): Promise<any> {
    if (!options.code) {
      throw new Error('Missing parameters, needs code');
    }

    const ret = remoteEval(null, options.code);

    if (options.callback) {
      return ret
        .then((x: any) => options.callback(null, x))
        .catch((e: Error) => options.callback(e));
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
  public postMessage(data: string | Object = ''): Promise<any> {
    const code = getPostMessageTemplate(data, document.location.origin, window.winssb.browserWindowId!);

    return this.executeJavaScript({code, callback: noop});
  }
}
