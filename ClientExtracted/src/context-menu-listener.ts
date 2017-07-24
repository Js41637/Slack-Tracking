import { remote } from 'electron';
import { fromRemoteWindow } from 'electron-remote';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

/**
 * ContextMenuListener will listen to the given window / WebView control and
 * invoke a handler function. This function usually will immediately turn around
 * and invoke {{showPopupMenu}} from {{ContextMenuBuilder}}.
 */
export class ContextMenuListener {
  public readonly sub: Subscription;

  /**
   * Constructs a ContextMenuListener and wires up the events it needs to fire
   * the callback.
   *
   * @param  {Function} handler             The callback that will be invoked
   *                                        with the 'context-menu' info.
   * @param  {BrowserWindow|WebView} windowOrWebView  The target, either a
   *                                                  BrowserWindow or a WebView
   * @param  {Observable<Object>} contextMenuEvent  Use this for simulating a
   *                                                ContextMenu event
   */
  constructor(handler: (...args: Array<any>) => void,
              windowOrWebView: Electron.BrowserWindow | Electron.WebContents | Electron.WebviewTag | null = remote.getCurrentWebContents(),
              contextMenuEvent: Observable<any> | null = null) {
    if (!contextMenuEvent) {
      windowOrWebView = windowOrWebView || remote.getCurrentWebContents();
      contextMenuEvent = fromRemoteWindow(windowOrWebView, 'context-menu', true).map(([x]: any) => x[1]);
    }

    this.sub = contextMenuEvent!.subscribe(handler);
  }

  /**
   * Disconnect the events that we connected in the Constructor
   */
  public unsubscribe() {
    this.sub.unsubscribe();
  }
}
