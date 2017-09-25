webpackJsonp([413], {
  19619: function(e, r) {
    (function() {
      "use strict";
      TS.registerModule("i18n", {
        DEFAULT_LOCALE: "en-US",
        onStart: function e() {
          g();
          S();
          C();
          if (TS.prefs) TS.prefs.keyboard_changed_sig.add(w);
          if (window.signals) TS.i18n.keyboard_changed_sig = new signals.Signal;
          else TS.i18n.keyboard_changed_sig = {
            add: function e() {},
            remove: function e() {},
            dispatch: function e() {}
          };
        },
        locale: function e() {
          g();
          return a;
        },
        keyboard: function e() {
          return v();
        },
        canAutoGetKeyboard: function e() {
          if (void 0 !== i) return i;
          i = TS.model && TS.model.is_our_app && desktop && desktop.app && desktop.app.getLocaleInformation && desktop.app.getLocaleInformation().currentKeyboardLayout;
          return i;
        },
        supportedKeyboards: function e() {
          return l;
        },
        getDefaultLocale: function e() {
          return TS.i18n.DEFAULT_LOCALE;
        },
        localesEnabled: function e() {
          var r = {};
          if (TS.boot_data.feature_locale_de_DE) r["de-DE"] = "Deutsch";
          r["en-US"] = "English (US)";
          if (TS.boot_data.feature_locale_es_ES) r["es-ES"] = "Español";
          if (TS.boot_data.feature_locale_fr_FR) r["fr-FR"] = "Français";
          if (TS.boot_data.feature_locale_ja_JP) r["ja-JP"] = "日本語";
          if (TS.boot_data.feature_pseudo_locale) r.pseudo = "Þsèúδôtřáñsℓátïôñ";
          return r;
        },
        localeOrPseudo: function e() {
          if (n) return "pseudo";
          return TS.i18n.locale();
        },
        isLocaleCJK: function e() {
          return "ja-JP" === TS.i18n.locale();
        },
        zdLocale: function e() {
          g();
          var r = TS.i18n.DEFAULT_LOCALE.toLowerCase();
          if (c && c[a.toLowerCase()]) r = c[a.toLowerCase()];
          return r;
        },
        t: function e(o, i) {
          g();
          if (!i && r) {
            var s = TS.error ? TS.error : console.error;
            s.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + i + ".");
            return function() {
              return "";
            };
          }
          var c = a + ":" + i + ":" + o;
          if (void 0 === u[c]) {
            if (n || "pseudo" === a) u[c] = new MessageFormat(a, F(o)).format;
            else {
              if (r && i && window.sha1 && window.tsTranslations && window.tsTranslations[i]) {
                o = window.tsTranslations[i][window.sha1(o)] || o;
                o = o.replace(/\[{3}/g, '<span class="no_wrap">').replace(/\]{3}/g, "</span>");
              }
              u[c] = new MessageFormat(a, o).format;
            }
            if (r && t) u[c].toString = j(c, i);
          }
          return u[c];
        },
        number: function e(r) {
          g();
          return Intl.NumberFormat(a).format(r);
        },
        percent: function e(r, t) {
          g();
          return Intl.NumberFormat(a, {
            style: "percent",
            maximumFractionDigits: t
          }).format(r);
        },
        sorter: function e(r, t) {
          g();
          if (!r || !t) return !r ? -1 : 1;
          if (s) return s.compare(r, t);
          return r.localeCompare(t);
        },
        mappedSorter: function e(r) {
          return function(e, t) {
            if (!e || !t) return !e ? -1 : 1;
            var n = ("" + r).split(".");
            if (n.length > 1) n.forEach(function(r) {
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
          var n;
          var o = [];
          var i = r.length;
          var s = t && "or" === t.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
          var u = i > 2 ? "," : "";
          var c = t && t.strong ? "<strong>" : "";
          var f = t && t.strong ? "</strong>" : "";
          var l = t && t.no_escape;
          var d = t && t.item_prefix ? t.item_prefix : "";
          switch (a) {
            case "ja-JP":
              n = ", ";
              break;
            case "en-US":
              n = u + " " + s + " ";
              break;
            default:
              n = " " + s + " ";
          }
          r.forEach(function(e, r) {
            if (!l) e = _.escape(e);
            o.push(c + d + e + f);
            if (r < i - 2) o.push(", ");
            else if (r < i - 1) o.push(n);
          });
          return o;
        },
        deburr: function e(r) {
          r = _.deburr(r);
          r = A(r);
          r = O(r);
          return r;
        },
        setUpStaticTranslations: function e() {
          return p();
        },
        getStaticTranslation: function e(r, t) {
          if (!U()) return null;
          var n = TS.storage.fetchStaticTranslations();
          var a = _.get(n, "data." + t);
          if (!a || !a[r]) return null;
          return a[r];
        },
        keyEquivalent: function e(r) {
          var t = v();
          if ("en-US" === t) return r;
          if (k[r] && k[r][t]) return k[r][t];
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
          if (f[t] && f[t][r]) return f[t][r];
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
          setLocale: function e(r) {
            a = r;
            if (Intl.Collator) s = Intl.Collator(a);
            if (window.moment) window.moment.locale(a);
          }
        }
      });
      var e;
      var r;
      var t;
      var n;
      var a;
      var o;
      var i;
      var s;
      var u = {};
      var c;
      var f = {};
      var l = {
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
        var i = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
        if (i) a = i[1];
        if (!a) a = document.documentElement.lang || TS.i18n.DEFAULT_LOCALE;
        if ("pseudo" === a) n = true;
        if (Intl.Collator) s = Intl.Collator(a);
        else s = null;
        e = true;
      };
      var S = function e() {
        if (TS.boot_data && TS.boot_data.slack_to_zd_locale) c = TS.boot_data.slack_to_zd_locale;
      };
      var p = function e() {
        if (!TS.boot_data.feature_localization || TS.i18n.locale() === TS.i18n.DEFAULT_LOCALE) return;
        if (U()) return Promise.resolve();
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
            o = y(desktop.app.getLocaleInformation().currentKeyboardLayout);
            desktop.app.onDidChangeKeyboardLayout(E);
          } else if (TS.prefs.prefs_loaded) o = TS.prefs.getPref("keyboard") || "en-US";
        else return "en-US";
        return o;
      };
      var h = /german/;
      var T = /french/;
      var m = /spanish/;
      var b = /iso/;
      var y = function e(r) {
        var t = r.toLowerCase();
        if (h.test(t)) return "de";
        else if (T.test(t)) return "fr";
        else if (m.test(t) && b.test(t)) return "es";
        return "en-US";
      };
      var E = function e(r) {
        o = y(r);
        TS.i18n.keyboard_changed_sig.dispatch();
      };
      var w = function e() {
        if (!TS.model.is_our_app) {
          o = TS.prefs.getPref("keyboard");
          TS.i18n.keyboard_changed_sig.dispatch();
        }
      };
      var k = {
        "`": {
          es: "º",
          fr: "@",
          de: "^"
        },
        "~": {
          es: "ª",
          fr: "#",
          de: "°"
        },
        "/": {
          es: "'",
          fr: ",",
          de: "ö"
        },
        "\\": {
          es: "¡",
          fr: "`",
          de: "#"
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
          de: 222
        }
      };
      var C = function e() {
        Object.keys(L).forEach(function(e) {
          Object.keys(L[e]).forEach(function(r) {
            f[r] = f[r] || {};
            f[r][L[e][r]] = parseInt(e, 10);
          });
        });
      };
      var U = function e() {
        var r = TS.storage.fetchStaticTranslations();
        if (!r) return false;
        if (TS.model.static_translations_cache_ts !== r.cache_ts) return false;
        if (TS.i18n.locale() !== r.locale) return false;
        return true;
      };
      var j = function e(r, t) {
        return function() {
          var e = t + "." + r;
          if (d.indexOf(e) >= 0) return;
          d.push(e);
          var n = "TS.i18n.t(" + JSON.stringify(r) + ", " + JSON.stringify(t) + ")";
          TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + n + " when you meant to do " + n + "()");
          alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + t + "\nString: " + r);
          return "";
        };
      };
      var F = function e(r) {
        var t = false;
        if (r.endsWith(":")) {
          t = true;
          r = r.substr(0, r.length - 1);
        }
        var n = /(<[^>]+>)|(&\w+;)/gi;
        var a = r.match(n) || [];
        r = r.replace(n, "<>");
        var o = parseMessageFormatString(r);
        if (o.error) TS.error(o.error);
        var i;
        r = o.tokens.map(function(e) {
          if ("text" === e[0]) {
            i = e[1];
            _.forOwn(D, function(e) {
              i = i.replace(e[0], e[1]);
            });
            return i.split(" ").map(function(e) {
              e += new Array(Math.floor(.3 * e.length) + 1).join("~");
              return e;
            }).join(" ");
          }
          return e[1];
        }).join("");
        r = r.split("<>").map(function(e, r) {
          return e + (a[r] || "");
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
      var A = function e(r) {
        return r && r.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, J);
      };
      var J = function e(r) {
        var t = {
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
        };
        var n = r.charCodeAt(0);
        if (r in t) return t[r];
        else if (n >= 65280 && n <= 65374) return String.fromCharCode(n - 65248);
        return r;
      };
      var O = function e(r) {
        return r && r.replace(/([\u0400-\u04ff])/g, P);
      };
      var P = function e(r) {
        var t = {
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
        if (r in t) return t[r];
        return r;
      };
    })();
  }
}, [19619]);
