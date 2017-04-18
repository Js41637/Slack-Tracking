(function() {
  "use strict";
  TS.registerModule("tabcomplete.members", {
    getMatch: function(text, is_user_solicited) {
      var match;
      var index;
      var member_regex = /(^|\n|.)?(@[^\s\n@]*)$/i;
      if (TS.boot_data.feature_name_tagging_client) {
        member_regex = /(^|\n|.)?(@[^\n@]*)$/i;
      }
      text.replace(member_regex, function(full_match, before, prefixed_match, offset) {
        if (!TS.tabcomplete.isAllowedSurroundingCharacter(before)) return;
        if (before) offset += before.length;
        match = prefixed_match;
        index = offset;
      });
      if (!match && (!TS.model.prefs.require_at || is_user_solicited)) {
        var last_word = _.last(/(^|\s)([^\s\n@]+)$/.exec(text));
        last_word = TS.tabcomplete.trimSurroundingSymbols(last_word);
        if (_isValidUnprefixedMatch(last_word, is_user_solicited)) {
          match = last_word;
          index = text.length - last_word.length;
        }
      }
      if (!match) return;
      return {
        match: match,
        index: index
      };
    },
    shouldDisplayResults: function(query, results) {
      if (!query || _.isEmpty(results)) return false;
      if (TS.boot_data.feature_name_tagging_client) return true;
      var search_text = query.replace(/^@/, "").toLowerCase();
      var is_exact_match = results.length === 1 && results[0].name === search_text;
      return !is_exact_match;
    },
    getResultAtIndex: function(search_results, index) {
      if (!search_results || !_.isNumber(index)) return;
      return search_results[index];
    },
    getInsertData: function(result, query) {
      if (!result) return;
      var text;
      if (result.is_broadcast_keyword) {
        text = "@" + result.name;
      } else if (result.is_usergroup) {
        text = "@" + result.handle;
      } else {
        text = _getMemberDisplayText(result, query);
      }
      if (TS.client && TS.client.msg_input && TS.utility.contenteditable.hasFocus(TS.client.msg_input.$input) && ["@everyone", "@channel", "@here"].indexOf(text) === -1) {
        var model_ob = TS.shared.getActiveModelOb();
        if (!TS.client.msg_input.tabcomplete_completions[model_ob.id]) TS.client.msg_input.tabcomplete_completions[model_ob.id] = [];
        if (TS.client.msg_input.tabcomplete_completions[model_ob.id].indexOf(text) === -1) {
          TS.client.msg_input.tabcomplete_completions[model_ob.id].push(text.substring(1));
        }
      }
      if (TS.boot_data.feature_texty_mentions) {
        return {
          text: text,
          format: {
            slackmention: {
              id: result.id,
              label: text
            }
          }
        };
      }
      return {
        text: text
      };
    },
    search: function(text, options, callback) {
      var delay_ms = _getSearchDelay(text, options.isUserSolicited);
      var delayed = _delayedFunction(delay_ms);
      var model_ob;
      if (!options.no_model_ob) {
        model_ob = options.model_ob || TS.shared.getActiveModelOb();
      }
      var local_members = _getLocalMembers(model_ob, options.no_model_ob);
      var usergroups = TS.user_groups.getActiveUserGroups();
      var broadcast_keywords;
      if (options.complete_member_specials) {
        broadcast_keywords = TS.utility.members.getBroadcastKeywordsForUser();
      }
      var local_results = _sortResults(model_ob, text, {
        members: local_members,
        usergroups: usergroups,
        broadcast_keywords: broadcast_keywords
      });
      delayed(function() {
        callback(null, local_results);
      });
      if (model_ob) {
        var user_ids = _.map(local_members, "id");
        var is_empty_query = _.isEmpty(_.replace(text, "@", "").trim());
        if (is_empty_query && user_ids.length > MAX_USERS_FOR_EMPTY_QUERY) {
          var user_id_prefix = TS.boot_data.page_needs_enterprise ? "W" : "U";
          var frecency_users = TS.ui.frecency.getMostCommonWithPrefix(user_id_prefix, MAX_USERS_FOR_EMPTY_QUERY);
          var frecency_user_ids = _.map(frecency_users, "id");
          user_ids = _.intersection(user_ids, frecency_user_ids);
        }
        TS.log(1990, "Ensuring we have membership for " + user_ids.length + " users in " + model_ob.id + ": " + user_ids);
        TS.membership.ensureChannelMembershipIsKnownForUsers(model_ob.id, user_ids).then(function(did_fetch_statuses) {
          TS.log(1990, "Got membership for " + user_ids.length + " users in " + model_ob.id + "; any fetches required? " + did_fetch_statuses);
          if (did_fetch_statuses) {
            delayed(function() {
              callback(null, local_results);
            });
          }
        });
      }
      if (_shouldDoAsyncSearch(text, local_members, options)) {
        var async_p = _getAsyncResults(model_ob, text, MAX_DEFAULT_MATCH_CNT);
        var local_membership_p = Promise.resolve();
        if (model_ob) {
          local_membership_p = TS.membership.ensureChannelMembershipIsKnownForUsers(model_ob.id, _.map(local_members, "id"));
        }
        Promise.join(async_p, local_membership_p).then(function(results) {
          var api_members = results[0];
          var combined_members = _(local_members).concat(api_members).compact().uniqBy("id").value();
          var api_results = _sortResults(model_ob, text, {
            members: combined_members,
            usergroups: usergroups,
            broadcast_keywords: broadcast_keywords
          });
          var user_group_promises = [];
          if (model_ob) {
            var matched_user_groups = _.filter(api_results, "is_usergroup");
            user_group_promises = _.reduce(matched_user_groups, function(memo, user_group) {
              var promise = TS.user_groups.ensureUserGroupMembersInModelObNumIsKnown(user_group.id, model_ob.id);
              if (!promise.isResolved()) memo.push(promise);
              return memo;
            }, []);
          }
          if (user_group_promises.length) {
            Promise.all(user_group_promises).then(function() {
              delayed(function() {
                callback(null, api_results);
              });
            });
          } else if (!_areResultsEqualById(local_results, api_results)) {
            delayed(function() {
              callback(null, api_results);
            });
          }
          return null;
        });
      }
    },
    render: function(text, results, options) {
      if (text[0] !== "@") text = "@" + text;
      var header_html = TS.templates.tabcomplete_member_header({
        text: text
      });
      var model_ob;
      if (!options.no_model_ob) {
        model_ob = options.model_ob || TS.shared.getActiveModelOb();
      }
      var template_results = results.map(function(result) {
        if (result.is_broadcast_keyword) return result;
        if (result.is_usergroup) return _buildUserGroupTemplateArgs(model_ob, result);
        return _buildMemberTemplateArgs(model_ob, result, text);
      });
      var results_html = TS.templates.tabcomplete_member_results({
        results: template_results,
        is_client: !!TS.client
      });
      return TS.tabcomplete.renderMenu(header_html, results_html);
    },
    onSelect: function(result, query) {
      if (!result) return;
      if (!query) query = "";
      query = query.replace(/^@/, "");
      TS.ui.frecency.record(result, query);
    },
    onSelectedIndexChange: function(index) {
      TS.tabcomplete.onSelectedIndexChange(index);
    },
    test: function() {
      var tests = {
        IGNORED_SEARCH_TERMS: IGNORED_SEARCH_TERMS,
        MIN_UNPREFIXED_MATCH_LENGTH: MIN_UNPREFIXED_MATCH_LENGTH
      };
      Object.defineProperty(tests, "IGNORED_SEARCH_TERMS", {
        get: function() {
          return IGNORED_SEARCH_TERMS;
        },
        set: function(value) {
          IGNORED_SEARCH_TERMS = value;
        }
      });
      Object.defineProperty(tests, "_shouldDoAsyncSearch", {
        get: function() {
          return _shouldDoAsyncSearch;
        },
        set: function(value) {
          _shouldDoAsyncSearch = value;
        }
      });
      Object.defineProperty(tests, "_getLocalMembers", {
        get: function() {
          return _getLocalMembers;
        },
        set: function(value) {
          _getLocalMembers = value;
        }
      });
      Object.defineProperty(tests, "_sortResults", {
        get: function() {
          return _sortResults;
        },
        set: function(value) {
          _sortResults = value;
        }
      });
      Object.defineProperty(tests, "SEARCH_DELAY_MS", {
        get: function() {
          return SEARCH_DELAY_MS;
        },
        set: function(value) {
          SEARCH_DELAY_MS = value;
        }
      });
      return tests;
    }
  });
  var MAX_USERS_FOR_EMPTY_QUERY = 100;
  var MAX_DEFAULT_MATCH_CNT = 25;
  var IGNORED_SEARCH_TERMS = ["the", "and"];
  var MIN_UNPREFIXED_MATCH_LENGTH = 3;
  var SEARCH_DELAY_MS = 500;
  var _sortResults = function(model_ob, text, search_data) {
    var search_options = {
      allow_empty_query: true,
      frecency: true,
      limit: MAX_DEFAULT_MATCH_CNT,
      prefer_exact_match: true
    };
    var prefer_channel_members = model_ob && !model_ob.is_im;
    if (prefer_channel_members) {
      search_options.model_ob = model_ob;
      search_options.prefer_channel_members = prefer_channel_members;
    }
    var search_text = text.replace(/^@/, "");
    var results = TS.sorter.search(search_text, search_data, search_options);
    var model_obs = _.map(results, "model_ob");
    var members = _friendlyMemberFilter(search_text, model_obs);
    return members;
  };
  var _getAsyncResults = function(model_ob, text, limit) {
    var options = {
      query: text.replace(/^@/, ""),
      max_api_results: limit,
      include_org: true,
      include_slackbot: true,
      include_self: true,
      full_profile_filter: false,
      limit_by_model_relevancy: model_ob
    };
    if (model_ob && !model_ob.is_im) {
      options.determine_membership_for_channel = model_ob.id;
    }
    return TS.members.promiseToSearchMembers(options).then(function(res) {
      if (!res || !res.items || !res.items.length) return [];
      return res.items;
    });
  };
  var _shouldDoAsyncSearch = function(text, local_members, options) {
    if (!TS.boot_data.page_needs_enterprise && !TS.lazyLoadMembersAndBots()) return false;
    if (text.indexOf("@") !== 0) {
      if (IGNORED_SEARCH_TERMS.indexOf(text) !== -1) return false;
      if (text.length < MIN_UNPREFIXED_MATCH_LENGTH) return false;
      if (options.member_prefix_required) return false;
      if (TS.model.prefs.require_at) return false;
    }
    if (local_members && local_members.length) {
      if (local_members.length === 1 && "@" + local_members[0].name === text) return false;
    }
    return true;
  };
  var _getLocalMembers = function(model_ob, no_model_ob) {
    var active_members = TS.members.getActiveMembersWithSelfAndSlackbot();
    if (!no_model_ob) {
      active_members = active_members.filter(function(member) {
        return TS.utility.members.isMemberRelevantToModel(member, model_ob);
      });
    }
    return active_members;
  };
  var _buildMemberTemplateArgs = function(model_ob, member) {
    var primary_name_classes = [];
    var secondary_name_classes = [];
    var primary_name;
    var secondary_name;
    if (TS.boot_data.feature_name_tagging_client) {
      primary_name_classes.push("display_name");
      secondary_name_classes.push("secondary_name");
      primary_name = TS.members.getMemberDisplayName(member, false, false);
      if (TS.members.getMemberPreferredName(member)) {
        primary_name_classes.push("display_name");
        secondary_name_classes.push("full_name");
        secondary_name = TS.members.getMemberFullName(member);
      } else {
        primary_name_classes.push("full_name");
        secondary_name_classes.push("display_name");
        secondary_name = TS.members.getMemberPreferredName(member);
      }
    } else {
      primary_name_classes.push("username");
      secondary_name_classes.push("realname");
      primary_name = member.name;
      secondary_name = TS.members.getMemberRealName(member);
    }
    var show_channel_membership = model_ob && !model_ob.is_im;
    var member_does_not_belong_to_channel;
    var membership_status_is_known;
    if (show_channel_membership) {
      var membership_info = TS.membership.getUserChannelMembershipStatus(member.id, model_ob);
      membership_status_is_known = membership_info.is_known;
      if (membership_status_is_known) {
        member_does_not_belong_to_channel = !membership_info.is_member;
      } else {}
    }
    var team_name;
    if (TS.boot_data.feature_shared_channels_client && TS.utility.teams.isMemberExternal(member)) {
      var team = TS.teams.getTeamById(member.team_id);
      if (team && team.name) team_name = team.name;
    }
    return {
      is_member: true,
      member: member,
      primary_name_classes: primary_name_classes.join(" "),
      secondary_name_classes: secondary_name_classes.join(" "),
      show_channel_membership: show_channel_membership,
      member_does_not_belong_to_channel: member_does_not_belong_to_channel,
      secondary_name: secondary_name,
      primary_name: primary_name,
      membership_status_is_known: membership_status_is_known,
      team_name: team_name
    };
  };
  var _buildUserGroupTemplateArgs = function(model_ob, usergroup) {
    var members_not_in_channel = 0;
    if (model_ob) {
      members_not_in_channel = TS.user_groups.getUserGroupMembersNotInModelObCount(usergroup.id, model_ob.id);
    }
    return {
      description: usergroup.description || usergroup.name,
      is_usergroup: true,
      members_not_in_channel: members_not_in_channel,
      usergroup: usergroup
    };
  };
  var _isValidUnprefixedMatch = function(match, is_user_solicited) {
    if (!match) return false;
    if (is_user_solicited) return true;
    if (match.length < MIN_UNPREFIXED_MATCH_LENGTH) return false;
    if (_.includes(IGNORED_SEARCH_TERMS, match.toLowerCase())) return false;
    return true;
  };
  var _delayedFunction = function(delay_ms) {
    var stop_ts = Date.now() + delay_ms;
    return function(callback) {
      var now_ts = Date.now();
      var remaining_ms = Math.max(0, stop_ts - now_ts);
      setTimeout(callback, remaining_ms);
    };
  };
  var _getSearchDelay = function(text, is_user_solicited) {
    if (text.indexOf("@") === 0) return 0;
    if (is_user_solicited) return 0;
    return SEARCH_DELAY_MS;
  };
  var _getMemberDisplayText = function(member, query) {
    if (!query) query = "";
    var display_text = member.name;
    if (TS.boot_data.feature_name_tagging_client) {
      display_text = member.profile.display_name || member.profile.full_name;
    }
    if (TS.boot_data.feature_shared_channels_client && TS.utility.teams.isMemberExternal(member)) {
      var team = TS.teams.getTeamById(member.team_id);
      var suffix = member.team_id;
      if (team && team.domain) suffix = team.domain;
      display_text += "+" + suffix;
      if (!team) TS.console.warn("team " + member.team_id + " not in local model so not avail for tabcomplete");
    }
    var require_at = TS.model.team.prefs.require_at_for_mention || TS.model.prefs.require_at;
    var user_typed_at = query.indexOf("@") === 0;
    if (user_typed_at || require_at) display_text = "@" + display_text;
    return display_text;
  };
  var _areResultsEqualById = function(first, second) {
    if (!second && !first) return true;
    if (!second || !first) return false;
    if (first.length !== second.length) return false;
    return _.isEqualWith(first, second, function(a, b) {
      return a.id === b.id;
    });
  };
  var _friendlyMemberFilter = function(query, members) {
    if (!Array.isArray(members)) return members;
    if (!TS.model.prefs.require_at && query === "you") {
      return members.filter(function(member) {
        return member.id !== TS.model.user.id;
      });
    }
    return members;
  };
})();
