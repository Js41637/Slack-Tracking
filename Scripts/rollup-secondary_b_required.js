webpackJsonp([13], {
  1464: function(e, t, n) {
    n(2454), n(2517), n(2646), n(2458), n(2549), n(2428), n(2463), n(2500), n(2421), n(2465), n(2469), n(2521), e.exports = n(2370);
  },
  2370: function(e, t) {
    ! function() {
      "use strict";

      function e() {
        return new Promise(function(e, n) {
          t = {
            base_url: (window.cdn_url || "") + "/beacons/boomerang1/",
            timeout: 3e4,
            nruns: 5,
            latency_runs: 10,
            results: [],
            latencies: [],
            latency: null,
            runs_left: 0,
            aborted: !1,
            complete: !1
          }, t.images = [{
            name: "image-0.png",
            size: 11483,
            timeout: 1400
          }, {
            name: "image-1.png",
            size: 40658,
            timeout: 1200
          }, {
            name: "image-2.png",
            size: 164897,
            timeout: 1300
          }, {
            name: "image-3.png",
            size: 381756,
            timeout: 1500
          }, {
            name: "image-4.png",
            size: 1234664,
            timeout: 1200
          }, {
            name: "image-5.png",
            size: 4509613,
            timeout: 1200
          }, {
            name: "image-6.png",
            size: 9084559,
            timeout: 1200
          }], t.images.end = t.images.length, t.images.start = 0, t.images.l = {
            name: "image-l.gif",
            size: 35,
            timeout: 1e3
          }, t.images.start = 0, t.runs_left = t.nruns, t.latency_runs = 10, t.results = [], t.latencies = [], t.latency = null, t.complete = !1, t.aborted = !1, t.ncmp = function(e, t) {
            return e - t;
          }, t.iqr = function(e) {
            var t, n = e.length - 1,
              i = (e[Math.floor(.25 * n)] + e[Math.ceil(.25 * n)]) / 2,
              o = (e[Math.floor(.75 * n)] + e[Math.ceil(.75 * n)]) / 2,
              l = [],
              a = 1.5 * (o - i);
            for (n += 1, t = 0; t < n && e[t] < o + a; t += 1) e[t] > i - a && l.push(e[t]);
            return l;
          }, t.calcLatency = function() {
            var e, t, n, i, o, l, a, r = 0,
              s = 0;
            for (a = this.iqr(this.latencies.sort(this.ncmp)), t = a.length, e = 1; e < t; e += 1) r += a[e], s += a[e] * a[e];
            return t -= 1, n = Math.round(r / t), o = Math.sqrt(s / t - r * r / (t * t)), l = (1.96 * o / Math.sqrt(t)).toFixed(2), o = o.toFixed(2), t = a.length - 1, i = Math.round((a[Math.floor(t / 2)] + a[Math.ceil(t / 2)]) / 2), {
              mean: n,
              median: i,
              stddev: o,
              stderr: l
            };
          }, t.calcBW = function() {
            var e, t, n, i, o, l, a, r, s, d, c, u, _, m, g = 0,
              f = [],
              h = [],
              p = 0,
              S = 0,
              T = 0,
              v = 0;
            for (e = 0; e < this.nruns; e += 1)
              if (this.results[e] && this.results[e].r)
                for (n = this.results[e].r, u = 0, t = n.length - 1; t >= 0 && u < 3 && void 0 !== n[t]; t -= 1) null !== n[t].t && (g += 1, u += 1, _ = 1e3 * this.images[t].size / n[t].t, f.push(_), m = 1e3 * this.images[t].size / (n[t].t - this.latency.mean), h.push(m));
            for (f.length > 3 ? (f = this.iqr(f.sort(this.ncmp)), h = this.iqr(h.sort(this.ncmp))) : (f = f.sort(this.ncmp), h = h.sort(this.ncmp)), g = Math.max(f.length, h.length), e = 0; e < g; e += 1) e < f.length && (p += f[e], S += Math.pow(f[e], 2)), e < h.length && (T += h[e], v += Math.pow(h[e], 2));
            return g = f.length, i = Math.round(p / g), o = Math.sqrt(S / g - Math.pow(p / g, 2)), l = Math.round(1.96 * o / Math.sqrt(g)), o = Math.round(o), g = f.length - 1, a = Math.round((f[Math.floor(g / 2)] + f[Math.ceil(g / 2)]) / 2), g = h.length, r = Math.round(T / g), s = Math.sqrt(v / g - Math.pow(T / g, 2)), d = (1.96 * s / Math.sqrt(g)).toFixed(2), s = s.toFixed(2), g = h.length - 1, c = Math.round((h[Math.floor(g / 2)] + h[Math.ceil(g / 2)]) / 2), {
              mean: i,
              stddev: o,
              stderr: l,
              median: a,
              mean_corrected: r,
              stddev_corrected: s,
              stderr_corrected: d,
              median_corrected: c
            };
          }, t.defer = function(e) {
            var t = this;
            return setTimeout(function() {
              e.call(t), t = null;
            }, 10);
          }, t.loadImg = function(e, t, n) {
            var i = this.base_url + this.images[e].name + "?t=" + Date.now() + Math.random(),
              o = 0,
              l = 0,
              a = new Image,
              r = this;
            a.onload = function() {
              a.onerror = null, a.onload = null, a = null, clearTimeout(o), n && n.call(r, e, l, t, !0), n = null, r = null;
            }, a.onerror = function() {
              a.onerror = null, a.onload = null, a = null, clearTimeout(o), n && n.call(r, e, l, t, !1), n = null, r = null;
            }, o = setTimeout(function() {
              n && n.call(r, e, l, t, null);
            }, this.images[e].timeout + Math.min(400, this.latency ? this.latency.mean : 400)), l = Date.now(), a.src = i;
          }, t.latLoaded = function(e, t, n, i) {
            if (n === this.latency_runs + 1) {
              if (null !== i) {
                var o = Date.now() - t;
                this.latencies.push(o);
              }
              0 === this.latency_runs && (this.latency = this.calcLatency()), this.defer(this.iterate);
            }
          }, t.imgLoaded = function(e, t, n, i) {
            if (n === this.runs_left + 1 && !this.results[this.nruns - n].r[e]) {
              if (null === i) return void(this.results[this.nruns - n].r[e + 1] = {
                t: null,
                state: null,
                run: n
              });
              var o = {
                start: t,
                end: Date.now(),
                t: null,
                state: i,
                run: n
              };
              i && (o.t = o.end - o.start), this.results[this.nruns - n].r[e] = o, e >= this.images.end - 1 || void 0 !== this.results[this.nruns - n].r[e + 1] ? (n === this.nruns && (this.images.start = e), this.defer(this.iterate)) : this.loadImg(e + 1, n, this.imgLoaded);
            }
          }, t.iterate = function() {
            if (this.aborted) return !1;
            this.runs_left ? this.latency_runs ? (this.loadImg("l", this.latency_runs, this.latLoaded), this.latency_runs -= 1) : (this.results.push({
              r: []
            }), this.loadImg(this.images.start, this.runs_left, this.imgLoaded), this.runs_left -= 1) : this.finish();
          }, t.finish = function() {
            this.latency || (this.latency = this.calcLatency());
            var i = this.calcBW(),
              o = {
                bw: i.median_corrected,
                bw_err: parseFloat(i.stderr_corrected, 10),
                lat: this.latency.mean,
                lat_err: parseFloat(this.latency.stderr, 10)
              };
            if (isNaN(o.bw) || isNaN(o.lat)) return o.kbps = 0, o.mbps = 0, void n(new Error("bandwidth test failed"));
            o.kbps = Math.round(8 * o.bw / 1024), o.mbps = Math.round(10 * o.kbps / 1024) / 10, t.timer && window.clearTimeout(t.timer), e(o);
          }, t.timer = setTimeout(function() {
            t.aborted = !0, t.finish();
          }, t.timeout), t.defer(t.iterate);
        });
      }
      TS.registerModule("bandwidth", {
        onStart: function() {},
        promiseToCheckBandwidth: function() {
          return n || (n = e(), n.catch(function() {
            n = null;
          }), n);
        }
      });
      var t, n;
    }();
  },
  2421: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("clipboard", {
        canWriteText: function() {
          return e._canWriteText();
        },
        writeText: function(t) {
          e._writeText(t);
        },
        canWriteHTML: function() {
          return e._canWriteHTML();
        },
        writeHTML: function(t) {
          e._writeHTML(t);
        },
        writeTextFromEvent: function(e, t) {
          if (e) {
            var n, i = [],
              o = _.keys(t);
            if (o.length) {
              TS.info("TS.clipboard.writeTextFromEvent: copying to [" + o + "]");
              try {
                e = e.originalEvent || e;
                var l = e.clipboardData || window.clipboardData;
                _.each(t, function(e, t) {
                  try {
                    l.setData(t, e);
                    var n = l.getData(t) || "";
                    e === n && i.push(t), TS.info("TS.clipboard.writeTextFromEvent: copied " + n.length + ' chars to "' + t + '"');
                  } catch (e) {
                    TS.warn('TS.clipboard.writeTextFromEvent: error copying to "' + t + '" (' + e + ")");
                  }
                });
              } catch (e) {
                n = e;
              }
              n || i.length || (n = "failed to write to clipboard"), n ? TS.error("TS.clipboard.writeTextFromEvent: " + n) : (e.preventDefault(), "cut" === e.type && TS.utility.isFocusOnInput() && (TS.utility.contenteditable.supportsTexty() ? TS.utility.contenteditable.deleteSelection(document.activeElement) : window.getSelection().deleteFromDocument())), TS.clog.track("CLIPBOARD_WRITE", {
                action: e.type,
                err: n,
                types: i.join(",")
              });
            }
          }
        },
        test: function() {
          return {
            detectImplementation: n
          };
        }
      });
      var e, t = !1,
        n = function() {
          l._canWriteText() ? e = l : (i(), e = o);
        },
        i = function() {
          t = !1, bowser && (bowser.chrome && bowser.version >= 42 && (t = !0), bowser.firefox && bowser.version >= 41 && (t = !0), bowser.msie && bowser.version >= 9 && (t = !0), bowser.opera && bowser.version >= 29 && (t = !0)), $(window).one("click.check_clipboard_support", function() {
            t = document.queryCommandSupported("copy");
          });
        },
        o = {
          _canWriteText: function() {
            return t;
          },
          _writeText: function(e) {
            var t = document.createElement("textarea");
            t.appendChild(document.createTextNode(e)), document.body.appendChild(t), this._writeNode(t), document.body.removeChild(t);
          },
          _canWriteHTML: function() {
            return t;
          },
          _writeHTML: function(e) {
            var t = $("<p>").html(e);
            $("body").append(t), this._writeNode(t), t.remove();
          },
          _writeNode: function(e) {
            try {
              this._saveSelection(), e.select(), document.execCommand("copy");
            } catch (e) {
              TS.warn("Something bad happened when we tried to copy: " + e);
            } finally {
              this._restoreSelection();
            }
          },
          _saveSelection: function() {
            this._current_ranges = [], this._sel = window.getSelection();
            for (var e = 0; e < this._sel.rangeCount; e += 1) this._current_ranges.push(this._sel.getRangeAt(e));
          },
          _restoreSelection: function() {
            var e = this;
            this._sel.removeAllRanges(), this._current_ranges.forEach(function(t) {
              e._sel.addRange(t);
            });
          }
        },
        l = {
          _canWriteText: function() {
            return window.TSSSB && TSSSB.call("canClipboardWriteString");
          },
          _writeText: function(e) {
            TSSSB.call("clipboardWriteString", e);
          },
          _canWriteHTML: function() {
            return !1;
          },
          _writeHTML: function() {
            return TS.warn("We cannot write HTML in SSB");
          }
        };
      n();
    }();
  },
  2428: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("ds.msg_handlers", {
        onStart: function() {
          TS.ds.on_msg_sig.add(e);
        },
        hello: function(e) {
          if (TS.model.members.forEach(function(e) {
              e.ds_active = !1;
            }), e.active && e.active.length)
            for (var t, n = 0; n < e.active.length; n += 1) {
              if (!(t = TS.members.getMemberById(e.active[n]))) return void TS.error('unknown member: "' + e.active[n] + '"');
              t.ds_active = !0;
            }
        },
        presence_change: function(e) {
          var t = TS.members.getMemberById(e.user);
          return t ? "away" !== e.presence && "active" !== e.presence ? void TS.error('unknown presence: "' + e.presence + '"') : void(t.ds_active && "active" === e.presence || (t.ds_active || "away" !== e.presence) && (t.ds_active = "active" === e.presence, TS.members.ds_presence_changed_sig.dispatch(t))) : void TS.error('unknown member: "' + e.user + '"');
        }
      });
      var e = function(e) {
        if (!e.reply_to && "rocket" !== e.event) return TS.ds.msg_handlers[e.type] ? void TS.ds.msg_handlers[e.type](e) : void TS.error("non handled non rocket event received\n" + JSON.stringify(e, null, "  "));
      };
    }();
  },
  2454: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("generic_dialog", {
        div: null,
        is_showing: !1,
        current_setting: null,
        body_template_html: {},
        Q: [],
        ladda_go: null,
        onKeydown: function(e) {
          var t = TS.generic_dialog.current_setting;
          e.which == TS.utility.keymap.enter ? ("BODY" === TS.utility.getActiveElementProp("NODENAME") || t.enter_always_gos) && t.show_go_button && (TS.generic_dialog.go(), e.preventDefault()) : e.which == TS.utility.keymap.esc && "BODY" === TS.utility.getActiveElementProp("NODENAME") && (t.show_cancel_button ? TS.generic_dialog.cancel() : t.esc_for_ok && TS.generic_dialog.go());
        },
        alert: function(e, t, n) {
          return new Promise(function(i) {
            TS.generic_dialog.start({
              title: t || "",
              body: e,
              show_cancel_button: !1,
              esc_for_ok: !0,
              fullscreen: !1,
              go_button_text: n,
              onEnd: i
            });
          });
        },
        graphics: {
          error: "oops"
        },
        dark: function(e, n, i) {
          return new Promise(function(o) {
            TS.generic_dialog.start({
              type: "dark",
              graphic: i || !1,
              title: n || "",
              body: e,
              show_close_button: !1,
              show_cancel_button: !0,
              cancel_button_text: t,
              fullscreen: !1,
              show_go_button: !1,
              onCancel: o
            });
          });
        },
        start: function(e) {
          if (e.fullscreen) return void TS.ui.fs_modal.start(e);
          if (TS.generic_dialog.is_showing) return void(e.unique && TS.generic_dialog.current_setting.unique == e.unique ? TS.info("redundant generic dialog not Qed: " + e.unique) : TS.generic_dialog.Q.push(e));
          TS.generic_dialog.current_setting = _.defaults({}, e, i);
          var t = TS.generic_dialog.current_setting;
          void 0 === e.show_close_button && (t.show_close_button = t.show_cancel_button), TS.generic_dialog.div || TS.generic_dialog.build();
          var n = TS.generic_dialog.div,
            o = t.body;
          t.body_template && (TS.generic_dialog.body_template_html[t.body_template] ? (o = TS.generic_dialog.body_template_html[t.body_template], t.body && TS.warn("both body and body_template were passed on settings, using body_template"), t.$body && TS.warn("both $body and body_template were passed on settings, using body_template")) : TS.error(t.body_template + " not found in TS.generic_dialog.body_template_html")), t.dialog_class && n.addClass(t.dialog_class);
          var l = TS.templates.generic_dialog({
            title: new Handlebars.SafeString(t.title),
            body: new Handlebars.SafeString(o),
            ladda: t.ladda,
            type: t.type,
            img: t.graphic
          });
          n.empty(), n.html(l), t.$body && n.find(".modal-body").empty().append(t.$body), t.body_cls && n.find(".modal-body").addClass(t.body_cls), n.find(".close").bind("click", function() {
            t.show_cancel_button ? TS.generic_dialog.cancel() : t.esc_for_ok && TS.generic_dialog.go();
          }), n.find(".dialog_go").click(TS.generic_dialog.go), t.ladda ? n.find(".dialog_go .ladda-label").html(t.go_button_text) : n.find(".dialog_go").html(t.go_button_text), t.show_go_button ? n.find(".dialog_go").removeClass("hidden").addClass(t.go_button_class) : n.find(".dialog_go").addClass("hidden"), n.find(".dialog_secondary_go").click(TS.generic_dialog.secondaryGo), n.find(".dialog_secondary_go").html(t.secondary_go_button_text), t.show_secondary_go_button ? n.find(".dialog_secondary_go").removeClass("hidden").addClass(t.secondary_go_button_class) : n.find(".dialog_secondary_go").addClass("hidden"), n.find(".dialog_cancel").click(TS.generic_dialog.cancel), n.find(".dialog_cancel").html(t.cancel_button_text), n.find(".dialog_cancel").toggleClass("hidden", !t.show_cancel_button), n.find(".close").toggleClass("hidden", !t.show_close_button), t.show_throbber ? n.find(".throbber").removeClass("hidden") : n.find(".throbber").addClass("hidden"), t.title ? n.find(".modal-header").removeClass("hidden") : n.find(".modal-header").addClass("hidden");
          var a = t.show_go_button || t.show_secondary_go_button || t.show_cancel_button,
            r = !a || t.hide_footer;
          n.find(".modal-footer").toggleClass("hidden", !!r), n.modal("show"), t.backdrop_click_to_dismiss && $(".modal-backdrop").click(function() {
            TS.generic_dialog.cancel();
          }), "dark" === t.type && $(".modal-backdrop").addClass("c-modal_backdrop--dark"), t.title || t.force_small ? n.removeClass("small") : n.addClass("small"), document.activeElement && document.activeElement != document.body && document.activeElement.blur(), t.onShow && t.onShow();
        },
        go: function() {
          if (!TS.generic_dialog.is_showing) return void TS.error("not showing?");
          var e = TS.generic_dialog.current_setting,
            t = TS.generic_dialog.div;
          e.onGo ? !1 !== e.onGo() && t.modal("hide") : t.modal("hide");
        },
        secondaryGo: function(e) {
          if (!TS.generic_dialog.is_showing) return void TS.error("not showing?");
          var t = TS.generic_dialog.current_setting,
            n = TS.generic_dialog.div;
          t.onSecondaryGo ? !1 !== t.onSecondaryGo(e) && n.modal("hide") : n.modal("hide");
        },
        cancel: function() {
          var e = TS.generic_dialog.current_setting;
          TS.generic_dialog.div.modal("hide"), e.onCancel && e.onCancel();
        },
        end: function() {
          var e = TS.generic_dialog.current_setting;
          if (TS.model.dialog_is_showing = !1, TS.generic_dialog.is_showing = !1, $(window.document).unbind("keydown", TS.generic_dialog.onKeydown), e.$body && e.$body.detach(), TS.generic_dialog.div.empty(), e.dialog_class && TS.generic_dialog.div.removeClass(e.dialog_class), e.onEnd && e.onEnd(), TS.generic_dialog.ladda_go = null, !TS.generic_dialog.is_showing && TS.generic_dialog.Q.length) {
            var t = TS.generic_dialog.Q.shift();
            TS.generic_dialog.start(t);
          }
        },
        build: function() {
          var e = TS.generic_dialog.current_setting && TS.generic_dialog.current_setting.type || "default";
          $("body").append('<div id="generic_dialog" class="modal c-modal--' + e + ' hide fade" data-keyboard="false" data-backdrop="static"></div>'), TS.generic_dialog.div = $("#generic_dialog");
          var t = TS.generic_dialog.div;
          t.on("hidden", function(e) {
            e.target == this && setTimeout(function() {
              TS.generic_dialog.end(), t.removeAttr("data-qa");
            }, 200);
          }), t.on("show", function(e) {
            e.target == this && (TS.model.dialog_is_showing = !0, TS.generic_dialog.is_showing = !0);
          }), t.on("shown", function(e) {
            e.target == this && setTimeout(function() {
              TS.generic_dialog.is_showing && (t.find(".title_input").select(), $(window.document).bind("keydown", TS.generic_dialog.onKeydown), t.attr("data-qa", "generic_dialog_ready"), TS.generic_dialog.current_setting.ladda && (TS.generic_dialog.ladda_go = Ladda.create(t.find(".dialog_go")[0])));
            }, 100);
          });
        },
        startLadda: function() {
          TS.generic_dialog.ladda_go && TS.generic_dialog.ladda_go.start(), TS.generic_dialog.div.find(".dialog_go").addClass("disabled");
        },
        stopLadda: function() {
          TS.generic_dialog.div.find(".dialog_go").removeClass("disabled"), TS.generic_dialog.ladda_go && TS.generic_dialog.ladda_go.stop();
        },
        showError: function(e) {
          var t = TS.generic_dialog.div.find(".modal-footer .generic_dialog_error");
          t.length || (t = $('<div class="generic_dialog_error yolk_orange top_margin">'), TS.generic_dialog.div.find(".modal-footer").append(t)), t.text(e);
        },
        hideError: function() {
          TS.generic_dialog.div.find(".modal-footer .generic_dialog_error").remove();
        }
      });
      var e = TS.i18n.t("Cancel", "generic_dialog")(),
        t = TS.i18n.t("Close", "generic_dialog")(),
        n = TS.i18n.t("OK", "generic_dialog")(),
        i = {
          type: "default",
          graphic: !1,
          title: "",
          body: "BODY",
          body_template: null,
          body_cls: null,
          $body: null,
          show_go_button: !0,
          show_secondary_go_button: !1,
          show_cancel_button: !0,
          go_button_text: n,
          go_button_class: "",
          secondary_go_button_text: n,
          secondary_go_button_class: "",
          cancel_button_text: e,
          onGo: null,
          onSecondaryGo: null,
          onCancel: null,
          onEnd: null,
          show_throbber: !1,
          esc_for_ok: !1,
          onShow: null,
          force_small: !1,
          enter_always_gos: !1,
          fullscreen: !1,
          dialog_class: null,
          hide_footer: !1,
          backdrop_click_to_dismiss: !1
        };
    }();
  },
  2458: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("help_modal", {
        onStart: function() {
          TS.help.issues_sorted_sig.add(T);
        },
        start: function() {
          g();
        }
      });
      var e, t, n, i, o, l, a, r, s, d = !1,
        c = !1,
        u = null,
        _ = null,
        m = null,
        g = function() {
          var e = {
            body_template_html: TS.templates.help_modal(),
            modal_class: "help_modal fs_modal_footer fs_modal_header",
            show_cancel_button: !1,
            go_button_text: TS.i18n.t("Contact Us", "help")(),
            onShow: b,
            onGo: F,
            onEnd: y,
            clog_name: "HELP_MODAL"
          };
          TS.client && TS.ui.a11y.saveCurrentFocus(), TS.ui.fs_modal.start(e);
        },
        f = function() {
          i = $(TS.templates.help_modal_header()).appendTo(t);
        },
        h = function() {
          i && i.remove(), i = null;
        },
        p = function() {
          o = $(TS.templates.help_modal_footer()).appendTo(n), l = n.find(".help_modal_status");
        },
        S = function() {
          o && o.remove(), o = null, l = null;
        },
        T = function() {
          d && v();
        },
        v = function() {
          for (var e = {
              unread_count: 0,
              open_count: 0,
              all_count: TS.help.issues.length,
              is_unread: !1,
              is_unread_many: !1,
              is_open: !1,
              is_open_many: !1,
              is_old_tickets: !1
            }, t = 0; t < TS.help.issues.length; t += 1) {
            var n = TS.help.issues[t];
            "unread" === n.state ? e.unread_count += 1 : "open" === n.state && (e.open_count += 1);
          }
          e.is_unread = 0 != e.unread_count, e.is_unread_many = e.unread_count > 1, e.is_open = 0 != e.open_count && 0 == e.unread_count, e.is_open_many = e.open_count > 1, e.is_old_tickets = e.all_count && 0 == e.is_unread && 0 == e.is_open, l.html(TS.templates.help_modal_footer_status({
            settings: e
          }));
        },
        b = function() {
          d = !0, t = $("#fs_modal"), n = $("#fs_modal_footer"), e = $("#help_modal_container"), s = e.find("#browse_all"), r = e.find("#help_modal_filter"), a = e.find("#help_modal_list_container"), f(), p(), v(), w(), TS.api.call("helpdesk.get", {
            locale: TS.i18n.locale().toLowerCase()
          }, C);
        },
        y = function() {
          d = !1, c = !1, e = null, t = null, n = null, i = null, o = null, l = null, a = null, r = null, s = null, _ = null, m = null, TS.kb_nav.end(), h(), S(), TS.client && TS.ui.a11y.restorePreviousFocus();
        },
        w = function() {
          t.find(".keyboard_shortcuts").on("click", function(e) {
            e.preventDefault(), TS.ui.fs_modal.close(!0), TS.ui.shortcuts_dialog.start();
          }), r.on("textchange", function() {
            d && c && x();
          }).on("keydown", function(e) {
            e.which === TS.utility.keymap.esc && TS.ui.fs_modal.close();
          }), e.on("click", ".clear_filter_icon", function() {
            r.val("").trigger("textchange").focus();
          }), a.on("click", ".help_modal_article_row", function(e) {
            B($(this), e);
          }), s.on("click", function(e) {
            e.preventDefault();
            var t = k();
            t ? (window.open(t), TS.clog.track("HELP_MODAL_SEARCH", {
              search_terms: t
            })) : window.open($(this).attr("href"));
          });
        },
        F = function() {
          if (!d) return void TS.error("not showing?");
          TS.utility.openAuthenticatedInBrowser("/help/requests/new"), TS.ui.fs_modal.close(!0), TS.clog.track("HELP_MODAL_ACTION", {
            action: "submit_new_request",
            trigger: "click_submit_new_request"
          });
        },
        x = function() {
          var e = k();
          e ? (r.parent().addClass("active"), _ = I(u, e)) : (r.parent().removeClass("active"), _ = M(m)), e && _.length < 7 && (_ = E(_, e)), a.longListView("setItems", _), a.scrollTop(0), TS.utility.rAF(function() {
            TS.ui.utility.updateClosestMonkeyScroller(a);
          }), e ? TS.kb_nav.highlightFirstItem() : TS.kb_nav.clearHighlightedItem();
        },
        k = function() {
          return $.trim(r.val());
        },
        C = function(e, t) {
          if (!e) return void TS.error("failed to fetch help articles");
          u = JSON.parse(t.articles).articles, _ = u, m = A(u), a.empty(), D(), x(), r.focus();
        },
        M = function(e) {
          var t = [];
          return e.length > 0 && (t.push({
            is_divider: !0,
            title: TS.i18n.t("Popular help topics", "help")()
          }), t = t.concat(e)), t;
        },
        E = function(e, t) {
          return e.push({
            is_divider: !1,
            title: TS.i18n.t('Search for "{query}" on the Help Center', "help")({
              query: t
            }),
            url: L(t)
          }), e;
        },
        I = function(e, t) {
          t = TS.utility.regexpEscape(t);
          var n = new RegExp(t, "i"),
            i = -1,
            o = e.filter(function(e, o) {
              return e.title.toLowerCase() === t.toLowerCase() ? (i = o, !1) : e.title.match(n);
            });
          return -1 !== i && o.unshift(e[i]), o;
        },
        D = function() {
          a.longListView({
            items: _,
            approx_item_height: 40,
            approx_divider_height: 35,
            preserve_dom_order: !0,
            makeElement: function(e) {
              var t = $(TS.templates.help_modal_article_row());
              return e.$title = t.find(".article_title"), t;
            },
            makeDivider: function() {
              return $("<div>").addClass("help_modal_divider");
            },
            renderItem: function(e, t, n) {
              n.$title.text(t.title), e.data("url", t.url);
            },
            renderDivider: function(e, t) {
              e.text(t.title);
            },
            calcItemHeight: function(e) {
              return e.outerHeight();
            }
          }), a.monkeyScroll(), c = !0, TS.kb_nav.start(a.find(".list_items"), ".help_modal_article_row", a, {
            use_data_ordering: !0,
            px_offset: 0,
            scrollToStartImmediately: function() {
              a.longListView("scrollToTop", !0);
            },
            scrollToEndImmediately: function() {
              a.longListView("scrollToEnd", !0);
            }
          }), TS.kb_nav.setAllowHighlightWithoutBlurringInput(!0), TS.kb_nav.setSubmitItemHandler(function(e) {
            B($(this), e);
          });
        },
        A = function(e) {
          for (var t = [], n = 0; n < e.length; n += 1) e[n].popular && t.push(e[n]);
          return t.sort(function(e, t) {
            return void 0 == e.order ? 1 : void 0 == t.order ? -1 : e.order - t.order;
          }), t;
        },
        B = function(e) {
          var t = e.data("url"),
            n = k();
          t && (window.open(t), -1 == t.indexOf("hc/search?") && TS.clog.track("HELP_MODAL_ZD_HIT", {
            zd_article_url: t
          }), n && TS.clog.track("HELP_MODAL_SEARCH", {
            search_terms: n
          }));
        },
        L = function(e) {
          return "https://get.slack.help/hc/" + TS.i18n.zdLocale() + "/search?utf8=✓&commit=Search&query=" + e;
        };
    }();
  },
  2463: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("inline_audios", {
        no_scrolling: !1,
        expand_sig: new signals.Signal,
        collapse_sig: new signals.Signal,
        onStart: function() {},
        shouldExpand: function(e, t) {
          return !!TS.model.expandable_state["aud_" + e + _.escape(t.src)] || !1 !== TS.model.expandable_state["aud_" + e + _.escape(t.src)] && (t.internal_file_id ? TS.model.prefs.expand_internal_inline_imgs : TS.model.prefs.expand_inline_imgs);
        },
        expandAllInCurrent: function() {
          var e = $(".msg_inline_media_toggler[data-media-type=audio]:not(.expanded)");
          e.length && (TS.inline_audios.no_scrolling = !0, e.trigger("click"), TS.inline_audios.no_scrolling = !1, TS.client && TS.client.ui.instaScrollMsgsToBottom(!1));
        },
        collapseAllInCurrent: function() {
          $(".msg_inline_media_toggler[data-media-type=audio].expanded").trigger("click");
        },
        expand: function(e, t) {
          TS.model.expandable_state["aud_" + e + _.escape(t)] = !0, TS.storage.storeExpandableState(TS.model.expandable_state);
          var n = "#" + TS.utility.makeSafeForDomId(e),
            i = $(n);
          if (i.length) {
            var o = TS.client && TS.client.ui.areMsgsScrolledToBottom(),
              l = function() {
                return $(this).data("real-src") == t;
              },
              a = TS.boot_data.feature_attachments_inline ? i.find(".inline_attachment").filter(l) : null;
            a && a.length || (a = i.find(".msg_inline_audio_holder").filter(l)), a.removeClass("hidden"), i.find(".msg_inline_media_toggler[data-media-type=audio]:not(.expanded)").filter(l).addClass("expanded"), TS.client && TS.client.ui.checkInlineImgsAndIframesEverywhere(), a.css("opacity", 0).stop().animate({
              opacity: 1
            }, 300), TS.inline_audios.no_scrolling || (TS.client && o ? (TS.client.ui.instaScrollMsgsToBottom(!1), i.children().first().scrollintoview({
              duration: 0,
              offset: "top",
              px_offset: 10,
              direction: "y"
            })) : i.find(".msg_inline_audio").last().scrollintoview({
              duration: 200,
              offset: "bottom",
              px_offset: -10,
              direction: "y"
            })), TS.inline_audios.expand_sig.dispatch(e), TS.client && TS.client.ui.checkInlineImgsAndIframesEverywhere();
          }
        },
        collapse: function(e, t) {
          TS.model.expandable_state["aud_" + e + _.escape(t)] = !1, TS.storage.storeExpandableState(TS.model.expandable_state);
          var n = "#" + TS.utility.makeSafeForDomId(e),
            i = $(n);
          if (i.length) {
            var o = function() {
                return $(this).data("real-src") == t;
              },
              l = TS.boot_data.feature_attachments_inline ? i.find(".inline_attachment").filter(o) : null;
            l && l.length || (l = i.find(".msg_inline_audio_holder").filter(o)), l.css("visibility", "hidden"), i.find(".msg_inline_media_toggler[data-media-type=audio].expanded").filter(o).removeClass("expanded"), l.find(".msg_inline_audio_iframe_div").html(""), TS.inline_audios.collapse_sig.dispatch(e), setTimeout(function() {
              l.addClass("hidden"), l.css("visibility", "visible");
            }, 200);
          }
        },
        checkForInlineAudioClick: function(e) {
          if (e.target) {
            var t, n = $(e.target);
            if (t = n.closest(".message").attr("id")) {
              var i = n.closest(".msg_inline_media_toggler[data-media-type=audio]");
              if (i.length) {
                e.preventDefault();
                var o = i.data("real-src");
                return void(i.hasClass("expanded") ? TS.inline_audios.collapse(t, o) : TS.inline_audios.expand(t, o));
              }
              n.closest(".inline_audio_play_link").length && e.preventDefault();
            }
          }
        },
        makeInternalInlineAudio: function(e, t) {
          t.audio_html && (t.safe_audio_html = t.audio_html, TS.client && !TS.boot_data.feature_no_placeholders_in_messages && (t.safe_audio_html = TS.utility.getPlaceholderHTMLFromIframe(t.safe_audio_html)), t.safe_audio_html = TS.utility.setCssFromHeightAndWidthAttrs(t.safe_audio_html), TS.model.inline_audios[e] = {
            src: _.escape(t.audio_url || t.audio_html),
            attachment: t
          });
        }
      });
    }();
  },
  2465: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("inline_imgs", {
        no_scrolling: !1,
        expand_sig: new signals.Signal,
        collapse_sig: new signals.Signal,
        onStart: function() {},
        shouldExpand: function(e, t, n) {
          if (!t || !t.src) return !1;
          if (TS.model.expandable_state["img_" + e + t.src]) return !0;
          if (!1 === TS.model.expandable_state["img_" + e + t.src]) return !1;
          if (!0 === t.should_expand) return !0;
          if (!t.internal_file_id) {
            if (TS.model.prefs.obey_inline_img_limit && t.bytes > TS.model.inline_img_byte_limit) return !1;
            if (t.width && t.height && t.width * t.height > TS.model.inline_img_pixel_limit) return !1;
          }
          if (t.internal_file_id) {
            var i = TS.inline_file_previews.expandableState(e, t.internal_file_id);
            return "boolean" == typeof i ? i : TS.model.prefs.expand_internal_inline_imgs;
          }
          if (n && n.is_giphy_shuffle && !TS.model.prefs.expand_inline_imgs) {
            var o = _.pickBy(TS.model.expandable_state, function(t, n) {
              return _.startsWith(n, "img_" + e);
            });
            if (o) return _.values(o)[0];
          }
          return TS.model.prefs.expand_inline_imgs;
        },
        expandAllInCurrent: function() {
          TS.inline_imgs.no_scrolling = !0, $(".msg_inline_img_expander").trigger("click"), $(".msg_inline_img_toggler.collapsed").trigger("click"), TS.inline_imgs.no_scrolling = !1, TS.client && TS.client.ui.instaScrollMsgsToBottom(!1);
        },
        collapseAllInCurrent: function() {
          $(".msg_inline_img_collapser").trigger("click"), $(".msg_inline_img_toggler.expanded").trigger("click");
        },
        expand: function(e, t) {
          TS.model.expandable_state["img_" + e + t] = !0, TS.storage.storeExpandableState(TS.model.expandable_state);
          var n = "#" + TS.utility.makeSafeForDomId(e),
            i = $(n);
          if (i.length) {
            var o = TS.client && TS.client.ui.areMsgsScrolledToBottom(),
              l = function() {
                return $(this).data("real-src") == t;
              },
              a = TS.boot_data.feature_attachments_inline ? i.find(".inline_attachment").filter(l) : null;
            a && a.length || (a = i.find(".msg_inline_img_holder").filter(l)), a.removeClass("hidden"), i.find(".msg_inline_img_expander").filter(l).addClass("hidden"), i.find(".msg_inline_img_collapser").filter(l).removeClass("hidden"), i.find(".msg_inline_img_toggler").removeClass("collapsed").addClass("expanded"), i.find(".too_large_for_auto_expand").addClass("hidden"), i.find(".inline_img_bytes").removeClass("hidden"), TS.client && TS.client.ui.checkInlineImgsAndIframesEverywhere(), a.css("opacity", 0).stop().animate({
              opacity: 1
            }, 300), TS.inline_imgs.no_scrolling || (TS.client && o ? (TS.client.ui.instaScrollMsgsToBottom(!1), a.scrollintoview({
              duration: 0,
              offset: "top",
              px_offset: 10,
              direction: "y"
            })) : a.scrollintoview({
              duration: 200,
              offset: "bottom",
              px_offset: -10,
              direction: "y"
            })), TS.inline_imgs.expand_sig.dispatch(e), TS.client && TS.client.ui.checkInlineImgsAndIframesEverywhere();
          }
        },
        collapse: function(e, t) {
          TS.model.expandable_state["img_" + e + t] = !1, TS.storage.storeExpandableState(TS.model.expandable_state);
          var n = "#" + TS.utility.makeSafeForDomId(e),
            i = $(n);
          if (i.length) {
            var o = function() {
                return $(this).data("real-src") == t;
              },
              l = TS.boot_data.feature_attachments_inline ? i.find(".inline_attachment").filter(o) : null;
            l && l.length || (l = i.find(".msg_inline_img_holder").filter(o)), i.find(".msg_inline_img_expander").filter(o).removeClass("hidden"), i.find(".msg_inline_img_collapser").filter(o).addClass("hidden"), i.find(".msg_inline_img_toggler").removeClass("expanded").addClass("collapsed"), TS.inline_imgs.collapse_sig.dispatch(e), l.addClass("hidden");
          }
        },
        checkForInlineImgClick: function(e, t) {
          if (e.target) {
            var n = $(e.target),
              i = n.closest(".message"),
              o = i.attr("id");
            if (t && (o = TS.templates.makeMSRDomId(t)), o) {
              var l = n.closest(".too_large_but_expand_anyway");
              l.length && (e.preventDefault(), TS.inline_imgs.expand(o, l.data("real-src")));
              var a = n.closest(".msg_inline_img_toggler");
              if (a.length) {
                e.preventDefault();
                var r = a.next("*[data-real-src]").data("real-src");
                return void(TS.inline_imgs.shouldExpand(o, TS.model.inline_imgs[r]) ? TS.inline_imgs.collapse(o, r) : TS.inline_imgs.expand(o, r));
              }
              var s = n.closest(".msg_inline_img_expander");
              s.length && (e.preventDefault(), TS.inline_imgs.expand(o, s.data("real-src")));
              var d = n.closest(".msg_inline_img_collapser");
              d.length && (e.preventDefault(), TS.inline_imgs.collapse(o, d.data("real-src")));
            }
          }
        },
        makeInternalInlineImg: function(e, t) {
          TS.model.inline_imgs[e] && (t.internal_file_id = TS.model.inline_imgs[e].internal_file_id || t.internal_file_id, t.link_url = TS.model.inline_imgs[e].link_url || t.link_url, t.src = TS.model.inline_imgs[e].src || t.src), TS.model.inline_imgs[e] = t, t.src = t.src || e, t.bytes = parseInt(t.bytes, 10);
          var n = {};
          if (t.rotation && (n.rotate = !0, 90 == Math.abs(parseInt(t.rotation, 10)))) {
            var i = t.height;
            t.height = t.width, t.width = i;
          }
          t.display_w = parseInt(t.width, 10), t.width = t.display_w, t.display_h = parseInt(t.height, 10), t.height = t.display_h, t.display_w > 400 && (t.display_w = 400, t.display_h = parseInt(t.height * (t.display_w / t.width), 10), n.resize = !0), t.display_h > 500 && (t.display_h = 500, t.display_w = parseInt(t.width * (t.display_h / t.height), 10), n.resize = !0), n.width = t.display_w, n.height = t.display_h, "image/svg+xml" === t.content_type && (n.render_svg = !0);
          var o = TS.utility.getImgProxyURLWithOptions(t.src, n);
          o != t.src ? t.proxied_src = o : delete t.proxied_src;
        }
      });
    }();
  },
  2469: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("kb_nav", {
        onStart: function() {},
        start: function(t, o, a, r) {
          i = t, l = o, u.lastX = null, u.lastY = null, a || (a = "#menu"), n = $(a), d = r && !!r.use_data_ordering, e = r, $(document).on("mousemove.keyboard_navigation", _), $(document).on("keydown", TS.kb_nav.onKeyDown), i.on("mouseenter.keyboard_navigation", l, S);
        },
        end: function() {
          p(), m(), i && i.off(".keyboard_navigation"), i = null, l = null, a = null, r = !1, s = null, d = !1, e = null, $(document).off("mousemove.keyboard_navigation", _), $(document).off("keydown", TS.kb_nav.onKeyDown);
        },
        getHighlightedItem: function() {
          return a;
        },
        getItemByItemId: function(e) {
          for (var t, n = i.children(l).filter(":not(.disabled):visible"), o = $.makeArray(n), a = 0; a < o.length; a += 1)
            if (t = $(o[a]), e === t.data("item-id")) return t;
        },
        clearHighlightedItem: function() {
          p();
        },
        highlightFirstItem: function() {
          var e = b();
          e && e.length > 0 ? (c(), h(e)) : p();
        },
        highlightItemWithKey: function(e, t) {
          h(e, t);
        },
        setAllowHighlightWithoutBlurringInput: function(e) {
          r = e;
        },
        setSubmitItemHandler: function(e) {
          s = e;
        },
        onKeyDown: function(t) {
          if (!TS.ui.react_emoji_menu.is_showing) {
            var n = TS.utility.keymap,
              i = t.which,
              o = t.metaKey || t.ctrlKey || t.shiftKey || t.altKey;
            if (i == n.up && (r && !o || !v(t.target))) return t.stopPropagation(), t.preventDefault(), c(), void g(t);
            if (i == n.down && (r && !o || !v(t.target))) return t.stopPropagation(), t.preventDefault(), c(), void f(t);
            if (i == n.left && !v(t.target)) {
              if (t.stopPropagation(), t.preventDefault(), c(), e && e.onLeftKeyDownIfSubmenuExists && e.onLeftKeyDownIfSubmenuExists(t)) return;
              return void g(t);
            }
            if (i == n.right && !v(t.target)) {
              if (t.stopPropagation(), t.preventDefault(), c(), e && e.onRightKeyDownIfSubmenuExists && e.onRightKeyDownIfSubmenuExists(t)) return;
              return void f(t);
            }
            if (i == n.tab) {
              if (TS.boot_data.feature_keyboard_navigation && v(t.target) && 0 === $(t.target).val().length) return;
              return t.stopPropagation(), t.preventDefault(), c(), !r && v(t.target) && $(t.target).blur(), void(t.shiftKey ? g(t) : f(t));
            }
            if (i == n.enter && a) {
              if (s) {
                var l = a.get(0);
                return void(l ? s.call(l, t) : s(t));
              }
              t.stopPropagation(), t.preventDefault(), T();
            }
          }
        }
      });
      var e, t = {
          keyboard_active: "keyboard_active",
          no_pointer_events: "no_pointer_events"
        },
        n = null,
        i = null,
        o = !1,
        l = null,
        a = null,
        r = !1,
        s = null,
        d = !1,
        c = function() {
          o || (n.addClass(t.keyboard_active), n.addClass(t.no_pointer_events), o = !0);
        },
        u = {
          lastX: null,
          lastY: null
        },
        _ = function(e) {
          if (!o) return u.lastX = e.clientX, void(u.lastY = e.clientY);
          null === u.lastX ? (u.lastX = e.clientX, u.lastY = e.clientY) : (e.clientX === u.lastX && e.clientY === u.lastY || m(), u.lastX = e.clientX, u.lastY = e.clientY);
        },
        m = function() {
          o && (p(), n.removeClass(t.keyboard_active), n.removeClass(t.no_pointer_events), o = !1);
        },
        g = function t(n) {
          var o, r = l;
          o = a ? F(a) : y(), o && o.length > 0 ? (h(o), e && e.onMoveHighlight && e.onMoveHighlight()) : 0 !== i.children(r).filter(":not(.disabled):visible").length && (p(), t(n));
        },
        f = function t(n) {
          var o, r = l;
          o = a ? w(a) : b(), o && o.length > 0 ? (h(o), e && e.onMoveHighlight && e.onMoveHighlight()) : 0 !== i.children(r).filter(":not(.disabled):visible").length && (p(), t(n));
        },
        h = function(t, n) {
          p(), a = t;
          var i = 0;
          e && e.px_offset && (i = e.px_offset), t.addClass("highlighted"), n || t.scrollintoview({
            offset: "top",
            px_offset: i,
            duration: 0
          }), e && e.no_blur || t.find("a:first").focus(), a.trigger("highlighted");
        },
        p = function() {
          a && (a.trigger("unhighlighted"), a.removeClass("highlighted"), a = null);
        },
        S = function(e) {
          p(), a = $(e.target).closest(l), a.trigger("highlighted");
        },
        T = function() {
          a && a.find("a:first").click();
        },
        v = function(e) {
          return $(e).is("input, textarea") || TS.utility.contenteditable.isContenteditable(e);
        },
        b = function() {
          if (d) {
            e.scrollToStartImmediately && e.scrollToStartImmediately();
            var t = x();
            return 0 === t.length ? null : $(t[0]);
          }
          return i.children(l).filter(":not(.disabled):visible:first");
        },
        y = function() {
          if (d) {
            e.scrollToEndImmediately && e.scrollToEndImmediately();
            var t = x();
            return 0 === t.length ? null : $(t[t.length - 1]);
          }
          return i.children(l).filter(":not(.disabled):visible:last");
        },
        w = function(e) {
          if (d) {
            for (var t = x(), n = e.data("order-index"), o = 0; o < t.length; o += 1)
              if ($(t[o]).data("order-index") == n) {
                if (o + 1 < t.length) return $(t[o + 1]);
                break;
              }
            return null;
          }
          var a = i.children(l).filter(":not(.disabled):visible"),
            r = a.index(e);
          return a.eq(r + 1);
        },
        F = function(e) {
          if (d) {
            for (var t = x(), n = e.data("order-index"), o = 0; o < t.length; o += 1)
              if ($(t[o]).data("order-index") == n) {
                if (o - 1 >= 0) return $(t[o - 1]);
                break;
              }
            return null;
          }
          var a = i.children(l).filter(":not(.disabled):visible"),
            r = a.index(e);
          return a.eq(r - 1);
        },
        x = function() {
          var e = i.children(l).filter(":not(.disabled):visible"),
            t = $.makeArray(e);
          return t.sort(function(e, t) {
            return $(e).data("order-index") - $(t).data("order-index");
          }), t;
        };
    }();
  },
  2500: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("privacy_policy_dialog", {
        div: null,
        is_showing: !1,
        default_setting: {
          title: "",
          body: "BODY",
          body_template: null,
          onGo: null,
          onCancel: null,
          onEnd: null,
          esc_for_ok: !1,
          onShow: null,
          force_small: !1,
          enter_always_gos: !1
        },
        current_setting: null,
        body_template_html: {},
        Q: [],
        start: function(e) {
          if (TS.privacy_policy_dialog.is_showing) return void(e.unique && TS.privacy_policy_dialog.current_setting.unique == e.unique ? TS.info("redundant generic dialog not Qed: " + e.unique) : TS.privacy_policy_dialog.Q.push(e));
          TS.privacy_policy_dialog.current_setting = _.defaults({}, e, TS.privacy_policy_dialog.default_setting);
          var t = TS.privacy_policy_dialog.current_setting;
          TS.privacy_policy_dialog.div || TS.privacy_policy_dialog.build();
          var n = TS.privacy_policy_dialog.div,
            i = TS.templates.privacy_policy_dialog({
              title: t.title,
              body: t.body,
              footer: t.footer
            });
          n.empty(), n.html(i), n.find(".close").bind("click", function() {
            t.show_cancel_button ? TS.privacy_policy_dialog.cancel() : t.esc_for_ok && TS.privacy_policy_dialog.go();
          }), n.find(".dialog_go").click(TS.privacy_policy_dialog.go), t.go_button_text && n.find(".dialog_go").html(t.go_button_text), t.show_go_button && n.find(".dialog_go").removeClass("hidden").addClass(t.go_button_class), n.css("opacity", 0), n.css("display", "block"), window.setTimeout(function() {
            n.css("marginLeft", "0px"), n.slideDown(function() {
              n.animate({
                opacity: 1
              }, {
                duration: 500,
                complete: function() {
                  n.addClass("fading-in"), n.modal({
                    backdrop: !1
                  }).show(), document.activeElement && document.activeElement != document.body && document.activeElement.blur(), t.onShow && t.onShow();
                }
              });
            });
          }, 1);
        },
        go: function(e) {
          function t() {
            i.removeClass("fading-in"), i.fadeOut(750, function() {
              i.modal("hide");
            });
          }
          if (!TS.privacy_policy_dialog.is_showing) return void TS.error("not showing?");
          var n = TS.privacy_policy_dialog.current_setting,
            i = TS.privacy_policy_dialog.div;
          n.onGo ? !1 !== n.onGo(e) && t() : t();
        },
        cancel: function() {
          var e = TS.privacy_policy_dialog.current_setting,
            t = TS.privacy_policy_dialog.div;
          t.removeClass("fading-in"), t.fadeOut(750, function() {
            t.modal("hide");
          }), e.onCancel && e.onCancel();
        },
        end: function() {
          var e = TS.privacy_policy_dialog.current_setting;
          if (TS.model.dialog_is_showing = !1, TS.privacy_policy_dialog.is_showing = !1, TS.privacy_policy_dialog.div.empty(), e.onEnd && e.onEnd(), !TS.privacy_policy_dialog.is_showing && TS.privacy_policy_dialog.Q.length) {
            var t = TS.privacy_policy_dialog.Q.shift();
            TS.privacy_policy_dialog.start(t);
          }
        },
        build: function() {
          $("body").append('<div id="privacy_policy_dialog" class="modal" data-keyboard="false"></div>'), TS.privacy_policy_dialog.div = $("#privacy_policy_dialog");
          var e = TS.privacy_policy_dialog.div;
          e.on("hidden", function(e) {
            e.target == this && setTimeout(function() {
              TS.privacy_policy_dialog.end();
            }, 200);
          }), e.on("show", function(e) {
            e.target == this && (TS.model.dialog_is_showing = !0, TS.privacy_policy_dialog.is_showing = !0);
          });
        }
      });
    }();
  },
  2517: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("sidebar_themes", {
        default_themes: {
          default_theme: {
            column_bg: "#4D394B",
            menu_bg: "#3E313C",
            active_item: "#4C9689",
            active_item_text: "#FFFFFF",
            hover_item: "#3E313C",
            text_color: "#FFFFFF",
            active_presence: "#38978D",
            badge: "#EB4D5C"
          },
          hoth_theme: {
            column_bg: "#F8F8FA",
            menu_bg: "#F8F8FA",
            active_item: "#CAD1D9",
            active_item_text: "#FFFFFF",
            hover_item: "#FFFFFF",
            text_color: "#383F45",
            active_presence: "#60D156",
            badge: "#FF8669"
          },
          monument_theme: {
            column_bg: "#0D7E83",
            menu_bg: "#076570",
            active_item: "#F79F66",
            active_item_text: "#FFFFFF",
            hover_item: "#D37C71",
            text_color: "#FFFFFF",
            active_presence: "#F79F66",
            badge: "#F15340"
          },
          chocolate_theme: {
            column_bg: "#544538",
            menu_bg: "#42362B",
            active_item: "#5DB09D",
            active_item_text: "#FFFFFF",
            hover_item: "#4A3C30",
            text_color: "#FFFFFF",
            active_presence: "#FFFFFF",
            badge: "#5DB09D"
          },
          ocean_theme: {
            column_bg: "#303E4D",
            menu_bg: "#2C3849",
            active_item: "#6698C8",
            active_item_text: "#FFFFFF",
            hover_item: "#4A5664",
            text_color: "#FFFFFF",
            active_presence: "#94E864",
            badge: "#78AF8F"
          },
          workhard_theme: {
            column_bg: "#4D5250",
            menu_bg: "#444A47",
            active_item: "#D39B46",
            active_item_text: "#FFFFFF",
            hover_item: "#434745",
            text_color: "#FFFFFF",
            active_presence: "#99D04A",
            badge: "#DB6668"
          },
          solanum_theme: {
            column_bg: "#4F2F4C",
            menu_bg: "#452842",
            active_item: "#8C5888",
            active_item_text: "#FFFFFF",
            hover_item: "#3E313C",
            text_color: "#FFFFFF",
            active_presence: "#D0FF00",
            badge: "#889100"
          },
          brinjal_theme: {
            column_bg: "#4F2F4C",
            menu_bg: "#452842",
            active_item: "#8C5888",
            active_item_text: "#FFFFFF",
            hover_item: "#3E313C",
            text_color: "#FFFFFF",
            active_presence: "#00FFB7",
            badge: "#DE4C0D"
          },
          cotton_theme: {
            column_bg: "#BB6A76",
            menu_bg: "#AD5B67",
            active_item: "#62B791",
            active_item_text: "#FFFFFF",
            hover_item: "#A5516A",
            text_color: "#FFFFFF",
            active_presence: "#68F798",
            badge: "#694464"
          },
          eco_theme: {
            column_bg: "#86A34E",
            menu_bg: "#94AF63",
            active_item: "#FFFFFF",
            active_item_text: "#6D8B42",
            hover_item: "#94AF63",
            text_color: "#FFFFFF",
            active_presence: "#FFB10A",
            badge: "#DFA044"
          }
        },
        onStart: function() {
          TS.client && TS.client.login_sig.add(TS.sidebar_themes.onLogin, TS.sidebar_themes);
        },
        onLogin: function() {
          TS.model.prefs.sidebar_theme && TS.prefs.sidebar_theme_changed_sig.dispatch();
        }
      });
    }();
  },
  2521: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("sounds", {
        onStart: function() {
          var n = TS.boot_data.abs_root_url,
            i = [].concat(TS.boot_data.notification_sounds || []).concat(TS.boot_data.alert_sounds || []).concat(TS.boot_data.call_sounds || []),
            o = [];
          TS.has_pri[t] && TS.log(t, "adding all_sounds: " + i.length), i.forEach(function(i) {
            i.url && (0 !== i.url.indexOf("http") && (i.url = n + i.url.replace("/", "")), i.url_ogg && 0 !== i.url_ogg.indexOf("http") && (i.url_ogg = n + i.url_ogg.replace("/", "")), TS.has_pri[t] && TS.log(t, "adding sound: " + i.value), e[i.value] = {
              url: i.url,
              url_ogg: i.url_ogg
            }, TS.has_pri[t] && TS.log(t, "_sounds[" + i.value + "] = " + e[i.value]), o.push(i.url));
          }), window.Audio && soundManager.onready(function() {
            $.each(e, function(t, n) {
              n.url_ogg && (n.url = [n.url, n.url_ogg]), e[t] = soundManager.createSound(n);
            });
          });
          try {
            TSSSB.call("preloadSounds", o) ? TS.has_pri[t] && TS.log(t, "called TSSSB.call('preloadSounds', '" + o + "')") : TS.has_pri[t] && TS.log(t, "NOT CALLED TSSSB.call('preloadSounds', '" + o + "')");
          } catch (e) {
            TS.warn("error calling TSSSB.preloadSounds " + e + " " + o);
          }
        },
        shouldMuteSounds: function(e) {
          e = e || {}, e.ignore_mute = e.ignore_mute || !1;
          var t = TS.model && TS.model.prefs && TS.model.prefs.mute_sounds;
          return t = t || TSSSB.call("shouldMuteAudio"), t = t && !e.ignore_mute;
        },
        filenameForSoundName: function(t, n) {
          if ("new_message" === t && (t = TS.model.prefs.new_msg_snd), "none" !== t) {
            if ("beep" === t && (t = "frog.mp3"), !(t in e)) return void TS.warn("unknown sound: " + t);
            if (!TS.sounds.shouldMuteSounds(n)) return t;
          }
        },
        soundForName: function(t, n) {
          if ((t = TS.sounds.filenameForSoundName(t, n)) && !TS.sounds.shouldMuteSounds(n)) return e[t];
        },
        play: function(e, n) {
          n = n || {}, n.should_loop = n.should_loop || !1, n.playback_device = n.playback_device || "", n.ignore_mute = n.ignore_mute || !1;
          var i = TS.sounds.soundForName(e, n);
          if (i) {
            var o = {
              url: i.url,
              should_loop: n.should_loop,
              playback_device: n.playback_device
            };
            TSSSB.call("playRemoteSound", o) ? TS.has_pri[t] && TS.log(t, "called TSSSB.call('playRemoteSound', '" + JSON.stringify(o) + "'})") : _.isFunction(i.play) ? (TS.has_pri[t] && TS.log(t, "calling sound.play()"), i.play({
              loops: n.should_loop ? 999999 : 0
            })) : TS.has_pri[t] && TS.log(t, "wanted to call sound.play() but it is not a function");
          } else soundManager && TS.warn("sound is null: " + e + " window.Audio: " + window.Audio + " window.winssb: " + window.winssb + " soundManager.ok(): " + soundManager.ok() + " soundManager.html5Only: " + soundManager.html5Only + " soundManager.canPlayMIME('audio/mp3'): " + soundManager.canPlayMIME("audio/mp3"));
        },
        stop: function(e, n) {
          n = n || {}, n.ignore_mute = n.ignore_mute || !1;
          var i = TS.sounds.soundForName(e, n);
          i ? TSSSB.call("stopRemoteSound", i.url) ? TS.has_pri[t] && TS.log(t, "called TSSSB.call('stopRemoteSound', '" + i.url + "')") : (TS.has_pri[t] && TS.log(t, "calling sound.stop()"), i.stop()) : soundManager && TS.warn("sound is null: " + e + " window.Audio: " + window.Audio + " window.winssb: " + window.winssb + " soundManager.ok(): " + soundManager.ok() + " soundManager.html5Only: " + soundManager.html5Only + " soundManager.canPlayMIME('audio/mp3'): " + soundManager.canPlayMIME("audio/mp3"));
        },
        getNotificationSoundNameFromFilename: function(e) {
          var t = _.find(TS.boot_data.notification_sounds, {
            value: e
          });
          return t ? t.label : void TS.error("No notification sound found matching " + e);
        }
      });
      var e = {},
        t = 37;
    }();
  },
  2549: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("ui.comments", {
        editing_file: null,
        editing_comment: null,
        editing: !1,
        $edit_form: null,
        bound: !1,
        onStart: function() {
          if (TS.ui.comments.$edit_form = $("#file_edit_comment_form"), TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.supportsTexty()) TS.ui.comments.bindInput($("#file_comment"));
          else {
            var e = $("#file_comment");
            e.one("focus.uicomments", function() {
              TS.ui.comments.bindInput(e);
            });
          }
          TS.ui.comments.bindButton($("#file_comment_submit_btn"));
        },
        bindButton: function(e) {
          e.bind("keydown.cmd_submit", function(t) {
            t.which === TS.utility.keymap.enter && e.is(":focus") && e.closest("form").submit();
          });
        },
        bindInput: function(e, t) {
          TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.supportsTexty() && TS.tabcomplete ? (TS.utility.contenteditable.create(e, {
            modules: {
              tabcomplete: {
                searchOptions: {
                  complete_member_specials: !1
                },
                completers: [TS.tabcomplete.channels, TS.tabcomplete.emoji, TS.tabcomplete.members],
                positionMenu: function(t) {
                  TS.web && TS.web.space ? t.style.width = Math.min(e.outerWidth(), 474) + "px" : t.style.width = Math.min(e.outerWidth(), 360) + "px", TS.tabcomplete.positionUIRelativeToInput(t, e);
                },
                no_model_ob: !TS.client
              }
            },
            onEnter: function() {
              return t ? t() : e.closest("form").submit(), !1;
            },
            onTextChange: function() {
              TS.client && (TS.ui.fs_modal_file_viewer.is_showing && $("#file_comment").closest("#fs_modal").length ? TS.ui.fs_modal_file_viewer.storeLastCommentInput() : (TS.client.ui.files.storeLastCommentInputForPreviewedFile(TS.utility.contenteditable.value(e)), TS.ui.utility.updateClosestMonkeyScroller($("#file_preview_scroller"))));
            },
            onEscape: function() {
              TS.client && TS.ui.fs_modal_file_viewer.is_showing && TS.ui.fs_modal_file_viewer.canClose() && TS.ui.fs_modal.close();
            }
          }), TS.utility.contenteditable.enable(e), e.on("keyup", function() {
            if (!TS.utility.contenteditable.cursorPosition(e).length) {
              var t = e.closest("form"),
                n = TS.client && TS.client.ui.getCachedDimensionsRect("cached_msgs_scroller_rect", TS.client.ui.$msgs_scroller_div);
              (!TS.client || t.outerHeight() < n.height) && t.find("button[type=submit]").scrollintoview({
                px_offset: -50,
                complete: function() {
                  TS.tabcomplete.positionUIRelativeToInput($(".tab_complete_ui")[0], e);
                }
              });
            }
          })) : (e.TS_tabComplete({
            complete_cmds: !1,
            complete_channels: !0,
            complete_emoji: !0,
            complete_member_specials: !1,
            complete_user_groups: !0,
            onComplete: function(t, n) {
              TS.utility.populateInput(e, t, n);
            },
            include_self: !!TS.boot_data.feature_name_tagging_client
          }), e.bind("keydown.cmd_submit", function(n) {
            if (n.which === TS.utility.keymap.enter) {
              if (e.tab_complete_ui("isShowing")) return void n.preventDefault();
              if (TS.model.prefs.enter_is_special_in_tbt && TS.utility.isCursorWithinTBTs(e)) return void(n.shiftKey && ($(this).closest("form").submit(), n.preventDefault()));
              n.shiftKey || n.altKey || n.ctrlKey || (t ? t() : $(this).closest("form").submit(), n.preventDefault());
            }
          }), e.tab_complete_ui({
            id: "comment_input_tab_ui",
            min_width: 300,
            narrow: !!TS.client,
            no_model_ob: !0,
            scroll_with_element: !!TS.client
          }));
        },
        unbindInput: function(e) {
          e && (TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.supportsTexty() || (e.unbind("keydown.cmd_submit"), e.removeData()));
        },
        bindEditForm: function() {
          TS.ui.comments.bound = !0;
          var e = TS.ui.comments.$edit_form;
          $("#file_edit_comment").css("overflow", "hidden").autogrow(), TS.ui.comments.bindInput($("#file_edit_comment")), e.unbind("submit").bind("submit", TS.ui.comments.submitEditForm), e.find(".save").unbind("click").bind("click", function() {
            return TS.ui.comments.submitEditForm(), !1;
          }), e.find(".cancel").unbind("click").bind("click", function() {
            return TS.ui.comments.onEndEdit(), !1;
          }), e.unbind("destroyed").bind("destroyed", function() {
            $("#file_comment_form").after($(this)[0].outerHTML), TS.ui.comments.$edit_form = $("#file_edit_comment_form"), TS.ui.comments.bound = !1, TS.ui.comments.editing && TS.ui.comments.onEndEdit();
          });
        },
        submitEditForm: function() {
          return TS.utility.contenteditable.isEmpty($("#file_edit_comment"), !0) ? (TS.client && TS.sounds.play("beep"), !1) : (TS.ui.comments.saveEdit(), !1);
        },
        startEdit: function(e, t, n) {
          TS.ui.comments.editing && TS.ui.comments.onEndEdit();
          var i = TS.files.getFileById(e);
          if (!i) return TS.error("no file?"), null;
          var o = TS.files.getFileCommentById(i, t);
          if (!o) return TS.error("no comment?"), null;
          var l, a = TS.ui.comments.$edit_form;
          if (l = n ? n.closest(".comment") : $("#" + o.id), !l.length) return void TS.error("no #" + o.id + "?");
          l.addClass("comment_editing").append(a), TS.utility.contenteditable.clear($("#file_edit_comment")), $("#file_edit_comment").css("height", ""), TS.ui.comments.bound || TS.ui.comments.bindEditForm(), a.removeClass("hidden"), TS.utility.contenteditable.clearHistory($("#file_edit_comment")), TS.utility.contenteditable.value($("#file_edit_comment"), TS.format.unFormatMsg(o.comment)), TS.utility.contenteditable.focus($("#file_edit_comment")), TS.utility.contenteditable.cursorPosition($("#file_edit_comment"), 1e6), TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.supportsTexty() || $("#file_edit_comment").trigger("keyup"), $("#file_comment_form").css("visibility", "hidden"), TS.ui.comments.editing = !0, TS.ui.comments.editing_file = i, TS.ui.comments.editing_comment = o;
        },
        saveEdit: function() {
          var e = TS.ui.comments.editing_file,
            t = TS.ui.comments.editing_comment,
            n = $('.comment[data-comment-id="' + t.id + '"] .comment_body'),
            i = TS.format.cleanMsg(TS.utility.contenteditable.value($("#file_edit_comment")));
          if (i != t.comment) {
            var o = t.comment;
            t.comment = i, n.length && n.html(TS.format.formatJustText(t.comment)), TS.api.call("files.comments.edit", {
              file: e.id,
              id: t.id,
              comment: i
            }, function(e) {
              e || (t.comment = o, n.length && n.html(TS.format.formatJustText(t.comment)), TS.generic_dialog.alert(TS.i18n.t("Something‘s gone wrong, and your change didn‘t save. If you see this message more than once, you may want to try restarting Slack.", "comments")(), TS.i18n.t("Oh, crumbs!", "comments")(), TS.i18n.t("Got it", "comments")()));
            });
          }
          TS.ui.comments.onEndEdit();
        },
        onEndEdit: function() {
          var e = TS.ui.comments.editing_comment;
          e && (TS.ui.comments.$edit_form.addClass("hidden"), $('[data-comment-id="' + e.id + '"].comment_editing').removeClass("comment_editing"), $("#file_comment_form").css("visibility", ""), TS.ui.comments.editing = !1, TS.ui.comments.editing_file = null, TS.ui.comments.editing_comment = null);
        },
        startDelete: function(e, t) {
          var n = TS.files.getFileById(e);
          if (!n) return TS.error("no file?"), null;
          var i = TS.files.getFileCommentById(n, t);
          if (!i) return TS.error("no comment?"), null;
          TS.generic_dialog.start({
            title: TS.i18n.t("Delete a file comment", "comments")(),
            body: TS.i18n.t("<p>Are you sure you want to delete this comment? This cannot be undone.</p>", "comments")() + TS.templates.builders.buildCommentHTML({
              comment: i,
              file: n,
              show_comment_actions: !1,
              hide_star: !0
            }),
            go_button_text: TS.i18n.t("Yes, delete the comment", "comments")(),
            go_button_class: "btn_danger",
            onGo: function() {
              TS.ui.comments.commitDelete(e, t);
            }
          });
        },
        commitDelete: function(e, t) {
          var n = TS.files.getFileById(e);
          if (!n) return TS.error("no file?"), null;
          var i = TS.files.getFileCommentById(n, t);
          if (!i) return TS.error("no comment?"), null;
          TS.api.call("files.comments.delete", {
            file: e,
            id: t
          }, function(e, t) {
            e ? TS.client || TS.files.deleteCommentOnFile(i.id, n) : "comment_not_found" === t.error && TS.files.deleteCommentOnFile(i.id, n);
          });
        },
        removeFileComment: function(e, t, n) {
          $('.comment[data-comment-id="' + t + '"]').slideUp(200, function() {
            var e = this.parentNode;
            $(this).remove(), e.innerHTML.match(/^[\s\r\n]*$/) && $(e).empty(), "function" == typeof n && n.apply(this, arguments);
          });
        }
      });
    }();
  },
  2646: function(e, t) {
    ! function() {
      "use strict";

      function e(e, l) {
        if (void 0 === e) return null;
        this.element = e;
        var a = i(e),
          r = n(a);
        return this.element.on("click", ".tab", function(e) {
          return e.preventDefault(), o(this, a, r).bind(this);
        }), this.unbind = function() {
          this.element.off(), this.element = null, a = null, r = null;
        }, this.element.one("remove", this.unbind), o(t(a, l), a, r), this;
      }

      function t(e, t) {
        if (t && t.default_tab) {
          var n = _.filter(e, function(e) {
            return $(e).attr("href") == "#" + t.default_tab;
          })[0];
          return n || (TS.warn("Default tab was not found, falling back to first tab."), e[0]);
        }
        return e[0];
      }

      function n(e) {
        return void 0 === e ? [] : e.map(function(e, t) {
          return $(t).attr("href");
        }).map(function(e, t) {
          return $(t);
        });
      }

      function i(e) {
        return void 0 === e ? [] : e.find(".tab").map(function(e, t) {
          return $(t);
        });
      }

      function o(e, t, n) {
        if (void 0 === e) return !1;
        n.map(function(e, t) {
          return $(t).removeClass("active");
        }), t.map(function(e, t) {
          return $(t).removeClass("active");
        });
        var i = $(e);
        i.addClass("active");
        var o = $(i.attr("href")),
          l = o.addClass("active");
        return i = null, o = null, l;
      }
      TS.registerModule("ui.tabs", {
        instances: [],
        onStart: function() {},
        create: function(t, n) {
          return !!t && new e(t, n);
        }
      }), e.prototype.destroy = function() {
        this.element.off(), this.element.remove();
      };
    }();
  }
}, [1464]);
