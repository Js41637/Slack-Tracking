webpackJsonp([456], {
  10091: function(t, e) {
    (function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function t() {
          a = TS.log && TS.has_pri[a] ? a : null;
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
          n = e;
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
        track: function t(e, r) {
          g(e, r);
        },
        trackClick: function t(e, r, a) {
          $(e).on("click", function() {
            g(r, a);
          });
        },
        trackForm: function t(e, r, a) {
          $(e).on("submit", function() {
            g(r, a);
          });
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
          var a = 0;
          var o = e.length;
          var n;
          for (a; a < o; a += 1) {
            n = e[a].split("=");
            r[n[0]] = n[1];
          }
          return r;
        }
      });
      var t;
      var e = 2e3;
      var r = 1e3;
      var a = r;
      var o = [];
      var n;
      var i;
      var c;
      var l;
      var s = false;
      var u = function e(r) {
        var a = r.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        var o = r.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
        var n = r.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
        if (a) t = "https://" + a[2] + ".slack.com/clog/track/";
        else if (o) t = "https://" + o[2] + ".slack.com/clog/track/";
        else if (n) t = "https://staging.slack.com/clog/track/";
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
        if (n) g.team_id = n;
        if (i) g.enterprise_id = i;
        if (c) g.user_id = c;
        if (l) g.i18n_locale = l;
        o.push(g);
        if (TS.log) {
          if (s) TS.console.log(r, g);
          if (TS.has_pri[a]) TS.log(a, "Event called:", e, u);
        } else if (s) try {
          console.log(g);
        } catch (t) {}
      };
      var f = function t() {
        if (0 === o.length) return;
        if (TS.log && TS.has_pri[a]) {
          TS.log(a, "Sending clog data, emptying queue");
          TS.log(a, "Logs: ", o);
        }
        var e = v(o);
        var r;
        for (var n = 0; n < e.length; n += 1) {
          r = e[n];
          var i = new Image;
          i.src = r;
          if (TS.log && TS.has_pri[a]) TS.log(a, "Logged event: " + r);
        }
        o = [];
      };
      var v = function r(o) {
        if (!t) u(location.host);
        var n = [];
        var i = [];
        var c = "";
        var l = function e(r) {
          return t + "?logs=" + encodeURIComponent(JSON.stringify(r));
        };
        var s;
        for (var g = 0; g < o.length; g += 1) {
          s = o[g];
          i.push(s);
          c = l(i);
          if (c.length > e) {
            i.pop();
            n.push(l(i));
            i = [s];
          }
        }
        n.push(l(i));
        if (TS.log && TS.has_pri[a]) TS.log(a, "URLs:", n);
        return n;
      };
      var d = function t() {
        var e = this.getAttribute("data-clog-event");
        if (!e) {
          if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
          return;
        }
        var r = {};
        var a = TS.clog.parseParams(this.getAttribute("data-clog-params"));
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
            a.page_url = location.href;
        }
        r = p(a, r);
        TS.clog.track(e, r);
      };
      var p = function t(e, r) {
        var a = {};
        Object.keys(e).forEach(function(t) {
          a[t] = e[t];
        });
        Object.keys(r).forEach(function(t) {
          a[t] = r[t];
        });
        return a;
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
