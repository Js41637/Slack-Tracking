import _ from 'lodash';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import rx from 'rx';
import {requestGC} from '../run-gc';

import {initializeEvalHandler} from 'electron-remote';

import SlackApp from './components/slack-app.jsx';
import Reporter from './metrics-reporter';
import WebappSharedMainModule from '../webapp-shared/main';

initializeEvalHandler();

if (global.loadSettings.liveReload) {
  const LiveReload = require('./livereload');
  let paths = ['src', 'spec'];
  let realPaths = _.map(paths, (x) => path.resolve(global.loadSettings.resourcePath, x));

  let liveReload = new LiveReload(realPaths);
  global.attachLiveReload = liveReload.attach();
}

global.metricsReporter = new Reporter();
if (!global.loadSettings.devMode) {
  global.metricsReporter.handleBrowserEvents();
}

// This will after a throttled 10sec delay, run a V8 GC
rx.Observable.fromEvent(window, 'blur')
  .throttle(10 * 1000)
  .subscribe(() => requestGC());

// Device Storage is (paradoxically) per-session.
let toDelete = _.filter(Object.keys(localStorage), (x) => x.match(/^deviceStorage_/));
_.each(toDelete, (x) => localStorage.removeItem(x));

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
