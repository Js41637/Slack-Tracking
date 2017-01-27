(function() {
  "use strict";
  TS.registerModule("apps_suggestions", {
    onStart: function() {
      if (!TS.client) return;
      TS.client.login_sig.addOnce(function() {
        window.setTimeout(function() {
          if (_.get(TS, "model.user.is_restricted") || _.get(TS, "model.user.is_ultra_restricted") || _.get(TS, "model.prefs.intro_to_apps_message_seen")) {
            return;
          }
          TS.api.call("apps.suggestions", {}).then(_.noop);
        }, 60 * 1e3);
      });
    }
  });
})();
