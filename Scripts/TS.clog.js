webpackJsonp([329], {
  2289: function(t, e) {
    ! function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function() {
          c = TS.log && TS.has_pri[c] ? c : null;
          var t = Math.floor(5e3 * Math.random());
          setInterval(l, 3e4 + t), $(window).on("beforeunload pagehide", l), $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', g), f(), TS.clog.flush();
        },
        setUser: function(t) {
          n = t;
        },
        setTeam: function(t) {
          e = t;
        },
        setEnterprise: function(t) {
          o = t;
        },
        toggleDebugMode: function() {
          return r = !r;
        },
        track: function(t, e) {
          s(t, e);
        },
        trackClick: function(t, e, o) {
          $(t).on("click", function() {
            s(e, o);
          });
        },
        trackForm: function(t, e, o) {
          $(t).on("submit", function() {
            s(e, o);
          });
        },
        flush: function() {
          l();
        },
        test: function() {
          return {
            createLogURLs: u,
            sendDataAndEmptyQueue: l,
            detectClogEndpoint: a,
            getLogs: function() {
              return i;
            },
            getClogEndpoint: function() {
              return t;
            },
            reset: function() {
              i = [], t = void 0;
            }
          };
        },
        parseParams: function(t) {
          if (!t) return {};
          t = t.split(",");
          var e, o = {},
            n = 0,
            c = t.length;
          for (n; n < c; n += 1) e = t[n].split("="), o[e[0]] = e[1];
          return o;
        }
      });
      var t, e, o, n, c = 1e3,
        i = [],
        r = !1,
        a = function(e) {
          var o = e.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/),
            n = e.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/),
            c = e.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
          t = o ? "https://" + o[2] + ".slack.com/clog/track/" : n ? "https://" + n[2] + ".slack.com/clog/track/" : c ? "https://staging.slack.com/clog/track/" : "https://slack.com/clog/track/";
        },
        s = function(t, a) {
          if ("string" == typeof t) {
            a || (a = null);
            var s = {
              tstamp: Date.now(),
              event: t,
              args: a
            };
            if (f(), e && (s.team_id = e), o && (s.enterprise_id = o), n && (s.user_id = n), i.push(s), TS.log) r && TS.console.log(1e3, s), TS.has_pri[c] && TS.log(c, "Event called:", t, a);
            else if (r) try {
              console.log(s);
            } catch (t) {}
          }
        },
        l = function() {
          if (0 !== i.length) {
            TS.log && TS.has_pri[c] && (TS.log(c, "Sending clog data, emptying queue"), TS.log(c, "Logs: ", i));
            for (var t, e = u(i), o = 0; o < e.length; o += 1) {
              t = e[o];
              (new Image).src = t, TS.log && TS.has_pri[c] && TS.log(c, "Logged event: " + t);
            }
            i = [];
          }
        },
        u = function(e) {
          t || a(location.host);
          for (var o, n = [], i = [], r = "", s = function(e) {
              return t + "?logs=" + encodeURIComponent(JSON.stringify(e));
            }, l = 0; l < e.length; l += 1) o = e[l], i.push(o), r = s(i), r.length > 2e3 && (i.pop(), n.push(s(i)), i = [o]);
          return n.push(s(i)), TS.log && TS.has_pri[c] && TS.log(c, "URLs:", n), n;
        },
        g = function() {
          var t = this.getAttribute("data-clog-event");
          if (!t) return void(TS.warn && TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute"));
          var e = {},
            o = TS.clog.parseParams(this.getAttribute("data-clog-params"));
          switch (this.getAttribute("data-clog-ui-action") && (e = {
            ui_element: this.getAttribute("data-clog-ui-element"),
            action: this.getAttribute("data-clog-ui-action"),
            step: this.getAttribute("data-clog-ui-step")
          }, e = {
            contexts: {
              ui_context: e
            }
          }), t.toUpperCase()) {
            case "WEBSITE_CLICK":
              o.page_url = location.href;
          }
          e = d(o, e), TS.clog.track(t, e);
        },
        d = function(t, e) {
          var o = {};
          return Object.keys(t).forEach(function(e) {
            o[e] = t[e];
          }), Object.keys(e).forEach(function(t) {
            o[t] = e[t];
          }), o;
        },
        f = function() {
          TS.model && (TS.model.enterprise && TS.model.enterprise.id && TS.clog.setEnterprise(TS.model.enterprise.id), TS.model.team && TS.model.team.id && TS.clog.setTeam(TS.model.team.id), TS.model.user && TS.model.user.id && TS.clog.setUser(TS.model.user.id));
        };
    }();
  }
}, [2289]);
