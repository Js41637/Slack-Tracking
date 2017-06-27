webpackJsonp([12, 328, 337, 329], {
  1463: function(e, n, a) {
    a(2424), a(2448), a(2522), a(2461), a(2483), a(2525), a(2290), a(2484), a(2447), a(2289), a(2307), a(2430), a(2523), a(2645), e.exports = a(2611);
  },
  2289: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("clog", {
        onStart: function() {
          t = TS.log && TS.has_pri[t] ? t : null;
          var e = Math.floor(5e3 * Math.random());
          setInterval(c, 3e4 + e), $(window).on("beforeunload pagehide", c), $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', d), u(), TS.clog.flush();
        },
        setUser: function(e) {
          o = e;
        },
        setTeam: function(e) {
          n = e;
        },
        setEnterprise: function(e) {
          a = e;
        },
        toggleDebugMode: function() {
          return r = !r;
        },
        track: function(e, n) {
          l(e, n);
        },
        trackClick: function(e, n, a) {
          $(e).on("click", function() {
            l(n, a);
          });
        },
        trackForm: function(e, n, a) {
          $(e).on("submit", function() {
            l(n, a);
          });
        },
        flush: function() {
          c();
        },
        test: function() {
          return {
            createLogURLs: _,
            sendDataAndEmptyQueue: c,
            detectClogEndpoint: s,
            getLogs: function() {
              return i;
            },
            getClogEndpoint: function() {
              return e;
            },
            reset: function() {
              i = [], e = void 0;
            }
          };
        },
        parseParams: function(e) {
          if (!e) return {};
          e = e.split(",");
          var n, a = {},
            o = 0,
            t = e.length;
          for (o; o < t; o += 1) n = e[o].split("="), a[n[0]] = n[1];
          return a;
        }
      });
      var e, n, a, o, t = 1e3,
        i = [],
        r = !1,
        s = function(n) {
          var a = n.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/),
            o = n.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/),
            t = n.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
          e = a ? "https://" + a[2] + ".slack.com/clog/track/" : o ? "https://" + o[2] + ".slack.com/clog/track/" : t ? "https://staging.slack.com/clog/track/" : "https://slack.com/clog/track/";
        },
        l = function(e, s) {
          if ("string" == typeof e) {
            s || (s = null);
            var l = {
              tstamp: Date.now(),
              event: e,
              args: s
            };
            if (u(), n && (l.team_id = n), a && (l.enterprise_id = a), o && (l.user_id = o), i.push(l), TS.log) r && TS.console.log(1e3, l), TS.has_pri[t] && TS.log(t, "Event called:", e, s);
            else if (r) try {
              console.log(l);
            } catch (e) {}
          }
        },
        c = function() {
          if (0 !== i.length) {
            TS.log && TS.has_pri[t] && (TS.log(t, "Sending clog data, emptying queue"), TS.log(t, "Logs: ", i));
            for (var e, n = _(i), a = 0; a < n.length; a += 1) {
              e = n[a];
              (new Image).src = e, TS.log && TS.has_pri[t] && TS.log(t, "Logged event: " + e);
            }
            i = [];
          }
        },
        _ = function(n) {
          e || s(location.host);
          for (var a, o = [], i = [], r = "", l = function(n) {
              return e + "?logs=" + encodeURIComponent(JSON.stringify(n));
            }, c = 0; c < n.length; c += 1) a = n[c], i.push(a), r = l(i), r.length > 2e3 && (i.pop(), o.push(l(i)), i = [a]);
          return o.push(l(i)), TS.log && TS.has_pri[t] && TS.log(t, "URLs:", o), o;
        },
        d = function() {
          var e = this.getAttribute("data-clog-event");
          if (!e) return void(TS.warn && TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute"));
          var n = {},
            a = TS.clog.parseParams(this.getAttribute("data-clog-params"));
          switch (this.getAttribute("data-clog-ui-action") && (n = {
            ui_element: this.getAttribute("data-clog-ui-element"),
            action: this.getAttribute("data-clog-ui-action"),
            step: this.getAttribute("data-clog-ui-step")
          }, n = {
            contexts: {
              ui_context: n
            }
          }), e.toUpperCase()) {
            case "WEBSITE_CLICK":
              a.page_url = location.href;
          }
          n = m(a, n), TS.clog.track(e, n);
        },
        m = function(e, n) {
          var a = {};
          return Object.keys(e).forEach(function(n) {
            a[n] = e[n];
          }), Object.keys(n).forEach(function(e) {
            a[e] = n[e];
          }), a;
        },
        u = function() {
          TS.model && (TS.model.enterprise && TS.model.enterprise.id && TS.clog.setEnterprise(TS.model.enterprise.id), TS.model.team && TS.model.team.id && TS.clog.setTeam(TS.model.team.id), TS.model.user && TS.model.user.id && TS.clog.setUser(TS.model.user.id));
        };
    }();
  },
  2290: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("i18n", {
        DEFAULT_LOCALE: "en-US",
        onStart: function() {
          m(), u();
        },
        locale: function() {
          return m(), r;
        },
        getDefaultLocale: function() {
          return TS.i18n.DEFAULT_LOCALE;
        },
        localesEnabled: function() {
          var e = {};
          return TS.boot_data.feature_locale_de_DE && (e["de-DE"] = "Deutsch"), e["en-US"] = "English (US)", TS.boot_data.feature_locale_es_ES && (e["es-ES"] = "Español"), TS.boot_data.feature_locale_fr_FR && (e["fr-FR"] = "Français"), TS.boot_data.feature_locale_ja_JP && (e["ja-JP"] = "日本語"), TS.boot_data.feature_pseudo_locale && (e.pseudo = "Þsèúδôtřáñsℓátïôñ"), e;
        },
        localeOrPseudo: function() {
          return i ? "pseudo" : TS.i18n.locale();
        },
        zdLocale: function() {
          m();
          var e = TS.i18n.DEFAULT_LOCALE.toLowerCase();
          return l && l[r.toLowerCase()] && (e = l[r.toLowerCase()]), e;
        },
        t: function(e, a, t) {
          if (m(), !a && n) {
            return (TS.error ? TS.error : console.error).call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + a + "."),
              function() {
                return "";
              };
          }
          t = t || r;
          var s = t + ":" + a + ":" + e;
          return void 0 === c[s] && (i || "pseudo" === t ? c[s] = new MessageFormat(t, f(e)).format : (n && a && window.sha1 && window.tsTranslations && window.tsTranslations[a] && (e = window.tsTranslations[a][window.sha1(e)] || e), c[s] = new MessageFormat(t, e).format), n && o && (c[s].toString = g(s, a))), c[s];
        },
        number: function(e) {
          return m(), Intl.NumberFormat(r).format(e);
        },
        sorter: function(e, n) {
          return m(), e && n ? s ? s.compare(e, n) : e.localeCompare(n) : e ? 1 : -1;
        },
        mappedSorter: function(e) {
          return function(n, a) {
            if (!n || !a) return n ? 1 : -1;
            var o = (e + "").split(".");
            return o.length > 1 ? o.forEach(function(e) {
              n = n[e], a = a[e];
            }) : (n = n[e], a = a[e]), TS.i18n.sorter(n, a);
          };
        },
        possessive: function(e) {
          switch (m(), TS.i18n.locale()) {
            case "fr-FR":
              return _.deburr(e).match(/^[aeiouy]/i) ? "d’" : "de ";
            case "es-ES":
              return "de ";
            case "de-DE":
              return e.substr && "s" === e.substr(e.length - 1) ? "" : "s";
            case "ja-JP":
              return "の";
            default:
              return "’s";
          }
        },
        fullPossessiveString: function(e) {
          switch (m(), TS.i18n.locale()) {
            case "es-ES":
            case "fr-FR":
              return TS.i18n.possessive(e) + e;
            default:
              return e + TS.i18n.possessive(e);
          }
        },
        listify: function(e, n) {
          m();
          var a, o = [],
            t = e.length,
            i = n && "or" === n.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")(),
            s = t > 2 ? "," : "",
            l = n && n.strong ? "<strong>" : "",
            c = n && n.strong ? "</strong>" : "",
            d = n && n.no_escape,
            u = n && n.item_prefix ? n.item_prefix : "";
          switch (r) {
            case "ja-JP":
              a = ", ";
              break;
            default:
              a = s + " " + i + " ";
          }
          return e.forEach(function(e, n) {
            d || (e = _.escape(e)), o.push(l + u + e + c), n < t - 2 ? o.push(", ") : n < t - 1 && o.push(a);
          }), o;
        },
        deburr: function(e) {
          return e = _.deburr(e), e = a(e), e = t(e);
        },
        start_of_the_week: {
          "en-US": 0
        },
        number_abbreviations: {
          "de-DE": {
            12: "Bio.",
            9: "Mrd.",
            6: "Mio.",
            3: "Tsd."
          },
          "es-ES": {
            12: "Bill",
            9: "Mrd",
            6: "Mill",
            3: "Mil"
          },
          "fr-FR": {
            12: "T",
            9: "iG",
            6: "M",
            3: "k"
          },
          "ja-JP": {
            12: "兆",
            9: "億",
            6: "万",
            3: "千"
          },
          "en-US": {
            12: "T",
            9: "B",
            6: "M",
            3: "K"
          }
        },
        locales_number_formatting: {
          default: {
            decimal_symbol: ".",
            thousands_separator: ","
          },
          "en-US": {
            decimal_symbol: ".",
            thousands_separator: ","
          },
          "es-ES": {
            decimal_symbol: ",",
            thousands_separator: " "
          },
          "fr-FR": {
            decimal_symbol: ",",
            thousands_separator: " "
          },
          "ja-JP": {
            decimal_symbol: ".",
            thousands_separator: ","
          },
          "de-DE": {
            decimal_symbol: ",",
            thousands_separator: "."
          }
        },
        test: {
          setLocale: function(e) {
            r = e, Intl.Collator && (s = Intl.Collator(r)), window.moment && window.moment.locale(r);
          }
        }
      });
      var e, n, o, i, r, s, l, c = {},
        d = [],
        m = function() {
          if (!e) {
            n = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/), o = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
            var a = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
            a && (r = a[1]), r || (r = document.documentElement.lang || TS.i18n.DEFAULT_LOCALE), "pseudo" === r && (i = !0), s = Intl.Collator ? Intl.Collator(r) : null, e = !0;
          }
        },
        u = function() {
          TS.boot_data && TS.boot_data.slack_to_zd_locale && (l = TS.boot_data.slack_to_zd_locale);
        },
        g = function(e, n) {
          return function() {
            var a = n + "." + e;
            if (!(d.indexOf(a) >= 0)) {
              d.push(a);
              var o = "TS.i18n.t(" + JSON.stringify(e) + ", " + JSON.stringify(n) + ")";
              return TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + o + " when you meant to do " + o + "()"), alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + n + "\nString: " + e), "";
            }
          };
        },
        f = function(e) {
          var n = !1;
          e.endsWith(":") && (n = !0, e = e.substr(0, e.length - 1));
          var a = /(<[^>]+>)|(&\w+;)/gi,
            o = e.match(a) || [];
          e = e.replace(a, "<>");
          var t = parseMessageFormatString(e);
          t.error && TS.error(t.error);
          var i;
          return e = t.tokens.map(function(e) {
            return "text" === e[0] ? (i = e[1], _.forOwn(p, function(e) {
              i = i.replace(e[0], e[1]);
            }), i.split(" ").map(function(e) {
              return e += new Array(Math.floor(.3 * e.length) + 1).join("~");
            }).join(" ")) : e[1];
          }).join(""), e = e.split("<>").map(function(e, n) {
            return e + (o[n] || "");
          }).join(""), n && (e += ":"), e;
        },
        p = {
          a: [/a/g, "á"],
          b: [/b/g, "β"],
          c: [/c/g, "ç"],
          d: [/d/g, "δ"],
          e: [/e/g, "è"],
          f: [/f/g, "ƒ"],
          g: [/g/g, "ϱ"],
          h: [/h/g, "λ"],
          i: [/i/g, "ï"],
          j: [/j/g, "ǰ"],
          k: [/k/g, "ƙ"],
          l: [/l/g, "ℓ"],
          m: [/m/g, "₥"],
          n: [/n/g, "ñ"],
          o: [/o/g, "ô"],
          p: [/p/g, "ƥ"],
          q: [/q/g, "9"],
          r: [/r/g, "ř"],
          u: [/u/g, "ú"],
          v: [/v/g, "Ʋ"],
          w: [/w/g, "ω"],
          x: [/x/g, "ж"],
          y: [/y/g, "¥"],
          z: [/z/g, "ƺ"],
          A: [/A/g, "Â"],
          B: [/B/g, "ß"],
          C: [/C/g, "Ç"],
          D: [/D/g, "Ð"],
          E: [/E/g, "É"],
          I: [/I/g, "Ì"],
          L: [/L/g, "£"],
          O: [/O/g, "Ó"],
          P: [/P/g, "Þ"],
          S: [/S/g, "§"],
          U: [/U/g, "Û"],
          Y: [/Y/g, "Ý"]
        };
    }();
    var a = function(e) {
        return e && e.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, o);
      },
      o = function(e) {
        var n = {
            "ガ": "ｶﾞ",
            "ギ": "ｷﾞ",
            "グ": "ｸﾞ",
            "ゲ": "ｹﾞ",
            "ゴ": "ｺﾞ",
            "ザ": "ｻﾞ",
            "ジ": "ｼﾞ",
            "ズ": "ｽﾞ",
            "ゼ": "ｾﾞ",
            "ゾ": "ｿﾞ",
            "ダ": "ﾀﾞ",
            "ヂ": "ﾁﾞ",
            "ヅ": " ﾂﾞ",
            "デ": "ﾃﾞ",
            "ド": "ﾄﾞ",
            "バ": "ﾊﾞ",
            "パ": "ﾊﾟ",
            "ビ": "ﾋﾞ",
            "ピ": "ﾋﾟ",
            "ブ": "ﾌﾞ",
            "プ": "ﾌﾟ",
            "ベ": "ﾍﾞ",
            "ペ": "ﾍﾟ",
            "ボ": "ﾎﾞ",
            "ポ": "ﾎﾟ",
            "ヴ": "ｳﾞ",
            "ァ": "ｧ",
            "ア": "ｱ",
            "ィ": "ｨ",
            "イ": "ｲ",
            "ゥ": "ｩ",
            "ウ": "ｳ",
            "ェ": "ｪ",
            "エ": "ｴ",
            "ォ": "ｫ",
            "オ": "ｵ",
            "カ": "ｶ",
            "キ": "ｷ",
            "ク": "ｸ",
            "ケ": "ｹ",
            "コ": "ｺ",
            "サ": "ｻ",
            "シ": "ｼ",
            "ス": "ｽ",
            "セ": "ｾ",
            "ソ": "ｿ",
            "タ": "ﾀ",
            "チ": "ﾁ",
            "ッ": "ｯ",
            "ツ": "ﾂ",
            "テ": "ﾃ",
            "ト": "ﾄ",
            "ナ": "ﾅ",
            "ニ": "ﾆ",
            "ヌ": "ﾇ",
            "ネ": "ﾈ",
            "ノ": "ﾉ",
            "ハ": "ﾊ",
            "ヒ": "ﾋ",
            "フ": "ﾌ",
            "ヘ": "ﾍ",
            "ホ": "ﾎ",
            "マ": "ﾏ",
            "ミ": "ﾐ",
            "ム": "ﾑ",
            "メ": "ﾒ",
            "モ": "ﾓ",
            "ャ": "ｬ",
            "ヤ": "ﾔ",
            "ュ": "ｭ",
            "ユ": "ﾕ",
            "ョ": "ｮ",
            "ヨ": "ﾖ",
            "ラ": "ﾗ",
            "リ": "ﾘ",
            "ル": "ﾙ",
            "レ": "ﾚ",
            "ロ": "ﾛ",
            "ワ": "ﾜ",
            "ヲ": "ｦ",
            "ン": "ﾝ",
            "。": "｡",
            "「": "｢",
            "」": "｣",
            "、": "､",
            "・": "･",
            "ー": "ｰ",
            "゛": "ﾞ",
            "゜": "ﾟ",
            "　": " ",
            "￠": "¢",
            "￡": "£",
            "￢": "¬",
            "￣": "¯",
            "￤": "¦",
            "￥": "¥",
            "￦": "₩"
          },
          a = e.charCodeAt(0);
        return e in n ? n[e] : a >= 65280 && a <= 65374 ? String.fromCharCode(a - 65248) : e;
      },
      t = function(e) {
        return e && e.replace(/([\u0400-\u04ff])/g, i);
      },
      i = function(e) {
        var n = {
          "А": "A",
          "Б": "B",
          "В": "V",
          "Г": "G",
          "Д": "D",
          "Е": "E",
          "Ё": "Jo",
          "Ж": "Zh",
          "З": "Z",
          "И": "I",
          "Й": "J",
          "К": "K",
          "Л": "L",
          "М": "M",
          "Н": "N",
          "О": "O",
          "П": "P",
          "Р": "R",
          "С": "S",
          "Т": "T",
          "У": "U",
          "Ф": "F",
          "Х": "H",
          "Ц": "C",
          "Ч": "Ch",
          "Ш": "Sh",
          "Щ": "Sch",
          "Ъ": "",
          "Ы": "Y",
          "Ь": "",
          "Э": "Je",
          "Ю": "Ju",
          "Я": "Ja",
          "а": "a",
          "б": "b",
          "в": "v",
          "г": "g",
          "д": "d",
          "е": "e",
          "ё": "jo",
          "ж": "zh",
          "з": "z",
          "и": "i",
          "й": "j",
          "к": "k",
          "л": "l",
          "м": "m",
          "н": "n",
          "о": "o",
          "п": "p",
          "р": "r",
          "с": "s",
          "т": "t",
          "у": "u",
          "ф": "f",
          "х": "h",
          "ц": "c",
          "ч": "ch",
          "ш": "sh",
          "щ": "sch",
          "ъ": "",
          "ы": "y",
          "ь": "",
          "э": "je",
          "ю": "ju",
          "я": "ja"
        };
        return e in n ? n[e] : e;
      };
  },
  2307: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("experiment", {
        onStart: function() {
          e = !(!TS.api || !TS.api.call), n = e ? TS.api.call : window.callSlackAPIUnauthed, TS.boot_data && TS.boot_data.experiment_assignments && c(TS.boot_data.experiment_assignments);
        },
        loadLeadAssignments: function(e) {
          return void 0 === e ? (TS.warn && TS.warn("TS.experiment.loadLeadAssignments requires a lead_id"), Promise.resolve(!1)) : (a || (a = l("experiments.getByLead", {
            lead_id: e
          })), a);
        },
        loadVisitorAssignments: function() {
          return t || (t = l("experiments.getByVisitor")), t;
        },
        loadUserAssignments: function() {
          return e ? (o || (o = l("experiments.getByUser")), o) : (TS.warn && TS.warn("TS.experiment.loadUserAssignments requires a user to be logged in"), Promise.resolve(!1));
        },
        getGroup: function(e, n) {
          return i[e] ? (i[e].log_exposures && d(e, i[e]), n && i[e].group && n.forEach(function(n) {
            s[n] = s[n] || [], s[n].indexOf(e) < 0 && s[n].push(e);
          }), i[e].group) : null;
        },
        getExperimentsForMetric: function(e) {
          var n = s[e];
          return n ? n.map(function(e) {
            return i[e];
          }) : [];
        },
        getAllAssignmentsForDebugging: function() {
          return i;
        },
        test: function() {
          var e = {};
          return Object.defineProperty(e, "_recordAssignments", {
            get: function() {
              return c;
            },
            set: function(e) {
              c = e;
            }
          }), Object.defineProperty(e, "_metric_experiments", {
            get: function() {
              return s;
            },
            set: function(e) {
              s = e;
            }
          }), e;
        }
      });
      var e, n, a, o, t, i = {},
        r = {},
        s = {},
        l = function(e, a) {
          return new Promise(function(o) {
            n(e, _.extend(TS.utility.url.queryStringParse(location.search.substring(1)), a), function(e, n) {
              e && n.assignments && c(n.assignments), o(e);
            });
          });
        },
        c = function(e) {
          var n;
          for (n in e) _.isEqual(r[n], e[n]) || (r[n] = null), i[n] = e[n];
        },
        d = function(e, n) {
          TS.clog && !_.isEqual(r[e], n) && (TS.clog.track("EXPERIMENT_EXPOSURE", {
            experiment_name: e,
            experiment_type: n.type,
            experiment_id: n.experiment_id,
            experiment_group: n.group,
            experiment_trigger: n.trigger,
            exposure_id: n.exposure_id
          }), r[e] = n);
        };
    }();
  },
  2424: function(e, n) {
    var a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
      return typeof e;
    } : function(e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    };
    ! function() {
      "use strict";
      var e = function(e, n) {
          var a = TS.model && TS.model.team && TS.model.team.id ? TS.model.team.id : "none",
            o = TS.model && TS.model.user && TS.model.user.id ? TS.model.user.id : "none",
            t = {
              description: n,
              error_json: JSON.stringify(e),
              team: a,
              user: o,
              version: TS.boot_data.version_ts
            };
          $.post(TS.boot_data.beacon_error_url, t);
        },
        n = function(e, n, a) {
          if (window.console && console[e]) {
            var o = TS.qs_args.clean_log,
              t = null !== n;
            if (a = Array.prototype.slice.call(a), t) {
              if (!TS.console.shouldLog(n)) return;
              a.splice(0, 1);
            }
            a = _.map(a, function(e) {
              return i(e);
            });
            for (var r = !0, s = a.length; r && s;) s -= 1, r = "string" == typeof a[s];
            if (!o || "error" === e || n === parseInt(TS.qs_args.pri, 10) && t)
              if (r) {
                var l = TS.makeLogDate();
                t && !o && (l += "[** " + n + " **]"), a.unshift(l), console[e](a.join(" "));
              } else console[e].apply(console, a);
          }
        };
      window.TS || (window.TS = {}), TS.console = {
        onStart: function() {
          TS.console.setAppropriatePri(!0), TS.console.watchForErrors();
        },
        count: function() {
          n("count", null, arguments);
        },
        dir: function(e, n, a) {
          if (window.console && console.dir && (!e || TS.shouldLog(e))) {
            a = a || "", n = i(n);
            var o = parseInt(TS.qs_args.dir_json, 10);
            if (o) {
              var t = 1 == o ? "2000" : o;
              try {
                var r = JSON.stringify(n, null, "  ");
                if (r.length > t) throw new Error("too long");
                return void console.info(TS.makeLogDate() + "[** " + e + " **] " + a + " " + r);
              } catch (o) {
                if ("too long" !== o) return void console.info(TS.makeLogDate() + "[** " + e + " **] " + a + " " + n);
              }
            }
            try {
              var s = _.cloneDeep(n);
              console.info(TS.makeLogDate() + "[** " + e + " **] " + a + " 👇"), console.dir(s);
            } catch (e) {
              TS.warn("could not dir ob:" + n + " err:" + e);
            }
          }
        },
        error: function() {
          n("error", null, arguments);
        },
        group: function() {
          n("group", null, arguments);
        },
        groupCollapsed: function() {
          n("groupCollapsed", null, arguments);
        },
        groupEnd: function() {
          n("groupEnd", null, arguments);
        },
        maybeError: function(e) {
          n("error", e, arguments);
        },
        getStackTrace: function() {
          var e = "dev" === _.get(TS, "boot_data.version_ts") || _.get(TS, "qs_args.js_path"),
            n = (new Error).stack;
          if (e) {
            var a = new Error,
              o = Promise.resolve();
            if (_.isFunction(o._attachExtraTrace)) {
              o._attachExtraTrace(a), n = a.stack || "";
              var t = n.split("\n");
              if (t.length && t.indexOf("From previous event:") >= 0) {
                var i = t.indexOf("From previous event:") + 1;
                n = [t[0]].concat(t.slice(i)).join("\n");
              }
            }
          }
          var r;
          return r = n ? n.split && n.split("\n") || ["[could not parse stack]", n] : ["no stacktrace available"], r = _.filter(r, function(e) {
            return 0 !== e.indexOf("Error") && (e.trim().length && -1 === e.indexOf("StackTrace"));
          }), r = _.map(r, function(e) {
            return e.trim();
          }), r.join("\n");
        },
        info: function() {
          n("info", null, arguments);
        },
        log: function(e) {
          n("log", e, arguments);
        },
        logError: function(n, a, o, t) {
          var i = n instanceof Error ? n : new Error,
            r = {
              subtype: o || "none",
              message: n instanceof Error ? n.message || n.description : JSON.stringify(n),
              fileName: i.fileName || i.sourceURL,
              lineNumber: i.lineNumber || i.line,
              stack: i.stack || i.backtrace || i.stacktrace
            };
          e(r, a), !t && window.console && console.error && console.error(TS.makeLogDate() + "logging " + (n ? "e: " + n : "") + (n && n.stack ? " e.stack: " + n.stack : "") + (a ? " desc: " + a : "") + (n && n.message ? " e.message: " + n.message : ""));
        },
        logStackTrace: function(e) {
          var n = _.isUndefined(e) ? "" : e + "\n";
          TS.console.info(n + "Stacktrace: ↴\n", TS.console.getStackTrace());
        },
        profile: function() {
          n("profile", null, arguments);
        },
        profileEnd: function() {
          n("profileEnd", null, arguments);
        },
        replaceConsoleFunction: function(e) {
          var a = n;
          return n = e, a;
        },
        setAppropriatePri: function(e) {
          var n = "";
          TS.qs_args.pri && (n += TS.qs_args.pri), e && TS.boot_data.client_logs_pri && ("" !== n && (n += ","), n += TS.boot_data.client_logs_pri), TS.model && TS.model.prefs && TS.model.prefs.client_logs_pri && ("" !== n && (n += ","), n += TS.model.prefs.client_logs_pri), "" !== n && (n += ","), n += "0", TS.pri = _.uniq(n.split(",")).join(","), o();
        },
        shouldLog: function(e) {
          var n = String(TS.pri).split(",");
          return -1 !== n.indexOf("all") || -1 !== n.indexOf("*") || (-1 !== n.indexOf(String(e)) || void 0 !== TS.has_pri[e]);
        },
        table: function() {
          n("table", null, arguments);
        },
        time: function() {
          n("time", null, arguments);
        },
        timeEnd: function() {
          n("timeEnd", null, arguments);
        },
        timeStamp: function() {
          n("timeStamp", null, arguments);
        },
        warn: function() {
          n("warn", null, arguments);
        },
        maybeWarn: function(e) {
          n("warn", e, arguments);
        },
        watchForErrors: function() {
          if (TS.boot_data && TS.boot_data.feature_tinyspeck) {
            window.addEventListener("error", s, !0);
          }
        },
        trace: function() {
          n("trace", null, arguments);
        },
        maybeTrace: function(e) {
          n("trace", e, arguments);
        },
        test: function() {
          return {
            _maybeRedactFields: i,
            _windowErrorHandler: s
          };
        }
      };
      var o = function() {
          var e = String(TS.pri).split(",");
          TS.has_pri = _(Object.keys(TS.boot_data.client_logs || {})).filter(function(n) {
            var a = TS.boot_data.client_logs[n];
            return e.some(function(e) {
              return "*" === e || (a.numbers.indexOf(parseInt(e, 10)) > -1 || (!!(a.name && a.name.indexOf(e) > -1) || !!(a.owner && a.owner.indexOf(e) > -1)));
            });
          }).map(function(e) {
            return parseInt(e, 10) >= 0 ? parseInt(e, 10) : e;
          }).keyBy(function(e) {
            return e;
          }).value();
        },
        t = {
          name: 1,
          real_name: 1,
          src: 1,
          text: 1,
          msgs: 1
        },
        i = function e(n, a) {
          if (!TS.boot_data || TS.boot_data.feature_tinyspeck || "dev" === TS.boot_data.version_ts) return n;
          if (!n || !_.isObject(n)) return n;
          if (a ? a += 1 : a = 1, a >= 10) return n;
          var o;
          return o = _.isArray(n) ? [] : {}, _.each(n, function(n, i) {
            o[i] = t[i] ? "[redacted " + r(n) + "]" : e(n, a);
          }), o;
        },
        r = function(e) {
          var n = {};
          return function(o) {
            var t = void 0 === o ? "undefined" : a(o);
            return null === o ? "null" : o === e ? "global" : "object" !== t ? t : o.nodeType ? "DOM node" : n[t = {}.toString.call(o)] || (n[t] = t.slice(8, -1).toLowerCase());
          };
        }(this),
        s = function() {
          var e, n, a = arguments && arguments[0],
            o = "",
            t = !0;
          if (a) {
            if (o = "", (e = a.srcElement || a.target) && e.nodeName)
              if ("SCRIPT" === e.nodeName) o = (a.type || "error") + " from script at " + e.src + " (failed to load?)";
              else if ("IMG" === e.nodeName) return void(TS.pri && TS.console && TS.console.warn && TS.console.warn("<img> fired error with url = " + (e.src || e.currentSrc || "unkonwn")));
            if (a.error && a.error.stack ? o += a.error.stack : a.filename && (o = " from " + a.filename + (a.lineno ? " @ line " + a.lineno + ", col " + a.colno : "")), n = (a.error && a.error.stack ? "" : a.message || "") + " " + o, n && n.replace && (n = n.replace(/\s+/g, " ").trim()), n && n.length || (n = e ? "error event from node of " + (e.nodeName || "unknown") + ", no message provided?" : "error event fired, no relevant message or node found", t = !1), n = "🐞 " + n, (TS.console && TS.console.error || window.console.error || function() {})(n), t) {
              TS.console.logError(a.error || a, n, null, !1);
            }
            e = null, n = null;
          }
        };
    }();
  },
  2430: function(e, n) {
    var a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
      return typeof e;
    } : function(e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    };
    ! function() {
      "use strict";
      TS.registerModule("emoji", {
        onStart: function() {
          TS.web && TS.web.login_sig.add(TS.emoji.onLogin), TS.client && TS.client.login_sig.add(TS.emoji.onLogin), TS.prefs.jumbomoji_changed_sig.add(f), TS.boot_data.feature_update_emoji_to_v4 && (u(), m.forEach(function(e) {
            TS.emoji.spliceSkinToneVariationsIntoAnArrayOfEmojiNames(e.emoji_names);
          }));
          g = TS.utility.throttleFunc(g, 3e3, !0);
        },
        onLogin: function() {
          f();
        },
        isValidName: function(e) {
          return !!e && (e = TS.emoji.stripWrappingColons(e).toLowerCase(), void 0 !== o[e] && e);
        },
        substringMatchesName: function(e, n, a) {
          if (!(e && n && _.isString(e) && _.isString(n))) return !1;
          if ("::" === n) return !1;
          var o = ":" === n.charAt(0),
            t = ":" === n.slice(-1);
          if (!(n = TS.emoji.stripWrappingColons(n.toLowerCase()))) return !0;
          if (o && t) return n === e;
          if (o) return e.slice(0, n.length) === n;
          if (t) return e.slice(-1 * n.length) === n;
          if (-1 !== e.indexOf(n)) return !0;
          if (a) {
            var i = TS.rxns.getHandyRxnsTitleForEmojiByRxnKey(e, a);
            if (i) return TS.emoji.substringMatchesName(i, n);
          }
          return !1;
        },
        emojiMatchesTerm: function(e, n, a) {
          if (!e || !n) return !1;
          var o = TS.emoji.nameToBaseName(e.display_name || e.name);
          if (TS.boot_data.feature_localization && (n = TS.emoji.normalizeSearchTerm(n), o = TS.i18n.deburr(o)), TS.emoji.substringMatchesName(o, n)) return !0;
          var t = e.display_names || e.names;
          TS.boot_data.feature_localization && (t = TS.i18n.deburr(t), e.display_names && e.display_names !== e.names && (t += " " + e.names));
          for (var i = t.split(" "), r = 0; r < i.length; r += 1)
            if (TS.emoji.substringMatchesName(TS.emoji.nameToBaseName(i[r]), n)) return !0;
          return -1 !== _.indexOf(a, o);
        },
        normalizeSearchTerm: function(e) {
          if (e && _.isString(e)) return e = e.toLowerCase(), e = TS.i18n.deburr(e), e = e.replace(/['ʼ’]/g, "'");
        },
        nameToBaseName: function(e) {
          return _.isString(e) ? (e = TS.boot_data.feature_localization ? TS.emoji.stripLocalizedSkinTone(e) : e.replace(/(:skin-tone-[2-6]:)/, ""), e = TS.emoji.stripWrappingColons(e)) : "";
        },
        stripLocalizedSkinTone: function(e) {
          var n = /::skin-tone-[2-6]:/g;
          if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
            var a = TS.emoji.getLocalSkinToneName();
            n = new RegExp("::" + a + "-[2-6]:", "g");
          }
          return e = e.replace(n, ":");
        },
        stripWrappingColons: function(e) {
          return e ? (e = "string" == typeof e ? e : e + "", ":" === e[0] ? ":" === e[e.length - 1] ? e.slice(1, e.length - 1) : e.slice(1, e.length) : ":" === e[e.length - 1] ? e.slice(0, e.length - 1) : e) : "";
        },
        nameToCanonicalName: function(e) {
          if (!(e = TS.emoji.stripWrappingColons(e))) return "";
          e = String(e).toLowerCase();
          var n = function() {
            var n = e.split("::");
            return 2 != n.length ? "" : (e = n[0], "::" + n[1]);
          }();
          return (r()[e] || e) + n;
        },
        addCustomEmoji: function(e, n, a) {
          S(e, n, a);
        },
        removeCustomEmoji: function(e, n) {
          S(e, void 0, n);
        },
        ingestCustoms: function(e) {
          function o(e) {
            return c.map.colons.hasOwnProperty(e) || r.indexOf(e) >= 0;
          }
          TS.model.all_custom_emoji.length = 0, TS.model.emoji_complex_customs = {};
          var t, i, r = [];
          _.forOwn(c.data, function(e) {
            r.push.apply(r, e[3]);
          }), _.forOwn(e, function(e, n) {
            if ("object" === (void 0 === e ? "undefined" : a(e))) TS.model.emoji_complex_customs[n] = e, c.data[n] = [
              [], null, null, [n], null, null, null, e.apple
            ], c.map.colons[n] = n, TS.model.all_custom_emoji.push(n);
            else {
              if (0 === e.indexOf("alias:")) return;
              if (o(n)) return void TS.error("can't ingest custom emoji :" + n + ": because that already exists");
              c.data[n] = [
                [], null, null, [n], null, null, null, e
              ], c.map.colons[n] = n, TS.model.all_custom_emoji.push(n);
            }
          }), _.forOwn(e, function(e, n) {
            if ("object" !== (void 0 === e ? "undefined" : a(e)) && 0 === e.indexOf("alias:")) {
              if (o(n)) return void TS.error("can't ingest custom emoji :" + n + ": because that already exists");
              if (t = e.replace("alias:", ""), i = c.data.hasOwnProperty(t) && c.data[t]) return i[3].push(n), void(c.map.colons[n] = t);
              if (t = c.map.colons.hasOwnProperty(t) && c.map.colons[t], i = c.data.hasOwnProperty(t) && c.data[t]) return i[3].push(n), void(c.map.colons[n] = t);
              TS.boot_data && TS.boot_data.feature_tinyspeck && TS.warn('alias for "' + n + '":"' + e + '" not recognized');
            }
          }), TS.model.all_custom_emoji = TS.model.all_custom_emoji.sort(), c && c.inits && (delete c.inits.emoticons, c.init_emoticons()), n = s();
        },
        setUpEmoji: function() {
          return new Promise(function(e) {
            if (!c) return TS.boot_data.feature_tinyspeck && TS.info("BOOT: Done setting up emoji, there was nothing to do"), e();
            var n = function() {
              c.buildKeywordIndex(), h(), TS.boot_data.feature_tinyspeck && TS.info("BOOT: Done setting up emoji"), e();
            };
            if (p(), !TS.boot_data.page_needs_custom_emoji) return n();
            if (!TS.boot_data.page_needs_custom_emoji_fresh) {
              var a = TS.storage.fetchCustomEmoji();
              if (a && TS.model.emoji_cache_ts == a.cache_ts) return TS.model.did_we_load_with_emoji_cache = !0, TS.emoji.ingestCustoms(a.data), n();
            }
            TS.boot_data.feature_tinyspeck && TS.info("BOOT: Fetching emoji list before setting up emoji"), TS.api.call("emoji.list", {
              include_complex_values: 1
            }, function(e, a) {
              if (!e || !a.emoji) return n();
              TS.model.emoji_cache_ts = a.cache_ts, TS.storage.storeCustomEmoji({
                data: a.emoji,
                cache_ts: TS.model.emoji_cache_ts
              }), TS.emoji.ingestCustoms(a.emoji), n();
            });
          });
        },
        resetUpEmoji: function() {
          TS.storage.storeCustomEmoji(""), g();
        },
        maybeRemakeMenuListsIfFrequentsChanged: function() {
          var n = t();
          TS.utility.areSimpleObjectsEqual(n, e, "maybemakeMenuLists") || (TS.boot_data.feature_localization ? i(n) : TS.emoji.makeMenuLists());
        },
        makeMenuLists: function() {
          TS.model.emoji_groups.length = 0, TS.model.emoji_names.length = 0, o = {};
          var n = _.cloneDeep(m);
          TS.model.all_custom_emoji && TS.model.all_custom_emoji.length && n.push({
            display_name: TS.i18n.t("Custom", "emoji")(),
            tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_slack"></i></span>',
            tab_icon: "ts_icon_slack",
            tab_icon_name: "slack",
            name: "slack",
            emoji_names: TS.model.all_custom_emoji
          }), e = t(), n.unshift({
            name: "mine",
            display_name: TS.i18n.t("Frequently Used", "emoji")(),
            tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_clock_o"></i></span>',
            tab_icon: "ts_icon_clock_o",
            tab_icon_name: "clock_o",
            emoji_names: e
          });
          var a, i, r = [];
          for (a = 0; a < n.length; a += 1) r = r.concat(n[a].emoji_names);
          var s = {};
          for (Object.keys(c.data).forEach(function(e) {
              var n = c.data[e][3],
                a = TS.emoji.isIdxSkinToneModifiable(e);
              n.forEach(function(n, t, i) {
                var r = n,
                  _ = i;
                TS.model.emoji_names.push(n), o[n] = !0, TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE && (r = TSFEmoji.getLocalEmojiString(n, TS.i18n.locale()), _ = i.map(function(e) {
                  return TSFEmoji.getLocalEmojiString(e, TS.i18n.locale());
                })), s[n] = {
                  html: TS.emoji.graphicReplace(":" + n + ":"),
                  name: ":" + n + ":",
                  names: ":" + i.join(": :") + ":",
                  display_name: ":" + r + ":",
                  display_names: ":" + _.join(": :") + ":"
                }, TS.model.emoji_map.push({
                  id: "E" + e + (t > 0 ? "_alias_" + t : ""),
                  name: n,
                  name_with_colons: ":" + n + ":",
                  display_name: r,
                  is_skin: a,
                  is_emoji: !0
                }), a && (s[n].is_skin = !0, s[n].skin_tone_id = "1", c.skin_tones.forEach(function(a) {
                  if (l(e, a)) {
                    var t = c.data[a],
                      d = t[3][0],
                      m = n + "::" + d;
                    TS.model.emoji_names.push(m), o[m] = !0;
                    var u = ":" + m + ":",
                      g = i.map(function(e) {
                        return e + "::" + d;
                      }),
                      f = u,
                      p = g;
                    if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
                      var h = TSFEmoji.getLocalEmojiString(d, TS.i18n.locale());
                      f = ":" + r + "::" + h + ":", p = _.map(function(e) {
                        return e + "::" + h;
                      });
                    }
                    s[m] = {
                      is_skin: !0,
                      skin_tone_id: d.substr(-1, 1),
                      html: TS.emoji.graphicReplace(u),
                      name: u,
                      names: ":" + g.join(": :") + ":",
                      display_name: f,
                      display_names: ":" + p.join(": :") + ":"
                    };
                  }
                }));
              });
            }), d = s, TS.model.emoji_map = _.uniqBy(TS.model.emoji_map, "id"), a = 0; a < r.length; a += 1) {
            var u = r[a];
            s[u] || TS.info(u + " not in cat_map?");
          }
          var g, f, p, h;
          for (a = 0; a < n.length; a += 1) {
            for (g = n[a], f = [], p = null, h = "", g.tab_icon_html && (h = g.tab_icon_html), i = 0; i < g.emoji_names.length; i += 1) p = s[g.emoji_names[i]], f.push(p), h || g.emoji_names[i] == g.name && (h = p.html);
            p = f[0], TS.model.emoji_groups.push({
              name: g.name,
              display_name: g.display_name,
              tab_html: h || p.html,
              tab_icon: g.tab_icon,
              tab_icon_name: g.tab_icon_name,
              items: f
            });
          }
          var S = TS.emoji.getCurrentSheetUrl();
          if (_.get(TS, "model.prefs.ss_emojis") && S) {
            var T = new Image;
            T.onload = function() {
              T.onload = null, T.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", T = null;
            }, T.src = S;
          }
          TS.model.emoji_names.sort(), TS.emoji.friendlyReorder();
          var b = TS.model.emoji_names.indexOf("ok"),
            w = TS.model.emoji_names.indexOf("ok_hand");
          TS.model.emoji_names[b] = "ok_hand", TS.model.emoji_names[w] = "ok";
          "dev" === TS.boot_data.version_ts && function(e) {
            var n = TS.model.emoji_names.concat();
            ["skin-tone-2", "skin-tone-3", "skin-tone-4", "skin-tone-5", "skin-tone-6"].forEach(function(e) {
              _.pull(n, e);
            }), e.forEach(function(e) {
              e.emoji_names.forEach(function(e) {
                _.pull(n, e);
                var a = c.map.colons[e],
                  o = c.data[a];
                o && o[3].forEach(function(e) {
                  [e, e + "::skin-tone-2", e + "::skin-tone-3", e + "::skin-tone-4", e + "::skin-tone-5", e + "::skin-tone-6"].forEach(function(e) {
                    _.pull(n, e);
                  });
                });
              });
            }), n.length && TS.error("testGroupings() expected these emoji names to be in a category, but they were not found! " + n.join(","));
          }(n);
        },
        friendlyReorder: function() {
          [{
            filter: "th",
            first: "thumbsup",
            second: "thumbsdown"
          }, {
            filter: "po",
            first: "point_up",
            second: "point_down"
          }].forEach(function(e) {
            var n = _.reduce(TS.model.emoji_names, function(n, a, o) {
              if (0 === a.indexOf(e.filter)) {
                var t = TS.model.all_custom_emoji.indexOf(a) > -1,
                  i = !t && 0 === a.indexOf(e.first),
                  r = !t && !i && 0 === a.indexOf(e.second);
                n.emoji.push({
                  name: a,
                  is_first: i,
                  is_second: r
                }), n.indexes.push(o);
              }
              return n;
            }, {
              indexes: [],
              emoji: []
            });
            n.emoji = _.orderBy(n.emoji, ["is_first", "is_second", "name"], ["desc", "desc", "asc"]), _.forEach(n.emoji, function(e, a) {
              var o = n.indexes[a];
              TS.model.emoji_names[o] = e.name;
            });
          });
        },
        isIdxSkinToneModifiable: function(e) {
          return l(e, c.skin_tones[0]);
        },
        isNameSkinToneModifiable: function(e) {
          e = TS.emoji.stripWrappingColons(e), e = String(e).toLowerCase();
          var n = c.map.colons[e];
          return TS.emoji.isIdxSkinToneModifiable(n);
        },
        graphicReplace: function(e, n) {
          if (!e) return "";
          if (n = n || {}, n.show_icon_for_emoji_in_as_text_mode && TS.emoji.isValidName(e)) return '<ts-icon class="emoji-sizer ts_icon_info_circle ts_icon_inherit" title="' + e.replace(/:/g, "") + '"></ts-icon>';
          c.init_env();
          var a = c.text_mode,
            o = c.include_title,
            t = c.include_text,
            i = c.supports_css,
            r = c.allow_skin_tone_squares;
          n.force_img && n.obey_emoji_mode_pref && (n.obey_emoji_mode_pref = !1, TS.error("obey_emoji_mode_pref now set to FALSE because options.force_img is TRUE")), n.force_style && n.obey_emoji_mode_pref && (n.obey_emoji_mode_pref = !1, TS.error("obey_emoji_mode_pref now set to FALSE because options.force_style is " + n.force_style)), c.text_mode = n.obey_emoji_mode_pref && "as_text" === _.get(TS, "model.prefs.emoji_mode"), n.force_style && (TS.emoji.setEmojiMode(n.force_style), c.use_sheet = !1), c.include_title = !!n.include_title, c.include_text = !!n.include_text, c.supports_css = !n.force_img, c.allow_skin_tone_squares = !n.no_skin_tone_squares;
          var s = c.replace_colons(e, {
            stop_animations: n.stop_animations
          });
          return n.jumbomoji && (s = s.replace("emoji-sizer", "emoji-sizer emoji-only")), n.force_style && TS.emoji.setEmojiMode(), c.text_mode = a, c.include_title = o, c.include_text = t, c.supports_css = i, c.allow_skin_tone_squares = r, s;
        },
        replaceColons: function(e) {
          return e.indexOf(":") < 0 ? e : c.replace_colons(e);
        },
        maybeUnifiedReplace: function(e) {
          return "unified" !== c.replace_mode ? e : c.replace_colons_with_unified(e);
        },
        replaceEmoticons: function(e) {
          return c.replace_emoticons_with_colons(e);
        },
        eachEmoticon: function(e, n) {
          e.replace(c.rx_emoticons, n);
        },
        getLocalSkinToneName: function() {
          var e = "skin-tone";
          return TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE && (e = TSFEmoji.getLocalSkinToneName(TS.i18n.locale())), e;
        },
        getChosenSkinTone: function(e) {
          var n = parseInt(_.get(TS, "model.prefs.preferred_skin_tone"), 10);
          return n && "1" != n && _.includes([2, 3, 4, 5, 6], n) ? (e ? TS.emoji.getLocalSkinToneName() : "skin-tone") + "-" + n : "";
        },
        getChosenSkinToneModifier: function(e) {
          var n = TS.emoji.getChosenSkinTone(e);
          return n ? ":" + n + ":" : "";
        },
        setEmojiMode: function(e) {
          var n = ["google", "emojione", "twitter", "apple"];
          if (e = e || _.get(TS, "model.prefs.emoji_mode"), c.text_mode = "as_text" === e, c.do_emoticons = !!_.get(TS, "model.prefs.graphic_emoticons"), c.allow_native = !1, c.use_sheet = function() {
              return !!_.get(TS, "model.prefs.ss_emojis") && !!TS.boot_data.page_needs_custom_emoji;
            }(), c.img_set = _.includes(n, e) ? e : "apple", TS.model.emoji_complex_customs)
            for (var a in TS.model.emoji_complex_customs) c.data[a] && (c.data[a][7] = TS.model.emoji_complex_customs[a][c.img_set]);
        },
        getColonsRx: function() {
          return c.rx_colons;
        },
        getEmojiByName: function(e) {
          if (e) return _.find(TS.model.emoji_map, {
            name: e
          });
        },
        getEmojiById: function(e) {
          var n = _.find(TS.model.emoji_map, {
            id: e
          });
          return n || void TS.warn("no emoji ob found for " + e);
        },
        getEmojiForSpaces: function() {
          var e = {
            emoticonEmojiNames: c.emoticons_data,
            emoji: {},
            sheetSize: c.sheet_size,
            sheetPath: TS.emoji.getCurrentSheetUrl(),
            replace: function() {
              var e = c.colons_mode;
              c.colons_mode = !0;
              var n = c.replace_unified.apply(c, arguments);
              return TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE && (n = TSFEmoji.translateEmojiStringToCanonical(n, TS.i18n.locale())), c.colons_mode = e, n;
            }
          };
          return TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE && (e.getLocalEmojiString = function(e) {
            return TSFEmoji.getLocalEmojiString(e, TS.i18n.locale()) || e;
          }), Object.keys(c.data).forEach(function(n) {
            var a, o = c.data[n],
              t = o[3],
              i = o[4],
              r = o[5],
              s = o[7];
            if (null !== i && null !== r) a = [i, r];
            else {
              if (!s) return void TS.error('WTF, _emoji "' + n + '" is missing coords or and a url, or something!');
              a = !1 === _.get(TS, "model.prefs.a11y_animations") ? TS.utility.getImgProxyURLWithOptions(s, {
                emoji: !0
              }) : s;
            }
            t.forEach(function(n) {
              e.emoji[n] = a;
            });
          }), e;
        },
        getCurrentSheetUrl: function() {
          return c.img_sets[c.img_set].sheet;
        },
        getCurrentImagePath: function() {
          return c.img_sets[c.img_set].path;
        },
        test: function() {
          return {
            emoji: c
          };
        },
        spliceSkinToneVariationsIntoAnArrayOfEmojiNames: function(e) {
          var n = 0;
          e.concat().forEach(function(a, o) {
            var t = c.map.colons[a];
            c.data.hasOwnProperty(t) && c.data[t] && c.skin_tones.forEach(function(i) {
              if (l(t, i)) {
                var r = c.data[i],
                  s = r[3][0],
                  _ = a + "::" + s;
                if (-1 === e.indexOf(_)) {
                  n += 1;
                  var d = n + o;
                  e.splice(d, 0, _);
                }
              }
            });
          });
        },
        findByKeyword: function(e) {
          return c.findByKeyword(e);
        },
        maybeGetCanonicalEmojiString: function(e) {
          return TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE ? TSFEmoji.translateEmojiStringToCanonical(e, TS.i18n.locale()) : e;
        },
        maybeGetLocalizedEmojiString: function(e) {
          return TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE ? TSFEmoji.translateEmojiStringToLocal(e, TS.i18n.locale()) : e;
        },
        MISSING_EMOJI_HTML: '<span class="emoji-outer emoji-sizer emoji-bg-contain" style="background-image: url(' + cdn_url + '/ecf3e/img/emoji_missing.png);"></span>'
      });
      var e, n, o = {},
        t = function() {
          var e, n = {};
          _.each(_.keys(TS.model.emoji_use), function(a) {
            e = TS.emoji.nameToCanonicalName(a.split("::")[0]), n.hasOwnProperty(e) || (n[e] = 0), n[e] += TS.model.emoji_use[a];
          }), TS.dir(777, n, "condensed emoji names:");
          var a = Object.keys(n).sort(function(e, a) {
            var o = n[e],
              t = n[a];
            if (o == t) {
              if (e < a) return -1;
              if (e > a) return 1;
            }
            return -(o - t);
          });
          a.length = Math.min(a.length, 4 * TS.model.emoji_menu_columns);
          for (var o, t = ["slightly_smiling_face", "heart", "+1", "100", "bug"]; a.length < 5 && t.length;) o = t.shift(), -1 === a.indexOf(o) && a.push(o);
          return TS.emoji.spliceSkinToneVariationsIntoAnArrayOfEmojiNames(a), a;
        },
        i = function(n) {
          e = n;
          var a = _.find(_.get(TS.model, "emoji_groups"), {
            name: "mine"
          });
          a || TS.emoji.makeMenuLists();
          var o = [];
          e.forEach(function(e) {
            var n = d[e];
            n && o.push(n);
          }), a.items = o;
        },
        r = function() {
          return n = n || s();
        },
        s = function() {
          var e, n = {};
          return Object.keys(c.data).forEach(function(a) {
            e = c.data[a], n[e[3][0]] = null, e[3].forEach(function(a) {
              n.hasOwnProperty(a) || (n[a] = e[3][0]);
            });
          }), n;
        },
        l = function(e, n) {
          return TS.boot_data.feature_update_emoji_to_v4 ? !(!c.variations_data[e] || !c.variations_data[e][n]) : !!c.variations_data[e + "-" + n];
        },
        c = emoji,
        d = {},
        m = [{
          name: "people",
          display_name: TS.i18n.t("People", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_happy_smile"></i></span>',
          tab_icon: "ts_icon_happy_smile",
          tab_icon_name: "happy_smile",
          emoji_names: ["grinning", "grimacing", "grin", "joy", "smiley", "smile", "sweat_smile", "laughing", "innocent", "wink", "blush", "slightly_smiling_face", "upside_down_face", "relaxed", "yum", "relieved", "heart_eyes", "kissing_heart", "kissing", "kissing_smiling_eyes", "kissing_closed_eyes", "stuck_out_tongue_winking_eye", "stuck_out_tongue_closed_eyes", "stuck_out_tongue", "money_mouth_face", "nerd_face", "sunglasses", "hugging_face", "smirk", "no_mouth", "neutral_face", "expressionless", "unamused", "face_with_rolling_eyes", "thinking_face", "flushed", "disappointed", "worried", "angry", "rage", "pensive", "confused", "slightly_frowning_face", "white_frowning_face", "persevere", "confounded", "tired_face", "weary", "triumph", "open_mouth", "scream", "fearful", "cold_sweat", "hushed", "frowning", "anguished", "cry", "disappointed_relieved", "sleepy", "sweat", "sob", "dizzy_face", "astonished", "zipper_mouth_face", "mask", "face_with_thermometer", "face_with_head_bandage", "sleeping", "zzz", "hankey", "smiling_imp", "imp", "japanese_ogre", "japanese_goblin", "skull", "ghost", "alien", "robot_face", "smiley_cat", "smile_cat", "joy_cat", "heart_eyes_cat", "smirk_cat", "kissing_cat", "scream_cat", "crying_cat_face", "pouting_cat", "raised_hands", "clap", "wave", "+1", "-1", "facepunch", "fist", "v", "ok_hand", "hand", "open_hands", "muscle", "pray", "point_up", "point_up_2", "point_down", "point_left", "point_right", "middle_finger", "raised_hand_with_fingers_splayed", "the_horns", "spock-hand", "writing_hand", "nail_care", "lips", "tongue", "ear", "nose", "eye", "eyes", "bust_in_silhouette", "busts_in_silhouette", "speaking_head_in_silhouette", "baby", "boy", "girl", "man", "woman", "person_with_blond_hair", "older_man", "older_woman", "man_with_gua_pi_mao", "man_with_turban", "cop", "construction_worker", "guardsman", "sleuth_or_spy", "santa", "angel", "princess", "bride_with_veil", "walking", "runner", "dancer", "dancers", "couple", "two_men_holding_hands", "two_women_holding_hands", "bow", "information_desk_person", "no_good", "ok_woman", "raising_hand", "person_with_pouting_face", "person_frowning", "haircut", "massage", "couple_with_heart", "woman-heart-woman", "man-heart-man", "couplekiss", "woman-kiss-woman", "man-kiss-man", "family", "man-woman-girl", "man-woman-girl-boy", "man-woman-boy-boy", "man-woman-girl-girl", "woman-woman-boy", "woman-woman-girl", "woman-woman-girl-boy", "woman-woman-boy-boy", "woman-woman-girl-girl", "man-man-boy", "man-man-girl", "man-man-girl-boy", "man-man-boy-boy", "man-man-girl-girl", "womans_clothes", "shirt", "jeans", "necktie", "dress", "bikini", "kimono", "lipstick", "kiss", "footprints", "high_heel", "sandal", "boot", "mans_shoe", "athletic_shoe", "womans_hat", "tophat", "helmet_with_white_cross", "mortar_board", "crown", "school_satchel", "pouch", "purse", "handbag", "briefcase", "eyeglasses", "dark_sunglasses", "ring", "closed_umbrella"]
        }, {
          name: "nature",
          display_name: TS.i18n.t("Nature", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_nature"></i></span>',
          tab_icon: "ts_icon_emoji_nature",
          tab_icon_name: "emoji_nature",
          emoji_names: ["dog", "cat", "mouse", "hamster", "rabbit", "bear", "panda_face", "koala", "tiger", "lion_face", "cow", "pig", "pig_nose", "frog", "octopus", "monkey_face", "see_no_evil", "hear_no_evil", "speak_no_evil", "monkey", "chicken", "penguin", "bird", "baby_chick", "hatching_chick", "hatched_chick", "wolf", "boar", "horse", "unicorn_face", "bee", "bug", "snail", "beetle", "ant", "spider", "scorpion", "crab", "snake", "turtle", "tropical_fish", "fish", "blowfish", "dolphin", "whale", "whale2", "crocodile", "leopard", "tiger2", "water_buffalo", "ox", "cow2", "dromedary_camel", "camel", "elephant", "goat", "ram", "sheep", "racehorse", "pig2", "rat", "mouse2", "rooster", "turkey", "dove_of_peace", "dog2", "poodle", "cat2", "rabbit2", "chipmunk", "feet", "dragon", "dragon_face", "cactus", "christmas_tree", "evergreen_tree", "deciduous_tree", "palm_tree", "seedling", "herb", "shamrock", "four_leaf_clover", "bamboo", "tanabata_tree", "leaves", "fallen_leaf", "maple_leaf", "ear_of_rice", "hibiscus", "sunflower", "rose", "tulip", "blossom", "cherry_blossom", "bouquet", "mushroom", "chestnut", "jack_o_lantern", "shell", "spider_web", "earth_americas", "earth_africa", "earth_asia", "full_moon", "waning_gibbous_moon", "last_quarter_moon", "waning_crescent_moon", "new_moon", "waxing_crescent_moon", "first_quarter_moon", "moon", "new_moon_with_face", "full_moon_with_face", "first_quarter_moon_with_face", "last_quarter_moon_with_face", "sun_with_face", "crescent_moon", "star", "star2", "dizzy", "sparkles", "comet", "sunny", "mostly_sunny", "partly_sunny", "barely_sunny", "partly_sunny_rain", "cloud", "rain_cloud", "thunder_cloud_and_rain", "lightning", "zap", "fire", "boom", "snowflake", "snow_cloud", "snowman_without_snow", "snowman", "wind_blowing_face", "dash", "tornado", "fog", "umbrella", "umbrella_with_rain_drops", "droplet", "sweat_drops", "ocean"]
        }, {
          name: "food_and_drink",
          display_name: TS.i18n.t("Food & Drink", "client")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_food"></i></span>',
          tab_icon: "ts_icon_emoji_food",
          tab_icon_name: "emoji_food",
          emoji_names: ["green_apple", "apple", "pear", "tangerine", "lemon", "banana", "watermelon", "grapes", "strawberry", "melon", "cherries", "peach", "pineapple", "tomato", "eggplant", "hot_pepper", "corn", "sweet_potato", "honey_pot", "bread", "cheese_wedge", "poultry_leg", "meat_on_bone", "fried_shrimp", "egg", "hamburger", "fries", "hotdog", "pizza", "spaghetti", "taco", "burrito", "ramen", "stew", "fish_cake", "sushi", "bento", "curry", "rice_ball", "rice", "rice_cracker", "oden", "dango", "shaved_ice", "ice_cream", "icecream", "cake", "birthday", "custard", "candy", "lollipop", "chocolate_bar", "popcorn", "doughnut", "cookie", "beer", "beers", "wine_glass", "cocktail", "tropical_drink", "champagne", "sake", "tea", "coffee", "baby_bottle", "fork_and_knife", "knife_fork_plate"]
        }, {
          name: "activity",
          display_name: TS.i18n.t("Activity", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_activities"></i></span>',
          tab_icon: "ts_icon_emoji_activities",
          tab_icon_name: "emoji_activities",
          emoji_names: ["soccer", "basketball", "football", "baseball", "tennis", "volleyball", "rugby_football", "8ball", "golf", "golfer", "table_tennis_paddle_and_ball", "badminton_racquet_and_shuttlecock", "ice_hockey_stick_and_puck", "field_hockey_stick_and_ball", "cricket_bat_and_ball", "ski", "skier", "snowboarder", "ice_skate", "bow_and_arrow", "fishing_pole_and_fish", "rowboat", "swimmer", "surfer", "bath", "person_with_ball", "weight_lifter", "bicyclist", "mountain_bicyclist", "horse_racing", "man_in_business_suit_levitating", "trophy", "running_shirt_with_sash", "sports_medal", "medal", "reminder_ribbon", "rosette", "ticket", "admission_tickets", "performing_arts", "art", "circus_tent", "microphone", "headphones", "musical_score", "musical_keyboard", "saxophone", "trumpet", "guitar", "violin", "clapper", "video_game", "space_invader", "dart", "game_die", "slot_machine", "bowling"]
        }, {
          name: "travel_and_places",
          display_name: TS.i18n.t("Travel & Places", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_travel"></i></span>',
          tab_icon: "ts_icon_emoji_travel",
          tab_icon_name: "emoji_travel",
          emoji_names: ["car", "taxi", "blue_car", "bus", "trolleybus", "racing_car", "police_car", "ambulance", "fire_engine", "minibus", "truck", "articulated_lorry", "tractor", "racing_motorcycle", "bike", "rotating_light", "oncoming_police_car", "oncoming_bus", "oncoming_automobile", "oncoming_taxi", "aerial_tramway", "mountain_cableway", "suspension_railway", "railway_car", "train", "monorail", "bullettrain_side", "bullettrain_front", "light_rail", "mountain_railway", "steam_locomotive", "train2", "metro", "tram", "station", "helicopter", "small_airplane", "airplane", "airplane_departure", "airplane_arriving", "boat", "motor_boat", "speedboat", "ferry", "passenger_ship", "rocket", "satellite", "seat", "anchor", "construction", "fuelpump", "busstop", "vertical_traffic_light", "traffic_light", "checkered_flag", "ship", "ferris_wheel", "roller_coaster", "carousel_horse", "building_construction", "foggy", "tokyo_tower", "factory", "fountain", "rice_scene", "mountain", "snow_capped_mountain", "mount_fuji", "volcano", "japan", "camping", "tent", "national_park", "motorway", "railway_track", "sunrise", "sunrise_over_mountains", "desert", "beach_with_umbrella", "desert_island", "city_sunrise", "city_sunset", "cityscape", "night_with_stars", "bridge_at_night", "milky_way", "stars", "sparkler", "fireworks", "rainbow", "house_buildings", "european_castle", "japanese_castle", "stadium", "statue_of_liberty", "house", "house_with_garden", "derelict_house_building", "office", "department_store", "post_office", "european_post_office", "hospital", "bank", "hotel", "convenience_store", "school", "love_hotel", "wedding", "classical_building", "church", "mosque", "synagogue", "kaaba", "shinto_shrine"]
        }, {
          name: "objects",
          display_name: TS.i18n.t("Objects", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_lightbulb_o"></i></span>',
          tab_icon: "ts_icon_lightbulb_o",
          tab_icon_name: "lightbulb_o",
          emoji_names: ["watch", "iphone", "calling", "computer", "keyboard", "desktop_computer", "printer", "three_button_mouse", "trackball", "joystick", "compression", "minidisc", "floppy_disk", "cd", "dvd", "vhs", "camera", "camera_with_flash", "video_camera", "movie_camera", "film_projector", "film_frames", "telephone_receiver", "phone", "pager", "fax", "tv", "radio", "studio_microphone", "level_slider", "control_knobs", "stopwatch", "timer_clock", "alarm_clock", "mantelpiece_clock", "hourglass_flowing_sand", "hourglass", "satellite_antenna", "battery", "electric_plug", "bulb", "flashlight", "candle", "wastebasket", "oil_drum", "money_with_wings", "dollar", "yen", "euro", "pound", "moneybag", "credit_card", "gem", "scales", "wrench", "hammer", "hammer_and_pick", "hammer_and_wrench", "pick", "nut_and_bolt", "gear", "chains", "gun", "bomb", "hocho", "dagger_knife", "crossed_swords", "shield", "smoking", "skull_and_crossbones", "coffin", "funeral_urn", "amphora", "crystal_ball", "prayer_beads", "barber", "alembic", "telescope", "microscope", "hole", "pill", "syringe", "thermometer", "label", "bookmark", "toilet", "shower", "bathtub", "key", "old_key", "couch_and_lamp", "sleeping_accommodation", "bed", "door", "bellhop_bell", "frame_with_picture", "world_map", "umbrella_on_ground", "moyai", "shopping_bags", "balloon", "flags", "ribbon", "gift", "confetti_ball", "tada", "dolls", "wind_chime", "crossed_flags", "izakaya_lantern", "email", "envelope_with_arrow", "incoming_envelope", "e-mail", "love_letter", "postbox", "mailbox_closed", "mailbox", "mailbox_with_mail", "mailbox_with_no_mail", "package", "postal_horn", "inbox_tray", "outbox_tray", "scroll", "page_with_curl", "bookmark_tabs", "bar_chart", "chart_with_upwards_trend", "chart_with_downwards_trend", "page_facing_up", "date", "calendar", "spiral_calendar_pad", "card_index", "card_file_box", "ballot_box_with_ballot", "file_cabinet", "clipboard", "spiral_note_pad", "file_folder", "open_file_folder", "card_index_dividers", "rolled_up_newspaper", "newspaper", "notebook", "closed_book", "green_book", "blue_book", "orange_book", "notebook_with_decorative_cover", "ledger", "books", "book", "link", "paperclip", "linked_paperclips", "scissors", "triangular_ruler", "straight_ruler", "pushpin", "round_pushpin", "triangular_flag_on_post", "waving_white_flag", "waving_black_flag", "closed_lock_with_key", "lock", "unlock", "lock_with_ink_pen", "lower_left_ballpoint_pen", "lower_left_fountain_pen", "black_nib", "memo", "pencil2", "lower_left_crayon", "lower_left_paintbrush", "mag", "mag_right"]
        }, {
          name: "symbols",
          display_name: TS.i18n.t("Symbols", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_heart_o"></i></span>',
          tab_icon: "ts_icon_heart_o",
          tab_icon_name: "heart_o",
          emoji_names: ["heart", "yellow_heart", "green_heart", "blue_heart", "purple_heart", "broken_heart", "heavy_heart_exclamation_mark_ornament", "two_hearts", "revolving_hearts", "heartbeat", "heartpulse", "sparkling_heart", "cupid", "gift_heart", "heart_decoration", "peace_symbol", "latin_cross", "star_and_crescent", "om_symbol", "wheel_of_dharma", "star_of_david", "six_pointed_star", "menorah_with_nine_branches", "yin_yang", "orthodox_cross", "place_of_worship", "ophiuchus", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpius", "sagittarius", "capricorn", "aquarius", "pisces", "id", "atom_symbol", "u7a7a", "u5272", "radioactive_sign", "biohazard_sign", "mobile_phone_off", "vibration_mode", "u6709", "u7121", "u7533", "u55b6", "u6708", "eight_pointed_black_star", "vs", "accept", "white_flower", "ideograph_advantage", "secret", "congratulations", "u5408", "u6e80", "u7981", "a", "b", "ab", "cl", "o2", "sos", "no_entry", "name_badge", "no_entry_sign", "x", "o", "anger", "hotsprings", "no_pedestrians", "do_not_litter", "no_bicycles", "non-potable_water", "underage", "no_mobile_phones", "exclamation", "grey_exclamation", "question", "grey_question", "bangbang", "interrobang", "100", "low_brightness", "high_brightness", "trident", "fleur_de_lis", "part_alternation_mark", "warning", "children_crossing", "beginner", "recycle", "u6307", "chart", "sparkle", "eight_spoked_asterisk", "eject", "negative_squared_cross_mark", "white_check_mark", "diamond_shape_with_a_dot_inside", "cyclone", "loop", "globe_with_meridians", "m", "atm", "sa", "passport_control", "customs", "baggage_claim", "left_luggage", "wheelchair", "no_smoking", "wc", "parking", "potable_water", "mens", "womens", "baby_symbol", "restroom", "put_litter_in_its_place", "cinema", "signal_strength", "koko", "ng", "ok", "up", "cool", "new", "free", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten", "keycap_star", "1234", "arrow_forward", "double_vertical_bar", "black_right_pointing_triangle_with_double_vertical_bar", "black_square_for_stop", "black_circle_for_record", "black_right_pointing_double_triangle_with_vertical_bar", "black_left_pointing_double_triangle_with_vertical_bar", "fast_forward", "rewind", "twisted_rightwards_arrows", "repeat", "repeat_one", "arrow_backward", "arrow_up_small", "arrow_down_small", "arrow_double_up", "arrow_double_down", "arrow_right", "arrow_left", "arrow_up", "arrow_down", "arrow_upper_right", "arrow_lower_right", "arrow_lower_left", "arrow_upper_left", "arrow_up_down", "left_right_arrow", "arrows_counterclockwise", "arrow_right_hook", "leftwards_arrow_with_hook", "arrow_heading_up", "arrow_heading_down", "hash", "information_source", "abc", "abcd", "capital_abcd", "symbols", "musical_note", "notes", "wavy_dash", "curly_loop", "heavy_check_mark", "arrows_clockwise", "heavy_plus_sign", "heavy_minus_sign", "heavy_division_sign", "heavy_multiplication_x", "heavy_dollar_sign", "currency_exchange", "copyright", "registered", "tm", "end", "back", "on", "top", "soon", "ballot_box_with_check", "radio_button", "white_circle", "black_circle", "red_circle", "large_blue_circle", "small_orange_diamond", "small_blue_diamond", "large_orange_diamond", "large_blue_diamond", "small_red_triangle", "black_small_square", "white_small_square", "black_large_square", "white_large_square", "small_red_triangle_down", "black_medium_square", "white_medium_square", "black_medium_small_square", "white_medium_small_square", "black_square_button", "white_square_button", "speaker", "sound", "loud_sound", "mute", "mega", "loudspeaker", "bell", "no_bell", "black_joker", "mahjong", "spades", "clubs", "hearts", "diamonds", "flower_playing_cards", "thought_balloon", "right_anger_bubble", "speech_balloon", "left_speech_bubble", "clock1", "clock2", "clock3", "clock4", "clock5", "clock6", "clock7", "clock8", "clock9", "clock10", "clock11", "clock12", "clock130", "clock230", "clock330", "clock430", "clock530", "clock630", "clock730", "clock830", "clock930", "clock1030", "clock1130", "clock1230"]
        }, {
          name: "flags",
          display_name: TS.i18n.t("Flags", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_flag"></i></span>',
          tab_icon: "ts_icon_flag",
          tab_icon_name: "flag",
          emoji_names: ["flag-ac", "flag-ad", "flag-ae", "flag-af", "flag-ag", "flag-ai", "flag-al", "flag-am", "flag-ao", "flag-aq", "flag-ar", "flag-as", "flag-at", "flag-au", "flag-aw", "flag-ax", "flag-az", "flag-ba", "flag-bb", "flag-bd", "flag-be", "flag-bf", "flag-bg", "flag-bh", "flag-bi", "flag-bj", "flag-bl", "flag-bm", "flag-bn", "flag-bo", "flag-bq", "flag-br", "flag-bs", "flag-bt", "flag-bv", "flag-bw", "flag-by", "flag-bz", "flag-ca", "flag-cc", "flag-cd", "flag-cf", "flag-cg", "flag-ch", "flag-ci", "flag-ck", "flag-cl", "flag-cm", "flag-cn", "flag-co", "flag-cp", "flag-cr", "flag-cu", "flag-cv", "flag-cw", "flag-cx", "flag-cy", "flag-cz", "flag-de", "flag-dg", "flag-dj", "flag-dk", "flag-dm", "flag-do", "flag-dz", "flag-ea", "flag-ec", "flag-ee", "flag-eg", "flag-eh", "flag-er", "flag-es", "flag-et", "flag-eu", "flag-fi", "flag-fj", "flag-fk", "flag-fm", "flag-fo", "flag-fr", "flag-ga", "flag-gb", "flag-gd", "flag-ge", "flag-gf", "flag-gg", "flag-gh", "flag-gi", "flag-gl", "flag-gm", "flag-gn", "flag-gp", "flag-gq", "flag-gr", "flag-gs", "flag-gt", "flag-gu", "flag-gw", "flag-gy", "flag-hk", "flag-hm", "flag-hn", "flag-hr", "flag-ht", "flag-hu", "flag-ic", "flag-id", "flag-ie", "flag-il", "flag-im", "flag-in", "flag-io", "flag-iq", "flag-ir", "flag-is", "flag-it", "flag-je", "flag-jm", "flag-jo", "flag-jp", "flag-ke", "flag-kg", "flag-kh", "flag-ki", "flag-km", "flag-kn", "flag-kp", "flag-kr", "flag-kw", "flag-ky", "flag-kz", "flag-la", "flag-lb", "flag-lc", "flag-li", "flag-lk", "flag-lr", "flag-ls", "flag-lt", "flag-lu", "flag-lv", "flag-ly", "flag-ma", "flag-mc", "flag-md", "flag-me", "flag-mf", "flag-mg", "flag-mh", "flag-mk", "flag-ml", "flag-mm", "flag-mn", "flag-mo", "flag-mp", "flag-mq", "flag-mr", "flag-ms", "flag-mt", "flag-mu", "flag-mv", "flag-mw", "flag-mx", "flag-my", "flag-mz", "flag-na", "flag-nc", "flag-ne", "flag-nf", "flag-ng", "flag-ni", "flag-nl", "flag-no", "flag-np", "flag-nr", "flag-nu", "flag-nz", "flag-om", "flag-pa", "flag-pe", "flag-pf", "flag-pg", "flag-ph", "flag-pk", "flag-pl", "flag-pm", "flag-pn", "flag-pr", "flag-ps", "flag-pt", "flag-pw", "flag-py", "flag-qa", "flag-re", "flag-ro", "flag-rs", "flag-ru", "flag-rw", "flag-sa", "flag-sb", "flag-sc", "flag-sd", "flag-se", "flag-sg", "flag-sh", "flag-si", "flag-sj", "flag-sk", "flag-sl", "flag-sm", "flag-sn", "flag-so", "flag-sr", "flag-ss", "flag-st", "flag-sv", "flag-sx", "flag-sy", "flag-sz", "flag-ta", "flag-tc", "flag-td", "flag-tf", "flag-tg", "flag-th", "flag-tj", "flag-tk", "flag-tl", "flag-tm", "flag-tn", "flag-to", "flag-tr", "flag-tt", "flag-tv", "flag-tw", "flag-tz", "flag-ua", "flag-ug", "flag-um", "flag-us", "flag-uy", "flag-uz", "flag-va", "flag-vc", "flag-ve", "flag-vg", "flag-vi", "flag-vn", "flag-vu", "flag-wf", "flag-ws", "flag-xk", "flag-ye", "flag-yt", "flag-za", "flag-zm", "flag-zw"]
        }];
      TS.boot_data.feature_update_emoji_to_v4 || m.forEach(function(e) {
        TS.emoji.spliceSkinToneVariationsIntoAnArrayOfEmojiNames(e.emoji_names);
      });
      var u = function() {
          _.find(m, {
            name: "people"
          }).emoji_names = ["grinning", "smiley", "smile", "grin", "laughing", "sweat_smile", "joy", "rolling_on_the_floor_laughing", "relaxed", "blush", "innocent", "slightly_smiling_face", "upside_down_face", "wink", "relieved", "heart_eyes", "kissing_heart", "kissing", "kissing_smiling_eyes", "kissing_closed_eyes", "yum", "stuck_out_tongue_winking_eye", "stuck_out_tongue_closed_eyes", "stuck_out_tongue", "money_mouth_face", "hugging_face", "nerd_face", "sunglasses", "clown_face", "face_with_cowboy_hat", "smirk", "unamused", "disappointed", "pensive", "worried", "confused", "slightly_frowning_face", "white_frowning_face", "persevere", "confounded", "tired_face", "weary", "triumph", "angry", "rage", "no_mouth", "neutral_face", "expressionless", "hushed", "frowning", "anguished", "open_mouth", "astonished", "dizzy_face", "flushed", "scream", "fearful", "cold_sweat", "cry", "disappointed_relieved", "drooling_face", "sob", "sweat", "sleepy", "sleeping", "face_with_rolling_eyes", "thinking_face", "lying_face", "grimacing", "zipper_mouth_face", "nauseated_face", "sneezing_face", "mask", "face_with_thermometer", "face_with_head_bandage", "smiling_imp", "imp", "japanese_ogre", "japanese_goblin", "hankey", "ghost", "skull", "skull_and_crossbones", "alien", "space_invader", "robot_face", "jack_o_lantern", "smiley_cat", "smile_cat", "joy_cat", "heart_eyes_cat", "smirk_cat", "kissing_cat", "scream_cat", "crying_cat_face", "pouting_cat", "open_hands", "raised_hands", "clap", "pray", "handshake", "+1", "-1", "facepunch", "fist", "left-facing_fist", "right-facing_fist", "hand_with_index_and_middle_fingers_crossed", "v", "the_horns", "ok_hand", "point_left", "point_right", "point_up_2", "point_down", "point_up", "hand", "raised_back_of_hand", "raised_hand_with_fingers_splayed", "spock-hand", "wave", "call_me_hand", "muscle", "middle_finger", "writing_hand", "selfie", "nail_care", "ring", "lipstick", "kiss", "lips", "tongue", "ear", "nose", "footprints", "eye", "eyes", "speaking_head_in_silhouette", "bust_in_silhouette", "busts_in_silhouette", "baby", "boy", "girl", "man", "woman", "blond-haired-woman", "person_with_blond_hair", "older_man", "older_woman", "man_with_gua_pi_mao", "woman-wearing-turban", "man_with_turban", "female-police-officer", "cop", "female-construction-worker", "construction_worker", "female-guard", "guardsman", "female-detective", "sleuth_or_spy", "female-doctor", "male-doctor", "female-farmer", "male-farmer", "female-cook", "male-cook", "female-student", "male-student", "female-singer", "male-singer", "female-teacher", "male-teacher", "female-factory-worker", "male-factory-worker", "female-technologist", "male-technologist", "female-office-worker", "male-office-worker", "female-mechanic", "male-mechanic", "female-scientist", "male-scientist", "female-artist", "male-artist", "female-firefighter", "male-firefighter", "female-pilot", "male-pilot", "female-astronaut", "male-astronaut", "female-judge", "male-judge", "mother_christmas", "santa", "princess", "prince", "bride_with_veil", "man_in_tuxedo", "angel", "pregnant_woman", "woman-bowing", "bow", "information_desk_person", "man-tipping-hand", "no_good", "man-gesturing-no", "ok_woman", "man-gesturing-ok", "raising_hand", "man-raising-hand", "face_palm", "woman-facepalming", "man-facepalming", "shrug", "woman-shrugging", "man-shrugging", "person_with_pouting_face", "man-pouting", "person_frowning", "man-frowning", "haircut", "man-getting-haircut", "massage", "man-getting-massage", "man_in_business_suit_levitating", "dancer", "man_dancing", "dancers", "man-with-bunny-ears-partying", "woman-walking", "walking", "woman-running", "runner", "couple", "two_women_holding_hands", "two_men_holding_hands", "couple_with_heart", "woman-heart-woman", "man-heart-man", "couplekiss", "woman-kiss-woman", "man-kiss-man", "family", "man-woman-girl", "man-woman-girl-boy", "man-woman-boy-boy", "man-woman-girl-girl", "woman-woman-boy", "woman-woman-girl", "woman-woman-girl-boy", "woman-woman-boy-boy", "woman-woman-girl-girl", "man-man-boy", "man-man-girl", "man-man-girl-boy", "man-man-boy-boy", "man-man-girl-girl", "woman-boy", "woman-girl", "woman-girl-boy", "woman-boy-boy", "woman-girl-girl", "man-boy", "man-girl", "man-girl-boy", "man-boy-boy", "man-girl-girl", "womans_clothes", "shirt", "jeans", "necktie", "dress", "bikini", "kimono", "high_heel", "sandal", "boot", "mans_shoe", "athletic_shoe", "womans_hat", "tophat", "mortar_board", "crown", "helmet_with_white_cross", "school_satchel", "pouch", "purse", "handbag", "briefcase", "eyeglasses", "dark_sunglasses", "closed_umbrella", "umbrella", "man-woman-boy", "woman-heart-man", "woman-kiss-man", "male-police-officer", "blond-haired-man", "man-wearing-turban", "male-construction-worker", "male-guard", "male-detective", "woman-with-bunny-ears-partying", "man-running", "woman-getting-massage", "woman-getting-haircut", "man-walking", "woman-tipping-hand", "woman-gesturing-no", "woman-gesturing-ok", "man-bowing", "woman-raising-hand", "woman-frowning", "woman-pouting"], _.find(m, {
            name: "nature"
          }).emoji_names = ["dog", "cat", "mouse", "hamster", "rabbit", "fox_face", "bear", "panda_face", "koala", "tiger", "lion_face", "cow", "pig", "pig_nose", "frog", "monkey_face", "see_no_evil", "hear_no_evil", "speak_no_evil", "monkey", "chicken", "penguin", "bird", "baby_chick", "hatching_chick", "hatched_chick", "duck", "eagle", "owl", "bat", "wolf", "boar", "horse", "unicorn_face", "bee", "bug", "butterfly", "snail", "shell", "beetle", "ant", "spider", "spider_web", "turtle", "snake", "lizard", "scorpion", "crab", "squid", "octopus", "shrimp", "tropical_fish", "fish", "blowfish", "dolphin", "shark", "whale", "whale2", "crocodile", "leopard", "tiger2", "water_buffalo", "ox", "cow2", "deer", "dromedary_camel", "camel", "elephant", "rhinoceros", "gorilla", "racehorse", "pig2", "goat", "ram", "sheep", "dog2", "poodle", "cat2", "rooster", "turkey", "dove_of_peace", "rabbit2", "mouse2", "rat", "chipmunk", "feet", "dragon", "dragon_face", "cactus", "christmas_tree", "evergreen_tree", "deciduous_tree", "palm_tree", "seedling", "herb", "shamrock", "four_leaf_clover", "bamboo", "tanabata_tree", "leaves", "fallen_leaf", "maple_leaf", "mushroom", "ear_of_rice", "bouquet", "tulip", "rose", "wilted_flower", "sunflower", "blossom", "cherry_blossom", "hibiscus", "earth_americas", "earth_africa", "earth_asia", "full_moon", "waning_gibbous_moon", "last_quarter_moon", "waning_crescent_moon", "new_moon", "waxing_crescent_moon", "first_quarter_moon", "moon", "new_moon_with_face", "full_moon_with_face", "sun_with_face", "first_quarter_moon_with_face", "last_quarter_moon_with_face", "crescent_moon", "dizzy", "star", "star2", "sparkles", "zap", "fire", "boom", "comet", "sunny", "mostly_sunny", "partly_sunny", "barely_sunny", "partly_sunny_rain", "rainbow", "cloud", "rain_cloud", "thunder_cloud_and_rain", "lightning", "snow_cloud", "snowman", "snowman_without_snow", "snowflake", "wind_blowing_face", "dash", "tornado", "fog", "ocean", "droplet", "sweat_drops", "umbrella_with_rain_drops"], _.find(m, {
            name: "food_and_drink"
          }).emoji_names = ["green_apple", "apple", "pear", "tangerine", "lemon", "banana", "watermelon", "grapes", "strawberry", "melon", "cherries", "peach", "pineapple", "kiwifruit", "avocado", "tomato", "eggplant", "cucumber", "carrot", "corn", "hot_pepper", "potato", "sweet_potato", "chestnut", "peanuts", "honey_pot", "croissant", "bread", "baguette_bread", "cheese_wedge", "egg", "fried_egg", "bacon", "pancakes", "fried_shrimp", "poultry_leg", "meat_on_bone", "pizza", "hotdog", "hamburger", "fries", "stuffed_flatbread", "taco", "burrito", "green_salad", "shallow_pan_of_food", "spaghetti", "ramen", "stew", "fish_cake", "sushi", "bento", "curry", "rice", "rice_ball", "rice_cracker", "oden", "dango", "shaved_ice", "ice_cream", "icecream", "cake", "birthday", "custard", "lollipop", "candy", "chocolate_bar", "popcorn", "doughnut", "cookie", "glass_of_milk", "baby_bottle", "coffee", "tea", "sake", "beer", "beers", "clinking_glasses", "wine_glass", "tumbler_glass", "cocktail", "tropical_drink", "champagne", "spoon", "fork_and_knife", "knife_fork_plate"], _.find(m, {
            name: "activity"
          }).emoji_names = ["soccer", "basketball", "football", "baseball", "tennis", "volleyball", "rugby_football", "8ball", "table_tennis_paddle_and_ball", "badminton_racquet_and_shuttlecock", "goal_net", "ice_hockey_stick_and_puck", "field_hockey_stick_and_ball", "cricket_bat_and_ball", "golf", "bow_and_arrow", "fishing_pole_and_fish", "boxing_glove", "martial_arts_uniform", "ice_skate", "ski", "skier", "snowboarder", "woman-lifting-weights", "weight_lifter", "fencer", "wrestlers", "woman-wrestling", "man-wrestling", "person_doing_cartwheel", "woman-cartwheeling", "man-cartwheeling", "woman-bouncing-ball", "person_with_ball", "handball", "woman-playing-handball", "man-playing-handball", "woman-golfing", "golfer", "woman-surfing", "surfer", "woman-swimming", "swimmer", "water_polo", "woman-playing-water-polo", "man-playing-water-polo", "woman-rowing-boat", "rowboat", "horse_racing", "woman-biking", "bicyclist", "woman-mountain-biking", "mountain_bicyclist", "running_shirt_with_sash", "sports_medal", "medal", "first_place_medal", "second_place_medal", "third_place_medal", "trophy", "rosette", "reminder_ribbon", "ticket", "admission_tickets", "circus_tent", "juggling", "woman-juggling", "man-juggling", "performing_arts", "art", "clapper", "microphone", "headphones", "musical_score", "musical_keyboard", "drum_with_drumsticks", "saxophone", "trumpet", "guitar", "violin", "game_die", "dart", "bowling", "video_game", "slot_machine", "man-bouncing-ball", "man-lifting-weights", "man-golfing", "man-surfing", "man-swimming", "man-rowing-boat", "man-biking", "man-mountain-biking"], _.find(m, {
            name: "travel_and_places"
          }).emoji_names = ["car", "taxi", "blue_car", "bus", "trolleybus", "racing_car", "police_car", "ambulance", "fire_engine", "minibus", "truck", "articulated_lorry", "tractor", "scooter", "bike", "motor_scooter", "racing_motorcycle", "rotating_light", "oncoming_police_car", "oncoming_bus", "oncoming_automobile", "oncoming_taxi", "aerial_tramway", "mountain_cableway", "suspension_railway", "railway_car", "train", "mountain_railway", "monorail", "bullettrain_side", "bullettrain_front", "light_rail", "steam_locomotive", "train2", "metro", "tram", "station", "helicopter", "small_airplane", "airplane", "airplane_departure", "airplane_arriving", "rocket", "satellite", "seat", "canoe", "boat", "motor_boat", "speedboat", "passenger_ship", "ferry", "ship", "anchor", "construction", "fuelpump", "busstop", "vertical_traffic_light", "traffic_light", "world_map", "moyai", "statue_of_liberty", "fountain", "tokyo_tower", "european_castle", "japanese_castle", "stadium", "ferris_wheel", "roller_coaster", "carousel_horse", "umbrella_on_ground", "beach_with_umbrella", "desert_island", "mountain", "snow_capped_mountain", "mount_fuji", "volcano", "desert", "camping", "tent", "railway_track", "motorway", "building_construction", "factory", "house", "house_with_garden", "house_buildings", "derelict_house_building", "office", "department_store", "post_office", "european_post_office", "hospital", "bank", "hotel", "convenience_store", "school", "love_hotel", "wedding", "classical_building", "church", "mosque", "synagogue", "kaaba", "shinto_shrine", "japan", "rice_scene", "national_park", "sunrise", "sunrise_over_mountains", "stars", "sparkler", "fireworks", "city_sunrise", "city_sunset", "cityscape", "night_with_stars", "milky_way", "bridge_at_night", "foggy"], _.find(m, {
            name: "objects"
          }).emoji_names = ["watch", "iphone", "calling", "computer", "keyboard", "desktop_computer", "printer", "three_button_mouse", "trackball", "joystick", "compression", "minidisc", "floppy_disk", "cd", "dvd", "vhs", "camera", "camera_with_flash", "video_camera", "movie_camera", "film_projector", "film_frames", "telephone_receiver", "phone", "pager", "fax", "tv", "radio", "studio_microphone", "level_slider", "control_knobs", "stopwatch", "timer_clock", "alarm_clock", "mantelpiece_clock", "hourglass", "hourglass_flowing_sand", "satellite_antenna", "battery", "electric_plug", "bulb", "flashlight", "candle", "wastebasket", "oil_drum", "money_with_wings", "dollar", "yen", "euro", "pound", "moneybag", "credit_card", "gem", "scales", "wrench", "hammer", "hammer_and_pick", "hammer_and_wrench", "pick", "nut_and_bolt", "gear", "chains", "gun", "bomb", "hocho", "dagger_knife", "crossed_swords", "shield", "smoking", "coffin", "funeral_urn", "amphora", "crystal_ball", "prayer_beads", "barber", "alembic", "telescope", "microscope", "hole", "pill", "syringe", "thermometer", "toilet", "potable_water", "shower", "bathtub", "bath", "bellhop_bell", "key", "old_key", "door", "couch_and_lamp", "bed", "sleeping_accommodation", "frame_with_picture", "shopping_bags", "shopping_trolley", "gift", "balloon", "flags", "ribbon", "confetti_ball", "tada", "dolls", "izakaya_lantern", "wind_chime", "email", "envelope_with_arrow", "incoming_envelope", "e-mail", "love_letter", "inbox_tray", "outbox_tray", "package", "label", "mailbox_closed", "mailbox", "mailbox_with_mail", "mailbox_with_no_mail", "postbox", "postal_horn", "scroll", "page_with_curl", "page_facing_up", "bookmark_tabs", "bar_chart", "chart_with_upwards_trend", "chart_with_downwards_trend", "spiral_note_pad", "spiral_calendar_pad", "calendar", "date", "card_index", "card_file_box", "ballot_box_with_ballot", "file_cabinet", "clipboard", "file_folder", "open_file_folder", "card_index_dividers", "rolled_up_newspaper", "newspaper", "notebook", "notebook_with_decorative_cover", "ledger", "closed_book", "green_book", "blue_book", "orange_book", "books", "book", "bookmark", "link", "paperclip", "linked_paperclips", "triangular_ruler", "straight_ruler", "pushpin", "round_pushpin", "scissors", "lower_left_ballpoint_pen", "lower_left_fountain_pen", "black_nib", "lower_left_paintbrush", "lower_left_crayon", "memo", "pencil2", "mag", "mag_right", "lock_with_ink_pen", "closed_lock_with_key", "lock", "unlock"], _.find(m, {
            name: "symbols"
          }).emoji_names = ["heart", "yellow_heart", "green_heart", "blue_heart", "purple_heart", "black_heart", "broken_heart", "heavy_heart_exclamation_mark_ornament", "two_hearts", "revolving_hearts", "heartbeat", "heartpulse", "sparkling_heart", "cupid", "gift_heart", "heart_decoration", "peace_symbol", "latin_cross", "star_and_crescent", "om_symbol", "wheel_of_dharma", "star_of_david", "six_pointed_star", "menorah_with_nine_branches", "yin_yang", "orthodox_cross", "place_of_worship", "ophiuchus", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpius", "sagittarius", "capricorn", "aquarius", "pisces", "id", "atom_symbol", "accept", "radioactive_sign", "biohazard_sign", "mobile_phone_off", "vibration_mode", "u6709", "u7121", "u7533", "u55b6", "u6708", "eight_pointed_black_star", "vs", "white_flower", "ideograph_advantage", "secret", "congratulations", "u5408", "u6e80", "u5272", "u7981", "a", "b", "ab", "cl", "o2", "sos", "x", "o", "octagonal_sign", "no_entry", "name_badge", "no_entry_sign", "100", "anger", "hotsprings", "no_pedestrians", "do_not_litter", "no_bicycles", "non-potable_water", "underage", "no_mobile_phones", "no_smoking", "exclamation", "grey_exclamation", "question", "grey_question", "bangbang", "interrobang", "low_brightness", "high_brightness", "part_alternation_mark", "warning", "children_crossing", "trident", "fleur_de_lis", "beginner", "recycle", "white_check_mark", "u6307", "chart", "sparkle", "eight_spoked_asterisk", "negative_squared_cross_mark", "globe_with_meridians", "diamond_shape_with_a_dot_inside", "m", "cyclone", "zzz", "atm", "wc", "wheelchair", "parking", "u7a7a", "sa", "passport_control", "customs", "baggage_claim", "left_luggage", "mens", "womens", "baby_symbol", "restroom", "put_litter_in_its_place", "cinema", "signal_strength", "koko", "symbols", "information_source", "abc", "abcd", "capital_abcd", "ng", "ok", "up", "cool", "new", "free", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten", "1234", "hash", "keycap_star", "arrow_forward", "double_vertical_bar", "black_right_pointing_triangle_with_double_vertical_bar", "black_square_for_stop", "eject", "black_circle_for_record", "black_right_pointing_double_triangle_with_vertical_bar", "black_left_pointing_double_triangle_with_vertical_bar", "fast_forward", "rewind", "arrow_double_up", "arrow_double_down", "arrow_backward", "arrow_up_small", "arrow_down_small", "arrow_right", "arrow_left", "arrow_up", "arrow_down", "arrow_upper_right", "arrow_lower_right", "arrow_lower_left", "arrow_upper_left", "arrow_up_down", "left_right_arrow", "arrow_right_hook", "leftwards_arrow_with_hook", "arrow_heading_up", "arrow_heading_down", "twisted_rightwards_arrows", "repeat", "repeat_one", "arrows_counterclockwise", "arrows_clockwise", "musical_note", "notes", "heavy_plus_sign", "heavy_minus_sign", "heavy_division_sign", "heavy_multiplication_x", "heavy_dollar_sign", "currency_exchange", "tm", "copyright", "registered", "wavy_dash", "curly_loop", "loop", "end", "back", "on", "top", "soon", "heavy_check_mark", "ballot_box_with_check", "radio_button", "white_circle", "black_circle", "red_circle", "large_blue_circle", "small_red_triangle", "small_red_triangle_down", "small_orange_diamond", "small_blue_diamond", "large_orange_diamond", "large_blue_diamond", "white_square_button", "black_square_button", "black_small_square", "white_small_square", "black_medium_small_square", "white_medium_small_square", "black_medium_square", "white_medium_square", "black_large_square", "white_large_square", "speaker", "mute", "sound", "loud_sound", "bell", "no_bell", "mega", "loudspeaker", "eye-in-speech-bubble", "speech_balloon", "left_speech_bubble", "thought_balloon", "right_anger_bubble", "spades", "clubs", "hearts", "diamonds", "black_joker", "flower_playing_cards", "mahjong", "clock1", "clock2", "clock3", "clock4", "clock5", "clock6", "clock7", "clock8", "clock9", "clock10", "clock11", "clock12", "clock130", "clock230", "clock330", "clock430", "clock530", "clock630", "clock730", "clock830", "clock930", "clock1030", "clock1130", "clock1230", "female_sign", "male_sign", "staff_of_aesculapius"], _.find(m, {
            name: "flags"
          }).emoji_names = ["checkered_flag", "crossed_flags", "flag-ac", "flag-ad", "flag-ae", "flag-af", "flag-ag", "flag-ai", "flag-al", "flag-am", "flag-ao", "flag-aq", "flag-ar", "flag-as", "flag-at", "flag-au", "flag-aw", "flag-ax", "flag-az", "flag-ba", "flag-bb", "flag-bd", "flag-be", "flag-bf", "flag-bg", "flag-bh", "flag-bi", "flag-bj", "flag-bl", "flag-bm", "flag-bn", "flag-bo", "flag-bq", "flag-br", "flag-bs", "flag-bt", "flag-bv", "flag-bw", "flag-by", "flag-bz", "flag-ca", "flag-cc", "flag-cd", "flag-cf", "flag-cg", "flag-ch", "flag-ci", "flag-ck", "flag-cl", "flag-cm", "flag-cn", "flag-co", "flag-cp", "flag-cr", "flag-cu", "flag-cv", "flag-cw", "flag-cx", "flag-cy", "flag-cz", "flag-de", "flag-dg", "flag-dj", "flag-dk", "flag-dm", "flag-do", "flag-dz", "flag-ea", "flag-ec", "flag-ee", "flag-eg", "flag-eh", "flag-er", "flag-es", "flag-et", "flag-eu", "flag-fi", "flag-fj", "flag-fk", "flag-fm", "flag-fo", "flag-fr", "flag-ga", "flag-gb", "flag-gd", "flag-ge", "flag-gf", "flag-gg", "flag-gh", "flag-gi", "flag-gl", "flag-gm", "flag-gn", "flag-gp", "flag-gq", "flag-gr", "flag-gs", "flag-gt", "flag-gu", "flag-gw", "flag-gy", "flag-hk", "flag-hm", "flag-hn", "flag-hr", "flag-ht", "flag-hu", "flag-ic", "flag-id", "flag-ie", "flag-il", "flag-im", "flag-in", "flag-io", "flag-iq", "flag-ir", "flag-is", "flag-it", "flag-je", "flag-jm", "flag-jo", "flag-jp", "flag-ke", "flag-kg", "flag-kh", "flag-ki", "flag-km", "flag-kn", "flag-kp", "flag-kr", "flag-kw", "flag-ky", "flag-kz", "flag-la", "flag-lb", "flag-lc", "flag-li", "flag-lk", "flag-lr", "flag-ls", "flag-lt", "flag-lu", "flag-lv", "flag-ly", "flag-ma", "flag-mc", "flag-md", "flag-me", "flag-mf", "flag-mg", "flag-mh", "flag-mk", "flag-ml", "flag-mm", "flag-mn", "flag-mo", "flag-mp", "flag-mq", "flag-mr", "flag-ms", "flag-mt", "flag-mu", "flag-mv", "flag-mw", "flag-mx", "flag-my", "flag-mz", "flag-na", "flag-nc", "flag-ne", "flag-nf", "flag-ng", "flag-ni", "flag-nl", "flag-no", "flag-np", "flag-nr", "flag-nu", "flag-nz", "flag-om", "flag-pa", "flag-pe", "flag-pf", "flag-pg", "flag-ph", "flag-pk", "flag-pl", "flag-pm", "flag-pn", "flag-pr", "flag-ps", "flag-pt", "flag-pw", "flag-py", "flag-qa", "flag-re", "flag-ro", "flag-rs", "flag-ru", "flag-rw", "flag-sa", "flag-sb", "flag-sc", "flag-sd", "flag-se", "flag-sg", "flag-sh", "flag-si", "flag-sj", "flag-sk", "flag-sl", "flag-sm", "flag-sn", "flag-so", "flag-sr", "flag-ss", "flag-st", "flag-sv", "flag-sx", "flag-sy", "flag-sz", "flag-ta", "flag-tc", "flag-td", "flag-tf", "flag-tg", "flag-th", "flag-tj", "flag-tk", "flag-tl", "flag-tm", "flag-tn", "flag-to", "flag-tr", "flag-tt", "flag-tv", "flag-tw", "flag-tz", "flag-ua", "flag-ug", "flag-um", "flag-un", "flag-us", "flag-uy", "flag-uz", "flag-va", "flag-vc", "flag-ve", "flag-vg", "flag-vi", "flag-vn", "flag-vu", "flag-wf", "flag-ws", "flag-xk", "flag-ye", "flag-yt", "flag-za", "flag-zm", "flag-zw", "rainbow-flag", "triangular_flag_on_post", "waving_black_flag", "waving_white_flag"];
        },
        g = function() {
          TS.emoji.setUpEmoji();
        },
        f = function() {
          TS.client && TS.model.ms_logged_in_once && (TS.client.msg_pane.rebuildMsgsWithReason("_toggleJumbomoji"), TS.view.rebuildMentions(), TS.view.rebuildStars(), TS.model.previewed_file_id && TS.client.ui.files.rebuildFilePreview());
        },
        p = function() {
          c.unaltered_data && (c.data = _.cloneDeep(c.unaltered_data), c.inits = {}), c.ts_init_colons();
        },
        h = function() {
          TS.emoji.setEmojiMode(), TS.emoji.makeMenuLists();
          var e = !!TS.model.ms_logged_in_once;
          TS.client && e && TS.client.ui.rebuildAll(!1, !0);
        },
        S = function(e, n, a) {
          if (c) {
            var o = TS.storage.fetchCustomEmoji();
            if (!o) return void TS.emoji.resetUpEmoji();
            if (void 0 === n) {
              if (delete TS.model.emoji_use[e], !o.data.hasOwnProperty(e)) return;
              delete o.data[e], _.remove(TS.model.emoji_map, {
                name: e
              });
            } else o.data[e] = n;
            TS.model.emoji_cache_ts = a, TS.storage.storeCustomEmoji({
              data: o.data,
              cache_ts: TS.model.emoji_cache_ts
            }), p(), TS.emoji.ingestCustoms(o.data), h();
          }
        };
    }();
  },
  2447: function(e, n) {
    ! function() {
      "use strict";

      function e() {
        return window.devicePixelRatio > 1;
      }

      function n() {
        var e = ["is_apple_webkit", "is_macgap", "supports_sticky_position", "supports_custom_scrollbar", "slim_scrollbar", "supports_flexbox", "supports_line_clamp"],
          n = _.partition(e, function(e) {
            return TS.environment[e];
          }),
          a = $("html");
        a.addClass(n[0].join(" ")), a.removeClass(n[1].join(" "));
      }

      function a(e) {
        if ("scrollbar" === e) return s();
        var n = document.createElement("css_property_supported").style;
        e = e.replace(m, "").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/([a-z\d])([A-Z])/g, "$1-$2").replace(d, "").toLowerCase(), e = _.camelCase(e, "-");
        var a = _.upperFirst(e);
        return void 0 !== n[e] || c.some(function(o) {
          return void 0 !== n[o + a] || void 0 !== n[o + e];
        });
      }

      function o(e, n) {
        var a = document.createElement("css_value_supported");
        return n = n.replace(d, "").toLowerCase(), a.style.cssText = e + ":" + l.join(n + ";" + e + ":") + n + ";", !!a.style.length;
      }

      function t() {
        TS.environment.supports_sticky_position = o("position", "sticky"), "Chrome" === window.bowser.name && parseInt(window.bowser.version, 10) < 57 && e() && (TS.environment.supports_sticky_position = !1), TS.useRedux() && TS.redux.dispatch(TS.interop.redux.entities.environment.setSupportsStickyPosition(TS.environment.supports_sticky_position));
      }

      function i() {
        TS.environment.is_apple_webkit = !(!TS.model.mac_ssb_version && !TS.model.is_safari_desktop), TS.environment.is_dev = "dev" === TS.boot_data.version_ts, TS.environment.is_macgap = !!window.macgap, TS.environment.is_retina = e(), TS.environment.supports_custom_scrollbar = a("scrollbar"), TS.environment.slim_scrollbar = TS.environment.supports_custom_scrollbar && TS.boot_data.feature_slim_scrollbar, TS.environment.supports_flexbox = a("flex-wrap"), TS.environment.supports_line_clamp = a("line-clamp"), TS.environment.supports_intersection_observer = "function" == typeof IntersectionObserver, t();
      }

      function r() {
        if (window.matchMedia) {
          window.matchMedia("screen and (-webkit-min-device-pixel-ratio: 1.5), screen and (min--moz-device-pixel-ratio: 1.5), screen and (min-device-pixel-ratio: 1.5)").addListener(function() {
            var a = TS.environment.is_retina;
            TS.environment.is_retina = e(), TS.environment.is_retina !== a && (TS.info("TS.environment.is_retina changed from " + a + " to " + TS.environment.is_retina), TS.environment.retina_changed_sig.dispatch(TS.environment.is_retina), t(), n());
          });
        }
      }

      function s() {
        var e = document.createElement("div");
        e.id = "__sb", e.style.overflow = "scroll", e.style.width = "40px", e.style.height = "40px", e.style.position = "absolute", e.style.left = "-40px", e.innerHTML = "&shy;<style>#__sb::-webkit-scrollbar {width:10px;}</style>", document.body.appendChild(e);
        var n = 30 == e.scrollWidth;
        return document.body.removeChild(e), n;
      }
      TS.registerModule("environment", {
        is_apple_webkit: !1,
        is_dev: !1,
        is_macgap: !1,
        is_retina: !1,
        retina_changed_sig: new signals.Signal,
        supports_sticky_position: !1,
        supports_custom_scrollbar: !1,
        slim_scrollbar: !1,
        supports_flexbox: !1,
        supports_line_clamp: !1,
        supports_intersection_observer: !1,
        onStart: function() {
          i(), n(), r();
        },
        isSSBAndAtLeastVersion: function(e) {
          if (!TS.model.is_our_app) return !1;
          var n = e.split("."),
            a = {
              major: 0,
              minor: 0
            },
            o = {
              major: 0,
              minor: 0
            };
          return n.length > 2 && (a.minor = parseFloat(n.pop())), a.major = parseFloat(n.join(".")), TS.model.mac_ssb_version ? (o.major = TS.model.mac_ssb_version, o.minor = TS.model.mac_ssb_version_minor) : TS.model.win_ssb_version ? (o.major = TS.model.win_ssb_version, o.minor = TS.model.win_ssb_version_minor) : TS.model.lin_ssb_version && (o.major = TS.model.lin_ssb_version, o.minor = TS.model.lin_ssb_version_minor), TS.utility.compareVersions(o, a) >= 0;
        },
        doesSupportStickyPosition: function() {
          return TS.environment.supports_sticky_position;
        },
        test: function() {
          var e = {
            _decoratePageWithSupport: n,
            _initialSetup: i
          };
          return Object.defineProperty(e, "cssPropertySupported", {
            get: function() {
              return a;
            },
            set: function(e) {
              a = e;
            }
          }), Object.defineProperty(e, "cssValueSupported", {
            get: function() {
              return o;
            },
            set: function(e) {
              o = e;
            }
          }), e;
        }
      });
      var l = ["-webkit-", "-moz-", "-o-", "-ms-", ""],
        c = ["Webkit", "Moz", "O", "ms", ""],
        d = new RegExp("^(-*" + l.slice(0, l.length - 1).join("|-*") + ")"),
        m = new RegExp("^(" + c.slice(0, c.length - 1).join("|") + ")");
    }();
  },
  2448: function(e, n) {
    ! function() {
      "use strict";
      window.TS || (window.TS = {}), TS.features = {
        isEnabled: function(e) {
          if (0 === e.indexOf("feature_")) return void TS.console.warn("Do not prefix your feature flag check with `feature_`. Flag:", e);
          if (_.isUndefined(TS.boot_data)) return void TS.console.warn("Trying to check feature flag before TS.boot_data is available");
          var n = "feature_" + e;
          return _.isUndefined(TS.boot_data[n]) ? void TS.console.warn("Trying to access feature flag not present in TS.boot_data -- Expose your feature flag to JS. Flag:", e) : TS.boot_data[n];
        }
      };
    }();
  },
  2461: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("incremental_boot", {
        onStart: function() {
          TS.channels.switched_sig.add(r), TS.ims.switched_sig.add(r), TS.groups.switched_sig.add(r), TS.mpims.switched_sig.add(r), TS.isSocketManagerEnabled() ? TS.interop.SocketManager.connectedSig.addOnce(r) : TS.ms.connected_sig.addOnce(r);
        },
        startIncrementalBoot: function() {
          if (TS._did_incremental_boot) return Promise.reject(new Error("_startIncrementalBoot called more than once; this is a programming error."));
          TS._did_incremental_boot = !0;
          var e = TS.boot_data.incremental_boot_data;
          delete TS.boot_data.incremental_boot_data;
          var a = {
            canonical_avatars: !0,
            include_full_users: !0,
            count: TS.model.initial_msgs_cnt - 1,
            ignore_replies: !0,
            include_pin_count: !!TS.boot_data.feature_lazy_pins
          };
          TS.boot_data.feature_name_tagging_client && (a.name_tagging = !0);
          var o = TS.utility.getChannelNameFromUrl(window.location.toString());
          if (o) TS.model.c_name_in_url = o, a.name = o;
          else {
            var i = TS.storage.fetchLastActiveModelObId();
            i && (a.channel = i);
          }
          return TS.membership && TS.membership.lazyLoadChannelMembership() && (a.no_members = !0), t(!0), TS.model.change_channels_when_offline = !1, TS.api.call("channels.view", a).then(function(a) {
            return TS._incremental_boot = !0, {
              ok: !0,
              data: n(e, a.data),
              args: a.args
            };
          }).catch(function(e) {
            throw TS.warn("Incremental boot failed with error: " + e), TS._incremental_boot = !1, TS._did_incremental_boot = !1, TS.model.change_channels_when_offline = !0, t(!1), e;
          });
        },
        beforeFullBoot: function() {
          TS._incremental_boot && TS._did_incremental_boot && (TS._did_full_boot || (TS._incremental_boot = !1, e = setTimeout(o, 1e4), TS.client && TS.client.ui && TS.client.ui.$messages_input_container && TS.client.ui.$messages_input_container.one(a, o), TS.isSocketManagerEnabled() ? TS.interop.SocketManager.connectedSig.addOnce(o) : TS.ms.connected_sig.addOnce(o)));
        },
        afterFullBoot: function() {
          TS._did_incremental_boot && (TS._did_full_boot = !0, TS.model.change_channels_when_offline = !0), t(!1);
        },
        shouldIncrementalBoot: function() {
          if (TS._did_incremental_boot) return !1;
          if (!TS.boot_data.incremental_boot_data) return !1;
          if (TS.model.ms_logged_in_once) return !1;
          if (TS.newxp.shouldShowFirstWelcome()) return delete TS.boot_data.incremental_boot_data, !1;
          var e = history.location || document.location;
          return TS.utility.isUnreadViewPath(e.pathname) ? (delete TS.boot_data.incremental_boot_data, !1) : TS.utility.isThreadsViewPath(e.pathname) ? (delete TS.boot_data.incremental_boot_data, !1) : !TS.utility.isAppSpaceViewPath(e.pathname) || (delete TS.boot_data.incremental_boot_data, !1);
        },
        userDidInteractWithUI: function() {
          TS.sounds.play("beep"), o();
        }
      });
      var e, n = function(e, n) {
          var a = n;
          a.channels = a.channels || [], a.groups = a.groups || [], a.ims = a.ims || [], a.mpims = a.mpims || [];
          var o = a.channel || a.group || a.im;
          if (TS.model.initial_cid = o.id, delete a.channel, delete a.group, a.history && a.history.messages ? o.msgs = a.history.messages : o.msgs = [], TS.boot_data.feature_lazy_pins && TS.pins && a.history && TS.pins.updateCount(o, a.history.pin_count), Object.keys(e).forEach(function(n) {
              a[n] = _.merge(e[n], a[n]);
            }), !a.self || a.self.id != TS.boot_data.user_id) throw new Error("Missing `self` from incremental boot data");
          if (_.find(a.users, {
              id: a.self.id
            }) || a.users.push(a.self), a.users.forEach(function(e) {
              "USLACKBOT" !== e.id && e.id != TS.boot_data.user_id || (e.presence = "active"), delete e.updated;
            }), o.is_mpim) i(o, a.mpims);
          else if (o.is_group) i(o, a.groups);
          else if (o.is_im) i(o, a.ims);
          else {
            if (!o.is_channel) throw new Error("Unexpected model object type from channels.view");
            i(o, a.channels);
          }
          return a.emoji_cache_ts = _.get(TS.storage.fetchCustomEmoji(), "cache_ts"), a.apps_cache_ts = _.get(TS.storage.fetchApps(), "cache_ts"), a.commands_cache_ts = _.get(TS.storage.fetchCmds(), "cache_ts"), a;
        },
        a = "change.incremental_boot keydown.incremental_boot paste.incremental_boot",
        o = function n() {
          TS.client && TS.client.ui && TS.client.ui.$messages_input_container && (TS.client.ui.$messages_input_container.off(a), TS.client.ui.$messages_input_container.removeClass("pretend-to-be-online")), TS.isSocketManagerEnabled() ? TS.interop.SocketManager.connectedSig.remove(n) : TS.ms.connected_sig.remove(n), e && (clearTimeout(e), e = void 0);
        },
        t = function(e) {
          $("#col_channels, #team_menu").toggleClass("placeholder", e), $(document.body).toggleClass("incremental_boot", e);
        },
        i = function(e, n) {
          var a = _.find(n, {
            id: e.id
          });
          a ? _.extend(a, e) : n.push(e);
        },
        r = function() {
          var e = TS.shared.getActiveModelOb();
          TS.storage.storeLastActiveModelObId(e ? e.id : void 0);
        };
    }();
  },
  2483: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("metrics", {
        special_start_mark_labels: ["navigationStart", "unloadEventStart", "unloadEventEnd", "redirectStart", "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart", "connectEnd", "secureConnectionStart", "requestStart", "responseStart", "responseEnd", "domLoading", "domComplete", "domContentLoadedEventStart", "domContentLoadedEventEnd", "domInteractive"],
        onStart: function() {
          TS.web && TS.web.login_sig.add(TS.metrics.onLogin), TS.client && TS.client.login_sig.add(TS.metrics.onLogin), a = TS.utility.enableFeatureForUser(10);
        },
        onLogin: function() {
          var a = Math.floor(Math.random() * n);
          setInterval(s, e + a), TS.boot_data.feature_electron_memory_logging && TS.model.is_electron && f(), $(window).on("beforeunload", r);
        },
        mark: function(e) {
          window.performance && performance.mark && performance.mark(e);
        },
        getLatestMark: function(e) {
          if (window.performance && performance.getEntriesByName) {
            var n = performance.getEntriesByName(e);
            return 0 !== n.length && n[n.length - 1];
          }
        },
        clearMarks: function(e) {
          window.performance && performance.clearMarks && performance.clearMarks(e);
        },
        measure: function(e, n, a, o) {
          "start_nav" === n && (n = "navigationStart");
          var t = !1;
          a || (t = !0, a = e + "__" + n + "_end", window.performance && performance.mark && performance.mark(a));
          var i, r = performance.timing;
          if (r && TS.metrics.special_start_mark_labels.indexOf(n) > -1) {
            var s = r[n];
            if (!s) return;
            var l = performance.getEntriesByName(a);
            if (0 === l.length) return;
            return i = r.navigationStart + l[l.length - 1].startTime - s, t && window.performance && performance.clearMarks && performance.clearMarks(a), TS.metrics.store(e, i, o);
          }
          try {
            performance.measure(e, n, a);
          } catch (e) {
            return void TS.warn("Couldn't complete TS.metrics measurement for start mark \"" + n + '"');
          }
          var c = performance.getEntriesByName(e);
          if (0 !== c.length) return i = c[c.length - 1].duration, i = TS.metrics.store(e, i, o), performance.clearMeasures(e), t && performance.clearMarks(a), i;
        },
        measureAndClear: function(e, n) {
          var a = TS.metrics.measure(e, n);
          return TS.metrics.clearMarks(n), a;
        },
        store: function(e, n, a) {
          a || (a = {});
          var o;
          return n >= (a.allow_zero ? 0 : 1) && (a.in_seconds ? (n = m(n), o = " seconds") : a.is_count ? (n = Math.round(n), o = " (count)") : (n = TS.utility ? TS.utility.roundToThree(n) : n, o = "ms"), a.ephemeral || u(e, n), c(e) && TS.info("[TIMING] " + e + ": " + n + o + " " + (a.ephemeral ? "(ephemeral)" : ""))), n;
        },
        count: function(e, n) {
          n = n || 1, TS.metrics.store(e, n, {
            is_count: !0
          });
        },
        flush: function() {
          s();
        },
        logPerfTimingSections: function() {
          var e = performance.timing;
          e && (TS.metrics.special_start_mark_labels.forEach(function(n) {
            var a = e[n] - e.navigationStart;
            a && TS.metrics.store("pt_" + n, a, {
              allow_zero: !0
            });
          }), g.forEach(function(n) {
            e[n[2]] && e[n[1]] && TS.metrics.store("pt_section_" + n[0], e[n[2]] - e[n[1]], {
              allow_zero: !0
            });
          }));
        },
        getMemoryStats: function() {
          return t && i ? {
            teams: t,
            app: i
          } : null;
        },
        test: function() {
          return {
            createBeaconURLs: l,
            getMeasures: function() {
              return o;
            },
            reset: function() {
              performance.clearMarks(), performance.clearMeasures(), o = {};
            }
          };
        }
      });
      var e = 25e3,
        n = 1e4,
        a = !1,
        o = {},
        t = null,
        i = null,
        r = function() {
          TS.client && TS.metrics.getLatestMark("start_load") && TS.metrics.measure("session_lifespan", "start_load", null, {
            in_seconds: !0
          }), s();
        },
        s = function() {
          if (0 !== Object.keys(o).length) {
            if (TS.utility.enableFeatureForUser(1) && window.performance && performance.memory && performance.memory.usedJSHeapSize && (o.used_js_heap_size = [TS.utility.roundToThree(TS.utility.convertBytesToMegabytes(performance.memory.usedJSHeapSize))]), a) {
              var e = document.getElementsByTagName("*").length;
              TS.metrics.store("dom_node_count", e, {
                is_count: !0
              });
            }
            TS.boot_data.feature_electron_memory_logging && TS.model.is_electron && f();
            l(o).forEach(function(e) {
              (new Image).src = e;
            }), window.performance && performance.clearMeasures && performance.clearMeasures(), o = {};
          }
        },
        l = function(e) {
          var n = TS.boot_data.beacon_timing_url || window.ts_endpoint_url;
          if (!n) return [];
          var a, o, t = [],
            i = "",
            r = [],
            s = {
              team_id: TS.model && TS.model.team && TS.model.team.id || "",
              user_id: TS.model && TS.model.user && TS.model.user.id || "",
              team_size: TS.model && TS.model.members && TS.model.members.length || 0,
              ver: TS.boot_data.version_ts,
              session_age: 0,
              data: null
            };
          TS.client && TS.metrics.getLatestMark("start_load") && (s.session_age = TS.metrics.measure("session_age", "start_load", null, {
            ephemeral: !0,
            in_seconds: !0
          }));
          var l = function(e, a) {
            return e.data = a.join(";"), n + "?" + d(e);
          };
          for (a in e) e.hasOwnProperty(a) && (o = a + ":" + e[a].join(","), r.push(o), i = l(s, r), i.length > 2e3 && (r.pop(), t.push(l(s, r)), r = [o]));
          return t.push(l(s, r)), t;
        },
        c = function(e) {
          return TS.qs_args.log_timings || TS.qs_args.log_timing === e || !0 === TS.metrics.log || TS.metrics.log === e || TS.metrics.log instanceof Array && -1 !== TS.metrics.log.indexOf(e);
        },
        d = function(e) {
          var n = [];
          for (var a in e) e.hasOwnProperty(a) && n.push(encodeURIComponent(a) + "=" + encodeURIComponent(e[a]));
          return n.join("&");
        },
        m = function(e) {
          return Math.round(e / 1e3);
        },
        u = function e(n, a, t) {
          if (o[n] || (o[n] = []), o[n].push(a), !t) {
            TS.boot_data.experiment_client_metrics && TS.boot_data.experiment_client_metrics[n] && TS.boot_data.experiment_client_metrics[n].forEach(function(o) {
              var t = TS.boot_data["exp_" + o];
              if (t) {
                e("exp_" + o + "_" + t + "_" + n, a, !0);
              }
            });
            (TS.experiment ? TS.experiment.getExperimentsForMetric(n) : []).forEach(function(o) {
              e("exp--" + o.experiment_id + "--" + o.group + "--" + n, a, !0);
            });
          }
        },
        g = [
          ["redirect", "redirectStart", "redirectEnd"],
          ["app_cache", "fetchStart", "domainLookupStart"],
          ["dns", "domainLookupStart", "domainLookupEnd"],
          ["tcp", "connectStart", "connectEnd"],
          ["secure_tcp", "secureConnectionStart", "connectEnd"],
          ["request", "requestStart", "responseStart"],
          ["response", "responseStart", "responseEnd"],
          ["processed", "domLoading", "domComplete"],
          ["parsed", "domLoading", "domInteractive"],
          ["ready", "domInteractive", "domComplete"],
          ["scripts_executed", "domContentLoadedEventStart", "domContentLoadedEventEnd"]
        ],
        f = function() {
          if (desktop && desktop.stats && desktop.stats.getTeamsMemoryUsage && desktop.stats.getCombinedMemoryUsage) {
            var e, n, a, o, r = TSSSB.call("getTeamsMemoryUsage"),
              s = TSSSB.call("getCombinedMemoryUsage");
            Promise.all([r, s]).then(function(r) {
              if (t = r[0], i = r[1], !t) throw t;
              if (_.forOwn(t, function(n) {
                  e = Math.ceil(TS.utility.convertKilobytesToMegabytes(n.memory.privateBytes)), TS.metrics.store("memory_team_mb_" + n.state, e);
                }), !i || !i.memory) throw i;
              a = Math.ceil(TS.utility.convertKilobytesToMegabytes(i.memory.sharedBytes)), o = Math.ceil(TS.utility.convertKilobytesToMegabytes(i.memory.privateBytes)), n = a + o, TS.metrics.store("memory_app_mb_" + i.numTeams + "_teams", n), TS.metrics.store("memory_app_shared_mb_" + i.numTeams + "_teams", a), TS.metrics.store("memory_app_private_mb_" + i.numTeams + "_teams", o);
            }).catch(function(e) {
              TS.warn("TS.metrics: Invalid data returned by desktop.stats", e);
            });
          } else {
            var l = TSSSB.call("getMemoryUsage"),
              c = TSSSB.call("getCombinedMemoryUsage");
            if (l) {
              var d = TS.utility.roundToThree(TS.utility.convertKilobytesToMegabytes(l.memory.privateBytes + l.memory.sharedBytes));
              TS.metrics.store("memory_usage_team_mb", d);
            }
            c && c.then(function(e) {
              if (e && e.memory) {
                var n = e.memory.privateBytes + e.memory.sharedBytes,
                  a = n / e.numTeams;
                TS.metrics.store("memory_usage_all_mb", TS.utility.roundToThree(TS.utility.convertKilobytesToMegabytes(n))), TS.metrics.store("memory_usage_all_per_team_mb", TS.utility.roundToThree(TS.utility.convertKilobytesToMegabytes(a)));
              } else TS.warn("Unexpected results from call to _getCombinedMemoryUsage()", e);
            }).catch(function(e) {
              TS.warn("Error logging combined memory stats", e);
            });
          }
        };
    }();
  },
  2484: function(e, n) {
    ! function() {
      "use strict";

      function e(e) {
        var n = e.match(/Windows NT ([0-9]+\.[0-9]+)\b/);
        return !(!n || n.length < 2) && parseInt(n[1], 10) >= 6;
      }

      function n(e) {
        var n = e.match(/(?:Mac OS X )([0-9][0-9]_[0-9]+)(_[0-9])?/);
        return n || (n = e.match(/(?:Mac OS X )([0-9][0-9]\.[0-9]+)(\.[0-9])?/)), n && n[1] ? n[1].replace("_", ".") : 0;
      }

      function a(a) {
        var o = /(OS X)/g.test(a),
          t = -1 !== a.indexOf("Windows"),
          i = /(WOW64|Win64)/g.test(a),
          r = -1 !== a.indexOf("Linux"),
          s = /(iPad|iPhone|iPod)/g.test(a),
          l = /(Android)/g.test(a),
          c = /(Edge)/g.test(a),
          _ = /(Chrome)/g.test(a) && !c,
          d = _ && (s || l),
          m = /(Slack)/g.test(a),
          u = /(MSIE|Trident)/g.test(a),
          g = /(Firefox)/g.test(a),
          f = /(Safari)/g.test(a),
          p = /(AtomShell)/g.test(a),
          h = /(MSIE)/g.test(a);
        return {
          is_iOS: s,
          is_IE: u,
          is_FF: g,
          is_edge: c,
          is_chrome_desktop: _ && !d && !m,
          is_chrome_mobile: d,
          is_safari_desktop: f && !_ && o && !s,
          is_mac: o,
          mac_version: n(a) || void 0,
          is_win: t,
          is_win_64: i,
          is_win_7_plus: e(a),
          is_lin: r,
          is_our_app: m,
          is_electron: p,
          is_old_ie: h
        };
      }
      TS.registerModule("model", {
        did_we_load_with_user_cache: !1,
        did_we_load_with_emoji_cache: !1,
        did_we_load_with_app_cache: !1,
        did_we_load_with_cmd_cache: !1,
        api_url: "",
        api_token: "",
        async_api_url: "",
        webhook_url: "",
        all_im_ids: [],
        all_group_ids: [],
        user: null,
        team: null,
        can_add_ura: null,
        ims: null,
        channels: null,
        groups: null,
        mpims: null,
        members: null,
        teams: null,
        rooms: null,
        bots: null,
        user_groups: null,
        idp_groups: null,
        apps: {},
        files: [],
        requested_im_opens: {},
        requested_group_opens: {},
        requested_mpim_opens: {},
        requested_channel_joins: {},
        created_channels: {},
        created_channel_ids: {},
        created_groups: {},
        archives_and_recreated_groups: {},
        last_team_name: "",
        last_team_domain: "",
        initial_cid: "",
        enterprise: null,
        initial_unread_view: !1,
        initial_threads_view: !1,
        initial_app_space_view: !1,
        RESERVED_USERNAMES: ["all", "archive", "archived", "archives", "channel", "channels", "create", "delete", "deleted-channel", "edit", "everyone", "general", "group", "groups", "here", "me", "ms", "slack", "slackbot", "today", "you"],
        RESERVED_KEYWORDS: ["channel", "everyone", "here", "slackbot"],
        BROADCAST_KEYWORDS: [{
          id: "BKeveryone",
          ms_name: "everyone",
          cmd: "<!everyone>",
          name: TS.i18n.t("everyone", "broadcast_keywords")(),
          description: TS.i18n.t("Notify everyone on your team.", "broadcast_keywords")(),
          is_broadcast_keyword: !0
        }, {
          id: "BKchannel",
          ms_name: "channel",
          alias: "group",
          cmd: "<!channel>",
          name: TS.i18n.t("channel", "broadcast_keywords")(),
          description: TS.i18n.t("Notify everyone in this channel.", "broadcast_keywords")(),
          is_broadcast_keyword: !0
        }, {
          id: "BKhere",
          ms_name: "here",
          cmd: "<!here|@here>",
          name: TS.i18n.t("here", "broadcast_keywords")(),
          description: TS.i18n.t("Notify every online desktop-using member in this channel.", "broadcast_keywords")(),
          is_broadcast_keyword: !0
        }],
        NAMED_VIEWS: [{
          id: "Vall_unreads",
          name: TS.i18n.t("All Unreads", "model")(),
          is_view: !0
        }, {
          id: "Vall_threads",
          name: TS.i18n.t("Threads", "threads")(),
          alt_names: [TS.i18n.t("All Threads", "threads")(), TS.i18n.t("New Threads", "threads")()],
          is_view: !0
        }, {
          id: "Vapp_space",
          name: TS.i18n.t("Apps", "model")(),
          is_view: !0
        }],
        unsent_msgs: {},
        display_unsent_msgs: {},
        inline_img_byte_limit: 2097152,
        inline_img_pixel_limit: 36152320,
        code_wrap_long_lines: !0,
        last_reads_set_by_client: {},
        ms_connected: !1,
        ms_connecting: !1,
        ms_logged_in_once: !1,
        calling_rtm_start: !1,
        ds_asleep: !1,
        ds_connected: !1,
        ds_connecting: !1,
        ds_logged_in_once: !1,
        window_unloading: !1,
        active_cid: null,
        last_active_cid: null,
        active_group_id: null,
        active_channel_id: null,
        active_im_id: null,
        active_mpim_id: null,
        active_history: [],
        all_custom_emoji: [],
        user_hiddens: [],
        nav_history: [],
        nav_current_index: -1,
        nav_used: !1,
        user_colors: null,
        emoji_use: {},
        at_channel_suppressed_channels: null,
        push_at_channel_suppressed_channels: null,
        loud_channels: null,
        never_channels: null,
        loud_channels_set: null,
        push_loud_channels: null,
        push_mention_channels: null,
        push_loud_channels_set: null,
        muted_channels: [],
        prev_muted_channels: [],
        newly_muted_channels: [],
        newly_unmuted_channels: [],
        highlight_words: null,
        highlight_words_regex: null,
        everyone_regex: /<!everyone\b/,
        channel_regex: /<!channel\b/,
        group_regex: /<!group\b/,
        here_regex: /<!here\b/,
        you_regex: null,
        your_user_group_regex: {},
        channel_id_prefixes: ["C", "G", "D"],
        channel_sort: "alphabetical",
        inline_attachments: {},
        inline_imgs: {},
        inline_videos: {},
        inline_others: {},
        inline_audios: {},
        expandable_state: {},
        native_video_embed_height: 320,
        native_video_embed_height_flexpane: 240,
        native_media_preload_limit_bytes: 2097152,
        is_msg_rate_limited: !1,
        break_token: !1,
        rtm_start_throttler: 0,
        ds_reconnect_ms: 0,
        ds_reconnect_time: 0,
        rtd_start_throttler: 0,
        initial_msgs_cnt: 50,
        subsequent_msgs_cnt: 100,
        special_initial_msgs_cnt: 100,
        hard_msg_limit: 500,
        input_maxlength: 4e3,
        input_maxbytes: 16e3,
        all_unread_cnt: 0,
        all_unread_highlights_cnt: 0,
        all_unread_cnt_to_exclude: 0,
        all_unread_highlights_cnt_to_exclude: 0,
        threads_has_unreads: !1,
        threads_mention_count: 0,
        c_name_in_url: "",
        flex_name_in_url: "",
        flex_extra_in_url: "",
        flex_names: ["files", "team", "search", "stars", "mentions", "details", "whats_new", "convo", "apps"],
        default_flex_name: "files",
        prefs: null,
        ui_state: null,
        input_history: null,
        input_history_index: -1,
        input_cursor_positions: {},
        last_net_send: 0,
        previewed_file_id: null,
        last_previewed_file_id: null,
        previewed_member_name: null,
        previewed_member_id: null,
        last_previewed_member_id: null,
        previewed_user_group_id: null,
        last_previewed_user_group_id: null,
        channel_name_max_length: 21,
        channel_purpose_max_length: 250,
        channel_topic_max_length: 250,
        upload_file_size_limit_bytes: 1073741824,
        model_ob_id_length: 9,
        msg_activity_interval: 5,
        msg_preview_showing: !1,
        archive_view_is_showing: !1,
        menu_is_showing: !1,
        overlay_is_showing: !1,
        unread_view_is_showing: !1,
        threads_view_is_showing: !1,
        app_space_view_is_showing: !1,
        seen_onboarding_this_session: !1,
        seen_welcome_2: !0,
        showing_welcome_2: !1,
        cancelled_welcome_2_this_session: !1,
        show_inline_img_size_pref_reminder: !1,
        shown_inline_img_size_pref_reminder_once: !1,
        last_key_down_e: null,
        group_prefix: "",
        ms_conn_log: [],
        ds_conn_log: [],
        mac_ssb_version: TSSSB.env.mac_ssb_version,
        mac_ssb_version_minor: TSSSB.env.mac_ssb_version_minor,
        mac_ssb_build: TSSSB.env.mac_ssb_build,
        win_ssb_version: TSSSB.env.win_ssb_version,
        win_ssb_version_minor: TSSSB.env.win_ssb_version_minor,
        lin_ssb_version: TSSSB.env.lin_ssb_version,
        lin_ssb_version_minor: TSSSB.env.lin_ssb_version_minor,
        desktop_app_version: TSSSB.env.desktop_app_version,
        supports_downloads: !1,
        supports_spaces_in_windows: !1,
        supports_growl_subtitle: !1,
        supports_voice_calls: !1,
        supports_video_calls: !1,
        supports_screen_sharing: !1,
        supports_screenhero: !1,
        supports_mmap_minipanel_calls: !1,
        supports_user_bot_caching: !1,
        active_file_list_filter: "all",
        active_file_list_member_filter: "all",
        file_list_types: null,
        shift_key_pressed: !1,
        insert_key_pressed: !1,
        alt_key_pressed: !1,
        join_leave_subtypes: ["channel_leave", "channel_join", "group_leave", "group_join"],
        file_list_type_map: {
          all: TS.i18n.t("All File Types", "model")(),
          posts: TS.i18n.t("Posts", "model")(),
          spaces: TS.i18n.t("Posts", "model")(),
          arugula: "Arugula",
          snippets: TS.i18n.t("Snippets", "model")(),
          emails: TS.i18n.t("Emails", "model")(),
          images: TS.i18n.t("Images", "model")(),
          videos: TS.i18n.t("Videos", "model")(),
          pdfs: TS.i18n.t("PDF Files", "model")(),
          gdocs: TS.i18n.t("Google Docs", "model")()
        },
        marked_reasons: {
          viewed: "viewed",
          left: "left",
          esc: "esc",
          esc_all: "esc_all",
          closed: "closed",
          muted: "muted",
          back: "back",
          sent: "sent",
          clicked: "clicked",
          deleted: "deleted",
          none_qualify: "none_qualify"
        },
        welcome_model_ob: {},
        change_channels_when_offline: !0,
        ampersands_are_inconsistent_in_from_urls: !0,
        ui: {
          cached_file_preview_scroller_rect: null,
          cached_msgs_scroller_rect: null,
          cached_msgs_scroll_result: null,
          cached_search_scroller_rect: null,
          cached_channels_scroller_rect: null,
          cached_archives_scroller_rect: null,
          cached_archive_scroll_result: null,
          cached_convo_scroller_rect: null,
          cached_unread_scroller_rect: null,
          cached_threads_scroller_rect: null,
          is_window_focused: !!(document.hasFocus && document.hasFocus() && window.macgap_is_in_active_space),
          msgs_are_auto_scrolling: !1,
          is_mouse_down: !1,
          last_flex_extra: null,
          active_tab_id: null,
          active_tab_ts: null,
          debug_channel_lists: !0,
          last_top_msg: null
        },
        client: {
          reads: [],
          last_user_active_timestamp: new Date
        },
        data_urls: {
          app_icon_32px_green: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2lJREFUeNqMVk1vGkEMndmu4MLmkOWQoCqkh0APqAdUVNpKiXLux/+tFKlSDlEitcm15RI4BBBiucCFjdDUs571eL1L1EEC450d28/P9ujvH7+qbBljFFtaa9SgAN9ij9Xnb/LNdBrKIUn0rNKGKi1vvkpPQqi0syYiIBvlN7lt2kM7C6ErE2gr6BfcpCXO4mg4AURlCg6ZHCIrGuk1Kckp/q20P13u1NknW4E7VMkAreE8ONTLEA0Lpep0jDvgSReZIGRQbkSNuBnT0+ggOowP0X3uB0cC1qvu6453Te8lT3/Qv7i8SLfpbDrDN4efh4MPg91ut1gsMBprqYSEY1EledA1fNo+bcN3kiS0HzVgz7pMwGrJhRBs5glS+EuVQbkDZKIoAmHyOEEP2m/s6WmaJsnKRZ5XoijJkIrAWtKG8sP5dNw6ds46Puhmswni+HFsmclKnZe9M0BmiXD4uFavdbod3ERC713PRZDhA2GhJlkmmBuOj0vkt+EXbhl5BnY6bzvDT0P1f+v25nb0Z8SZ6rikMwO51gcGf8G7xkEDNtRqtfPLc1Be/7zebreYkv77PghXP65g5ypZWT3RP3ufjIWeOb6A7LPNZrNerymfIE/GE4wSKgAZNX2aenIrhwF5jzZCOpg3Ly4jf1bIlozsWF+zpxmxQ+liN81UWBaBMrIjOhpoZwkpBGl0hW0U1vNmvXGFooycHMbHFJY7OO4jwqAB6BOkieMYM9GrW818Oge4CuzUDCIqcW4GDsU00iKm0jrrnqFw/+t+uVxyHhZA9jRlZuAvOg5wgyXI8N3NHb55cnoCxgCxh98P6A1gBR/uIkc7LGQ4xx0WFA4lAEAAwuA76Ph85jR82ogJmje7whD37RBfOGodYYaJ4GgSMKFZW25BHiiVzwMaOx47KLF6DfPpupAxkFioO99Eiye6GhYRFEZYcdi2Wi0sMYCYJwYCek6fOdC+GRt5zQmlC8wSdGNgiG3RxlX46O8ITfojlBHDkuLwzU7cscr1LLqhd5y3hfK8Iogq7lLZ8jZK9zU+9co3KK4P+LnCca9nG8T9RedLXBL8tUUMIGwvojXtc99dthiqLnoWViADNHvvAGL2uROVFtcykZjwhZdFcAJc6TjbwTEM3QAq3lP40VSThRxU3U0rgf0nwADpJQebhAz3/AAAAABJRU5ErkJggg==",
          app_icon_32px_green_unreads: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4JJREFUeNqMVj1MFEEUntlsx1FzQgmXnI13JGA0XIWJmvgTEzAxBhXbw0Rjg4VWamFLIjWGUkwgFoIFNkAhJN5VHGEpMVBz1OPbfW/evJldyc1d9t7Nzrzf7/3o+9fvqmwZY5RYWmvcQQKewZl0396Uh5kb0jFT/K5QhsotJ75on4lYaZIWWMAy8jelbD7DJz3TlYl0SugL1OQV8JLeIAJIZTyFjHVRSppQa95kpeRTacc9PKmzT7YiYqpCA1PB1jjcD000wpQi7mh3JIMeRII9k8eYp4oyUg/pCVix5zJdAFAg+kp98x/f1Mbr3bPu45uPkN3aznd4tndb716+ZT+z7nw3QhTltaMLGa+JGw3gjuzw/JWxGp7s6y+lKiM7Gwp2XWoByLQBUvjLmcEXRqojyK4FArIzvNPea1G8tZZ3WemYzUklaWejxFNtrE7sMgvg05hskMjfLSVSXaY9CQhcJiMGXAYGB4AoD5VxZ2KygRYPWwtGqpVKtQI735ZXgiyhQN67dkdKplAbNf3k4dPmM9XbSjrJ6+evJFIJSzrLA7trI5N5CXXvcW1vbiltPSrSIs0VsCBwnKEkpUjMzb+49eA2EIufPq+v/oBjUzPTaNyXxSXwDOqbL7pUTW0KK1m8JM3uTg4SxG5tnDB6+veUqoBWQT5hqOAZKRNWRFIkMxlSjBGZ7B8i2J3IziGKDDsHwT79G+crOPG9XIG/jnsnwVwr9Zfgi5vloUvwPeokkOEeOrVIWOhoaIvMZ+D1fuFDjxHm+uFSSjg5MlzDtSvUAO3eIXRyfBIEkksnJZos8Sh8ZfkrhBSI2eYsehwAc3RwBMTUzBT6CvDT3mvDmfOzrqxCxu+Asd/EDQOitftHxnNjdb3bPYdLzfk5wv6vrWQ/8Qq1bNS2vsZeERWRAHq4OsxOAEdjhMuDZQuqpKCRcA5bvMZeC/ObbX181CuZWtevjrqq52tNrHMZF8ms81ouVIuhAcYoZjjXD6jbdIUbgHEhlO06LmxhqALwPTleAv9AqcFXP9c20Hs7m9uyqJFOHGqR2Ronu8KZR3g21bZwCAumIzEREPqjoDbJHHH7/3EjR5hfSYy4RPPGN+VyJGh+8qScnaQRqB/PWPA3Cg00xTOAlOFxVDoYyyRS0yBfcDkwzjk3531vBDZezYjxV1nMkY2y//DMI2NQNJsWOvafAAMAxE3MJSrFyPAAAAAASUVORK5CYII=",
          app_icon_32px_green_mentions: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABExJREFUeNqkVktsG0UYnpl9OF6/4JDYaWirNrFIgTbvNEilByS4FHogQeJQoCcOidQjiF6LBGcEnIs4cABBKZeUQw+IQkUicFDVJo0TJ0gtSW2paWLHr90d/t2ZnZ11TBubie3Mzu7+3//9b3z2xdeQuyilKLhMy6yb8KmVq+VLPT0j0RhqfakgF2MMO/YrlnfOYa098PsFQJjLamBA3SVQdyyrPQCCHdWbMJCx4PtPrdYmA64+osgjIJA4MMKEkFy10iYDLgv5QoWtYA+i4Qc+i+Xy/wJgPBo9QZ0PcWHyprVU3m3LyZJXGQ0B46huExAfiUSmzk2VCg/R3VzrDHCTDGBsYKMQomAyOjH63InnN48e3ia4nSjypLJ48fHYLeDR198XiUY6nk5cteotA/iJxv48T7gWc6yvEGVodCgWi8UT8av37y+36AlVeJgpDtEqwvTUy6e6urtM0zx45NDWw61EIv7C8MB3j7YvVMwwwi07WbiXZcTU22++M/0uXAFAtVI1IkY8kXjjrcnNjc3fF7On/7qD6b4BuPpSPgNG8kCSPQEm0jTNMAxAqtfr8M2nj96s1k4urZJ9FCj8+sQZBiAsQxHnz4w2/f7MK2dfrdVqn3/y2eyPs6ZVP/nSxND4sLq6NvLHrfiTbEXEA9Rb2NszQn3H0uBqILGeW9cUVVXUkfGRzmQnerbv43plfmf7SSZyFRYkRBF1vI0wRCfEKJwAxtrdHPyqSD0+fBxMpev631vbF/P5gXD4vVR3Omw8LorkngPSHbnH0nAJ0tlJdjE7MDYIJx1GONWdKpV29ZD+zKGDncmulbX1mdzqoGGMRaKnE08ldT3gA+hoTFk5n0HWpU8/aqza7rJtm8VVpVIpl3aLpVLhQeHihQ/h3LJNeKBH06KKciQUUjGGa5XLxTzT2GW6P90kHljxUBSnymKiqqquaaFwR2Gz0KGHbGpblgYK5Kn9wLRzZpnFixpoyJ4zvv3qm+xSFjbnp8/3ulb68ovLK0srsJk8N3lidABr+MrX3y/ML0DfLj7a0VTNIUdseMB2Mwl7MtVAlrm2YpeZuT9BASYd1rUrs8ViCV6a/mCGUbn582/Lt5eZQhBaTEvgwaIGds4tTIOZLHkC9r39vWy/cW+juFOETTQWTR1IcbffyTIkpylRN/wwJRD3DIBwk6h+FdozXgyODbHNwnyGnQ+OeydzGT/tRfOgvPo6ogi/RURoikcFiWQPrxYQo8xjon5k5jKiqPDXpXxiZvZ94LewIBuQu3HvMtjnxvVf2K2ffrjGrPfr9RtckNxCvNEBS/UDs8lOToK9eIiPYLTpfNYwi3gFjY8pBAXflPu+f/4fZhSjgrjV0A0DHU0gixdkiXIUyPpSRGUSckfhg08jQdp8BpAxAhIRlj0n93Ze7B7zcgM537h7rO8mqTxp+jZU2X/kxZxcsQPAXq/2WneAVmDUDBr2XwEGADZFpKJDFtSPAAAAAElFTkSuQmCC",
          app_icon_32px_yellow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA6VJREFUeNp8Vr1PVEEQn3m+Ais+TOQ4TCCeARMxRyESC6EwkUIDpf530kqnJVZqZayMFBI5wpGAYMEdDZzR3Dqzszs7b+9gL7k3b97sfP5mdnH9yUvwyzkHZiGicISg/0yG+XGnFVZtQpdK6behNmBgJfPD+EqUgMFaFoHaGNxpbauMSlZCB1cgE3iNm7oyXTYbgSASXMUhF1PEpMu9VqY6Zf8Bk/ZcEv3PryIohTxANhyDE34eojOhDNMucRe26FklNDNCj4/CdC3pnxjD+mRw3/phM0HrxvydueQaXgmetVX3eqPf60GrLRtxY63/4pn7+w8Oj1CiYUsDmQgoGgoecU2+Lswz/+gEVN5zcL/tXdbEYo6FkmzGAoE8tTO0dpSZ8TEmdnaDgwvz/HrZg6NT3ib67F51ukiNJr9YCV+usO7OsHTrAAMeEKdrrHfnB2uCak9k+SjVrAJO7N0cgaVmwPXjZqjP02XnI+5LxibGiMM5o9S12i7rkliDgdkgSh/eh+erfUi5w8asa8yC0ML3HH59t42ttnE0ZpuI0uAXbXl/HsCbLepzDuXVOou/fV9cXPKueo1AxbY3tyjD8Os3Xlya5mKkpimZIsDUQPytew6drov1xE6XKyw+3hpn/vEJ7h3ITielCc0EaVzQW6mKhxaKaI8f59ESwD51m01STsIkT3Mg6vEsaYtCuzzlR3CFYf89zjtSGQO0XOjns25sFHD5yRFgH1OUTXCRW1kmMU50w2N0YhQJQiJWr3EE9RqujPAm6u3jU9M9Jt2cIm1xa6YxQxBysSK8lhbB5NZzmoIx2P5YUHzqfna6lGn2IqiZ/UPc3GL21CRPoU6XgSguPphzS4sM/A+fCu8NnJ1DVkjbz2WlwjHvtChwHwqDYq/NgJE9j5reg8ixp012gsqnonqIm1ntaSnA8Yk0ecien3pOz1oFSLDHuEpIKSqdbCpBNLVYnQGDFIG4RPi5yYXloa2TMY0A6eEsgsGjVZ3yAKUCQOc88L37VADs/al4nVS7VG3Ba5m7YEpE05gQ8n03jnGAr99YA5lMZQSXHZZqLA277I6lNqiMYRjET+T45y8QnDNDLUQfzw/b2eXgzUejSSAZuK/ZsTh4g7L8wurNBlHiG4Hs/hLPJMwuCenaUmnxeOBko+kq98Nlq4oOPVGEU+QBuivvANnZFzQCZtcywMpMKa/ZnAWXJTd33EjYHJbyhOo9xarWu2WlBsPupkMT+1+AAQCmPwV2bobFnwAAAABJRU5ErkJggg==",
          app_icon_32px_yellow_unreads: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1hJREFUeNqMVr1PFUEQn9lcIc+ORylHB9gBNpLY+dEISKWhNHYWdhb+FRaa+CeYWJnYKVoJdAiVQMc7Oh90go1vnX2zOzs7dxj2JXfz9mbne36zuLa8AuPlvQe1EJF3mKCn4Qn76aRmFmlMV0LJt04d0FpZfde+EBVg1GY8EB3tk1q38Ahn4Tp4h4HA/5gpy8jS0YgEkeALg3wKUSC9tVo2xSj9BMzSLSeOf+PlolCwDgbFyTnety565UqXdPbb6aSbTEhk2jVWmAJe26EjQasqQoYdBUrExDX/7Kmfnx2dX8DLV47FvX39l54HR/jmHUqcxXY5G6uos3jYNPq6tEjSA8/BITL/3Gzk7PUCH4g3aGuhohMpQcBv6QzJ3fR0FHd4FHnqaZ92MOYbUZ8Vo11uNP6lTIwjFhebLx7QztJiVPnzIJtv+oNXZUKmM3ZrwU9Ohs2pfuReXGDOUX0jSqlrmKmDNV++2i5JOWgVBoflwT14tDIyuVlf9QCFgetjnsEJkoJsaIo2EU7Vb9TMldDvdyDHZWv3B3Do2Expi9Arq7cfarwELgpV+xtP/J3lQLz/4L5vh2P373p27uMnMhzZ3jboxipKLQydiSJaCqY5ifg1l3J+dparw/QTFyc9XXZHyp8NGbtMLSb5PB5E/BKVx01UaSdHLPvwt2ojeJRbh78ia9AgN9f1nu9NRGOpuqb6vmmQOlwHWRwKGaWJxr7o+iVZL56PrphhwQ+pIh1k5wXDMQP1TH31CoLhEE0iBTpzHwjEs/LPmxQT0g3razEHVDDNSThAJcSNTfVDSEc8FxcZVPQEtY2m4XAMk+GYZHhrG8//BJzbeJxqfx8HA3HaFqjgqys6WWWC6Dph3PA0BJpOU3qnUgOSdCNRAL/woBhh5bCdn4PkTdy/OV+CqAZOhodWxznddcXIhWxs08QOZ+wLIHqYZ0YeZJinZpGD9ghjEwYN/Bri6Sns7kUM396hkI6I3tsvQC3aJKlWkaraNx8J6NaOS+5Hnt/nfvObM1OvfYPS+85gk+6RvH9JGKXe5ZOuETvRRLMcMMNPc+q7k0ZGPVF4x1kH/aV3ADP7ZHiYa1meNiYH7cPGORNca7ji0DGs+A3lPaWYP3Ln0Tnoupt2BvafAAMA603M1k3efM4AAAAASUVORK5CYII=",
          app_icon_32px_yellow_mentions: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABBhJREFUeNqkVk1vG0UYfudj/bExbWo3kJLaKRWO3aaooIoKOMCBDwlBI06F/oEeQOIHcIU7N34CEieQekMIkBDtBaEgDk1aRIgdRGiSpqSpN1nvzPDOzuzurO2SxozX69lZz/vM836ThRffhngopSA/IhH1I7zCYD/4eGbmQuUxOPzgKJcQgjNzT0eybmHFEPyjAgCxsgYYqHikqPeFGA+AEn30EQxcLPz+FYZjMrDHBwUJgRTJAgOhlK7s743JwMqCTGiqK5yjaLzhtRQE/wvA8Bi0hNIXjWE2IrEc9MYHsFaN1ZTC6KPjl1K/RBbepJv1u2MBkBERYNjghFHKCD13lj59mv4xtf0PhON4USLV+EuGZ14hh0ad+WVWrNAvg/VDA2SBZj6JJTRMrH1G2ZkWmZjglQq/dmfn9iEtwVon54adx0wuPAfzZ+WpWTh/DqRUeG3dVUti5yI95hF6aIBMdHx74zW4clm256DVNHrT+ntyWvnV/hrsNnePZbo90Ivs8RMMs7NWs4QoBY+TcolVfH7kiDc5Wdid3vt2alXAI2UncumFtwxAqhllOVhrv/eueumi7Efy8y/ghxtRJPrPzIft5r7/d/GVtVNHqXewm7rZTSMlc0Noto4kCOd0fZ16jHPG59terVoIZ8JPdn/76f7OQdk0PnBKIk2iqHNcLpdU46TGYpSs/YlOhRt4q6n6EXge6T4QH213zpfLV6dPNMv+QwAcx09PreU29GOjblZgtUNacwhPSyU1VeO9PVLw6InHRXWS3V7vf7Dy+7O+//xE5eWjk08UCjkbYEUzh3XjuTUHH74vB7N2/F5IJSIVhnI/FMGe7AXR9rb49DN0YilkhEJmPK/C2FPFIicEn7mVS2ykmcfZxih/0ElF64pwncEZJx6XxQK9d0+VCjpOhPCUkhtK3onkShQYf+G5gpwY4+tvoNPFIId3FrQN8M1X10h3TfvD668qjAw0+3ffw81lJoR80FOIhLsk1aRlnDRJIpO7Cc7oyjwu3dIHMNJx/HidoN5x05XLlsrir3R1Fd1B64AzaU6JPIzX4EwLJIrnlOBYAuf1up1vbkEvZuyX4XjNmr3TsZGvi5KK3Y8oin5vAKhVCU+z0HB70W5Bwsaun2lbyOVb2T+z4qFs9tWiqH1FU9dM/5qSOJ5ki27XRni1alduLidbkhrlxpNRc2aDrITl2XS6sLFJtrbg50Wbw6/fwNwlcb74SyLILSFJ6+DmQWI6OzcIhvHAtmBqZH82kOSThGbbFAr5nW5hyNYfosa0VUhfDVTDXEVLkdMNrkTXC9zzKlAuCZvNwGl8Bgmq0T2Ai5GTCMS1nFvbbbL7j80D5DLlDmk/DlK308x0yM0vJD7nZuwcMKicDfK0cq1mXrH/CjAAfjaCPa5V5tYAAAAASUVORK5CYII=",
          app_icon_32px_red: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2pJREFUeNp8Vr13EzEMly5uQl+nlKnpRrtRNsp7DO1Ilz5W/gZW/iG6MrLCyMhIN9JsKVvDlH7dRdiWLcu6K27fxaeTrY/fT7Lx/dtziIOIQA1EZAlP/NPoBHleqZVlN547mcm3QRvQG8X8kFwmDjBZMxGIjf5KbVt0RLMKHajBMMH/uCnD7KWzkSZ+ClQ5RDlFYUrWaxGKU/oJWHa3mhj/4mjSpmADDIZzcCy3IZIKZWh3jrvRoBskJDM8nzawPyr7745w1iT3tR86E3401XZAg+Txr2fP4NMOHbmy8t2EPu7Aybj4J1mWHPiRWDRIHnaNv/LWyw2IPksWm6AHkli0XHA+Xxkg4F+pDMFu38E0hnr5mDw42grPW4JlF5bxfnqtOO2kCIIlJMFH8+lFzPVVK3zACAYFewFV1NVa/GMDJYNUIbaNcDxOlt6Mk7bPOGtyfnYbOJkE7WXnzZOpklzJvd7AaXm1FWDUXw9c+AdVSlESXr/e4VUEVZiatDAayFLU8P5u6fM6ZMOH8mE7qH+5xXV0ajbCs2j7Yh3w+7PB9UYVV2BqYWOJAEsBhW9/CVatnxLjudrAZcsJx+cR8OsO5i1DRQxNKiYVo39zsrFuXno+jQgHgub+tRcNeMyFHYB1N42iACf4QiPbERMNMK0/jNW7bHNhU6rnm00uFCB7ciTa5xSZDs56p5MUx4EQJnNpFg3MHJ5yKB36dFXsRJUidoGtiRm/qaHQ8dh28uOtpPDtHpctifvmdHGl9yKImUWHF+sg3hvR2SQg7InIfrx05I154n+/T3y7iRQyXUiy7SqEc9798IHHUAIp5h3Ocx29jqEsskTaWGmU9Qno6kOchBC84GAUntctpQLzJhnzjuSs7begkiigpqpkhQSXGOM575JLnj/bmDgqnbG0ACLL19BN9RFWH7aHMT8egFWmMrcKD8Bd7AZV4+QCI3vNcdYFZcl3Y8+QX4+pnfvHz4egsiKVE31GCU2wxsDcscSGh3HeVn3wDvHHAx+uoJtaCiKfH7qyXf/mI9EUOvfua7ot9m9QWt7ofU0jKnKlYO4vmIe5JJRrizmAuL2Y1vSU++mypTqjPlFY0tgA6ck7gDn70o6A5loGul9rDPqLTXAmudZxpaFz6PgX6nuK3lpqssJg6G46mNh/AgwA1LYLPz5hMyUAAAAASUVORK5CYII=",
          app_icon_32px_red_unreads: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAzFJREFUeNqMVr1zUzEMlxyHtincsdDOyUo6Aytz6Qoz3HVk5y/gr6ATQ2dgBWZYKWvDDAsDaZvmJUZ+smVZ77UXp5e4sqyPn76MR08OoV0hBFALEZnCG/o2PJGeb2pmkcZ7Lzs569UBnVXU99Fl4wGTNuOB6Oje1LqFRzgr1yE4jBu8xUxZRpZGI21oC6EyKGSI4jZYq4UoRulvwCLdcmL7aZdLQsE6GBVn55huXQzKlT7p7LfTQTeREGS6OVaZAkHboZGg5SvIsCdBaTOC8PoeTH2YBzj+mwx/fz8enS3h7RwEZ7Fd7qYs6k0eNo1OH90h6cDimH86TJy7LvKBeIM2FzzpzAEC/pXKkNiNs59nTeIZDxSF442o74rRrhQaf3IkWsTSmoqC1gOikE+KUtWEwcMbyHTEHg/hgYvEvZQKQHLZY/FgPMDJIHr18SqYKskx6CQGw3K0jc93bGxe7ABAqCnx39mKFChDM9q0cSp/k2bOBLZ9w/XtOkHHZkpZxEou5pcCimcnl/DuIjK+GsHTrUg/ucDPi2jjsy1g504vo+FsrzRdVD62dYC2l5lGNvZpTzhwsj/MVv1ZR2mqL5R64lDRtyvuSPpzXrUuj1Q8z5sUIMna81WqLzs5UtrHf323g7Pcia+yhczn4trF+Mdr3+G+oyOc6+pRcEfEaKKxLzp/Sdabu5tGWPqHZJEG2QXp4Vga9WSAm6fQ7zWYQErrLHUgLZ6Vf7gK5DhppsRnlChhfq3ihcPtwIVN+fOziTzzdWkqeoLaQtPtkNaPpo1nBurLAubtpZejnPtLmDWCe9WCClCQ54GMnZKggBJhAoGAptsUXmkbswaMRGn4lQfVCKuH7cEwFU1qmYgHQzCUaoKGquL4yOlpXo1c6haDUBmr+gc1UZkZZZBhmZpVDLojjE0guaeriA+1Gj76ep1K9/sSdFNLNkmoFVK++/IRQElcdj/x/FuHTws0U6/7gtJ0p+WaRlToN8Ao+S5HOkfsRBPNcsEMP82p3066M+qJwhRnHQw3vgHM7JPhYZ5lgNVM8rdcNs4ZcK3hikNj6PkX6neKFl3ePDoGfW/TXmD/CzAAcryyBfjeu1oAAAAASUVORK5CYII=",
          app_icon_32px_red_mentions: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+pJREFUeNqkVktvHEUQ7q7unp19xAkHJ6BFAhshgeI8pAgpuSAO3OLkCJw5cOEXwBX4F/yAiBMCxA1yyQWUG4kEIsoGoyiWDYg4jsc7091F9XRPT8/YkeNlPLvunUd99X1V1VX8+pV1Vh+IyLqHNrrSdJbFvPhsOr00OcGOf0iyyzmnlf+OR3M9wJoD8M8LwHiw1WOA9RFRnxizGABw5/ohDFIs+jwqywUZBPcZsoZARArAjAPAbL6/IINgi7VGo1a0JtP0ReevRfG/ADyPfiTQnVDDbGvzW7G3OECIai1ThHGu0wdgzPl7Y3i8+89CAPyQCvBsaCEABIeLA/FGJh7uPd6pykWyqLHq86XF87eIw0oGIyEHnH+9vXlsgLbQ/F8TCQdTqy9AnM/ERIolJb/9d+f3Y0YCYoR9CFK5Liu2PsCrOZ9KGAt5Qqo3c/HVo43iOEUne9LHUF/P+ftDx0IjKw1JJJakvDZWW/Py1ubs3elrrbZHMgjuN/Xs31yGQEWQFwBDQSrJk0q9oFSh57c2N55zd+LXLl/1ALGAkQXfvFwfjtg7GVbWfrmLPxSVNtUlVq6xciAHV868siTV0Wma7m4OqVl7QqvS1RqReIighJRCns+z5UFmTPnFg3u3n+wcFYPa4UgibqIUCbo8Yrgi3COE8YdllFSSybNDXmmmOGzMq0//3LgwHH704kuvD0fPDHLMnOg12V2VDoOs+wqZGbaWETzkyE4rXnCeAbyci2Wp71XVx7P7F0ejt8aTt0+eOpNlnRhQR/POpgm6ptgnk0N2bTotokYsjd23hvJ1z5i/KvP5jrHWGkt3cKrURIiVwUByykCUwS4PleZ/roqmrFNffFLVyeDKD7gCyEH8zU2eWYvWGIVot9FuaTvThfdJdhpyE4xv9nFmnEQfDJlX6UbBHhgHsZ7jWemS+fsC71ag0ewaUJKIoQXLaoq1JMGm7FRZrZX/+Yt2BbfSCPXjnD2tHaGs9U/c1vy+pnSQ9JwU1ntJPHzW0MoZ5Nit5CQStH5VhPWWZU/dEsecnYYm7Dq0PNeUsE4/jkB57wEgSCLj7n9wvDinQiTu6EDxnGK9K23ugXPYL5wpCLcgpmZ8NJJYbhjMdMiiuH/cqZpXmh6V1pMXsY1B28K6bMjuDeP0+akMt26WjhPZ+bliwVDaQprRId0HZTqtpDDeXJNd4Zldi9/NOzNHHEb6c1tzHVK7vamivf4MGeOoEG/1umGno0Xk+EJqMc2C1F9kmI45aUcJg0+fIB4+A6QYHYuMp5FLe3s/Bgdf7pHridt3vDNpthpK/581EUt37A4ww04MurQ6o2ZX2P8EGAAu1YEi4TmT9gAAAABJRU5ErkJggg=="
        },
        emoji_groups: [],
        emoji_names: [],
        emoji_map: [],
        emoji_complex_customs: null,
        emoji_menu_columns: 9,
        emoji_menu_colors: 6,
        files_url: null,
        archives_url: null,
        bots_url: null,
        team_url: null,
        dnd: {
          next_dnd_start_ts: null,
          next_dnd_end_ts: null,
          snooze_enabled: null,
          snooze_endtime: null,
          team: {},
          current_statuses: {}
        },
        frecency_jumper: {},
        typing_msg: TS.i18n.t("several people are typing", "model")(),
        pdf_viewer_enabled: !0,
        onStart: function(e) {
          if (e = e || navigator.userAgent, TS.isSocketManagerEnabled()) {
            var a = function() {
              throw new Error("This is read-only");
            };
            Object.defineProperty(TS.model, "ms_connected", {
              get: TS.interop.SocketManager.isConnected,
              set: a
            }), Object.defineProperty(TS.model, "ms_connecting", {
              get: TS.interop.SocketManager.isConnecting,
              set: a
            });
          }
          TS.model.files_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/files"), TS.model.archives_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/archives"), TS.model.bots_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/services"), TS.model.team_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/team");
          var o = [];
          TS.model.is_safari_desktop && o.push("is_safari_desktop"), TS.model.is_electron && TS.model.is_mac && TSSSB.call("isMainWindowFrameless") && o.push("is_electron_mac"), TS.model.is_mac && o.push("is_mac"), TS.model.is_win && o.push("is_win"), $("html").addClass(o.join(" "));
          var t = n(e),
            i = !TS.model.is_electron && TS.model.mac_ssb_version && TS.utility.compareSemanticVersions(TS.model.mac_ssb_version.toString(), "0.61") >= 0,
            r = TS.model.is_electron && TS.model.mac_ssb_version && TS.utility.compareSemanticVersions(TS.model.mac_ssb_version.toString(), "2.2") >= 0;
          TS.model.supports_growl_subtitle = (i || r) && TS.utility.compareSemanticVersions(t, "10.7") > 0;
          var s = !1;
          if (Object.defineProperty(TS.model, "dialog_is_showing", {
              get: function() {
                return s;
              },
              set: function(e) {
                s = e, TSSSB.call("dialogIsShowing", e);
              },
              enumerable: !0,
              configurable: !0
            }), TS.model.supports_voice_calls = !1, window.winssb ? (TS.model.supports_voice_calls = !(!winssb.screenhero && !winssb.calls), TS.model.win_ssb_version && TS.model.win_ssb_version < 2 && (TS.model.supports_voice_calls = !1)) : window.macgap ? (TS.model.supports_voice_calls = !(!macgap.screenhero && !macgap.calls), TS.model.mac_ssb_version < 2 && (TS.model.supports_voice_calls = !1)) : TS.model.is_chrome_desktop && (TS.model.supports_voice_calls = !0), TS.model.supports_video_calls = !1, TS.model.supports_screen_sharing = !1, TS.model.supports_screenhero = !1, TS.model.supports_mmap_minipanel_calls = !1, window.winssb) {
            if (winssb.calls && winssb.calls.requestCapabilities) {
              var l = winssb.calls.requestCapabilities();
              l && (l.supports_video && (TS.model.supports_video_calls = !0), l.supports_screen_sharing && winssb.stats && winssb.stats.getDisplayInformation && (TS.model.supports_screen_sharing = !0), !l.supports_screenhero || l.is_mas || l.is_ws || (TS.model.supports_screenhero = !0), l.supports_mmap_minipanel && (TS.model.supports_mmap_minipanel_calls = !0), TS.model.is_mas_or_ws = l.is_mas || l.is_ws);
            }
          } else TS.model.is_chrome_desktop && (TS.model.supports_video_calls = !0);
          TS.model.supports_user_bot_caching || TS.storage.cleanOutCacheTsStorage(), TS.model.supports_spaces_in_windows = !1, window.macgap && macgap.window && macgap.window.list ? (window.WebKitMutationObserver || window.MutationObserver) && (TS.model.supports_spaces_in_windows = !0) : window.winssb && winssb.window && winssb.window.list && (TS.model.supports_spaces_in_windows = !0), TS.boot_data.special_flex_panes && _.forOwn(TS.boot_data.special_flex_panes, function(e) {
            TS.model.flex_names.push(e.flex_name);
          }), TS.model.expandable_state = TS.storage.fetchExpandableState();
        },
        makeYouRegex: function() {
          var e = TS.model.user;
          e && (TS.model.you_regex = new RegExp("<@(" + e.id + "|" + e.name + ")\\b"));
        },
        addProfilingKeyTime: function(e, n) {
          n && e && (TS.model.profiling_key_times || (TS.model.profiling_key_times = []), TS.model.profiling_key_times.push({
            name: e,
            ms: n
          }));
        },
        incrementUnknownIdHandled: function(e) {
          o[e] = o[e] || {
            tries: 0,
            state: 0
          };
          var n = o[e];
          return n.tries += 1, n.state = 0, n.tries > 2 ? TS.maybeError(48, 'calling the API for id: "' + e + '", try #' + n.tries) : n.tries > 1 ? TS.maybeWarn(48, 'calling the API for id: "' + e + '", try #' + n.tries) : TS.log(48, 'calling the API for id: "' + e + '", try #' + n.tries), n.tries;
        },
        reportResultOfUnknownIdHandled: function(e, n) {
          var a = o[e];
          a && (a.state = n ? 1 : -1, 1 == a.state ? TS.log(48, 'API call for id: "' + e + '" SUCCEEDED, try #' + a.tries) : TS.maybeWarn(48, 'API call for id: "' + e + '" FAILED, try #' + a.tries));
        },
        logUnknownIdsHandled: function(e, n) {
          var a = i(e, n);
          TS.info("_unknown_ids_handled: " + JSON.stringify(a, null, 2));
        },
        getUnknownIdsHandled: function(e, n) {
          return i(e, n);
        },
        test: function() {
          return {
            getOSXVersion: n,
            isWin7Plus: e,
            sniffUserAgent: a
          };
        },
        getBroadcastKeywordById: function(e) {
          var n = _.find(TS.model.BROADCAST_KEYWORDS, {
            id: e
          });
          return n || void TS.warn("no broadcast_keyword ob found for " + e);
        },
        getViewById: function(e) {
          var n = _.find(TS.model.NAMED_VIEWS, {
            id: e
          });
          return n || void TS.warn("no view ob found for " + e);
        },
        isMac: function() {
          return TS.model.is_mac;
        },
        getUserModel: function() {
          return TS.model.user;
        },
        getUserPrefs: function() {
          return TS.model.prefs;
        }
      }), _.merge(TS.model, a(navigator.userAgent));
      var o = {},
        t = [-1, 0, 1],
        i = function(e, n) {
          e = parseInt(e, 10) || 1, n = _.includes(t, n) ? n : "any";
          var a = {};
          return Object.keys(o).forEach(function(t) {
            var i = o[t];
            e > i.tries || "any" !== n && i.state != n || (a[t] = o[t]);
          }), {
            state: n,
            min_tries: e,
            count: Object.keys(a).length,
            obs: a
          };
        };
    }();
  },
  2522: function(e, n) {
    ! function() {
      "use strict";
      var e, n, a = window.TS && TS.raw_templates,
        o = window.TS && TS.console,
        t = window.TS && TS.features,
        i = 0,
        r = !1;
      window.TS = {
        boot_data: {},
        qs_args: {},
        pri: 0,
        has_pri: {},
        console: o,
        features: t,
        exportToLegacy: function(e, n) {
          if (_.has(TS, e)) throw new Error("exportToLegacy: there is already something at " + e + "; we cannot overwrite it");
          if (!e || 0 !== e.indexOf("interop")) throw new Error("exportToLegacy: Name " + e + ' must start with "interop".');
          if (n.onStart) throw new Error("exportToLegacy: may not export objects with onStart methods");
          M ? _.set(TS, e, n) : TS.registerModule(e, n);
        },
        boot: function(a) {
          I(a), n = new Promise(function(n) {
            e = n;
          }), TS.boot_data = a, TS.qs_args.js_path && (TS.boot_data.version_ts = "local_js"), TS.console.onStart(), TS.client && TS.client.setClientLoadWatchdogTimer(), TS.model.api_url = TS.boot_data.api_url, TS.model.async_api_url = TS.boot_data.async_api_url, TS.model.api_token = TS.boot_data.api_token, TS.model.webhook_url = TS.boot_data.webhook_url, TS.boot_data.page_needs_enterprise && (TS.model.enterprise_api_token = TS.boot_data.enterprise_api_token), TS.info("booted! pri:" + TS.pri + " version:" + TS.boot_data.version_ts + " start_ms:" + TS.boot_data.start_ms + " (" + (Date.now() - TS.boot_data.start_ms) + "ms ago)"), TS.web && TS.web.space && TS.web.space.showFastPreview(), $(document).ready(R);
        },
        useRedux: function() {
          return !!TS.boot_data.feature_enable_redux_for_non_client || !!TS.client;
        },
        useReactDownloads: function() {
          return window.TS && TS.environment.isSSBAndAtLeastVersion("2.7");
        },
        useReactSidebar: function() {
          return !(!TS.useRedux() || !TS.boot_data.feature_react_sidebar) && (TS.model.prefs ? TS.model.prefs.use_react_sidebar : TS.boot_data.use_react_sidebar);
        },
        lazyLoadMembersAndBots: function() {
          return TS.useSocket();
        },
        useSocket: function() {
          return J();
        },
        isSocketManagerEnabled: function() {
          return !!TS.useSocket() && (!!TS.lazyLoadMembersAndBots() && "experiment" === TS.boot_data.ws_refactor_bucket);
        },
        getSocketStartArgs: function() {
          return h();
        },
        registerModule: function(e, n, a) {
          return V(n), M ? TS.error('module "' + e + '" must be registered on before dom ready') : P[e] ? TS.error('module "' + e + '" already exists') : void 0 === s(e, n, "module") ? void(a ? TS.error('module "' + e + '" cannot be registered after delay; "' + e.split(".").slice(0, -1).join(".") + '" is not registered') : U[e] = n) : (n._name = e, void(P[e] = n));
        },
        registerComponent: function(e, n) {
          if (M) return TS.error('component "' + e + '" must be registered on before dom ready');
          if (z[e]) return TS.error('component "' + e + '" already exists');
          if ("function" == typeof n && (n = n()), "function" != typeof n.destroy) return TS.error('component "' + e + '" cannot be registered as it does not have a destroy method');
          var a = function n() {
            this._constructor && this._constructor.apply(this, arguments), this.id || (this.id = e + "_auto_guid_" + i, i += 1), this.test && u() ? this.test = void 0 : "function" == typeof this.test && (this.test = this.test()), n._add(this.id, this);
          };
          if (void 0 === s(e, a, "component")) return void(D[e] = n);
          var o = n.destroy;
          n.destroy = function() {
            a._remove(this.id), o.call(this);
          }, a.prototype = Object.create(n), a.instances = {}, a._name = e, z[e] = a, a._add = function(n, a) {
            z[e].instances[n] && TS.warn("A " + e + " component with the instance id " + n + "already exists"), z[e].instances[n] = a;
          }, a._remove = function(n) {
            z[e].instances[n] = null;
          }, a.get = function(n) {
            return z[e].instances[n];
          }, a.getAll = function() {
            return z[e].instances;
          };
        },
        makeLogDate: function() {
          return window.TSMakeLogDate ? TSMakeLogDate() : "(TSMakeLogDate not loaded) ";
        },
        shouldLog: function(e) {
          return TS.console.shouldLog(e);
        },
        replaceConsoleFunction: function(e) {
          return TS.console.replaceConsoleFunction(e);
        },
        log: function(e) {
          TS.console.log.apply(this, [].slice.call(arguments, 0));
        },
        info: function() {
          TS.console.info.apply(this, [].slice.call(arguments, 0));
        },
        maybeWarn: function(e) {
          TS.console.maybeWarn.apply(this, [].slice.call(arguments, 0));
        },
        warn: function() {
          TS.console.warn.apply(this, [].slice.call(arguments, 0));
        },
        dir: function(e, n, a) {
          TS.console.dir.apply(this, [].slice.call(arguments, 0));
        },
        maybeError: function(e) {
          TS.console.maybeError.apply(this, [].slice.call(arguments, 0));
        },
        error: function() {
          TS.console.error.apply(this, [].slice.call(arguments, 0));
        },
        logError: function(e, n, a, o) {
          TS.console.logError.apply(this, [].slice.call(arguments, 0));
        },
        getQsArgsForUrl: function(e) {
          if (!e && x) return x;
          x = "";
          for (var n in TS.qs_args) "export_test" !== n && (x += "&" + n + "=" + TS.qs_args[n]);
          return x;
        },
        getOtherAccountsCount: function() {
          var e = 0;
          return TS.boot_data.other_accounts ? e = Object.keys(TS.boot_data.other_accounts).length : e;
        },
        refreshTeams: function() {
          TS.boot_data && TS.model && TS.model.team && TS.model.user && TS.api.call("auth.currentSessions").then(function(e) {
            var n = e.data;
            TS.boot_data.other_accounts = {};
            var a = 0;
            for (var o in n.accounts) o != TS.model.user.id && (TS.boot_data.other_accounts[o] = n.accounts[o], a += 1);
            TS.view && !a && TS.view.updateTitleBarColor();
          }).catch(function(e) {
            TS.console && TS.console.warn && TS.console.error && (TS.console.warn(8675309, "unable to do anything with refreshTeams rsp"), TS.console.error(8675309, e));
          });
        },
        ssbChromeClicked: function(e) {
          e || ($("html").trigger("touchstart"), $(".modal-backdrop").trigger("click"));
        },
        reload: function(e, n, a) {
          if (e) return TS.info("TS.reload called: " + e), void TS.generic_dialog.start({
            title: TS.i18n.t("Reloading!", "ts")(),
            body: e,
            show_cancel_button: !1,
            esc_for_ok: !0,
            onGo: function() {
              TS.reload();
            }
          });
          n && (n = JSON.stringify(n)), TS.info("TS.reload() called: " + (n || "no reason specified")), TS.console && TS.console.logStackTrace(), window.location.reload(a);
        },
        reloadIfVersionsChanged: function(e) {
          return TS.model.ms_logged_in_once && e.min_version_ts && "dev" !== TS.boot_data.version_ts && parseInt(TS.boot_data.version_ts, 10) < parseInt(e.min_version_ts, 10) ? (TS.reload(null, "parseInt(TS.boot_data.version_ts) < parseInt(data.min_version_ts)"), !0) : TS.model.ms_logged_in_once && e.cache_version && e.cache_version != TS.storage.msgs_version ? (TS.reload(null, "data.cache_version " + e.cache_version + " != TS.storage.msgs_version " + TS.storage.msgs_version), !0) : !(!TS.model.ms_logged_in_once || !e.cache_ts_version || e.cache_ts_version == TS.storage.cache_ts_version) && (TS.reload(null, "data.cache_ts_version " + e.cache_ts_version + " != TS.storage.cache_ts_version " + TS.storage.cache_ts_version), !0);
        },
        isPartiallyBooted: function() {
          return !!(TS._incremental_boot || TS._did_incremental_boot && !TS._did_full_boot);
        },
        ensureFullyBooted: function() {
          return n;
        },
        test: function() {
          var e = {
            _registerDelayedComponentsAndModules: W,
            _deleteModule: function(e) {
              delete TS[e], delete P[e];
            },
            _deleteComponent: function(e) {
              delete TS[e], delete z[e];
            }
          };
          return Object.defineProperty(e, "_getMSLoginArgs", {
            get: function() {
              return h;
            },
            set: function(e) {
              h = e;
            }
          }), Object.defineProperty(e, "_shouldConnectToMS", {
            get: function() {
              return J;
            },
            set: function(e) {
              J = e;
            }
          }), Object.defineProperty(e, "_maybeStartPerfTrace", {
            get: function() {
              return K;
            },
            set: function(e) {
              K = e;
            }
          }), e;
        }
      };
      var s = function(e, n, a) {
        var o = e,
          t = TS,
          i = o.split("."),
          r = i.length - 1;
        if (r >= 3) TS.error(a + ' "' + o + '" cannot be registered, as we only support a depth of two sub modules right now');
        else if (r) {
          o = i[r];
          var s = 0;
          for (s; s < r; s += 1)
            if (i[s] || TS.error(a + ' "' + e + '" cannot be registered because of a bad name'), void 0 === (t = t[i[s]])) return t;
        }
        return void 0 !== t[o] ? TS.error(a + ' "' + e + '" cannot be registered; "' + o + '" already exists on "' + (t._name || "TS") + '"') : t[o] = n, t;
      };
      a && (TS.raw_templates = a, a = null);
      var l, c, d, m, u = function() {
          return !(void 0 !== window.jasmine || "dev" === TS.boot_data.version_ts && TS.qs_args.export_test);
        },
        g = function() {
          if (!TS.isSocketManagerEnabled()) {
            if (TS.console.logStackTrace("MS reconnection requested"), TS.ms.isAsleep()) return void TS.error("NOT reconnecting, we are asleep");
            if (TS.model.ms_connected) return void TS.warn("Reconnect requested, but we are already connected; doing nothing.");
            if (TS.model.ms_connecting) return void TS.warn("Reconnect requested, but we are already connecting; doing nothing.");
            if (TS.metrics.mark("ms_reconnect_requested"), TS.api.paused_sig.has(f) || TS.api.paused_sig.addOnce(f), TS.isSocketManagerEnabled() ? TS.interop.SocketManager.connectedSig.has(p) || TS.interop.SocketManager.connectedSig.addOnce(p) : TS.ms.connected_sig.has(p) || TS.ms.connected_sig.addOnce(p), TS.isPartiallyBooted()) {
              var e = S();
              A(e);
            } else S().then(v);
          }
        },
        f = function() {
          TS.isSocketManagerEnabled() || (TS.info("API queue got paused while waiting for MS reconnection"), TS.isSocketManagerEnabled() ? TS.interop.SocketManager.remove(p) : TS.ms.connected_sig.remove(p), TS.api.unpaused_sig.addOnce(function() {
            if (TS.model.calling_rtm_start) return void TS.info("API queue got unpaused, but rtm.start calling is pending, so doing nothing");
            g();
          }));
        },
        p = function() {
          if (!TS.isSocketManagerEnabled()) {
            var e = TS.metrics.measureAndClear("ms_reconnect_delay", "ms_reconnect_requested");
            TS.info("OK, MS is now reconnected -- it took " + _.round(e / 1e3, 2) + " seconds"), TS.api.paused_sig.remove(f), TS.api.unpaused_sig.remove(g);
          }
        },
        h = function() {
          var e = {
            agent: "webapp_" + TS.boot_data.version_uid,
            simple_latest: !0,
            no_unreads: !0,
            presence_sub: !0,
            mpim_aware: !0,
            canonical_avatars: !0,
            eac_cache_ts: !0
          };
          return TS.lazyLoadMembersAndBots() ? (e.no_users = !0, e.no_bots = !0, e.no_members = !0, e.cache_ts = 0, Object.keys(TS.qs_args).filter(function(e) {
            return 0 === e.indexOf("feature_");
          }).forEach(function(n) {
            TS.has_pri[Y] && TS.log(Y, "Flannel: Appending " + n + " (" + TS.qs_args[n] + ") to login_args"), e[n] = TS.qs_args[n];
          })) : TS.boot_data.page_needs_just_me ? (TS.storage.disableMemberBotCache(), e.just_me = !0, e.no_members = !0) : e.cache_ts = c || TS.storage.fetchLastCacheTS(), TS.web && (TS.boot_data.page_needs_state || TS.boot_data.page_has_ms || TS.lazyLoadMembersAndBots() ? e.no_presence = !0 : e.no_state = !0), TS.calls && (e.no_subteams = !0), TS.boot_data.page_needs_all_ims || (e.only_relevant_ims = !0), TS.boot_data.feature_name_tagging_client && (e.name_tagging = !0), TS.boot_data.feature_ms_latest && (e.ms_latest = !0), TS.lazyLoadMembersAndBots() && TS.has_pri[Y] && TS.log(Y, "Flannel: MS login args:", e), e;
        },
        S = function() {
          var e = TS.incremental_boot && TS.incremental_boot.shouldIncrementalBoot(),
            n = b();
          return e ? (m = n, TS.info("Starting incremental boot"), TS.incremental_boot.startIncrementalBoot().catch(function() {
            return TS.info("Recovering from incremental boot error"), m = void 0, T(n);
          })) : (TS.info("Starting non-incremental boot"), T(n));
        },
        T = function(e) {
          return e.catch(function(e) {
            throw w(e), e;
          });
        },
        b = function e() {
          if (TS.qs_args.no_rtm_start) return new Promise(function(n, a) {
            TS.resumeRTMStart = function() {
              delete TS.resumeRTMStart, delete TS.qs_args.no_rtm_start, e().then(function(e) {
                n(e);
              }).catch(a);
            };
          });
          if (!TS.isSocketManagerEnabled() && l) return TS.info("Want to call rtm.start, but will wait " + l + " ms first"), new Promise(function(n) {
            setTimeout(function() {
              TS.info("OK, now calling rtm.start, having waited for delay"), l = void 0, n(e());
            }, l);
          });
          if (!TS.isSocketManagerEnabled()) {
            if (TS.model.calling_rtm_start) {
              var n = "_promiseToCallRTMStart was called but TS.model.calling_rtm_start=true";
              return TS.error(n), Promise.reject(new Error(n));
            }
            TS.ms.logConnectionFlow("login"), TS.model.rtm_start_throttler += 1, TS.info("Setting calling_rtm_start to true"), TS.model.calling_rtm_start = !0;
          }
          if (!TS.useSocket()) return TS.api.callImmediately("rtm.start", h()).finally(function() {
            TS.model.calling_rtm_start = !1, TS.info("Setting calling_rtm_start to false (after rtm.start from API)");
          });
          var a;
          if (TS.isSocketManagerEnabled()) a = O();
          else {
            if (!d) {
              if (TS.model.ms_connected) return TS.has_pri[Y] && TS.log(Y, "Bad news: we're trying to do an rtm.start from Flannel while we're already connected, and that won't work."), Promise.reject(new Error("rtm.start-over-WebSocket failed"));
              d = K().then(B);
            }
            a = d, d = void 0;
          }
          return a.then(function(e) {
            return TS.has_pri[Y] && TS.log(Y, "Flannel: got rtm.start response 💕"), {
              ok: !0,
              args: {},
              data: e
            };
          }).finally(function() {
            TS.isSocketManagerEnabled() || (TS.model.calling_rtm_start = !1, TS.info("Setting calling_rtm_start to false (after rtm.start from Flannel)"));
          });
        },
        w = function(e) {
          var n = e.data && e.data.error;
          if ("user_removed_from_team" === n && (TS.warn("You have been removed from the " + TS.model.team.name + " team."), TS.client && TS.client.userRemovedFromTeam(TS.model.team.id)), "account_inactive" === n || "team_disabled" === n || "invalid_auth" === n) return TSSSB.call("invalidateAuth"), void TS.reload(null, "resp.data.error: " + n);
          if ("clear_cache" === n || "org_login_required" === n || "team_added_to_org" === n) {
            return TS.storage.flush(!0), void TS.reload(null, "TS.storage.flush() and TS.reload() because resp.data.error: " + n);
          }
          "ratelimited" === n && ne(), TS.isSocketManagerEnabled() || TS.ms.logConnectionFlow("on_login_failure"), TS.isSocketManagerEnabled() || TS.ms.onFailure("rtm.start call failed with error: " + (n || "no error on resp.data"));
          var a = parseInt(_.get(e, "data.retry_after"), 10);
          return TS.info("rtm.start failed; retry_after = " + a), l = 1e3 * _.clamp(a, 5, 60), null;
        },
        v = function(n) {
          if (TS.boot_data.feature_tinyspeck && TS.info("BOOT: Got rtm.start login data"), TS.model.emoji_cache_ts = n.data.emoji_cache_ts, TS.model.apps_cache_ts = n.data.apps_cache_ts, TS.model.commands_cache_ts = n.data.commands_cache_ts, n.data.latest_event_ts && !TS.lazyLoadMembersAndBots() && (TS.info("rtm.start included latest event timestamp: " + n.data.latest_event_ts), c = parseInt(n.data.latest_event_ts, 10)), !TS.model.ms_logged_in_once && !TS.storage.fetchLastEventTS() && n.data.latest_event_ts) {
            var a = function() {
              TS.ms.storeLastEventTS(n.data.latest_event_ts, "_processStartData");
            };
            TS.isSocketManagerEnabled() ? TS.interop.SocketManager.connectedSig.addOnce(a) : TS.ms.connected_sig.addOnce(a);
          }
          if (!TS.client || !TS.reloadIfVersionsChanged(n.data)) return n.data.self ? n.data.team ? (TS.isSocketManagerEnabled() || TS.ms.logConnectionFlow("on_login"), TS.boot_data.feature_tinyspeck && TS.info("BOOT: Setting up model"), Z(n.data, n.args).then(function() {
            return TS.boot_data.feature_tinyspeck && TS.info("BOOT: Model did set up; setting up apps"), TS.apps.setUp(), TS.boot_data.feature_tinyspeck && TS.info("BOOT: Setting up commands"), TS.cmd_handlers.setUpCmds(), TS.boot_data.feature_tinyspeck && TS.info("BOOT: Setting up UI"), y(), TS.boot_data.feature_tinyspeck && TS.info("BOOT: Finding initial channel"), TS.client && TS.client.calculateInitialCid(), TS.boot_data.feature_tinyspeck && TS.info("BOOT: Setting up emoji and shared channels"), Promise.join(TS.emoji.setUpEmoji().catch(function() {
              TS.boot_data.feature_tinyspeck && TS.info("BOOT: Setting up emoji failed, trying to move forward anyway...");
            }), TS.members ? TS.members.maybeFetchAccessibleUserIds() : Promise.resolve());
          }).then(function() {
            TS.boot_data.feature_tinyspeck && TS.info("BOOT: Nearly there! Finalizing..."), TS.model.ms_logged_in_once || k(n.data), TS.client && TS.client.onEveryLoginMS(n.data), TS.web && TS.web.onEveryLoginMS(n.data), j();
            var a;
            a = TS._did_incremental_boot ? TS.model.ms_logged_in_once : !TS.model.ms_logged_in_once, a && e && (TS.boot_data.feature_tinyspeck && TS.info("BOOT: Divine clementine, we are finalizing a full boot!"), e(), e = null, TSSSB.call("didFinishLoading"), r = !0), TS.model.ms_logged_in_once = !0, TS.boot_data.feature_tinyspeck && TS.info("BOOT: Holy guacamole, we're all done!"), TS.info("User id: " + _.get(TS.boot_data, "user_id") + ", team id: " + _.get(TS.model, "team.id"));
          }).catch(function(e) {
            TS.error("_setUpModel failed with err: " + (e ? e.message : "no err provided")), TS.dir(e), TS.info(e.stack), TS._last_boot_error = e;
          })) : void TS.error("No team?") : void TS.error("No self?");
        },
        y = function() {
          TS.ui.setThemeClasses(), TS.client && (TSSSB.call("setCurrentTeam", TS.model.team.domain), TS.client.updateTeamIcon());
        },
        k = function(e) {
          if (TS.boot_data.feature_tinyspeck && TS.info("BOOT: _finalizeFirstBoot"), TS.model.ms_logged_in_once) return void TS.warn("_finalizeFirstBoot called, but we have already done this before. This is a progamming error.");
          TS.client && (TS.client.onFirstLoginMS(e), TS.isPartiallyBooted() ? (A(m), m = void 0) : TS.incremental_boot.afterFullBoot(), TS.isSocketManagerEnabled() && TS.interop.Eventlog.initialize()), TS.web && TS.web.onFirstLoginMS(e);
        },
        A = function(e) {
          TS.info("Finalizing incremental boot"), TS.incremental_boot.beforeFullBoot(), T(e).then(function(e) {
            v(e), TS.incremental_boot.afterFullBoot(), TS.info("Completed incremental boot");
          }).catch(function(e) {
            throw TS.error("Tried to finalize incremental boot, but rtm.start failed. Will recover when we reconnect."), e;
          });
        },
        j = function() {
          if (TS.isPartiallyBooted()) return void(TS.boot_data.feature_tinyspeck && TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS not connecting to MS until we complete incremental boot"));
          if (!J()) return void(TS.boot_data.feature_tinyspeck && TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS will not connect to MS"));
          if (TS.boot_data.feature_tinyspeck && TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS wants to connect to MS"), TS.isSocketManagerEnabled())
            if (TS.interop.SocketManager.isProvisionallyConnected()) {
              TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS will finalize SocketManager");
              try {
                TS.interop.SocketManager.finalizeProvisionalConnection(), TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS did finalize SocketManager");
              } catch (e) {
                TS.log("BOOT: _maybeFinalizeOrOpenConnectionToMS failed to finalize SocketManager"), TS.error(e), TS.interop.SocketManager.disconnect();
              }
            } else TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS wanted to finalize SocketManager but it had no connection; making a new one"), TS.interop.SocketManager.connectProvisionallyAndFetchRtmStart().catch(function(e) {
              TS.log("BOOT: _maybeFinalizeOrOpenConnectionToMS failed to make a new connection"), TS.error(e);
            });
          else TS.ms.hasProvisionalConnection() && TS.ms.finalizeProvisionalConnection() ? (TS.boot_data.feature_tinyspeck && TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS finalized MS connection"), TS.has_pri[X] && TS.log(X, "Successfully finalized a provisional MS connection")) : (TS.boot_data.feature_tinyspeck && TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS made a new MS connection"), TS.has_pri[X] && TS.log(X, "No valid provisional MS connection; making a new connection"), TS.ms.connectImmediately(TS.model.team.url || TS.boot_data.ms_connect_url));
          TS.boot_data.feature_tinyspeck && TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS did connect to MS");
        },
        E = function() {
          TS.shared.getAllModelObsForUser().forEach(function(e) {
            e._consistency_has_been_checked && (e._consistency_has_been_checked = !1), e._consistency_is_being_checked && (e._consistency_is_being_checked = !1);
          });
        };
      TS.qs_args = function() {
        var e, n = location.search.substring(1),
          a = {};
        e = n.split("&");
        for (var o = 0; o < e.length; o += 1) {
          var t = e[o].indexOf("=");
          if (-1 != t) {
            var i = e[o].substring(0, t),
              r = e[o].substring(t + 1);
            a[i] = unescape(r);
          } else e[o].length && (a[e[o]] = "");
        }
        return a;
      }(), TS.pri = TS.qs_args.pri ? TS.qs_args.pri + ",0" : TS.pri, _.each(TS.pri && TS.pri.split(","), function(e) {
        e && (TS.has_pri[e] = !0);
      });
      var x, M = !1,
        C = function() {
          TS.interop.SocketManager.disconnectedSig.add(E), TS.interop.SocketManager.connectedSig.addOnce(function() {
            TS.interop.SocketManager.provisionallyConnectedSig.add(function(e) {
              e.then(function(e) {
                TS.info("Got start data from Socket Manager; hydrating it");
                var n = e.rtm_start;
                TS.flannel.hydrateStartData(n).then(function(e) {
                  TS.info("Successfully hydrated start data from Socket Manager; processing it"), v({
                    ok: !0,
                    args: {},
                    data: e
                  });
                }).catch(function(e) {
                  TS.warn("Error while hydrating start data from Socket Manager; passing non-hydrated version on since it is better than nothing"), TS.logError(e), v({
                    ok: !0,
                    args: {},
                    data: n
                  });
                });
              });
            });
          });
        },
        O = function() {
          if (!TS.isSocketManagerEnabled()) return Promise.reject(new Error("_connectAndFetchStartDataWithSocketManager can only be used when TS.isSocketManagerEnabled is true"));
          if (!TS.interop.SocketManager.hasNeverConnected()) {
            var e = new Error("_connectAndFetchStartDataWithSocketManager can only be called if Socket Manager has never connected");
            return TS.console.logError(e, "_connectAndFetchStartDataWithSocketManager called too many times"), Promise.reject(e);
          }
          var n = new Promise(function(e) {
            function n(a) {
              a.then(function(a) {
                var o = a.rtm_start;
                TS.flannel.hydrateStartData(o).then(function(a) {
                  TS.interop.SocketManager.provisionallyConnectedSig.remove(n), e(a);
                });
              }).catch(function(e) {
                TS.warn("Unable to get start data from socket"), TS.logError(e);
              });
            }
            TS.interop.SocketManager.provisionallyConnectedSig.add(n);
          });
          return TS.boot_data.ws_refactor_bucket && (TS.has_pri[1996] = !0), TS.interop.SocketManager.start(), n;
        },
        B = function() {
          if (TS.isSocketManagerEnabled()) return Promise.reject(new Error("_connectAndFetchStartDataWithoutSocketManager can only be used when TS.isSocketManagerEnabled is false"));
          TS.log(1996, "Opening a tokenless MS connection and fetching rtm.start over it");
          var e = TS.flannel.getFlannelConnectionUrl(),
            n = TS.ms.connectProvisionallyAndFetchRtmStart(e);
          if (!n) throw new Error("TS.ms.connect did not return an rtm.start promise");
          return n.then(function(e) {
            return TS.flannel.hydrateStartData(e.rtm_start);
          });
        },
        F = function(e) {
          TS.client && TSSSB.call("didStartLoading", 6e4), J() && (TS.isSocketManagerEnabled() ? C() : (TS.ms.reconnect_requested_sig.add(g), TS.ms.disconnected_sig.add(E))), N(), M = !0, TS.model.is_our_app && Q(), TS.ui.setUpWindowUnloadHandlers(), "client" === TS.boot_data.app ? TS.client.gogogo() : "web" !== TS.boot_data.app && "space" !== TS.boot_data.app && "calls" !== TS.boot_data.app || TS.web.gogogo(), TS.boot_data.no_login ? (TS.info("running without a user"), TS.web && TS.web.no_login_complete_sig.dispatch()) : e ? v(e) : TS.error("_initialDataFetchesComplete expected to receive rtm.start data; we cannot continue.");
        },
        L = function() {
          if (window.sessionStorage) try {
            var e = TS.client ? "session_load_count_client" : "session_load_count_web",
              n = parseInt(sessionStorage.getItem(e) || 0, 10) + 1;
            sessionStorage.setItem(e, n), TS.info(e + ": " + n), TS.metrics.store(e, n, {
              is_count: !0
            });
          } catch (e) {
            TS.warn("could not log session load count: " + e);
          }
        },
        I = function(e) {
          Promise.config({
            longStackTraces: "dev" === e.version_ts || TS.qs_args.js_path,
            warnings: {
              wForgottenReturn: !1
            },
            cancellation: !0
          });
        },
        P = {},
        U = {},
        z = {},
        D = {},
        R = function() {
          if (TS.info("_onDOMReady"), setTimeout(function() {
              TS.model.is_our_app && (TS.environment.isSSBAndAtLeastVersion("2.6") || r || (TSSSB.call("didFinishLoading"), r = !0, TS.metrics.count("fake_call_did_finish_loading_for_older_SSBs")));
            }, 7e4), L(), TS.qs_args.ws_flakiness) try {
            var e = parseFloat(TS.qs_args.ws_flakiness);
            TS.interop.SocketManager.debugSetSocketConnectFlakiness(e);
          } catch (e) {}
          if ((TS.model.is_chrome_desktop || TS.model.is_FF || TS.model.is_safari_desktop) && TS.storage.do_compression ? TS.model.supports_user_bot_caching = !0 : TS.model.win_ssb_version || TS.model.lin_ssb_version ? TS.model.supports_user_bot_caching = !0 : TS.model.mac_ssb_version && (1.1 == TS.model.mac_ssb_version && TS.model.mac_ssb_version_minor >= 4 ? TS.model.supports_user_bot_caching = !0 : TS.model.mac_ssb_version >= 2 && (TS.model.mac_ssb_version_minor > 0 || TS.model.mac_ssb_build >= 7398) ? TS.model.supports_user_bot_caching = !0 : TS.model.is_electron && (TS.model.supports_user_bot_caching = !0)), TS.model.supports_user_bot_caching && TS.boot_data.feature_name_tagging_client && TS.storage.disableMemberBotCache(), TS.model.supports_user_bot_caching && TS.boot_data.feature_omit_localstorage_users_bots && (TS.warn("Calling TS.storage.disableMemberBotCache() because feature_omit_localstorage_users_bots"), TS.storage.disableMemberBotCache()), (window.macgap && macgap.downloads || window.winssb && winssb.downloads) && (TS.model.supports_downloads = !0, TS.model.flex_names.push("downloads")), TS.client && window.WEB_SOCKET_USING_FLASH_BUT_NO_FLASH) return TS.info("WEB_SOCKET_USING_FLASH_BUT_NO_FLASH"), $("#loading_animation").addClass("hidden"), void $("#no_ws_and_bad_flash").css("display", "inline");
          TS.client ? TSSSB.call("didStartLoading", 3e4) : TS.info("no TS.client on page:" + document.location.href), TS.api.paused_sig.add(function(e) {
            TS.boot_data.feature_tinyspeck && TS.api.debugShowQueue(), TS.client ? TS.client.apiPaused(e) : TS.web.apiPaused(e);
          }), TS.api.unpaused_sig.add(function() {
            TS.client ? TS.client.apiUnpaused() : TS.web.apiUnpaused();
          }), soundManager.ignoreFlash = !0, soundManager.setup({
            url: "/img/sm/",
            debugMode: !1
          }), TS.storage.onStart(), W();
          var n = TS.boot_data.no_login ? Promise.resolve() : S(),
            a = [q(), n];
          TS.boot_data.page_needs_enterprise && !TS.boot_data.no_login && a.push(TS.enterprise.promiseToEnsureEnterprise()), TS.web && TS.boot_data.page_needs_team_profile_fields && a.push(TS.team.ensureTeamProfileFields()), Promise.all(a).then(function() {
            return n.then(F), null;
          });
        },
        q = function() {
          function e() {
            return o += 1, new Promise(function(n) {
              if (window.TS && TS.raw_templates && Object.keys(TS.raw_templates).length > 0) return void n();
              TS.utility.getCachedScript(a).done(function() {
                if (0 == Object.keys(TS.raw_templates).length) return void TS.error(a + " returned no templates D:");
                n();
              }).fail(function(n, t, i) {
                var r = Math.min(1e3 * o, 1e4);
                TS.warn("loading " + a + " failed (textStatus:" + t + " errorThrown:" + i + " attempts:" + o + "), trying again in " + r + "ms"), setTimeout(e, r);
              });
            });
          }
          if (window.TS && TS.raw_templates && Object.keys(TS.raw_templates).length > 0) return Promise.resolve();
          var n;
          n = TS.boot_data.hbs_templates_version && "dev" !== TS.boot_data.version_ts ? TS.boot_data.hbs_templates_version : "dev" === TS.boot_data.version_ts ? Date.now() : TS.boot_data.version_ts;
          var a = "/templates.php?cb=" + n + TS.getQsArgsForUrl();
          TS.boot_data.template_groups && (a += "&template_groups=" + TS.boot_data.template_groups), TS.boot_data.template_exclude_feature_flagged && (a += "&template_exclude_feature_flagged=1"), /&locale=[a-zA-Z-]/.test(a) && (a = a.replace(/\?locale=[a-zA-Z-]*&/, "?").replace(/[?|&]locale=[a-zA-Z-]*/, ""), a = a.replace(/&locale=[a-zA-Z-]/, "")), TS.i18n.locale() && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE && (a += "&locale=" + TS.i18n.locale());
          var o = 0;
          return e();
        },
        W = function() {
          _.sortBy(Object.keys(U), "length").forEach(function(e) {
            TS.registerModule(e, U[e], !0);
          }), _.sortBy(Object.keys(D), "length").forEach(function(e) {
            TS.registerComponent(e, D[e], !0);
          });
        },
        N = function() {
          if (TS.log(Date.now() - TS.boot_data.start_ms + "ms from first html to calling onStarts()"), "client" === TS.boot_data.app) TS.client.onStart(), TS.client.onStart = _.noop;
          else if ("web" === TS.boot_data.app || "space" === TS.boot_data.app || "calls" === TS.boot_data.app) TS.web.onStart(), TS.web.onStart = _.noop;
          else {
            if ("test" === TS.boot_data.app) return;
            if ("api" !== TS.boot_data.app && "oauth" !== TS.boot_data.app) return void TS.error("WTF app? " + TS.boot_data.app);
          }
          var e, n = !TS.qs_args.keep_onstart;
          try {
            _.forOwn(P, function(a) {
              a.onStart && (e = a._name, a.onStart(), n && (a.onStart = _.noop));
            });
          } catch (n) {
            throw TS.error("TS." + e + ".onStart encountered an error:"), TS.logError(n), window.TSBeacon && window.TSBeacon("call_onstarts_error", 1), n;
          }
          n && (N = _.noop);
        },
        Z = function(e, n) {
          return TS.lazyLoadMembersAndBots() && (e.bots = e.bots || []), new Promise(function(a, o) {
            var t = !TS.model.ms_logged_in_once;
            if (TS.team.upsertTeam(e.team), TS.model.team.url = e.url, TS.boot_data.page_needs_enterprise && void 0 !== e.can_manage_shared_channels && (TS.model.team.prefs.can_user_manage_shared_channels = e.can_manage_shared_channels), TS.model.last_team_name || (TS.model.last_team_name = TS.model.team.name, TS.model.last_team_domain = TS.model.team.domain), TS.model.team.activity = [], TS.model.break_token && (TS.model.team.url += "f"), t) TS.model.rooms = [], TS.useRedux() || (TS.model.channels = [], TS.model.groups = [], TS.model.mpims = [], TS.model.ims = []), TS.useRedux() && TS.boot_data.feature_store_members_in_redux || (TS.model.members = [], TS.model.bots = []), TS.model.teams = [], TS.model.user_groups = [], TS.model.read_only_channels = [], TS.boot_data.feature_default_shared_channels && (TS.model.threadable_channels = []), TS.model.online_users = [];
            else {
              var i = TS._did_incremental_boot && !TS._did_full_boot;
              i || TS.refreshTeams();
            }
            if (e.online_users && _.isArray(e.online_users) && (TS.model.online_users = _.filter(e.online_users, function(e) {
                return "USLACKBOT" !== e;
              }), TS.boot_data.page_needs_enterprise)) {
              var r = 0,
                s = Date.now();
              if (TS.model.online_users = _.filter(TS.model.online_users, function(e) {
                  var n = TS.members.getMemberById(e);
                  return !n || ("active" !== n.presence && (n.presence = "active", t || (r += 1, TS.members.presence_changed_sig.dispatch(n))), !1);
                }), r) {
                var l = Date.now() - s;
                l > 500 && TS.warn("_setUpModel: took " + l + " msec to dispatch " + r + " presence_changed signals.");
              }
            }
            TS.prefs.setPrefs(e.self.prefs), delete e.self.prefs;
            var c, d, m, u, g = function(e) {
                TS.model.user = e, TS.model.user.is_self = !0;
              },
              f = ["TS.model.supports_user_bot_caching:" + TS.model.supports_user_bot_caching, "TS.storage.isUsingMemberBotCache():" + TS.storage.isUsingMemberBotCache(), "args.cache_ts:" + n.cache_ts],
              p = _.clone(n);
            p.token && (p.token = "REDACTED");
            try {
              f.push("api args: " + JSON.stringify(p));
            } catch (e) {
              f.push("api args: " + p);
            }
            TS.members.startBatchUpsert(), TS.bots.startBatchUpsert();
            var h = e.updated_users || e.users || [],
              S = e.updated_bots || e.bots || [],
              T = TS.storage.fetchMembers(),
              b = {};
            if (!TS._did_incremental_boot || TS._incremental_boot || TS._did_full_boot)
              for (c = 0; c < h.length; c += 1) b[h[c].id] = !0;
            else;
            var w = TS.boot_data.page_needs_enterprise && TS.boot_data.exclude_org_members;
            for (c = 0; c < T.length; c += 1) u = T[c], w && !TS.members.isLocalTeamMember(u) || b[u.id] || (e.online_users && (u.presence = _.includes(e.online_users, u.id) ? "active" : "away"), _.get(u, "profile.always_active") && (u.presence = "active"), d = TS.members.upsertAndSignal(u), TS.has_pri[ee] && TS.log(ee, "upsert from CACHE: " + u.id + " " + d.status), d.member.id == e.self.id && g(d.member));
            for (c = 0; c < h.length; c += 1) u = h[c], w && !TS.members.isLocalTeamMember(u) || (TS.lazyLoadMembersAndBots() ? u.presence = _.has(u, "presence") && "active" === u.presence ? "active" : "away" : e.online_users && (u.presence = _.includes(e.online_users, u.id) ? "active" : "away"), _.get(u, "profile.always_active") && (u.presence = "active"), d = TS.members.upsertAndSignal(u), TS.has_pri[ee] && TS.log(ee, "upsert from DATA: " + u.id + " " + d.status), d.member.id == e.self.id && g(d.member));
            var v = TS.storage.fetchBots(),
              y = {};
            for (c = 0; c < S.length; c += 1) y[S[c].id] = !0;
            for (c = 0; c < v.length; c += 1) m = v[c], y[m.id] || (d = TS.bots.upsertAndSignal(m));
            for (c = 0; c < S.length; c += 1) TS.bots.upsertAndSignal(S[c]);
            f.push("members from LS:" + T.length + ", from updated_users in rtm.start:" + h.length + " (slackbot will always be here)"), f.push("bots from LS:" + v.length + ", from updated_bots in rtm.start:" + S.length), h.length < TS.model.members.length / 20 && (TS.model.did_we_load_with_user_cache = !0), y = null, b = null, TS.info(f.join("\n")), TS.has_pri[ee] && (TS.dir(ee, T, "users_cache"), TS.dir(ee, v, "bots_cache"));
            var k = function(n) {
              if (TS._incremental_boot) return !0;
              if (TS.lazyLoadMembersAndBots()) return !0;
              if (TS.boot_data.page_needs_just_me) return !0;
              if (TS.calls) return !0;
              if (TS.boot_data.page_needs_enterprise && TS.boot_data.exclude_org_members) return !0;
              var a = {},
                o = function(e) {
                  e.is_group && e.is_shared && !n || e.members && e.members.forEach && e.members.forEach(function(e) {
                    a[e] = !0;
                  });
                };
              e.channels.forEach(o), e.groups.forEach(o), e.mpims && e.mpims.filter(function(e) {
                return !e.is_shared || n;
              }).forEach(o), e.ims.forEach(function(e) {
                e.is_shared && !n || e.user && (a[e.user] = !0);
              });
              var t = [];
              for (var i in a) TS.members.getMemberById(i) || t.push(i);
              return t.length ? (f.push("doAllMembersFromChannelsInRawDataExist() found (" + t.length + ") unknown members: " + t.join(", ")), !!TS.boot_data.page_needs_enterprise) : (f.push("doAllMembersFromChannelsInRawDataExist() confirmed all members"), !0);
            };
            if (!TS.model.user) return G("no TS.model.user", f.join("\n")), void o(Error("called _onBadUserCache"));
            if (!k()) {
              if (parseInt(n.cache_ts, 10)) return G("!doAllMembersFromChannelsInRawDataExist()", f.join("\n")), void o(Error("called _onBadUserCache"));
              TS.logError({
                message: f.join("\n")
              }, "doAllMembersFromChannelsInRawDataExist() failed");
            }
            TS.members.finishBatchUpsert(), TS.bots.finishBatchUpsert(), TS.members.upsertMember(e.self);
            var A = TS.isPartiallyBooted() && !i;
            if (TS.storage.isUsingMemberBotCache() && !A) {
              var j = e.cache_ts;
              TS.storage.rememberLastCacheTS(j), TS.members.maybeStoreMembers(!0), TS.bots.maybeStoreBots(!0);
            }
            TS.model.makeYouRegex(), TS.prefs.setHighlightWords(TS.model.prefs.highlight_words), e.subteams && (TS.user_groups.startBatchUpsert(), e.subteams.all.forEach(function(e) {
              TS.user_groups.upsertUserGroup(e);
            }), TS.user_groups.finishBatchUpsert(), e.subteams.self.forEach(function(e) {
              TS.user_groups.upsertSelfUserGroup(e);
            }));
            var E = 0;
            if (e.channels.forEach(function(e) {
                e.is_member && (E += 1);
              }), e.ims.forEach(function(e) {
                e.is_open && (E += 1);
              }), e.groups.forEach(function(e) {
                e.is_archived || (E += 1);
              }), e.mpims && e.mpims.forEach(function(e) {
                e.is_open && !e.is_archived && (E += 1);
              }), e.read_only_channels && (TS.model.read_only_channels = e.read_only_channels), TS.boot_data.feature_default_shared_channels && e.threadable_channels && (TS.model.threadable_channels = e.threadable_channels), TS.model.initial_msgs_cnt = 42, TS.qs_args.api_count) {
              var x = parseInt(TS.qs_args.api_count, 10) || TS.model.initial_msgs_cnt;
              TS.model.initial_msgs_cnt = Math.min(TS.model.initial_msgs_cnt, x);
            }
            var M = TS.model.hard_msg_limit;
            TS.model.subsequent_msgs_cnt = Math.min(M, 2 * TS.model.initial_msgs_cnt), TS.model.special_initial_msgs_cnt = Math.min(M, 2 * TS.model.initial_msgs_cnt), TS.info("open channels/groups/ims:" + E + " initial_msgs_cnt:" + TS.model.initial_msgs_cnt + " subsequent_msgs_cnt:" + TS.model.subsequent_msgs_cnt + " special_initial_msgs_cnt:" + TS.model.special_initial_msgs_cnt);
            var C = function() {
              var n = 1 == TS.qs_args.just_general;
              TS.utility.msgs.startBatchUnreadCalc(), TS.metrics.mark("upsert_channels_start");
              var a = !1;
              TS.useRedux() && (a = !0);
              var o = _.map(e.channels, function(e) {
                if (!n || e.is_general) return TS.channels.upsertChannel(e, a);
              });
              TS.useRedux() && o.length && TS.redux.channels.bulkAddEntities(_.compact(o)), TS.metrics.measureAndClear("upsert_channels", "upsert_channels_start");
              var t = TS.boot_data.page_needs_enterprise && TS.boot_data.exclude_org_members;
              if (!t) {
                var i = _.map(e.ims, function(e) {
                  if (!n || "USLACKBOT" === e.user) return TS.ims.upsertIm(e, a);
                });
                TS.useRedux() && i.length && TS.redux.channels.bulkAddEntities(_.compact(i));
              }
              if (TS.metrics.mark("upsert_groups_start"), !TS.isPartiallyBooted()) {
                var r = _.map(TS.model.groups, "id"),
                  s = _.map(e.groups, "id"),
                  l = !1;
                _.difference(r, s).forEach(function(e) {
                  var n = TS.groups.getGroupById(e);
                  TS.groups.removeGroup(n), TS.groups.left_sig.dispatch(n), l = !0;
                }), l && TS.members.invalidateMembersUserCanSeeArrayCaches();
              }
              var c = _.map(e.groups, function(e) {
                if (!n) return TS.groups.upsertGroup(e, a);
              });
              if (TS.useRedux() && c.length && TS.redux.channels.bulkAddEntities(_.compact(c)), TS.metrics.measureAndClear("upsert_groups", "upsert_groups_start"), e.mpims && !t) {
                var d = _.map(e.mpims, function(e) {
                  if (!n) return TS.mpims.upsertMpim(e, a);
                });
                TS.useRedux() && d.length && TS.redux.channels.bulkAddEntities(_.compact(d));
              }
              TS.utility.msgs.finishBatchUnreadCalc(), TS.model.user.is_restricted && !TS._incremental_boot && TS._did_incremental_boot && TS.members.invalidateMembersUserCanSeeArrayCaches();
            };
            if (e.dnd && (e.dnd.dnd_enabled ? (e.dnd.next_dnd_start_ts && (TS.model.dnd.next_dnd_start_ts = e.dnd.next_dnd_start_ts), e.dnd.next_dnd_end_ts && (TS.model.dnd.next_dnd_end_ts = e.dnd.next_dnd_end_ts)) : (TS.model.dnd.next_dnd_start_ts = null, TS.model.dnd.next_dnd_end_ts = null), e.dnd.snooze_enabled && (TS.model.dnd.snooze_enabled = e.dnd.snooze_enabled), e.dnd.snooze_endtime && (TS.model.dnd.snooze_endtime = e.dnd.snooze_endtime)), !TS._incremental_boot) {
              var O = e.ims.concat(e.mpims || [], e.groups || []);
              return TS.members.ensureMembersArePresentInSharedModelObs(O).then(function() {
                if (!k(!0)) {
                  if (parseInt(n.cache_ts, 10)) return G("!doAllMembersFromChannelsInRawDataExist(with_shared=true)", f.join("\n")), void o(Error("called _onBadUserCache"));
                  TS.logError({
                    message: f.join("\n")
                  }, "doAllMembersFromChannelsInRawDataExist(with_shared=true) failed");
                }
                C(), a();
              }, function(e) {
                o(Error("could not fetch all external members: " + (e && e.message)));
              });
            }
            C(), a();
          });
        },
        G = function(e) {
          TS.error("_onBadUserCache problem: " + e), TS.storage.cleanOutCacheTsStorage(), TS.model.had_bad_user_cache = !0, TS.isSocketManagerEnabled() ? (TS.error("_onBadUserCache problem: " + e), TS.interop.SocketManager.disconnect()) : TS.ms.onFailure("_onBadUserCache problem: " + e);
        },
        V = function(e) {
          if (e.test && !e.__esModule && u()) delete e.test;
          else if ("function" == typeof e.test) {
            var n = e.test;
            Object.defineProperty(e, "test", {
              get: n
            });
          }
        };
      V(TS);
      var H, J = function() {
          return !(!TS.boot_data.feature_lazy_load_members_and_bots_everywhere || TS.boot_data.no_login) || !!(TS.client || TS.web && TS.boot_data.page_has_ms);
        },
        K = function() {
          return TS.boot_data.feature_automated_perfectrics && TS.client ? TS.client.traces.maybeTrace(10, {
            reason: "automated"
          }) : Promise.resolve();
        },
        Q = function() {
          var e = !1,
            n = function() {
              TS.info("sleep event!"), e = !0, TS.client && (TS.isSocketManagerEnabled() ? TS.interop.SocketManager.sleep() : TS.ms.sleep()), TS.web && TS.web.space && TS.ds.sleep();
            },
            a = function() {
              e && (e = !1, TS.info("wake event! version:" + TS.boot_data.version_ts + " start_ms:" + TS.boot_data.start_ms), TS.client && (TS.isSocketManagerEnabled() ? TS.interop.SocketManager.wake() : TS.ms.wake()), TS.web && TS.web.space && TS.ds.wake());
            };
          window.addEventListener("sleep", n, !1), window.addEventListener("wake", a, !1);
        },
        Y = 1989,
        X = 1996,
        ee = 481,
        ne = function() {
          if (!H) {
            H = !0, TS.metrics.count("rate_limit_dialog_shown");
            var e = TS.generic_dialog.alert("Lots of your teammates are connecting to Slack right now, so it’s taking longer than usual. We’re really sorry about this, and we’ll have you online soon.", "Bear with us", "Dismiss"),
              n = function() {
                e.isPending() && TS.generic_dialog.cancel(), H = !1;
              };
            TS.isSocketManagerEnabled() ? TS.interop.SocketManager.connectedSig.addOnce(n) : TS.ms.connected_sig.addOnce(n);
          }
        };
    }();
  },
  2523: function(e, n) {
    "function" == typeof Symbol && Symbol.iterator;
    ! function() {
      "use strict";
      TS.registerModule("ssb", {
        teams_did_load_sig: new signals.Signal,
        onStart: function() {
          TS.files && TS.files.team_file_deleted_sig.add(o);
        },
        openNewFileWindow: function(e, n, o) {
          if (r && TS.log(r, "TS.ssb.openNewFileWindow url: " + n), TS.client) return TS.client.windows.openFileWindow(e.id, o);
          if (window.is_in_ssb) {
            if (TS.ssb.upsertFileInSSBParentWin(e), document.ssb_main) return !document.ssb_main.TS || document.ssb_main.TS.client.windows.openFileWindow(e.id, n);
            if (window.winssb && window.opener && window.opener.executeJavaScript) return r && TS.log(r, "calling _executeInAtomSSBParentWin for TS.client.windows.openFileWindow"), t("TS.client.windows.openFileWindow(" + a(e.id) + ", " + a(n) + ");"), !0;
          }
          return !1;
        },
        closeWindow: function() {
          return !!window.is_in_ssb && (window.close(), !0);
        },
        setUpAtomSSBWin: function(e) {
          i(e, "window.is_in_ssb = true;"), TS.shouldLog(438) && !e._has_console && (e._has_console = 1);
        },
        upsertFileInSSBParentWin: function(e) {
          TS.web && (document.ssb_main ? document.ssb_main.TS && document.ssb_main.TS.files.upsertAndSignal(e) : window.winssb && window.opener && window.opener.executeJavaScript && (r && TS.log(r, "calling _executeInAtomSSBParentWin for TS.files.upsertAndSignal"), t("TS.files.upsertAndSignal(" + n(e) + ");")));
        },
        toggleMuteInWin: function(n, a, o) {
          if (r && TS.log(r, "toggleMuteInWin called with token: " + n), TS.client) {
            var t = TS.client.windows.getWinByToken(n);
            if (!t) return void TS.error("toggleMuteInWin called with bad token: " + n);
            if (window.macgap) {
              var s, l;
              try {
                s = t.window.toggleMute(a);
              } catch (e) {
                TS.error("error calling macgap win.window.toggleMute"), TS.error(e), l = e;
              }
              o && setTimeout(o, 0, l, s);
            } else i(t, "window.toggleMute(" + e(a) + ");", o);
          }
        },
        teamsDidLoad: function() {
          TS.ssb.teams_did_load_sig.dispatch();
        },
        distributeMsgToWin: function(e, a) {
          if (r && TS.log(r, "distributeMsgToWin called with token: " + e), TS.client) {
            var o = TS.client.windows.getWinByToken(e);
            if (!o) return void TS.error("distributeMsgToWin called with bad token: " + e);
            if (window.macgap) try {
              o && o.window && o.window.TS && o.window.TS.ms && o.window.TS.ms.msg_handlers ? o.window.TS.ms.msg_handlers.msgReceivedFromParentWindow(a) : r && TS.maybeWarn(r, "distributeMsgToWin win.window not ready! token: " + e);
            } catch (e) {
              TS.error("error calling macgap win.window.TS.ms.msg_handlers.msgReceivedFromParentWindow"), TS.error(e);
            } else i(o, "TS.ms.msg_handlers.msgReceivedFromParentWindow(" + n(a) + ");");
          }
        }
      });
      var e = function(e) {
          return (!!e).toString();
        },
        n = function(e) {
          return "JSON.parse('" + JSON.stringify(e || null) + "')";
        },
        a = function(e) {
          return e = String(e), '"' + (e = e.replace(/"/g, '\\"')) + '"';
        },
        o = function(e) {
          if (e && TS.client) {
            var n = TS.client.windows.getWinByProp("file_id", e.id);
            n && setTimeout(function() {
              if (window.macgap) try {
                n.window.TS.files.team_file_deleted_sig.dispatch(e);
              } catch (e) {} else i(n, "window.TS.files.team_file_deleted_sig.dispatch(TS.files.getFileById(" + a(e.id) + "));");
            }, 1e3);
          }
        },
        t = function(e, n) {
          return TSSSB.call("executeJavaScriptInParentWindow", {
            code: e,
            callback: n
          });
        },
        i = function(e, n, a) {
          return TSSSB.call("executeJavaScriptInWindow", {
            window_token: e.token,
            code: n,
            callback: a
          });
        },
        r = 438;
    }();
  },
  2525: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("statsd", {
        onStart: function() {
          var e = Math.floor(5e3 * Math.random());
          setInterval(o, 3e4 + e), $(window).on("beforeunload", o);
        },
        count: function(e, n) {
          _.isUndefined(n) && (n = 1), a(e, "count", n);
        },
        timing: function(e, n) {
          a(e, "timing", n);
        },
        flush: function() {
          o();
        },
        mark: function(e) {
          TS.metrics.mark(e);
        },
        clearMarks: function(e) {
          TS.metrics.clearMarks(e);
        },
        measure: function(e, n, a) {
          var o = TS.metrics.measure(e, n, a, {
            ephemeral: !0
          });
          if (!_.isNaN(o) && !_.isUndefined(o)) return TS.statsd.timing(e, o), o;
        },
        measureAndClear: function(e, n) {
          var a = TS.statsd.measure(e, n);
          return TS.statsd.clearMarks(n), a;
        },
        test: function() {
          var e = {
            getStats: function() {
              return n;
            },
            reset: function() {
              n = [];
            }
          };
          return Object.defineProperty(e, "_record", {
            get: function() {
              return a;
            },
            set: function(e) {
              a = e;
            }
          }), Object.defineProperty(e, "_sendDataAndEmptyQueue", {
            get: function() {
              return o;
            },
            set: function(e) {
              o = e;
            }
          }), e;
        }
      });
      var e, n = [],
        a = function(e, a, o) {
          var t;
          if ("count" === a) t = " (count)", o = _.round(o, 0);
          else {
            if ("timing" !== a) return void TS.error("TS.statsd._record called with invalid type: " + a);
            t = "ms", o = _.round(o, 3);
          }
          i(e) && TS.info("[STATSD " + a.toUpperCase() + "] " + e + ": " + o + t), n.push({
            stat: e,
            type: a,
            value: o
          });
        },
        o = function() {
          if (n.length) {
            var e = [],
              a = [],
              o = "",
              r = function(e) {
                return t() + "?stats=" + encodeURIComponent(JSON.stringify(e));
              };
            n.forEach(function(n) {
              a.push(n), o = r(a), o.length > 2e3 && (a.pop(), e.push(r(a)), a = [n]);
            }), e.push(r(a)), e.forEach(function(e) {
              (new Image).src = e;
            }), i() && TS.info("[STATSD] Sending data: " + JSON.stringify(n)), n = [];
          }
        },
        t = function() {
          return e || (e = TS.environment.is_dev ? "https://" + location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/)[2] + "/beacon/statsd" : location.host.match(/staging.slack.com/) ? "https://staging.slack.com/beacon/statsd" : "https://slack.com/beacon/statsd");
        },
        i = function(e) {
          return e ? TS.qs_args.log_timings || TS.qs_args.log_timing === e || !0 === TS.statsd.log || TS.statsd.log === e || TS.statsd.log instanceof Array && -1 !== TS.statsd.log.indexOf(e) : TS.qs_args.log_timings || !0 === TS.statsd.log;
        };
    }();
  },
  2611: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("ui.file_share", {
        handleDraghoverstartFromWinSSB: function() {
          $(window).trigger("draghoverstart", [null, !0]);
        },
        handleDraghoverendFromWinSSB: function() {
          $(window).trigger("draghoverend");
        },
        handleDropFromWinSSB: function(e) {
          if (TS.info("handleDropFromWinSSB called files:" + e), $("body").removeClass("drop-target"), !TS.client.ui.checkForEditing()) return e && e.length ? void TS.client.ui.files.validateFiles(e, TS.model.shift_key_pressed) : void TS.warn("handleDropFromWinSSB called with no files");
        },
        preselected: [],
        bindFileShareDropdowns: function(t, i, r, s) {
          var l = $("#select_share_channels"),
            c = "60%";
          if (TS.web && TS.web.space && (c = "100%"), 1 != l.length) return void alert("error: " + l.length + " $('#select_share_channels')s");
          TS.ui.file_share.preselected = r || [], n = i;
          var d = TS.ui.file_share.promiseToGetFileShareSelectOptions;
          s && (d = o), e = {
            append: !0,
            single: !0,
            data_promise: d,
            approx_item_height: 30,
            tab_to_nav: !0,
            template: function(e) {
              return new Handlebars.SafeString(TS.templates.file_sharing_channel_row({
                item: e.model_ob,
                show_share_prefix: t
              }));
            },
            onItemAdded: a,
            onListHidden: function() {
              $("#select_share_channels .lfs_list_container").removeClass("new_channel_container");
            },
            renderDividerFunc: function(e, n) {
              if (n.create_channel) return e.html(TS.i18n.t('<span class="new">No items matched <strong>{query}</strong></span>', "files")({
                query: _.escape(n.label)
              })), void $("#select_share_channels .lfs_list_container").addClass("new_channel_container");
              $("#select_share_channels .lfs_list_container").removeClass("new_channel_container"), e.html(_.escape(n.label)).removeClass("new_channel_not_found");
            },
            setValue: function(e) {
              var n, a, o, t = this.data.length;
              for (n = 0; n < t; n += 1)
                for (o = this.data[n].children.length, a = 0; a < o; a += 1)
                  if (this.data[n].children[a].model_ob.id === e) return void this.$container.find('.lfs_item[data-lfs-id="' + [n, a] + '"]').trigger("click");
            }
          }, l.lazyFilterSelect(e), l.css({
            width: c
          }), l.one("remove", function() {
            $(this).lazyFilterSelect("destroy");
          }), $("#file_sharing_div").on("keydown", function(e) {
            13 == e.keyCode && e.stopPropagation();
          }), l.lazyFilterSelect("getInstance").current_items_in_view_signal.add(function(e) {
            var n = e.filter(function(e) {
              return e.model_ob && Object.prototype.hasOwnProperty.call(e.model_ob, "presence");
            }).map(function(e) {
              return e.model_ob.id;
            });
            TS.presence_manager.queryMemberPresence(n);
          });
        },
        promiseToGetFileShareSelectOptions: function(e) {
          var n = t();
          return TS.searcher.search(e, {
            members: {
              include_self: !0
            },
            channels: {
              include_archived: !1,
              can_post: !0
            },
            groups: {
              include_archived: !1
            },
            mpims: !0,
            sort: {
              allow_empty_query: !0
            }
          }).then(function(a) {
            var o = !1;
            if (a.all_items_fetched = !0, a.filter(function(e) {
                return TS.permissions.members.canPostInChannel(e.model_ob);
              }).forEach(function(e) {
                e.lfs_id = e.model_ob.id, e.preselected = i(e.model_ob.id, n), e.preselected && (o = !0);
              }), !e && !o && n) {
              var t = TS.shared.getModelObById(n);
              if (_.get(t, "is_im")) {
                var r = TS.members.getMemberById(t.user);
                a.push({
                  preselected: !0,
                  lfs_id: r.id,
                  model_ob: r
                });
              } else t && TS.permissions.members.canPostInChannel(t) && a.push({
                preselected: !0,
                lfs_id: t.id,
                model_ob: t
              });
            }
            var s = _(a).map("model_ob").filter(TS.utility.members.isMember).map("id").compact().value();
            return TS.presence_manager.queryMemberPresence(s), a;
          });
        },
        bindFileShareShareToggle: function() {
          $("#share_cb").bind("click.toggle_select_list", function() {
            $(this).prop("checked") ? $(".file_share_select").prop("disabled", !1) : $(".file_share_select").prop("disabled", !0), TS.ui.file_share.updateAtChannelWarningNote(), TS.ui.file_share.updateAtChannelBlockedNote();
          });
        },
        bindFileShareCommentField: function() {
          $("#file_comment_textarea").bind("keyup", function() {
            TS.ui.file_share.updateAtChannelWarningNote(), TS.ui.file_share.updateAtChannelBlockedNote();
          });
        },
        updateAtChannelWarningNote: function(e) {
          var n, a, o = TS.utility.contenteditable.value($("#file_comment_textarea")),
            t = $("#select_share_channels").lazyFilterSelect("value")[0];
          t && (n = t.model_ob.id || "");
          var i = $("#select_share_at_channel_note");
          if (TS.ui.needToShowAtChannelWarning(n, o)) {
            var r = TS.format.cleanMsg(o),
              s = "",
              l = !0;
            TS.model.everyone_regex.test(r) ? s = "everyone" : TS.model.channel_regex.test(r) ? s = "channel" : TS.model.group_regex.test(r) && (s = "group");
            var c = TS.shared.getModelObById(n);
            if (c && !c.is_im || (l = !1), l && !TS.members.haveAllMembersForModelOb(c) && !e)
              if (TS.membership && TS.membership.lazyLoadChannelMembership()) {
                var d = TS.membership.getMembershipCounts(c);
                d.promise ? (a = 0, d.promise.then(TS.ui.file_share.updateAtChannelWarningNote), l = !1) : (a = _.get(d, "counts.member_count", 1), a -= 1);
              } else TS.log(1989, "Flannel: need to fetch all members in " + c.id + " to see if we have to show at-channel dialog"), TS.flannel.fetchAndUpsertAllMembersForModelObDeprecated(c).then(function() {
                if (TS.generic_dialog.is_showing && TS.generic_dialog.div.find("#select_share_channels").length) {
                  var e = $("#select_share_channels").lazyFilterSelect("value")[0];
                  if (_.get(e, "model_ob.id") == n) {
                    TS.ui.file_share.updateAtChannelWarningNote(!0);
                  }
                }
              }).catch(_.noop), l = !1;
            var m = [];
            if (_.isUndefined(a) && l && c && !c.is_im && (m = _(c.members).map(TS.members.getMemberById).compact().filter(TS.utility.members.isMemberNonBotNonDeletedNonSelf).sortBy(TS.members.memberSorterByName).value(), m.length < 1 && (l = !1)), l) {
              var u = TS.templates.at_channel_warning_note({
                keyword: s,
                member_count: _.isUndefined(a) ? m.length : a
              });
              return i.html(u), void i.removeClass("hidden");
            }
          }
          i.addClass("hidden");
        },
        updateAtChannelBlockedNote: function() {
          var e, n = TS.utility.contenteditable.value($("#file_comment_textarea")),
            a = $("#select_share_channels").lazyFilterSelect("value")[0],
            o = $("#share_cb"),
            t = 0 === o.length || o.is(":checked");
          a && t && (e = a.model_ob.id);
          var i = $("#select_share_at_channel_blocked_note"),
            r = $(".modal .btn.dialog_go"),
            s = TS.ui.needToBlockAtChannelKeyword(n, null, e);
          s ? (i.html(TS.templates.at_channel_blocked_note({
            keyword: s
          })), i.removeClass("hidden"), r.addClass("disabled")) : (i.addClass("hidden"), r.removeClass("disabled"));
        },
        shouldBlockUploadDialogSubmission: function() {
          var e, n = TS.utility.contenteditable.value($("#file_comment_textarea")),
            a = $("#select_share_channels").lazyFilterSelect("value")[0],
            o = $("#share_cb"),
            t = 0 === o.length || o.is(":checked");
          a && t && (e = a.model_ob.id);
          var i = TS.ui.needToBlockAtChannelKeyword(n, null, e);
          return !!i && (TS.info("Can't submit dialog because comment contains " + i), !0);
        },
        fileShowPublicUrlDialog: function(e) {
          if (e && e.public_url_shared) {
            var n, a = $('<input type="text" id="public_url" class="full_width small">').attr("value", e.permalink_public)[0].outerHTML;
            n = TS.boot_data.feature_external_files ? TS.i18n.t('External link to this file <p style="display: inline-block;font-weight: 400"> (shareable with anyone) </p>', "files")() : TS.i18n.t("Public link to this file", "files")(), TS.generic_dialog.start({
              title: n,
              body: a,
              show_cancel_button: !1,
              show_close_button: !0,
              show_secondary_go_button: !0,
              secondary_go_button_class: "btn_outline",
              secondary_go_button_text: TS.i18n.t("Revoke", "files")(),
              show_go_button: !0,
              go_button_text: TS.i18n.t("Done", "files")(),
              esc_for_ok: !0,
              onSecondaryGo: function() {
                TS.ui.file_share.fileRevokePublicLink(e.id);
              },
              onGo: function() {
                TS.generic_dialog.cancel();
              },
              onShow: function() {
                TS.generic_dialog.div.on("shown", function e() {
                  TS.generic_dialog.div.off("shown", e), $("#public_url").select().focus().on("keydown", function(e) {
                    e.which == TS.utility.keymap.esc && TS.generic_dialog.cancel();
                  });
                });
              }
            });
          }
        },
        fileRevokePublicLink: function(e) {
          var n = TS.files.getFileById(e);
          if (!n) return !1;
          var a, o;
          TS.boot_data.feature_external_files ? (a = TS.i18n.t("Revoke external file link", "files")(), o = '<p class="no_bottom_margin">' + TS.i18n.t("This will disable the external link for this file. Any previously shared links will stop working.<br /><br />Are you sure you want to revoke this link?", "files")() + "</p>") : (a = TS.i18n.t("Revoke public file link", "files")(), o = '<p class="no_bottom_margin">' + TS.i18n.t("This will disable the Public Link for this file. This will cause any previously shared links to stop working.<br /><br />Are you sure you want to revoke this public link?", "files")() + "</p>"), TS.generic_dialog.start({
            title: a,
            body: o,
            go_button_text: TS.i18n.t("Revoke it", "files")(),
            go_button_class: "btn_warning",
            onGo: function() {
              TS.files.upsertAndSignal({
                id: n.id,
                public_url_shared: !1
              }), TS.api.callImmediately("files.revokePublicURL", {
                file: n.id
              });
            }
          });
        }
      });
      var e = {},
        n = !1,
        a = function(e) {
          if ($("#select_share_channels .lfs_input_container").removeClass("error"), e.model_ob.create_channel) return $("#select_share_channels_note").removeClass("hidden"), $("#select_share_channels .lfs_value .lfs_item").addClass("new_channel_item"), $(".modal .dialog_go").text(TS.i18n.t("Next", "files")()), void TS.metrics.count("share_picker_create_clicked");
          $("#select_share_channels .lfs_value .lfs_item").removeClass("new_channel_item"), $(".modal .dialog_go").text(TS.i18n.t("Share", "files")());
          var n, a;
          if (n = e.model_ob.id) {
            if ($("#share_model_ob_id").val(n), $("#select_share_groups_note, #select_share_channels_note, #select_share_ims_note, #select_share_mpims_note, #select_share_channels_join_note").addClass("hidden"), "C" === (a = n.substring(0, 1))) {
              $("#select_share_channels_note").removeClass("hidden"), $("#share_context_label").text(TS.i18n.t("Share in", "files")());
              var o = TS.shared.getModelObById(n);
              o && !o.is_member && $("#select_share_channels_join_note").removeClass("hidden");
            } else "U" === a || "W" === a || "D" === a ? ($("#select_share_ims_note").removeClass("hidden"), $("#share_context_label").text(TS.i18n.t("Share with", "files")())) : e && e.model_ob && e.model_ob.is_mpim ? ($("#select_share_mpims_note").removeClass("hidden"), $("#share_context_label").text(TS.i18n.t("Share with", "files")())) : ($("#select_share_groups_note").removeClass("hidden"), $("#share_context_label").text(TS.i18n.t("Share in", "files")()));
            $("#share_cb").prop("checked", !0), TS.ui.file_share.updateAtChannelWarningNote(), TS.ui.file_share.updateAtChannelBlockedNote();
          }
        },
        o = function(e) {
          return TS.ui.file_share.promiseToGetFileShareSelectOptions(e).then(function(n) {
            if ($("#select_share_channels .lfs_list_container").removeClass("new_channel_container"), 0 === n.length) {
              var a = TS.utility.channels.getPermissibleChannelName(e);
              a && (n.push({
                lfs_group: !0,
                label: e,
                create_channel: !0,
                children: [{
                  lfs_id: "c." + a,
                  model_ob: {
                    create_channel: !0,
                    name: a
                  }
                }]
              }), $("#select_share_channels .lfs_list_container").addClass("new_channel_container"), TS.metrics.count("share_picker_create_shown"));
            }
            return n;
          });
        },
        t = function() {
          if (TS.client && TS.client.activeChannelIsHidden()) {
            if (n) return n.id;
          } else {
            var e = TS.shared.getActiveModelOb();
            if (e) return e.id;
          }
          return TS.web && TS.web.space ? TS.web.space.getOriginChannel() : null;
        },
        i = function(e, n) {
          return TS.ui.file_share.preselected.length ? TS.ui.file_share.preselected.indexOf(e) > -1 : e === n;
        };
    }();
  },
  2645: function(e, n) {
    ! function() {
      "use strict";
      TS.registerModule("ui", {
        window_focus_changed_sig: new signals.Signal,
        window_unloaded_sig: new signals.Signal,
        onStart: function() {
          $(window).bind("focus", TS.ui.onWindowFocus), $(window).bind("blur", TS.ui.onWindowBlur), a(), $("html").bind("mousedown", function() {
            TS.ui.onWindowFocus({
              target: window
            });
          }), !(document.hasFocus && document.hasFocus() && window.macgap_is_in_active_space) ? TS.ui.onWindowBlur({
            target: window
          }) : TS.ui.onWindowFocus({
            target: window
          }), TS.model.win_ssb_version && $("body").addClass("winssb"), t();
        },
        setUpWindowUnloadHandlers: function() {
          window.macgap ? window.onbeforeunload = TS.ui.onWindowUnload : void 0 !== window.addEventListener ? window.addEventListener("beforeunload", TS.ui.onWindowUnload, !1) : void 0 !== document.addEventListener ? document.addEventListener("beforeunload", TS.ui.onWindowUnload, !1) : void 0 !== window.attachEvent ? window.attachEvent("onbeforeunload", TS.ui.onWindowUnload) : "function" == typeof window.onbeforeunload ? window.onbeforeunload = function() {
            return TS.ui.onWindowUnload(), !1;
          } : window.onbeforeunload = TS.ui.onWindowUnload;
        },
        onWindowUnload: function() {
          TS.client && TS.client.markLastReadsWithAPI(), TS.model.window_unloading = !0, TS.ui.window_unloaded_sig.dispatch(), (TS.useRedux() || TS.useReactDownloads()) && TS.redux.dispatch(TS.interop.redux.entities.window.setUnloading(!0));
        },
        maybeTickleMS: function() {
          TS.client && TS.client.ui.maybeTickleMS();
        },
        handleDraghoverstartFromWinSSB: function() {
          TS.ui.file_share.handleDraghoverstartFromWinSSB();
        },
        handleDraghoverendFromWinSSB: function() {
          TS.ui.file_share.handleDraghoverendFromWinSSB();
        },
        handleDropFromWinSSB: function(e) {
          TS.ui.file_share.handleDropFromWinSSB(e);
        },
        onMacSpaceChanged: function(e) {
          e ? document.hasFocus() && TS.ui.onWindowFocus({
            target: window
          }) : TS.ui.onWindowBlur({
            target: window
          });
        },
        onWindowFocus: function(e) {
          e.target !== window && e.target !== document || TS.model.ui.is_window_focused || (TS.model.shift_key_pressed = !1, TS.model.insert_key_pressed = !1, TS.model.ui.is_window_focused = !0, TS.view && TS.view.updateTitleBarColor(), TS.ui.window_focus_changed_sig.dispatch(!0), (TS.useRedux() || TS.useReactDownloads()) && TS.redux.dispatch(TS.interop.redux.entities.window.updateFocus(!0)));
        },
        onWindowBlur: function(e) {
          e.target !== window && e.target !== document || TS.model.ui.is_window_focused && (TS.model.shift_key_pressed = !1, TS.model.insert_key_pressed = !1, TS.model.ui.is_window_focused = !1, TS.ui.window_focus_changed_sig.dispatch(!1), (TS.useRedux() || TS.useReactDownloads()) && TS.redux.dispatch(TS.interop.redux.entities.window.updateFocus(!1)));
        },
        onWindowVisibilityChange: function(e) {
          "hidden" === document.visibilityState ? TS.ui.onWindowBlur(e) : "visible" === document.visibilityState && TS.ui.onWindowFocus(e);
        },
        needToShowAtChannelWarning: function(e, n) {
          var a, o = TS.format.cleanMsg(n),
            t = TS.model.everyone_regex.test(o),
            i = TS.model.channel_regex.test(o),
            r = TS.model.group_regex.test(o),
            s = !!TS.model.prefs.last_seen_at_channel_warning,
            l = new Date(TS.model.prefs.last_seen_at_channel_warning),
            c = s && TS.interop.datetime.isSameDay(l, new Date);
          return !!(t || i || r) && (!(!(a = TS.shared.getModelObById(e)) || a.is_im) && (!((i || r) && !TS.permissions.members.canAtChannelOrGroup(a.id)) && (!(a.is_general && t && !TS.permissions.members.canAtMentionEveryone(a.id)) && ("never" !== TS.model.team.prefs.warn_before_at_channel && (("once" !== TS.model.team.prefs.warn_before_at_channel || !s) && ("daily" !== TS.model.team.prefs.warn_before_at_channel || !c))))));
        },
        needToBlockAtChannelKeyword: function(e, n, a) {
          var o = TS.format.cleanMsg(e),
            t = a && TS.shared.getModelObById(a);
          if (!(t && !t.is_im && !t.is_mpim || n && (n.channels.length || n.groups.length))) return !1;
          var i = TS.model.everyone_regex.test(o),
            r = TS.model.here_regex.test(o),
            s = TS.model.channel_regex.test(o),
            l = TS.model.group_regex.test(o),
            c = !1;
          if (t) c = !!t.is_general;
          else if (n && 0 === n.groups.length && 1 === n.channels.length) {
            var _ = TS.channels.getChannelById(n.channels[0]);
            c = !!_.is_general;
          }
          if (c && i && !r && !s && !l && TS.permissions.members.canAtMentionEveryone(a)) return !1;
          if (!TS.permissions.members.canAtChannelOrGroup(a)) {
            if (r) return "@here";
            if (s) return "@channel";
            if (l) return "@group";
            if (i) return "@everyone";
          }
          var d = t && t.is_general;
          return !d && n && n.channels && n.channels.forEach(function(e) {
            var n = TS.channels.getChannelById(e);
            n && n.is_general && (d = !0);
          }), !(!d || TS.permissions.members.canAtMentionEveryone(a) || !(i || r || l || s)) && "@everyone";
        },
        startButtonSpinner: function(e) {
          TS.ui.resetButtonSpinner(e);
          var n = o(e);
          n.isLoading() || n.start();
        },
        stopButtonSpinner: function(e, n) {
          var a = o(e);
          if (a.isLoading() && (a.stop(), n)) {
            var t = $(e).find(".ladda-label").text();
            $(e).data("original_text", t), $(e).removeClass("").addClass("btn_success").find(".ladda-label").html('<i class="ts_icon ts_icon_check_circle_o small_right_margin"></i>' + TS.i18n.t("Saved", "ui")());
          }
        },
        resetButtonSpinner: function(e) {
          if (!o(e).isLoading()) {
            var n = $(e).data("original_text");
            n && ($(e).find(".ladda-label").text(n), $(e).removeData("original_text"), $(e).removeClass("btn_success").addClass(""));
          }
        },
        showVersionInfo: function() {
          var e = new Date(1e3 * TS.boot_data.version_ts) + " (<b>" + TS.boot_data.version_ts + "</b>)";
          TS.generic_dialog.start({
            title: TS.i18n.t("Version Info", "ui")(),
            unique: "version_info",
            body: TS.i18n.t('<p>This version: {version_num}</p><p class="latest_version checking">Checking for updates&hellip;</p>', "ui")({
              version_num: e
            }),
            show_cancel_button: !1,
            go_button_class: "btn_outline",
            go_button_text: TS.i18n.t("Close", "ui")(),
            show_secondary_go_button: !1,
            onSecondaryGo: function() {
              TS.reload(!1, "TS.ui.showVersionsInfo dialog");
            }
          }), TS.api.callImmediately("test.versionInfo").then(function(e) {
            if (TS.generic_dialog.is_showing && "version_info" == TS.generic_dialog.current_setting.unique) {
              var n = TS.generic_dialog.div.find(".latest_version");
              n.removeClass("checking");
              if (e.data.version_ts.toString() == TS.boot_data.version_ts.toString()) n.html(TS.i18n.t("Your copy of Slack is up-to-date! {tada_emoji}", "ui")({
                tada_emoji: TS.emoji.graphicReplace(":tada:")
              }));
              else {
                TS.generic_dialog.div.find(".btn.dialog_secondary_go").removeClass("hidden").text("Update");
                e.data.min_version_ts > TS.boot_data.version_ts ? n.html(TS.i18n.t("An important new version of Slack is available. {sparkles_emoji}", "ui")({
                  sparkles_emoji: TS.emoji.graphicReplace(":sparkles:")
                })) : n.html(TS.i18n.t("A newer version of Slack is available. {sparkles_emoji}", "ui")({
                  sparkles_emoji: TS.emoji.graphicReplace(":sparkles:")
                }));
              }
            }
          }).catch(_.noop);
        },
        setThemeClasses: function() {
          if ($("body").removeClass("dense_theme light_theme"), "dense" === TS.model.prefs.theme) $("body").addClass("dense_theme");
          else {
            if ("light" !== TS.model.prefs.theme) return void TS.error("no theme?");
            $("body").addClass("light_theme");
          }
          TS.model.prefs.avatars ? $("body").removeClass("no_avatars") : $("body").addClass("no_avatars");
        }
      });
      var e, n, a = function() {
          void 0 !== document.hidden ? (n = "hidden", e = "visibilitychange") : void 0 !== document.msHidden ? (n = "msHidden", e = "msvisibilitychange") : void 0 !== document.webkitHidden && (n = "webkitHidden", e = "webkitvisibilitychange"), void 0 !== document[n] && $(window).bind(e, TS.ui.onWindowVisibilityChange);
        },
        o = function(e) {
          var n = $(e).data("ladda");
          return n || (n = Ladda.create(e), $(e).data("ladda", n)), n;
        },
        t = function() {
          $("body").on("click.plastic_date", 'input[type="text"][data-plastic-type="date"]', function(e) {
            var n = $(e.target);
            if (n.pickmeup) {
              var a = !!n.closest("#fs_modal").length || $(this).data("flat");
              if (n.pickmeup({
                  flat: a,
                  first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
                  hide_on_select: !0,
                  min: $(this).data("min") || null,
                  max: $(this).data("max") || null,
                  format: $(this).data("format") || "Y-m-d",
                  class_name: "plastic_date_picker",
                  hide: function() {
                    n.trigger("input");
                  },
                  locale: {
                    days: TS.utility.date.day_names,
                    daysShort: TS.utility.date.short_day_names,
                    daysMin: TS.utility.date.really_short_day_names,
                    months: TS.utility.date.month_names,
                    monthsShort: TS.utility.date.short_month_names
                  }
                }).pickmeup("show"), a) {
                var o = n.data("picker");
                o || (o = $('<div class="position_relative no_margin no_padding"></div>'), n.data("picker", o)), n.after(o.append(n.find(".pickmeup").detach()));
              }
            }
          }).on("keydown.plastic_date", 'input[type="text"][data-plastic-type="date"]', function(e) {
            var n = $(e.target);
            n.pickmeup && window.document.activeElement === e.target && n.pickmeup("hide");
          });
        };
    }();
  }
}, [1463]);
