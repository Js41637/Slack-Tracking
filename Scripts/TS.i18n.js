webpackJsonp([413], {
  2623: function(e, r) {
    (function() {
      "use strict";
      TS.registerModule("i18n", {
        DEFAULT_LOCALE: "en-US",
        onStart: function e() {
          f();
          d();
          T();
          if (TS.client && TS.client.login_sig) TS.client.login_sig.add(g);
        },
        locale: function e() {
          f();
          return a;
        },
        keyboard: function e() {
          return o || "en";
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
          f();
          var r = TS.i18n.DEFAULT_LOCALE.toLowerCase();
          if (u && u[a.toLowerCase()]) r = u[a.toLowerCase()];
          return r;
        },
        t: function e(o, i) {
          f();
          if (!i && r) {
            var u = TS.error ? TS.error : console.error;
            u.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + i + ".");
            return function() {
              return "";
            };
          }
          var l = a + ":" + i + ":" + o;
          if (void 0 === s[l]) {
            if (n || "pseudo" === a) s[l] = new MessageFormat(a, m(o)).format;
            else {
              if (r && i && window.sha1 && window.tsTranslations && window.tsTranslations[i]) {
                o = window.tsTranslations[i][window.sha1(o)] || o;
                o = o.replace(/\[{3}/g, '<span class="no_wrap">').replace(/\]{3}/g, "</span>");
              }
              s[l] = new MessageFormat(a, o).format;
            }
            if (r && t) s[l].toString = p(l, i);
          }
          return s[l];
        },
        number: function e(r) {
          f();
          return Intl.NumberFormat(a).format(r);
        },
        sorter: function e(r, t) {
          f();
          if (!r || !t) return !r ? -1 : 1;
          if (i) return i.compare(r, t);
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
          f();
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
          f();
          switch (TS.i18n.locale()) {
            case "es-ES":
            case "fr-FR":
              return TS.i18n.possessive(r) + r;
            default:
              return r + TS.i18n.possessive(r);
          }
        },
        listify: function e(r, t) {
          f();
          var n;
          var o = [];
          var i = r.length;
          var s = t && "or" === t.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
          var u = i > 2 ? "," : "";
          var l = t && t.strong ? "<strong>" : "";
          var c = t && t.strong ? "</strong>" : "";
          var d = t && t.no_escape;
          var g = t && t.item_prefix ? t.item_prefix : "";
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
            if (!d) e = _.escape(e);
            o.push(l + g + e + c);
            if (r < i - 2) o.push(", ");
            else if (r < i - 1) o.push(n);
          });
          return o;
        },
        deburr: function e(r) {
          r = _.deburr(r);
          r = E(r);
          r = y(r);
          return r;
        },
        getStaticTranslation: function e(r, t) {
          if (!h()) return null;
          var n = TS.storage.fetchStaticTranslations();
          var a = _.get(n, "data." + t);
          if (!a || !a[r]) return null;
          return a[r];
        },
        keyEquivalent: function e(r) {
          if ("en" === o) return r;
          if (S[r] && S[r][o]) return S[r][o];
          return r;
        },
        keyCodeEquivalent: function e(r) {
          if ("en" === o) return r;
          if (v[r] && v[r][o]) return v[r][o];
          return r;
        },
        keyCodeEquivalentReverse: function e(r) {
          if ("en" === o) return r;
          if (l[o] && l[o][r]) return l[o][r];
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
      var t;
      var n;
      var a;
      var o = "en";
      var i;
      var s = {};
      var u;
      var l = {};
      var c = [];
      var f = function o() {
        if (e) return;
        r = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        t = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
        var s = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
        if (s) a = s[1];
        if (!a) a = document.documentElement.lang || TS.i18n.DEFAULT_LOCALE;
        if ("pseudo" === a) n = true;
        if (Intl.Collator) i = Intl.Collator(a);
        else i = null;
        e = true;
      };
      var d = function e() {
        if (TS.boot_data && TS.boot_data.slack_to_zd_locale) u = TS.boot_data.slack_to_zd_locale;
      };
      var g = function e() {
        if (!TS.boot_data.feature_localization || TS.i18n.locale() === TS.i18n.DEFAULT_LOCALE) return;
        if (!h()) TS.api.call("i18n.translations.get").then(function(e) {
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
      var S = {
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
      var v = {
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
      var T = function e() {
        Object.keys(v).forEach(function(e) {
          Object.keys(v[e]).forEach(function(r) {
            l[r] = l[r] || {};
            l[r][v[e][r]] = parseInt(e, 10);
          });
        });
      };
      var h = function e() {
        var r = TS.storage.fetchStaticTranslations();
        if (!r) return false;
        if (TS.model.static_translations_cache_ts !== r.cache_ts) return false;
        if (TS.i18n.locale() !== r.locale) return false;
        return true;
      };
      var p = function e(r, t) {
        return function() {
          var e = t + "." + r;
          if (c.indexOf(e) >= 0) return;
          c.push(e);
          var n = "TS.i18n.t(" + JSON.stringify(r) + ", " + JSON.stringify(t) + ")";
          TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + n + " when you meant to do " + n + "()");
          alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + t + "\nString: " + r);
          return "";
        };
      };
      var m = function e(r) {
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
            _.forOwn(b, function(e) {
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
      var b = {
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
      var E = function e(r) {
        return r && r.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, w);
      };
      var w = function e(r) {
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
      var y = function e(r) {
        return r && r.replace(/([\u0400-\u04ff])/g, L);
      };
      var L = function e(r) {
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
}, [2623]);
