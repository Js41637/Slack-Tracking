import Mocha from 'mocha';
import path from 'path';
import glob from 'glob';

const specDir = 'spec';

export function createMochaFromArgs(args) {
  let utils = Mocha.utils;
  let mocha = new Mocha();

  // infinite stack traces (this was pulled from Mocha source, may not be necessary)
  Error.stackTraceLimit = Infinity;

  mocha.reporter(args.reporter);
  mocha.ui(args.ui);

  if (args.inlineDiffs) mocha.useInlineDiffs(true);
  if (args.slow) mocha.suite.slow(args.slow);
  if (!args.timeouts) mocha.enableTimeouts(false);
  if (args.timeout) mocha.suite.timeout(args.timeout);
  if (args.grep) mocha.grep(new RegExp(args.grep));
  if (args.fgrep) mocha.grep(args.fgrep);
  if (args.invert) mocha.invert();
  if (args.checkLeaks) mocha.checkLeaks();
  mocha.globals(args.globals);

  mocha.useColors(true);

  // default files to test/*.js
  let files = [];
  let extensions = ['js'];
  if (!args.files.length) args.files.push('test');
  args.files.forEach((arg) => {
    files = files.concat(utils.lookupFiles(arg, extensions, args.recursive));
  });

  files = files.map((f) => {
    return path.resolve(f);
  });

  mocha.files = files;
  return mocha;
}

export function runMocha(args=null) {
  args = args || {
    files: [
      // Import our spec support before running any specs
      path.join(__dirname, '..', '..', specDir, 'support.js'),
      ...glob.sync(path.join(__dirname, '..', '..', specDir, 'renderer', '**', '*.js'))
    ],
    inlineDiffs: true,
    slow: 5*1000
  };

  args.reporter = 'html';
  let mocha = createMochaFromArgs(args);

  return new Promise((resolve) => {
    mocha.run(resolve);
  });
}
