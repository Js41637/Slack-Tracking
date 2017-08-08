webpackJsonp([456], {
  210: function(t, e) {
    (function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function t() {
          a = TS.log && TS.has_pri[a] ? a : null;
          var e = 3e4;
          var r = 5e3;
          var o = Math.floor(Math.random() * r);
          setInterval(g, e + o);
          $(window).on("beforeunload pagehide", g);
          $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', v);
          p();
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
        toggleDebugMode: function t() {
          s = !s;
          return s;
        },
        track: function t(e, r) {
          u(e, r);
        },
        trackClick: function t(e, r, a) {
          $(e).on("click", function() {
            u(r, a);
          });
        },
        trackForm: function t(e, r, a) {
          $(e).on("submit", function() {
            u(r, a);
          });
        },
        flush: function t() {
          g();
        },
        test: function e() {
          return {
            createLogURLs: f,
            sendDataAndEmptyQueue: g,
            detectClogEndpoint: l,
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
      var s = false;
      var l = function e(r) {
        var a = r.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        var o = r.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
        var n = r.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
        if (a) t = "https://" + a[2] + ".slack.com/clog/track/";
        else if (o) t = "https://" + o[2] + ".slack.com/clog/track/";
        else if (n) t = "https://staging.slack.com/clog/track/";
        else t = "https://slack.com/clog/track/";
      };
      var u = function t(e, l) {
        if ("string" !== typeof e) return;
        if (!l) l = null;
        var u = {
          tstamp: Date.now(),
          event: e,
          args: l
        };
        p();
        if (n) u.team_id = n;
        if (i) u.enterprise_id = i;
        if (c) u.user_id = c;
        o.push(u);
        if (TS.log) {
          if (s) TS.console.log(r, u);
          if (TS.has_pri[a]) TS.log(a, "Event called:", e, l);
        } else if (s) try {
          console.log(u);
        } catch (t) {}
      };
      var g = function t() {
        if (0 === o.length) return;
        if (TS.log && TS.has_pri[a]) {
          TS.log(a, "Sending clog data, emptying queue");
          TS.log(a, "Logs: ", o);
        }
        var e = f(o);
        var r;
        for (var n = 0; n < e.length; n += 1) {
          r = e[n];
          var i = new Image;
          i.src = r;
          if (TS.log && TS.has_pri[a]) TS.log(a, "Logged event: " + r);
        }
        o = [];
      };
      var f = function r(o) {
        if (!t) l(location.host);
        var n = [];
        var i = [];
        var c = "";
        var s = function e(r) {
          return t + "?logs=" + encodeURIComponent(JSON.stringify(r));
        };
        var u;
        for (var g = 0; g < o.length; g += 1) {
          u = o[g];
          i.push(u);
          c = s(i);
          if (c.length > e) {
            i.pop();
            n.push(s(i));
            i = [u];
          }
        }
        n.push(s(i));
        if (TS.log && TS.has_pri[a]) TS.log(a, "URLs:", n);
        return n;
      };
      var v = function t() {
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
        r = d(a, r);
        TS.clog.track(e, r);
      };
      var d = function t(e, r) {
        var a = {};
        Object.keys(e).forEach(function(t) {
          a[t] = e[t];
        });
        Object.keys(r).forEach(function(t) {
          a[t] = r[t];
        });
        return a;
      };
      var p = function t() {
        if (TS.model) {
          if (TS.model.enterprise && TS.model.enterprise.id) TS.clog.setEnterprise(TS.model.enterprise.id);
          if (TS.model.team && TS.model.team.id) TS.clog.setTeam(TS.model.team.id);
          if (TS.model.user && TS.model.user.id) TS.clog.setUser(TS.model.user.id);
        }
      };
    })();
  }
}, [210]);
