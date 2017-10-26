webpackJsonp([305], {
  338: function(t, e) {
    (function() {
      TS.registerModule("clog", {
        onStart: function t() {
          r = TS.log && TS.has_pri[r] ? r : null;
          var e = 3e4;
          var n = 5e3;
          var o = Math.floor(Math.random() * n);
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
        track: function t(e, n) {
          g(e, n);
        },
        trackClick: function t(e, n, r) {
          $(e).on("click", function() {
            g(n, r);
          });
        },
        trackForm: function t(e, n, r) {
          $(e).on("submit", function() {
            g(n, r);
          });
        },
        trackClickWithContext: function t(e) {
          if (!e || !e.event) return;
          var n = {
            contexts: {}
          };
          if (e.element) n.contexts = {
            ui_context: {
              action: "click",
              ui_element: e.element
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
          var n = {};
          var r = 0;
          var o = e.length;
          var i;
          for (r; r < o; r += 1) {
            i = e[r].split("=");
            n[i[0]] = i[1];
          }
          return n;
        }
      });
      var t;
      var e = 2e3;
      var n = 1e3;
      var r = n;
      var o = [];
      var i;
      var a;
      var c;
      var l;
      var s = false;
      var u = function e(n) {
        var r = n.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        var o = n.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
        var i = n.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
        if (r) t = "https://" + r[2] + ".slack.com/clog/track/";
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
          if (s) TS.log(n, g);
          if (TS.has_pri[r]) TS.log(r, "Event called:", e, u);
        } else if (s) try {
          console.log(g);
        } catch (t) {}
      };
      var f = function t() {
        if (0 === o.length) return;
        if (TS.log && TS.has_pri[r]) {
          TS.log(r, "Sending clog data, emptying queue");
          TS.log(r, "Logs: ", o);
        }
        var e = v(o);
        var n;
        for (var i = 0; i < e.length; i += 1) {
          n = e[i];
          var a = new Image;
          a.src = n;
          if (TS.log && TS.has_pri[r]) TS.log(r, "Logged event: " + n);
        }
        o = [];
      };
      var v = function n(o) {
        if (!t) u(location.host);
        var i = [];
        var a = [];
        var c = "";
        var l = function e(n) {
          return t + "?logs=" + encodeURIComponent(JSON.stringify(n));
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
        if (TS.log && TS.has_pri[r]) TS.log(r, "URLs:", i);
        return i;
      };
      var d = function t() {
        var e = this.getAttribute("data-clog-event");
        if (!e) {
          if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
          return;
        }
        var n = {};
        var r = TS.clog.parseParams(this.getAttribute("data-clog-params"));
        var o = this.getAttribute("data-clog-ui-action");
        if (o) {
          n = {
            ui_element: this.getAttribute("data-clog-ui-element"),
            action: this.getAttribute("data-clog-ui-action"),
            step: this.getAttribute("data-clog-ui-step"),
            ui_component: this.getAttribute("data-clog-ui-component")
          };
          n = {
            contexts: {
              ui_context: n
            }
          };
        }
        switch (e.toUpperCase()) {
          case "WEBSITE_CLICK":
            r.page_url = location.href;
        }
        n = p(r, n);
        TS.clog.track(e, n);
      };
      var p = function t(e, n) {
        var r = {};
        Object.keys(e).forEach(function(t) {
          r[t] = e[t];
        });
        Object.keys(n).forEach(function(t) {
          r[t] = n[t];
        });
        return r;
      };
      var S = function t() {
        if (TS.redux) {
          var e = TS.redux.enterprise.getEnterpriseId();
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
}, [338]);
