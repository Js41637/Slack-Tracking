webpackJsonp([80], {
  683: function(t, e, n) {
    (function(e) {
      t.exports = e["Ladda"] = n(684);
    }).call(e, n(7));
  },
  684: function(t, e, n) {
    /*!
     * Ladda 0.9.0
     * http://lab.hakim.se/ladda
     * MIT licensed
     *
     * Copyright (C) 2013 Hakim El Hattab, http://hakim.se
     *
     * Slack-specific changes to work around winssb problems. - PK
     */
    (function(e, n) {
      if (true) t.exports = n(window.Spinner);
      else if ("function" === typeof define && define.amd) define(["spin"], n);
      else e.Ladda = n(window.Spinner);
    })(this, function(t) {
      "use strict";
      var e = [];
      var n = /atomshell/i.test(navigator.userAgent);

      function i(t) {
        if ("undefined" === typeof t) {
          console.warn("Ladda button target must be defined.");
          return;
        }
        if (!t.querySelector(".ladda-label")) t.innerHTML = '<span class="ladda-label">' + t.innerHTML + "</span>";
        var i = u(t);
        var r = document.createElement("span");
        r.className = "ladda-spinner";
        t.appendChild(r);
        var a;
        var o = {
          start: function() {
            t.setAttribute("disabled", "");
            if (!n) t.setAttribute("data-loading", "");
            clearTimeout(a);
            if (!n) i.spin(r);
            this.setProgress(0);
            return this;
          },
          startAfter: function(t) {
            clearTimeout(a);
            a = setTimeout(function() {
              o.start();
            }, t);
            return this;
          },
          stop: function() {
            t.removeAttribute("disabled");
            t.removeAttribute("data-loading");
            clearTimeout(a);
            a = setTimeout(function() {
              i.stop();
            }, 1e3);
            return this;
          },
          toggle: function() {
            if (this.isLoading()) this.stop();
            else this.start();
            return this;
          },
          setProgress: function(e) {
            if (n) return;
            e = Math.max(Math.min(e, 1), 0);
            var i = t.querySelector(".ladda-progress");
            if (0 === e && i && i.parentNode) i.parentNode.removeChild(i);
            else {
              if (!i) {
                i = document.createElement("div");
                i.className = "ladda-progress";
                t.appendChild(i);
              }
              i.style.width = (e || 0) * t.offsetWidth + "px";
            }
          },
          enable: function() {
            this.stop();
            return this;
          },
          disable: function() {
            this.stop();
            t.setAttribute("disabled", "");
            return this;
          },
          isLoading: function() {
            return t.hasAttribute("data-loading");
          }
        };
        e.push(o);
        return o;
      }

      function r(t, e) {
        while (t.parentNode && t.tagName !== e) t = t.parentNode;
        return t;
      }

      function a(t) {
        var e = ["input", "textarea"];
        var n = [];
        for (var i = 0; i < e.length; i++) {
          var r = t.getElementsByTagName(e[i]);
          for (var a = 0; a < r.length; a++)
            if (r[a].hasAttribute("required")) n.push(r[a]);
        }
        return n;
      }

      function o(t, e) {
        e = e || {};
        var n = [];
        if ("string" === typeof t) n = f(document.querySelectorAll(t));
        else if ("object" === typeof t && "string" === typeof t.nodeName) n = [t];
        for (var o = 0, s = n.length; o < s; o++)(function() {
          var t = n[o];
          if ("function" === typeof t.addEventListener) {
            var s = i(t);
            var u = -1;
            t.addEventListener("click", function(n) {
              var i = true;
              var o = r(t, "FORM");
              var f = a(o);
              if (o && o.checkValidity) i = o.checkValidity();
              else
                for (var l = 0; l < f.length; l++)
                  if ("" === f[l].value.replace(/^\s+|\s+$/g, "")) i = false;
              if (i) {
                s.startAfter(1);
                if ("number" === typeof e.timeout) {
                  clearTimeout(u);
                  u = setTimeout(s.stop, e.timeout);
                }
                if ("function" === typeof e.callback) e.callback.apply(null, [s]);
              }
            }, false);
          }
        })();
      }

      function s() {
        for (var t = 0, n = e.length; t < n; t++) e[t].stop();
      }

      function u(e) {
        var n = e.offsetHeight,
          i;
        if (n > 32) n *= .8;
        if (e.hasAttribute("data-spinner-size")) n = parseInt(e.getAttribute("data-spinner-size"), 10);
        if (e.hasAttribute("data-spinner-color")) i = e.getAttribute("data-spinner-color");
        var r = 12,
          a = .2 * n,
          o = .6 * a,
          s = a < 7 ? 2 : 3;
        return new t({
          color: i || "#fff",
          lines: r,
          radius: a,
          length: o,
          width: s,
          zIndex: "auto",
          top: "auto",
          left: "auto",
          className: ""
        });
      }

      function f(t) {
        var e = [];
        for (var n = 0; n < t.length; n++) e.push(t[n]);
        return e;
      }
      return {
        bind: o,
        create: i,
        stopAll: s
      };
    });
  },
  7: function(t, e) {
    var n;
    n = function() {
      return this;
    }();
    try {
      n = n || Function("return this")() || (0, eval)("this");
    } catch (t) {
      if ("object" === typeof window) n = window;
    }
    t.exports = n;
  }
}, [683]);
