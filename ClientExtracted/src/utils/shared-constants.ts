export const SIDEBAR_WIDTH = 65;
export const SIDEBAR_WIDTH_NO_TITLE_BAR = 68;

// NB: Must match height of .client_header in webapp
export const CHANNEL_HEADER_HEIGHT = 65;

export const SLACK_CORP_TEAM_ID = 'T024BE7LD';

export const TEAM_SIGNOUT_TIMEOUT = 60000;

export type windowType = 'MAIN' | 'NOTIFICATIONS' | 'WEBAPP' | 'OTHER';
export const WINDOW_TYPES = {
  MAIN: 'MAIN' as windowType,
  NOTIFICATIONS: 'NOTIFICATIONS' as windowType,
  WEBAPP: 'WEBAPP' as windowType,
  DEFAULT: 'OTHER' as windowType
};

export type callWindowType = 'calls' | 'calls_mini_panel' | 'calls_incoming_call';
export const CALLS_WINDOW_TYPES = [
  'calls' as callWindowType,
  'calls_mini_panel' as callWindowType,
  'calls_incoming_call' as callWindowType
];

export const REPORT_ISSUE_WINDOW_TYPE = 'report-issue';

export const TEAM_UNLOADING_DISABLED = -1;
export const DEFAULT_TEAM_IDLE_TIMEOUT = 4 * 60 * 60;

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
