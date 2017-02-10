(function() {
  "use strict";
  TS.registerModule("flannel", {
    onStart: function() {
      if (TS.lazyLoadMembersAndBots()) {
        TS.ms.connected_sig.addOnce(_prefetchFrequentlyUsedMembers);
        TS.ms.connected_sig.add(_updatePresenceOnSlowReconnect);
      }
    },
    test: function() {
      var test_ob = {
        _deleted_user_ids: _deleted_user_ids,
        _batchUpsertObjects: _batchUpsertObjects,
        _updatePresenceOnSlowReconnect: _updatePresenceOnSlowReconnect
      };
      Object.defineProperty(test_ob, "_deleted_user_ids", {
        get: function() {
          return _deleted_user_ids;
        },
        set: function(ids) {
          _deleted_user_ids = ids;
        }
      });
      Object.defineProperty(test_ob, "_batchUpsertObjects", {
        get: function() {
          return _batchUpsertObjects;
        },
        set: function(v) {
          _batchUpsertObjects = v;
        }
      });
      return test_ob;
    },
    fetchAndUpsertObjectsByIds: function(ids) {
      return _fetchAndProcessObjectsByIds(ids, _batchUpsertObjects);
    },
    fetchAndUpsertObjectsWithQuery: function(query, limit) {
      return _fetchAndProcessObjectsWithQuery(query, _batchUpsertObjects, limit);
    },
    fetchAndUpsertAllMembersForModelOb: function(model_ob) {
      if (_.isUndefined(model_ob.members)) {
        throw new Error("This function can only be used with model objects that have members");
      }
      if (_model_ob_member_fetch_promises[model_ob.id]) return _model_ob_member_fetch_promises[model_ob.id];
      var c_ids = [model_ob.id];
      var t_ids = TS.model.team.id;
      var m_ids = model_ob.members;
      _model_ob_member_fetch_promises[model_ob.id] = TS.members.ensureMembersArePresent(m_ids, c_ids, t_ids).then(function() {
        if (!TS.members.haveAllMembersForModelOb(model_ob)) {
          TS.log(1989, "Flannel: error fetching missing members for channel " + model_ob.id);
          throw new Error("Tried to fetch members for channel but failed to get some");
        }
      }).catch(function() {
        delete _model_ob_member_fetch_promises[model_ob.id];
      });
      return _model_ob_member_fetch_promises[model_ob.id];
    },
    fetchAndUpsertAllMembersOnTeam: function() {
      var args = {
        count: _MAX_IDS_PER_QUERY
      };
      return TS.flannel.fetchAndUpsertObjectsWithQuery(args, Infinity);
    },
    connectAndFetchRtmStart: function(rtm_start_args) {
      TS.log(1996, "Opening a tokenless MS connection and fetching rtm.start over it");
      var flannel_url = _getFlannelConnectionUrl(rtm_start_args);
      var rtm_start_p = TS.ms.connectProvisionallyAndFetchRtmStart(flannel_url);
      if (!rtm_start_p) {
        throw new Error("TS.ms.connect did not return an rtm.start promise");
      }
      return rtm_start_p.then(function(start_data) {
        var data = start_data.rtm_start;
        delete data.users;
        delete data.updated_users;
        delete data.updated_bots;
        data.bots = [];
        _deleted_user_ids = start_data.deleted_users;
        var required_member_ids = _([data.mpims, data.ims]).flatten().map(function(ob) {
          return ob.members || [ob.user];
        }).flatten().concat(_.get(data, "self.id")).uniq().compact().value();
        if (TS.model.ms_logged_in_once && !TS.isPartiallyBooted()) {
          var known_member_ids = _.map(TS.model.members, "id");
          required_member_ids = _.difference(required_member_ids, known_member_ids);
        }
        if (!required_member_ids.length) {
          TS.info("Got rtm.start data and don't need to fetch any members");
          data.users = [];
          return data;
        }
        TS.info("Got rtm.start data but need to fetch " + required_member_ids.length + " members");
        if (TS.shouldLog(1989) || TS.boot_data.feature_tinyspeck) {
          TS.info(required_member_ids.join(", "));
        }
        return _fetchRawObjectsByIds(required_member_ids).then(function(members) {
          TS.info("Got " + members.length + " members for rtm.start :tada:");
          data.users = members;
          if (required_member_ids.length !== members.length) {
            TS.error("TS.flannel.connectAndFetchRtmStart problem: Requested " + required_member_ids.length + " members but received " + members.length + ". Missing members: " + _.difference(required_member_ids, _.map(members, "id")).join(","));
          }
          return data;
        }).catch(function(err) {
          TS.error("Got error while trying to fetch " + required_member_ids.length + "members for rtm.start :(", err);
          throw err;
        });
      });
    },
    setMemberDeletedStatus: function(user_id, is_deleted) {
      if (!_.isString(user_id)) {
        throw new Error("Expected user_id to be a string");
      }
      var was_deleted = TS.flannel.isMemberDeleted(user_id);
      if (is_deleted && !was_deleted) {
        _deleted_user_ids.push(user_id);
      } else if (was_deleted && !is_deleted) {
        _.pull(_deleted_user_ids, user_id);
      }
      return is_deleted != was_deleted;
    },
    isMemberDeleted: function(user_id) {
      if (!_.isString(user_id)) {
        throw new Error("Expected user_id to be a string");
      }
      return _.includes(_deleted_user_ids, user_id);
    },
    batchUpsertObjects: function(objects) {
      return _batchUpsertObjects(objects);
    },
    __temp__setChannelMembers: function(channel_id, user_ids) {
      __temp__channel_members[channel_id] = user_ids;
    },
    __temp_getChannelMembers: function(channel_id) {
      return __temp__channel_members[channel_id];
    },
    fetchAccessibleUserIdsForGuests: function() {
      if (!TS.model.user.is_restricted) throw new Error("This method is only intended for guests");
      var channel_member_ids = _(TS.model.channels).map("id").map(TS.flannel.__temp_getChannelMembers).flatten().value();
      var other_member_ids = _([TS.model.groups, TS.model.ims, TS.model.mpims]).flatten().map(function(ob) {
        return ob.members || ob.user;
      }).flatten().value();
      var all_accessible_member_ids = _(channel_member_ids).concat(other_member_ids).uniq().without("USLACKBOT").value();
      return Promise.resolve(all_accessible_member_ids);
    },
    fetchChannelMembershipForUsers: function(channel_id, user_ids) {
      var membership_info = {};
      var channel_members = __temp__channel_members[channel_id] || TS.shared.getModelObById(channel_id).members;
      user_ids.forEach(function(user_id) {
        membership_info[user_id] = channel_members.indexOf(user_id) >= 0;
      });
      return Promise.resolve(membership_info);
    },
    fetchMembershipCountsForChannel: function(channel_id) {
      var model_ob = TS.shared.getModelObById(channel_id);
      var resp = TS.members.getMembershipCounts(model_ob);
      if (resp.promise) {
        return resp.promise.then(function() {
          return resp.counts;
        });
      } else {
        return Promise.resolve(resp.counts);
      }
    }
  });
  var __temp__channel_members = {};
  var _deleted_user_ids = [];
  var _MAX_IDS_PER_QUERY = 500;
  var _model_ob_member_fetch_promises = {};
  var _fetchAndProcessObjects = function(query, objects, process_fn, limit) {
    return TS.ms.flannel.call("query_request", query).then(function(resp) {
      if (_.get(resp, "results.length")) {
        objects = objects.concat(process_fn(resp.results));
        if (limit && (objects.length >= limit || !resp.next_marker)) {
          return {
            objects: objects.slice(0, limit),
            next_marker: objects.length > limit ? objects[limit].id : resp.next_marker
          };
        }
      }
      if (!resp.next_marker || objects.length >= query.count && !limit) {
        TS.log(1989, "Flannel: finished fetching results for query", query);
        return {
          objects: objects.slice(0, query.count),
          next_marker: objects.length > query.count ? objects[query.count].id : resp.next_marker
        };
      }
      query.marker = resp.next_marker;
      TS.log(1989, "Flannel: fetching next page for query", query);
      return _fetchAndProcessObjects(query, objects, process_fn, limit);
    });
  };
  var _batchUpsertObjects = function(objects) {
    TS.log(1989, "Flannel: upserting batch of " + objects.length + " objects");
    var is_upserting_bots = _.some(objects, _isBot);
    if (is_upserting_bots) TS.bots.startBatchUpsert();
    var is_upserting_members = _.some(objects, TS.utility.members.isMember);
    if (is_upserting_members) TS.members.startBatchUpsert();
    var upserted_objects;
    try {
      upserted_objects = _(objects).map(_upsertObject).compact().value();
    } finally {
      if (is_upserting_bots) TS.bots.finishBatchUpsert();
      if (is_upserting_members) TS.members.finishBatchUpsert();
    }
    return upserted_objects;
  };
  var _upsertObject = function(ob) {
    if (_isBot(ob)) {
      TS.log(1989, "Flannel: upserting bot " + ob.id + " from query results");
      return TS.bots.upsertAndSignal(ob).bot;
    } else if (TS.utility.members.isMember(ob)) {
      TS.log(1989, "Flannel: upserting user " + ob.id + " from query results");
      return TS.members.upsertAndSignal(ob).member;
    }
  };
  var _isBot = function(ob) {
    var ob_type = _.get(ob, "id[0]");
    return ob_type == "B";
  };
  var _prefetchFrequentlyUsedMembers = function() {
    var MAX_FRECENCY_PREFETCH_MEMBERS = 100;
    var member_id_prefix = TS.boot_data.page_needs_enterprise ? "W" : "U";
    var known_ids = _.map(TS.model.members, "id");
    var ids = _(TS.ui.frecency.getMostCommonWithPrefix(member_id_prefix, MAX_FRECENCY_PREFETCH_MEMBERS)).map("id").difference(known_ids).value();
    if (!ids.length) return;
    TS.log(1989, "Flannel: pre-fetching " + ids.length + " most frequently accessed members...");
    TS.flannel.fetchAndUpsertObjectsByIds(ids).then(function(members) {
      TS.log(1989, "Flannel: pre-fetched " + members.length + " most frequently accessed members 👍");
    }).catch(_.noop);
  };
  var _fetchAndProcessObjectsByIds = function(ids, process_fn) {
    var object_chunks_p = _.chunk(ids, _MAX_IDS_PER_QUERY).map(function(chunk_ids) {
      return _fetchAndProcessObjectsWithQuery({
        ids: chunk_ids
      }, process_fn).reflect();
    });
    return Promise.all(object_chunks_p).then(function(results) {
      var rejection_reasons = results.filter(function(p) {
        return p.isRejected();
      }).map(function(p) {
        return p.reason();
      });
      if (rejection_reasons.length) {
        var e = new Error("Some Flannel fetches failed");
        e.rejection_reasons = rejection_reasons;
        return Promise.reject(e);
      }
      var members = _(results).map(function(p) {
        return p.value().objects;
      }).flatten().value();
      return Promise.resolve(members);
    });
  };
  var _fetchAndProcessObjectsWithQuery = function(query, process_fn, limit) {
    if (_.isString(query)) {
      query = {
        query: query
      };
    }
    var objects = [];
    return _fetchAndProcessObjects(query, objects, process_fn, limit);
  };
  var _getFlannelConnectionUrl = function(rtm_start_args) {
    return TS.utility.url.setUrlQueryStringValue(TS.boot_data.ms_connect_url, "start_args", TS.utility.url.queryStringEncode(rtm_start_args));
  };
  var _updatePresenceOnSlowReconnect = function(last_connect_was_fast) {
    if (!TS.lazyLoadMembersAndBots()) return;
    if (!!TS.ms.num_times_connected && !last_connect_was_fast) {
      var member_ids_needing_update = _.map(TS.model.members, "id");
      var bot_ids_needing_update = _.map(TS.model.bots, "id");
      TS.flannel.fetchAndUpsertObjectsByIds(member_ids_needing_update.concat(bot_ids_needing_update)).catch(function(err) {
        TS.err("Updating presence after slow reconnect failed for some users", err);
        throw err;
      });
    }
  };
  var _fetchRawObjectsByIds = function(ids) {
    return _fetchAndProcessObjectsByIds(ids, _.identity);
  };
})();
