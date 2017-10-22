webpackJsonp([307], {
  190: function(e, r) {
    (function() {
      TS.registerModule("i18n", {
        onStart: function e() {
          g();
          p();
          U();
          if (TS.prefs) TS.prefs.keyboard_changed_sig.add(E);
          if (window.signals) TS.i18n.keyboard_changed_sig = new signals.Signal;
          else TS.i18n.keyboard_changed_sig = {
            add: function e() {},
            remove: function e() {},
            dispatch: function e() {}
          };
        },
        locale: function e() {
          g();
          return n;
        },
        keyboard: function e() {
          return v();
        },
        canAutoGetKeyboard: function e() {
          if (void 0 !== s) return s;
          s = TS.model && TS.model.is_our_app && desktop && desktop.app && desktop.app.getLocaleInformation && desktop.app.getLocaleInformation().currentKeyboardLayout;
          return s;
        },
        supportedKeyboards: function e() {
          return f;
        },
        getDefaultLocale: function e() {
          return TS.interop.I18n.DEFAULT_LOCALE;
        },
        localesEnabled: function e() {
          var r = {};
          r["de-DE"] = "Deutsch";
          r["en-US"] = "English (US)";
          r["es-ES"] = "Español";
          r["fr-FR"] = "Français";
          if (TS.boot_data.feature_locale_ja_JP) r["ja-JP"] = "日本語";
          if (TS.boot_data.feature_pseudo_locale) r.pseudo = "Þsèúδôtřáñsℓátïôñ";
          return r;
        },
        localeOrPseudo: function e() {
          if (a) return "pseudo";
          return TS.i18n.locale();
        },
        isLocaleCJK: function e() {
          return "ja-JP" === TS.i18n.locale();
        },
        zdLocale: function e() {
          g();
          var r = TS.interop.I18n.DEFAULT_LOCALE.toLowerCase();
          if (c && c[n.toLowerCase()]) r = c[n.toLowerCase()];
          return r;
        },
        t: function e(o, s) {
          g();
          if (!s && r) {
            var i = TS.error ? TS.error : console.error;
            i.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + s + ".");
            return function() {
              return "";
            };
          }
          var c = n + ":" + s + ":" + o;
          if (void 0 === u[c]) {
            if (a || "pseudo" === n) u[c] = new MessageFormat(n, P(o)).format;
            else {
              if (r && s && window.sha1 && window.tsTranslations && window.tsTranslations[s]) {
                o = window.tsTranslations[s][window.sha1(o)] || o;
                o = o.replace(/\[{3}/g, '<span class="no_wrap">').replace(/\]{3}/g, "</span>");
              }
              u[c] = new MessageFormat(n, o).format;
            }
            if (r && t) u[c].toString = F(c, s);
          }
          return u[c];
        },
        number: function e(r, t) {
          if (isNaN(r)) return NaN;
          g();
          return Intl.NumberFormat(n, t).format(r);
        },
        percent: function e(r, t) {
          g();
          return Intl.NumberFormat(n, {
            style: "percent",
            maximumFractionDigits: t
          }).format(r);
        },
        sorter: function e(r, t) {
          g();
          if (!r || !t) return !r ? -1 : 1;
          if (i) return i.compare(r, t);
          return r.localeCompare(t);
        },
        mappedSorter: function e(r) {
          return function(e, t) {
            if (!e || !t) return !e ? -1 : 1;
            var a = ("" + r).split(".");
            if (a.length > 1) a.forEach(function(r) {
              e = e[r];
              t = t[r];
            });
            else {
              e = e[r];
              t = t[r];
            }
            return TS.i18n.sorter(e, t);
          };
        },
        possessive: function e(r) {
          g();
          if (!r) r = "";
          switch (TS.i18n.locale()) {
            case "fr-FR":
              var t = _.deburr(r);
              return t.match(/^[aeiouy]/i) ? "d’" : "de ";
            case "es-ES":
              return "de ";
            case "de-DE":
              return r.match(/[sßxz]$/i) ? "’" : "s";
            case "ja-JP":
              return "の";
            default:
              return "’s";
          }
        },
        fullPossessiveString: function e(r) {
          g();
          switch (TS.i18n.locale()) {
            case "es-ES":
            case "fr-FR":
              return TS.i18n.possessive(r) + r;
            default:
              return r + TS.i18n.possessive(r);
          }
        },
        listify: function e(r, t) {
          g();
          var a;
          var o = [];
          var s = r.length;
          var i = t && "or" === t.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
          var u = s > 2 ? "," : "";
          var c = t && t.strong ? "<strong>" : "";
          var l = t && t.strong ? "</strong>" : "";
          var f = t && t.no_escape;
          var d = t && t.item_prefix ? t.item_prefix : "";
          switch (n) {
            case "ja-JP":
              a = ", ";
              break;
            case "en-US":
              a = u + " " + i + " ";
              break;
            default:
              a = " " + i + " ";
          }
          r.forEach(function(e, r) {
            if (!f) e = _.escape(e);
            o.push(c + d + e + l);
            if (r < s - 2) o.push(", ");
            else if (r < s - 1) o.push(a);
          });
          return o;
        },
        setUpStaticTranslations: function e() {
          return S();
        },
        getStaticTranslation: function e(r, t) {
          if (!C()) return null;
          var a = TS.storage.fetchStaticTranslations();
          var n = _.get(a, "data." + t);
          if (!n || !n[r]) return null;
          return n[r];
        },
        keyEquivalent: function e(r) {
          var t = v();
          if ("en-US" === t) return r;
          if (j[r] && j[r][t]) return j[r][t];
          return r;
        },
        keyCodeEquivalent: function e(r) {
          var t = v();
          if ("en-US" === t) return r;
          if (L[r] && L[r][t]) return L[r][t];
          return r;
        },
        keyCodeEquivalentReverse: function e(r) {
          var t = v();
          if ("en-US" === t) return r;
          if (l[t] && l[t][r]) return l[t][r];
          return r;
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
            thousands_separator: "."
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
          setLocale: function e(r) {
            n = r;
            if (Intl.Collator) i = Intl.Collator(n);
            if (window.moment) window.moment.locale(n);
          }
        }
      });
      var e;
      var r;
      var t;
      var a;
      var n;
      var o;
      var s;
      var i;
      var u = {};
      var c;
      var l = {};
      var f = {
        de: "Deutsch",
        "en-US": "English (US)",
        es: "Español",
        fr: "Français"
      };
      var d = [];
      var g = function o() {
        if (e) return;
        r = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        t = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
        var s = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
        if (s) n = s[1];
        if (!n) n = document.documentElement.lang || _.get(TS, "interop.I18n.DEFAULT_LOCALE", "en-US");
        if ("pseudo" === n) a = true;
        if (Intl.Collator) i = Intl.Collator(n);
        else i = null;
        e = true;
      };
      var p = function e() {
        if (TS.boot_data) {
          if (TS.boot_data.slack_to_zd_locale) c = TS.boot_data.slack_to_zd_locale;
          if (TS.boot_data.feature_locale_ja_JP) f.ja = "日本語";
        }
      };
      var S = function e() {
        if (C()) return Promise.resolve();
        return TS.api.call("i18n.translations.get").then(function(e) {
          var r = e.data;
          if (!r || !r.ok) {
            TS.error("Failed to fetch static i18n translations, recieved this response: ", e);
            return;
          }
          TS.model.static_translations_cache_ts = r.cache_ts;
          TS.storage.storeStaticTranslations({
            data: r,
            cache_ts: TS.model.static_translations_cache_ts,
            locale: r.locale
          });
        });
      };
      var v = function e() {
        if (!o)
          if (TS.i18n.canAutoGetKeyboard()) {
            o = w(desktop.app.getLocaleInformation().currentKeyboardLayout);
            desktop.app.onDidChangeKeyboardLayout(k);
          } else if (TS.prefs.prefs_loaded) o = TS.prefs.getPref("keyboard") || "en-US";
        else return "en-US";
        return o;
      };
      var m = /german/;
      var T = /french/;
      var h = /spanish/;
      var b = /iso/;
      var y = /japanese/;
      var w = function e(r) {
        var t = r.toLowerCase();
        if (m.test(t)) return "de";
        else if (T.test(t)) return "fr";
        else if (h.test(t) && b.test(t)) return "es";
        else if (TS.boot_data.feature_locale_ja_JP && y.test(t)) return "ja";
        return "en-US";
      };
      var k = function e(r) {
        o = w(r);
        TS.i18n.keyboard_changed_sig.dispatch();
      };
      var E = function e() {
        if (!TS.model.is_our_app) {
          o = TS.prefs.getPref("keyboard");
          TS.i18n.keyboard_changed_sig.dispatch();
        }
      };
      var j = {
        "`": {
          es: "º",
          fr: "@",
          de: "^",
          ja: "@"
        },
        "~": {
          es: "ª",
          fr: "#",
          de: "°"
        },
        "/": {
          es: "'",
          fr: ",",
          de: "ö",
          ja: "・"
        },
        "\\": {
          es: "¡",
          fr: "`",
          de: "#",
          ja: "_"
        },
        ".": {
          fr: ";"
        }
      };
      var L = {
        190: {
          fr: 186
        },
        191: {
          es: 222,
          fr: 188,
          de: 186
        },
        220: {
          es: 187,
          de: 222,
          ja: 189
        }
      };
      var U = function e() {
        Object.keys(L).forEach(function(e) {
          Object.keys(L[e]).forEach(function(r) {
            l[r] = l[r] || {};
            l[r][L[e][r]] = parseInt(e, 10);
          });
        });
      };
      var C = function e() {
        var r = TS.storage.fetchStaticTranslations();
        if (!r) return false;
        if (TS.model.static_translations_cache_ts !== r.cache_ts) return false;
        if (TS.i18n.locale() !== r.locale) return false;
        return true;
      };
      var F = function e(r, t) {
        return function() {
          var e = t + "." + r;
          if (d.indexOf(e) >= 0) return;
          d.push(e);
          var a = "TS.i18n.t(" + JSON.stringify(r) + ", " + JSON.stringify(t) + ")";
          TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + a + " when you meant to do " + a + "()");
          alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + t + "\nString: " + r);
          return "";
        };
      };
      var P = function e(r) {
        var t = false;
        if (r.endsWith(":")) {
          t = true;
          r = r.substr(0, r.length - 1);
        }
        var a = /(<[^>]+>)|(&\w+;)/gi;
        var n = r.match(a) || [];
        r = r.replace(a, "<>");
        var o = parseMessageFormatString(r);
        if (o.error) TS.error(o.error);
        var s;
        r = o.tokens.map(function(e) {
          if ("text" === e[0]) {
            s = e[1];
            _.forOwn(D, function(e) {
              s = s.replace(e[0], e[1]);
            });
            return s.split(" ").map(function(e) {
              e += new Array(Math.floor(.3 * e.length) + 1).join("~");
              return e;
            }).join(" ");
          }
          return e[1];
        }).join("");
        r = r.split("<>").map(function(e, r) {
          return e + (n[r] || "");
        }).join("");
        if (t) r += ":";
        return r;
      };
      var D = {
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
    })();
  }
}, [190]);
