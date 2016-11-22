(function() {
  "use strict";
  var _console = function(type, pri, args) {
    if (!window.console || !console[type]) return;
    var clean_log = TS.qs_args.clean_log;
    var has_pri = pri !== null;
    args = Array.prototype.slice.call(args);
    if (has_pri) {
      if (!TS.console.shouldLog(pri)) return;
      args.splice(0, 1);
    }
    var all_strings = true;
    var i = args.length;
    while (all_strings && i--) all_strings = typeof args[i] === "string";
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
  if (!window.TS) window.TS = {};
  TS.console = {
    onStart: function() {
      TS.console.setAppropriatePri(true);
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
    log: function(pri) {
      _console("log", pri, arguments);
    },
    info: function() {
      _console("info", null, arguments);
    },
    warn: function() {
      _console("warn", null, arguments);
    },
    maybeWarn: function(pri) {
      _console("warn", pri, arguments);
    },
    error: function() {
      _console("error", null, arguments);
    },
    maybeError: function(pri) {
      _console("error", pri, arguments);
    },
    logError: function(e, desc, subtype) {
      var error = e instanceof Error ? e : new Error;
      var error_json = {
        subtype: subtype ? subtype : "none",
        message: e instanceof Error ? e.message || e.description : JSON.stringify(e),
        fileName: error.fileName || error.sourceURL,
        lineNumber: error.lineNumber || error.line,
        stack: error.stack || error.backtrace || error.stacktrace
      };
      _beaconError(error_json, desc);
      if (window.console && console.error) console.error(TS.makeLogDate() + "logging e:" + e + " e.stack:" + e.stack + " desc:" + desc + " e.message:" + e.message);
    },
    dir: function(pri, ob, txt) {
      if (!window.console || !console.dir) return;
      if (pri && !TS.shouldLog(pri)) return;
      txt = txt || "";
      var dir_json = parseInt(TS.qs_args["dir_json"]);
      if (dir_json) {
        var limit = dir_json == 1 ? "2000" : dir_json;
        try {
          var st = JSON.stringify(ob, null, "  ");
          if (st.length > limit) throw "too long";
          console.info(TS.makeLogDate() + "[** " + pri + " **] " + txt + " " + st);
          return;
        } catch (err) {
          if (err != "too long") {
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
    logStackTrace: function(message) {
      var stack = (new Error).stack;
      var bits;
      if (!stack) {
        bits = ["no stacktrace available"];
      } else {
        bits = stack.split && stack.split("\n") || ["[could not parse stack]", stack];
      }
      bits = _.filter(bits, function(bit) {
        if (bit.indexOf("Error") === 0) return false;
        return bit.trim().length && bit.indexOf("logStackTrace") === -1;
      });
      bits = _.map(bits, function(bit) {
        return bit.trim();
      });
      var details = bits.join("\n");
      if (message) TS.console.info(message + "\nStacktrace: ↴\n", details);
      return details;
    },
    replaceConsoleFunction: function(fn) {
      var prev_console = _console;
      _console = fn;
      return prev_console;
    },
    shouldLog: function(pri) {
      var A = String(TS.pri).split(",");
      if (A.indexOf("all") !== -1 || A.indexOf("*") !== -1) return true;
      if (A.indexOf(String(pri)) !== -1) return true;
      return _keys_to_check.indexOf(pri) > -1;
    },
    test: function() {
      return {
        _console: _console,
        _beaconError: _beaconError
      };
    }
  };
  var _keys_to_check = [];
  var _determineKeysToCheck = function() {
    var pris = String(TS.pri).split(",");
    _keys_to_check = _(Object.keys(TS.boot_data.client_logs || {})).filter(function(key) {
      var obj = TS.boot_data.client_logs[key];
      return pris.some(function(pri) {
        if (obj.numbers.indexOf(pri) > -1) return true;
        if (obj.name && obj.name.indexOf(pri) > -1) return true;
        if (obj.owner && obj.owner.indexOf(pri) > -1) return true;
        return false;
      });
    }).map(function(key) {
      if (parseInt(key, 10) >= 0) return parseInt(key, 10);
      return key;
    }).value();
  };
})();
(function() {
  "use strict";
  var _raw_templates = window.TS && TS.raw_templates;
  var _console_module = window.TS && TS.console;
  window.TS = {
    boot_data: {},
    qs_args: {},
    pri: 0,
    console: _console_module,
    boot: function(boot_data) {
      TS.boot_data = boot_data;
      TS.console.onStart();
      TSConnLogger.log("start", "TS.boot");
      _setClientLoadWatchdogTimer();
      _configureBluebirdBeforeFirstUse(boot_data);
      TS.model.api_url = TS.boot_data.api_url;
      TS.model.async_api_url = TS.boot_data.async_api_url;
      TS.model.api_token = TS.boot_data.api_token;
      TS.model.webhook_url = TS.boot_data.webhook_url;
      TS.model.can_add_ura = TS.boot_data.can_add_ura;
      TS.info("booted! pri:" + TS.pri);
      TS.warn(Date.now() - TSConnLogger.start_time + "ms from first html to TS.boot()");
      if (TS.web && TS.web.space) {
        TS.web.space.showFastPreview();
      }
      $(document).ready(_onDOMReady);
    },
    lazyLoadMembersAndBots: function() {
      return !!TS.boot_data.should_use_flannel;
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
      };
      var namespace = _registerInNamespace(name, Component, "component");
      if (namespace === undefined) {
        _delayed_component_loads[name] = proto;
        return;
      }
      Component.prototype = Object.create(proto);
      Component._name = name;
      _components[name] = Component;
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
      return;
    },
    info: function() {
      TS.console.info.apply(this, [].slice.call(arguments, 0));
      return;
    },
    maybeWarn: function(pri) {
      TS.console.maybeWarn.apply(this, [].slice.call(arguments, 0));
      return;
    },
    warn: function() {
      TS.console.warn.apply(this, [].slice.call(arguments, 0));
      return;
    },
    dir: function(pri, ob, txt) {
      TS.console.dir.apply(this, [].slice.call(arguments, 0));
      return;
    },
    maybeError: function(pri) {
      TS.console.maybeError.apply(this, [].slice.call(arguments, 0));
      return;
    },
    error: function() {
      TS.console.error.apply(this, [].slice.call(arguments, 0));
      return;
    },
    logError: function(e, desc, subtype) {
      TS.console.logError.apply(this, [].slice.call(arguments, 0));
      return;
    },
    getQsArgsForUrl: function(no_cache) {
      if (!no_cache && _qs_url_args_cache) return _qs_url_args_cache;
      _qs_url_args_cache = "";
      for (var k in TS.qs_args) {
        if (k == "export_test") continue;
        _qs_url_args_cache += "&" + k + "=" + TS.qs_args[k];
      }
      return _qs_url_args_cache;
    },
    getAllTeams: function() {
      if (!TS.boot_data) return null;
      if (!TS.model) return null;
      if (!TS.model.team) return null;
      if (!TS.model.user) return null;
      var A = [];
      var ob = {
        id: TS.model.user.id,
        name: TS.model.user.name,
        team_id: TS.model.team.id,
        team_name: TS.model.team.name.replace(/ +/g, " "),
        team_url: TS.boot_data.team_url
      };
      if (TS.model.user.enterprise_user) ob.enterprise_id = TS.model.user.enterprise_user.enterprise_id;
      A.push(ob);
      if (TS.boot_data.other_accounts && typeof TS.boot_data.other_accounts == "object" && !TS.boot_data.other_accounts.length) {
        for (var k in TS.boot_data.other_accounts) {
          var team = _.cloneDeep(TS.boot_data.other_accounts[k]);
          team.id = k;
          team.team_name = team.team_name.replace(/ +/g, " ");
          A.push(team);
        }
      }
      return A;
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
          c++;
        }
        if (TSSSB.call("teamsUpdate", TS.getAllTeams())) {
          TS.info("called TSSSB.call('teamsUpdate')");
        }
        if (TS.view && !c) {
          TS.view.updateTitleBarColor();
        }
      }).catch(function(err) {
        if (window.console && console.warn && console.error) {
          console.warn("unable to do anything with refreshTeams rsp");
          console.error(err);
        }
      });
    },
    ssbChromeClicked: function(on_button) {
      if (on_button) return;
      $("html").trigger("touchstart");
      $(".modal-backdrop").trigger("click");
    },
    reload: function(msg, ts_only_msg) {
      if (msg) {
        TS.info("TS.reload called msg:" + msg);
        TS.generic_dialog.start({
          title: "Reloading!",
          body: msg,
          show_cancel_button: false,
          esc_for_ok: true,
          onGo: function() {
            TS.reload();
          }
        });
        return;
      }
      TS.info("TS.reload happening!");
      if (TS.client && TSSSB.call("reload")) {
        if (TS.model.mac_ssb_version) {
          setInterval(function() {
            window.callSlackAPIUnauthed("api.test", {}, function(ok, data, args) {
              if (ok) {
                window.location.reload();
              }
            });
          }, 1e3);
        }
      } else {
        window.location.reload();
      }
    },
    reloadIfVersionsChanged: function(data) {
      if (TS.model.ms_logged_in_once && data.min_version_ts) {
        if (TS.boot_data.version_ts == "dev") {} else {
          if (parseInt(TS.boot_data.version_ts) < parseInt(data.min_version_ts)) {
            TS.info("calling TS.reload() because parseInt(TS.boot_data.version_ts) < parseInt(data.min_version_ts)");
            TS.reload(null, "calling TS.reload() because parseInt(TS.boot_data.version_ts) < parseInt(data.min_version_ts)");
            return true;
          }
        }
      }
      if (TS.model.ms_logged_in_once && data.cache_version) {
        if (data.cache_version != TS.storage.msgs_version) {
          TS.reload(null, "TS.reload() because data.cache_version " + data.cache_version + " != TS.storage.msgs_version " + TS.storage.msgs_version);
          return true;
        }
      }
      if (!TS.boot_data.feature_web_lean || TS.boot_data.feature_web_lean_all_users) {
        if (TS.model.ms_logged_in_once && data.cache_ts_version) {
          if (data.cache_ts_version != TS.storage.cache_ts_version) {
            TS.reload(null, "TS.reload() because data.cache_ts_version " + data.cache_ts_version + " != TS.storage.cache_ts_version " + TS.storage.cache_ts_version);
            return true;
          }
        }
      }
      return false;
    },
    didWeBootWithCache: function() {
      if (!TS.model.did_we_load_with_user_cache) return false;
      if (!TS.model.did_we_load_with_emoji_cache) return false;
      if (!TS.model.did_we_load_with_app_cache) return false;
      if (!TS.model.did_we_load_with_cmd_cache) return false;
      return true;
    },
    isPartiallyBooted: function() {
      return !!(TS._incremental_boot || TS._did_incremental_boot && !TS._did_full_boot);
    },
    test: function() {
      return {
        _onTemplatesLoaded: _onTemplatesLoaded,
        _allParallelCallsComplete: _allParallelCallsComplete,
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
      for (index; index < len; index++) {
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
  if (!window.TSConnLogger) {
    window.TSConnLogger = {
      log: _.noop,
      logs: [],
      start_time: Date.now(),
      setConnecting: _.noop
    };
  }
  var _loginMS = function() {
    if (!TS.boot_data.feature_do_not_clear_three_day_old_local_storage) {
      if (TS.model.ms_logged_in_once) {
        var since_last_pong_ms = Date.now() - TS.ms.last_pong_time;
        if (since_last_pong_ms > 1e3 * 60 * 5) {
          if (TS.storage.completelyEmptyAllStorageAndResetIfTooOld()) {
            TS.info("going to call TS.reload() after a TS.storage.completelyEmptyAllStorageAndResetIfTooOld() because since_last_pong_ms > 1000*60*5");
            TS.reload(null, "TS.reload() after a TS.storage.completelyEmptyAllStorageAndResetIfTooOld() because since_last_pong_ms > 1000*60*5");
          }
        }
      } else {
        TS.storage.completelyEmptyAllStorageAndResetIfTooOld();
      }
    }
    if (_parallel_rtm_start_rsp) {
      TS.ms.logConnectionFlow("login_with_parallel_rtm_start_rsp");
      TSConnLogger.log("ms_login_parallel", "login_with_parallel_rtm_start_rsp");
      if (TS.boot_data.feature_web_lean_all_users) {
        if (_parallel_users_list_rsp) {
          _parallel_rtm_start_rsp.login_data.updated_users = _parallel_users_list_rsp.data.members;
          _parallel_rtm_start_rsp.login_data.cache_ts = _parallel_users_list_rsp.data.cache_ts;
          _parallel_rtm_start_rsp.login_args.cache_ts = _parallel_users_list_rsp.args.cache_ts;
          _parallel_users_list_rsp = null;
        }
        if (_parallel_bots_list_rsp) {
          _parallel_rtm_start_rsp.login_data.updated_bots = _parallel_bots_list_rsp.data.bots;
          _parallel_bots_list_rsp = null;
        }
      }
      _onLoginMS(_parallel_rtm_start_rsp.ok, _parallel_rtm_start_rsp.login_data, _parallel_rtm_start_rsp.login_args);
      _parallel_rtm_start_rsp = null;
    } else {
      _callRTMStart(_onLoginMS);
    }
  };
  var _reconnectRequestedMS = function() {
    if (TS.model.ms_asleep) {
      TS.error("NOT reconnecting, we are asleep");
      return;
    }
    TSConnLogger.setConnecting(true);
    TS.info("MS reconnection requested");
    TS.metrics.mark("ms_reconnect_requested");
    TS.ms.connected_sig.addOnce(function() {
      var reconnect_duration_ms = TS.metrics.measureAndClear("ms_reconnect_delay", "ms_reconnect_requested");
      TS.info("OK, MS is now reconnected -- it took " + _.round(reconnect_duration_ms / 1e3, 2) + " seconds");
    });
    _loginMS();
  };
  var _getMSLoginArgs = function() {
    var login_args = {
      agent: "webapp_" + TS.boot_data.version_uid,
      simple_latest: true
    };
    if (TS.boot_data.feature_no_unread_counts) {
      login_args.no_unreads = true;
    }
    if (!TS.boot_data.feature_web_lean) {
      login_args.cache_ts = _last_rtm_start_event_ts || TS.storage.fetchLastCacheTS();
      if (TS.pri && (!login_args.cache_ts || parseInt(login_args.cache_ts, 10) == 0 || isNaN(login_args.cache_ts))) {
        TS.log(488, "_getMSLoginArgs(): login_args.cache_ts is 0/undefined?", login_args);
      }
      if (TS.lazyLoadMembersAndBots()) {
        login_args.no_users = true;
        login_args.no_bots = true;
        login_args.cache_ts = 0;
      }
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
    login_args.mpim_aware = true;
    if (TS.boot_data.feature_elide_closed_dms && !TS.boot_data.page_needs_all_ims) {
      login_args.only_relevant_ims = true;
    }
    if (TS.boot_data.feature_name_tagging_client) {
      login_args.name_tagging = true;
    }
    if (TS.boot_data.feature_canonical_avatars_web_client) {
      login_args.canonical_avatars = true;
    }
    login_args.eac_cache_ts = true;
    if (TS.lazyLoadMembersAndBots()) {
      for (var k in TS.qs_args) {
        if (k.indexOf("feature_" === 0)) {
          TS.log(1989, "Flannel: Appending " + k + " (" + TS.qs_args[k] + ") to login_args");
          login_args[k] = TS.qs_args[k];
        }
      }
    }
    if (TS.lazyLoadMembersAndBots()) TS.log(1989, "Flannel: MS login args:", login_args);
    return login_args;
  };
  var _callRTMStart = function(handler) {
    var should_attempt_incremental_boot = TS.incremental_boot && TS.incremental_boot.shouldIncrementalBoot();
    var rtm_start_p = _promiseToCallRTMStart();
    if (!should_attempt_incremental_boot) {
      TS.info("Starting non-incremental boot");
      return _performNonIncrementalBoot(rtm_start_p, handler);
    }
    _pending_rtm_start_p = rtm_start_p;
    TS.info("Starting incremental boot");
    TS.incremental_boot.startIncrementalBoot().then(function(resp) {
      handler(true, resp.data, resp.args);
      return null;
    }).catch(function() {
      TS.info("Recovering from incremental boot error");
      _pending_rtm_start_p = undefined;
      return _performNonIncrementalBoot(rtm_start_p, handler);
    });
  };
  var _performNonIncrementalBoot = function(rtm_start_p, handler) {
    return rtm_start_p.tap(_rtmStartOKHandler).then(function(resp) {
      var ok = true;
      handler(ok, resp.data, resp.args);
      return null;
    }).catch(_rtmStartErrorHandler);
  };
  var _promiseToCallRTMStart = function() {
    if (TS.qs_args["no_rtm_start"]) {
      return new Promise(function(resolve, reject) {
        TS.resumeRTMStart = function() {
          delete TS.resumeRTMStart;
          delete TS.qs_args["no_rtm_start"];
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
    if (TS.lazyLoadMembersAndBots()) {
      if (!_ms_rtm_start_p) {
        if (TS.model.ms_connected) {
          TS.log(1989, "Bad news: we're trying to do an rtm.start from Flannel while we're already connected, and that won't work.");
          return Promise.reject(new Error("rtm.start-over-WebSocket failed"));
        }
        _ms_rtm_start_p = TS.flannel.connectAndFetchRtmStart(_getMSLoginArgs());
      }
      var rtm_start_p = _ms_rtm_start_p;
      _ms_rtm_start_p = undefined;
      return rtm_start_p.then(function(rtm_start_data) {
        TS.log(1989, "Flannel: got rtm.start response 💕");
        _failed_rtm_start_attempts = 0;
        return {
          ok: true,
          args: {},
          data: rtm_start_data
        };
      }).catch(function(err) {
        TS.log(1989, "Flannel: rtm.start fetch failed or timed out 💔");
        console.log(err, err.stack);
        _failed_rtm_start_attempts++;
        TS.log(1989, "Checking for internet connectivity before trying rtm.start fetch again...");
        var wait_start_time = performance.now();
        return TS.api.connection.waitForAPIConnection().then(function() {
          var MAX_RTM_START_DELAY_MS = 15e3;
          var DELAY_PER_FAILED_RTM_START_ATTEMPT_MS = 3e3;
          _rtm_start_retry_delay_ms = Math.min(MAX_RTM_START_DELAY_MS, _failed_rtm_start_attempts * DELAY_PER_FAILED_RTM_START_ATTEMPT_MS);
          var time_spent_waiting_for_connection = Math.floor(performance.now() - wait_start_time);
          _rtm_start_retry_delay_ms = Math.max(0, _rtm_start_retry_delay_ms - time_spent_waiting_for_connection);
          TS.log(1989, "OK, spent " + time_spent_waiting_for_connection + " ms waiting for internet connectivity");
          return _promiseToCallRTMStart();
        });
      });
    }
    if (TS.model.calling_rtm_start) {
      var error_msg = "_callRTMStart was called but TS.model.calling_rtm_start=true";
      TS.error(error_msg);
      return Promise.reject(new Error(error_msg));
    }
    TS.ms.logConnectionFlow("login");
    TSConnLogger.log("call_rtm_start", "_callRTMStart");
    TS.model.rtm_start_throttler++;
    TS.model.calling_rtm_start = true;
    var method = TS.boot_data.feature_web_lean ? "rtm.leanStart" : "rtm.start";
    return TS.api.callImmediately(method, _getMSLoginArgs());
  };
  var _rtmStartOKHandler = function(resp) {
    TS.model.calling_rtm_start = false;
    if (resp.data.latest_event_ts) {
      TS.info("rtm.start included latest event timestamp: " + resp.data.latest_event_ts);
      _last_rtm_start_event_ts = parseInt(resp.data.latest_event_ts, 10);
    }
    TS.model.deferred_archived_channels = _.filter(resp.data.channels, function(c) {
      c.is_archived && !TS.channels.lookupById(c.id);
    });
    resp.data.channels = _.difference(resp.data.channels, TS.model.deferred_archived_channels);
    TS.model.deferred_archived_groups = _.filter(resp.data.groups, function(g) {
      g.is_archived && !TS.groups.lookupById(g.id);
    });
    resp.data.groups = _.difference(resp.data.groups, TS.model.deferred_archived_groups);
  };
  var _rtmStartErrorHandler = function(resp) {
    TS.model.calling_rtm_start = false;
    var error = resp.data && resp.data.error;
    if (error == "user_removed_from_team" && TS.boot_data.feature_user_removed_from_team) {
      TS.warn("You have been removed from the " + TS.model.team.name + " team.");
      if (TS.client) TS.client.userRemovedFromTeam(TS.model.team.id);
    }
    if (error == "account_inactive" || error == "team_disabled" || error == "invalid_auth") {
      TSSSB.call("invalidateAuth");
      TS.info("calling TS.reload() because resp.data.error: " + error);
      TS.reload(null, "calling TS.reload() because resp.data.error: " + error);
      return;
    }
    if (error == "clear_cache") {
      TS.info("calling TS.storage.flush() and TS.reload() because resp.data.error: " + error);
      var also_clear_cache = true;
      TS.storage.flush(also_clear_cache);
      TS.reload(null, "calling TS.reload() because resp.data.error: " + error);
      return;
    }
    TS.ms.logConnectionFlow("on_login_failure");
    TS.ms.onFailure("rtm.start call failed with error: " + (error || "no error on resp.data"));
    var RTM_START_ERROR_MIN_DELAY = 5;
    var RTM_START_ERROR_MAX_DELAY = 60;
    var retry_after_secs = parseInt(_.get(resp, "data.retry_after"), 10);
    TS.info("rtm.start failed; retry_after = " + retry_after_secs);
    _rtm_start_retry_delay_ms = 1e3 * _.clamp(retry_after_secs, RTM_START_ERROR_MIN_DELAY, RTM_START_ERROR_MAX_DELAY);
    return null;
  };
  var _callRTMStartInParallel = function() {
    TSConnLogger.log("call_rtm_start_in_parallel", "_callRTMStartInParallel", null, {
      ephemeral: true
    });
    return new Promise(function(resolve) {
      _callRTMStart(function(ok, data, args) {
        _parallel_rtm_start_rsp = {
          ok: ok,
          login_data: data,
          login_args: args
        };
        resolve();
      });
    });
  };
  var _callUsersListInParallel = function(cache_ts) {
    return new Promise(function(resolve, reject) {
      TS.api.callImmediately("users.list", {
        cache_ts: cache_ts
      }).then(function(resp) {
        _parallel_users_list_rsp = {
          ok: resp.ok,
          data: resp.data,
          args: resp.args
        };
        resolve();
      }, function(error) {
        reject(error);
      });
    });
  };
  var _callBotsListInParallel = function(cache_ts) {
    return new Promise(function(resolve, reject) {
      TS.api.callImmediately("bots.list", {
        cache_ts: cache_ts
      }).then(function(resp) {
        _parallel_bots_list_rsp = {
          ok: resp.ok,
          data: resp.data,
          args: resp.args
        };
        resolve();
      }, function(error) {
        reject(error);
      });
    });
  };
  var _onLoginMS = function(ok, data, args) {
    if (!ok) return;
    TS.model.emoji_cache_ts = data.emoji_cache_ts;
    TS.model.apps_cache_ts = data.apps_cache_ts;
    TS.model.commands_cache_ts = data.commands_cache_ts;
    if (TS.boot_data.feature_latest_event_ts) {
      if (!TS.model.ms_logged_in_once && !TS.storage.fetchLastEventTS() && data.latest_event_ts) {
        TS.ms.connected_sig.addOnce(function() {
          TS.ms.storeLastEventTS(data.latest_event_ts, "_onLoginMS");
        });
      }
    }
    if (TS.client) {
      if (TS.reloadIfVersionsChanged(data)) return;
    }
    if (!data.self) {
      TS.error("No self?");
      return;
    }
    if (!data.team) {
      TS.error("No team?");
      return;
    }
    TS.ms.logConnectionFlow("on_login");
    return _setUpModel(data, args).then(function() {
      TS.apps.setUp();
      TS.cmd_handlers.setUpCmds();
      var no_rebuild_ui = !TS.model.ms_logged_in_once;
      TS.emoji.setUpEmoji(no_rebuild_ui).then(function() {
        return _continueOnLogin(data);
      });
      return null;
    }).catch(function(err) {
      TS.error("_setUpModel failed with err: " + (err ? err.message : "no err provided"));
      TS.dir(err);
    });
  };
  var _continueOnLogin = function(data) {
    TS.ui.setThemeClasses();
    if (TS.client) {
      TSSSB.call("setCurrentTeam", TS.model.team.domain);
      TS.client.updateTeamIcon();
    }
    if (TS.client && !TS.boot_data.feature_server_side_emoji_counts) {
      TS.model.emoji_use = TS.model.emoji_use || {};
      var ls_emoji_use = TS.storage.fetchEmojiUse();
      var ls_len = Object.keys(ls_emoji_use).length;
      var pref_len = Object.keys(TS.model.emoji_use).length;
      if (pref_len === 0 && ls_len == 0) {
        TS.log(777, "kicking off emoji_use filling because it is empty");
        TS.api.callFuncWhenApiQisEmpty(TS.utility.msgs.populateEmojiUsePrefFromExistingMsgs);
      } else if (TS.prefs.mergeEmojiUse(ls_emoji_use)) {
        TS.log(777, "saving emoji_use onlogin cause it looks like we failed to save last time");
        TS.api.callFuncWhenApiQisEmpty(TS.prefs.saveEmojiUse);
      } else {
        TS.log(777, "making sure we have emoji_use in LS");
        TS.storage.storeEmojiUse(TS.model.emoji_use);
      }
    }
    var completeOnLogin = function() {
      TSConnLogger.log("on_login_ms", "completeOnLogin");
      var completing_incremental_boot = !!TS._incremental_boot;
      if (!TS.model.ms_logged_in_once) {
        if (TS.client) {
          TS.client.onFirstLoginMS(data);
          if (TS.isPartiallyBooted()) {
            TS.info("Finalizing incremental boot");
            TS.incremental_boot.beforeFullBoot();
            var users_from_incr_boot = TS.lazyLoadMembersAndBots() ? _.map(TS.model.members, "id") : null;
            _performNonIncrementalBoot(_pending_rtm_start_p, _onLoginMS).then(function() {
              if (TS.lazyLoadMembersAndBots()) {
                _pending_rtm_start_p.then(function(rtm_start) {
                  var ready_to_query_p = new Promise(function(resolve) {
                    if (TS.model.ms_connected) {
                      resolve();
                    } else {
                      TS.ms.connected_sig.addOnce(resolve);
                    }
                  });
                  var users_from_rtm_start = _.map(rtm_start.data.users, "id");
                  var users_to_refetch = _.difference(users_from_incr_boot, users_from_rtm_start);
                  if (!users_to_refetch.length) {
                    TS.log(1989, "No need to re-fetch any members for presence status");
                    return;
                  }
                  ready_to_query_p.then(function() {
                    TS.log(1989, "Re-fetching " + users_to_refetch.length + " members so we have presence status");
                    TS.flannel.fetchAndUpsertObjectsByIds(users_to_refetch);
                  });
                  return null;
                });
              }
              _pending_rtm_start_p = undefined;
              TS.incremental_boot.afterFullBoot();
              TS.info("Completed incremental boot");
            });
          } else {
            $("#col_channels, #team_menu").removeClass("placeholder");
          }
          TSConnLogger.log("on_first_login_ms", "onFirstLoginMS hiding loading screen");
          _reportLoad();
          _reportLoadTiming("timing-www-perceived-load");
          TSSSB.call("didFinishLoading");
        }
        if (TS.web) {
          TS.web.onFirstLoginMS(data);
          if (!TS.boot_data.page_has_ms) {
            if (TS.web.space) {
              _loginDS();
            }
          }
        }
      }
      if (TS.client) TS.client.onEveryLoginMS(data);
      if (TS.web) TS.web.onEveryLoginMS(data);
      if (_shouldConnectToMS()) {
        if (!completing_incremental_boot) {
          if (TS.ms.hasProvisionalConnection() && TS.ms.finalizeProvisionalConnection()) {
            TS.log(1996, "Successfully finalized a provisional MS connection");
          } else {
            TS.log(1996, "No valid provisional MS connection; making a new connection");
            TS.ms.connectImmediately(TS.model.team.url || TS.boot_data.ms_connect_url);
          }
        }
      } else {
        if (!TS.web.space) {
          TSConnLogger.setConnecting(false);
        }
      }
      TS.model.ms_logged_in_once = true;
      if (!TS.model.ms_connection_start_ts) TS.model.ms_connection_start_ts = Date.now();
      return Promise.resolve();
    };
    if (TS.client && TS._incremental_boot) {} else if (TS.client) {
      TS.client.calculateInitialCid();
      if (!TS.model.initial_cid) {
        var error_msg = "TS.client.calculateInitialCid() failed to find a channel";
        TS.error(error_msg);
        return Promise.reject(new Error(error_msg));
      }
    }
    if (TS.client && TS.boot_data.feature_web_lean) {
      return TS.shared.fetchInitialModelObData(TS.model.initial_cid).then(function() {
        return completeOnLogin();
      });
    } else {
      if (TS.client && TS.boot_data.page_needs_enterprise && TS.model.initial_cid) {
        var model_ob = TS.shared.getModelObById(TS.model.initial_cid);
        if (!model_ob) TS.error("TS.model.initial_cid (" + TS.model.initial_cid + ") referred to a channel that does not exist, which should be impossible");
        if (model_ob.is_shared && model_ob.is_channel) return TS.channels.promiseToEnsureChannelsInfo(TS.model.initial_cid, true).then(completeOnLogin);
        if (model_ob.is_shared && model_ob.is_group && !model_ob.is_mpim) return TS.groups.promiseToEnsureGroupsInfo(TS.model.initial_cid, true).then(completeOnLogin);
      }
      return completeOnLogin();
    }
  };
  var _socketConnectedMS = function() {
    if (!TS.boot_data.page_has_ms) return;
    if (!TS.web) return;
    if (!TS.web.space) return;
    _reconnectRequestedDS();
  };
  var _socketDisconnectedMS = function() {
    TS.shared.getAllModelObsForUser().forEach(function(model_ob) {
      if (model_ob._consistency_has_been_checked) delete model_ob._consistency_has_been_checked;
      if (model_ob._consistency_is_being_checked) delete model_ob._consistency_is_being_checked;
    });
    if (!TS.boot_data.page_has_ms) return;
    if (!TS.web) return;
    if (!TS.web.space) return;
    TS.ds.disconnect();
  };
  var _failed_rtm_start_attempts = 0;
  var _rtm_start_retry_delay_ms;
  var _last_rtm_start_event_ts;
  var _ms_rtm_start_p;
  var _pending_rtm_start_p;
  TS.qs_args = function() {
    var qs = location.search.substring(1);
    var args = {};
    var pairs;
    pairs = qs.split("&");
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i].indexOf("=");
      if (p != -1) {
        var name = pairs[i].substring(0, p);
        var value = pairs[i].substring(p + 1);
        args[name] = unescape(value);
      }
    }
    return args;
  }();
  TS.pri = TS.qs_args.pri ? TS.qs_args.pri + ",0" : TS.pri;
  var _dom_is_ready = false;
  var _ds_last_login_tim = 0;
  var _ds_last_login_ms = 0;
  var _parallel_rtm_start_rsp;
  var _parallel_users_list_rsp;
  var _parallel_bots_list_rsp;
  var _parallel_documents_connect_rsp;
  var _qs_url_args_cache;
  var _allParallelCallsComplete = function() {
    TSConnLogger.log("parallel_complete", "_allParallelCallsComplete(), calling gogogos");
    if (TS.client) {
      TSSSB.call("didStartLoading", 6e4);
    }
    if (TS.model.is_our_app) {
      _initSleepWake();
    }
    TS.ui.setUpWindowUnloadHandlers();
    if (TS.boot_data.app == "client") {
      TS.client.gogogo();
    } else if (TS.boot_data.app == "web" || TS.boot_data.app == "space" || TS.boot_data.app == "calls") {
      TS.web.gogogo();
    }
    if (TS.boot_data.no_login) {
      TS.info("running without a user");
      if (TS.web) TS.web.no_login_complete_sig.dispatch();
    } else {
      _loginMS();
    }
    return Promise.resolve();
  };
  var _reconnectRequestedDS = function() {
    if (TS.model.ds_asleep) {
      TS.error("NOT reconnecting, we are asleep");
      return;
    }
    TSConnLogger.setConnecting(true);
    if (TS.boot_data.page_has_ms) {
      if (TS.model.ms_connected) {
        _loginDS();
      }
    } else {
      _loginDS();
    }
  };
  var _getDSLoginArgs = function() {
    var login_args = {
      _login_ms: _ds_last_login_ms
    };
    login_args.file = boot_data.file.id;
    return login_args;
  };
  var _callDocumentsConnectInParallel = function() {
    return Promise(function(resolve) {
      _callDocumentsConnect(function(ok, data, args) {
        _parallel_documents_connect_rsp = {
          ok: ok,
          login_data: data,
          login_args: args
        };
        resolve();
      });
    });
  };
  var _callDocumentsConnect = function(handler) {
    TS.ds.logConnectionFlow("_loginDS");
    TSConnLogger.log("call_documents_connect", "TS._callDocumentsConnect");
    clearTimeout(_ds_last_login_tim);
    _ds_last_login_tim = setTimeout(function() {
      clearTimeout(_ds_last_login_tim);
      TS.ds.logConnectionFlow("last_login_timeout");
      TS.ds.onFailure("15secs passed, no files.documents.connect rsp");
    }, 15e3);
    TS.model.rtd_start_throttler++;
    TS.api.callImmediately("files.documents.connect", _getDSLoginArgs(), handler);
  };
  var _loginDS = function() {
    TS.info("_loginDS");
    _ds_last_login_ms = Date.now();
    var login_args = _getDSLoginArgs();
    if (TS.boot_data.space_login_data) {
      TSConnLogger.log("ds_login_with_boot_data", "ds_login_with_boot_data");
      TS.ds.logConnectionFlow("login_with_boot_data");
      _onLoginDS(true, {
        data: TS.boot_data.space_login_data
      }, login_args);
      delete TS.boot_data.space_login_data;
    } else if (_parallel_documents_connect_rsp) {
      TS.ms.logConnectionFlow("login_with_parallel_documents_connect_rsp");
      TSConnLogger.log("ds_login_parallel", "login_with_parallel_documents_connect_rsp");
      _onLoginDS(_parallel_documents_connect_rsp.ok, _parallel_documents_connect_rsp.login_data, _parallel_documents_connect_rsp.login_args);
      _parallel_documents_connect_rsp = null;
    } else {
      _callDocumentsConnect(_onLoginDS);
    }
  };
  var _onLoginDS = function(ok, data, args) {
    clearTimeout(_ds_last_login_tim);
    if (_ds_last_login_ms != args._login_ms) {
      TS.warn("ignoring this files.documents.connect rsp, it came too late (_ds_last_login_ms != args._login_ms)");
      return;
    }
    if (!ok) {
      if (data && (data.error == "account_inactive" || data.error == "team_disabled" || data.error == "invalid_auth")) {
        alert("_onLoginDS data.error: " + data.error);
        return;
      }
      TS.ds.logConnectionFlow("on_login_failure");
      TS.ds.onFailure("API files.documents.connect rsp was no good: " + (data && data.error ? "data.error:" + data.error : "unspecified error"));
      return;
    }
    if (!data.data) {
      TS.error("No data.data?");
      return;
    }
    if (!data.data.ws) {
      TS.error("No ws url?");
      TS.ds.logConnectionFlow("on_login_missing_ws");
      TS.ds.onFailure("no ws url in response to a documents.connectUser call, calling api again now.");
      return;
    }
    TS.web.space.login_data = data.data;
    TS.ds.logConnectionFlow("on_login");
    TSConnLogger.log("on_login_ds", "_onLoginDS");
    if (!TS.model.ds_logged_in_once) {
      _reportLoad();
      _reportLoadTiming("timing-spaces-perceived-load");
    }
    if (!TS.model.ds_logged_in_once) {
      TS.warn(new Date - TSConnLogger.start_time + "ms from first html to ds_login_sig.dispatch()");
      TS.web.ds_login_sig.dispatch();
    }
    TS.ds.connect();
    TS.model.ds_logged_in_once = true;
  };
  var _socketDisconnectedDS = function() {
    if (!TS.boot_data.page_has_ms) return;
    TS.ms.disconnect();
  };
  var _client_load_watchdog_tim = null;
  var _client_load_watchdog_ms = 1e4;
  var _setClientLoadWatchdogTimer = function() {
    if (!TS.client) return;
    if (_client_load_watchdog_tim !== null) {
      _logDataToServer("www-load-watchdog-v2", _client_load_watchdog_ms);
      _client_load_watchdog_ms *= 2;
    }
    if (_client_load_watchdog_ms < 3e5) {
      _client_load_watchdog_tim = window.setTimeout(_setClientLoadWatchdogTimer, _client_load_watchdog_ms);
    }
  };
  var _logSessionLoadCount = function() {
    if (!window.sessionStorage) return;
    try {
      var name = TS.client ? "session_load_count_client" : "session_load_count_web";
      var cnt = parseInt(sessionStorage.getItem(name) || 0) + 1;
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
      longStackTraces: boot_data.version_ts == "dev",
      warnings: boot_data.version_ts == "dev",
      cancellation: true
    });
  };
  var _modules = {};
  var _delayed_module_loads = {};
  var _components = {};
  var _delayed_component_loads = {};
  var _monkeyed_functions = [];
  var _monkeyed_signals = [];
  var _monkeyWatch = window._monkeyWatch = function(ob, name, limit, log) {
    log = log !== false && (log || TS.shouldLog(621));
    var logSignalDispatch = function(path, sig, args, duration) {
      var str = "SIGN: " + duration + "ms " + path + ".dispatch()";
      if (duration > 30) {
        console.warn(str);
      } else {}
    };
    var logFunctionCall = function(path, args, duration) {
      var str = "FUNC: " + duration + "ms " + path + "()";
      if (duration > 30) {
        console.warn(str);
      } else {}
    };
    name = name || "ROOT";
    var seens = [];
    var limit = parseInt(limit) || 1;
    var start = Date.now();
    var signals_c = 0;
    var funcs_c = 0;
    var c = 0;
    var worker = function(ob, path) {
      if (typeof ob !== "object") return;
      c++;
      if (c >= limit) {
        TS.info("_monkeyWatch BAILING at limit:" + limit);
        return;
      }
      seens.push(ob);
      var k;
      var val;
      var this_path;
      for (k in ob) {
        c++;
        if (c >= limit) {
          TS.info("_monkeyWatch BAILING at limit:" + limit);
          return;
        }
        val = ob[k];
        this_path = path + "." + k;
        if (log) TS.warn(this_path);
        if (typeof val === "function") {
          funcs_c++;
          if (_monkeyed_functions.indexOf(val) == -1 && !val.monkeyed) {
            if (log) TS.info(c + " " + this_path + " FUNCTION OVERRIDDEN");
            TS.utility.ensureInArray(_monkeyed_functions, val);
            var original_k = ob[k];
            ob[k] = function() {
              var start = Date.now();
              var ret = original_k.apply(this, arguments);
              logFunctionCall(this_path, arguments, Date.now() - start);
              this.monkeyed = true;
              return ret;
            };
          } else {
            if (log) TS.warn(c + " " + this_path + " function already overridden");
          }
        } else if (typeof val === "object") {
          if (seens.indexOf(val) != -1) {} else if (val instanceof Array) {} else if (val instanceof Date) {} else if (val instanceof HTMLElement) {} else if (val instanceof Node) {} else if (val instanceof jQuery) {} else if (val instanceof signals) {
            signals_c++;
            if (_monkeyed_signals.indexOf(val) == -1) {
              if (log) TS.info(c + " " + this_path + " SIGNAL.DISPATCH OVERRIDDEN");
              TS.utility.ensureInArray(_monkeyed_signals, val);
              var original_dispatch = val.dispatch;
              val.dispatch = function() {
                var start = Date.now();
                var ret = original_dispatch.apply(this, arguments);
                logSignalDispatch(this_path, this, arguments, Date.now() - start);
                return ret;
              };
            } else {
              if (log) TS.warn(c + " " + this_path + " signal.dispatch already overridden");
            }
          } else {
            worker(val, this_path);
          }
        }
      }
    };
    worker(ob, name);
    TS.info("_monkeyWatch took " + (Date.now() - start) + "ms for " + c + " items, " + seens.length + " objects, " + funcs_c + " functions, " + signals_c + " signals");
  };
  var _reportLoad = function(i, type) {
    if (!TSConnLogger.logs.length) return;
    if (!TS.model || !TS.model.team || !TS.boot_data.feature_tinyspeck) return;
    if (TS.model.prefs && !TS.model.prefs.seen_welcome_2) return;
    TS.dir(88, TSConnLogger.logs);
    if (!TS.client || !TS.ims) return;
    type = type || "short";
    i = i || TSConnLogger.logs.length - 1;
    var total = TSConnLogger.logs[i]["t"];
    var text = "total time: " + total + "s (at index " + i + ")";
    var report;
    var im;
    var report_str = "";
    TSConnLogger.logs.forEach(function(item, i) {
      var duration = i > 0 ? item.t * 1e3 - TSConnLogger.logs[i - 1].t * 1e3 : 0;
      var bold = duration > 10 ? "*" : "";
      report_str += bold + item.t + " " + item.k + " (" + duration + ")" + bold + "\n";
    });
    if (type == "complete") {
      report = "_reportLoad(" + i + ", 'snippet')";
      TS.client.msg_pane.addMaybeClick(report, _reportLoad.bind(Object.create(null), i, "snippet"));
      text += "\n" + report_str;
      text += "\n<javascript:" + report + ")|share this with eric as a snippet>";
    } else if (type == "short") {
      report = "_reportLoad(" + i + ", 'complete')";
      TS.client.msg_pane.addMaybeClick(report, _reportLoad.bind(Object.create(null), i, "complete"));
      text += " <javascript:" + report + "|click for details>";
    } else if (type == "snippet") {
      text += "\n" + navigator.userAgent + "\n" + "version_ts: " + TS.boot_data.version_ts + "\n";
      "version_uid: " + TS.boot_data.version_uid + "\n";
      if (TS.storage && TS.storage.storageAvailable) {
        text += "TS.storage.storageAvailable: " + TS.storage.storageAvailable + "\n" + "TS.storage.storageSize(): " + TS.storage.storageSize() + "\n";
        text += "TS.storage.version: " + TS.storage.version + "\n" + "TS.storage.fetchStorageVersion(): " + TS.storage.fetchStorageVersion() + "\n" + "TS.storage.msgs_version: " + TS.storage.msgs_version + "\n";
        if (TS.model) {
          text += "TS.model.initial_ui_state_str: " + TS.model.initial_ui_state_str + "\n";
        }
      }
      text += report_str;
      im = TS.ims.getImByUsername("eric");
      TS.files.upload({
        text: text,
        title: "load times " + TS.utility.date.toDate(TS.utility.date.makeTsStamp()),
        filetype: "javascript",
        channels: im ? [im.id] : null,
        initial_comment: ""
      });
      return;
    } else {
      alert("type:" + type);
      return;
    }
    var msg = {
      type: "message",
      subtype: "bot_message",
      username: "loadBot",
      icons: {
        emoji: ":rocket:"
      },
      is_ephemeral: true,
      ts: TS.utility.date.makeTsStamp(),
      text: text,
      no_notifications: true
    };
    im = TS.ims.getImByMemberId("USLACKBOT");
    if (im) {
      TS.ims.addMsg(im.id, msg);
    }
  };
  var _reportLoadTiming = function(key) {
    window.clearTimeout(_client_load_watchdog_tim);
    if (!window.performance) return;
    if (!performance.timing) return;
    _logDataToServer(key, Date.now() - window.performance.timing.navigationStart);
  };
  var _logDataToServer = function(key, value) {
    var team = "";
    if (TS && TS.model && TS.model.team) {
      team = TS.model.team.id;
    }
    var xhr = new XMLHttpRequest;
    var url = "/log204?k=" + key + "&v=" + value + "&t=" + team;
    xhr.open("GET", url, true);
    xhr.send();
  };
  var _onDOMReady = function() {
    TS.info("_onDOMReady");
    _logSessionLoadCount();
    if (!TS.boot_data.feature_no_tokenless_ms_connections) _maybeOpenTokenlessConnection();
    if (TS.boot_data.feature_web_lean_all_users && !TS.boot_data.feature_web_lean) {
      TS.warn("feature_web_lean flipped to TRUE because feature_web_lean_all_users is TRUE");
      TS.boot_data.feature_web_lean = true;
    }
    if (!TS.boot_data.feature_web_lean || TS.boot_data.feature_web_lean_all_users) {
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
    if (TS.boot_data.feature_message_replies) {
      TS.model.flex_names.push("convo");
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
    TSConnLogger.log("dom_ready", "_onDOMReady");
    soundManager.ignoreFlash = true;
    soundManager.setup({
      url: "/img/sm/",
      debugMode: false
    });
    var templates_cb;
    if (TS.boot_data.hbs_templates_version && TS.boot_data.version_ts !== "dev") {
      templates_cb = TS.boot_data.hbs_templates_version;
    } else if (TS.boot_data.version_ts == "dev") {
      templates_cb = Date.now();
    } else {
      templates_cb = TS.boot_data.version_ts;
    }
    var templates_url = "/templates.php?cb=" + templates_cb + TS.getQsArgsForUrl();
    if (TS.boot_data.template_groups) templates_url += "&template_groups=" + TS.boot_data.template_groups;
    if (TS.boot_data.template_exclude_feature_flagged) templates_url += "&template_exclude_feature_flagged=1";
    var req = new XMLHttpRequest;
    var attempts = 0;

    function loadTemplates() {
      attempts++;
      return new Promise(function(resolve) {
        TSConnLogger.log("templates_loading", "loading " + templates_url);
        if (window.TS && TS.raw_templates && Object.keys(TS.raw_templates).length > 0) {
          _onTemplatesLoaded(resolve);
          return;
        }
        TS.utility.getCachedScript(templates_url).done(function() {
          if (Object.keys(TS.raw_templates).length == 0) {
            TS.error(templates_url + " returned no templates D:");
            return;
          }
          _onTemplatesLoaded(resolve);
        }).fail(function() {
          var delay_ms = Math.min(1e3 * attempts, 1e4);
          TS.warn("loading " + templates_url + " failed (req.status:" + req.status + " attempts" + attempts + "), trying again in " + delay_ms + "ms");
          setTimeout(loadTemplates, delay_ms);
        });
      });
    }
    TS.storage.onStart();
    TSConnLogger.log("after_storage_start", "_onDOMReady");
    var promises = [];
    if (!TS.boot_data.no_login) {
      promises.push(_callRTMStartInParallel());
      if (TS.boot_data.feature_web_lean_all_users) {
        var cache_ts = TS.storage.fetchLastCacheTS();
        promises.push(_callUsersListInParallel(cache_ts));
        promises.push(_callBotsListInParallel(cache_ts));
      }
    }
    promises.push(loadTemplates());
    if (TS.boot_data.page_needs_enterprise && !TS.boot_data.no_login) {
      promises.push(TS.enterprise.promiseToEnsureEnterprise());
    }
    if (TS.web && TS.boot_data.page_needs_team_profile_fields) {
      promises.push(TS.team.ensureTeamProfileFields());
    }
    if (TS.web && TS.web.space && !TS.boot_data.space_login_data) {
      promises.push(_callDocumentsConnectInParallel());
    }
    Promise.all(promises).then(_allParallelCallsComplete);
  };
  var _onTemplatesLoaded = function(parallel_callback) {
    TSConnLogger.log("templates_appended", "_onTemplatesLoaded()");
    TS.warn(new Date - TSConnLogger.start_time + "ms from first html to calling onStarts()");
    _.sortBy(Object.keys(_delayed_module_loads), "length").forEach(function(name) {
      TS.registerModule(name, _delayed_module_loads[name], true);
    });
    _.sortBy(Object.keys(_delayed_component_loads), "length").forEach(function(name) {
      TS.registerComponent(name, _delayed_component_loads[name], true);
    });
    var should_init_sockets = true;
    if (TS.boot_data.app == "client") {
      TS.client.onStart();
      TS.client.onStart = _.noop;
    } else if (TS.boot_data.app == "web" || TS.boot_data.app == "space" || TS.boot_data.app == "calls") {
      TS.web.onStart();
      TS.web.onStart = _.noop;
    } else if (TS.boot_data.app == "test") {
      return;
    } else if (TS.boot_data.app == "api" || TS.boot_data.app == "oauth") {
      should_init_sockets = false;
    } else {
      TS.error("WTF app? " + TS.boot_data.app);
      return;
    }
    if (should_init_sockets) {
      TS.ms.reconnect_requested_sig.add(_reconnectRequestedMS);
      TS.ds.reconnect_requested_sig.add(_reconnectRequestedDS);
      TS.ms.connected_sig.add(_socketConnectedMS);
      TS.ms.disconnected_sig.add(_socketDisconnectedMS);
      TS.ds.disconnected_sig.add(_socketDisconnectedDS);
    }
    TSConnLogger.log("calling_onstarts", "_onTemplatesLoaded(), calling onStart()s", null, {
      ephemeral: true
    });
    _callOnStarts();
    TSConnLogger.log("called_onstarts", "_onTemplatesLoaded(), called onStart()s");
    _dom_is_ready = true;
    if (TS.qs_args["monkey_watch"] == 1) {
      _monkeyWatch(TS, "TS", 6e4, undefined);
    }
    parallel_callback();
  };
  var _callOnStarts = function() {
    var module;
    var name;
    var delete_after_calling = !TS.qs_args["keep_onstart"];
    try {
      for (name in _modules) {
        module = _modules[name];
        if (!module.onStart) continue;
        module.onStart();
        if (delete_after_calling) module.onStart = _.noop;
      }
    } catch (e) {
      TS.error("TS." + name + ".onStart encountered an error:");
      TS.logError(e);
      throw e;
    }
    if (delete_after_calling) {
      _callOnStarts = _.noop;
    }
  };
  var _setUpModel = function(data, args) {
    if (TS.boot_data.feature_web_lean) {
      data.bots = data.bots || [];
      data.channels.forEach(function(channel) {
        channel.is_member = true;
      });
    }
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
      if (TS.model.break_reconnections) TS.model.team.url = TS.model.team.url.replace("websocket", "BUSTED");
      if (first_time) {
        TS.model.bots = [];
        TS.model.members = [];
        TS.members.clearMemberMaps();
        TS.model.rooms = [];
        TS.model.channels = [];
        TS.model.ims = [];
        TS.model.groups = [];
        TS.model.mpims = [];
        TS.model.user_groups = [];
        TS.model.read_only_channels = [];
        TS.model.online_users = [];
      } else {
        var is_first_full_boot = TS._did_incremental_boot && !TS._did_full_boot;
        if (!is_first_full_boot) {
          TS.refreshTeams();
        }
      }
      if (_should_record_boot_size_metrics && (first_time || is_first_full_boot)) {
        TS.utility.rAF(function() {
          var log_name = first_time ? "incremental_boot_size" : "rtm_start_size";
          TS.metrics.count(log_name, JSON.stringify(data).length);
        });
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
                  dispatched++;
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
      var log_data = ["TS.model.supports_user_bot_caching:" + TS.model.supports_user_bot_caching, "TS.storage.isUsingMemberBotCache():" + TS.storage.isUsingMemberBotCache(), "TS.boot_data.feature_web_lean:" + TS.boot_data.feature_web_lean, "TS.boot_data.feature_web_lean_all_users:" + TS.boot_data.feature_web_lean_all_users, "args.cache_ts:" + args.cache_ts];
      var args_for_log = _.clone(args);
      if (args_for_log.token) args_for_log.token = "REDACTED";
      try {
        log_data.push("api args: " + JSON.stringify(args_for_log));
      } catch (err) {
        log_data.push("api args: " + args_for_log);
      }
      TS.members.startBatchUpsert();
      TS.bots.startBatchUpsert();
      var data_user_list = data.updated_users || data.users;
      var data_bot_list = data.updated_bots || data.bots;
      var users_cache = TS.storage.fetchMembers();
      var data_user_list_by_id = {};
      if (TS._did_incremental_boot && !TS._incremental_boot && !TS._did_full_boot) {} else {
        for (i = 0; i < data_user_list.length; i++) {
          data_user_list_by_id[data_user_list[i].id] = true;
        }
        if (_should_record_boot_size_metrics) {
          TS.utility.rAF(function() {
            TS.metrics.count("members_local_storage_size", JSON.stringify(users_cache).length);
          });
        }
      }
      var should_check_if_local = TS.boot_data.page_needs_enterprise && TS.boot_data.exlude_org_members;
      for (i = 0; i < users_cache.length; i++) {
        member = users_cache[i];
        if (should_check_if_local && !TS.members.isLocalTeamMember(member)) continue;
        if (data_user_list_by_id[member.id]) continue;
        if (data.online_users) member.presence = _.includes(data.online_users, member.id) ? "active" : "away";
        if (TS.boot_data.feature_always_active_bots && member.profile.always_active) member.presence = "active";
        upsert = TS.members.upsertAndSignal(member);
        if (TS.pri) TS.log(481, "upsert from CACHE: " + member.id + " " + upsert.status);
        if (upsert.member.id == data.self.id) setModelUser(upsert.member);
      }
      for (i = 0; i < data_user_list.length; i++) {
        member = data_user_list[i];
        if (should_check_if_local && !TS.members.isLocalTeamMember(member)) continue;
        if (TS.lazyLoadMembersAndBots()) {
          member.presence = _.has(member, "presence") && member.presence === "active" ? "active" : "away";
        } else {
          if (data.online_users) member.presence = _.includes(data.online_users, member.id) ? "active" : "away";
        }
        if (TS.boot_data.feature_always_active_bots && member.profile && member.profile.always_active) member.presence = "active";
        upsert = TS.members.upsertAndSignal(member);
        if (TS.pri) TS.log(481, "upsert from DATA: " + member.id + " " + upsert.status);
        if (upsert.member.id == data.self.id) setModelUser(upsert.member);
      }
      var bots_cache = TS.storage.fetchBots();
      var data_bot_list_by_id = {};
      for (i = 0; i < data_bot_list.length; i++) {
        data_bot_list_by_id[data_bot_list[i].id] = true;
      }
      for (i = 0; i < bots_cache.length; i++) {
        bot = bots_cache[i];
        if (!data_bot_list_by_id[bot.id]) {
          upsert = TS.bots.upsertAndSignal(bot);
        }
      }
      for (i = 0; i < data_bot_list.length; i++) {
        TS.bots.upsertAndSignal(data_bot_list[i]);
      }
      if (TS.boot_data.feature_web_lean) {
        log_data.push("members from LS:" + users_cache.length + ", from users in rtm.leanStart:" + data_user_list.length + " (slackbot will always be here)");
        log_data.push("bots from LS:" + bots_cache.length + ", from bots in rtm.leanStart:" + data_bot_list.length);
      } else {
        log_data.push("members from LS:" + users_cache.length + ", from updated_users in rtm.start:" + data_user_list.length + " (slackbot will always be here)");
        log_data.push("bots from LS:" + bots_cache.length + ", from updated_bots in rtm.start:" + data_bot_list.length);
      }
      if (data_user_list.length < TS.model.members.length / 20) {
        TS.model.did_we_load_with_user_cache = true;
      }
      data_bot_list_by_id = null;
      data_user_list_by_id = null;
      TS.info(log_data.join("\n"));
      if (TS.pri) TS.dir(481, users_cache, "users_cache");
      if (TS.pri) TS.dir(481, bots_cache, "bots_cache");
      var doAllMembersFromChannelsInRawDataExist = function(with_shared) {
        if (TS._incremental_boot) return true;
        if (TS.lazyLoadMembersAndBots()) return true;
        if (TS.calls && TS.calls.isRtmStartDisabled()) return true;
        if (TS.boot_data.page_needs_enterprise && TS.boot_data.exlude_org_members) return true;
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
        if (parseInt(args.cache_ts)) {
          _onBadUserCache("!doAllMembersFromChannelsInRawDataExist()", log_data.join("\n"));
          reject(Error("called _onBadUserCache"));
          return;
        } else {
          TS.logError({
            message: log_data.join("\n")
          }, "doAllMembersFromChannelsInRawDataExist() failed");
        }
      }
      TS.members.upsertMember(data.self);
      TS.members.finishBatchUpsert();
      TS.bots.finishBatchUpsert();
      var is_initial_partial_boot = TS.isPartiallyBooted() && !is_first_full_boot;
      if (TS.storage.isUsingMemberBotCache() && !is_initial_partial_boot) {
        var cache_ts = data.cache_ts;
        if (TS.boot_data.feature_web_lean) {
          if (cache_ts == 0 || !cache_ts) {
            cache_ts = args.cache_ts;
          }
        }
        TS.storage.rememberLastCacheTS(cache_ts);
        TS.members.maybeStoreMembers(true);
        TS.bots.maybeStoreBots(true);
      }
      TS.model.makeYouRegex();
      if (first_time || true) {
        TS.prefs.setHighlightWords(TS.model.prefs.highlight_words);
      }
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
        if (channel.is_member) open_cnt++;
      });
      data.ims.forEach(function(im) {
        if (im.is_open) open_cnt++;
      });
      data.groups.forEach(function(group) {
        if (!group.is_archived) open_cnt++;
      });
      if (data.mpims) {
        data.mpims.forEach(function(mpim) {
          if (mpim.is_open && !mpim.is_archived) open_cnt++;
        });
      }
      if (data.read_only_channels) {
        TS.model.read_only_channels = data.read_only_channels;
      }
      TS.model.initial_msgs_cnt = 42;
      if (TS.qs_args["api_count"]) {
        var api_count_override = parseInt(TS.qs_args["api_count"]) || TS.model.initial_msgs_cnt;
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
        data.channels.forEach(function(channel) {
          if (just_general && !channel.is_general) return;
          channel.all_read_this_session_once = false;
          TS.channels.upsertChannel(channel);
        });
        TS.metrics.measureAndClear("upsert_channels", "upsert_channels_start");
        var skip_ims_mpims = TS.boot_data.page_needs_enterprise && TS.boot_data.exlude_org_members;
        if (!skip_ims_mpims) {
          data.ims.forEach(function(im) {
            if (just_general && im.user != "USLACKBOT") return;
            im.all_read_this_session_once = false;
            TS.ims.upsertIm(im);
          });
        }
        TS.metrics.mark("upsert_groups_start");
        data.groups.forEach(function(group) {
          if (just_general) return;
          group.all_read_this_session_once = false;
          TS.groups.upsertGroup(group);
        });
        TS.metrics.measureAndClear("upsert_groups", "upsert_groups_start");
        if (data.mpims) {
          if (!skip_ims_mpims) {
            data.mpims.forEach(function(mpim) {
              if (just_general) return;
              mpim.all_read_this_session_once = false;
              TS.mpims.upsertMpim(mpim);
            });
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
      if (TS.boot_data.feature_message_replies && data.hasOwnProperty("mentions_badge_count")) {
        TS.replies.setMentionsBadgeCount(parseInt(data.mentions_badge_count, 10));
      }
      if (!TS._incremental_boot) {
        var maybe_shared_model_obs = data.ims.concat(data.mpims || [], data.groups || []);
        return TS.members.ensureMembersArePresentInSharedModelObs(maybe_shared_model_obs).then(function() {
          var with_shared = true;
          if (!doAllMembersFromChannelsInRawDataExist(with_shared)) {
            if (parseInt(args.cache_ts)) {
              _onBadUserCache("!doAllMembersFromChannelsInRawDataExist(with_shared=true)", log_data.join("\n"));
              reject(Error("called _onBadUserCache"));
              return;
            } else {
              TS.logError({
                message: log_data.join("\n")
              }, "doAllMembersFromChannelsInRawDataExist(with_shared=true) failed");
            }
          }
          completeModelObSetup();
          resolve();
        }, function(err) {
          reject(Error("could not fetch all external members: " + (err && err.message)));
        });
      } else {
        completeModelObSetup();
        resolve();
        return;
      }
    });
  };
  var _onBadUserCache = function(problem, details) {
    TS.error("_onBadUserCache problem: " + problem);
    TS.storage.cleanOutCacheTsStorage();
    TS.model.had_bad_user_cache = true;
    TS.ms.onFailure("_onBadUserCache problem: " + problem);
  };
  var _extractAndDeleteTestProps = function(ob) {
    var may_export_test = typeof window.jasmine !== "undefined" || TS.boot_data.version_ts == "dev" && TS.qs_args["export_test"];
    if (ob["test"] && !may_export_test) {
      delete ob["test"];
    } else if (typeof ob["test"] === "function") {
      var test_getter = ob["test"];
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
      _ms_rtm_start_p = TS.flannel.connectAndFetchRtmStart(_getMSLoginArgs()).catch(function() {
        return TS.api.connection.waitForAPIConnection().then(function() {
          return TS.flannel.connectAndFetchRtmStart(_getMSLoginArgs());
        });
      });
      return;
    }
    TS.log(1996, "Opening a tokenless MS connection");
    TS.ms.connectProvisionally(TS.boot_data.ms_connect_url);
  };
  var _initSleepWake = function() {
    var is_asleep = false;
    var SLEEP_TIMEOUT_MS = 6e4;
    var sleep_timeout_tim;
    var _onSleep = function() {
      TS.info("sleep event!");
      is_asleep = true;
      if (TS.client) TS.ms.sleep();
      if (TS.web && TS.web.space) TS.ds.sleep();
      sleep_timeout_tim = setTimeout(_onWake, SLEEP_TIMEOUT_MS);
    };
    var _onWake = function() {
      if (!is_asleep) return;
      is_asleep = false;
      TS.info("wake event!");
      if (TS.client) TS.ms.wake();
      if (TS.web) TS.ds.wake();
      if (sleep_timeout_tim) {
        clearTimeout(sleep_timeout_tim);
        sleep_timeout_tim = undefined;
      }
    };
    window.addEventListener("sleep", _onSleep, false);
    window.addEventListener("wake", _onWake, false);
  };
  var _should_record_boot_size_metrics = _.random(0, 100) < 10 || /should_record_boot_size_metrics/.test(document.location.search);
})();
(function() {
  "use strict";
  TS.registerModule("incremental_boot", {
    onStart: function() {
      TS.channels.switched_sig.add(_storeLastActiveModelOb);
      TS.ims.switched_sig.add(_storeLastActiveModelOb);
      TS.groups.switched_sig.add(_storeLastActiveModelOb);
      TS.mpims.switched_sig.add(_storeLastActiveModelOb);
      TS.ms.connected_sig.addOnce(_storeLastActiveModelOb);
    },
    startIncrementalBoot: function() {
      if (TS._did_incremental_boot) {
        return Promise.reject(new Error("_startIncrementalBoot called more than once; this is a programming error."));
      }
      TS._did_incremental_boot = true;
      var incremental_boot_data = TS.boot_data.incremental_boot_data;
      delete TS.boot_data.incremental_boot_data;
      var channels_view_args = {
        include_full_users: true,
        count: TS.model.initial_msgs_cnt - 1
      };
      if (TS.boot_data.feature_name_tagging_client) {
        channels_view_args.name_tagging = true;
      }
      if (TS.boot_data.feature_canonical_avatars_web_client) {
        channels_view_args.canonical_avatars = true;
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
      _setIncrementalBootUIState(true);
      TS.model.change_channels_when_offline = false;
      var channels_view_p = TS.api.call("channels.view", channels_view_args);
      var call_users_counts = TS.qs_args["incremental_boot"] == "users";
      var users_counts_p = call_users_counts ? TS.api.call("users.counts", {
        simple_unreads: true,
        mpim_aware: true,
        only_relevant_ims: true
      }) : Promise.resolve({
        data: {}
      });
      return Promise.join(channels_view_p, users_counts_p, function(channels_view_resp, users_counts_resp) {
        TS._incremental_boot = true;
        var has_mpims = _.get(users_counts_resp, "data.mpims.length", 0) > 0 && !TS.qs_args["ignore_mpims"];
        if (!call_users_counts || has_mpims) {
          $("#col_channels").addClass("placeholder");
        }
        var data = _assembleBootData(incremental_boot_data, channels_view_resp.data, has_mpims ? {} : users_counts_resp.data);
        if (call_users_counts) {
          data._incremental_boot_users_counts_resp = users_counts_resp;
        }
        return {
          ok: true,
          data: data,
          args: channels_view_resp.args
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
      if (!TS._incremental_boot) return Promise.reject(new Error("No incremental boot to finish"));
      if (!TS._did_incremental_boot) return Promise.reject(new Error("No incremental boot to finish"));
      if (TS._did_full_boot) return Promise.reject(new Error("No incremental boot to finish"));
      TS._incremental_boot = false;
      _recent_incremental_boot_timer = setTimeout(_removeRecentIncrementalBootState, 5e3);
      if (TS.client && TS.client.ui && TS.client.ui.$messages_input_container) {
        TS.client.ui.$messages_input_container.one(_message_input_change_events, _removeRecentIncrementalBootState);
      }
      TS.ms.connected_sig.addOnce(_removeRecentIncrementalBootState);
    },
    afterFullBoot: function() {
      TS._did_full_boot = true;
      TS.model.change_channels_when_offline = true;
      _setIncrementalBootUIState(false);
      var model_ob = TS.shared.getActiveModelOb();
      if (model_ob) {
        delete model_ob._incremental_boot_counts;
      }
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
      if (TS.boot_data.feature_message_replies_threads_view && TS.utility.isThreadsViewPath(loc.pathname)) {
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
  var _assembleBootData = function(incremental_boot_data, channels_view_data, users_counts_data) {
    var data = channels_view_data;
    data.channels = data.channels || [];
    data.groups = data.groups || [];
    data.ims = data.ims || [];
    data.mpims = data.mpims || [];
    var focal_model_ob = data.channel || data.group || data.im;
    TS.model.initial_cid = focal_model_ob.id;
    delete data.channel;
    delete data.group;
    if (channels_view_data.counts) {
      focal_model_ob._incremental_boot_counts = channels_view_data.counts;
    }
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
    }(users_counts_data.channels || []).forEach(function(ob) {
      ob.is_channel = true;
      ob.is_member = true;
      ob.members = ob.members || [];
      _upsertModelOb(ob, data.channels);
    });
    (users_counts_data.ims || []).forEach(function(ob) {
      ob.is_im = true;
      if (ob.user_id && !ob.user) {
        ob.user = ob.user_id;
        delete ob.user_id;
      }
      if (!_.find(data.users, {
          id: ob.user
        })) {
        var user_ob = {
          id: ob.user,
          name: ob.name,
          profile: {}
        };
        data.users.push(user_ob);
      }
      _upsertModelOb(ob, data.ims);
    });
    data.users.forEach(function(user) {
      if (user.id == "USLACKBOT" || user.id == TS.boot_data.user_id) {
        user.presence = "active";
      }
    });
    (users_counts_data.groups || []).forEach(function(ob) {
      ob.is_group = true;
      ob.members = ob.members || [];
      _upsertModelOb(ob, data.groups);
    });
    data.mpims = [];
    users_counts_data.mpims = [];
    (users_counts_data.mpims || []).forEach(function(ob) {
      ob.is_mpim = true;
      ob.is_group = true;
      ob.members = ob.members || [];
      _upsertModelOb(ob, data.mpims);
      return ob;
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
      TS.client.ui.$messages_input_container.removeClass("recent-incremental-boot");
    }
    TS.ms.connected_sig.remove(_removeRecentIncrementalBootState);
    if (_recent_incremental_boot_timer) {
      clearTimeout(_recent_incremental_boot_timer);
      _recent_incremental_boot_timer = undefined;
    }
  };
  var _setIncrementalBootUIState = function(is_incremental_boot_in_progress) {
    if (!is_incremental_boot_in_progress) {
      $("#col_channels, #team_menu").removeClass("placeholder");
    }
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
      if (start_mark_label == "start_nav") start_mark_label = "navigationStart";
      var clear_end_mark = false;
      if (!end_mark_label) {
        clear_end_mark = true;
        end_mark_label = measure_label + "__" + start_mark_label + "_end";
        if (window.performance && performance.mark) performance.mark(end_mark_label);
      }
      var pt = performance.timing;
      if (pt && TS.metrics.special_start_mark_labels.indexOf(start_mark_label) > -1) {
        var start_ms = pt[start_mark_label];
        if (!start_ms) return;
        var end_mark_measures = performance.getEntriesByName(end_mark_label);
        if (end_mark_measures.length === 0) return;
        var t0 = pt["navigationStart"];
        var end_ms = t0 + end_mark_measures[end_mark_measures.length - 1].startTime;
        var duration = end_ms - start_ms;
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
      var duration = measures[measures.length - 1].duration;
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
        var val = pt[n] - pt["navigationStart"];
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
    },
    getMemoryUsage: function() {
      return _getMemoryUsage();
    }
  });
  var _INTERVAL_DURATION_MS = 25 * 1e3;
  var _INTERVAL_DURATION_NOISE_MS = 10 * 1e3;
  var _INTERVAL_MAX_URL_LENGTH = 2e3;
  var _log_dom_node_count = false;
  var _measures = {};
  var _cleanUp = function(e) {
    if (TS.client && TS.metrics.getLatestMark("start_load")) TS.metrics.measure("session_lifespan", "start_load", null, {
      in_seconds: true
    });
    _beaconDataAndEmptyQueue();
  };
  var _beaconDataAndEmptyQueue = function() {
    if (Object.keys(_measures).length === 0) return;
    if (window.performance && performance.memory && performance.memory.usedJSHeapSize) _measures["used_js_heap_size"] = [TS.utility.roundToThree(TS.utility.convertBytesToMegabytes(performance.memory.usedJSHeapSize))];
    if (_log_dom_node_count) {
      var dom_node_count = document.getElementsByTagName("*").length;
      TS.metrics.store("dom_node_count", dom_node_count, {
        is_count: true
      });
    }
    if (TS.boot_data.feature_electron_memory_logging) {
      var combined_stats = _getMemoryUsage();
      var combined_stats_all_p = _getCombinedMemoryUsage();
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
            TS.log(1983, "Unexpected results from call to _getCombinedMemoryUsage()", result);
          }
        }).catch(function(err) {
          TS.log(1983, "Error logging combined memory stats", err);
        });
      }
    }
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
    if (!is_experiment_metric_variant && TS.boot_data.experiment_client_metrics && TS.boot_data.experiment_client_metrics[label]) {
      TS.boot_data.experiment_client_metrics[label].forEach(function(experiment_name) {
        var bucket_name = TS.boot_data["exp_" + experiment_name];
        if (!bucket_name) return;
        var is_experiment_metric_variant = true;
        _recordLabelMeasurement("exp_" + experiment_name + "_" + bucket_name + "_" + label, value, is_experiment_metric_variant);
      });
    }
  };
  var _getMemoryUsage = function() {
    if (!TS.boot_data.feature_electron_memory_logging) return;
    if (TSSSB.call("getMemoryUsage")) {
      return TSSSB.call("getMemoryUsage");
    }
  };
  var _getCombinedMemoryUsage = function() {
    if (!TS.boot_data.feature_electron_memory_logging) return;
    if (TSSSB.call("getCombinedMemoryUsage")) {
      return TSSSB.call("getCombinedMemoryUsage");
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
    var is_dev = location.host.match(/(dev[0-9]+)\.slack.com/);
    if (is_dev) {
      _ENDPOINT_URL = "https://" + is_dev[0] + "/beacon/statsd";
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
      name: "All Unreads",
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
    channel_sort: {},
    channel_sort_options: [{
      name: "-",
      value: ""
    }, {
      name: "Starred",
      value: "starred"
    }, {
      name: "Type",
      value: "type"
    }, {
      name: "Muted",
      value: "muted"
    }, {
      name: "SLI priority score",
      value: "sli"
    }, {
      name: "Has unread messages",
      value: "has_unread_msgs"
    }, {
      name: "Unread message count",
      value: "unread_msgs_count"
    }, {
      name: "Has unread mentions",
      value: "has_unread_mentions"
    }, {
      name: "Unread mention count",
      value: "unread_mentions_count"
    }],
    channel_sort_simple_options: [{
      name: "None",
      value: ""
    }, {
      name: "SLI priority score",
      value: "sli"
    }],
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
    break_reconnections: false,
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
    all_unread_cnt: 0,
    all_unread_highlights_cnt: 0,
    all_unread_cnt_to_exclude: 0,
    all_unread_highlights_cnt_to_exclude: 0,
    threads_has_unreads: false,
    threads_mention_count: 0,
    c_name_in_url: "",
    flex_name_in_url: "",
    flex_extra_in_url: "",
    flex_names: ["files", "team", "search", "stars", "mentions", "details", "whats_new"],
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
    member_id_length: 9,
    msg_activity_interval: 5,
    msg_preview_showing: false,
    archive_view_is_showing: false,
    menu_is_showing: false,
    overlay_is_showing: false,
    unread_view_is_showing: false,
    sorting_mode_is_showing: false,
    threads_view_is_showing: false,
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
    supports_sticky_position: false,
    supports_growl_subtitle: false,
    supports_voice_calls: false,
    supports_video_calls: false,
    supports_screen_sharing: false,
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
      all: "All File Types",
      posts: "Posts",
      spaces: "Posts",
      multnomah: "Multnomah",
      snippets: "Snippets",
      emails: "Emails",
      images: "Images",
      pdfs: "PDF Files",
      gdocs: "Google Docs"
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
      is_window_focused: document.hasFocus && document.hasFocus() && window.macgap_is_in_active_space ? true : false,
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
      team: {}
    },
    frecency_jumper: {},
    typing_msg: "several people are typing",
    mentions_badge_count: 0,
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
      TS.model.supports_sticky_position = !!(TS.model.is_safari_desktop || TS.model.is_FF || TS.model.mac_ssb_version && !TS.model.is_electron);
      if (TS.model.supports_sticky_position) {
        html_classes.push("supports_sticky_position");
      }
      if (TS.boot_data.feature_electron_window_gripper && TS.model.is_electron && TS.model.is_mac && TSSSB.call("isMainWindowFrameless")) {
        html_classes.push("is_electron_mac");
      }
      if (TS.model.is_mac) html_classes.push("is_mac");
      if (TS.model.is_win) html_classes.push("is_win");
      $("html").addClass(html_classes.join(" "));
      var OSX_version = _getOSXVersion(ua).toString();
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
      if (TS.boot_data.feature_calls) {
        if (window.winssb) {
          TS.model.supports_voice_calls = !!(winssb.screenhero || winssb.calls);
          if (TS.model.win_ssb_version && TS.model.win_ssb_version < 2) TS.model.supports_voice_calls = false;
          if (TS.model.lin_ssb_version && !TS.boot_data.feature_calls_linux) TS.model.supports_voice_calls = false;
        } else if (window.macgap) {
          TS.model.supports_voice_calls = !!(macgap.screenhero || macgap.calls);
          if (TS.model.mac_ssb_version < 2) TS.model.supports_voice_calls = false;
        } else if (TS.model.is_chrome_desktop) {
          TS.model.supports_voice_calls = true;
        }
      }
      TS.model.supports_video_calls = false;
      TS.model.supports_screen_sharing = false;
      TS.model.supports_mmap_minipanel_calls = false;
      if (TS.boot_data.feature_calls) {
        if (window.winssb && !TS.model.is_lin) {
          if (winssb.calls && winssb.calls.requestCapabilities) {
            var capabilities = winssb.calls.requestCapabilities();
            if (capabilities) {
              if (capabilities.supports_video) TS.model.supports_video_calls = true;
              if (capabilities.supports_screen_sharing) TS.model.supports_screen_sharing = true;
              if (capabilities.supports_mmap_minipanel) TS.model.supports_mmap_minipanel_calls = true;
            }
          }
        } else if (TS.model.is_chrome_desktop) {
          TS.model.supports_video_calls = true;
        }
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
      var k;
      if (TS.boot_data.special_flex_panes) {
        for (k in TS.boot_data.special_flex_panes) {
          var special = TS.boot_data.special_flex_panes[k];
          TS.model.flex_names.push(special.flex_name);
        }
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
      var ob = _unknown_ids_handled[id] = _unknown_ids_handled[id] || {
        tries: 0,
        state: 0
      };
      ob.tries++;
      ob.state = 0;
      if (ob.tries > 2) {
        TS.maybeError(528, 'calling the API for id: "' + id + '", try #' + ob.tries);
      } else if (ob.tries > 1) {
        TS.maybeWarn(528, 'calling the API for id: "' + id + '", try #' + ob.tries);
      } else {
        TS.log(528, 'calling the API for id: "' + id + '", try #' + ob.tries);
      }
      return ob.tries;
    },
    reportResultOfUnknownIdHandled: function(id, success) {
      var ob = _unknown_ids_handled[id];
      if (!ob) return;
      ob.state = success ? 1 : -1;
      if (ob.state == 1) {
        TS.log(528, 'API call for id: "' + id + '" SUCCEEDED, try #' + ob.tries);
      } else {
        TS.maybeWarn(528, 'API call for id: "' + id + '" FAILED, try #' + ob.tries);
      }
    },
    logUnknownIdsHandled: function(min_tries, state) {
      var log_ob = _getUnknownIdsHandledLogOb(min_tries, state);
      TS.info("_unknown_ids_handled: " + JSON.stringify(log_ob, null, 2));
    },
    getUnknownIdsHandled: function(min_tries, state) {
      return _getUnknownIdsHandledLogOb(min_tries, state);
    },
    useSubmodel: function(submodel) {
      if (TS.model.submodel) throw new Error("Another submodel is already active");
      TS.model.submodel = submodel;
      _original_model_obs = {};
      ["bots", "channels", "groups", "ims", "members", "mpims"].forEach(function(ob_type) {
        _original_model_obs[ob_type] = TS.model[ob_type];
        Object.defineProperty(TS.model, ob_type, {
          get: function() {
            throw new Error("Accessing model objects via TS.model is forbidden while a submodel is set; this is a programming error");
          }
        });
      });
    },
    clearSubmodel: function() {
      if (!TS.model.submodel) return;
      TS.model.submodel = undefined;
      Object.keys(_original_model_obs).forEach(function(ob_type) {
        Object.defineProperty(TS.model, ob_type, {
          value: _original_model_obs[ob_type],
          writable: true
        });
      });
      _original_model_obs = undefined;
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
    }
  });
  _.merge(TS.model, _sniffUserAgent(navigator.userAgent));
  var _original_model_obs;
  var _unknown_ids_handled = {};
  var _unknown_ids_handled_states = [-1, 0, 1];
  var _getUnknownIdsHandledLogOb = function(min_tries, state) {
    min_tries = parseInt(min_tries) || 1;
    state = _.includes(_unknown_ids_handled_states, state) ? state : "any";
    var obs = {};
    Object.keys(_unknown_ids_handled).forEach(function(id) {
      var ob = _unknown_ids_handled[id];
      if (min_tries > ob.tries) return;
      if (state != "any" && ob.state != state) return;
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
    return parseInt(matches[1]) >= 6;
  }

  function _getOSXVersion(ua) {
    var matches = ua.match(/(?:Mac OS X )([0-9][0-9]_[0-9]+)(_[0-9])?/);
    if (!matches) matches = ua.match(/(?:Mac OS X )([0-9][0-9]\.[0-9]+)(\.[0-9])?/);
    if (!matches || !matches[1]) return 0;
    var v = parseFloat(matches[1].replace("_", ".")) || 0;
    return v;
  }

  function _sniffUserAgent(ua) {
    var is_mac = /(OS X)/g.test(ua);
    var is_win = ua.indexOf("Windows") !== -1;
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
    return {
      is_iOS: is_iOS,
      is_IE: is_IE,
      is_FF: is_FF,
      is_chrome_desktop: is_chrome && !is_chrome_mobile && !is_our_app,
      is_chrome_mobile: is_chrome_mobile,
      is_safari_desktop: is_safari && !is_chrome && is_mac && !is_iOS,
      is_mac: is_mac,
      mac_version: _getOSXVersion(ua) || undefined,
      is_win: is_win,
      is_win_7_plus: _isWin7Plus(ua),
      is_lin: is_lin,
      is_our_app: is_our_app,
      is_electron: is_electron
    };
  }
})();
(function() {
  "use strict";
  TS.registerModule("environment", {
    is_apple_webkit: false,
    is_macgap: false,
    is_retina: false,
    retina_changed_sig: new signals.Signal,
    supports_custom_scrollbar: false,
    supports_flexbox: false,
    supports_line_clamp: false,
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
      return test_object;
    }
  });

  function _isRetina() {
    return window["devicePixelRatio"] > 1;
  }

  function _decoratePageWithSupport() {
    var features = ["is_apple_webkit", "is_macgap", "supports_custom_scrollbar", "supports_flexbox", "supports_line_clamp"];
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
    var css_prefixes = ["-webkit-", "-moz-", "-o-", "-ms-", ""];
    var js_prefixes = ["Webkit", "Moz", "O", "ms", ""];
    var css_prefix_regexp = new RegExp("^(-*" + css_prefixes.slice(0, css_prefixes.length - 1).join("|-*") + ")");
    var js_prefix_regexp = new RegExp("^(" + js_prefixes.slice(0, js_prefixes.length - 1).join("|") + ")");
    property = property.replace(js_prefix_regexp, "").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").replace(/([a-z\d])([A-Z])/g, "$1-$2").replace(css_prefix_regexp, "").toLowerCase();
    property = _.camelCase(property, "-");
    var capitalized_property = _.upperFirst(property);
    if (style[property] !== undefined) return true;
    return js_prefixes.some(function(prefix) {
      return style[prefix + capitalized_property] !== undefined || style[prefix + property] !== undefined;
    });
  }

  function _initialSetup() {
    TS.environment.is_apple_webkit = !!(TS.model.mac_ssb_version || TS.model.is_safari_desktop);
    TS.environment.is_macgap = !!window.macgap;
    TS.environment.is_retina = _isRetina();
    TS.environment.supports_custom_scrollbar = _cssPropertySupported("scrollbar");
    TS.environment.supports_flexbox = _cssPropertySupported("flex-wrap");
    TS.environment.supports_line_clamp = TS.boot_data.feature_files_list && _cssPropertySupported("line-clamp");
  }

  function _bindEvents() {
    if (!!window.matchMedia) {
      var qry = "screen and (-webkit-min-device-pixel-ratio: 1.5), screen and (min--moz-device-pixel-ratio: 1.5), screen and (min-device-pixel-ratio: 1.5)";
      window.matchMedia(qry).addListener(function() {
        var old_value = TS.environment.is_retina;
        TS.environment.is_retina = _isRetina();
        if (TS.environment.is_retina === old_value) return;
        TS.info("TS.environment.is_retina changed from " + old_value + " to " + TS.environment.is_retina);
        TS.environment.retina_changed_sig.dispatch(TS.environment.is_retina);
      });
    }
  }

  function _cssScrollbarSupported() {
    var test = document.createElement("div");
    test.id = "__sb";
    test.style.overflow = "scroll";
    test.style.width = "40px";
    test.style.position = "absolute";
    test.style.left = "-40px";
    test["innerHTML"] = "&shy;<style>#__sb::-webkit-scrollbar {width:0px;}</style>";
    document.body.appendChild(test);
    var is_css_scrollbar_supported = test.scrollWidth == 40;
    document.body.removeChild(test);
    return is_css_scrollbar_supported;
  }
})();
(function() {
  "use strict";
  TS.registerModule("clog", {
    onStart: function() {
      var interval_duration_ms = 30 * 1e3;
      var interval_duration_noise_ms = 5 * 1e3;
      var noise_ms = Math.floor(Math.random() * interval_duration_noise_ms);
      setInterval(_sendDataAndEmptyQueue, interval_duration_ms + noise_ms);
      $(window).on("beforeunload", _sendDataAndEmptyQueue);
      $("body").on("click", '[data-clog-click="true"]', _onClick);
    },
    setUser: function(id) {
      _user_id = id;
    },
    setTeam: function(id) {
      _team_id = id;
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
      for (i; i < len; i++) {
        arg = params[i].split("=");
        args[arg[0]] = arg[1];
      }
      return args;
    }
  });
  var _CLOG_ENDPOINT_URL;
  var _MAX_URL_LENGTH = 2e3;
  var _LOG_PRI = 1e3;
  var _logs = [];
  var _team_id;
  var _user_id;
  var _detectClogEndpoint = function(host) {
    var is_dev = host.match(/^([^.]+\.)?(dev[0-9]*)\.slack.com/);
    var is_qa = host.match(/^([^.]+\.)?(qa[0-9]*)\.slack.com/);
    if (is_dev) {
      _CLOG_ENDPOINT_URL = "https://" + is_dev[2] + ".slack.com/clog/track/";
    } else if (is_qa) {
      _CLOG_ENDPOINT_URL = "https://" + is_qa[2] + ".slack.com/clog/track/";
    } else if (host.match(/^([^.]+\.)?staging.slack.com/)) {
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
    if (_team_id) payload["team_id"] = _team_id;
    if (_user_id) payload["user_id"] = _user_id;
    if (TS.model) {
      if (TS.model.team && TS.model.team.id) payload["team_id"] = TS.model.team.id;
      if (TS.model.user && TS.model.user.id) payload["user_id"] = TS.model.user.id;
    }
    _logs.push(payload);
    if (TS.log) TS.log(_LOG_PRI, "Event called:", event, args);
  };
  var _sendDataAndEmptyQueue = function() {
    if (_logs.length === 0) return;
    if (TS.log) TS.log(_LOG_PRI, "Sending clog data, emptying queue");
    if (TS.log) TS.log(_LOG_PRI, "Logs: ", _logs);
    var log_urls = _createLogURLs(_logs);
    var log_url;
    for (var i = 0; i < log_urls.length; i++) {
      log_url = log_urls[i];
      var log = new Image;
      log.src = log_url;
      if (TS.log) TS.log(_LOG_PRI, "Logged event: " + log_url);
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
    for (var i = 0; i < logs.length; i++) {
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
    if (TS.log) TS.log(_LOG_PRI, "URLs:", urls);
    return urls;
  };
  var _onClick = function(e) {
    var event = this.getAttribute("data-clog-event");
    if (!event) {
      if (TS.warn) TS.warn("Logging clicks with data-clog-click requires a data-clog-event attribute");
      return;
    }
    var params = this.getAttribute("data-clog-params");
    var args = TS.clog.parseParams(params);
    TS.clog.track(event, args);
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
      if (!_promise_lead_assignments || _isCacheExpired(_loaded_lead_assignments)) {
        _loaded_lead_assignments = Date.now();
        _promise_lead_assignments = _loadAssignments("experiments.getByLead", {
          lead_id: lead_id
        });
      }
      return _promise_lead_assignments;
    },
    loadVisitorAssignments: function() {
      if (!_promise_visitor_assignments || _isCacheExpired(_loaded_visitor_assignments)) {
        _loaded_visitor_assignments = Date.now();
        _promise_visitor_assignments = _loadAssignments("experiments.getByVisitor");
      }
      return _promise_visitor_assignments;
    },
    loadUserAssignments: function() {
      if (!_is_authed) {
        if (TS.warn) TS.warn("TS.experiment.loadUserAssignments requires a user to be logged in");
        return Promise.resolve(false);
      }
      if (!_promise_user_assignments || _isCacheExpired(_loaded_user_assignments)) {
        _loaded_user_assignments = Date.now();
        _promise_user_assignments = _loadAssignments("experiments.getByUser");
      }
      return _promise_user_assignments;
    },
    getGroup: function(name) {
      if (_assignments[name]) {
        if (_assignments[name].log_exposures) _logExposure(name, _assignments[name]);
        return _assignments[name].group;
      }
      return null;
    }
  });
  var _CACHE_TIMEOUT = 864e5;
  var _is_authed;
  var _method;
  var _assignments = {};
  var _clogged = {};
  var _promise_lead_assignments;
  var _promise_user_assignments;
  var _promise_visitor_assignments;
  var _loaded_lead_assignments;
  var _loaded_user_assignments;
  var _loaded_visitor_assignments;
  var _loadAssignments = function(api_url, api_args) {
    return new Promise(function(resolve, reject) {
      _method(api_url, _.extend(TS.utility.url.queryStringParse(location.search.substring(1)), api_args), function(ok, data, args) {
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
  var _isCacheExpired = function(last_call) {
    var time_since_last = Date.now() - last_call - _CACHE_TIMEOUT;
    return !(time_since_last < 0);
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
  TS.registerModule("i18n", {
    DE: "de",
    ES: "es",
    FR: "fr",
    JP: "jp",
    US: "en-US",
    onStart: function() {
      if (!_is_setup) _setup();
    },
    t: function(key, ns) {
      if (!_is_setup) _setup();
      if (typeof ns !== "string") {
        var log = TS.error ? TS.error : console.error;
        log.call(this, "TS.i18n.t requires a namespace string as the second argument. Currently " + ns + ".");
        return function() {
          return "";
        };
      }
      var translations = _namespaced(ns);
      var translation = translations[key];
      if (translation === undefined) {
        if (!_is_dev || !_is_pseudo && TS.i18n.locale === _DEFAULT_LOCALE) {
          translations[key] = new MessageFormat(TS.i18n.locale, key).format;
        } else {
          translations[key] = function(data) {
            if (!_is_pseudo) {
              TS.warn('"' + key + '"', "has not yet been translated into", TS.i18n.locale);
            }
            var str = new MessageFormat(TS.i18n.locale, key).format(data);
            return _getPseudoTranslation(str);
          };
        }
      } else if (typeof translation !== "function") {
        translations[key] = new MessageFormat(TS.i18n.locale, translation).format;
      }
      return translations[key];
    },
    listify: function(arr) {
      var and;
      var list = [];
      var l = arr.length;
      switch (TS.i18n.locale) {
        case TS.i18n.JP:
          and = ", ";
          break;
        default:
          and = " " + TS.i18n.t("and", "general")() + " ";
      }
      arr.forEach(function(s, i) {
        list.push(s);
        if (i < l - 2) {
          list.push(", ");
        } else if (i < l - 1) {
          list.push(and);
        }
      });
      return list;
    }
  });
  var _is_setup;
  var _translations;
  var _is_dev;
  var _is_pseudo;
  var _setup = function() {
    _is_dev = location.host.match(/(dev[0-9]+)\.slack.com/);
    if (_is_dev) {
      var locale = location.search.match(new RegExp("locale=(.*?)($|&)", "i"));
      if (locale) TS.i18n.locale = locale[1];
    }
    if (!TS.i18n.locale) {
      TS.i18n.locale = TS.boot_data && TS.boot_data.locale ? TS.boot_data.locale : _DEFAULT_LOCALE;
    }
    if (TS.i18n.locale === _PSEUDO_LOCALE) {
      _is_pseudo = true;
      TS.i18n.locale = _DEFAULT_LOCALE;
    } else {
      TS.i18n.locale = TS.i18n.locale.replace(/_/, "-");
    }
    _translations = _TRANSLATIONS[TS.i18n.locale] || {};
    _is_setup = true;
  };
  var _namespaced = function(namespace) {
    var parts = namespace.split(".");
    if (parts.length > 1) {
      var i = 0;
      var l = parts.length;
      var translations = _translations;
      for (i; i < l; i++) {
        translations = translations[parts[i]];
        if (translations === undefined) return {};
      }
      return translations;
    }
    return _translations[namespace] || {};
  };
  var _getPseudoTranslation = function(str) {
    var regex = /<[^>]+>/gi;
    var tags = str.match(regex) || [];
    str = str.split(regex).join("<>");
    var key;
    for (key in _PSEUDO_MAP) {
      str = str.replace(_PSEUDO_MAP[key][0], _PSEUDO_MAP[key][1]);
    }
    return str.split("<>").map(function(w, i) {
      return w + (tags[i] || "");
    }).join("");
  };
  var _DEFAULT_LOCALE = "en-US";
  var _PSEUDO_LOCALE = "pseudo";
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
    j: [/j/g, "J"],
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
  var _TRANSLATIONS = {
    en_US: {
      menu: {
        "Profile &amp; account": "Profile &amp; account",
        Preferences: "Preferences",
        "Version info (TS only)": "Version info (TS only)",
        "Sign out of": "Sign out of",
        "Set yourself to <strong>away</strong>": "Set yourself to <strong>away</strong>",
        "[Away] Set yourself to <strong>active</strong>": "[Away] Set yourself to <strong>active</strong>"
      },
      channel: {
        "{member_count,plural,=1{{member_count} member}other{{member_count} members}}": "{member_count,plural,=1{{member_count} member}other{{member_count} members}}"
      }
    },
    es: {
      menu: {
        "Profile &amp; account": "Perfil y cuenta",
        Preferences: "Preferencias"
      },
      channel: {
        "{member_count,plural,=1{{member_count} member}other{{member_count} members}}": "{member_count,plural,=1{{member_count} miembro}other{{member_count} miembros}}"
      }
    },
    fr: {
      menu: {
        "Profile &amp; account": "Profil et gestion du compte",
        Preferences: "Préférences",
        "Version info (TS only)": "Version info (TS uniquement)"
      },
      channel: {
        "{member_count,plural,=1{{member_count} member}other{{member_count} members}}": "{member_count,plural,=1{{member_count} membre}other{{member_count} membres}}"
      }
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
      _maybeInitEmojiUsageStats();
    },
    maybeCommitDeferredEmojiUsage: function() {
      _maybeCommitDeferredEmojiUsage();
    },
    onLogin: function() {
      _toggleJumbomoji();
    },
    isValidName: function(name) {
      if (!name) return false;
      name = TS.emoji.stripWrappingColons(name).toLowerCase();
      if (TS.model.emoji_names.indexOf(name) == -1) return false;
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
    nameToBaseName: function(name) {
      if (!_.isString(name)) return "";
      name = name.replace(/(\:skin-tone-[2-6])/, "");
      name = TS.emoji.stripWrappingColons(name);
      return name;
    },
    stripWrappingColons: function(str) {
      if (!str) return "";
      str = String(str);
      return str.replace(/^:|:$/g, "");
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
      var custom;
      var idx;
      var temp_emoji_names = [];
      for (idx in _emoji.data) {
        temp_emoji_names.push.apply(temp_emoji_names, _emoji.data[idx][3]);
      }

      function isEmojiNameTaken(name) {
        return _emoji.map.colons.hasOwnProperty(name) || temp_emoji_names.indexOf(name) >= 0;
      }
      for (idx in customs) {
        custom = customs[idx];
        if (typeof custom == "object") {
          TS.model.emoji_complex_customs[idx] = custom;
          _emoji.data[idx] = [
            [], null, null, [idx], null, null, null, custom["apple"]
          ];
          _emoji.map.colons[idx] = idx;
          TS.model.all_custom_emoji.push(idx);
        } else {
          if (custom.indexOf("alias:") === 0) continue;
          if (isEmojiNameTaken(idx)) {
            TS.error("can't ingest custom emoji :" + idx + ": because that already exists");
            continue;
          }
          _emoji.data[idx] = [
            [], null, null, [idx], null, null, null, custom
          ];
          _emoji.map.colons[idx] = idx;
          TS.model.all_custom_emoji.push(idx);
        }
      }
      for (idx in customs) {
        custom = customs[idx];
        if (typeof custom == "object" || custom.indexOf("alias:") !== 0) continue;
        if (isEmojiNameTaken(idx)) {
          TS.error("can't ingest custom emoji :" + idx + ": because that already exists");
          continue;
        }
        alias_key = custom.replace("alias:", "");
        datum = _emoji.data.hasOwnProperty(alias_key) && _emoji.data[alias_key];
        if (datum) {
          datum[3].push(idx);
          _emoji.map.colons[idx] = alias_key;
          continue;
        }
        alias_key = _emoji.map.colons.hasOwnProperty(alias_key) && _emoji.map.colons[alias_key];
        datum = _emoji.data.hasOwnProperty(alias_key) && _emoji.data[alias_key];
        if (datum) {
          datum[3].push(idx);
          _emoji.map.colons[idx] = alias_key;
          continue;
        }
        TS.warn('alias for "' + idx + '":"' + custom + '" not recognized');
      }
      TS.model.all_custom_emoji = TS.model.all_custom_emoji.sort();
      if (_emoji && _emoji.inits) {
        delete _emoji.inits.emoticons;
        _emoji.init_emoticons();
      }
      _canonical_names_map = _makeCanonicalNamesMap();
    },
    setUpEmoji: function(no_rebuild_ui) {
      return new Promise(function(resolve) {
        if (!_emoji) return resolve();
        var complete = function() {
          _customEmojiDidChange(no_rebuild_ui);
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
        TS.api.call("emoji.list", {
          include_complex_values: 1
        }, function(ok, data, args) {
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
      if (!TS.utility.areSimpleObjectsEqual(_makeFrequents(), _frequents, "maybemakeMenuLists")) {
        TS.emoji.makeMenuLists();
      }
    },
    makeMenuLists: function() {
      var was_emoji_groups = TS.model.emoji_groups.concat();
      TS.model.emoji_groups.length = 0;
      TS.model.emoji_names.length = 0;
      var groupings = _.cloneDeep(_groupings);
      if (TS.model.all_custom_emoji && TS.model.all_custom_emoji.length) {
        groupings.push({
          display_name: "Custom",
          tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_slack"></i></span>',
          tab_icon: "ts_icon_slack",
          name: "slack",
          emoji_names: TS.model.all_custom_emoji
        });
      }
      _frequents = _makeFrequents();
      groupings.unshift({
        name: "mine",
        display_name: "Frequently Used",
        tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_clock_o"></i></span>',
        tab_icon: "ts_icon_clock_o",
        emoji_names: _frequents
      });
      var i, m;
      var name;
      var defaults = [];
      for (i = 0; i < groupings.length; i++) {
        defaults = defaults.concat(groupings[i].emoji_names);
      }
      var cat_map = {};
      for (var idx in _emoji.data) {
        var names = _emoji.data[idx][3];
        var is_skin_tone_modifiable = TS.emoji.isIdxSkinToneModifiable(idx);
        for (i = 0; i < names.length; i++) {
          name = names[i];
          TS.model.emoji_names.push(name);
          cat_map[name] = {
            html: TS.emoji.graphicReplace(":" + name + ":", {
              defer_usage_stat: true
            }),
            name: ":" + name + ":",
            names: ":" + names.join(": :") + ":"
          };
          TS.model.emoji_map.push({
            id: "E" + idx + (i > 0 ? "_alias_" + i : ""),
            name: name,
            name_with_colons: ":" + name + ":",
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
              var colon_name_with_skin = ":" + name_with_skin + ":";
              var colon_names_with_skins = names.map(function(n) {
                return n + "::" + skin_name;
              });
              cat_map[name_with_skin] = {
                is_skin: true,
                skin_tone_id: skin_name.substr(-1, 1),
                html: TS.emoji.graphicReplace(colon_name_with_skin, {
                  defer_usage_stat: true
                }),
                name: colon_name_with_skin,
                names: ":" + colon_names_with_skins.join(": :") + ":"
              };
            });
          }
        }
      }
      TS.model.emoji_map = _.uniqBy(TS.model.emoji_map, "id");
      for (i = 0; i < defaults.length; i++) {
        name = defaults[i];
        if (!cat_map[name]) {
          TS.info(name + " not in cat_map?");
        }
      }
      var grouping;
      var cat_map_items;
      var cat_map_item;
      var tab_html;
      for (i = 0; i < groupings.length; i++) {
        grouping = groupings[i];
        cat_map_items = [];
        cat_map_item = null;
        tab_html = "";
        if (grouping.tab_icon_html) {
          tab_html = grouping.tab_icon_html;
        }
        for (m = 0; m < grouping.emoji_names.length; m++) {
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
          items: cat_map_items
        });
      }
      var sheet_url = TS.emoji.getCurrentSheetUrl();
      if (TS.model.prefs.ss_emojis && sheet_url) {
        var img = new Image;
        img.onload = function() {
          img.onload = null;
          img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
          img = null;
        };
        img.src = sheet_url;
      }
      TS.model.emoji_names.sort();
      if (!TS.menu.emoji.is_dirty) {
        if (!TS.utility.areSimpleObjectsEqual(was_emoji_groups, TS.model.emoji_groups, "menu.emoji.is_dirty")) {
          TS.menu.emoji.setDirtyAndMaybeRender();
        }
      }
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
      if (TS.boot_data.version_ts == "dev") {
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
      if (options.defer_usage_stat) {
        _maybeRecordDeferredEmojiUsage(str);
      } else {
        _maybeRecordEmojiUsage(str);
      }
      _emoji.init_env();
      var was_text_mode = _emoji.text_mode;
      var was_include_title = _emoji.include_title;
      var was_include_text = _emoji.include_text;
      var was_supports_css = _emoji.supports_css;
      var was_emoji_mode_pref = TS.model.prefs.emoji_mode;
      var was_allow_skin_tone_squares = _emoji.allow_skin_tone_squares;
      if (options.force_img && options.obey_emoji_mode_pref) {
        options.obey_emoji_mode_pref = false;
        TS.error("obey_emoji_mode_pref now set to FALSE because options.force_img is TRUE");
      }
      if (options.force_style && options.obey_emoji_mode_pref) {
        options.obey_emoji_mode_pref = false;
        TS.error("obey_emoji_mode_pref now set to FALSE because options.force_style is " + options.force_style);
      }
      _emoji.text_mode = options.obey_emoji_mode_pref && TS.model.prefs.emoji_mode == "as_text";
      if (options.force_style) {
        TS.model.prefs.emoji_mode = options.force_style;
        TS.emoji.setEmojiMode();
        _emoji.use_sheet = false;
      }
      _emoji.include_title = !!options.include_title;
      _emoji.include_text = !!options.include_text;
      _emoji.supports_css = !options.force_img;
      _emoji.allow_skin_tone_squares = !options.no_skin_tone_squares;
      var html = _emoji.replace_colons(str);
      if (options.jumbomoji) {
        html = html.replace("emoji-sizer", "emoji-sizer emoji-only");
      }
      if (options.force_style) {
        TS.model.prefs.emoji_mode = was_emoji_mode_pref;
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
      return _emoji.replace_colons(str);
    },
    maybeUnifiedReplace: function(new_text) {
      if (_emoji.replace_mode != "unified") return new_text;
      return _emoji.replace_colons_with_unified(new_text);
    },
    replaceEmoticons: function(str) {
      return _emoji.replace_emoticons_with_colons(str);
    },
    getChosenSkinTone: function() {
      var pref = parseInt(TS.model.prefs.preferred_skin_tone);
      if (!pref || pref == "1" || !_.includes([2, 3, 4, 5, 6], pref)) return "";
      return "skin-tone-" + pref;
    },
    getChosenSkinToneModifier: function() {
      var tone = TS.emoji.getChosenSkinTone();
      if (!tone) return "";
      return ":" + tone + ":";
    },
    setEmojiMode: function() {
      _emoji.text_mode = TS.model.prefs.emoji_mode == "as_text";
      _emoji.do_emoticons = !!TS.model.prefs.graphic_emoticons;
      _emoji.allow_native = false;
      _emoji.use_sheet = function() {
        if (!TS.model.prefs.ss_emojis) return false;
        return !!TS.boot_data.page_needs_custom_emoji;
      }();
      if (TS.model.prefs.emoji_mode == "google" || TS.model.prefs.emoji_mode == "emojione" || TS.model.prefs.emoji_mode == "twitter") {
        _emoji.img_set = TS.model.prefs.emoji_mode;
      } else {
        _emoji.img_set = "apple";
      }
      if (!TS.model.emoji_complex_customs) return;
      for (var idx in TS.model.emoji_complex_customs) {
        if (!_emoji.data[idx]) continue;
        _emoji.data[idx][7] = TS.model.emoji_complex_customs[idx][TS.model.prefs.emoji_mode] || TS.model.emoji_complex_customs[idx]["apple"];
      }
    },
    getColonsRx: function() {
      return _emoji.rx_colons;
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
          _emoji.colons_mode = prev_emoji_colons_mode;
          return colons;
        }
      };
      for (var idx in _emoji.data) {
        var datum = _emoji.data[idx];
        var names = datum[3];
        var px = datum[4];
        var py = datum[5];
        var url = datum[7];
        var value;
        if (px !== null && py !== null) {
          value = [px, py];
        } else if (url) {
          value = url;
          if (TS.boot_data.feature_a11y_pref_no_animation && TS.model.prefs.a11y_animations === false) {
            value = TS.utility.getImgProxyURLWithOptions(url, {
              emoji: true
            });
          }
        } else {
          TS.error('WTF, _emoji "' + idx + '" is missing coords or and a url, or something!');
          continue;
        }
        names.forEach(function(it) {
          ob.emoji[it] = value;
        });
      }
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
    }
  });
  var _frequents;
  var _makeFrequents = function() {
    var root_name;
    var condensed = {};
    for (var k in TS.model.emoji_use) {
      root_name = TS.emoji.nameToCanonicalName(k.split("::")[0]);
      if (!condensed.hasOwnProperty(root_name)) {
        condensed[root_name] = 0;
      }
      condensed[root_name] += TS.model.emoji_use[k];
    }
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
  var _canonical_names_map;
  var _getCanonicalNamesMap = function() {
    _canonical_names_map = _canonical_names_map || _makeCanonicalNamesMap();
    return _canonical_names_map;
  };
  var _makeCanonicalNamesMap = function() {
    var map = {};
    var item;
    var name;
    for (name in _emoji.data) {
      item = _emoji.data[name];
      map[item[3][0]] = null;
      item[3].forEach(function(n) {
        if (map.hasOwnProperty(n)) return;
        map[n] = item[3][0];
      });
    }
    return map;
  };
  var _emoji = emoji;
  var _groupings = [{
    name: "people",
    display_name: "People",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_happy_smile"></i></span>',
    tab_icon: "ts_icon_happy_smile",
    emoji_names: ["grinning", "grimacing", "grin", "joy", "smiley", "smile", "sweat_smile", "laughing", "innocent", "wink", "blush", "slightly_smiling_face", "upside_down_face", "relaxed", "yum", "relieved", "heart_eyes", "kissing_heart", "kissing", "kissing_smiling_eyes", "kissing_closed_eyes", "stuck_out_tongue_winking_eye", "stuck_out_tongue_closed_eyes", "stuck_out_tongue", "money_mouth_face", "nerd_face", "sunglasses", "hugging_face", "smirk", "no_mouth", "neutral_face", "expressionless", "unamused", "face_with_rolling_eyes", "thinking_face", "flushed", "disappointed", "worried", "angry", "rage", "pensive", "confused", "slightly_frowning_face", "white_frowning_face", "persevere", "confounded", "tired_face", "weary", "triumph", "open_mouth", "scream", "fearful", "cold_sweat", "hushed", "frowning", "anguished", "cry", "disappointed_relieved", "sleepy", "sweat", "sob", "dizzy_face", "astonished", "zipper_mouth_face", "mask", "face_with_thermometer", "face_with_head_bandage", "sleeping", "zzz", "hankey", "smiling_imp", "imp", "japanese_ogre", "japanese_goblin", "skull", "ghost", "alien", "robot_face", "smiley_cat", "smile_cat", "joy_cat", "heart_eyes_cat", "smirk_cat", "kissing_cat", "scream_cat", "crying_cat_face", "pouting_cat", "raised_hands", "clap", "wave", "+1", "-1", "facepunch", "fist", "v", "ok_hand", "hand", "open_hands", "muscle", "pray", "point_up", "point_up_2", "point_down", "point_left", "point_right", "middle_finger", "raised_hand_with_fingers_splayed", "the_horns", "spock-hand", "writing_hand", "nail_care", "lips", "tongue", "ear", "nose", "eye", "eyes", "bust_in_silhouette", "busts_in_silhouette", "speaking_head_in_silhouette", "baby", "boy", "girl", "man", "woman", "person_with_blond_hair", "older_man", "older_woman", "man_with_gua_pi_mao", "man_with_turban", "cop", "construction_worker", "guardsman", "sleuth_or_spy", "santa", "angel", "princess", "bride_with_veil", "walking", "runner", "dancer", "dancers", "couple", "two_men_holding_hands", "two_women_holding_hands", "bow", "information_desk_person", "no_good", "ok_woman", "raising_hand", "person_with_pouting_face", "person_frowning", "haircut", "massage", "couple_with_heart", "woman-heart-woman", "man-heart-man", "couplekiss", "woman-kiss-woman", "man-kiss-man", "family", "man-woman-girl", "man-woman-girl-boy", "man-woman-boy-boy", "man-woman-girl-girl", "woman-woman-boy", "woman-woman-girl", "woman-woman-girl-boy", "woman-woman-boy-boy", "woman-woman-girl-girl", "man-man-boy", "man-man-girl", "man-man-girl-boy", "man-man-boy-boy", "man-man-girl-girl", "womans_clothes", "shirt", "jeans", "necktie", "dress", "bikini", "kimono", "lipstick", "kiss", "footprints", "high_heel", "sandal", "boot", "mans_shoe", "athletic_shoe", "womans_hat", "tophat", "helmet_with_white_cross", "mortar_board", "crown", "school_satchel", "pouch", "purse", "handbag", "briefcase", "eyeglasses", "dark_sunglasses", "ring", "closed_umbrella"]
  }, {
    name: "nature",
    display_name: "Nature",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_nature"></i></span>',
    tab_icon: "ts_icon_emoji_nature",
    emoji_names: ["dog", "cat", "mouse", "hamster", "rabbit", "bear", "panda_face", "koala", "tiger", "lion_face", "cow", "pig", "pig_nose", "frog", "octopus", "monkey_face", "see_no_evil", "hear_no_evil", "speak_no_evil", "monkey", "chicken", "penguin", "bird", "baby_chick", "hatching_chick", "hatched_chick", "wolf", "boar", "horse", "unicorn_face", "bee", "bug", "snail", "beetle", "ant", "spider", "scorpion", "crab", "snake", "turtle", "tropical_fish", "fish", "blowfish", "dolphin", "whale", "whale2", "crocodile", "leopard", "tiger2", "water_buffalo", "ox", "cow2", "dromedary_camel", "camel", "elephant", "goat", "ram", "sheep", "racehorse", "pig2", "rat", "mouse2", "rooster", "turkey", "dove_of_peace", "dog2", "poodle", "cat2", "rabbit2", "chipmunk", "feet", "dragon", "dragon_face", "cactus", "christmas_tree", "evergreen_tree", "deciduous_tree", "palm_tree", "seedling", "herb", "shamrock", "four_leaf_clover", "bamboo", "tanabata_tree", "leaves", "fallen_leaf", "maple_leaf", "ear_of_rice", "hibiscus", "sunflower", "rose", "tulip", "blossom", "cherry_blossom", "bouquet", "mushroom", "chestnut", "jack_o_lantern", "shell", "spider_web", "earth_americas", "earth_africa", "earth_asia", "full_moon", "waning_gibbous_moon", "last_quarter_moon", "waning_crescent_moon", "new_moon", "waxing_crescent_moon", "first_quarter_moon", "moon", "new_moon_with_face", "full_moon_with_face", "first_quarter_moon_with_face", "last_quarter_moon_with_face", "sun_with_face", "crescent_moon", "star", "star2", "dizzy", "sparkles", "comet", "sunny", "mostly_sunny", "partly_sunny", "barely_sunny", "partly_sunny_rain", "cloud", "rain_cloud", "thunder_cloud_and_rain", "lightning", "zap", "fire", "boom", "snowflake", "snow_cloud", "snowman_without_snow", "snowman", "wind_blowing_face", "dash", "tornado", "fog", "umbrella", "umbrella_with_rain_drops", "droplet", "sweat_drops", "ocean"]
  }, {
    name: "food_and_drink",
    display_name: "Food & Drink",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_food"></i></span>',
    tab_icon: "ts_icon_emoji_food",
    emoji_names: ["green_apple", "apple", "pear", "tangerine", "lemon", "banana", "watermelon", "grapes", "strawberry", "melon", "cherries", "peach", "pineapple", "tomato", "eggplant", "hot_pepper", "corn", "sweet_potato", "honey_pot", "bread", "cheese_wedge", "poultry_leg", "meat_on_bone", "fried_shrimp", "egg", "hamburger", "fries", "hotdog", "pizza", "spaghetti", "taco", "burrito", "ramen", "stew", "fish_cake", "sushi", "bento", "curry", "rice_ball", "rice", "rice_cracker", "oden", "dango", "shaved_ice", "ice_cream", "icecream", "cake", "birthday", "custard", "candy", "lollipop", "chocolate_bar", "popcorn", "doughnut", "cookie", "beer", "beers", "wine_glass", "cocktail", "tropical_drink", "champagne", "sake", "tea", "coffee", "baby_bottle", "fork_and_knife", "knife_fork_plate"]
  }, {
    name: "activity",
    display_name: "Activity",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_activities"></i></span>',
    tab_icon: "ts_icon_emoji_activities",
    emoji_names: ["soccer", "basketball", "football", "baseball", "tennis", "volleyball", "rugby_football", "8ball", "golf", "golfer", "table_tennis_paddle_and_ball", "badminton_racquet_and_shuttlecock", "ice_hockey_stick_and_puck", "field_hockey_stick_and_ball", "cricket_bat_and_ball", "ski", "skier", "snowboarder", "ice_skate", "bow_and_arrow", "fishing_pole_and_fish", "rowboat", "swimmer", "surfer", "bath", "person_with_ball", "weight_lifter", "bicyclist", "mountain_bicyclist", "horse_racing", "man_in_business_suit_levitating", "trophy", "running_shirt_with_sash", "sports_medal", "medal", "reminder_ribbon", "rosette", "ticket", "admission_tickets", "performing_arts", "art", "circus_tent", "microphone", "headphones", "musical_score", "musical_keyboard", "saxophone", "trumpet", "guitar", "violin", "clapper", "video_game", "space_invader", "dart", "game_die", "slot_machine", "bowling"]
  }, {
    name: "travel_and_places",
    display_name: "Travel & Places",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_emoji_travel"></i></span>',
    tab_icon: "ts_icon_emoji_travel",
    emoji_names: ["car", "taxi", "blue_car", "bus", "trolleybus", "racing_car", "police_car", "ambulance", "fire_engine", "minibus", "truck", "articulated_lorry", "tractor", "racing_motorcycle", "bike", "rotating_light", "oncoming_police_car", "oncoming_bus", "oncoming_automobile", "oncoming_taxi", "aerial_tramway", "mountain_cableway", "suspension_railway", "railway_car", "train", "monorail", "bullettrain_side", "bullettrain_front", "light_rail", "mountain_railway", "steam_locomotive", "train2", "metro", "tram", "station", "helicopter", "small_airplane", "airplane", "airplane_departure", "airplane_arriving", "boat", "motor_boat", "speedboat", "ferry", "passenger_ship", "rocket", "satellite", "seat", "anchor", "construction", "fuelpump", "busstop", "vertical_traffic_light", "traffic_light", "checkered_flag", "ship", "ferris_wheel", "roller_coaster", "carousel_horse", "building_construction", "foggy", "tokyo_tower", "factory", "fountain", "rice_scene", "mountain", "snow_capped_mountain", "mount_fuji", "volcano", "japan", "camping", "tent", "national_park", "motorway", "railway_track", "sunrise", "sunrise_over_mountains", "desert", "beach_with_umbrella", "desert_island", "city_sunrise", "city_sunset", "cityscape", "night_with_stars", "bridge_at_night", "milky_way", "stars", "sparkler", "fireworks", "rainbow", "house_buildings", "european_castle", "japanese_castle", "stadium", "statue_of_liberty", "house", "house_with_garden", "derelict_house_building", "office", "department_store", "post_office", "european_post_office", "hospital", "bank", "hotel", "convenience_store", "school", "love_hotel", "wedding", "classical_building", "church", "mosque", "synagogue", "kaaba", "shinto_shrine"]
  }, {
    name: "objects",
    display_name: "Objects",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_lightbulb_o"></i></span>',
    tab_icon: "ts_icon_lightbulb_o",
    emoji_names: ["watch", "iphone", "calling", "computer", "keyboard", "desktop_computer", "printer", "three_button_mouse", "trackball", "joystick", "compression", "minidisc", "floppy_disk", "cd", "dvd", "vhs", "camera", "camera_with_flash", "video_camera", "movie_camera", "film_projector", "film_frames", "telephone_receiver", "phone", "pager", "fax", "tv", "radio", "studio_microphone", "level_slider", "control_knobs", "stopwatch", "timer_clock", "alarm_clock", "mantelpiece_clock", "hourglass_flowing_sand", "hourglass", "satellite_antenna", "battery", "electric_plug", "bulb", "flashlight", "candle", "wastebasket", "oil_drum", "money_with_wings", "dollar", "yen", "euro", "pound", "moneybag", "credit_card", "gem", "scales", "wrench", "hammer", "hammer_and_pick", "hammer_and_wrench", "pick", "nut_and_bolt", "gear", "chains", "gun", "bomb", "hocho", "dagger_knife", "crossed_swords", "shield", "smoking", "skull_and_crossbones", "coffin", "funeral_urn", "amphora", "crystal_ball", "prayer_beads", "barber", "alembic", "telescope", "microscope", "hole", "pill", "syringe", "thermometer", "label", "bookmark", "toilet", "shower", "bathtub", "key", "old_key", "couch_and_lamp", "sleeping_accommodation", "bed", "door", "bellhop_bell", "frame_with_picture", "world_map", "umbrella_on_ground", "moyai", "shopping_bags", "balloon", "flags", "ribbon", "gift", "confetti_ball", "tada", "dolls", "wind_chime", "crossed_flags", "izakaya_lantern", "email", "envelope_with_arrow", "incoming_envelope", "e-mail", "love_letter", "postbox", "mailbox_closed", "mailbox", "mailbox_with_mail", "mailbox_with_no_mail", "package", "postal_horn", "inbox_tray", "outbox_tray", "scroll", "page_with_curl", "bookmark_tabs", "bar_chart", "chart_with_upwards_trend", "chart_with_downwards_trend", "page_facing_up", "date", "calendar", "spiral_calendar_pad", "card_index", "card_file_box", "ballot_box_with_ballot", "file_cabinet", "clipboard", "spiral_note_pad", "file_folder", "open_file_folder", "card_index_dividers", "rolled_up_newspaper", "newspaper", "notebook", "closed_book", "green_book", "blue_book", "orange_book", "notebook_with_decorative_cover", "ledger", "books", "book", "link", "paperclip", "linked_paperclips", "scissors", "triangular_ruler", "straight_ruler", "pushpin", "round_pushpin", "triangular_flag_on_post", "waving_white_flag", "waving_black_flag", "closed_lock_with_key", "lock", "unlock", "lock_with_ink_pen", "lower_left_ballpoint_pen", "lower_left_fountain_pen", "black_nib", "memo", "pencil2", "lower_left_crayon", "lower_left_paintbrush", "mag", "mag_right"]
  }, {
    name: "symbols",
    display_name: "Symbols",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_heart_o"></i></span>',
    tab_icon: "ts_icon_heart_o",
    emoji_names: ["heart", "yellow_heart", "green_heart", "blue_heart", "purple_heart", "broken_heart", "heavy_heart_exclamation_mark_ornament", "two_hearts", "revolving_hearts", "heartbeat", "heartpulse", "sparkling_heart", "cupid", "gift_heart", "heart_decoration", "peace_symbol", "latin_cross", "star_and_crescent", "om_symbol", "wheel_of_dharma", "star_of_david", "six_pointed_star", "menorah_with_nine_branches", "yin_yang", "orthodox_cross", "place_of_worship", "ophiuchus", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpius", "sagittarius", "capricorn", "aquarius", "pisces", "id", "atom_symbol", "u7a7a", "u5272", "radioactive_sign", "biohazard_sign", "mobile_phone_off", "vibration_mode", "u6709", "u7121", "u7533", "u55b6", "u6708", "eight_pointed_black_star", "vs", "accept", "white_flower", "ideograph_advantage", "secret", "congratulations", "u5408", "u6e80", "u7981", "a", "b", "ab", "cl", "o2", "sos", "no_entry", "name_badge", "no_entry_sign", "x", "o", "anger", "hotsprings", "no_pedestrians", "do_not_litter", "no_bicycles", "non-potable_water", "underage", "no_mobile_phones", "exclamation", "grey_exclamation", "question", "grey_question", "bangbang", "interrobang", "100", "low_brightness", "high_brightness", "trident", "fleur_de_lis", "part_alternation_mark", "warning", "children_crossing", "beginner", "recycle", "u6307", "chart", "sparkle", "eight_spoked_asterisk", "eject", "negative_squared_cross_mark", "white_check_mark", "diamond_shape_with_a_dot_inside", "cyclone", "loop", "globe_with_meridians", "m", "atm", "sa", "passport_control", "customs", "baggage_claim", "left_luggage", "wheelchair", "no_smoking", "wc", "parking", "potable_water", "mens", "womens", "baby_symbol", "restroom", "put_litter_in_its_place", "cinema", "signal_strength", "koko", "ng", "ok", "up", "cool", "new", "free", "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten", "keycap_star", "1234", "arrow_forward", "double_vertical_bar", "black_right_pointing_triangle_with_double_vertical_bar", "black_square_for_stop", "black_circle_for_record", "black_right_pointing_double_triangle_with_vertical_bar", "black_left_pointing_double_triangle_with_vertical_bar", "fast_forward", "rewind", "twisted_rightwards_arrows", "repeat", "repeat_one", "arrow_backward", "arrow_up_small", "arrow_down_small", "arrow_double_up", "arrow_double_down", "arrow_right", "arrow_left", "arrow_up", "arrow_down", "arrow_upper_right", "arrow_lower_right", "arrow_lower_left", "arrow_upper_left", "arrow_up_down", "left_right_arrow", "arrows_counterclockwise", "arrow_right_hook", "leftwards_arrow_with_hook", "arrow_heading_up", "arrow_heading_down", "hash", "information_source", "abc", "abcd", "capital_abcd", "symbols", "musical_note", "notes", "wavy_dash", "curly_loop", "heavy_check_mark", "arrows_clockwise", "heavy_plus_sign", "heavy_minus_sign", "heavy_division_sign", "heavy_multiplication_x", "heavy_dollar_sign", "currency_exchange", "copyright", "registered", "tm", "end", "back", "on", "top", "soon", "ballot_box_with_check", "radio_button", "white_circle", "black_circle", "red_circle", "large_blue_circle", "small_orange_diamond", "small_blue_diamond", "large_orange_diamond", "large_blue_diamond", "small_red_triangle", "black_small_square", "white_small_square", "black_large_square", "white_large_square", "small_red_triangle_down", "black_medium_square", "white_medium_square", "black_medium_small_square", "white_medium_small_square", "black_square_button", "white_square_button", "speaker", "sound", "loud_sound", "mute", "mega", "loudspeaker", "bell", "no_bell", "black_joker", "mahjong", "spades", "clubs", "hearts", "diamonds", "flower_playing_cards", "thought_balloon", "right_anger_bubble", "speech_balloon", "left_speech_bubble", "clock1", "clock2", "clock3", "clock4", "clock5", "clock6", "clock7", "clock8", "clock9", "clock10", "clock11", "clock12", "clock130", "clock230", "clock330", "clock430", "clock530", "clock630", "clock730", "clock830", "clock930", "clock1030", "clock1130", "clock1230"]
  }, {
    name: "flags",
    display_name: "Flags",
    tab_icon_html: '<span class="emoji-sizer"><i class="ts_icon ts_icon_flag"></i></span>',
    tab_icon: "ts_icon_flag",
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
    _emoji.init_colons();
  };
  var _customEmojiDidChange = function(no_rebuild_ui) {
    TS.emoji.setEmojiMode();
    TS.emoji.makeMenuLists();
    if (TS.client && !no_rebuild_ui) TS.client.ui.rebuildAll();
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
      TS.storage.storeEmojiUse(TS.model.emoji_use);
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
  var _emoji_usage;
  var _emoji_usage_deferred;
  var _maybeCommitDeferredEmojiUsage = function() {
    if (!_emoji_usage_deferred) return;
    Object.keys(_emoji_usage_deferred).forEach(function(emoji) {
      _maybeRecordEmojiUsage(emoji);
    });
    _emoji_usage_deferred = undefined;
  };
  var _maybeRecordDeferredEmojiUsage = function(str) {
    if (!_emoji_usage_deferred) return;
    _emoji_usage_deferred[str] = true;
  };
  var _maybeRecordEmojiUsage = function(str) {
    if (!_emoji_usage) return;
    str.replace(emoji.rx_colons, function(emoji_name) {
      _emoji_usage[emoji_name] = true;
    });
  };
  var _maybeInitEmojiUsageStats = function() {
    if (!TS.boot_data.feature_emoji_usage_stats) return;
    _emoji_usage = {};
    _emoji_usage_deferred = {};
    setTimeout(function() {
      TS.metrics.count("distinct_emoji_used_1hr", Object.keys(_emoji_usage).length);
      _emoji_usage = undefined;
      _emoji_usage_deferred = undefined;
    }, 60 * 60 * 1e3);
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
      TS.log(438, "TS.ssb.openNewFileWindow url: " + url);
      if (TS.client) {
        return TS.client.windows.openFileWindow(file.id, qs);
      } else if (window.is_in_ssb) {
        TS.ssb.upsertFileInSSBParentWin(file);
        if (document.ssb_main) {
          if (document.ssb_main.TS) {
            return document.ssb_main.TS.client.windows.openFileWindow(file.id, url);
          } else {
            return true;
          }
        } else if (window.winssb && window.opener && window.opener.executeJavaScript) {
          TS.log(438, "calling _executeInAtomSSBParentWin for TS.client.windows.openFileWindow");
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
        TS.log(438, "calling _executeInAtomSSBParentWin for TS.files.upsertAndSignal");
        _executeInAtomSSBParentWin("TS.files.upsertAndSignal(" + _prepObjectForEval(file) + ");");
      }
    },
    toggleMuteInWin: function(token, video, handler) {
      TS.log(438, "toggleMuteInWin called with token: " + token);
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
      TS.log(438, "distributeMsgToWin called with token: " + token);
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
          } else {
            TS.maybeWarn(438, "distributeMsgToWin win.window not ready! token: " + token);
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
    if (TS.boot_data.feature_calls) {
      return TSSSB.call("executeJavaScriptInParentWindow", {
        code: code,
        callback: handler
      });
    }
    _execute_parent_win_Q.push(arguments);
    if (_execute_parent_win_Q.length == 1) _executeInAtomSSBParentWinWorker(code, handler);
  };
  var _executeInAtomSSBParentWinWorker = function(code, handler) {
    TS.log(438, 'CALLING _executeInAtomSSBParentWin\n\n"' + code + '"');
    var callNext = function() {
      _execute_parent_win_Q.shift();
      if (_execute_parent_win_Q.length) _executeInAtomSSBParentWinWorker.apply(null, _execute_parent_win_Q[0]);
    };
    var allowance_ms = 2e3;
    var attempts = 1;
    var attempts_max = 2;
    var call = function() {
      var allowance_timer = setTimeout(function() {
        attempts++;
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
            var data_log = typeof data == "object" ? JSON.stringify(data, null, 2) : data;
            var pri = attempts == 1 ? 438 : 0;
            TS.log(pri, '_executeInAtomSSBParentWin\n\n"' + code + '"\n\nreturned data: ' + data_log);
          }
          if (handler) handler(err, data);
          setTimeout(callNext, 0);
        }
      });
      TS.log(438, 'CALLED _executeInAtomSSBParentWin\n\n"' + code + '"\n\n ret: ' + ret);
      return ret;
    };
    var ret = call();
    return !!ret;
  };
  var _execute_win_Q = [];
  var _executeInAtomSSBWin = function(win, code, handler) {
    if (TS.boot_data.feature_calls) {
      return TSSSB.call("executeJavaScriptInWindow", {
        window_token: win.token,
        code: code,
        callback: handler
      });
    }
    _execute_win_Q.push(arguments);
    TS.log(438, "_executeInAtomSSBWin _execute_win_Q: " + _execute_win_Q.length);
    if (_execute_win_Q.length == 1) _executeInAtomSSBWinWorker(win, code, handler);
  };
  var _executeInAtomSSBWinWorker = function(win, code, handler) {
    TS.log(438, "CALLING _executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"');
    var callNext = function() {
      _execute_win_Q.shift();
      if (_execute_win_Q.length) _executeInAtomSSBWinWorker.apply(null, _execute_win_Q[0]);
    };
    var allowance_ms = 2e3;
    var attempts = 1;
    var attempts_max = 2;
    var call = function() {
      var allowance_timer = setTimeout(function() {
        attempts++;
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
            var data_log = typeof data == "object" ? JSON.stringify(data, null, 2) : data;
            var pri = attempts == 1 ? 438 : 0;
            TS.log(pri, "_executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\nreturned data: ' + data_log);
          }
          if (handler) handler(err, data);
          setTimeout(callNext, 0);
        }
      });
      TS.log(438, "CALLED _executeInAtomSSBWin token: " + win.token + '\n\n"' + code + '"\n\n ret: ' + ret);
      return ret;
    };
    var ret = call();
    return !!ret;
  };
})();
(function() {
  "use strict";
  TS.registerModule("ui", {
    window_focus_changed_sig: new signals.Signal,
    window_unloaded_sig: new signals.Signal,
    onStart: function() {
      $(window).bind("focus", TS.ui.onWindowFocus);
      $(window).bind("blur", TS.ui.onWindowBlur);
      $("html").bind("mousedown", function(e) {
        TS.ui.onWindowFocus({
          target: window
        });
      });
      var has_focus_now = document.hasFocus && document.hasFocus() && window.macgap_is_in_active_space ? true : false;
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
      } else if (typeof window.addEventListener != "undefined") {
        window.addEventListener("beforeunload", TS.ui.onWindowUnload, false);
      } else if (typeof document.addEventListener != "undefined") {
        document.addEventListener("beforeunload", TS.ui.onWindowUnload, false);
      } else if (typeof window.attachEvent != "undefined") {
        window.attachEvent("onbeforeunload", TS.ui.onWindowUnload);
      } else {
        if (typeof window.onbeforeunload == "function") {
          window.onbeforeunload = function() {
            TS.ui.onWindowUnload();
            return false;
          };
        } else {
          window.onbeforeunload = TS.ui.onWindowUnload;
        }
      }
    },
    onWindowUnload: function() {
      if (TS.client) TS.client.markLastReadsWithAPI();
      TS.model.window_unloading = true;
      TS.ui.window_unloaded_sig.dispatch();
      return;
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
      if (e.target !== window) return;
      if (TS.model.ui.is_window_focused) return;
      TS.model.shift_key_pressed = false;
      TS.model.insert_key_pressed = false;
      TS.model.ui.is_window_focused = true;
      if (TS.view) TS.view.updateTitleBarColor();
      TS.ui.window_focus_changed_sig.dispatch(true);
    },
    onWindowBlur: function(e) {
      if (e.target !== window) return;
      if (!TS.model.ui.is_window_focused) return;
      TS.model.shift_key_pressed = false;
      TS.model.insert_key_pressed = false;
      TS.model.ui.is_window_focused = false;
      TS.ui.window_focus_changed_sig.dispatch(false);
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
      if ((is_at_channel || is_at_group) && !TS.members.canUserAtChannelOrAtGroup()) return false;
      if (model_ob.is_general && is_at_everyone && !TS.members.canUserAtEveryone()) return false;
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
        if (TS.members.canUserAtEveryone()) return false;
      }
      if (!TS.members.canUserAtChannelOrAtGroup()) {
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
      if (is_general && !TS.members.canUserAtEveryone()) {
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
          $(btn).removeClass("").addClass("btn_success").find(".ladda-label").html('<i class="ts_icon ts_icon_check_circle_o small_right_margin"></i>Saved');
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
        title: "Version Info",
        unique: VERSION_INFO_DIALOG_NAME,
        body: "<p>This version: " + this_version + '</p><p class="latest_version checking">Checking for updates...</p>',
        show_cancel_button: false,
        go_button_class: "btn_outline",
        go_button_text: "Close",
        show_secondary_go_button: false,
        onSecondaryGo: function() {
          window.location.reload();
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
          $latest_version.html("Your copy of Slack is up-to-date! " + TS.emoji.graphicReplace(":tada:"));
        } else {
          TS.generic_dialog.div.find(".btn.dialog_secondary_go").removeClass("hidden").text("Update");
          var requires_update = resp.data.min_version_ts > TS.boot_data.version_ts;
          if (requires_update) {
            $latest_version.html("An important new version of Slack is available. " + TS.emoji.graphicReplace(":sparkles:"));
          } else {
            $latest_version.html("A newer version of Slack is available. " + TS.emoji.graphicReplace(":sparkles:"));
          }
        }
      }).catch(_.noop);
    },
    setThemeClasses: function() {
      $("body").removeClass("dense_theme light_theme");
      if (TS.model.prefs.theme == "dense") {
        $("body").addClass("dense_theme");
      } else if (TS.model.prefs.theme == "light") {
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
        first_day: 0,
        hide_on_select: true,
        min: $(this).data("min") || null,
        max: $(this).data("max") || null,
        format: $(this).data("format") || "Y-m-d",
        class_name: "plastic_date_picker",
        hide: function() {
          $input.trigger("input");
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
    onStart: function() {},
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
    bindFileShareDropdowns: function(show_share_prefix, src_model_ob) {
      var $select_share_channels = $("#select_share_channels");
      var chosen_width = "60%";
      if (TS.web && TS.web.space) chosen_width = "100%";
      if ($select_share_channels.length != 1) {
        alert("error: " + $select_share_channels.length + " $('#select_share_channels')s");
        return;
      }
      _src_model_ob = src_model_ob;
      var prev_query;
      var prefix_regexes;
      var suffix_regexes;
      var prefix_regex;
      var suffix_regex;
      var match_names_only = true;
      var only_channels = false;
      var only_dms = false;
      if (TS.boot_data.page_needs_enterprise || TS.lazyLoadMembersAndBots()) {
        _file_share_options = {
          append: true,
          single: true,
          data_promise: _promiseToGetFileShareSelectOptions,
          approx_item_height: 30 * TS.utility.getA11yFontSizeMultiplier(),
          tab_to_nav: true,
          template: function(item) {
            return new Handlebars.SafeString(TS.templates.file_sharing_channel_row({
              item: item.model_ob,
              show_share_prefix: show_share_prefix
            }));
          },
          onItemAdded: _fileShareOnChange,
          setValue: function(val) {
            var i;
            var j;
            var data_length = this.data.length;
            var children_length;
            for (i = 0; i < data_length; i++) {
              children_length = this.data[i].children.length;
              for (j = 0; j < children_length; j++) {
                if (this.data[i].children[j].model_ob.id === val) {
                  this.$container.find('.lfs_item[data-lfs-id="' + [i, j] + '"]').trigger("click");
                  return;
                }
              }
            }
          }
        };
        $select_share_channels.lazyFilterSelect(_file_share_options);
      } else {
        _file_share_options = {
          append: true,
          single: true,
          data: _getFileShareSelectOptions(),
          tab_to_nav: true,
          template: function(item) {
            return new Handlebars.SafeString(TS.templates.file_sharing_channel_row({
              item: item.model_ob,
              show_share_prefix: show_share_prefix
            }));
          },
          filter: function(item, query) {
            if (prev_query !== query) {
              only_channels = false;
              only_dms = false;
              var original_query = query;
              if (query.charAt(0) === "#") {
                only_channels = true;
                query = query.substring(1);
              } else if (query.charAt(0) === "@") {
                only_dms = true;
                query = query.substring(1);
              }
              prefix_regexes = [];
              suffix_regexes = [];
              var queries = query.split(/[,| ]/).filter(function(i) {
                return !!i;
              });
              var query_i;
              for (var i = 0; i < queries.length; i++) {
                query_i = queries[i];
                if (query_i.charAt(0) === "@") query_i = query_i.substring(1);
                prefix_regexes.push(new RegExp("^" + TS.utility.regexpEscape(query_i), "i"));
                suffix_regexes.push(new RegExp("(-|_|\\+|\\s|\\.|@)" + TS.utility.regexpEscape(query_i), "i"));
              }
              prefix_regex = new RegExp("^" + TS.utility.regexpEscape(query), "i");
              suffix_regex = new RegExp("(-|_|\\+|\\s|\\.|@)" + TS.utility.regexpEscape(query), "i");
              prev_query = original_query;
            }
            var model_ob = item.model_ob;
            if (model_ob.is_self && TS.utility.queryIsMaybeSelf(query) && !only_channels && !only_dms) {
              return true;
            } else if (!only_channels && model_ob.is_mpim) {
              return TS.mpims.checkMpimMatch(model_ob, prefix_regexes, suffix_regexes);
            } else if (!only_dms && (model_ob.is_group || model_ob.is_channel)) {
              if (only_channels) {
                return model_ob.is_channel && model_ob.name.match(prefix_regex);
              } else {
                return model_ob.name.match(prefix_regex);
              }
            } else if (!only_channels && model_ob.presence) {
              return TS.utility.members.checkMemberMatch(model_ob, prefix_regex, match_names_only) || TS.utility.members.checkMemberMatch(model_ob, suffix_regex, match_names_only);
            }
            return false;
          },
          onItemAdded: _fileShareOnChange,
          setValue: function(val) {
            var i;
            var j;
            var data_length = this.data.length;
            var children_length;
            for (i = 0; i < data_length; i++) {
              children_length = this.data[i].children.length;
              for (j = 0; j < children_length; j++) {
                if (this.data[i].children[j].model_ob.id === val) {
                  this.$container.find('.lfs_item[data-lfs-id="' + [i, j] + '"]').trigger("click");
                  return;
                }
              }
            }
          }
        };
        $select_share_channels.lazyFilterSelect(_file_share_options);
      }
      $select_share_channels.css({
        width: chosen_width
      });
      $select_share_channels.one("remove", function() {
        $(this).lazyFilterSelect("destroy");
      });
      $("#file_sharing_div").on("keydown", function(e) {
        e.stopPropagation();
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
      var text = $("#file_comment_textarea").val();
      var c_id;
      var selected = $("#select_share_channels").lazyFilterSelect("value")[0];
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
          TS.log(1989, "Flannel: need to fetch all members in " + model_ob.name + " (" + model_ob.id + ") to see if we have to show at-channel dialog");
          TS.flannel.fetchAndUpsertAllMembersForModelOb(model_ob).then(function() {
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
        var members = [];
        if (show && model_ob && !model_ob.is_im) {
          members = _(model_ob.members).map(TS.members.getMemberById).compact().filter(TS.utility.members.isMemberNonBotNonDeletedNonSelf).sortBy(TS.members.memberSorterByName).value();
          if (members.length < 1) show = false;
        }
        if (show) {
          var html = TS.templates.at_channel_warning_note({
            keyword: keyword,
            member_count: members.length
          });
          $note.html(html);
          $note.removeClass("hidden");
          return;
        }
      }
      $note.addClass("hidden");
    },
    updateAtChannelBlockedNote: function() {
      var text = $("#file_comment_textarea").val();
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
      var text = $("#file_comment_textarea").val();
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
      var title = "Public link to this file";
      if (TS.boot_data.feature_external_files) {
        title = 'External link to this file <p style="display: inline-block;font-weight: 400"> (shareable with anyone) </p>';
      }
      TS.generic_dialog.start({
        title: title,
        body: html,
        show_cancel_button: false,
        show_close_button: true,
        show_secondary_go_button: true,
        secondary_go_button_class: "btn_outline",
        secondary_go_button_text: "Revoke",
        show_go_button: true,
        go_button_text: "Done",
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
      var title = "Revoke public file link";
      var body = '<p class="no_bottom_margin">This will disable the Public Link for this file. This will cause any previously shared links to stop working.<br /><br />Are you sure you want to revoke this public link?</p>';
      if (TS.boot_data.feature_external_files) {
        title = "Revoke external file link";
        body = '<p class="no_bottom_margin">This will disable the external link for this file. Any previously shared links will stop working.<br /><br />Are you sure you want to revoke this link?</p>';
      }
      TS.generic_dialog.start({
        title: title,
        body: body,
        go_button_text: "Revoke it",
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
  var _fileShareFilter = function(item, searcher) {
    if (item.is_mpim) {
      return TS.mpims.checkMpimMatch(item, searcher._prefix_regexes, searcher._suffix_regexes);
    } else if (item.is_group || item.is_channel) {
      return item.name.match(searcher._prefix_regex);
    }
    return false;
  };
  var _fileShareOnChange = function(item) {
    var selected_val, type_prefix;
    selected_val = item.model_ob.id;
    if (!selected_val) {
      return;
    } else {
      $("#share_model_ob_id").val(selected_val);
    }
    $("#select_share_groups_note, #select_share_channels_note, #select_share_ims_note, #select_share_mpims_note, #select_share_channels_join_note").addClass("hidden");
    type_prefix = selected_val.substring(0, 1);
    if (type_prefix === "C") {
      $("#select_share_channels_note").removeClass("hidden");
      $("#share_context_label").text("in");
      var channel = TS.shared.getModelObById(selected_val);
      if (channel && !channel.is_member) {
        $("#select_share_channels_join_note").removeClass("hidden");
      }
    } else if (type_prefix === "U" || type_prefix === "W" || type_prefix === "D") {
      $("#select_share_ims_note").removeClass("hidden");
      $("#share_context_label").text("with");
    } else if (item && item.model_ob && item.model_ob.is_mpim) {
      $("#select_share_mpims_note").removeClass("hidden");
      $("#share_context_label").text("with");
    } else {
      $("#select_share_groups_note").removeClass("hidden");
      $("#share_context_label").text("in");
    }
    TS.ui.file_share.updateAtChannelWarningNote();
    TS.ui.file_share.updateAtChannelBlockedNote();
  };
  var _promiseToGetFileShareSelectOptions = function(query) {
    if (query.charAt(0) === "@") query = query.substring(1);
    if (_file_share_options.query !== query) {
      _file_share_options.query = query;
      _file_share_options.include_org = TS.boot_data.page_needs_enterprise;
      _file_share_options.include_slackbot = true;
      _file_share_options.include_self = true;
      _file_share_options.full_profile_filter = false;
      _file_share_options._current_model_ob_id = _getActiveChannelId();
      _file_share_options._prefix_regexes = [];
      _file_share_options._suffix_regexes = [];
      var queries = query.split(/[,| ]/).filter(function(i) {
        return !!i;
      });
      for (var i = 0; i < queries.length; i++) {
        _file_share_options._prefix_regexes.push(new RegExp("^" + TS.utility.regexpEscape(queries[i]), "i"));
        _file_share_options._suffix_regexes.push(new RegExp("(-|_|\\+|\\s|\\.|@)" + TS.utility.regexpEscape(queries[i]), "i"));
      }
      _file_share_options._prefix_regex = new RegExp("^" + TS.utility.regexpEscape(query), "i");
      _file_share_options._suffix_regex = new RegExp("(-|_|\\+|\\s|\\.|@)" + TS.utility.regexpEscape(query), "i");
    }
    var promises = [_promiseToGetMembersAndMPIMs(_file_share_options), _promiseToGetChannelsAndGroups(_file_share_options)];
    return Promise.all(promises).then(function(responses) {
      var response = {
        _replace_all_items: true,
        items: []
      };
      var all_dms = responses[0];
      var all_channels = responses[1];
      all_channels = all_channels.map(function(channel) {
        channel.lfs_id = "0." + channel.model_ob.id;
        return channel;
      });
      all_dms = all_dms.map(function(dm) {
        dm.lfs_id = "1." + dm.model_ob.id;
        return dm;
      });
      if (all_channels.length) {
        response.items.push({
          lfs_group: true,
          label: "Channels",
          children: all_channels
        });
      }
      if (all_dms.length) {
        response.items.push({
          lfs_group: true,
          label: "Direct Messages",
          children: all_dms
        });
      }
      return Promise.resolve(response);
    });
  };
  var _promiseToGetMembersAndMPIMs = function(searcher) {
    return Promise.all([_promiseToGetMembers(searcher), _promiseToGetMPIMs(searcher)]).then(function(responses) {
      var members = responses[0];
      var mpims = responses[1];
      var all_dms = members.concat(mpims);
      all_dms.sort(function(a, b) {
        if (a.model_ob.is_mpim && !b.model_ob.is_mpim) return 1;
        if (b.model_ob.is_mpim && !a.model_ob.is_mpim) return -1;
        if (a.model_ob.is_slackbot) return 1;
        if (b.model_ob.is_slackbot) return -1;
        var a_srt = a.model_ob.is_mpim ? searcher._mpim_name_map[a.model_ob.id] : searcher._member_name_map[a.model_ob.id];
        var b_srt = b.model_ob.is_mpim ? searcher._mpim_name_map[b.model_ob.id] : searcher._member_name_map[b.model_ob.id];
        if (a_srt < b_srt) return -1;
        if (a_srt > b_srt) return 1;
        return 0;
      });
      return all_dms;
    });
  };
  var _promiseToGetMembers = function(searcher) {
    var search_p;
    if (_.trim(searcher.query) == "" && TS.lazyLoadMembersAndBots()) {
      search_p = Promise.resolve(searcher);
    } else {
      search_p = TS.members.promiseToSearchMembers(searcher);
    }
    return search_p.then(function(response) {
      if (!response._member_name_map) response._member_name_map = {};
      var items = [];
      if (response.query === "") {
        items = TS.members.getMembersForUser();
      } else {
        items = response.items;
      }
      items = items.map(function(item) {
        if (TS.boot_data.feature_name_tagging_client) {
          response._member_name_map[item.id] = TS.members.getMemberFullNameLowerCase(item);
        } else {
          response._member_name_map[item.id] = TS.members.getMemberDisplayNameLowerCase(item);
        }
        if (item.model_ob && typeof item.preselected !== "undefined") return item;
        var preselected = TS.model.ims.some(function(im) {
          return im.user === item.id && im.id === searcher._current_model_ob_id;
        });
        return {
          model_ob: item,
          preselected: preselected
        };
      });
      return items;
    });
  };
  var _promiseToGetMPIMs = function(searcher) {
    if (!searcher._mpim_name_map) searcher._mpim_name_map = {};
    var mpims = [];
    var mpim;
    var mpim_name_lowercase;
    var visible_mpims = TS.mpims.getVisibleMpims();
    for (var i = 0; i < visible_mpims.length; i++) {
      var should_see = true;
      mpim = visible_mpims[i];
      mpim_name_lowercase = TS.mpims.getDisplayNameLowerCase(mpim);
      should_see = _fileShareFilter(mpim, searcher);
      if (should_see) {
        mpims.push({
          model_ob: mpim,
          preselected: mpim.id === searcher._current_model_ob_id
        });
        searcher._mpim_name_map[mpim.id] = mpim_name_lowercase;
      }
    }
    return Promise.resolve(mpims);
  };
  var _promiseToGetChannelsAndGroups = function(searcher) {
    if (!searcher._archives_channel_id) searcher._archives_channel_id = TS.model.archive_view_is_showing && TS.client.archives.current_model_ob ? TS.client.archives.current_model_ob.id : null;
    return Promise.all([_promiseToGetChannels(searcher), _promiseToGetGroups(searcher)]).then(function(responses) {
      var channels = responses[0];
      var groups = responses[1];
      var all_channels = channels.concat(groups);
      all_channels.sort(function(a, b) {
        var a_srt = a.model_ob._name_lc;
        var b_srt = b.model_ob._name_lc;
        if (a_srt < b_srt) return -1;
        if (a_srt > b_srt) return 1;
        return 0;
      });
      return Promise.resolve(all_channels);
    });
  };
  var _promiseToGetChannels = function(searcher) {
    var channels = [];
    var channel;
    var can_post_in_general = TS.members.canUserPostInGeneral();
    for (var i = 0; i < TS.model.channels.length; i++) {
      channel = TS.model.channels[i];
      var should_see = true;
      should_see = _fileShareFilter(channel, searcher);
      var can_post_in_channel = TS.members.canMemberPostInChannel(channel);
      if ((!channel.is_general || can_post_in_general) && !channel.is_archived && should_see && can_post_in_channel) {
        channels.push({
          model_ob: channel,
          preselected: channel.id === searcher._current_model_ob_id
        });
      }
    }
    return Promise.resolve(channels);
  };
  var _promiseToGetGroups = function(searcher) {
    var groups = [];
    var group;
    for (var i = 0; i < TS.model.groups.length; i++) {
      group = TS.model.groups[i];
      var should_see = true;
      should_see = _fileShareFilter(group, searcher);
      var can_post_in_channel = TS.members.canMemberPostInChannel(group);
      if (!group.is_archived && should_see && can_post_in_channel) {
        groups.push({
          model_ob: group,
          preselected: group.id === searcher._current_model_ob_id
        });
      }
    }
    return Promise.resolve(groups);
  };
  var _getFileShareSelectOptions = function() {
    var i;
    var current_model_ob_id = _getActiveChannelId();
    var channels = [];
    var channel;
    var can_post_in_general = TS.members.canUserPostInGeneral();
    for (i = 0; i < TS.model.channels.length; i++) {
      channel = TS.model.channels[i];
      if ((!channel.is_general || can_post_in_general) && !channel.is_archived) {
        channels.push({
          model_ob: channel,
          preselected: channel.id === current_model_ob_id
        });
      }
    }
    var groups = [];
    var group;
    for (i = 0; i < TS.model.groups.length; i++) {
      group = TS.model.groups[i];
      if (!group.is_archived) {
        groups.push({
          model_ob: group,
          preselected: group.id === current_model_ob_id
        });
      }
    }
    var members = [];
    var member;
    var member_name_map = {};
    var members_for_user = TS.members.getMembersForUser();
    var im;
    var im_id;
    for (i = 0; i < members_for_user.length; i++) {
      member = members_for_user[i];
      if (!member || member.deleted) continue;
      im = TS.ims.getImByMemberId(member.id);
      im_id = im ? im.id : null;
      members.push({
        model_ob: member,
        preselected: im && im_id === current_model_ob_id
      });
      if (TS.boot_data.feature_name_tagging_client) {
        member_name_map[member.id] = TS.members.getMemberFullNameLowerCase(member);
      } else {
        member_name_map[member.id] = TS.members.getMemberDisplayNameLowerCase(member);
      }
    }
    var mpims = [];
    var mpim;
    var mpim_name_map = {};
    var visible_mpims = TS.mpims.getVisibleMpims();
    for (i = 0; i < visible_mpims.length; i++) {
      mpim = visible_mpims[i];
      mpims.push({
        model_ob: mpim,
        preselected: mpim.id === current_model_ob_id
      });
      mpim_name_map[mpim.id] = TS.mpims.getDisplayNameLowerCase(mpim);
    }
    var all_channels = channels.concat(groups);
    var all_dms = members.concat(mpims);
    all_channels.sort(function(a, b) {
      var a_srt = a.model_ob._name_lc;
      var b_srt = b.model_ob._name_lc;
      if (a_srt < b_srt) return -1;
      if (a_srt > b_srt) return 1;
      return 0;
    });
    all_dms.sort(function(a, b) {
      if (a.model_ob.is_mpim && !b.model_ob.is_mpim) return 1;
      if (b.model_ob.is_mpim && !a.model_ob.is_mpim) return -1;
      if (a.model_ob.is_slackbot) return 1;
      if (b.model_ob.is_slackbot) return -1;
      var a_srt = a.model_ob.is_mpim ? mpim_name_map[a.model_ob.id] : member_name_map[a.model_ob.id];
      var b_srt = b.model_ob.is_mpim ? mpim_name_map[b.model_ob.id] : member_name_map[b.model_ob.id];
      if (a_srt < b_srt) return -1;
      if (a_srt > b_srt) return 1;
      return 0;
    });
    return [{
      lfs_group: true,
      label: "Channels",
      children: all_channels
    }, {
      lfs_group: true,
      label: "Direct Messages",
      children: all_dms
    }];
  };
  var _getActiveChannelId = function() {
    if (TS.client && TS.client.activeChannelIsHidden() && _src_model_ob) {
      return _src_model_ob.id;
    }
    var active = TS.shared.getActiveModelOb();
    if (active) return active.id;
    if (TS.web && TS.web.space) return TS.web.space.getOriginChannel();
    return null;
  };
})();
