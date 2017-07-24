/**
 * @module Utilities
 */ /** for typedoc */

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ContextMenuBuilder, contextMenuStringTable } from '../context-menu';

import { eventActions } from '../actions/event-actions';
import { logger } from '../logger';
import { Behavior } from '../renderer/behaviors/behavior';
import { settingStore } from '../stores/setting-store';
import { windowFrameStore } from '../stores/window-frame-store';

import { LOCALE_NAMESPACE, intl as $intl } from '../i18n/intl';

let remote: Electron.Remote,
  createProxyForRemote: any;

if (process.type === 'renderer') {
  remote = require('electron').remote;
  createProxyForRemote = require('electron-remote').createProxyForRemote;
  const setGlobalLogger = require('electron-spellchecker').setGlobalLogger;
  setGlobalLogger(logger.info.bind(logger));
}

export class ContextMenuBehavior implements Behavior<Electron.WebviewTag | Electron.WebContents> {
  /**
   * Public: Sets up a {ContextMenuBuilder} with a hook that receives context
   * menu events from the webapp.
   *
   * @param {Electron.WebViewElement} webView The {WebViewContext} to apply this behavior to
   * @returns {Subscription} A {Subscription} that will undo what the method did
   */
  public setup(webViewOrContents: Electron.WebviewTag | Electron.WebContents): Subscription {
    if (process.type === 'browser') {
      return this.setupBrowserBehavior(webViewOrContents);
    } else {
      return this.setupRendererBehavior(webViewOrContents);
    }
  }

  private setupRendererBehavior(webView: Electron.WebviewTag | Electron.WebContents): Subscription {
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

  private setupBrowserBehavior(webContents: Electron.WebviewTag | Electron.WebContents): Subscription {
    const contextMenuBuilder = new ContextMenuBuilder(null, webContents);

    return Observable.fromEvent(webContents, 'context-menu', (_e, info) => info).subscribe((info) => {
      contextMenuBuilder.showPopupMenu(info);
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
        }
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
