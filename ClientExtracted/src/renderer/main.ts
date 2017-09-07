import { initializeEvalHandler } from 'electron-remote';
import { EventEmitter } from 'events';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../rx-operators';

import { localSettings } from '../browser/local-storage';
import { intl as $intl } from '../i18n/intl';
import { locale } from '../i18n/locale';
import { WebappSharedMainModule } from '../webapp-shared/main';
import { SlackApp } from './components/slack-app';
import { Reporter } from './metrics-reporter';

initializeEvalHandler();

(global as any).metricsReporter = new Reporter();
if (!global.loadSettings.devMode) {
  (global as any).metricsReporter.handleBrowserEvents();
}

// Increase EventEmitter limit: 0 would remove the warning completely, but we
// probably shouldn't have more than a hundred on anything
EventEmitter.defaultMaxListeners = 100;

// Device Storage is (paradoxically) per-session.
const toDelete = Object.keys(localStorage).filter((x) => x.match(/^deviceStorage_/)) || [];
toDelete.forEach((x) => localStorage.removeItem(x));

//apply locale into component window before initialize react,
//let each component looks up locale based on applied one
$intl.applyLocale(localSettings.getItem('lastKnownLocale') || locale.currentLocale.systemLocale);

// Rendering directly into document.body is discouraged due to third-party scripts
// and browser extensions frequently manipulating it
const reactHost = React.createElement(SlackApp);
const appHost = global.document.createElement('span');
global.document.body.appendChild(appHost);
global.application = ReactDOM.render(reactHost, appHost);

(global as any).__webappShared = new WebappSharedMainModule();

window.addEventListener('beforeunload', () => {
  ReactDOM.unmountComponentAtNode(appHost);
  (global as any).metricsReporter.dispose();
  return true;
});
