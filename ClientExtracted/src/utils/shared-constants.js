export const SIDEBAR_WIDTH = 65;
export const SIDEBAR_WIDTH_NO_TITLE_BAR = 68;

// NB: Must match height of .client_header in webapp
export const CHANNEL_HEADER_HEIGHT = 65;

export const WINDOW_TYPES = {
  MAIN: 'MAIN',
  NOTIFICATIONS: 'NOTIFICATIONS',
  WEBAPP: 'WEBAPP'
};

export const CALLS_WINDOW_TYPES = [
  'calls',
  'calls_mini_panel',
  'calls_incoming_call'
];

export const TEAM_IDLE_TIMEOUT = 'TEAM_IDLE_TIMEOUT';
export const DEFAULT_TEAM_IDLE_TIMEOUT = 5 * 60;

export const UPDATE_STATUS = {
  NONE: 'none',
  // NB: We differentiate these two checking for update statuses so we can only focus the main
  // window for manual updates (since auto updates should be silent)
  CHECKING_FOR_UPDATE: 'checking-for-update',
  CHECKING_FOR_UPDATE_MANUAL: 'checking-for-update-manual',
  // NB: An update is available, but not downloading
  UPDATE_AVAILABLE: 'update-available',
  DOWNLOADING_UPDATE: 'downloading-update',
  UPDATE_DOWNLOADED: 'update-downloaded',
  RESTART_TO_APPLY: 'restart-to-apply',
  UP_TO_DATE: 'up-to-date',
  ERROR: 'error'
};
