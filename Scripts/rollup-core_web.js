webpackJsonp([20], {
  0: function(t, e) {
    t.exports = function(t) {
      if ("undefined" !== typeof execScript) execScript(t);
      else eval.call(null, t);
    };
  },
  12939: function(t, e, n) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
      value: true
    });
    var i = n(12940);
    var s = n.n(i);
    var o = n(2001);
    var a = n.n(o);
    var r = n(2003);
    var l = n.n(r);
    var c = n(12941);
    var h = n.n(c);
  },
  12940: function(t, e) {
    /*!
     * Bootstrap v3.2.0 (http://getbootstrap.com)
     * Copyright 2011-2014 Twitter, Inc.
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     */
    /*!
     * Generated using the Bootstrap Customizer (http://getbootstrap.com/customize/?id=4f55bc1256b03eaa3770)
     * Config saved to config.json and https://gist.github.com/4f55bc1256b03eaa3770
     */
    if ("undefined" === typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery");
    ! function(t) {
      "use strict";
      var e = function(e, n) {
        this.options = n;
        this.$element = t(e).delegate('[data-dismiss="modal"]', "click.dismiss.modal", t.proxy(this.hide, this));
        this.options.remote && this.$element.find(".modal-body").load(this.options.remote);
      };
      e.prototype = {
        constructor: e,
        toggle: function() {
          return this[!this.isShown ? "show" : "hide"]();
        },
        show: function() {
          var e = this,
            n = t.Event("show");
          this.$element.trigger(n);
          if (this.isShown || n.isDefaultPrevented()) return;
          this.isShown = true;
          this.escape();
          this.backdrop(function() {
            var n = t.support.transition && e.$element.hasClass("fade");
            if (!e.$element.parent().length) e.$element.appendTo(document.body);
            e.$element.show();
            if (n) e.$element[0].offsetWidth;
            e.$element.addClass("in").attr("aria-hidden", false);
            e.enforceFocus();
            n ? e.$element.one(t.support.transition.end, function() {
              e.$element.focus().trigger("shown");
            }) : e.$element.focus().trigger("shown");
          });
        },
        hide: function(e) {
          e && e.preventDefault();
          var n = this;
          e = t.Event("hide");
          this.$element.trigger(e);
          if (!this.isShown || e.isDefaultPrevented()) return;
          this.isShown = false;
          this.escape();
          t(document).off("focusin.modal");
          this.$element.removeClass("in").attr("aria-hidden", true);
          t.support.transition && this.$element.hasClass("fade") ? this.hideWithTransition() : this.hideModal();
        },
        enforceFocus: function() {
          var e = this;
          t(document).on("focusin.modal", function(t) {
            if (e.$element[0] !== t.target && !e.$element.has(t.target).length) e.$element.focus();
          });
        },
        escape: function() {
          var t = this;
          if (this.isShown && this.options.keyboard) this.$element.on("keyup.dismiss.modal", function(e) {
            27 == e.which && t.hide();
          });
          else if (!this.isShown) this.$element.off("keyup.dismiss.modal");
        },
        hideWithTransition: function() {
          var e = this,
            n = setTimeout(function() {
              e.$element.off(t.support.transition.end);
              e.hideModal();
            }, 500);
          this.$element.one(t.support.transition.end, function() {
            clearTimeout(n);
            e.hideModal();
          });
        },
        hideModal: function() {
          var t = this;
          this.$element.hide();
          this.backdrop(function() {
            t.removeBackdrop();
            t.$element.trigger("hidden");
          });
        },
        removeBackdrop: function() {
          this.$backdrop.remove();
          this.$backdrop = null;
        },
        backdrop: function(e) {
          var n = this,
            i = this.$element.hasClass("fade") ? "fade" : "";
          if (this.isShown && this.options.backdrop) {
            var s = t.support.transition && i;
            this.$backdrop = t('<div class="modal-backdrop ' + i + '" />');
            if (t("#page_contents").length) this.$backdrop.appendTo("#page_contents");
            else this.$backdrop.appendTo("body");
            this.$backdrop.click("static" == this.options.backdrop ? t.proxy(this.$element[0].focus, this.$element[0]) : t.proxy(this.hide, this));
            if (s) this.$backdrop[0].offsetWidth;
            this.$backdrop.addClass("in");
            if (!e) return;
            s ? this.$backdrop.one(t.support.transition.end, e) : e();
          } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass("in");
            t.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(t.support.transition.end, e) : e();
          } else if (e) e();
        }
      };
      var n = t.fn.modal;
      t.fn.modal = function(n) {
        return this.each(function() {
          var i = t(this),
            s = i.data("modal"),
            o = t.extend({}, t.fn.modal.defaults, i.data(), "object" == typeof n && n);
          if (!s) i.data("modal", s = new e(this, o));
          if ("string" == typeof n) s[n]();
          else if (o.show) s.show();
        });
      };
      t.fn.modal.defaults = {
        backdrop: true,
        keyboard: true,
        show: true
      };
      t.fn.modal.Constructor = e;
      t.fn.modal.noConflict = function() {
        t.fn.modal = n;
        return this;
      };
      t(document).on("click.modal.data-api", '[data-toggle="modal"]', function(e) {
        var n = t(this),
          i = n.attr("href"),
          s = t(n.attr("data-target") || i && i.replace(/.*(?=#[^\s]+$)/, "")),
          o = s.data("modal") ? "toggle" : t.extend({
            remote: !/#/.test(i) && i
          }, s.data(), n.data());
        e.preventDefault();
        s.modal(o).one("hide", function() {
          n.focus();
        });
      });
    }(window.jQuery); + function(t) {
      "use strict";
      var e = function(t, e) {
        this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null;
        this.init("tooltip", t, e);
      };
      e.DEFAULTS = {
        animation: true,
        placement: "top",
        selector: false,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: false,
        container: false
      };
      e.prototype.init = function(e, n, i) {
        this.enabled = true;
        this.type = e;
        this.$element = t(n);
        this.options = this.getOptions(i);
        var s = this.options.trigger.split(" ");
        for (var o = s.length; o--;) {
          var a = s[o];
          if ("click" == a) this.$element.on("click." + this.type, this.options.selector, t.proxy(this.toggle, this));
          else if ("manual" != a) {
            var r = "hover" == a ? "mouseenter" : "focusin";
            var l = "hover" == a ? "mouseleave" : "focusout";
            this.$element.on(r + "." + this.type, this.options.selector, t.proxy(this.enter, this));
            this.$element.on(l + "." + this.type, this.options.selector, t.proxy(this.leave, this));
          }
        }
        this.options.selector ? this._options = t.extend({}, this.options, {
          trigger: "manual",
          selector: ""
        }) : this.fixTitle();
      };
      e.prototype.getDefaults = function() {
        return e.DEFAULTS;
      };
      e.prototype.getOptions = function(e) {
        e = t.extend({}, this.getDefaults(), this.$element.data(), e);
        if (e.delay && "number" == typeof e.delay) e.delay = {
          show: e.delay,
          hide: e.delay
        };
        return e;
      };
      e.prototype.getDelegateOptions = function() {
        var e = {};
        var n = this.getDefaults();
        this._options && t.each(this._options, function(t, i) {
          if (n[t] != i) e[t] = i;
        });
        return e;
      };
      e.prototype.enter = function(e) {
        var n = e instanceof this.constructor ? e : t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        clearTimeout(n.timeout);
        n.hoverState = "in";
        if (!n.options.delay || !n.options.delay.show) return n.show();
        n.timeout = setTimeout(function() {
          if ("in" == n.hoverState) n.show();
        }, n.options.delay.show);
      };
      e.prototype.leave = function(e) {
        var n = e instanceof this.constructor ? e : t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
        clearTimeout(n.timeout);
        n.hoverState = "out";
        if (!n.options.delay || !n.options.delay.hide) return n.hide();
        n.timeout = setTimeout(function() {
          if ("out" == n.hoverState) n.hide();
        }, n.options.delay.hide);
      };
      e.prototype.show = function() {
        var e = t.Event("show.bs." + this.type);
        if (this.hasContent() && this.enabled) {
          this.$element.trigger(e);
          if (e.isDefaultPrevented()) return;
          var n = this;
          var i = this.tip();
          this.setContent();
          if (this.options.animation) i.addClass("fade");
          var s = "function" == typeof this.options.placement ? this.options.placement.call(this, i[0], this.$element[0]) : this.options.placement;
          var o = /\s?auto?\s?/i;
          var a = o.test(s);
          if (a) s = s.replace(o, "") || "top";
          i.detach().css({
            top: 0,
            left: 0,
            display: "block"
          }).addClass(s);
          this.options.container ? i.appendTo(this.options.container) : i.insertAfter(this.$element);
          var r = this.getPosition();
          var l = i[0].offsetWidth;
          var c = i[0].offsetHeight;
          if (a) {
            var h = this.$element.parent();
            var d = s;
            var u = document.documentElement.scrollTop || document.body.scrollTop;
            var p = "body" == this.options.container ? window.innerWidth : h.outerWidth();
            var f = "body" == this.options.container ? window.innerHeight : h.outerHeight();
            var m = "body" == this.options.container ? 0 : h.offset().left;
            s = "bottom" == s && r.top + r.height + c - u > f ? "top" : "top" == s && r.top - u - c < 0 ? "bottom" : "right" == s && r.right + l > p ? "left" : "left" == s && r.left - l < m ? "right" : s;
            i.removeClass(d).addClass(s);
          }
          var v = this.getCalculatedOffset(s, r, l, c);
          this.applyPlacement(v, s);
          this.hoverState = null;
          var g = function() {
            n.$element.trigger("shown.bs." + n.type);
          };
          t.support.transition && this.$tip.hasClass("fade") ? i.one(t.support.transition.end, g).emulateTransitionEnd(150) : g();
        }
      };
      e.prototype.applyPlacement = function(e, n) {
        var i;
        var s = this.tip();
        var o = s[0].offsetWidth;
        var a = s[0].offsetHeight;
        var r = parseInt(s.css("margin-top"), 10);
        var l = parseInt(s.css("margin-left"), 10);
        if (isNaN(r)) r = 0;
        if (isNaN(l)) l = 0;
        e.top = e.top + r;
        e.left = e.left + l;
        t.offset.setOffset(s[0], t.extend({
          using: function(t) {
            s.css({
              top: Math.round(t.top),
              left: Math.round(t.left)
            });
          }
        }, e), 0);
        s.addClass("in");
        var c = s[0].offsetWidth;
        var h = s[0].offsetHeight;
        if ("top" == n && h != a) {
          i = true;
          e.top = e.top + a - h;
        }
        if (/bottom|top/.test(n)) {
          var d = 0;
          if (e.left < 0) {
            d = -2 * e.left;
            e.left = 0;
            s.offset(e);
            c = s[0].offsetWidth;
            h = s[0].offsetHeight;
          }
          this.replaceArrow(d - o + c, c, "left");
        } else this.replaceArrow(h - a, h, "top");
        if (i) s.offset(e);
      };
      e.prototype.replaceArrow = function(t, e, n) {
        this.arrow().css(n, t ? 50 * (1 - t / e) + "%" : "");
      };
      e.prototype.setContent = function() {
        var t = this.tip();
        var e = this.getTitle();
        t.find(".tooltip-inner")[this.options.html ? "html" : "text"](e).html(t.find(".tooltip-inner").html().replace(/\r/g, "<br>"));
        t.removeClass("fade in top bottom left right");
      };
      e.prototype.hide = function() {
        var e = this;
        var n = this.tip();
        var i = t.Event("hide.bs." + this.type);

        function s() {
          if ("in" != e.hoverState) n.detach();
          e.$element.trigger("hidden.bs." + e.type);
        }
        this.$element.trigger(i);
        if (i.isDefaultPrevented()) return;
        n.removeClass("in");
        t.support.transition && this.$tip.hasClass("fade") ? n.one(t.support.transition.end, s).emulateTransitionEnd(150) : s();
        this.hoverState = null;
        return this;
      };
      e.prototype.fixTitle = function() {
        var t = this.$element;
        if (t.attr("title") || "string" != typeof t.attr("data-original-title")) t.attr("data-original-title", t.attr("title") || "").attr("title", "");
      };
      e.prototype.hasContent = function() {
        return this.getTitle();
      };
      e.prototype.getPosition = function() {
        var e = this.$element[0];
        return t.extend({}, "function" == typeof e.getBoundingClientRect ? e.getBoundingClientRect() : {
          width: e.offsetWidth,
          height: e.offsetHeight
        }, this.$element.offset());
      };
      e.prototype.getCalculatedOffset = function(t, e, n, i) {
        return "bottom" == t ? {
          top: e.top + e.height,
          left: e.left + e.width / 2 - n / 2
        } : "top" == t ? {
          top: e.top - i,
          left: e.left + e.width / 2 - n / 2
        } : "left" == t ? {
          top: e.top + e.height / 2 - i / 2,
          left: e.left - n
        } : {
          top: e.top + e.height / 2 - i / 2,
          left: e.left + e.width
        };
      };
      e.prototype.getTitle = function() {
        var t;
        var e = this.$element;
        var n = this.options;
        t = e.attr("data-original-title") || ("function" == typeof n.title ? n.title.call(e[0]) : n.title);
        return t;
      };
      e.prototype.tip = function() {
        return this.$tip = this.$tip || t(this.options.template);
      };
      e.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
      };
      e.prototype.validate = function() {
        if (!this.$element[0].parentNode) {
          this.hide();
          this.$element = null;
          this.options = null;
        }
      };
      e.prototype.enable = function() {
        this.enabled = true;
      };
      e.prototype.disable = function() {
        this.enabled = false;
      };
      e.prototype.toggleEnabled = function() {
        this.enabled = !this.enabled;
      };
      e.prototype.toggle = function(e) {
        var n = e ? t(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
        n.tip().hasClass("in") ? n.leave(n) : n.enter(n);
      };
      e.prototype.destroy = function() {
        clearTimeout(this.timeout);
        this.hide().$element.off("." + this.type).removeData("bs." + this.type);
      };
      var n = t.fn.tooltip;
      t.fn.tooltip = function(n) {
        return this.each(function() {
          var i = t(this);
          var s = i.data("bs.tooltip");
          var o = "object" == typeof n && n;
          if (!s && "destroy" == n) return;
          if (!s) i.data("bs.tooltip", s = new e(this, o));
          if ("string" == typeof n) s[n]();
        });
      };
      t.fn.tooltip.Constructor = e;
      t.fn.tooltip.noConflict = function() {
        t.fn.tooltip = n;
        return this;
      };
    }(jQuery); + function(t) {
      "use strict";

      function e() {
        var t = document.createElement("bootstrap");
        var e = {
          WebkitTransition: "webkitTransitionEnd",
          MozTransition: "transitionend",
          OTransition: "oTransitionEnd otransitionend",
          transition: "transitionend"
        };
        for (var n in e)
          if (void 0 !== t.style[n]) return {
            end: e[n]
          };
        return false;
      }
      t.fn.emulateTransitionEnd = function(e) {
        var n = false,
          i = this;
        t(this).one(t.support.transition.end, function() {
          n = true;
        });
        var s = function() {
          if (!n) t(i).trigger(t.support.transition.end);
        };
        setTimeout(s, e);
        return this;
      };
      t(function() {
        t.support.transition = e();
      });
    }(jQuery);
  },
  12941: function(t, e, n) {
    n(0)(n(5449));
  },
  2001: function(t, e, n) {
    n(0)(n(2002));
  },
  2002: function(t, e) {
    t.exports = "/**\n * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.\n *\n * @version 0.6.11\n * @codingstandard ftlabs-jsv2\n * @copyright The Financial Times Limited [All Rights Reserved]\n * @license MIT License (see LICENSE.txt)\n */\n\n/*jslint browser:true, node:true*/\n/*global define, Event, Node*/\n\n\n/**\n * Instantiate fast-clicking listeners on the specificed layer.\n *\n * @constructor\n * @param {Element} layer The layer to listen on\n */\nfunction FastClick(layer) {\n\t'use strict';\n\tvar oldOnClick, self = this;\n\n\n\t/**\n\t * Whether a click is currently being tracked.\n\t *\n\t * @type boolean\n\t */\n\tthis.trackingClick = false;\n\n\n\t/**\n\t * Timestamp for when when click tracking started.\n\t *\n\t * @type number\n\t */\n\tthis.trackingClickStart = 0;\n\n\n\t/**\n\t * The element being tracked for a click.\n\t *\n\t * @type EventTarget\n\t */\n\tthis.targetElement = null;\n\n\n\t/**\n\t * X-coordinate of touch start event.\n\t *\n\t * @type number\n\t */\n\tthis.touchStartX = 0;\n\n\n\t/**\n\t * Y-coordinate of touch start event.\n\t *\n\t * @type number\n\t */\n\tthis.touchStartY = 0;\n\n\n\t/**\n\t * ID of the last touch, retrieved from Touch.identifier.\n\t *\n\t * @type number\n\t */\n\tthis.lastTouchIdentifier = 0;\n\n\n\t/**\n\t * Touchmove boundary, beyond which a click will be cancelled.\n\t *\n\t * @type number\n\t */\n\tthis.touchBoundary = 10;\n\n\n\t/**\n\t * The FastClick layer.\n\t *\n\t * @type Element\n\t */\n\tthis.layer = layer;\n\n\tif (!layer || !layer.nodeType) {\n\t\tthrow new TypeError('Layer must be a document node');\n\t}\n\n\t/** @type function() */\n\tthis.onClick = function() { return FastClick.prototype.onClick.apply(self, arguments); };\n\n\t/** @type function() */\n\tthis.onMouse = function() { return FastClick.prototype.onMouse.apply(self, arguments); };\n\n\t/** @type function() */\n\tthis.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(self, arguments); };\n\n\t/** @type function() */\n\tthis.onTouchMove = function() { return FastClick.prototype.onTouchMove.apply(self, arguments); };\n\n\t/** @type function() */\n\tthis.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(self, arguments); };\n\n\t/** @type function() */\n\tthis.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(self, arguments); };\n\n\tif (FastClick.notNeeded(layer)) {\n\t\treturn;\n\t}\n\n\t// Set up event handlers as required\n\tif (this.deviceIsAndroid) {\n\t\tlayer.addEventListener('mouseover', this.onMouse, true);\n\t\tlayer.addEventListener('mousedown', this.onMouse, true);\n\t\tlayer.addEventListener('mouseup', this.onMouse, true);\n\t}\n\n\tlayer.addEventListener('click', this.onClick, true);\n\tlayer.addEventListener('touchstart', this.onTouchStart, false);\n\tlayer.addEventListener('touchmove', this.onTouchMove, false);\n\tlayer.addEventListener('touchend', this.onTouchEnd, false);\n\tlayer.addEventListener('touchcancel', this.onTouchCancel, false);\n\n\t// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)\n\t// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick\n\t// layer when they are cancelled.\n\tif (!Event.prototype.stopImmediatePropagation) {\n\t\tlayer.removeEventListener = function(type, callback, capture) {\n\t\t\tvar rmv = Node.prototype.removeEventListener;\n\t\t\tif (type === 'click') {\n\t\t\t\trmv.call(layer, type, callback.hijacked || callback, capture);\n\t\t\t} else {\n\t\t\t\trmv.call(layer, type, callback, capture);\n\t\t\t}\n\t\t};\n\n\t\tlayer.addEventListener = function(type, callback, capture) {\n\t\t\tvar adv = Node.prototype.addEventListener;\n\t\t\tif (type === 'click') {\n\t\t\t\tadv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {\n\t\t\t\t\tif (!event.propagationStopped) {\n\t\t\t\t\t\tcallback(event);\n\t\t\t\t\t}\n\t\t\t\t}), capture);\n\t\t\t} else {\n\t\t\t\tadv.call(layer, type, callback, capture);\n\t\t\t}\n\t\t};\n\t}\n\n\t// If a handler is already declared in the element's onclick attribute, it will be fired before\n\t// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and\n\t// adding it as listener.\n\tif (typeof layer.onclick === 'function') {\n\n\t\t// Android browser on at least 3.2 requires a new reference to the function in layer.onclick\n\t\t// - the old one won't work if passed to addEventListener directly.\n\t\toldOnClick = layer.onclick;\n\t\tlayer.addEventListener('click', function(event) {\n\t\t\toldOnClick(event);\n\t\t}, false);\n\t\tlayer.onclick = null;\n\t}\n}\n\n\n/**\n * Android requires exceptions.\n *\n * @type boolean\n */\nFastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;\n\n\n/**\n * iOS requires exceptions.\n *\n * @type boolean\n */\nFastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);\n\n\n/**\n * iOS 4 requires an exception for select elements.\n *\n * @type boolean\n */\nFastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && (/OS 4_\\d(_\\d)?/).test(navigator.userAgent);\n\n\n/**\n * iOS 6.0(+?) requires the target element to be manually derived\n *\n * @type boolean\n */\nFastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && (/OS ([6-9]|\\d{2})_\\d/).test(navigator.userAgent);\n\n\n/**\n * Determine whether a given element requires a native click.\n *\n * @param {EventTarget|Element} target Target DOM element\n * @returns {boolean} Returns true if the element needs a native click\n */\nFastClick.prototype.needsClick = function(target) {\n\t'use strict';\n\tswitch (target.nodeName.toLowerCase()) {\n\n\t// Don't send a synthetic click to disabled inputs (issue #62)\n\tcase 'button':\n\tcase 'select':\n\tcase 'textarea':\n\t\tif (target.disabled) {\n\t\t\treturn true;\n\t\t}\n\n\t\tbreak;\n\tcase 'input':\n\n\t\t// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)\n\t\tif ((this.deviceIsIOS && target.type === 'file') || target.disabled) {\n\t\t\treturn true;\n\t\t}\n\n\t\tbreak;\n\tcase 'label':\n\tcase 'video':\n\t\treturn true;\n\t}\n\n\treturn (/\\bneedsclick\\b/).test(target.className);\n};\n\n\n/**\n * Determine whether a given element requires a call to focus to simulate click into element.\n *\n * @param {EventTarget|Element} target Target DOM element\n * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.\n */\nFastClick.prototype.needsFocus = function(target) {\n\t'use strict';\n\tswitch (target.nodeName.toLowerCase()) {\n\tcase 'textarea':\n\t\treturn true;\n\tcase 'select':\n\t\treturn !this.deviceIsAndroid;\n\tcase 'input':\n\t\tswitch (target.type) {\n\t\tcase 'button':\n\t\tcase 'checkbox':\n\t\tcase 'file':\n\t\tcase 'image':\n\t\tcase 'radio':\n\t\tcase 'submit':\n\t\t\treturn false;\n\t\t}\n\n\t\t// No point in attempting to focus disabled inputs\n\t\treturn !target.disabled && !target.readOnly;\n\tdefault:\n\t\treturn (/\\bneedsfocus\\b/).test(target.className);\n\t}\n};\n\n\n/**\n * Send a click event to the specified element.\n *\n * @param {EventTarget|Element} targetElement\n * @param {Event} event\n */\nFastClick.prototype.sendClick = function(targetElement, event) {\n\t'use strict';\n\tvar clickEvent, touch;\n\n\t// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)\n\tif (document.activeElement && document.activeElement !== targetElement) {\n\t\tdocument.activeElement.blur();\n\t}\n\n\ttouch = event.changedTouches[0];\n\n\t// Synthesise a click event, with an extra attribute so it can be tracked\n\tclickEvent = document.createEvent('MouseEvents');\n\tclickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);\n\tclickEvent.forwardedTouchEvent = true;\n\ttargetElement.dispatchEvent(clickEvent);\n};\n\nFastClick.prototype.determineEventType = function(targetElement) {\n\t'use strict';\n\n\t//Issue #159: Android Chrome Select Box does not open with a synthetic click event\n\tif (this.deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {\n\t\treturn 'mousedown';\n\t}\n\n\treturn 'click';\n};\n\n\n/**\n * @param {EventTarget|Element} targetElement\n */\nFastClick.prototype.focus = function(targetElement) {\n\t'use strict';\n\tvar length;\n\n\t// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.\n\tif (this.deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {\n\t\tlength = targetElement.value.length;\n\t\ttargetElement.setSelectionRange(length, length);\n\t} else {\n\t\ttargetElement.focus();\n\t}\n};\n\n\n/**\n * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.\n *\n * @param {EventTarget|Element} targetElement\n */\nFastClick.prototype.updateScrollParent = function(targetElement) {\n\t'use strict';\n\tvar scrollParent, parentElement;\n\n\tscrollParent = targetElement.fastClickScrollParent;\n\n\t// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the\n\t// target element was moved to another parent.\n\tif (!scrollParent || !scrollParent.contains(targetElement)) {\n\t\tparentElement = targetElement;\n\t\tdo {\n\t\t\tif (parentElement.scrollHeight > parentElement.offsetHeight) {\n\t\t\t\tscrollParent = parentElement;\n\t\t\t\ttargetElement.fastClickScrollParent = parentElement;\n\t\t\t\tbreak;\n\t\t\t}\n\n\t\t\tparentElement = parentElement.parentElement;\n\t\t} while (parentElement);\n\t}\n\n\t// Always update the scroll top tracker if possible.\n\tif (scrollParent) {\n\t\tscrollParent.fastClickLastScrollTop = scrollParent.scrollTop;\n\t}\n};\n\n\n/**\n * @param {EventTarget} targetElement\n * @returns {Element|EventTarget}\n */\nFastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {\n\t'use strict';\n\n\t// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.\n\tif (eventTarget.nodeType === Node.TEXT_NODE) {\n\t\treturn eventTarget.parentNode;\n\t}\n\n\treturn eventTarget;\n};\n\n\n/**\n * On touch start, record the position and scroll offset.\n *\n * @param {Event} event\n * @returns {boolean}\n */\nFastClick.prototype.onTouchStart = function(event) {\n\t'use strict';\n\tvar targetElement, touch, selection;\n\n\t// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).\n\tif (event.targetTouches.length > 1) {\n\t\treturn true;\n\t}\n\n\ttargetElement = this.getTargetElementFromEventTarget(event.target);\n\ttouch = event.targetTouches[0];\n\n\tif (this.deviceIsIOS) {\n\n\t\t// Only trusted events will deselect text on iOS (issue #49)\n\t\tselection = window.getSelection();\n\t\tif (selection.rangeCount && !selection.isCollapsed) {\n\t\t\treturn true;\n\t\t}\n\n\t\tif (!this.deviceIsIOS4) {\n\n\t\t\t// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):\n\t\t\t// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched\n\t\t\t// with the same identifier as the touch event that previously triggered the click that triggered the alert.\n\t\t\t// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an\n\t\t\t// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.\n\t\t\tif (touch.identifier === this.lastTouchIdentifier) {\n\t\t\t\tevent.preventDefault();\n\t\t\t\treturn false;\n\t\t\t}\n\n\t\t\tthis.lastTouchIdentifier = touch.identifier;\n\n\t\t\t// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:\n\t\t\t// 1) the user does a fling scroll on the scrollable layer\n\t\t\t// 2) the user stops the fling scroll with another tap\n\t\t\t// then the event.target of the last 'touchend' event will be the element that was under the user's finger\n\t\t\t// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check\n\t\t\t// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).\n\t\t\tthis.updateScrollParent(targetElement);\n\t\t}\n\t}\n\n\tthis.trackingClick = true;\n\tthis.trackingClickStart = event.timeStamp;\n\tthis.targetElement = targetElement;\n\n\tthis.touchStartX = touch.pageX;\n\tthis.touchStartY = touch.pageY;\n\n\t// Prevent phantom clicks on fast double-tap (issue #36)\n\tif ((event.timeStamp - this.lastClickTime) < 200) {\n\t\tevent.preventDefault();\n\t}\n\n\treturn true;\n};\n\n\n/**\n * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.\n *\n * @param {Event} event\n * @returns {boolean}\n */\nFastClick.prototype.touchHasMoved = function(event) {\n\t'use strict';\n\tvar touch = event.changedTouches[0], boundary = this.touchBoundary;\n\n\tif (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {\n\t\treturn true;\n\t}\n\n\treturn false;\n};\n\n\n/**\n * Update the last position.\n *\n * @param {Event} event\n * @returns {boolean}\n */\nFastClick.prototype.onTouchMove = function(event) {\n\t'use strict';\n\tif (!this.trackingClick) {\n\t\treturn true;\n\t}\n\n\t// If the touch has moved, cancel the click tracking\n\tif (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {\n\t\tthis.trackingClick = false;\n\t\tthis.targetElement = null;\n\t}\n\n\treturn true;\n};\n\n\n/**\n * Attempt to find the labelled control for the given label element.\n *\n * @param {EventTarget|HTMLLabelElement} labelElement\n * @returns {Element|null}\n */\nFastClick.prototype.findControl = function(labelElement) {\n\t'use strict';\n\n\t// Fast path for newer browsers supporting the HTML5 control attribute\n\tif (labelElement.control !== undefined) {\n\t\treturn labelElement.control;\n\t}\n\n\t// All browsers under test that support touch events also support the HTML5 htmlFor attribute\n\tif (labelElement.htmlFor) {\n\t\treturn document.getElementById(labelElement.htmlFor);\n\t}\n\n\t// If no for attribute exists, attempt to retrieve the first labellable descendant element\n\t// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label\n\treturn labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');\n};\n\n\n/**\n * On touch end, determine whether to send a click event at once.\n *\n * @param {Event} event\n * @returns {boolean}\n */\nFastClick.prototype.onTouchEnd = function(event) {\n\t'use strict';\n\tvar forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;\n\n\tif (!this.trackingClick) {\n\t\treturn true;\n\t}\n\n\t// Prevent phantom clicks on fast double-tap (issue #36)\n\tif ((event.timeStamp - this.lastClickTime) < 200) {\n\t\tthis.cancelNextClick = true;\n\t\treturn true;\n\t}\n\n\t// Reset to prevent wrong click cancel on input (issue #156).\n\tthis.cancelNextClick = false;\n\n\tthis.lastClickTime = event.timeStamp;\n\n\ttrackingClickStart = this.trackingClickStart;\n\tthis.trackingClick = false;\n\tthis.trackingClickStart = 0;\n\n\t// On some iOS devices, the targetElement supplied with the event is invalid if the layer\n\t// is performing a transition or scroll, and has to be re-detected manually. Note that\n\t// for this to function correctly, it must be called *after* the event target is checked!\n\t// See issue #57; also filed as rdar://13048589 .\n\tif (this.deviceIsIOSWithBadTarget) {\n\t\ttouch = event.changedTouches[0];\n\n\t\t// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null\n\t\ttargetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;\n\t\ttargetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;\n\t}\n\n\ttargetTagName = targetElement.tagName.toLowerCase();\n\tif (targetTagName === 'label') {\n\t\tforElement = this.findControl(targetElement);\n\t\tif (forElement) {\n\t\t\tthis.focus(targetElement);\n\t\t\tif (this.deviceIsAndroid) {\n\t\t\t\treturn false;\n\t\t\t}\n\n\t\t\ttargetElement = forElement;\n\t\t}\n\t} else if (this.needsFocus(targetElement)) {\n\n\t\t// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.\n\t\t// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).\n\t\tif ((event.timeStamp - trackingClickStart) > 100 || (this.deviceIsIOS && window.top !== window && targetTagName === 'input')) {\n\t\t\tthis.targetElement = null;\n\t\t\treturn false;\n\t\t}\n\n\t\tthis.focus(targetElement);\n\n\t\t// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.\n\t\tif (!this.deviceIsIOS4 || targetTagName !== 'select') {\n\t\t\tthis.targetElement = null;\n\t\t\tevent.preventDefault();\n\t\t}\n\n\t\treturn false;\n\t}\n\n\tif (this.deviceIsIOS && !this.deviceIsIOS4) {\n\n\t\t// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled\n\t\t// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).\n\t\tscrollParent = targetElement.fastClickScrollParent;\n\t\tif (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {\n\t\t\treturn true;\n\t\t}\n\t}\n\n\t// Prevent the actual click from going though - unless the target node is marked as requiring\n\t// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.\n\tif (!this.needsClick(targetElement)) {\n\t\tevent.preventDefault();\n\t\tthis.sendClick(targetElement, event);\n\t}\n\n\treturn false;\n};\n\n\n/**\n * On touch cancel, stop tracking the click.\n *\n * @returns {void}\n */\nFastClick.prototype.onTouchCancel = function() {\n\t'use strict';\n\tthis.trackingClick = false;\n\tthis.targetElement = null;\n};\n\n\n/**\n * Determine mouse events which should be permitted.\n *\n * @param {Event} event\n * @returns {boolean}\n */\nFastClick.prototype.onMouse = function(event) {\n\t'use strict';\n\n\t// If a target element was never set (because a touch event was never fired) allow the event\n\tif (!this.targetElement) {\n\t\treturn true;\n\t}\n\n\tif (event.forwardedTouchEvent) {\n\t\treturn true;\n\t}\n\n\t// Programmatically generated events targeting a specific element should be permitted\n\tif (!event.cancelable) {\n\t\treturn true;\n\t}\n\n\t// Derive and check the target element to see whether the mouse event needs to be permitted;\n\t// unless explicitly enabled, prevent non-touch click events from triggering actions,\n\t// to prevent ghost/doubleclicks.\n\tif (!this.needsClick(this.targetElement) || this.cancelNextClick) {\n\n\t\t// Prevent any user-added listeners declared on FastClick element from being fired.\n\t\tif (event.stopImmediatePropagation) {\n\t\t\tevent.stopImmediatePropagation();\n\t\t} else {\n\n\t\t\t// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)\n\t\t\tevent.propagationStopped = true;\n\t\t}\n\n\t\t// Cancel the event\n\t\tevent.stopPropagation();\n\t\tevent.preventDefault();\n\n\t\treturn false;\n\t}\n\n\t// If the mouse event is permitted, return true for the action to go through.\n\treturn true;\n};\n\n\n/**\n * On actual clicks, determine whether this is a touch-generated click, a click action occurring\n * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or\n * an actual click which should be permitted.\n *\n * @param {Event} event\n * @returns {boolean}\n */\nFastClick.prototype.onClick = function(event) {\n\t'use strict';\n\tvar permitted;\n\n\t// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.\n\tif (this.trackingClick) {\n\t\tthis.targetElement = null;\n\t\tthis.trackingClick = false;\n\t\treturn true;\n\t}\n\n\t// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.\n\tif (event.target.type === 'submit' && event.detail === 0) {\n\t\treturn true;\n\t}\n\n\tpermitted = this.onMouse(event);\n\n\t// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.\n\tif (!permitted) {\n\t\tthis.targetElement = null;\n\t}\n\n\t// If clicks are permitted, return true for the action to go through.\n\treturn permitted;\n};\n\n\n/**\n * Remove all FastClick's event listeners.\n *\n * @returns {void}\n */\nFastClick.prototype.destroy = function() {\n\t'use strict';\n\tvar layer = this.layer;\n\n\tif (this.deviceIsAndroid) {\n\t\tlayer.removeEventListener('mouseover', this.onMouse, true);\n\t\tlayer.removeEventListener('mousedown', this.onMouse, true);\n\t\tlayer.removeEventListener('mouseup', this.onMouse, true);\n\t}\n\n\tlayer.removeEventListener('click', this.onClick, true);\n\tlayer.removeEventListener('touchstart', this.onTouchStart, false);\n\tlayer.removeEventListener('touchmove', this.onTouchMove, false);\n\tlayer.removeEventListener('touchend', this.onTouchEnd, false);\n\tlayer.removeEventListener('touchcancel', this.onTouchCancel, false);\n};\n\n\n/**\n * Check whether FastClick is needed.\n *\n * @param {Element} layer The layer to listen on\n */\nFastClick.notNeeded = function(layer) {\n\t'use strict';\n\tvar metaViewport;\n\tvar chromeVersion;\n\n\t// Devices that don't support touch don't need FastClick\n\tif (typeof window.ontouchstart === 'undefined') {\n\t\treturn true;\n\t}\n\n\t// Chrome version - zero for other browsers\n\tchromeVersion = +(/Chrome\\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];\n\n\tif (chromeVersion) {\n\n\t\tif (FastClick.prototype.deviceIsAndroid) {\n\t\t\tmetaViewport = document.querySelector('meta[name=viewport]');\n\t\t\t\n\t\t\tif (metaViewport) {\n\t\t\t\t// Chrome on Android with user-scalable=\"no\" doesn't need FastClick (issue #89)\n\t\t\t\tif (metaViewport.content.indexOf('user-scalable=no') !== -1) {\n\t\t\t\t\treturn true;\n\t\t\t\t}\n\t\t\t\t// Chrome 32 and above with width=device-width or less don't need FastClick\n\t\t\t\tif (chromeVersion > 31 && window.innerWidth <= window.screen.width) {\n\t\t\t\t\treturn true;\n\t\t\t\t}\n\t\t\t}\n\n\t\t// Chrome desktop doesn't need FastClick (issue #15)\n\t\t} else {\n\t\t\treturn true;\n\t\t}\n\t}\n\n\t// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)\n\tif (layer.style.msTouchAction === 'none') {\n\t\treturn true;\n\t}\n\n\treturn false;\n};\n\n\n/**\n * Factory method for creating a FastClick object\n *\n * @param {Element} layer The layer to listen on\n */\nFastClick.attach = function(layer) {\n\t'use strict';\n\treturn new FastClick(layer);\n};\n\n\nif (typeof define !== 'undefined' && define.amd) {\n\n\t// AMD. Register as an anonymous module.\n\tdefine(function() {\n\t\t'use strict';\n\t\treturn FastClick;\n\t});\n} else if (typeof module !== 'undefined' && module.exports) {\n\tmodule.exports = FastClick.attach;\n\tmodule.exports.FastClick = FastClick;\n} else {\n\twindow.FastClick = FastClick;\n}";
  },
  2003: function(t, e, n) {
    n(0)(n(2004));
  },
  2004: function(t, e) {
    t.exports = "/*!\n * headroom.js v0.7.0 - Give your page some headroom. Hide your header until you need it\n * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/headroom.js\n * License: MIT\n */\n\n(function (window, document) {\n\n    'use strict';\n\n    /* exported features */\n\n    var features = {\n        bind: !!(function () {\n        }.bind),\n        classList: 'classList' in document.documentElement,\n        rAF: !!(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame)\n    };\n    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;\n\n    /**\n     * Handles debouncing of events via requestAnimationFrame\n     * @see http://www.html5rocks.com/en/tutorials/speed/animations/\n     * @param {Function} callback The callback to handle whichever event\n     */\n    function Debouncer(callback) {\n        this.callback = callback;\n        this.ticking = false;\n    }\n\n    Debouncer.prototype = {\n        constructor: Debouncer,\n\n        /**\n         * dispatches the event to the supplied callback\n         * @private\n         */\n        update: function () {\n            this.callback && this.callback();\n            this.ticking = false;\n        },\n\n        /**\n         * ensures events don't get stacked\n         * @private\n         */\n        requestTick: function () {\n            if (!this.ticking) {\n                requestAnimationFrame(this.rafCallback || (this.rafCallback = this.update.bind(this)));\n                this.ticking = true;\n            }\n        },\n\n        /**\n         * Attach this as the event listeners\n         */\n        handleEvent: function () {\n            this.requestTick();\n        }\n    };\n\n    /**\n     * Check if object is part of the DOM\n     * @constructor\n     * @param {Object} obj element to check\n     */\n    function isDOMElement(obj) {\n        return obj && typeof window !== 'undefined' && (obj === window || obj.nodeType);\n    }\n\n    /**\n     * Helper function for extending objects\n     */\n    function extend(object /*, takes multiple arguments ... */) {\n        if (arguments.length <= 0) {\n            throw new Error('Missing arguments in extend function');\n        }\n\n        var result = object || {},\n            key,\n            i;\n\n        for (i = 1; i < arguments.length; i++) {\n            var replacement = arguments[i] || {};\n\n            for (key in replacement) {\n                // Recurse into object except if the object is a DOM element\n                if (typeof result[key] === 'object' && !isDOMElement(result[key])) {\n                    result[key] = extend(result[key], replacement[key]);\n                }\n                else {\n                    result[key] = result[key] || replacement[key];\n                }\n            }\n        }\n\n        return result;\n    }\n\n    /**\n     * Helper function for normalizing tolerance option to object format\n     */\n    function normalizeTolerance(t) {\n        return t === Object(t) ? t : {down: t, up: t};\n    }\n\n    /**\n     * UI enhancement for fixed headers.\n     * Hides header when scrolling down\n     * Shows header when scrolling up\n     * @constructor\n     * @param {DOMElement} elem the header element\n     * @param {Object} options options for the widget\n     */\n    function Headroom(elem, options) {\n\tvar instanceOptions = _.extend({}, Headroom.options, options);\n\t// a soul died here. RIP\n\n        this.lastKnownScrollY = 0;\n        this.elem = elem;\n        this.debouncer = new Debouncer(this.update.bind(this));\n        this.tolerance = normalizeTolerance(instanceOptions.tolerance);\n        this.classes = instanceOptions.classes;\n        this.offset = instanceOptions.offset;\n        this.searchOffset = instanceOptions.searchOffset;\n        this.scroller = instanceOptions.scroller;\n        this.initialised = false;\n        this.onPin = instanceOptions.onPin;\n        this.onUnpin = instanceOptions.onUnpin;\n        this.onTop = instanceOptions.onTop;\n        this.onNotTop = instanceOptions.onNotTop;\n\n\t// hide or show the nav search bar based on where you scroll\n\tthis.search = instanceOptions.search;\n\tthis.classes.initial_search = this.search ? 'hideSearch' : 'showSearch';\n\n\t// hide or show the nav based on where you scroll\n\t// short circuits the headroom functionality\n\tthis.nav = instanceOptions.nav;\n    }\n\n    Headroom.prototype = {\n        constructor: Headroom,\n\n        /**\n         * Initialises the widget\n         */\n        init: function () {\n            if (!Headroom.cutsTheMustard) {\n                return;\n            }\n\n\t    // apps directory homepage puts \"hidesearch\" on the nav\n\t    // to prevent it being visible before the js loads.\n\t    // ln 156-158 removes that class, if its present, and puts\n\t    // the proper \"inital search\" class on it instead\n\t    if (this.elem.classList.contains(this.classes.hideSearch)) {\n\t\t    this.elem.classList.remove(this.classes.hideSearch);\n\t    }\n            this.elem.classList.add(this.classes.initial_headroom, this.classes.initial_search);\n\n            // defer event registration to handle browser\n            // potentially restoring previous scroll position\n            setTimeout(this.attachEvent.bind(this), 100);\n\n            return this;\n        },\n\n        /**\n         * Unattaches events and removes any classes that were added\n         */\n        destroy: function () {\n            var classes = this.classes;\n\n            this.initialised = false;\n            this.elem.classList.remove(classes.unpinned, classes.pinned, classes.top, classes.initial_headroom, classes.initial_search);\n            this.scroller.removeEventListener('scroll', this.debouncer, false);\n        },\n\n        /**\n         * Attaches the scroll event\n         * @private\n         */\n        attachEvent: function () {\n            if (!this.initialised) {\n                this.lastKnownScrollY = this.getScrollY();\n                this.initialised = true;\n                this.scroller.addEventListener('scroll', this.debouncer, false);\n\n                this.debouncer.handleEvent();\n            }\n        },\n\n        /**\n         * Unpins the header if it's currently pinned\n         */\n        unpin: function () {\n            var classList = this.elem.classList,\n                classes = this.classes;\n\n            if (classList.contains(classes.pinned) || !classList.contains(classes.unpinned)) {\n                classList.add(classes.unpinned);\n                classList.remove(classes.pinned);\n                this.onUnpin && this.onUnpin.call(this);\n            }\n        },\n\n        /**\n         * Pins the header if it's currently unpinned\n         */\n        pin: function () {\n            var classList = this.elem.classList,\n                classes = this.classes;\n\n            if (classList.contains(classes.unpinned)) {\n                classList.remove(classes.unpinned);\n                classList.add(classes.pinned);\n                this.onPin && this.onPin.call(this);\n            }\n        },\n\n        showSearch: function () {\n            var classList = this.elem.classList,\n                classes = this.classes;\n            if (classList.contains(classes.hideSearch)) {\n                classList.remove(classes.hideSearch);\n                classList.add(classes.showSearch);\n            }\n        },\n\n        hideSearch: function () {\n            var classList = this.elem.classList,\n                classes = this.classes;\n\n            if (classList.contains(classes.showSearch)) {\n                classList.remove(classes.showSearch);\n                classList.add(classes.hideSearch);\n            }\n        },\n\n        /**\n         * Handles the top states\n         */\n        top: function () {\n            var classList = this.elem.classList,\n                classes = this.classes;\n\n            if (!classList.contains(classes.top)) {\n                classList.add(classes.top);\n                classList.remove(classes.notTop);\n                this.onTop && this.onTop.call(this);\n            }\n        },\n\n        /**\n         * Handles the not top state\n         */\n        notTop: function () {\n            var classList = this.elem.classList,\n                classes = this.classes;\n\n            if (!classList.contains(classes.notTop)) {\n                classList.add(classes.notTop);\n                classList.remove(classes.top);\n                this.onNotTop && this.onNotTop.call(this);\n            }\n        },\n\n        /**\n         * Gets the Y scroll position\n         * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY\n         * @return {Number} pixels the page has scrolled along the Y-axis\n         */\n        getScrollY: function () {\n            return (this.scroller.pageYOffset !== undefined)\n                ? this.scroller.pageYOffset\n                : (this.scroller.scrollTop !== undefined)\n                    ? this.scroller.scrollTop\n                    : (document.documentElement || document.body.parentNode || document.body).scrollTop;\n        },\n\n        /**\n         * Gets the height of the viewport\n         * @see http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript\n         * @return {int} the height of the viewport in pixels\n         */\n        getViewportHeight: function () {\n            return window.innerHeight\n                || document.documentElement.clientHeight\n                || document.body.clientHeight;\n        },\n\n        /**\n         * Gets the height of the document\n         * @see http://james.padolsey.com/javascript/get-document-height-cross-browser/\n         * @return {int} the height of the document in pixels\n         */\n        getDocumentHeight: function () {\n            var body = document.body,\n                documentElement = document.documentElement;\n\n            return Math.max(\n                body.scrollHeight, documentElement.scrollHeight,\n                body.offsetHeight, documentElement.offsetHeight,\n                body.clientHeight, documentElement.clientHeight\n            );\n        },\n\n        /**\n         * Gets the height of the DOM element\n         * @param  {Object}  elm the element to calculate the height of which\n         * @return {int}     the height of the element in pixels\n         */\n        getElementHeight: function (elm) {\n            return Math.max(\n                elm.scrollHeight,\n                elm.offsetHeight,\n                elm.clientHeight\n            );\n        },\n\n        /**\n         * Gets the height of the scroller element\n         * @return {int} the height of the scroller element in pixels\n         */\n        getScrollerHeight: function () {\n            return (this.scroller === window || this.scroller === document.body)\n                ? this.getDocumentHeight()\n                : this.getElementHeight(this.scroller);\n        },\n\n        /**\n         * determines if the scroll position is outside of document boundaries\n         * @param  {int}  currentScrollY the current y scroll position\n         * @return {bool} true if out of bounds, false otherwise\n         */\n        isOutOfBounds: function (currentScrollY) {\n            var pastTop = currentScrollY < 0,\n                pastBottom = currentScrollY + this.getViewportHeight() > this.getScrollerHeight();\n\n            return pastTop || pastBottom;\n        },\n\n        /**\n         * determines if the tolerance has been exceeded\n         * @param  {int} currentScrollY the current scroll y position\n         * @return {bool} true if tolerance exceeded, false otherwise\n         */\n        toleranceExceeded: function (currentScrollY, direction) {\n            return Math.abs(currentScrollY - this.lastKnownScrollY) >= this.tolerance[direction];\n        },\n\n        /**\n         * determine if it is appropriate to unpin\n         * @param  {int} currentScrollY the current y scroll position\n         * @param  {bool} toleranceExceeded has the tolerance been exceeded?\n         * @return {bool} true if should unpin, false otherwise\n         */\n        shouldUnpin: function (currentScrollY, toleranceExceeded) {\n            var scrollingDown = currentScrollY > this.lastKnownScrollY,\n                pastOffset = currentScrollY >= this.offset;\n\n            return scrollingDown && pastOffset && toleranceExceeded;\n        },\n\n        /**\n         * determine if it is appropriate to pin\n         * @param  {int} currentScrollY the current y scroll position\n         * @param  {bool} toleranceExceeded has the tolerance been exceeded?\n         * @return {bool} true if should pin, false otherwise\n         */\n        shouldPin: function (currentScrollY, toleranceExceeded) {\n            var scrollingUp = currentScrollY < this.lastKnownScrollY,\n                pastOffset = currentScrollY <= this.offset;\n\n            return (scrollingUp && toleranceExceeded) || pastOffset;\n        },\n\n        shouldHideSearch: function (currentScrollY) {\n            return currentScrollY < this.searchOffset;\n        },\n\n        shouldShowSearch: function (currentScrollY) {\n            return currentScrollY >= this.searchOffset;\n        },\n\n        /**\n         * Handles updating the state of the widget\n         */\n        update: function () {\n            var currentScrollY = this.getScrollY(),\n                scrollDirection = currentScrollY > this.lastKnownScrollY ? 'down' : 'up',\n                toleranceExceeded = this.toleranceExceeded(currentScrollY, scrollDirection);\n\n            if (this.isOutOfBounds(currentScrollY)) { // Ignore bouncy scrolling in OSX\n                return;\n            }\n\n            if (currentScrollY <= this.offset) {\n\t\tif (this.nav) {\n\t\t\tthis.top();\n\t\t}\n\t\tif (this.search) {\n\t\t\tthis.hideSearch();\n\t\t}\n            } else {\n                this.notTop();\n            }\n\n            if (this.nav && this.shouldUnpin(currentScrollY, toleranceExceeded)) {\n                this.unpin();\n            }\n            else if (this.nav && this.shouldPin(currentScrollY, toleranceExceeded)) {\n                this.pin();\n            }\n            else if (this.search && this.shouldShowSearch(currentScrollY)) {\n                this.showSearch();\n            }\n            else if (this.search && this.shouldHideSearch(currentScrollY)) {\n                this.hideSearch();\n            }\n\n            this.lastKnownScrollY = currentScrollY;\n        }\n    };\n    /**\n     * Default options\n     * @type {Object}\n     */\n    Headroom.options = {\n        tolerance: {\n            up: 0,\n            down: 0\n        },\n        offset: 0,\n        searchOffset: 450,\n        scroller: window,\n\tnav: true, // default headroom nav is to appear and disappear\n\tsearch: false, // default nav search bar is to just always be visible\n        classes: {\n            pinned: 'headroom--pinned',\n            unpinned: 'headroom--unpinned',\n            top: 'headroom--top',\n            notTop: 'headroom--not-top',\n            initial_headroom: 'headroom',\n\t    initial_search: 'hideSearch',\n            hideSearch: 'hideSearch',\n            showSearch: 'showSearch',\n        }\n    };\n    Headroom.cutsTheMustard = typeof features !== 'undefined' && features.rAF && features.bind && features.classList;\n\n    window.Headroom = Headroom;\n\n}(window, document));\n";
  },
  5449: function(t, e) {
    t.exports = "/* eslint indent: [\"error\", \"tab\", { \"outerIIFEBody\": 0 }] */\n/* eslint slack/var-name: 0 */\n\n/**\n * @module plastic\n */\n;(function () {\n\t'use strict';\n\n\tvar plastic = {\n\n\t\theader_pin_sig: new signals.Signal(),\n\n\t\theader_unpin_sig: new signals.Signal(),\n\n\t\twidescreen_threshold: 1441,\n\n\t\tstored_scrolltop: 0,\n\n\t\tinit: function init() {\n\t\t\t// is a touch device?\n\t\t\tvar is_touch = 'ontouchstart' in document.documentElement;\n\n\t\t\tif (is_touch) {\n\t\t\t\t$('html').addClass('touch');\n\n\t\t\t\t// attach FastClick: https://github.com/ftlabs/fastclick (eliminates 300ms delay on clicks in touch UIs)\n\t\t\t\tFastClick.attach(document.body);\n\t\t\t} else {\n\t\t\t\t$('html').addClass('no_touch');\n\t\t\t}\n\n\t\t\t// init components\n\t\t\tplastic.initTabs();\n\t\t\tplastic.initAlerts();\n\n\t\t\tif ($('#api_nav').length) {\n\t\t\t\t// api nav\n\t\t\t\tplastic.initAPINav();\n\t\t\t} else if (window.TS && (TS.boot_data && !TS.boot_data.no_login || $('#menu_toggle').length)) {\n\t\t\t\t// web nav\n\t\t\t\tplastic.initNav();\n\t\t\t}\n\n\t\t\t// Nav bar props:\n\t\t\t// SEARCH: when true, the search bar disappears as you scroll towards the top of the page and reappears after you scroll down.\n\t\t\t// NAV: when true, the nav bar disappears as you scroll down and reappears when you scroll up.\n\t\t\tif (TS.boot_data && TS.boot_data.feature_app_directory_home_page_redesign) {\n\t\t\t\t// If its the homepage...\n\t\t\t\tif ($('nav').hasClass('splash')) {\n\t\t\t\t\tplastic.initHeader({ search: true, nav: false });\n\t\t\t\t} else {\n\t\t\t\t\t// for all other pages...\n\t\t\t\t\tplastic.initHeader({ nav: true });\n\t\t\t\t}\n\t\t\t} else if (!$('nav').hasClass('clear_nav') && !$('nav').hasClass('persistent')) {\n\t\t\t\t// this is for legacy home page: we DIDN'T want\n\t\t\t\t// headroom on /apps home, but we want it everywhere\n\t\t\t\t// else.\n\t\t\t\tplastic.initHeader();\n\t\t\t}\n\n\t\t\tplastic.initWidescreen();\n\n\t\t\tvar $nav = $('nav#site_nav');\n\t\t\t// remove no_transition classes (used to prevent animation on page load)\n\t\t\tsetTimeout(function () {\n\t\t\t\t$nav.removeClass('no_transition');\n\t\t\t\t$('#menu_toggle').removeClass('no_transition');\n\t\t\t\t$('#header_team_name').removeClass('no_transition');\n\t\t\t}, 0);\n\n\t\t\t// make plastic namespace available to window\n\t\t\twindow.plastic = plastic;\n\t\t},\n\n\t\tinitNav: function initNav() {\n\n\t\t\tvar $body = $('body');\n\n\t\t\t// bind offscreen nav behaviours\n\t\t\t$('#menu_toggle').on('click.toggle_nav', function () {\n\t\t\t\tif (!$body.hasClass('nav_open') && $body.hasClass('widescreen')) return;\n\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t});\n\n\t\t\t$('#user_menu_contents').on('click.toggle_nav', function (e) {\n\t\t\t\tif (!$(e.target).is('a')) {\n\t\t\t\t\tif (!$body.hasClass('nav_open') && $body.hasClass('widescreen')) return;\n\t\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t\t}\n\t\t\t});\n\t\t\t$('#overlay').on('click touchend', function () {\n\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t});\n\n\t\t\t// Clogs the Billing link in the admin nav bar for the Growth team\n\t\t\t$('[data-qa=\"billing\"]').click(function () {\n\t\t\t\tTS.clog.track('GROWTH_PRICING', { contexts: { ui_context: {\n\t\t\t\t\t\t\tstep: 'home',\n\t\t\t\t\t\t\taction: 'click',\n\t\t\t\t\t\t\tui_element: 'billing_link'\n\t\t\t\t\t\t} } });\n\t\t\t});\n\n\t\t\t// team switcher\n\t\t\t$('#team_switcher').on('click', function () {\n\t\t\t\t$('#header_team_nav').toggleClass('open');\n\t\t\t});\n\t\t\t$('html').bind('mousedown.team_nav touchstart.team_nav', function (e) {\n\t\t\t\tif ($(e.target).closest('#header_team_nav').length == 0 && $(e.target).closest('#team_switcher').length == 0) {\n\t\t\t\t\t$('#header_team_nav').removeClass('open');\n\t\t\t\t}\n\t\t\t});\n\n\t\t\t// inject dynamic media query for sticky footer positioning in nav\n\t\t\tvar nav_height = $('#user_menu').outerHeight() + $('#api_nav').outerHeight() + $('.nav_contents').outerHeight() + $('#footer').outerHeight();\n\n\t\t\t$('head').append('' + ('<style type=\"text/css\"> ' + '#footer {' // offscreen nav: pin footer to bottom of nav\n\t\t\t+ 'bottom: 0;' + 'position: absolute;' + '}' + '@media only screen and (max-height: ') + nav_height + 'px) { ' // mobile and smaller screens: show footer below nav if it would otherwise overlap\n\t\t\t+ 'nav#api_nav #footer, ' + 'nav#site_nav #footer { ' + 'position: relative; ' + 'bottom: auto; ' + '} ' + '}\\n' + ('@media only screen and (min-width: ' + plastic.widescreen_threshold + 'px) { ') // wide screens: just show footer below nav\n\t\t\t+ 'body:not(.nav_open) nav#site_nav #footer { ' + 'position: relative; ' + 'bottom: auto; ' + '} ' + '}' + '</style>');\n\t\t},\n\n\t\tinitAPINav: function initAPINav() {\n\n\t\t\tvar $body = $('body');\n\n\t\t\t// toggle nav visibility and scrolling on the document\n\t\t\tvar toggleMenu = function toggleMenu() {\n\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t\t$('html').toggleClass('no_scroll');\n\n\t\t\t\tif (!$body.hasClass('nav_open')) {\n\t\t\t\t\t// restore position\n\t\t\t\t\t$(window).scrollTop(plastic.stored_scrolltop);\n\t\t\t\t} else {\n\t\t\t\t\t// store scroll position and scroll to top\n\t\t\t\t\tplastic.stored_scrolltop = $(window).scrollTop();\n\t\t\t\t\t$(window).scrollTop(0);\n\t\t\t\t}\n\t\t\t};\n\n\t\t\t// bind offscreen nav behaviours\n\t\t\t$('#menu_toggle').on('click.toggle_nav', function () {\n\t\t\t\tif (!$body.hasClass('nav_open') && $body.hasClass('widescreen')) return;\n\n\t\t\t\ttoggleMenu();\n\t\t\t});\n\n\t\t\t// toggle the menu when clicking the overlay (should close it\n\t\t\t$('#overlay').on('click touchstart', toggleMenu);\n\t\t},\n\n\t\tinitHeader: function initHeader(config) {\n\t\t\t// bind hiding header\n\t\t\tvar animateSearch = config ? config.search : false;\n\t\t\tvar animateNav = config ? config.nav : true;\n\n\t\t\t// if a header isn't present, don't initiate headroom.\n\t\t\tif (!$('header').length) return;\n\n\t\t\t$('header').headroom({\n\t\t\t\toffset: 80, // vertical offset in px before element is first unpinned\n\t\t\t\ttolerance: 5, // scroll tolerance in px before state changes\n\t\t\t\tonPin: function onPin() {\n\t\t\t\t\tplastic.header_pin_sig.dispatch();\n\t\t\t\t},\n\t\t\t\tonUnpin: function onUnpin() {\n\t\t\t\t\tplastic.header_unpin_sig.dispatch();\n\t\t\t\t},\n\t\t\t\tsearch: animateSearch,\n\t\t\t\tnav: animateNav\n\t\t\t});\n\t\t},\n\n\t\tinitTabs: function initTabs() {\n\t\t\t$('.tab_set').on('click', function () {\n\t\t\t\t$(this).toggleClass('open');\n\t\t\t}).find('a').on('click', function (e) {\n\t\t\t\tvar $tab = $(this);\n\n\t\t\t\tif ($tab.hasClass('selected') && $tab.attr('href') && !$tab.hasClass('is_linked')) {\n\t\t\t\t\t/* don't try to load tab if it has an href and is selected */\n\t\t\t\t\te.preventDefault();\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\t/* don't try to update tabs if clicked tab has an href */\n\t\t\t\tif ($tab.attr('href')) return;\n\n\t\t\t\t$tab.addClass('selected').siblings('.selected').removeClass('selected');\n\n\t\t\t\t$('.tab_pane.selected').removeClass('selected');\n\t\t\t\t$('.tab_pane[data-tab=\"' + $tab.data('tab') + '\"]').addClass('selected');\n\n\t\t\t\t// push hash to URL\n\t\t\t\twindow.location.hash = $tab.data('tab');\n\t\t\t});\n\n\t\t\t// activate tab and scroll if url hash has an anchor in a tab that isn't visible\n\t\t\t// or to select the tab\n\t\t\tvar hash = window.location.hash;\n\t\t\tif (hash) {\n\t\t\t\t// replace HTML tags in a string with encoded entities\n\t\t\t\thash = String(hash).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');\n\n\t\t\t\tif (hash.charAt(0) === '#') {\n\t\t\t\t\thash = hash.substring(1);\n\t\t\t\t}\n\n\t\t\t\t// if the hash contains any of the chars in the below regex we get a runtime error:\n\t\t\t\t// jquery.v1461001977.js:1458 Uncaught Error: Syntax error, unrecognized expression: a[name=\"...\n\t\t\t\t// this is because special chars need escaping when used as a jquery selector\n\t\t\t\t// @link: http://stackoverflow.com/questions/15338727/jquery-syntax-error-unrecognized-expression\n\t\t\t\t// note: we can eventually replace with CSS.escape (https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape)\n\t\t\t\tvar regex = /(!|\"|#|\\$|%|&|'|\\(|\\)|\\*|\\+|,|\\.|\\/|:|;|<|=|>|\\?|@|\\[|\\]|\\^|`|{|}|\\||~)/g;\n\t\t\t\thash = hash.replace(regex, function (match) {\n\t\t\t\t\treturn '\\\\' + match;\n\t\t\t\t});\n\n\t\t\t\tvar $anchor = $('a[name=\"' + hash + '\"], #' + hash);\n\t\t\t\tvar $tab;\n\t\t\t\tvar $pane;\n\t\t\t\tvar tab_name;\n\t\t\t\tif ($anchor.length > 0) {\n\t\t\t\t\t// scroll to the anchor\n\t\t\t\t\t$pane = $anchor.closest('.tab_pane');\n\t\t\t\t\tif ($pane.length > 0 && !$pane.hasClass('selected')) {\n\t\t\t\t\t\ttab_name = $pane.data('tab');\n\t\t\t\t\t\t$tab = $('a[data-tab=\"' + tab_name + '\"]');\n\t\t\t\t\t\t$tab.click();\n\n\t\t\t\t\t\t// this makes the browser scroll to the anchor again\n\t\t\t\t\t\twindow.location.hash = hash;\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\t// select the tab (e.g. https://pkdev.dev.slack.com/admin/settings#permissions)\n\t\t\t\t\t$tab = $('a[data-tab=\"' + hash + '\"]');\n\t\t\t\t\tif ($tab.length > 0) {\n\t\t\t\t\t\t$tab.click();\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\t$('.tab_set').removeClass('open');\n\t\t\t}\n\t\t},\n\n\t\tinitAlerts: function initAlerts() {\n\t\t\t$('.alert_page').each(function () {\n\t\t\t\t// fade out ephemeral page alerts (see plastic_alerts.source.less)\n\t\t\t\tif ($(this).hasClass('is_ephemeral')) {\n\t\t\t\t\t$(this).addClass('fade');\n\t\t\t\t}\n\t\t\t});\n\t\t},\n\n\t\tinitWidescreen: function initWidescreen() {\n\t\t\t// nav behaviour for wide screens\n\t\t\tvar $window = $(window);\n\t\t\tvar $body = $('body');\n\t\t\tvar $nav = $('nav#site_nav');\n\n\t\t\t// no widescreen nav on full bleed pages\n\t\t\tif ($body.hasClass('full_bleed')) return;\n\n\t\t\t// no widescreen nav on full bleed pages\n\t\t\tif (!$nav.length && !$('#api_nav').length) return;\n\n\t\t\t$window.resize(function () {\n\t\t\t\tvar width = $window.width();\n\t\t\t\tvar height = $window.height();\n\n\t\t\t\tif (width >= plastic.widescreen_threshold && !$body.hasClass('widescreen')) {\n\t\t\t\t\t$body.addClass('widescreen');\n\t\t\t\t} else if (width < plastic.widescreen_threshold && $body.hasClass('widescreen')) {\n\t\t\t\t\t// disable the transition until nav is closed to prevent flash\n\t\t\t\t\t$nav.addClass('no_transition');\n\t\t\t\t\t$body.removeClass('widescreen');\n\n\t\t\t\t\tsetTimeout(function () {\n\t\t\t\t\t\t// re-enable transition after nav is closed\n\t\t\t\t\t\t$nav.removeClass('no_transition');\n\t\t\t\t\t}, 350);\n\t\t\t\t}\n\n\t\t\t\t// make sure overlay covers full screen\n\t\t\t\t$('#page').css('min-height', height);\n\t\t\t}).resize();\n\t\t}\n\t};\n\n\t$(function () {\n\t\tplastic.init();\n\t});\n})();";
  }
}, [12939]);
