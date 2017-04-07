(function() {
  "use strict";
  TS.registerModule("ui.date_picker", {
    onStart: function() {},
    start: function($element, date_picker_args) {
      $element.pickmeup(date_picker_args);
    },
    startJumpToDatePicker: function($element) {
      var oldest_msg_ts = $("#channel_actions_toggle").attr("data-oldest-ts");
      if (oldest_msg_ts) {
        var min_date = TS.utility.date.toDateObject(oldest_msg_ts);
        _initPickmeUpForJumpToDate($element, min_date);
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
            min_ts = TS.shared.getActiveModelOb().created;
          }
          min_ts = response.data.messages[0].ts;
          var min_date = TS.utility.date.toDateObject(min_ts);
          _initPickmeUpForJumpToDate($element, min_date);
          return true;
        }).catch(function() {
          _initPickmeUpForJumpToDate($element);
          return TS.warn("couldn’t find messages in this channel :" + model_ob.id);
        });
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
        first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
        hide_on_select: true,
        select_year: true,
        date: selected_date,
        min: min_date,
        max: today,
        locale: {
          days: TS.utility.date.day_names,
          daysShort: TS.utility.date.short_day_names,
          daysMin: TS.utility.date.really_short_day_names,
          months: TS.utility.date.month_names,
          monthsShort: TS.utility.date.short_month_names
        },
        change: function() {
          selected_date = $(this).pickmeup("get_date");
          var timestamp = Date.parse(selected_date) * 1e3;
          var name_for_url = TS.boot_data.feature_intl_channel_names ? model_ob.id : model_ob.name;
          var path = model_ob.is_mpim ? TS.mpims.getMpimArchivesPath(model_ob) : "/archives/" + name_for_url;
          window.location = path + "/s" + timestamp;
        }
      });
    },
    startExpirationDatePicker: function($element, options) {
      options = options || {};
      var today = new Date;
      var today_ts = today.getTime();
      var selected_expiration_ts;
      if (options.selected_expiration_ts) {
        selected_expiration_ts = options.selected_expiration_ts * 1e3;
      } else {
        var default_expiration_date = new Date;
        default_expiration_date.setHours(0, 0, 0, 0);
        default_expiration_date.setDate(today.getDate() + _DEFAULT_GUEST_DURATION_DAYS);
        selected_expiration_ts = default_expiration_date.getTime();
      }
      var date_picker_args = {
        first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
        select_year: false,
        min: today_ts,
        date: selected_expiration_ts,
        format: "s",
        position: "top",
        flat: true,
        hide_on_select: true,
        locale: {
          days: TS.utility.date.day_names,
          daysShort: TS.utility.date.short_day_names,
          daysMin: TS.utility.date.really_short_day_names,
          months: TS.utility.date.month_names,
          monthsShort: TS.utility.date.short_month_names
        }
      };
      if (options.class_name) date_picker_args.class_name = options.class_name;
      if (options.onChange) date_picker_args.change = options.onChange;
      if (options.onHide) date_picker_args.hide = options.onHide;
      TS.ui.date_picker.start($element, date_picker_args);
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
          return;
        }
        min_ts = response.data.messages[0].ts;
        $("#channel_actions_toggle").attr("data-oldest-ts", min_ts);
        return true;
      }).catch(function() {
        return TS.warn("couldn’t find messages in this channel :" + model_ob.id);
      });
    }
  });
  var _jumpToDateJumper = function(selected_date) {
    var model_ob = TS.shared.getActiveModelOb();
    if (model_ob.is_channel && !model_ob.is_member) {
      if (model_ob.id == TS.client.archives.current_model_ob.id) {
        _jumpIntoArchives(model_ob, selected_date);
      }
    } else {
      if (model_ob.msgs.length < 1) {
        TS.warn("no messages in this channel: " + model_ob.id);
        return;
      }
      var timestamp = Date.parse(selected_date) / 1e3;
      var last_visible = model_ob.msgs[model_ob.msgs.length - 1];
      var last_visible_ts = parseFloat(last_visible.ts);
      if (last_visible_ts < timestamp) {
        if (TS.model.archive_view_is_showing) {
          TS.client.archives.cancel();
        }
        var msg = TS.utility.msgs.getDisplayedMsgAfterTS(timestamp, model_ob.msgs);
        if (msg) {
          TS.client.ui.scrollMsgsSoMsgIsInView(msg.ts, false, true);
        } else if (!msg && model_ob.msgs.length > 0) {
          msg = TS.utility.msgs.getDisplayedMsgBeforeTS(timestamp, model_ob.msgs);
          TS.client.ui.scrollMsgsSoMsgIsInView(msg.ts, false, true);
        }
      } else {
        _jumpIntoArchives(model_ob, selected_date);
      }
    }
  };
  var _jumpIntoArchives = function(model_ob, selected_date) {
    var timestamp = Date.parse(selected_date) / 1e3;
    timestamp = timestamp.toString() + ".000000";
    _getVisibleMsgInArchives(model_ob, timestamp).then(function(msg_id) {
      if (TS.utility.msgs.getMsg(msg_id, model_ob.msgs)) {
        if (TS.model.archive_view_is_showing) {
          TS.client.archives.cancel();
        }
        TS.client.ui.scrollMsgsSoMsgIsInView(msg_id, false, true);
      } else {
        TS.client.archives.start(msg_id);
      }
      return true;
    }).catch(function() {
      return TS.warn("couldn’t find message for date: " + timestamp + " in channel: " + model_ob.id);
    });
  };
  var _getVisibleMsgInArchives = function(model_ob, timestamp, fetch_count) {
    fetch_count = fetch_count || 1;
    if (fetch_count > 100) {
      if (model_ob._archive_msgs && model_ob._archive_msgs.length > 0) {
        return model_ob._archive_msgs[0];
      }
      throw new Error("no_visible_message_found");
    }
    var api_method = TS.shared.getHistoryApiMethodForModelOb(model_ob);
    return new Promise(function(resolve, reject) {
      var api_args = {
        channel: model_ob.id,
        oldest: timestamp,
        count: fetch_count,
        inclusive: 1,
        ignore_replies: true
      };
      TS.api.call(api_method, api_args).then(function(response) {
        if (!response || !response.data || response.data.messages.length === 0) {
          if (model_ob._archive_msgs && model_ob._archive_msgs.length > 0) {
            resolve(model_ob._archive_msgs[0]);
          } else {
            reject(new Error("api_call_failed"));
          }
        } else {
          var msgs = response.data.messages;
          for (var i = msgs.length - 1; i >= 0; i -= 1) {
            var msg = msgs[i];
            if (!TS.utility.msgs.isMsgReply(msg) && !(msg.subtype === "pinned_item")) {
              resolve(msg.ts);
            }
          }
          reject(new Error("no_visible_message_found"));
        }
      });
    }).then(function(msg_id) {
      return msg_id;
    }, function(err) {
      if (err.message === "no_visible_message_found") {
        return _getVisibleMsgInArchives(model_ob, timestamp, fetch_count * 10);
      }
      throw err;
    });
  };
  var _initPickmeUpForJumpToDate = function($element, min_date) {
    if (!min_date) {
      min_date = TS.utility.date.toDateObject(TS.shared.getActiveModelOb().created);
    }
    var today = Date.now();
    var selected_date = today;
    TS.ui.date_picker.start($element, {
      first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
      hide_on_select: true,
      select_year: false,
      flat: true,
      date: selected_date,
      min: min_date,
      max: today,
      locale: {
        days: TS.utility.date.day_names,
        daysShort: TS.utility.date.short_day_names,
        daysMin: TS.utility.date.really_short_day_names,
        months: TS.utility.date.month_names,
        monthsShort: TS.utility.date.short_month_names
      },
      change: function() {
        selected_date = $(this).pickmeup("get_date");
        _jumpToDateJumper(selected_date);
        TS.menu.$menu.css("opacity", 0);
        TS.menu.end();
      },
      hide: function() {
        window.setTimeout(function() {
          if ($(this).pickmeup) {
            $(this).pickmeup("destroy");
          }
        }.bind(this), 0);
      }
    });
    $element.pickmeup("show");
  };
  var _DEFAULT_GUEST_DURATION_DAYS = 7;
})();
