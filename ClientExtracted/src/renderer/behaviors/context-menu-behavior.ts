/**
 * @module RendererBehaviors
 */ /** for typedoc */

import { contextMenuStringTable, ContextMenuBuilder } from '../../context-menu';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { createProxyForRemote } from 'electron-remote';
import { setGlobalLogger } from 'electron-spellchecker';
import { remote } from 'electron';

import { windowFrameStore } from '../../stores/window-frame-store';
import { eventActions } from '../../actions/event-actions';
import { settingStore } from '../../stores/setting-store';
import { WebViewBehavior } from './webView-behavior';
import { logger } from '../../logger';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

setGlobalLogger(logger.info.bind(logger));

export class ContextMenuBehavior implements WebViewBehavior {
  /**
   * Public: Sets up a {ContextMenuBuilder} with a hook that receives context
   * menu events from the webapp.
   *
   * @param {Electron.WebViewElement} webView The {WebViewContext} to apply this behavior to
   * @returns {Subscription} A {Subscription} that will undo what the method did
   */
  public setup(webView: Electron.WebViewElement): Subscription {
    const signal = Observable.fromEvent(webView, 'ipc-message')
      .filter(({ channel }) => channel === 'context-menu-show')
      .map((message: {
        args: Array<any>
      }) => message.args[0]);

    const remoteSpellcheckHandler = createProxyForRemote(webView).winssb.spellCheckingHelper.spellCheckHandler;

    const showDevMenu = settingStore.getSetting('isDevMode') || // Running from source
      process.env.SLACK_DEVELOPER_MENU;                       // Production build that has previously signed into Slack Corp

    const contextMenuBuilder = new ContextMenuBuilder(
      remoteSpellcheckHandler,
      webView,
      !!showDevMenu,
      this.processMenu
    );

    return signal.subscribe((menuInfo) => {
      contextMenuBuilder.showPopupMenu(menuInfo);
    });
  }

  /**
   * Before showing the context menu, electron-spellchecker
   * calls this method with the menu it built.
   *
   * @private
   * @param {Electron.Menu} menu
   * @returns {Electron.Menu} menu
   */
  private processMenu(menu: Electron.Menu, /* info */) {
    // Temporary for Electron 1.6: Remove "Look up" until we'll get it back 😢
    // TODO: Evaluate constantly whether or not we still need this
    if (process.platform === 'darwin') {
      const expectedLabel = contextMenuStringTable.lookUpDefinition({ word: '' }) || 'Look up';
      const labelMatchable = expectedLabel.replace('""', '');

      menu.items.forEach((item) => {
        if (item && item.label && (item.label.includes(labelMatchable))) {
          item.visible = false;
        };
      });
    }

    if (windowFrameStore.isFullScreen()) {
      menu.append(new remote.MenuItem({ type: 'separator' }));
      menu.append(new remote.MenuItem({
        click: () => eventActions.toggleFullScreen(),
        label: $intl.t('Exit Full Screen', LOCALE_NAMESPACE.MENU)()
      }));
    }

    return menu;
  }
}

const contextMenuBehavior = new ContextMenuBehavior();
export {
  contextMenuBehavior
};
