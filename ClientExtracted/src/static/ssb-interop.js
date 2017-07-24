//do not migrate preload script into TypeScript
require('../stat-cache');

const profiler = require('../utils/profiler.js');
if (profiler.shouldProfile()) profiler.startProfiling();

let assignIn = require('lodash').assignIn;
let path = require('path');
let isPrebuilt = require('../utils/process-helpers').isPrebuilt;

// tslint:disable-next-line
process.on('uncaughtException', (e) => console.error(e));

// Warning: You almost certainly do *not* want to edit this code - instead, you
// want to edit src/ssb/main.js instead
let start = function(loadSettings) {
  window.loadSettings = loadSettings;

  const mainModule = path.join(loadSettings.resourcePath, 'src', 'ssb', 'main.ts');
  const isDevMode = loadSettings.devMode && isPrebuilt();
  require('electron-compile').init(loadSettings.resourcePath, mainModule, !isDevMode);
};

const processRef = window.process;
process.nextTick(function() { // eslint-disable-line
  // Patch global back in
  window.process = processRef;
});

// NB: For whatever reason, we have to wait longer to restore 'global'
// Update (2017.Jan.18): This context 'restoration' causes unexpected state mutation in post,
// especially related to check selection state via $("selection.user") when compositionupdate event fired.
// As it does not have clear usecases at the moment, blocking it to prevent webapp abnormality
// setTimeout(function() { window.global = window; }, 10);

start(assignIn({}, require('electron').remote.getGlobal('loadSettings'), { windowType: 'WEBAPP' }));
