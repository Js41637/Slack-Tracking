(function() {
  "use strict";
  TS.registerModule("web.admin", {
    member_profile_set_sig: new signals.Signal,
    member_profile_set_email_sig: new signals.Signal,
    member_profile_set_username_sig: new signals.Signal,
    member_admin_set_sig: new signals.Signal,
    member_admin_removed_sig: new signals.Signal,
    member_owner_set_sig: new signals.Signal,
    member_owner_removed_sig: new signals.Signal,
    member_enabled_sig: new signals.Signal,
    restricted_member_enabled_sig: new signals.Signal,
    ultra_restricted_member_enabled_sig: new signals.Signal,
    member_disabled_sig: new signals.Signal,
    member_rebind_sig: new signals.Signal,
    member_restricted_sig: new signals.Signal,
    member_ultra_restricted_sig: new signals.Signal,
    member_unrestricted_sig: new signals.Signal,
    member_invited_channel_sig: new signals.Signal,
    member_invited_group_sig: new signals.Signal,
    member_kicked_channel_sig: new signals.Signal,
    member_kicked_group_sig: new signals.Signal,
    member_ura_changed_sig: new signals.Signal,
    active_members: [],
    restricted_members: [],
    ultra_restricted_members: [],
    disabled_members: [],
    pending_invites: [],
    accepted_invites: [],
    subset_data: {
      active_members_count: 0,
      restricted_members_count: 0,
      ultra_restricted_members_count: 0,
      disabled_members_count: 0
    },
    html_cache: {},
    view: "list",
    sort_order: "",
    active_tab: "",
    tabs_need_rebuild: false,
    lazyload: null,
    onStart: function() {
      TS.team.ensureTeamProfileFields();
      active_bots_header_html = TS.i18n.t('<h5 class="bot_header large_top_margin no_bottom_margin subtle_silver"><i class="ts_icon ts_icon_bolt small_right_margin"></i> Bots</h5>', "web_admin")();
      invite_restricted_html = TS.i18n.t('<p class="ra_invite_prompt subtle_silver top_margin align_center">Your team does not have any {restricted_accounts}. <a data-action="admin_invites_modal" data-account-type="restricted">Invite a new {restricted_account}</a></p>', "web_admin")({
        restricted_accounts: TS.templates.builders.raLabel("Restricted Accounts"),
        restricted_account: TS.templates.builders.raLabel("Restricted Account")
      });
      invite_ultra_restricted_html = TS.i18n.t('<p class="ra_invite_prompt subtle_silver top_margin align_center">Your team does not have any Single-Channel Guests. <a data-action="admin_invites_modal" data-account-type="ultra_restricted">Invite a new Single-Channel Guest</a></p>', "web_admin")();
      restricted_header_html = TS.i18n.t('<h5 class="restricted_header small_bottom_margin"><i class="presence large away ra small_right_margin"></i> {restricted_accounts}</h5>', "web_admin")({
        restricted_accounts: TS.templates.builders.raLabel("Restricted Accounts")
      });
      ultra_restricted_header_html = TS.i18n.t('<h5 class="restricted_header small_bottom_margin large_top_margin"><i class="presence large away ura small_right_margin"></i> Single-Channel Guests</h5>', "web_admin")();
      TS.web.login_sig.add(TS.web.admin.onLogin, TS.web.admin);
      TS.web.admin.member_profile_set_sig.add(TS.web.admin.memberProfileSet, TS.web.admin);
      TS.web.admin.member_profile_set_email_sig.add(TS.web.admin.memberProfileSetEmail, TS.web.admin);
      TS.web.admin.member_profile_set_username_sig.add(TS.web.admin.memberProfileSetUsername, TS.web.admin);
      TS.web.admin.member_admin_set_sig.add(TS.web.admin.memberAdminSet, TS.web.admin);
      TS.web.admin.member_admin_removed_sig.add(TS.web.admin.memberAdminRemoved, TS.web.admin);
      TS.web.admin.member_owner_set_sig.add(TS.web.admin.memberOwnerSet, TS.web.admin);
      TS.web.admin.member_owner_removed_sig.add(TS.web.admin.memberOwnerRemoved, TS.web.admin);
      TS.web.admin.member_enabled_sig.add(TS.web.admin.memberEnabled, TS.web.admin);
      TS.web.admin.restricted_member_enabled_sig.add(TS.web.admin.restrictedMemberEnabled, TS.web.admin);
      TS.web.admin.ultra_restricted_member_enabled_sig.add(TS.web.admin.ultraRestrictedMemberEnabled, TS.web.admin);
      TS.web.admin.member_disabled_sig.add(TS.web.admin.memberDisabled, TS.web.admin);
      TS.web.admin.member_rebind_sig.add(TS.web.admin.memberRebound, TS.web.admin);
      TS.web.admin.member_restricted_sig.add(TS.web.admin.memberRestricted, TS.web.admin);
      TS.web.admin.member_ultra_restricted_sig.add(TS.web.admin.memberUltraRestricted, TS.web.admin);
      TS.web.admin.member_unrestricted_sig.add(TS.web.admin.memberUnrestricted, TS.web.admin);
      TS.web.admin.member_invited_channel_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin);
      TS.web.admin.member_invited_group_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin);
      TS.web.admin.member_kicked_channel_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin);
      TS.web.admin.member_kicked_group_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin);
      TS.web.admin.member_ura_changed_sig.add(TS.web.admin.rerenderMember, TS.web.admin);
      TS.ui.admin_user_groups.user_groups_fetched.add(TS.web.admin.onUserGroupsFetched);
      if (TS.idp_groups) TS.idp_groups.loaded_sig.add(TS.web.admin.onIdpGroupsLoaded, TS.web.admin);
    },
    onIdpGroupsLoaded: function() {
      _groups_loaded = true;
      if (_logged_in) TS.web.admin.startup();
    },
    onLogin: function() {
      _logged_in = true;
      if (!TS.idp_groups || !TS.idp_groups.shouldLoad() || _groups_loaded) TS.web.admin.startup();
    },
    startup: function() {
      var show_bounce_warning = false;
      if (boot_data.admin_view) TS.web.admin.view = boot_data.admin_view;
      TS.members.startBatchUpsert();
      if (TS.web.admin.view == "list") {
        if (TS.boot_data.feature_name_tagging_client) {
          TS.web.admin.sort_order = $("#admin_sort").val() || "full_name";
        } else {
          TS.web.admin.sort_order = $("#admin_sort").val() || "screen_name";
        }
        TS.web.admin_active_tab = $(".tab_pane.selected").data("tab");
        var member_map = {};
        TS.model.members.forEach(function(member) {
          member_map[member.id] = member;
        });
        var member;
        Object.keys(boot_data.all_members).forEach(function(k) {
          member = boot_data.all_members[k];
          var match = member_map[k];
          if (!match) {
            TS.warn("We have a member that is not in the local model but is in all_members: " + k);
            return;
          }
          match.email_pending = member.email_pending || "";
          match.is_inactive = member.is_inactive || false;
          match.username_is_editable = member.username_is_editable || false;
          match.email_is_editable = member.email_is_editable || false;
          match.omit_caret = member.omit_caret || false;
          match.bot_can_be_enabled = member.bot_can_be_enabled || false;
          match.bot_can_be_configured = member.bot_can_be_configured || false;
          if (match.deleted) {
            match.is_restricted = member.is_restricted || false;
            match.is_ultra_restricted = member.is_ultra_restricted || false;
          }
          if (match.is_restricted || match.is_ultra_restricted) {
            var membership_match = boot_data.channel_membership[match.id];
            if (membership_match) {
              match.channels = membership_match.channels;
              match.groups = membership_match.groups;
              match.more_groups = membership_match.more_groups;
            }
          }
          if (member.two_factor_auth_enabled !== undefined) {
            match.two_factor_auth_enabled = member.two_factor_auth_enabled;
            if (member.two_factor_type !== undefined) {
              match.two_factor_type = member.two_factor_type;
            }
          }
          if (boot_data.auth_mode != "normal" && member.has_sso_token !== undefined) {
            match.has_sso_token = member.has_sso_token;
          }
          match.created = member.created;
          if (TS.boot_data.all_emails && TS.boot_data.all_emails[k]) match.profile.email = TS.boot_data.all_emails[k];
          TS.members.upsertMember(match);
        });
        member_map = undefined;
        _bindLongListFilterUI();
      } else if (TS.web.admin.view == "invites") {
        TS.web.admin.sort_order = "invite_date";
        TS.web.admin.active_tab = "pending";
        $.each(boot_data.pending_invites, function(index, invite) {
          if (invite.invite_prefs) {
            invite.type = invite.invite_prefs.type;
            invite.first_name = invite.invite_prefs.first_name;
            invite.last_name = invite.invite_prefs.last_name;
            invite.is_pending = true;
            if (invite.first_name && invite.last_name) {
              invite._real_name_lc = _.toLower(invite.first_name + " " + invite.last_name);
            }
          }
          if (invite.bouncing && !show_bounce_warning) show_bounce_warning = true;
        });
        if (boot_data.pending_invites.length === 0) {
          TS.web.admin.active_tab = "accepted";
        }
        $.each(boot_data.accepted_invites, function(index, invite) {
          var member = TS.members.getMemberById(invite.user.id);
          if (!member) return;
          member.date_create = parseInt(invite.date_create);
          member.date_resent = parseInt(invite.date_resent);
          member.email = invite.email;
          member.is_pending = false;
          member.inviter = invite.inviter;
          TS.members.upsertMember(member);
          boot_data.accepted_invites[index] = member;
        });
        $('[data-toggle="tooltip"]').tooltip();
        TS.members.view.bindTeamFilter("#team_filter", "#invite_list");
      }
      if (show_bounce_warning) $("#invite_bounce_warning").slideToggle(150);
      $("#admin_sort").bind("change", function() {
        if ($(this).val() != TS.web.admin.sort_order) {
          TS.web.admin.sort_order = $(this).val();
          TS.web.admin.sortList();
          TS.web.admin.rebuildList();
        }
      });
      TS.web.admin.rebuildList();
      if (boot_data.member_list_subset && boot_data.member_list_subset.length) {
        var winloc = window.location.toString();
        var query_offset = winloc.indexOf("?");
        var query = query_offset !== -1 ? winloc.substr(query_offset + 1).split("&")[0] : null;
        _query_range = query ? query.split("=")[1] : null;
        if (_.isString(_query_range)) _query_range = _query_range.toUpperCase();
        var range_nodes = $("#admin_range [data-range]");
        _ranges = [];
        var $node;
        var findRange = function(value) {
          var i, j;
          if (!_.isString(value)) return null;
          value = value.toUpperCase();
          for (i = 0, j = _ranges.length; i < j; i++) {
            if (_ranges[i].range.indexOf(value) !== -1 && _query_range !== value) {
              return _ranges[i];
            }
          }
          return null;
        };
        for (var i = 0, j = range_nodes.length; i < j; i++) {
          $node = $(range_nodes[i]);
          _ranges.push({
            range: $node.data("range").toUpperCase(),
            range_label: $node.find(".range_link").text(),
            link: $node.find(".range_link").prop("href")
          });
        }
        $("#admin_range").on("mousedown", "a.range_link", function(e) {
          var $target = $(e.target);
          var href = $target.prop("href");
          var hash = window.location.hash;
          if (href && href.indexOf("#") === -1 && hash) {
            href += "#" + hash.replace("#", "");
            $target.prop("href", href);
          }
        });
        $("#team_filter input.member_filter").on("keyup", function(e) {
          var $target = $(e.target);
          var search_query = $target.val();
          var range;
          if (search_query.length > 0) {
            search_query = search_query.charAt(0);
            range = findRange(search_query);
          }
          if (!range || !range.link) {
            range = null;
          }
          _last_search_range = range;
        });
      }
      $("#admin_list .tab_panels .loading_hash_animation").remove();
      if (!TS.web.admin.lazyload) {
        TS.web.admin.lazyload = $("#admin_list").find(".lazy").lazyload();
      }
      $("#admin_list").trigger("resize-immediate");
      _maybeReRenderLongList();
      TS.members.finishBatchUpsert();
      if (TS.web.admin.view == "list") {
        TS.metrics.measure("admin_list_load", "start_nav");
      } else if (TS.web.admin.view == "invites") {
        TS.metrics.measure("admin_invites_load", "start_nav");
      }
      if (TS.shouldLog(1e3)) {
        TS.log(1e3, TS.boot_data.accepted_invites.length + " accepted invites:");
        TS.boot_data.accepted_invites.forEach(function(invite) {
          TS.log(1e3, invite.id + "/@" + invite.name + " (invited by " + _.get(invite, "inviter.id") + "/@" + _.get(invite, "inviter.name") + ")");
        });
        TS.log(1e3, TS.boot_data.pending_invites.length + " pending invites:");
        TS.boot_data.pending_invites.forEach(function(invite) {
          TS.log(1e3, invite.id + " (invited by " + _.get(invite, "inviter.id") + "/@" + _.get(invite, "inviter.name") + ")");
        });
      }
    },
    sortList: function() {
      if (!TS.web.admin.sort_order) return;
      var sort_func;
      if (TS.web.admin.sort_order == "screen_name") {
        sort_func = TS.web.admin.sortByScreenName;
      } else if (TS.web.admin.sort_order == "real_name") {
        sort_func = TS.web.admin.sortByRealName;
      } else if (TS.web.admin.sort_order == "invite_date") {
        sort_func = TS.web.admin.sortByInviteDate;
      } else if (TS.web.admin.sort_order == "created_date") {
        sort_func = TS.web.admin.sortByCreatedDate;
      } else if (TS.web.admin.sort_order == "type") {
        sort_func = TS.web.admin.sortByType;
      } else if (TS.web.admin.sort_order == "2fa") {
        sort_func = TS.web.admin.sortBy2FA;
      } else if (TS.web.admin.sort_order == "sso") {
        sort_func = TS.web.admin.sortBySSO;
      } else if (TS.web.admin.sort_order == "inactive") {
        sort_func = TS.web.admin.sortByInactive;
      } else if (TS.web.admin.sort_order == "full_name") {
        sort_func = TS.web.admin.sortByFullName;
      } else if (TS.web.admin.sort_order == "preferred_name") {
        sort_func = TS.web.admin.sortByPreferredName;
      }
      if (TS.web.admin.view == "list") {
        TS.web.admin.active_members.sort(sort_func);
        if (sort_func != TS.web.admin.sortByType) {
          TS.web.admin.restricted_members.sort(sort_func);
          TS.web.admin.ultra_restricted_members.sort(sort_func);
          TS.web.admin.disabled_members.sort(sort_func);
        }
      } else if (TS.web.admin.view == "invites") {
        TS.web.admin.pending_invites.sort(sort_func);
        TS.web.admin.accepted_invites.sort(sort_func);
      }
    },
    sortByScreenName: function(a, b) {
      return a._name_lc > b._name_lc ? 1 : b._name_lc > a._name_lc ? -1 : 0;
    },
    sortByFullName: function(a, b) {
      return a._full_name_normalized_lc > b._full_name_normalized_lc ? 1 : b._full_name_normalized_lc > a._full_name_normalized_lc ? -1 : 0;
    },
    sortByPreferredName: function(a, b) {
      if (a._preferred_name_normalized_lc && b._preferred_name_normalized_lc) {
        return a._preferred_name_normalized_lc > b._preferred_name_normalized_lc ? 1 : b._preferred_name_normalized_lc > a._preferred_name_normalized_lc ? -1 : 0;
      } else if (a._preferred_name_normalized_lc) {
        return -1;
      } else if (b._preferred_name_normalized_lc) {
        return 1;
      } else {
        return 0;
      }
    },
    sortByRealName: function(a, b) {
      if (a._real_name_lc && b._real_name_lc) {
        return a._real_name_lc > b._real_name_lc ? 1 : b._real_name_lc > a._real_name_lc ? -1 : 0;
      } else if (a.real_name) {
        return -1;
      } else if (b.real_name) {
        return 1;
      } else {
        return 0;
      }
    },
    sortByInviteDate: function(a, b) {
      if (a.date_resent != "0" && b.date_resent != "0") {
        return a.date_resent < b.date_resent ? 1 : b.date_resent < a.date_resent ? -1 : 0;
      } else if (a.date_resent != "0") {
        return a.date_resent < b.date_create ? 1 : b.date_create < a.date_resent ? -1 : 0;
      } else if (b.date_resent != "0") {
        return a.date_create < b.date_resent ? 1 : b.date_resent < a.date_create ? -1 : 0;
      } else {
        return a.date_create < b.date_create ? 1 : b.date_create < a.date_create ? -1 : 0;
      }
    },
    sortByCreatedDate: function(a, b) {
      if (a.created && b.created) {
        return a.created < b.created ? 1 : b.created < a.created ? -1 : 0;
      } else if (a.created) {
        return -1;
      } else if (b.created) {
        return 1;
      } else {
        return 0;
      }
    },
    sortBy2FA: function(a, b) {
      return a.two_factor_auth_enabled && !b.two_factor_auth_enabled ? -1 : b.two_factor_auth_enabled && !a.two_factor_auth_enabled ? 1 : 0;
    },
    sortBySSO: function(a, b) {
      return a.has_sso_token && !b.has_sso_token ? -1 : b.has_sso_token && !a.has_sso_token ? 1 : 0;
    },
    sortByInactive: function(a, b) {
      return a.is_inactive && !b.is_inactive ? -1 : b.is_inactive && !a.is_inactive ? 1 : 0;
    },
    sortByType: function(a, b) {
      if (a.is_primary_owner && !b.is_primary_owner || a.is_owner && !b.is_owner || a.is_admin && !b.is_admin || !a.is_restricted && b.is_restricted || !a.is_ultra_restricted && b.is_ultra_restricted || !a.is_deleted && b.is_deleted) {
        return -1;
      } else {
        return 1;
      }
    },
    buildArrays: function() {
      var member;
      var members;
      var is_subset = TS.web.admin.isSubsetCase();
      if (is_subset) {
        members = [];
        for (var i = 0, j = boot_data.member_list_subset.length; i < j; i++) {
          members.push(TS.members.getMemberById(boot_data.member_list_subset[i]));
        }
      } else {
        members = TS.model.members;
      }
      _members = members;
      if (TS.web.admin.view == "list") {
        if (TS.web.admin.active_members.length === 0) {
          for (var i = 0; i < members.length; i++) {
            member = members[i];
            if (member.deleted) {
              TS.web.admin.disabled_members.push(member);
            } else if (member.is_ultra_restricted) {
              TS.web.admin.ultra_restricted_members.push(member);
            } else if (member.is_restricted) {
              TS.web.admin.restricted_members.push(member);
            } else {
              if (!member.is_slackbot) {
                TS.web.admin.active_members.push(member);
              }
            }
          }
          if (is_subset) {
            for (i = 0; i < TS.model.members.length; i++) {
              member = TS.model.members[i];
              if (member.deleted) {
                TS.web.admin.subset_data.disabled_members_count++;
              } else if (member.is_ultra_restricted) {
                TS.web.admin.subset_data.ultra_restricted_members_count++;
              } else if (member.is_restricted) {
                TS.web.admin.subset_data.restricted_members_count++;
              } else {
                if (!member.is_slackbot) {
                  TS.web.admin.subset_data.active_members_count++;
                }
              }
            }
          } else {
            TS.web.admin.subset_data.disabled_members_count = TS.web.admin.disabled_members.length;
            TS.web.admin.subset_data.ultra_restricted_members_count = TS.web.admin.ultra_restricted_members.length;
            TS.web.admin.subset_data.restricted_members_count = TS.web.admin.restricted_members.length;
            TS.web.admin.subset_data.active_members_count = TS.web.admin.active_members.length;
          }
        }
      } else if (TS.web.admin.view == "invites") {
        if (TS.web.admin.pending_invites.length === 0) {
          $.each(boot_data.pending_invites, function(index, invite) {
            TS.web.admin.pending_invites.push(invite);
          });
        }
        if (TS.web.admin.accepted_invites.length === 0) {
          TS.web.admin.accepted_invites = boot_data.accepted_invites;
        }
      }
      TS.web.admin.sortList();
    },
    rebuildList: function() {
      var $active_members = $("#active_members");
      var $restricted_members = $("#restricted_members");
      var $disabled_members = $("#disabled_members");
      if (TS.web.admin.lazyload && TS.web.admin.lazyload.detachEvents) {
        TS.web.admin.lazyload.detachEvents();
        TS.web.admin.lazyload = null;
      }
      TS.web.admin.buildArrays();
      var scroller_id;
      $($active_members).find(".long_list").remove();
      $($disabled_members).find(".long_list").remove();
      $($restricted_members).find(".long_list").remove();
      $($restricted_members).find(".restricted_info").remove();
      $($restricted_members).find(".restricted_info_sso").remove();
      if (TS.web.admin.view == "list") {
        $($restricted_members).find(".ra_invite_prompt").parent().remove();
        var $active_members_content = $("<div>").appendTo($active_members);
        var $restricted_members_content = $("<div>").appendTo($restricted_members);
        var $disabled_members_content = $("<div>").appendTo($disabled_members);
        _buildLongLists($active_members_content, $restricted_members_content, $disabled_members_content);
      } else if (TS.web.admin.view == "invites") {
        scroller_id = "#invite_list";
        var pending_invites_html = "";
        $.each(TS.web.admin.pending_invites, function(index, invite) {
          pending_invites_html += TS.web.admin.buildInviteHTML(invite);
        });
        pending_invites_html += '<div id="pending_no_results" class="no_results hidden"></div>';
        $("#pending_invites").html(pending_invites_html);
        var accepted_invites_html = "";
        $.each(TS.web.admin.accepted_invites, function(index, invite) {
          accepted_invites_html += TS.web.admin.buildInviteHTML(invite);
        });
        accepted_invites_html += '<div id="accepted_no_results" class="no_results hidden"></div>';
        $("#accepted_invites").html(accepted_invites_html);
        $.each(TS.web.admin.pending_invites.concat(TS.web.admin.accepted_invites), function(index, invite) {
          TS.web.admin.bindActions(invite);
        });
      }
      $(".admin_tabs").find("a").bind("click.switch_tabs", function() {
        TS.web.admin.active_tab = $(this).data("tab");
        if (TS.web.admin.tabs_need_rebuild) {
          TS.web.admin.rebuildList();
          TS.web.admin.tabs_need_rebuild = false;
        } else {
          $("#team_filter").find(".member_filter").trigger("keyup");
        }
        if (TS.web.admin.active_tab === "user_groups") {
          $(".tab_actions").addClass("hidden");
        } else {
          $(".tab_actions").removeClass("hidden");
        }
        $(scroller_id).trigger("resize-immediate");
        $(".tab_pane .long_list").each(function(i, list) {
          var $list = $(list);
          var is_in_selected_tab = $list.closest(".tab_pane").hasClass("selected");
          $list.longListView("setHidden", !is_in_selected_tab);
        });
        var force_recalc = true;
        $(".tab_pane.selected .long_list").longListView("resizeImmediately", force_recalc);
      });
      if ($.trim($("#team_filter").find(".member_filter").val()) !== "") $("#team_filter").find(".member_filter").trigger("keyup");
      if (!TS.web.admin.lazyload) {
        TS.web.admin.lazyload = $("#admin_list").find(".lazy").lazyload();
      }
    },
    buildMemberHTML: function(member, exclude_lazy_load, ignore_cache) {
      if (member && !ignore_cache && TS.web.admin.html_cache[member.id]) {
        return TS.web.admin.html_cache[member.id];
      }
      var show_transfer_btn = false;
      if (TS.model.user.is_primary_owner && member.is_primary_owner && TS.web.admin.active_members.length > 1) show_transfer_btn = true;
      var show_rename = 1;
      var show_email_edit = 1;
      var show_username_edit = 1;
      exclude_lazy_load = !exclude_lazy_load || !ignore_cache ? 0 : 1;
      if (!TS.boot_data.pay_prod_cur) {
        show_email_edit = 0;
        show_username_edit = 0;
        show_rename = 0;
      } else {
        if (!TS.model.user.is_owner && member.is_owner) {
          show_rename = 0;
          show_email_edit = 0;
          show_username_edit = 0;
        } else if (!member.deleted) {
          if (TS.model.user.is_owner && !TS.model.user.is_primary_owner && member.is_owner) {
            show_rename = 0;
            show_email_edit = 0;
            show_username_edit = 0;
          } else if (TS.model.user.is_admin && !TS.model.user.is_owner && member.is_admin) {
            show_rename = 0;
            show_email_edit = 0;
            show_username_edit = 0;
          }
          if (TS.model.user.id === member.id) {
            show_email_edit = 0;
          }
        }
      }
      if (member.is_bot) {
        show_email_edit = 0;
      }
      var show_inactive_tip = false;
      if (member.is_inactive && !member.deleted && TS.boot_data.app != "mobile") show_inactive_tip = true;
      if (show_inactive_tip && (member.is_bot || member.is_slackbot)) {
        show_inactive_tip = false;
      }
      var show_add_channel_btn = false;
      if (member.is_restricted && !member.is_ultra_restricted) {
        var channels_for_ra = [],
          groups_for_ra = [];
        $.each(TS.channels.getChannelsForUser(), function(index, channel) {
          if (member.channels) {
            if (!member.channels.hasOwnProperty(channel.id) && !channel.is_archived) {
              channels_for_ra.push(channel);
            }
          }
        });
        $.each(TS.model.groups, function(index, group) {
          if (member.groups) {
            if (!member.groups.hasOwnProperty(group.id) && !group.is_archived) {
              groups_for_ra.push(group);
            }
          }
        });
        if (channels_for_ra.length || groups_for_ra.length) show_add_channel_btn = true;
      }
      var is_enterprise = TS.boot_data.page_needs_enterprise;
      var can_convert_between_member_and_guest = !is_enterprise || is_enterprise && member.enterprise_user && member.enterprise_user.teams && member.enterprise_user.teams.length <= 1;
      var template_args = {
        member: member,
        member_type: TS.web.admin.getType(member),
        member_status: TS.web.admin.getStatus(member),
        actions: TS.web.member_actions.getActionsForMember(member),
        exclude_lazy_load: exclude_lazy_load,
        show_transfer_btn: show_transfer_btn,
        show_rename: show_rename,
        show_email_edit: show_email_edit,
        show_username_edit: show_username_edit,
        show_inactive_tip: show_inactive_tip,
        show_add_channel_btn: show_add_channel_btn,
        paid_team: TS.boot_data.pay_prod_cur,
        is_enterprise: is_enterprise,
        can_convert_between_member_and_guest: can_convert_between_member_and_guest
      };
      if (member.is_restricted) {
        template_args.channels_count = 0;
        if (member.channels) template_args.channels_count = Object.keys(member.channels).length;
        template_args.group_count = 0;
        if (member.groups) template_args.group_count = Object.keys(member.groups).length;
        if (member.more_groups) template_args.group_count += member.more_groups;
        template_args.total_memberships = template_args.channels_count + template_args.group_count;
      }
      var html = TS.templates.admin_list_item(template_args);
      TS.web.admin.html_cache[member.id] = html;
      return TS.web.admin.html_cache[member.id];
    },
    rebuildMember: function(member) {
      var $row = TS.web.admin.selectRow(member);
      $row.tooltip("destroy");
      $row.replaceWith(TS.web.admin.buildMemberHTML(member, true, true));
    },
    buildInviteHTML: function(invite) {
      var display_invite_name = false;
      if (invite.first_name || invite.last_name) {
        display_invite_name = true;
      } else if (TS.boot_data.feature_name_tagging_client && invite.full_name) {
        display_invite_name = true;
      }
      var invite_type_label = "";
      if (invite.type) {
        if (invite.type == "restricted") {
          var restricted_label = TS.i18n.t("Restricted Account", "web_admin")();
          invite_type_label = TS.templates.builders.raLabel(restricted_label);
        } else if (invite.type == "ultra_restricted") {
          invite_type_label = TS.i18n.t("Single-Channel Guest", "web_admin")();
        }
      }
      var inviter_link;
      if (TS.boot_data.feature_name_tagging_client) {
        var inviter_ob = TS.members.getMemberById(invite.inviter.id);
        inviter_link = new Handlebars.SafeString(TS.templates.builders.makeMemberPreviewLink(inviter_ob));
      } else {
        inviter_link = new Handlebars.SafeString(TS.templates.builders.makeMemberPreviewLink(invite.inviter));
      }
      var template_args = {
        invite: invite,
        display_invite_name: display_invite_name,
        invite_type_label: invite_type_label,
        crumb_key: boot_data.crumb_key,
        inviter_link: inviter_link
      };
      if (!invite.is_pending) {
        template_args.member = invite;
      }
      var html = TS.templates.admin_invite_list_item(template_args);
      return html;
    },
    rebuildInvite: function(invite) {
      var $row = TS.web.admin.selectRow(invite);
      $row.replaceWith(TS.web.admin.buildInviteHTML(invite));
    },
    updateRowLocations: function() {
      TS.web.admin.updateTabCounts();
      TS.web.admin.rebuildList();
    },
    updateTabCounts: function() {
      var $active_count = $("#active_members_tab").find(".count");
      var $restricted_tab = $("#restricted_members_tab");
      var $disabled_tab = $("#disabled_members_tab");
      var active_text;
      var restricted_text;
      var disabled_text;
      if (TS.web.admin.isSubsetCase()) {
        active_text = TS.i18n.t("{displayed_members} of {total_members}", "web_admin")({
          displayed_members: TS.web.admin.active_members.length,
          total_members: TS.web.admin.subset_data.active_members_count
        });
        var displayed_restricted_members = TS.web.admin.restricted_members.length + TS.web.admin.ultra_restricted_members.length;
        var total_restricted_members = TS.web.admin.subset_data.restricted_members_count + TS.web.admin.subset_data.ultra_restricted_members_count;
        restricted_text = TS.i18n.t("{displayed_restricted_members} of {total_restricted_members}", "web_admin")({
          displayed_restricted_members: displayed_restricted_members,
          total_restricted_members: total_restricted_members
        });
        disabled_text = TS.i18n.t("{displayed_disabled_members} of {total_disabled_members}", "web_admin")({
          displayed_disabled_members: TS.web.admin.disabled_members.length,
          total_disabled_members: TS.web.admin.subset_data.disabled_members_count
        });
      } else {
        active_text = TS.web.admin.active_members.length;
        restricted_text = TS.web.admin.restricted_members.length + TS.web.admin.ultra_restricted_members.length;
        disabled_text = TS.web.admin.disabled_members.length;
      }
      $active_count.text(active_text);
      $restricted_tab.removeClass("hidden").find(".count").text(restricted_text);
      if (TS.web.admin.disabled_members.length) {
        $disabled_tab.removeClass("hidden");
      }
      $disabled_tab.find(".count").text(disabled_text);
      TS.web.admin.tabs_need_rebuild = true;
    },
    selectRow: function(item) {
      return $("#row_" + item.id);
    },
    rowProcessing: function(member) {
      _setMemberRowState(member, {
        error: false,
        error_detail: undefined,
        processing: true,
        success: false
      });
    },
    rowError: function(member, error_detail) {
      _setMemberRowState(member, {
        error: true,
        error_detail: error_detail,
        processing: false
      });
    },
    rowFadeSuccess: function(member, callback) {
      setTimeout(function() {
        _setMemberRowState(member, {
          success: false
        });
        if (callback) callback();
      }, 3e3);
    },
    startRestrictWorkflow: function(member, type) {
      $("body").scrollTop(0);
      var $restrict_account = $("#restrict_account");
      $("#admin_list").addClass("hidden");
      $restrict_account.html(TS.templates.admin_restrict_account({
        member: member,
        channels: TS.channels.getUnarchivedChannelsForUser(),
        groups: TS.groups.getUnarchivedGroups()
      })).removeClass("hidden");

      function startRAWorkflow() {
        $("#step1").addClass("hidden");
        $("#step2_restricted").removeClass("hidden");
      }

      function startURAWorkflow() {
        $("#step1").addClass("hidden");
        $("#step2_guest").removeClass("hidden");
      }
      $("#restricted_user").bind("click", startRAWorkflow);
      $("#guest_user").bind("click", startURAWorkflow);
      if (type) {
        if (type == "ra") {
          startRAWorkflow();
        } else if (type == "ura") {
          startURAWorkflow();
        }
      }
      $(".cancel_admin_restrict_workflow").bind("click", function() {
        $("#admin_list").removeClass("hidden");
        $restrict_account.addClass("hidden");
        var force_recalc = true;
        $(".tab_pane.selected .long_list").longListView("resizeImmediately", force_recalc);
      });
      $restrict_account.find(".api_set_restricted").bind("click", function() {
        TS.api.call("users.admin.setRestricted", {
          user: member.id
        }, TS.web.admin.onMemberSetRestricted);
        $(this).addClass("disabled").prop("disabled", true);
      });
      $restrict_account.find(".api_set_ultra_restricted").bind("click", function() {
        var channel_or_group = $("#ultra_restricted_channel_picker").val();
        TS.api.call("users.admin.setUltraRestricted", {
          user: member.id,
          channel: channel_or_group
        }, TS.web.admin.onMemberSetUltraRestricted);
        $(this).addClass("disabled").prop("disabled", true);
      });
    },
    startEnableRestrictedWorkflow: function(member) {
      $("body").scrollTop(0);
      var $restrict_account = $("#restrict_account");
      $("#admin_list").addClass("hidden");
      var template_args = {
        member: member,
        channels: TS.channels.getUnarchivedChannelsForUser(),
        groups: TS.groups.getUnarchivedGroups(),
        enabling: true
      };
      if ((!member.channels || member.channels.length === 0) && (!member.groups || member.groups.length === 0)) {
        template_args.show_ra_channel_picker = true;
      }
      $restrict_account.html(TS.templates.admin_restrict_account(template_args)).removeClass("hidden");

      function startRAWorkflow() {
        $("#step1").addClass("hidden");
        $("#step2_restricted").removeClass("hidden");
      }

      function startURAWorkflow() {
        $("#step1").addClass("hidden");
        $("#step2_guest").removeClass("hidden");
      }
      $("#restricted_user").bind("click", startRAWorkflow);
      $("#guest_user").bind("click", startURAWorkflow);
      $(".cancel_admin_restrict_workflow").bind("click", function() {
        $("#admin_list").removeClass("hidden");
        $restrict_account.addClass("hidden");
        var force_recalc = true;
        $(".tab_pane.selected .long_list").longListView("resizeImmediately", force_recalc);
      });
      $restrict_account.find(".api_set_restricted").bind("click", function() {
        var args = {
          user: member.id
        };
        if ((!member.channels || member.channels.length === 0) && (!member.groups || member.groups.length === 0)) {
          args.channel = $("#restricted_channel_picker").val();
        }
        TS.api.call("users.admin.setRestricted", args, TS.web.admin.onEnableRestrictedMember);
        $(this).addClass("disabled").prop("disabled", true);
      });
      $restrict_account.find(".api_set_ultra_restricted").bind("click", function() {
        var channel_or_group = $("#ultra_restricted_channel_picker").val();
        TS.api.call("users.admin.setUltraRestricted", {
          user: member.id,
          channel: channel_or_group
        }, TS.web.admin.onEnableUltraRestrictedMember);
        $(this).addClass("disabled").prop("disabled", true);
      });
    },
    getType: function(member) {
      var member_type;
      if (member.is_primary_owner) {
        member_type = TS.i18n.t("Primary Owner", "web_admin")();
      } else if (member.is_owner) {
        member_type = TS.i18n.t("Owner", "web_admin")();
      } else if (member.is_admin) {
        member_type = TS.i18n.t("Admin", "web_admin")();
      } else if (member.is_ultra_restricted) {
        member_type = TS.i18n.t("Single-Channel Guest", "web_admin")();
      } else if (member.is_restricted) {
        member_type = TS.templates.builders.raLabel("Restricted Account");
      } else {
        if (member.is_bot || member.is_slackbot) {
          member_type = TS.i18n.t("Bot", "web_admin")();
        } else if (TS.boot_data.page_needs_enterprise) {
          member_type = TS.i18n.t("Team Member", "web_admin")();
        } else {
          member_type = TS.i18n.t("Member", "web_admin")();
        }
      }
      if (member.deleted && !TS.boot_data.page_needs_enterprise) {
        if (member_type == "Member") {
          member_type = TS.i18n.t("Deactivated Account", "web_admin")();
        } else {
          member_type = TS.i18n.t("Deactivated {member_type}", "web_admin")({
            member_type: member_type
          });
        }
      }
      return member_type;
    },
    getStatus: function(member) {
      var member_status;
      if (!member.deleted && member.is_inactive) {
        if (!member.is_bot) {
          member_status = TS.i18n.t("(Inactive)", "web_admin")();
        }
      }
      return member_status;
    },
    delegateBindActions: function() {
      if (!_actions_delegated) {
        $("#admin_list").on("mouseover", function(e) {
          var $target = $(e.target);
          var $list_item;
          if ($target) {
            if ($target.hasClass("admin_list_item")) {
              $list_item = $target;
            } else {
              $list_item = $target.parent("div.admin_list_item");
            }
            if ($list_item.length && !$list_item.data("events-assigned")) {
              TS.web.admin.bindActions(TS.members.getMemberById($list_item.attr("id").substr(4)));
              $list_item.data("events-assigned", true);
            }
            $target = null;
          }
        });
        if ("ontouchstart" in document.documentElement) {
          $("#admin_list").on("touchstart", ".admin_list_item", function(e) {
            var $item = $(this);
            if (!$item.data("events-assigned")) {
              TS.web.admin.bindActions(TS.members.getMemberById($item.attr("id").substr(4)));
              $item.data("events-assigned", true);
            }
          });
        }
        _actions_delegated = true;
      }
    },
    bindActions: function(row) {
      var $row = TS.web.admin.selectRow(row);
      $row.unbind("click.toggle").bind("click.toggle", function() {
        var $this = $(this);
        if ($this.hasClass("processing")) return;
        var is_expanded = $(this).hasClass("expanded");
        var using_long_list_view = !$row.closest("#invite_list").length;
        if (using_long_list_view) {
          var toggle_row = this;
          $(".admin_list_item.expanded").each(function(i, elem) {
            if (elem == toggle_row) return;
            var $row = $(elem);
            var member_id = $row.data("member-id");
            var member = TS.members.getMemberById(member_id);
            _setMemberRowState(member, {
              expanded: false
            });
          });
        } else {
          $(".admin_list_item").removeClass("expanded");
        }
        if ($this.hasClass("success")) {
          $this.removeClass("success");
        } else if ($this.hasClass("error")) {
          $this.removeClass("error").addClass("expanded");
        } else if (is_expanded) {
          $this.removeClass("expanded");
        } else {
          $this.addClass("expanded");
        }
        if (using_long_list_view) {
          _setMemberRowState(row, {
            error: $this.hasClass("error"),
            expanded: $this.hasClass("expanded"),
            success: $this.hasClass("success")
          });
        }
      });
      $row.find("a, btn, input, .pill").unbind("click.stopPropagation").bind("click.stopPropagation", function(e) {
        e.stopPropagation();
      });
      $row.find(".notice_dismiss").unbind("click.dismiss").bind("click.dismiss", function() {
        $row.removeClass("success error expanded");
      });
      $row.find(".inline_name").unbind("click.edit").bind("click.edit", function(e) {
        $(this).addClass("hidden");
        $row.find(".inline_name_edit_form").removeClass("hidden");
        setTimeout(function() {
          $row.find('input[name="first_name"]').focus();
        }, 0);
        e.stopPropagation();
      });
      $row.find(".inline_username").unbind("click.edit").bind("click.edit", function(e) {
        var $form = $row.find(".inline_username_edit_form");
        if ($form && $form[0]) {
          $(this).addClass("hidden");
          $form.removeClass("hidden");
          setTimeout(function() {
            $row.find('input[name="username"]').focus();
          }, 0);
          e.stopPropagation();
        }
      });
      $row.find(".inline_email").unbind("click.edit").bind("click.edit", function(e) {
        var $form = $row.find(".inline_email_edit_form");
        if ($form && $form[0]) {
          $(this).addClass("hidden");
          $form.removeClass("hidden");
          setTimeout(function() {
            $row.find('input[name="email"]').focus();
          }, 0);
          e.stopPropagation();
        }
      });
      $row.find("input").bind("focus", function(e) {
        var type = $(e.target).prop("type");
        if (!type || !type.match(/checkbox|button|submit|reset/i)) {
          $(this).select();
        }
      });
      $row.find("input").unbind("keyup").bind("keyup", function(e) {
        var name, is_name, is_username, is_email;
        name = $(this).attr("name");
        if (!name) return;
        is_name = name.match(/first_name|last_name/i);
        is_email = name == "email";
        is_username = name == "username";
        if (e.which == TS.utility.keymap.enter) {
          if (is_name) {
            TS.web.admin.submitNameForm(row.id);
          } else if (is_username) {} else if (is_email) {}
        } else if (e.which == TS.utility.keymap.esc) {
          if (is_name) {
            TS.web.admin.cancelNameForm(row.id);
          } else if (is_email) {
            TS.web.admin.cancelEmailForm(row.id);
          } else if (is_username) {
            TS.web.admin.cancelUsernameForm(row.id);
          }
        }
      });
      $row.find(".inline_name_edit_form").unbind("submit").bind("submit", function(e) {
        e.preventDefault();
      });
      $row.find(".inline_username_edit_form").unbind("submit").bind("submit", function(e) {
        e.preventDefault();
      });
      $row.find(".inline_email_edit_form").unbind("submit").bind("submit", function(e) {
        e.preventDefault();
      });
      $row.find(".api_make_admin").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setAdmin", {
          user: row.id
        }, TS.web.admin.onMemberSetAdmin);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_remove_admin").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setRegular", {
          user: row.id
        }, TS.web.admin.onMemberRemoveAdmin);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_make_owner").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setOwner", {
          user: row.id
        }, TS.web.admin.onMemberSetOwner);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_remove_owner").unbind("click").bind("click", function() {
        TS.api.call("users.admin.removeOwner", {
          user: row.id
        }, TS.web.admin.onMemberRemoveOwner);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_enable_account").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setRegular", {
          user: row.id
        }, TS.web.admin.onMemberEnable);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_enable_bot").unbind("click").bind("click", function() {
        TS.api.call("users.admin.enableBot", {
          user: row.id
        }, TS.web.admin.onBotEnable);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_enable_ra").unbind("click").bind("click", function() {
        var channels_or_groups = [];
        var channels;
        var groups;
        var handler;
        if (row.channels) channels = row.channels instanceof Array ? row.channels : Object.getOwnPropertyNames(row.channels);
        if (row.groups) groups = row.groups instanceof Array ? row.groups : Object.getOwnPropertyNames(row.groups);
        if (row.channels || row.groups) channels_or_groups = channels.concat(groups);
        if (channels_or_groups.length == 1 && row.is_ultra_restricted) {
          handler = row.deleted ? TS.web.admin.onEnableUltraRestrictedMember : TS.web.admin.onMemberSetUltraRestricted;
          TS.api.call("users.admin.setUltraRestricted", {
            user: row.id,
            channel: channels_or_groups[0]
          }, handler);
          TS.web.admin.rowProcessing(row);
        } else if (channels_or_groups.length >= 1 && row.is_restricted) {
          handler = row.deleted ? TS.web.admin.onEnableRestrictedMember : TS.web.admin.onMemberSetRestricted;
          TS.api.call("users.admin.setRestricted", {
            user: row.id
          }, handler);
          TS.web.admin.rowProcessing(row);
        } else {
          TS.web.admin.startEnableRestrictedWorkflow(row);
        }
      });
      $row.find(".api_disable_account").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setInactive", {
          user: row.id
        }, TS.web.admin.onMemberDisable);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_sso_bind").unbind("click").bind("click", function() {
        TS.api.call("users.admin.sendSSOBind", {
          user: row.id
        }, TS.web.admin.onMemberSSOBind);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_unrestrict_account").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setRegular", {
          user: row.id
        }, TS.web.admin.onMemberUnrestricted);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".api_set_restricted").unbind("click").bind("click", function() {
        TS.api.call("users.admin.setRestricted", {
          user: row.id
        }, TS.web.admin.onMemberSetRestricted);
        TS.web.admin.rowProcessing(row);
      });
      $row.find(".admin_member_restrict_link").unbind("click").bind("click", function() {
        TS.web.admin.startRestrictWorkflow(row);
      });
      $row.find(".admin_member_restrict_link_ura").unbind("click").bind("click", function() {
        var channels = row.channels instanceof Array ? row.channels : row.channels ? Object.getOwnPropertyNames(row.channels) : [];
        var groups = row.groups instanceof Array ? row.groups : row.groups ? Object.getOwnPropertyNames(row.groups) : [];
        var channels_or_groups = channels.concat(groups);
        if (channels_or_groups.length == 1) {
          TS.api.call("users.admin.setUltraRestricted", {
            user: row.id,
            channel: channels_or_groups[0]
          }, TS.web.admin.onMemberSetUltraRestricted);
          TS.web.admin.rowProcessing(row);
        } else {
          TS.web.admin.startRestrictWorkflow(row, "ura");
        }
      });
      $row.find(".admin_member_restrict_link_unpaid").unbind("click").bind("click", function() {
        TS.generic_dialog.start({
          title: TS.i18n.t("{restricted_accounts} are available for paid teams", "web_admin")({
            restricted_accounts: TS.templates.builders.raLabel("Restricted accounts")
          }),
          body: TS.i18n.t('<p>Your team is currently on our <strong>Free plan</strong>. Upgrading to our <strong>Standard plan</strong> will give you access to additional user management features:</p>					   <ul><li><strong>{restricted_accounts}</strong> are paid users that can only access channels that they are invited to join.</li>					   <li><strong>Single-Channel Guests</strong> are free accounts that can only participate in a single channel.</li></ul>					   <p><a href="/pricing">Learn more about our pricing</a> or upgrade today.</p>', "web_admin")({
            restricted_accounts: TS.templates.builders.raLabel("Restricted Accounts")
          }),
          go_button_text: TS.i18n.t("Upgrade your team", "web_admin")(),
          go_button_class: "btn_success",
          cancel_button_text: TS.i18n.t("Not now", "web_admin")(),
          onGo: function() {
            window.location = "/admin/billing";
          }
        });
      });
      $row.find(".api_cant_deactivate").unbind("click").bind("click", function() {
        var user_id = $row.data("member-id");
        var member = TS.members.getMemberById(user_id);
        var group_names = _.map(TS.idp_groups.getGroupsForMember(user_id), "name");
        TS.ui.fs_modal.start({
          title: TS.i18n.t("Can’t Remove Member", "web_admin")(),
          body: TS.templates.admin_cant_deactivate_modal({
            team_name: TS.model.team.name,
            idp_label: TS.utility.enterprise.getProviderLabel(_.get(TS.model, "enterprise"), _.get(TS.model, "enterprise.sso_provider.label", "single sign-on")),
            full_member_name: member.profile.real_name,
            member_name: member.profile.first_name,
            groups: group_names
          }),
          show_go_button: false,
          show_cancel_button: true,
          cancel_button_text: TS.i18n.t("Okay", "web_admin")(),
          modal_class: "fs_modal_header align_center"
        });
        return false;
      });
      $row.find(".api_change_ura_channel").unbind("click").bind("click", function(e) {
        var user_id = $row.data("member-id");
        TS.menu.channel.startWithChannelPickerForChange(e, user_id);
        e.stopPropagation();
      });
      $row.find(".api_channel_invite").unbind("click").bind("click", function(e) {
        var user_id = $row.data("member-id");
        TS.menu.channel.startWithChannelPickerForInvite(e, user_id);
        e.stopPropagation();
      });
      $row.find(".api_channel_kick").unbind("click").bind("click", function(e) {
        var channel_id = $(this).data("channel-id");
        TS.api.call("channels.kick", {
          user: row.id,
          channel: channel_id
        }, TS.web.admin.onMemberKickChannel);
        $(this).closest(".pill").remove();
        e.stopPropagation();
      });
      $row.find(".api_group_kick").unbind("click").bind("click", function(e) {
        var group_id = $(this).data("group-id");
        TS.api.call("groups.kick", {
          user: row.id,
          channel: group_id
        }, TS.web.admin.onMemberKickGroup);
        $(this).closest(".pill").remove();
        e.stopPropagation();
      });
      $row.find(".admin_member_disable_2fa_link").unbind("click").bind("click", function(e) {
        var member_id = $row.data("member-id");
        var member = TS.members.getMemberById(member_id);
        TS.generic_dialog.start({
          title: TS.i18n.t("Confirm Disable 2FA", "web_admin")(),
          body: TS.i18n.t("<p>You are about to disable two-factor authentication for <b>{member_name}</b>.</p>", "web_admin")({
            member_name: member.name
          }),
          show_cancel_button: true,
          show_go_button: true,
          go_button_text: TS.i18n.t("Disable 2FA", "web_admin")(),
          onGo: function() {
            TS.web.admin.rowProcessing(row);
            TS.api.call("users.admin.disable2FA", {
              user: member_id
            }, TS.web.admin.onMemberDisable2FA);
          },
          onCancel: function() {}
        });
        e.stopPropagation();
      });
      $row.find(".pill").unbind("mouseenter.suppress_hover").bind("mouseenter.suppress_hover", function(e) {
        $row.tooltip("hide");
      });
      if ($row.hasClass("inactive")) {
        $row.tooltip({
          delay: {
            show: 500,
            hide: 150
          }
        });
      }
    },
    submitNameForm: function(member_id) {
      var member = TS.members.getMemberById(member_id);
      var $row = TS.web.admin.selectRow(member);
      var args;
      if (TS.boot_data.feature_name_tagging_client) {
        var fullname = $.trim($row.find('input[name="full_name"]').val());
        args = {
          user: member.id,
          profile: JSON.stringify({
            full_name: fullname
          })
        };
      } else {
        var fname = $.trim($row.find('input[name="first_name"]').val());
        var lname = $.trim($row.find('input[name="last_name"]').val());
        args = {
          user: member.id,
          profile: JSON.stringify({
            first_name: fname,
            last_name: lname
          })
        };
      }
      TS.api.call("users.profile.set", args, TS.web.admin.onMemberProfileSet);
      TS.web.admin.rowProcessing(member);
    },
    cancelNameForm: function(member_id) {
      var member = TS.members.getMemberById(member_id);
      var $row = TS.web.admin.selectRow(member);
      $row.find(".inline_name").removeClass("hidden").end().find(".inline_name_edit_form").addClass("hidden");
    },
    cancelUsernameForm: function(member_id) {
      var member = TS.members.getMemberById(member_id);
      var $row = TS.web.admin.selectRow(member);
      $row.find(".inline_username").removeClass("hidden").end().find(".inline_username_edit_form").addClass("hidden");
    },
    submitUsernameForm: function(member_id) {
      var member = TS.members.getMemberById(member_id);
      var $row = TS.web.admin.selectRow(member);
      var confirm_body = [];
      var raw_username = $.trim($row.find('input[name="username"]').val());
      var username = Handlebars.Utils.escapeExpression(raw_username);
      var args;

      function doRename() {
        TS.api.call("users.profile.set", args, TS.web.admin.onMemberProfileSetUsername);
        TS.web.admin.rowProcessing(member);
      }
      if (username.charAt(0) == "@") {
        username = username.substr(1);
      }
      args = {
        user: member.id,
        profile: JSON.stringify({
          username: username
        })
      };
      if (username === member.name) {
        TS.web.admin.cancelUsernameForm(member.id);
        return;
      }
      if (TS.model.user.id === member.id) {
        var confirmation_msg = TS.i18n.t("<p>You are about to rename yourself from <b>{member_name}</b> to <b>{new_member_name}</b>.</p>", "web_admin")({
          member_name: member.name,
          new_member_name: username
        });
      } else {
        var confirmation_msg = TS.i18n.t("<p>You are about to rename <b>{member_name}</b> to <b>{new_member_name}</b>.</p>", "web_admin")({
          member_name: member.name,
          new_member_name: username
        });
      }
      confirm_body.push(confirmation_msg);
      var confirmation_messages = {
        self: TS.i18n.t("<p>The change will take effect immediately and you will be notified.</p>", "web_admin")(),
        bot: TS.i18n.t("<p>The change will take effect immediately.</p>", "web_admin")(),
        member: TS.i18n.t("<p>The change will take effect immediately and the user will be notified.</p>", "web_admin")(),
        disabled: TS.i18n.t("<p>Because this account is disabled, the change will take effect immediately.</p>", "web_admin")()
      };
      if (!member.deleted) {
        if (TS.model.user.id === member.id) {
          confirm_body.push(confirmation_messages["self"]);
        } else {
          if (member.is_bot) {
            confirm_body.push(confirmation_messages["bot"]);
          } else {
            confirm_body.push(confirmation_messages["member"]);
          }
        }
      } else {
        confirm_body.push(confirmation_messages["disabled"]);
      }
      TS.generic_dialog.start({
        title: TS.i18n.t("Confirm username change", "web_admin")(),
        body: confirm_body.join("\n"),
        show_cancel_button: true,
        show_go_button: true,
        go_button_text: TS.i18n.t("Rename", "web_admin")(),
        onGo: function() {
          doRename();
        },
        onCancel: function() {
          TS.web.admin.cancelUsernameForm(member.id);
        }
      });
    },
    cancelEmailForm: function(member_id) {
      var member = TS.members.getMemberById(member_id);
      var $row = TS.web.admin.selectRow(member);
      $row.find(".inline_email").removeClass("hidden").end().find(".inline_email_edit_form").addClass("hidden");
    },
    submitEmailForm: function(member_id) {
      var member = TS.members.getMemberById(member_id);
      var $row = TS.web.admin.selectRow(member);
      var email = $.trim($row.find('input[name="email"]').val());
      var confirm_body = [];
      var args = {
        user: member.id,
        profile: JSON.stringify({
          email: email
        })
      };

      function doEmailUpdate() {
        TS.api.call("users.profile.set", args, TS.web.admin.onMemberProfileSetEmail);
        TS.web.admin.rowProcessing(member);
      }
      if (member.profile.email === email) {
        TS.web.admin.cancelEmailForm(member.id);
        return;
      }
      if (TS.model.user.id === member.id) {
        var email_change_confirmation = TS.i18n.t("<p>You are about to change your email address from <b>{member_email}</b> to <b>{new_email}</b>.</p>", "web_admin")({
          member_email: member.profile.email,
          new_email: email
        });
        confirm_body.push(email_change_confirmation);
      } else {
        var email_change_confirmation = TS.i18n.t("<p>You are about to change the email address for <b>{member_name}</b> from <b>{member_email}</b> to <b>{new_email}</b>.</p>", "web_admin")({
          member_name: member.name,
          member_email: member.profile.email,
          new_email: email
        });
        confirm_body.push(email_change_confirmation);
      }
      var confirmation_messages = {
        self: TS.i18n.t("<p>A confirmation email will be sent to your new address. The change will take effect when the new address is confirmed.</p>", "web_admin")(),
        member: TS.i18n.t("<p>A notification email will be sent to the user at both the old and new address. The change will take effect immediately.</p>", "web_admin")(),
        disabled: TS.i18n.t("<p>Because this account is disabled, the change will take effect immediately.</p>", "web_admin")()
      };
      if (!member.deleted) {
        if (TS.model.user.id === member.id) {
          confirm_body.push(confirmation_messages["self"]);
        } else {
          confirm_body.push(confirmation_messages["member"]);
        }
      } else {
        confirm_body.push(confirmation_messages["disabled"]);
      }
      TS.generic_dialog.start({
        title: TS.i18n.t("Confirm email change", "web_admin")(),
        body: confirm_body.join("\n"),
        show_cancel_button: true,
        show_go_button: true,
        go_button_text: TS.i18n.t("Change Email", "web_admin")(),
        onGo: function() {
          doEmailUpdate();
        },
        onCancel: function() {
          TS.web.admin.cancelEmailForm(member.id);
        }
      });
    },
    onMemberProfileSet: function(ok, data, args) {
      var member, error_messages;
      error_messages = {
        reserved_name: TS.i18n.t("Unfortunately, that’s a reserved word. Try something else!", "web_admin")()
      };
      member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberProfileSet");
        if (data.error && error_messages[data.error]) {
          TS.web.admin.rowError(member, error_messages[data.error]);
        } else {
          TS.web.admin.rowError(member);
        }
        return;
      }
      TS.members.upsertMember({
        id: member.id,
        profile: data.profile
      });
      TS.web.admin.member_profile_set_sig.dispatch(member);
      _setMemberRowState(member, {
        processing: false
      });
    },
    onMemberProfileSetEmail: function(ok, data, args) {
      var member, error_messages;
      error_messages = {
        email_bad: TS.i18n.t("Please choose a valid new email address.", "web_admin")(),
        email_taken: TS.i18n.t("That email address is being used by another account.", "web_admin")()
      };
      member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberProfileSetEmail");
        if (data.error && error_messages[data.error]) {
          TS.web.admin.rowError(member, error_messages[data.error]);
        } else {
          TS.web.admin.rowError(member);
        }
      } else {
        TS.members.upsertMember({
          id: member.id,
          profile: data.profile
        });
        if (data.email_pending) {
          member.email_pending = data.email_pending;
        }
        TS.web.admin.member_profile_set_email_sig.dispatch(member);
      }
    },
    onMemberProfileSetUsername: function(ok, data, args) {
      var error_messages, member;
      error_messages = {
        username_empty: TS.i18n.t("A name is required.", "web_admin")(),
        bad_username: TS.i18n.t("Usernames may only contain lowercase letters, numbers, periods, dashes and underscores and must start with a letter or number.", "web_admin")(),
        long_username: TS.i18n.t("Username must be 21 characters or less.", "web_admin")(),
        username_not_allowed: TS.i18n.t("Unfortunately, that’s a reserved word. Try something else!", "web_admin")(),
        username_same: TS.i18n.t("Username is unchanged.", "web_admin")(),
        username_taken: TS.i18n.t("That username is taken.", "web_admin")(),
        ratelimited: TS.i18n.t("Only two renames are permitted per hour.", "web_admin")()
      };
      member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user: " + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberProfileSetUsername");
        if (data.error && error_messages[data.error]) {
          if (data.error === "username_same") {
            TS.web.admin.member_profile_set_username_sig.dispatch(member);
          } else {
            TS.web.admin.rowError(member, error_messages[data.error]);
          }
        } else {
          TS.web.admin.rowError(member);
        }
        return;
      }
      TS.members.upsertMember({
        id: member.id,
        profile: data.profile
      });
      if (data.profile && data.username) {
        TS.members.upsertMember({
          id: member.id,
          name: data.username
        });
      }
      member = TS.members.getMemberById(member.id);
      TS.web.admin.member_profile_set_username_sig.dispatch(member);
    },
    memberProfileSet: function(member) {
      TS.web.admin.rebuildMember(member);
      TS.web.admin.bindActions(member);
      var $row = TS.web.admin.selectRow(member);
      $row.find(".inline_name").highlightText();
    },
    memberProfileSetEmail: function(member) {
      TS.web.admin.rebuildMember(member);
      TS.web.admin.bindActions(member);
      var $row = TS.web.admin.selectRow(member);
      if (member.email_pending) {
        $row.find(".inline_email_pending").show().highlightText();
      } else {
        $row.find(".inline_email_pending").hide();
        $row.find(".inline_email").highlightText();
      }
    },
    memberProfileSetUsername: function(member) {
      TS.web.admin.rebuildMember(member);
      TS.web.admin.bindActions(member);
      var $row = TS.web.admin.selectRow(member);
      $row.find(".inline_username").highlightText();
    },
    onMemberSetAdmin: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberSetAdmin");
        TS.web.admin.rowError(member);
        return;
      }
      member.is_admin = true;
      TS.members.upsertMember(member);
      TS.web.admin.member_admin_set_sig.dispatch(member);
    },
    memberAdminSet: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var html = TS.i18n.t("<strong>{member_name}</strong> is now an Admin.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      var demote_admin = TS.web.member_actions.actions.demote_admin;
      if (TS.web.member_actions.canPerformAction(demote_admin, member)) {
        var undo = TS.i18n.t('<a class="api_remove_admin undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
          member_id: member.id
        });
        html += undo;
      }
      TS.web.admin.showSuccessMessageOnRow($row, html, true);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
    },
    onMemberRemoveAdmin: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberRemoveAdmin");
        TS.web.admin.rowError(member);
        return;
      }
      member.is_admin = false;
      TS.members.upsertMember(member);
      TS.web.admin.member_admin_removed_sig.dispatch(member);
    },
    memberAdminRemoved: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var html = TS.i18n.t("<strong>{member_name}</strong> is no longer an Admin.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      var promote_admin = TS.web.member_actions.actions.promote_to_admin;
      if (TS.web.member_actions.canPerformAction(promote_admin, member)) {
        var undo = TS.i18n.t(' <a class="api_make_admin undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
          member_id: member.id
        });
        html += undo;
      }
      TS.web.admin.showSuccessMessageOnRow($row, html, true);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
    },
    onMemberSetOwner: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberSetOwner");
        TS.web.admin.rowError(member);
        return;
      }
      member.is_owner = true;
      TS.members.upsertMember(member);
      TS.web.admin.member_owner_set_sig.dispatch(member);
    },
    memberOwnerSet: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var html = TS.i18n.t("<strong>{member_name}</strong> is now an Owner of this team.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      var demote_owner = TS.web.member_actions.actions.demote_owner;
      if (TS.web.member_actions.canPerformAction(demote_owner, member)) {
        var undo = TS.i18n.t(' <a class="api_remove_owner undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
          member_id: member.id
        });
        html += undo;
      }
      TS.web.admin.showSuccessMessageOnRow($row, html, true);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
    },
    onMemberRemoveOwner: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberRemoveOwner");
        TS.web.admin.rowError(member);
        return;
      }
      member.is_admin = data.is_admin;
      member.is_owner = false;
      TS.members.upsertMember(member);
      TS.web.admin.member_owner_removed_sig.dispatch(member);
    },
    memberOwnerRemoved: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var html = TS.i18n.t("<strong>{member_name}</strong> is no longer an Owner of this team.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      var promote_to_owner = TS.web.member_actions.actions.promote_to_owner;
      if (TS.web.member_actions.canPerformAction(promote_to_owner, member)) {
        var undo = TS.i18n.t(' <a class="api_make_owner undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
          member_id: TS.utility.htmlEntities(member.name)
        });
        html += undo;
      }
      TS.web.admin.showSuccessMessageOnRow($row, html, true);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
    },
    onMemberEnable: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberEnable");
        TS.web.admin.rowError(member);
        return;
      }
      member.deleted = false;
      member.is_restricted = false;
      member.is_ultra_restricted = false;
      member.channels = {};
      member.groups = {};
      TS.members.upsertMember(member);
      TS.web.admin.member_enabled_sig.dispatch(member);
    },
    memberEnabled: function(member) {
      TS.web.admin.rebuildMember(member);
      var is_enterprise = TS.boot_data.page_needs_enterprise;
      var $row = TS.web.admin.selectRow(member);
      var html;
      if (is_enterprise) {
        html = TS.i18n.t("This user has been added to the team.", "web_admin")();
      } else {
        html = TS.i18n.t("<strong>{member_name}</strong> is now enabled.", "web_admin")({
          member_name: TS.utility.htmlEntities(member.name)
        });
      }
      var deactivate = TS.web.member_actions.actions.deactivate;
      if (TS.web.member_actions.canPerformAction(deactivate, member)) {
        var undo = TS.i18n.t(' <a class="api_disable_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
          member_id: member.id
        });
        html += undo;
      }
      TS.web.admin.showSuccessMessageOnRow($row, html, true);
      TS.web.admin.bindActions(member);
      _moveMemberTo(member, TS.web.admin.active_members);
      TS.web.admin.rowFadeSuccess(member, TS.web.admin.updateRowLocations);
    },
    onMemberDisable: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberDisable");
        TS.web.admin.rowError(member);
        return;
      }
      member.deleted = true;
      member.is_admin = false;
      member.is_owner = false;
      member.is_primary_owner = false;
      if (TS.boot_data.page_needs_enterprise && member.enterprise_user && member.enterprise_user.teams && member.enterprise_user.teams.indexOf(TS.model.team.id) > -1) {
        member.enterprise_user.teams.splice(member.enterprise_user.teams.indexOf(TS.model.team.id), 1);
      }
      TS.members.upsertMember(member);
      TS.web.admin.member_disabled_sig.dispatch(member);
    },
    memberDisabled: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var is_enterprise = TS.boot_data.page_needs_enterprise;
      var message;
      if (is_enterprise) {
        message = TS.i18n.t("This user has been removed from the team.", "web_admin")();
      } else {
        message = TS.i18n.t("This account is now deactivated.", "web_admin")();
      }
      var undo_action = "api_enable_account";
      if (member.is_restricted) undo_action = "api_enable_ra";
      var success_message = message + TS.i18n.t(' <a class="{undo_action} undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
        undo_action: undo_action,
        member_id: member.id
      });
      TS.web.admin.showSuccessMessageOnRow($row, success_message, true);
      if (is_enterprise) {
        $row.find(".admin_member_type").text(TS.i18n.t("Removed", "web_admin")());
      }
      TS.web.admin.bindActions(member);
      _moveMemberTo(member, TS.web.admin.disabled_members);
      TS.web.admin.rowFadeSuccess(member, TS.web.admin.updateRowLocations);
    },
    onBotEnable: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberEnable");
        TS.web.admin.rowError(member);
        return;
      }
      member.deleted = false;
      TS.members.upsertMember(member);
      TS.web.admin.member_enabled_sig.dispatch(member);
    },
    onMemberSSOBind: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberSSOBind");
        TS.web.admin.rowError(member);
        return;
      }
      TS.web.admin.member_rebind_sig.dispatch(member);
    },
    memberRebound: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var success_message = TS.i18n.t("<strong>{member_name}</strong> has been sent a re-binding email.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      TS.web.admin.showSuccessMessageOnRow($row, success_message);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
    },
    onMemberSetRestricted: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberSetRestricted");
        $("#step2_restricted").find(".error_message").removeClass("hidden").end().find(".api_set_restricted").removeClass("disabled").prop("disabled", false).text(TS.i18n.t("Try Again", "web_admin")());
        return;
      }
      if (_.isArray(data.memberships.channels)) {
        member.channels = {};
      } else {
        member.channels = data.memberships.channels;
      }
      if (_.isArray(data.memberships.groups)) {
        member.groups = {};
      } else {
        member.groups = data.memberships.groups;
      }
      member.is_restricted = true;
      member.is_ultra_restricted = false;
      member.deleted = false;
      TS.members.upsertMember(member);
      TS.web.admin.member_restricted_sig.dispatch(member);
    },
    memberRestricted: function(member) {
      var previous_collection = _moveMemberTo(member, TS.web.admin.restricted_members);
      TS.web.admin.rebuildMember(member);
      TS.web.admin.updateRowLocations();
      var success_msg_html = TS.i18n.t("<strong>{member_name}</strong> is now a Multi-Channel Guest.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      if (previous_collection === TS.web.admin.active_members) {
        var undo = TS.i18n.t('<a class="api_unrestrict_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
          member_id: member.id
        });
        success_msg_html += undo;
      }
      TS.web.admin.showSuccessMessageForMember(member, success_msg_html, true);
      TS.web.admin.rowFadeSuccess(member);
      $("#restrict_account").addClass("hidden");
      $("#admin_list").removeClass("hidden");
      TS.web.admin.showRestrictedMembersTab();
    },
    onMemberSetUltraRestricted: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberSetRestricted");
        if (data.error == "ura_limit_reached") {
          var error = TS.i18n.t('<p class="alert alert_info align_left"><i class="ts_icon ts_icon_warning small_right_margin"></i>You’ve reached your limit for the number of Single-Channel Guests you can invite. You must invite more paid team members before you can add more Single-Channel Guests.</p>', "web_admin")();
          $("#step2_guest").find("#convert_to_ura_confirmation").after(error);
        } else {
          $("#step2_guest").find(".error_message").removeClass("hidden").end().find(".api_set_ultra_restricted").removeClass("disabled").prop("disabled", false).text(TS.i18n.t("Try Again", "web_admin")());
        }
        return;
      }
      if (_.isArray(data.memberships.channels)) {
        member.channels = {};
      } else {
        member.channels = data.memberships.channels;
      }
      if (_.isArray(data.memberships.groups)) {
        member.groups = {};
      } else {
        member.groups = data.memberships.groups;
      }
      member.is_restricted = true;
      member.is_ultra_restricted = true;
      member.deleted = false;
      TS.members.upsertMember(member);
      TS.web.admin.member_ultra_restricted_sig.dispatch(member);
    },
    memberUltraRestricted: function(member) {
      _moveMemberTo(member, TS.web.admin.ultra_restricted_members);
      TS.web.admin.rebuildMember(member);
      TS.web.admin.updateRowLocations();
      var $row = TS.web.admin.selectRow(member);
      var success_message = TS.i18n.t('<strong>{member_name}</strong> is now a Single-Channel Guest. <a class="api_unrestrict_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
        member_name: TS.utility.htmlEntities(member.name),
        member_id: member.id
      });
      TS.web.admin.showSuccessMessageOnRow($row, success_message, true);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
      $("#restrict_account").addClass("hidden");
      $("#admin_list").removeClass("hidden");
      TS.web.admin.showRestrictedMembersTab();
    },
    onMemberUnrestricted: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberUnrestricted");
        TS.web.admin.rowError(member);
        return;
      }
      member.is_restricted = false;
      member.is_ultra_restricted = false;
      TS.members.upsertMember(member);
      TS.web.admin.member_unrestricted_sig.dispatch(member);
    },
    memberUnrestricted: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var success_message = TS.i18n.t("<strong>{member_name}</strong> is now a full team member.", "web_admin")({
        member_name: TS.utility.htmlEntities(member.name)
      });
      TS.web.admin.showSuccessMessageOnRow($row, success_message, true);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
      _moveMemberTo(member, TS.web.admin.active_members);
      TS.web.admin.updateTabCounts();
    },
    onMemberInviteChannel: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberInviteChannel");
        TS.web.admin.rowError(member);
        return;
      }
      if (_.isArray(member.channels) && member.channels.length === 0) {
        member.channels = {};
      }
      member.channels[data.channel.id] = data.channel.name;
      TS.members.upsertMember(member);
      TS.web.admin.member_invited_channel_sig.dispatch(member);
    },
    onMemberInviteGroup: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberInviteGroup");
        TS.web.admin.rowError(member);
        return;
      }
      if (_.isArray(member.groups) && member.groups.length === 0) {
        member.groups = {};
      }
      member.groups[data.group.id] = data.group.name;
      TS.members.upsertMember(member);
      TS.web.admin.member_invited_group_sig.dispatch(member);
    },
    rerenderMember: function(member) {
      TS.web.admin.rebuildMember(member);
      TS.web.admin.bindActions(member);
    },
    rerenderMemberAndHighlight: function(member) {
      TS.web.admin.rerenderMember(member);
      var $row = TS.web.admin.selectRow(member);
      $row.addClass("expanded").find(".admin_member_type").highlightText();
    },
    onMemberKickChannel: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberKickChannel");
        TS.web.admin.member_kicked_channel_sig.dispatch(member);
        TS.web.admin.rowError(member);
        return;
      }
      delete member.channels[args.channel];
      TS.members.upsertMember(member);
      TS.web.admin.member_kicked_channel_sig.dispatch(member);
    },
    onMemberKickGroup: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberKickGroup");
        TS.web.admin.member_kicked_group_sig.dispatch(member);
        TS.web.admin.rowError(member);
        return;
      }
      delete member.groups[args.channel];
      TS.members.upsertMember(member);
      TS.web.admin.member_kicked_group_sig.dispatch(member);
    },
    onMemberURAChanged: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onMemberURAChanged");
        TS.web.admin.rowError(member);
        return;
      }
      if (_.isArray(data.memberships.channels)) {
        member.channels = {};
      } else {
        member.channels = data.memberships.channels;
      }
      if (_.isArray(data.memberships.groups)) {
        member.groups = {};
        member.more_groups = 0;
      } else {
        member.groups = data.memberships.groups;
        member.more_groups = data.memberships.more_groups;
      }
      TS.members.upsertMember(member);
      TS.web.admin.member_ura_changed_sig.dispatch(member);
    },
    onEnableRestrictedMember: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onRestrictedMemberEnable");
        TS.web.admin.rowError(member);
        $("#step2_restricted").find(".error_message").removeClass("hidden").end().find(".api_set_restricted").removeClass("disabled").prop("disabled", false).text("Try Again");
        return;
      }
      if (_.isArray(data.memberships.channels)) {
        member.channels = {};
      } else {
        member.channels = data.memberships.channels;
      }
      if (_.isArray(data.memberships.groups)) {
        member.groups = {};
      } else {
        member.groups = data.memberships.groups;
      }
      member.deleted = false;
      member.is_restricted = true;
      member.is_ultra_restricted = false;
      TS.members.upsertMember(member);
      TS.web.admin.restricted_member_enabled_sig.dispatch(member);
    },
    restrictedMemberEnabled: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row;
      var is_enterprise = TS.boot_data.page_needs_enterprise;
      var message;
      if (is_enterprise) {
        message = TS.i18n.t("This user has been added to the team", "web_admin")();
      } else {
        message = TS.i18n.t("<strong>{member_name}</strong> is now enabled", "web_admin")({
          member_name: TS.utility.htmlEntities(member.name)
        });
      }
      $row = TS.web.admin.selectRow(member);
      var success_message = message + TS.i18n.t(' as a {restricted_account}. <a class="api_disable_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
        restricted_account: TS.templates.builders.raLabel("Restricted Account"),
        member_id: TS.templates.builders.raLabel("Restricted Account")
      });
      TS.web.admin.showSuccessMessageOnRow($row, success_message);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
      _moveMemberTo(member, TS.web.admin.restricted_members);
      TS.web.admin.updateTabCounts();
      if (TS.web.admin.isAdminListHidden()) {
        $("#restrict_account").addClass("hidden");
        $("#admin_list").removeClass("hidden");
        TS.web.admin.showRestrictedMembersTab();
      }
    },
    onEnableUltraRestrictedMember: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (!ok) {
        TS.error("failed onEnableUltraRestrictedMember");
        if (data.error == "ura_limit_reached") {
          var error = TS.i18n.t('<p class="alert alert_info align_left"><i class="ts_icon ts_icon_warning small_right_margin"></i>You’ve reached your limit for the number of Single-Channel Guests you can invite. You must invite more paid team members before you can add more Single-Channel Guests.</p>', "web_admin")();
          $("#step2_guest").find("#convert_to_ura_confirmation").after(error);
        } else {
          $("#step2_guest").find(".error_message").removeClass("hidden").end().find(".api_set_ultra_restricted").removeClass("disabled").prop("disabled", false).text(TS.i18n.t("Try Again", "web_admin")());
        }
        return;
      }
      if (_.isArray(data.memberships.channels)) {
        member.channels = {};
      } else {
        member.channels = data.memberships.channels;
      }
      if (_.isArray(data.memberships.groups)) {
        member.groups = {};
      } else {
        member.groups = data.memberships.groups;
      }
      member.deleted = false;
      member.is_restricted = true;
      member.is_ultra_restricted = true;
      TS.members.upsertMember(member);
      TS.web.admin.ultra_restricted_member_enabled_sig.dispatch(member);
      if (TS.web.admin.isAdminListHidden()) {
        $("#restrict_account").addClass("hidden");
        $("#admin_list").removeClass("hidden");
        TS.web.admin.showRestrictedMembersTab();
      }
    },
    onMemberDisable2FA: function(ok, data, args) {
      var member = TS.members.getMemberById(args.user);
      if (!member) {
        TS.error("no member? user:" + args.user);
        return;
      }
      if (ok) {
        member.two_factor_auth_enabled = false;
        TS.web.admin.rerenderMember(member);
      } else {
        TS.web.admin.rowError(member);
      }
    },
    ultraRestrictedMemberEnabled: function(member) {
      TS.web.admin.rebuildMember(member);
      var $row = TS.web.admin.selectRow(member);
      var success_message = TS.i18n.t('<strong>{member_name}</strong> is now a Single-Channel Guest. <a class="api_disable_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
        member_name: TS.utility.htmlEntities(member.name),
        member_id: member.id
      });
      TS.web.admin.showSuccessMessageOnRow($row, success_message);
      TS.web.admin.bindActions(member);
      TS.web.admin.rowFadeSuccess(member);
      _moveMemberTo(member, TS.web.admin.ultra_restricted_members);
      TS.web.admin.updateTabCounts();
    },
    showRestrictedMembersTab: function() {
      $("#restricted_members_tab").click();
    },
    onUserGroupsFetched: function(user_groups) {
      if (!user_groups) return;
      $("#user_groups_tab .count").text(user_groups.length);
    },
    getLastSearchRange: function() {
      return _last_search_range;
    },
    buildRangeURL: function(range_label) {
      var i, j, url, hash;
      hash = window.location.hash;
      if (range_label === undefined || !range_label.toUpperCase) return null;
      var search_query = $("#team_filter input").val();
      range_label = range_label.toUpperCase();
      for (i = 0, j = _ranges.length; i < j; i++) {
        if (_ranges[i].range.indexOf(range_label) !== -1 && _query_range !== range_label) {
          url = _ranges[i].link + "";
          if (search_query.length) {
            url += "&q=" + encodeURI(search_query);
          }
          if (url && url.indexOf("#") === -1 && hash) {
            url += "#" + hash.replace("#", "");
          }
          return url;
        }
      }
      return null;
    },
    isSubsetCase: function() {
      return boot_data.member_list_subset;
    },
    getMembersForUser: function() {
      return _members;
    },
    getRangeFromURL: function() {
      return _query_range;
    },
    showSuccessMessageForMember: function(member, msg, highlightMemberType) {
      _setMemberRowState(member, {
        success: true,
        success_message: msg,
        success_highlight_member_type: highlightMemberType,
        processing: false
      });
    },
    showSuccessMessageOnRow: function($row, msg, highlightMemberType) {
      if (!$row.length) {
        TS.warn("showSuccessMessageOnRow called with an empty jQuery object");
        return;
      }
      var member_id = $row.data("member-id");
      if (!member_id) {
        TS.warn("showSuccessMessageOnRow called with a row that has no data-member-id property");
        return;
      }
      var member = TS.members.getMemberById(member_id);
      if (!member) {
        TS.warn("showSuccessMessageOnRow called with a row with a data-member-id that does not map to any known user");
        return;
      }
      return TS.web.admin.showSuccessMessageForMember(member, msg, highlightMemberType);
    },
    isAdminListHidden: function() {
      return $("#admin_list").hasClass("hidden");
    },
    test: function() {
      var test_ob = {};
      Object.defineProperty(test_ob, "_row_states", {
        get: function() {
          return _row_states;
        },
        set: function(v) {
          _row_states = v;
        }
      });
      Object.defineProperty(test_ob, "_moveMemberTo", {
        get: function() {
          return _moveMemberTo;
        },
        set: function(v) {
          _moveMemberTo = v;
        }
      });
      return test_ob;
    }
  });
  var _logged_in = false;
  var _groups_loaded = false;
  var _actions_delegated = false;
  var _last_search_range = null;
  var _members;
  var _ranges;
  var _query_range;
  var _row_states = {};
  var active_bots_header_html;
  var invite_restricted_html;
  var invite_ultra_restricted_html;
  var restricted_header_html;
  var ultra_restricted_header_html;
  var _active_list_items = [];
  var _disabled_list_items = [];
  var _restricted_list_items = [];
  var _filtered_active_list_items = [];
  var _filtered_disabled_list_items = [];
  var _filtered_restricted_list_items = [];
  var _current_filter = "";
  var _getListItemsForFilter = function(filter) {
    function mergeMemberItemArrays(subset_items, model_items) {
      var subset_member_ids = _.map(subset_items, "id");
      return subset_items.concat(model_items.filter(function(model_item) {
        return model_item.is_divider || !_.includes(subset_member_ids, model_item.id);
      }));
    }
    var subset_results = _getFilteredSubsetResults(filter);
    var model_results = _getFilteredModelResults(filter, subset_results);
    return {
      active: mergeMemberItemArrays(subset_results.active, model_results.active),
      disabled: mergeMemberItemArrays(subset_results.disabled, model_results.disabled),
      restricted: mergeMemberItemArrays(subset_results.restricted, model_results.restricted)
    };
  };
  var _getFilteredSubsetResults = function(filter) {
    var is_subset_of_previous_filter = _current_filter && filter && _.includes(filter, _current_filter);
    _current_filter = filter;
    var searchable_active_list_items = is_subset_of_previous_filter ? _filtered_active_list_items : _active_list_items;
    var searchable_disabled_list_items = is_subset_of_previous_filter ? _filtered_disabled_list_items : _disabled_list_items;
    var searchable_restricted_list_items = is_subset_of_previous_filter ? _filtered_restricted_list_items : _restricted_list_items;
    searchable_active_list_items = _.reject(searchable_active_list_items, {
      is_divider: true
    });
    searchable_disabled_list_items = _.reject(searchable_disabled_list_items, {
      is_divider: true
    });
    searchable_restricted_list_items = _.reject(searchable_restricted_list_items, {
      is_divider: true
    });
    _filtered_active_list_items = TS.utility.members.filterMembersByQuery(searchable_active_list_items, filter);
    _filtered_disabled_list_items = TS.utility.members.filterMembersByQuery(searchable_disabled_list_items, filter);
    _filtered_restricted_list_items = TS.utility.members.filterMembersByQuery(searchable_restricted_list_items, filter);
    return {
      active: _filtered_active_list_items,
      disabled: _filtered_disabled_list_items,
      restricted: _filtered_restricted_list_items
    };
  };
  var _getFilteredModelResults = function(filter, exclude_results) {
    var _getFilteredModelResultsWithMembers = function(filter, members, exclude_members) {
      var exclude_member_ids = _.map(exclude_members, "id");
      members = _.filter(members, function(member) {
        return !_.includes(exclude_member_ids, member.id);
      });
      var include_profile_fields = false;
      var results = TS.members.view.findMatchesInMemberList(members, filter, include_profile_fields);
      if (!Object.keys(results).length) {
        return [];
      }
      return _(results).map(function(matches, key) {
        var label = TS.members.view.getHeaderLabelForMatchKey(key);
        var divider_html = '<div class="filter_header"><strong>' + TS.utility.htmlEntities(label) + "</strong></div>";
        var divider_for_key = {
          is_divider: true,
          html: divider_html
        };
        var matched_members = _.map(matches, "member");
        return [divider_for_key].concat(matched_members);
      }).flatten().value();
    };
    var disabled_members = _.filter(TS.model.members, "deleted");
    var restricted_members = _.filter(TS.model.members, "is_restricted");
    var active_members = _.difference(TS.model.members, disabled_members, restricted_members);
    return {
      active: _getFilteredModelResultsWithMembers(filter, active_members, exclude_results.active),
      disabled: _getFilteredModelResultsWithMembers(filter, disabled_members, exclude_results.disabled),
      restricted: _getFilteredModelResultsWithMembers(filter, restricted_members, exclude_results.restricted)
    };
  };
  var _bindLongListFilterUI = function() {
    var $input = $("input.member_filter");
    $(".tab_panels").on("click", ".clear_members_filter", function(e) {
      $input.val("").focus().trigger("change");
    });
    $input.on("change keyup cut paste", function(e) {
      var filter = _getFilter();
      if (filter == _current_filter) return;
      var results = _getListItemsForFilter(filter);
      var active_results_members = _.reject(results.active, {
        is_divider: true
      });
      var disabled_results_members = _.reject(results.disabled, {
        is_divider: true
      });
      var restricted_results_members = _.reject(results.restricted, {
        is_divider: true
      });
      var has_active_results = active_results_members.length > 0;
      var has_disabled_results = disabled_results_members.length > 0;
      var has_restricted_results = restricted_results_members.length > 0;
      var tabs = [{
        name: "active",
        label: "full team members",
        list_items: results.active
      }, {
        name: "restricted",
        label: TS.templates.builders.raLabel("restricted accounts"),
        list_items: results.restricted
      }, {
        name: "disabled",
        label: "deactivated accounts",
        list_items: results.disabled
      }];
      tabs.forEach(function(tab) {
        if (tab.list_items.length > 0) {
          return;
        }
        var template_args = {
          tab: tab,
          query: filter,
          pending_matches: [],
          show_pending_matches: false,
          accepted_matches: [],
          show_accepted_matches: false,
          active_matches: active_results_members,
          disabled_matches: disabled_results_members,
          restricted_matches: restricted_results_members,
          show_active_matches: tab.name != "active" && has_active_results,
          show_disabled_matches: tab.name != "disabled" && has_disabled_results,
          show_restricted_matches: tab.name != "restricted" && has_restricted_results
        };
        var html = TS.templates.team_list_no_results(template_args);
        tab.list_items.push({
          is_divider: true,
          html: html
        });
      });
      $("#active_members .long_list").longListView("setItems", results.active);
      $("#disabled_members .long_list").longListView("setItems", results.disabled);
      $("#restricted_members .long_list").longListView("setItems", results.restricted);
    });
  };
  var _getFilter = function() {
    return _.toString($("input.member_filter").val()).trim();
  };
  var _buildGuestLongList = function($target) {
    if (!TS.web.admin.restricted_members.length && !TS.web.admin.ultra_restricted_members.length) {
      $target.html(_getRestrictedAccountInviteMessageHtml());
      return [];
    }
    var restricted_list_items = [];
    if (TS.web.admin.restricted_members.length || TS.boot_data.can_invite_ras) {
      restricted_list_items.push({
        is_divider: true,
        html: restricted_header_html
      });
      if (TS.web.admin.restricted_members.length) {
        restricted_list_items = restricted_list_items.concat(TS.web.admin.restricted_members);
      } else if (TS.boot_data.can_invite_ras) {
        restricted_list_items.push({
          is_divider: true,
          html: invite_restricted_html
        });
      }
    }
    if (TS.web.admin.ultra_restricted_members.length || TS.boot_data.can_invite_ras) {
      restricted_list_items.push({
        is_divider: true,
        html: ultra_restricted_header_html
      });
      if (TS.web.admin.ultra_restricted_members.length) {
        restricted_list_items = restricted_list_items.concat(TS.web.admin.ultra_restricted_members);
      } else if (TS.boot_data.can_invite_ras) {
        restricted_list_items.push({
          is_divider: true,
          html: invite_ultra_restricted_html
        });
      }
    }
    _makeMemberLongListView($target, restricted_list_items);
    return restricted_list_items;
  };
  var _buildMemberLongList = function($target, all_bots_and_members) {
    var bots_and_members = _.partition(all_bots_and_members, function(member) {
      return member.is_bot || member.is_slackbot;
    });
    var bots = bots_and_members[0];
    var members = bots_and_members[1];
    var list_items = members;
    if (bots.length) {
      list_items.push({
        is_divider: true,
        html: active_bots_header_html
      });
      list_items = list_items.concat(bots);
    }
    _makeMemberLongListView($target, list_items);
    return list_items;
  };
  var _buildLongLists = function($active_members_content, $restricted_members_content, $disabled_members_content) {
    _active_list_items = _buildMemberLongList($active_members_content, TS.web.admin.active_members);
    _disabled_list_items = _buildMemberLongList($disabled_members_content, TS.web.admin.disabled_members);
    _restricted_list_items = _buildGuestLongList($restricted_members_content);
    TS.web.admin.delegateBindActions();
  };
  var _getRestrictedAccountInviteMessageHtml = function() {
    var paid_team = !!TS.boot_data.pay_prod_cur;
    if (TS.boot_data.can_invite_ras) {
      return TS.templates.admin_restricted_info({
        paid_team: paid_team
      });
    } else {
      if (TS.boot_data.sso_required) {
        return TS.templates.admin_restricted_info_sso(TS.model.team);
      } else {
        if (TS.boot_data.can_invite_ras) {
          return TS.i18n.t("<p class='ra_invite_prompt subtle_silver top_margin align_center'>Your team does not have any {guest_or_restricted_accounts}. <a href='/admin/invites/restricted'>Invite a new {restricted_accounts}</a></p>", "web_admin")({
            guest_or_restricted_accounts: TS.templates.builders.raLabel("Guest or Restricted Accounts"),
            restricted_accounts: TS.templates.builders.raLabel("Restricted Account")
          });
        } else {
          return TS.i18n.t("<p class='ra_invite_prompt subtle_silver top_margin align_center'>Your team does not have any {guest_or_restricted_accounts}.</p>", "web_admin")({
            guest_or_restricted_accounts: TS.templates.builders.raLabel("Guest or Restricted Accounts")
          });
        }
      }
    }
  };
  var _makeMemberLongListView = function($list, list_items) {
    $list.addClass("long_list").longListView({
      items: list_items,
      scrollable: window,
      preserve_dom_order: true,
      approx_item_height: 57,
      calcDividerHeight: function() {
        return this.calcItemHeight.apply(this, arguments);
      },
      calcItemHeight: function($el) {
        return $el.height();
      },
      makeDivider: function() {
        return this.makeElement.apply(this, arguments);
      },
      makeElement: function(data) {
        return $('<div class="list_item_container full_width">');
      },
      renderDivider: function($el, divider, data) {
        $el.html(divider.html);
      },
      renderItem: function($el, member, data) {
        var exclude_lazy_load = true;
        var ignore_cache = true;
        var html = TS.web.admin.buildMemberHTML(member, exclude_lazy_load, ignore_cache);
        $el.html(html);
        if (member == this.items[this.items.length - 1]) {
          $el.addClass("is_last_item");
        }
        var row_state = _row_states[member.id];
        if (row_state) {
          var $row = $el.find(".admin_list_item");
          $row.toggleClass("error", !!row_state.error);
          $row.toggleClass("expanded", !!row_state.expanded);
          $row.toggleClass("processing", !!row_state.processing);
          $row.toggleClass("success", !!row_state.success);
          $row.toggleClass("has_error_detail", !!row_state.error_detail);
          if (row_state.error) {
            $row.find(".error_detail").html(row_state.error_detail);
          }
          if (row_state.success) {
            $row.find(".success_message").html(row_state.success_message || "");
            if (row_state.success_highlight_member_type) {
              $row.find(".admin_member_type").highlightText();
            }
          }
        }
      }
    });
  };
  var _maybeReRenderLongList = function() {
    var $active_tab = $("#admin_list .tab_pane.selected .long_list");
    $active_tab.longListView("recalculateScrollableOffset");
    $active_tab.longListView("scrollToPosition", document.body.scrollTop, true);
  };
  var _setMemberRowState = function(member, state) {
    var $row = TS.web.admin.selectRow(member);
    _row_states[member.id] = _.merge(_row_states[member.id], state);
    var $long_list = $row.closest(".long_list");
    $long_list.longListView("itemUpdated", member);
  };
  var _moveMemberTo = function(member, destination) {
    var collections = [TS.web.admin.active_members, TS.web.admin.restricted_members, TS.web.admin.ultra_restricted_members, TS.web.admin.disabled_members];
    var counts = ["active_members_count", "restricted_members_count", "ultra_restricted_members_count", "disabled_members_count"];
    var found_in;
    var length;
    _.each(collections, function(collection, index) {
      length = collection.length;
      if (destination !== collection) {
        _.remove(collection, {
          id: member.id
        });
        if (collection.length !== length) {
          found_in = index;
          TS.web.admin.subset_data[counts[index]]--;
        }
      } else {
        if (_.findIndex(collection, {
            id: member.id
          }) === -1) {
          collection.push(member);
        }
        TS.web.admin.subset_data[counts[index]]++;
      }
    });
    return collections[found_in];
  };
})();
