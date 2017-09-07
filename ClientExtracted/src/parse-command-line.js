'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const yargs = require('yargs');

const { isPrebuilt } = require('./utils/process-helpers');
const { version } = require('../package.json');

// These Chromium switches let you hack yourself or do Weird Things. Blacklist
// them.
const thingsIDontLike = [
  /disable-web-security/i,
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
  let argList = _.clone(process.argv.slice(1));
  let protoUrl = argList.find((x) => x.match(re));
  argList = argList.filter((x) => !x.match(re));

  if (argList.find((x) => thingsIDontLike.find((r) => x.match(r)))) {
    process.exit(-1);
  }

  const options = yargs.usage(`Slack Client v${version}`)
    .option('f', {
      alias: 'foreground',
      type: 'boolean',
      describe: 'Keep the browser process in the foreground.'
    }).option('h', {
      alias: 'help',
      type: 'boolean',
      describe: 'Print this usage message.'
    }).option('l', {
      alias: 'log-file',
      type: 'string',
      describe: 'Log all output to file.'
    }).option('g', {
      alias: 'log-level',
      type: 'string',
      describe: `Set the minimum log level, e.g., 'info', 'debug', etc.`
    }).option('r', {
      alias: 'resource-path',
      type: 'string',
      describe: 'Set the path to the Atom source directory and enable dev-mode.'
    }).option('u', {
      alias: 'startup',
      type: 'boolean',
      describe: 'The app is being started via a Startup shortcut. Hide the window on Win32'
    }).option('v', {
      alias: 'version',
      type: 'boolean',
      describe: 'Print the version.'
    }).option('e', {
      //'Set QA/DEV Env'
      alias: 'devEnv',
      type: 'string',
      describe: false
    }).option('t', {
      //'Token for TSAuth'
      alias: 'tsaToken',
      type: 'string',
      describe: false
    }).help(false);

  const args = process.defaultApp ? options.argv : options.parse(process.argv.slice(1));

  if (args.help) {
    process.stdout.write(options.help());
    process.exit(0);
  }

  if (args.version) {
    process.stdout.write(`${version}\n`);
    process.exit(0);
  }

  let webappSrcPath = args['webapp-src-path'] || process.env.SLACK_WEBAPP_SRC;
  webappSrcPath = webappSrcPath ? path.normalize(webappSrcPath) : webappSrcPath;

  const logFile = args['log-file'];
  const logLevel = args['log-level'];
  const devEnv = args.devEnv;
  const tsaToken = args.tsaToken;

  const invokedOnStartup = args.startup;
  const chromeDriver = !!process.argv.slice(1).find((x) => x.match(/--test-type=webdriver/));

  let devMode = args.dev || chromeDriver;
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
    const envToLoad = argList.find((x) => x.match(/^(dev[0-9]{0,3}|staging|qa[0-9]{0,3})$/i));
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
    devEnv,
    tsaToken
  };
}

module.exports = { parseCommandLine };
