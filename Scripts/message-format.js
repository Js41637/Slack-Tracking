webpackJsonp([77], {
  192: function(r, n, a) {
    (function(n) {
      r.exports = n["MessageFormat"] = a(193);
    }).call(n, a(7));
  },
  193: function(r, n, a) {
    var e;
    var e;
    (function(n) {
      if (true) r.exports = n();
      else if ("function" === typeof define && define.amd) define([], n);
      else {
        var a;
        if ("undefined" !== typeof window) a = window;
        else if ("undefined" !== typeof global) a = global;
        else if ("undefined" !== typeof self) a = self;
        else a = this;
        a.MessageFormat = n();
      }
    })(function() {
      var r, n, a;
      return function r(n, a, t) {
        function i(l, c) {
          if (!a[l]) {
            if (!n[l]) {
              var u = "function" == typeof e && e;
              if (!c && u) return e(l, !0);
              if (o) return o(l, !0);
              var d = new Error("Cannot find module '" + l + "'");
              throw d.code = "MODULE_NOT_FOUND", d;
            }
            var f = a[l] = {
              exports: {}
            };
            n[l][0].call(f.exports, function(r) {
              var a = n[l][1][r];
              return i(a ? a : r);
            }, f, f.exports, r, n, a, t);
          }
          return a[l].exports;
        }
        var o = "function" == typeof e && e;
        for (var l = 0; l < t.length; l++) i(t[l]);
        return i;
      }({
        1: [function(r, n, a) {
          n.exports = {
            number: {
              decimal: {
                style: "decimal"
              },
              integer: {
                style: "decimal",
                maximumFractionDigits: 0
              },
              currency: {
                style: "currency",
                currency: "USD"
              },
              percent: {
                style: "percent"
              },
              default: {
                style: "decimal"
              }
            },
            date: {
              short: {
                month: "numeric",
                day: "numeric",
                year: "2-digit"
              },
              medium: {
                month: "short",
                day: "numeric",
                year: "numeric"
              },
              long: {
                month: "long",
                day: "numeric",
                year: "numeric"
              },
              full: {
                month: "long",
                day: "numeric",
                year: "numeric",
                weekday: "long"
              },
              default: {
                month: "short",
                day: "numeric",
                year: "numeric"
              }
            },
            time: {
              short: {
                hour: "numeric",
                minute: "numeric"
              },
              medium: {
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
              },
              long: {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                timeZoneName: "short"
              },
              full: {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                timeZoneName: "short"
              },
              default: {
                hour: "numeric",
                minute: "numeric",
                second: "numeric"
              }
            }
          };
        }, {}],
        2: [function(r, n, a) {
          "use strict";
          var e = r("format-message-formats");
          var t = r("lookup-closest-locale");
          var i = r("./plurals");
          n.exports = function r(n, a) {
            return o(n, a);
          };
          n.exports.closestSupportedLocale = function(r) {
            return t(r, i);
          };

          function o(r, n, a) {
            n = n.map(function(n) {
              return l(r, n, a);
            });
            if (1 === n.length) return n[0];
            return function r(a) {
              var e = "";
              for (var t = 0, i = n.length; t < i; ++t) e += "string" === typeof n[t] ? n[t] : n[t](a);
              return e;
            };
          }

          function l(r, n, a) {
            if ("string" === typeof n) return n;
            var e = n[0];
            var t = n[1];
            var i = n[2];
            var o = 0;
            var l;
            if ("#" === e) {
              e = a[0];
              t = "number";
              o = a[2];
              i = null;
            }
            switch (t) {
              case "number":
              case "ordinal":
              case "spellout":
              case "duration":
                return u(r, e, o, i);
              case "date":
              case "time":
                return d(r, e, t, i);
              case "plural":
              case "selectordinal":
                o = n[2];
                l = n[3];
                return f(r, e, t, o, l);
              case "select":
                return s(r, e, i);
              default:
                return h(e);
            }
          }

          function c(r, n, a) {
            var t = e[r][n] || e[r].default;
            var i = t.cache || (t.cache = {});
            var o = i[a] || (i[a] = "number" === r ? Intl.NumberFormat(a, t).format : Intl.DateTimeFormat(a, t).format);
            return o;
          }

          function u(r, n, a, e) {
            a = a || 0;
            var t = c("number", e, r);
            return function r(e) {
              return t(+v(n, e) - a);
            };
          }

          function d(r, n, a, e) {
            var t = c(a, e, r);
            return function r(a) {
              return t(v(n, a));
            };
          }

          function f(r, n, a, e, l) {
            var c = [n, a, e];
            var u = {};
            Object.keys(l).forEach(function(n) {
              u[n] = o(r, l[n], c);
            });
            var d = t(r, i);
            var f = "selectordinal" === a ? i[d].ordinal : i[d].cardinal;
            if (!f) return u.other;
            return function r(a) {
              var t = u["=" + +v(n, a)] || u[f(v(n, a) - e)] || u.other;
              if ("string" === typeof t) return t;
              return t(a);
            };
          }

          function s(r, n, a) {
            var e = {};
            Object.keys(a).forEach(function(n) {
              e[n] = o(r, a[n], null);
            });
            return function r(a) {
              var t = e[v(n, a)] || e.other;
              if ("string" === typeof t) return t;
              return t(a);
            };
          }

          function h(r) {
            return function n(a) {
              return "" + v(r, a);
            };
          }

          function v(r, n) {
            if (void 0 !== n[r]) return n[r];
            var a = r.split(".");
            if (a.length > 1) {
              var e = 0;
              var t = a.length;
              var i = n;
              for (e; e < t; e++) {
                i = i[a[e]];
                if (void 0 === i) return;
              }
              return i;
            }
          }
        }, {
          "./plurals": 3,
          "format-message-formats": 1,
          "lookup-closest-locale": 4
        }],
        3: [function(r, n, a) {
          "use strict";
          var e = [function(r) {
            var n = +r;
            return 1 === n ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 0 <= n && n <= 1 ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = +r;
            return 0 === n || 1 === a ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 0 === n ? "zero" : 1 === n ? "one" : 2 === n ? "two" : 3 <= n % 100 && n % 100 <= 10 ? "few" : 11 <= n % 100 && n % 100 <= 99 ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            return 1 === n && 0 === a ? "one" : "other";
          }, function(r) {
            var n = +r;
            return n % 10 === 1 && n % 100 !== 11 ? "one" : 2 <= n % 10 && n % 10 <= 4 && (n % 100 < 12 || 14 < n % 100) ? "few" : n % 10 === 0 || 5 <= n % 10 && n % 10 <= 9 || 11 <= n % 100 && n % 100 <= 14 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return n % 10 === 1 && n % 100 !== 11 && n % 100 !== 71 && n % 100 !== 91 ? "one" : n % 10 === 2 && n % 100 !== 12 && n % 100 !== 72 && n % 100 !== 92 ? "two" : (3 <= n % 10 && n % 10 <= 4 || n % 10 === 9) && (n % 100 < 10 || 19 < n % 100) && (n % 100 < 70 || 79 < n % 100) && (n % 100 < 90 || 99 < n % 100) ? "few" : 0 !== n && n % 1e6 === 0 ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            var e = +(r + ".").split(".")[1];
            return 0 === a && n % 10 === 1 && n % 100 !== 11 || e % 10 === 1 && e % 100 !== 11 ? "one" : 0 === a && 2 <= n % 10 && n % 10 <= 4 && (n % 100 < 12 || 14 < n % 100) || 2 <= e % 10 && e % 10 <= 4 && (e % 100 < 12 || 14 < e % 100) ? "few" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            return 1 === n && 0 === a ? "one" : 2 <= n && n <= 4 && 0 === a ? "few" : 0 !== a ? "many" : "other";
          }, function(r) {
            var n = +r;
            return 0 === n ? "zero" : 1 === n ? "one" : 2 === n ? "two" : 3 === n ? "few" : 6 === n ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = +("" + r).replace(/^[^.]*.?|0+$/g, "");
            var e = +r;
            return 1 === e || 0 !== a && (0 === n || 1 === n) ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            var e = +(r + ".").split(".")[1];
            return 0 === a && n % 100 === 1 || e % 100 === 1 ? "one" : 0 === a && n % 100 === 2 || e % 100 === 2 ? "two" : 0 === a && 3 <= n % 100 && n % 100 <= 4 || 3 <= e % 100 && e % 100 <= 4 ? "few" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            return 0 === n || 1 === n ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            var e = +(r + ".").split(".")[1];
            return 0 === a && (1 === n || 2 === n || 3 === n) || 0 === a && n % 10 !== 4 && n % 10 !== 6 && n % 10 !== 9 || 0 !== a && e % 10 !== 4 && e % 10 !== 6 && e % 10 !== 9 ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n ? "one" : 2 === n ? "two" : 3 <= n && n <= 6 ? "few" : 7 <= n && n <= 10 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n || 11 === n ? "one" : 2 === n || 12 === n ? "two" : 3 <= n && n <= 10 || 13 <= n && n <= 19 ? "few" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            return 0 === a && n % 10 === 1 ? "one" : 0 === a && n % 10 === 2 ? "two" : 0 === a && (n % 100 === 0 || n % 100 === 20 || n % 100 === 40 || n % 100 === 60 || n % 100 === 80) ? "few" : 0 !== a ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            var e = +r;
            return 1 === n && 0 === a ? "one" : 2 === n && 0 === a ? "two" : 0 === a && (e < 0 || 10 < e) && e % 10 === 0 ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = +("" + r).replace(/^[^.]*.?|0+$/g, "");
            return 0 === a && n % 10 === 1 && n % 100 !== 11 || 0 !== a ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n ? "one" : 2 === n ? "two" : "other";
          }, function(r) {
            var n = +r;
            return 0 === n ? "zero" : 1 === n ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = +r;
            return 0 === a ? "zero" : (0 === n || 1 === n) && 0 !== a ? "one" : "other";
          }, function(r) {
            var n = +(r + ".").split(".")[1];
            var a = +r;
            return a % 10 === 1 && (a % 100 < 11 || 19 < a % 100) ? "one" : 2 <= a % 10 && a % 10 <= 9 && (a % 100 < 11 || 19 < a % 100) ? "few" : 0 !== n ? "many" : "other";
          }, function(r) {
            var n = (r + ".").split(".")[1].length;
            var a = +(r + ".").split(".")[1];
            var e = +r;
            return e % 10 === 0 || 11 <= e % 100 && e % 100 <= 19 || 2 === n && 11 <= a % 100 && a % 100 <= 19 ? "zero" : e % 10 === 1 && e % 100 !== 11 || 2 === n && a % 10 === 1 && a % 100 !== 11 || 2 !== n && a % 10 === 1 ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            var e = +(r + ".").split(".")[1];
            return 0 === a && n % 10 === 1 || e % 10 === 1 ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            var e = +r;
            return 1 === n && 0 === a ? "one" : 0 !== a || 0 === e || 1 !== e && 1 <= e % 100 && e % 100 <= 19 ? "few" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n ? "one" : 0 === n || 2 <= n % 100 && n % 100 <= 10 ? "few" : 11 <= n % 100 && n % 100 <= 19 ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            return 1 === n && 0 === a ? "one" : 0 === a && 2 <= n % 10 && n % 10 <= 4 && (n % 100 < 12 || 14 < n % 100) ? "few" : 0 === a && 1 !== n && 0 <= n % 10 && n % 10 <= 1 || 0 === a && 5 <= n % 10 && n % 10 <= 9 || 0 === a && 12 <= n % 100 && n % 100 <= 14 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return 0 <= n && n <= 2 && 2 !== n ? "one" : "other";
          }, function(r) {
            var n = (r + ".").split(".")[1].length;
            var a = +r;
            return 1 === a && 0 === n ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            return 0 === a && n % 10 === 1 && n % 100 !== 11 ? "one" : 0 === a && 2 <= n % 10 && n % 10 <= 4 && (n % 100 < 12 || 14 < n % 100) ? "few" : 0 === a && n % 10 === 0 || 0 === a && 5 <= n % 10 && n % 10 <= 9 || 0 === a && 11 <= n % 100 && n % 100 <= 14 ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = +r;
            return 0 === n || 1 === a ? "one" : 2 <= a && a <= 10 ? "few" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = +(r + ".").split(".")[1];
            var e = +r;
            return 0 === e || 1 === e || 0 === n && 1 === a ? "one" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            var a = (r + ".").split(".")[1].length;
            return 0 === a && n % 100 === 1 ? "one" : 0 === a && n % 100 === 2 ? "two" : 0 === a && 3 <= n % 100 && n % 100 <= 4 || 0 !== a ? "few" : "other";
          }, function(r) {
            var n = +r;
            return 0 <= n && n <= 1 || 11 <= n && n <= 99 ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n || 5 === n || 7 === n || 8 === n || 9 === n || 10 === n ? "one" : 2 === n || 3 === n ? "two" : 4 === n ? "few" : 6 === n ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            return n % 10 === 1 || n % 10 === 2 || n % 10 === 5 || n % 10 === 7 || n % 10 === 8 || n % 100 === 20 || n % 100 === 50 || n % 100 === 70 || n % 100 === 80 ? "one" : n % 10 === 3 || n % 10 === 4 || n % 1e3 === 100 || n % 1e3 === 200 || n % 1e3 === 300 || n % 1e3 === 400 || n % 1e3 === 500 || n % 1e3 === 600 || n % 1e3 === 700 || n % 1e3 === 800 || n % 1e3 === 900 ? "few" : 0 === n || n % 10 === 6 || n % 100 === 40 || n % 100 === 60 || n % 100 === 90 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return (n % 10 === 2 || n % 10 === 3) && n % 100 !== 12 && n % 100 !== 13 ? "few" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n || 3 === n ? "one" : 2 === n ? "two" : 4 === n ? "few" : "other";
          }, function(r) {
            var n = +r;
            return 0 === n || 7 === n || 8 === n || 9 === n ? "zero" : 1 === n ? "one" : 2 === n ? "two" : 3 === n || 4 === n ? "few" : 5 === n || 6 === n ? "many" : "other";
          }, function(r) {
            var n = +r;
            return n % 10 === 1 && n % 100 !== 11 ? "one" : n % 10 === 2 && n % 100 !== 12 ? "two" : n % 10 === 3 && n % 100 !== 13 ? "few" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n ? "one" : 2 === n || 3 === n ? "two" : 4 === n ? "few" : 6 === n ? "many" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n || 5 === n ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 11 === n || 8 === n || 80 === n || 800 === n ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            return 1 === n ? "one" : 0 === n || 2 <= n % 100 && n % 100 <= 20 || n % 100 === 40 || n % 100 === 60 || n % 100 === 80 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return n % 10 === 6 || n % 10 === 9 || n % 10 === 0 && 0 !== n ? "many" : "other";
          }, function(r) {
            var n = Math.floor(Math.abs(+r));
            return n % 10 === 1 && n % 100 !== 11 ? "one" : n % 10 === 2 && n % 100 !== 12 ? "two" : (n % 10 === 7 || n % 10 === 8) && n % 100 !== 17 && n % 100 !== 18 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n ? "one" : 2 === n || 3 === n ? "two" : 4 === n ? "few" : "other";
          }, function(r) {
            var n = +r;
            return 1 <= n && n <= 4 ? "one" : "other";
          }, function(r) {
            var n = +r;
            return 1 === n ? "one" : n % 10 === 4 && n % 100 !== 14 ? "many" : "other";
          }, function(r) {
            var n = +r;
            return (n % 10 === 1 || n % 10 === 2) && n % 100 !== 11 && n % 100 !== 12 ? "one" : "other";
          }, function(r) {
            var n = +r;
            return n % 10 === 3 && n % 100 !== 13 ? "few" : "other";
          }];
          n.exports = {
            af: {
              cardinal: e[0]
            },
            ak: {
              cardinal: e[1]
            },
            am: {
              cardinal: e[2]
            },
            ar: {
              cardinal: e[3]
            },
            as: {
              cardinal: e[2],
              ordinal: e[35]
            },
            asa: {
              cardinal: e[0]
            },
            ast: {
              cardinal: e[4]
            },
            az: {
              cardinal: e[0],
              ordinal: e[36]
            },
            be: {
              cardinal: e[5],
              ordinal: e[37]
            },
            bem: {
              cardinal: e[0]
            },
            bez: {
              cardinal: e[0]
            },
            bg: {
              cardinal: e[0]
            },
            bh: {
              cardinal: e[1]
            },
            bn: {
              cardinal: e[2],
              ordinal: e[35]
            },
            br: {
              cardinal: e[6]
            },
            brx: {
              cardinal: e[0]
            },
            bs: {
              cardinal: e[7]
            },
            ca: {
              cardinal: e[4],
              ordinal: e[38]
            },
            ce: {
              cardinal: e[0]
            },
            cgg: {
              cardinal: e[0]
            },
            chr: {
              cardinal: e[0]
            },
            ckb: {
              cardinal: e[0]
            },
            cs: {
              cardinal: e[8]
            },
            cy: {
              cardinal: e[9],
              ordinal: e[39]
            },
            da: {
              cardinal: e[10]
            },
            de: {
              cardinal: e[4]
            },
            dsb: {
              cardinal: e[11]
            },
            dv: {
              cardinal: e[0]
            },
            ee: {
              cardinal: e[0]
            },
            el: {
              cardinal: e[0]
            },
            en: {
              cardinal: e[4],
              ordinal: e[40]
            },
            eo: {
              cardinal: e[0]
            },
            es: {
              cardinal: e[0]
            },
            et: {
              cardinal: e[4]
            },
            eu: {
              cardinal: e[0]
            },
            fa: {
              cardinal: e[2]
            },
            ff: {
              cardinal: e[12]
            },
            fi: {
              cardinal: e[4]
            },
            fil: {
              cardinal: e[13],
              ordinal: e[0]
            },
            fo: {
              cardinal: e[0]
            },
            fr: {
              cardinal: e[12],
              ordinal: e[0]
            },
            fur: {
              cardinal: e[0]
            },
            fy: {
              cardinal: e[4]
            },
            ga: {
              cardinal: e[14],
              ordinal: e[0]
            },
            gd: {
              cardinal: e[15]
            },
            gl: {
              cardinal: e[4]
            },
            gsw: {
              cardinal: e[0]
            },
            gu: {
              cardinal: e[2],
              ordinal: e[41]
            },
            guw: {
              cardinal: e[1]
            },
            gv: {
              cardinal: e[16]
            },
            ha: {
              cardinal: e[0]
            },
            haw: {
              cardinal: e[0]
            },
            he: {
              cardinal: e[17]
            },
            hi: {
              cardinal: e[2],
              ordinal: e[41]
            },
            hr: {
              cardinal: e[7]
            },
            hsb: {
              cardinal: e[11]
            },
            hu: {
              cardinal: e[0],
              ordinal: e[42]
            },
            hy: {
              cardinal: e[12],
              ordinal: e[0]
            },
            is: {
              cardinal: e[18]
            },
            it: {
              cardinal: e[4],
              ordinal: e[43]
            },
            iu: {
              cardinal: e[19]
            },
            iw: {
              cardinal: e[17]
            },
            jgo: {
              cardinal: e[0]
            },
            ji: {
              cardinal: e[4]
            },
            jmc: {
              cardinal: e[0]
            },
            ka: {
              cardinal: e[0],
              ordinal: e[44]
            },
            kab: {
              cardinal: e[12]
            },
            kaj: {
              cardinal: e[0]
            },
            kcg: {
              cardinal: e[0]
            },
            kk: {
              cardinal: e[0],
              ordinal: e[45]
            },
            kkj: {
              cardinal: e[0]
            },
            kl: {
              cardinal: e[0]
            },
            kn: {
              cardinal: e[2]
            },
            ks: {
              cardinal: e[0]
            },
            ksb: {
              cardinal: e[0]
            },
            ksh: {
              cardinal: e[20]
            },
            ku: {
              cardinal: e[0]
            },
            kw: {
              cardinal: e[19]
            },
            ky: {
              cardinal: e[0]
            },
            lag: {
              cardinal: e[21]
            },
            lb: {
              cardinal: e[0]
            },
            lg: {
              cardinal: e[0]
            },
            ln: {
              cardinal: e[1]
            },
            lt: {
              cardinal: e[22]
            },
            lv: {
              cardinal: e[23]
            },
            mas: {
              cardinal: e[0]
            },
            mg: {
              cardinal: e[1]
            },
            mgo: {
              cardinal: e[0]
            },
            mk: {
              cardinal: e[24],
              ordinal: e[46]
            },
            ml: {
              cardinal: e[0]
            },
            mn: {
              cardinal: e[0]
            },
            mo: {
              cardinal: e[25],
              ordinal: e[0]
            },
            mr: {
              cardinal: e[2],
              ordinal: e[47]
            },
            mt: {
              cardinal: e[26]
            },
            nah: {
              cardinal: e[0]
            },
            naq: {
              cardinal: e[19]
            },
            nb: {
              cardinal: e[0]
            },
            nd: {
              cardinal: e[0]
            },
            ne: {
              cardinal: e[0],
              ordinal: e[48]
            },
            nl: {
              cardinal: e[4]
            },
            nn: {
              cardinal: e[0]
            },
            nnh: {
              cardinal: e[0]
            },
            no: {
              cardinal: e[0]
            },
            nr: {
              cardinal: e[0]
            },
            nso: {
              cardinal: e[1]
            },
            ny: {
              cardinal: e[0]
            },
            nyn: {
              cardinal: e[0]
            },
            om: {
              cardinal: e[0]
            },
            or: {
              cardinal: e[0]
            },
            os: {
              cardinal: e[0]
            },
            pa: {
              cardinal: e[1]
            },
            pap: {
              cardinal: e[0]
            },
            pl: {
              cardinal: e[27]
            },
            prg: {
              cardinal: e[23]
            },
            ps: {
              cardinal: e[0]
            },
            pt: {
              cardinal: e[28]
            },
            "pt-PT": {
              cardinal: e[29]
            },
            rm: {
              cardinal: e[0]
            },
            ro: {
              cardinal: e[25],
              ordinal: e[0]
            },
            rof: {
              cardinal: e[0]
            },
            ru: {
              cardinal: e[30]
            },
            rwk: {
              cardinal: e[0]
            },
            saq: {
              cardinal: e[0]
            },
            sdh: {
              cardinal: e[0]
            },
            se: {
              cardinal: e[19]
            },
            seh: {
              cardinal: e[0]
            },
            sh: {
              cardinal: e[7]
            },
            shi: {
              cardinal: e[31]
            },
            si: {
              cardinal: e[32]
            },
            sk: {
              cardinal: e[8]
            },
            sl: {
              cardinal: e[33]
            },
            sma: {
              cardinal: e[19]
            },
            smi: {
              cardinal: e[19]
            },
            smj: {
              cardinal: e[19]
            },
            smn: {
              cardinal: e[19]
            },
            sms: {
              cardinal: e[19]
            },
            sn: {
              cardinal: e[0]
            },
            so: {
              cardinal: e[0]
            },
            sq: {
              cardinal: e[0],
              ordinal: e[49]
            },
            sr: {
              cardinal: e[7]
            },
            ss: {
              cardinal: e[0]
            },
            ssy: {
              cardinal: e[0]
            },
            st: {
              cardinal: e[0]
            },
            sv: {
              cardinal: e[4],
              ordinal: e[50]
            },
            sw: {
              cardinal: e[4]
            },
            syr: {
              cardinal: e[0]
            },
            ta: {
              cardinal: e[0]
            },
            te: {
              cardinal: e[0]
            },
            teo: {
              cardinal: e[0]
            },
            ti: {
              cardinal: e[1]
            },
            tig: {
              cardinal: e[0]
            },
            tk: {
              cardinal: e[0]
            },
            tl: {
              cardinal: e[13],
              ordinal: e[0]
            },
            tn: {
              cardinal: e[0]
            },
            tr: {
              cardinal: e[0]
            },
            ts: {
              cardinal: e[0]
            },
            tzm: {
              cardinal: e[34]
            },
            ug: {
              cardinal: e[0]
            },
            uk: {
              cardinal: e[30],
              ordinal: e[51]
            },
            ur: {
              cardinal: e[4]
            },
            uz: {
              cardinal: e[0]
            },
            ve: {
              cardinal: e[0]
            },
            vo: {
              cardinal: e[0]
            },
            vun: {
              cardinal: e[0]
            },
            wa: {
              cardinal: e[1]
            },
            wae: {
              cardinal: e[0]
            },
            xh: {
              cardinal: e[0]
            },
            xog: {
              cardinal: e[0]
            },
            yi: {
              cardinal: e[4]
            },
            zu: {
              cardinal: e[2]
            },
            lo: {
              ordinal: e[0]
            },
            ms: {
              ordinal: e[0]
            },
            vi: {
              ordinal: e[0]
            }
          };
        }, {}],
        4: [function(r, n, a) {
          n.exports = function r(n, a) {
            if (a[n]) return n;
            var e = [].concat(n || []);
            for (var t = 0, i = e.length; t < i; ++t) {
              var o = e[t].split("-");
              while (o.length) {
                if (o.join("-") in a) return o.join("-");
                o.pop();
              }
            }
            return "en";
          };
        }, {}],
        5: [function(r, n, a) {
          "use strict";
          n.exports = function r(n) {
            if ("string" !== typeof n) throw new w("Pattern must be a string");
            return m({
              pattern: n,
              index: 0
            }, "message");
          };

          function e(r) {
            return "0" === r || "1" === r || "2" === r || "3" === r || "4" === r || "5" === r || "6" === r || "7" === r || "8" === r || "9" === r;
          }

          function t(r) {
            var n = r && r.charCodeAt(0);
            return n >= 9 && n <= 13 || 32 === n || 133 === n || 160 === n || 6158 === n || n >= 8192 && n <= 8205 || 8232 === n || 8233 === n || 8239 === n || 8287 === n || 8288 === n || 12288 === n || 65279 === n;
          }

          function i(r) {
            var n = r.pattern;
            var a = n.length;
            while (r.index < a && t(n[r.index])) ++r.index;
          }

          function o(r, n) {
            var a = r.pattern;
            var e = a.length;
            var i = "plural" === n || "selectordinal" === n;
            var o = "style" === n;
            var l = "";
            var c;
            while (r.index < e) {
              c = a[r.index];
              if ("{" === c || "}" === c || i && "#" === c || o && t(c)) break;
              else if ("'" === c) {
                c = a[++r.index];
                if ("'" === c) {
                  l += c;
                  ++r.index;
                } else if ("{" === c || "}" === c || i && "#" === c || o && t(c)) {
                  l += c;
                  while (++r.index < e) {
                    c = a[r.index];
                    if ("''" === a.slice(r.index, r.index + 2)) {
                      l += c;
                      ++r.index;
                    } else if ("'" === c) {
                      ++r.index;
                      break;
                    } else l += c;
                  }
                } else l += "'";
              } else {
                l += c;
                ++r.index;
              }
            }
            return l;
          }

          function l(r) {
            var n = r.pattern;
            if ("#" === n[r.index]) {
              ++r.index;
              return ["#"];
            }++r.index;
            var a = c(r);
            var e = n[r.index];
            if ("}" === e) {
              ++r.index;
              return [a];
            }
            if ("," !== e) p(r, ",");
            ++r.index;
            var t = u(r);
            e = n[r.index];
            if ("}" === e) {
              if ("plural" === t || "selectordinal" === t || "select" === t) p(r, t + " message options");
              ++r.index;
              return [a, t];
            }
            if ("," !== e) p(r, ",");
            ++r.index;
            var i;
            var o;
            if ("plural" === t || "selectordinal" === t) {
              o = f(r);
              i = s(r, t);
            } else if ("select" === t) i = s(r, t);
            else i = d(r);
            e = n[r.index];
            if ("}" !== e) p(r, "}");
            ++r.index;
            return "plural" === t || "selectordinal" === t ? [a, t, o, i] : [a, t, i];
          }

          function c(r) {
            i(r);
            var n = r.pattern;
            var a = n.length;
            var e = "";
            while (r.index < a) {
              var o = n[r.index];
              if ("{" === o || "#" === o) p(r, "argument id");
              if ("}" === o || "," === o || t(o)) break;
              e += o;
              ++r.index;
            }
            if (!e) p(r, "argument id");
            i(r);
            return e;
          }

          function u(r) {
            i(r);
            var n = r.pattern;
            var a;
            var e = ["number", "date", "time", "ordinal", "duration", "spellout", "plural", "selectordinal", "select"];
            for (var t = 0, o = e.length; t < o; ++t) {
              var l = e[t];
              if (n.slice(r.index, r.index + l.length) === l) {
                a = l;
                r.index += l.length;
                break;
              }
            }
            if (!a) p(r, e.join(", "));
            i(r);
            return a;
          }

          function d(r) {
            i(r);
            var n = o(r, "style");
            if (!n) p(r, "argument style name");
            i(r);
            return n;
          }

          function f(r) {
            i(r);
            var n = 0;
            var a = r.pattern;
            var t = a.length;
            if ("offset:" === a.slice(r.index, r.index + 7)) {
              r.index += 7;
              i(r);
              var o = r.index;
              while (r.index < t && e(a[r.index])) ++r.index;
              if (o === r.index) p(r, "offset number");
              n = +a.slice(o, r.index);
              i(r);
            }
            return n;
          }

          function s(r, n) {
            i(r);
            var a = r.pattern;
            var e = a.length;
            var t = {};
            var o = false;
            while (r.index < e && "}" !== a[r.index]) {
              var l = h(r);
              i(r);
              t[l] = v(r, n);
              o = true;
              i(r);
            }
            if (!o) p(r, n + " message options");
            if (!("other" in t)) p(r, null, null, '"other" option must be specified in ' + n);
            return t;
          }

          function h(r) {
            var n = r.pattern;
            var a = n.length;
            var e = "";
            while (r.index < a) {
              var o = n[r.index];
              if ("}" === o || "," === o) p(r, "{");
              if ("{" === o || t(o)) break;
              e += o;
              ++r.index;
            }
            if (!e) p(r, "selector");
            i(r);
            return e;
          }

          function v(r, n) {
            var a = r.pattern[r.index];
            if ("{" !== a) p(r, "{");
            ++r.index;
            var e = m(r, n);
            a = r.pattern[r.index];
            if ("}" !== a) p(r, "}");
            ++r.index;
            return e;
          }

          function m(r, n) {
            var a = r.pattern;
            var e = a.length;
            var t;
            var i = [];
            if (t = o(r, n)) i.push(t);
            while (r.index < e) {
              if ("}" === a[r.index]) {
                if ("message" === n) p(r);
                break;
              }
              i.push(l(r, n));
              if (t = o(r, n)) i.push(t);
            }
            return i;
          }

          function p(r, n, a, t) {
            var i = r.pattern;
            var o = i.slice(0, r.index).split(/\r?\n/);
            var l = r.index;
            var c = o.length;
            var u = o.slice(-1)[0].length;
            if (!a)
              if (r.index >= i.length) a = "end of input";
              else {
                a = i[r.index];
                while (++r.index < i.length) {
                  var d = i[r.index];
                  if (!e(d) && d.toUpperCase() === d.toLowerCase()) break;
                  a += d;
                }
              }
            if (!t) t = g(n, a);
            t += " in " + i.replace(/\r?\n/g, "\n");
            throw new w(t, n, a, l, c, u);
          }

          function g(r, n) {
            if (!r) return "Unexpected " + n + " found";
            return "Expected " + r + " but " + n + " found";
          }

          function w(r, n, a, e, t, i) {
            Error.call(this, r);
            this.name = "SyntaxError";
            this.message = r;
            this.expected = n;
            this.found = a;
            this.offset = e;
            this.line = t;
            this.column = i;
          }
          w.prototype = Object.create(Error.prototype);
          n.exports.SyntaxError = w;
        }, {}],
        6: [function(r, n, a) {
          /*!
           * Intl.MessageFormat prollyfill
           * Copyright(c) 2015 Andy VanWagoner
           * MIT licensed
           **/
          "use strict";
          var e = r("format-message-parse");
          var t = r("format-message-interpret");
          var i = t.closestSupportedLocale;

          function o(r, n) {
            if (!(this instanceof o)) return new o(r, n);
            var a = t(r, e(n));
            this._internal = {
              locale: i(r),
              format: "string" === typeof a ? function r() {
                return a;
              } : a
            };
          }
          n.exports = o;
          Object.defineProperties(o.prototype, {
            resolvedOptions: {
              configurable: true,
              writable: true,
              value: function r() {
                return {
                  locale: this._internal.locale
                };
              }
            },
            format: {
              configurable: true,
              get: function() {
                return this._internal.format;
              }
            },
            _internal: {
              configurable: true,
              writable: true,
              value: {
                locale: "en",
                format: function r() {
                  return "";
                }
              }
            }
          });
          Object.defineProperties(o, {
            supportedLocalesOf: {
              configurable: true,
              writable: true,
              value: function r(n) {
                return [].concat(n || []).filter(function(r, n, a) {
                  var e = i(r);
                  return e === r.slice(0, e.length) && a.indexOf(r) === n;
                });
              }
            }
          });
        }, {
          "format-message-interpret": 2,
          "format-message-parse": 5
        }]
      }, {}, [6])(6);
    });
  },
  7: function(r, n) {
    var a;
    a = function() {
      return this;
    }();
    try {
      a = a || Function("return this")() || (0, eval)("this");
    } catch (r) {
      if ("object" === typeof window) a = window;
    }
    r.exports = a;
  }
}, [192]);
