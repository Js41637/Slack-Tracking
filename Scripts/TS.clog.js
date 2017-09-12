webpackJsonp([456], {
  10091: function(t, e) {
    (function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function t() {
          o = TS.log && TS.has_pri[o] ? o : null;
          var e = 3e4;
          var n = 5e3;
          var r = Math.floor(Math.random() * n);
          setInterval(f, e + r);
          $(window).on("beforeunload pagehide", f);
          $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', d);
          S();
          TS.clog.flush();
        },
        setUser: function t(e) {
          c = e;
        },
        setTeam: function t(e) {
          a = e;
        },
        setEnterprise: function t(e) {
          i = e;
        },
        setLocale: function t(e) {
          l = e;
        },
        toggleDebugMode: function t() {
          s = !s;
          return s;
        },
        track: function t(e, n) {
          g(e, n);
        },
        trackClick: function t(e, n, o) {
          $(e).on("click", function() {
            g(n, o);
          });
        },
        trackForm: function t(e, n, o) {
          $(e).on("submit", function() {
            g(n, o);
          });
        },
        trackClickWithContext: function t(e) {
          if (!e || !e.event || !e.element) return;
          var n = {
            contexts: {
              ui_context: {
                action: "click",
                ui_element: e.element
              }
            }
          };
          if (e.contexts) n.contexts = p(n.contexts, e.contexts);
          TS.clog.track(e.event, n);
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
              return r;
            },
            getClogEndpoint: function e() {
              return t;
            },
            reset: function e() {
              r = [];
              t = void 0;
            }
          };
        },
        parseParams: function t(e) {
          if (!e) return {};
          e = e.split(",");
          var n = {};
          var o = 0;
          var r = e.length;
          var a;
          for (o; o < r; o += 1) {
            a = e[o].split("=");
            n[a[0]] = a[1];
          }
          return n;
        }
      });
      var t;
      var e = 2e3;
      var n = 1e3;
      var o = n;
      var r = [];
      var a;
      var i;
      var c;
      var l;
      var s = false;
      var u = function e(n) {
        var o = n.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        var r = n.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
        var a = n.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
        if (o) t = "https://" + o[2] + ".slack.com/clog/track/";
        else if (r) t = "https://" + r[2] + ".slack.com/clog/track/";
        else if (a) t = "https://staging.slack.com/clog/track/";
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
        if (a) g.team_id = a;
        if (i) g.enterprise_id = i;
        if (c) g.user_id = c;
        if (l) g.i18n_locale = l;
        r.push(g);
        if (TS.log) {
          if (s) TS.console.log(n, g);
          if (TS.has_pri[o]) TS.log(o, "Event called:", e, u);
        } else if (s) try {
          console.log(g);
        } catch (t) {}
      };
      var f = function t() {
        if (0 === r.length) return;
        if (TS.log && TS.has_pri[o]) {
          TS.log(o, "Sending clog data, emptying queue");
          TS.log(o, "Logs: ", r);
        }
        var e = v(r);
        var n;
        for (var a = 0; a < e.length; a += 1) {
          n = e[a];
          var i = new Image;
          i.src = n;
          if (TS.log && TS.has_pri[o]) TS.log(o, "Logged event: " + n);
        }
        r = [];
      };
      var v = function n(r) {
        if (!t) u(location.host);
        var a = [];
        var i = [];
        var c = "";
        var l = function e(n) {
          return t + "?logs=" + encodeURIComponent(JSON.stringify(n));
        };
        var s;
        for (var g = 0; g < r.length; g += 1) {
          s = r[g];
          i.push(s);
          c = l(i);
          if (c.length > e) {
            i.pop();
            a.push(l(i));
            i = [s];
          }
        }
        a.push(l(i));
        if (TS.log && TS.has_pri[o]) TS.log(o, "URLs:", a);
        return a;
      };
      var d = function t() {
        var e = this.getAttribute("data-clog-event");
        if (!e) {
          if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
          return;
        }
        var n = {};
        var o = TS.clog.parseParams(this.getAttribute("data-clog-params"));
        var r = this.getAttribute("data-clog-ui-action");
        if (r) {
          n = {
            ui_element: this.getAttribute("data-clog-ui-element"),
            action: this.getAttribute("data-clog-ui-action"),
            step: this.getAttribute("data-clog-ui-step")
          };
          n = {
            contexts: {
              ui_context: n
            }
          };
        }
        switch (e.toUpperCase()) {
          case "WEBSITE_CLICK":
            o.page_url = location.href;
        }
        n = p(o, n);
        TS.clog.track(e, n);
      };
      var p = function t(e, n) {
        var o = {};
        Object.keys(e).forEach(function(t) {
          o[t] = e[t];
        });
        Object.keys(n).forEach(function(t) {
          o[t] = n[t];
        });
        return o;
      };
      var S = function t() {
        if (TS.model) {
          if (TS.model.enterprise && TS.model.enterprise.id) TS.clog.setEnterprise(TS.model.enterprise.id);
          if (TS.model.team && TS.model.team.id) TS.clog.setTeam(TS.model.team.id);
          if (TS.model.user && TS.model.user.id) TS.clog.setUser(TS.model.user.id);
        }
        if (TS.i18n) TS.clog.setLocale(TS.i18n.locale());
      };
    })();
  }
}, [10091]);
