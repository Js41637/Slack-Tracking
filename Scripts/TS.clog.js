webpackJsonp([450], {
  3640: function(t, e) {
    (function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function t() {
          a = TS.log && TS.has_pri[a] ? a : null;
          var e = 30 * 1e3;
          var r = 5 * 1e3;
          var n = Math.floor(Math.random() * r);
          setInterval(g, e + n);
          $(window).on("beforeunload pagehide", g);
          $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', d);
          p();
          TS.clog.flush();
        },
        setUser: function t(e) {
          c = e;
        },
        setTeam: function t(e) {
          o = e;
        },
        setEnterprise: function t(e) {
          i = e;
        },
        toggleDebugMode: function t() {
          l = !l;
          return l;
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
            detectClogEndpoint: s,
            getLogs: function t() {
              return n;
            },
            getClogEndpoint: function e() {
              return t;
            },
            reset: function e() {
              n = [];
              t = undefined;
            }
          };
        },
        parseParams: function t(e) {
          if (!e) return {};
          e = e.split(",");
          var r = {};
          var a = 0;
          var n = e.length;
          var o;
          for (a; a < n; a += 1) {
            o = e[a].split("=");
            r[o[0]] = o[1];
          }
          return r;
        }
      });
      var t;
      var e = 2e3;
      var r = 1e3;
      var a = r;
      var n = [];
      var o;
      var i;
      var c;
      var l = false;
      var s = function e(r) {
        var a = r.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        var n = r.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
        var o = r.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
        if (a) {
          t = "https://" + a[2] + ".slack.com/clog/track/";
        } else if (n) {
          t = "https://" + n[2] + ".slack.com/clog/track/";
        } else if (o) {
          t = "https://staging.slack.com/clog/track/";
        } else {
          t = "https://slack.com/clog/track/";
        }
      };
      var u = function t(e, s) {
        if (typeof e !== "string") return;
        if (!s) s = null;
        var u = {
          tstamp: Date.now(),
          event: e,
          args: s
        };
        p();
        if (o) u.team_id = o;
        if (i) u.enterprise_id = i;
        if (c) u.user_id = c;
        n.push(u);
        if (TS.log) {
          if (l) TS.console.log(r, u);
          if (TS.has_pri[a]) TS.log(a, "Event called:", e, s);
        } else if (l) {
          try {
            console.log(u);
          } catch (t) {}
        }
      };
      var g = function t() {
        if (n.length === 0) return;
        if (TS.log && TS.has_pri[a]) {
          TS.log(a, "Sending clog data, emptying queue");
          TS.log(a, "Logs: ", n);
        }
        var e = f(n);
        var r;
        for (var o = 0; o < e.length; o += 1) {
          r = e[o];
          var i = new Image;
          i.src = r;
          if (TS.log && TS.has_pri[a]) TS.log(a, "Logged event: " + r);
        }
        n = [];
      };
      var f = function r(n) {
        if (!t) s(location.host);
        var o = [];
        var i = [];
        var c = "";
        var l = function e(r) {
          return t + "?logs=" + encodeURIComponent(JSON.stringify(r));
        };
        var u;
        for (var g = 0; g < n.length; g += 1) {
          u = n[g];
          i.push(u);
          c = l(i);
          if (c.length > e) {
            i.pop();
            o.push(l(i));
            i = [u];
          }
        }
        o.push(l(i));
        if (TS.log && TS.has_pri[a]) TS.log(a, "URLs:", o);
        return o;
      };
      var d = function t() {
        var e = this.getAttribute("data-clog-event");
        if (!e) {
          if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
          return;
        }
        var r = {};
        var a = TS.clog.parseParams(this.getAttribute("data-clog-params"));
        var n = this.getAttribute("data-clog-ui-action");
        if (n) {
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
            break;
          default:
            break;
        }
        r = v(a, r);
        TS.clog.track(e, r);
      };
      var v = function t(e, r) {
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
}, [3640]);
