/**
 * @module Epics
 */ /** for typedoc */

import { BrowserWindow, webContents } from 'electron';
import { MiddlewareAPI } from 'redux';
import { ActionsObservable, Epic } from 'redux-observable';

import { APP, EVENTS, NOTIFICATIONS, SELECTED_TEAM_ACTION, SETTINGS, TEAMS } from '../actions';
import { Action } from '../actions/action';
import { localSettings } from '../browser/local-storage';
import { completeAction } from '../custom-operators';
import { intl as $intl } from '../i18n/intl';
import { logger } from '../logger';
import { RootState } from '../reducers';
import { NodeRTNotificationHelpers } from '../renderer/notifications/node-rt-notification-helpers';
import { getWindows } from '../stores/window-store-helper';
import { flushTelemetry } from '../telemetry';
import { IS_WINDOWS_STORE, WINDOW_TYPES } from '../utils/shared-constants';
import { OverlayIPCArg, focusMainWindow, getMainBrowserWindow, handleOverlayIcon } from './focus-main-window';
import { pickLocale } from './pick-locale';

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
    } catch (error) {
      logger.warn(`BrowserWindow Epic: Clearing action center failed`, { error });
      resolve();
    }
  });
};

/**
 * Override the `MainWindowCloseBehavior` so we can exit.
 */
const exitApplication = (store: MiddlewareAPI<any>): void => {
  const mainWnd = getMainBrowserWindow(store);
  if (!mainWnd) {
    logger.error(`exitApplication: trying to exit application but main windows instance does not exist`);
  } else {
    mainWnd.exitApp = true;
    mainWnd.close();
  }
};

/**
 * Do a bunch of clean-up work before we quit.
 */
const quitApplicationEpic: Epic<Action<any>, any> = (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<any>) =>
  actionObservable.ofType(EVENTS.QUIT_APP)
    .take(1)
    .do(() => clearActionCenter(store))
    .do(() => closeChildWindows(store))
    .do(() => exitApplication(store))
    .mergeMap(flushTelemetry)
    .let(completeAction);

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
const openDevToolsEpic: Epic<Action<any>, any> = (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<any>) =>
  actionObservable.ofType(EVENTS.TOGGLE_DEV_TOOLS)
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

/**
 * Focus the main window for certain types of events. Note that the actual
 * event handling occurs in renderer side epics.
 */
const focusMainWindowEpic: Epic<Action<any>, any> = (
  actionObservable: ActionsObservable<Action<any>>,
  store: MiddlewareAPI<RootState>
) => {
  const eventObservable = actionObservable.ofType(
    EVENTS.APP_STARTED,
    EVENTS.QUIT_APP,
    EVENTS.FOREGROUND_APP,
    EVENTS.HANDLE_DEEP_LINK,
    EVENTS.SHOW_WEBAPP_DIALOG,
    NOTIFICATIONS.CLICK_NOTIFICATION
  );

  // Split into separate observables to process
  const [appEventObservable, focusObservable] = eventObservable
    .partition((x) => (x.type === EVENTS.APP_STARTED || x.type === EVENTS.QUIT_APP));
  const [started, quitEvent] = appEventObservable
    .partition((x) => x.type === EVENTS.APP_STARTED);

  // When the application starts, listen for IPC events for the overlay icon.
  // We do it with old-fashioned IPC because storing the whole buffer in Redux
  // would be unwieldy.
  const overlayIconObservable = started
    .mergeMap(() =>
      handleOverlayIcon().do((arg) => {
        const mainWindow = getMainBrowserWindow(store);
        if (mainWindow) {
          mainWindow.setOverlayIcon(arg.overlay!, arg.overlayDescription);
        }
      }))
    .takeUntil(quitEvent);

  return focusObservable
    .withLatestFrom(overlayIconObservable)
    .do((arg: [Action<any>, OverlayIPCArg]) => focusMainWindow(store, arg[1]))
    .let(completeAction);
};

const applyLocaleEpic: Epic<Action<any>, RootState> =
  (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<RootState>) =>
    actionObservable.ofType(...SELECTED_TEAM_ACTION, TEAMS.UPDATE_TEAM_LOCALE, TEAMS.REMOVE_TEAM, TEAMS.REMOVE_TEAMS)
      .map(() => pickLocale(store))
      .filter((locale) => !!locale)
      .distinctUntilChanged()
      .do((locale) => $intl.applyLocale(locale!))
      .do((locale) => localSettings.setItem('lastKnownLocale', locale))
      .map((locale) => ({
        type: SETTINGS.UPDATE_SETTINGS,
        data: { locale },
        meta: undefined
      }));

const browserWindowEpics = [
  quitApplicationEpic,
  openDevToolsEpic,
  focusMainWindowEpic,
  applyLocaleEpic
];

export {
  quitApplicationEpic,
  canOpenDevtools,
  openDevToolsEpic,
  focusMainWindowEpic,
  browserWindowEpics
};
