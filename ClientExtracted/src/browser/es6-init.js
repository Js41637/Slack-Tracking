 /*eslint prefer-template:0 */

// NB: This file is intentionally written using ES5 because at this time,
// electron-compile is not yet initialized

const profiler = require('../utils/profiler.js');
if (profiler.shouldProfile()) profiler.startProfiling();

require('../stat-cache');

var path = require('path');
var app = require('electron').app;
var parseCommandLine = require('../parse-command-line').parseCommandLine;
var parseProtocolUrl = require('../parse-protocol-url').parseProtocolUrl;
var isPrebuilt = require('../utils/process-helpers').isPrebuilt;

var readOnlyMode = !isPrebuilt();
var appData;

// NB: We have to do this *super* early because app.setData is basically one
// giant race condition.
var args = parseCommandLine();
Object.assign(args, parseProtocolUrl(args.protoUrl));

if (args.devEnv) {
  appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, 'SlackDevEnv'));
}

if (!args.devEnv && args.devMode) {
  //https://developer.chrome.com/devtools/docs/debugger-protocol#simultaneous
  //https://bugs.chromium.org/p/chromedriver/issues/detail?id=878#c16
  //selenium needs to initiate own debug protocol setup, so if it's set by remote-debugging-port it can't connect into.
  if (!args.chromeDriver) {
    app.commandLine.appendSwitch('remote-debugging-port', '8315');
  }

  appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, 'SlackDevMode'));
}

if (readOnlyMode) {
  require('electron-compile').init(path.resolve(__dirname, '..', '..'), './main', true);
} else {
  require('./main');
}
