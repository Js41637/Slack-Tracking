/**
 * @module SSBIntegration
 */ /** for typedoc */

import { remote } from 'electron';
import { RecursiveProxyHandler } from 'electron-remote';
import * as Hammer from 'hammerjs';
import { noop } from '../utils/noop';

import { appTeamsActions } from '../actions/app-teams-actions';
import { logger } from '../logger';

const { systemPreferences } = remote;
const invalidEventTargetHeader = ['#search_container', '#topic_inline_edit'];

/**
 * Sets up event handlers for swiping to go back and forward in history with a
 * two-finger swipe left / right, and switching between teams with a
 * three-finger swipe left / right.
 */
function setupTouchscreenEvents() {
  const twoSwipe = new Hammer.Manager(document.body);
  twoSwipe.add(new Hammer.Swipe({ pointers: 2 }));
  twoSwipe.on('swipeleft', () => window.history.go(-1));
  twoSwipe.on('swiperight', () => window.history.go(1));

  const threeSwipe = new Hammer.Manager(document.body);
  threeSwipe.add(new Hammer.Swipe({ pointers: 3 }));
  threeSwipe.on('swipeleft', () => appTeamsActions.selectPreviousTeam());
  threeSwipe.on('swiperight', () => appTeamsActions.selectNextTeam());
}

function isEventInvalid(elements: HTMLElement, event: Event) {
  return invalidEventTargetHeader.reduce((acc, id) => {
    let target = elements[id];
    if (!target) {
      elements[id] = target = document.querySelector(id);
    }
    return (target && target.contains(event.target)) || acc;
  }, false);
}

/**
 * Sets up an event handler for minimizing the main app window on double-
 * click.
 *
 * @param  {Object} mainWindow  A {BrowserWindow} instance representing the main
 * window of the app.
 */
function setupDoubleClickHandler(mainWindow: Electron.BrowserWindow): void {
  let channelHeader: Element | null = null;
  const invalidEventElements = {};

  window.addEventListener('dblclick', (event: MouseEvent) => {
    const actionOnDoubleClick = systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');
    channelHeader = channelHeader || document.querySelector('#client_header');

    const isDblClickValid = channelHeader && channelHeader.contains(event.target as Node);
    if (!isDblClickValid || isEventInvalid(invalidEventElements as HTMLElement, event)) {
      return;
    }

    switch (actionOnDoubleClick as any) {
      case 'Maximize':
      default:
        mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
        break;
      case 'Minimize':
        mainWindow.minimize();
        break;
      case 'None':
        break;
    }
  }, true);
}

/**
 * Even touching localStorage in a data URI will throw errors.
 */
function canAccessLocalStorage() {
  return window.location.protocol !== 'data:' &&
    window.location.protocol !== 'about:';
}

/**
 * Disables our `window.winssb` (and `window.desktop`) global. This is needed
 * for a few situations, like when the window is in the process of unloading.
 */
function disableDesktopIntegration() {
  logger.info('Window is unloading, winssb is no longer accessible');

  for (const key of Object.keys(window.winssb)) {
    // NB: Because Calls is always calling into a native library in-process
    // instead of making IPC calls, the same rules don't really apply, they
    // get a pass.
    if (key === 'calls' || key === 'screenhero') continue;

    window.winssb[key] = new RecursiveProxyHandler(key, () => noop());
  }
}

export {
  setupTouchscreenEvents,
  setupDoubleClickHandler,
  canAccessLocalStorage,
  disableDesktopIntegration
};
