(function() {
  "use strict";
  TS.registerModule("ui.date_picker", {
    onStart: function() {},
    start: function($element, date_picker_args) {
      $element.pickmeup(date_picker_args)
    },
    startJumpToDatePicker: function($element) {
      var oldest_msg_ts = $("#channel_actions_toggle").attr("data-oldest-ts");
      if (oldest_msg_ts) {
        var min_date = TS.utility.date.toDateObject(oldest_msg_ts);
        _initPickmeUpForJumpToDate($element, min_date)
      } else {
        var model_ob = TS.shared.getActiveModelOb();
        var api_method = TS.shared.getHistoryApiMethodForModelOb(model_ob);
        TS.api.callImmediately(api_method, {
          channel: model_ob.id,
          oldest: 283996800,
          count: 1,
          inclusive: 1
        }).then(function(response) {
          var min_ts;
          if (response.data.messages.length < 1) {
            min_ts = TS.shared.getActiveModelOb().created
          }
          min_ts = response.data.messages[0].ts;
          var min_date = TS.utility.date.toDateObject(min_ts);
          _initPickmeUpForJumpToDate($element, min_date);
          return true
        }).catch(function(err) {
          _initPickmeUpForJumpToDate($element);
          return TS.warn("couldn’t find messages in this channel :" + model_ob.id)
        })
      }
    },
    startArchiveDatePicker: function($element) {
      var model_ob = TS.shared.getActiveModelOb();
      var min_date = TS.utility.date.toDateObject(model_ob.created);
      var today = Date.now();
      var selected_date = today;
      if (boot_data.calendar_start) selected_date = TS.utility.date.toDateObject(boot_data.calendar_start);
      if (boot_data.calendar_oldest) min_date = TS.utility.date.toDateObject(boot_data.calendar_oldest);
      TS.ui.date_picker.start($element, {
        first_day: 0,
        hide_on_select: true,
        select_year: true,
        date: selected_date,
        min: min_date,
        max: today,
        change: function() {
          selected_date = $(this).pickmeup("get_date");
          var timestamp = Date.parse(selected_date) * 1e3;
          var path = model_ob.is_mpim ? TS.mpims.getMpimArchivesPath(model_ob) : "/archives/" + model_ob.name;
          window.location = path + "/s" + timestamp
        }
      })
    },
    getOldestMsgTs: function() {
      var oldest_msg_ts = $("#channel_actions_toggle").attr("data-oldest-ts");
      if (oldest_msg_ts) return;
      var model_ob = TS.shared.getActiveModelOb();
      var api_method = TS.shared.getHistoryApiMethodForModelOb(model_ob);
      TS.api.callImmediately(api_method, {
        channel: model_ob.id,
        oldest: 283996800,
        count: 1,
        inclusive: 1
      }).then(function(response) {
        var min_ts;
        if (response.data.messages.length < 1) {
          return
        }
        min_ts = response.data.messages[0].ts;
        $("#channel_actions_toggle").attr("data-oldest-ts", min_ts);
        return true
      }).catch(function(err) {
        return TS.warn("couldn’t find messages in this channel :" + model_ob.id)
      })
    }
  });
  var _jumpToDateJumper = function(selected_date) {
    var model_ob = TS.shared.getActiveModelOb();
    if (model_ob.is_channel && !model_ob.is_member) {
      if (model_ob.id == TS.client.archives.current_model_ob.id) {
        _jumpIntoArchives(model_ob, selected_date)
      }
    } else {
      if (model_ob.msgs.length < 1) {
        TS.warn("no messages in this channel: " + model_ob.id);
        return
      }
      var timestamp = Date.parse(selected_date) * 1e3;
      timestamp = timestamp.toString();
      var last_visible = model_ob.msgs[model_ob.msgs.length - 1];
      if (last_visible.ts < timestamp) {
        if (TS.model.archive_view_is_showing) {
          TS.client.archives.cancel()
        }
        var msg = TS.utility.msgs.getDisplayedMsgAfterTS(timestamp, model_ob.msgs);
        if (msg) {
          TS.client.ui.scrollMsgsSoMsgIsInView(msg.ts, false, true)
        } else if (!msg && model_ob.msgs.length > 0) {
          msg = TS.utility.msgs.getDisplayedMsgBeforeTS(timestamp, model_ob.msgs);
          TS.client.ui.scrollMsgsSoMsgIsInView(msg.ts, false, true)
        }
      } else {
        _jumpIntoArchives(model_ob, selected_date)
      }
    }
  };
  var _jumpIntoArchives = function(model_ob, selected_date) {
    var timestamp = Date.parse(selected_date) / 1e3;
    timestamp = timestamp.toString() + ".000000";
    var api_method = TS.shared.getHistoryApiMethodForModelOb(model_ob);
    TS.api.call(api_method, {
      channel: model_ob.id,
      oldest: timestamp,
      count: 1,
      inclusive: 1
    }).then(function(response) {
      var msg_id;
      if (response.data.messages.length < 1) {
        msg_id = model_ob._archive_msgs[0].ts;
        TS.client.archives.start(msg_id)
      } else {
        msg_id = response.data.messages[0].ts;
        if (TS.utility.msgs.getMsg(msg_id, model_ob.msgs)) {
          TS.client.ui.scrollMsgsSoMsgIsInView(msg_id, false, true)
        } else {
          TS.client.archives.start(msg_id)
        }
      }
      return true
    }).catch(function(err) {
      return TS.warn("couldn’t find message for date: " + timestamp + " in channel: " + model_ob.id)
    })
  };
  var _initPickmeUpForJumpToDate = function($element, min_date) {
    if (!min_date) {
      min_date = TS.utility.date.toDateObject(TS.shared.getActiveModelOb().created)
    }
    var today = Date.now();
    var selected_date = today;
    TS.ui.date_picker.start($element, {
      first_day: 0,
      hide_on_select: true,
      select_year: false,
      flat: true,
      date: selected_date,
      min: min_date,
      max: today,
      change: function() {
        selected_date = $(this).pickmeup("get_date");
        _jumpToDateJumper(selected_date);
        TS.menu.$menu.css("opacity", 0);
        TS.menu.end()
      },
      hide: function() {
        window.setTimeout(function() {
          if ($(this).pickmeup) {
            $(this).pickmeup("destroy")
          }
        }.bind(this), 0)
      }
    });
    $element.pickmeup("show")
  }
})();
