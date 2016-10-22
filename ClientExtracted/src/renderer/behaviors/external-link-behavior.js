import logger from '../../logger';
import {Observable} from 'rx';
import {shell} from 'electron';
import url from 'url';

/**
 * The protocols that we will try to open via `shell`
 */ 
const VALID_SHELL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'skype:', 'spotify:',
  'live:', 'callto:', 'tel:', 'im:', 'sip:', 'sips:'];

class ExternalLinkBehavior {

  /**  
   * Opens external links in the default browser, or performs the OS default
   * action (e.g., open mail or Skype).
   *    
   * @param  {WebContents} webView  The web contents to apply this behavior to
   * @return {Disposable}           A Disposable that will undo what the method did   
   */   
  setup(webView) {
    return Observable.fromEvent(webView, 'new-window', (e, urlString) => {
      // NB: On `webview` tags, the event includes the URL. But on
      // `WebContents`, it's the second parameter.
      return e.url ? {e, urlString: e.url} : {e, urlString};
      
    }).subscribe(({e, urlString}) => {
      try {
        e.preventDefault();
        let theUrl = url.parse(urlString);

        if (!VALID_SHELL_PROTOCOLS.includes(theUrl.protocol)) {
          throw new Error("Invalid protocol");
        }

        let realUrl = url.format(this.escapeUrlWhenNeeded(theUrl));

        logger.info(`Opening external window to ${realUrl}`);
        shell.openExternal(realUrl);
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

    return parsedUrl;
  }
}

let behavior = new ExternalLinkBehavior();
export default behavior;
