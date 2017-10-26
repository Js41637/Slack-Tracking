webpackJsonp([81], {
  342: function(e, n, r) {
    (function(n) {
      e.exports = n["parseMessageFormatString"] = r(343);
    }).call(n, r(7));
  },
  343: function(e, n, r) {
    var t;
    var t;
    (function(n) {
      if (true) e.exports = n();
      else if ("function" === typeof define && define.amd) define([], n);
      else {
        var r;
        if ("undefined" !== typeof window) r = window;
        else if ("undefined" !== typeof global) r = global;
        else if ("undefined" !== typeof self) r = self;
        else r = this;
        r.parseMessageFormatString = n();
      }
    })(function() {
      var e, n, r;
      return function e(n, r, i) {
        function o(a, d) {
          if (!r[a]) {
            if (!n[a]) {
              var l = "function" == typeof t && t;
              if (!d && l) return t(a, !0);
              if (s) return s(a, !0);
              var f = new Error("Cannot find module '" + a + "'");
              throw f.code = "MODULE_NOT_FOUND", f;
            }
            var x = r[a] = {
              exports: {}
            };
            n[a][0].call(x.exports, function(e) {
              var r = n[a][1][e];
              return o(r ? r : e);
            }, x, x.exports, e, n, r, i);
          }
          return r[a].exports;
        }
        var s = "function" == typeof t && t;
        for (var a = 0; a < i.length; a++) o(i[a]);
        return o;
      }({
        1: [function(e, n, r) {
          "use strict";
          n.exports = function e(n) {
            var r = {
              tokens: [],
              pattern: String(n),
              index: 0
            };
            try {
              h(r, "message");
              if (r.index < r.pattern.length) throw new Error("Unexpected symbol");
            } catch (e) {
              r.error = e;
            }
            return {
              tokens: r.tokens,
              lastIndex: r.index,
              error: r.error
            };
          };

          function t(e) {
            return "0" === e || "1" === e || "2" === e || "3" === e || "4" === e || "5" === e || "6" === e || "7" === e || "8" === e || "9" === e;
          }

          function i(e) {
            var n = e && e.charCodeAt(0);
            return n >= 9 && n <= 13 || 32 === n || 133 === n || 160 === n || 6158 === n || n >= 8192 && n <= 8205 || 8232 === n || 8233 === n || 8239 === n || 8287 === n || 8288 === n || 12288 === n || 65279 === n;
          }

          function o(e) {
            var n = e.index;
            var r = e.pattern;
            var t = r.length;
            while (e.index < t && i(r[e.index])) ++e.index;
            if (n < e.index) e.tokens.push(["space", r.slice(n, e.index)]);
          }

          function s(e, n) {
            var r = e.pattern;
            var t = r.length;
            var o = "plural" === n || "selectordinal" === n;
            var s = "style" === n;
            var a = e.index;
            var d;
            while (e.index < t) {
              d = r[e.index];
              if ("{" === d || "}" === d || o && "#" === d || s && i(d)) break;
              else if ("'" === d) {
                d = r[++e.index];
                if ("'" === d) ++e.index;
                else if ("{" === d || "}" === d || o && "#" === d || s && i(d))
                  while (++e.index < t) {
                    d = r[e.index];
                    if ("''" === r.slice(e.index, e.index + 2)) ++e.index;
                    else if ("'" === d) {
                      ++e.index;
                      break;
                    }
                  }
              } else ++e.index;
            }
            return r.slice(a, e.index);
          }

          function a(e) {
            var n = e.pattern;
            var r = n[e.index];
            if ("#" === r) {
              ++e.index;
              e.tokens.push(["#", "#"]);
              return;
            }
            if ("{" === r) {
              ++e.index;
              e.tokens.push(["{", "{"]);
            } else throw new Error("Expected { to start placeholder");
            o(e);
            d(e);
            o(e);
            r = n[e.index];
            if ("}" === r) {
              ++e.index;
              e.tokens.push([r, r]);
              return;
            } else if ("," === r) {
              ++e.index;
              e.tokens.push([r, r]);
            } else throw new Error("Expected , or }");
            o(e);
            var t = l(e);
            o(e);
            r = n[e.index];
            if ("}" === r) {
              ++e.index;
              e.tokens.push([r, r]);
              return;
            } else if ("," === r) {
              ++e.index;
              e.tokens.push([r, r]);
            } else throw new Error("Expected , or }");
            o(e);
            if ("plural" === t || "selectordinal" === t) {
              x(e);
              o(e);
              u(e, t);
            } else if ("select" === t) u(e, t);
            else f(e);
            o(e);
            r = n[e.index];
            if ("}" === r) {
              ++e.index;
              e.tokens.push([r, r]);
            } else throw new Error("Expected } to end the placeholder");
          }

          function d(e) {
            var n = e.pattern;
            var r = n.length;
            var t = e.index;
            while (e.index < r) {
              var o = n[e.index];
              if ("{" === o || "#" === o || "}" === o || "," === o || i(o)) break;
              ++e.index;
            }
            var s = n.slice(t, e.index);
            if (s) e.tokens.push(["id", s]);
            else throw new Error("Expected placeholder id");
            return s;
          }

          function l(e) {
            var n = e.pattern;
            var r;
            var t = ["number", "date", "time", "ordinal", "duration", "spellout", "plural", "selectordinal", "select"];
            for (var i = 0, o = t.length; i < o; ++i) {
              var s = t[i];
              if (n.slice(e.index, e.index + s.length) === s) {
                r = s;
                e.index += s.length;
                break;
              }
            }
            if (r) e.tokens.push(["type", r]);
            else throw new Error("Expected placeholder type:\n" + t.join(", "));
            return r;
          }

          function f(e) {
            var n = s(e, "style");
            if (n) e.tokens.push(["style", n]);
            else throw new Error("Expected a placeholder style name");
            return n;
          }

          function x(e) {
            var n = e.pattern;
            var r = n.length;
            if ("offset:" === n.slice(e.index, e.index + 7)) {
              e.index += 7;
              e.tokens.push(["offset", "offset"]);
              e.tokens.push([":", ":"]);
              o(e);
              var i = e.index;
              while (e.index < r && t(n[e.index])) ++e.index;
              if (i !== e.index) e.tokens.push(["number", n.slice(i, e.index)]);
              else throw new Error("Expected offset number");
            }
          }

          function u(e, n) {
            var r = e.pattern;
            var t = r.length;
            var i = false;
            var s = false;
            while (e.index < t && "}" !== r[e.index]) {
              var a = p(e);
              if ("other" === a) s = true;
              o(e);
              c(e, n);
              o(e);
              i = true;
            }
            if (!i) throw new Error("Expected " + n + " message options");
            else if (!s) throw new Error("Expected " + n + ' to have an "other" option');
          }

          function p(e) {
            var n = e.index;
            var r = e.pattern;
            var t = r.length;
            while (e.index < t) {
              var o = r[e.index];
              if ("}" === o || "," === o || "{" === o || i(o)) break;
              ++e.index;
            }
            var s = r.slice(n, e.index);
            if (s) e.tokens.push(["selector", s]);
            else throw new Error("Expected option selector");
            return s;
          }

          function c(e, n) {
            var r = e.pattern[e.index];
            if ("{" !== r) throw new Error("Expected { to start sub message");
            ++e.index;
            e.tokens.push([r, r]);
            h(e, n);
            r = e.pattern[e.index];
            if ("}" !== r) throw new Error("Expected } to end sub message");
            ++e.index;
            e.tokens.push([r, r]);
          }

          function h(e, n) {
            var r = e.tokens;
            var t = e.pattern;
            var i = t.length;
            var o;
            if (o = s(e, n)) r.push(["text", o]);
            while (e.index < i && "}" !== t[e.index]) {
              a(e);
              if (o = s(e, n)) r.push(["text", o]);
            }
            return r;
          }
        }, {}]
      }, {}, [1])(1);
    });
  },
  7: function(e, n) {
    var r;
    r = function() {
      return this;
    }();
    try {
      r = r || Function("return this")() || (0, eval)("this");
    } catch (e) {
      if ("object" === typeof window) r = window;
    }
    e.exports = r;
  }
}, [342]);
