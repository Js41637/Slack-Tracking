(function() {
  "use strict";
  var _beaconError = function(e, desc) {
    var team_id = TS.model && TS.model.team && TS.model.team.id ? TS.model.team.id : "none";
    var user_id = TS.model && TS.model.user && TS.model.user.id ? TS.model.user.id : "none";
    var beacon_data = {
      description: desc,
      error_json: JSON.stringify(e),
      team: team_id,
      user: user_id,
      version: TS.boot_data.version_ts
    };
    $.post(TS.boot_data.beacon_error_url, beacon_data);
  };
  var _console = function(type, pri, args) {
    if (!window.console || !console[type]) return;
    var clean_log = TS.qs_args.clean_log;
    var has_pri = pri !== null;
    args = Array.prototype.slice.call(args);
    if (has_pri) {
      if (!TS.console.shouldLog(pri)) return;
      args.splice(0, 1);
    }
    args = _.map(args, function(arg) {
      return _maybeRedactFields(arg);
    });
    var all_strings = true;
    var i = args.length;
    while (all_strings && i) {
      i -= 1;
      all_strings = typeof args[i] === "string";
    }
    if (clean_log && type !== "error" && (pri !== parseInt(TS.qs_args.pri, 10) || !has_pri)) return;
    if (all_strings) {
      var log_date = TS.makeLogDate();
      if (has_pri && !clean_log) log_date += "[** " + pri + " **]";
      args.unshift(log_date);
      console[type](args.join(" "));
    } else {
      console[type].apply(console, args);
    }
  };
  if (!window.TS) window.TS = {};
  TS.console = {
    onStart: function() {
      TS.console.setAppropriatePri(true);
      TS.console.watchForErrors();
    },
    count: function() {
      _console("count", null, arguments);
    },
    dir: function(pri, ob, txt) {
      if (!window.console || !console.dir) return;
      if (pri && !TS.shouldLog(pri)) return;
      txt = txt || "";
      ob = _maybeRedactFields(ob);
      var dir_json = parseInt(TS.qs_args.dir_json, 10);
      if (dir_json) {
        var limit = dir_json == 1 ? "2000" : dir_json;
        try {
          var st = JSON.stringify(ob, null, "  ");
          if (st.length > limit) throw new Error("too long");
          console.info(TS.makeLogDate() + "[** " + pri + " **] " + txt + " " + st);
          return;
        } catch (err) {
          if (err !== "too long") {
            console.info(TS.makeLogDate() + "[** " + pri + " **] " + txt + " " + ob);
            return;
          }
        }
      }
      try {
        var clone = _.cloneDeep(ob);
        console.info(TS.makeLogDate() + "[** " + pri + " **] " + txt + " 👇");
        console.dir(clone);
      } catch (err) {
        TS.warn("could not dir ob:" + ob + " err:" + err);
      }
    },
    error: function() {
      _console("error", null, arguments);
    },
    group: function() {
      _console("group", null, arguments);
    },
    groupCollapsed: function() {
      _console("groupCollapsed", null, arguments);
    },
    groupEnd: function() {
      _console("groupEnd", null, arguments);
    },
    maybeError: function(pri) {
      _console("error", pri, arguments);
    },
    getStackTrace: function() {
      var is_dev = _.get(TS, "boot_data.version_ts") === "dev" || _.get(TS, "qs_args.js_path");
      var stack = (new Error).stack;
      if (is_dev) {
        var temp_error = new Error;
        var temp_promise = Promise.resolve();
        if (_.isFunction(temp_promise._attachExtraTrace)) {
          temp_promise._attachExtraTrace(temp_error);
          stack = temp_error.stack || "";
          var split_stack = stack.split("\n");
          if (split_stack.length && split_stack.indexOf("From previous event:") >= 0) {
            var slice_index = split_stack.indexOf("From previous event:") + 1;
            stack = [split_stack[0]].concat(split_stack.slice(slice_index)).join("\n");
          }
        }
      }
      var bits;
      if (!stack) {
        bits = ["no stacktrace available"];
      } else {
        bits = stack.split && stack.split("\n") || ["[could not parse stack]", stack];
      }
      bits = _.filter(bits, function(bit) {
        if (bit.indexOf("Error") === 0) return false;
        return bit.trim().length && bit.indexOf("StackTrace") === -1;
      });
      bits = _.map(bits, function(bit) {
        return bit.trim();
      });
      var details = bits.join("\n");
      return details;
    },
    info: function() {
      _console("info", null, arguments);
    },
    log: function(pri) {
      _console("log", pri, arguments);
    },
    logError: function(e, desc, subtype, silent) {
      var error = e instanceof Error ? e : new Error;
      var error_json = {
        subtype: subtype || "none",
        message: e instanceof Error ? e.message || e.description : JSON.stringify(e),
        fileName: error.fileName || error.sourceURL,
        lineNumber: error.lineNumber || error.line,
        stack: error.stack || error.backtrace || error.stacktrace
      };
      _beaconError(error_json, desc);
      if (!silent && window.console && console.error) console.error(TS.makeLogDate() + "logging " + (e ? "e: " + e : "") + (e && e.stack ? " e.stack: " + e.stack : "") + (desc ? " desc: " + desc : "") + (e && e.message ? " e.message: " + e.message : ""));
    },
    logStackTrace: function(message) {
      var prefix = _.isUndefined(message) ? "" : message + "\n";
      TS.console.info(prefix + "Stacktrace: ↴\n", TS.console.getStackTrace());
    },
    profile: function() {
      _console("profile", null, arguments);
    },
    profileEnd: function() {
      _console("profileEnd", null, arguments);
    },
    replaceConsoleFunction: function(fn) {
      var prev_console = _console;
      _console = fn;
      return prev_console;
    },
    setAppropriatePri: function(use_boot) {
      var pri = "";
      if (TS.qs_args.pri) pri += TS.qs_args.pri;
      if (use_boot && TS.boot_data.client_logs_pri) {
        if (pri !== "") pri += ",";
        pri += TS.boot_data.client_logs_pri;
      }
      if (TS.model && TS.model.prefs && TS.model.prefs.client_logs_pri) {
        if (pri !== "") pri += ",";
        pri += TS.model.prefs.client_logs_pri;
      }
      if (pri !== "") pri += ",";
      pri += "0";
      TS.pri = _.uniq(pri.split(",")).join(",");
      _determineKeysToCheck();
    },
    shouldLog: function(pri) {
      var A = String(TS.pri).split(",");
      if (A.indexOf("all") !== -1 || A.indexOf("*") !== -1) return true;
      if (A.indexOf(String(pri)) !== -1) return true;
      return typeof TS.has_pri[pri] !== "undefined";
    },
    table: function() {
      _console("table", null, arguments);
    },
    time: function() {
      _console("time", null, arguments);
    },
    timeEnd: function() {
      _console("timeEnd", null, arguments);
    },
    timeStamp: function() {
      _console("timeStamp", null, arguments);
    },
    warn: function() {
      _console("warn", null, arguments);
    },
    maybeWarn: function(pri) {
      _console("warn", pri, arguments);
    },
    watchForErrors: function() {
      if (!TS.boot_data || !TS.boot_data.feature_tinyspeck) return;
      var capture = true;
      window.addEventListener("error", _windowErrorHandler, capture);
    },
    trace: function() {
      _console("trace", null, arguments);
    },
    maybeTrace: function(pri) {
      _console("trace", pri, arguments);
    },
    test: function() {
      return {
        _maybeRedactFields: _maybeRedactFields,
        _windowErrorHandler: _windowErrorHandler
      };
    }
  };
  var _determineKeysToCheck = function() {
    var pris = String(TS.pri).split(",");
    TS.has_pri = _(Object.keys(TS.boot_data.client_logs || {})).filter(function(key) {
      var obj = TS.boot_data.client_logs[key];
      return pris.some(function(pri) {
        if (pri === "*") return true;
        if (obj.numbers.indexOf(parseInt(pri, 10)) > -1) return true;
        if (obj.name && obj.name.indexOf(pri) > -1) return true;
        if (obj.owner && obj.owner.indexOf(pri) > -1) return true;
        return false;
      });
    }).map(function(key) {
      if (parseInt(key, 10) >= 0) return parseInt(key, 10);
      return key;
    }).keyBy(function(key) {
      return key;
    }).value();
  };
  var _redactable_names = {
    name: 1,
    real_name: 1,
    src: 1,
    text: 1,
    msgs: 1
  };
  var _maybeRedactFields = function(obj, iteration_count) {
    if (!TS.boot_data || TS.boot_data.feature_tinyspeck || TS.boot_data.version_ts === "dev") return obj;
    if (!obj || !_.isObject(obj)) return obj;
    if (iteration_count) {
      iteration_count += 1;
    } else {
      iteration_count = 1;
    }
    if (iteration_count >= 10) return obj;
    var redacted_obj;
    if (_.isArray(obj)) {
      redacted_obj = [];
    } else {
      redacted_obj = {};
    }
    _.each(obj, function(value, name) {
      if (_redactable_names[name]) {
        redacted_obj[name] = "[redacted " + _type(value) + "]";
      } else {
        redacted_obj[name] = _maybeRedactFields(value, iteration_count);
      }
    });
    return redacted_obj;
  };
  var _type = function(global) {
    var cache = {};
    return function(obj) {
      var key = typeof obj;
      if (obj === null) return "null";
      if (obj === global) return "global";
      if (key !== "object") return key;
      if (obj.nodeType) return "DOM node";
      var result = cache[key = {}.toString.call(obj)] || (cache[key] = key.slice(8, -1).toLowerCase());
      return result;
    };
  }(this);
  var _windowErrorHandler = function() {
    var err = arguments && arguments[0];
    var node;
    var details = "";
    var msg;
    var do_beacon = true;
    if (!err) return;
    details = "";
    node = err.srcElement || err.target;
    if (node && node.nodeName) {
      if (node.nodeName === "SCRIPT") {
        details = (err.type || "error") + " from script at " + node.src + " (failed to load?)";
      } else if (node.nodeName === "IMG") {
        if (TS.pri && TS.console && TS.console.warn) TS.console.warn("<img> fired error with url = " + (node.src || node.currentSrc || "unkonwn"));
        return;
      }
    }
    if (err.error && err.error.stack) {
      details += err.error.stack;
    } else if (err.filename) {
      details = " from " + err.filename + (err.lineno ? " @ line " + err.lineno + ", col " + err.colno : "");
    }
    msg = (!err.error || !err.error.stack ? err.message || "" : "") + " " + details;
    if (msg && msg.replace) msg = msg.replace(/\s+/g, " ").trim();
    if (!msg || !msg.length) {
      if (node) {
        msg = "error event from node of " + (node.nodeName || "unknown") + ", no message provided?";
      } else {
        msg = "error event fired, no relevant message or node found";
      }
      do_beacon = false;
    }
    msg = "🐞 " + msg;
    (TS.console && TS.console.error || window.console.error || function() {})(msg);
    if (do_beacon) {
      var subtype = null;
      var silent = false;
      TS.console.logError(err.error || err, msg, subtype, silent);
    }
    node = null;
    msg = null;
  };
})();
(function() {
  "use strict";
  if (!window.TS) window.TS = {};
  TS.features = {
    isEnabled: function(feature_flag) {
      if (feature_flag.indexOf("feature_") === 0) {
        TS.console.warn("Do not prefix your feature flag check with `feature_`. Flag:", feature_flag);
        return;
      }
      if (_.isUndefined(TS.boot_data)) {
        TS.console.warn("Trying to check feature flag before TS.boot_data is available");
        return;
      }
      var formatted_feature_flag = "feature_" + feature_flag;
      if (_.isUndefined(TS.boot_data[formatted_feature_flag])) {
        TS.console.warn("Trying to access feature flag not present in TS.boot_data -- Expose your feature flag to JS. Flag:", feature_flag);
        return;
      }
      return TS.boot_data[formatted_feature_flag];
    }
  };
})();
(function() {
  "use strict";
  var _raw_templates = window.TS && TS.raw_templates;
  var _console_module = window.TS && TS.console;
  var _features_module = window.TS && TS.features;
  var _guid = 0;
  var _fully_booted_p_resolve;
  var _fully_booted_p;
  var _did_call_did_finish_loading = false;
  var FORCE_CALL_DID_FINISH_LOADING_DELAY_MS = 7e4;
  window.TS = {
    boot_data: {},
    qs_args: {},
    pri: 0,
    has_pri: {},
    console: _console_module,
    features: _features_module,
    exportToLegacy: function(name, ob) {
      if (_.has(TS, name)) throw new Error("exportToLegacy: there is already something at " + name + "; we cannot overwrite it");
      if (ob.onStart) throw new Error("exportToLegacy: may not export objects with onStart methods");
      if (_dom_is_ready) {
        _.set(TS, name, ob);
      } else {
        TS.registerModule(name, ob);
      }
    },
    boot: function(boot_data) {
      _configureBluebirdBeforeFirstUse(boot_data);
      _fully_booted_p = new Promise(function(resolve) {
        _fully_booted_p_resolve = resolve;
      });
      TS.boot_data = boot_data;
      if (TS.qs_args.js_path) {
        TS.boot_data.version_ts = "local_js";
      }
      TS.console.onStart();
      if (TS.client) TS.client.setClientLoadWatchdogTimer();
      TS.model.api_url = TS.boot_data.api_url;
      TS.model.async_api_url = TS.boot_data.async_api_url;
      TS.model.api_token = TS.boot_data.api_token;
      TS.model.webhook_url = TS.boot_data.webhook_url;
      if (TS.boot_data.page_needs_enterprise) TS.model.enterprise_api_token = TS.boot_data.enterprise_api_token;
      TS.info("booted! pri:" + TS.pri + " version:" + TS.boot_data.version_ts + " start_ms:" + TS.boot_data.start_ms + " (" + (Date.now() - TS.boot_data.start_ms + "ms ago)"));
      if (TS.web && TS.web.space) {
        TS.web.space.showFastPreview();
      }
      $(document).ready(_onDOMReady);
    },
    useRedux: function() {
      if (!TS.client) {
        return false;
      }
      return TS.boot_data.feature_store_models_in_redux;
    },
    useReactDownloads: function() {
      return window.TS && TS.environment.isSSBAndAtLeastVersion("2.7");
    },
    lazyLoadMembersAndBots: function() {
      return !!(TS.boot_data.should_use_flannel || TS.boot_data.feature_lazy_load_members_and_bots_everywhere);
    },
    useSocket: function() {
      return _shouldConnectToMS();
    },
    getSocketStartArgs: function() {
      return _getMSLoginArgs();
    },
    registerModule: function(name, ob, delayed) {
      _extractAndDeleteTestProps(ob);
      if (_dom_is_ready) return TS.error('module "' + name + '" must be registered on before dom ready');
      if (_modules[name]) return TS.error('module "' + name + '" already exists');
      var namespace = _registerInNamespace(name, ob, "module");
      if (namespace === undefined) {
        if (delayed) {
          TS.error('module "' + name + '" cannot be registered after delay; "' + name.split(".").slice(0, -1).join(".") + '" is not registered');
        } else {
          _delayed_module_loads[name] = ob;
        }
        return;
      }
      ob._name = name;
      _modules[name] = ob;
    },
    registerComponent: function(name, proto) {
      if (_dom_is_ready) return TS.error('component "' + name + '" must be registered on before dom ready');
      if (_components[name]) return TS.error('component "' + name + '" already exists');
      if (typeof proto === "function") proto = proto();
      if (typeof proto.destroy !== "function") return TS.error('component "' + name + '" cannot be registered as it does not have a destroy method');
      var Component = function() {
        if (this._constructor) this._constructor.apply(this, arguments);
        if (!this.id) {
          this.id = name + "_auto_guid_" + _guid;
          _guid += 1;
        }
        if (this.test && _shouldSuppressTestExport()) {
          this.test = undefined;
        } else if (typeof this.test === "function") {
          this.test = this.test();
        }
        Component._add(this.id, this);
      };
      var namespace = _registerInNamespace(name, Component, "component");
      if (namespace === undefined) {
        _delayed_component_loads[name] = proto;
        return;
      }
      var destroy = proto.destroy;
      proto.destroy = function() {
        Component._remove(this.id);
        destroy.call(this);
      };
      Component.prototype = Object.create(proto);
      Component.instances = {};
      Component._name = name;
      _components[name] = Component;
      Component._add = function(instance_id, instance) {
        if (_components[name].instances[instance_id]) {
          TS.warn("A " + name + " component with the instance id " + instance_id + "already exists");
        }
        _components[name].instances[instance_id] = instance;
      };
      Component._remove = function(instance_id) {
        _components[name].instances[instance_id] = null;
      };
      Component.get = function(instance_id) {
        return _components[name].instances[instance_id];
      };
      Component.getAll = function() {
        return _components[name].instances;
      };
    },
    makeLogDate: function() {
      if (window.TSMakeLogDate) return TSMakeLogDate();
      return "(TSMakeLogDate not loaded) ";
    },
    shouldLog: function(pri) {
      return TS.console.shouldLog(pri);
    },
    replaceConsoleFunction: function(fn) {
      return TS.console.replaceConsoleFunction(fn);
    },
    log: function(pri) {
      TS.console.log.apply(this, [].slice.call(arguments, 0));
    },
    info: function() {
      TS.console.info.apply(this, [].slice.call(arguments, 0));
    },
    maybeWarn: function(pri) {
      TS.console.maybeWarn.apply(this, [].slice.call(arguments, 0));
    },
    warn: function() {
      TS.console.warn.apply(this, [].slice.call(arguments, 0));
    },
    dir: function(pri, ob, txt) {
      TS.console.dir.apply(this, [].slice.call(arguments, 0));
    },
    maybeError: function(pri) {
      TS.console.maybeError.apply(this, [].slice.call(arguments, 0));
    },
    error: function() {
      TS.console.error.apply(this, [].slice.call(arguments, 0));
    },
    logError: function(e, desc, subtype, silent) {
      TS.console.logError.apply(this, [].slice.call(arguments, 0));
    },
    getQsArgsForUrl: function(no_cache) {
      if (!no_cache && _qs_url_args_cache) return _qs_url_args_cache;
      _qs_url_args_cache = "";
      for (var k in TS.qs_args) {
        if (k === "export_test") continue;
        _qs_url_args_cache += "&" + k + "=" + TS.qs_args[k];
      }
      return _qs_url_args_cache;
    },
    getOtherAccountsCount: function() {
      var c = 0;
      if (!TS.boot_data.other_accounts) return c;
      c = Object.keys(TS.boot_data.other_accounts).length;
      return c;
    },
    refreshTeams: function() {
      if (!TS.boot_data) return;
      if (!TS.model) return;
      if (!TS.model.team) return;
      if (!TS.model.user) return;
      TS.api.call("auth.currentSessions").then(function(resp) {
        var data = resp.data;
        TS.boot_data.other_accounts = {};
        var c = 0;
        for (var k in data.accounts) {
          if (k == TS.model.user.id) continue;
          TS.boot_data.other_accounts[k] = data.accounts[k];
          c += 1;
        }
        if (TS.view && !c) {
          TS.view.updateTitleBarColor();
        }
      }).catch(function(err) {
        if (TS.console && TS.console.warn && TS.console.error) {
          TS.console.warn(8675309, "unable to do anything with refreshTeams rsp");
          TS.console.error(8675309, err);
        }
      });
    },
    ssbChromeClicked: function(on_button) {
      if (on_button) return;
      $("html").trigger("touchstart");
      $(".modal-backdrop").trigger("click");
    },
    reload: function(msg, reason, no_cache) {
      if (msg) {
        TS.info("TS.reload called: " + msg);
        TS.generic_dialog.start({
          title: TS.i18n.t("Reloading!", "ts")(),
          body: msg,
          show_cancel_button: false,
          esc_for_ok: true,
          onGo: function() {
            TS.reload();
          }
        });
        return;
      }
      TS.info("TS.reload() called: " + (reason || "no reason specified"));
      if (TS.console) TS.console.logStackTrace();
      window.location.reload(no_cache);
    },
    reloadIfVersionsChanged: function(data) {
      if (TS.model.ms_logged_in_once && data.min_version_ts && TS.boot_data.version_ts !== "dev") {
        if (parseInt(TS.boot_data.version_ts, 10) < parseInt(data.min_version_ts, 10)) {
          TS.reload(null, "parseInt(TS.boot_data.version_ts) < parseInt(data.min_version_ts)");
          return true;
        }
      }
      if (TS.model.ms_logged_in_once && data.cache_version) {
        if (data.cache_version != TS.storage.msgs_version) {
          TS.reload(null, "data.cache_version " + data.cache_version + " != TS.storage.msgs_version " + TS.storage.msgs_version);
          return true;
        }
      }
      if (TS.model.ms_logged_in_once && data.cache_ts_version) {
        if (data.cache_ts_version != TS.storage.cache_ts_version) {
          TS.reload(null, "data.cache_ts_version " + data.cache_ts_version + " != TS.storage.cache_ts_version " + TS.storage.cache_ts_version);
          return true;
        }
      }
      return false;
    },
    isPartiallyBooted: function() {
      return !!(TS._incremental_boot || TS._did_incremental_boot && !TS._did_full_boot);
    },
    ensureFullyBooted: function() {
      return _fully_booted_p;
    },
    test: function() {
      return {
        _registerDelayedComponentsAndModules: _registerDelayedComponentsAndModules,
        _maybeOpenTokenlessConnection: _maybeOpenTokenlessConnection,
        _shouldConnectToMS: _shouldConnectToMS,
        _getMSLoginArgs: _getMSLoginArgs,
        _deleteModule: function(name) {
          delete TS[name];
          delete _modules[name];
        },
        _deleteComponent: function(name) {
          delete TS[name];
          delete _components[name];
        }
      };
    }
  };
  var _registerInNamespace = function(namespace, ob, type) {
    var name = namespace;
    var current_namespace = TS;
    var parts = name.split(".");
    var len = parts.length - 1;
    if (len >= 3) {
      TS.error(type + ' "' + name + '" cannot be registered, as we only support a depth of two sub modules right now');
    } else if (len) {
      name = parts[len];
      var index = 0;
      for (index; index < len; index += 1) {
        if (!parts[index]) {
          TS.error(type + ' "' + namespace + '" cannot be registered because of a bad name');
        }
        current_namespace = current_namespace[parts[index]];
        if (current_namespace === undefined) {
          return current_namespace;
        }
      }
    }
    if (current_namespace[name] !== undefined) {
      TS.error(type + ' "' + namespace + '" cannot be registered; "' + name + '" already exists on "' + (current_namespace._name || "TS") + '"');
    } else {
      current_namespace[name] = ob;
    }
    return current_namespace;
  };
  if (_raw_templates) {
    TS.raw_templates = _raw_templates;
    _raw_templates = null;
  }
  var _shouldSuppressTestExport = function() {
    return !(typeof window.jasmine !== "undefined" || TS.boot_data.version_ts === "dev" && TS.qs_args.export_test);
  };
  var _reconnectRequestedMS = function() {
    TS.console.logStackTrace("MS reconnection requested");
    if (TS.model.ms_asleep) {
      TS.error("NOT reconnecting, we are asleep");
      return;
    } else if (TS.model.ms_connected) {
      TS.warn("Reconnect requested, but we are already connected; doing nothing.");
      return;
    } else if (TS.model.ms_connecting) {
      TS.warn("Reconnect requested, but we are already connecting; doing nothing.");
      return;
    }
    TS.metrics.mark("ms_reconnect_requested");
    if (!TS.api.paused_sig.has(_apiPaused)) TS.api.paused_sig.addOnce(_apiPaused);
    if (TS.boot_data.feature_ws_refactor) {
      if (!TS.interop.SocketManager.connectedSig.has(_didGetConnected)) {
        TS.interop.SocketManager.connectedSig.addOnce(_didGetConnected);
      }
    } else if (!TS.ms.connected_sig.has(_didGetConnected)) {
      TS.ms.connected_sig.addOnce(_didGetConnected);
    }
    if (TS.isPartiallyBooted()) {
      var rtm_start_p = _callRTMStart();
      _finalizeIncrementalBoot(rtm_start_p);
    } else {
      _callRTMStart().then(_processStartData);
    }
  };
  var _apiPaused = function() {
    TS.info("API queue got paused while waiting for MS reconnection");
    if (TS.boot_data.feature_ws_refactor) {
      TS.interop.SocketManager.remove(_didGetConnected);
    } else {
      TS.ms.connected_sig.remove(_didGetConnected);
    }
    TS.api.unpaused_sig.addOnce(function() {
      if (TS.model.calling_rtm_start) {
        TS.info("API queue got unpaused, but rtm.start calling is pending, so doing nothing");
        return;
      }
      _reconnectRequestedMS();
    });
  };
  var _didGetConnected = function() {
    var reconnect_duration_ms = TS.metrics.measureAndClear("ms_reconnect_delay", "ms_reconnect_requested");
    TS.info("OK, MS is now reconnected -- it took " + _.round(reconnect_duration_ms / 1e3, 2) + " seconds");
    TS.api.paused_sig.remove(_apiPaused);
    TS.api.unpaused_sig.remove(_reconnectRequestedMS);
  };
  var _getMSLoginArgs = function() {
    var login_args = {
      agent: "webapp_" + TS.boot_data.version_uid,
      simple_latest: true,
      no_unreads: true
    };
    if (TS.pri && (!login_args.cache_ts || parseInt(login_args.cache_ts, 10) == 0 || isNaN(login_args.cache_ts))) {
      if (TS.has_pri[_pri_login]) TS.log(_pri_login, "_getMSLoginArgs(): login_args.cache_ts is 0/undefined?", login_args);
    }
    if (TS.lazyLoadMembersAndBots()) {
      login_args.no_users = true;
      login_args.no_bots = true;
      login_args.cache_ts = 0;
      if (TS.membership && TS.membership.lazyLoadChannelMembership()) {
        login_args.no_members = 1;
      }
    } else if (TS.boot_data.page_needs_just_me) {
      TS.storage.disableMemberBotCache();
      login_args.just_me = true;
      login_args.no_members = true;
    } else {
      login_args.cache_ts = _last_rtm_start_event_ts || TS.storage.fetchLastCacheTS();
    }
    if (TS.web) {
      if (TS.boot_data.page_needs_state || TS.boot_data.page_has_ms || TS.lazyLoadMembersAndBots()) {
        login_args.no_presence = true;
      } else {
        login_args.no_state = true;
      }
    }
    if (TS.calls) {
      login_args.no_bots = true;
      login_args.no_subteams = true;
    }
    login_args.presence_sub = true;
    login_args.mpim_aware = true;
    if (!TS.boot_data.page_needs_all_ims) {
      login_args.only_relevant_ims = true;
    }
    if (TS.boot_data.feature_name_tagging_client) {
      login_args.name_tagging = true;
    }
    login_args.canonical_avatars = true;
    login_args.eac_cache_ts = true;
    if (TS.boot_data.feature_ms_latest) login_args.ms_latest = true;
    if (TS.lazyLoadMembersAndBots()) {
      for (var k in TS.qs_args) {
        if (k.indexOf("feature_" === 0)) {
          if (TS.has_pri[_pri_flannel]) TS.log(_pri_flannel, "Flannel: Appending " + k + " (" + TS.qs_args[k] + ") to login_args");
          login_args[k] = TS.qs_args[k];
        }
      }
    }
    if (TS.lazyLoadMembersAndBots() && TS.has_pri[_pri_flannel]) TS.log(_pri_flannel, "Flannel: MS login args:", login_args);
    return login_args;
  };
  var _callRTMStart = function() {
    var should_attempt_incremental_boot = TS.incremental_boot && TS.incremental_boot.shouldIncrementalBoot();
    var rtm_start_p = _promiseToCallRTMStart();
    if (!should_attempt_incremental_boot) {
      TS.info("Starting non-incremental boot");
      return _performNonIncrementalBoot(rtm_start_p);
    }
    _pending_rtm_start_p = rtm_start_p;
    TS.info("Starting incremental boot");
    return TS.incremental_boot.startIncrementalBoot().catch(function() {
      TS.info("Recovering from incremental boot error");
      _pending_rtm_start_p = undefined;
      return _performNonIncrementalBoot(rtm_start_p);
    });
  };
  var _performNonIncrementalBoot = function(rtm_start_p) {
    return rtm_start_p.catch(function(err) {
      _rtmStartErrorHandler(err);
      throw err;
    });
  };
  var _promiseToCallRTMStart = function() {
    if (TS.qs_args.no_rtm_start) {
      return new Promise(function(resolve, reject) {
        TS.resumeRTMStart = function() {
          delete TS.resumeRTMStart;
          delete TS.qs_args.no_rtm_start;
          _promiseToCallRTMStart().then(function(resp) {
            resolve(resp);
          }).catch(reject);
        };
      });
    }
    if (_rtm_start_retry_delay_ms) {
      TS.info("Want to call rtm.start, but will wait " + _rtm_start_retry_delay_ms + " ms first");
      return new Promise(function(resolve) {
        setTimeout(function() {
          TS.info("OK, now calling rtm.start, having waited for delay");
          _rtm_start_retry_delay_ms = undefined;
          resolve(_promiseToCallRTMStart());
        }, _rtm_start_retry_delay_ms);
      });
    }
    if (TS.boot_data.rtm_start_response) {
      var rtm_start_response = TS.boot_data.rtm_start_response;
      delete TS.boot_data.rtm_start_response;
      return Promise.resolve(rtm_start_response);
    }
    if (TS.model.calling_rtm_start) {
      var error_msg = "_promiseToCallRTMStart was called but TS.model.calling_rtm_start=true";
      TS.error(error_msg);
      return Promise.reject(new Error(error_msg));
    }
    if (!TS.boot_data.feature_ws_refactor) TS.ms.logConnectionFlow("login");
    TS.model.rtm_start_throttler += 1;
    TS.info("Setting calling_rtm_start to true");
    TS.model.calling_rtm_start = true;
    if (TS.useSocket() && TS.lazyLoadMembersAndBots() && TS.boot_data.should_use_flannel) {
      if (!_ms_rtm_start_p) {
        if (TS.model.ms_connected) {
          if (TS.has_pri[_pri_flannel]) TS.log(_pri_flannel, "Bad news: we're trying to do an rtm.start from Flannel while we're already connected, and that won't work.");
          return Promise.reject(new Error("rtm.start-over-WebSocket failed"));
        }
        _ms_rtm_start_p = TS.flannel.connectAndFetchRtmStart();
      }
      var rtm_start_p = _ms_rtm_start_p;
      _ms_rtm_start_p = undefined;
      return rtm_start_p.then(function(rtm_start_data) {
        if (TS.has_pri[_pri_flannel]) TS.log(_pri_flannel, "Flannel: got rtm.start response 💕");
        return {
          ok: true,
          args: {},
          data: rtm_start_data
        };
      }).finally(function() {
        TS.model.calling_rtm_start = false;
        TS.info("Setting calling_rtm_start to false (after rtm.start from Flannel)");
      });
    }
    return TS.api.callImmediately("rtm.start", _getMSLoginArgs()).finally(function() {
      TS.model.calling_rtm_start = false;
      TS.info("Setting calling_rtm_start to false (after rtm.start from API)");
    });
  };
  var _rtmStartErrorHandler = function(resp) {
    var error = resp.data && resp.data.error;
    if (error === "user_removed_from_team") {
      TS.warn("You have been removed from the " + TS.model.team.name + " team.");
      if (TS.client) TS.client.userRemovedFromTeam(TS.model.team.id);
    }
    if (error === "account_inactive" || error === "team_disabled" || error === "invalid_auth") {
      TSSSB.call("invalidateAuth");
      TS.reload(null, "resp.data.error: " + error);
      return;
    }
    if (error === "clear_cache" || error === "org_login_required" || error === "team_added_to_org") {
      var also_clear_cache = true;
      TS.storage.flush(also_clear_cache);
      TS.reload(null, "TS.storage.flush() and TS.reload() because resp.data.error: " + error);
      return;
    }
    if (!TS.boot_data.feature_ws_refactor) TS.ms.logConnectionFlow("on_login_failure");
    if (!TS.boot_data.feature_ws_refactor) TS.ms.onFailure("rtm.start call failed with error: " + (error || "no error on resp.data"));
    var RTM_START_ERROR_MIN_DELAY = 5;
    var RTM_START_ERROR_MAX_DELAY = 60;
    var retry_after_secs = parseInt(_.get(resp, "data.retry_after"), 10);
    TS.info("rtm.start failed; retry_after = " + retry_after_secs);
    _rtm_start_retry_delay_ms = 1e3 * _.clamp(retry_after_secs, RTM_START_ERROR_MIN_DELAY, RTM_START_ERROR_MAX_DELAY);
    return null;
  };
  var _processStartData = function(resp) {
    if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Got rtm.start login data");
    TS.model.emoji_cache_ts = resp.data.emoji_cache_ts;
    TS.model.apps_cache_ts = resp.data.apps_cache_ts;
    TS.model.commands_cache_ts = resp.data.commands_cache_ts;
    if (resp.data.latest_event_ts && !TS.lazyLoadMembersAndBots()) {
      TS.info("rtm.start included latest event timestamp: " + resp.data.latest_event_ts);
      _last_rtm_start_event_ts = parseInt(resp.data.latest_event_ts, 10);
    }
    if (!TS.model.ms_logged_in_once && !TS.storage.fetchLastEventTS() && resp.data.latest_event_ts) {
      var callback = function() {
        TS.ms.storeLastEventTS(resp.data.latest_event_ts, "_processStartData");
      };
      if (TS.boot_data.feature_ws_refactor) {
        TS.interop.SocketManager.connectedSig.addOnce(callback);
      } else {
        TS.ms.connected_sig.addOnce(callback);
      }
    }
    if (TS.client) {
      if (TS.reloadIfVersionsChanged(resp.data)) return;
    }
    if (!resp.data.self) {
      TS.error("No self?");
      return;
    }
    if (!resp.data.team) {
      TS.error("No team?");
      return;
    }
    if (!TS.boot_data.feature_ws_refactor) TS.ms.logConnectionFlow("on_login");
    if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Setting up model");
    return _setUpModel(resp.data, resp.args).then(function() {
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Model did set up; setting up apps");
      TS.apps.setUp();
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Setting up commands");
      TS.cmd_handlers.setUpCmds();
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Setting up UI");
      _setUpUserInterface();
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Finding initial channel");
      _ensureInitialChannelIsKnown();
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Setting up emoji and shared channels");
      return Promise.join(TS.emoji.setUpEmoji().catch(function() {
        if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Setting up emoji failed, trying to move forward anyway...");
      }), _maybeFetchAccessibleUserIds());
    }).then(function() {
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Nearly there! Finalizing...");
      if (!TS.model.ms_logged_in_once) _finalizeFirstBoot(resp.data);
      if (TS.client) TS.client.onEveryLoginMS(resp.data);
      if (TS.web) TS.web.onEveryLoginMS(resp.data);
      _maybeFinalizeOrOpenConnectionToMS();
      var is_finalizing_first_full_boot;
      if (TS._did_incremental_boot) {
        is_finalizing_first_full_boot = TS.model.ms_logged_in_once;
      } else {
        is_finalizing_first_full_boot = !TS.model.ms_logged_in_once;
      }
      if (is_finalizing_first_full_boot && _fully_booted_p_resolve) {
        if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Divine clementine, we are finalizing a full boot!");
        _fully_booted_p_resolve();
        _fully_booted_p_resolve = null;
        TSSSB.call("didFinishLoading");
        _did_call_did_finish_loading = true;
      }
      TS.model.ms_logged_in_once = true;
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Holy guacamole, we're all done!");
      TS.info("User id: " + _.get(TS.boot_data, "user_id") + ", team id: " + _.get(TS.model, "team.id"));
    }).catch(function(err) {
      TS.error("_setUpModel failed with err: " + (err ? err.message : "no err provided"));
      TS.dir(err);
      TS.info(err.stack);
      TS._last_boot_error = err;
    });
  };
  var _maybeFetchAccessibleUserIds = function() {
    if (TS.isPartiallyBooted() && !TS._did_full_boot) {
      return;
    }
    if (!TS.model.user.is_restricted) return Promise.resolve();
    if (!TS.membership.lazyLoadChannelMembership()) return Promise.resolve();
    return TS.flannel.fetchAccessibleUserIdsForGuests().then(function(accessible_user_ids) {
      TS.model.guest_accessible_user_ids = accessible_user_ids;
      if (TS.members) TS.members.members_for_user_changed_sig.dispatch();
    });
  };
  var _setUpUserInterface = function() {
    TS.ui.setThemeClasses();
    if (TS.client) {
      TSSSB.call("setCurrentTeam", TS.model.team.domain);
      TS.client.updateTeamIcon();
    }
  };
  var _ensureInitialChannelIsKnown = function() {
    if (!TS.client) return;
    if (TS.model.initial_cid) {
      if (TS.boot_data.feature_archive_deeplink) TS.client.calculateInitialMessage();
      return;
    }
    TS.client.calculateInitialCid();
    if (TS.boot_data.feature_archive_deeplink) TS.client.calculateInitialMessage();
    if (!TS.model.initial_cid) {
      var error_msg = "TS.client.calculateInitialCid() failed to find a channel";
      TS.error(error_msg);
      throw new Error(error_msg);
    }
  };
  var _finalizeFirstBoot = function(rtm_start_data) {
    if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _finalizeFirstBoot");
    if (TS.model.ms_logged_in_once) {
      TS.warn("_finalizeFirstBoot called, but we have already done this before. This is a progamming error.");
      return;
    }
    if (TS.client) {
      TS.client.onFirstLoginMS(rtm_start_data);
      if (TS.isPartiallyBooted()) {
        _finalizeIncrementalBoot(_pending_rtm_start_p);
        _pending_rtm_start_p = undefined;
      } else {
        TS.incremental_boot.afterFullBoot();
      }
    }
    if (TS.web) {
      TS.web.onFirstLoginMS(rtm_start_data);
    }
  };
  var _finalizeIncrementalBoot = function(rtm_start_p) {
    TS.info("Finalizing incremental boot");
    TS.incremental_boot.beforeFullBoot();
    var users_from_incr_boot = TS.lazyLoadMembersAndBots() ? _.map(TS.model.members, "id") : null;
    _performNonIncrementalBoot(rtm_start_p).then(function(resp) {
      _processStartData(resp);
      if (TS.lazyLoadMembersAndBots()) {
        var users_from_rtm_start = _.map(resp.data.users, "id");
        var users_to_refetch = _.difference(users_from_incr_boot, users_from_rtm_start);
        _refetchMembers(users_to_refetch);
      }
      TS.incremental_boot.afterFullBoot();
      TS.info("Completed incremental boot");
    }).catch(function(err) {
      TS.error("Tried to finalize incremental boot, but rtm.start failed. Will recover when we reconnect.");
      throw err;
    });
  };
  var _refetchMembers = function(users_to_refetch) {
    if (!TS.lazyLoadMembersAndBots()) return;
    if (!users_to_refetch.length) {
      if (TS.has_pri[_pri_flannel]) TS.log(_pri_flannel, "No need to re-fetch any members for presence status");
      return;
    }
    if (TS.has_pri[_pri_flannel]) TS.log(_pri_flannel, "Re-fetching " + users_to_refetch.length + " members so we have presence status");
    TS.flannel.fetchAndUpsertObjectsByIds(users_to_refetch);
  };
  var _maybeFinalizeOrOpenConnectionToMS = function() {
    if (TS.isPartiallyBooted()) {
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS not connecting to MS until we complete incremental boot");
      return;
    }
    if (!_shouldConnectToMS()) {
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS will not connect to MS");
      return;
    }
    if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS wants to connect to MS");
    if (TS.boot_data.feature_ws_refactor) {} else if (TS.ms.hasProvisionalConnection() && TS.ms.finalizeProvisionalConnection()) {
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS finalized MS connection");
      if (TS.has_pri[_pri_ms]) TS.log(_pri_ms, "Successfully finalized a provisional MS connection");
    } else {
      if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS made a new MS connection");
      if (TS.has_pri[_pri_ms]) TS.log(_pri_ms, "No valid provisional MS connection; making a new connection");
      TS.ms.connectImmediately(TS.model.team.url || TS.boot_data.ms_connect_url);
    }
    if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: _maybeFinalizeOrOpenConnectionToMS did connect to MS");
  };
  var _socketDisconnectedMS = function() {
    TS.shared.getAllModelObsForUser().forEach(function(model_ob) {
      if (model_ob._consistency_has_been_checked) model_ob._consistency_has_been_checked = false;
      if (model_ob._consistency_is_being_checked) model_ob._consistency_is_being_checked = false;
    });
  };
  var _rtm_start_retry_delay_ms;
  var _last_rtm_start_event_ts;
  var _ms_rtm_start_p;
  var _pending_rtm_start_p;
  TS.qs_args = function() {
    var qs = location.search.substring(1);
    var args = {};
    var pairs;
    pairs = qs.split("&");
    for (var i = 0; i < pairs.length; i += 1) {
      var p = pairs[i].indexOf("=");
      if (p != -1) {
        var name = pairs[i].substring(0, p);
        var value = pairs[i].substring(p + 1);
        args[name] = unescape(value);
      } else if (pairs[i].length) {
        args[pairs[i]] = "";
      }
    }
    return args;
  }();
  TS.pri = TS.qs_args.pri ? TS.qs_args.pri + ",0" : TS.pri;
  _.each(TS.pri && TS.pri.split(","), function(pri) {
    if (pri) TS.has_pri[pri] = true;
  });
  var _dom_is_ready = false;
  var _qs_url_args_cache;
  var _initialDataFetchesComplete = function(rtm_start_resp) {
    if (TS.client) {
      TSSSB.call("didStartLoading", 6e4);
    }
    if (_shouldConnectToMS()) {
      if (TS.boot_data.feature_ws_refactor) {} else {
        TS.ms.reconnect_requested_sig.add(_reconnectRequestedMS);
        TS.ms.disconnected_sig.add(_socketDisconnectedMS);
      }
    }
    _callOnStarts();
    _dom_is_ready = true;
    if (TS.model.is_our_app) {
      _initSleepWake();
    }
    TS.ui.setUpWindowUnloadHandlers();
    if (TS.boot_data.app === "client") {
      TS.client.gogogo();
    } else if (TS.boot_data.app === "web" || TS.boot_data.app === "space" || TS.boot_data.app === "calls") {
      TS.web.gogogo();
    }
    if (TS.boot_data.no_login) {
      TS.info("running without a user");
      if (TS.web) TS.web.no_login_complete_sig.dispatch();
    } else if (rtm_start_resp) {
      _processStartData(rtm_start_resp);
    } else {
      TS.error("_initialDataFetchesComplete expected to receive rtm.start data; we cannot continue.");
    }
  };
  var _logSessionLoadCount = function() {
    if (!window.sessionStorage) return;
    try {
      var name = TS.client ? "session_load_count_client" : "session_load_count_web";
      var cnt = parseInt(sessionStorage.getItem(name) || 0, 10) + 1;
      sessionStorage.setItem(name, cnt);
      TS.info(name + ": " + cnt);
      TS.metrics.store(name, cnt, {
        is_count: true
      });
    } catch (err) {
      TS.warn("could not log session load count: " + err);
    }
  };
  var _configureBluebirdBeforeFirstUse = function(boot_data) {
    Promise.config({
      longStackTraces: boot_data.version_ts === "dev" || TS.qs_args.js_path,
      warnings: {
        wForgottenReturn: false
      },
      cancellation: true
    });
  };
  var _modules = {};
  var _delayed_module_loads = {};
  var _components = {};
  var _delayed_component_loads = {};
  var _onDOMReady = function() {
    TS.info("_onDOMReady");
    setTimeout(function() {
      if (!TS.model.is_our_app) return;
      if (TS.environment.isSSBAndAtLeastVersion("2.6")) return;
      if (!_did_call_did_finish_loading) {
        TSSSB.call("didFinishLoading");
        _did_call_did_finish_loading = true;
        TS.metrics.count("fake_call_did_finish_loading_for_older_SSBs");
      }
    }, FORCE_CALL_DID_FINISH_LOADING_DELAY_MS);
    _logSessionLoadCount();
    _maybeOpenTokenlessConnection();
    if ((TS.model.is_chrome_desktop || TS.model.is_FF || TS.model.is_safari_desktop) && TS.storage.do_compression) {
      TS.model.supports_user_bot_caching = true;
    } else if (TS.model.win_ssb_version || TS.model.lin_ssb_version) {
      TS.model.supports_user_bot_caching = true;
    } else if (TS.model.mac_ssb_version) {
      if (TS.model.mac_ssb_version == 1.1 && TS.model.mac_ssb_version_minor >= 4) {
        TS.model.supports_user_bot_caching = true;
      } else if (TS.model.mac_ssb_version >= 2 && (TS.model.mac_ssb_version_minor > 0 || TS.model.mac_ssb_build >= 7398)) {
        TS.model.supports_user_bot_caching = true;
      } else if (TS.model.is_electron) {
        TS.model.supports_user_bot_caching = true;
      }
    }
    if (TS.model.supports_user_bot_caching && TS.boot_data.feature_name_tagging_client) {
      TS.storage.disableMemberBotCache();
    }
    if (TS.model.supports_user_bot_caching && TS.boot_data.feature_omit_localstorage_users_bots) {
      TS.warn("Calling TS.storage.disableMemberBotCache() because feature_omit_localstorage_users_bots");
      TS.storage.disableMemberBotCache();
    }
    if (window.macgap && macgap.downloads || window.winssb && winssb.downloads) {
      TS.model.supports_downloads = true;
      TS.model.flex_names.push("downloads");
    }
    if (TS.client && window.WEB_SOCKET_USING_FLASH_BUT_NO_FLASH) {
      TS.info("WEB_SOCKET_USING_FLASH_BUT_NO_FLASH");
      $("#loading_animation").addClass("hidden");
      $("#no_ws_and_bad_flash").css("display", "inline");
      return;
    }
    if (TS.client) {
      TSSSB.call("didStartLoading", 3e4);
    } else {
      TS.info("no TS.client on page:" + document.location.href);
    }
    TS.api.paused_sig.add(function(info) {
      if (TS.boot_data.feature_tinyspeck) {
        TS.api.debugShowQueue();
      }
      if (TS.client) {
        TS.client.apiPaused(info);
      } else {
        TS.web.apiPaused(info);
      }
    });
    TS.api.unpaused_sig.add(function() {
      if (TS.client) {
        TS.client.apiUnpaused();
      } else {
        TS.web.apiUnpaused();
      }
    });
    soundManager.ignoreFlash = true;
    soundManager.setup({
      url: "/img/sm/",
      debugMode: false
    });
    TS.storage.onStart();
    _registerDelayedComponentsAndModules();
    var initial_rtm_start_p = TS.boot_data.no_login ? Promise.resolve() : _callRTMStart();
    var promises = [_promiseToLoadTemplates(), initial_rtm_start_p];
    if (TS.boot_data.page_needs_enterprise && !TS.boot_data.no_login) {
      promises.push(TS.enterprise.promiseToEnsureEnterprise());
    }
    if (TS.web && TS.boot_data.page_needs_team_profile_fields) {
      promises.push(TS.team.ensureTeamProfileFields());
    }
    Promise.all(promises).then(function() {
      initial_rtm_start_p.then(_initialDataFetchesComplete);
      return null;
    });
  };
  var _promiseToLoadTemplates = function() {
    if (window.TS && TS.raw_templates && Object.keys(TS.raw_templates).length > 0) {
      return Promise.resolve();
    }
    var templates_cb;
    if (TS.boot_data.hbs_templates_version && TS.boot_data.version_ts !== "dev") {
      templates_cb = TS.boot_data.hbs_templates_version;
    } else if (TS.boot_data.version_ts === "dev") {
      templates_cb = Date.now();
    } else {
      templates_cb = TS.boot_data.version_ts;
    }
    var templates_url = "/templates.php?cb=" + templates_cb + TS.getQsArgsForUrl();
    if (TS.boot_data.template_groups) templates_url += "&template_groups=" + TS.boot_data.template_groups;
    if (TS.boot_data.template_exclude_feature_flagged) templates_url += "&template_exclude_feature_flagged=1";
    if (/&locale=[a-zA-Z-]/.test(templates_url)) {
      templates_url = templates_url.replace(/\?locale=[a-zA-Z-]*&/, "?").replace(/[?|&]locale=[a-zA-Z-]*/, "");
      templates_url = templates_url.replace(/&locale=[a-zA-Z-]/, "");
    }
    if (TS.i18n.locale() && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
      templates_url += "&locale=" + TS.i18n.locale();
    }
    var attempts = 0;

    function loadTemplates() {
      attempts += 1;
      return new Promise(function(resolve) {
        if (window.TS && TS.raw_templates && Object.keys(TS.raw_templates).length > 0) {
          resolve();
          return;
        }
        TS.utility.getCachedScript(templates_url).done(function() {
          if (Object.keys(TS.raw_templates).length == 0) {
            TS.error(templates_url + " returned no templates D:");
            return;
          }
          resolve();
        }).fail(function(jqXHR, textStatus, errorThrown) {
          var delay_ms = Math.min(1e3 * attempts, 1e4);
          TS.warn("loading " + templates_url + " failed (textStatus:" + textStatus + " errorThrown:" + errorThrown + " attempts:" + attempts + "), trying again in " + delay_ms + "ms");
          setTimeout(loadTemplates, delay_ms);
        });
      });
    }
    return loadTemplates();
  };
  var _registerDelayedComponentsAndModules = function() {
    _.sortBy(Object.keys(_delayed_module_loads), "length").forEach(function(name) {
      TS.registerModule(name, _delayed_module_loads[name], true);
    });
    _.sortBy(Object.keys(_delayed_component_loads), "length").forEach(function(name) {
      TS.registerComponent(name, _delayed_component_loads[name], true);
    });
  };
  var _callOnStarts = function() {
    TS.log(Date.now() - TS.boot_data.start_ms + "ms from first html to calling onStarts()");
    if (TS.boot_data.app === "client") {
      TS.client.onStart();
      TS.client.onStart = _.noop;
    } else if (TS.boot_data.app === "web" || TS.boot_data.app === "space" || TS.boot_data.app === "calls") {
      TS.web.onStart();
      TS.web.onStart = _.noop;
    } else if (TS.boot_data.app === "test") {
      return;
    } else if (TS.boot_data.app === "api" || TS.boot_data.app === "oauth") {} else {
      TS.error("WTF app? " + TS.boot_data.app);
      return;
    }
    var name;
    var delete_after_calling = !TS.qs_args.keep_onstart;
    try {
      _.forOwn(_modules, function(module) {
        if (!module.onStart) return;
        name = module._name;
        module.onStart();
        if (delete_after_calling) module.onStart = _.noop;
      });
    } catch (e) {
      TS.error("TS." + name + ".onStart encountered an error:");
      TS.logError(e);
      if (window.TSBeacon) window.TSBeacon("call_onstarts_error", 1);
      throw e;
    }
    if (delete_after_calling) {
      _callOnStarts = _.noop;
    }
  };
  var _setUpModel = function(data, args) {
    if (TS.lazyLoadMembersAndBots()) {
      data.bots = data.bots || [];
    }
    return new Promise(function(resolve, reject) {
      var first_time = !TS.model.ms_logged_in_once;
      TS.team.upsertTeam(data.team);
      TS.model.team.url = data.url;
      if (TS.boot_data.page_needs_enterprise && data.can_manage_shared_channels !== undefined) {
        TS.model.team.prefs.can_user_manage_shared_channels = data.can_manage_shared_channels;
      }
      if (!TS.model.last_team_name) {
        TS.model.last_team_name = TS.model.team.name;
        TS.model.last_team_domain = TS.model.team.domain;
      }
      TS.model.team.activity = [];
      if (TS.model.break_token) TS.model.team.url += "f";
      if (first_time) {
        TS.model.bots = [];
        TS.model.members = [];
        TS.model.rooms = [];
        if (!TS.useRedux()) {
          TS.model.channels = [];
          TS.model.groups = [];
          TS.model.mpims = [];
          TS.model.ims = [];
        }
        TS.model.teams = [];
        TS.model.user_groups = [];
        TS.model.read_only_channels = [];
        if (TS.boot_data.feature_default_shared_channels) TS.model.threadable_channels = [];
        TS.model.online_users = [];
      } else {
        var is_first_full_boot = TS._did_incremental_boot && !TS._did_full_boot;
        if (!is_first_full_boot) {
          TS.refreshTeams();
        }
      }
      if (data.online_users && _.isArray(data.online_users)) {
        TS.model.online_users = _.filter(data.online_users, function(user_id) {
          return user_id !== "USLACKBOT";
        });
        if (TS.boot_data.page_needs_enterprise) {
          var dispatched = 0;
          var start = Date.now();
          TS.model.online_users = _.filter(TS.model.online_users, function(id) {
            var member = TS.members.getMemberById(id);
            if (member) {
              if (member.presence !== "active") {
                member.presence = "active";
                if (!first_time) {
                  dispatched += 1;
                  TS.members.presence_changed_sig.dispatch(member);
                }
              }
              return false;
            }
            return true;
          });
          if (dispatched) {
            var ms = Date.now() - start;
            if (ms > 500) TS.warn("_setUpModel: took " + ms + " msec to dispatch " + dispatched + " presence_changed signals.");
          }
        }
      }
      TS.prefs.setPrefs(data.self.prefs);
      delete data.self.prefs;
      var i;
      var upsert;
      var bot;
      var member;
      var setModelUser = function(m) {
        TS.model.user = m;
        TS.model.user.is_self = true;
      };
      var log_data = ["TS.model.supports_user_bot_caching:" + TS.model.supports_user_bot_caching, "TS.storage.isUsingMemberBotCache():" + TS.storage.isUsingMemberBotCache(), "args.cache_ts:" + args.cache_ts];
      var args_for_log = _.clone(args);
      if (args_for_log.token) args_for_log.token = "REDACTED";
      try {
        log_data.push("api args: " + JSON.stringify(args_for_log));
      } catch (err) {
        log_data.push("api args: " + args_for_log);
      }
      TS.members.startBatchUpsert();
      TS.bots.startBatchUpsert();
      var data_user_list = data.updated_users || data.users || [];
      var data_bot_list = data.updated_bots || data.bots || [];
      var users_cache = TS.storage.fetchMembers();
      var data_user_list_by_id = {};
      if (TS._did_incremental_boot && !TS._incremental_boot && !TS._did_full_boot) {} else {
        for (i = 0; i < data_user_list.length; i += 1) {
          data_user_list_by_id[data_user_list[i].id] = true;
        }
      }
      var should_check_if_local = TS.boot_data.page_needs_enterprise && TS.boot_data.exclude_org_members;
      for (i = 0; i < users_cache.length; i += 1) {
        member = users_cache[i];
        if (should_check_if_local && !TS.members.isLocalTeamMember(member)) continue;
        if (data_user_list_by_id[member.id]) continue;
        if (data.online_users) member.presence = _.includes(data.online_users, member.id) ? "active" : "away";
        if (_.get(member, "profile.always_active")) member.presence = "active";
        upsert = TS.members.upsertAndSignal(member);
        if (TS.has_pri[_pri_upsert]) TS.log(_pri_upsert, "upsert from CACHE: " + member.id + " " + upsert.status);
        if (upsert.member.id == data.self.id) setModelUser(upsert.member);
      }
      for (i = 0; i < data_user_list.length; i += 1) {
        member = data_user_list[i];
        if (should_check_if_local && !TS.members.isLocalTeamMember(member)) continue;
        if (TS.lazyLoadMembersAndBots()) {
          member.presence = _.has(member, "presence") && member.presence === "active" ? "active" : "away";
        } else if (data.online_users) {
          member.presence = _.includes(data.online_users, member.id) ? "active" : "away";
        }
        if (_.get(member, "profile.always_active")) member.presence = "active";
        upsert = TS.members.upsertAndSignal(member);
        if (TS.has_pri[_pri_upsert]) TS.log(_pri_upsert, "upsert from DATA: " + member.id + " " + upsert.status);
        if (upsert.member.id == data.self.id) setModelUser(upsert.member);
      }
      var bots_cache = TS.storage.fetchBots();
      var data_bot_list_by_id = {};
      for (i = 0; i < data_bot_list.length; i += 1) {
        data_bot_list_by_id[data_bot_list[i].id] = true;
      }
      for (i = 0; i < bots_cache.length; i += 1) {
        bot = bots_cache[i];
        if (!data_bot_list_by_id[bot.id]) {
          upsert = TS.bots.upsertAndSignal(bot);
        }
      }
      for (i = 0; i < data_bot_list.length; i += 1) {
        TS.bots.upsertAndSignal(data_bot_list[i]);
      }
      log_data.push("members from LS:" + users_cache.length + ", from updated_users in rtm.start:" + data_user_list.length + " (slackbot will always be here)");
      log_data.push("bots from LS:" + bots_cache.length + ", from updated_bots in rtm.start:" + data_bot_list.length);
      if (data_user_list.length < TS.model.members.length / 20) {
        TS.model.did_we_load_with_user_cache = true;
      }
      data_bot_list_by_id = null;
      data_user_list_by_id = null;
      TS.info(log_data.join("\n"));
      if (TS.has_pri[_pri_upsert]) {
        TS.dir(_pri_upsert, users_cache, "users_cache");
        TS.dir(_pri_upsert, bots_cache, "bots_cache");
      }
      var doAllMembersFromChannelsInRawDataExist = function(with_shared) {
        if (TS._incremental_boot) return true;
        if (TS.lazyLoadMembersAndBots()) return true;
        if (TS.calls) return true;
        if (TS.boot_data.page_needs_enterprise && TS.boot_data.exclude_org_members) return true;
        var ids = {};
        var addMembersToHash = function(model_ob) {
          if (model_ob.is_group && model_ob.is_shared && !with_shared) return;
          if (!model_ob.members || !model_ob.members.forEach) return;
          model_ob.members.forEach(function(id) {
            ids[id] = true;
          });
        };
        data.channels.forEach(addMembersToHash);
        data.groups.forEach(addMembersToHash);
        if (data.mpims) {
          data.mpims.filter(function(mpim) {
            return !mpim.is_shared || with_shared;
          }).forEach(addMembersToHash);
        }
        data.ims.forEach(function(im) {
          if (im.is_shared && !with_shared) return;
          if (!im.user) return;
          ids[im.user] = true;
        });
        var unknown_user_ids = [];
        for (var id in ids) {
          if (!TS.members.getMemberById(id)) unknown_user_ids.push(id);
        }
        if (unknown_user_ids.length) {
          log_data.push("doAllMembersFromChannelsInRawDataExist() found (" + unknown_user_ids.length + ") unknown members: " + unknown_user_ids.join(", "));
          if (TS.boot_data.page_needs_enterprise) return true;
          return false;
        }
        log_data.push("doAllMembersFromChannelsInRawDataExist() confirmed all members");
        return true;
      };
      if (!TS.model.user) {
        _onBadUserCache("no TS.model.user", log_data.join("\n"));
        reject(Error("called _onBadUserCache"));
        return;
      }
      if (!doAllMembersFromChannelsInRawDataExist()) {
        if (parseInt(args.cache_ts, 10)) {
          _onBadUserCache("!doAllMembersFromChannelsInRawDataExist()", log_data.join("\n"));
          reject(Error("called _onBadUserCache"));
          return;
        }
        TS.logError({
          message: log_data.join("\n")
        }, "doAllMembersFromChannelsInRawDataExist() failed");
      }
      TS.members.upsertMember(data.self);
      TS.members.finishBatchUpsert();
      TS.bots.finishBatchUpsert();
      var is_initial_partial_boot = TS.isPartiallyBooted() && !is_first_full_boot;
      if (TS.storage.isUsingMemberBotCache() && !is_initial_partial_boot) {
        var cache_ts = data.cache_ts;
        TS.storage.rememberLastCacheTS(cache_ts);
        TS.members.maybeStoreMembers(true);
        TS.bots.maybeStoreBots(true);
      }
      TS.model.makeYouRegex();
      TS.prefs.setHighlightWords(TS.model.prefs.highlight_words);
      if (data.subteams) {
        TS.user_groups.startBatchUpsert();
        data.subteams.all.forEach(function(user_group) {
          TS.user_groups.upsertUserGroup(user_group);
        });
        TS.user_groups.finishBatchUpsert();
        data.subteams.self.forEach(function(user_group) {
          TS.user_groups.upsertSelfUserGroup(user_group);
        });
      }
      var open_cnt = 0;
      data.channels.forEach(function(channel) {
        if (channel.is_member) open_cnt += 1;
      });
      data.ims.forEach(function(im) {
        if (im.is_open) open_cnt += 1;
      });
      data.groups.forEach(function(group) {
        if (!group.is_archived) open_cnt += 1;
      });
      if (data.mpims) {
        data.mpims.forEach(function(mpim) {
          if (mpim.is_open && !mpim.is_archived) open_cnt += 1;
        });
      }
      if (data.read_only_channels) {
        TS.model.read_only_channels = data.read_only_channels;
      }
      if (TS.boot_data.feature_default_shared_channels && data.threadable_channels) {
        TS.model.threadable_channels = data.threadable_channels;
      }
      TS.model.initial_msgs_cnt = 42;
      if (TS.qs_args.api_count) {
        var api_count_override = parseInt(TS.qs_args.api_count, 10) || TS.model.initial_msgs_cnt;
        TS.model.initial_msgs_cnt = Math.min(TS.model.initial_msgs_cnt, api_count_override);
      }
      var max = TS.model.hard_msg_limit;
      TS.model.subsequent_msgs_cnt = Math.min(max, TS.model.initial_msgs_cnt * 2);
      TS.model.special_initial_msgs_cnt = Math.min(max, TS.model.initial_msgs_cnt * 2);
      TS.info("open channels/groups/ims:" + open_cnt + " initial_msgs_cnt:" + TS.model.initial_msgs_cnt + " subsequent_msgs_cnt:" + TS.model.subsequent_msgs_cnt + " special_initial_msgs_cnt:" + TS.model.special_initial_msgs_cnt);
      var completeModelObSetup = function() {
        var just_general = TS.qs_args.just_general == 1;
        TS.utility.msgs.startBatchUnreadCalc();
        TS.metrics.mark("upsert_channels_start");
        var is_bulk_upsert = false;
        if (TS.useRedux()) {
          is_bulk_upsert = true;
        }
        var channels_to_upsert = _.map(data.channels, function(channel) {
          if (just_general && !channel.is_general) return;
          return TS.channels.upsertChannel(channel, is_bulk_upsert);
        });
        if (TS.useRedux() && channels_to_upsert.length) {
          TS.redux.channels.bulkAddEntities(_.compact(channels_to_upsert));
        }
        TS.metrics.measureAndClear("upsert_channels", "upsert_channels_start");
        var skip_ims_mpims = TS.boot_data.page_needs_enterprise && TS.boot_data.exclude_org_members;
        if (!skip_ims_mpims) {
          var ims_to_upsert = _.map(data.ims, function(im) {
            if (just_general && im.user !== "USLACKBOT") return;
            return TS.ims.upsertIm(im, is_bulk_upsert);
          });
          if (TS.useRedux() && ims_to_upsert.length) {
            TS.redux.channels.bulkAddEntities(_.compact(ims_to_upsert));
          }
        }
        TS.metrics.mark("upsert_groups_start");
        if (!TS.isPartiallyBooted()) {
          var existing_group_ids = _.map(TS.model.groups, "id");
          var group_ids = _.map(data.groups, "id");
          var should_invalidate_members_user_can_see_array_caches = false;
          _.difference(existing_group_ids, group_ids).forEach(function(group_id) {
            var group = TS.groups.getGroupById(group_id);
            TS.groups.removeGroup(group);
            TS.groups.left_sig.dispatch(group);
            should_invalidate_members_user_can_see_array_caches = true;
          });
          if (should_invalidate_members_user_can_see_array_caches) {
            TS.members.invalidateMembersUserCanSeeArrayCaches();
          }
        }
        var groups_to_upsert = _.map(data.groups, function(group) {
          if (just_general) return;
          return TS.groups.upsertGroup(group, is_bulk_upsert);
        });
        if (TS.useRedux() && groups_to_upsert.length) {
          TS.redux.channels.bulkAddEntities(_.compact(groups_to_upsert));
        }
        TS.metrics.measureAndClear("upsert_groups", "upsert_groups_start");
        if (data.mpims) {
          if (!skip_ims_mpims) {
            var mpims_to_upsert = _.map(data.mpims, function(mpim) {
              if (just_general) return;
              return TS.mpims.upsertMpim(mpim, is_bulk_upsert);
            });
            if (TS.useRedux() && mpims_to_upsert.length) {
              TS.redux.channels.bulkAddEntities(_.compact(mpims_to_upsert));
            }
          }
        }
        TS.utility.msgs.finishBatchUnreadCalc();
        if (TS.model.user.is_restricted && !TS._incremental_boot && TS._did_incremental_boot) {
          TS.members.invalidateMembersUserCanSeeArrayCaches();
        }
      };
      if (data.dnd) {
        if (data.dnd.dnd_enabled) {
          if (data.dnd.next_dnd_start_ts) TS.model.dnd.next_dnd_start_ts = data.dnd.next_dnd_start_ts;
          if (data.dnd.next_dnd_end_ts) TS.model.dnd.next_dnd_end_ts = data.dnd.next_dnd_end_ts;
        } else {
          TS.model.dnd.next_dnd_start_ts = null;
          TS.model.dnd.next_dnd_end_ts = null;
        }
        if (data.dnd.snooze_enabled) TS.model.dnd.snooze_enabled = data.dnd.snooze_enabled;
        if (data.dnd.snooze_endtime) TS.model.dnd.snooze_endtime = data.dnd.snooze_endtime;
      }
      if (!TS._incremental_boot) {
        var maybe_shared_model_obs = data.ims.concat(data.mpims || [], data.groups || []);
        return TS.members.ensureMembersArePresentInSharedModelObs(maybe_shared_model_obs).then(function() {
          var with_shared = true;
          if (!doAllMembersFromChannelsInRawDataExist(with_shared)) {
            if (parseInt(args.cache_ts, 10)) {
              _onBadUserCache("!doAllMembersFromChannelsInRawDataExist(with_shared=true)", log_data.join("\n"));
              reject(Error("called _onBadUserCache"));
              return;
            }
            TS.logError({
              message: log_data.join("\n")
            }, "doAllMembersFromChannelsInRawDataExist(with_shared=true) failed");
          }
          completeModelObSetup();
          resolve();
        }, function(err) {
          reject(Error("could not fetch all external members: " + (err && err.message)));
        });
      }
      completeModelObSetup();
      resolve();
    });
  };
  var _onBadUserCache = function(problem) {
    TS.error("_onBadUserCache problem: " + problem);
    TS.storage.cleanOutCacheTsStorage();
    TS.model.had_bad_user_cache = true;
    if (TS.boot_data.feature_ws_refactor) {
      TS.error("_onBadUserCache problem: " + problem);
      TS.interop.SocketManager.disconnect();
    } else {
      TS.ms.onFailure("_onBadUserCache problem: " + problem);
    }
  };
  var _extractAndDeleteTestProps = function(ob) {
    if (ob.test && !ob.__esModule && _shouldSuppressTestExport()) {
      delete ob.test;
    } else if (typeof ob.test === "function") {
      var test_getter = ob.test;
      Object.defineProperty(ob, "test", {
        get: test_getter
      });
    }
  };
  _extractAndDeleteTestProps(TS);
  var _shouldConnectToMS = function() {
    return !!(TS.client || TS.web && TS.boot_data.page_has_ms);
  };
  var _maybeOpenTokenlessConnection = function() {
    if (!_shouldConnectToMS()) return;
    if (!TS.boot_data.ms_connect_url) return;
    if (TS.lazyLoadMembersAndBots()) {
      _ms_rtm_start_p = TS.flannel.connectAndFetchRtmStart().catch(function() {
        if (TS.boot_data.feature_ws_refactor) {
          TS.interop.SocketManager.disconnect();
        } else {
          TS.ms.disconnect();
        }
        return TS.api.connection.waitForAPIConnection().then(function() {
          return TS.flannel.connectAndFetchRtmStart();
        });
      });
      return;
    }
    if (TS.has_pri[_pri_ms]) TS.log(_pri_ms, "Opening a tokenless MS connection");
    if (TS.boot_data.feature_ws_refactor) {
      TS.interop.SocketManager.connectProvisionallyAndFetchRtmStart();
    } else {
      TS.ms.connectProvisionally(TS.boot_data.ms_connect_url);
    }
  };
  var _initSleepWake = function() {
    var is_asleep = false;
    var _onSleep = function() {
      TS.info("sleep event!");
      is_asleep = true;
      if (TS.client) {
        if (TS.boot_data.feature_ws_refactor) {
          TS.interop.SocketManager.sleep();
        } else {
          TS.ms.sleep();
        }
      }
      if (TS.web && TS.web.space) TS.ds.sleep();
    };
    var _onWake = function() {
      if (!is_asleep) return;
      is_asleep = false;
      TS.info("wake event! version:" + TS.boot_data.version_ts + " start_ms:" + TS.boot_data.start_ms);
      if (TS.client) {
        if (TS.boot_data.feature_ws_refactor) {
          TS.interop.SocketManager.wake();
        } else {
          TS.ms.wake();
        }
      }
      if (TS.web && TS.web.space) TS.ds.wake();
    };
    window.addEventListener("sleep", _onSleep, false);
    window.addEventListener("wake", _onWake, false);
  };
  var _pri_flannel = 1989;
  var _pri_ms = 1996;
  var _pri_upsert = 481;
  var _pri_login = 488;
})();
(function() {
  "use strict";
  TS.registerModule("incremental_boot", {
    onStart: function() {
      TS.channels.switched_sig.add(_storeLastActiveModelOb);
      TS.ims.switched_sig.add(_storeLastActiveModelOb);
      TS.groups.switched_sig.add(_storeLastActiveModelOb);
      TS.mpims.switched_sig.add(_storeLastActiveModelOb);
      if (TS.boot_data.feature_ws_refactor) {
        TS.interop.SocketManager.connectedSig.addOnce(_storeLastActiveModelOb);
      } else {
        TS.ms.connected_sig.addOnce(_storeLastActiveModelOb);
      }
    },
    startIncrementalBoot: function() {
      if (TS._did_incremental_boot) {
        return Promise.reject(new Error("_startIncrementalBoot called more than once; this is a programming error."));
      }
      TS._did_incremental_boot = true;
      var incremental_boot_data = TS.boot_data.incremental_boot_data;
      delete TS.boot_data.incremental_boot_data;
      var channels_view_args = {
        canonical_avatars: true,
        include_full_users: true,
        count: TS.model.initial_msgs_cnt - 1,
        ignore_replies: true
      };
      if (TS.boot_data.feature_name_tagging_client) {
        channels_view_args.name_tagging = true;
      }
      var channel_name = TS.utility.getChannelNameFromUrl(window.location.toString());
      if (channel_name) {
        TS.model.c_name_in_url = channel_name;
        channels_view_args.name = channel_name;
      } else {
        var last_active_model_ob = TS.storage.fetchLastActiveModelObId();
        if (last_active_model_ob) {
          channels_view_args.channel = last_active_model_ob;
        }
      }
      if (TS.membership && TS.membership.lazyLoadChannelMembership()) {
        channels_view_args.no_members = true;
      }
      _setIncrementalBootUIState(true);
      TS.model.change_channels_when_offline = false;
      return TS.api.call("channels.view", channels_view_args).then(function(resp) {
        TS._incremental_boot = true;
        var data = _assembleBootData(incremental_boot_data, resp.data);
        return {
          ok: true,
          data: data,
          args: resp.args
        };
      }).catch(function(err) {
        TS.warn("Incremental boot failed with error: " + err);
        TS._incremental_boot = false;
        TS._did_incremental_boot = false;
        TS.model.change_channels_when_offline = true;
        _setIncrementalBootUIState(false);
        throw err;
      });
    },
    beforeFullBoot: function() {
      if (!TS._incremental_boot) return;
      if (!TS._did_incremental_boot) return;
      if (TS._did_full_boot) return;
      TS._incremental_boot = false;
      _recent_incremental_boot_timer = setTimeout(_removeRecentIncrementalBootState, 1e4);
      if (TS.client && TS.client.ui && TS.client.ui.$messages_input_container) {
        TS.client.ui.$messages_input_container.one(_message_input_change_events, _removeRecentIncrementalBootState);
      }
      if (TS.boot_data.feature_ws_refactor) {
        TS.interop.SocketManager.connectedSig.addOnce(_removeRecentIncrementalBootState);
      } else {
        TS.ms.connected_sig.addOnce(_removeRecentIncrementalBootState);
      }
    },
    afterFullBoot: function() {
      if (TS._did_incremental_boot) {
        TS._did_full_boot = true;
        TS.model.change_channels_when_offline = true;
      }
      _setIncrementalBootUIState(false);
    },
    shouldIncrementalBoot: function() {
      if (TS._did_incremental_boot) return false;
      if (!TS.boot_data.incremental_boot_data) return false;
      if (TS.model.ms_logged_in_once) return false;
      if (TS.newxp.shouldShowFirstWelcome()) {
        delete TS.boot_data.incremental_boot_data;
        return false;
      }
      var loc = history.location || document.location;
      if (TS.utility.isUnreadViewPath(loc.pathname)) {
        delete TS.boot_data.incremental_boot_data;
        return false;
      }
      if (TS.utility.isThreadsViewPath(loc.pathname)) {
        delete TS.boot_data.incremental_boot_data;
        return false;
      }
      if (TS.utility.isAppSpaceViewPath(loc.pathname)) {
        delete TS.boot_data.incremental_boot_data;
        return false;
      }
      return true;
    },
    userDidInteractWithUI: function() {
      TS.sounds.play("beep");
      _removeRecentIncrementalBootState();
    }
  });
  var _assembleBootData = function(incremental_boot_data, channels_view_data) {
    var data = channels_view_data;
    data.channels = data.channels || [];
    data.groups = data.groups || [];
    data.ims = data.ims || [];
    data.mpims = data.mpims || [];
    var focal_model_ob = data.channel || data.group || data.im;
    TS.model.initial_cid = focal_model_ob.id;
    delete data.channel;
    delete data.group;
    if (data.history && data.history.messages) {
      focal_model_ob.msgs = data.history.messages;
    } else {
      focal_model_ob.msgs = [];
    }
    Object.keys(incremental_boot_data).forEach(function(k) {
      data[k] = _.merge(incremental_boot_data[k], data[k]);
    });
    if (!data.self || data.self.id != TS.boot_data.user_id) {
      throw new Error("Missing `self` from incremental boot data");
    }
    if (!_.find(data.users, {
        id: data.self.id
      })) {
      data.users.push(data.self);
    }
    data.users.forEach(function(user) {
      if (user.id === "USLACKBOT" || user.id == TS.boot_data.user_id) {
        user.presence = "active";
      }
      delete user.updated;
    });
    if (focal_model_ob.is_channel) {
      _upsertModelOb(focal_model_ob, data.channels);
    } else if (focal_model_ob.is_mpim) {
      _upsertModelOb(focal_model_ob, data.mpims);
    } else if (focal_model_ob.is_group) {
      _upsertModelOb(focal_model_ob, data.groups);
    } else if (focal_model_ob.is_im) {
      _upsertModelOb(focal_model_ob, data.ims);
    } else {
      throw new Error("Unexpected model object type from channels.view");
    }
    data.emoji_cache_ts = _.get(TS.storage.fetchCustomEmoji(), "cache_ts");
    data.apps_cache_ts = _.get(TS.storage.fetchApps(), "cache_ts");
    data.commands_cache_ts = _.get(TS.storage.fetchCmds(), "cache_ts");
    return data;
  };
  var _message_input_change_events = "change.incremental_boot keydown.incremental_boot paste.incremental_boot";
  var _recent_incremental_boot_timer;
  var _removeRecentIncrementalBootState = function() {
    if (TS.client && TS.client.ui && TS.client.ui.$messages_input_container) {
      TS.client.ui.$messages_input_container.off(_message_input_change_events);
      TS.client.ui.$messages_input_container.removeClass("pretend-to-be-online");
    }
    if (TS.boot_data.feature_ws_refactor) {
      TS.interop.SocketManager.connectedSig.remove(_removeRecentIncrementalBootState);
    } else {
      TS.ms.connected_sig.remove(_removeRecentIncrementalBootState);
    }
    if (_recent_incremental_boot_timer) {
      clearTimeout(_recent_incremental_boot_timer);
      _recent_incremental_boot_timer = undefined;
    }
  };
  var _setIncrementalBootUIState = function(is_incremental_boot_in_progress) {
    $("#col_channels, #team_menu").toggleClass("placeholder", is_incremental_boot_in_progress);
    $(document.body).toggleClass("incremental_boot", is_incremental_boot_in_progress);
  };
  var _upsertModelOb = function(model_ob, all_model_obs) {
    var existing_model_ob = _.find(all_model_obs, {
      id: model_ob.id
    });
    if (existing_model_ob) {
      _.extend(existing_model_ob, model_ob);
    } else {
      all_model_obs.push(model_ob);
    }
  };
  var _storeLastActiveModelOb = function() {
    var model_ob = TS.shared.getActiveModelOb();
    TS.storage.storeLastActiveModelObId(model_ob ? model_ob.id : undefined);
  };
})();
(function() {
  "use strict";
  TS.registerModule("metrics", {
    special_start_mark_labels: ["navigationStart", "unloadEventStart", "unloadEventEnd", "redirectStart", "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart", "connectEnd", "secureConnectionStart", "requestStart", "responseStart", "responseEnd", "domLoading", "domComplete", "domContentLoadedEventStart", "domContentLoadedEventEnd", "domInteractive"],
    onStart: function() {
      if (TS.web) TS.web.login_sig.add(TS.metrics.onLogin);
      if (TS.client) TS.client.login_sig.add(TS.metrics.onLogin);
      _log_dom_node_count = TS.utility.enableFeatureForUser(10);
    },
    onLogin: function() {
      var noise_ms = Math.floor(Math.random() * _INTERVAL_DURATION_NOISE_MS);
      setInterval(_beaconDataAndEmptyQueue, _INTERVAL_DURATION_MS + noise_ms);
      if (TS.boot_data.feature_electron_memory_logging && TS.model.is_electron) _fetchAndStoreMemoryStats();
      $(window).on("beforeunload", _cleanUp);
    },
    mark: function(mark_label) {
      if (window.performance && performance.mark) performance.mark(mark_label);
    },
    getLatestMark: function(mark_label) {
      if (!window.performance || !performance.getEntriesByName) return;
      var items = performance.getEntriesByName(mark_label);
      if (items.length === 0) return false;
      return items[items.length - 1];
    },
    clearMarks: function(mark_label) {
      if (window.performance && performance.clearMarks) performance.clearMarks(mark_label);
    },
    measure: function(measure_label, start_mark_label, end_mark_label, options) {
      if (start_mark_label === "start_nav") start_mark_label = "navigationStart";
      var clear_end_mark = false;
      if (!end_mark_label) {
        clear_end_mark = true;
        end_mark_label = measure_label + "__" + start_mark_label + "_end";
        if (window.performance && performance.mark) performance.mark(end_mark_label);
      }
      var pt = performance.timing;
      var duration;
      if (pt && TS.metrics.special_start_mark_labels.indexOf(start_mark_label) > -1) {
        var start_ms = pt[start_mark_label];
        if (!start_ms) return;
        var end_mark_measures = performance.getEntriesByName(end_mark_label);
        if (end_mark_measures.length === 0) return;
        var t0 = pt.navigationStart;
        var end_ms = t0 + end_mark_measures[end_mark_measures.length - 1].startTime;
        duration = end_ms - start_ms;
        if (clear_end_mark && window.performance && performance.clearMarks) performance.clearMarks(end_mark_label);
        return TS.metrics.store(measure_label, duration, options);
      }
      try {
        performance.measure(measure_label, start_mark_label, end_mark_label);
      } catch (e) {
        TS.warn("Couldn't complete TS.metrics measurement for start mark \"" + start_mark_label + '"');
        return;
      }
      var measures = performance.getEntriesByName(measure_label);
      if (measures.length === 0) return;
      duration = measures[measures.length - 1].duration;
      duration = TS.metrics.store(measure_label, duration, options);
      performance.clearMeasures(measure_label);
      if (clear_end_mark) performance.clearMarks(end_mark_label);
      return duration;
    },
    measureAndClear: function(measure_label, start_mark_label) {
      var duration = TS.metrics.measure(measure_label, start_mark_label);
      TS.metrics.clearMarks(start_mark_label);
      return duration;
    },
    store: function(label, value, options) {
      if (!options) options = {};
      var unit;
      var min = options.allow_zero ? 0 : 1;
      if (value >= min) {
        if (options.in_seconds) {
          value = _convertMillisecondsToSeconds(value);
          unit = " seconds";
        } else if (options.is_count) {
          value = Math.round(value);
          unit = " (count)";
        } else {
          value = TS.utility ? TS.utility.roundToThree(value) : value;
          unit = "ms";
        }
        if (!options.ephemeral) {
          _recordLabelMeasurement(label, value);
        }
        if (_shouldLog(label)) TS.info("[TIMING] " + label + ": " + value + unit + " " + (options.ephemeral ? "(ephemeral)" : ""));
      }
      return value;
    },
    count: function(label, amount) {
      amount = amount || 1;
      TS.metrics.store(label, amount, {
        is_count: true
      });
    },
    flush: function() {
      _beaconDataAndEmptyQueue();
    },
    logPerfTimingSections: function() {
      var pt = performance.timing;
      if (!pt) return;
      TS.metrics.special_start_mark_labels.forEach(function(n) {
        var val = pt[n] - pt.navigationStart;
        if (val) TS.metrics.store("pt_" + n, val, {
          allow_zero: true
        });
      });
      _perf_timing_sections.forEach(function(a) {
        if (pt[a[2]] && pt[a[1]]) {
          TS.metrics.store("pt_section_" + a[0], pt[a[2]] - pt[a[1]], {
            allow_zero: true
          });
        }
      });
    },
    getMemoryStats: function() {
      if (!_teams_memory_data || !_app_memory_data) return null;
      return {
        teams: _teams_memory_data,
        app: _app_memory_data
      };
    },
    test: function() {
      return {
        createBeaconURLs: _createBeaconURLs,
        getMeasures: function() {
          return _measures;
        },
        reset: function() {
          performance.clearMarks();
          performance.clearMeasures();
          _measures = {};
        }
      };
    }
  });
  var _INTERVAL_DURATION_MS = 25 * 1e3;
  var _INTERVAL_DURATION_NOISE_MS = 10 * 1e3;
  var _INTERVAL_MAX_URL_LENGTH = 2e3;
  var _log_dom_node_count = false;
  var _measures = {};
  var _teams_memory_data = null;
  var _app_memory_data = null;
  var _cleanUp = function() {
    if (TS.client && TS.metrics.getLatestMark("start_load")) TS.metrics.measure("session_lifespan", "start_load", null, {
      in_seconds: true
    });
    _beaconDataAndEmptyQueue();
  };
  var _beaconDataAndEmptyQueue = function() {
    if (Object.keys(_measures).length === 0) return;
    if (window.performance && performance.memory && performance.memory.usedJSHeapSize) _measures.used_js_heap_size = [TS.utility.roundToThree(TS.utility.convertBytesToMegabytes(performance.memory.usedJSHeapSize))];
    if (_log_dom_node_count) {
      var dom_node_count = document.getElementsByTagName("*").length;
      TS.metrics.store("dom_node_count", dom_node_count, {
        is_count: true
      });
    }
    if (TS.boot_data.feature_electron_memory_logging && TS.model.is_electron) _fetchAndStoreMemoryStats();
    var beacon_urls = _createBeaconURLs(_measures);
    beacon_urls.forEach(function(url) {
      var beacon = new Image;
      beacon.src = url;
    });
    if (window.performance && performance.clearMeasures) performance.clearMeasures();
    _measures = {};
  };
  var _createBeaconURLs = function(measures) {
    var beacon_url = TS.boot_data.beacon_timing_url || window.ts_endpoint_url;
    if (!beacon_url) return [];
    var urls = [];
    var url = "";
    var data = [];
    var label;
    var item;
    var beacon_data = {
      team_id: TS.model && TS.model.team && TS.model.team.id || "",
      user_id: TS.model && TS.model.user && TS.model.user.id || "",
      team_size: TS.model && TS.model.members && TS.model.members.length || 0,
      ver: TS.boot_data.version_ts,
      session_age: 0,
      data: null
    };
    if (TS.client && TS.metrics.getLatestMark("start_load")) {
      beacon_data.session_age = TS.metrics.measure("session_age", "start_load", null, {
        ephemeral: true,
        in_seconds: true
      });
    }
    var makeUrl = function(beacon_data, data) {
      beacon_data.data = data.join(";");
      return beacon_url + "?" + _serialize(beacon_data);
    };
    for (label in measures) {
      if (!measures.hasOwnProperty(label)) continue;
      item = label + ":" + measures[label].join(",");
      data.push(item);
      url = makeUrl(beacon_data, data);
      if (url.length > _INTERVAL_MAX_URL_LENGTH) {
        data.pop();
        urls.push(makeUrl(beacon_data, data));
        data = [item];
      }
    }
    urls.push(makeUrl(beacon_data, data));
    return urls;
  };
  var _shouldLog = function(label) {
    return TS.qs_args.log_timings || TS.qs_args.log_timing === label || TS.metrics.log === true || TS.metrics.log === label || TS.metrics.log instanceof Array && TS.metrics.log.indexOf(label) !== -1;
  };
  var _serialize = function(obj) {
    var str = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
    return str.join("&");
  };
  var _convertMillisecondsToSeconds = function(ms) {
    return Math.round(ms / 1e3);
  };
  var _recordLabelMeasurement = function(label, value, is_experiment_metric_variant) {
    if (!_measures[label]) _measures[label] = [];
    _measures[label].push(value);
    if (!is_experiment_metric_variant) {
      if (TS.boot_data.experiment_client_metrics && TS.boot_data.experiment_client_metrics[label]) {
        TS.boot_data.experiment_client_metrics[label].forEach(function(experiment_name) {
          var bucket_name = TS.boot_data["exp_" + experiment_name];
          if (!bucket_name) return;
          var is_experiment_metric_variant = true;
          _recordLabelMeasurement("exp_" + experiment_name + "_" + bucket_name + "_" + label, value, is_experiment_metric_variant);
        });
      }
      var metric_experiments = TS.experiment ? TS.experiment.getExperimentsForMetric(label) : [];
      metric_experiments.forEach(function(experiment) {
        var is_experiment_metric_variant = true;
        _recordLabelMeasurement("exp--" + experiment.experiment_id + "--" + experiment.group + "--" + label, value, is_experiment_metric_variant);
      });
    }
  };
  var _perf_timing_sections = [
    ["redirect", "redirectStart", "redirectEnd"],
    ["app_cache", "fetchStart", "domainLookupStart"],
    ["dns", "domainLookupStart", "domainLookupEnd"],
    ["tcp", "connectStart", "connectEnd"],
    ["secure_tcp", "secureConnectionStart", "connectEnd"],
    ["request", "requestStart", "responseStart"],
    ["response", "responseStart", "responseEnd"],
    ["processed", "domLoading", "domComplete"],
    ["parsed", "domLoading", "domInteractive"],
    ["ready", "domInteractive", "domComplete"],
    ["scripts_executed", "domContentLoadedEventStart", "domContentLoadedEventEnd"]
  ];
  var _fetchAndStoreMemoryStats = function() {
    if (desktop && desktop.stats && desktop.stats.getTeamsMemoryUsage && desktop.stats.getCombinedMemoryUsage) {
      var memory_team_mb;
      var memory_app_mb;
      var memory_app_shared_mb;
      var memory_app_private_mb;
      var get_teams_p = TSSSB.call("getTeamsMemoryUsage");
      var get_app_p = TSSSB.call("getCombinedMemoryUsage");
      Promise.all([get_teams_p, get_app_p]).then(function(data) {
        _teams_memory_data = data[0];
        _app_memory_data = data[1];
        if (!_teams_memory_data) throw _teams_memory_data;
        _.forOwn(_teams_memory_data, function(team) {
          memory_team_mb = Math.ceil(TS.utility.convertKilobytesToMegabytes(team.memory.privateBytes));
          TS.metrics.store("memory_team_mb_" + team.state, memory_team_mb);
        });
        if (!_app_memory_data || !_app_memory_data.memory) throw _app_memory_data;
        memory_app_shared_mb = Math.ceil(TS.utility.convertKilobytesToMegabytes(_app_memory_data.memory.sharedBytes));
        memory_app_private_mb = Math.ceil(TS.utility.convertKilobytesToMegabytes(_app_memory_data.memory.privateBytes));
        memory_app_mb = memory_app_shared_mb + memory_app_private_mb;
        TS.metrics.store("memory_app_mb_" + _app_memory_data.numTeams + "_teams", memory_app_mb);
        TS.metrics.store("memory_app_shared_mb_" + _app_memory_data.numTeams + "_teams", memory_app_shared_mb);
        TS.metrics.store("memory_app_private_mb_" + _app_memory_data.numTeams + "_teams", memory_app_private_mb);
      }).catch(function(err) {
        TS.warn("TS.metrics: Invalid data returned by desktop.stats", err);
      });
    } else {
      var combined_stats = TSSSB.call("getMemoryUsage");
      var combined_stats_all_p = TSSSB.call("getCombinedMemoryUsage");
      if (combined_stats) {
        var memory_usage_team_mb = TS.utility.roundToThree(TS.utility.convertKilobytesToMegabytes(combined_stats.memory.privateBytes + combined_stats.memory.sharedBytes));
        TS.metrics.store("memory_usage_team_mb", memory_usage_team_mb);
      }
      if (combined_stats_all_p) {
        combined_stats_all_p.then(function(result) {
          if (result && result.memory) {
            var memory_usage_all = result.memory.privateBytes + result.memory.sharedBytes;
            var memory_usage_all_per_team = memory_usage_all / result.numTeams;
            TS.metrics.store("memory_usage_all_mb", TS.utility.roundToThree(TS.utility.convertKilobytesToMegabytes(memory_usage_all)));
            TS.metrics.store("memory_usage_all_per_team_mb", TS.utility.roundToThree(TS.utility.convertKilobytesToMegabytes(memory_usage_all_per_team)));
          } else {
            TS.warn("Unexpected results from call to _getCombinedMemoryUsage()", result);
          }
        }).catch(function(err) {
          TS.warn("Error logging combined memory stats", err);
        });
      }
    }
  };
})();
(function() {
  "use strict";
  TS.registerModule("statsd", {
    onStart: function() {
      var interval_duration_ms = 30 * 1e3;
      var interval_duration_noise_ms = 5 * 1e3;
      var noise_ms = Math.floor(Math.random() * interval_duration_noise_ms);
      setInterval(_sendDataAndEmptyQueue, interval_duration_ms + noise_ms);
      $(window).on("beforeunload", _sendDataAndEmptyQueue);
    },
    count: function(stat, count) {
      if (_.isUndefined(count)) count = 1;
      _record(stat, "count", count);
    },
    timing: function(stat, timing) {
      _record(stat, "timing", timing);
    },
    flush: function() {
      _sendDataAndEmptyQueue();
    },
    mark: function(mark_label) {
      TS.metrics.mark(mark_label);
    },
    clearMarks: function(mark_label) {
      TS.metrics.clearMarks(mark_label);
    },
    measure: function(stat, start_mark_label, end_mark_label) {
      var duration = TS.metrics.measure(stat, start_mark_label, end_mark_label, {
        ephemeral: true
      });
      if (_.isNaN(duration) || _.isUndefined(duration)) return;
      TS.statsd.timing(stat, duration);
      return duration;
    },
    measureAndClear: function(stat, start_mark_label) {
      var duration = TS.statsd.measure(stat, start_mark_label);
      TS.statsd.clearMarks(start_mark_label);
      return duration;
    },
    test: function() {
      var test_ob = {
        getStats: function() {
          return _stats;
        },
        reset: function() {
          _stats = [];
        }
      };
      Object.defineProperty(test_ob, "_record", {
        get: function() {
          return _record;
        },
        set: function(v) {
          _record = v;
        }
      });
      Object.defineProperty(test_ob, "_sendDataAndEmptyQueue", {
        get: function() {
          return _sendDataAndEmptyQueue;
        },
        set: function(v) {
          _sendDataAndEmptyQueue = v;
        }
      });
      return test_ob;
    }
  });
  var _MAX_URL_LENGTH = 2e3;
  var _ENDPOINT_URL;
  var _stats = [];
  var _record = function(stat, type, value) {
    var unit;
    if (type === "count") {
      unit = " (count)";
      value = _.round(value, 0);
    } else if (type === "timing") {
      unit = "ms";
      value = _.round(value, 3);
    } else {
      TS.error("TS.statsd._record called with invalid type: " + type);
      return;
    }
    if (_shouldLog(stat)) TS.info("[STATSD " + type.toUpperCase() + "] " + stat + ": " + value + unit);
    _stats.push({
      stat: stat,
      type: type,
      value: value
    });
  };
  var _sendDataAndEmptyQueue = function() {
    if (!_stats.length) return;
    var urls = [];
    var data = [];
    var url = "";
    var makeUrl = function(data) {
      return _detectEndpoint() + "?stats=" + encodeURIComponent(JSON.stringify(data));
    };
    _stats.forEach(function(stat) {
      data.push(stat);
      url = makeUrl(data);
      if (url.length > _MAX_URL_LENGTH) {
        data.pop();
        urls.push(makeUrl(data));
        data = [stat];
      }
    });
    urls.push(makeUrl(data));
    urls.forEach(function(beacon_url) {
      var beacon = new Image;
      beacon.src = beacon_url;
    });
    if (_shouldLog()) TS.info("[STATSD] Sending data: " + JSON.stringify(_stats));
    _stats = [];
  };
  var _detectEndpoint = function() {
    if (_ENDPOINT_URL) return _ENDPOINT_URL;
    if (TS.environment.is_dev) {
      _ENDPOINT_URL = "https://" + location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/)[2] + "/beacon/statsd";
    } else if (location.host.match(/staging.slack.com/)) {
      _ENDPOINT_URL = "https://staging.slack.com/beacon/statsd";
    } else {
      _ENDPOINT_URL = "https://slack.com/beacon/statsd";
    }
    return _ENDPOINT_URL;
  };
  var _shouldLog = function(stat) {
    if (!stat) return TS.qs_args.log_timings || TS.statsd.log === true;
    return TS.qs_args.log_timings || TS.qs_args.log_timing === stat || TS.statsd.log === true || TS.statsd.log === stat || TS.statsd.log instanceof Array && TS.statsd.log.indexOf(stat) !== -1;
  };
})();
(function() {
  "use strict";
  TS.registerModule("i18n", {
    DEFAULT_LOCALE: "en-US",
    onStart: function() {
      _maybeSetup();
      _fetchBootData();
    },
    locale: function() {
      _maybeSetup();
      return _locale;
    },
    localesEnabled: function() {
      var locales = {};
      if (TS.boot_data.feature_locale_de_DE) locales["de-DE"] = "Deutsch";
      locales["en-US"] = "English (US)";
      if (TS.boot_data.feature_locale_es_ES) locales["es-ES"] = "Español";
      if (TS.boot_data.feature_locale_fr_FR) locales["fr-FR"] = "Français";
      if (TS.boot_data.feature_locale_ja_JP) locales["ja-JP"] = "日本語";
      if (TS.boot_data.feature_pseudo_locale) locales.pseudo = "Þsèúδôtřáñsℓátïôñ";
      return locales;
    },
    localeOrPseudo: function() {
      if (_is_pseudo) {
        return "pseudo";
      }
      return TS.i18n.locale();
    },
    zdLocale: function() {
      _maybeSetup();
      var zd_locale = TS.i18n.DEFAULT_LOCALE.toLowerCase();
      if (_zd_locale_map && _zd_locale_map[_locale.toLowerCase()]) {
        zd_locale = _zd_locale_map[_locale.toLowerCase()];
      }
      return zd_locale;
    },
    t: function(str, ns, locale) {
      _maybeSetup();
      if (!ns && _is_dev) {
        var log = TS.error ? TS.error : console.error;
        log.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + ns + ".");
        return function() {
          return "";
        };
      }
      locale = locale || _locale;
      var key = locale + ":" + ns + ":" + str;
      if (_translations[key] === undefined) {
        if (_is_pseudo || locale === "pseudo") {
          _translations[key] = new MessageFormat(locale, _getPseudoTranslation(str)).format;
        } else {
          _translations[key] = new MessageFormat(locale, str).format;
        }
        if (_is_dev && (TS.qs_args && TS.qs_args.local_assets || TS.qs_args && TS.qs_args.js_path)) {
          _translations[key].toString = _devWarningForImproperUse(key, ns);
        }
      }
      return _translations[key];
    },
    number: function(num) {
      _maybeSetup();
      return Intl.NumberFormat(_locale).format(num);
    },
    sorter: function(a, b) {
      _maybeSetup();
      if (!a || !b) return !a ? -1 : 1;
      if (_collator) {
        return _collator.compare(a, b);
      }
      return a.localeCompare(b);
    },
    mappedSorter: function(map) {
      return function(a, b) {
        if (!a || !b) return !a ? -1 : 1;
        var parts = (map + "").split(".");
        if (parts.length > 1) {
          parts.forEach(function(part) {
            a = a[part];
            b = b[part];
          });
        } else {
          a = a[map];
          b = b[map];
        }
        return TS.i18n.sorter(a, b);
      };
    },
    possessive: function(str) {
      _maybeSetup();
      switch (TS.i18n.locale()) {
        case "fr-FR":
        case "es-ES":
          return "de ";
        case "de-DE":
          return str.substr && str.substr(str.length - 1) === "s" ? "" : "s";
        case "ja-JP":
          return "の";
        default:
          return "’s";
      }
    },
    fullPossessiveString: function(str) {
      _maybeSetup();
      switch (TS.i18n.locale()) {
        case "es-ES":
        case "fr-FR":
          return TS.i18n.possessive(str) + str;
        default:
          return str + TS.i18n.possessive(str);
      }
    },
    listify: function(arr, options) {
      _maybeSetup();
      var and;
      var list = [];
      var l = arr.length;
      var conjunction = options && options.conj === "or" ? TS.i18n.t("or", "general")() : TS.i18n.t("and", "general")();
      var oxford = l > 2 ? "," : "";
      var wrap_start = options && options.strong ? "<strong>" : "";
      var wrap_end = options && options.strong ? "</strong>" : "";
      var no_escape = options && options.no_escape;
      var item_prefix = options && options.item_prefix ? options.item_prefix : "";
      switch (_locale) {
        case "ja-JP":
          and = ", ";
          break;
        default:
          and = oxford + " " + conjunction + " ";
      }
      arr.forEach(function(s, i) {
        if (!no_escape) s = _.escape(s);
        list.push(wrap_start + item_prefix + s + wrap_end);
        if (i < l - 2) {
          list.push(", ");
        } else if (i < l - 1) {
          list.push(and);
        }
      });
      return list;
    },
    deburr: function(str) {
      str = _.deburr(str);
      str = _normalizeKana(str);
      str = _normalizeCyrillic(str);
      return str;
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
      "default": {
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
      setLocale: function(locale) {
        _locale = locale;
        if (Intl.Collator) _collator = Intl.Collator(_locale);
      }
    }
  });
  var _is_setup;
  var _is_dev;
  var _is_pseudo;
  var _locale;
  var _collator;
  var _translations = {};
  var _zd_locale_map;
  var _dev_warned_translations = [];
  var _maybeSetup = function() {
    if (_is_setup) return;
    _is_dev = location.host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
    var locale = location.search.match(new RegExp("\\?locale=(.*?)($|&)", "i"));
    if (locale) _locale = locale[1];
    if (!_locale) {
      _locale = document.documentElement.getAttribute("data-locale") || TS.i18n.DEFAULT_LOCALE;
    }
    if (_locale === "pseudo") {
      _is_pseudo = true;
    }
    if (Intl.Collator) {
      _collator = Intl.Collator(_locale);
    } else {
      _collator = null;
    }
    _is_setup = true;
  };
  var _fetchBootData = function() {
    if (TS.boot_data && TS.boot_data.slack_to_zd_locale) {
      _zd_locale_map = TS.boot_data.slack_to_zd_locale;
    }
  };
  var _devWarningForImproperUse = function(str, ns) {
    return function() {
      var dev_warning_key = ns + "." + str;
      if (_dev_warned_translations.indexOf(dev_warning_key) >= 0) return;
      _dev_warned_translations.push(dev_warning_key);
      var example_invocation = "TS.i18n.t(" + JSON.stringify(str) + ", " + JSON.stringify(ns) + ")";
      TS.console.logStackTrace("Tried to use an i18n function as a string — you probably did " + example_invocation + " when you meant to do " + example_invocation + "()");
      alert("Dev-only alert: tried to use an i18n function as a string! See console for stack trace.\n\nNamespace: " + ns + "\nString: " + str);
      return "";
    };
  };
  var _getPseudoTranslation = function(str) {
    var end_colon = false;
    if (str.endsWith(":")) {
      end_colon = true;
      str = str.substr(0, str.length - 1);
    }
    var regex = /(<[^>]+>)|(&\w+;)/gi;
    var tags = str.match(regex) || [];
    str = str.replace(regex, "<>");
    var parsed = parseMessageFormatString(str);
    if (parsed.error) TS.error(parsed.error);
    var substr;
    str = parsed.tokens.map(function(t) {
      if (t[0] === "text") {
        substr = t[1];
        _.forOwn(_PSEUDO_MAP, function(val) {
          substr = substr.replace(val[0], val[1]);
        });
        return substr.split(" ").map(function(word) {
          word += new Array(Math.floor(.3 * word.length) + 1).join("~");
          return word;
        }).join(" ");
      }
      return t[1];
    }).join("");
    str = str.split("<>").map(function(w, i) {
      return w + (tags[i] || "");
    }).join("");
    if (end_colon) {
      str += ":";
    }
    return str;
  };
  var _PSEUDO_MAP = {
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
var _normalizeKana = function(str) {
  return str && str.replace(/([\u3000-\u301f\u30a0-\u30ff\uff00-\uffef])/g, _fullToHalf);
};
var _fullToHalf = function(char) {
  var zen_to_han = {
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
  var char_num = char.charCodeAt(0);
  if (char in zen_to_han) {
    return zen_to_han[char];
  } else if (char_num >= 65280 && char_num <= 65374) {
    return String.fromCharCode(char_num - 65248);
  }
  return char;
};
var _normalizeCyrillic = function(str) {
  return str && str.replace(/([\u0400-\u04ff])/g, _cyrillicToLatin);
};
var _cyrillicToLatin = function(char) {
  var cyrillic_to_latin = {
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
  if (char in cyrillic_to_latin) {
    return cyrillic_to_latin[char];
  }
  return char;
};
(function() {
  "use strict";
  TS.registerModule("model", {
    did_we_load_with_user_cache: false,
    did_we_load_with_emoji_cache: false,
    did_we_load_with_app_cache: false,
    did_we_load_with_cmd_cache: false,
    api_url: "",
    api_token: "",
    async_api_url: "",
    webhook_url: "",
    all_im_ids: [],
    all_group_ids: [],
    user: null,
    team: null,
    can_add_ura: null,
    ims: null,
    channels: null,
    groups: null,
    mpims: null,
    members: null,
    teams: null,
    rooms: null,
    bots: null,
    user_groups: null,
    idp_groups: null,
    apps: {},
    files: [],
    requested_im_opens: {},
    requested_group_opens: {},
    requested_mpim_opens: {},
    requested_channel_joins: {},
    created_channels: {},
    created_groups: {},
    archives_and_recreated_groups: {},
    last_team_name: "",
    last_team_domain: "",
    initial_cid: "",
    enterprise: null,
    initial_unread_view: false,
    initial_threads_view: false,
    initial_app_space_view: false,
    RESERVED_USERNAMES: ["all", "archive", "archived", "archives", "channel", "channels", "create", "delete", "deleted-channel", "edit", "everyone", "general", "group", "groups", "here", "me", "ms", "slack", "slackbot", "today", "you"],
    RESERVED_KEYWORDS: ["channel", "everyone", "here", "slackbot"],
    BROADCAST_KEYWORDS: [{
      id: "BKeveryone",
      name: "everyone",
      alias: "all",
      description: "Notify everyone on your team.",
      is_broadcast_keyword: true
    }, {
      id: "BKchannel",
      name: "channel",
      alias: "group",
      description: "Notify everyone in this channel.",
      is_broadcast_keyword: true
    }, {
      id: "BKhere",
      name: "here",
      description: "Notify every online desktop-using member in this channel.",
      is_broadcast_keyword: true
    }],
    NAMED_VIEWS: [{
      id: "Vall_unreads",
      name: TS.i18n.t("All Unreads", "model")(),
      is_view: true
    }, {
      id: "Vall_threads",
      name: TS.i18n.t("Threads", "threads")(),
      alt_names: [TS.i18n.t("All Threads", "threads")(), TS.i18n.t("New Threads", "threads")()],
      is_view: true
    }, {
      id: "Vapp_space",
      name: TS.i18n.t("Apps", "model")(),
      is_view: true
    }],
    unsent_msgs: {},
    display_unsent_msgs: {},
    inline_img_byte_limit: 2097152,
    inline_img_pixel_limit: 7360 * 4912,
    code_wrap_long_lines: true,
    last_reads_set_by_client: {},
    ms_asleep: false,
    ms_connected: false,
    ms_connecting: false,
    ms_logged_in_once: false,
    ms_connection_start_ts: null,
    calling_rtm_start: false,
    calling_test_fast_reconnect: false,
    attempting_fast_reconnect: false,
    ds_asleep: false,
    ds_connected: false,
    ds_connecting: false,
    ds_logged_in_once: false,
    window_unloading: false,
    active_cid: null,
    last_active_cid: null,
    active_group_id: null,
    active_channel_id: null,
    active_im_id: null,
    active_mpim_id: null,
    active_history: [],
    all_custom_emoji: [],
    user_hiddens: [],
    nav_history: [],
    nav_current_index: -1,
    nav_used: false,
    user_colors: null,
    emoji_use: {},
    at_channel_suppressed_channels: null,
    push_at_channel_suppressed_channels: null,
    loud_channels: null,
    never_channels: null,
    loud_channels_set: null,
    push_loud_channels: null,
    push_mention_channels: null,
    push_loud_channels_set: null,
    muted_channels: [],
    prev_muted_channels: [],
    newly_muted_channels: [],
    newly_unmuted_channels: [],
    highlight_words: null,
    highlight_words_regex: null,
    everyone_regex: /<!everyone\b/,
    channel_regex: /<!channel\b/,
    group_regex: /<!group\b/,
    here_regex: /<!here\b/,
    you_regex: null,
    your_user_group_regex: {},
    channel_id_prefixes: ["C", "G", "D"],
    channel_sort: "alphabetical",
    inline_attachments: {},
    inline_imgs: {},
    inline_videos: {},
    inline_others: {},
    inline_audios: {},
    expandable_state: {},
    native_video_embed_height: 320,
    native_video_embed_height_flexpane: 240,
    native_media_preload_limit_bytes: 2097152,
    is_msg_rate_limited: false,
    break_token: false,
    ms_reconnect_ms: 0,
    ms_reconnect_time: 0,
    rtm_start_throttler: 0,
    ds_reconnect_ms: 0,
    ds_reconnect_time: 0,
    rtd_start_throttler: 0,
    initial_msgs_cnt: 50,
    subsequent_msgs_cnt: 100,
    special_initial_msgs_cnt: 100,
    hard_msg_limit: 500,
    input_maxlength: 4e3,
    input_maxbytes: 16e3,
    all_unread_cnt: 0,
    all_unread_highlights_cnt: 0,
    all_unread_cnt_to_exclude: 0,
    all_unread_highlights_cnt_to_exclude: 0,
    threads_has_unreads: false,
    threads_mention_count: 0,
    c_name_in_url: "",
    flex_name_in_url: "",
    flex_extra_in_url: "",
    flex_names: ["files", "team", "search", "stars", "mentions", "details", "whats_new", "convo", "apps"],
    default_flex_name: "files",
    prefs: null,
    ui_state: null,
    input_history: null,
    input_history_index: -1,
    input_cursor_positions: {},
    last_net_send: 0,
    previewed_file_id: null,
    last_previewed_file_id: null,
    previewed_member_name: null,
    previewed_member_id: null,
    last_previewed_member_id: null,
    previewed_user_group_id: null,
    last_previewed_user_group_id: null,
    channel_name_max_length: 21,
    channel_purpose_max_length: 250,
    channel_topic_max_length: 250,
    upload_file_size_limit_bytes: 1073741824,
    model_ob_id_length: 9,
    msg_activity_interval: 5,
    msg_preview_showing: false,
    archive_view_is_showing: false,
    menu_is_showing: false,
    overlay_is_showing: false,
    unread_view_is_showing: false,
    threads_view_is_showing: false,
    app_space_view_is_showing: false,
    seen_onboarding_this_session: false,
    seen_welcome_2: true,
    showing_welcome_2: false,
    cancelled_welcome_2_this_session: false,
    show_inline_img_size_pref_reminder: false,
    shown_inline_img_size_pref_reminder_once: false,
    last_key_down_e: null,
    group_prefix: "",
    ms_conn_log: [],
    ds_conn_log: [],
    mac_ssb_version: TSSSB.env.mac_ssb_version,
    mac_ssb_version_minor: TSSSB.env.mac_ssb_version_minor,
    mac_ssb_build: TSSSB.env.mac_ssb_build,
    win_ssb_version: TSSSB.env.win_ssb_version,
    win_ssb_version_minor: TSSSB.env.win_ssb_version_minor,
    lin_ssb_version: TSSSB.env.lin_ssb_version,
    lin_ssb_version_minor: TSSSB.env.lin_ssb_version_minor,
    desktop_app_version: TSSSB.env.desktop_app_version,
    supports_downloads: false,
    supports_spaces_in_windows: false,
    supports_growl_subtitle: false,
    supports_voice_calls: false,
    supports_video_calls: false,
    supports_screen_sharing: false,
    supports_screenhero: false,
    supports_mmap_minipanel_calls: false,
    supports_user_bot_caching: false,
    active_file_list_filter: "all",
    active_file_list_member_filter: "all",
    file_list_types: null,
    shift_key_pressed: false,
    insert_key_pressed: false,
    alt_key_pressed: false,
    join_leave_subtypes: ["channel_leave", "channel_join", "group_leave", "group_join"],
    file_list_type_map: {
      all: TS.i18n.t("All File Types", "model")(),
      posts: TS.i18n.t("Posts", "model")(),
      spaces: TS.i18n.t("Posts", "model")(),
      arugula: "Arugula",
      snippets: TS.i18n.t("Snippets", "model")(),
      emails: TS.i18n.t("Emails", "model")(),
      images: TS.i18n.t("Images", "model")(),
      videos: TS.i18n.t("Videos", "model")(),
      pdfs: TS.i18n.t("PDF Files", "model")(),
      gdocs: TS.i18n.t("Google Docs", "model")()
    },
    marked_reasons: {
      viewed: "viewed",
      left: "left",
      esc: "esc",
      esc_all: "esc_all",
      closed: "closed",
      muted: "muted",
      back: "back",
      sent: "sent",
      clicked: "clicked",
      deleted: "deleted",
      none_qualify: "none_qualify"
    },
    welcome_model_ob: {},
    change_channels_when_offline: true,
    ampersands_are_inconsistent_in_from_urls: true,
    ui: {
      cached_file_preview_scroller_rect: null,
      cached_msgs_scroller_rect: null,
      cached_msgs_scroll_result: null,
      cached_search_scroller_rect: null,
      cached_channels_scroller_rect: null,
      cached_archives_scroller_rect: null,
      cached_archive_scroll_result: null,
      cached_convo_scroller_rect: null,
      cached_unread_scroller_rect: null,
      cached_threads_scroller_rect: null,
      is_window_focused: !!(document.hasFocus && document.hasFocus() && window.macgap_is_in_active_space),
      msgs_are_auto_scrolling: false,
      is_mouse_down: false,
      last_flex_extra: null,
      active_tab_id: null,
      active_tab_ts: null,
      debug_channel_lists: true,
      last_top_msg: null
    },
    client: {
      reads: [],
      last_user_active_timestamp: new Date
    },
    data_urls: {
      app_icon_32px_green: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2lJREFUeNqMVk1vGkEMndmu4MLmkOWQoCqkh0APqAdUVNpKiXLux/+tFKlSDlEitcm15RI4BBBiucCFjdDUs571eL1L1EEC450d28/P9ujvH7+qbBljFFtaa9SgAN9ij9Xnb/LNdBrKIUn0rNKGKi1vvkpPQqi0syYiIBvlN7lt2kM7C6ErE2gr6BfcpCXO4mg4AURlCg6ZHCIrGuk1Kckp/q20P13u1NknW4E7VMkAreE8ONTLEA0Lpep0jDvgSReZIGRQbkSNuBnT0+ggOowP0X3uB0cC1qvu6453Te8lT3/Qv7i8SLfpbDrDN4efh4MPg91ut1gsMBprqYSEY1EledA1fNo+bcN3kiS0HzVgz7pMwGrJhRBs5glS+EuVQbkDZKIoAmHyOEEP2m/s6WmaJsnKRZ5XoijJkIrAWtKG8sP5dNw6ds46Puhmswni+HFsmclKnZe9M0BmiXD4uFavdbod3ERC713PRZDhA2GhJlkmmBuOj0vkt+EXbhl5BnY6bzvDT0P1f+v25nb0Z8SZ6rikMwO51gcGf8G7xkEDNtRqtfPLc1Be/7zebreYkv77PghXP65g5ypZWT3RP3ufjIWeOb6A7LPNZrNerymfIE/GE4wSKgAZNX2aenIrhwF5jzZCOpg3Ly4jf1bIlozsWF+zpxmxQ+liN81UWBaBMrIjOhpoZwkpBGl0hW0U1vNmvXGFooycHMbHFJY7OO4jwqAB6BOkieMYM9GrW818Oge4CuzUDCIqcW4GDsU00iKm0jrrnqFw/+t+uVxyHhZA9jRlZuAvOg5wgyXI8N3NHb55cnoCxgCxh98P6A1gBR/uIkc7LGQ4xx0WFA4lAEAAwuA76Ph85jR82ogJmje7whD37RBfOGodYYaJ4GgSMKFZW25BHiiVzwMaOx47KLF6DfPpupAxkFioO99Eiye6GhYRFEZYcdi2Wi0sMYCYJwYCek6fOdC+GRt5zQmlC8wSdGNgiG3RxlX46O8ITfojlBHDkuLwzU7cscr1LLqhd5y3hfK8Iogq7lLZ8jZK9zU+9co3KK4P+LnCca9nG8T9RedLXBL8tUUMIGwvojXtc99dthiqLnoWViADNHvvAGL2uROVFtcykZjwhZdFcAJc6TjbwTEM3QAq3lP40VSThRxU3U0rgf0nwADpJQebhAz3/AAAAABJRU5ErkJggg==",
      app_icon_32px_green_unreads: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4JJREFUeNqMVj1MFEEUntlsx1FzQgmXnI13JGA0XIWJmvgTEzAxBhXbw0Rjg4VWamFLIjWGUkwgFoIFNkAhJN5VHGEpMVBz1OPbfW/evJldyc1d9t7Nzrzf7/3o+9fvqmwZY5RYWmvcQQKewZl0396Uh5kb0jFT/K5QhsotJ75on4lYaZIWWMAy8jelbD7DJz3TlYl0SugL1OQV8JLeIAJIZTyFjHVRSppQa95kpeRTacc9PKmzT7YiYqpCA1PB1jjcD000wpQi7mh3JIMeRII9k8eYp4oyUg/pCVix5zJdAFAg+kp98x/f1Mbr3bPu45uPkN3aznd4tndb716+ZT+z7nw3QhTltaMLGa+JGw3gjuzw/JWxGp7s6y+lKiM7Gwp2XWoByLQBUvjLmcEXRqojyK4FArIzvNPea1G8tZZ3WemYzUklaWejxFNtrE7sMgvg05hskMjfLSVSXaY9CQhcJiMGXAYGB4AoD5VxZ2KygRYPWwtGqpVKtQI735ZXgiyhQN67dkdKplAbNf3k4dPmM9XbSjrJ6+evJFIJSzrLA7trI5N5CXXvcW1vbiltPSrSIs0VsCBwnKEkpUjMzb+49eA2EIufPq+v/oBjUzPTaNyXxSXwDOqbL7pUTW0KK1m8JM3uTg4SxG5tnDB6+veUqoBWQT5hqOAZKRNWRFIkMxlSjBGZ7B8i2J3IziGKDDsHwT79G+crOPG9XIG/jnsnwVwr9Zfgi5vloUvwPeokkOEeOrVIWOhoaIvMZ+D1fuFDjxHm+uFSSjg5MlzDtSvUAO3eIXRyfBIEkksnJZos8Sh8ZfkrhBSI2eYsehwAc3RwBMTUzBT6CvDT3mvDmfOzrqxCxu+Asd/EDQOitftHxnNjdb3bPYdLzfk5wv6vrWQ/8Qq1bNS2vsZeERWRAHq4OsxOAEdjhMuDZQuqpKCRcA5bvMZeC/ObbX181CuZWtevjrqq52tNrHMZF8ms81ouVIuhAcYoZjjXD6jbdIUbgHEhlO06LmxhqALwPTleAv9AqcFXP9c20Hs7m9uyqJFOHGqR2Ronu8KZR3g21bZwCAumIzEREPqjoDbJHHH7/3EjR5hfSYy4RPPGN+VyJGh+8qScnaQRqB/PWPA3Cg00xTOAlOFxVDoYyyRS0yBfcDkwzjk3531vBDZezYjxV1nMkY2y//DMI2NQNJsWOvafAAMAxE3MJSrFyPAAAAAASUVORK5CYII=",
      app_icon_32px_green_mentions: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABExJREFUeNqkVktsG0UYnpl9OF6/4JDYaWirNrFIgTbvNEilByS4FHogQeJQoCcOidQjiF6LBGcEnIs4cABBKZeUQw+IQkUicFDVJo0TJ0gtSW2paWLHr90d/t2ZnZ11TBubie3Mzu7+3//9b3z2xdeQuyilKLhMy6yb8KmVq+VLPT0j0RhqfakgF2MMO/YrlnfOYa098PsFQJjLamBA3SVQdyyrPQCCHdWbMJCx4PtPrdYmA64+osgjIJA4MMKEkFy10iYDLgv5QoWtYA+i4Qc+i+Xy/wJgPBo9QZ0PcWHyprVU3m3LyZJXGQ0B46huExAfiUSmzk2VCg/R3VzrDHCTDGBsYKMQomAyOjH63InnN48e3ia4nSjypLJ48fHYLeDR198XiUY6nk5cteotA/iJxv48T7gWc6yvEGVodCgWi8UT8av37y+36AlVeJgpDtEqwvTUy6e6urtM0zx45NDWw61EIv7C8MB3j7YvVMwwwi07WbiXZcTU22++M/0uXAFAtVI1IkY8kXjjrcnNjc3fF7On/7qD6b4BuPpSPgNG8kCSPQEm0jTNMAxAqtfr8M2nj96s1k4urZJ9FCj8+sQZBiAsQxHnz4w2/f7MK2dfrdVqn3/y2eyPs6ZVP/nSxND4sLq6NvLHrfiTbEXEA9Rb2NszQn3H0uBqILGeW9cUVVXUkfGRzmQnerbv43plfmf7SSZyFRYkRBF1vI0wRCfEKJwAxtrdHPyqSD0+fBxMpev631vbF/P5gXD4vVR3Omw8LorkngPSHbnH0nAJ0tlJdjE7MDYIJx1GONWdKpV29ZD+zKGDncmulbX1mdzqoGGMRaKnE08ldT3gA+hoTFk5n0HWpU8/aqza7rJtm8VVpVIpl3aLpVLhQeHihQ/h3LJNeKBH06KKciQUUjGGa5XLxTzT2GW6P90kHljxUBSnymKiqqquaaFwR2Gz0KGHbGpblgYK5Kn9wLRzZpnFixpoyJ4zvv3qm+xSFjbnp8/3ulb68ovLK0srsJk8N3lidABr+MrX3y/ML0DfLj7a0VTNIUdseMB2Mwl7MtVAlrm2YpeZuT9BASYd1rUrs8ViCV6a/mCGUbn582/Lt5eZQhBaTEvgwaIGds4tTIOZLHkC9r39vWy/cW+juFOETTQWTR1IcbffyTIkpylRN/wwJRD3DIBwk6h+FdozXgyODbHNwnyGnQ+OeydzGT/tRfOgvPo6ogi/RURoikcFiWQPrxYQo8xjon5k5jKiqPDXpXxiZvZ94LewIBuQu3HvMtjnxvVf2K2ffrjGrPfr9RtckNxCvNEBS/UDs8lOToK9eIiPYLTpfNYwi3gFjY8pBAXflPu+f/4fZhSjgrjV0A0DHU0gixdkiXIUyPpSRGUSckfhg08jQdp8BpAxAhIRlj0n93Ze7B7zcgM537h7rO8mqTxp+jZU2X/kxZxcsQPAXq/2WneAVmDUDBr2XwEGADZFpKJDFtSPAAAAAElFTkSuQmCC",
      app_icon_32px_yellow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA6VJREFUeNp8Vr1PVEEQn3m+Ais+TOQ4TCCeARMxRyESC6EwkUIDpf530kqnJVZqZayMFBI5wpGAYMEdDZzR3Dqzszs7b+9gL7k3b97sfP5mdnH9yUvwyzkHZiGicISg/0yG+XGnFVZtQpdK6behNmBgJfPD+EqUgMFaFoHaGNxpbauMSlZCB1cgE3iNm7oyXTYbgSASXMUhF1PEpMu9VqY6Zf8Bk/ZcEv3PryIohTxANhyDE34eojOhDNMucRe26FklNDNCj4/CdC3pnxjD+mRw3/phM0HrxvydueQaXgmetVX3eqPf60GrLRtxY63/4pn7+w8Oj1CiYUsDmQgoGgoecU2+Lswz/+gEVN5zcL/tXdbEYo6FkmzGAoE8tTO0dpSZ8TEmdnaDgwvz/HrZg6NT3ib67F51ukiNJr9YCV+usO7OsHTrAAMeEKdrrHfnB2uCak9k+SjVrAJO7N0cgaVmwPXjZqjP02XnI+5LxibGiMM5o9S12i7rkliDgdkgSh/eh+erfUi5w8asa8yC0ML3HH59t42ttnE0ZpuI0uAXbXl/HsCbLepzDuXVOou/fV9cXPKueo1AxbY3tyjD8Os3Xlya5mKkpimZIsDUQPytew6drov1xE6XKyw+3hpn/vEJ7h3ITielCc0EaVzQW6mKhxaKaI8f59ESwD51m01STsIkT3Mg6vEsaYtCuzzlR3CFYf89zjtSGQO0XOjns25sFHD5yRFgH1OUTXCRW1kmMU50w2N0YhQJQiJWr3EE9RqujPAm6u3jU9M9Jt2cIm1xa6YxQxBysSK8lhbB5NZzmoIx2P5YUHzqfna6lGn2IqiZ/UPc3GL21CRPoU6XgSguPphzS4sM/A+fCu8NnJ1DVkjbz2WlwjHvtChwHwqDYq/NgJE9j5reg8ixp012gsqnonqIm1ntaSnA8Yk0ecien3pOz1oFSLDHuEpIKSqdbCpBNLVYnQGDFIG4RPi5yYXloa2TMY0A6eEsgsGjVZ3yAKUCQOc88L37VADs/al4nVS7VG3Ba5m7YEpE05gQ8n03jnGAr99YA5lMZQSXHZZqLA277I6lNqiMYRjET+T45y8QnDNDLUQfzw/b2eXgzUejSSAZuK/ZsTh4g7L8wurNBlHiG4Hs/hLPJMwuCenaUmnxeOBko+kq98Nlq4oOPVGEU+QBuivvANnZFzQCZtcywMpMKa/ZnAWXJTd33EjYHJbyhOo9xarWu2WlBsPupkMT+1+AAQCmPwV2bobFnwAAAABJRU5ErkJggg==",
      app_icon_32px_yellow_unreads: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1hJREFUeNqMVr1PFUEQn9lcIc+ORylHB9gBNpLY+dEISKWhNHYWdhb+FRaa+CeYWJnYKVoJdAiVQMc7Oh90go1vnX2zOzs7dxj2JXfz9mbne36zuLa8AuPlvQe1EJF3mKCn4Qn76aRmFmlMV0LJt04d0FpZfde+EBVg1GY8EB3tk1q38Ahn4Tp4h4HA/5gpy8jS0YgEkeALg3wKUSC9tVo2xSj9BMzSLSeOf+PlolCwDgbFyTnety565UqXdPbb6aSbTEhk2jVWmAJe26EjQasqQoYdBUrExDX/7Kmfnx2dX8DLV47FvX39l54HR/jmHUqcxXY5G6uos3jYNPq6tEjSA8/BITL/3Gzk7PUCH4g3aGuhohMpQcBv6QzJ3fR0FHd4FHnqaZ92MOYbUZ8Vo11uNP6lTIwjFhebLx7QztJiVPnzIJtv+oNXZUKmM3ZrwU9Ohs2pfuReXGDOUX0jSqlrmKmDNV++2i5JOWgVBoflwT14tDIyuVlf9QCFgetjnsEJkoJsaIo2EU7Vb9TMldDvdyDHZWv3B3Do2Expi9Arq7cfarwELgpV+xtP/J3lQLz/4L5vh2P373p27uMnMhzZ3jboxipKLQydiSJaCqY5ifg1l3J+dparw/QTFyc9XXZHyp8NGbtMLSb5PB5E/BKVx01UaSdHLPvwt2ojeJRbh78ia9AgN9f1nu9NRGOpuqb6vmmQOlwHWRwKGaWJxr7o+iVZL56PrphhwQ+pIh1k5wXDMQP1TH31CoLhEE0iBTpzHwjEs/LPmxQT0g3razEHVDDNSThAJcSNTfVDSEc8FxcZVPQEtY2m4XAMk+GYZHhrG8//BJzbeJxqfx8HA3HaFqjgqys6WWWC6Dph3PA0BJpOU3qnUgOSdCNRAL/woBhh5bCdn4PkTdy/OV+CqAZOhodWxznddcXIhWxs08QOZ+wLIHqYZ0YeZJinZpGD9ghjEwYN/Bri6Sns7kUM396hkI6I3tsvQC3aJKlWkaraNx8J6NaOS+5Hnt/nfvObM1OvfYPS+85gk+6RvH9JGKXe5ZOuETvRRLMcMMNPc+q7k0ZGPVF4x1kH/aV3ADP7ZHiYa1meNiYH7cPGORNca7ji0DGs+A3lPaWYP3Ln0Tnoupt2BvafAAMA603M1k3efM4AAAAASUVORK5CYII=",
      app_icon_32px_yellow_mentions: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABBhJREFUeNqkVk1vG0UYfudj/bExbWo3kJLaKRWO3aaooIoKOMCBDwlBI06F/oEeQOIHcIU7N34CEieQekMIkBDtBaEgDk1aRIgdRGiSpqSpN1nvzPDOzuzurO2SxozX69lZz/vM836ThRffhngopSA/IhH1I7zCYD/4eGbmQuUxOPzgKJcQgjNzT0eybmHFEPyjAgCxsgYYqHikqPeFGA+AEn30EQxcLPz+FYZjMrDHBwUJgRTJAgOhlK7s743JwMqCTGiqK5yjaLzhtRQE/wvA8Bi0hNIXjWE2IrEc9MYHsFaN1ZTC6KPjl1K/RBbepJv1u2MBkBERYNjghFHKCD13lj59mv4xtf0PhON4USLV+EuGZ14hh0ad+WVWrNAvg/VDA2SBZj6JJTRMrH1G2ZkWmZjglQq/dmfn9iEtwVon54adx0wuPAfzZ+WpWTh/DqRUeG3dVUti5yI95hF6aIBMdHx74zW4clm256DVNHrT+ntyWvnV/hrsNnePZbo90Ivs8RMMs7NWs4QoBY+TcolVfH7kiDc5Wdid3vt2alXAI2UncumFtwxAqhllOVhrv/eueumi7Efy8y/ghxtRJPrPzIft5r7/d/GVtVNHqXewm7rZTSMlc0Noto4kCOd0fZ16jHPG59terVoIZ8JPdn/76f7OQdk0PnBKIk2iqHNcLpdU46TGYpSs/YlOhRt4q6n6EXge6T4QH213zpfLV6dPNMv+QwAcx09PreU29GOjblZgtUNacwhPSyU1VeO9PVLw6InHRXWS3V7vf7Dy+7O+//xE5eWjk08UCjkbYEUzh3XjuTUHH74vB7N2/F5IJSIVhnI/FMGe7AXR9rb49DN0YilkhEJmPK/C2FPFIicEn7mVS2ykmcfZxih/0ElF64pwncEZJx6XxQK9d0+VCjpOhPCUkhtK3onkShQYf+G5gpwY4+tvoNPFIId3FrQN8M1X10h3TfvD668qjAw0+3ffw81lJoR80FOIhLsk1aRlnDRJIpO7Cc7oyjwu3dIHMNJx/HidoN5x05XLlsrir3R1Fd1B64AzaU6JPIzX4EwLJIrnlOBYAuf1up1vbkEvZuyX4XjNmr3TsZGvi5KK3Y8oin5vAKhVCU+z0HB70W5Bwsaun2lbyOVb2T+z4qFs9tWiqH1FU9dM/5qSOJ5ki27XRni1alduLidbkhrlxpNRc2aDrITl2XS6sLFJtrbg50Wbw6/fwNwlcb74SyLILSFJ6+DmQWI6OzcIhvHAtmBqZH82kOSThGbbFAr5nW5hyNYfosa0VUhfDVTDXEVLkdMNrkTXC9zzKlAuCZvNwGl8Bgmq0T2Ai5GTCMS1nFvbbbL7j80D5DLlDmk/DlK308x0yM0vJD7nZuwcMKicDfK0cq1mXrH/CjAAfjaCPa5V5tYAAAAASUVORK5CYII=",
      app_icon_32px_red: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2pJREFUeNp8Vr13EzEMly5uQl+nlKnpRrtRNsp7DO1Ilz5W/gZW/iG6MrLCyMhIN9JsKVvDlH7dRdiWLcu6K27fxaeTrY/fT7Lx/dtziIOIQA1EZAlP/NPoBHleqZVlN547mcm3QRvQG8X8kFwmDjBZMxGIjf5KbVt0RLMKHajBMMH/uCnD7KWzkSZ+ClQ5RDlFYUrWaxGKU/oJWHa3mhj/4mjSpmADDIZzcCy3IZIKZWh3jrvRoBskJDM8nzawPyr7745w1iT3tR86E3401XZAg+Txr2fP4NMOHbmy8t2EPu7Aybj4J1mWHPiRWDRIHnaNv/LWyw2IPksWm6AHkli0XHA+Xxkg4F+pDMFu38E0hnr5mDw42grPW4JlF5bxfnqtOO2kCIIlJMFH8+lFzPVVK3zACAYFewFV1NVa/GMDJYNUIbaNcDxOlt6Mk7bPOGtyfnYbOJkE7WXnzZOpklzJvd7AaXm1FWDUXw9c+AdVSlESXr/e4VUEVZiatDAayFLU8P5u6fM6ZMOH8mE7qH+5xXV0ajbCs2j7Yh3w+7PB9UYVV2BqYWOJAEsBhW9/CVatnxLjudrAZcsJx+cR8OsO5i1DRQxNKiYVo39zsrFuXno+jQgHgub+tRcNeMyFHYB1N42iACf4QiPbERMNMK0/jNW7bHNhU6rnm00uFCB7ciTa5xSZDs56p5MUx4EQJnNpFg3MHJ5yKB36dFXsRJUidoGtiRm/qaHQ8dh28uOtpPDtHpctifvmdHGl9yKImUWHF+sg3hvR2SQg7InIfrx05I154n+/T3y7iRQyXUiy7SqEc9798IHHUAIp5h3Ocx29jqEsskTaWGmU9Qno6kOchBC84GAUntctpQLzJhnzjuSs7begkiigpqpkhQSXGOM575JLnj/bmDgqnbG0ACLL19BN9RFWH7aHMT8egFWmMrcKD8Bd7AZV4+QCI3vNcdYFZcl3Y8+QX4+pnfvHz4egsiKVE31GCU2wxsDcscSGh3HeVn3wDvHHAx+uoJtaCiKfH7qyXf/mI9EUOvfua7ot9m9QWt7ofU0jKnKlYO4vmIe5JJRrizmAuL2Y1vSU++mypTqjPlFY0tgA6ck7gDn70o6A5loGul9rDPqLTXAmudZxpaFz6PgX6nuK3lpqssJg6G46mNh/AgwA1LYLPz5hMyUAAAAASUVORK5CYII=",
      app_icon_32px_red_unreads: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAzFJREFUeNqMVr1zUzEMlxyHtincsdDOyUo6Aytz6Qoz3HVk5y/gr6ATQ2dgBWZYKWvDDAsDaZvmJUZ+smVZ77UXp5e4sqyPn76MR08OoV0hBFALEZnCG/o2PJGeb2pmkcZ7Lzs569UBnVXU99Fl4wGTNuOB6Oje1LqFRzgr1yE4jBu8xUxZRpZGI21oC6EyKGSI4jZYq4UoRulvwCLdcmL7aZdLQsE6GBVn55huXQzKlT7p7LfTQTeREGS6OVaZAkHboZGg5SvIsCdBaTOC8PoeTH2YBzj+mwx/fz8enS3h7RwEZ7Fd7qYs6k0eNo1OH90h6cDimH86TJy7LvKBeIM2FzzpzAEC/pXKkNiNs59nTeIZDxSF442o74rRrhQaf3IkWsTSmoqC1gOikE+KUtWEwcMbyHTEHg/hgYvEvZQKQHLZY/FgPMDJIHr18SqYKskx6CQGw3K0jc93bGxe7ABAqCnx39mKFChDM9q0cSp/k2bOBLZ9w/XtOkHHZkpZxEou5pcCimcnl/DuIjK+GsHTrUg/ucDPi2jjsy1g504vo+FsrzRdVD62dYC2l5lGNvZpTzhwsj/MVv1ZR2mqL5R64lDRtyvuSPpzXrUuj1Q8z5sUIMna81WqLzs5UtrHf323g7Pcia+yhczn4trF+Mdr3+G+oyOc6+pRcEfEaKKxLzp/Sdabu5tGWPqHZJEG2QXp4Vga9WSAm6fQ7zWYQErrLHUgLZ6Vf7gK5DhppsRnlChhfq3ihcPtwIVN+fOziTzzdWkqeoLaQtPtkNaPpo1nBurLAubtpZejnPtLmDWCe9WCClCQ54GMnZKggBJhAoGAptsUXmkbswaMRGn4lQfVCKuH7cEwFU1qmYgHQzCUaoKGquL4yOlpXo1c6haDUBmr+gc1UZkZZZBhmZpVDLojjE0guaeriA+1Gj76ep1K9/sSdFNLNkmoFVK++/IRQElcdj/x/FuHTws0U6/7gtJ0p+WaRlToN8Ao+S5HOkfsRBPNcsEMP82p3066M+qJwhRnHQw3vgHM7JPhYZ5lgNVM8rdcNs4ZcK3hikNj6PkX6neKFl3ePDoGfW/TXmD/CzAAcryyBfjeu1oAAAAASUVORK5CYII=",
      app_icon_32px_red_mentions: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+pJREFUeNqkVktvHEUQ7q7unp19xAkHJ6BFAhshgeI8pAgpuSAO3OLkCJw5cOEXwBX4F/yAiBMCxA1yyQWUG4kEIsoGoyiWDYg4jsc7091F9XRPT8/YkeNlPLvunUd99X1V1VX8+pV1Vh+IyLqHNrrSdJbFvPhsOr00OcGOf0iyyzmnlf+OR3M9wJoD8M8LwHiw1WOA9RFRnxizGABw5/ohDFIs+jwqywUZBPcZsoZARArAjAPAbL6/IINgi7VGo1a0JtP0ReevRfG/ADyPfiTQnVDDbGvzW7G3OECIai1ThHGu0wdgzPl7Y3i8+89CAPyQCvBsaCEABIeLA/FGJh7uPd6pykWyqLHq86XF87eIw0oGIyEHnH+9vXlsgLbQ/F8TCQdTqy9AnM/ERIolJb/9d+f3Y0YCYoR9CFK5Liu2PsCrOZ9KGAt5Qqo3c/HVo43iOEUne9LHUF/P+ftDx0IjKw1JJJakvDZWW/Py1ubs3elrrbZHMgjuN/Xs31yGQEWQFwBDQSrJk0q9oFSh57c2N55zd+LXLl/1ALGAkQXfvFwfjtg7GVbWfrmLPxSVNtUlVq6xciAHV868siTV0Wma7m4OqVl7QqvS1RqReIighJRCns+z5UFmTPnFg3u3n+wcFYPa4UgibqIUCbo8Yrgi3COE8YdllFSSybNDXmmmOGzMq0//3LgwHH704kuvD0fPDHLMnOg12V2VDoOs+wqZGbaWETzkyE4rXnCeAbyci2Wp71XVx7P7F0ejt8aTt0+eOpNlnRhQR/POpgm6ptgnk0N2bTotokYsjd23hvJ1z5i/KvP5jrHWGkt3cKrURIiVwUByykCUwS4PleZ/roqmrFNffFLVyeDKD7gCyEH8zU2eWYvWGIVot9FuaTvThfdJdhpyE4xv9nFmnEQfDJlX6UbBHhgHsZ7jWemS+fsC71ag0ewaUJKIoQXLaoq1JMGm7FRZrZX/+Yt2BbfSCPXjnD2tHaGs9U/c1vy+pnSQ9JwU1ntJPHzW0MoZ5Nit5CQStH5VhPWWZU/dEsecnYYm7Dq0PNeUsE4/jkB57wEgSCLj7n9wvDinQiTu6EDxnGK9K23ugXPYL5wpCLcgpmZ8NJJYbhjMdMiiuH/cqZpXmh6V1pMXsY1B28K6bMjuDeP0+akMt26WjhPZ+bliwVDaQprRId0HZTqtpDDeXJNd4Zldi9/NOzNHHEb6c1tzHVK7vamivf4MGeOoEG/1umGno0Xk+EJqMc2C1F9kmI45aUcJg0+fIB4+A6QYHYuMp5FLe3s/Bgdf7pHridt3vDNpthpK/581EUt37A4ww04MurQ6o2ZX2P8EGAAu1YEi4TmT9gAAAABJRU5ErkJggg=="
    },
    emoji_groups: [],
    emoji_names: [],
    emoji_map: [],
    emoji_complex_customs: null,
    emoji_menu_columns: 9,
    emoji_menu_colors: 6,
    files_url: null,
    archives_url: null,
    bots_url: null,
    team_url: null,
    dnd: {
      next_dnd_start_ts: null,
      next_dnd_end_ts: null,
      snooze_enabled: null,
      snooze_endtime: null,
      team: {},
      current_statuses: {}
    },
    frecency_jumper: {},
    typing_msg: TS.i18n.t("several people are typing", "model")(),
    pdf_viewer_enabled: true,
    onStart: function(ua) {
      ua = ua || navigator.userAgent;
      TS.model.files_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/files");
      TS.model.archives_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/archives");
      TS.model.bots_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/services");
      TS.model.team_url = TS.utility.normalizeDevHost("https://" + document.location.hostname + "/team");
      var html_classes = [];
      if (TS.model.is_safari_desktop) {
        html_classes.push("is_safari_desktop");
      }
      if (TS.model.is_electron && TS.model.is_mac && TSSSB.call("isMainWindowFrameless")) {
        html_classes.push("is_electron_mac");
      }
      if (TS.model.is_mac) html_classes.push("is_mac");
      if (TS.model.is_win) html_classes.push("is_win");
      $("html").addClass(html_classes.join(" "));
      var OSX_version = _getOSXVersion(ua);
      var legacy_mac_supports_subtitle = !TS.model.is_electron && TS.model.mac_ssb_version && TS.utility.compareSemanticVersions(TS.model.mac_ssb_version.toString(), "0.61") >= 0;
      var electron_mac_supports_subtitle = TS.model.is_electron && TS.model.mac_ssb_version && TS.utility.compareSemanticVersions(TS.model.mac_ssb_version.toString(), "2.2") >= 0;
      TS.model.supports_growl_subtitle = (legacy_mac_supports_subtitle || electron_mac_supports_subtitle) && TS.utility.compareSemanticVersions(OSX_version, "10.7") > 0;
      var dialog_is_showing = false;
      Object.defineProperty(TS.model, "dialog_is_showing", {
        get: function() {
          return dialog_is_showing;
        },
        set: function(new_value) {
          dialog_is_showing = new_value;
          TSSSB.call("dialogIsShowing", new_value);
        },
        enumerable: true,
        configurable: true
      });
      TS.model.supports_voice_calls = false;
      if (window.winssb) {
        TS.model.supports_voice_calls = !!(winssb.screenhero || winssb.calls);
        if (TS.model.win_ssb_version && TS.model.win_ssb_version < 2) TS.model.supports_voice_calls = false;
      } else if (window.macgap) {
        TS.model.supports_voice_calls = !!(macgap.screenhero || macgap.calls);
        if (TS.model.mac_ssb_version < 2) TS.model.supports_voice_calls = false;
      } else if (TS.model.is_chrome_desktop) {
        TS.model.supports_voice_calls = true;
      }
      TS.model.supports_video_calls = false;
      TS.model.supports_screen_sharing = false;
      TS.model.supports_screenhero = false;
      TS.model.supports_mmap_minipanel_calls = false;
      if (window.winssb && !TS.model.is_lin) {
        if (winssb.calls && winssb.calls.requestCapabilities) {
          var capabilities = winssb.calls.requestCapabilities();
          if (capabilities) {
            if (capabilities.supports_video) TS.model.supports_video_calls = true;
            if (capabilities.supports_screen_sharing && winssb.stats && winssb.stats.getDisplayInformation) TS.model.supports_screen_sharing = true;
            if (capabilities.supports_screenhero && !capabilities.is_mas && !capabilities.is_ws) TS.model.supports_screenhero = true;
            if (capabilities.supports_mmap_minipanel) TS.model.supports_mmap_minipanel_calls = true;
            TS.model.is_mas_or_ws = capabilities.is_mas || capabilities.is_ws;
          }
        }
      } else if (TS.model.is_chrome_desktop) {
        TS.model.supports_video_calls = true;
      }
      if (!TS.model.supports_user_bot_caching) {
        TS.storage.cleanOutCacheTsStorage();
      }
      TS.model.supports_spaces_in_windows = false;
      if (window.macgap && macgap.window && macgap.window.list) {
        if (window.WebKitMutationObserver || window.MutationObserver) {
          TS.model.supports_spaces_in_windows = true;
        }
      } else if (window.winssb && winssb.window && winssb.window.list) {
        TS.model.supports_spaces_in_windows = true;
      }
      if (TS.boot_data.special_flex_panes) {
        _.forOwn(TS.boot_data.special_flex_panes, function(special) {
          TS.model.flex_names.push(special.flex_name);
        });
      }
      TS.model.expandable_state = TS.storage.fetchExpandableState();
    },
    makeYouRegex: function() {
      var self = TS.model.user;
      if (self) {
        TS.model.you_regex = new RegExp("<@(" + self.id + "|" + self.name + ")\\b");
      }
    },
    addProfilingKeyTime: function(name, ms) {
      if (!ms || !name) {
        return;
      }
      if (!TS.model.profiling_key_times) {
        TS.model.profiling_key_times = [];
      }
      TS.model.profiling_key_times.push({
        name: name,
        ms: ms
      });
    },
    incrementUnknownIdHandled: function(id) {
      _unknown_ids_handled[id] = _unknown_ids_handled[id] || {
        tries: 0,
        state: 0
      };
      var ob = _unknown_ids_handled[id];
      ob.tries += 1;
      ob.state = 0;
      if (ob.tries > 2) {
        TS.maybeError(48, 'calling the API for id: "' + id + '", try #' + ob.tries);
      } else if (ob.tries > 1) {
        TS.maybeWarn(48, 'calling the API for id: "' + id + '", try #' + ob.tries);
      } else {
        TS.log(48, 'calling the API for id: "' + id + '", try #' + ob.tries);
      }
      return ob.tries;
    },
    reportResultOfUnknownIdHandled: function(id, success) {
      var ob = _unknown_ids_handled[id];
      if (!ob) return;
      ob.state = success ? 1 : -1;
      if (ob.state == 1) {
        TS.log(48, 'API call for id: "' + id + '" SUCCEEDED, try #' + ob.tries);
      } else {
        TS.maybeWarn(48, 'API call for id: "' + id + '" FAILED, try #' + ob.tries);
      }
    },
    logUnknownIdsHandled: function(min_tries, state) {
      var log_ob = _getUnknownIdsHandledLogOb(min_tries, state);
      TS.info("_unknown_ids_handled: " + JSON.stringify(log_ob, null, 2));
    },
    getUnknownIdsHandled: function(min_tries, state) {
      return _getUnknownIdsHandledLogOb(min_tries, state);
    },
    test: function() {
      return {
        getOSXVersion: _getOSXVersion,
        isWin7Plus: _isWin7Plus,
        sniffUserAgent: _sniffUserAgent
      };
    },
    getBroadcastKeywordById: function(id) {
      var bk = _.find(TS.model.BROADCAST_KEYWORDS, {
        id: id
      });
      if (!bk) {
        TS.warn("no broadcast_keyword ob found for " + id);
        return;
      }
      return bk;
    },
    getViewById: function(id) {
      var view = _.find(TS.model.NAMED_VIEWS, {
        id: id
      });
      if (!view) {
        TS.warn("no view ob found for " + id);
        return;
      }
      return view;
    },
    isMac: function() {
      return TS.model.is_mac;
    },
    getUserModel: function() {
      return TS.model.user;
    },
    getUserPrefs: function() {
      return TS.model.prefs;
    }
  });
  _.merge(TS.model, _sniffUserAgent(navigator.userAgent));
  var _unknown_ids_handled = {};
  var _unknown_ids_handled_states = [-1, 0, 1];
  var _getUnknownIdsHandledLogOb = function(min_tries, state) {
    min_tries = parseInt(min_tries, 10) || 1;
    state = _.includes(_unknown_ids_handled_states, state) ? state : "any";
    var obs = {};
    Object.keys(_unknown_ids_handled).forEach(function(id) {
      var ob = _unknown_ids_handled[id];
      if (min_tries > ob.tries) return;
      if (state !== "any" && ob.state != state) return;
      obs[id] = _unknown_ids_handled[id];
    });
    return {
      state: state,
      min_tries: min_tries,
      count: Object.keys(obs).length,
      obs: obs
    };
  };

  function _isWin7Plus(ua) {
    var matches = ua.match(/Windows NT ([0-9]+\.[0-9]+)\b/);
    if (!matches || matches.length < 2) return false;
    return parseInt(matches[1], 10) >= 6;
  }

  function _getOSXVersion(ua) {
    var matches = ua.match(/(?:Mac OS X )([0-9][0-9]_[0-9]+)(_[0-9])?/);
    if (!matches) matches = ua.match(/(?:Mac OS X )([0-9][0-9]\.[0-9]+)(\.[0-9])?/);
    if (!matches || !matches[1]) return 0;
    return matches[1].replace("_", ".");
  }

  function _sniffUserAgent(ua) {
    var is_mac = /(OS X)/g.test(ua);
    var is_win = ua.indexOf("Windows") !== -1;
    var is_win_64 = /(WOW64|Win64)/g.test(ua);
    var is_lin = ua.indexOf("Linux") !== -1;
    var is_iOS = /(iPad|iPhone|iPod)/g.test(ua);
    var is_android = /(Android)/g.test(ua);
    var is_edge = /(Edge)/g.test(ua);
    var is_chrome = /(Chrome)/g.test(ua) && !is_edge;
    var is_chrome_mobile = is_chrome && (is_iOS || is_android);
    var is_our_app = /(Slack)/g.test(ua);
    var is_IE = /(MSIE|Trident)/g.test(ua);
    var is_FF = /(Firefox)/g.test(ua);
    var is_safari = /(Safari)/g.test(ua);
    var is_electron = /(AtomShell)/g.test(ua);
    var is_old_ie = /(MSIE)/g.test(ua);
    return {
      is_iOS: is_iOS,
      is_IE: is_IE,
      is_FF: is_FF,
      is_edge: is_edge,
      is_chrome_desktop: is_chrome && !is_chrome_mobile && !is_our_app,
      is_chrome_mobile: is_chrome_mobile,
      is_safari_desktop: is_safari && !is_chrome && is_mac && !is_iOS,
      is_mac: is_mac,
      mac_version: _getOSXVersion(ua) || undefined,
      is_win: is_win,
      is_win_64: is_win_64,
      is_win_7_plus: _isWin7Plus(ua),
      is_lin: is_lin,
      is_our_app: is_our_app,
      is_electron: is_electron,
      is_old_ie: is_old_ie
    };
  }
})();
(function() {
  "use strict";
  TS.registerModule("environment", {
    is_apple_webkit: false,
    is_dev: false,
    is_macgap: false,
    is_retina: false,
    retina_changed_sig: new signals.Signal,
    supports_sticky_position: false,
    supports_custom_scrollbar: false,
    slim_scrollbar: false,
    supports_flexbox: false,
    supports_line_clamp: false,
    supports_intersection_observer: false,
    onStart: function() {
      _initialSetup();
      _decoratePageWithSupport();
      _bindEvents();
    },
    isSSBAndAtLeastVersion: function(version_string) {
      if (!TS.model.is_our_app) return false;
      var components = version_string.split(".");
      var version = {
        major: 0,
        minor: 0
      };
      var ssb_version = {
        major: 0,
        minor: 0
      };
      if (components.length > 2) version.minor = parseFloat(components.pop());
      version.major = parseFloat(components.join("."));
      if (TS.model.mac_ssb_version) {
        ssb_version.major = TS.model.mac_ssb_version;
        ssb_version.minor = TS.model.mac_ssb_version_minor;
      } else if (TS.model.win_ssb_version) {
        ssb_version.major = TS.model.win_ssb_version;
        ssb_version.minor = TS.model.win_ssb_version_minor;
      } else if (TS.model.lin_ssb_version) {
        ssb_version.major = TS.model.lin_ssb_version;
        ssb_version.minor = TS.model.lin_ssb_version_minor;
      }
      return TS.utility.compareVersions(ssb_version, version) >= 0;
    },
    test: function() {
      var test_object = {
        _decoratePageWithSupport: _decoratePageWithSupport,
        _initialSetup: _initialSetup
      };
      Object.defineProperty(test_object, "cssPropertySupported", {
        get: function() {
          return _cssPropertySupported;
        },
        set: function(v) {
          _cssPropertySupported = v;
        }
      });
      Object.defineProperty(test_object, "cssValueSupported", {
        get: function() {
          return _cssValueSupported;
        },
        set: function(v) {
          _cssValueSupported = v;
        }
      });
      return test_object;
    }
  });
  var CSS_PREFIXES = ["-webkit-", "-moz-", "-o-", "-ms-", ""];
  var JS_PREFIXES = ["Webkit", "Moz", "O", "ms", ""];
  var CSS_PREFIX_REGEXP = new RegExp("^(-*" + CSS_PREFIXES.slice(0, CSS_PREFIXES.length - 1).join("|-*") + ")");
  var JS_PREFIX_REGEXP = new RegExp("^(" + JS_PREFIXES.slice(0, JS_PREFIXES.length - 1).join("|") + ")");

  function _isRetina() {
    return window.devicePixelRatio > 1;
  }

  function _decoratePageWithSupport() {
    var features = ["is_apple_webkit", "is_macgap", "supports_sticky_position", "supports_custom_scrollbar", "slim_scrollbar", "supports_flexbox", "supports_line_clamp"];
    var partitioned = _.partition(features, function(feature) {
      return TS.environment[feature];
    });
    var $html = $("html");
    $html.addClass(partitioned[0].join(" "));
    $html.removeClass(partitioned[1].join(" "));
  }

  function _cssPropertySupported(property) {
    if (property === "scrollbar") return _cssScrollbarSupported();
    var style = document.createElement("css_property_supported").style;
    property = property.replace(JS_PREFIX_REGEXP, "").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/([a-z\d])([A-Z])/g, "$1-$2").replace(CSS_PREFIX_REGEXP, "").toLowerCase();
    property = _.camelCase(property, "-");
    var capitalized_property = _.upperFirst(property);
    if (style[property] !== undefined) return true;
    return JS_PREFIXES.some(function(prefix) {
      return style[prefix + capitalized_property] !== undefined || style[prefix + property] !== undefined;
    });
  }

  function _cssValueSupported(property, value) {
    var test = document.createElement("css_value_supported");
    value = value.replace(CSS_PREFIX_REGEXP, "").toLowerCase();
    test.style.cssText = property + ":" + CSS_PREFIXES.join(value + ";" + property + ":") + value + ";";
    return !!test.style.length;
  }

  function _stickySetup() {
    TS.environment.supports_sticky_position = _cssValueSupported("position", "sticky");
    if (window.bowser.name === "Chrome" && parseInt(window.bowser.version, 10) < 57 && _isRetina()) {
      TS.environment.supports_sticky_position = false;
    }
  }

  function _initialSetup() {
    TS.environment.is_apple_webkit = !!(TS.model.mac_ssb_version || TS.model.is_safari_desktop);
    TS.environment.is_dev = TS.boot_data.version_ts === "dev";
    TS.environment.is_macgap = !!window.macgap;
    TS.environment.is_retina = _isRetina();
    TS.environment.supports_custom_scrollbar = _cssPropertySupported("scrollbar");
    TS.environment.slim_scrollbar = TS.environment.supports_custom_scrollbar && TS.boot_data.feature_slim_scrollbar;
    TS.environment.supports_flexbox = _cssPropertySupported("flex-wrap");
    TS.environment.supports_line_clamp = _cssPropertySupported("line-clamp");
    TS.environment.supports_intersection_observer = typeof IntersectionObserver === "function";
    _stickySetup();
  }

  function _bindEvents() {
    if (window.matchMedia) {
      var qry = "screen and (-webkit-min-device-pixel-ratio: 1.5), screen and (min--moz-device-pixel-ratio: 1.5), screen and (min-device-pixel-ratio: 1.5)";
      window.matchMedia(qry).addListener(function() {
        var old_value = TS.environment.is_retina;
        TS.environment.is_retina = _isRetina();
        if (TS.environment.is_retina === old_value) return;
        TS.info("TS.environment.is_retina changed from " + old_value + " to " + TS.environment.is_retina);
        TS.environment.retina_changed_sig.dispatch(TS.environment.is_retina);
        _stickySetup();
        _decoratePageWithSupport();
      });
    }
  }

  function _cssScrollbarSupported() {
    var test = document.createElement("div");
    test.id = "__sb";
    test.style.overflow = "scroll";
    test.style.width = "40px";
    test.style.height = "40px";
    test.style.position = "absolute";
    test.style.left = "-40px";
    test.innerHTML = "&shy;<style>#__sb::-webkit-scrollbar {width:10px;}</style>";
    document.body.appendChild(test);
    var is_css_scrollbar_supported = test.scrollWidth == 30;
    document.body.removeChild(test);
    return is_css_scrollbar_supported;
  }
})();
(function() {
  "use strict";
  TS.registerModule("clog", {
    onStart: function() {
      _pri = TS.log && TS.has_pri[_pri] ? _pri : null;
      var interval_duration_ms = 30 * 1e3;
      var interval_duration_noise_ms = 5 * 1e3;
      var noise_ms = Math.floor(Math.random() * interval_duration_noise_ms);
      setInterval(_sendDataAndEmptyQueue, interval_duration_ms + noise_ms);
      $(window).on("beforeunload pagehide", _sendDataAndEmptyQueue);
      $("body").on("click", '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', _onClick);
      _fetchModelValues();
    },
    setUser: function(id) {
      _user_id = id;
    },
    setTeam: function(id) {
      _team_id = id;
    },
    setEnterprise: function(id) {
      _enterprise_id = id;
    },
    toggleDebugMode: function() {
      _is_debug_mode = !_is_debug_mode;
      return _is_debug_mode;
    },
    track: function(event, args) {
      _recordLog(event, args);
    },
    trackClick: function(selector, event, args) {
      $(selector).on("click", function() {
        _recordLog(event, args);
      });
    },
    trackForm: function(selector, event, args) {
      $(selector).on("submit", function() {
        _recordLog(event, args);
      });
    },
    flush: function() {
      _sendDataAndEmptyQueue();
    },
    test: function() {
      return {
        createLogURLs: _createLogURLs,
        sendDataAndEmptyQueue: _sendDataAndEmptyQueue,
        detectClogEndpoint: _detectClogEndpoint,
        getLogs: function() {
          return _logs;
        },
        getClogEndpoint: function() {
          return _CLOG_ENDPOINT_URL;
        },
        reset: function() {
          _logs = [];
          _CLOG_ENDPOINT_URL = undefined;
        }
      };
    },
    parseParams: function(params) {
      if (!params) return {};
      params = params.split(",");
      var args = {};
      var i = 0;
      var len = params.length;
      var arg;
      for (i; i < len; i += 1) {
        arg = params[i].split("=");
        args[arg[0]] = arg[1];
      }
      return args;
    }
  });
  var _CLOG_ENDPOINT_URL;
  var _MAX_URL_LENGTH = 2e3;
  var _LOG_PRI = 1e3;
  var _pri = _LOG_PRI;
  var _logs = [];
  var _team_id;
  var _enterprise_id;
  var _user_id;
  var _is_debug_mode = false;
  var _detectClogEndpoint = function(host) {
    var is_dev = host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
    var is_qa = host.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
    var is_staging = host.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);
    if (is_dev) {
      _CLOG_ENDPOINT_URL = "https://" + is_dev[2] + ".slack.com/clog/track/";
    } else if (is_qa) {
      _CLOG_ENDPOINT_URL = "https://" + is_qa[2] + ".slack.com/clog/track/";
    } else if (is_staging) {
      _CLOG_ENDPOINT_URL = "https://staging.slack.com/clog/track/";
    } else {
      _CLOG_ENDPOINT_URL = "https://slack.com/clog/track/";
    }
  };
  var _recordLog = function(event, args) {
    if (typeof event !== "string") return;
    if (!args) args = null;
    var payload = {
      tstamp: Date.now(),
      event: event,
      args: args
    };
    _fetchModelValues();
    if (_team_id) payload.team_id = _team_id;
    if (_enterprise_id) payload.enterprise_id = _enterprise_id;
    if (_user_id) payload.user_id = _user_id;
    _logs.push(payload);
    if (TS.log) {
      if (_is_debug_mode) TS.console.log(_LOG_PRI, payload);
      if (TS.has_pri[_pri]) TS.log(_pri, "Event called:", event, args);
    } else if (_is_debug_mode) {
      try {
        console.log(payload);
      } catch (e) {}
    }
  };
  var _sendDataAndEmptyQueue = function() {
    if (_logs.length === 0) return;
    if (TS.has_pri[_pri]) {
      TS.log(_pri, "Sending clog data, emptying queue");
      TS.log(_pri, "Logs: ", _logs);
    }
    var log_urls = _createLogURLs(_logs);
    var log_url;
    for (var i = 0; i < log_urls.length; i += 1) {
      log_url = log_urls[i];
      var log = new Image;
      log.src = log_url;
      if (TS.has_pri[_pri]) TS.log(_pri, "Logged event: " + log_url);
    }
    _logs = [];
  };
  var _createLogURLs = function(logs) {
    if (!_CLOG_ENDPOINT_URL) _detectClogEndpoint(location.host);
    var urls = [];
    var data = [];
    var url = "";
    var makeUrl = function(log_data) {
      return _CLOG_ENDPOINT_URL + "?logs=" + encodeURIComponent(JSON.stringify(log_data));
    };
    var log;
    for (var i = 0; i < logs.length; i += 1) {
      log = logs[i];
      data.push(log);
      url = makeUrl(data);
      if (url.length > _MAX_URL_LENGTH) {
        data.pop();
        urls.push(makeUrl(data));
        data = [log];
      }
    }
    urls.push(makeUrl(data));
    if (TS.has_pri[_pri]) TS.log(_pri, "URLs:", urls);
    return urls;
  };
  var _onClick = function() {
    var event = this.getAttribute("data-clog-event");
    if (!event) {
      if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
      return;
    }
    var args = {};
    var params = TS.clog.parseParams(this.getAttribute("data-clog-params"));
    var ui_context_action = this.getAttribute("data-clog-ui-action");
    if (ui_context_action) {
      args = {
        ui_element: this.getAttribute("data-clog-ui-element"),
        action: this.getAttribute("data-clog-ui-action"),
        step: this.getAttribute("data-clog-ui-step")
      };
      args = {
        contexts: {
          ui_context: args
        }
      };
    }
    switch (event.toUpperCase()) {
      case "WEBSITE_CLICK":
        params.page_url = location.href;
        break;
      default:
        break;
    }
    args = _mergeParams(params, args);
    TS.clog.track(event, args);
  };
  var _mergeParams = function(obj1, obj2) {
    var obj3 = {};
    Object.keys(obj1).forEach(function(attrname) {
      obj3[attrname] = obj1[attrname];
    });
    Object.keys(obj2).forEach(function(property) {
      obj3[property] = obj2[property];
    });
    return obj3;
  };
  var _fetchModelValues = function() {
    if (TS.model) {
      if (TS.model.enterprise && TS.model.enterprise.id) TS.clog.setEnterprise(TS.model.enterprise.id);
      if (TS.model.team && TS.model.team.id) TS.clog.setTeam(TS.model.team.id);
      if (TS.model.user && TS.model.user.id) TS.clog.setUser(TS.model.user.id);
    }
  };
})();
(function() {
  "use strict";
  TS.registerModule("experiment", {
    onStart: function() {
      _is_authed = !!(TS.api && TS.api.call);
      if (_is_authed) {
        _method = TS.api.call;
      } else {
        _method = window.callSlackAPIUnauthed;
      }
      if (TS.boot_data && TS.boot_data.experiment_assignments) {
        _recordAssignments(TS.boot_data.experiment_assignments);
      }
    },
    loadLeadAssignments: function(lead_id) {
      if (lead_id === undefined) {
        if (TS.warn) TS.warn("TS.experiment.loadLeadAssignments requires a lead_id");
        return Promise.resolve(false);
      }
      if (!_promise_lead_assignments) {
        _promise_lead_assignments = _loadAssignments("experiments.getByLead", {
          lead_id: lead_id
        });
      }
      return _promise_lead_assignments;
    },
    loadVisitorAssignments: function() {
      if (!_promise_visitor_assignments) {
        _promise_visitor_assignments = _loadAssignments("experiments.getByVisitor");
      }
      return _promise_visitor_assignments;
    },
    loadUserAssignments: function() {
      if (!_is_authed) {
        if (TS.warn) TS.warn("TS.experiment.loadUserAssignments requires a user to be logged in");
        return Promise.resolve(false);
      }
      if (!_promise_user_assignments) {
        _promise_user_assignments = _loadAssignments("experiments.getByUser");
      }
      return _promise_user_assignments;
    },
    getGroup: function(name, metrics) {
      if (!_assignments[name]) return null;
      if (_assignments[name].log_exposures) _logExposure(name, _assignments[name]);
      if (metrics && _assignments[name].group) {
        metrics.forEach(function(metric) {
          _metric_experiments[metric] = _metric_experiments[metric] || [];
          if (_metric_experiments[metric].indexOf(name) < 0) {
            _metric_experiments[metric].push(name);
          }
        });
      }
      return _assignments[name].group;
    },
    getExperimentsForMetric: function(metric) {
      var experiment_names = _metric_experiments[metric];
      if (!experiment_names) return [];
      return experiment_names.map(function(name) {
        return _assignments[name];
      });
    },
    test: function() {
      var test_ob = {};
      Object.defineProperty(test_ob, "_recordAssignments", {
        get: function() {
          return _recordAssignments;
        },
        set: function(v) {
          _recordAssignments = v;
        }
      });
      Object.defineProperty(test_ob, "_metric_experiments", {
        get: function() {
          return _metric_experiments;
        },
        set: function(v) {
          _metric_experiments = v;
        }
      });
      return test_ob;
    }
  });
  var _is_authed;
  var _method;
  var _assignments = {};
  var _clogged = {};
  var _metric_experiments = {};
  var _promise_lead_assignments;
  var _promise_user_assignments;
  var _promise_visitor_assignments;
  var _loadAssignments = function(api_url, api_args) {
    return new Promise(function(resolve) {
      _method(api_url, _.extend(TS.utility.url.queryStringParse(location.search.substring(1)), api_args), function(ok, data) {
        if (ok && data.assignments) {
          _recordAssignments(data.assignments);
        }
        resolve(ok);
      });
    });
  };
  var _recordAssignments = function(assignments) {
    var assignment;
    for (assignment in assignments) {
      if (!_.isEqual(_clogged[assignment], assignments[assignment])) {
        _clogged[assignment] = null;
      }
      _assignments[assignment] = assignments[assignment];
    }
  };
  var _logExposure = function(name, assignment) {
    if (TS.clog && !_.isEqual(_clogged[name], assignment)) {
      TS.clog.track("EXPERIMENT_EXPOSURE", {
        experiment_name: name,
        experiment_type: assignment.type,
        experiment_id: assignment.experiment_id,
        experiment_group: assignment.group,
        experiment_trigger: assignment.trigger,
        exposure_id: assignment.exposure_id
      });
      _clogged[name] = assignment;
    }
  };
})();
(function() {
  "use strict";
  TS.registerModule("emoji", {
    onStart: function() {
      if (TS.web) TS.web.login_sig.add(TS.emoji.onLogin);
      if (TS.client) TS.client.login_sig.add(TS.emoji.onLogin);
      TS.prefs.jumbomoji_changed_sig.add(_toggleJumbomoji);
      var always_wait = true;
      _resetUpEmojiThrottled = TS.utility.throttleFunc(_resetUpEmojiThrottled, 3e3, always_wait);
    },
    onLogin: function() {
      _toggleJumbomoji();
    },
    isValidName: function(name) {
      if (!name) return false;
      name = TS.emoji.stripWrappingColons(name).toLowerCase();
      if (typeof _emoji_name_lookup[name] === "undefined") return false;
      return name;
    },
    substringMatchesName: function(name, term, rxn_key) {
      if (!name || !term || !_.isString(name) || !_.isString(term)) return false;
      if (term === "::") return false;
      var starts_with_colon = term.charAt(0) === ":";
      var ends_with_colon = term.slice(-1) === ":";
      term = TS.emoji.stripWrappingColons(term.toLowerCase());
      if (!term) return true;
      if (starts_with_colon && ends_with_colon) return term === name;
      if (starts_with_colon) return name.slice(0, term.length) === term;
      if (ends_with_colon) return name.slice(term.length * -1) === term;
      var matches_anywhere = name.indexOf(term) !== -1;
      if (matches_anywhere) return true;
      if (rxn_key) {
        var handy_title = TS.rxns.getHandyRxnsTitleForEmojiByRxnKey(name, rxn_key);
        if (handy_title) return TS.emoji.substringMatchesName(handy_title, term);
      }
      return false;
    },
    emojiMatchesTerm: function(emoji, term, keywords) {
      if (!emoji || !term) return false;
      var emoji_base_name = TS.emoji.nameToBaseName(emoji.display_name || emoji.name);
      if (TS.boot_data.feature_localization) {
        term = TS.emoji.normalizeSearchTerm(term);
        emoji_base_name = TS.i18n.deburr(emoji_base_name);
      }
      if (TS.emoji.substringMatchesName(emoji_base_name, term)) return true;
      var emoji_display_names = emoji.display_names || emoji.names;
      if (TS.boot_data.feature_localization) {
        emoji_display_names = TS.i18n.deburr(emoji_display_names);
        if (emoji.display_names && emoji.display_names !== emoji.names) {
          emoji_display_names += " " + emoji.names;
        }
      }
      var aliases = emoji_display_names.split(" ");
      for (var i = 0; i < aliases.length; i += 1) {
        if (TS.emoji.substringMatchesName(TS.emoji.nameToBaseName(aliases[i]), term)) return true;
      }
      return _.indexOf(keywords, emoji_base_name) !== -1;
    },
    normalizeSearchTerm: function(term) {
      if (!term || !_.isString(term)) return;
      term = term.toLowerCase();
      term = TS.i18n.deburr(term);
      term = term.replace(/['ʼ’]/g, "'");
      return term;
    },
    nameToBaseName: function(name) {
      if (!_.isString(name)) return "";
      if (TS.boot_data.feature_localization) {
        name = TS.emoji.stripLocalizedSkinTone(name);
      } else {
        name = name.replace(/(:skin-tone-[2-6]:)/, "");
      }
      name = TS.emoji.stripWrappingColons(name);
      return name;
    },
    stripLocalizedSkinTone: function(name) {
      var local_skin_tone_regex = /::skin-tone-[2-6]:/g;
      if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
        var local_skin_tone_name = TS.emoji.getLocalSkinToneName();
        local_skin_tone_regex = new RegExp("::" + local_skin_tone_name + "-[2-6]:", "g");
      }
      name = name.replace(local_skin_tone_regex, ":");
      return name;
    },
    stripWrappingColons: function(str) {
      if (!str) return "";
      str = typeof str === "string" ? str : str + "";
      if (str[0] === ":") {
        if (str[str.length - 1] === ":") {
          return str.slice(1, str.length - 1);
        }
        return str.slice(1, str.length);
      } else if (str[str.length - 1] === ":") {
        return str.slice(0, str.length - 1);
      }
      return str;
    },
    nameToCanonicalName: function(name) {
      name = TS.emoji.stripWrappingColons(name);
      if (!name) return "";
      name = String(name).toLowerCase();
      var skin_tone_part = function() {
        var parts = name.split("::");
        if (parts.length != 2) return "";
        name = parts[0];
        return "::" + parts[1];
      }();
      return (_getCanonicalNamesMap()[name] || name) + skin_tone_part;
    },
    addCustomEmoji: function(name, value, cache_ts) {
      _updateCustomEmoji(name, value, cache_ts);
    },
    removeCustomEmoji: function(name, cache_ts) {
      var value;
      _updateCustomEmoji(name, value, cache_ts);
    },
    ingestCustoms: function(customs) {
      TS.model.all_custom_emoji.length = 0;
      TS.model.emoji_complex_customs = {};
      var alias_key;
      var datum;
      var temp_emoji_names = [];
      _.forOwn(_emoji.data, function(data) {
        temp_emoji_names.push.apply(temp_emoji_names, data[3]);
      });

      function isEmojiNameTaken(name) {
        return _emoji.map.colons.hasOwnProperty(name) || temp_emoji_names.indexOf(name) >= 0;
      }
      _.forOwn(customs, function(custom, idx) {
        if (typeof custom === "object") {
          TS.model.emoji_complex_customs[idx] = custom;
          _emoji.data[idx] = [
            [], null, null, [idx], null, null, null, custom.apple
          ];
          _emoji.map.colons[idx] = idx;
          TS.model.all_custom_emoji.push(idx);
        } else {
          if (custom.indexOf("alias:") === 0) return;
          if (isEmojiNameTaken(idx)) {
            TS.error("can't ingest custom emoji :" + idx + ": because that already exists");
            return;
          }
          _emoji.data[idx] = [
            [], null, null, [idx], null, null, null, custom
          ];
          _emoji.map.colons[idx] = idx;
          TS.model.all_custom_emoji.push(idx);
        }
      });
      _.forOwn(customs, function(custom, idx) {
        if (typeof custom === "object" || custom.indexOf("alias:") !== 0) return;
        if (isEmojiNameTaken(idx)) {
          TS.error("can't ingest custom emoji :" + idx + ": because that already exists");
          return;
        }
        alias_key = custom.replace("alias:", "");
        datum = _emoji.data.hasOwnProperty(alias_key) && _emoji.data[alias_key];
        if (datum) {
          datum[3].push(idx);
          _emoji.map.colons[idx] = alias_key;
          return;
        }
        alias_key = _emoji.map.colons.hasOwnProperty(alias_key) && _emoji.map.colons[alias_key];
        datum = _emoji.data.hasOwnProperty(alias_key) && _emoji.data[alias_key];
        if (datum) {
          datum[3].push(idx);
          _emoji.map.colons[idx] = alias_key;
          return;
        }
        if (TS.boot_data && TS.boot_data.feature_tinyspeck) TS.warn('alias for "' + idx + '":"' + custom + '" not recognized');
      });
      TS.model.all_custom_emoji = TS.model.all_custom_emoji.sort();
      if (_emoji && _emoji.inits) {
        delete _emoji.inits.emoticons;
        _emoji.init_emoticons();
      }
      _canonical_names_map = _makeCanonicalNamesMap();
    },
    setUpEmoji: function() {
      return new Promise(function(resolve) {
        if (!_emoji) {
          if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Done setting up emoji, there was nothing to do");
          return resolve();
        }
        var complete = function() {
          _emoji.buildKeywordIndex();
          _customEmojiDidChange();
          if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Done setting up emoji");
          resolve();
        };
        _customEmojiWillChange();
        if (!TS.boot_data.page_needs_custom_emoji) {
          return complete();
        }
        if (!TS.boot_data.page_needs_custom_emoji_fresh) {
          var ls_emoji = TS.storage.fetchCustomEmoji();
          if (ls_emoji && TS.model.emoji_cache_ts == ls_emoji.cache_ts) {
            TS.model.did_we_load_with_emoji_cache = true;
            TS.emoji.ingestCustoms(ls_emoji.data);
            return complete();
          }
        }
        if (TS.boot_data.feature_tinyspeck) TS.info("BOOT: Fetching emoji list before setting up emoji");
        TS.api.call("emoji.list", {
          include_complex_values: 1
        }, function(ok, data) {
          if (!ok || !data.emoji) {
            return complete();
          }
          TS.model.emoji_cache_ts = data.cache_ts;
          TS.storage.storeCustomEmoji({
            data: data.emoji,
            cache_ts: TS.model.emoji_cache_ts
          });
          TS.emoji.ingestCustoms(data.emoji);
          complete();
        });
      });
    },
    resetUpEmoji: function() {
      TS.storage.storeCustomEmoji("");
      _resetUpEmojiThrottled();
    },
    maybeRemakeMenuListsIfFrequentsChanged: function() {
      var new_frequents = _makeFrequents();
      if (!TS.utility.areSimpleObjectsEqual(new_frequents, _frequents, "maybemakeMenuLists")) {
        if (TS.boot_data.feature_localization) {
          _updateFrequentsGroup(new_frequents);
        } else {
          TS.emoji.makeMenuLists();
        }
      }
    },
    makeMenuLists: function() {
      TS.model.emoji_groups.length = 0;
      TS.model.emoji_names.length = 0;
      _emoji_name_lookup = {};
      var groupings = _.cloneDeep(_groupings);
      if (TS.model.all_custom_emoji && TS.model.all_custom_emoji.length) {
        groupings.push({
          display_name: TS.i18n.t("Custom", "emoji")(),
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_slack"></i></span>',
          tab_icon: "ts_icon_slack",
          tab_icon_name: "slack",
          name: "slack",
          emoji_names: TS.model.all_custom_emoji
        });
      }
      _frequents = _makeFrequents();
      groupings.unshift({
        name: "mine",
        display_name: TS.i18n.t("Frequently Used", "emoji")(),
        tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_clock_o"></i></span>',
        tab_icon: "ts_icon_clock_o",
        tab_icon_name: "clock_o",
        emoji_names: _frequents
      });
      var i;
      var m;
      var defaults = [];
      for (i = 0; i < groupings.length; i += 1) {
        defaults = defaults.concat(groupings[i].emoji_names);
      }
      var cat_map = {};
      Object.keys(_emoji.data).forEach(function(idx) {
        var all_names = _emoji.data[idx][3];
        var is_skin_tone_modifiable = TS.emoji.isIdxSkinToneModifiable(idx);
        all_names.forEach(function(name, i, names) {
          var localized_name = name;
          var localized_names = names;
          TS.model.emoji_names.push(name);
          _emoji_name_lookup[name] = true;
          if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
            localized_name = TSFEmoji.getLocalEmojiString(name, TS.i18n.locale());
            localized_names = names.map(function(name) {
              return TSFEmoji.getLocalEmojiString(name, TS.i18n.locale());
            });
          }
          cat_map[name] = {
            html: TS.emoji.graphicReplace(":" + name + ":"),
            name: ":" + name + ":",
            names: ":" + names.join(": :") + ":",
            display_name: ":" + localized_name + ":",
            display_names: ":" + localized_names.join(": :") + ":"
          };
          TS.model.emoji_map.push({
            id: "E" + idx + (i > 0 ? "_alias_" + i : ""),
            name: name,
            name_with_colons: ":" + name + ":",
            display_name: localized_name,
            is_skin: is_skin_tone_modifiable,
            is_emoji: true
          });
          if (is_skin_tone_modifiable) {
            cat_map[name].is_skin = true;
            cat_map[name].skin_tone_id = "1";
            _emoji.skin_tones.forEach(function(skin_idx) {
              if (!_emoji.variations_data[idx + "-" + skin_idx]) return;
              var skin_datum = _emoji.data[skin_idx];
              var skin_name = skin_datum[3][0];
              var name_with_skin = name + "::" + skin_name;
              TS.model.emoji_names.push(name_with_skin);
              _emoji_name_lookup[name_with_skin] = true;
              var colon_name_with_skin = ":" + name_with_skin + ":";
              var colon_names_with_skins = names.map(function(n) {
                return n + "::" + skin_name;
              });
              var colon_display_name_with_skin = colon_name_with_skin;
              var colon_display_names_with_skins = colon_names_with_skins;
              if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
                var skin_display_name = TSFEmoji.getLocalEmojiString(skin_name, TS.i18n.locale());
                colon_display_name_with_skin = ":" + localized_name + "::" + skin_display_name + ":";
                colon_display_names_with_skins = localized_names.map(function(name) {
                  return name + "::" + skin_display_name;
                });
              }
              cat_map[name_with_skin] = {
                is_skin: true,
                skin_tone_id: skin_name.substr(-1, 1),
                html: TS.emoji.graphicReplace(colon_name_with_skin),
                name: colon_name_with_skin,
                names: ":" + colon_names_with_skins.join(": :") + ":",
                display_name: colon_display_name_with_skin,
                display_names: ":" + colon_display_names_with_skins.join(": :") + ":"
              };
            });
          }
        });
      });
      _name_to_emoji_item_map = cat_map;
      TS.model.emoji_map = _.uniqBy(TS.model.emoji_map, "id");
      for (i = 0; i < defaults.length; i += 1) {
        var name = defaults[i];
        if (!cat_map[name]) {
          TS.info(name + " not in cat_map?");
        }
      }
      var grouping;
      var cat_map_items;
      var cat_map_item;
      var tab_html;
      for (i = 0; i < groupings.length; i += 1) {
        grouping = groupings[i];
        cat_map_items = [];
        cat_map_item = null;
        tab_html = "";
        if (grouping.tab_icon_html) {
          tab_html = grouping.tab_icon_html;
        }
        for (m = 0; m < grouping.emoji_names.length; m += 1) {
          cat_map_item = cat_map[grouping.emoji_names[m]];
          cat_map_items.push(cat_map_item);
          if (tab_html) continue;
          if (grouping.emoji_names[m] == grouping.name) {
            tab_html = cat_map_item.html;
          }
        }
        cat_map_item = cat_map_items[0];
        TS.model.emoji_groups.push({
          name: grouping.name,
          display_name: grouping.display_name,
          tab_html: tab_html || cat_map_item.html,
          tab_icon: grouping.tab_icon,
          tab_icon_name: grouping.tab_icon_name,
          items: cat_map_items
        });
      }
      var sheet_url = TS.emoji.getCurrentSheetUrl();
      if (_.get(TS, "model.prefs.ss_emojis") && sheet_url) {
        var img = new Image;
        img.onload = function() {
          img.onload = null;
          img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
          img = null;
        };
        img.src = sheet_url;
      }
      TS.model.emoji_names.sort();
      TS.emoji.friendlyReorder();
      var ok_index = TS.model.emoji_names.indexOf("ok");
      var ok_hand_index = TS.model.emoji_names.indexOf("ok_hand");
      TS.model.emoji_names[ok_index] = "ok_hand";
      TS.model.emoji_names[ok_hand_index] = "ok";
      var testGroupings = function(groupings) {
        var names = TS.model.emoji_names.concat();
        ["skin-tone-2", "skin-tone-3", "skin-tone-4", "skin-tone-5", "skin-tone-6"].forEach(function(n) {
          _.pull(names, n);
        });
        groupings.forEach(function(grouping) {
          grouping.emoji_names.forEach(function(n) {
            _.pull(names, n);
            var emoji_id = _emoji.map.colons[n];
            var datum = _emoji.data[emoji_id];
            if (datum) {
              datum[3].forEach(function(n) {
                [n, n + "::skin-tone-2", n + "::skin-tone-3", n + "::skin-tone-4", n + "::skin-tone-5", n + "::skin-tone-6"].forEach(function(n) {
                  _.pull(names, n);
                });
              });
            }
          });
        });
        if (names.length) {
          TS.error("testGroupings() expected these emoji names to be in a category, but they were not found! " + names.join(","));
        }
      };
      if (TS.boot_data.version_ts === "dev") {
        testGroupings(groupings);
      }
    },
    friendlyReorder: function() {
      var rules = [{
        filter: "th",
        first: "thumbsup",
        second: "thumbsdown"
      }, {
        filter: "po",
        first: "point_up",
        second: "point_down"
      }];
      rules.forEach(function(rule) {
        var filtered_emoji = _.reduce(TS.model.emoji_names, function(prev, name, idx) {
          if (name.indexOf(rule.filter) === 0) {
            var is_custom = TS.model.all_custom_emoji.indexOf(name) > -1;
            var is_first = !is_custom && name.indexOf(rule.first) === 0;
            var is_second = !is_custom && !is_first && name.indexOf(rule.second) === 0;
            prev.emoji.push({
              name: name,
              is_first: is_first,
              is_second: is_second
            });
            prev.indexes.push(idx);
          }
          return prev;
        }, {
          indexes: [],
          emoji: []
        });
        filtered_emoji.emoji = _.orderBy(filtered_emoji.emoji, ["is_first", "is_second", "name"], ["desc", "desc", "asc"]);
        _.forEach(filtered_emoji.emoji, function(emoji, idx) {
          var orig_idx = filtered_emoji.indexes[idx];
          TS.model.emoji_names[orig_idx] = emoji.name;
        });
      });
    },
    isIdxSkinToneModifiable: function(idx) {
      return !!_emoji.variations_data[idx + "-" + _emoji.skin_tones[0]];
    },
    isNameSkinToneModifiable: function(name) {
      name = TS.emoji.stripWrappingColons(name);
      name = String(name).toLowerCase();
      var idx = _emoji.map.colons[name];
      return TS.emoji.isIdxSkinToneModifiable(idx);
    },
    graphicReplace: function(str, options) {
      if (!str) return "";
      options = options || {};
      if (options.show_icon_for_emoji_in_as_text_mode && TS.emoji.isValidName(str)) {
        return '<ts-icon class="emoji-sizer ts_icon_info_circle ts_icon_inherit" title="' + str.replace(/:/g, "") + '"></ts-icon>';
      }
      _emoji.init_env();
      var was_text_mode = _emoji.text_mode;
      var was_include_title = _emoji.include_title;
      var was_include_text = _emoji.include_text;
      var was_supports_css = _emoji.supports_css;
      var was_allow_skin_tone_squares = _emoji.allow_skin_tone_squares;
      if (options.force_img && options.obey_emoji_mode_pref) {
        options.obey_emoji_mode_pref = false;
        TS.error("obey_emoji_mode_pref now set to FALSE because options.force_img is TRUE");
      }
      if (options.force_style && options.obey_emoji_mode_pref) {
        options.obey_emoji_mode_pref = false;
        TS.error("obey_emoji_mode_pref now set to FALSE because options.force_style is " + options.force_style);
      }
      _emoji.text_mode = options.obey_emoji_mode_pref && _.get(TS, "model.prefs.emoji_mode") === "as_text";
      if (options.force_style) {
        TS.emoji.setEmojiMode(options.force_style);
        _emoji.use_sheet = false;
      }
      _emoji.include_title = !!options.include_title;
      _emoji.include_text = !!options.include_text;
      _emoji.supports_css = !options.force_img;
      _emoji.allow_skin_tone_squares = !options.no_skin_tone_squares;
      var html = _emoji.replace_colons(str, {
        stop_animations: options.stop_animations
      });
      if (options.jumbomoji) {
        html = html.replace("emoji-sizer", "emoji-sizer emoji-only");
      }
      if (options.force_style) {
        TS.emoji.setEmojiMode();
      }
      _emoji.text_mode = was_text_mode;
      _emoji.include_title = was_include_title;
      _emoji.include_text = was_include_text;
      _emoji.supports_css = was_supports_css;
      _emoji.allow_skin_tone_squares = was_allow_skin_tone_squares;
      return html;
    },
    replaceColons: function(str) {
      if (str.indexOf(":") < 0) return str;
      return _emoji.replace_colons(str);
    },
    maybeUnifiedReplace: function(new_text) {
      if (_emoji.replace_mode !== "unified") return new_text;
      return _emoji.replace_colons_with_unified(new_text);
    },
    replaceEmoticons: function(str) {
      return _emoji.replace_emoticons_with_colons(str);
    },
    eachEmoticon: function(str, callback) {
      str.replace(_emoji.rx_emoticons, callback);
    },
    getLocalSkinToneName: function() {
      var skin_tone_name = "skin-tone";
      if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
        skin_tone_name = TSFEmoji.getLocalSkinToneName(TS.i18n.locale());
      }
      return skin_tone_name;
    },
    getChosenSkinTone: function(use_localized_skin_tone_name) {
      var pref = parseInt(_.get(TS, "model.prefs.preferred_skin_tone"), 10);
      if (!pref || pref == "1" || !_.includes([2, 3, 4, 5, 6], pref)) return "";
      var skin_tone_name = use_localized_skin_tone_name ? TS.emoji.getLocalSkinToneName() : "skin-tone";
      return skin_tone_name + "-" + pref;
    },
    getChosenSkinToneModifier: function(use_localized_skin_tone_name) {
      var tone = TS.emoji.getChosenSkinTone(use_localized_skin_tone_name);
      if (!tone) return "";
      return ":" + tone + ":";
    },
    setEmojiMode: function(mode) {
      var VALID_MODES = ["google", "emojione", "twitter", "apple"];
      mode = mode || _.get(TS, "model.prefs.emoji_mode");
      _emoji.text_mode = mode === "as_text";
      _emoji.do_emoticons = !!_.get(TS, "model.prefs.graphic_emoticons");
      _emoji.allow_native = false;
      _emoji.use_sheet = function() {
        if (!_.get(TS, "model.prefs.ss_emojis")) return false;
        return !!TS.boot_data.page_needs_custom_emoji;
      }();
      _emoji.img_set = _.includes(VALID_MODES, mode) ? mode : "apple";
      if (!TS.model.emoji_complex_customs) return;
      for (var idx in TS.model.emoji_complex_customs) {
        if (!_emoji.data[idx]) continue;
        _emoji.data[idx][7] = TS.model.emoji_complex_customs[idx][_emoji.img_set];
      }
    },
    getColonsRx: function() {
      return _emoji.rx_colons;
    },
    getEmojiByName: function(name) {
      if (!name) return;
      return _.find(TS.model.emoji_map, {
        name: name
      });
    },
    getEmojiById: function(id) {
      var emoji_ob = _.find(TS.model.emoji_map, {
        id: id
      });
      if (!emoji_ob) {
        TS.warn("no emoji ob found for " + id);
        return;
      }
      return emoji_ob;
    },
    getEmojiForSpaces: function() {
      var ob = {
        emoticonEmojiNames: _emoji.emoticons_data,
        emoji: {},
        sheetSize: _emoji.sheet_size,
        sheetPath: TS.emoji.getCurrentSheetUrl(),
        replace: function() {
          var prev_emoji_colons_mode = _emoji.colons_mode;
          _emoji.colons_mode = true;
          var colons = _emoji.replace_unified.apply(_emoji, arguments);
          if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
            colons = TSFEmoji.translateEmojiStringToCanonical(colons, TS.i18n.locale());
          }
          _emoji.colons_mode = prev_emoji_colons_mode;
          return colons;
        }
      };
      if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
        ob.getLocalEmojiString = function(emoji_name) {
          return TSFEmoji.getLocalEmojiString(emoji_name, TS.i18n.locale()) || emoji_name;
        };
      }
      Object.keys(_emoji.data).forEach(function(idx) {
        var datum = _emoji.data[idx];
        var names = datum[3];
        var px = datum[4];
        var py = datum[5];
        var url = datum[7];
        var value;
        if (px !== null && py !== null) {
          value = [px, py];
        } else if (url) {
          value = _.get(TS, "model.prefs.a11y_animations") === false ? TS.utility.getImgProxyURLWithOptions(url, {
            emoji: true
          }) : url;
        } else {
          TS.error('WTF, _emoji "' + idx + '" is missing coords or and a url, or something!');
          return;
        }
        names.forEach(function(it) {
          ob.emoji[it] = value;
        });
      });
      return ob;
    },
    getCurrentSheetUrl: function() {
      return _emoji.img_sets[_emoji.img_set].sheet;
    },
    getCurrentImagePath: function() {
      return _emoji.img_sets[_emoji.img_set].path;
    },
    test: function() {
      return {
        emoji: _emoji
      };
    },
    spliceSkinToneVariationsIntoAnArrayOfEmojiNames: function(A) {
      var added = 0;
      A.concat().forEach(function(emoji_name, i) {
        var idx = _emoji.map.colons[emoji_name];
        var datum = _emoji.data.hasOwnProperty(idx) && _emoji.data[idx];
        if (!datum) return;
        _emoji.skin_tones.forEach(function(skin_idx) {
          if (!_emoji.variations_data[idx + "-" + skin_idx]) return;
          var skin_datum = _emoji.data[skin_idx];
          var skin_name = skin_datum[3][0];
          var name_with_skin = emoji_name + "::" + skin_name;
          if (A.indexOf(name_with_skin) !== -1) return;
          added += 1;
          var splice_i = added + i;
          A.splice(splice_i, 0, name_with_skin);
        });
      });
    },
    findByKeyword: function(k) {
      return _emoji.findByKeyword(k);
    },
    maybeGetCanonicalEmojiString: function(str) {
      if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
        return TSFEmoji.translateEmojiStringToCanonical(str, TS.i18n.locale());
      }
      return str;
    },
    maybeGetLocalizedEmojiString: function(str) {
      if (TS.boot_data.feature_localization && TS.i18n.locale() !== TS.i18n.DEFAULT_LOCALE) {
        return TSFEmoji.translateEmojiStringToLocal(str, TS.i18n.locale());
      }
      return str;
    },
    MISSING_EMOJI_HTML: '<span class="emoji-outer emoji-sizer emoji-missing" style="background-image: url(' + cdn_url + "/ecf3e/img/emoji_missing.png" + '); background-size: cover !important;"></span>'
  });
  var _emoji_name_lookup = {};
  var _frequents;
  var _makeFrequents = function() {
    var root_name;
    var condensed = {};
    _.each(_.keys(TS.model.emoji_use), function(k) {
      root_name = TS.emoji.nameToCanonicalName(k.split("::")[0]);
      if (!condensed.hasOwnProperty(root_name)) {
        condensed[root_name] = 0;
      }
      condensed[root_name] += TS.model.emoji_use[k];
    });
    TS.dir(777, condensed, "condensed emoji names:");
    var A = Object.keys(condensed).sort(function(a, b) {
      var a_val = condensed[a];
      var b_val = condensed[b];
      if (a_val == b_val) {
        if (a < b) return -1;
        if (a > b) return 1;
      }
      return -(a_val - b_val);
    });
    A.length = Math.min(A.length, TS.model.emoji_menu_columns * 4);
    var extras = ["slightly_smiling_face", "heart", "+1", "100", "bug"];
    var extra;
    while (A.length < 5 && extras.length) {
      extra = extras.shift();
      if (A.indexOf(extra) === -1) A.push(extra);
    }
    TS.emoji.spliceSkinToneVariationsIntoAnArrayOfEmojiNames(A);
    return A;
  };
  var _updateFrequentsGroup = function(frequents) {
    _frequents = frequents;
    var frequents_group = _.find(_.get(TS.model, "emoji_groups"), {
      name: "mine"
    });
    if (!frequents_group) {
      TS.emoji.makeMenuLists();
    }
    var new_frequents_items = [];
    _frequents.forEach(function(frequent_emoji_name) {
      var item = _name_to_emoji_item_map[frequent_emoji_name];
      if (item) new_frequents_items.push(item);
    });
    frequents_group.items = new_frequents_items;
  };
  var _canonical_names_map;
  var _getCanonicalNamesMap = function() {
    _canonical_names_map = _canonical_names_map || _makeCanonicalNamesMap();
    return _canonical_names_map;
  };
  var _makeCanonicalNamesMap = function() {
    var map = {};
    var item;
    Object.keys(_emoji.data).forEach(function(name) {
      item = _emoji.data[name];
      map[item[3][0]] = null;
      item[3].forEach(function(n) {
        if (map.hasOwnProperty(n)) return;
        map[n] = item[3][0];
      });
    });
    return map;
  };
  var _emoji = emoji;
  var _name_to_emoji_item_map = {};
  var _groupings = [{
    name: "people",
    display_name: TS.i18n.t("People", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_happy_smile"></i></span>',
    tab_icon: "ts_icon_happy_smile",
    tab_icon_name: "happy_smile",
    emoji_names: ["grinning", "grimacing", "grin", "joy", "smiley", "smile", "sweat_smile", "laughing", "innocent", "wink", "blush", "slightly_smiling_face", "upside_down_face", "relaxed", "yum", "relieved", "heart_eyes", "kissing_heart", "kissing", "kissing_smiling_eyes", "kissing_closed_eyes", "stuck_out_tongue_winking_eye", "stuck_out_tongue_closed_eyes", "stuck_out_tongue", "money_mouth_face", "nerd_face", "sunglasses", "hugging_face", "smirk", "no_mouth", "neutral_face", "expressionless", "unamused", "face_with_rolling_eyes", "thinking_face", "flushed", "disappointed", "worried", "angry", "rage", "pensive", "confused", "slightly_frowning_face", "white_frowning_face", "persevere", "confounded", "tired_face", "weary", "triumph", "open_mouth", "scream", "fearful", "cold_sweat", "hushed", "frowning", "anguished", "cry", "disappointed_relieved", "sleepy", "sweat", "sob", "dizzy_face", "astonished", "zipper_mouth_face", "mask", "face_with_thermometer", "face_with_head_bandage", "sleeping", "zzz", "hankey", "smiling_imp", "imp", "japanese_ogre", "japanese_goblin", "skull", "ghost", "alien", "robot_face", "smiley_cat", "smile_cat", "joy_cat", "heart_eyes_cat", "smirk_cat", "kissing_cat", "scream_cat", "crying_cat_face", "pouting_cat", "raised_hands", "clap", "wave", "+1", "-1", "facepunch", "fist", "v", "ok_hand", "hand", "open_hands", "muscle", "pray", "point_up", "point_up_2", "point_down", "point_left", "point_right", "middle_finger", "raised_hand_with_fingers_splayed", "the_horns", "spock-hand", "writing_hand", "nail_care", "lips", "tongue", "ear", "nose", "eye", "eyes", "bust_in_silhouette", "busts_in_silhouette", "speaking_head_in_silhouette", "baby", "boy", "girl", "man", "woman", "person_with_blond_hair", "older_man", "older_woman", "man_with_gua_pi_mao", "man_with_turban", "cop", "construction_worker", "guardsman", "sleuth_or_spy", "santa", "angel", "princess", "bride_with_veil", "walking", "runner", "dancer", "dancers", "couple", "two_men_holding_hands", "two_women_holding_hands", "bow", "information_desk_person", "no_good", "ok_woman", "raising_hand", "person_with_pouting_face", "person_frowning", "haircut", "massage", "couple_with_heart", "woman-heart-woman", "man-heart-man", "couplekiss", "woman-kiss-woman", "man-kiss-man", "family", "man-woman-girl", "man-woman-girl-boy", "man-woman-boy-boy", "man-woman-girl-girl", "woman-woman-boy", "woman-woman-girl", "woman-woman-girl-boy", "woman-woman-boy-boy", "woman-woman-girl-girl", "man-man-boy", "man-man-girl", "man-man-girl-boy", "man-man-boy-boy", "man-man-girl-girl", "womans_clothes", "shirt", "jeans", "necktie", "dress", "bikini", "kimono", "lipstick", "kiss", "footprints", "high_heel", "sandal", "boot", "mans_shoe", "athletic_shoe", "womans_hat", "tophat", "helmet_with_white_cross", "mortar_board", "crown", "school_satchel", "pouch", "purse", "handbag", "briefcase", "eyeglasses", "dark_sunglasses", "ring", "closed_umbrella"]
  }, {
    name: "nature",
    display_name: TS.i18n.t("Nature", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_nature"></i></span>',
    tab_icon: "ts_icon_emoji_nature",
    tab_icon_name: "emoji_nature",
    emoji_names: ["dog", "cat", "mouse", "hamster", "rabbit", "bear", "panda_face", "koala", "tiger", "lion_face", "cow", "pig", "pig_nose", "frog", "octopus", "monkey_face", "see_no_evil", "hear_no_evil", "speak_no_evil", "monkey", "chicken", "penguin", "bird", "baby_chick", "hatching_chick", "hatched_chick", "wolf", "boar", "horse", "unicorn_face", "bee", "bug", "snail", "beetle", "ant", "spider", "scorpion", "crab", "snake", "turtle", "tropical_fish", "fish", "blowfish", "dolphin", "whale", "whale2", "crocodile", "leopard", "tiger2", "water_buffalo", "ox", "cow2", "dromedary_camel", "camel", "elephant", "goat", "ram", "sheep", "racehorse", "pig2", "rat", "mouse2", "rooster", "turkey", "dove_of_peace", "dog2", "poodle", "cat2", "rabbit2", "chipmunk", "feet", "dragon", "dragon_face", "cactus", "christmas_tree", "evergreen_tree", "deciduous_tree", "palm_tree", "seedling", "herb", "shamrock", "four_leaf_clover", "bamboo", "tanabata_tree", "leaves", "fallen_leaf", "maple_leaf", "ear_of_rice", "hibiscus", "sunflower", "rose", "tulip", "blossom", "cherry_blossom", "bouquet", "mushroom", "chestnut", "jack_o_lantern", "shell", "spider_web", "earth_americas", "earth_africa", "earth_asia", "full_moon", "waning_gibbous_moon", "last_quarter_moon", "waning_crescent_moon", "new_moon", "waxing_crescent_moon", "first_quarter_moon", "moon", "new_moon_with_face", "full_moon_with_face", "first_quarter_moon_with_face", "last_quarter_moon_with_face", "sun_with_face", "crescent_moon", "star", "star2", "dizzy", "sparkles", "comet", "sunny", "mostly_sunny", "partly_sunny", "barely_sunny", "partly_sunny_rain", "cloud", "rain_cloud", "thunder_cloud_and_rain", "lightning", "zap", "fire", "boom", "snowflake", "snow_cloud", "snowman_without_snow", "snowman", "wind_blowing_face", "dash", "tornado", "fog", "umbrella", "umbrella_with_rain_drops", "droplet", "sweat_drops", "ocean"]
  }, {
    name: "food_and_drink",
    display_name: TS.i18n.t("Food & Drink", "client")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_food"></i></span>',
    tab_icon: "ts_icon_emoji_food",
    tab_icon_name: "emoji_food",
    emoji_names: ["green_apple", "apple", "pear", "tangerine", "lemon", "banana", "watermelon", "grapes", "strawberry", "melon", "cherries", "peach", "pineapple", "tomato", "eggplant", "hot_pepper", "corn", "sweet_potato", "honey_pot", "bread", "cheese_wedge", "poultry_leg", "meat_on_bone", "fried_shrimp", "egg", "hamburger", "fries", "hotdog", "pizza", "spaghetti", "taco", "burrito", "ramen", "stew", "fish_cake", "sushi", "bento", "curry", "rice_ball", "rice", "rice_cracker", "oden", "dango", "shaved_ice", "ice_cream", "icecream", "cake", "birthday", "custard", "candy", "lollipop", "chocolate_bar", "popcorn", "doughnut", "cookie", "beer", "beers", "wine_glass", "cocktail", "tropical_drink", "champagne", "sake", "tea", "coffee", "baby_bottle", "fork_and_knife", "knife_fork_plate"]
  }, {
    name: "activity",
    display_name: TS.i18n.t("Activity", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_activities"></i></span>',
    tab_icon: "ts_icon_emoji_activities",
    tab_icon_name: "emoji_activities",
    emoji_names: ["soccer", "basketball", "football", "baseball", "tennis", "volleyball", "rugby_football", "8ball", "golf", "golfer", "table_tennis_paddle_and_ball", "badminton_racquet_and_shuttlecock", "ice_hockey_stick_and_puck", "field_hockey_stick_and_ball", "cricket_bat_and_ball", "ski", "skier", "snowboarder", "ice_skate", "bow_and_arrow", "fishing_pole_and_fish", "rowboat", "swimmer", "surfer", "bath", "person_with_ball", "weight_lifter", "bicyclist", "mountain_bicyclist", "horse_racing", "man_in_business_suit_levitating", "trophy", "running_shirt_with_sash", "sports_medal", "medal", "reminder_ribbon", "rosette", "ticket", "admission_tickets", "performing_arts", "art", "circus_tent", "microphone", "headphones", "musical_score", "musical_keyboard", "saxophone", "trumpet", "guitar", "violin", "clapper", "video_game", "space_invader", "dart", "game_die", "slot_machine", "bowling"]
  }, {
    name: "travel_and_places",
    display_name: TS.i18n.t("Travel & Places", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_travel"></i></span>',
    tab_icon: "ts_icon_emoji_travel",
    tab_icon_name: "emoji_travel",
    emoji_names: ["car", "taxi", "blue_car", "bus", "trolleybus", "racing_car", "police_car", "ambulance", "fire_engine", "minibus", "truck", "articulated_lorry", "tractor", "racing_motorcycle", "bike", "rotating_light", "oncoming_police_car", "oncoming_bus", "oncoming_automobile", "oncoming_taxi", "aerial_tramway", "mountain_cableway", "suspension_railway", "railway_car", "train", "monorail", "bullettrain_side", "bullettrain_front", "light_rail", "mountain_railway", "steam_locomotive", "train2", "metro", "tram", "station", "helicopter", "small_airplane", "airplane", "airplane_departure", "airplane_arriving", "boat", "motor_boat", "speedboat", "ferry", "passenger_ship", "rocket", "satellite", "seat", "anchor", "construction", "fuelpump", "busstop", "vertical_traffic_light", "traffic_light", "checkered_flag", "ship", "ferris_wheel", "roller_coaster", "carousel_horse", "building_construction", "foggy", "tokyo_tower", "factory", "fountain", "rice_scene", "mountain", "snow_capped_mountain", "mount_fuji", "volcano", "japan", "camping", "tent", "national_park", "motorway", "railway_track", "sunrise", "sunrise_over_mountains", "desert", "beach_with_umbrella", "desert_island", "city_sunrise", "city_sunset", "cityscape", "night_with_stars", "bridge_at_night", "milky_way", "stars", "sparkler", "fireworks", "rainbow", "house_buildings", "european_castle", "japanese_castle", "stadium", "statue_of_liberty", "house", "house_with_garden", "derelict_house_building", "office", "department_store", "post_office", "european_post_office", "hospital", "bank", "hotel", "convenience_store", "school", "love_hotel", "wedding", "classical_building", "church", "mosque", "synagogue", "kaaba", "shinto_shrine"]
  }, {
    name: "objects",
    display_name: TS.i18n.t("Objects", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_lightbulb_o"></i></span>',
    tab_icon: "ts_icon_lightbulb_o",
    tab_icon_name: "lightbulb_o",
    emoji_names: ["watch", "iphone", "calling", "computer", "keyboard", "desktop_computer", "printer", "three_button_mouse", "trackball", "joystick", "compression", "minidisc", "floppy_disk", "cd", "dvd", "vhs", "camera", "camera_with_flash", "video_camera", "movie_camera", "film_projector", "film_frames", "telephone_receiver", "phone", "pager", "fax", "tv", "radio", "studio_microphone", "level_slider", "control_knobs", "stopwatch", "timer_clock", "alarm_clock", "mantelpiece_clock", "hourglass_flowing_sand", "hourglass", "satellite_antenna", "battery", "electric_plug", "bulb", "flashlight", "candle", "wastebasket", "oil_drum", "money_with_wings", "dollar", "yen", "euro", "pound", "moneybag", "credit_card", "gem", "scales", "wrench", "hammer", "hammer_and_pick", "hammer_and_wrench", "pick", "nut_and_bolt", "gear", "chains", "gun", "bomb", "hocho", "dagger_knife", "crossed_swords", "shield", "smoking", "skull_and_crossbones", "coffin", "funeral_urn", "amphora", "crystal_ball", "prayer_beads", "barber", "alembic", "telescope", "microscope", "hole", "pill", "syringe", "thermometer", "label", "bookmark", "toilet", "shower", "bathtub", "key", "old_key", "couch_and_lamp", "sleeping_accommodation", "bed", "door", "bellhop_bell", "frame_with_picture", "world_map", "umbrella_on_ground", "moyai", "shopping_bags", "balloon", "flags", "ribbon", "gift", "confetti_ball", "tada", "dolls", "wind_chime", "crossed_flags", "izakaya_lantern", "email", "envelope_with_arrow", "incoming_envelope", "e-mail", "love_letter", "postbox", "mailbox_closed", "mailbox", "mailbox_with_mail", "mailbox_with_no_mail", "package", "postal_horn", "inbox_tray", "outbox_tray", "scroll", "page_with_curl", "bookmark_tabs", "bar_chart", "chart_with_upwards_trend", "chart_with_downwards_trend", "page_facing_up", "date", "calendar", "spiral_calendar_pad", "card_index", "card_file_box", "ballot_box_with_ballot", "file_cabinet", "clipboard", "spiral_note_pad", "file_folder", "open_file_folder", "card_index_dividers", "rolled_up_newspaper", "newspaper", "notebook", "closed_book", "green_book", "blue_book", "orange_book", "notebook_with_decorative_cover", "ledger", "books", "book", "link", "paperclip", "linked_paperclips", "scissors", "triangular_ruler", "straight_ruler", "pushpin", "round_pushpin", "triangular_flag_on_post", "waving_white_flag", "waving_black_flag", "closed_lock_with_key", "lock", "unlock", "lock_with_ink_pen", "lower_left_ballpoint_pen", "lower_left_fountain_pen", "black_nib", "memo", "pencil2", "lower_left_crayon", "lower_left_paintbrush", "mag", "mag_right"]
  }, {
    name: "symbols",
    display_name: TS.i18n.t("Symbols", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_heart_o"></i></span>',
    tab_icon: "ts_icon_heart_o",
    tab_icon_name: "heart_o",
    emoji_names: ["heart", "yellow_heart", "green_heart", "blue_heart", "purple_heart", "broken_heart", "heavy_heart_exclamation_mark_ornament", "two_hearts", "revolving_hearts", "heartbeat", "heartpulse", "sparkling_heart", "cupid", "gift_heart", "heart_decoration", "peace_symbol", "latin_cross", "star_and_crescent", "om_symbol", "wheel_of_dharma", "star_of_david", "six_pointed_star", "menorah_with_nine_branches", "yin_yang", "orthodox_cross", "place_of_worship", "ophiuchus", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpius", "sagittarius", "capricorn", "aquarius", "pisces", "id", "atom_symbol", "u7a7a", "u5272", "radioactive_sign", "biohazard_sign", "mobile_phone_off", "vibration_mode", "u6709", "u7121", "u7533", "u55b6", "u6708", "eight_pointed_black_star", "vs", "accept", "white_flower", "ideograph_advantage", "secret", "congratulations", "u5408", "u6e80", "u7981", "a", "b", "ab", "cl", "o2", "sos", "no_entry", "name_badge", "no_entry_sign", "x", "o", "anger", "hotsprings", "no_pedestrians", "do_not_litter", "no_bicycles", "non-potable_water", "underage", "no_mobile_phones", "exclamation", "grey_exclamation", "question", "grey_question", "bangbang", "interrobang", "100", "low_brightness", "high_brightness", "trident", "fleur_de_lis", "part_alternation_mark", "warning", "children_crossing", "beginner", "recycle", "u6307", "chart", "sparkle", "eight_spoked_asterisk", "eject", "negative_squared_cross_mark", "white_check_mark", "diamond_shape_with_a_dot_inside", "cyclone", "loop", "globe_with_meridians", "m", "atm", "sa", "passport_control", "customs", "baggage_claim", "left_luggage", "wheelchair", "no_smoking", "wc", "parking", "potable_water", "mens", "womens", "baby_symbol", "restroom", "put_litter_in_its_place", "cinema", "signal_strength", "koko", "ng", "ok", "up", "cool", "new", "free", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten", "keycap_star", "1234", "arrow_forward", "double_vertical_bar", "black_right_pointing_triangle_with_double_vertical_bar", "black_square_for_stop", "black_circle_for_record", "black_right_pointing_double_triangle_with_vertical_bar", "black_left_pointing_double_triangle_with_vertical_bar", "fast_forward", "rewind", "twisted_rightwards_arrows", "repeat", "repeat_one", "arrow_backward", "arrow_up_small", "arrow_down_small", "arrow_double_up", "arrow_double_down", "arrow_right", "arrow_left", "arrow_up", "arrow_down", "arrow_upper_right", "arrow_lower_right", "arrow_lower_left", "arrow_upper_left", "arrow_up_down", "left_right_arrow", "arrows_counterclockwise", "arrow_right_hook", "leftwards_arrow_with_hook", "arrow_heading_up", "arrow_heading_down", "hash", "information_source", "abc", "abcd", "capital_abcd", "symbols", "musical_note", "notes", "wavy_dash", "curly_loop", "heavy_check_mark", "arrows_clockwise", "heavy_plus_sign", "heavy_minus_sign", "heavy_division_sign", "heavy_multiplication_x", "heavy_dollar_sign", "currency_exchange", "copyright", "registered", "tm", "end", "back", "on", "top", "soon", "ballot_box_with_check", "radio_button", "white_circle", "black_circle", "red_circle", "large_blue_circle", "small_orange_diamond", "small_blue_diamond", "large_orange_diamond", "large_blue_diamond", "small_red_triangle", "black_small_square", "white_small_square", "black_large_square", "white_large_square", "small_red_triangle_down", "black_medium_square", "white_medium_square", "black_medium_small_square", "white_medium_small_square", "black_square_button", "white_square_button", "speaker", "sound", "loud_sound", "mute", "mega", "loudspeaker", "bell", "no_bell", "black_joker", "mahjong", "spades", "clubs", "hearts", "diamonds", "flower_playing_cards", "thought_balloon", "right_anger_bubble", "speech_balloon", "left_speech_bubble", "clock1", "clock2", "clock3", "clock4", "clock5", "clock6", "clock7", "clock8", "clock9", "clock10", "clock11", "clock12", "clock130", "clock230", "clock330", "clock430", "clock530", "clock630", "clock730", "clock830", "clock930", "clock1030", "clock1130", "clock1230"]
  }, {
    name: "flags",
    display_name: TS.i18n.t("Flags", "emoji")(),
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_flag"></i></span>',
    tab_icon: "ts_icon_flag",
    tab_icon_name: "flag",
    emoji_names: ["flag-ac", "flag-ad", "flag-ae", "flag-af", "flag-ag", "flag-ai", "flag-al", "flag-am", "flag-ao", "flag-aq", "flag-ar", "flag-as", "flag-at", "flag-au", "flag-aw", "flag-ax", "flag-az", "flag-ba", "flag-bb", "flag-bd", "flag-be", "flag-bf", "flag-bg", "flag-bh", "flag-bi", "flag-bj", "flag-bl", "flag-bm", "flag-bn", "flag-bo", "flag-bq", "flag-br", "flag-bs", "flag-bt", "flag-bv", "flag-bw", "flag-by", "flag-bz", "flag-ca", "flag-cc", "flag-cd", "flag-cf", "flag-cg", "flag-ch", "flag-ci", "flag-ck", "flag-cl", "flag-cm", "flag-cn", "flag-co", "flag-cp", "flag-cr", "flag-cu", "flag-cv", "flag-cw", "flag-cx", "flag-cy", "flag-cz", "flag-de", "flag-dg", "flag-dj", "flag-dk", "flag-dm", "flag-do", "flag-dz", "flag-ea", "flag-ec", "flag-ee", "flag-eg", "flag-eh", "flag-er", "flag-es", "flag-et", "flag-eu", "flag-fi", "flag-fj", "flag-fk", "flag-fm", "flag-fo", "flag-fr", "flag-ga", "flag-gb", "flag-gd", "flag-ge", "flag-gf", "flag-gg", "flag-gh", "flag-gi", "flag-gl", "flag-gm", "flag-gn", "flag-gp", "flag-gq", "flag-gr", "flag-gs", "flag-gt", "flag-gu", "flag-gw", "flag-gy", "flag-hk", "flag-hm", "flag-hn", "flag-hr", "flag-ht", "flag-hu", "flag-ic", "flag-id", "flag-ie", "flag-il", "flag-im", "flag-in", "flag-io", "flag-iq", "flag-ir", "flag-is", "flag-it", "flag-je", "flag-jm", "flag-jo", "flag-jp", "flag-ke", "flag-kg", "flag-kh", "flag-ki", "flag-km", "flag-kn", "flag-kp", "flag-kr", "flag-kw", "flag-ky", "flag-kz", "flag-la", "flag-lb", "flag-lc", "flag-li", "flag-lk", "flag-lr", "flag-ls", "flag-lt", "flag-lu", "flag-lv", "flag-ly", "flag-ma", "flag-mc", "flag-md", "flag-me", "flag-mf", "flag-mg", "flag-mh", "flag-mk", "flag-ml", "flag-mm", "flag-mn", "flag-mo", "flag-mp", "flag-mq", "flag-mr", "flag-ms", "flag-mt", "flag-mu", "flag-mv", "flag-mw", "flag-mx", "flag-my", "flag-mz", "flag-na", "flag-nc", "flag-ne", "flag-nf", "flag-ng", "flag-ni", "flag-nl", "flag-no", "flag-np", "flag-nr", "flag-nu", "flag-nz", "flag-om", "flag-pa", "flag-pe", "flag-pf", "flag-pg", "flag-ph", "flag-pk", "flag-pl", "flag-pm", "flag-pn", "flag-pr", "flag-ps", "flag-pt", "flag-pw", "flag-py", "flag-qa", "flag-re", "flag-ro", "flag-rs", "flag-ru", "flag-rw", "flag-sa", "flag-sb", "flag-sc", "flag-sd", "flag-se", "flag-sg", "flag-sh", "flag-si", "flag-sj", "flag-sk", "flag-sl", "flag-sm", "flag-sn", "flag-so", "flag-sr", "flag-ss", "flag-st", "flag-sv", "flag-sx", "flag-sy", "flag-sz", "flag-ta", "flag-tc", "flag-td", "flag-tf", "flag-tg", "flag-th", "flag-tj", "flag-tk", "flag-tl", "flag-tm", "flag-tn", "flag-to", "flag-tr", "flag-tt", "flag-tv", "flag-tw", "flag-tz", "flag-ua", "flag-ug", "flag-um", "flag-us", "flag-uy", "flag-uz", "flag-va", "flag-vc", "flag-ve", "flag-vg", "flag-vi", "flag-vn", "flag-vu", "flag-wf", "flag-ws", "flag-xk", "flag-ye", "flag-yt", "flag-za", "flag-zm", "flag-zw"]
  }];
  _groupings.forEach(function(grouping) {
    TS.emoji.spliceSkinToneVariationsIntoAnArrayOfEmojiNames(grouping.emoji_names);
  });
  var _resetUpEmojiThrottled = function() {
    TS.emoji.setUpEmoji();
  };
  var _toggleJumbomoji = function() {
    if (TS.client && TS.model.ms_logged_in_once) {
      TS.client.msg_pane.rebuildMsgs();
      TS.view.rebuildMentions();
      TS.view.rebuildStars();
      if (TS.model.previewed_file_id) TS.client.ui.files.rebuildFilePreview();
    }
  };
  var _customEmojiWillChange = function() {
    if (_emoji.unaltered_data) {
      _emoji.data = _.cloneDeep(_emoji.unaltered_data);
      _emoji.inits = {};
    }
    _emoji.ts_init_colons();
  };
  var _customEmojiDidChange = function() {
    TS.emoji.setEmojiMode();
    TS.emoji.makeMenuLists();
    var make_sure_active_channel_is_in_view = false;
    var should_rebuild_ui = !!TS.model.ms_logged_in_once;
    var should_throttle_rebuild = true;
    if (TS.client && should_rebuild_ui) TS.client.ui.rebuildAll(make_sure_active_channel_is_in_view, should_throttle_rebuild);
  };
  var _updateCustomEmoji = function(name, value, cache_ts) {
    if (!_emoji) return;
    var ls_emoji = TS.storage.fetchCustomEmoji();
    if (!ls_emoji) {
      TS.emoji.resetUpEmoji();
      return;
    }
    if (typeof value === "undefined") {
      delete TS.model.emoji_use[name];
      if (!ls_emoji.data.hasOwnProperty(name)) {
        return;
      }
      delete ls_emoji.data[name];
      _.remove(TS.model.emoji_map, {
        name: name
      });
    } else {
      ls_emoji.data[name] = value;
    }
    TS.model.emoji_cache_ts = cache_ts;
    TS.storage.storeCustomEmoji({
      data: ls_emoji.data,
      cache_ts: TS.model.emoji_cache_ts
    });
    _customEmojiWillChange();
    TS.emoji.ingestCustoms(ls_emoji.data);
    _customEmojiDidChange();
  };
})();
(function() {
  "use strict";
  TS.registerModule("ssb", {
    teams_did_load_sig: new signals.Signal,
    onStart: function() {
      if (TS.files) {
        TS.files.team_file_deleted_sig.add(_teamFileDeleted);
      }
    },
    openNewFileWindow: function(file, url, qs) {
      if (_pri) TS.log(_pri, "TS.ssb.openNewFileWindow url: " + url);
      if (TS.client) {
        return TS.client.windows.openFileWindow(file.id, qs);
      } else if (window.is_in_ssb) {
        TS.ssb.upsertFileInSSBParentWin(file);
        if (document.ssb_main) {
          if (document.ssb_main.TS) {
            return document.ssb_main.TS.client.windows.openFileWindow(file.id, url);
          }
          return true;
        } else if (window.winssb && window.opener && window.opener.executeJavaScript) {
          if (_pri) TS.log(_pri, "calling _executeInAtomSSBParentWin for TS.client.windows.openFileWindow");
          _executeInAtomSSBParentWin("TS.client.windows.openFileWindow(" + _prepStringForEval(file.id) + ", " + _prepStringForEval(url) + ");");
          return true;
        }
      }
      return false;
    },
    closeWindow: function() {
      if (!window.is_in_ssb) return false;
      window.close();
      return true;
    },
    setUpAtomSSBWin: function(win) {
      _executeInAtomSSBWin(win, "window.is_in_ssb = true;");
      if (TS.shouldLog(438) && !win._has_console) {
        win._has_console = 1;
      }
    },
    upsertFileInSSBParentWin: function(file) {
      if (!TS.web) return;
      if (document.ssb_main) {
        if (document.ssb_main.TS) document.ssb_main.TS.files.upsertAndSignal(file);
      } else if (window.winssb && window.opener && window.opener.executeJavaScript) {
        if (_pri) TS.log(_pri, "calling _executeInAtomSSBParentWin for TS.files.upsertAndSignal");
        _executeInAtomSSBParentWin("TS.files.upsertAndSignal(" + _prepObjectForEval(file) + ");");
      }
    },
    toggleMuteInWin: function(token, video, handler) {
      if (_pri) TS.log(_pri, "toggleMuteInWin called with token: " + token);
      if (!TS.client) return;
      var win = TS.client.windows.getWinByToken(token);
      if (!win) {
        TS.error("toggleMuteInWin called with bad token: " + token);
        return;
      }
      if (window.macgap) {
        var ret;
        var error;
        try {
          ret = win.window.toggleMute(video);
        } catch (err) {
          TS.error("error calling macgap win.window.toggleMute");
          TS.error(err);
          error = err;
        }
        if (handler) setTimeout(handler, 0, error, ret);
      } else {
        _executeInAtomSSBWin(win, "window.toggleMute(" + _prepBoolForEval(video) + ");", handler);
      }
    },
    teamsDidLoad: function() {
      TS.ssb.teams_did_load_sig.dispatch();
    },
    distributeMsgToWin: function(token, imsg) {
      if (_pri) TS.log(_pri, "distributeMsgToWin called with token: " + token);
      if (!TS.client) return;
      var win = TS.client.windows.getWinByToken(token);
      if (!win) {
        TS.error("distributeMsgToWin called with bad token: " + token);
        return;
      }
      if (window.macgap) {
        try {
          if (win && win.window && win.window.TS && win.window.TS.ms && win.window.TS.ms.msg_handlers) {
            win.window.TS.ms.msg_handlers.msgReceivedFromParentWindow(imsg);
          } else if (_pri) {
            TS.maybeWarn(_pri, "distributeMsgToWin win.window not ready! token: " + token);
          }
        } catch (err) {
          TS.error("error calling macgap win.window.TS.ms.msg_handlers.msgReceivedFromParentWindow");
          TS.error(err);
        }
      } else {
        _executeInAtomSSBWin(win, "TS.ms.msg_handlers.msgReceivedFromParentWindow(" + _prepObjectForEval(imsg) + ");");
      }
    }
  });
  var _prepBoolForEval = function(bool) {
    return (!!bool).toString();
  };
  var _prepObjectForEval = function(ob) {
    return "JSON.parse('" + JSON.stringify(ob || null) + "')";
  };
  var _prepStringForEval = function(str) {
    str = String(str);
    str = str.replace(/"/g, '\\"');
    return '"' + str + '"';
  };
  var _teamFileDeleted = function(file) {
    if (!file) return;
    if (!TS.client) return;
    var win = TS.client.windows.getWinByProp("file_id", file.id);
    if (!win) return;
    setTimeout(function() {
      if (window.macgap) {
        try {
          win.window.TS.files.team_file_deleted_sig.dispatch(file);
        } catch (err) {}
      } else {
        _executeInAtomSSBWin(win, "window.TS.files.team_file_deleted_sig.dispatch(TS.files.getFileById(" + _prepStringForEval(file.id) + "));");
      }
    }, 1e3);
  };
  var _execute_parent_win_Q = [];
  var _executeInAtomSSBParentWin = function(code, handler) {
    return TSSSB.call("executeJavaScriptInParentWindow", {
      code: code,
      callback: handler
    });
  };
  var _executeInAtomSSBParentWinWorker = function(code, handler) {
    if (_pri) TS.log(_pri, 'CALLING _executeInAtomSSBParentWin\n\n"' + code + '"');
    var callNext = function() {
      _execute_parent_win_Q.shift();
      if (_execute_parent_win_Q.length) _executeInAtomSSBParentWinWorker.apply(null, _execute_parent_win_Q[0]);
    };
    var allowance_ms = 2e3;
    var attempts = 1;
    var attempts_max = 2;
    var call = function() {
      var allowance_timer = setTimeout(function() {
        attempts += 1;
        if (attempts > attempts_max) {
          TS.error('_executeInAtomSSBParentWin\n\n"' + code + '"\n\ndid not get a callback in ' + allowance_ms + "ms, bailing");
          callNext();
        } else {
          TS.error('_executeInAtomSSBParentWin\n\n"' + code + '"\n\ndid not get a callback in ' + allowance_ms + "ms, trying again");
          call();
        }
      }, allowance_ms);
      var ret = TSSSB.call("executeJavaScriptInParentWindow", {
        code: code,
        callback: function(err, data) {
          clearTimeout(allowance_timer);
          if (err) {
            TS.error('_executeInAtomSSBParentWin\n\n"' + code + '"\n\nreturned err: ' + err);
          } else {
            var data_log = typeof data === "object" ? JSON.stringify(data, null, 2) : data;
            var pri = attempts == 1 ? 438 : 0;
            TS.log(pri, '_executeInAtomSSBParentWin\n\n"' + code + '"\n\nreturned data: ' + data_log);
          }
          if (handler) handler(err, data);
          setTimeout(callNext, 0);
        }
      });
      if (_pri) TS.log(_pri, 'CALLED _executeInAtomSSBParentWin\n\n"' + code + '"\n\n ret: ' + ret);
      return ret;
    };
    var ret = call();
    return !!ret;
  };
  var _execute_win_Q = [];
  var _executeInAtomSSBWin = function(win, code, handler) {
    return TSSSB.call("executeJavaScriptInWindow", {
      window_token: win.token,
      code: code,
      callback: handler
    });
  };
  var _executeInAtomSSBWinWorker = function(win, code, handler) {
    if (_pri) TS.log(_pri, "CALLING _executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"');
    var callNext = function() {
      _execute_win_Q.shift();
      if (_execute_win_Q.length) _executeInAtomSSBWinWorker.apply(null, _execute_win_Q[0]);
    };
    var allowance_ms = 2e3;
    var attempts = 1;
    var attempts_max = 2;
    var call = function() {
      var allowance_timer = setTimeout(function() {
        attempts += 1;
        if (attempts > attempts_max) {
          TS.error("_executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\ndid not get a callback in ' + allowance_ms + "ms, bailing");
          callNext();
        } else {
          TS.error("_executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\ndid not get a callback in ' + allowance_ms + "ms, trying again");
          call();
        }
      }, allowance_ms);
      var ret = TSSSB.call("executeJavaScriptInWindow", {
        window_token: win.token,
        code: code,
        callback: function(err, data) {
          clearTimeout(allowance_timer);
          if (err) {
            TS.error("_executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\nreturned err: ' + err);
          } else {
            var data_log = typeof data === "object" ? JSON.stringify(data, null, 2) : data;
            var pri = attempts == 1 ? 438 : 0;
            if (_pri) TS.log(pri, "_executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\nreturned data: ' + data_log);
          }
          if (handler) handler(err, data);
          setTimeout(callNext, 0);
        }
      });
      if (_pri) TS.log(_pri, "CALLED _executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\n ret: ' + ret);
      return ret;
    };
    var ret = call();
    return !!ret;
  };
  var _pri = 438;
})();
(function() {
  "use strict";
  TS.registerModule("ui", {
    window_focus_changed_sig: new signals.Signal,
    window_unloaded_sig: new signals.Signal,
    onStart: function() {
      $(window).bind("focus", TS.ui.onWindowFocus);
      $(window).bind("blur", TS.ui.onWindowBlur);
      _maybeListenToPageVisibility();
      $("html").bind("mousedown", function() {
        TS.ui.onWindowFocus({
          target: window
        });
      });
      var has_focus_now = !!(document.hasFocus && document.hasFocus() && window.macgap_is_in_active_space);
      if (has_focus_now) {
        TS.ui.onWindowFocus({
          target: window
        });
      } else {
        TS.ui.onWindowBlur({
          target: window
        });
      }
      if (TS.model.win_ssb_version) $("body").addClass("winssb");
      _initDate();
    },
    setUpWindowUnloadHandlers: function() {
      if (window.macgap) {
        window.onbeforeunload = TS.ui.onWindowUnload;
      } else if (typeof window.addEventListener !== "undefined") {
        window.addEventListener("beforeunload", TS.ui.onWindowUnload, false);
      } else if (typeof document.addEventListener !== "undefined") {
        document.addEventListener("beforeunload", TS.ui.onWindowUnload, false);
      } else if (typeof window.attachEvent !== "undefined") {
        window.attachEvent("onbeforeunload", TS.ui.onWindowUnload);
      } else if (typeof window.onbeforeunload === "function") {
        window.onbeforeunload = function() {
          TS.ui.onWindowUnload();
          return false;
        };
      } else {
        window.onbeforeunload = TS.ui.onWindowUnload;
      }
    },
    onWindowUnload: function() {
      if (TS.client) TS.client.markLastReadsWithAPI();
      TS.model.window_unloading = true;
      TS.ui.window_unloaded_sig.dispatch();
      if (TS.useRedux() || TS.useReactDownloads()) {
        TS.redux.dispatch(TS.interop.redux.entities.window.setUnloading(true));
      }
    },
    maybeTickleMS: function() {
      if (!TS.client) return;
      TS.client.ui.maybeTickleMS();
    },
    handleDraghoverstartFromWinSSB: function() {
      TS.ui.file_share.handleDraghoverstartFromWinSSB();
    },
    handleDraghoverendFromWinSSB: function() {
      TS.ui.file_share.handleDraghoverendFromWinSSB();
    },
    handleDropFromWinSSB: function(files) {
      TS.ui.file_share.handleDropFromWinSSB(files);
    },
    onMacSpaceChanged: function(active) {
      if (!active) {
        TS.ui.onWindowBlur({
          target: window
        });
      } else if (document.hasFocus()) {
        TS.ui.onWindowFocus({
          target: window
        });
      }
    },
    onWindowFocus: function(e) {
      if (e.target !== window && e.target !== document) return;
      if (TS.model.ui.is_window_focused) return;
      TS.model.shift_key_pressed = false;
      TS.model.insert_key_pressed = false;
      TS.model.ui.is_window_focused = true;
      if (TS.view) TS.view.updateTitleBarColor();
      TS.ui.window_focus_changed_sig.dispatch(true);
      if (TS.useRedux() || TS.useReactDownloads()) {
        TS.redux.dispatch(TS.interop.redux.entities.window.updateFocus(true));
      }
    },
    onWindowBlur: function(e) {
      if (e.target !== window && e.target !== document) return;
      if (!TS.model.ui.is_window_focused) return;
      TS.model.shift_key_pressed = false;
      TS.model.insert_key_pressed = false;
      TS.model.ui.is_window_focused = false;
      TS.ui.window_focus_changed_sig.dispatch(false);
      if (TS.useRedux() || TS.useReactDownloads()) {
        TS.redux.dispatch(TS.interop.redux.entities.window.updateFocus(false));
      }
    },
    onWindowVisibilityChange: function(e) {
      if (document.visibilityState === "hidden") {
        TS.ui.onWindowBlur(e);
      } else if (document.visibilityState === "visible") {
        TS.ui.onWindowFocus(e);
      }
    },
    needToShowAtChannelWarning: function(c_id, text) {
      var model_ob;
      var clean_text = TS.format.cleanMsg(text);
      var is_at_everyone = TS.model.everyone_regex.test(clean_text);
      var is_at_channel = TS.model.channel_regex.test(clean_text);
      var is_at_group = TS.model.group_regex.test(clean_text);
      var user_has_seen_it = !!TS.model.prefs.last_seen_at_channel_warning;
      var user_has_seen_it_today = user_has_seen_it && TS.utility.date.sameDay(new Date(TS.model.prefs.last_seen_at_channel_warning), new Date);
      if (!is_at_everyone && !is_at_channel && !is_at_group) return false;
      model_ob = TS.shared.getModelObById(c_id);
      if (!model_ob || model_ob.is_im) return false;
      if ((is_at_channel || is_at_group) && !TS.permissions.members.canAtChannelOrGroup(model_ob.id)) return false;
      if (model_ob.is_general && is_at_everyone && !TS.permissions.members.canAtMentionEveryone(model_ob.id)) return false;
      if (TS.model.team.prefs.warn_before_at_channel === "never") return false;
      if (TS.model.team.prefs.warn_before_at_channel === "once" && user_has_seen_it) return false;
      if (TS.model.team.prefs.warn_before_at_channel === "daily" && user_has_seen_it_today) return false;
      return true;
    },
    needToBlockAtChannelKeyword: function(text_unclean, file, share_channel_id) {
      var comment_text = TS.format.cleanMsg(text_unclean);
      var share_channel = share_channel_id && TS.shared.getModelObById(share_channel_id);
      var is_shared = share_channel && !share_channel.is_im && !share_channel.is_mpim || file && (file.channels.length || file.groups.length);
      if (!is_shared) return false;
      var has_at_everyone = TS.model.everyone_regex.test(comment_text);
      var has_at_here = TS.model.here_regex.test(comment_text);
      var has_at_channel = TS.model.channel_regex.test(comment_text);
      var has_at_group = TS.model.group_regex.test(comment_text);
      var only_general = false;
      if (share_channel) {
        only_general = !!share_channel.is_general;
      } else if (file && file.groups.length === 0 && file.channels.length === 1) {
        var channel = TS.channels.getChannelById(file.channels[0]);
        only_general = !!channel.is_general;
      }
      if (only_general && has_at_everyone && (!has_at_here && !has_at_channel && !has_at_group)) {
        if (TS.permissions.members.canAtMentionEveryone(share_channel_id)) return false;
      }
      if (!TS.permissions.members.canAtChannelOrGroup(share_channel_id)) {
        if (has_at_here) return "@here";
        if (has_at_channel) return "@channel";
        if (has_at_group) return "@group";
        if (has_at_everyone) return "@everyone";
      }
      var is_general = share_channel && share_channel.is_general;
      if (!is_general && file && file.channels) {
        file.channels.forEach(function(c_id) {
          var channel = TS.channels.getChannelById(c_id);
          if (channel && channel.is_general) is_general = true;
        });
      }
      if (is_general && !TS.permissions.members.canAtMentionEveryone(share_channel_id)) {
        if (has_at_everyone || has_at_here || has_at_group || has_at_channel) return "@everyone";
      }
      return false;
    },
    startButtonSpinner: function(btn) {
      TS.ui.resetButtonSpinner(btn);
      var l = _getLadda(btn);
      if (!l.isLoading()) {
        l.start();
      }
    },
    stopButtonSpinner: function(btn, success) {
      var l = _getLadda(btn);
      if (l.isLoading()) {
        l.stop();
        if (success) {
          var original_text = $(btn).find(".ladda-label").text();
          $(btn).data("original_text", original_text);
          $(btn).removeClass("").addClass("btn_success").find(".ladda-label").html('<i class="ts_icon ts_icon_check_circle_o small_right_margin"></i>' + TS.i18n.t("Saved", "ui")());
        }
      }
    },
    resetButtonSpinner: function(btn) {
      var l = _getLadda(btn);
      if (l.isLoading()) {
        return;
      }
      var original_text = $(btn).data("original_text");
      if (original_text) {
        $(btn).find(".ladda-label").text(original_text);
        $(btn).removeData("original_text");
        $(btn).removeClass("btn_success").addClass("");
      }
    },
    showVersionInfo: function() {
      var VERSION_INFO_DIALOG_NAME = "version_info";
      var this_version = new Date(TS.boot_data.version_ts * 1e3) + " (<b>" + TS.boot_data.version_ts + "</b>)";
      TS.generic_dialog.start({
        title: TS.i18n.t("Version Info", "ui")(),
        unique: VERSION_INFO_DIALOG_NAME,
        body: TS.i18n.t('<p>This version: {version_num}</p><p class="latest_version checking">Checking for updates&hellip;</p>', "ui")({
          version_num: this_version
        }),
        show_cancel_button: false,
        go_button_class: "btn_outline",
        go_button_text: TS.i18n.t("Close", "ui")(),
        show_secondary_go_button: false,
        onSecondaryGo: function() {
          TS.reload(false, "TS.ui.showVersionsInfo dialog");
        }
      });
      TS.api.callImmediately("test.versionInfo").then(function(resp) {
        if (!TS.generic_dialog.is_showing || TS.generic_dialog.current_setting.unique != VERSION_INFO_DIALOG_NAME) {
          return;
        }
        var $latest_version = TS.generic_dialog.div.find(".latest_version");
        $latest_version.removeClass("checking");
        var is_up_to_date = resp.data.version_ts.toString() == TS.boot_data.version_ts.toString();
        if (is_up_to_date) {
          $latest_version.html(TS.i18n.t("Your copy of Slack is up-to-date! {tada_emoji}", "ui")({
            tada_emoji: TS.emoji.graphicReplace(":tada:")
          }));
        } else {
          TS.generic_dialog.div.find(".btn.dialog_secondary_go").removeClass("hidden").text("Update");
          var requires_update = resp.data.min_version_ts > TS.boot_data.version_ts;
          if (requires_update) {
            $latest_version.html(TS.i18n.t("An important new version of Slack is available. {sparkles_emoji}", "ui")({
              sparkles_emoji: TS.emoji.graphicReplace(":sparkles:")
            }));
          } else {
            $latest_version.html(TS.i18n.t("A newer version of Slack is available. {sparkles_emoji}", "ui")({
              sparkles_emoji: TS.emoji.graphicReplace(":sparkles:")
            }));
          }
        }
      }).catch(_.noop);
    },
    setThemeClasses: function() {
      $("body").removeClass("dense_theme light_theme");
      if (TS.model.prefs.theme === "dense") {
        $("body").addClass("dense_theme");
      } else if (TS.model.prefs.theme === "light") {
        $("body").addClass("light_theme");
      } else {
        TS.error("no theme?");
        return;
      }
      if (TS.model.prefs.avatars) {
        $("body").removeClass("no_avatars");
      } else {
        $("body").addClass("no_avatars");
      }
    }
  });
  var _visibility_change;
  var _document_hidden;
  var _maybeListenToPageVisibility = function() {
    if (typeof document.hidden !== "undefined") {
      _document_hidden = "hidden";
      _visibility_change = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      _document_hidden = "msHidden";
      _visibility_change = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      _document_hidden = "webkitHidden";
      _visibility_change = "webkitvisibilitychange";
    }
    if (typeof document[_document_hidden] !== "undefined") $(window).bind(_visibility_change, TS.ui.onWindowVisibilityChange);
  };
  var _getLadda = function(btn) {
    var l = $(btn).data("ladda");
    if (!l) {
      l = Ladda.create(btn);
      $(btn).data("ladda", l);
    }
    return l;
  };
  var _initDate = function() {
    $("body").on("click.plastic_date", 'input[type="text"][data-plastic-type="date"]', function(e) {
      var $input = $(e.target);
      if (!$input.pickmeup) return;
      var flat = !!$input.closest("#fs_modal").length || $(this).data("flat");
      $input.pickmeup({
        flat: flat,
        first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
        hide_on_select: true,
        min: $(this).data("min") || null,
        max: $(this).data("max") || null,
        format: $(this).data("format") || "Y-m-d",
        class_name: "plastic_date_picker",
        hide: function() {
          $input.trigger("input");
        },
        locale: {
          days: TS.utility.date.day_names,
          daysShort: TS.utility.date.short_day_names,
          daysMin: TS.utility.date.really_short_day_names,
          months: TS.utility.date.month_names,
          monthsShort: TS.utility.date.short_month_names
        }
      }).pickmeup("show");
      if (flat) {
        var $picker = $input.data("picker");
        if (!$picker) {
          $picker = $('<div class="position_relative no_margin no_padding"></div>');
          $input.data("picker", $picker);
        }
        $input.after($picker.append($input.find(".pickmeup").detach()));
      }
    }).on("keydown.plastic_date", 'input[type="text"][data-plastic-type="date"]', function(e) {
      var $input = $(e.target);
      if (!$input.pickmeup) return;
      if (window.document.activeElement === e.target) $input.pickmeup("hide");
    });
  };
})();
(function() {
  "use strict";
  TS.registerModule("ui.file_share", {
    handleDraghoverstartFromWinSSB: function() {
      $(window).trigger("draghoverstart", [null, true]);
    },
    handleDraghoverendFromWinSSB: function() {
      $(window).trigger("draghoverend");
    },
    handleDropFromWinSSB: function(files) {
      TS.info("handleDropFromWinSSB called files:" + files);
      $("body").removeClass("drop-target");
      if (TS.client.ui.checkForEditing()) {
        return;
      }
      if (!files || !files.length) {
        TS.warn("handleDropFromWinSSB called with no files");
        return;
      }
      TS.client.ui.files.validateFiles(files, TS.model.shift_key_pressed);
    },
    preselected: [],
    bindFileShareDropdowns: function(show_share_prefix, src_model_ob, preselected, allow_create) {
      var $select_share_channels = $("#select_share_channels");
      var chosen_width = "60%";
      if (TS.web && TS.web.space) chosen_width = "100%";
      if ($select_share_channels.length != 1) {
        alert("error: " + $select_share_channels.length + " $('#select_share_channels')s");
        return;
      }
      TS.ui.file_share.preselected = preselected || [];
      _src_model_ob = src_model_ob;
      var data_promise = TS.ui.file_share.promiseToGetFileShareSelectOptions;
      if (allow_create) data_promise = _promiseToGetSelectOptionsWithCreate;
      _file_share_options = {
        append: true,
        single: true,
        data_promise: data_promise,
        approx_item_height: 30,
        tab_to_nav: true,
        template: function(item) {
          return new Handlebars.SafeString(TS.templates.file_sharing_channel_row({
            item: item.model_ob,
            show_share_prefix: show_share_prefix
          }));
        },
        onItemAdded: _fileShareOnChange,
        onListHidden: function() {
          $("#select_share_channels .lfs_list_container").removeClass("new_channel_container");
        },
        renderDividerFunc: function($el, item) {
          if (item.create_channel) {
            $el.html(TS.i18n.t('<span class="new">No items matched <strong>{query}</strong></span>', "files")({
              query: _.escape(item.label)
            }));
            $("#select_share_channels .lfs_list_container").addClass("new_channel_container");
            return;
          }
          $("#select_share_channels .lfs_list_container").removeClass("new_channel_container");
          $el.html(_.escape(item.label)).removeClass("new_channel_not_found");
        },
        setValue: function(val) {
          var i;
          var j;
          var data_length = this.data.length;
          var children_length;
          for (i = 0; i < data_length; i += 1) {
            children_length = this.data[i].children.length;
            for (j = 0; j < children_length; j += 1) {
              if (this.data[i].children[j].model_ob.id === val) {
                this.$container.find('.lfs_item[data-lfs-id="' + [i, j] + '"]').trigger("click");
                return;
              }
            }
          }
        }
      };
      $select_share_channels.lazyFilterSelect(_file_share_options);
      $select_share_channels.css({
        width: chosen_width
      });
      $select_share_channels.one("remove", function() {
        $(this).lazyFilterSelect("destroy");
      });
      $("#file_sharing_div").on("keydown", function(e) {
        if (e.keyCode == 13) {
          e.stopPropagation();
        }
      });
      $select_share_channels.lazyFilterSelect("getInstance").current_items_in_view_signal.add(function(data) {
        var members = data.filter(function(d) {
          return d.model_ob && Object.prototype.hasOwnProperty.call(d.model_ob, "presence");
        }).map(function(d) {
          return d.model_ob.id;
        });
        TS.presence_manager.queryMemberPresence(members);
      });
    },
    promiseToGetFileShareSelectOptions: function(query) {
      var current_model_ob = _getActiveChannelId();
      return TS.searcher.search(query, {
        members: {
          include_self: true
        },
        channels: {
          include_archived: false,
          can_post: true
        },
        groups: {
          include_archived: false
        },
        mpims: true,
        sort: {
          allow_empty_query: true
        }
      }).then(function(data) {
        var preselected = false;
        data.all_items_fetched = true;
        data.filter(function(item) {
          return TS.permissions.members.canPostInChannel(item.model_ob);
        }).forEach(function(item) {
          item.lfs_id = item.model_ob.id;
          item.preselected = _isPreselected(item.model_ob.id, current_model_ob);
          if (item.preselected) preselected = true;
        });
        if (!query && !preselected && current_model_ob) {
          var current_channel = TS.shared.getModelObById(current_model_ob);
          if (_.get(current_channel, "is_im")) {
            var member = TS.members.getMemberById(current_channel.user);
            data.push({
              preselected: true,
              lfs_id: member.id,
              model_ob: member
            });
          } else if (current_channel) {
            if (TS.permissions.members.canPostInChannel(current_channel)) {
              data.push({
                preselected: true,
                lfs_id: current_channel.id,
                model_ob: current_channel
              });
            }
          }
        }
        var member_ids = _(data).map("model_ob").filter(TS.utility.members.isMember).map("id").compact().value();
        TS.presence_manager.queryMemberPresence(member_ids);
        return data;
      });
    },
    bindFileShareShareToggle: function() {
      $("#share_cb").bind("click.toggle_select_list", function() {
        if ($(this).prop("checked")) {
          $(".file_share_select").prop("disabled", false);
        } else {
          $(".file_share_select").prop("disabled", true);
        }
        TS.ui.file_share.updateAtChannelWarningNote();
        TS.ui.file_share.updateAtChannelBlockedNote();
      });
    },
    bindFileShareCommentField: function() {
      $("#file_comment_textarea").bind("keyup", function() {
        TS.ui.file_share.updateAtChannelWarningNote();
        TS.ui.file_share.updateAtChannelBlockedNote();
      });
    },
    updateAtChannelWarningNote: function(did_fetch_all_members) {
      var text = TS.utility.contenteditable.value($("#file_comment_textarea"));
      var c_id;
      var selected = $("#select_share_channels").lazyFilterSelect("value")[0];
      var member_count;
      if (selected) {
        c_id = selected.model_ob.id || "";
      }
      var $note = $("#select_share_at_channel_note");
      if (TS.ui.needToShowAtChannelWarning(c_id, text)) {
        var clean_text = TS.format.cleanMsg(text);
        var keyword = "";
        var show = true;
        if (TS.model.everyone_regex.test(clean_text)) {
          keyword = "everyone";
        } else if (TS.model.channel_regex.test(clean_text)) {
          keyword = "channel";
        } else if (TS.model.group_regex.test(clean_text)) {
          keyword = "group";
        }
        var model_ob = TS.shared.getModelObById(c_id);
        if (!model_ob || model_ob.is_im) show = false;
        if (show && !TS.members.haveAllMembersForModelOb(model_ob) && !did_fetch_all_members) {
          if (TS.membership && TS.membership.lazyLoadChannelMembership()) {
            var counts = TS.membership.getMembershipCounts(model_ob);
            if (counts.promise) {
              member_count = 0;
              counts.promise.then(TS.ui.file_share.updateAtChannelWarningNote);
              show = false;
            } else {
              member_count = _.get(counts, "counts.member_count", 1);
              member_count -= 1;
            }
          } else {
            TS.log(1989, "Flannel: need to fetch all members in " + model_ob.id + " to see if we have to show at-channel dialog");
            TS.flannel.fetchAndUpsertAllMembersForModelObDeprecated(model_ob).then(function() {
              if (!TS.generic_dialog.is_showing) return;
              if (!TS.generic_dialog.div.find("#select_share_channels").length) return;
              var selected = $("#select_share_channels").lazyFilterSelect("value")[0];
              var current_c_id = _.get(selected, "model_ob.id");
              if (current_c_id != c_id) return;
              var fetched_all_members = true;
              TS.ui.file_share.updateAtChannelWarningNote(fetched_all_members);
            }).catch(_.noop);
            show = false;
          }
        }
        var members = [];
        if (_.isUndefined(member_count)) {
          if (show && model_ob && !model_ob.is_im) {
            members = _(model_ob.members).map(TS.members.getMemberById).compact().filter(TS.utility.members.isMemberNonBotNonDeletedNonSelf).sortBy(TS.members.memberSorterByName).value();
            if (members.length < 1) show = false;
          }
        }
        if (show) {
          var html = TS.templates.at_channel_warning_note({
            keyword: keyword,
            member_count: _.isUndefined(member_count) ? members.length : member_count
          });
          $note.html(html);
          $note.removeClass("hidden");
          return;
        }
      }
      $note.addClass("hidden");
    },
    updateAtChannelBlockedNote: function() {
      var text = TS.utility.contenteditable.value($("#file_comment_textarea"));
      var c_id;
      var selected = $("#select_share_channels").lazyFilterSelect("value")[0];
      var $share_cb = $("#share_cb");
      var share_checked = $share_cb.length === 0 || $share_cb.is(":checked");
      if (selected && share_checked) {
        c_id = selected.model_ob.id;
      }
      var $note = $("#select_share_at_channel_blocked_note");
      var $go_btn = $(".modal .btn.dialog_go");
      var keyword = TS.ui.needToBlockAtChannelKeyword(text, null, c_id);
      if (keyword) {
        $note.html(TS.templates.at_channel_blocked_note({
          keyword: keyword
        }));
        $note.removeClass("hidden");
        $go_btn.addClass("disabled");
      } else {
        $note.addClass("hidden");
        $go_btn.removeClass("disabled");
      }
    },
    shouldBlockUploadDialogSubmission: function() {
      var text = TS.utility.contenteditable.value($("#file_comment_textarea"));
      var c_id;
      var selected = $("#select_share_channels").lazyFilterSelect("value")[0];
      var $share_cb = $("#share_cb");
      var share_checked = $share_cb.length === 0 || $share_cb.is(":checked");
      if (selected && share_checked) {
        c_id = selected.model_ob.id;
      }
      var keyword = TS.ui.needToBlockAtChannelKeyword(text, null, c_id);
      if (keyword) {
        TS.info("Can't submit dialog because comment contains " + keyword);
        return true;
      }
      return false;
    },
    fileShowPublicUrlDialog: function(file) {
      if (!file || !file.public_url_shared) return;
      var html = $('<input type="text" id="public_url" class="full_width small">').attr("value", file.permalink_public)[0].outerHTML;
      var title;
      if (TS.boot_data.feature_external_files) {
        title = TS.i18n.t('External link to this file <p style="display: inline-block;font-weight: 400"> (shareable with anyone) </p>', "files")();
      } else {
        title = TS.i18n.t("Public link to this file", "files")();
      }
      TS.generic_dialog.start({
        title: title,
        body: html,
        show_cancel_button: false,
        show_close_button: true,
        show_secondary_go_button: true,
        secondary_go_button_class: "btn_outline",
        secondary_go_button_text: TS.i18n.t("Revoke", "files")(),
        show_go_button: true,
        go_button_text: TS.i18n.t("Done", "files")(),
        esc_for_ok: true,
        onSecondaryGo: function() {
          TS.ui.file_share.fileRevokePublicLink(file.id);
        },
        onGo: function() {
          TS.generic_dialog.cancel();
        },
        onShow: function() {
          TS.generic_dialog.div.on("shown", function shown() {
            TS.generic_dialog.div.off("shown", shown);
            $("#public_url").select().focus().on("keydown", function(e) {
              if (e.which == TS.utility.keymap.esc) TS.generic_dialog.cancel();
            });
          });
        }
      });
    },
    fileRevokePublicLink: function(id) {
      var file = TS.files.getFileById(id);
      if (!file) return false;
      var title;
      var body;
      if (TS.boot_data.feature_external_files) {
        title = TS.i18n.t("Revoke external file link", "files")();
        body = '<p class="no_bottom_margin">' + TS.i18n.t("This will disable the external link for this file. Any previously shared links will stop working.<br /><br />Are you sure you want to revoke this link?", "files")() + "</p>";
      } else {
        title = TS.i18n.t("Revoke public file link", "files")();
        body = '<p class="no_bottom_margin">' + TS.i18n.t("This will disable the Public Link for this file. This will cause any previously shared links to stop working.<br /><br />Are you sure you want to revoke this public link?", "files")() + "</p>";
      }
      TS.generic_dialog.start({
        title: title,
        body: body,
        go_button_text: TS.i18n.t("Revoke it", "files")(),
        go_button_class: "btn_warning",
        onGo: function() {
          TS.files.upsertAndSignal({
            id: file.id,
            public_url_shared: false
          });
          TS.api.callImmediately("files.revokePublicURL", {
            file: file.id
          });
        }
      });
    }
  });
  var _file_share_options = {};
  var _src_model_ob = false;
  var _fileShareOnChange = function(item) {
    $("#select_share_channels .lfs_input_container").removeClass("error");
    if (item.model_ob.create_channel) {
      $("#select_share_channels_note").removeClass("hidden");
      $("#select_share_channels .lfs_value .lfs_item").addClass("new_channel_item");
      $(".modal .dialog_go").text(TS.i18n.t("Next", "files")());
      TS.metrics.count("share_picker_create_clicked");
      return;
    }
    $("#select_share_channels .lfs_value .lfs_item").removeClass("new_channel_item");
    $(".modal .dialog_go").text(TS.i18n.t("Share", "files")());
    var selected_val;
    var type_prefix;
    selected_val = item.model_ob.id;
    if (!selected_val) {
      return;
    }
    $("#share_model_ob_id").val(selected_val);
    $("#select_share_groups_note, #select_share_channels_note, #select_share_ims_note, #select_share_mpims_note, #select_share_channels_join_note").addClass("hidden");
    type_prefix = selected_val.substring(0, 1);
    if (type_prefix === "C") {
      $("#select_share_channels_note").removeClass("hidden");
      $("#share_context_label").text(TS.i18n.t("Share in", "files")());
      var channel = TS.shared.getModelObById(selected_val);
      if (channel && !channel.is_member) {
        $("#select_share_channels_join_note").removeClass("hidden");
      }
    } else if (type_prefix === "U" || type_prefix === "W" || type_prefix === "D") {
      $("#select_share_ims_note").removeClass("hidden");
      $("#share_context_label").text(TS.i18n.t("Share with", "files")());
    } else if (item && item.model_ob && item.model_ob.is_mpim) {
      $("#select_share_mpims_note").removeClass("hidden");
      $("#share_context_label").text(TS.i18n.t("Share with", "files")());
    } else {
      $("#select_share_groups_note").removeClass("hidden");
      $("#share_context_label").text(TS.i18n.t("Share in", "files")());
    }
    $("#share_cb").prop("checked", true);
    TS.ui.file_share.updateAtChannelWarningNote();
    TS.ui.file_share.updateAtChannelBlockedNote();
  };
  var _promiseToGetSelectOptionsWithCreate = function(query) {
    return TS.ui.file_share.promiseToGetFileShareSelectOptions(query).then(function(response) {
      $("#select_share_channels .lfs_list_container").removeClass("new_channel_container");
      if (response.length === 0) {
        var clean_name = TS.utility.channels.getPermissibleChannelName(query);
        if (clean_name) {
          response.push({
            lfs_group: true,
            label: query,
            create_channel: true,
            children: [{
              lfs_id: "c." + clean_name,
              model_ob: {
                create_channel: true,
                name: clean_name
              }
            }]
          });
          $("#select_share_channels .lfs_list_container").addClass("new_channel_container");
          TS.metrics.count("share_picker_create_shown");
        }
      }
      return response;
    });
  };
  var _getActiveChannelId = function() {
    if (TS.client && TS.client.activeChannelIsHidden()) {
      if (_src_model_ob) return _src_model_ob.id;
    } else {
      var active = TS.shared.getActiveModelOb();
      if (active) return active.id;
    }
    if (TS.web && TS.web.space) return TS.web.space.getOriginChannel();
    return null;
  };
  var _isPreselected = function(id, id_to_check_against) {
    return TS.ui.file_share.preselected.length ? TS.ui.file_share.preselected.indexOf(id) > -1 : id === id_to_check_against;
  };
})();
