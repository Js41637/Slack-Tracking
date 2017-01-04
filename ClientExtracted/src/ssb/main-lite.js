import {webFrame} from 'electron';
import {initializeEvalHandler} from 'electron-remote';
import {logger} from '../logger';
import overrideWindowOpen from './override-window-open';

import AppIntegration from './app';
import {canAccessLocalStorage, disableDesktopIntegration} from './post-dom-tasks';
import TeamIntegration from './team';
import WebappWindowManager from './webapp-window-manager';
import WindowOpener from './window-opener';

window.globalLogger = logger;

initializeEvalHandler();

webFrame.registerURLSchemeAsSecure('slack-resources');
webFrame.registerURLSchemeAsBypassingCSP('slack-resources');
webFrame.registerURLSchemeAsPrivileged('slack-resources');

webFrame.registerURLSchemeAsSecure('slack-webapp-dev');
webFrame.registerURLSchemeAsBypassingCSP('slack-webapp-dev');
webFrame.registerURLSchemeAsPrivileged('slack-webapp-dev');

// NB: Wait until we're in page context before we try to set up any listeners
let postDOMSetup = () => {
  // Keep polling for these window properties until they exist
  if (!window || !window.location || !window.winssb || !window.document || !window.document.body) {
    setTimeout(postDOMSetup, 250);
    return;
  }

  if (canAccessLocalStorage()) {
    window.winssb.ls = window.localStorage;
  }

  // Disable calls to WinSSB as the window itself is collapsing
  window.addEventListener('beforeunload', disableDesktopIntegration, true /*useCapture*/);
};

setTimeout(postDOMSetup, 250);

let windowManager = new WebappWindowManager();

// TODO: Rename this to window.desktop outright when webapp is ready, before shipping for Mac
window.winssb = {
  app: new AppIntegration(true),
  teams: new TeamIntegration(),
  window: windowManager,
};

// NB: We will be moving to this more generic name for our desktop integration global.
window.desktop = window.winssb;

// NB: If this is set, we know we're running in the context of a WebView
if (process.guestInstanceId) {
  window.winssb.guestInstanceId = process.guestInstanceId;
} else {
  window.opener = new WindowOpener();
}

overrideWindowOpen((opts) => window.winssb.window.open(opts));