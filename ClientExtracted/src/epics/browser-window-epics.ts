/**
 * @module Epics
 */ /** for typedoc */

import { Action } from '../actions/action';
import { MiddlewareAPI } from 'redux';
import { Epic, ActionsObservable } from 'redux-observable';
import { BrowserWindow, webContents } from 'electron';
import { APP } from '../actions/';
import { logger } from '../logger';
import { EVENTS } from '../actions';
import { WINDOW_TYPES, IS_WINDOWS_STORE } from '../utils/shared-constants';
import { getWindowOfType, getWindows } from '../stores/window-store-helper';
import { NodeRTNotificationHelpers } from '../renderer/components/node-rt-notification-helpers';
import '../custom-operators';

const CHILD_WINDOWS = [WINDOW_TYPES.WEBAPP];

const closeChildWindows = (store: MiddlewareAPI<any>): void => {
  const childWindows = getWindows(store, CHILD_WINDOWS);

  Object.keys(childWindows)
    .map((key) => childWindows[key].id)
    .map((id) => BrowserWindow.fromId(id))
    .forEach((window) => window.close());
};

const clearActionCenter = (store: MiddlewareAPI<any>) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve();

    // Decide if we want to clear notifications on application exit.
    //
    // Windows Store: Clear notifications, we can't handle them if the app is closed
    // Windows Store: Clear tile updates, we don't want to show them after exit
    // Windows 10   : Clear if configured, for instance due to interactive replies
    //
    // Why the timeout?
    // Clear() isn't async, but it's not sync either. If we exit early,
    // we won't have cleared. We're hoping to be done in 500ms.
    try {
      const { settings } = store.getState();

      // Tile Notifications
      if (IS_WINDOWS_STORE) {
        logger.info('BrowserWindow Epic: Clearing toast notifications due to setting "clearNotificationsOnExit"');
        NodeRTNotificationHelpers.clearTileNotifications();
      }

      if (IS_WINDOWS_STORE || settings.clearNotificationsOnExit) {
        setTimeout(() => resolve(), 500);
      } else {
        resolve();
      }
    } catch (e) {
      logger.warn(`BrowserWindow Epic: Clearing action center failed: ${JSON.stringify(e)}`);
      resolve();
    }
  });
};

const exitApplication = (store: MiddlewareAPI<any>): void => {
  const mainWindow = getWindowOfType(store, 'MAIN')!;
  const mainWnd = BrowserWindow.fromId(mainWindow.id);

  // Setting this overrides the `MainWindowCloseBehavior`
  mainWnd.exitApp = true;
  mainWnd.close();
};

export const quitApplicationEpic: Epic<Action<any>, any> = (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<any>) => {
  return actionObservable.ofType(EVENTS.QUIT_APP)
  .take(1)
  .do(() => clearActionCenter(store))
  .do(() => closeChildWindows(store))
  .do(() => exitApplication(store))
  .completeAction();
};

const canOpenDevtools = (store: MiddlewareAPI<any>, contents: Electron.WebContents, electronDevTools: boolean): boolean => {
  // If opening devTools for the main renderer, nothing to filter.
  if (electronDevTools) {
    return true;
  }

  const { appTeams, teams } = store.getState();
  const selectedTeam = teams[appTeams.selectedTeamId];

  // If we're not signed into any teams, open any webapp page.
  if (!selectedTeam) {
    return true;
  }

  const teamUrl = selectedTeam.team_url;
  return contents.getURL().startsWith(teamUrl);
};

const buildDevtoolsContext = (electron: boolean) => {
  const urlPrefix = electron ? /^file:/ : /^https:/;
  const contents = webContents.getAllWebContents().filter((wc) => wc.getURL().match(urlPrefix));
  const opened = contents.filter((wc) => wc.isDevToolsOpened());
  return {
    electron,
    contents,
    opened
  };
};

/**
 * If any devTools are open, find them & close them. Otherwise, open devTools
 * for all webContents that meet some criteria.
 *
 * @param  {Boolean} electronDevTools  True to open devTools for the main renderer,
 *                                     false for just the selected team's webView
 */
export const openDevToolsEpic: Epic<Action<any>, any> = (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<any>) => {
  return actionObservable.ofType(EVENTS.TOGGLE_DEV_TOOLS)
    .map((x) => buildDevtoolsContext(x.data))
    .do((context) => {
      const { opened, contents, electron } = context;

      if (opened.length > 0) {
        opened.forEach((wc) => wc.closeDevTools());
      } else {
        contents.filter((wc) => canOpenDevtools(store, wc, electron)).forEach((wc) => wc.openDevTools());
      }
    })
    .filter((context) => context.electron)
    .map((context) => ({
      type: APP.MARK_DEVTOOLS_STATE,
      data: context.opened.length === 0
    }));
};

const browserWindowEpics = [quitApplicationEpic, openDevToolsEpic];

export {
  browserWindowEpics
};
