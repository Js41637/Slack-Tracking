webpackJsonp([312], {
  3108: function(t, o) {
    ! function() {
      "use strict";
      TS.registerModule("web", {
        before_login_sig: new signals.Signal,
        login_sig: new signals.Signal,
        ds_login_sig: new signals.Signal,
        no_login_complete_sig: new signals.Signal,
        onStart: function() {
          TS.prefs.messages_theme_changed_sig.add(TS.ui.setThemeClasses, TS), TS.web.autoToggleSection(), $('[data-toggle="tooltip"]').tooltip({
            animation: !0
          }), $("body").bind("mousewheel.ignore_while_monkeyscrolling", function(t) {
            var o = t.originalEvent;
            if (o) {
              var e = $(t.target).closest(".monkey_scroller");
              if (e.length) {
                var n = o.wheelDeltaY;
                null === n && o.detail && o.axis == o.VERTICAL_AXIS ? n = o.detail : null === n && (n = o.wheelDelta), n && (e[0].scrollTop === e[0].scrollHeight - e.height() && n < 0 || 0 === e[0].scrollTop && n > 0) && t.preventDefault();
              }
            }
          }), TS.metrics && TS.boot_data && TS.boot_data.page_timing_label && TS.metrics.measure(TS.boot_data.page_timing_label + "_load", "start_nav"), TS.boot_data && !TS.boot_data.api_active_migration_error_response_type && (TS.boot_data.api_active_migration_error_response_type = "show_dialog"), $('[data-qa="upgrade_std_btn"]').click(function() {
            TS.clog.track("GROWTH_PRICING", {
              contexts: {
                ui_context: {
                  step: "admin_billing",
                  action: "click",
                  ui_element: "checkout_standard_button"
                }
              }
            });
          }), $('[data-qa="upgrade_btn"]').click(function() {
            TS.clog.track("GROWTH_PRICING", {
              contexts: {
                ui_context: {
                  step: "admin_billing",
                  action: "click",
                  ui_element: "checkout_plus_button"
                }
              }
            });
          }), $('[data-qa="learn_more_btn"]').click(function() {
            TS.clog.track("GROWTH_PRICING", {
              contexts: {
                ui_context: {
                  step: "admin_billing",
                  action: "click",
                  ui_element: "pricing_plus_button"
                }
              }
            });
          });
        },
        gogogo: function() {
          $("html").bind("mousedown", function() {
            TS.model.ui.is_mouse_down = !0;
          }), $("html").bind("dragend", function() {
            TS.model.ui.is_mouse_down = !1;
          }), $("html").bind("mouseup", function() {
            TS.model.ui.is_mouse_down = !1;
          });
        },
        toggleSection: function(t, o) {
          var e = $("#" + t),
            n = e.css("border-bottom");
          e.css("border-bottom", "1px solid transparent"), e.find(".accordion_subsection").slideToggle(100, function() {
            e.css("border-bottom", n), e.hasClass("plastic_row") && !e.hasClass("open") && e.removeAttr("style");
          }), e.toggleClass("open"), e.find("textarea").trigger("autosize-resize");
          var i = e.hasClass("open"),
            a = e.find(".accordion_expand");
          i ? (a.text(TS.i18n.t("close", "web")()), e.find(".ladda-button").each(function() {
            Ladda.bind($(this)[0]);
          })) : a.text(TS.i18n.t("expand", "web")()), o || history.pushState(null, null, "#" + t.replace("change_", ""));
        },
        openSection: function(t) {
          $("#" + t).hasClass("open") || TS.web.toggleSection(t);
        },
        closeSection: function(t) {
          $("#" + t).hasClass("open") && TS.web.toggleSection(t);
        },
        autoToggleSection: function() {
          var t = _.escape(window.location.hash);
          if (t) {
            "#" === t.charAt(0) && (t = t.substring(1));
            var o = $('a[name="' + t + '"][data-accordion]'),
              e = o.data("accordion");
            e && TS.web.toggleSection(e);
          }
        },
        scrollToElWithHeaderOffset: function(t) {
          $(t).scrollintoview({
            px_offset: $("header").height() + 16
          });
        },
        onFirstLoginMS: function() {
          t(), TS.warn(Date.now() - TS.boot_data.start_ms + "ms from first html to login_sig.dispatch()"), TS.web.before_login_sig.dispatch(), TS.web.login_sig.dispatch();
        },
        onEveryLoginMS: function() {},
        apiPaused: function() {},
        apiUnpaused: function() {}
      });
      var t = function() {
        $(".emoji_replace_on_load").each(function() {
          var t = $(this).html();
          t = TS.emoji.graphicReplace(t), $(this).html(t);
        });
      };
    }();
  }
}, [3108]);
