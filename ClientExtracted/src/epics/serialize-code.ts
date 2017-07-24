import { logger } from '../logger';
import { IS_SIGNED_IN_EVAL, WEBVIEW_LIFECYCLE, webAppLoadedState } from '../utils/shared-constants';
import { WebViewLifeCycleBase } from './web-view-life-cycle';

/**
 * Check targeted webapp's application state, generates corresponding load request code for given flag.
 * Will return full team load code if loadFullApp requested, unload team to minweb otherwise.
 * If current state is identical to requested state, will return empty code instead.
 *
 * @param {Object} loadRequest webapp load request.
 */
const serializeWebAppLoadRequestCode = (loadRequest: { teamId: string, loadFullApp: boolean }, state: WebViewLifeCycleBase) => {
  const { teamId, loadFullApp } = loadRequest;
  const emptyCode = { id: teamId, loadFullApp, code: '' };
  const requestedLifeCycleState = loadFullApp
    ? WEBVIEW_LIFECYCLE.WEBAPP_LOADED
    : WEBVIEW_LIFECYCLE.MINWEB_LOADED;

  const currentLifeCycle = state.getState(loadRequest.teamId).type;

  if (!webAppLoadedState.includes(currentLifeCycle)) {
    logger.debug(`Skipping load request for webapp '${teamId}', state is '${currentLifeCycle}'`);
    return emptyCode;
  }

  if (requestedLifeCycleState === currentLifeCycle) {
    logger.debug(`Requested to ${loadFullApp ? '' : 'un'}load webapp but already at '${currentLifeCycle}', skipping`);
    return emptyCode;
  }

  const code = loadFullApp
    ? `!!window.MW && MW.loadTeam()`
    : `${IS_SIGNED_IN_EVAL} && TSSSB.unloadTeam()`;

  return { ...emptyCode, code };
};

/**
 * Check targeted webapp's application state, generates corresponding ping request code.
 * If current state is not ready to execute javascript into webapp, will return empty code.
 */
const serializeTickleCode = (teamId: string, state: WebViewLifeCycleBase) => {
  const emptyCode = { id: teamId, code: '' };
  const currentLifeCycle = state.getState(teamId).type;

  if (!webAppLoadedState.includes(currentLifeCycle)) {
    logger.debug(`Skipping tickle MS for webapp '${teamId}', state is '${currentLifeCycle}'`);
    return emptyCode;
  }

  const interopGlobal = currentLifeCycle === WEBVIEW_LIFECYCLE.WEBAPP_LOADED ? `TSSSB` : `MW`;
  const code = `${interopGlobal}.maybeTickleMS()`;

  return { ...emptyCode, code };
};

interface NotificationClickArgs {
  teamId: string;
  channel: string;
  messageId: string;
  threadTimestamp: string;
}

interface NotificationReplyArgs extends NotificationClickArgs {
  response: string;
}

const serializeNotificationClickCode = (args: NotificationClickArgs, state: WebViewLifeCycleBase) => {
  const emptyCode = { id: args.teamId, code: '' };
  const currentLifeCycle = state.getState(args.teamId).type;
  let notificationMethod: string | null = null;

  if (currentLifeCycle === WEBVIEW_LIFECYCLE.MINWEB_LOADED) {
    notificationMethod = `MW.setClientPathForNotificationClick`;
  } else if (currentLifeCycle === WEBVIEW_LIFECYCLE.WEBAPP_LOADED) {
    notificationMethod = `TSSSB.focusTabAndSwitchToChannel`;
  }

  if (!notificationMethod) {
    logger.info(`Webapp's state is ${currentLifeCycle}, cannot execute notification click`);
    return emptyCode;
  }

  const threadTimestamp = !!args.threadTimestamp ? `'${args.threadTimestamp}'` : undefined;
  const param = `('${args.channel}', '${args.messageId}', ${threadTimestamp})`;

  return {
    ...emptyCode,
    code: `${notificationMethod}${param}`
  };
};

/**
 * Check targeted webapp's application state, generates corresponding notification reply code.
 * If current state is not ready to execute javascript into webapp, will return empty code.
 */

const serializeNotificationReplyCode = (args: NotificationReplyArgs, state: WebViewLifeCycleBase) => {
  const emptyCode = { id: args.teamId, code: '' };
  const currentLifeCycle = state.getState(args.teamId).type;
  let replyGlobalObject: string | null = null;

  if (currentLifeCycle === WEBVIEW_LIFECYCLE.MINWEB_LOADED) {
    replyGlobalObject = `MW`;
  } else if (currentLifeCycle === WEBVIEW_LIFECYCLE.WEBAPP_LOADED) {
    replyGlobalObject = `TSSSB`;
  }

  if (!replyGlobalObject) {
    logger.info(`serializeNotificationReplyCode: webapp's state is ${currentLifeCycle}, cannot execute notification click`);
    return emptyCode;
  }

  const threadTimestamp = !!args.threadTimestamp ? `'${args.threadTimestamp}'` : undefined;
  const param = `('${args.channel}', '${args.response}', '${args.messageId}', ${threadTimestamp})`;

  return {
    ...emptyCode,
    code: `${replyGlobalObject}.sendMsgFromUser${param}`
  };
};

export {
  serializeWebAppLoadRequestCode,
  serializeTickleCode,
  serializeNotificationClickCode,
  serializeNotificationReplyCode,
  NotificationClickArgs,
  NotificationReplyArgs
};
