'use strict';

const fs = require('fs');
const {app} = require('electron');
const _ = require('lodash');
const path = require('path');
const optimist = require('optimist');

// These Chromium switches let you hack yourself or do Weird Things. Blacklist
// them.
const thingsIDontLike = [
  /disable-web-security/i,
  /proxy-server/i,
  /proxy-pac-url/i,
  /allow-running-insecure-content/i
];

// Public: Parses command line options and returns a cleaned-up version to the
// caller.
//
// Returns an object with sanitized versions of the command-line parameters.
// Check the return value for supported options.
function parseCommandLine() {
  let version = app.getVersion();

  let re = /^slack:/i;
  let argList = _.clone(process.argv.slice(1));
  let protoUrl = _.find(argList, (x) => x.match(re));
  argList = _.filter(argList, (x) => !x.match(re));

  if (_.find(argList, (x) => _.find(thingsIDontLike, (r) => x.match(r)))) {
    process.exit(-1);
  }

  let options = optimist(argList);
  options.usage(`Slack Client v${version}`);

  options.alias('f', 'foreground').boolean('f').describe('f', 'Keep the browser process in the foreground.');
  options.alias('h', 'help').boolean('h').describe('h', 'Print this usage message.');
  options.alias('l', 'log-file').string('l').describe('l', 'Log all output to file.');
  options.alias('g', 'log-level').string('g').describe('g', "Set the minimum log level, e.g., 'info', 'debug', etc.");
  options.alias('r', 'resource-path').string('r').describe('r', 'Set the path to the Atom source directory and enable dev-mode.');
  options.alias('e', 'livereload')
    .boolean('e')
    .describe('e', 'Automatically reload the app if the source files are changed in dev-mode.');
  options.alias('u', 'startup')
    .boolean('u')
    .describe('u', 'The app is being started via a Startup shortcut. Hide the window on Win32');
  options.alias('v', 'version').boolean('v').describe('v', 'Print the version.');

  let args = options.argv;

  if (args.help) {
    process.stdout.write(options.help());
    process.exit(0);
  }

  if (args.version) {
    process.stdout.write(`${version}\n`);
    process.exit(0);
  }

  let devMode = args.dev;
  let webappSrcPath = args['webapp-src-path'] || process.env.SLACK_WEBAPP_SRC;
  webappSrcPath = webappSrcPath ? path.normalize(webappSrcPath) : webappSrcPath;
  let liveReload = args.livereload;
  let logFile = args['log-file'];
  let logLevel = args['log-level'];
  let invokedOnStartup = args.startup;
  let chromeDriver = !!_.find(process.argv.slice(1), (x) => x.match(/--test-type=webdriver/));

  let resourcePath = path.join(process.resourcesPath, 'app.asar');
  if (args['resource-path']) {
    devMode = true;
    resourcePath = args['resource-path'];
  }

  if (!fs.statSyncNoException(resourcePath)) {
    resourcePath = path.dirname(__dirname);
  }

  // If we were started via npm start, convert devXYZ to the protocol URL version
  if (process.execPath.match(/[\\\/]electron-prebuilt[\\\/]dist/)) {
    let envToLoad = _.find(argList, (x) => x.match(/^(dev[0-9]{0,3}|staging)$/i));
    if (envToLoad) protoUrl = `slack://open?devEnv=${envToLoad}`;
  }

  resourcePath = path.resolve(resourcePath);

  return {
    resourcePath, version, devMode, logFile,
    logLevel, liveReload, protoUrl, invokedOnStartup, chromeDriver,
    webappSrcPath
  };
}

module.exports = { parseCommandLine };
