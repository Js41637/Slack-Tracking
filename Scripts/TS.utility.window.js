(function() {
  "use strict";
  TS.registerModule("utility.window", {
    onStart: function() {
      _using_ssb = !!(window.winssb || window.macgap);
    },
    open: function(params) {
      params = _.defaults(params, _DEFAULT_WINDOW_PARAMS);
      params.width = _maybeAdjustWidth(params.width);
      params.height = _maybeAdjustHeight(params.height);
      params.x = params.x || _calcWindowX(params.width);
      params.y = params.y || _calcWindowY(params.width);
      return _using_ssb ? _openWindowInSSB(params) : _openWindowInBrowser(params);
    },
    alwaysOpenInBrowser: function(url) {
      var win = window.open(url);
      if (!_using_ssb) {
        try {
          win.focus();
        } catch (e) {
          _askUserToAllowPopups();
        }
      }
    },
    get: function(token) {
      if (_using_ssb) return;
      return _getWindowRef(token);
    }
  });
  var _using_ssb;
  var _window_store = {};
  var _DEFAULT_WINDOW_PARAMS = {
    title: "",
    url: "about:blank",
    show: true,
    width: 590,
    height: 520,
    no_spinner: true,
    allowThirdPartyNavigation: true,
    try_window_open_in_ssb: false
  };
  var _openWindowInBrowser = function(params) {
    var win = window.open(params.url, params.title, _getWindowOpenFeatures(params));
    try {
      win.focus();
    } catch (e) {
      _askUserToAllowPopups();
      return;
    }
    return _storeWindowRef(win);
  };
  var _openWindowInSSB = function(params) {
    if (params.try_window_open_in_ssb) {
      var win = window.open(params.url, params.title, _getWindowOpenFeatures(params));
      try {
        win.focus();
        return Date.now();
      } catch (e) {
        TS.warn(e);
      }
    }
    return TS.client.windows.openWindow(params);
  };
  var _storeWindowRef = function(win_object) {
    if (_using_ssb || !_isWindowObject(win_object)) return;
    _cleanWindowStore();
    var token = Date.now();
    _window_store[token] = win_object;
    return token;
  };
  var _getWindowRef = function(token) {
    _cleanWindowStore();
    return _window_store[token];
  };
  var _cleanWindowStore = function() {
    _window_store = _.pickBy(_window_store, function(stored_window) {
      return _isWindowObject(stored_window) && !stored_window.closed;
    });
  };
  var _isWindowObject = function(win_object) {
    return win_object === win_object.window;
  };
  var _getWindowOpenFeatures = function(params) {
    var window_features = {
      left: params.x,
      top: params.y,
      width: params.width,
      height: params.height,
      menubar: 0,
      toolbar: 0
    };
    return _.toPairs(window_features).map(function(key_value_pair) {
      return key_value_pair.join("=");
    }).join(",");
  };
  var _calcWindowX = function(width) {
    var screen_x = window.screenX || window.screenLeft;
    var outer_width = window.outerWidth || document.documentElement.offsetWidth;
    return screen_x + (outer_width - width) / 2;
  };
  var _calcWindowY = function(height) {
    var screen_y = window.screenY || window.screenTop;
    var outer_height = window.outerHeight || document.documentElement.offsetHeight;
    return screen_y + (outer_height - height) / 2;
  };
  var _maybeAdjustWidth = function(width) {
    var outer_width = window.outerWidth || document.documentElement.offsetWidth;
    if (width > outer_width) {
      width = outer_width;
    }
    return width;
  };
  var _maybeAdjustHeight = function(height) {
    var outer_height = window.outerHeight || document.documentElement.offsetHeight;
    if (height > outer_height) {
      height = outer_height;
    }
    return height;
  };
  var _askUserToAllowPopups = function() {
    if (bowser && bowser.name) $("#allow_popups_banner_browser").text(bowser.name);
    TS.ui.banner.show("allow_popups");
  };
})();
