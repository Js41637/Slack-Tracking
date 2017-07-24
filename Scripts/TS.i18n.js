webpackJsonp([407], {
  112: function(t, e) {
    ! function() {
      "use strict";
      TS.registerModule("i18n", {
        DEFAULT_LOCALE: "en-US",
        onStart: function() {
          f(), d(), TS.client && TS.client.login_sig && TS.client.login_sig.add(g);
        },
        locale: function() {
          return f(), s;
        },
        getDefaultLocale: function() {
          return TS.i18n.DEFAULT_LOCALE;
        },
        localesEnabled: function() {
          var t = {};
          return TS.boot_data.feature_locale_de_DE && (t["de-DE"] = "Deutsch"), t["en-US"] = "English (US)", TS.boot_data.feature_locale_es_ES && (t["es-ES"] = "Español"), TS.boot_data.feature_locale_fr_FR && (t["fr-FR"] = "Français"), TS.boot_data.feature_locale_ja_JP && (t["ja-JP"] = "日本語"), TS.boot_data.feature_pseudo_locale && (t.pseudo = "Þsèúδôtřáñsℓátïôñ"), t;
        },
        localeOrPseudo: function() {
          return o ? "pseudo" : TS.i18n.locale();
        },
        zdLocale: function() {
          f();
          var t = TS.i18n.DEFAULT_LOCALE.toLowerCase();
          return l && l[s.toLowerCase()] && (t = l[s.toLowerCase()]), t;
        },
        t: function(t, n, r) {
          if (f(), !n && e) {
            return (TS.error ? TS.error : console.error).call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + n + "."),
              function() {
                return "";
              };
          }
          r = r || s;
          var i = r + ":" + n + ":" + t;
          return void 0 === c[i] && (o || "pseudo" === r ? c[i] = new MessageFormat(r, h(t)).format : (e && n && window.sha1 && window.tsTranslations && window.tsTranslations[n] && (t = window.tsTranslations[n][window.sha1(t)] || t), c[i] = new MessageFormat(r, t).format), e && a && (c[i].toString = T(i, n))), c[i];
        },
        number: function(t) {
          return f(), Intl.NumberFormat(s).format(t);
        },
        sorter: function(t, e) {
          return f(), t && e ? i ? i.compare(t, e) : t.localeCompare(e) : t ? 1 : -1;
        },
        mappedSorter: function(t) {
          return function(e, n) {
            if (!e || !n) return e ? 1 : -1;
            var a = (t + "").split(".");
            return a.length > 1 ? a.forEach(function(t) {
              e = e[t], n = n[t];
            }) : (e = e[t], n = n[t]), TS.i18n.sorter(e, n);
          };
        },
        possessive: function(t) {
          switch (f(), TS.i18n.locale()) {
            case "fr-FR":
              return _.deburr(t).match(/^[aeiouy]/i) ? "d’" : "de ";
            case "es-ES":
              return "de ";
            case "de-DE":
              return t.match(/[sßxz]$/i) ? "’" : "s";
            case "ja-JP":
              return "の";
            default:
              return "’s";
          }
        },
        fullPossessiveString: function(t) {
          switch (f(), TS.i18n.locale()) {
            case "es-ES":
            case "fr-FR":
              return TS.i18n.possessive(t) + t;
            default:
              return t + TS.i18n.possessive(t);
          }
        },
        listify: function(t, e) {
          f();
          var n, a = [],
            r = t.length,
            o = e && "or" === e.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")(),
            i = r > 2 ? "," : "",
            l = e && e.strong ? "<strong>" : "",
            c = e && e.strong ? "</strong>" : "",
            u = e && e.no_escape,
            d = e && e.item_prefix ? e.item_prefix : "";
          switch (s) {
            case "ja-JP":
              n = ", ";
              break;
            default:
              n = i + " " + o + " ";
          }
          return t.forEach(function(t, e) {
            u || (t = _.escape(t)), a.push(l + d + t + c), e < r - 2 ? a.push(", ") : e < r - 1 && a.push(n);
          }), a;
        },
        deburr: function(t) {
          return t = _.deburr(t), t = n(t), t = r(t);
        },
        getStaticTranslation: function(t, e) {
          if (!S()) return null;
          var n = TS.storage.fetchStaticTranslations(),
            a = _.get(n, "data." + e);
          return a && a[t] ? a[t] : null;
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
          setLocale: function(t) {
            s = t, Intl.Collator && (i = Intl.Collator(s)), window.moment && window.moment.locale(s);
          }
        }
      });
      var t, e, a, o, s, i, l, c = {},
        u = [],
        f = function() {
          if (!t) {
            e = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/), a = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
            var n = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
            n && (s = n[1]), s || (s = document.documentElement.lang || TS.i18n.DEFAULT_LOCALE), "pseudo" === s && (o = !0), i = Intl.Collator ? Intl.Collator(s) : null, t = !0;
          }
        },
        d = function() {
          TS.boot_data && TS.boot_data.slack_to_zd_locale && (l = TS.boot_data.slack_to_zd_locale);
        },
        g = function() {
          TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE && (S() || TS.api.call("i18n.translations.get").then(function(t) {
            var e = t.data;
            if (!e || !e.ok) return void TS.error("Failed to fetch static i18n translations, recieved this response: ", t);
            TS.model.static_translations_cache_ts = e.cache_ts, TS.storage.storeStaticTranslations({
              data: e,
              cache_ts: TS.model.static_translations_cache_ts,
              locale: e.locale
            });
          }));
        },
        S = function() {
          var t = TS.storage.fetchStaticTranslations();
          return !!t && (TS.model.static_translations_cache_ts === t.cache_ts && TS.i18n.locale() === t.locale);
        },
        T = function(t, e) {
          return function() {
            var n = e + "." + t;
            if (!(u.indexOf(n) >= 0)) {
              u.push(n);
              var a = "TS.i18n.t(" + JSON.stringify(t) + ", " + JSON.stringify(e) + ")";
              return TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + a + " when you meant to do " + a + "()"), alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + e + "\nString: " + t), "";
            }
          };
        },
        h = function(t) {
          var e = !1;
          t.endsWith(":") && (e = !0, t = t.substr(0, t.length - 1));
          var n = /(<[^>]+>)|(&\w+;)/gi,
            a = t.match(n) || [];
          t = t.replace(n, "<>");
          var r = parseMessageFormatString(t);
          r.error && TS.error(r.error);
          var o;
          return t = r.tokens.map(function(t) {
            return "text" === t[0] ? (o = t[1], _.forOwn(m, function(t) {
              o = o.replace(t[0], t[1]);
            }), o.split(" ").map(function(t) {
              return t += new Array(Math.floor(.3 * t.length) + 1).join("~");
            }).join(" ")) : t[1];
          }).join(""), t = t.split("<>").map(function(t, e) {
            return t + (a[e] || "");
          }).join(""), e && (t += ":"), t;
        },
        m = {
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
    var n = function(t) {
        return t && t.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, a);
      },
      a = function(t) {
        var e = {
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
          n = t.charCodeAt(0);
        return t in e ? e[t] : n >= 65280 && n <= 65374 ? String.fromCharCode(n - 65248) : t;
      },
      r = function(t) {
        return t && t.replace(/([\u0400-\u04ff])/g, o);
      },
      o = function(t) {
        var e = {
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
        return t in e ? e[t] : t;
      };
  }
}, [112]);
