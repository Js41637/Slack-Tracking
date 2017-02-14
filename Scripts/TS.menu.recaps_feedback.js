(function() {
  "use strict";
  TS.registerModule("menu.recaps_feedback", {
    startWithMember: function(e, msg_ts, model_ob_id) {
      var template_options = {
        msg_ts: msg_ts,
        model_ob_id: model_ob_id
      };
      TS.menu.buildIfNeeded();
      TS.menu.$menu_items.html(TS.templates.menu_recaps_feedback(template_options));
      TS.menu.start(e, true);
    },
    end: function() {
      TS.menu.end();
    }
  });
})();
