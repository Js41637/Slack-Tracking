/**
 * @module SharedConstants
 */ /** for typedoc */

export const SIDEBAR_WIDTH = 68;
export const SIDEBAR_ROW_HEIGHT = 72;
export const SIDEBAR_ICON_SIZE = 36;
export const SIDEBAR_ITEM_MARGIN_LEFT = 16;
export const SIDEBAR_ITEM_MARGIN_TOP = 16;
export const SIDEBAR_ITEM_MARGIN_TOP_NO_TITLE_BAR = 36;

// NB: Must match height of .client_header in webapp
export const CHANNEL_HEADER_HEIGHT = 65;

export const SLACK_PROTOCOL = 'slack:';
export const SLACK_CORP_TEAM_ID = 'T024BE7LD';

export type windowType = 'MAIN' | 'NOTIFICATIONS' | 'WEBAPP' | 'OTHER';
export const WINDOW_TYPES = {
  MAIN: 'MAIN' as windowType,
  NOTIFICATIONS: 'NOTIFICATIONS' as windowType,
  WEBAPP: 'WEBAPP' as windowType,
  OTHER: 'OTHER' as windowType
};

export type callWindowType = 'calls' | 'calls_mini_panel' | 'calls_incoming_call';
export const CALLS_WINDOW_TYPES = [
  'calls' as callWindowType,
  'calls_mini_panel' as callWindowType,
  'calls_incoming_call' as callWindowType
];

export const REPORT_ISSUE_WINDOW_TYPE = 'report-issue';

export const TEAM_UNLOADING_DISABLED = -1;

export type updateStatusType =  'none' |
                                'checking-for-update' |
                                'checking-for-update-manual' |
                                'update-available' |
                                'downloading-update' |
                                'update-downloaded' |
                                'restart-to-apply' |
                                'up-to-date' |
                                'error';

export const UPDATE_STATUS = {
  NONE: 'none' as updateStatusType,
  // NB: We differentiate these two checking for update statuses so we can only focus the main
  // window for manual updates (since auto updates should be silent)
  CHECKING_FOR_UPDATE: 'checking-for-update' as updateStatusType,
  CHECKING_FOR_UPDATE_MANUAL: 'checking-for-update-manual' as updateStatusType,
  // NB: An update is available, but not downloading
  UPDATE_AVAILABLE: 'update-available' as updateStatusType,
  DOWNLOADING_UPDATE: 'downloading-update' as updateStatusType,
  UPDATE_DOWNLOADED: 'update-downloaded' as updateStatusType,
  RESTART_TO_APPLY: 'restart-to-apply' as updateStatusType,
  UP_TO_DATE: 'up-to-date' as updateStatusType,
  ERROR: 'error' as updateStatusType
};

export type networkStatusType = 'online' | 'slackDown' | 'offline' | 'connectionTrouble';

export type ReleaseChannel = 'prod' | 'alpha' | 'beta';
export type MigrationType = 'redux' | 'macgap';

export interface UpdateInformation {
  releaseNotes: string;
  releaseName: string;
  releaseDate: Date;
}

export interface UpdaterOption {
  version: string;
  releaseChannel?: ReleaseChannel;
  ssbUpdateUrl?: string;
  credentials?: Credentials;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface Region {
  width: number;
  height: number;
  top: number;
  left: number;
  id: string;
}

export interface StringMap<T> {
  [key: string]: T;
}

export type MenuItemsMap = StringMap<Array<Electron.MenuItemOptions>> | null;
export const IS_WINDOWS_STORE = process.windowsStore;
export const IS_STORE_BUILD = process.mas || IS_WINDOWS_STORE;
export const IS_SIGNED_IN_EVAL = `!!(typeof TSSSB !== 'undefined' && TS && TS.boot_data)`;

export const DEFAULT_CLEAR_STORAGE_OPTIONS: Electron.ClearStorageDataOptions = {
  storages: [ 'appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers' ],
  quotas: [ 'temporary', 'persistent', 'syncable' ]
};

export const UUID_FILENAME = 'installation';
