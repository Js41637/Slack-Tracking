import {cloneDeep} from 'lodash';
import nativeInterop from '../native-interop';
import handlePersistenceForKey from './helpers';

import {SETTINGS, APP, EVENTS} from '../actions';

// The default settings differ between OS's so we specify it here and return
// the actual default settings in a getDefaultSettings() method
const defaultSettings = {
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
    logFile: null,
    openDevToolsOnStart: false,
    pretendNotReallyWindows10: false,

    // Release configurations
    releaseChannel: 'prod',
    isMacAppStore: !!process.mas,
    isWindowsStore: !!process.windowsStore,

    // Non-user configurable settings
    autoHideMenuBar: false,
    isTitleBarHidden: false,
    hasRunApp: false,
    hasRunFromTray: false,
    reportIssueOnStartup: false,
    hasMigratedData:  {
      browser: false,
      renderer: false,
      macgap: false
    },
    hasCleanedLogFilesForSpellcheckBug: false,

    // User configurable settings
    runFromTray: true,
    launchOnStartup: false,
    zoomLevel: 0,

    // Preferences needed for the webapp
    PrefSSBFileDownloadPath: null
  },

  // Settings specific to Windows 10
  win10: {
    isWin10: true,
    windowFlashBehavior: 'idle',
    hasExplainedWindowFlash: false
  },

  // Settings specific to Windows 7 / 8
  winBefore10: {
    isBeforeWin10: true,
    useHwAcceleration: true,
    windowFlashBehavior: 'idle',
    hasExplainedWindowFlash: false,
    notifyPosition: {corner: 'bottom_right', display: 'same_as_app'},
  },

  // Settings specific to Linux
  linux: {
    useHwAcceleration: true
  }
};

let initialSettings = getDefaultSettings();

export default function reduce(settings = initialSettings, action) {
  switch(action.type) {
  case SETTINGS.INITIALIZE_SETTINGS:
    return initializeSettings(settings, action.data);
  case SETTINGS.UPDATE_SETTINGS:
    return updateSettings(settings, action.data);
  case SETTINGS.ZOOM_IN:
    return changeWindowZoom(settings, 1);
  case SETTINGS.ZOOM_OUT:
    return changeWindowZoom(settings, -1);
  case SETTINGS.RESET_ZOOM:
    return changeWindowZoom(settings, -settings.zoomLevel);
  case EVENTS.REPORT_ISSUE:
    return Object.assign({}, settings, {reportIssueOnStartup: false});
  case APP.RESET_STORE:
    return Object.assign({}, initialSettings, {releaseChannel: 'prod'});
  default:
    return handlePersistenceForKey(settings, action, 'settings');
  }
}

function getDefaultSettings() {
  let {base, linux, winBefore10, win10} = defaultSettings;
  let notWin10 = !nativeInterop.isWindows10OrHigher();

  switch(base.platform) {
  case 'linux':
    return Object.assign({}, base, linux);
  case 'win32':
    return Object.assign({}, base, notWin10 ? winBefore10 : win10);
  default:
    return base;
  }
}

/**
 * The only difference between an initialize and an update is that we save
 * off the initial settings in case we reset the store later.
 */
function initializeSettings(settings, update) {
  let ret = updateSettings(settings, update);
  initialSettings = cloneDeep(ret);
  return ret;
}

function updateSettings(settings, update) {
  return {
    ...settings,
    ...update
  };
}

function changeWindowZoom(settings, change) {
  // clamp the zoom to be between [-2, 2]
  let zoomLevel = Math.min(Math.max(settings.zoomLevel + change, -2), 2);
  return {
    ...settings,
    zoomLevel
  };
}
