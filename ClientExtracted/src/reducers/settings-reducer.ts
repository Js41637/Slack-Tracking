import {nativeInterop} from '../native-interop';
import {objectMerge} from '../utils/object-merge';
import {channel} from '../../package.json';
import {Action} from '../actions/action';

import {SETTINGS, EVENTS, MIGRATIONS} from '../actions';

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
    hasMigratedData:  {
      macgap: false,
      redux: false
    },

    // User configurable settings
    runFromTray: true,
    launchOnStartup: false,
    zoomLevel: 0,
    whitelistedUrlSchemes: ['http:', 'https:', 'mailto:', 'skype:',
      'spotify:', 'live:', 'callto:', 'tel:', 'im:', 'sip:', 'sips:'],

    // Preferences needed for the webapp
    PrefSSBFileDownloadPath: null
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
    notifyPosition: {corner: 'bottom_right', display: 'same_as_app'},
  },

  // Settings specific to Linux
  linux: {
    useHwAcceleration: true
  },

  // Settings specific to Mac
  darwin: {
  }
};
export type SettingType = Partial<typeof defaultSettings & { zoomLevel: number }>;
const initialSettings = getDefaultSettings();

export function reduce(settings: SettingType = initialSettings, action: Action): SettingType {
  switch (action.type) {
    case SETTINGS.UPDATE_SETTINGS:
      return updateSettings(settings, action.data);
    case SETTINGS.ZOOM_IN:
      return changeWindowZoom(settings, 1);
    case SETTINGS.ZOOM_OUT:
      return changeWindowZoom(settings, -1);
    case SETTINGS.RESET_ZOOM:
      return changeWindowZoom(settings, -settings.zoomLevel);
    case EVENTS.REPORT_ISSUE:
      return { ...settings, reportIssueOnStartup: false };
    case EVENTS.HANDLE_DEEP_LINK:
      return { ...settings, launchedWithLink: null };

    case MIGRATIONS.REDUX_STATE:
      return objectMerge(settings, action.data.settings);
    default:
      return settings;
  }
}

function getDefaultSettings() {
  const {base, linux, winBefore10, win10, darwin} = defaultSettings;
  const notWin10 = !nativeInterop.isWindows10OrHigher();

  switch (base.platform) {
  case 'linux':
    return {...base, ...linux};
  case 'win32':
    return {...base, ...(notWin10 ? winBefore10 : win10)};
  case 'darwin':
    return {...base, ...darwin};
  default:
    throw new Error('No platform specified');
  }
}

function updateSettings(settings: SettingType, update: SettingType) {
  return {
    ...settings,
    ...update
  };
}

function changeWindowZoom(settings: SettingType, change: number) {
  // clamp the zoom to be between [-2, 3]
  const zoomLevel = Math.min(Math.max(settings.zoomLevel + change, -2), 3);
  return {
    ...settings,
    zoomLevel
  };
}
