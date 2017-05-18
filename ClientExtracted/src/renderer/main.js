import React from 'react';
import ReactDOM from 'react-dom';
import '../rx-operators';
import { EventEmitter } from 'events';

import { initializeEvalHandler } from 'electron-remote';

import { SlackApp } from './components/slack-app';
import Reporter from './metrics-reporter';
import { WebappSharedMainModule } from '../webapp-shared/main';

// Increase EventEmitter limit: 0 would remove the warning completely, but we
// probably shouldn't have more than a hundred on anything
EventEmitter.defaultMaxListeners = 100;

initializeEvalHandler();

global.metricsReporter = new Reporter();
if (!global.loadSettings.devMode) {
  global.metricsReporter.handleBrowserEvents();
}

// Device Storage is (paradoxically) per-session.
let toDelete = Object.keys(localStorage).filter((x) => x.match(/^deviceStorage_/)) || [];
toDelete.forEach((x) => localStorage.removeItem(x));

// Rendering directly into document.body is discouraged due to third-party scripts
// and browser extensions frequently manipulating it
let reactHost = React.createElement(SlackApp);
let appHost = global.document.createElement('span');
global.document.body.appendChild(appHost);
global.application = ReactDOM.render(reactHost, appHost);

global.__webappShared = new WebappSharedMainModule();

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(appHost);
  global.metricsReporter.dispose();
  return true;
});
