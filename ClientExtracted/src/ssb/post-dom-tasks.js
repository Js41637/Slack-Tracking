import {remote} from 'electron';
import {RecursiveProxyHandler} from 'electron-remote';
import Hammer from 'hammerjs';

import logger from '../logger';
import AppActions from '../actions/app-actions';

const {systemPreferences} = remote;
const invalidEventTargetHeader = ['#search_container', '#topic_inline_edit'];

/**
 * Sets up event handlers for swiping to go back and forward in history with a
 * two-finger swipe left / right, and switching between teams with a
 * three-finger swipe left / right.
 */
function setupTouchscreenEvents() {
  let twoSwipe = new Hammer.Manager(document.body);
  twoSwipe.add(new Hammer.Swipe({ pointers: 2 }));
  twoSwipe.on('swipeleft', () => window.history.go(-1));
  twoSwipe.on('swiperight', () => window.history.go(1));

  let threeSwipe = new Hammer.Manager(document.body);
  threeSwipe.add(new Hammer.Swipe({ pointers: 3 }));
  threeSwipe.on('swipeleft', () => AppActions.selectPreviousTeam());
  threeSwipe.on('swiperight', () => AppActions.selectNextTeam());
}

function isEventInvalid(elements, event) {
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
function setupDoubleClickHandler(mainWindow) {
  let channelHeader = null;
  const invalidEventElements = { };

  window.addEventListener('dblclick', (event) => {
    let actionOnDoubleClick = systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');
    channelHeader = channelHeader || document.querySelector('#client_header');

    const isDblClickValid = channelHeader && channelHeader.contains(event.target);
    if (!isDblClickValid || isEventInvalid(invalidEventElements, event)) {
      return;
    }

    switch (actionOnDoubleClick) {
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
 * Sets up an alias to the standard LocalStorage API, while excluding a few URIs.
 */
function setupLocalStorageAlias() {
  // NB: Even touching localStorage in some URIs will cause errors to be thrown
  if (window.location.protocol !== 'data:' &&
    window.location.protocol !== 'about:') {
    window.winssb.ls = window.localStorage;
  }
}

/**
 * Disables our `window.winssb` (and `window.desktop`) global. This is needed
 * for a few situations, like when the window is in the process of unloading.
 */
function disableDesktopIntegration() {
  logger.info('Window is unloading, winssb is no longer accessible');

  for (let key of Object.keys(window.winssb)) {
    // NB: Because Calls is always calling into a native library in-process
    // instead of making IPC calls, the same rules don't really apply, they
    // get a pass.
    if (key === 'calls' || key === 'screenhero') continue;

    window.winssb[key] = new RecursiveProxyHandler(key, () => {});
  }
}

export {
  setupTouchscreenEvents,
  setupDoubleClickHandler,
  setupLocalStorageAlias,
  disableDesktopIntegration
};
