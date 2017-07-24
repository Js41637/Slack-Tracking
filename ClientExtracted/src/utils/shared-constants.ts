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

/**
 * Some logic should only be applied to the /messages page of the webapp
 * (e.g., the empty page check), as auth pages can throw this off.
 */
export const WEBAPP_MESSAGES_URL = /^https:\/\/(\S*\.){1,2}slack\.com\/messages/i;

export interface WindowMetadata {
  id: number;
  type: windowType;
  subType?: string;
  teamId?: string;
}

export type windowType = 'MAIN' | 'NOTIFICATIONS' | 'WEBAPP' | 'OTHER';
export const WINDOW_TYPES = {
  MAIN: 'MAIN' as windowType,
  NOTIFICATIONS: 'NOTIFICATIONS' as windowType,
  WEBAPP: 'WEBAPP' as windowType,
  OTHER: 'OTHER' as windowType
};

export type callWindowType = 'calls' | 'calls_mini_panel' | 'calls_incoming_call';
export const CALLS_WINDOW_TYPES = ['calls', 'calls_mini_panel', 'calls_incoming_call'];

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

export interface LastError {
  errorCode: number;
  errorDescription: string;
}

export interface UpdateInformation {
  releaseNotes: string;
  releaseName: string;
  releaseDate: Date;
}

export interface UpdaterOption {
  version: string;
  releaseChannel?: ReleaseChannel;
  ssbUpdateUrl?: string;
  credentials?: Credentials | null;
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

export type MenuItemsMap = StringMap<Array<Electron.MenuItemConstructorOptions>> | null;

export const IS_WINDOWS_STORE = process.windowsStore;
export const IS_STORE_BUILD = process.mas || IS_WINDOWS_STORE;
export const IS_SIGNED_IN_EVAL = `!!(typeof TSSSB !== 'undefined' && window.TS && TS.boot_data)`;

export const DEFAULT_CLEAR_STORAGE_OPTIONS: Partial<Electron.ClearStorageDataOptions> = {
  storages: [ 'appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers' ],
  quotas: [ 'temporary', 'persistent', 'syncable' ],
};

export const UUID_FILENAME = 'installation';

export type webViewLifeCycleType =
  'unloaded' |
  'page-loaded' |
  'page-fail-load' |
  'webapp-loaded' |
  'minweb-loaded' |
  'signin-loaded' |
  'page-closed' |
  'component-disposed';

export const WEBVIEW_LIFECYCLE = {
  UNLOADED: 'unloaded' as webViewLifeCycleType,                     // Webview created but not yet loaded
  PAGE_LOADED: 'page-loaded' as webViewLifeCycleType,               // Webview fired `dom-ready`
  PAGE_FAIL_LOAD: 'page-fail-load' as webViewLifeCycleType,         // Webview fired 'did-fail-load'
  WEBAPP_LOADED: 'webapp-loaded' as webViewLifeCycleType,           // Webview finished loading slack.com/messages
  MINWEB_LOADED: 'minweb-loaded' as webViewLifeCycleType,           // Webview finished loading slack.com/min
  SIGNIN_LOADED: 'signin-loaded' as webViewLifeCycleType,           // Webview finished loading slack.com/signin
  PAGE_REDIRECT: 'page-redirect' as webViewLifeCycleType,           // Webview fired 'did-get-redirect-request'
  PAGE_CLOSED: 'page-closed' as webViewLifeCycleType,               // Webview fired 'close'
  COMPONENT_DISPOSED: 'component-disposed' as webViewLifeCycleType  // Webview unmounted & disposed
};

export const TRACE_RECORD_CHANNEL = 'trace-record';

/**
 * Set of all loaded events that indicate the embedded page is ready.
 */
export const webAppLoadedState: Readonly<Array<webViewLifeCycleType>> = [
  WEBVIEW_LIFECYCLE.MINWEB_LOADED,
  WEBVIEW_LIFECYCLE.WEBAPP_LOADED,
  WEBVIEW_LIFECYCLE.SIGNIN_LOADED
];

/**
 * Argument to be delivered from webapp IPC to TraceRecorder when start recording.
 * To strictier type branching, use union type instead of interface.
 *
 * Note: `TraceRecordOptions` stands for parameter provided via desktop.stats.startTraceRecord,
 * this argument actual augumented value to be delivered into main process using it
 */
export type startTraceArgumentType = Readonly<TraceRecordOptions> & { type: 'start', pid: number };

/**
 * Argument to be delivered from webapp IPC to TraceRecorder when stop recording.
 */
export interface StopTraceArgument {
  type: 'stop';
  pid: number;
}

/**
 * Configuration options to start trace recording via desktop.stats.startTraceRecord().
 */
export interface TraceRecordOptions {
  /**
   * Short description for trace record. This will be prefixed into trace file name.
   */
  identifier: string;

  /**
   * Endpoint to upload generated traces. Client will try to upload via HTTP PUT requests.
   */
  endpoint: string;

  /**
   * Authentication token to upload trace results to endpoint.
   * Auth configuration may vary per endpoint, token should be included if endpoint requires auth.
   *
   * When trigger request, this'll be flattened into HTTP header as same as metadata.
   */
  token?: string;

  /**
   * Custom category filter to override default category.
   * refer about://tracing for available traces, and defaultTraceCategories(desktop.stats.defaultTraceCategories) for default values.
   * If not specified, will run devtools timeline profiling by default.
   */
  categoryFilter?: Array<string>;

  /**
   * Flag to specify traces for all process running (multiple teams, or Electron's browser view)
   * or would like to have profiling data of process who called `startTraceRecord`.
   *
   * By default chrome runs traces against all processes, so specifying this will filter out when processing results.
   * Default to false to report only specific processes.
   */
  captureAllProcess?: boolean;

  /**
   * Additional metadata will be attached as HTTP header when upload profiling results.
   */
  metadata?: StringMap<string>;
}

/**
 * Response delivered from TraceRecorder to webapp IPC, caller of desktop.stats.startTraceRecord.
 *
 */
export interface TraceResponse {
  /**
   * Pass through process id of caller, let webapp's ipc listen interested event only via same channel
   * In case multiple processes trigger requests.
   */
  readonly pid: number;

  /**
   * Error message if start trace failed for some reason. If not exists, starting trace considered as success.
   */
  readonly error?: string;
}

export type traceUploadStatus = 'UPLOAD_SUCCEEDED' | 'UPLOAD_FAILED';

/**
 * Response delivered from TraceRecorder to webapp IPC, caller of desktop.stats.stopTraceRecord.
 */
export interface StopTraceResponse extends TraceResponse {
  /**
   * Results of trace record upload request.
   *
   */
  readonly status?: traceUploadStatus;
  /**
   * Optional field to provide local path to trace file if upload fails for some reason
   */
  readonly filePath?: string;
}

/**
 * The keys to persist to local files.
 */
export const persistWhitelist = [
  'appTeams',
  'dialog',
  'downloads',
  'migrations',
  'settings',
  'teams',
  'tokens',
  'unreads',
  'windowFrame'
];

/**
 * Predefined set of chrome tracing event category set enabled devtools timeline profiling with JS stack trace support.
 */
export const defaultTraceCategories: Readonly<Array<string>> = [
  '-*', 'devtools.timeline', 'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame', 'toplevel', 'blink.console',
  'disabled-by-default-devtools.timeline.stack',
  'disabled-by-default-v8.cpu_profile', 'disabled-by-default-v8.cpu_profiler',
  'disabled-by-default-v8.cpu_profiler.hires'
];

//desktop client can't mutate values by TS Compiler, but webapp can mutate it
//introduce naive approach to prevent accidental mutation of default categories while try to override it
Object.freeze(defaultTraceCategories);

//predefined constant values to be used ping message server in team view.
export const MAX_TIME_BEFORE_IDLE = 10 * 60 * 1000;
export const IDLE_POLLING_TIME = 1 * 60 * 1000;

export type electronWindowDisposition = 'default' | 'foreground-tab' | 'background-tab' | 'new-window' | 'save-to-disk' | 'other';


//Predefined keys to lookup API tokens from keytar
export const keychainServiceName = 'Slack';
export const keychainAccountName = 'tokens';
