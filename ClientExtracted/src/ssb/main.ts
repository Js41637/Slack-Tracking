/**
 * # SSB Integration
 * This module exposes fancy APIs to the webapp, allowing Slack to use native APIs and integrate with
 * the operating system. Available in the webapp under `window.desktop`, exposed are the following:
 *
 * - `desktop.app`: [[AppIntegration]]
 * - `desktop.clipboard`: [[ClipboardIntegration]]
 * - `desktop.dock`: [[DockIntegration]]
 * - `desktop.notice`: [[NotificationIntegration]]
 * - `desktop.teams`: [[TeamIntegration]]
 * - `desktop.downloads:` [[DownloadIntegration]]
 * - `desktop.window`: [[WebappWindowManager]]
 * - `desktop.stats`: [[Stats]]
 * - `desktop.calls`: [[Calls]]
 * - `desktop.spellCheckingHelper`: [[SpellCheckingHelper]]
 * - `desktop.store`: [[Store]]
 * - `desktop.deviceStorage`: [[DeviceStorage]]
 * - `desktop.reduxHelper`: [[ReduxHelper]]
 * - `desktop.touchbar`: [[TouchBarIntegration]]
 *
 * To learn more about an individual namespace, check out the corresponding module.
 *
 * @module SSBIntegration
 * @preferred
 */ /** for typedoc */

import { TouchBarIntegration } from './touchbar';
import { webFrame, remote } from 'electron';
import { initializeEvalHandler } from 'electron-remote';
import { logger } from '../logger';
import { overrideWindowOpen } from './override-window-open';
import { overrideDropbox } from './override-dropbox';
import { setupCrashReporter } from '../setup-crash-reporter';

import { AppIntegration } from './app';
import { Calls } from './calls';
import { ClipboardIntegration } from './clipboard';
import { DeviceStorage } from './device-storage';
import { DockIntegration } from './dock';
import { DownloadIntegration } from './downloads';
import { NotificationIntegration } from './notify';
import {setupTouchscreenEvents, setupDoubleClickHandler,
  canAccessLocalStorage, disableDesktopIntegration} from './post-dom-tasks';
import { SpellCheckingHelper } from './spell-checking';
import { Stats as StatsIntegration } from './stats';
import { Store } from '../lib/store';
import { ReduxHelper } from './redux-helper';
import { TeamIntegration } from './team';
import { WebappWindowManager } from './webapp-window-manager';
import { WindowOpener } from './window-opener';

(window as any).globalLogger = logger;

setupCrashReporter(global.loadSettings);

initializeEvalHandler();

webFrame.registerURLSchemeAsSecure('slack-resources');
webFrame.registerURLSchemeAsBypassingCSP('slack-resources');
webFrame.registerURLSchemeAsPrivileged('slack-resources');

webFrame.registerURLSchemeAsSecure('slack-webapp-dev');
webFrame.registerURLSchemeAsBypassingCSP('slack-webapp-dev');
webFrame.registerURLSchemeAsPrivileged('slack-webapp-dev');

const isDarwin = process.platform === 'darwin';

let currentWindow: Electron.BrowserWindow | null = remote.getCurrentWindow();
const browserWindowId = currentWindow.id;

// NB: Wait until we're in page context before we try to set up any listeners
const postDOMSetup = () => {
  // Keep polling for these window properties until they exist
  if (!window || !window.location || !window.winssb || !window.document || !window.document.body) {
    setTimeout(postDOMSetup, 250);
    return;
  }

  if (canAccessLocalStorage()) {
    window.winssb.ls = window.localStorage;

    if (window.localStorage.getItem('SLACK_TIMER_COP_ENABLED')) {
      require('./timer-cop');
    }
  }

  window.winssb.spellCheckingHelper.setupInputEventListener();

  if (isDarwin) {
    if (currentWindow) {
      setupDoubleClickHandler(currentWindow);
    } else {
      logger.warn('postDOMSetup called without current window attached, skipping setup dblclick handler');
    }
  } else {
    setupTouchscreenEvents();
  }

  // Disable calls to WinSSB as the window itself is collapsing
  window.addEventListener('beforeunload', disableDesktopIntegration, true /*useCapture*/);

  // NB: Until we can fix electron-remote, using createProxyForRemote here
  // is unsafe
  //window.slackCore = createProxyForRemote(currentWindow).__webappShared;
  window.slackCore = {
    getLinuxDistro: () => Promise.resolve(null)
  };

  currentWindow = null;
};

setTimeout(postDOMSetup, 250);

const windowManager = new WebappWindowManager();
let callsModule = null;

try {
  callsModule = new Calls();
} catch (e) {
  console.error('Calls failed to load, bailing', e);
}

// TODO: Rename this to window.desktop outright when webapp is ready, before shipping for Mac
window.winssb = {
  app: new AppIntegration(),

  clipboard: new ClipboardIntegration(),

  dock: new DockIntegration(),

  notice: new NotificationIntegration(),

  teams: new TeamIntegration(),

  downloads: new DownloadIntegration(),

  window: windowManager,

  stats: new StatsIntegration(),

  calls: callsModule,

  // NB: For backwards compatibility with the webapp
  screenhero: callsModule,

  browserWindowId,

  spellCheckingHelper: new SpellCheckingHelper(),

  store: Store,

  deviceStorage: new DeviceStorage(),

  reduxHelper: new ReduxHelper(),

  touchbar: new TouchBarIntegration()
};

// NB: We will be moving to this more generic name for our desktop integration global.
window.desktop = window.winssb;

if (!callsModule) delete window.winssb.calls;

// NB: If this is set, we know we're running in the context of a WebView
if (process.guestInstanceId) {
  window.winssb.guestInstanceId = process.guestInstanceId;
} else {
  window.opener = new WindowOpener();
}

overrideWindowOpen((opts: () => void) => window.winssb.window.open(opts));
overrideDropbox();
