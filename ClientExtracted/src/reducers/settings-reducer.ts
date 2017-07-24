/**
 * @module Reducers
 */ /** for typedoc */

import { omit } from 'lodash';
import * as url from 'url';
import { channel } from '../../package.json';
import { Action } from '../actions/action';
import { nativeInterop } from '../native-interop';
import { ReleaseChannel } from '../utils/shared-constants';

import { EVENTS, MIGRATIONS, SETTINGS } from '../actions';

export interface SettingsState {
  appVersion: string;
  versionName: string | null;
  platform: string;
  platformVersion: {
    major: string | null;
    minor: string | null;
    build: string | null;
  };
  isWin10: boolean;
  isBeforeWin10: boolean;
  resourcePath: string | null;
  webappSrcPath: string | null;
  webappParams: Object | null;
  isDevMode: boolean;
  devEnv: string | null;
  launchedWithLink: string | null;
  logFile: string | null;
  openDevToolsOnStart: boolean;
  pretendNotReallyWindows10: boolean;
  releaseChannel: ReleaseChannel;
  autoHideMenuBar: boolean;
  isTitleBarHidden: boolean;
  hasRunApp: boolean;
  hasRunFromTray: boolean;
  reportIssueOnStartup: boolean;
  runFromTray: boolean;
  launchOnStartup: boolean;
  spellcheckerLanguage: string | null;
  zoomLevel: number;
  whitelistedUrlSchemes: Array<string>;
  PrefSSBFileDownloadPath: string | null;

  isAeroGlassEnabled?: boolean;
  windowFlashBehavior?: string;
  hasExplainedWindowFlash?: boolean;
  clearNotificationsOnExit?: boolean;
  useHwAcceleration?: boolean;
  notificationMethod?: 'html' | 'winrt' | 'window' | null;
  os?: boolean;
  release?: boolean;
  desktopEnvironment?: boolean;
}

// The default settings differ between OS's so we specify it here and return
// the actual default settings in a getDefaultSettings() method
export const defaultSettings = {
  base: {
    // Version / platform information
    appVersion: '0.0.0',
    versionName: null,
    platform: process.platform,
    platformVersion: {
      major: null,
      minor: null,
      build: null
    },
    isWin10: false,
    isBeforeWin10: false,

    // Command line / protocol URL settings
    resourcePath: null,
    webappSrcPath: null,
    webappParams: null,
    isDevMode: false,
    devEnv: null,
    launchedWithLink: null,
    logFile: null,
    openDevToolsOnStart: false,
    pretendNotReallyWindows10: false,

    // Release configurations
    releaseChannel: channel || 'prod',

    // Non-user configurable settings
    autoHideMenuBar: false,
    isTitleBarHidden: false,
    hasRunApp: false,
    hasRunFromTray: false,
    reportIssueOnStartup: false,

    // User configurable settings
    runFromTray: true,
    launchOnStartup: false,
    spellcheckerLanguage: null,
    zoomLevel: 0,
    whitelistedUrlSchemes: ['http:', 'https:', 'mailto:', 'skype:',
      'spotify:', 'live:', 'callto:', 'tel:', 'im:', 'sip:', 'sips:'],

    // Preferences needed for the webapp
    PrefSSBFileDownloadPath: null,

    // Notifications
    notificationMethod: null,
  },

  // Settings specific to Windows 10
  win10: {
    isWin10: true,
    isAeroGlassEnabled: true,
    windowFlashBehavior: 'idle',
    hasExplainedWindowFlash: false,
    clearNotificationsOnExit: false
  },

  // Settings specific to Windows 7 / 8
  winBefore10: {
    isBeforeWin10: true,
    useHwAcceleration: true,
    isAeroGlassEnabled: true,
    windowFlashBehavior: 'idle',
    hasExplainedWindowFlash: false,
  },

  // Settings specific to Linux
  linux: {
    useHwAcceleration: true,
    os: false,
    release: false,
    desktopEnvironment: false,
  },

  // Settings specific to Mac
  darwin: {
  }
};

const initialSettings = getDefaultSettings();

/**
 * @hidden
 */
export function reduce(settings: SettingsState = initialSettings, action: Action<any>): SettingsState {
  switch (action.type) {
    case SETTINGS.UPDATE_SETTINGS:
      return updateSettings(settings, action.data);
    case SETTINGS.ZOOM_IN:
      return changeWindowZoom(settings, 1);
    case SETTINGS.ZOOM_OUT:
      return changeWindowZoom(settings, -1);
    case SETTINGS.RESET_ZOOM:
      return changeWindowZoom(settings, -(settings.zoomLevel || 0));
    case EVENTS.REPORT_ISSUE:
      return { ...settings, reportIssueOnStartup: false };
    case EVENTS.HANDLE_DEEP_LINK:
      return { ...settings, launchedWithLink: null };
    case EVENTS.HANDLE_REPLY_LINK:
      return { ...settings, launchedWithLink: null };
    case EVENTS.HANDLE_SETTINGS_LINK:
      return handleSettingsLink(settings, action.data.url);

    case MIGRATIONS.REDUX_STATE:
      return updateSettings(settings, action.data.settings);
    case MIGRATIONS.COMPLETED:
      // NB: We used to track migrations in settings.
      return omit<SettingsState, SettingsState>(settings, 'hasMigratedData');
    default:
      return settings;
  }
}

function getDefaultSettings(): SettingsState {
  const { base, linux, winBefore10, win10, darwin } = defaultSettings;
  const notWin10 = !nativeInterop.isWindows10OrHigher();

  switch (base.platform) {
  case 'linux':
    return { ...base, ...linux };
  case 'win32':
    return { ...base, ...(notWin10 ? winBefore10 : win10) };
  case 'darwin':
    return { ...base, ...darwin };
  default:
    throw new Error('No platform specified');
  }
}

function updateSettings(settings: SettingsState, update: Partial<SettingsState>) {
  return {
    ...settings,
    ...update
  };
}

/**
 * Takes the link from the action, parses the contained JSON, and
 * adjusts the settings accordingly
 *
 * @param {SettingsState} settings
 * @param {string} link
 */
function handleSettingsLink(settings: SettingsState, link: string) {
  const parsedUrl = (typeof link === 'string') ? url.parse(link, true) : null;
  const raw = parsedUrl && parsedUrl.query ? parsedUrl.query.update : '{}';

  try {
    const update = JSON.parse(raw);
    return { ...settings, ...update, launchedWithLink: null };
  } catch (error) {
    return { ...settings, launchedWithLink: null };
  }
}

function changeWindowZoom(settings: SettingsState, change: number) {
  // clamp the zoom to be between [-3, 3]
  const zoomLevel = Math.min(Math.max((settings.zoomLevel || 0) + change, -3), 3);
  return {
    ...settings,
    zoomLevel
  };
}
