(function() {
  "use strict";
  TS.registerModule("selection_signal", {
    onStart: function() {
      if (!TS.client) return;
      if (!window.getSelection) return;
      TS.client.login_sig.add(_handleSelection)
    }
  });
  var _handleSelection = function() {
    $("body").on("mouseup.clog_sel", "#msgs_div ts-message", function(e) {
      var sel_obj = window.getSelection();
      if (!sel_obj.isCollapsed) {
        var range = sel_obj.getRangeAt(0);
        if ($(range.commonAncestorContainer).closest("ts-message").get(0) !== undefined) {
          var ts_message = $(range.commonAncestorContainer).closest("ts-message").get(0);
          var msg_text = TS.format.replaceUnicodeDoppelgangers($(ts_message).find(".message_body").text());
          var sel_text = TS.format.replaceUnicodeDoppelgangers(range.toString());
          var message_length = msg_text.length;
          var channe_id = $(ts_message).data("model-ob-id");
          if ($(range.endContainer).hasClass("constrain-triple-clicks")) {
            sel_text = msg_text
          }
          var start_offset = range.startOffset < range.endOffset ? range.startOffset : range.endOffset;
          var tokens = sel_text.match(/\S+/g);
          var clog_args = {};
          clog_args["sel_length"] = sel_text.length;
          clog_args["message_length"] = message_length;
          clog_args["start_offset"] = start_offset;
          clog_args["channel_id"] = channe_id;
          clog_args["channel_type"] = channe_id[0] || "";
          clog_args["message_timestamp"] = $(ts_message).data("ts") + "";
          clog_args["num_tokens"] = tokens ? tokens.length : 0;
          TS.clog.track("MSG_CURSOR_SELECT", clog_args)
        }
      }
    })
  }
})();