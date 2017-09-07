import { MiddlewareAPI } from 'redux';
import { ActionsObservable, Epic } from 'redux-observable';
import { Action } from '../actions/action';
import { EVENTS, SELECTED_TEAM_ACTION, TEAMS } from '../actions/index';
import { completeAction } from '../custom-operators';

import { intl as $intl } from '../i18n/intl';
import { logger } from '../logger';
import { RootState } from '../reducers/index';
import { getSetting } from '../stores/setting-store-helper';
import { flushTelemetry } from '../telemetry';
import { releaseDocumentFocus } from '../utils/document-focus';
import { pickActionData } from './pick-action-data';
import { pickLocale } from './pick-locale';

import '../custom-operators';
import '../rx-operators';

interface WebViewContext {
  isLoginDialog: boolean;
  isMac: boolean;
  webViewElement: Electron.WebviewTag | null;
}

/**
 * Find existing web view element corresponding to given state.
 * If login dialog is opened, it'll look for login view's webViewElement as it's modal dialog stays on top of any other views.
 * Otherwise, it'll try to find currently selected team's webViewElement instead.
 *
 * Note returned webViewElement is type of Electron.WebViewElement
 *
 * @param store Root state store object allow to determine current state
 */
const lookupWebViewElement = (store: MiddlewareAPI<RootState>): WebViewContext => {
  const { dialog, appTeams } = store.getState();
  const elementId = `webview:${dialog.isShowingLoginDialog ? 'login' : `${appTeams.selectedTeamId}`}`;

  const ret: WebViewContext = {
    isLoginDialog: dialog.isShowingLoginDialog,
    isMac: getSetting(store, 'platform') === 'darwin',
    webViewElement: null
  };

  try {
    ret.webViewElement = document.querySelector(`[id='${elementId}']`) as Electron.WebviewTag;
  } catch (error) {
    logger.warn('WebViewContext: Failed to locate webViewElement', { elementId, error });
  }

  return ret;
};

/**
 * Focus is a tricky beast with `webview` tags, as we have to dodge a bunch
 * of Chromium bugs. We don't focus the `webview` itself to avoid an
 * apparently unstylable focus rectangle. In addition, we need the host page
 * to release document focus in order for focus to propagate to any of its
 * `webview` children. Refer to
 * https://github.com/javan/electron-webview-ime-fix for details.
 */
const focusTeamViewElement = (webViewElement: Electron.WebviewTag, isMac: boolean): void => {
  const defaultFocusMethod = () => webViewElement.shadowRoot!.querySelector('object')!.focus();

  if (isMac) {
    //somehow direct focus to webview and its contents in mac os causes synchronous ipc blocking,
    //falls back to legacy focus instead
    defaultFocusMethod();
  } else {
    try {
      const contents = webViewElement.getWebContents();
      if (!!contents && !contents.isFocused()) {
        webViewElement.focus();
        (contents as any).focus();
      }
    } catch (error) {
      //note: while this try to catch possible as it can,
      //as `getWebContents` try to access main process and if crash occurs around those, it'll not reach here.
      defaultFocusMethod();
      logger.warn('WebViewContext: Tried to focus', { error });
    }
  }

  releaseDocumentFocus();
};

/**
 * Triggers webview element's offset change via application menu
 */
export const goToOffsetEpic: Epic<Action<any>, RootState> =
  (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<RootState>) =>
    actionObservable.ofType(EVENTS.APP_COMMAND)
    .do(() => logger.debug(`goToOffsetEpic: try to trigger offset navigation`))
    .map((action) => {
      const command = pickActionData(action.data);
      if (!command) {
        logger.error(`goToOffsetEpic: action does not contains command, cannot change offset`);
        return null;
      }
      logger.info(`goToOffsetEpic: received command`, { command });
      if (command === 'browser-backward') {
        return -1;
      }
      if (command === 'browser-forward') {
        return 1;
      }
      return null;
    })
    .filter((x) => !!x)
    .do((offset) => {
      const webView = lookupWebViewElement(store);
      if (webView.webViewElement) {
        webView.webViewElement.goToOffset(offset!);
      }
    })
    .let(completeAction);

/**
 * When main window is focused or triggered event for any other reason, try to focus into current webview element
 */
export const focusEpic: Epic<Action<any>, RootState> =
  (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<RootState>) =>
    actionObservable.ofType(EVENTS.MAIN_WINDOW_FOCUSED)
      .map(() => lookupWebViewElement(store))
      .filter((x) => !!x.webViewElement)
      .do((context) => focusTeamViewElement(context.webViewElement!, context.isMac))
      .let(completeAction);

/**
 * flush renderer side telemetry when quite application.
 */
const quitApplicationEpic: Epic<Action<any>, any> = (actionObservable: ActionsObservable<Action<any>>, _store: MiddlewareAPI<any>) =>
  actionObservable.ofType(EVENTS.QUIT_APP)
    .mergeMap(flushTelemetry)
    .let(completeAction);

const applyLocaleByTeamSelectionEpic: Epic<Action<any>, RootState> =
  (actionObservable: ActionsObservable<Action<any>>, store: MiddlewareAPI<RootState>) =>
    actionObservable.ofType(...SELECTED_TEAM_ACTION, TEAMS.REMOVE_TEAM, TEAMS.REMOVE_TEAMS)
      .map(() => pickLocale(store))
      .filter((locale) => !!locale)
      .distinctUntilChanged()
      .do((locale) => $intl.applyLocale(locale!))
      .let(completeAction);

export const webViewContextEpics = [
  focusEpic,
  goToOffsetEpic,
  quitApplicationEpic,
  applyLocaleByTeamSelectionEpic
];
