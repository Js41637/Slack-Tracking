/**
 * @module RendererBehaviors
 */ /** for typedoc */

import { shell } from 'electron';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as url from 'url';

import { dialogActions } from '../../actions/dialog-actions';
import { logger } from '../../logger';
import { settingStore } from '../../stores/setting-store';
import { Behavior } from './behavior';

export class ExternalLinkBehavior implements Behavior<Electron.WebContents | Electron.WebviewTag> {
  /**
   * Opens external links in the default browser, or performs the OS default
   * action (e.g., open mail or Skype).
   *
   * @param  {WebContents} webView  The web contents to apply this behavior to
   * @return {Subscription}           A Subscription that will undo what the method did
   */
  public setup(webView: Electron.WebContents | Electron.WebviewTag): Subscription {
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
        const formattedUrl = (/^https?:\/\//.test(urlString)) ? this.escapeUrlWhenNeeded(urlString) : urlString;

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
   * @param  {string} urlString Url to possible encode
   * @return {Url}              The same data but with escaped query and hash
   *                            sections
   * @private
   */
  public escapeUrlWhenNeeded(urlString: string): string {
    const safeFragmentQuery = /^[a-zA-Z0-9\-_\.!\~\*'\(\);/\?:\@\&=\+$,]*$/;
    const parsedUrl = url.parse(urlString);
    const hash = parsedUrl.hash || '';
    const search = parsedUrl.search || '';

    if (!hash.substring(1).match(safeFragmentQuery) && !this.isAlreadyEncoded(hash)) {
      logger.info('ExternalLinkBehavior: Reformatting URL hash section.');
      parsedUrl.hash = encodeURI(parsedUrl.hash!);
    }

    // We used to replace the query here - take note, that's not even a
    // valid operation - url.format() uses the search property to format.
    if (!search.match(safeFragmentQuery) && !this.isAlreadyEncoded(search)) {
      logger.info('ExternalLinkBehavior: Reformatting URL query section.');
      parsedUrl.search = encodeURI(parsedUrl.search!);
    }

    return (parsedUrl as any).format();
  }

  public isAlreadyEncoded(urlString: string): boolean {
    try {
      return decodeURIComponent(urlString) !== urlString;
    } catch (error) {
      return false;
    }
  }
}

const externalLinkBehavior = new ExternalLinkBehavior();
export {
  externalLinkBehavior
};
