import { MiddlewareAPI } from 'redux';
import { ActionsObservable } from 'redux-observable';
import { Observable } from 'rxjs/Observable';

import { Scheduler } from 'rxjs/Scheduler';
import { Action } from '../actions/action';
import { EVENTS, SELECTED_TEAM_ACTION, appTeamsType } from '../actions/index';
import { completeAction } from '../custom-operators';
import { logger } from '../logger';
import { RootState } from '../reducers/index';
import { setTeamLoaded } from '../reducers/loaded-teams-reducer';
import { WEBVIEW_LIFECYCLE, webAppLoadedState, webViewLifeCycleType } from '../utils/shared-constants';
import { executeJavaScriptOnWebView } from './execute-javascript-on-webview';
import { serializeWebAppLoadRequestCode } from './serialize-code';
import { WebViewLifeCycleBase, WebViewLifeCycleEpic } from './web-view-life-cycle';

import '../custom-operators';
import '../rx-operators';

interface LoadTeamRequestArgs {
  id: string;
  code: string;
  loadFullApp: boolean;
  startedLifeCycle: webViewLifeCycleType;
}

/**
 * Map the original action parameters into parameters for a load team action.
 */
function mapToLoadTeamAction(originalAction: Action<any>, store: MiddlewareAPI<RootState>) {
  return SELECTED_TEAM_ACTION.includes(originalAction.type as appTeamsType) ? {
    teamId: store.getState().appTeams.selectedTeamId,
    loadFullApp: true
  } : {
    teamId: originalAction.data.teamId,
    loadFullApp: false
  };
}

/**
 * Wait til the webapp signals it's finished loading.
 */
function delayTilWebappLoaded({ teamId }: { teamId: string }, state: WebViewLifeCycleBase) {
  return state.get(teamId)
    .filter((context) => webAppLoadedState.includes(context.type));
}

/**
 * Wait til the webapp finished loading and check that the lifecycle changed.
 */
function delayTilWebappLoadedToo({ id, startedLifeCycle }: LoadTeamRequestArgs, state: WebViewLifeCycleBase) {
  return state.get(id)
    .filter((context) => webAppLoadedState.includes(context.type) && context.type !== startedLifeCycle);
}

/**
 * Execute code in the webapp context and wait for the result, or pass the
 * original args through.
 */
function executeJavaScriptIfRequestValid(args: LoadTeamRequestArgs) {
  const ret = Observable.of(args);
  return !!args.code
    ? ret.let(executeJavaScriptOnWebView)
        .filter((result) => !!result).mapTo(args)
    : ret;
}

/**
 * Assign some state in the webview when we're done executing code. Don't do
 * anything if the component was destroyed in the meantime.
 */
function loadTeamCompletedAction(args: LoadTeamRequestArgs, state: WebViewLifeCycleBase) {
  const action = Observable.of(setTeamLoaded({
    teamId: args.id,
    isFullyLoaded: args.loadFullApp
  }));

  let disposed = true;
  try {
    disposed = state.getState(args.id).type === WEBVIEW_LIFECYCLE.COMPONENT_DISPOSED;
  } catch (e) {
    logger.debug('loadTeamEpic: Load request arrived after component disposed, bailing out');
  }

  return disposed
    ? action.let(completeAction)
    : action;
}

/**
 * Based on team selection, load the full webapp or unload to min-web. The
 * `TeamView` is responsible for managing the timer that triggers the request.
 * This epic validates the request and executes the code within the webapp.
 */
const loadTeamEpic: WebViewLifeCycleEpic<Action<any>, RootState, WebViewLifeCycleBase, Scheduler> = (
  actionObservable: ActionsObservable<Action<any>>,
  store: MiddlewareAPI<RootState>,
  state: WebViewLifeCycleBase,
  scheduler?: Scheduler
) =>
  // We're forced to add an additional delay(1) because of an Electron webview
  // bug. See https://github.com/electron/electron/issues/8505.
  actionObservable.ofType(EVENTS.UNLOAD_TEAM, ...SELECTED_TEAM_ACTION)
    .filter((action) => action.type === EVENTS.UNLOAD_TEAM || !!action.data.updated)
    .map((action) => mapToLoadTeamAction(action, store))
    .delayWhen((action) => delayTilWebappLoaded(action, state))
    .delay(1, scheduler)
    .map((request) => ({
      ...serializeWebAppLoadRequestCode(request, state),
      startedLifeCycle: state.getState(request.teamId).type
    }))
    .mergeMap((args) => executeJavaScriptIfRequestValid(args))
    .distinctUntilChanged()
    .delayWhen((args) => delayTilWebappLoadedToo(args, state))
    .mergeMap((args) => loadTeamCompletedAction(args, state));

export {
  loadTeamEpic
};
