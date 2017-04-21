/* INTERACTIVE REPLIES
 * -------------------------------------------------------------------
 * Welcome to the deep end of the pool: The dive area for those who'd
 * like to know how we're able to notifiy the running application of
 * an interactive reply in a notification. We have two distinct methods:
 * One for a "normal" win32 execution environment (DDL) and one for the
 * Windows Store execution environment.
 *
 * TEST PILOT NOTES
 * -------------------------------------------------------------------
 * We support responding to a notification from the Action Center, even
 * if Slack is closed. That behavior is still a bit wonky, so to enable
 * it, the following global environment variable must be set:
 *
 * SLACK_INTERACTIVE_REPLIES
 * SLACK_INTERACTIVE_REPLIES_ON_LAUNCH
 *
 * WINDOWS STORE
 * -------------------------------------------------------------------
 * 1) This module calls BackgroundTaskRegisterer.exe, which calls
 *    BackgroundExecutionManager on an isolated thread to register our
 *    background task, if it is not already registered. The task will
 *    trigger on ToastNotificationActionTrigger.
 *
 * 2) This module sends a toast notification via NodeRT
 *
 * 3) Should the user respond, the Windows issues a package-wide
 *    ToastNotificationAction, checks for registered tasks, and launches
 *    the (invisible) BackgroundTask.
 *
 * 4) The background task is able to receive the full event arguments
 *    (including user input, which what we're after), packages everything
 *    together into a URL*, and sends the URL to Windows (launchUri)
 *
 * NON-WINDOWS STORE
 * -------------------------------------------------------------------
 * 0) Squirrel set a shortcut in the start menu with a Toast System
 *    .AppUserModel.ToastActivatorCLSID property set.
 *
 * 1) This module calls 'electron-windows-interactive-notifications', which
 *    has a native `registerActivator` method. The method uses the same CLSID
 *    to register a COM component with Windows.
 *
 * 2) This module sends a toast notification via NodeRT
 *
 * 3) Should the user respond, the Windows issues a package-wide
 *    ToastNotificationAction, checks for registered tasks, and launches
 *    the (invisible) COM component.
 *
 * 4) The COM component is able to receive the full event arguments
 *    (including user input, which what we're after), packages everything
 *    together into a URL*, and sends the URL to Windows (launchUri)
 *
 * ALL ENVIRONMENTS
 * -------------------------------------------------------------------
 * 5) Windows looks for an app that handles `slack://` and eventually
 *    launches our application.
 *
 * 6) The app is likely already running, so it calls `makeSingleInstance`
 *    and bails out.
 *
 * 7) The already running instance receives the event (and the protocol url)
 *    and actually responds. Hooray!
 *
 * * slack://reply/?channel=D221YR34P&userId=U211G89NY&teamId=TW2104UHEX
 *   &userData=[{"key":"message","value":"The response!"}]
 *
 * @module Notifications
 * @preferred
 */ /** for typedoc */

import { ToastNotification } from 'electron-windows-notifications';
import { getAppId } from '../../utils/app-id';
import { IS_WINDOWS_STORE } from '../../utils/shared-constants';
import { logger } from '../../logger';
import { NodeRTNotificationHelpers as Helpers } from './node-rt-notification-helpers';
import { settingActions } from '../../actions/setting-actions';
import { settingStore } from '../../stores/setting-store';
import { teamStore } from '../../stores/team-store';

const appId = getAppId();

const standardTemplate = (header, ...elements) => `
  <toast activationType="%s" launch="%s">${header}
    <visual>
      <binding template="ToastGeneric">
        <text hint-wrap="false" hint-maxLines="1">%s</text>
        <text hint-maxLines="10" hint-style="bodySubtle" hint-wrap="true">%s</text>
        ${elements.join('')}
      </binding>
    </visual>
    <audio silent="true" />
  </toast>`.replace(/\>\s+\</g, '><');

const interactiveTemplate = (header, ...elements) => `
  <toast activationType="%s" launch="%s">${header}
    <visual>
      <binding template="ToastGeneric">
        <text hint-wrap="false" hint-maxLines="1">%s</text>
        <text hint-maxLines="10" hint-style="bodySubtle" hint-wrap="true">%s</text>
        ${elements.join('')}
      </binding>
    </visual>
    <audio silent="true" />
    <actions>
      <input id="message" type="text" placeHolderContent="Type a reply" />
      <action hint-inputId="message" activationType="background" content="Reply" arguments="%s" />
    </actions>
  </toast>`.replace(/\>\s+\</g, '><');

/**
 * Creates a template for a WinRT Toast Notification.
 *
 * @param {any} args
 * @returns {WindowsNotificationTemplate} template
 *
 * @typedef WindowsNotificationTemplate
 * @property {Array} strings
 * @property {string} type
 * @property {string} template
 * @property {string} mainImageElement
 */
function createTemplate(args) {
  const mainImageElement = args.imageUri ? `<image placement="hero" src="${args.imageUri}" />`: '';
  const activationType = (IS_WINDOWS_STORE || !args.launchUri) ? 'foreground' : 'protocol';
  const launchUri = args.launchUri ? args.launchUri : 'lol.no.op';
  const strings = [activationType, launchUri, args.title, args.body];
  const activated = Helpers.activatorRegistered && Helpers.activatorRegistered !== 'failed';
  const { build } = (settingStore.getSetting('platformVersion') || { build: 0 });
  let header = '';

  // If we're sending a notification from a team, we'll group them under
  // one team header
  if (args.teamId && build > 15000) {
    const headerLaunchUri = `slack://channel?team=${args.teamId}`;
    const { team_name } = teamStore.getTeam(args.teamId);
    header = `<header id="%s" title="%s" activationType="%s" arguments="%s"></header>`;

    strings.splice(2, 0, args.teamId, team_name, activationType, headerLaunchUri);
  }

  let avatarImageElement = '';

  // Add avatar image, if it exists
  if (args.avatarImage) {
    avatarImageElement = `<image placement="appLogoOverride" hint-crop="circle" src="${args.avatarImage}" />`;
  }

  // We have more space available than webapp ever imagined, so let's
  // be creative with it.
  //
  // [helixcorp] from Hello
  // Result: ["[helixcorp] from Hello", helixcorp", "hello"]
  // [tinyspeck] in #desktop-dev-only
  // Result: ["[tinyspeck] in #desktop-dev-only", tinyspeck", "#desktop-dev-only"]
  const channelAndIdentifier = /\[([\s\S]*)\] (?:from|in) ([\s\S]*$)/.exec(args.title);
  if (channelAndIdentifier && channelAndIdentifier.length === 3 && header) {
    strings[6] = channelAndIdentifier[2];
  }

  if (args.channel && (args.userId || args.teamId) && args.msg && args.interactive && activated) {
    let queryString = 'reply';
    queryString += `?channel=${encodeURIComponent(args.channel)}`;
    queryString += `&userId=${encodeURIComponent(args.userId)}`;
    queryString += `&teamId=${encodeURIComponent(args.teamId)}`;
    queryString += `&msg=${encodeURIComponent(args.msg)}`;
    if (args.thread_ts) queryString += `&threadTs=${encodeURIComponent(args.thread_ts)}`;

    logger.info(`Constructed interactive notification query string: ${queryString}`);

    strings.push(queryString);

    return {strings, type: 'interactive', template: interactiveTemplate(header, avatarImageElement, mainImageElement)};
  } else {
    return {strings, type: 'standard', template: standardTemplate(header, avatarImageElement, mainImageElement)};
  }
}

/**
 * Shows a WinRT toast notification.
 *
 * @param {any} options
 * @returns {Promise<any>}
 */
export default async function showNotification(options) {
  // Corresponds to TS.boot_data.feature_interactive_win_notifs;
  // If we're interactive, we will also clear notifications on
  // application exit.
  if (options.interactive || process.env.SLACK_INTERACTIVE_REPLIES) {
    options.interactive = true;
    logger.info('Notification is marked as "interactive", ensuring that activator is registered.');

    await Helpers.registerActivator();
    settingActions.updateSettings({clearNotificationsOnExit: true});
  }

  const group = options.channel;
  const { template, strings, type } = createTemplate(options);

  const toast = new ToastNotification({template, strings, appId, group});
  const result = new Promise((resolve, reject) => {
    if (type === 'standard') {
      toast.on('activated', (sender, args) => {
        logger.info('NodeRT Toast Notification has been activated (click or otherwise)', args);
        logger.debug('Details for activated NodeRT Toast Notification', template, strings);
        resolve(args);
      });

      toast.on('dismissed', () => {
        logger.info('NodeRT Toast Notification has been dismissed (click or otherwise)');
        resolve(false);
      });
    }

    toast.on('failed', (...details) => {
      logger.info(`Showing ${type} NodeRT Toast Notification failed.`, details);
      logger.info('Further details can possibly be found in the Windows event log.');
      logger.debug('Details for failed NodeRT Toast Notification', template, strings);
      reject();
    });
  });

  logger.info(`Showing new NodeRT ${type} toast notification.`);
  logger.debug('Details: ', {template, strings, appId, group});

  toast.show();
  return result;
}
