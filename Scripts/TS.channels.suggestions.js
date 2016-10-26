(function() {
  "use strict";
  TS.registerModule("channels_suggestions", {
    onStart: function() {
      if (!TS.client) return;
      TS.client.login_sig.addOnce(function() {
        window.setTimeout(function() {
          TS.api.call("channels.suggestions", {}).then(_.noop)
        }, 30 * 1e3)
      })
    }
  })
})();