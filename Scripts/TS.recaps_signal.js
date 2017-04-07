(function() {
  "use strict";
  TS.registerModule("recaps_signal", {
    sli_recaps_debug_group: null,
    onStart: function() {
      if (!TS.client || !TS.boot_data.feature_sli_recaps) return;
      TS.experiment.loadUserAssignments().then(TS.recaps_signal.getExperimentGroup);
    },
    getExperimentGroup: function() {
      TS.recaps_signal.sli_recaps_debug_group = TS.experiment.getGroup("sli_recaps_debug");
    },
    canHaveHighlights: function() {
      if (!TS.client || !TS.boot_data.feature_sli_recaps) return false;
      return true;
    },
    canHaveHighlightsUI: function() {
      return !!TS.boot_data.feature_sli_recaps_interface;
    },
    channelAllowHighlights: function() {
      var model_ob = TS.shared.getActiveModelOb();
      return !(model_ob.is_mpim || model_ob.is_im);
    },
    remove: function() {
      $("ts-message.is_recap").removeClass("show_recap");
    },
    setCurrentChannel: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (_last_channel_id != TS.model.active_cid) {
        _last_channel_id = TS.model.active_cid;
        var model_ob = TS.shared.getActiveModelOb();
        _channel_unread_data = {
          count: model_ob.unread_cnt,
          last_read_ts: model_ob.last_read,
          oldest_unread_ts: model_ob.oldest_unread_ts,
          channel_open_ts: TS.utility.date.makeTsStamp(new Date, "0")
        };
        _last_request_id = null;
      }
    },
    retrieveHighlights: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.channelAllowHighlights()) return;
      var model_ob = TS.shared.getActiveModelOb();
      if (_is_checking_membership_count_for_model_ob[model_ob.id]) return;
      _is_checking_membership_count_for_model_ob[model_ob.id] = true;
      TS.membership.promiseToGetMembershipCounts(model_ob).then(function(counts) {
        var min_number_of_members = 5;
        if (counts.member_count < min_number_of_members) return;
        return _retrieveHighlights(model_ob);
      }).finally(function() {
        delete _is_checking_membership_count_for_model_ob[model_ob.id];
      });
    },
    renderHighlightedMessages: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      if (!TS.recaps_signal.channelAllowHighlights()) return;
      TS.recaps_signal.remove();
      var $messages = _retrieveAllHighlightMsgs();
      if (!$messages.length) return;
      var at_the_bottom = TS.client.ui.areMsgsScrolledToBottom(1);
      $messages.addClass("show_recap");
      if (at_the_bottom) {
        TS.client.ui.instaScrollMsgsToBottom();
      }
    },
    msgShouldBeHighlighted: function(msg) {
      return TS.recaps_signal.isMessageHighlight(msg) && _tsIsUnread(msg.ts);
    },
    sendFeedback: function(channel_ob, msg, feedback) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      var clog_args = {
        request_id: _last_request_id,
        channel_id: channel_ob.id,
        message_timestamp: msg.ts,
        channel_type: channel_ob.id[0] || "",
        message_request_id: msg.recap.data.request_id
      };
      if (feedback) {
        TS.clog.track("MSG_RECAP_POSITIVE_CLICK", clog_args);
      } else {
        TS.clog.track("MSG_RECAP_NEGATIVE_CLICK", clog_args);
      }
    },
    isMessageHighlight: function(msg) {
      if (!TS.recaps_signal.canHaveHighlights()) return false;
      return msg.recap && msg.recap.data && msg.recap.data.show_recap;
    },
    isMessageHighlightedUnfurl: function(msg) {
      if (!TS.recaps_signal.canHaveHighlights()) return false;
      return _.get(msg, "recap.data.is_unfurl");
    },
    markFeedbackForMessage: function(msg_ts, positive) {
      var model_ob = TS.shared.getActiveModelOb();
      var msg = _getMsgObjFromModelOb(model_ob, msg_ts);
      msg._sli_received_feedback = true;
      msg._sli_feedback_value = positive;
      TS.recaps_signal.sendFeedback(model_ob, msg, positive);
    },
    getDebugInfoFor: function(ts) {
      if (!ts) return;
      var model_ob = TS.shared.getActiveModelOb();
      var msg = _getMsgObjFromModelOb(model_ob, ts);
      return _.get(msg, "recap.data");
    }
  });
  var _is_checking_membership_count_for_model_ob = {};
  var _last_request_id = null;
  var _last_channel_id = false;
  var _channel_unread_data = null;
  var _callHighlightsList = function(channel_id, msgs) {
    return TS.api.call("highlights.list", {
      channel: channel_id,
      messages: JSON.stringify(msgs),
      channel_open_ts: _channel_unread_data.channel_open_ts,
      channel_open_last_read_ts: _channel_unread_data.last_read_ts
    }).then(function(r) {
      _last_request_id = r.request_id;
      return r;
    }).catch(function(e) {
      throw e;
    });
  };
  var _addMsgRecap = function(model_ob, msg, promise) {
    if (msg.recap) return;
    msg.recap = {
      promise: Promise.resolve(promise).then(function(r) {
        var self = msg.recap;
        self.data = (r.data.messages[model_ob.id] || {})[msg.ts] || {};
        self.data.request_id = r.request_id;
        return msg;
      }).catch(function(e) {
        var self = msg.recap;
        self.error = e.data.error;
        throw e;
      }),
      data: null,
      error: null
    };
    return msg.recap.promise;
  };
  var _highlightChannelMsgs = function(msgs) {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    var highlights = {};
    var unfurls = {};
    msgs.forEach(function(msg) {
      if (TS.recaps_signal.isMessageHighlight(msg)) highlights[msg.ts] = true;
      if (TS.recaps_signal.isMessageHighlightedUnfurl(msg)) unfurls[msg.ts] = true;
    });
    var $msg_divs = _retrieveAllMsgs();
    var $selection = $("");
    var $unfurls = $("");
    for (var i = 0; i < $msg_divs.length; i += 1) {
      var ts = $($msg_divs[i]).data("ts");
      if (highlights[ts]) $selection = $selection.add($msg_divs[i]);
      if (unfurls[ts]) $unfurls = $unfurls.add($msg_divs[i]);
    }
    $unfurls.addClass("is_recap_unfurl");
    $selection.addClass("is_recap");
  };
  var _retrieveAllMsgs = function() {
    if (TS.model.archive_view_is_showing) {
      return $("#archive_msgs_scroller_div ts-message");
    }
    return $("#msgs_scroller_div ts-message");
  };
  var _retrieveAllHighlightMsgs = function() {
    var $msgs;
    if (TS.model.archive_view_is_showing) {
      $msgs = $("#archive_msgs_scroller_div ts-message.is_recap");
    } else {
      $msgs = $("#msgs_scroller_div ts-message.is_recap");
    }
    $msgs = $msgs.filter(function() {
      return _tsIsUnread($(this).data("ts"));
    });
    return $msgs;
  };
  var _getMsgObjFromModelOb = function(model_ob, ts) {
    var msg;
    if (TS.model.archive_view_is_showing) {
      msg = TS.utility.msgs.getMsgByProp("ts", ts, model_ob._archive_msgs);
    } else {
      msg = TS.utility.msgs.getMsgByProp("ts", ts, model_ob.msgs);
    }
    return msg;
  };
  var _tsIsUnread = function(ts) {
    return parseFloat(ts) > parseFloat(_channel_unread_data.last_read_ts);
  };
  var _retrieveHighlights = function(model_ob) {
    var msgs = model_ob.msgs;
    var msg_length = msgs.length;
    var msgs_to_fetch = [];
    var msgs_to_fetch_args = [];
    for (var i = 0; i < msg_length; i += 1) {
      if (msgs[i].recap) continue;
      var is_unread = _tsIsUnread(msgs[i].ts);
      if (is_unread) {
        msgs_to_fetch_args.push({
          ts: msgs[i].ts,
          is_unread: is_unread
        });
        msgs_to_fetch.push(msgs[i]);
      }
    }
    if (msgs_to_fetch.length) {
      var promise = _callHighlightsList(model_ob.id, msgs_to_fetch_args);
      var promises = [];
      msgs_to_fetch.forEach(function(msg) {
        promises.push(_addMsgRecap(model_ob, msg, promise));
      });
      return Promise.all(promises).then(function(msgs) {
        _highlightChannelMsgs(msgs);
        var recap_debug_group = TS.recaps_signal.sli_recaps_debug_group;
        if (recap_debug_group === "sli_debug_info") {
          TS.client.msg_pane.rebuildMsgs();
        } else {
          TS.recaps_signal.renderHighlightedMessages();
        }
      }).catch(function() {});
    }
    TS.recaps_signal.renderHighlightedMessages();
  };
})();
