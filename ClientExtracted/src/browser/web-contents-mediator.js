import {app, BrowserWindow} from 'electron';

import ReduxComponent from '../lib/redux-component';
import {settingStore} from '../stores/setting-store';
import WindowStore from '../stores/window-store';

import {WINDOW_TYPES} from '../utils/shared-constants';

/**
 * We use this class when we need to hook events that apply to all webContents
 * but want to avoid the curse of remote event handlers.
 */
export default class WebContentsMediator extends ReduxComponent {

  constructor() {
    super();

    app.on('web-contents-created', (e, webContents) => {
      this.onWebContentsCreated(webContents);
    });
  }

  syncState() {
    return {
      zoomLevel: settingStore.getSetting('zoomLevel'),
      childWindows: WindowStore.getWindows([WINDOW_TYPES.WEBAPP])
    };
  }

  /**
   * Watch for new webContents and hook certain events. Be sure to remove the
   * listeners once the webContents is destroyed.
   *
   * @param  {WebContents} webContents An Electron webContents
   */
  onWebContentsCreated(webContents) {
    // Work around electron/electron#6643
    const contextMenuListener = (e, params) => {
      if (webContents.isDestroyed()) return;
      webContents.send('context-menu-ipc', params);
    };

    // Work around electron/electron#6958
    const didNavigateListener = () => {
      if (webContents.isDestroyed()) return;
      if (this.isCallsWindow(webContents)) return;

      webContents.setLayoutZoomLevelLimits(this.state.zoomLevel, this.state.zoomLevel);
      webContents.setZoomLevel(this.state.zoomLevel);
    };

    webContents.on('context-menu', contextMenuListener);
    webContents.on('did-navigate-in-page', didNavigateListener);

    webContents.once('destroyed', () => {
      webContents.removeListener('context-menu', contextMenuListener);
      webContents.removeListener('did-navigate-in-page', didNavigateListener);
    });
  }

  isCallsWindow(webContents) {
    const browserWindow = BrowserWindow.fromWebContents(webContents);
    if (!browserWindow) return false;

    const windowParams = this.state.childWindows[browserWindow.id];
    if (!windowParams) return false;

    return WindowStore.isCallsWindow(windowParams.subType);
  }
}
