'use strict';

const fs = require('fs');
const clone = require('lodash.clone');
const path = require('path');
const optimist = require('optimist');

const { isPrebuilt } = require('./utils/process-helpers');
const { version } = require('../package.json');

// These Chromium switches let you hack yourself or do Weird Things. Blacklist
// them.
const thingsIDontLike = [
  /disable-web-security/i,
  /proxy-server/i,
  /proxy-pac-url/i,
  /allow-running-insecure-content/i
];

/**
 * Parses command line options and returns a cleaned-up version to the caller.
 *
 * @returns An object with sanitized versions of the command-line parameters.
 *          Check the return value for supported options.
 */
function parseCommandLine() {
  const re = /^slack:/i;
  let argList = clone(process.argv.slice(1));
  let protoUrl = argList.find((x) => x.match(re));
  argList = argList.filter((x) => !x.match(re));

  if (argList.find((x) => thingsIDontLike.find((r) => x.match(r)))) {
    process.exit(-1);
  }

  const options = optimist(argList);
  options.usage(`Slack Client v${version}`);

  options.alias('f', 'foreground')
    .boolean('f')
    .describe('f', 'Keep the browser process in the foreground.');

  options.alias('h', 'help')
    .boolean('h')
    .describe('h', 'Print this usage message.');

  options.alias('l', 'log-file')
    .string('l')
    .describe('l', 'Log all output to file.');

  options.alias('g', 'log-level')
    .string('g')
    .describe('g', "Set the minimum log level, e.g., 'info', 'debug', etc.");

  options.alias('r', 'resource-path')
    .string('r')
    .describe('r', 'Set the path to the Atom source directory and enable dev-mode.');

  options.alias('u', 'startup')
    .boolean('u')
    .describe('u', 'The app is being started via a Startup shortcut. Hide the window on Win32');

  options.alias('v', 'version')
    .boolean('v')
    .describe('v', 'Print the version.');

  //TODO: This command line arg option should be removed after wrap string validation completes, before next release
  options.alias('i', 'i18n')
    .string('i')
    .describe('i', 'Set application locale manually. for now it supports psuedo locale only');

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

  const logFile = args['log-file'];
  const logLevel = args['log-level'];

  const invokedOnStartup = args.startup;
  const chromeDriver = !!process.argv.slice(1).find((x) => x.match(/--test-type=webdriver/));
  const i18nOverride = args['i18n'];

  let resourcePath = path.join(process.resourcesPath, 'app.asar');
  if (args['resource-path']) {
    devMode = true;
    resourcePath = args['resource-path'];
  }

  if (!fs.statSyncNoException(resourcePath)) {
    resourcePath = path.dirname(__dirname);
  }

  // If we were started via npm start, convert devXYZ to the protocol URL version
  if (isPrebuilt()) {
    let envToLoad = argList.find((x) => x.match(/^(dev[0-9]{0,3}|staging)$/i));
    if (envToLoad) protoUrl = `slack://open?devEnv=${envToLoad}`;
  }

  resourcePath = path.resolve(resourcePath);

  return {
    resourcePath,
    version,
    devMode,
    logFile,
    logLevel,
    protoUrl,
    invokedOnStartup,
    chromeDriver,
    webappSrcPath,
    i18nOverride
  };
}

module.exports = { parseCommandLine };
