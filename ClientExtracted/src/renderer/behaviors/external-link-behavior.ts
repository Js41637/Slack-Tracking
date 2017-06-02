/**
 * @module RendererBehaviors
 */ /** for typedoc */

import * as url from 'url';
import { shell } from 'electron';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { WebViewBehavior } from './webView-behavior';
import { logger } from '../../logger';
import { dialogActions } from '../../actions/dialog-actions';
import { settingStore } from '../../stores/setting-store';

export class ExternalLinkBehavior implements WebViewBehavior {
  /**
   * Opens external links in the default browser, or performs the OS default
   * action (e.g., open mail or Skype).
   *
   * @param  {WebContents} webView  The web contents to apply this behavior to
   * @return {Subscription}           A Subscription that will undo what the method did
   */
  public setup(webView: Electron.WebContents | Electron.WebViewElement): Subscription {
    return Observable.fromEvent(webView, 'new-window', (e, urlString, _frameName, disposition) => {
      // NB: On `webview` tags, the other parameters are attached to the event.
      // But for `WebContents`, they're passed as arguments.
      return e.url ?
        { e, urlString: e.url, disposition: e.disposition } :
        { e, urlString, disposition };
    }).subscribe(({ e, urlString, disposition }) => {
      try {
        e.preventDefault();
        const parsedUrl = url.parse(urlString);
        const formattedUrl = (/^https?:\/\//.test(urlString)) ? this.escapeUrlWhenNeeded(parsedUrl) : urlString;

        if (settingStore.getSetting<Array<string>>('whitelistedUrlSchemes').includes(parsedUrl.protocol!)) {
          try {
            logger.debug(`ExternalLinkBehavior: Opening external window to ${formattedUrl}.`);
            shell.openExternal(formattedUrl, { activate: disposition !== 'background-tab' });
          } catch (error) {
            logger.warn(`ExternalLinkBehavior: Failed to open external window:`, error);
          }
        } else {
          dialogActions.showUrlSchemeModal({
            url: formattedUrl,
            disposition
          });
        }
      } catch (error) {
        logger.warn(`ExternalLinkBehavior: Ignoring ${urlString} due to error:`, error);
      }
    });
  }

  /**
   * Escape URLs that have invalid characters before sending them to
   * openExternal. The MS sends down URLs that are technically invalid according
   * to spec (i.e. contain Unicode characters). We need to escape away the
   * characters before we hand them off.
   *
   * When people complain that their invalid URIs are being encoded (and they
   * will!), you can point them to page 11 of https://tools.ietf.org/html/rfc3986
   * and the appendix https://tools.ietf.org/html/rfc3986#appendix-A
   *
   * @param  {Url} parsedUrl    The return value of `url.parse`
   * @return {Url}              The same data but with escaped query and hash
   *                            sections
   * @private
   */
  public escapeUrlWhenNeeded(parsedUrl: url.Url): string {
    const safeFragmentQuery = /^[a-zA-Z0-9\-_\.!\~\*'\(\);/\?:\@\&=\+$,]*$/;

    if (!(parsedUrl.hash || ' ').substring(1).match(safeFragmentQuery)) {
      logger.info('ExternalLinkBehavior: Reformatting URL hash section.');
      parsedUrl.hash = encodeURI(parsedUrl.hash!);
    }

    // We used to replace the query here - take note, that's not even a
    // valid operation - url.format() uses the search property to format.
    if (!(parsedUrl.search || '').match(safeFragmentQuery)) {
      logger.info('ExternalLinkBehavior: Reformatting URL query section.');
      parsedUrl.search = encodeURI(parsedUrl.search!);
    }

    return (parsedUrl as any).format();
  }
}

const externalLinkBehavior = new ExternalLinkBehavior();
export {
  externalLinkBehavior
};
