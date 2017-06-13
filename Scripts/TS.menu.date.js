webpackJsonp([249], {
  2337: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("menu.date", {
        onStart: function() {},
        startWithExpirationPresets: function(i) {
          e = i.date_picker_args, t = i.onSelect, a(), n(i);
        }
      });
      var e, t, n = function(e) {
          var t = !!_.isUndefined(e.attach_to_target) || e.attach_to_target;
          if (TS.menu.start(e.event, !1, {
              attach_to_target_at_full_width: t,
              onClose: e.onClose
            }), t) {
            var n = -1 * TS.menu.$menu.outerHeight() - 5,
              a = e.$target.position().left - TS.menu.$menu.outerWidth() / 2 + e.$target.outerWidth() / 2;
            TS.menu.$menu.css({
              top: Math.floor(n),
              left: Math.floor(a)
            });
          } else {
            var i = e.$target.outerWidth() / 2 * -1,
              r = e.$target.outerHeight() + 5;
            TS.menu.positionAt(e.$target, Math.floor(i), Math.floor(r));
          }
        },
        a = function() {
          TS.menu.buildIfNeeded(), TS.menu.clean(), TS.menu.$menu.addClass("expiration_date_picker"), TS.menu.$menu_header.addClass("hidden").empty(), TS.menu.$menu_items.html(TS.templates.menu_expiration_date_items()), TS.menu.$menu_items.on("click.menu", "li", o), TS.menu.$menu_footer.removeClass("hidden").html(TS.templates.menu_expiration_context());
        },
        i = function() {
          TS.menu.buildIfNeeded(), TS.menu.clean(), TS.menu.$menu.addClass("date_picker expiration_date_picker"), TS.menu.$menu_header.addClass("hidden").empty(), TS.menu.$menu_footer.addClass("hidden").empty(), TS.menu.$menu_items.html(TS.templates.menu_expiration_date_picker()), TS.menu.$menu_items.on("click.menu", "li#date_picker_back_item", function(e) {
            a(), e.stopPropagation();
          });
          var t = {
            onChange: r,
            onHide: u
          };
          _.assign(t, e);
          var n = TS.menu.$menu.find("#date_picker_container");
          TS.ui.date_picker.startExpirationDatePicker(n, t);
        },
        r = function(e) {
          if ("string" == typeof e && (e = parseInt(e, 10)), isNaN(e)) return void TS.warn("date_ts could not be parsed as a number.");
          t && t(e), TS.menu.end();
        },
        o = function(e) {
          if (!TS.menu.isRedundantClick(e)) {
            var t = $(this).attr("data-expiration-option");
            if (!t) return void TS.warn("Selected an invalid expiration date menu item.");
            var n;
            switch (t) {
              case "none":
                r(0);
                break;
              case "7days":
                n = m(7), r(n);
                break;
              case "30days":
                n = m(30), r(n);
                break;
              case "60days":
                n = m(60), r(n);
                break;
              case "custom":
                i();
            }
            e.stopPropagation();
          }
        },
        u = function() {
          var e = $("#date_picker_container");
          e.pickmeup && _.defer(function() {
            e.pickmeup("destroy");
          });
        },
        m = function(e) {
          if (!_.isNumber(e)) return void TS.error("num_days must be a number.");
          var t = new Date;
          return t.setHours(23, 59, 59, 0), t.setDate(t.getDate() + e), t.getTime() / 1e3;
        };
    }();
  }
}, [2337]);
