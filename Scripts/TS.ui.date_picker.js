webpackJsonp([237], {
  2339: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("ui.date_picker", {
        onStart: function() {},
        start: function(e, t) {
          e.pickmeup(t);
        },
        startJumpToDatePicker: function(e) {
          var t = $("#channel_actions_toggle").attr("data-oldest-ts");
          if (t) {
            var a = TS.interop.datetime.toDateObject(t);
            i(e, a);
          } else {
            var s = TS.shared.getActiveModelOb(),
              n = TS.shared.getHistoryApiMethodForModelOb(s);
            TS.api.callImmediately(n, {
              channel: s.id,
              oldest: 283996800,
              count: 1,
              inclusive: 1,
              include_pin_count: !!TS.boot_data.feature_lazy_pins
            }).then(function(t) {
              var a;
              t.data.messages.length < 1 && (a = TS.shared.getActiveModelOb().created), a = t.data.messages[0].ts;
              var s = TS.interop.datetime.toDateObject(a);
              return i(e, s), !0;
            }).catch(function() {
              return i(e), TS.warn("couldn’t find messages in this channel :" + s.id);
            });
          }
        },
        startArchiveDatePicker: function(e) {
          var t = TS.shared.getActiveModelOb(),
            a = TS.interop.datetime.toDateObject(t.created),
            i = Date.now(),
            s = i;
          boot_data.calendar_start && (s = TS.interop.datetime.toDateObject(boot_data.calendar_start)), boot_data.calendar_oldest && (a = TS.interop.datetime.toDateObject(boot_data.calendar_oldest)), TS.ui.date_picker.start(e, {
            first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
            hide_on_select: !0,
            select_year: !0,
            date: s,
            min: a,
            max: i,
            locale: {
              days: TS.utility.date.day_names,
              daysShort: TS.utility.date.short_day_names,
              daysMin: TS.utility.date.really_short_day_names,
              months: TS.utility.date.month_names,
              monthsShort: TS.utility.date.short_month_names
            },
            change: function() {
              s = $(this).pickmeup("get_date");
              var e = 1e3 * Date.parse(s),
                a = t.is_mpim ? TS.mpims.getMpimArchivesPath(t) : "/archives/" + t.id;
              window.location = a + "/s" + e;
            }
          });
        },
        startExpirationDatePicker: function(e, t) {
          t = t || {};
          var a, i, n = new Date,
            o = n.getTime();
          t.selected_expiration_ts ? i = new Date(1e3 * t.selected_expiration_ts) : (i = new Date, i.setDate(n.getDate() + s)), i.setHours(0, 0, 0, 0), a = i.getTime();
          var r = {
            first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
            select_year: !1,
            min: o,
            date: a,
            format: "s",
            position: "top",
            flat: !0,
            hide_on_select: !0,
            locale: {
              days: TS.utility.date.day_names,
              daysShort: TS.utility.date.short_day_names,
              daysMin: TS.utility.date.really_short_day_names,
              months: TS.utility.date.month_names,
              monthsShort: TS.utility.date.short_month_names
            }
          };
          t.class_name && (r.class_name = t.class_name), t.onHide && (r.hide = t.onHide), t.onChange && (r.change = function(e) {
            var a = new Date(1e3 * e);
            a.setHours(23, 59, 59, 0);
            var i = Math.floor(a.getTime() / 1e3);
            t.onChange(i);
          }), TS.ui.date_picker.start(e, r);
        },
        getOldestMsgTs: function() {
          if (!$("#channel_actions_toggle").attr("data-oldest-ts")) {
            var e = TS.shared.getActiveModelOb(),
              t = TS.shared.getHistoryApiMethodForModelOb(e);
            TS.api.callImmediately(t, {
              channel: e.id,
              oldest: 283996800,
              count: 1,
              inclusive: 1,
              include_pin_count: !!TS.boot_data.feature_lazy_pins
            }).then(function(e) {
              var t;
              if (!(e.data.messages.length < 1)) return t = e.data.messages[0].ts, $("#channel_actions_toggle").attr("data-oldest-ts", t), !0;
            }).catch(function() {
              return TS.warn("couldn’t find messages in this channel :" + e.id);
            });
          }
        }
      });
      var e = function(e) {
          var a = TS.shared.getActiveModelOb();
          if (a.is_channel && !a.is_member) a.id == TS.client.archives.current_model_ob.id && t(a, e);
          else {
            if (a.msgs.length < 1) return void TS.warn("no messages in this channel: " + a.id);
            var i = Date.parse(e) / 1e3,
              s = a.msgs[a.msgs.length - 1];
            if (parseFloat(s.ts) < i) {
              TS.model.archive_view_is_showing && TS.client.archives.cancel();
              var n = TS.utility.msgs.getDisplayedMsgAfterTS(i, a.msgs);
              n ? TS.client.ui.scrollMsgsSoMsgIsInView(n.ts, !1, !0) : !n && a.msgs.length > 0 && (n = TS.utility.msgs.getDisplayedMsgBeforeTS(i, a.msgs), TS.client.ui.scrollMsgsSoMsgIsInView(n.ts, !1, !0));
            } else t(a, e);
          }
        },
        t = function(e, t) {
          var i = Date.parse(t) / 1e3;
          i = i.toString() + ".000000", a(e, i).then(function(t) {
            return TS.utility.msgs.getMsg(t, e.msgs) ? (TS.model.archive_view_is_showing && TS.client.archives.cancel(), TS.client.ui.scrollMsgsSoMsgIsInView(t, !1, !0)) : TS.client.archives.start(t), !0;
          }).catch(function() {
            return TS.warn("couldn’t find message for date: " + i + " in channel: " + e.id);
          });
        },
        a = function e(t, a, i) {
          if ((i = i || 1) > 100) {
            if (t._archive_msgs && t._archive_msgs.length > 0) return t._archive_msgs[0];
            throw new Error("no_visible_message_found");
          }
          var s = TS.shared.getHistoryApiMethodForModelOb(t);
          return new Promise(function(e, n) {
            var o = {
              channel: t.id,
              oldest: a,
              count: i,
              inclusive: 1,
              ignore_replies: !0,
              include_pin_count: !!TS.boot_data.feature_lazy_pins
            };
            TS.api.call(s, o).then(function(a) {
              if (a && a.data && 0 !== a.data.messages.length) {
                for (var i = a.data.messages, s = i.length - 1; s >= 0; s -= 1) {
                  var o = i[s];
                  TS.utility.msgs.isMsgReply(o) || "pinned_item" === o.subtype || e(o.ts);
                }
                n(new Error("no_visible_message_found"));
              } else t._archive_msgs && t._archive_msgs.length > 0 ? e(t._archive_msgs[0]) : n(new Error("api_call_failed"));
            });
          }).then(function(e) {
            return e;
          }, function(s) {
            if ("no_visible_message_found" === s.message) return e(t, a, 10 * i);
            throw s;
          });
        },
        i = function(t, a) {
          a || (a = TS.interop.datetime.toDateObject(TS.shared.getActiveModelOb().created));
          var i = Date.now(),
            s = i;
          TS.ui.date_picker.start(t, {
            first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
            hide_on_select: !0,
            select_year: !1,
            flat: !0,
            date: s,
            min: a,
            max: i,
            locale: {
              days: TS.utility.date.day_names,
              daysShort: TS.utility.date.short_day_names,
              daysMin: TS.utility.date.really_short_day_names,
              months: TS.utility.date.month_names,
              monthsShort: TS.utility.date.short_month_names
            },
            change: function() {
              s = $(this).pickmeup("get_date"), e(s), TS.menu.$menu.css("opacity", 0), TS.menu.end();
            },
            hide: function() {
              window.setTimeout(function() {
                $(this).pickmeup && $(this).pickmeup("destroy");
              }.bind(this), 0);
            }
          }), t.pickmeup("show");
        },
        s = 7;
    }();
  }
}, [2339]);
