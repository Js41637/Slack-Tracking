require('../stat-cache');
const profiler = require('../utils/profiler');

if (profiler.shouldProfile()) profiler.startProfiling();

var startup = function() {
  var url = require('url');

  // Skip "?loadSettings=".
  var fileUri = url.parse(window.location.href);

  var queryParts = fileUri.query.split('&');
  var loadSettingsStr = null;

  for (var j=0; j < queryParts.length; j++) {
    if (queryParts[j].match(/loadSettings/)) {
      loadSettingsStr = queryParts[j].replace("loadSettings=", "");
      break;
    }
  }

  var loadSettings = JSON.parse(decodeURIComponent(loadSettingsStr));

  // Require before the module cache in dev mode
  window.loadSettings = loadSettings;

  var noCommitVersion = loadSettings.version.split('-')[0];
  var shouldSuppressErrors = loadSettings.devMode;
  if (!loadSettings.isSpec) {
    require('../renderer/bugsnag-setup').default(shouldSuppressErrors, noCommitVersion);
  }

  if (loadSettings.bootstrapScript) {
    require(loadSettings.bootstrapScript);
  }
};


document.addEventListener("DOMContentLoaded", function() { // eslint-disable-line
  try {
    startup();
  } catch (e) {
    console.log(e.stack);

    if (window.Bugsnag) {
      window.Bugsnag.notifyException(e, "Renderer crash");
    }

    throw e;
  }
});
