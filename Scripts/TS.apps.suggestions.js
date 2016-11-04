(function() {
  "use strict";
  TS.registerModule("apps_suggestions", {
    onStart: function() {
      if (!TS.client) return;
      TS.client.login_sig.addOnce(function() {
        if (!_.get(TS, "model.user.is_admin") || _.get(TS, "model.prefs.intro_to_apps_message_seen")) return;
        window.setTimeout(function() {
          TS.api.call("apps.suggestions", {}).then(_.noop);
        }, 60 * 1e3);
      });
    }
  });
})();
