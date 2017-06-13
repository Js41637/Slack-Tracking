webpackJsonp([237], {
  2339: function(t, e) {
    ! function() {
      "use strict";
      TS.registerModule("ui.date_picker", {
        onStart: function() {},
        start: function(t, e) {
          t.pickmeup(e);
        },
        startJumpToDatePicker: function(t) {
          var e = $("#channel_actions_toggle").attr("data-oldest-ts");
          if (e) {
            var a = TS.utility.date.toDateObject(e);
            i(t, a);
          } else {
            var s = TS.shared.getActiveModelOb(),
              n = TS.shared.getHistoryApiMethodForModelOb(s);
            TS.api.callImmediately(n, {
              channel: s.id,
              oldest: 283996800,
              count: 1,
              inclusive: 1,
              include_pin_count: !!TS.boot_data.feature_lazy_pins
            }).then(function(e) {
              var a;
              e.data.messages.length < 1 && (a = TS.shared.getActiveModelOb().created), a = e.data.messages[0].ts;
              var s = TS.utility.date.toDateObject(a);
              return i(t, s), !0;
            }).catch(function() {
              return i(t), TS.warn("couldn’t find messages in this channel :" + s.id);
            });
          }
        },
        startArchiveDatePicker: function(t) {
          var e = TS.shared.getActiveModelOb(),
            a = TS.utility.date.toDateObject(e.created),
            i = Date.now(),
            s = i;
          boot_data.calendar_start && (s = TS.utility.date.toDateObject(boot_data.calendar_start)), boot_data.calendar_oldest && (a = TS.utility.date.toDateObject(boot_data.calendar_oldest)), TS.ui.date_picker.start(t, {
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
              var t = 1e3 * Date.parse(s),
                a = e.is_mpim ? TS.mpims.getMpimArchivesPath(e) : "/archives/" + e.id;
              window.location = a + "/s" + t;
            }
          });
        },
        startExpirationDatePicker: function(t, e) {
          e = e || {};
          var a, i, n = new Date,
            o = n.getTime();
          e.selected_expiration_ts ? i = new Date(1e3 * e.selected_expiration_ts) : (i = new Date, i.setDate(n.getDate() + s)), i.setHours(0, 0, 0, 0), a = i.getTime();
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
          e.class_name && (r.class_name = e.class_name), e.onHide && (r.hide = e.onHide), e.onChange && (r.change = function(t) {
            var a = new Date(1e3 * t);
            a.setHours(23, 59, 59, 0);
            var i = Math.floor(a.getTime() / 1e3);
            e.onChange(i);
          }), TS.ui.date_picker.start(t, r);
        },
        getOldestMsgTs: function() {
          if (!$("#channel_actions_toggle").attr("data-oldest-ts")) {
            var t = TS.shared.getActiveModelOb(),
              e = TS.shared.getHistoryApiMethodForModelOb(t);
            TS.api.callImmediately(e, {
              channel: t.id,
              oldest: 283996800,
              count: 1,
              inclusive: 1,
              include_pin_count: !!TS.boot_data.feature_lazy_pins
            }).then(function(t) {
              var e;
              if (!(t.data.messages.length < 1)) return e = t.data.messages[0].ts, $("#channel_actions_toggle").attr("data-oldest-ts", e), !0;
            }).catch(function() {
              return TS.warn("couldn’t find messages in this channel :" + t.id);
            });
          }
        }
      });
      var t = function(t) {
          var a = TS.shared.getActiveModelOb();
          if (a.is_channel && !a.is_member) a.id == TS.client.archives.current_model_ob.id && e(a, t);
          else {
            if (a.msgs.length < 1) return void TS.warn("no messages in this channel: " + a.id);
            var i = Date.parse(t) / 1e3,
              s = a.msgs[a.msgs.length - 1];
            if (parseFloat(s.ts) < i) {
              TS.model.archive_view_is_showing && TS.client.archives.cancel();
              var n = TS.utility.msgs.getDisplayedMsgAfterTS(i, a.msgs);
              n ? TS.client.ui.scrollMsgsSoMsgIsInView(n.ts, !1, !0) : !n && a.msgs.length > 0 && (n = TS.utility.msgs.getDisplayedMsgBeforeTS(i, a.msgs), TS.client.ui.scrollMsgsSoMsgIsInView(n.ts, !1, !0));
            } else e(a, t);
          }
        },
        e = function(t, e) {
          var i = Date.parse(e) / 1e3;
          i = i.toString() + ".000000", a(t, i).then(function(e) {
            return TS.utility.msgs.getMsg(e, t.msgs) ? (TS.model.archive_view_is_showing && TS.client.archives.cancel(), TS.client.ui.scrollMsgsSoMsgIsInView(e, !1, !0)) : TS.client.archives.start(e), !0;
          }).catch(function() {
            return TS.warn("couldn’t find message for date: " + i + " in channel: " + t.id);
          });
        },
        a = function t(e, a, i) {
          if ((i = i || 1) > 100) {
            if (e._archive_msgs && e._archive_msgs.length > 0) return e._archive_msgs[0];
            throw new Error("no_visible_message_found");
          }
          var s = TS.shared.getHistoryApiMethodForModelOb(e);
          return new Promise(function(t, n) {
            var o = {
              channel: e.id,
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
                  TS.utility.msgs.isMsgReply(o) || "pinned_item" === o.subtype || t(o.ts);
                }
                n(new Error("no_visible_message_found"));
              } else e._archive_msgs && e._archive_msgs.length > 0 ? t(e._archive_msgs[0]) : n(new Error("api_call_failed"));
            });
          }).then(function(t) {
            return t;
          }, function(s) {
            if ("no_visible_message_found" === s.message) return t(e, a, 10 * i);
            throw s;
          });
        },
        i = function(e, a) {
          a || (a = TS.utility.date.toDateObject(TS.shared.getActiveModelOb().created));
          var i = Date.now(),
            s = i;
          TS.ui.date_picker.start(e, {
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
              s = $(this).pickmeup("get_date"), t(s), TS.menu.$menu.css("opacity", 0), TS.menu.end();
            },
            hide: function() {
              window.setTimeout(function() {
                $(this).pickmeup && $(this).pickmeup("destroy");
              }.bind(this), 0);
            }
          }), e.pickmeup("show");
        },
        s = 7;
    }();
  }
}, [2339]);
