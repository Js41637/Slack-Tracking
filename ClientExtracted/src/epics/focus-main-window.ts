import { BrowserWindow, nativeImage } from 'electron';
import { MiddlewareAPI } from 'redux';
import { Observable } from 'rxjs';

import { LOCALE_NAMESPACE, intl as $intl } from '../i18n/intl';
import { ipc } from '../ipc-rx';
import { RootState } from '../reducers';
import { getWindowOfType } from '../stores/window-store-helper';
import { WINDOW_TYPES } from '../utils/shared-constants';
import { WindowHelpers } from '../utils/window-helpers';

/**
 * interface for settings overlay via ipc.
 */
interface OverlayIPCArg {
  overlay: Electron.NativeImage | null;
  overlayDescription: string;
}

/**
 * get main browserwindow instance via lookup current store state.
 */
const getMainBrowserWindow = (store: MiddlewareAPI<any>) => {
  const mainWindow = getWindowOfType(store, WINDOW_TYPES.MAIN)!;
  if (!mainWindow || !mainWindow.id) {
    return null;
  }

  return BrowserWindow.fromId(mainWindow.id);
};


const focusMainWindow = (store: MiddlewareAPI<RootState>, arg: OverlayIPCArg) => {
  const mainWnd = getMainBrowserWindow(store);
  if (!mainWnd) {
    return;
  }

  WindowHelpers.bringToForeground(mainWnd, store);
  if (process.platform === 'win32') {
    const restoredFromTray = !mainWnd.isVisible();
    // If we recreated the taskbar icon we also need to redraw the overlay
    if (restoredFromTray && arg.overlay) {
      mainWnd.setOverlayIcon(arg.overlay, arg.overlayDescription);
    }
  }
};

/**
 * Listen to messages from the renderer describing the overlay icon and set
 * it accordingly. This is deeply un-React, but it's too expensive to put
 * the image buffer into state.
 *
 * @return {Subscription}  A Subscription that will unsubscribe the listener
 */
const handleOverlayIcon = (): Observable<OverlayIPCArg> =>
  ipc.listen('window:set-overlay-icon')
    .startWith(null)
    .map((buf: any) => {
      if (buf) {
        return {
          overlay: nativeImage.createFromBuffer(buf, 96),
          overlayDescription: $intl.t('You have unread messages', LOCALE_NAMESPACE.BROWSER)()
        };
      } else {
        return { overlay: null, overlayDescription: '' };
      }
    });

export {
  getMainBrowserWindow,
  OverlayIPCArg,
  focusMainWindow,
  handleOverlayIcon
};
