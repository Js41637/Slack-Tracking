import {webFrame, remote} from 'electron';
import {initializeEvalHandler, createProxyForRemote} from 'electron-remote';
import logger from '../logger';
import overrideWindowOpen from './override-window-open';
import setupCrashReporter from '../setup-crash-reporter';

import AppIntegration from './app';
import Calls from './calls';
import ClipboardIntegration from './clipboard';
import DeviceStorage from './device-storage';
import DockIntegration from './dock';
import DownloadIntegration from './downloads';
import NotificationIntegration from './notify';
import {setupTouchscreenEvents, setupDoubleClickHandler, setupLocalStorageAlias, disableDesktopIntegration} from './post-dom-tasks';
import SpellCheckingHelper from './spell-checking';
import StatsIntegration from './stats';
import Store from '../lib/store';
import ReduxHelper from './redux-helper';
import TeamIntegration from './team';
import WebappWindowManager from './webapp-window-manager';
import WindowOpener from './window-opener';

window.globalLogger = logger;

setupCrashReporter(global.loadSettings);

initializeEvalHandler();

webFrame.registerURLSchemeAsSecure('slack-resources');
webFrame.registerURLSchemeAsBypassingCSP('slack-resources');
webFrame.registerURLSchemeAsPrivileged('slack-resources');

webFrame.registerURLSchemeAsSecure('slack-webapp-dev');
webFrame.registerURLSchemeAsBypassingCSP('slack-webapp-dev');
webFrame.registerURLSchemeAsPrivileged('slack-webapp-dev');

const isDarwin = process.platform === 'darwin';

// Determine whether we're in a WebView or a BrowserWindow, and either way,
// capture our identifying information. If we're actually in a WebView, this
// will identify the hosting window
let currentWindow = remote.getCurrentWindow();

const browserWindowId = currentWindow.id;

// NB: Wait until we're in page context before we try to set up our input
// listener
var postDOMSetup = () => {
  // Keep polling for these window properties until they exist
  if (!window || !window.location || !window.winssb || !window.document || !window.document.body) {
    setTimeout(postDOMSetup, 250);
    return;
  }

  setupLocalStorageAlias();
  window.winssb.spellCheckingHelper.setupInputEventListener();

  if (!isDarwin) setupTouchscreenEvents();
  if (isDarwin) setupDoubleClickHandler(currentWindow);

  // Disable calls to WinSSB as the window itself is collapsing
  window.addEventListener('beforeunload', disableDesktopIntegration, true /*useCapture*/);

  window.slackCore = createProxyForRemote(currentWindow).__webappShared;
  currentWindow = null;
};

setTimeout(postDOMSetup, 250);

let _calls = null;
try {
  _calls = new Calls();
} catch (e) {
  console.log ("Calls failed to load, bailing");
}

// TODO: Rename this to window.desktop outright when webapp is ready, before shipping for Mac
window.winssb = {
  app: new AppIntegration(),

  clipboard: new ClipboardIntegration(),

  dock: new DockIntegration(),

  notice: new NotificationIntegration(),

  teams: new TeamIntegration(),

  downloads: new DownloadIntegration(),

  window: new WebappWindowManager(),

  stats: new StatsIntegration(),

  calls: _calls,

  // this is for backwards compatibility with webapp, which currently refers to everything as 'screehero' and not 'calls'
  screenhero: _calls,

  browserWindowId: browserWindowId,

  spellCheckingHelper: new SpellCheckingHelper(),

  store: Store,

  deviceStorage: new DeviceStorage(),

  reduxHelper: new ReduxHelper()
};

// NB: We will be moving to this more generic name for our desktop integration global.
window.desktop = window.winssb;

if (!_calls) delete window.winssb.calls;

// NB: If this is set, we know we're running in the context of a WebView
if (process.guestInstanceId) {
  window.winssb.guestInstanceId = process.guestInstanceId;
} else {
  window.opener = new WindowOpener();
}

overrideWindowOpen((opts) => window.winssb.window.open(opts));
