webpackJsonp([413], {
  4221: function(e, r) {
    (function() {
      "use strict";
      TS.registerModule("i18n", {
        DEFAULT_LOCALE: "en-US",
        onStart: function e() {
          d();
          g();
          m();
          if (TS.client && TS.client.login_sig) TS.client.login_sig.add(S);
          if (TS.prefs) TS.prefs.keyboard_changed_sig.add(T);
          if (window.signals) TS.i18n.keyboard_changed_sig = new signals.Signal;
          else TS.i18n.keyboard_changed_sig = {
            add: function e() {},
            remove: function e() {},
            dispatch: function e() {}
          };
        },
        locale: function e() {
          d();
          return a;
        },
        keyboard: function e() {
          return v();
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
          if (t) return "pseudo";
          return TS.i18n.locale();
        },
        isLocaleCJK: function e() {
          return "ja-JP" === TS.i18n.locale();
        },
        zdLocale: function e() {
          d();
          var r = TS.i18n.DEFAULT_LOCALE.toLowerCase();
          if (u && u[a.toLowerCase()]) r = u[a.toLowerCase()];
          return r;
        },
        t: function e(o, i) {
          d();
          if (!i && r) {
            var u = TS.error ? TS.error : console.error;
            u.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + i + ".");
            return function() {
              return "";
            };
          }
          var c = a + ":" + i + ":" + o;
          if (void 0 === s[c]) {
            if (t || "pseudo" === a) s[c] = new MessageFormat(a, w(o)).format;
            else {
              if (r && i && window.sha1 && window.tsTranslations && window.tsTranslations[i]) {
                o = window.tsTranslations[i][window.sha1(o)] || o;
                o = o.replace(/\[{3}/g, '<span class="no_wrap">').replace(/\]{3}/g, "</span>");
              }
              s[c] = new MessageFormat(a, o).format;
            }
            if (r && n) s[c].toString = E(c, i);
          }
          return s[c];
        },
        number: function e(r) {
          d();
          return Intl.NumberFormat(a).format(r);
        },
        percent: function e(r, n) {
          d();
          return Intl.NumberFormat(a, {
            style: "percent",
            maximumFractionDigits: n
          }).format(r);
        },
        sorter: function e(r, n) {
          d();
          if (!r || !n) return !r ? -1 : 1;
          if (i) return i.compare(r, n);
          return r.localeCompare(n);
        },
        mappedSorter: function e(r) {
          return function(e, n) {
            if (!e || !n) return !e ? -1 : 1;
            var t = ("" + r).split(".");
            if (t.length > 1) t.forEach(function(r) {
              e = e[r];
              n = n[r];
            });
            else {
              e = e[r];
              n = n[r];
            }
            return TS.i18n.sorter(e, n);
          };
        },
        possessive: function e(r) {
          d();
          switch (TS.i18n.locale()) {
            case "fr-FR":
              var n = _.deburr(r);
              return n.match(/^[aeiouy]/i) ? "d’" : "de ";
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
          d();
          switch (TS.i18n.locale()) {
            case "es-ES":
            case "fr-FR":
              return TS.i18n.possessive(r) + r;
            default:
              return r + TS.i18n.possessive(r);
          }
        },
        listify: function e(r, n) {
          d();
          var t;
          var o = [];
          var i = r.length;
          var s = n && "or" === n.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
          var u = i > 2 ? "," : "";
          var c = n && n.strong ? "<strong>" : "";
          var l = n && n.strong ? "</strong>" : "";
          var f = n && n.no_escape;
          var g = n && n.item_prefix ? n.item_prefix : "";
          switch (a) {
            case "ja-JP":
              t = ", ";
              break;
            case "en-US":
              t = u + " " + s + " ";
              break;
            default:
              t = " " + s + " ";
          }
          r.forEach(function(e, r) {
            if (!f) e = _.escape(e);
            o.push(c + g + e + l);
            if (r < i - 2) o.push(", ");
            else if (r < i - 1) o.push(t);
          });
          return o;
        },
        deburr: function e(r) {
          r = _.deburr(r);
          r = k(r);
          r = C(r);
          return r;
        },
        getStaticTranslation: function e(r, n) {
          if (!b()) return null;
          var t = TS.storage.fetchStaticTranslations();
          var a = _.get(t, "data." + n);
          if (!a || !a[r]) return null;
          return a[r];
        },
        keyEquivalent: function e(r) {
          var n = v();
          if ("en-US" === n) return r;
          if (p[r] && p[r][n]) return p[r][n];
          return r;
        },
        keyCodeEquivalent: function e(r) {
          var n = v();
          if ("en-US" === n) return r;
          if (h[r] && h[r][n]) return h[r][n];
          return r;
        },
        keyCodeEquivalentReverse: function e(r) {
          var n = v();
          if ("en-US" === n) return r;
          if (c[n] && c[n][r]) return c[n][r];
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
            if (Intl.Collator) i = Intl.Collator(a);
            if (window.moment) window.moment.locale(a);
          }
        }
      });
      var e;
      var r;
      var n;
      var t;
      var a;
      var o;
      var i;
      var s = {};
      var u;
      var c = {};
      var l = {
        de: "Deutsch",
        "en-US": "English (US)",
        es: "Español",
        fr: "Français"
      };
      var f = [];
      var d = function o() {
        if (e) return;
        r = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        n = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
        var s = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
        if (s) a = s[1];
        if (!a) a = document.documentElement.lang || TS.i18n.DEFAULT_LOCALE;
        if ("pseudo" === a) t = true;
        if (Intl.Collator) i = Intl.Collator(a);
        else i = null;
        e = true;
      };
      var g = function e() {
        if (TS.boot_data && TS.boot_data.slack_to_zd_locale) u = TS.boot_data.slack_to_zd_locale;
      };
      var S = function e() {
        if (!TS.boot_data.feature_localization || TS.i18n.locale() === TS.i18n.DEFAULT_LOCALE) return;
        if (!b()) TS.api.call("i18n.translations.get").then(function(e) {
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
          if (!TS.boot_data.feature_i18n_keyboards) o = "en-US";
          else if (TS.model.is_our_app) o = "en-US";
        else if (TS.prefs.prefs_loaded) o = TS.prefs.getPref("keyboard");
        else return "en-US";
        return o;
      };
      var T = function e() {
        if (!TS.model.is_our_app) {
          o = TS.prefs.getPref("keyboard");
          TS.i18n.keyboard_changed_sig.dispatch();
        }
      };
      var p = {
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
          de: "ß"
        },
        "\\": {
          es: "¡",
          de: "+"
        },
        ".": {
          fr: ";"
        }
      };
      var h = {
        190: {
          fr: 186
        },
        191: {
          es: 222,
          fr: 188,
          de: 189
        },
        220: {
          es: 187,
          de: 221
        }
      };
      var m = function e() {
        Object.keys(h).forEach(function(e) {
          Object.keys(h[e]).forEach(function(r) {
            c[r] = c[r] || {};
            c[r][h[e][r]] = parseInt(e, 10);
          });
        });
      };
      var b = function e() {
        var r = TS.storage.fetchStaticTranslations();
        if (!r) return false;
        if (TS.model.static_translations_cache_ts !== r.cache_ts) return false;
        if (TS.i18n.locale() !== r.locale) return false;
        return true;
      };
      var E = function e(r, n) {
        return function() {
          var e = n + "." + r;
          if (f.indexOf(e) >= 0) return;
          f.push(e);
          var t = "TS.i18n.t(" + JSON.stringify(r) + ", " + JSON.stringify(n) + ")";
          TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + t + " when you meant to do " + t + "()");
          alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + n + "\nString: " + r);
          return "";
        };
      };
      var w = function e(r) {
        var n = false;
        if (r.endsWith(":")) {
          n = true;
          r = r.substr(0, r.length - 1);
        }
        var t = /(<[^>]+>)|(&\w+;)/gi;
        var a = r.match(t) || [];
        r = r.replace(t, "<>");
        var o = parseMessageFormatString(r);
        if (o.error) TS.error(o.error);
        var i;
        r = o.tokens.map(function(e) {
          if ("text" === e[0]) {
            i = e[1];
            _.forOwn(y, function(e) {
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
        if (n) r += ":";
        return r;
      };
      var y = {
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
      var k = function e(r) {
        return r && r.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, L);
      };
      var L = function e(r) {
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
        };
        var t = r.charCodeAt(0);
        if (r in n) return n[r];
        else if (t >= 65280 && t <= 65374) return String.fromCharCode(t - 65248);
        return r;
      };
      var C = function e(r) {
        return r && r.replace(/([\u0400-\u04ff])/g, U);
      };
      var U = function e(r) {
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
        if (r in n) return n[r];
        return r;
      };
    })();
  }
}, [4221]);
