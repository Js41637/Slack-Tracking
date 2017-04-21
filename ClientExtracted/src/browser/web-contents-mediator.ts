/**
 * @module Browser
 */ /** for typedoc */

import { app, BrowserWindow } from 'electron';

import { ReduxComponent } from '../lib/redux-component';
import { settingStore } from '../stores/setting-store';
import { setZoomLevelAndLimits } from '../utils/zoomlevels';
import { windowStore } from '../stores/window-store';
import { Window } from '../stores/window-store-helper';

import { StringMap, WINDOW_TYPES } from '../utils/shared-constants';

export interface WebContentsMediatorState {
  zoomLevel: number;
  childWindows: StringMap<Window>;
}

/**
 * We use this class when we need to hook events that apply to all webContents
 * but want to avoid the curse of remote event handlers.
 */
export class WebContentsMediator<S extends WebContentsMediatorState> extends ReduxComponent<S> {
  constructor() {
    super();

    app.on('web-contents-created', (_e: Event, webContents: Electron.WebContents) => {
      this.onWebContentsCreated(webContents);
    });
  }

  public syncState(): Partial<S> | null {
    return {
      zoomLevel: settingStore.getSetting<number>('zoomLevel'),
      childWindows: windowStore.getWindows([WINDOW_TYPES.WEBAPP])
    } as S;
  }

  /**
   * Watch for new webContents and hook certain events. Be sure to remove the
   * listeners once the webContents is destroyed.
   *
   * @param  {WebContents} webContents An Electron webContents
   */
  private onWebContentsCreated(webContents: Electron.WebContents): void {
    // Work around electron/electron#6643
    const contextMenuListener = (_e: Event, params: any) => {
      if (webContents.isDestroyed()) return;
      webContents.send('context-menu-ipc', params);
    };

    // Work around electron/electron#6958
    const didNavigateListener = () => {
      if (webContents.isDestroyed()) return;
      if (this.isCallsWindow(webContents)) return;
      setZoomLevelAndLimits(webContents, this.state.zoomLevel);
    };

    // Prevent navigation to anything that's not http: / https:, but only for
    // webviews. Skip WebContents for windows because of popup windows like
    // Dropbox or Box importers, which need to navigate.
    const willNavigateListener = (e: Event, url: string) => {
      if (webContents.isDestroyed()) return;
      if ((webContents as any).getType() !== 'webview') return;
      if (url.match(/^https?:\/\//i)) return;

      e.preventDefault();
    };

    webContents.on('context-menu', contextMenuListener);
    webContents.on('did-navigate-in-page', didNavigateListener);
    webContents.on('will-navigate', willNavigateListener);

    webContents.once('destroyed', () => {
      webContents.removeListener('context-menu', contextMenuListener);
      webContents.removeListener('did-navigate-in-page', didNavigateListener);
      webContents.removeListener('will-navigate', willNavigateListener);
    });
  }

  private isCallsWindow(webContents: Electron.WebContents): boolean {
    const browserWindow = BrowserWindow.fromWebContents(webContents);
    if (!browserWindow) return false;

    const windowParams = this.state.childWindows[browserWindow.id];
    if (!windowParams) return false;

    return windowStore.isCallsWindow(windowParams.subType);
  }
}
