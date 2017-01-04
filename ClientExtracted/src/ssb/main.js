import {webFrame, remote} from 'electron';
import {initializeEvalHandler} from 'electron-remote';
import {logger} from '../logger';
import overrideWindowOpen from './override-window-open';
import overrideDropbox from './override-dropbox';
import setupCrashReporter from '../setup-crash-reporter';

import AppIntegration from './app';
import Calls from './calls';
import {ClipboardIntegration} from './clipboard';
import DeviceStorage from './device-storage';
import DockIntegration from './dock';
import DownloadIntegration from './downloads';
import NotificationIntegration from './notify';
import {setupTouchscreenEvents, setupDoubleClickHandler,
  canAccessLocalStorage, disableDesktopIntegration} from './post-dom-tasks';
import SpellCheckingHelper from './spell-checking';
import StatsIntegration from './stats';
import {Store} from '../lib/store';
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

let currentWindow = remote.getCurrentWindow();
const browserWindowId = currentWindow.id;

// NB: Wait until we're in page context before we try to set up any listeners
let postDOMSetup = () => {
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
    setupDoubleClickHandler(currentWindow);
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

let windowManager = new WebappWindowManager();
let callsModule = null;

try {
  callsModule = new Calls(windowManager);
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

  browserWindowId: browserWindowId,

  spellCheckingHelper: new SpellCheckingHelper(),

  store: Store,

  deviceStorage: new DeviceStorage(),

  reduxHelper: new ReduxHelper()
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

overrideWindowOpen((opts) => window.winssb.window.open(opts));
overrideDropbox();
