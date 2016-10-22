import {DOM} from 'rx-dom';
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
  // Returns a {Disposable} that will undo what the method did
  setup(webView) {
    let signal = DOM.fromEvent(webView, 'ipc-message')
      .where(({channel}) => channel === 'context-menu-show')
      .map((message) => message.args[0]);

    let remoteSpellcheckHandler = createProxyForRemote(webView).winssb.spellCheckingHelper.spellCheckHandler;
    let contextMenuBuilder = new ContextMenuBuilder(
      remoteSpellcheckHandler, webView,
      SettingStore.getSetting('isDevMode'));

    return signal.subscribe((menuInfo) => {
      contextMenuBuilder.showPopupMenu(menuInfo);
    });
  }
}

export default new ContextMenuBehavior();
