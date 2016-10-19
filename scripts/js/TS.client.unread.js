(function() {
  "use strict";
  TS.registerModule("client.unread", {
    switched_sig: new signals.Signal,
    is_showing: false,
    new_messages_in_channels: [],
    messages_loaded: false,
    onStart: function() {
      if (!TS.boot_data.feature_unread_view) return false;
      TS.prefs.enable_unread_view_changed_sig.add(_toggleUnreadView);
      TS.channels.message_received_sig.add(_messageReceived);
      TS.groups.message_received_sig.add(_messageReceived);
      TS.ims.message_received_sig.add(_messageReceived);
      TS.mpims.message_received_sig.add(_messageReceived);
      TS.channels.message_changed_sig.add(_messageChanged);
      TS.groups.message_changed_sig.add(_messageChanged);
      TS.ims.message_changed_sig.add(_messageChanged);
      TS.mpims.message_changed_sig.add(_messageChanged);
      TS.channels.message_removed_sig.add(_messageRemoved);
      TS.groups.message_removed_sig.add(_messageRemoved);
      TS.ims.message_removed_sig.add(_messageRemoved);
      TS.mpims.message_removed_sig.add(_messageRemoved);
      TS.files.team_file_changed_sig.add(_fileChanged);
      TS.channels.deleted_sig.add(_onDelete);
      TS.groups.deleted_sig.add(_onDelete);
      if (TS.boot_data.feature_unread_view_onboarding) {
        TS.client.login_sig.add(_addUnreadSignals)
      }
      TS.client.login_sig.add(_setSortOrder);
      TS.prefs.all_unreads_sort_order_changed_sig.add(_setSortOrder)
    },
    isEnabled: function() {
      return !!(TS.boot_data.feature_unread_view && TS.model.prefs.enable_unread_view)
    },
    shouldRecordMetrics: function() {
      return !!_should_record_metrics
    },
    showUnreadView: function(from_history, replace_history_state, direct_from_boot) {
      if (TS.model.sorting_mode_is_showing) return false;
      if (!TS.client.unread.isEnabled()) return false;
      from_history = !!from_history;
      replace_history_state = !!replace_history_state;
      var no_history_add = replace_history_state ? false : from_history;
      var switched = TS.client.unreadViewActivated(replace_history_state, no_history_add);
      if (switched) {
        TS.client.unread.switched_sig.dispatch()
      } else {
        return false
      }
      _direct_from_boot = direct_from_boot;
      _should_record_metrics = TS.utility.enableFeatureForUser(10);
      if (_should_record_metrics) TS.metrics.mark("unread_view_time_to_display");
      _resetData();
      _init_timestamp = TS.utility.date.makeTsStamp(null, "0", 9);
      TS.client.ui.unread.showUnreadView();
      if (_should_record_metrics) TS.metrics.count("unread_view_displayed");
      if (_should_record_metrics) TS.metrics.mark("unread_view_time_spent");
      if (_coachmark_has_been_displayed) {
        _coachmark_has_been_displayed = false;
        TS.metrics.count("unread_view_coachmark_conversion")
      }
      return true
    },
    destroyUnreadView: function() {
      if (!TS.client.ui.unread.isUnreadViewDOMShowing()) return;
      if (_should_record_metrics) TS.metrics.measureAndClear("unread_view_time_spent", "unread_view_time_spent");
      TS.client.ui.unread.destroyUnreadView();
      _resetData()
    },
    reload: function() {
      _direct_from_boot = undefined;
      TS.client.ui.unread.removeEmptyState();
      _resetData();
      TS.client.ui.unread.restart()
    },
    getGroup: function(model_ob_id) {
      return _.find(_groups, {
        model_ob: {
          id: model_ob_id
        }
      })
    },
    getAllGroups: function() {
      return _groups
    },
    collapseGroup: function(group, persist_state) {
      if (persist_state) TS.api.call("unread.collapse", {
        channel: group.id
      });
      group.collapsed = true;
      group.hidden_msgs = group.msgs;
      group.msgs = [];
      if (_backfilling_for_group && _backfilling_for_group.id === group.id) {
        _groups = _groups.concat(_excluded_groups);
        TS.client.ui.unread.addMessageContainerGroups(_excluded_groups);
        _stopBackfilling()
      }
      return group
    },
    expandGroup: function(group, persist_state) {
      group.collapsed = false;
      if (persist_state) TS.api.call("unread.expand", {
        channel: group.id
      });
      if (group.msgs.length > 0) {
        group.new_unread_msgs = group.msgs;
        group.new_unread_cnt = group.new_unread_msgs.length;
        group.msgs = []
      }
      group.msgs = group.msgs.concat(group.hidden_msgs);
      _sortAndDedupe(group, "msgs");
      group.hidden_msgs = [];
      if (group.has_more) {
        var group_index = _.findIndex(_groups, {
          id: group.id
        });
        _excluded_groups = _groups.splice(group_index + 1);
        TS.client.ui.unread.removeMessageContainerGroup(_.map(_excluded_groups, "id"));
        _backfilling_for_group = group;
        _backfilling_was_all_fetched = _all_messages_fetched;
        _all_messages_fetched = false
      }
      return group
    },
    markGroupAsRead: function(group, skip_mark_read_msg) {
      var reason = null;
      group.previous_read_ts = group.model_ob.last_read;
      group.marked_as_read_cnt = group.total_unreads;
      group.marked_as_read = true;
      group.total_unreads = 0;
      group.manually_marked_unread_msg = null;
      if (!skip_mark_read_msg) {
        TS.shared.markReadMsg(group.model_ob.id, TS.client.unread.getMarkerTS(group), reason);
        if (_should_record_metrics) TS.metrics.store("unread_view_mark_model_read", group.marked_as_read_cnt, {
          is_count: true
        })
      }
      return group
    },
    markGroupAsUnread: function(group) {
      TS.shared.markReadMsg(group.model_ob.id, group.previous_read_ts, null);
      group.marked_as_read = false;
      group.manually_marked_unread_msg = null;
      _current_model_ob_id = group.id;
      group.total_unreads = group.marked_as_read_cnt;
      group.marked_as_read_cnt = 0;
      return group
    },
    markAllAsRead: function() {
      var skip_mark_read_msg = true;
      var markers = {};
      var marked_as_read_cnt = 0;
      _groups.forEach(function(group) {
        markers[group.id] = TS.client.unread.getMarkerTS(group);
        TS.client.unread.markGroupAsRead(group, skip_mark_read_msg);
        marked_as_read_cnt += group.msgs.length
      });
      if (_should_record_metrics) TS.metrics.count("unread_view_mark_all_read");
      if (_should_record_metrics) TS.metrics.store("unread_view_mark_all_read_count", marked_as_read_cnt, {
        is_count: true
      });
      if (_all_messages_fetched) {
        TS.api.call("unread.markRead", {
          markers: JSON.stringify(markers)
        });
        TS.client.ui.unread.displayEmptyState(marked_as_read_cnt)
      } else {
        TS.api.call("unread.markRead", {
          markers: JSON.stringify(markers)
        }).then(function() {
          if (!TS.model.unread_view_is_showing) return;
          TS.client.unread.reload()
        })
      }
    },
    markAllAsUnread: function() {
      _groups.forEach(function(group) {
        TS.client.unread.markGroupAsUnread(group)
      });
      TS.client.ui.unread.removeEmptyState()
    },
    getMarkerTS: function(group) {
      var ts = TS.client.unread.getNewestMsgTs(group);
      if (!ts || ts < _init_timestamp) {
        ts = _init_timestamp
      }
      return ts
    },
    updateGroupWithNewMessages: function(group) {
      if (group.new_unread_msgs) {
        group.msgs = group.new_unread_msgs.concat(group.msgs);
        _sortAndDedupe(group, "msgs");
        group.total_unreads += group.new_unread_cnt;
        group.new_unread_cnt = 0;
        group.new_unread_msgs = [];
        group.marked_as_read = false;
        group.collapsed = false;
        TS.client.unread.new_messages_in_channels = _.without(TS.client.unread.new_messages_in_channels, group.id);
        TS.client.ui.unread.showOrHideRefreshButton()
      }
      return group
    },
    moveNewUnreadsOntoHiddenMsgs: function(group) {
      if (group.collapsed && group.marked_as_read && group.new_unread_msgs.length) {
        group.hidden_msgs = group.new_unread_msgs;
        _sortAndDedupe(group, "msgs");
        group.new_unread_cnt = 0;
        group.new_unread_msgs = [];
        group.msgs = [];
        group.total_unreads = group.hidden_msgs.length;
        group.marked_as_read = false;
        TS.client.unread.new_messages_in_channels = _.without(TS.client.unread.new_messages_in_channels, group.id);
        TS.client.ui.unread.showOrHideRefreshButton()
      }
      return group
    },
    getNewestMsgTs: function(group) {
      return group.msgs && group.msgs.length ? group.msgs[0].ts : null
    },
    promiseToGetMoreMessages: function() {
      if (!_direct_from_boot && !_current_model_ob_id && !TS.client.unread.getAllCurrentlyUnreadGroups().length) {
        _all_messages_fetched = true
      }
      if (_all_messages_fetched) return Promise.resolve({
        groups: [],
        has_more: false
      });
      clearTimeout(_slow_loading_timeout);
      _slow_loading_timeout = setTimeout(function() {
        TS.client.ui.unread.displaySlowLoadingMessage()
      }, 5e3);
      _more_messages_p = new Promise(function(resolve, reject) {
        TS.experiment.loadUserAssignments().then(function() {
          var skip_channels = [];
          if (_current_model_ob_id) {
            if (_should_record_metrics) TS.metrics.count("unread_view_scroll")
          }
          if (_backfilling_for_group) {
            var current_backfill_id = _backfilling_for_group.id;
            TS.api.call(TS.shared.getHistoryApiMethodForModelOb(_backfilling_for_group.model_ob), {
              channel: _backfilling_for_group.id,
              oldest: TS.client.unread.getNewestMsgTs(_backfilling_for_group) || _backfilling_for_group.model_ob.last_read,
              latest: _init_timestamp,
              always_asc: true
            }).then(function(resp) {
              clearTimeout(_slow_loading_timeout);
              if (!TS.model.unread_view_is_showing) return;
              if (_backfilling_for_group || _backfilling_for_group.id != current_backfill_id) {
                var data_for_processing = {
                  channels: [{
                    channel_id: _backfilling_for_group.id,
                    messages: resp.data.messages,
                    has_more: resp.data.has_more
                  }],
                  channels_count: 1,
                  total_messages_count: null
                };
                if (!resp.data.has_more) {
                  data_for_processing.groups = _excluded_groups
                }
                var processed_data = _processResp(data_for_processing, skip_channels);
                if (!resp.data.has_more) {
                  _stopBackfilling();
                  processed_data.has_more = !_all_messages_fetched
                }
                resolve(processed_data)
              } else {
                reject(new Error("channels.history rejected because we are no longer backfilling or we are backfilling a different group"))
              }
            }).catch(function(err) {
              TS.error(err);
              clearTimeout(_slow_loading_timeout);
              TS.client.ui.unread.displayFatalError()
            })
          } else {
            var api_args = {
              timestamp: _init_timestamp
            };
            if (_current_model_ob_id) {
              api_args.current_channel = _current_model_ob_id;
              var group = TS.client.unread.getGroup(_current_model_ob_id);
              if (group) {
                if (group.collapsed) {
                  api_args.current_channel_timestamp = _init_timestamp;
                  skip_channels.push(_current_model_ob_id)
                } else if (TS.client.unread.getNewestMsgTs(group)) {
                  api_args.current_channel_timestamp = TS.client.unread.getNewestMsgTs(group)
                }
              }
            }
            if (TS.boot_data.feature_all_unreads_sort_options) {
              api_args.sort = TS.client.unread.getSortOrder();
              if (_should_record_metrics || TS.boot_data.feature_tinyspeck) TS.metrics.mark("unread_history_sort_marker")
            }
            TS.api.call("unread.history", api_args).then(function(resp) {
              if (TS.boot_data.feature_all_unreads_sort_options) {
                if (_should_record_metrics || TS.boot_data.feature_tinyspeck) TS.metrics.measureAndClear("unread_history_sort_" + api_args.sort, "unread_history_sort_marker")
              }
              clearTimeout(_slow_loading_timeout);
              if (!TS.model.unread_view_is_showing) return;
              if (_backfilling_for_group) {
                reject(new Error("unread.history rejected because we are now backfilling"))
              } else {
                resolve(_processResp(resp.data, skip_channels, !_current_model_ob_id))
              }
            }).catch(function(err) {
              TS.error(err);
              clearTimeout(_slow_loading_timeout);
              TS.client.ui.unread.displayFatalError()
            })
          }
        })
      });
      return _more_messages_p
    },
    getMessage: function(model_ob, ts) {
      if (!TS.model.unread_view_is_showing) return null;
      var group = TS.client.unread.getGroup(model_ob.id);
      if (!group) return null;
      return TS.utility.msgs.getMsg(ts, group.msgs)
    },
    getTotalMessagesCount: function() {
      return _groups.reduce(function(previous, current) {
        return !current.marked_as_read ? previous + current.msgs.length : previous
      }, 0)
    },
    getCurrentModelID: function() {
      return _current_model_ob_id
    },
    areAllMessagesFetched: function() {
      return _all_messages_fetched
    },
    getAllCurrentlyUnreadGroups: function() {
      return TS.channels.getUnarchivedChannelsForUser().concat(TS.groups.getUnarchivedGroups(), TS.model.mpims, TS.model.ims).filter(function(model_ob) {
        return model_ob.unread_cnt > 0 ? true : false
      })
    },
    getTotalNewUnreadCount: function() {
      var count = _groups.reduce(function(total, group, i) {
        return group.new_unread_msgs ? total + group.new_unread_msgs.length : total
      }, 0);
      if (_orphan_new_msgs) {
        count = Object.keys(_orphan_new_msgs).reduce(function(total, group, i) {
          return total + _orphan_new_msgs[group].length
        }, count)
      }
      return count
    },
    moveActiveMarker: function(backwards) {
      var new_index = 0;
      var active_group_index = _.findIndex(_groups, {
        active: true
      });
      if (active_group_index != -1) {
        new_index = backwards ? active_group_index - 1 : active_group_index + 1
      }
      if (new_index >= 0 && _groups[new_index]) {
        if (_groups[active_group_index]) _groups[active_group_index].active = false;
        _groups[new_index].active = true;
        return _groups[new_index]
      }
    },
    setActiveGroup: function(group) {
      var current_group = TS.client.unread.getActiveGroup();
      if (current_group) current_group.active = false;
      group.active = true;
      return group
    },
    getActiveGroup: function() {
      return _.find(_groups, {
        active: true
      })
    },
    getSortOrder: function() {
      return _sort_order
    },
    test: function() {
      var test_ob = {
        _current_model_ob_id: null,
        _processResp: _processResp,
        _resetData: _resetData,
        _messageReceived: _messageReceived,
        _appendNewUnreadToGroup: _appendNewUnreadToGroup,
        _messageChanged: _messageChanged,
        _messageRemoved: _messageRemoved,
        _toggleUnreadView: _toggleUnreadView,
        _groups: [],
        _all_messages_fetched: false,
        _more_messages_p: undefined,
        _init_timestamp: undefined
      };
      Object.defineProperty(test_ob, "_processResp", {
        get: function() {
          return _processResp
        },
        set: function(v) {
          _processResp = v
        }
      });
      Object.defineProperty(test_ob, "_resetData", {
        get: function() {
          return _resetData
        },
        set: function(v) {
          _resetData = v
        }
      });
      Object.defineProperty(test_ob, "_current_model_ob_id", {
        get: function() {
          return _current_model_ob_id
        },
        set: function(v) {
          _current_model_ob_id = v
        }
      });
      Object.defineProperty(test_ob, "_groups", {
        get: function() {
          return _groups
        },
        set: function(v) {
          _groups = v
        }
      });
      Object.defineProperty(test_ob, "_all_messages_fetched", {
        get: function() {
          return _all_messages_fetched
        },
        set: function(v) {
          _all_messages_fetched = v
        }
      });
      Object.defineProperty(test_ob, "_more_messages_p", {
        get: function() {
          return _more_messages_p
        },
        set: function(v) {
          _more_messages_p = v
        }
      });
      Object.defineProperty(test_ob, "_messageReceived", {
        get: function() {
          return _messageReceived
        },
        set: function(v) {
          _messageReceived = v
        }
      });
      Object.defineProperty(test_ob, "_messageChanged", {
        get: function() {
          return _messageChanged
        },
        set: function(v) {
          _messageChanged = v
        }
      });
      Object.defineProperty(test_ob, "_messageRemoved", {
        get: function() {
          return _messageRemoved
        },
        set: function(v) {
          _messageRemoved = v
        }
      });
      Object.defineProperty(test_ob, "_appendNewUnreadToGroup", {
        get: function() {
          return _appendNewUnreadToGroup
        },
        set: function(v) {
          _appendNewUnreadToGroup = v
        }
      });
      Object.defineProperty(test_ob, "_toggleUnreadView", {
        get: function() {
          return _toggleUnreadView
        },
        set: function(v) {
          _toggleUnreadView = v
        }
      });
      Object.defineProperty(test_ob, "_init_timestamp", {
        get: function() {
          return _init_timestamp
        },
        set: function(v) {
          _init_timestamp = v
        }
      });
      Object.defineProperty(test_ob, "_backfilling_for_group", {
        get: function() {
          return _backfilling_for_group
        },
        set: function(v) {
          _backfilling_for_group = v
        }
      });
      Object.defineProperty(test_ob, "_excluded_groups", {
        get: function() {
          return _excluded_groups
        },
        set: function(v) {
          _excluded_groups = v
        }
      });
      Object.defineProperty(test_ob, "_orphan_new_msgs", {
        get: function() {
          return _orphan_new_msgs
        },
        set: function(v) {
          _orphan_new_msgs = v
        }
      });
      Object.defineProperty(test_ob, "_direct_from_boot", {
        get: function() {
          return _direct_from_boot
        },
        set: function(v) {
          _direct_from_boot = v
        }
      });
      Object.defineProperty(test_ob, "_sortAndDedupe", {
        get: function() {
          return _sortAndDedupe
        },
        set: function(v) {
          _sortAndDedupe = v
        }
      });
      Object.defineProperty(test_ob, "_backfilling_was_all_fetched", {
        get: function() {
          return _backfilling_was_all_fetched
        },
        set: function(v) {
          _backfilling_was_all_fetched = v
        }
      });
      return test_ob
    }
  });
  var _should_record_metrics;
  var _groups = [];
  var _excluded_groups = [];
  var _current_model_ob_id = null;
  var _all_messages_fetched = false;
  var _more_messages_p;
  var _init_timestamp;
  var _backfilling_for_group = null;
  var _backfilling_was_all_fetched;
  var _orphan_new_msgs = {};
  var _slow_loading_timeout;
  var _direct_from_boot;
  var _coachmark_has_been_displayed = false;
  var _sort_order;
  var _processResp = function(data, skip_channels, first_fetch) {
    skip_channels = skip_channels || [];
    var processed_data = {
      groups: [],
      has_more: true
    };
    TS.info("Received unread view response: " + data.channels_count + " channels; " + data.total_messages_count + " total messages (" + (first_fetch ? "first fetch" : "subsequent fetch") + ")");
    if (first_fetch) {
      if (_should_record_metrics) TS.metrics.count("unread_view_fetched_channels_first", data.channels_count);
      if (_should_record_metrics) TS.metrics.count("unread_view_fetched_messages_first", data.total_messages_count)
    }
    if (data.channels.length && skip_channels.length) {
      _.remove(data.channels, function(c) {
        return skip_channels.indexOf(c.channel_id) !== -1
      })
    }
    if (data.channels.length === 0 || !data.channels[0].has_more && data.total_messages_count === 0) {
      _all_messages_fetched = true;
      processed_data.has_more = false;
      return processed_data
    }
    if (data.channels.length === 1 && data.channels[0].messages.length === 0 && data.channels[0].collapsed && TS.client.unread.getGroup(data.channels[0].channel_id) && TS.client.unread.getGroup(data.channels[0].channel_id).collapsed && TS.client.unread.getGroup(data.channels[0].channel_id).msgs.length === 0) {
      _all_messages_fetched = true;
      processed_data.has_more = false;
      return processed_data
    }
    data.channels.forEach(function(unread_obj) {
      _current_model_ob_id = unread_obj.channel_id;
      var model_ob = TS.shared.getModelObById(_current_model_ob_id);
      var group = TS.client.unread.getGroup(_current_model_ob_id);
      var msgs = [];
      if (group) {
        msgs = unread_obj.messages.map(function(msg) {
          return TS.utility.msgs.processImsg(msg, model_ob.id)
        });
        msgs = group.msgs.concat(msgs);
        if (group.collapsed) {
          group.hidden_msgs = group.hidden_msgs.concat(msgs);
          group.marked_as_read_cnt = group.hidden_msgs.length
        } else {
          group.msgs = msgs
        }
        group.has_more = unread_obj.has_more
      } else {
        if (!unread_obj.has_more && !unread_obj.collapsed && !unread_obj.messages.length) {
          TS.warn("Received model_ob with no messages for unread view: " + _current_model_ob_id);
          return
        }
        if (!(first_fetch && _direct_from_boot) && model_ob.unread_cnt === 0) return;
        msgs = unread_obj.messages.map(function(msg) {
          return TS.utility.msgs.processImsg(msg, model_ob.id)
        });
        group = {
          id: _current_model_ob_id,
          order: _groups.length,
          msgs: msgs,
          hidden_msgs: [],
          model_ob: model_ob,
          marked_as_read: false,
          new_unread_cnt: 0,
          collapsed: unread_obj.collapsed,
          total_unreads: unread_obj.total_unreads,
          has_more: unread_obj.has_more
        };
        _groups.push(group)
      }
      if (!group.has_more && _orphan_new_msgs[group.id]) {
        _orphan_new_msgs[group.id].forEach(function(msg) {
          _appendNewUnreadToGroup(group, msg)
        });
        delete _orphan_new_msgs[group.id]
      }
      _sortAndDedupe(group, "msgs");
      TS.client.unread.messages_loaded = true;
      processed_data.groups.push(group)
    });
    if (data.groups) {
      data.groups.forEach(function(group) {
        _groups.push(group);
        processed_data.groups.push(group)
      })
    }
    var final_group = _.last(_groups);
    if (final_group && !final_group.has_more) {
      _all_messages_fetched = true;
      processed_data.has_more = false
    }
    return processed_data
  };
  var _sortAndDedupe = function(group, collection_key) {
    collection_key = collection_key || "msgs";
    TS.utility.msgs.sortMsgs(group[collection_key]);
    group[collection_key] = _.uniqBy(group[collection_key], "ts");
    return group
  };
  var _messageReceived = function(model_ob, msg) {
    if (!TS.model.unread_view_is_showing) return;
    if (TS.utility.msgs.isMsgHidden(msg)) return;
    if (msg.is_ephemeral) return;
    if (msg.user === TS.model.user.id) return;
    if (_.startsWith(msg.subtype, "sh_room")) return;
    if (TS.utility.msgs.isMsgHidden(msg)) return;
    if (TS.utility.msgs.msgMightBeRolledUp(msg)) return;
    var model_ob_is_muted_or_archived = model_ob.is_channel && model_ob.is_archived || TS.notifs.isCorGMuted(model_ob.id);
    if (!model_ob_is_muted_or_archived && TS.client.ui.unread.isFatalErrorDisplaying()) {
      TS.client.unread.reload();
      return
    }
    var group = TS.client.unread.getGroup(model_ob.id);
    if (group) {
      TS.client.ui.unread.updateNewMessagesMessage(_appendNewUnreadToGroup(group, msg))
    } else if (!model_ob.is_channel || !model_ob_is_muted_or_archived) {
      if (!_orphan_new_msgs[model_ob.id]) _orphan_new_msgs[model_ob.id] = [];
      _orphan_new_msgs[model_ob.id].push(msg)
    }
    if (!model_ob_is_muted_or_archived) {
      if (_.indexOf(TS.client.unread.new_messages_in_channels, model_ob.id) === -1) {
        TS.client.unread.new_messages_in_channels.push(model_ob.id)
      }
    }
    TS.client.ui.unread.showOrHideRefreshButton()
  };
  var _messageChanged = function(model_ob, msg) {
    if (!TS.model.unread_view_is_showing) return;
    if (_orphan_new_msgs[model_ob.id]) {
      var orphan_msg_index = _.findIndex(_orphan_new_msgs[model_ob.id], {
        ts: msg.ts
      });
      _orphan_new_msgs[model_ob.id].splice(orphan_msg_index, 1, TS.utility.msgs.processImsg(msg, model_ob.id))
    }
    var group = TS.client.unread.getGroup(model_ob.id);
    if (!group) return;
    var msg_index = _.findIndex(group.msgs, {
      ts: msg.ts
    });
    var new_msg_index = _.findIndex(group.new_unread_msgs, {
      ts: msg.ts
    });
    if (new_msg_index >= 0) {
      group.msgs.splice(new_msg_index, 1, TS.utility.msgs.processImsg(msg, model_ob.id))
    }
    if (msg_index >= 0) {
      group.msgs.splice(msg_index, 1, TS.utility.msgs.processImsg(msg, model_ob.id));
      TS.client.ui.unread.updateMsgs()
    }
  };
  var _messageRemoved = function(model_ob, msg) {
    if (!TS.model.unread_view_is_showing) return;
    if (_orphan_new_msgs[model_ob.id]) {
      _.remove(_orphan_new_msgs[model_ob.id], {
        ts: msg.ts
      });
      if (!_orphan_new_msgs[model_ob.id].length) {
        delete _orphan_new_msgs[model_ob.id]
      }
    }
    var group = TS.client.unread.getGroup(model_ob.id);
    if (!group) {
      if (!_orphan_new_msgs[model_ob.id]) {
        _.pull(TS.client.unread.new_messages_in_channels, model_ob.id)
      }
      TS.client.ui.unread.showOrHideRefreshButton();
      return
    }
    var msg_index = _.findIndex(group.msgs, {
      ts: msg.ts
    });
    var new_msg_index = _.findIndex(group.new_unread_msgs, {
      ts: msg.ts
    });
    if (new_msg_index >= 0) {
      group.new_unread_msgs.splice(new_msg_index, 1);
      group.new_unread_cnt = group.new_unread_msgs.length;
      TS.client.ui.unread.updateNewMessagesMessage(group)
    }
    if (msg_index >= 0) {
      group.msgs.splice(msg_index, 1);
      group.total_unreads--;
      if (group.msgs.length === 0) {
        _onDelete(group.model_ob)
      } else {
        TS.client.ui.unread.updateMsgs()
      }
    }
  };
  var _appendNewUnreadToGroup = function(group, msg) {
    var existing_msg = _.find(group.msgs, {
      ts: msg.ts
    });
    if (existing_msg) return group;
    if (!group.first_new_unread_ts) group.first_new_unread_ts = msg.ts;
    msg = TS.utility.msgs.processImsg(msg, group.id);
    if (!group.new_unread_msgs) group.new_unread_msgs = [];
    group.new_unread_msgs.push(msg);
    _sortAndDedupe(group, "new_unread_msgs");
    group.new_unread_cnt = group.new_unread_msgs.length;
    return group
  };
  var _fileChanged = function(file) {
    if (!TS.model.unread_view_is_showing) return;
    var groups_to_update = _.intersection(_.map(_groups, "id"), file.channels.concat(file.ims, file.groups));
    if (!groups_to_update.length) return;
    groups_to_update.forEach(function(model_ob_id) {
      var group = TS.client.unread.getGroup(model_ob_id);
      group.msgs.forEach(function(m) {
        if (!file.is_deleted && (m.subtype == "file_share" || m.subtype == "file_mention" || m.subtype == "file_comment") && m.file && m.file.id == file.id) {} else if (m.attachments && m.attachments.length && TS.inline_attachments.getAttachmentBySlackFileId(m.attachments, file.id)) {} else {
          return
        }
        if (file.mode === "hosted" || file.mode === "external") {
          if (file.comments.length || file.is_tombstoned == false) {
            _messageChanged(group.model_ob, m)
          } else {
            return
          }
        }
        TS.client.ui.unread.rebuildMsgFile(m, file)
      })
    })
  };
  var _onDelete = function(model_ob) {
    var group = TS.client.unread.getGroup(model_ob.id);
    if (group) {
      TS.client.ui.unread.removeMessageContainerGroup([model_ob.id]);
      _.remove(_groups, {
        id: model_ob.id
      });
      if (_current_model_ob_id === model_ob.id) {
        var last_group = _.last(_groups);
        if (last_group) {
          _current_model_ob_id = last_group.id
        }
      }
      TS.client.ui.unread.updateMsgs()
    }
  };
  var _toggleUnreadView = function() {
    TS.client.ui.unread.toggleUnreadView();
    if (!TS.model.prefs.enable_unread_view && TS.model.unread_view_is_showing) {
      TS.client.displayModelOb(TS.shared.getActiveModelOb());
      TS.client.unread.destroyUnreadView()
    }
  };
  var _resetData = function() {
    _backfilling_for_group = null;
    _backfilling_was_all_fetched = undefined;
    _excluded_groups = [];
    _all_messages_fetched = false;
    _current_model_ob_id = null;
    _groups = [];
    _more_messages_p = undefined;
    _init_timestamp = TS.utility.date.makeTsStamp(null, "0", 9);
    TS.client.unread.new_messages_in_channels = [];
    _orphan_new_msgs = {};
    if (_slow_loading_timeout) {
      clearTimeout(_slow_loading_timeout);
      _slow_loading_timeout = null
    }
  };
  var _addUnreadSignals = function() {
    TS.channels.unread_changed_sig.add(_handleAllUnreadSignals);
    TS.groups.unread_changed_sig.add(_handleAllUnreadSignals);
    TS.ims.unread_changed_sig.add(_handleAllUnreadSignals);
    TS.mpims.unread_changed_sig.add(_handleAllUnreadSignals)
  };
  var _removeUnreadSignals = function() {
    TS.channels.unread_changed_sig.remove(_handleAllUnreadSignals);
    TS.groups.unread_changed_sig.remove(_handleAllUnreadSignals);
    TS.ims.unread_changed_sig.remove(_handleAllUnreadSignals);
    TS.mpims.unread_changed_sig.remove(_handleAllUnreadSignals)
  };
  var _handleAllUnreadSignals = _.throttle(function() {
    _maybeDisplayCoachmark();
    TS.client.ui.unread.updateChannelPaneUnreadState(TS.model.all_unread_cnt > 0 && TS.client.unread.getAllCurrentlyUnreadGroups().length > 0)
  }, 1e3);
  var _stopBackfilling = function() {
    if (_backfilling_for_group) {
      _excluded_groups = [];
      _backfilling_for_group = null;
      _all_messages_fetched = _backfilling_was_all_fetched;
      _backfilling_was_all_fetched = undefined;
      TS.client.ui.unread.setMessageContainerHasMoreEnd(!_all_messages_fetched)
    }
  };
  var _maybeDisplayCoachmark = function() {
    if (TS.client.unread.isEnabled() || TS.model.prefs.seen_unread_view_coachmark) return;
    if (TS.client.unread.isEnabled() || TS.model.prefs.seen_unread_view_coachmark) {
      _removeUnreadSignals();
      return
    }
    if (TS.model.all_unread_cnt > 100) {
      var total_unread_models = TS.client.unread.getAllCurrentlyUnreadGroups();
      if (total_unread_models.length > 10) {
        _removeUnreadSignals();
        _displayCoachmark()
      }
    }
  };
  var _displayCoachmark = function() {
    if (TS.client.unread.isEnabled()) return;
    if (TS.model.prefs.seen_unread_view_coachmark) return;
    TS.model.prefs.seen_unread_view_coachmark = true;
    TS.prefs.setMultiPrefsByAPI({
      enable_unread_view: true,
      seen_unread_view_coachmark: true
    }, function() {
      TS.metrics.count("unread_view_coachmark_displayed");
      _coachmark_has_been_displayed = true;
      $("#channels_scroller").scrollTop(0);
      TS.coachmark.start(TS.coachmarks.coachmarks.unread_view)
    })
  };
  var _setSortOrder = function() {
    if (TS.model.prefs.all_unreads_sort_order) {
      _sort_order = TS.model.prefs.all_unreads_sort_order
    } else {
      TS.experiment.loadUserAssignments().then(function() {
        if (TS.model.team.plan !== "") {
          var group = TS.experiment.getGroup("all_unreads_sort_order");
          if (group === "default_alphabetical") {
            _sort_order = "alphabetical"
          } else if (group === "default_sli") {
            _sort_order = "priority"
          } else {
            _sort_order = "alphabetical"
          }
        } else {
          _sort_order = "alphabetical"
        }
      })
    }
  }
})();
