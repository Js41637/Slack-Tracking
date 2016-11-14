/*eslint prefer-template:0 */

// NB: This file is intentionally written using ES5 because at this time,
// electron-compile is not yet initialized

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
  app.commandLine.appendSwitch('remote-debugging-port', '8315');

  appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, 'SlackDevMode'));
}

if (args.chromeDriver) {
  appData = app.getPath('appData');
  app.setPath('userData', path.join(appData, 'SlackQaMode'));
}

if (readOnlyMode) {
  require('electron-compile').init(path.resolve(__dirname, '..', '..'), './main', true);
} else {
  require('./main');
}
