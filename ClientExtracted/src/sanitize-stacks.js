const path = require('path');

module.exports = (stack, resourcePath) => {
  stack = stack || '';
  resourcePath = resourcePath || global.loadSettings.resourcePath;

  // NB: If crashes happen in Atom's JavaScript code (i.e. in web-view.js),
  // we'll end up seeing full paths show up in crash stacks. Censor those
  // too, but make sure atom/ is the first part of the path
  let atomPath = path.resolve(resourcePath, '..');

  // Flip all directory separators so stacks bucket correctly even if they're on
  // disparate OSs
  resourcePath = resourcePath.replace(/\\/g, '/');
  atomPath = atomPath.replace(/\\/g, '/');

  // Ha Ha Multiline search anything in JavaScript
  let lines = stack.split('\n');

  for (var i = 0; i < lines.length; i++) {
    // Same as above
    let line = lines[i].replace(/\\/g, '/');

    while (line.indexOf(resourcePath) > -1) {
      line = line.replace(resourcePath, '');
    }

    while (line.indexOf(atomPath) > -1) {
      line = line.replace(atomPath, '');
    }

    lines[i] = line.replace(/^\/+/, '');
  }

  stack = lines.join("\n");
  return stack;
};
