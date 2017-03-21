if (typeof jQuery === "undefined") {
  throw new Error("Bootstrap's JavaScript requires jQuery");
}! function($) {
  "use strict";
  var Modal = function(element, options) {
    this.options = options;
    this.$element = $(element).delegate('[data-dismiss="modal"]', "click.dismiss.modal", $.proxy(this.hide, this));
    this.options.remote && this.$element.find(".modal-body").load(this.options.remote);
  };
  Modal.prototype = {
    constructor: Modal,
    toggle: function() {
      return this[!this.isShown ? "show" : "hide"]();
    },
    show: function() {
      var that = this,
        e = $.Event("show");
      this.$element.trigger(e);
      if (this.isShown || e.isDefaultPrevented()) return;
      this.isShown = true;
      this.escape();
      this.backdrop(function() {
        var transition = $.support.transition && that.$element.hasClass("fade");
        if (!that.$element.parent().length) {
          that.$element.appendTo(document.body);
        }
        that.$element.show();
        if (transition) {
          that.$element[0].offsetWidth;
        }
        that.$element.addClass("in").attr("aria-hidden", false);
        that.enforceFocus();
        transition ? that.$element.one($.support.transition.end, function() {
          that.$element.focus().trigger("shown");
        }) : that.$element.focus().trigger("shown");
      });
    },
    hide: function(e) {
      e && e.preventDefault();
      var that = this;
      e = $.Event("hide");
      this.$element.trigger(e);
      if (!this.isShown || e.isDefaultPrevented()) return;
      this.isShown = false;
      this.escape();
      $(document).off("focusin.modal");
      this.$element.removeClass("in").attr("aria-hidden", true);
      $.support.transition && this.$element.hasClass("fade") ? this.hideWithTransition() : this.hideModal();
    },
    enforceFocus: function() {
      var that = this;
      $(document).on("focusin.modal", function(e) {
        if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
          that.$element.focus();
        }
      });
    },
    escape: function() {
      var that = this;
      if (this.isShown && this.options.keyboard) {
        this.$element.on("keyup.dismiss.modal", function(e) {
          e.which == 27 && that.hide();
        });
      } else if (!this.isShown) {
        this.$element.off("keyup.dismiss.modal");
      }
    },
    hideWithTransition: function() {
      var that = this,
        timeout = setTimeout(function() {
          that.$element.off($.support.transition.end);
          that.hideModal();
        }, 500);
      this.$element.one($.support.transition.end, function() {
        clearTimeout(timeout);
        that.hideModal();
      });
    },
    hideModal: function() {
      var that = this;
      this.$element.hide();
      this.backdrop(function() {
        that.removeBackdrop();
        that.$element.trigger("hidden");
      });
    },
    removeBackdrop: function() {
      this.$backdrop.remove();
      this.$backdrop = null;
    },
    backdrop: function(callback) {
      var that = this,
        animate = this.$element.hasClass("fade") ? "fade" : "";
      if (this.isShown && this.options.backdrop) {
        var doAnimate = $.support.transition && animate;
        this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />');
        if ($("#page_contents").length) {
          this.$backdrop.appendTo("#page_contents");
        } else {
          this.$backdrop.appendTo("body");
        }
        this.$backdrop.click(this.options.backdrop == "static" ? $.proxy(this.$element[0].focus, this.$element[0]) : $.proxy(this.hide, this));
        if (doAnimate) this.$backdrop[0].offsetWidth;
        this.$backdrop.addClass("in");
        if (!callback) return;
        doAnimate ? this.$backdrop.one($.support.transition.end, callback) : callback();
      } else if (!this.isShown && this.$backdrop) {
        this.$backdrop.removeClass("in");
        $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one($.support.transition.end, callback) : callback();
      } else if (callback) {
        callback();
      }
    }
  };
  var old = $.fn.modal;
  $.fn.modal = function(option) {
    return this.each(function() {
      var $this = $(this),
        data = $this.data("modal"),
        options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == "object" && option);
      if (!data) $this.data("modal", data = new Modal(this, options));
      if (typeof option == "string") data[option]();
      else if (options.show) data.show();
    });
  };
  $.fn.modal.defaults = {
    backdrop: true,
    keyboard: true,
    show: true
  };
  $.fn.modal.Constructor = Modal;
  $.fn.modal.noConflict = function() {
    $.fn.modal = old;
    return this;
  };
  $(document).on("click.modal.data-api", '[data-toggle="modal"]', function(e) {
    var $this = $(this),
      href = $this.attr("href"),
      $target = $($this.attr("data-target") || href && href.replace(/.*(?=#[^\s]+$)/, "")),
      option = $target.data("modal") ? "toggle" : $.extend({
        remote: !/#/.test(href) && href
      }, $target.data(), $this.data());
    e.preventDefault();
    $target.modal(option).one("hide", function() {
      $this.focus();
    });
  });
}(window.jQuery); + function($) {
  "use strict";
  var Tooltip = function(element, options) {
    this.type = this.options = this.enabled = this.timeout = this.hoverState = this.$element = null;
    this.init("tooltip", element, options);
  };
  Tooltip.DEFAULTS = {
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
  Tooltip.prototype.init = function(type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    var triggers = this.options.trigger.split(" ");
    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];
      if (trigger == "click") {
        this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this));
      } else if (trigger != "manual") {
        var eventIn = trigger == "hover" ? "mouseenter" : "focusin";
        var eventOut = trigger == "hover" ? "mouseleave" : "focusout";
        this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this));
        this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this));
      }
    }
    this.options.selector ? this._options = $.extend({}, this.options, {
      trigger: "manual",
      selector: ""
    }) : this.fixTitle();
  };
  Tooltip.prototype.getDefaults = function() {
    return Tooltip.DEFAULTS;
  };
  Tooltip.prototype.getOptions = function(options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);
    if (options.delay && typeof options.delay == "number") {
      options.delay = {
        show: options.delay,
        hide: options.delay
      };
    }
    return options;
  };
  Tooltip.prototype.getDelegateOptions = function() {
    var options = {};
    var defaults = this.getDefaults();
    this._options && $.each(this._options, function(key, value) {
      if (defaults[key] != value) options[key] = value;
    });
    return options;
  };
  Tooltip.prototype.enter = function(obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
    clearTimeout(self.timeout);
    self.hoverState = "in";
    if (!self.options.delay || !self.options.delay.show) return self.show();
    self.timeout = setTimeout(function() {
      if (self.hoverState == "in") self.show();
    }, self.options.delay.show);
  };
  Tooltip.prototype.leave = function(obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type);
    clearTimeout(self.timeout);
    self.hoverState = "out";
    if (!self.options.delay || !self.options.delay.hide) return self.hide();
    self.timeout = setTimeout(function() {
      if (self.hoverState == "out") self.hide();
    }, self.options.delay.hide);
  };
  Tooltip.prototype.show = function() {
    var e = $.Event("show.bs." + this.type);
    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);
      if (e.isDefaultPrevented()) return;
      var that = this;
      var $tip = this.tip();
      this.setContent();
      if (this.options.animation) $tip.addClass("fade");
      var placement = typeof this.options.placement == "function" ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace) placement = placement.replace(autoToken, "") || "top";
      $tip.detach().css({
        top: 0,
        left: 0,
        display: "block"
      }).addClass(placement);
      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;
      if (autoPlace) {
        var $parent = this.$element.parent();
        var orgPlacement = placement;
        var docScroll = document.documentElement.scrollTop || document.body.scrollTop;
        var parentWidth = this.options.container == "body" ? window.innerWidth : $parent.outerWidth();
        var parentHeight = this.options.container == "body" ? window.innerHeight : $parent.outerHeight();
        var parentLeft = this.options.container == "body" ? 0 : $parent.offset().left;
        placement = placement == "bottom" && pos.top + pos.height + actualHeight - docScroll > parentHeight ? "top" : placement == "top" && pos.top - docScroll - actualHeight < 0 ? "bottom" : placement == "right" && pos.right + actualWidth > parentWidth ? "left" : placement == "left" && pos.left - actualWidth < parentLeft ? "right" : placement;
        $tip.removeClass(orgPlacement).addClass(placement);
      }
      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
      this.applyPlacement(calculatedOffset, placement);
      this.hoverState = null;
      var complete = function() {
        that.$element.trigger("shown.bs." + that.type);
      };
      $.support.transition && this.$tip.hasClass("fade") ? $tip.one($.support.transition.end, complete).emulateTransitionEnd(150) : complete();
    }
  };
  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace;
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight;
    var marginTop = parseInt($tip.css("margin-top"), 10);
    var marginLeft = parseInt($tip.css("margin-left"), 10);
    if (isNaN(marginTop)) marginTop = 0;
    if (isNaN(marginLeft)) marginLeft = 0;
    offset.top = offset.top + marginTop;
    offset.left = offset.left + marginLeft;
    $.offset.setOffset($tip[0], $.extend({
      using: function(props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        });
      }
    }, offset), 0);
    $tip.addClass("in");
    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;
    if (placement == "top" && actualHeight != height) {
      replace = true;
      offset.top = offset.top + height - actualHeight;
    }
    if (/bottom|top/.test(placement)) {
      var delta = 0;
      if (offset.left < 0) {
        delta = offset.left * -2;
        offset.left = 0;
        $tip.offset(offset);
        actualWidth = $tip[0].offsetWidth;
        actualHeight = $tip[0].offsetHeight;
      }
      this.replaceArrow(delta - width + actualWidth, actualWidth, "left");
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, "top");
    }
    if (replace) $tip.offset(offset);
  };
  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? 50 * (1 - delta / dimension) + "%" : "");
  };
  Tooltip.prototype.setContent = function() {
    var $tip = this.tip();
    var title = this.getTitle();
    $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title).html($tip.find(".tooltip-inner").html().replace(/\r/g, "<br>"));
    $tip.removeClass("fade in top bottom left right");
  };
  Tooltip.prototype.hide = function() {
    var that = this;
    var $tip = this.tip();
    var e = $.Event("hide.bs." + this.type);

    function complete() {
      if (that.hoverState != "in") $tip.detach();
      that.$element.trigger("hidden.bs." + that.type);
    }
    this.$element.trigger(e);
    if (e.isDefaultPrevented()) return;
    $tip.removeClass("in");
    $.support.transition && this.$tip.hasClass("fade") ? $tip.one($.support.transition.end, complete).emulateTransitionEnd(150) : complete();
    this.hoverState = null;
    return this;
  };
  Tooltip.prototype.fixTitle = function() {
    var $e = this.$element;
    if ($e.attr("title") || typeof $e.attr("data-original-title") != "string") {
      $e.attr("data-original-title", $e.attr("title") || "").attr("title", "");
    }
  };
  Tooltip.prototype.hasContent = function() {
    return this.getTitle();
  };
  Tooltip.prototype.getPosition = function() {
    var el = this.$element[0];
    return $.extend({}, typeof el.getBoundingClientRect == "function" ? el.getBoundingClientRect() : {
      width: el.offsetWidth,
      height: el.offsetHeight
    }, this.$element.offset());
  };
  Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
    return placement == "bottom" ? {
      top: pos.top + pos.height,
      left: pos.left + pos.width / 2 - actualWidth / 2
    } : placement == "top" ? {
      top: pos.top - actualHeight,
      left: pos.left + pos.width / 2 - actualWidth / 2
    } : placement == "left" ? {
      top: pos.top + pos.height / 2 - actualHeight / 2,
      left: pos.left - actualWidth
    } : {
      top: pos.top + pos.height / 2 - actualHeight / 2,
      left: pos.left + pos.width
    };
  };
  Tooltip.prototype.getTitle = function() {
    var title;
    var $e = this.$element;
    var o = this.options;
    title = $e.attr("data-original-title") || (typeof o.title == "function" ? o.title.call($e[0]) : o.title);
    return title;
  };
  Tooltip.prototype.tip = function() {
    return this.$tip = this.$tip || $(this.options.template);
  };
  Tooltip.prototype.arrow = function() {
    return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow");
  };
  Tooltip.prototype.validate = function() {
    if (!this.$element[0].parentNode) {
      this.hide();
      this.$element = null;
      this.options = null;
    }
  };
  Tooltip.prototype.enable = function() {
    this.enabled = true;
  };
  Tooltip.prototype.disable = function() {
    this.enabled = false;
  };
  Tooltip.prototype.toggleEnabled = function() {
    this.enabled = !this.enabled;
  };
  Tooltip.prototype.toggle = function(e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data("bs." + this.type) : this;
    self.tip().hasClass("in") ? self.leave(self) : self.enter(self);
  };
  Tooltip.prototype.destroy = function() {
    clearTimeout(this.timeout);
    this.hide().$element.off("." + this.type).removeData("bs." + this.type);
  };
  var old = $.fn.tooltip;
  $.fn.tooltip = function(option) {
    return this.each(function() {
      var $this = $(this);
      var data = $this.data("bs.tooltip");
      var options = typeof option == "object" && option;
      if (!data && option == "destroy") return;
      if (!data) $this.data("bs.tooltip", data = new Tooltip(this, options));
      if (typeof option == "string") data[option]();
    });
  };
  $.fn.tooltip.Constructor = Tooltip;
  $.fn.tooltip.noConflict = function() {
    $.fn.tooltip = old;
    return this;
  };
}(jQuery); + function($) {
  "use strict";

  function transitionEnd() {
    var el = document.createElement("bootstrap");
    var transEndEventNames = {
      WebkitTransition: "webkitTransitionEnd",
      MozTransition: "transitionend",
      OTransition: "oTransitionEnd otransitionend",
      transition: "transitionend"
    };
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return {
          end: transEndEventNames[name]
        };
      }
    }
    return false;
  }
  $.fn.emulateTransitionEnd = function(duration) {
    var called = false,
      $el = this;
    $(this).one($.support.transition.end, function() {
      called = true;
    });
    var callback = function() {
      if (!called) $($el).trigger($.support.transition.end);
    };
    setTimeout(callback, duration);
    return this;
  };
  $(function() {
    $.support.transition = transitionEnd();
  });
}(jQuery);

function FastClick(layer) {
  "use strict";
  var oldOnClick, self = this;
  this.trackingClick = false;
  this.trackingClickStart = 0;
  this.targetElement = null;
  this.touchStartX = 0;
  this.touchStartY = 0;
  this.lastTouchIdentifier = 0;
  this.touchBoundary = 10;
  this.layer = layer;
  if (!layer || !layer.nodeType) {
    throw new TypeError("Layer must be a document node");
  }
  this.onClick = function() {
    return FastClick.prototype.onClick.apply(self, arguments);
  };
  this.onMouse = function() {
    return FastClick.prototype.onMouse.apply(self, arguments);
  };
  this.onTouchStart = function() {
    return FastClick.prototype.onTouchStart.apply(self, arguments);
  };
  this.onTouchMove = function() {
    return FastClick.prototype.onTouchMove.apply(self, arguments);
  };
  this.onTouchEnd = function() {
    return FastClick.prototype.onTouchEnd.apply(self, arguments);
  };
  this.onTouchCancel = function() {
    return FastClick.prototype.onTouchCancel.apply(self, arguments);
  };
  if (FastClick.notNeeded(layer)) {
    return;
  }
  if (this.deviceIsAndroid) {
    layer.addEventListener("mouseover", this.onMouse, true);
    layer.addEventListener("mousedown", this.onMouse, true);
    layer.addEventListener("mouseup", this.onMouse, true);
  }
  layer.addEventListener("click", this.onClick, true);
  layer.addEventListener("touchstart", this.onTouchStart, false);
  layer.addEventListener("touchmove", this.onTouchMove, false);
  layer.addEventListener("touchend", this.onTouchEnd, false);
  layer.addEventListener("touchcancel", this.onTouchCancel, false);
  if (!Event.prototype.stopImmediatePropagation) {
    layer.removeEventListener = function(type, callback, capture) {
      var rmv = Node.prototype.removeEventListener;
      if (type === "click") {
        rmv.call(layer, type, callback.hijacked || callback, capture);
      } else {
        rmv.call(layer, type, callback, capture);
      }
    };
    layer.addEventListener = function(type, callback, capture) {
      var adv = Node.prototype.addEventListener;
      if (type === "click") {
        adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
          if (!event.propagationStopped) {
            callback(event);
          }
        }), capture);
      } else {
        adv.call(layer, type, callback, capture);
      }
    };
  }
  if (typeof layer.onclick === "function") {
    oldOnClick = layer.onclick;
    layer.addEventListener("click", function(event) {
      oldOnClick(event);
    }, false);
    layer.onclick = null;
  }
}
FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0;
FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent);
FastClick.prototype.needsClick = function(target) {
  "use strict";
  switch (target.nodeName.toLowerCase()) {
    case "button":
    case "select":
    case "textarea":
      if (target.disabled) {
        return true;
      }
      break;
    case "input":
      if (this.deviceIsIOS && target.type === "file" || target.disabled) {
        return true;
      }
      break;
    case "label":
    case "video":
      return true;
  }
  return /\bneedsclick\b/.test(target.className);
};
FastClick.prototype.needsFocus = function(target) {
  "use strict";
  switch (target.nodeName.toLowerCase()) {
    case "textarea":
      return true;
    case "select":
      return !this.deviceIsAndroid;
    case "input":
      switch (target.type) {
        case "button":
        case "checkbox":
        case "file":
        case "image":
        case "radio":
        case "submit":
          return false;
      }
      return !target.disabled && !target.readOnly;
    default:
      return /\bneedsfocus\b/.test(target.className);
  }
};
FastClick.prototype.sendClick = function(targetElement, event) {
  "use strict";
  var clickEvent, touch;
  if (document.activeElement && document.activeElement !== targetElement) {
    document.activeElement.blur();
  }
  touch = event.changedTouches[0];
  clickEvent = document.createEvent("MouseEvents");
  clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
  clickEvent.forwardedTouchEvent = true;
  targetElement.dispatchEvent(clickEvent);
};
FastClick.prototype.determineEventType = function(targetElement) {
  "use strict";
  if (this.deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
    return "mousedown";
  }
  return "click";
};
FastClick.prototype.focus = function(targetElement) {
  "use strict";
  var length;
  if (this.deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time") {
    length = targetElement.value.length;
    targetElement.setSelectionRange(length, length);
  } else {
    targetElement.focus();
  }
};
FastClick.prototype.updateScrollParent = function(targetElement) {
  "use strict";
  var scrollParent, parentElement;
  scrollParent = targetElement.fastClickScrollParent;
  if (!scrollParent || !scrollParent.contains(targetElement)) {
    parentElement = targetElement;
    do {
      if (parentElement.scrollHeight > parentElement.offsetHeight) {
        scrollParent = parentElement;
        targetElement.fastClickScrollParent = parentElement;
        break;
      }
      parentElement = parentElement.parentElement;
    } while (parentElement);
  }
  if (scrollParent) {
    scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
  }
};
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
  "use strict";
  if (eventTarget.nodeType === Node.TEXT_NODE) {
    return eventTarget.parentNode;
  }
  return eventTarget;
};
FastClick.prototype.onTouchStart = function(event) {
  "use strict";
  var targetElement, touch, selection;
  if (event.targetTouches.length > 1) {
    return true;
  }
  targetElement = this.getTargetElementFromEventTarget(event.target);
  touch = event.targetTouches[0];
  if (this.deviceIsIOS) {
    selection = window.getSelection();
    if (selection.rangeCount && !selection.isCollapsed) {
      return true;
    }
    if (!this.deviceIsIOS4) {
      if (touch.identifier === this.lastTouchIdentifier) {
        event.preventDefault();
        return false;
      }
      this.lastTouchIdentifier = touch.identifier;
      this.updateScrollParent(targetElement);
    }
  }
  this.trackingClick = true;
  this.trackingClickStart = event.timeStamp;
  this.targetElement = targetElement;
  this.touchStartX = touch.pageX;
  this.touchStartY = touch.pageY;
  if (event.timeStamp - this.lastClickTime < 200) {
    event.preventDefault();
  }
  return true;
};
FastClick.prototype.touchHasMoved = function(event) {
  "use strict";
  var touch = event.changedTouches[0],
    boundary = this.touchBoundary;
  if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
    return true;
  }
  return false;
};
FastClick.prototype.onTouchMove = function(event) {
  "use strict";
  if (!this.trackingClick) {
    return true;
  }
  if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
    this.trackingClick = false;
    this.targetElement = null;
  }
  return true;
};
FastClick.prototype.findControl = function(labelElement) {
  "use strict";
  if (labelElement.control !== undefined) {
    return labelElement.control;
  }
  if (labelElement.htmlFor) {
    return document.getElementById(labelElement.htmlFor);
  }
  return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
};
FastClick.prototype.onTouchEnd = function(event) {
  "use strict";
  var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
  if (!this.trackingClick) {
    return true;
  }
  if (event.timeStamp - this.lastClickTime < 200) {
    this.cancelNextClick = true;
    return true;
  }
  this.cancelNextClick = false;
  this.lastClickTime = event.timeStamp;
  trackingClickStart = this.trackingClickStart;
  this.trackingClick = false;
  this.trackingClickStart = 0;
  if (this.deviceIsIOSWithBadTarget) {
    touch = event.changedTouches[0];
    targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
    targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
  }
  targetTagName = targetElement.tagName.toLowerCase();
  if (targetTagName === "label") {
    forElement = this.findControl(targetElement);
    if (forElement) {
      this.focus(targetElement);
      if (this.deviceIsAndroid) {
        return false;
      }
      targetElement = forElement;
    }
  } else if (this.needsFocus(targetElement)) {
    if (event.timeStamp - trackingClickStart > 100 || this.deviceIsIOS && window.top !== window && targetTagName === "input") {
      this.targetElement = null;
      return false;
    }
    this.focus(targetElement);
    if (!this.deviceIsIOS4 || targetTagName !== "select") {
      this.targetElement = null;
      event.preventDefault();
    }
    return false;
  }
  if (this.deviceIsIOS && !this.deviceIsIOS4) {
    scrollParent = targetElement.fastClickScrollParent;
    if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
      return true;
    }
  }
  if (!this.needsClick(targetElement)) {
    event.preventDefault();
    this.sendClick(targetElement, event);
  }
  return false;
};
FastClick.prototype.onTouchCancel = function() {
  "use strict";
  this.trackingClick = false;
  this.targetElement = null;
};
FastClick.prototype.onMouse = function(event) {
  "use strict";
  if (!this.targetElement) {
    return true;
  }
  if (event.forwardedTouchEvent) {
    return true;
  }
  if (!event.cancelable) {
    return true;
  }
  if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    } else {
      event.propagationStopped = true;
    }
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
  return true;
};
FastClick.prototype.onClick = function(event) {
  "use strict";
  var permitted;
  if (this.trackingClick) {
    this.targetElement = null;
    this.trackingClick = false;
    return true;
  }
  if (event.target.type === "submit" && event.detail === 0) {
    return true;
  }
  permitted = this.onMouse(event);
  if (!permitted) {
    this.targetElement = null;
  }
  return permitted;
};
FastClick.prototype.destroy = function() {
  "use strict";
  var layer = this.layer;
  if (this.deviceIsAndroid) {
    layer.removeEventListener("mouseover", this.onMouse, true);
    layer.removeEventListener("mousedown", this.onMouse, true);
    layer.removeEventListener("mouseup", this.onMouse, true);
  }
  layer.removeEventListener("click", this.onClick, true);
  layer.removeEventListener("touchstart", this.onTouchStart, false);
  layer.removeEventListener("touchmove", this.onTouchMove, false);
  layer.removeEventListener("touchend", this.onTouchEnd, false);
  layer.removeEventListener("touchcancel", this.onTouchCancel, false);
};
FastClick.notNeeded = function(layer) {
  "use strict";
  var metaViewport;
  var chromeVersion;
  if (typeof window.ontouchstart === "undefined") {
    return true;
  }
  chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1];
  if (chromeVersion) {
    if (FastClick.prototype.deviceIsAndroid) {
      metaViewport = document.querySelector("meta[name=viewport]");
      if (metaViewport) {
        if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
          return true;
        }
        if (chromeVersion > 31 && window.innerWidth <= window.screen.width) {
          return true;
        }
      }
    } else {
      return true;
    }
  }
  if (layer.style.msTouchAction === "none") {
    return true;
  }
  return false;
};
FastClick.attach = function(layer) {
  "use strict";
  return new FastClick(layer);
};
if (typeof define !== "undefined" && define.amd) {
  define(function() {
    "use strict";
    return FastClick;
  });
} else if (typeof module !== "undefined" && module.exports) {
  module.exports = FastClick.attach;
  module.exports.FastClick = FastClick;
} else {
  window.FastClick = FastClick;
}(function(window, document) {
  "use strict";
  var features = {
    bind: !! function() {}.bind,
    classList: "classList" in document.documentElement,
    rAF: !!(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame)
  };
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  function Debouncer(callback) {
    this.callback = callback;
    this.ticking = false;
  }
  Debouncer.prototype = {
    constructor: Debouncer,
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

  function isDOMElement(obj) {
    return obj && typeof window !== "undefined" && (obj === window || obj.nodeType);
  }

  function extend(object) {
    if (arguments.length <= 0) {
      throw new Error("Missing arguments in extend function");
    }
    var result = object || {},
      key, i;
    for (i = 1; i < arguments.length; i++) {
      var replacement = arguments[i] || {};
      for (key in replacement) {
        if (typeof result[key] === "object" && !isDOMElement(result[key])) {
          result[key] = extend(result[key], replacement[key]);
        } else {
          result[key] = result[key] || replacement[key];
        }
      }
    }
    return result;
  }

  function normalizeTolerance(t) {
    return t === Object(t) ? t : {
      down: t,
      up: t
    };
  }

  function Headroom(elem, options) {
    options = extend(options, Headroom.options);
    this.lastKnownScrollY = 0;
    this.elem = elem;
    this.debouncer = new Debouncer(this.update.bind(this));
    this.tolerance = normalizeTolerance(options.tolerance);
    this.classes = options.classes;
    this.offset = options.offset;
    this.scroller = options.scroller;
    this.initialised = false;
    this.onPin = options.onPin;
    this.onUnpin = options.onUnpin;
    this.onTop = options.onTop;
    this.onNotTop = options.onNotTop;
  }
  Headroom.prototype = {
    constructor: Headroom,
    init: function() {
      if (!Headroom.cutsTheMustard) {
        return;
      }
      this.elem.classList.add(this.classes.initial);
      setTimeout(this.attachEvent.bind(this), 100);
      return this;
    },
    destroy: function() {
      var classes = this.classes;
      this.initialised = false;
      this.elem.classList.remove(classes.unpinned, classes.pinned, classes.top, classes.initial);
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
      var classList = this.elem.classList,
        classes = this.classes;
      if (classList.contains(classes.pinned) || !classList.contains(classes.unpinned)) {
        classList.add(classes.unpinned);
        classList.remove(classes.pinned);
        this.onUnpin && this.onUnpin.call(this);
      }
    },
    pin: function() {
      var classList = this.elem.classList,
        classes = this.classes;
      if (classList.contains(classes.unpinned)) {
        classList.remove(classes.unpinned);
        classList.add(classes.pinned);
        this.onPin && this.onPin.call(this);
      }
    },
    top: function() {
      var classList = this.elem.classList,
        classes = this.classes;
      if (!classList.contains(classes.top)) {
        classList.add(classes.top);
        classList.remove(classes.notTop);
        this.onTop && this.onTop.call(this);
      }
    },
    notTop: function() {
      var classList = this.elem.classList,
        classes = this.classes;
      if (!classList.contains(classes.notTop)) {
        classList.add(classes.notTop);
        classList.remove(classes.top);
        this.onNotTop && this.onNotTop.call(this);
      }
    },
    getScrollY: function() {
      return this.scroller.pageYOffset !== undefined ? this.scroller.pageYOffset : this.scroller.scrollTop !== undefined ? this.scroller.scrollTop : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    },
    getViewportHeight: function() {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },
    getDocumentHeight: function() {
      var body = document.body,
        documentElement = document.documentElement;
      return Math.max(body.scrollHeight, documentElement.scrollHeight, body.offsetHeight, documentElement.offsetHeight, body.clientHeight, documentElement.clientHeight);
    },
    getElementHeight: function(elm) {
      return Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight);
    },
    getScrollerHeight: function() {
      return this.scroller === window || this.scroller === document.body ? this.getDocumentHeight() : this.getElementHeight(this.scroller);
    },
    isOutOfBounds: function(currentScrollY) {
      var pastTop = currentScrollY < 0,
        pastBottom = currentScrollY + this.getViewportHeight() > this.getScrollerHeight();
      return pastTop || pastBottom;
    },
    toleranceExceeded: function(currentScrollY, direction) {
      return Math.abs(currentScrollY - this.lastKnownScrollY) >= this.tolerance[direction];
    },
    shouldUnpin: function(currentScrollY, toleranceExceeded) {
      var scrollingDown = currentScrollY > this.lastKnownScrollY,
        pastOffset = currentScrollY >= this.offset;
      return scrollingDown && pastOffset && toleranceExceeded;
    },
    shouldPin: function(currentScrollY, toleranceExceeded) {
      var scrollingUp = currentScrollY < this.lastKnownScrollY,
        pastOffset = currentScrollY <= this.offset;
      return scrollingUp && toleranceExceeded || pastOffset;
    },
    update: function() {
      var currentScrollY = this.getScrollY(),
        scrollDirection = currentScrollY > this.lastKnownScrollY ? "down" : "up",
        toleranceExceeded = this.toleranceExceeded(currentScrollY, scrollDirection);
      if (this.isOutOfBounds(currentScrollY)) {
        return;
      }
      if (currentScrollY <= this.offset) {
        this.top();
      } else {
        this.notTop();
      }
      if (this.shouldUnpin(currentScrollY, toleranceExceeded)) {
        this.unpin();
      } else if (this.shouldPin(currentScrollY, toleranceExceeded)) {
        this.pin();
      }
      this.lastKnownScrollY = currentScrollY;
    }
  };
  Headroom.options = {
    tolerance: {
      up: 0,
      down: 0
    },
    offset: 0,
    scroller: window,
    classes: {
      pinned: "headroom--pinned",
      unpinned: "headroom--unpinned",
      top: "headroom--top",
      notTop: "headroom--not-top",
      initial: "headroom"
    }
  };
  Headroom.cutsTheMustard = typeof features !== "undefined" && features.rAF && features.bind && features.classList;
  window.Headroom = Headroom;
})(window, document);
(function() {
  "use strict";
  var plastic = {
    header_pin_sig: new signals.Signal,
    header_unpin_sig: new signals.Signal,
    widescreen_threshold: 1441,
    stored_scrolltop: 0,
    init: function() {
      var is_touch = "ontouchstart" in document.documentElement;
      if (is_touch) {
        $("html").addClass("touch");
        FastClick.attach(document.body);
      } else {
        $("html").addClass("no_touch");
      }
      plastic.initTabs();
      plastic.initAlerts();
      if ($("#api_nav").length) {
        plastic.initAPINav();
      } else if (window.TS && TS.boot_data && !TS.boot_data.no_login) {
        plastic.initNav();
      }
      if ($("nav.apps_nav:not(.clear_nav)").length) plastic.initHeader();
      plastic.initWidescreen();
      var $nav = $("nav#site_nav");
      setTimeout(function() {
        $nav.removeClass("no_transition");
        $("#menu_toggle").removeClass("no_transition");
        $("#header_team_name").removeClass("no_transition");
      }, 0);
      window.plastic = plastic;
    },
    initNav: function() {
      plastic.initHeader();
      var $body = $("body");
      $("#menu_toggle").on("click.toggle_nav", function() {
        if (!$body.hasClass("nav_open") && $body.hasClass("widescreen")) return;
        $body.toggleClass("nav_open");
      });
      $("#user_menu_contents").on("click.toggle_nav", function(e) {
        if (!$(e.target).is("a")) {
          if (!$body.hasClass("nav_open") && $body.hasClass("widescreen")) return;
          $body.toggleClass("nav_open");
        }
      });
      $("#overlay").on("click touchend", function() {
        $body.toggleClass("nav_open");
      });
      $('[data-qa="billing"]').click(function() {
        TS.clog.track("GROWTH_PRICING", {
          contexts: {
            ui_context: {
              step: "home",
              action: "click",
              ui_element: "billing_link"
            }
          }
        });
      });
      $("#team_switcher").on("click", function() {
        $("#header_team_nav").toggleClass("open");
      });
      $("html").bind("mousedown.team_nav touchstart.team_nav", function(e) {
        if ($(e.target).closest("#header_team_nav").length == 0 && $(e.target).closest("#team_switcher").length == 0) {
          $("#header_team_nav").removeClass("open");
        }
      });
      var nav_height = $("#user_menu").outerHeight() + $("#api_nav").outerHeight() + $(".nav_contents").outerHeight() + $("#footer").outerHeight();
      $("head").append('<style type="text/css"> ' + "#footer {" + "bottom: 0;" + "position: absolute;" + "}" + "@media only screen and (max-height: " + nav_height + "px) { " + "nav#api_nav #footer, " + "nav#site_nav #footer { " + "position: relative; " + "bottom: auto; " + "} " + "}\n" + "@media only screen and (min-width: " + plastic.widescreen_threshold + "px) { " + "body:not(.nav_open) nav#site_nav #footer { " + "position: relative; " + "bottom: auto; " + "} " + "}" + "</style>");
    },
    initAPINav: function() {
      plastic.initHeader();
      var $body = $("body");
      var toggleMenu = function() {
        $body.toggleClass("nav_open");
        $("html").toggleClass("no_scroll");
        if (!$body.hasClass("nav_open")) {
          $(window).scrollTop(plastic.stored_scrolltop);
        } else {
          plastic.stored_scrolltop = $(window).scrollTop();
          $(window).scrollTop(0);
        }
      };
      $("#menu_toggle").on("click.toggle_nav", function() {
        if (!$body.hasClass("nav_open") && $body.hasClass("widescreen")) return;
        toggleMenu();
      });
      $("#overlay").on("click touchstart", toggleMenu);
    },
    initHeader: function() {
      $("header").headroom({
        offset: 80,
        tolerance: 5,
        onPin: function() {
          plastic.header_pin_sig.dispatch();
        },
        onUnpin: function() {
          plastic.header_unpin_sig.dispatch();
        }
      });
    },
    initTabs: function() {
      $(".tab_set").on("click", function() {
        $(this).toggleClass("open");
      }).find("a").on("click", function(e) {
        var $tab = $(this);
        if ($tab.hasClass("selected") && $tab.attr("href") && !$tab.hasClass("is_linked")) {
          e.preventDefault();
          return;
        }
        if ($tab.attr("href")) return;
        $tab.addClass("selected").siblings(".selected").removeClass("selected");
        $(".tab_pane.selected").removeClass("selected");
        $('.tab_pane[data-tab="' + $tab.data("tab") + '"]').addClass("selected");
        window.location.hash = $tab.data("tab");
      });
      var hash = window.location.hash;
      if (hash) {
        hash = String(hash).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        if (hash.charAt(0) === "#") {
          hash = hash.substring(1);
        }
        var regex = /(!|"|#|\$|%|&|'|\(|\)|\*|\+|,|\.|\/|:|;|<|=|>|\?|@|\[|\]|\^|`|{|}|\||~)/g;
        hash = hash.replace(regex, function(match) {
          return "\\" + match;
        });
        var $anchor = $('a[name="' + hash + '"], #' + hash);
        var $tab, $pane, tab_name;
        if ($anchor.length > 0) {
          $pane = $anchor.closest(".tab_pane");
          if ($pane.length > 0 && !$pane.hasClass("selected")) {
            tab_name = $pane.data("tab");
            $tab = $('a[data-tab="' + tab_name + '"]');
            $tab.click();
            window.location.hash = hash;
          }
        } else {
          $tab = $('a[data-tab="' + hash + '"]');
          if ($tab.length > 0) {
            $tab.click();
          }
        }
        $(".tab_set").removeClass("open");
      }
    },
    initAlerts: function() {
      $(".alert_page").each(function() {
        if ($(this).hasClass("is_ephemeral")) {
          $(this).addClass("fade");
        }
      });
    },
    initWidescreen: function() {
      var $window = $(window);
      var $body = $("body");
      var $nav = $("nav#site_nav");
      if ($body.hasClass("full_bleed")) return;
      if (!$nav.length && !$("#api_nav").length) return;
      $window.resize(function() {
        var width = $window.width();
        var height = $window.height();
        if (width >= plastic.widescreen_threshold && !$body.hasClass("widescreen")) {
          $body.addClass("widescreen");
        } else if (width < plastic.widescreen_threshold && $body.hasClass("widescreen")) {
          $nav.addClass("no_transition");
          $body.removeClass("widescreen");
          setTimeout(function() {
            $nav.removeClass("no_transition");
          }, 350);
        }
        $("#page").css("min-height", height);
      }).resize();
    }
  };
  $(function() {
    plastic.init();
  });
})();
$(window).load(function() {
  "use strict";
  var gtmDataLayer = window.dataLayer || [];
  $(".ga_track_signup").on("click", function(e) {
    gtmDataLayer.push({
      event: "SignUp"
    });
  });
  $("a[data-gtm-click]").on("click", function(e) {
    gtmDataLayer.push({
      event: $(this).attr("data-gtm-click")
    });
  });
  $(".opt_cta_signin").on("click", function(e) {
    gtmDataLayer.push({
      event: "optout_signin"
    });
  });
  $(".opt_nav_signin").on("click", function(e) {
    gtmDataLayer.push({
      event: "optout_nav_signin"
    });
  });
  $(".opt_cta_find").on("click", function(e) {
    gtmDataLayer.push({
      event: "optout_find_team"
    });
  });
  $(".opt_nav_find").on("click", function(e) {
    gtmDataLayer.push({
      event: "optout_nav_find_team"
    });
  });
  $(".opt_cta_create").on("click", function(e) {
    gtmDataLayer.push({
      event: "optout_create_team"
    });
  });
  $(".opt_nav_create").on("click", function(e) {
    gtmDataLayer.push({
      event: "optout_nav_create_team"
    });
  });
  $("#submit_team_domain").on("click", function(e) {
    gtmDataLayer.push({
      event: "submit_team_domain"
    });
  });
});
