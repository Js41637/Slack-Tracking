import {Observable} from 'rxjs/Observable';
import {ContextMenuBuilder, setGlobalLogger} from 'electron-spellchecker';
import {createProxyForRemote} from 'electron-remote';

import SettingStore from '../../stores/setting-store';
import logger from '../../logger';

setGlobalLogger(logger.info.bind(logger));

class ContextMenuBehavior {
  // Public: Sets up a {ContextMenuBuilder} with a hook that receives context
  // menu events from the webapp.
  //
  // webView - The {WebViewContext} to apply this behavior to
  //
  // Returns a {Subscription} that will undo what the method did
  setup(webView) {
    let signal = Observable.fromEvent(webView, 'ipc-message')
      .filter(({channel}) => channel === 'context-menu-show')
      .map((message) => message.args[0]);

    let remoteSpellcheckHandler = createProxyForRemote(webView).winssb.spellCheckingHelper.spellCheckHandler;

    let showDevMenu = SettingStore.getSetting('isDevMode') || // Running from source
      process.env.SLACK_DEVELOPER_MENU;                       // Production build that has previously signed into Slack Corp

    let contextMenuBuilder = new ContextMenuBuilder(
      remoteSpellcheckHandler,
      webView,
      showDevMenu
    );

    return signal.subscribe((menuInfo) => {
      contextMenuBuilder.showPopupMenu(menuInfo);
    });
  }
}

export default new ContextMenuBehavior();
