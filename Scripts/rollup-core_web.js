webpackJsonp([27], {
  16: function(t, e) {
    t.exports = function(t) {
      if ("undefined" !== typeof execScript) execScript(t);
      else eval.call(null, t);
    };
  },
  2632: function(t, e, n) {
    "use strict";
    Object.defineProperty(e, "__esModule", {
      value: true
    });
    var i = n(2633);
    var o = n.n(i);
    var s = n(2634);
    var a = n.n(s);
    var r = n(2636);
    var l = n.n(r);
    var c = n(2637);
    var h = n.n(c);
  },
  2633: function(t, e) {
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
            var o = t.support.transition && i;
            this.$backdrop = t('<div class="modal-backdrop ' + i + '" />');
            if (t("#page_contents").length) this.$backdrop.appendTo("#page_contents");
            else this.$backdrop.appendTo("body");
            this.$backdrop.click("static" == this.options.backdrop ? t.proxy(this.$element[0].focus, this.$element[0]) : t.proxy(this.hide, this));
            if (o) this.$backdrop[0].offsetWidth;
            this.$backdrop.addClass("in");
            if (!e) return;
            o ? this.$backdrop.one(t.support.transition.end, e) : e();
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
            o = i.data("modal"),
            s = t.extend({}, t.fn.modal.defaults, i.data(), "object" == typeof n && n);
          if (!o) i.data("modal", o = new e(this, s));
          if ("string" == typeof n) o[n]();
          else if (s.show) o.show();
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
          o = t(n.attr("data-target") || i && i.replace(/.*(?=#[^\s]+$)/, "")),
          s = o.data("modal") ? "toggle" : t.extend({
            remote: !/#/.test(i) && i
          }, o.data(), n.data());
        e.preventDefault();
        o.modal(s).one("hide", function() {
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
        var o = this.options.trigger.split(" ");
        for (var s = o.length; s--;) {
          var a = o[s];
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
          var o = "function" == typeof this.options.placement ? this.options.placement.call(this, i[0], this.$element[0]) : this.options.placement;
          var s = /\s?auto?\s?/i;
          var a = s.test(o);
          if (a) o = o.replace(s, "") || "top";
          i.detach().css({
            top: 0,
            left: 0,
            display: "block"
          }).addClass(o);
          this.options.container ? i.appendTo(this.options.container) : i.insertAfter(this.$element);
          var r = this.getPosition();
          var l = i[0].offsetWidth;
          var c = i[0].offsetHeight;
          if (a) {
            var h = this.$element.parent();
            var u = o;
            var d = document.documentElement.scrollTop || document.body.scrollTop;
            var f = "body" == this.options.container ? window.innerWidth : h.outerWidth();
            var p = "body" == this.options.container ? window.innerHeight : h.outerHeight();
            var v = "body" == this.options.container ? 0 : h.offset().left;
            o = "bottom" == o && r.top + r.height + c - d > p ? "top" : "top" == o && r.top - d - c < 0 ? "bottom" : "right" == o && r.right + l > f ? "left" : "left" == o && r.left - l < v ? "right" : o;
            i.removeClass(u).addClass(o);
          }
          var m = this.getCalculatedOffset(o, r, l, c);
          this.applyPlacement(m, o);
          this.hoverState = null;
          var g = function() {
            n.$element.trigger("shown.bs." + n.type);
          };
          t.support.transition && this.$tip.hasClass("fade") ? i.one(t.support.transition.end, g).emulateTransitionEnd(150) : g();
        }
      };
      e.prototype.applyPlacement = function(e, n) {
        var i;
        var o = this.tip();
        var s = o[0].offsetWidth;
        var a = o[0].offsetHeight;
        var r = parseInt(o.css("margin-top"), 10);
        var l = parseInt(o.css("margin-left"), 10);
        if (isNaN(r)) r = 0;
        if (isNaN(l)) l = 0;
        e.top = e.top + r;
        e.left = e.left + l;
        t.offset.setOffset(o[0], t.extend({
          using: function(t) {
            o.css({
              top: Math.round(t.top),
              left: Math.round(t.left)
            });
          }
        }, e), 0);
        o.addClass("in");
        var c = o[0].offsetWidth;
        var h = o[0].offsetHeight;
        if ("top" == n && h != a) {
          i = true;
          e.top = e.top + a - h;
        }
        if (/bottom|top/.test(n)) {
          var u = 0;
          if (e.left < 0) {
            u = -2 * e.left;
            e.left = 0;
            o.offset(e);
            c = o[0].offsetWidth;
            h = o[0].offsetHeight;
          }
          this.replaceArrow(u - s + c, c, "left");
        } else this.replaceArrow(h - a, h, "top");
        if (i) o.offset(e);
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

        function o() {
          if ("in" != e.hoverState) n.detach();
          e.$element.trigger("hidden.bs." + e.type);
        }
        this.$element.trigger(i);
        if (i.isDefaultPrevented()) return;
        n.removeClass("in");
        t.support.transition && this.$tip.hasClass("fade") ? n.one(t.support.transition.end, o).emulateTransitionEnd(150) : o();
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
          var o = i.data("bs.tooltip");
          var s = "object" == typeof n && n;
          if (!o && "destroy" == n) return;
          if (!o) i.data("bs.tooltip", o = new e(this, s));
          if ("string" == typeof n) o[n]();
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
        var o = function() {
          if (!n) t(i).trigger(t.support.transition.end);
        };
        setTimeout(o, e);
        return this;
      };
      t(function() {
        t.support.transition = e();
      });
    }(jQuery);
  },
  2634: function(t, e, n) {
    (function(e) {
      t.exports = e["FastClick"] = n(2635);
    }).call(e, n(7));
  },
  2635: function(t, e, n) {
    var i;
    /**
     * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
     *
     * @version 0.6.11
     * @codingstandard ftlabs-jsv2
     * @copyright The Financial Times Limited [All Rights Reserved]
     * @license MIT License (see LICENSE.txt)
     */
    function o(t) {
      "use strict";
      var e, n = this;
      this.trackingClick = false;
      this.trackingClickStart = 0;
      this.targetElement = null;
      this.touchStartX = 0;
      this.touchStartY = 0;
      this.lastTouchIdentifier = 0;
      this.touchBoundary = 10;
      this.layer = t;
      if (!t || !t.nodeType) throw new TypeError("Layer must be a document node");
      this.onClick = function() {
        return o.prototype.onClick.apply(n, arguments);
      };
      this.onMouse = function() {
        return o.prototype.onMouse.apply(n, arguments);
      };
      this.onTouchStart = function() {
        return o.prototype.onTouchStart.apply(n, arguments);
      };
      this.onTouchMove = function() {
        return o.prototype.onTouchMove.apply(n, arguments);
      };
      this.onTouchEnd = function() {
        return o.prototype.onTouchEnd.apply(n, arguments);
      };
      this.onTouchCancel = function() {
        return o.prototype.onTouchCancel.apply(n, arguments);
      };
      if (o.notNeeded(t)) return;
      if (this.deviceIsAndroid) {
        t.addEventListener("mouseover", this.onMouse, true);
        t.addEventListener("mousedown", this.onMouse, true);
        t.addEventListener("mouseup", this.onMouse, true);
      }
      t.addEventListener("click", this.onClick, true);
      t.addEventListener("touchstart", this.onTouchStart, false);
      t.addEventListener("touchmove", this.onTouchMove, false);
      t.addEventListener("touchend", this.onTouchEnd, false);
      t.addEventListener("touchcancel", this.onTouchCancel, false);
      if (!Event.prototype.stopImmediatePropagation) {
        t.removeEventListener = function(e, n, i) {
          var o = Node.prototype.removeEventListener;
          if ("click" === e) o.call(t, e, n.hijacked || n, i);
          else o.call(t, e, n, i);
        };
        t.addEventListener = function(e, n, i) {
          var o = Node.prototype.addEventListener;
          if ("click" === e) o.call(t, e, n.hijacked || (n.hijacked = function(t) {
            if (!t.propagationStopped) n(t);
          }), i);
          else o.call(t, e, n, i);
        };
      }
      if ("function" === typeof t.onclick) {
        e = t.onclick;
        t.addEventListener("click", function(t) {
          e(t);
        }, false);
        t.onclick = null;
      }
    }
    o.prototype.deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0;
    o.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
    o.prototype.deviceIsIOS4 = o.prototype.deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    o.prototype.deviceIsIOSWithBadTarget = o.prototype.deviceIsIOS && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);
    o.prototype.needsClick = function(t) {
      "use strict";
      switch (t.nodeName.toLowerCase()) {
        case "button":
        case "select":
        case "textarea":
          if (t.disabled) return true;
          break;
        case "input":
          if (this.deviceIsIOS && "file" === t.type || t.disabled) return true;
          break;
        case "label":
        case "video":
          return true;
      }
      return /\bneedsclick\b/.test(t.className);
    };
    o.prototype.needsFocus = function(t) {
      "use strict";
      switch (t.nodeName.toLowerCase()) {
        case "textarea":
          return true;
        case "select":
          return !this.deviceIsAndroid;
        case "input":
          switch (t.type) {
            case "button":
            case "checkbox":
            case "file":
            case "image":
            case "radio":
            case "submit":
              return false;
          }
          return !t.disabled && !t.readOnly;
        default:
          return /\bneedsfocus\b/.test(t.className);
      }
    };
    o.prototype.sendClick = function(t, e) {
      "use strict";
      var n, i;
      if (document.activeElement && document.activeElement !== t) document.activeElement.blur();
      i = e.changedTouches[0];
      n = document.createEvent("MouseEvents");
      n.initMouseEvent(this.determineEventType(t), true, true, window, 1, i.screenX, i.screenY, i.clientX, i.clientY, false, false, false, false, 0, null);
      n.forwardedTouchEvent = true;
      t.dispatchEvent(n);
    };
    o.prototype.determineEventType = function(t) {
      "use strict";
      if (this.deviceIsAndroid && "select" === t.tagName.toLowerCase()) return "mousedown";
      return "click";
    };
    o.prototype.focus = function(t) {
      "use strict";
      var e;
      if (this.deviceIsIOS && t.setSelectionRange && 0 !== t.type.indexOf("date") && "time" !== t.type) {
        e = t.value.length;
        t.setSelectionRange(e, e);
      } else t.focus();
    };
    o.prototype.updateScrollParent = function(t) {
      "use strict";
      var e, n;
      e = t.fastClickScrollParent;
      if (!e || !e.contains(t)) {
        n = t;
        do {
          if (n.scrollHeight > n.offsetHeight) {
            e = n;
            t.fastClickScrollParent = n;
            break;
          }
          n = n.parentElement;
        } while (n);
      }
      if (e) e.fastClickLastScrollTop = e.scrollTop;
    };
    o.prototype.getTargetElementFromEventTarget = function(t) {
      "use strict";
      if (t.nodeType === Node.TEXT_NODE) return t.parentNode;
      return t;
    };
    o.prototype.onTouchStart = function(t) {
      "use strict";
      var e, n, i;
      if (t.targetTouches.length > 1) return true;
      e = this.getTargetElementFromEventTarget(t.target);
      n = t.targetTouches[0];
      if (this.deviceIsIOS) {
        i = window.getSelection();
        if (i.rangeCount && !i.isCollapsed) return true;
        if (!this.deviceIsIOS4) {
          if (n.identifier === this.lastTouchIdentifier) {
            t.preventDefault();
            return false;
          }
          this.lastTouchIdentifier = n.identifier;
          this.updateScrollParent(e);
        }
      }
      this.trackingClick = true;
      this.trackingClickStart = t.timeStamp;
      this.targetElement = e;
      this.touchStartX = n.pageX;
      this.touchStartY = n.pageY;
      if (t.timeStamp - this.lastClickTime < 200) t.preventDefault();
      return true;
    };
    o.prototype.touchHasMoved = function(t) {
      "use strict";
      var e = t.changedTouches[0],
        n = this.touchBoundary;
      if (Math.abs(e.pageX - this.touchStartX) > n || Math.abs(e.pageY - this.touchStartY) > n) return true;
      return false;
    };
    o.prototype.onTouchMove = function(t) {
      "use strict";
      if (!this.trackingClick) return true;
      if (this.targetElement !== this.getTargetElementFromEventTarget(t.target) || this.touchHasMoved(t)) {
        this.trackingClick = false;
        this.targetElement = null;
      }
      return true;
    };
    o.prototype.findControl = function(t) {
      "use strict";
      if (void 0 !== t.control) return t.control;
      if (t.htmlFor) return document.getElementById(t.htmlFor);
      return t.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
    };
    o.prototype.onTouchEnd = function(t) {
      "use strict";
      var e, n, i, o, s, a = this.targetElement;
      if (!this.trackingClick) return true;
      if (t.timeStamp - this.lastClickTime < 200) {
        this.cancelNextClick = true;
        return true;
      }
      this.cancelNextClick = false;
      this.lastClickTime = t.timeStamp;
      n = this.trackingClickStart;
      this.trackingClick = false;
      this.trackingClickStart = 0;
      if (this.deviceIsIOSWithBadTarget) {
        s = t.changedTouches[0];
        a = document.elementFromPoint(s.pageX - window.pageXOffset, s.pageY - window.pageYOffset) || a;
        a.fastClickScrollParent = this.targetElement.fastClickScrollParent;
      }
      i = a.tagName.toLowerCase();
      if ("label" === i) {
        e = this.findControl(a);
        if (e) {
          this.focus(a);
          if (this.deviceIsAndroid) return false;
          a = e;
        }
      } else if (this.needsFocus(a)) {
        if (t.timeStamp - n > 100 || this.deviceIsIOS && window.top !== window && "input" === i) {
          this.targetElement = null;
          return false;
        }
        this.focus(a);
        if (!this.deviceIsIOS4 || "select" !== i) {
          this.targetElement = null;
          t.preventDefault();
        }
        return false;
      }
      if (this.deviceIsIOS && !this.deviceIsIOS4) {
        o = a.fastClickScrollParent;
        if (o && o.fastClickLastScrollTop !== o.scrollTop) return true;
      }
      if (!this.needsClick(a)) {
        t.preventDefault();
        this.sendClick(a, t);
      }
      return false;
    };
    o.prototype.onTouchCancel = function() {
      "use strict";
      this.trackingClick = false;
      this.targetElement = null;
    };
    o.prototype.onMouse = function(t) {
      "use strict";
      if (!this.targetElement) return true;
      if (t.forwardedTouchEvent) return true;
      if (!t.cancelable) return true;
      if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
        if (t.stopImmediatePropagation) t.stopImmediatePropagation();
        else t.propagationStopped = true;
        t.stopPropagation();
        t.preventDefault();
        return false;
      }
      return true;
    };
    o.prototype.onClick = function(t) {
      "use strict";
      var e;
      if (this.trackingClick) {
        this.targetElement = null;
        this.trackingClick = false;
        return true;
      }
      if ("submit" === t.target.type && 0 === t.detail) return true;
      e = this.onMouse(t);
      if (!e) this.targetElement = null;
      return e;
    };
    o.prototype.destroy = function() {
      "use strict";
      var t = this.layer;
      if (this.deviceIsAndroid) {
        t.removeEventListener("mouseover", this.onMouse, true);
        t.removeEventListener("mousedown", this.onMouse, true);
        t.removeEventListener("mouseup", this.onMouse, true);
      }
      t.removeEventListener("click", this.onClick, true);
      t.removeEventListener("touchstart", this.onTouchStart, false);
      t.removeEventListener("touchmove", this.onTouchMove, false);
      t.removeEventListener("touchend", this.onTouchEnd, false);
      t.removeEventListener("touchcancel", this.onTouchCancel, false);
    };
    o.notNeeded = function(t) {
      "use strict";
      var e;
      var n;
      if ("undefined" === typeof window.ontouchstart) return true;
      n = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
      if (n)
        if (o.prototype.deviceIsAndroid) {
          e = document.querySelector("meta[name=viewport]");
          if (e) {
            if (-1 !== e.content.indexOf("user-scalable=no")) return true;
            if (n > 31 && window.innerWidth <= window.screen.width) return true;
          }
        } else return true;
      if ("none" === t.style.msTouchAction) return true;
      return false;
    };
    o.attach = function(t) {
      "use strict";
      return new o(t);
    };
    if (true) i = function() {
      "use strict";
      return o;
    }.call(e, n, e, t), void 0 !== i && (t.exports = i);
    else if ("undefined" !== typeof t && t.exports) {
      t.exports = o.attach;
      t.exports.FastClick = o;
    } else window.FastClick = o;
  },
  2636: function(t, e) {
    /*!
     * headroom.js v0.7.0 - Give your page some headroom. Hide your header until you need it
     * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/headroom.js
     * License: MIT
     */
    (function(t, e) {
      "use strict";
      var n = {
        bind: !! function() {}.bind,
        classList: "classList" in e.documentElement,
        rAF: !!(t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame)
      };
      t.requestAnimationFrame = t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame;

      function i(t) {
        this.callback = t;
        this.ticking = false;
      }
      i.prototype = {
        constructor: i,
        update: function() {
          this.callback && this.callback();
          this.ticking = false;
        },
        requestTick: function() {
          if (!this.ticking) {
            requestAnimationFrame(this.rafCallback || (this.rafCallback = this.update.bind(this)));
            this.ticking = true;
          }
        },
        handleEvent: function() {
          this.requestTick();
        }
      };

      function o(e) {
        return e && "undefined" !== typeof t && (e === t || e.nodeType);
      }

      function s(t) {
        if (arguments.length <= 0) throw new Error("Missing arguments in extend function");
        var e = t || {},
          n, i;
        for (i = 1; i < arguments.length; i++) {
          var a = arguments[i] || {};
          for (n in a)
            if ("object" === typeof e[n] && !o(e[n])) e[n] = s(e[n], a[n]);
            else e[n] = e[n] || a[n];
        }
        return e;
      }

      function a(t) {
        return t === Object(t) ? t : {
          down: t,
          up: t
        };
      }

      function r(t, e) {
        var n = _.extend({}, r.options, e);
        this.lastKnownScrollY = 0;
        this.elem = t;
        this.debouncer = new i(this.update.bind(this));
        this.tolerance = a(n.tolerance);
        this.classes = n.classes;
        this.offset = n.offset;
        this.searchOffset = n.searchOffset;
        this.scroller = n.scroller;
        this.initialised = false;
        this.onPin = n.onPin;
        this.onUnpin = n.onUnpin;
        this.onTop = n.onTop;
        this.onNotTop = n.onNotTop;
        this.search = n.search;
        this.classes.initial_search = this.search ? "hideSearch" : "showSearch";
        this.nav = n.nav;
      }
      r.prototype = {
        constructor: r,
        init: function() {
          if (!r.cutsTheMustard) return;
          if (this.elem.classList.contains(this.classes.hideSearch)) this.elem.classList.remove(this.classes.hideSearch);
          this.elem.classList.add(this.classes.initial_headroom, this.classes.initial_search);
          setTimeout(this.attachEvent.bind(this), 100);
          return this;
        },
        destroy: function() {
          var t = this.classes;
          this.initialised = false;
          this.elem.classList.remove(t.unpinned, t.pinned, t.top, t.initial_headroom, t.initial_search);
          this.scroller.removeEventListener("scroll", this.debouncer, false);
        },
        attachEvent: function() {
          if (!this.initialised) {
            this.lastKnownScrollY = this.getScrollY();
            this.initialised = true;
            this.scroller.addEventListener("scroll", this.debouncer, false);
            this.debouncer.handleEvent();
          }
        },
        unpin: function() {
          var t = this.elem.classList,
            e = this.classes;
          if (t.contains(e.pinned) || !t.contains(e.unpinned)) {
            t.add(e.unpinned);
            t.remove(e.pinned);
            this.onUnpin && this.onUnpin.call(this);
          }
        },
        pin: function() {
          var t = this.elem.classList,
            e = this.classes;
          if (t.contains(e.unpinned)) {
            t.remove(e.unpinned);
            t.add(e.pinned);
            this.onPin && this.onPin.call(this);
          }
        },
        showSearch: function() {
          var t = this.elem.classList,
            e = this.classes;
          if (t.contains(e.hideSearch)) {
            t.remove(e.hideSearch);
            t.add(e.showSearch);
          }
        },
        hideSearch: function() {
          var t = this.elem.classList,
            e = this.classes;
          if (t.contains(e.showSearch)) {
            t.remove(e.showSearch);
            t.add(e.hideSearch);
          }
        },
        top: function() {
          var t = this.elem.classList,
            e = this.classes;
          if (!t.contains(e.top)) {
            t.add(e.top);
            t.remove(e.notTop);
            this.onTop && this.onTop.call(this);
          }
        },
        notTop: function() {
          var t = this.elem.classList,
            e = this.classes;
          if (!t.contains(e.notTop)) {
            t.add(e.notTop);
            t.remove(e.top);
            this.onNotTop && this.onNotTop.call(this);
          }
        },
        getScrollY: function() {
          return void 0 !== this.scroller.pageYOffset ? this.scroller.pageYOffset : void 0 !== this.scroller.scrollTop ? this.scroller.scrollTop : (e.documentElement || e.body.parentNode || e.body).scrollTop;
        },
        getViewportHeight: function() {
          return t.innerHeight || e.documentElement.clientHeight || e.body.clientHeight;
        },
        getDocumentHeight: function() {
          var t = e.body,
            n = e.documentElement;
          return Math.max(t.scrollHeight, n.scrollHeight, t.offsetHeight, n.offsetHeight, t.clientHeight, n.clientHeight);
        },
        getElementHeight: function(t) {
          return Math.max(t.scrollHeight, t.offsetHeight, t.clientHeight);
        },
        getScrollerHeight: function() {
          return this.scroller === t || this.scroller === e.body ? this.getDocumentHeight() : this.getElementHeight(this.scroller);
        },
        isOutOfBounds: function(t) {
          var e = t < 0,
            n = t + this.getViewportHeight() > this.getScrollerHeight();
          return e || n;
        },
        toleranceExceeded: function(t, e) {
          return Math.abs(t - this.lastKnownScrollY) >= this.tolerance[e];
        },
        shouldUnpin: function(t, e) {
          var n = t > this.lastKnownScrollY,
            i = t >= this.offset;
          return n && i && e;
        },
        shouldPin: function(t, e) {
          var n = t < this.lastKnownScrollY,
            i = t <= this.offset;
          return n && e || i;
        },
        shouldHideSearch: function(t) {
          return t < this.searchOffset;
        },
        shouldShowSearch: function(t) {
          return t >= this.searchOffset;
        },
        update: function() {
          var t = this.getScrollY(),
            e = t > this.lastKnownScrollY ? "down" : "up",
            n = this.toleranceExceeded(t, e);
          if (this.isOutOfBounds(t)) return;
          if (t <= this.offset) {
            if (this.nav) this.top();
            if (this.search) this.hideSearch();
          } else this.notTop();
          if (this.nav && this.shouldUnpin(t, n)) this.unpin();
          else if (this.nav && this.shouldPin(t, n)) this.pin();
          else if (this.search && this.shouldShowSearch(t)) this.showSearch();
          else if (this.search && this.shouldHideSearch(t)) this.hideSearch();
          this.lastKnownScrollY = t;
        }
      };
      r.options = {
        tolerance: {
          up: 0,
          down: 0
        },
        offset: 0,
        searchOffset: 450,
        scroller: t,
        nav: true,
        search: false,
        classes: {
          pinned: "headroom--pinned",
          unpinned: "headroom--unpinned",
          top: "headroom--top",
          notTop: "headroom--not-top",
          initial_headroom: "headroom",
          initial_search: "hideSearch",
          hideSearch: "hideSearch",
          showSearch: "showSearch"
        }
      };
      r.cutsTheMustard = "undefined" !== typeof n && n.rAF && n.bind && n.classList;
      t.Headroom = r;
    })(window, document);
  },
  2637: function(t, e, n) {
    n(16)(n(2638));
  },
  2638: function(t, e) {
    t.exports = "/* eslint indent: [\"error\", \"tab\", { \"outerIIFEBody\": 0 }] */\n/* eslint slack/var-name: 0 */\n/* eslint strict: 0 */\n\n/**\n * @module plastic\n */\n;(function () {\n\t'use strict';\n\n\tvar plastic = {\n\n\t\theader_pin_sig: new signals.Signal(),\n\n\t\theader_unpin_sig: new signals.Signal(),\n\n\t\twidescreen_threshold: 1441,\n\n\t\tstored_scrolltop: 0,\n\n\t\tinit: function init() {\n\t\t\t// is a touch device?\n\t\t\tvar is_touch = 'ontouchstart' in document.documentElement;\n\n\t\t\tif (is_touch) {\n\t\t\t\t$('html').addClass('touch');\n\n\t\t\t\t// attach FastClick: https://github.com/ftlabs/fastclick (eliminates 300ms delay on clicks in touch UIs)\n\t\t\t\tFastClick.attach(document.body);\n\t\t\t} else {\n\t\t\t\t$('html').addClass('no_touch');\n\t\t\t}\n\n\t\t\t// init components\n\t\t\tplastic.initTabs();\n\t\t\tplastic.initAlerts();\n\n\t\t\tif ($('#api_nav').length) {\n\t\t\t\t// api nav\n\t\t\t\tplastic.initAPINav();\n\t\t\t} else if (window.TS && (TS.boot_data && !TS.boot_data.no_login || $('#menu_toggle').length)) {\n\t\t\t\t// web nav\n\t\t\t\tplastic.initNav();\n\t\t\t}\n\n\t\t\t// Nav bar props:\n\t\t\t// SEARCH: when true, the search bar disappears as you scroll towards the top of the page and reappears after you scroll down.\n\t\t\t// NAV: when true, the nav bar disappears as you scroll down and reappears when you scroll up.\n\n\t\t\t// If its the homepage...\n\t\t\tif ($('nav').hasClass('splash')) {\n\t\t\t\tplastic.initHeader({ search: true, nav: false });\n\t\t\t} else if (!$('nav').hasClass('clear_nav') && !$('nav').hasClass('persistent')) {\n\t\t\t\t// this is for legacy home page: we DIDN'T want\n\t\t\t\t// headroom on /apps home, but we want it everywhere\n\t\t\t\t// else.\n\t\t\t\tplastic.initHeader({ nav: true });\n\t\t\t}\n\n\t\t\tplastic.initWidescreen();\n\n\t\t\tvar $nav = $('nav#site_nav');\n\t\t\t// remove no_transition classes (used to prevent animation on page load)\n\t\t\tsetTimeout(function () {\n\t\t\t\t$nav.removeClass('no_transition');\n\t\t\t\t$('#menu_toggle').removeClass('no_transition');\n\t\t\t\t$('#header_team_name').removeClass('no_transition');\n\t\t\t}, 0);\n\n\t\t\t// make plastic namespace available to window\n\t\t\twindow.plastic = plastic;\n\t\t},\n\n\t\tinitNav: function initNav() {\n\n\t\t\tvar $body = $('body');\n\n\t\t\t// bind offscreen nav behaviours\n\t\t\t$('#menu_toggle').on('click.toggle_nav', function () {\n\t\t\t\tif (!$body.hasClass('nav_open') && $body.hasClass('widescreen')) return;\n\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t});\n\n\t\t\t$('#user_menu_contents').on('click.toggle_nav', function (e) {\n\t\t\t\tif (!$(e.target).is('a')) {\n\t\t\t\t\tif (!$body.hasClass('nav_open') && $body.hasClass('widescreen')) return;\n\t\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t\t}\n\t\t\t});\n\t\t\t$('#overlay').on('click touchend', function () {\n\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t});\n\n\t\t\t// Clogs the Billing link in the admin nav bar for the Growth team\n\t\t\t$('[data-qa=\"billing\"]').click(function () {\n\t\t\t\tTS.clog.track('GROWTH_PRICING', { contexts: { ui_context: {\n\t\t\t\t\t\t\tstep: 'home',\n\t\t\t\t\t\t\taction: 'click',\n\t\t\t\t\t\t\tui_element: 'billing_link'\n\t\t\t\t\t\t} } });\n\t\t\t});\n\n\t\t\t// team switcher\n\t\t\t$('#team_switcher').on('click', function () {\n\t\t\t\t$('#header_team_nav').toggleClass('open');\n\t\t\t});\n\t\t\t$('html').bind('mousedown.team_nav touchstart.team_nav', function (e) {\n\t\t\t\tif ($(e.target).closest('#header_team_nav').length == 0 && $(e.target).closest('#team_switcher').length == 0) {\n\t\t\t\t\t$('#header_team_nav').removeClass('open');\n\t\t\t\t}\n\t\t\t});\n\n\t\t\t// inject dynamic media query for sticky footer positioning in nav\n\t\t\tvar nav_height = $('#user_menu').outerHeight() + $('#api_nav').outerHeight() + $('.nav_contents').outerHeight() + $('#footer').outerHeight();\n\n\t\t\t$('head').append('' + ('<style type=\"text/css\"> ' + '#footer {' // offscreen nav: pin footer to bottom of nav\n\t\t\t+ 'bottom: 0;' + 'position: absolute;' + '}' + '@media only screen and (max-height: ') + nav_height + 'px) { ' // mobile and smaller screens: show footer below nav if it would otherwise overlap\n\t\t\t+ 'nav#api_nav #footer, ' + 'nav#site_nav #footer { ' + 'position: relative; ' + 'bottom: auto; ' + '} ' + '}\\n' + ('@media only screen and (min-width: ' + plastic.widescreen_threshold + 'px) { ') // wide screens: just show footer below nav\n\t\t\t+ 'body:not(.nav_open) nav#site_nav #footer { ' + 'position: relative; ' + 'bottom: auto; ' + '} ' + '}' + '</style>');\n\t\t},\n\n\t\tinitAPINav: function initAPINav() {\n\n\t\t\tvar $body = $('body');\n\n\t\t\t// toggle nav visibility and scrolling on the document\n\t\t\tvar toggleMenu = function toggleMenu() {\n\t\t\t\t$body.toggleClass('nav_open');\n\t\t\t\t$('html').toggleClass('no_scroll');\n\n\t\t\t\tif (!$body.hasClass('nav_open')) {\n\t\t\t\t\t// restore position\n\t\t\t\t\t$(window).scrollTop(plastic.stored_scrolltop);\n\t\t\t\t} else {\n\t\t\t\t\t// store scroll position and scroll to top\n\t\t\t\t\tplastic.stored_scrolltop = $(window).scrollTop();\n\t\t\t\t\t$(window).scrollTop(0);\n\t\t\t\t}\n\t\t\t};\n\n\t\t\t// bind offscreen nav behaviours\n\t\t\t$('#menu_toggle').on('click.toggle_nav', function () {\n\t\t\t\tif (!$body.hasClass('nav_open') && $body.hasClass('widescreen')) return;\n\n\t\t\t\ttoggleMenu();\n\t\t\t});\n\n\t\t\t// toggle the menu when clicking the overlay (should close it\n\t\t\t$('#overlay').on('click touchstart', toggleMenu);\n\t\t},\n\n\t\tinitHeader: function initHeader(config) {\n\t\t\t// bind hiding header\n\t\t\tvar animateSearch = config ? config.search : false;\n\t\t\tvar animateNav = config ? config.nav : true;\n\n\t\t\t// if a header isn't present, don't initiate headroom.\n\t\t\tif (!$('header').length) return;\n\n\t\t\t$('header').headroom({\n\t\t\t\toffset: 80, // vertical offset in px before element is first unpinned\n\t\t\t\ttolerance: 5, // scroll tolerance in px before state changes\n\t\t\t\tonPin: function onPin() {\n\t\t\t\t\tplastic.header_pin_sig.dispatch();\n\t\t\t\t},\n\t\t\t\tonUnpin: function onUnpin() {\n\t\t\t\t\tplastic.header_unpin_sig.dispatch();\n\t\t\t\t},\n\t\t\t\tsearch: animateSearch,\n\t\t\t\tnav: animateNav\n\t\t\t});\n\t\t},\n\n\t\tinitTabs: function initTabs() {\n\t\t\t$('.tab_set').on('click', function () {\n\t\t\t\t$(this).toggleClass('open');\n\t\t\t}).find('a').on('click', function (e) {\n\t\t\t\tvar $tab = $(this);\n\n\t\t\t\tif ($tab.hasClass('selected') && $tab.attr('href') && !$tab.hasClass('is_linked')) {\n\t\t\t\t\t/* don't try to load tab if it has an href and is selected */\n\t\t\t\t\te.preventDefault();\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\t/* don't try to update tabs if clicked tab has an href */\n\t\t\t\tif ($tab.attr('href')) return;\n\n\t\t\t\t$tab.addClass('selected').siblings('.selected').removeClass('selected');\n\n\t\t\t\t$('.tab_pane.selected').removeClass('selected');\n\t\t\t\t$('.tab_pane[data-tab=\"' + $tab.data('tab') + '\"]').addClass('selected');\n\n\t\t\t\t// push hash to URL\n\t\t\t\twindow.location.hash = $tab.data('tab');\n\t\t\t});\n\n\t\t\t// activate tab and scroll if url hash has an anchor in a tab that isn't visible\n\t\t\t// or to select the tab\n\t\t\tvar hash = window.location.hash;\n\t\t\tif (hash) {\n\t\t\t\t// replace HTML tags in a string with encoded entities\n\t\t\t\thash = String(hash).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');\n\n\t\t\t\tif (hash.charAt(0) === '#') {\n\t\t\t\t\thash = hash.substring(1);\n\t\t\t\t}\n\n\t\t\t\t// if the hash contains any of the chars in the below regex we get a runtime error:\n\t\t\t\t// jquery.v1461001977.js:1458 Uncaught Error: Syntax error, unrecognized expression: a[name=\"...\n\t\t\t\t// this is because special chars need escaping when used as a jquery selector\n\t\t\t\t// @link: http://stackoverflow.com/questions/15338727/jquery-syntax-error-unrecognized-expression\n\t\t\t\t// note: we can eventually replace with CSS.escape (https://developer.mozilla.org/en-US/docs/Web/API/CSS/escape)\n\t\t\t\tvar regex = /(!|\"|#|\\$|%|&|'|\\(|\\)|\\*|\\+|,|\\.|\\/|:|;|<|=|>|\\?|@|\\[|\\]|\\^|`|{|}|\\||~)/g;\n\t\t\t\thash = hash.replace(regex, function (match) {\n\t\t\t\t\treturn '\\\\' + match;\n\t\t\t\t});\n\n\t\t\t\tvar $anchor = $('a[name=\"' + hash + '\"], #' + hash);\n\t\t\t\tvar $tab;\n\t\t\t\tvar $pane;\n\t\t\t\tvar tab_name;\n\t\t\t\tif ($anchor.length > 0) {\n\t\t\t\t\t// scroll to the anchor\n\t\t\t\t\t$pane = $anchor.closest('.tab_pane');\n\t\t\t\t\tif ($pane.length > 0 && !$pane.hasClass('selected')) {\n\t\t\t\t\t\ttab_name = $pane.data('tab');\n\t\t\t\t\t\t$tab = $('a[data-tab=\"' + tab_name + '\"]');\n\t\t\t\t\t\t$tab.click();\n\n\t\t\t\t\t\t// this makes the browser scroll to the anchor again\n\t\t\t\t\t\twindow.location.hash = hash;\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\t// select the tab (e.g. https://pkdev.dev.slack.com/admin/settings#permissions)\n\t\t\t\t\t$tab = $('a[data-tab=\"' + hash + '\"]');\n\t\t\t\t\tif ($tab.length > 0) {\n\t\t\t\t\t\t$tab.click();\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\t$('.tab_set').removeClass('open');\n\t\t\t}\n\t\t},\n\n\t\tinitAlerts: function initAlerts() {\n\t\t\t$('.alert_page').each(function () {\n\t\t\t\t// fade out ephemeral page alerts (see plastic_alerts.source.less)\n\t\t\t\tif ($(this).hasClass('is_ephemeral')) {\n\t\t\t\t\t$(this).addClass('fade');\n\t\t\t\t}\n\t\t\t});\n\t\t},\n\n\t\tinitWidescreen: function initWidescreen() {\n\t\t\t// nav behaviour for wide screens\n\t\t\tvar $window = $(window);\n\t\t\tvar $body = $('body');\n\t\t\tvar $nav = $('nav#site_nav');\n\n\t\t\t// no widescreen nav on full bleed pages\n\t\t\tif ($body.hasClass('full_bleed')) return;\n\n\t\t\t// no widescreen nav on full bleed pages\n\t\t\tif (!$nav.length && !$('#api_nav').length) return;\n\n\t\t\t$window.resize(function () {\n\t\t\t\tvar width = $window.width();\n\t\t\t\tvar height = $window.height();\n\n\t\t\t\tif (width >= plastic.widescreen_threshold && !$body.hasClass('widescreen')) {\n\t\t\t\t\t$body.addClass('widescreen');\n\t\t\t\t} else if (width < plastic.widescreen_threshold && $body.hasClass('widescreen')) {\n\t\t\t\t\t// disable the transition until nav is closed to prevent flash\n\t\t\t\t\t$nav.addClass('no_transition');\n\t\t\t\t\t$body.removeClass('widescreen');\n\n\t\t\t\t\tsetTimeout(function () {\n\t\t\t\t\t\t// re-enable transition after nav is closed\n\t\t\t\t\t\t$nav.removeClass('no_transition');\n\t\t\t\t\t}, 350);\n\t\t\t\t}\n\n\t\t\t\t// make sure overlay covers full screen\n\t\t\t\t$('#page').css('min-height', height);\n\t\t\t}).resize();\n\t\t}\n\t};\n\n\t$(function () {\n\t\tplastic.init();\n\t});\n})();";
  },
  7: function(t, e) {
    var n;
    n = function() {
      return this;
    }();
    try {
      n = n || Function("return this")() || (0, eval)("this");
    } catch (t) {
      if ("object" === typeof window) n = window;
    }
    t.exports = n;
  }
}, [2632]);
