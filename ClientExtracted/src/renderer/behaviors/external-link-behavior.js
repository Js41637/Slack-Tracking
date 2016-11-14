import url from 'url';
import {shell} from 'electron';
import {Observable} from 'rxjs/Observable';

import logger from '../../logger';
import AppActions from '../../actions/app-actions';
import SettingStore from '../../stores/setting-store';

class ExternalLinkBehavior {

  /**
   * Opens external links in the default browser, or performs the OS default
   * action (e.g., open mail or Skype).
   *
   * @param  {WebContents} webView  The web contents to apply this behavior to
   * @return {Subscription}           A Subscription that will undo what the method did
   */
  setup(webView) {
    return Observable.fromEvent(webView, 'new-window', (e, urlString, frameName, disposition) => {
      // NB: On `webview` tags, the other parameters are attached to the event.
      // But for `WebContents`, they're passed as arguments.
      return e.url ?
        {e, urlString: e.url, disposition: e.disposition} :
        {e, urlString, disposition};
    }).subscribe(({e, urlString, disposition}) => {
      try {
        e.preventDefault();
        const parsedUrl = url.parse(urlString);
        const formattedUrl = (/^https?:\/\//.test(urlString)) ? this.escapeUrlWhenNeeded(parsedUrl) : urlString;

        if (SettingStore.getSetting('whitelistedUrlSchemes').includes(parsedUrl.protocol)) {
          try {
            logger.debug(`Opening external window to ${formattedUrl}`);
            shell.openExternal(formattedUrl, {activate: disposition !== 'background-tab'});
          } catch (error) {
            logger.warn(`Failed to open external window: ${error.message}`);
          }
        } else {
          AppActions.showUrlSchemeModal({
            url: formattedUrl,
            disposition: disposition
          });
        }
      } catch (error) {
        logger.warn(`Ignoring ${urlString} due to ${error.message}`);
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
   *
   * @param  {Url} parsedUrl    The return value of `url.parse`
   * @return {Url}              The same data but with escaped query and hash
   *                            sections
   * @private
   */
  escapeUrlWhenNeeded(parsedUrl) {
    const safeChars = /^[0-9a-zA-Z\$-_\.\+\!'\(\)]*$/;
    if (!(parsedUrl.hash || ' ').substring(1).match(safeChars)) {
      logger.info("Reformatting URL hash section");

      // NB: .hash includes the hash itself for whatever reason
      parsedUrl.hash = `#${encodeURIComponent(parsedUrl.hash.substring(1))}`;
    }

    if (!(parsedUrl.query || '').match(safeChars)) {
      logger.info("Reformatting URL query section");
      parsedUrl.query = encodeURIComponent(parsedUrl.query);
    }

    return parsedUrl.format();
  }
}

let behavior = new ExternalLinkBehavior();
export default behavior;
