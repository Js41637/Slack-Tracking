webpackJsonp([260], {
  236: function(e, t) {
    (function() {
      TS.registerModule("i18n", {
        onStart: function e() {
          p();
          S();
          P();
          if (TS.prefs) {
            TS.prefs.keyboard_changed_sig.add(L);
            setTimeout(v, 0);
          }
          if (window.signals) TS.i18n.keyboard_changed_sig = new signals.Signal;
          else TS.i18n.keyboard_changed_sig = {
            add: function e() {},
            remove: function e() {},
            dispatch: function e() {}
          };
        },
        locale: function e() {
          p();
          return a;
        },
        keyboard: function e() {
          return m();
        },
        canAutoGetKeyboard: function e() {
          if (void 0 !== s) return s;
          s = TS.model && TS.model.is_our_app && desktop && desktop.app && desktop.app.getLocaleInformation && desktop.app.getLocaleInformation().currentKeyboardLayout;
          return s;
        },
        supportedKeyboards: function e() {
          return f;
        },
        sendButtonEnabled: function e() {
          return "ja-JP" === TS.i18n.locale();
        },
        getDefaultLocale: function e() {
          return TS.interop.I18n.DEFAULT_LOCALE;
        },
        localesEnabled: function e() {
          var t = {};
          t["de-DE"] = "Deutsch";
          t["en-US"] = "English (US)";
          t["es-ES"] = "Español";
          t["fr-FR"] = "Français";
          if (TS.boot_data.feature_locale_ja_JP) t["ja-JP"] = "日本語";
          if (TS.boot_data.feature_pseudo_locale) t.pseudo = "Þsèúδôtřáñsℓátïôñ";
          return t;
        },
        localeOrPseudo: function e() {
          if (r) return "pseudo";
          return TS.i18n.locale();
        },
        isLocaleCJK: function e() {
          return d.indexOf(TS.i18n.locale()) > -1;
        },
        zdLocale: function e() {
          p();
          var t = TS.interop.I18n.DEFAULT_LOCALE.toLowerCase();
          if (u && u[a.toLowerCase()]) t = u[a.toLowerCase()];
          return t;
        },
        t: function e(o, s) {
          p();
          if (!s && t) {
            var i = TS.error ? TS.error : console.error;
            i.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + s + ".");
            return function() {
              return "";
            };
          }
          var u = a + ":" + s + ":" + o;
          if (void 0 === c[u]) {
            if (r || "pseudo" === a) c[u] = new MessageFormat(a, D(o)).format;
            else {
              if (t && s && window.sha1 && window.tsTranslations && window.tsTranslations[s]) {
                o = window.tsTranslations[s][window.sha1(o)] || o;
                o = o.replace(/\[{3}/g, '<span class="no_wrap">').replace(/\]{3}/g, "</span>");
              }
              c[u] = new MessageFormat(a, o).format;
            }
            if (t && n) c[u].toString = I(u, s);
          }
          return c[u];
        },
        number: function e(t, n) {
          if (isNaN(t)) return NaN;
          p();
          return Intl.NumberFormat(a, n).format(t);
        },
        percent: function e(t, n) {
          p();
          return Intl.NumberFormat(a, {
            style: "percent",
            maximumFractionDigits: n
          }).format(t);
        },
        sorter: function e(t, n) {
          p();
          if (!t || !n) return !t ? -1 : 1;
          if (i) return i.compare(t, n);
          return t.localeCompare(n);
        },
        mappedSorter: function e(t) {
          return function(e, n) {
            if (!e || !n) return !e ? -1 : 1;
            var r = ("" + t).split(".");
            if (r.length > 1) r.forEach(function(t) {
              e = e[t];
              n = n[t];
            });
            else {
              e = e[t];
              n = n[t];
            }
            return TS.i18n.sorter(e, n);
          };
        },
        possessive: function e(t) {
          p();
          if (!t) t = "";
          switch (TS.i18n.locale()) {
            case "fr-FR":
              var n = _.deburr(t);
              return n.match(/^[aeiouy]/i) ? "d’" : "de ";
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
        fullPossessiveString: function e(t) {
          p();
          switch (TS.i18n.locale()) {
            case "es-ES":
            case "fr-FR":
              return TS.i18n.possessive(t) + t;
            default:
              return t + TS.i18n.possessive(t);
          }
        },
        listify: function e(t, n) {
          p();
          var r;
          var o = [];
          var s = t.length;
          var i = n && "or" === n.conj ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
          var c = s > 2 ? "," : "";
          var u = n && n.strong ? "<strong>" : "";
          var l = n && n.strong ? "</strong>" : "";
          var f = n && n.no_escape;
          var d = n && n.item_prefix ? n.item_prefix : "";
          switch (a) {
            case "ja-JP":
              r = ", ";
              break;
            case "en-US":
              r = c + " " + i + " ";
              break;
            default:
              r = " " + i + " ";
          }
          t.forEach(function(e, t) {
            if (!f) e = _.escape(e);
            o.push(u + d + e + l);
            if (t < s - 2) o.push(", ");
            else if (t < s - 1) o.push(r);
          });
          return o;
        },
        setUpStaticTranslations: function e() {
          return T();
        },
        getStaticTranslation: function e(t, n) {
          if (!F()) return null;
          var r = TS.storage.fetchStaticTranslations();
          var a = _.get(r, "data." + n);
          if (!a || !a[t]) return null;
          return a[t];
        },
        keyEquivalent: function e(t) {
          var n = m();
          if ("en-US" === n) return t;
          if (C[t] && C[t][n]) return C[t][n];
          return t;
        },
        keyCodeEquivalent: function e(t) {
          var n = m();
          if ("en-US" === n) return t;
          if (U[t] && U[t][n]) return U[t][n];
          return t;
        },
        keyCodeEquivalentReverse: function e(t) {
          var n = m();
          if ("en-US" === n) return t;
          if (l[n] && l[n][t]) return l[n][t];
          return t;
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
          setLocale: function e(t) {
            a = t;
            if (Intl.Collator) i = Intl.Collator(a);
            if (window.moment) window.moment.locale(a);
          }
        }
      });
      var e;
      var t;
      var n;
      var r;
      var a;
      var o;
      var s;
      var i;
      var c = {};
      var u;
      var l = {};
      var f = {
        de: "Deutsch",
        "en-US": "English (US)",
        es: "Español",
        fr: "Français"
      };
      var d = ["ja-JP", "zh-CN", "ko-KR"];
      var g = [];
      var p = function o() {
        if (e) return;
        t = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
        n = TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path;
        var s = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
        if (s) a = s[1];
        if (!a) a = document.documentElement.lang || _.get(TS, "interop.I18n.DEFAULT_LOCALE", "en-US");
        if ("pseudo" === a) r = true;
        if (Intl.Collator) i = Intl.Collator(a);
        else i = null;
        e = true;
      };
      var S = function e() {
        if (TS.boot_data) {
          if (TS.boot_data.slack_to_zd_locale) u = TS.boot_data.slack_to_zd_locale;
          if (TS.boot_data.feature_locale_ja_JP) f.ja = "日本語";
        }
      };
      var v = function e() {
        if (TS.boot_data.feature_msg_send_btn && TS.i18n.sendButtonEnabled() && !TS.prefs.getPref("msg_input_send_btn_auto_set")) {
          TS.prefs.setMultiPrefsByAPI({
            msg_input_send_btn: true,
            msg_input_send_btn_auto_set: true
          });
          var t = TS.i18n.t("Just for Japan: a button for sending", "send_btn")();
          var n = TS.i18n.t('Send a message with a quick click, or by pressing {keys}</br>\t\t\tDon‘t like the change? You can always switch back in <button id="send_btn_link_prefs" class="{class}">your preferences</button>.', "send_btn")({
            keys: '<span class="c-keyboard_key c-keyboard_key--slim">' + (TS.model.is_mac ? "⌘" : "Ctrl") + '</span>\n\t\t\t<span class="c-keyboard_key c-keyboard_key--slim">Enter</span>',
            class: "btn_link"
          });
          TS.generic_notification_banner.start({
            h1_copy: t,
            h2_copy: n,
            show_go_button: true,
            go_button_text: TS.i18n.t("Got It", "send_btn")(),
            show_go_link_button: false,
            show_close_button: false
          });
          $("#send_btn_link_prefs").on("click", function() {
            TS.generic_notification_banner.close();
            TS.ui.prefs_dialog.start("advanced", "#msg_input_send_btn_label");
          });
        }
      };
      var T = function e() {
        if (F()) return Promise.resolve();
        return TS.api.call("i18n.translations.get").then(function(e) {
          var t = e.data;
          if (!t || !t.ok) {
            TS.error("Failed to fetch static i18n translations, recieved this response: ", e);
            return;
          }
          TS.model.static_translations_cache_ts = t.cache_ts;
          TS.storage.storeStaticTranslations({
            data: t,
            cache_ts: TS.model.static_translations_cache_ts,
            locale: t.locale
          });
        });
      };
      var m = function e() {
        if (!o)
          if (TS.i18n.canAutoGetKeyboard()) {
            o = E(desktop.app.getLocaleInformation().currentKeyboardLayout);
            desktop.app.onDidChangeKeyboardLayout(j);
          } else if (TS.prefs.prefs_loaded) o = TS.prefs.getPref("keyboard") || "en-US";
        else return "en-US";
        return o;
      };
      var b = /german/;
      var h = /french/;
      var y = /spanish/;
      var k = /iso/;
      var w = /japanese/;
      var E = function e(t) {
        var n = t.toLowerCase();
        if (b.test(n)) return "de";
        else if (h.test(n)) return "fr";
        else if (y.test(n) && k.test(n)) return "es";
        else if (TS.boot_data.feature_locale_ja_JP && w.test(n)) return "ja";
        return "en-US";
      };
      var j = function e(t) {
        o = E(t);
        TS.i18n.keyboard_changed_sig.dispatch();
      };
      var L = function e() {
        if (!TS.model.is_our_app) {
          o = TS.prefs.getPref("keyboard");
          TS.i18n.keyboard_changed_sig.dispatch();
        }
      };
      var C = {
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
      var U = {
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
      var P = function e() {
        Object.keys(U).forEach(function(e) {
          Object.keys(U[e]).forEach(function(t) {
            l[t] = l[t] || {};
            l[t][U[e][t]] = parseInt(e, 10);
          });
        });
      };
      var F = function e() {
        var t = TS.storage.fetchStaticTranslations();
        if (!t) return false;
        if (TS.model.static_translations_cache_ts !== t.cache_ts) return false;
        if (TS.i18n.locale() !== t.locale) return false;
        return true;
      };
      var I = function e(t, n) {
        return function() {
          var e = n + "." + t;
          if (g.indexOf(e) >= 0) return;
          g.push(e);
          var r = "TS.i18n.t(" + JSON.stringify(t) + ", " + JSON.stringify(n) + ")";
          TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + r + " when you meant to do " + r + "()");
          alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + n + "\nString: " + t);
          return "";
        };
      };
      var D = function e(t) {
        var n = false;
        if (t.endsWith(":")) {
          n = true;
          t = t.substr(0, t.length - 1);
        }
        var r = /(<[^>]+>)|(&\w+;)/gi;
        var a = t.match(r) || [];
        t = t.replace(r, "<>");
        var o = parseMessageFormatString(t);
        if (o.error) TS.error(o.error);
        var s;
        t = o.tokens.map(function(e) {
          if ("text" === e[0]) {
            s = e[1];
            _.forOwn(J, function(e) {
              s = s.replace(e[0], e[1]);
            });
            return s.split(" ").map(function(e) {
              e += new Array(Math.floor(.3 * e.length) + 1).join("~");
              return e;
            }).join(" ");
          }
          return e[1];
        }).join("");
        t = t.split("<>").map(function(e, t) {
          return e + (a[t] || "");
        }).join("");
        if (n) t += ":";
        return t;
      };
      var J = {
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
}, [236]);
