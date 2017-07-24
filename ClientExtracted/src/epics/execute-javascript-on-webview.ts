import { MiddlewareAPI } from 'redux';
import { Observable } from 'rxjs/Observable';
import { logger } from '../logger';
import { RootState } from '../reducers';
import { truncateString } from '../utils/truncate-string';

import '../rx-operators';

export type GetCodeForWebView = (id: string, store: MiddlewareAPI<RootState>) => string;

/**
 * Utility function to catch thrown exception and log it, with chaining.
 */
const catchObservable = (message: string, value: any = '') =>
  (o: Observable<any>) => o.catch((e) => {
    logger.error(`WebAppEpic: unexpected error occurred, ${message}`, e);
    return Observable.of(value);
  });

/**
 * Lookup corresponding webview and execute JavaScript within it.
 * If it succeeds we forward the return value, otherwise we forward null.
 *
 * Note: `executeJavascript` should be called only once webview has reached
 * WEBVIEW_LIFECYCLE.PAGE_LOADED. Calls made into the page when it hasn't yet
 * loaded may not be executed.
 */
const executeJavaScriptOnWebView = (o: Observable<{ id: string, code: string }>): Observable<any | null> => {
  const executeJavaScript = (value: { id: string, code: string }) => {
    const nullReturnValue = Observable.of(null);

    if (!value || !value.id || !value.code || value.code === '') {
      logger.error('executeJavaScript: Invalid arguments!');
      return nullReturnValue;
    }

    const { id, code } = value;

    try {
      const codeSnippet = truncateString(code);
      const webView = document.querySelector(`[id='webview:${id}']`) as Electron.WebviewTag;
      const boundExecute: typeof webView.executeJavaScript = webView.executeJavaScript.bind(webView);
      const executeJavaScriptObservable = Observable.bindCallback(boundExecute);

      logger.debug('executeJavaScript: Trying to execute code', { id, codeSnippet });

      return executeJavaScriptObservable(code, false)
        .do((result) => logger.debug('executeJavaScript returned', { codeSnippet, webViewId: id, result }))
        .let(catchObservable(`executeJavaScript: Failed to execute ${codeSnippet} on webview ${id}`, null));
    } catch (error) {
      logger.error('executeJavaScript: Failed to execute', { webViewId: id, error });
    }

    return nullReturnValue;
  };

  return o.mergeMap(executeJavaScript);
};

/**
 * Create a new Observable that invokes executeJavaScript for each item.
 */
const executeJavaScriptOnWebViewObservable = (args: { id: string, code: string }):
  Observable<any | null> => {
  return Observable.of(args).let(executeJavaScriptOnWebView);
};

/**
 * Create a new Observable that invokes executeJavaScript in each team webview.
 *
 * @param {MiddlewareAPI} store       API to the Redux store
 * @param {GetCodeForWebView} getCode Method to retrieve the code
 */
const executeJavaScriptOnAllWorkspaces = (
  store: MiddlewareAPI<RootState>,
  getCode: GetCodeForWebView,
  filter?: (id: string) => boolean): Observable<any | null> => {
  const teamsByIndex = store.getState().appTeams.teamsByIndex;

  return Observable.from(teamsByIndex)
    .filter(filter || (() => true))
    .map((id) => ({ id, code: getCode(id, store) }))
    .let(executeJavaScriptOnWebView);
};


export {
  catchObservable,
  executeJavaScriptOnAllWorkspaces,
  executeJavaScriptOnWebView,
  executeJavaScriptOnWebViewObservable
};
