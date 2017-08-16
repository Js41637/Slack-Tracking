webpackJsonp([413], {
  138: function(e, r) {
    (function() {
      "use strict";
      TS.registerModule("i18n", {
        DEFAULT_LOCALE: "en-US",
        onStart: function e() {
          f();
          g();
          if (TS.client && TS.client.login_sig) TS.client.login_sig.add(d);
        },
        locale: function e() {
          f();
          return i;
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
          if (o) return "pseudo";
          return TS.i18n.locale();
        },
        isLocaleCJK: function e() {
          return "ja-JP" === TS.i18n.locale();
        },
        zdLocale: function e() {
          f();
          var r = TS.i18n.DEFAULT_LOCALE.toLowerCase();
          if (u && u[i.toLowerCase()]) r = u[i.toLowerCase()];
          return r;
        },
        t: function e(t, n) {
          f();
          if (!n && r) {
            var s = TS.error ? TS.error : console.error;
            s.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + n + ".");
            return function() {
              return "";
            };
          }
          var u = i + ":" + n + ":" + t;
          if (void 0 === l[u]) {
            if (o || "pseudo" === i) l[u] = new MessageFormat(i, v(t)).format;
            else {
              if (r && n && window.sha1 && window.tsTranslations && window.tsTranslations[n]) t = window.tsTranslations[n][window.sha1(t)] || t;
              l[u] = new MessageFormat(i, t).format;
            }
            if (r && a) l[u].toString = T(u, n);
          }
          return l[u];
        },
        number: function e(r) {
          f();
          return Intl.NumberFormat(i).format(r);
        },
        sorter: function e(r, t) {
          f();
          if (!r || !t) return !r ? -1 : 1;
          if (s) return s.compare(r, t);
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
          var a;
          var n = [];
          var o = r.length;
          var s = t && "or" === t.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
          var l = o > 2 ? "," : "";
          var u = t && t.strong ? "<strong>" : "";
          var c = t && t.strong ? "</strong>" : "";
          var g = t && t.no_escape;
          var d = t && t.item_prefix ? t.item_prefix : "";
          switch (i) {
            case "ja-JP":
              a = ", ";
              break;
            case "en-US":
              a = l + " " + s + " ";
              break;
            default:
              a = " " + s + " ";
          }
          r.forEach(function(e, r) {
            if (!g) e = _.escape(e);
            n.push(u + d + e + c);
            if (r < o - 2) n.push(", ");
            else if (r < o - 1) n.push(a);
          });
          return n;
        },
        deburr: function e(r) {
          r = _.deburr(r);
          r = t(r);
          r = n(r);
          return r;
        },
        getStaticTranslation: function e(r, t) {
          if (!S()) return null;
          var a = TS.storage.fetchStaticTranslations();
          var n = _.get(a, "data." + t);
          if (!n || !n[r]) return null;
          return n[r];
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
            i = r;
            if (Intl.Collator) s = Intl.Collator(i);
            if (window.moment) window.moment.locale(i);
          }
        }
      });
      var e;
      var r;
      var a;
      var o;
      var i;
      var s;
      var l = {};
      var u;
      var c = [];
      var f = function t() {
        if (e) return;
        r = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        a = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
        var n = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
        if (n) i = n[1];
        if (!i) i = document.documentElement.lang || TS.i18n.DEFAULT_LOCALE;
        if ("pseudo" === i) o = true;
        if (Intl.Collator) s = Intl.Collator(i);
        else s = null;
        e = true;
      };
      var g = function e() {
        if (TS.boot_data && TS.boot_data.slack_to_zd_locale) u = TS.boot_data.slack_to_zd_locale;
      };
      var d = function e() {
        if (!TS.boot_data.feature_localization || TS.i18n.locale() === TS.i18n.DEFAULT_LOCALE) return;
        if (!S()) TS.api.call("i18n.translations.get").then(function(e) {
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
      var S = function e() {
        var r = TS.storage.fetchStaticTranslations();
        if (!r) return false;
        if (TS.model.static_translations_cache_ts !== r.cache_ts) return false;
        if (TS.i18n.locale() !== r.locale) return false;
        return true;
      };
      var T = function e(r, t) {
        return function() {
          var e = t + "." + r;
          if (c.indexOf(e) >= 0) return;
          c.push(e);
          var a = "TS.i18n.t(" + JSON.stringify(r) + ", " + JSON.stringify(t) + ")";
          TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + a + " when you meant to do " + a + "()");
          alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + t + "\nString: " + r);
          return "";
        };
      };
      var v = function e(r) {
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
        var i;
        r = o.tokens.map(function(e) {
          if ("text" === e[0]) {
            i = e[1];
            _.forOwn(h, function(e) {
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
          return e + (n[r] || "");
        }).join("");
        if (t) r += ":";
        return r;
      };
      var h = {
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
    var t = function e(r) {
      return r && r.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, a);
    };
    var a = function e(r) {
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
      var a = r.charCodeAt(0);
      if (r in t) return t[r];
      else if (a >= 65280 && a <= 65374) return String.fromCharCode(a - 65248);
      return r;
    };
    var n = function e(r) {
      return r && r.replace(/([\u0400-\u04ff])/g, o);
    };
    var o = function e(r) {
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
  }
}, [138]);
