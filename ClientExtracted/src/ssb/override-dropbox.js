import fs from 'graceful-fs';
import logger from '../logger';

/**
 * Oh my god, why would you want to do this 😢 ?
 * Well, dear colleague, I'm glad you asked. Because this option was only chosen after
 * careful consideration of all alternatives.
 *
 * Dropbox uses `postMessage` to communicate between the host page (the Slack team)
 * and the saver widget (a window opened using `window.open`). According to the standard,
 * one should be able to send messages to the opened window using the `postMessage`
 * method on the returned Window object from `window.open`. One should also be able to
 * use the same method on `event.source` for all events of type `MessageEvent`.
 * While we can employ electron-remote to fake communication between windows, we cannot
 * fully fake the `event.source` object so that it satisfies reference equality.
 *
 * Dropbox does hard reference comparisons in their code which we *cannot* code around.
 * For this reason (and in the Electron app only), we need to override the Desktop host script.
 *
 * #### Changes made in dropins.js (code de-minified with Chrome M53)
 * LL350 - e.source !== s && e.source !== (null != g ? g.contentWindow : void 0) || x(e, t, n)
 * LL350 + x(e, t, n)
 *
 * @export
 */
export default function overrideDropbox() {
  window.addEventListener('load', () => {
    if (document.location.hostname && document.location.hostname.includes('slack.com')) {
      let dropboxScript = document.getElementById('dropboxjs');

      if (!dropboxScript) return;

      fs.readFile(require.resolve('../static/override/dropins.js'), 'utf8', (err, result) => {
        if (err) {
          return logger.warn(`Error while trying to load Dropbox dropins override: ${err}`);
        }

        let dropboxOverwrite = document.createElement('script');
        dropboxOverwrite.type = 'text/javascript';
        dropboxOverwrite.id = 'dropboxjs';
        dropboxOverwrite.dataset.appKey = dropboxScript.dataset.appKey;
        dropboxOverwrite.innerHTML = result.toString();

        dropboxScript.remove();
        delete window.Dropbox;
        document.getElementsByTagName('head')[0].appendChild(dropboxOverwrite);
      });
    }
  });
}
