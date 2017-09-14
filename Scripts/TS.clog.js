webpackJsonp([456], {
  11678: function(t, e) {
    (function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function t() {
          n = TS.log && TS.has_pri[n] ? n : null;
          var e = 3e4;
          var r = 5e3;
          var o = Math.floor(Math.random() * r);
          setInterval(f, e + o);
          $(window).on("beforeunload pagehide", f);
          $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', d);
          S();
          TS.clog.flush();
        },
        setUser: function t(e) {
          c = e;
        },
        setTeam: function t(e) {
          i = e;
        },
        setEnterprise: function t(e) {
          a = e;
        },
        setLocale: function t(e) {
          l = e;
        },
        toggleDebugMode: function t() {
          s = !s;
          return s;
        },
        track: function t(e, r) {
          g(e, r);
        },
        trackClick: function t(e, r, n) {
          $(e).on("click", function() {
            g(r, n);
          });
        },
        trackForm: function t(e, r, n) {
          $(e).on("submit", function() {
            g(r, n);
          });
        },
        trackClickWithContext: function t(e) {
          if (!e || !e.event || !e.element) return;
          var r = {
            contexts: {
              ui_context: {
                action: "click",
                ui_element: e.element
              }
            }
          };
          if (e.contexts) r.contexts = p(r.contexts, e.contexts);
          TS.clog.track(e.event, r);
        },
        flush: function t() {
          f();
        },
        test: function e() {
          return {
            createLogURLs: v,
            sendDataAndEmptyQueue: f,
            detectClogEndpoint: u,
            getLogs: function t() {
              return o;
            },
            getClogEndpoint: function e() {
              return t;
            },
            reset: function e() {
              o = [];
              t = void 0;
            }
          };
        },
        parseParams: function t(e) {
          if (!e) return {};
          e = e.split(",");
          var r = {};
          var n = 0;
          var o = e.length;
          var i;
          for (n; n < o; n += 1) {
            i = e[n].split("=");
            r[i[0]] = i[1];
          }
          return r;
        }
      });
      var t;
      var e = 2e3;
      var r = 1e3;
      var n = r;
      var o = [];
      var i;
      var a;
      var c;
      var l;
      var s = false;
      var u = function e(r) {
        var n = r.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        var o = r.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
        var i = r.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
        if (n) t = "https://" + n[2] + ".slack.com/clog/track/";
        else if (o) t = "https://" + o[2] + ".slack.com/clog/track/";
        else if (i) t = "https://staging.slack.com/clog/track/";
        else t = "https://slack.com/clog/track/";
      };
      var g = function t(e, u) {
        if ("string" !== typeof e) return;
        if (!u) u = null;
        var g = {
          tstamp: Date.now(),
          event: e,
          args: u
        };
        S();
        if (i) g.team_id = i;
        if (a) g.enterprise_id = a;
        if (c) g.user_id = c;
        if (l) g.i18n_locale = l;
        o.push(g);
        if (TS.log) {
          if (s) TS.console.log(r, g);
          if (TS.has_pri[n]) TS.log(n, "Event called:", e, u);
        } else if (s) try {
          console.log(g);
        } catch (t) {}
      };
      var f = function t() {
        if (0 === o.length) return;
        if (TS.log && TS.has_pri[n]) {
          TS.log(n, "Sending clog data, emptying queue");
          TS.log(n, "Logs: ", o);
        }
        var e = v(o);
        var r;
        for (var i = 0; i < e.length; i += 1) {
          r = e[i];
          var a = new Image;
          a.src = r;
          if (TS.log && TS.has_pri[n]) TS.log(n, "Logged event: " + r);
        }
        o = [];
      };
      var v = function r(o) {
        if (!t) u(location.host);
        var i = [];
        var a = [];
        var c = "";
        var l = function e(r) {
          return t + "?logs=" + encodeURIComponent(JSON.stringify(r));
        };
        var s;
        for (var g = 0; g < o.length; g += 1) {
          s = o[g];
          a.push(s);
          c = l(a);
          if (c.length > e) {
            a.pop();
            i.push(l(a));
            a = [s];
          }
        }
        i.push(l(a));
        if (TS.log && TS.has_pri[n]) TS.log(n, "URLs:", i);
        return i;
      };
      var d = function t() {
        var e = this.getAttribute("data-clog-event");
        if (!e) {
          if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
          return;
        }
        var r = {};
        var n = TS.clog.parseParams(this.getAttribute("data-clog-params"));
        var o = this.getAttribute("data-clog-ui-action");
        if (o) {
          r = {
            ui_element: this.getAttribute("data-clog-ui-element"),
            action: this.getAttribute("data-clog-ui-action"),
            step: this.getAttribute("data-clog-ui-step")
          };
          r = {
            contexts: {
              ui_context: r
            }
          };
        }
        switch (e.toUpperCase()) {
          case "WEBSITE_CLICK":
            n.page_url = location.href;
        }
        r = p(n, r);
        TS.clog.track(e, r);
      };
      var p = function t(e, r) {
        var n = {};
        Object.keys(e).forEach(function(t) {
          n[t] = e[t];
        });
        Object.keys(r).forEach(function(t) {
          n[t] = r[t];
        });
        return n;
      };
      var S = function t() {
        if (TS.boot_data.feature_redux_hearts_enterprise) {
          var e = TS.redux.enterprise.getEnterprise().id;
          if (e) TS.clog.setEnterprise(e);
        } else if (TS.model)
          if (TS.model.enterprise && TS.model.enterprise.id) TS.clog.setEnterprise(TS.model.enterprise.id);
        if (TS.model) {
          if (TS.model.team && TS.model.team.id) TS.clog.setTeam(TS.model.team.id);
          if (TS.model.user && TS.model.user.id) TS.clog.setUser(TS.model.user.id);
        }
        if (TS.i18n) TS.clog.setLocale(TS.i18n.locale());
      };
    })();
  }
}, [11678]);
