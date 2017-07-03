webpackJsonp([225], {
  2769: function(e, i) {
    ! function() {
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
        tabs_need_rebuild: !1,
        lazyload: null,
        onStart: function() {
          TS.team.ensureTeamProfileFields(), t = '<h5 class="bot_header large_top_margin no_bottom_margin subtle_silver"><i class="ts_icon ts_icon_bolt small_right_margin"></i> ' + TS.i18n.t("Bots", "web_admin")() + "</h5>", a = TS.i18n.t('<p class="ra_invite_prompt subtle_silver top_margin align_center">There are no Multi-Channel Guests in this range. <a data-action="admin_invites_modal" data-account-type="restricted">Invite a new Multi-Channel Guest</a></p>', "web_admin")(), r = TS.i18n.t('<p class="ra_invite_prompt subtle_silver top_margin align_center">Your team does not have any Multi-Channel Guests. <a data-action="admin_invites_modal" data-account-type="restricted">Invite a new Multi-Channel Guest</a></p>', "web_admin")(), s = TS.i18n.t('<p class="ra_invite_prompt subtle_silver top_margin align_center">Your team does not have any Single-Channel Guests. <a data-action="admin_invites_modal" data-account-type="ultra_restricted">Invite a new Single-Channel Guest</a></p>', "web_admin")(), d = TS.i18n.t('<p class="ra_invite_prompt subtle_silver top_margin align_center">There are no Single-Channel Guests in this range. <a data-action="admin_invites_modal" data-account-type="ultra_restricted">Invite a new Single-Channel Guest</a></p>', "web_admin")(), m = '<h5 class="restricted_header small_bottom_margin"><i class="ts_icon ts_icon_restricted_user ts_icon_guest_large soft_grey small_right_margin"></i> ' + TS.i18n.t("Multi-Channel Guests", "web_admin")() + "</h5>", o = '<h5 class="restricted_header small_bottom_margin large_top_margin"><i class="ts_icon ts_icon_single_channel_guest ts_icon_guest_large soft_grey small_right_margin"></i> ' + TS.i18n.t("Single-Channel Guests", "web_admin")() + "</h5>", TS.web.login_sig.add(TS.web.admin.onLogin, TS.web.admin), TS.web.admin.member_profile_set_sig.add(TS.web.admin.memberProfileSet, TS.web.admin), TS.web.admin.member_profile_set_email_sig.add(TS.web.admin.memberProfileSetEmail, TS.web.admin), TS.web.admin.member_profile_set_username_sig.add(TS.web.admin.memberProfileSetUsername, TS.web.admin), TS.web.admin.member_admin_set_sig.add(TS.web.admin.memberAdminSet, TS.web.admin), TS.web.admin.member_admin_removed_sig.add(TS.web.admin.memberAdminRemoved, TS.web.admin), TS.web.admin.member_owner_set_sig.add(TS.web.admin.memberOwnerSet, TS.web.admin), TS.web.admin.member_owner_removed_sig.add(TS.web.admin.memberOwnerRemoved, TS.web.admin), TS.web.admin.member_enabled_sig.add(TS.web.admin.memberEnabled, TS.web.admin), TS.web.admin.restricted_member_enabled_sig.add(TS.web.admin.restrictedMemberEnabled, TS.web.admin), TS.web.admin.ultra_restricted_member_enabled_sig.add(TS.web.admin.ultraRestrictedMemberEnabled, TS.web.admin), TS.web.admin.member_disabled_sig.add(TS.web.admin.memberDisabled, TS.web.admin), TS.web.admin.member_rebind_sig.add(TS.web.admin.memberRebound, TS.web.admin), TS.web.admin.member_restricted_sig.add(TS.web.admin.memberRestricted, TS.web.admin), TS.web.admin.member_ultra_restricted_sig.add(TS.web.admin.memberUltraRestricted, TS.web.admin), TS.web.admin.member_unrestricted_sig.add(TS.web.admin.memberUnrestricted, TS.web.admin), TS.web.admin.member_invited_channel_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin), TS.web.admin.member_invited_group_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin), TS.web.admin.member_kicked_channel_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin), TS.web.admin.member_kicked_group_sig.add(TS.web.admin.rerenderMemberAndHighlight, TS.web.admin), TS.web.admin.member_ura_changed_sig.add(TS.web.admin.rerenderMember, TS.web.admin), TS.ui.admin_user_groups.user_groups_fetched.add(TS.web.admin.onUserGroupsFetched), TS.idp_groups && TS.idp_groups.loaded_sig.add(TS.web.admin.onIdpGroupsLoaded, TS.web.admin);
        },
        onIdpGroupsLoaded: function() {
          u = !0, c && TS.web.admin.startup();
        },
        onLogin: function() {
          c = !0, TS.idp_groups && TS.idp_groups.shouldLoad() && !u || TS.web.admin.startup();
        },
        startup: function() {
          var e = !1;
          boot_data.admin_view && (TS.web.admin.view = boot_data.admin_view);
          var t = Promise.resolve();
          if (TS.boot_data.feature_lazy_load_members_and_bots_everywhere) {
            if ("invites" === TS.web.admin.view) {
              var r = _(TS.boot_data.accepted_invites).concat(TS.boot_data.pending_invites).flatMap(function(e) {
                return [_.get(e, "user.id"), _.get(e, "inviter.id")];
              }).compact().uniq().value();
              t = TS.members.ensureMembersArePresent(r);
            }
            "list" === TS.web.admin.view && (TS.web.admin.isSubsetCase() ? t = TS.members.ensureMembersArePresent(TS.boot_data.member_list_subset) : Q() || (TS.info("Fetching all members..."), t = TS.api.call("users.list").then(function(e) {
              TS.info("Upserting all members..."), e.data.members.forEach(function(e) {
                TS.members.upsertMember(e);
              }), TS.info("Fetched and upserted all members.");
            })));
          }
          t.then(function() {
            if (TS.members.startBatchUpsert(), "list" === TS.web.admin.view) {
              if (TS.boot_data.feature_name_tagging_client ? TS.web.admin.sort_order = $("#admin_sort").val() || "real_name" : TS.web.admin.sort_order = $("#admin_sort").val() || "screen_name", TS.web.admin.active_tab = $(".tab_pane.selected").data("tab"), Q() && E(), !Q()) {
                var t = {};
                TS.model.members.forEach(function(e) {
                  t[e.id] = e;
                });
                var r;
                Object.keys(boot_data.all_members).forEach(function(e) {
                  r = boot_data.all_members[e];
                  var i = t[e];
                  if (!i) return void TS.warn("We have a member that is not in the local model but is in all_members: " + e);
                  if (i.email_pending = r.email_pending || "", i.is_inactive = r.is_inactive || !1, i.username_is_editable = r.username_is_editable || !1, i.email_is_editable = r.email_is_editable || !1, i.omit_caret = r.omit_caret || !1, i.bot_can_be_enabled = r.bot_can_be_enabled || !1, i.bot_can_be_configured = r.bot_can_be_configured || !1, i.deleted && (i.is_restricted = r.is_restricted || !1, i.is_ultra_restricted = r.is_ultra_restricted || !1), i.is_restricted || i.is_ultra_restricted) {
                    var n = boot_data.channel_membership[i.id];
                    n && (i.channels = n.channels, i.groups = n.groups, i.more_groups = n.more_groups);
                  }
                  void 0 !== r.two_factor_auth_enabled && (i.two_factor_auth_enabled = r.two_factor_auth_enabled, void 0 !== r.two_factor_type && (i.two_factor_type = r.two_factor_type)), "normal" !== boot_data.auth_mode && void 0 !== r.has_sso_token && (i.has_sso_token = r.has_sso_token), i.created = r.created, TS.boot_data.all_emails && TS.boot_data.all_emails[e] && (i.profile.email = TS.boot_data.all_emails[e]), TS.members.upsertMember(i);
                }), t = void 0;
              }
              Q() ? P() : L();
            } else "invites" === TS.web.admin.view && (TS.web.admin.sort_order = "invite_date", TS.web.admin.active_tab = "pending", $.each(boot_data.pending_invites, function(i, n) {
              n.invite_prefs && (n.type = n.invite_prefs.type, n.first_name = n.invite_prefs.first_name, n.last_name = n.invite_prefs.last_name, n.is_pending = !0, n.first_name && n.last_name && (n._real_name_lc = _.toLower(n.first_name + " " + n.last_name))), n.bouncing && !e && (e = !0);
            }), 0 === boot_data.pending_invites.length && (TS.web.admin.active_tab = "accepted"), $.each(boot_data.accepted_invites, function(e, i) {
              var n = TS.members.getMemberById(i.user.id);
              n && (n.date_create = parseInt(i.date_create, 10), n.date_resent = parseInt(i.date_resent, 10), n.email = i.email, n.is_pending = !1, n.inviter = i.inviter, TS.members.upsertMember(n), boot_data.accepted_invites[e] = n);
            }), TS.members.view.bindTeamFilter("#team_filter", "#invite_list"));
            if (e && $("#invite_bounce_warning").slideToggle(150), $("#admin_sort").bind("change", function() {
                var e = $(this).val();
                e != TS.web.admin.sort_order && (TS.web.admin.sort_order = e, Q() ? D() : (TS.web.admin.sortList(), TS.web.admin.rebuildList())), re("ADMIN_SORT_BY", {
                  sort_by: e
                });
              }), TS.web.admin.rebuildList(), TS.web.admin.isSubsetCase() && boot_data.member_list_subset.length) {
              var a = window.location.toString(),
                s = a.indexOf("?"),
                d = -1 !== s ? a.substr(s + 1).split("&")[0] : null;
              n = d ? d.split("=")[1] : null, _.isString(n) && (n = n.toUpperCase());
              var m = $("#admin_range [data-range]");
              i = [];
              for (var o, l = function(e) {
                  var t, r;
                  if (!_.isString(e)) return null;
                  for (e = e.toUpperCase(), t = 0, r = i.length; t < r; t += 1)
                    if (-1 !== i[t].range.indexOf(e) && n !== e) return i[t];
                  return null;
                }, b = 0, c = m.length; b < c; b += 1) o = $(m[b]), i.push({
                range: o.data("range").toUpperCase(),
                range_label: o.find(".range_link").text(),
                link: o.find(".range_link").prop("href")
              });
              $("#admin_range").on("mousedown", "a.range_link", function(e) {
                var i = $(e.target),
                  n = i.prop("href"),
                  t = window.location.hash,
                  r = i.attr("data-clog-range");
                n && -1 === n.indexOf("#") && t && (n += "#" + t.replace("#", ""), i.prop("href", n)), r && re("ADMIN_SELECT_ALPHABETICAL_RANGE", {
                  range: r
                });
              }), $("#team_filter input.member_filter").on("keyup", function(e) {
                var i, n = $(e.target),
                  t = n.val();
                t.length > 0 && (t = t.charAt(0), i = l(t)), i && i.link || (i = null), T = i;
              });
            }
            Q() ? te() : R(), TS.web.admin.lazyload || (TS.web.admin.lazyload = $("#admin_list").find(".lazy").lazyload()), $("#admin_list").trigger("resize-immediate"), V(), TS.members.finishBatchUpsert(), ae(), TS.shouldLog(1e3) && (TS.log(1e3, TS.boot_data.accepted_invites.length + " accepted invites:"), TS.boot_data.accepted_invites.forEach(function(e) {
              TS.log(1e3, e.id + " (invited by " + _.get(e, "inviter.id") + ")");
            }), TS.log(1e3, TS.boot_data.pending_invites.length + " pending invites:"), TS.boot_data.pending_invites.forEach(function(e) {
              TS.log(1e3, e.id + " (invited by " + _.get(e, "inviter.id") + ")");
            }));
          });
        },
        setLongListAdminListItems: function(e, i) {
          R();
          var n = e.items.members,
            c = e.items.disabled_members,
            u = e.items.deleted_bots,
            S = e.items.bots,
            T = e.items.restricted_members,
            w = e.items.ultra_restricted_members,
            f = n.slice(0);
          S.length && (e.no_dividers || f.push({
            is_divider: !0,
            html: t
          }), f.push.apply(f, S));
          var v = [];
          (T.length || TS.boot_data.can_invite_ras) && (e.no_dividers || v.push({
            is_divider: !0,
            html: m
          })), T.length ? v.push.apply(v, T) : TS.boot_data.can_invite_ras && !TS.web.admin.subset_data.restricted_members_count ? e.no_dividers || v.push({
            is_divider: !0,
            html: r
          }) : TS.boot_data.can_invite_ras && (e.no_dividers || v.push({
            is_divider: !0,
            html: a
          })), (w.length || TS.boot_data.can_invite_ras) && (e.no_dividers || v.push({
            is_divider: !0,
            html: o
          })), w.length ? v.push.apply(v, w) : TS.boot_data.can_invite_ras && !TS.web.admin.subset_data.ultra_restricted_members_count ? e.no_dividers || v.push({
            is_divider: !0,
            html: s
          }) : TS.boot_data.can_invite_ras && (e.no_dividers || v.push({
            is_divider: !0,
            html: d
          })), v.length || e.num_found.restricted || e.query || v.push({
            is_divider: !0,
            html: j()
          });
          var M = c.slice(0);
          u.length && (e.no_dividers || M.push({
            is_divider: !0,
            html: t
          }), M.push.apply(M, u)), p = f, h = v, g = M, _.each([n, c, u, S, T, w], function(e) {
            _.each(e.slice(-b), J);
          }), q(e), U(e.query), $("#admin_list").trigger("resize-immediate"), e.new_query && V(), $(window).off("scroll.filter").on("scroll.filter", _.throttle(function() {
            var n = 0,
              t = 0;
            "active" === TS.web.admin.active_tab && (n = _.reject(p, {
              is_divider: !0
            }).length, t = e.remaining.members || 0), "restricted" === TS.web.admin.active_tab && (n = _.reject(h, {
              is_divider: !0
            }).length, t = e.remaining.restricted || 0), "disabled" === TS.web.admin.active_tab && (n = _.reject(g, {
              is_divider: !0
            }).length, t = e.remaining.disabled || 0);
            var r = .9 * Math.min(n, b),
              a = Math.max(n - r, 0) * l;
            a && t && $(this).scrollTop() > a && _.isFunction(i) && (i(), i = null);
          }, 50, {
            leading: !0
          }));
        },
        sortList: function() {
          if (TS.web.admin.sort_order) {
            var e;
            "screen_name" === TS.web.admin.sort_order ? e = TS.web.admin.sortByScreenName : "real_name" === TS.web.admin.sort_order ? e = TS.web.admin.sortByRealName : "invite_date" === TS.web.admin.sort_order ? e = TS.web.admin.sortByInviteDate : "created_date" === TS.web.admin.sort_order ? e = TS.web.admin.sortByCreatedDate : "type" === TS.web.admin.sort_order ? e = TS.web.admin.sortByType : "2fa" == TS.web.admin.sort_order ? e = TS.web.admin.sortBy2FA : "sso" === TS.web.admin.sort_order ? e = TS.web.admin.sortBySSO : "inactive" === TS.web.admin.sort_order ? e = TS.web.admin.sortByInactive : "display_name" === TS.web.admin.sort_order && (e = TS.web.admin.sortByDisplayName), "list" === TS.web.admin.view ? (TS.web.admin.active_members.sort(e), e != TS.web.admin.sortByType && (TS.web.admin.restricted_members.sort(e), TS.web.admin.ultra_restricted_members.sort(e), TS.web.admin.disabled_members.sort(e))) : "invites" === TS.web.admin.view && (TS.web.admin.pending_invites.sort(e), TS.web.admin.accepted_invites.sort(e));
          }
        },
        sortByScreenName: function(e, i) {
          return e._name_lc > i._name_lc ? 1 : i._name_lc > e._name_lc ? -1 : 0;
        },
        sortByDisplayName: function(e, i) {
          return e._display_name_normalized_lc && i._display_name_normalized_lc ? e._display_name_normalized_lc > i._display_name_normalized_lc ? 1 : i._display_name_normalized_lc > e._display_name_normalized_lc ? -1 : 0 : e._display_name_normalized_lc ? -1 : i._display_name_normalized_lc ? 1 : 0;
        },
        sortByRealName: function(e, i) {
          return e._real_name_lc && i._real_name_lc ? e._real_name_lc > i._real_name_lc ? 1 : i._real_name_lc > e._real_name_lc ? -1 : 0 : e.real_name ? -1 : i.real_name ? 1 : 0;
        },
        sortByInviteDate: function(e, i) {
          return "0" != e.date_resent && "0" != i.date_resent ? e.date_resent < i.date_resent ? 1 : i.date_resent < e.date_resent ? -1 : 0 : "0" != e.date_resent ? e.date_resent < i.date_create ? 1 : i.date_create < e.date_resent ? -1 : 0 : "0" != i.date_resent ? e.date_create < i.date_resent ? 1 : i.date_resent < e.date_create ? -1 : 0 : e.date_create < i.date_create ? 1 : i.date_create < e.date_create ? -1 : 0;
        },
        sortByCreatedDate: function(e, i) {
          return e.created && i.created ? e.created < i.created ? 1 : i.created < e.created ? -1 : 0 : e.created ? -1 : i.created ? 1 : 0;
        },
        sortBy2FA: function(e, i) {
          return e.two_factor_auth_enabled && !i.two_factor_auth_enabled ? -1 : i.two_factor_auth_enabled && !e.two_factor_auth_enabled ? 1 : 0;
        },
        sortBySSO: function(e, i) {
          return e.has_sso_token && !i.has_sso_token ? -1 : i.has_sso_token && !e.has_sso_token ? 1 : 0;
        },
        sortByInactive: function(e, i) {
          return e.is_inactive && !i.is_inactive ? -1 : i.is_inactive && !e.is_inactive ? 1 : 0;
        },
        sortByType: function(e, i) {
          return e.is_primary_owner && !i.is_primary_owner || e.is_owner && !i.is_owner || e.is_admin && !i.is_admin || !e.is_restricted && i.is_restricted || !e.is_ultra_restricted && i.is_ultra_restricted || !e.is_deleted && i.is_deleted ? -1 : 1;
        },
        buildArrays: function() {
          var i, n, t, r = TS.web.admin.isSubsetCase();
          if (r)
            for (n = [], t = 0; t < boot_data.member_list_subset.length; t += 1) n.push(TS.members.getMemberById(boot_data.member_list_subset[t]));
          else n = TS.model.members;
          if (e = n, "list" === TS.web.admin.view) {
            if (0 === TS.web.admin.active_members.length) {
              for (t = 0; t < n.length; t += 1) i = n[t], i.deleted ? TS.web.admin.disabled_members.push(i) : i.is_ultra_restricted ? TS.web.admin.ultra_restricted_members.push(i) : i.is_restricted ? TS.web.admin.restricted_members.push(i) : i.is_slackbot || TS.web.admin.active_members.push(i);
              if (r)
                for (t = 0; t < TS.model.members.length; t += 1) i = TS.model.members[t], i.deleted ? TS.web.admin.subset_data.disabled_members_count += 1 : i.is_ultra_restricted ? TS.web.admin.subset_data.ultra_restricted_members_count += 1 : i.is_restricted ? TS.web.admin.subset_data.restricted_members_count += 1 : i.is_slackbot || (TS.web.admin.subset_data.active_members_count += 1);
              else TS.web.admin.subset_data.disabled_members_count = TS.web.admin.disabled_members.length, TS.web.admin.subset_data.ultra_restricted_members_count = TS.web.admin.ultra_restricted_members.length, TS.web.admin.subset_data.restricted_members_count = TS.web.admin.restricted_members.length, TS.web.admin.subset_data.active_members_count = TS.web.admin.active_members.length;
            }
          } else "invites" === TS.web.admin.view && (0 === TS.web.admin.pending_invites.length && $.each(boot_data.pending_invites, function(e, i) {
            TS.web.admin.pending_invites.push(i);
          }), 0 === TS.web.admin.accepted_invites.length && (TS.web.admin.accepted_invites = boot_data.accepted_invites));
          TS.web.admin.sortList();
        },
        rebuildList: function() {
          var e = $("#active_members"),
            i = $("#restricted_members"),
            n = $("#disabled_members");
          TS.web.admin.lazyload && TS.web.admin.lazyload.detachEvents && (TS.web.admin.lazyload.detachEvents(), TS.web.admin.lazyload = null), Q() ? D(!0) : TS.web.admin.buildArrays();
          var t;
          if (Q() || ($(e).find(".long_list").remove(), $(n).find(".long_list").remove(), $(i).find(".long_list").remove(), $(i).find(".restricted_info").remove(), $(i).find(".restricted_info_sso").remove()), "list" === TS.web.admin.view) {
            if (Q() || $(i).find(".ra_invite_prompt").parent().remove(), !$(e).find(".long_list").length) {
              var r = $("<div>").appendTo(e),
                a = $("<div>").appendTo(i),
                s = $("<div>").appendTo(n);
              z(r, a, s);
            }
          } else if ("invites" === TS.web.admin.view) {
            t = "#invite_list";
            var d = "";
            $.each(TS.web.admin.pending_invites, function(e, i) {
              d += TS.web.admin.buildInviteHTML(i);
            }), d += '<div id="pending_no_results" class="no_results hidden"></div>', $("#pending_invites").html(d);
            var m = "";
            $.each(TS.web.admin.accepted_invites, function(e, i) {
              m += TS.web.admin.buildInviteHTML(i);
            }), m += '<div id="accepted_no_results" class="no_results hidden"></div>', $("#accepted_invites").html(m), $.each(TS.web.admin.pending_invites.concat(TS.web.admin.accepted_invites), function(e, i) {
              TS.web.admin.bindActions(i);
            });
          }
          $(".admin_tabs").find("a").bind("click.switch_tabs", function() {
            TS.web.admin.active_tab = $(this).data("tab"), Q() && E(), TS.web.admin.tabs_need_rebuild ? (TS.web.admin.rebuildList(), TS.web.admin.tabs_need_rebuild = !1) : $("#team_filter").find(".member_filter").trigger("keyup"), "user_groups" === TS.web.admin.active_tab ? $(".tab_actions").addClass("hidden") : $(".tab_actions").removeClass("hidden"), $(t).trigger("resize-immediate"), $(".tab_pane .long_list").each(function(e, i) {
              var n = $(i),
                t = n.closest(".tab_pane").hasClass("selected");
              n.longListView("setHidden", !t);
            });
            $(".tab_pane.selected .long_list").longListView("resizeImmediately", !0), re("ADMIN_MEMBER_TYPE_TAB", {
              tab_type: TS.web.admin.active_tab
            });
          }), "" !== $.trim($("#team_filter").find(".member_filter").val()) && $("#team_filter").find(".member_filter").trigger("keyup"), TS.web.admin.lazyload || (TS.web.admin.lazyload = $("#admin_list").find(".lazy").lazyload());
        },
        buildMemberHTML: function(e, i, n) {
          if (e && !n && TS.web.admin.html_cache[e.id]) return TS.web.admin.html_cache[e.id];
          var t = !1;
          TS.model.user.is_primary_owner && e.is_primary_owner && TS.web.admin.active_members.length > 1 && (t = !0);
          var r = 1,
            a = 1,
            s = 1;
          i = i && n ? 1 : 0, TS.boot_data.pay_prod_cur ? !TS.model.user.is_owner && e.is_owner ? (r = 0, a = 0, s = 0) : e.deleted || (TS.model.user.is_owner && !TS.model.user.is_primary_owner && e.is_owner ? (r = 0, a = 0, s = 0) : TS.model.user.is_admin && !TS.model.user.is_owner && e.is_admin && (r = 0, a = 0, s = 0), TS.model.user.id === e.id && (a = 0)) : (a = 0, s = 0, r = 0), e.is_bot && (a = 0, e.username_is_editable || (r = 0, s = 0));
          var d = !1;
          e.is_inactive && !e.deleted && "mobile" !== TS.boot_data.app && (d = !0), d && (e.is_bot || e.is_slackbot) && (d = !1);
          var m = !1,
            o = e.is_ultra_restricted && !_.keys(e.channels).length && !_.keys(e.groups).length;
          if (e.is_restricted && !e.is_ultra_restricted || o) {
            var l = [],
              b = [];
            $.each(TS.channels.getChannelsForUser(), function(i, n) {
              e.channels && (e.channels.hasOwnProperty(n.id) || n.is_archived || l.push(n));
            }), $.each(TS.model.groups, function(i, n) {
              e.groups && (e.groups.hasOwnProperty(n.id) || n.is_archived || b.push(n));
            }), (l.length || b.length) && (m = !0);
          }
          var c = TS.boot_data.page_needs_enterprise,
            u = !c || c && e.enterprise_user && e.enterprise_user.teams && e.enterprise_user.teams.length <= 1,
            S = null;
          e.profile.guest_expiration_ts && (S = TS.i18n.t("Will be deactivated on {date} at {time}", "web_admin")({
            date: TS.interop.datetime.formatDate(e.profile.guest_expiration_ts, "{date}"),
            time: TS.interop.datetime.formatDate(e.profile.guest_expiration_ts, "{time}")
          }));
          var T = {
            member: e,
            member_type: TS.web.admin.getType(e),
            member_status: TS.web.admin.getStatus(e),
            actions: TS.web.member_actions.getActionsForMember(e),
            exclude_lazy_load: i,
            show_transfer_btn: t,
            show_rename: r,
            show_email_edit: a,
            show_username_edit: s,
            show_inactive_tip: d,
            show_add_channel_btn: m,
            paid_team: TS.boot_data.pay_prod_cur,
            is_enterprise: c,
            can_convert_between_member_and_guest: u,
            guest_expiration_str: S
          };
          e.is_restricted && (T.channels_count = 0, e.channels && (T.channels_count = Object.keys(e.channels).length), T.group_count = 0, e.groups && (T.group_count = Object.keys(e.groups).length), e.more_groups && (T.group_count += e.more_groups), T.total_memberships = T.channels_count + T.group_count);
          var w = TS.templates.admin_list_item(T);
          return TS.web.admin.html_cache[e.id] = w, TS.web.admin.html_cache[e.id];
        },
        rebuildMember: function(e) {
          TS.web.admin.selectRow(e).replaceWith(TS.web.admin.buildMemberHTML(e, !0, !0));
        },
        buildInviteHTML: function(e) {
          var i = "";
          e.type && ("restricted" === e.type ? i = TS.i18n.t("Multi-Channel Guest", "web_admin")() : "ultra_restricted" === e.type && (i = TS.i18n.t("Single-Channel Guest", "web_admin")()));
          var n = TS.members.getMemberById(e.inviter.id),
            t = new Handlebars.SafeString(TS.templates.builders.makeMemberPreviewLink(n)),
            r = {
              invite: e,
              invite_type_label: i,
              crumb_key: boot_data.crumb_key,
              inviter_link: t
            };
          return e.is_pending || (r.member = e), TS.templates.admin_invite_list_item(r);
        },
        updateRowLocations: function() {
          TS.web.admin.updateTabCounts(), TS.web.admin.rebuildList();
        },
        updateTabCounts: function() {
          if (!Q()) {
            var e, i, n, t = $("#active_members_tab").find(".count"),
              r = $("#restricted_members_tab"),
              a = $("#disabled_members_tab");
            if (TS.web.admin.isSubsetCase()) {
              e = TS.i18n.t("{displayed_members} of {total_members}", "web_admin")({
                displayed_members: TS.web.admin.active_members.length,
                total_members: TS.web.admin.subset_data.active_members_count
              });
              var s = TS.web.admin.restricted_members.length + TS.web.admin.ultra_restricted_members.length,
                d = TS.web.admin.subset_data.restricted_members_count + TS.web.admin.subset_data.ultra_restricted_members_count;
              i = TS.i18n.t("{displayed_restricted_members} of {total_restricted_members}", "web_admin")({
                displayed_restricted_members: s,
                total_restricted_members: d
              }), n = TS.i18n.t("{displayed_disabled_members} of {total_disabled_members}", "web_admin")({
                displayed_disabled_members: TS.web.admin.disabled_members.length,
                total_disabled_members: TS.web.admin.subset_data.disabled_members_count
              });
            } else e = TS.web.admin.active_members.length, i = TS.web.admin.restricted_members.length + TS.web.admin.ultra_restricted_members.length, n = TS.web.admin.disabled_members.length;
            t.text(e), r.removeClass("hidden").find(".count").text(i), TS.web.admin.disabled_members.length && a.removeClass("hidden"), a.find(".count").text(n), TS.web.admin.tabs_need_rebuild = !0;
          }
        },
        selectRow: function(e) {
          return "list" == TS.web.admin.view ? $("#admin_list .tab_pane.selected .long_list").find("#row_" + e.id) : $("#row_" + e.id);
        },
        rowProcessing: function(e) {
          Y(e, {
            error: !1,
            error_detail: void 0,
            processing: !0,
            success: !1
          });
        },
        rowError: function(e, i) {
          Y(e, {
            error: !0,
            error_detail: i,
            processing: !1
          });
        },
        rowFadeSuccess: function(e, i) {
          setTimeout(function() {
            Y(e, {
              success: !1
            }), i && i();
          }, 4e3);
        },
        startRestrictWorkflow: function(e, i) {
          function n() {
            $("#step1").addClass("hidden"), $("#step2_restricted").removeClass("hidden");
          }

          function t() {
            $("#step1").addClass("hidden"), $("#step2_guest").removeClass("hidden");
          }
          $("body").scrollTop(0);
          var r = $("#restrict_account");
          $("#admin_list").addClass("hidden"), r.html(TS.templates.admin_restrict_account({
            member: e,
            channels: TS.channels.getUnarchivedChannelsForUser(),
            groups: TS.groups.getUnarchivedGroups()
          })).removeClass("hidden"), $("#restricted_user").bind("click", n), $("#guest_user").bind("click", t), i && ("ra" === i ? n() : "ura" === i && t()), $(".cancel_admin_restrict_workflow").bind("click", TS.web.admin.exitRestrictWorkflow), r.find(".api_set_restricted").bind("click", function() {
            TS.api.call("users.admin.setRestricted", {
              user: e.id
            }, TS.web.admin.onMemberSetRestricted), $(this).addClass("disabled").prop("disabled", !0);
          }), r.find(".api_set_ultra_restricted").bind("click", function() {
            var i = $("#ultra_restricted_channel_picker").val();
            TS.api.call("users.admin.setUltraRestricted", {
              user: e.id,
              channel: i
            }, TS.web.admin.onMemberSetUltraRestricted), $(this).addClass("disabled").prop("disabled", !0);
          });
        },
        exitRestrictWorkflow: function() {
          $("#admin_list").removeClass("hidden"), $("#restrict_account").addClass("hidden"), $(".tab_pane.selected .long_list").longListView("resizeImmediately", !0);
        },
        startEnableRestrictedWorkflow: function(e, i) {
          function n() {
            $("#step1").addClass("hidden"), $("#step2_restricted").removeClass("hidden");
          }

          function t() {
            $("#step1").addClass("hidden"), $("#step2_guest").removeClass("hidden");
          }
          $("body").scrollTop(0);
          var r = $("#restrict_account");
          $("#admin_list").addClass("hidden");
          var a = {
            member: e,
            channels: TS.channels.getUnarchivedChannelsForUser(),
            groups: TS.groups.getUnarchivedGroups(),
            enabling: !0
          };
          e.channels && 0 !== e.channels.length || e.groups && 0 !== e.groups.length || (a.show_ra_channel_picker = !0), r.html(TS.templates.admin_restrict_account(a)).removeClass("hidden"), i && ("ra" === i ? n() : "ura" === i && t()), $("#restricted_user").bind("click", n), $("#guest_user").bind("click", t), $(".cancel_admin_restrict_workflow").bind("click", TS.web.admin.exitRestrictWorkflow), r.find(".api_set_restricted").bind("click", function() {
            var i = {
              user: e.id
            };
            e.channels && 0 !== e.channels.length || e.groups && 0 !== e.groups.length || (i.channel = $("#restricted_channel_picker").val()), TS.api.call("users.admin.setRestricted", i, TS.web.admin.onEnableRestrictedMember), $(this).addClass("disabled").prop("disabled", !0);
          }), r.find(".api_set_ultra_restricted").bind("click", function() {
            var i = $("#ultra_restricted_channel_picker").val();
            TS.api.call("users.admin.setUltraRestricted", {
              user: e.id,
              channel: i
            }, TS.web.admin.onEnableUltraRestrictedMember), $(this).addClass("disabled").prop("disabled", !0);
          });
        },
        getType: function(e) {
          var i;
          return i = e.is_primary_owner ? TS.i18n.t("Primary Owner", "web_admin")() : e.is_owner ? TS.i18n.t("Owner", "web_admin")() : e.is_admin ? TS.i18n.t("Admin", "web_admin")() : e.is_ultra_restricted ? TS.i18n.t("Single-Channel Guest", "web_admin")() : e.is_restricted ? TS.i18n.t("Multi-Channel Guest", "web_admin")() : e.is_bot || e.is_slackbot ? TS.i18n.t("Bot", "web_admin")() : TS.boot_data.page_needs_enterprise ? TS.i18n.t("Team Member", "web_admin")() : TS.i18n.t("Member", "web_admin")(), e.deleted && !TS.boot_data.page_needs_enterprise && (i = "Member" === i ? TS.i18n.t("Deactivated Account", "web_admin")() : TS.i18n.t("Deactivated {member_type}", "web_admin")({
            member_type: i
          })), i;
        },
        getStatus: function(e) {
          var i;
          return !e.deleted && e.is_inactive && (e.is_bot || (i = TS.i18n.t("(Inactive)", "web_admin")())), i;
        },
        delegateBindActions: function() {
          S || ($("#admin_list").on("mouseover", function(e) {
            var i, n = $(e.target);
            n && (i = n.hasClass("admin_list_item") ? n : n.parent("div.admin_list_item"), i.length && !i.data("events-assigned") && (TS.web.admin.bindActions(TS.members.getMemberById(i.attr("id").substr(4))), i.data("events-assigned", !0)), n = null);
          }), "ontouchstart" in document.documentElement && $("#admin_list").on("touchstart", ".admin_list_item", function() {
            var e = $(this);
            e.data("events-assigned") || (TS.web.admin.bindActions(TS.members.getMemberById(e.attr("id").substr(4))), e.data("events-assigned", !0));
          }), S = !0);
        },
        bindActions: function(e) {
          var i = TS.web.admin.selectRow(e);
          i.unbind("click.toggle").bind("click.toggle", function() {
            var n = $(this);
            if (!n.hasClass("processing")) {
              var t = $(this).hasClass("expanded"),
                r = !i.closest("#invite_list").length;
              if (r) {
                var a = this;
                $(".admin_list_item.expanded").each(function(e, i) {
                  if (i != a) {
                    var n = $(i),
                      t = n.data("member-id"),
                      r = TS.members.getMemberById(t);
                    Y(r, {
                      expanded: !1
                    });
                  }
                });
              } else $(".admin_list_item").removeClass("expanded");
              n.hasClass("success") ? n.removeClass("success") : n.hasClass("error") ? n.removeClass("error").addClass("expanded") : t ? n.removeClass("expanded") : n.addClass("expanded"), r && Y(e, {
                error: n.hasClass("error"),
                expanded: n.hasClass("expanded"),
                success: n.hasClass("success")
              }), re("ADMIN_ROW_TOGGLE");
            }
          }), i.find("a, btn, input, .pill").unbind("click.stopPropagation").bind("click.stopPropagation", function(e) {
            e.stopPropagation();
          }), i.find(".notice_dismiss").unbind("click.dismiss").bind("click.dismiss", function() {
            i.removeClass("success error expanded");
            var e = $(this).attr("data-action");
            "success_ok" === e && re("ADMIN_ACTION_SUCCESS_OK"), "error_try_again" === e && re("ADMIN_ACTION_ERROR_TRY_AGAIN");
          }), i.find(".inline_name").unbind("click.edit").bind("click.edit", function(e) {
            $(this).addClass("hidden"), i.find(".inline_name_edit_form").removeClass("hidden"), setTimeout(function() {
              i.find('input[name="first_name"]').focus();
            }, 0), e.stopPropagation(), re("ADMIN_ACTION_EDIT_FULL_NAME");
          }), i.find(".inline_username").unbind("click.edit").bind("click.edit", function(e) {
            var n = i.find(".inline_username_edit_form");
            n && n[0] && ($(this).addClass("hidden"), n.removeClass("hidden"), setTimeout(function() {
              i.find('input[name="username"]').focus();
            }, 0), e.stopPropagation()), re("ADMIN_ACTION_EDIT_USERNAME");
          }), i.find(".inline_email").unbind("click.edit").bind("click.edit", function(e) {
            var n = i.find(".inline_email_edit_form");
            n && n[0] && ($(this).addClass("hidden"), n.removeClass("hidden"), setTimeout(function() {
              i.find('input[name="email"]').focus();
            }, 0), e.stopPropagation()), re("ADMIN_ACTION_EDIT_EMAIL");
          }), i.find("input").bind("focus", function(e) {
            var i = $(e.target).prop("type");
            i && i.match(/checkbox|button|submit|reset/i) || $(this).select();
          }), i.find("input").unbind("keyup").bind("keyup", function(i) {
            var n, t, r, a;
            (n = $(this).attr("name")) && (t = n.match(/first_name|last_name/i), a = "email" === n, r = "username" === n, i.which == TS.utility.keymap.enter ? t && TS.web.admin.submitNameForm(e.id) : i.which == TS.utility.keymap.esc && (t ? TS.web.admin.cancelNameForm(e.id) : a ? TS.web.admin.cancelEmailForm(e.id) : r && TS.web.admin.cancelUsernameForm(e.id)));
          }), i.find(".inline_name_edit_form").unbind("submit").bind("submit", function(e) {
            e.preventDefault();
          }), i.find(".inline_username_edit_form").unbind("submit").bind("submit", function(e) {
            e.preventDefault();
          }), i.find(".inline_email_edit_form").unbind("submit").bind("submit", function(e) {
            e.preventDefault();
          }), i.find(".admin_transfer_ownership_btn").off("click").on("click", function(e) {
            e.stopPropagation(), re("ADMIN_ACTION_TRANSFER_OWNERSHIP");
          }), i.find(".api_make_admin").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setAdmin", {
              user: e.id
            }, TS.web.admin.onMemberSetAdmin), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_PROMOTE_MEMBER_TO_ADMIN");
          }), i.find(".api_remove_admin").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setRegular", {
              user: e.id
            }, TS.web.admin.onMemberRemoveAdmin), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_DEMOTE_ADMIN_TO_MEMBER");
          }), i.find(".api_make_owner").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setOwner", {
              user: e.id
            }, TS.web.admin.onMemberSetOwner), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_PROMOTE_ADMIN_TO_OWNER");
          }), i.find(".api_remove_owner").unbind("click").bind("click", function() {
            TS.api.call("users.admin.removeOwner", {
              user: e.id
            }, TS.web.admin.onMemberRemoveOwner), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_DEMOTE_OWNER_TO_ADMIN");
          }), i.find(".api_enable_account").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setRegular", {
              user: e.id
            }, TS.web.admin.onMemberEnable), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_ACTIVATE_MEMBER");
          }), i.find(".api_enable_bot").unbind("click").bind("click", function() {
            TS.api.call("users.admin.enableBot", {
              user: e.id
            }, TS.web.admin.onBotEnable), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_ACTIVATE_BOT");
          }), i.find(".api_enable_ra").unbind("click").bind("click", function() {
            var i, n, t, r = [],
              a = TS.boot_data.page_needs_enterprise;
            e.channels && (i = e.channels instanceof Array ? e.channels : Object.getOwnPropertyNames(e.channels)), e.groups && (n = e.groups instanceof Array ? e.groups : Object.getOwnPropertyNames(e.groups)), (e.channels || e.groups) && (r = i.concat(n)), a && e.is_ultra_restricted ? TS.web.admin.startEnableRestrictedWorkflow(e, "ura") : 1 == r.length && e.is_ultra_restricted ? (t = e.deleted ? TS.web.admin.onEnableUltraRestrictedMember : TS.web.admin.onMemberSetUltraRestricted, TS.api.call("users.admin.setUltraRestricted", {
              user: e.id,
              channel: r[0]
            }, t), TS.web.admin.rowProcessing(e)) : r.length >= 1 && e.is_restricted ? (t = e.deleted ? TS.web.admin.onEnableRestrictedMember : TS.web.admin.onMemberSetRestricted, TS.api.call("users.admin.setRestricted", {
              user: e.id
            }, t), TS.web.admin.rowProcessing(e)) : TS.web.admin.startEnableRestrictedWorkflow(e), re("ADMIN_ACTION_ACTIVATE_AS_GUEST");
          }), i.find(".api_disable_account").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setInactive", {
              user: e.id
            }, TS.web.admin.onMemberDisable), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_DEACTIVATE");
          }), i.find(".api_sso_bind").unbind("click").bind("click", function() {
            TS.api.call("users.admin.sendSSOBind", {
              user: e.id
            }, TS.web.admin.onMemberSSOBind), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_SEND_SSO_EMAIL");
          }), i.find(".api_unrestrict_account").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setRegular", {
              user: e.id
            }, TS.web.admin.onMemberUnrestricted), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_PROMOTE_GUEST_TO_MEMBER");
          }), i.find(".api_set_restricted").unbind("click").bind("click", function() {
            TS.api.call("users.admin.setRestricted", {
              user: e.id
            }, TS.web.admin.onMemberSetRestricted), TS.web.admin.rowProcessing(e), re("ADMIN_ACTION_PROMOTE_URA_TO_RA");
          }), i.find(".admin_member_restrict_link").unbind("click").bind("click", function() {
            TS.web.admin.startRestrictWorkflow(e), re("ADMIN_ACTION_DEMOTE_MEMBER_TO_GUEST");
          }), i.find(".admin_member_restrict_link_ura").unbind("click").bind("click", function() {
            var i = [];
            e.channels instanceof Array ? i = e.channels : e.channels && (i = Object.getOwnPropertyNames(e.channels));
            var n = [];
            e.groups instanceof Array ? n = e.groups : e.groups && (n = Object.getOwnPropertyNames(e.groups));
            var t = i.concat(n);
            1 == t.length ? (TS.api.call("users.admin.setUltraRestricted", {
              user: e.id,
              channel: t[0]
            }, TS.web.admin.onMemberSetUltraRestricted), TS.web.admin.rowProcessing(e)) : TS.web.admin.startRestrictWorkflow(e, "ura"), re("ADMIN_ACTION_DEMOTE_RA_TO_URA");
          }), i.find(".admin_member_restrict_link_unpaid").unbind("click").bind("click", function() {
            TS.generic_dialog.start({
              title: TS.i18n.t("Guests are available for paid teams", "web_admin")(),
              body: TS.i18n.t('<p>Your team is currently on our <strong>Free plan</strong>. Upgrading to our <strong>Standard plan</strong> will give you access to additional user management features:</p>\t\t\t\t\t<ul><li><strong>Multi-Channel Guests</strong> are paid users that can only access channels that they are invited to join.</li>\t\t\t\t\t<li><strong>Single-Channel Guests</strong> are free accounts that can only participate in a single channel.</li></ul>\t\t\t\t\t<p><a href="/pricing?paid_feature=guest_account&ui_step=33&ui_element=5" data-clog-event="GROWTH_PRICING" data-clog-ui-element="pricing_link" data-clog-ui-action="click" data-clog-ui-step="admin_home">Learn more about our pricing</a> or upgrade today.</p>', "web_admin")(),
              go_button_text: TS.i18n.t("Upgrade your team", "web_admin")(),
              go_button_class: "btn_success",
              cancel_button_text: TS.i18n.t("Not now", "web_admin")(),
              onGo: function() {
                window.location = "/admin/billing";
              }
            }), $('[data-qa="generic_dialog_go"]').click(function() {
              TS.clog.track("GROWTH_PRICING", {
                contexts: {
                  ui_context: {
                    step: "admin_home",
                    action: "click",
                    ui_element: "billing_button"
                  }
                }
              });
            });
          }), i.find(".api_cant_deactivate").unbind("click").bind("click", function() {
            var e = i.data("member-id"),
              n = TS.members.getMemberById(e),
              t = _.map(TS.idp_groups.getGroupsForMember(e), "name");
            return TS.ui.fs_modal.start({
              title: TS.i18n.t("Can’t Remove Member", "web_admin")(),
              body: TS.templates.admin_cant_deactivate_modal({
                team_name: TS.model.team.name,
                idp_label: TS.utility.enterprise.getProviderLabel(_.get(TS.model, "enterprise"), _.get(TS.model, "enterprise.sso_provider.label", "single sign-on")),
                full_member_name: n.profile.real_name || "@" + n.name,
                member_name: n.profile.first_name || "@" + n.name,
                groups: t
              }),
              show_go_button: !1,
              show_cancel_button: !0,
              cancel_button_text: TS.i18n.t("OK", "web_admin")(),
              modal_class: "fs_modal_header align_center"
            }), !1;
          }), i.find(".api_change_ura_channel").unbind("click").bind("click", function(e) {
            var n = i.data("member-id");
            TS.menu.channel.startWithChannelPickerForChange(e, n), e.stopPropagation(), re("ADMIN_ACTION_EDIT_URA_CHANNEL");
          }), i.find(".api_channel_invite").unbind("click").bind("click", function(e) {
            var n = i.data("member-id"),
              t = TS.members.getMemberById(n);
            TS.menu.channel.startWithChannelPickerForInvite(e, n), e.stopPropagation(), t && re(t.is_ultra_restricted ? "ADMIN_ACTION_ADD_URA_TO_CHANNEL" : "ADMIN_ACTION_ADD_RA_TO_CHANNEL");
          }), i.find(".api_channel_kick").unbind("click").bind("click", function(i) {
            var n = $(this).data("channel-id");
            TS.api.call("channels.kick", {
              user: e.id,
              channel: n
            }, TS.web.admin.onMemberKickChannel), $(this).closest(".pill").remove(), i.stopPropagation(), re("ADMIN_ACTION_REMOVE_RA_FROM_CHANNEL", {
              channel_is_private: !1
            });
          }), i.find(".api_group_kick").unbind("click").bind("click", function(i) {
            var n = $(this).data("group-id");
            TS.api.call("groups.kick", {
              user: e.id,
              channel: n
            }, TS.web.admin.onMemberKickGroup), $(this).closest(".pill").remove(), i.stopPropagation(), re("ADMIN_ACTION_REMOVE_RA_FROM_CHANNEL", {
              channel_is_private: !0
            });
          }), i.find(".admin_member_disable_2fa_link").unbind("click").bind("click", function(n) {
            var t = i.data("member-id"),
              r = TS.members.getMemberById(t);
            TS.generic_dialog.start({
              title: TS.i18n.t("Confirm Disable 2FA", "web_admin")(),
              body: "<p>" + TS.i18n.t("You are about to disable two-factor authentication for <strong>{member_name}</strong>.", "web_admin")({
                member_name: r.name
              }) + "</p>",
              show_cancel_button: !0,
              show_go_button: !0,
              go_button_text: TS.i18n.t("Disable 2FA", "web_admin")(),
              onGo: function() {
                TS.web.admin.rowProcessing(e), TS.api.call("users.admin.disable2FA", {
                  user: t
                }, TS.web.admin.onMemberDisable2FA);
              },
              onCancel: function() {}
            }), n.stopPropagation(), re("ADMIN_ACTION_DISABLE_2FA");
          }), i.find(".admin_member_update_expiration_ts").unbind("click").bind("click", function(n) {
            var t = $(n.target),
              r = {
                event: n,
                $target: t,
                attach_to_target: !1,
                date_picker_args: {}
              },
              a = i.data("member-id"),
              s = TS.members.getMemberById(a);
            s.profile.guest_expiration_ts && (r.date_picker_args.selected_expiration_ts = s.profile.guest_expiration_ts), r.onSelect = function(i) {
              if (_.isNumber(i) && i !== s.profile.guest_expiration_ts) {
                var n = {
                  user: a
                };
                0 === i ? (TS.web.admin.rowProcessing(e), TS.api.call("users.admin.removeExpiration", n, TS.web.admin.onExpirationDateChanged)) : (n.expiration_ts = i, TS.web.admin.rowProcessing(e), TS.api.call("users.admin.setExpiration", n, TS.web.admin.onExpirationDateChanged)), re("ADMIN_ACTION_CHOOSE_TIME_LIMIT_OPTION", {
                  selected_expiration_ts: i
                });
              }
            }, TS.menu.date.startWithExpirationPresets(r), n.stopPropagation(), re("ADMIN_ACTION_UPDATE_TIME_LIMIT", {
              previous_expiration_ts: s.profile.guest_expiration_ts
            });
          });
        },
        submitNameForm: function(e) {
          var i, n = TS.members.getMemberById(e),
            t = TS.web.admin.selectRow(n);
          if (TS.boot_data.feature_name_tagging_client) {
            var r = $.trim(t.find('input[name="real_name"]').val());
            i = {
              user: n.id,
              profile: JSON.stringify({
                real_name: r
              })
            };
          } else {
            var a = $.trim(t.find('input[name="first_name"]').val()),
              s = $.trim(t.find('input[name="last_name"]').val());
            i = {
              user: n.id,
              profile: JSON.stringify({
                first_name: a,
                last_name: s
              })
            };
          }
          TS.api.call("users.profile.set", i, TS.web.admin.onMemberProfileSet), TS.web.admin.rowProcessing(n);
        },
        cancelNameForm: function(e) {
          var i = TS.members.getMemberById(e);
          TS.web.admin.selectRow(i).find(".inline_name").removeClass("hidden").end().find(".inline_name_edit_form").addClass("hidden");
        },
        cancelUsernameForm: function(e) {
          var i = TS.members.getMemberById(e);
          TS.web.admin.selectRow(i).find(".inline_username").removeClass("hidden").end().find(".inline_username_edit_form").addClass("hidden");
        },
        submitUsernameForm: function(e) {
          function i() {
            TS.api.call("users.profile.set", t, TS.web.admin.onMemberProfileSetUsername), TS.web.admin.rowProcessing(r);
          }
          var n, t, r = TS.members.getMemberById(e),
            a = TS.web.admin.selectRow(r),
            s = [],
            d = $.trim(a.find('input[name="username"]').val()),
            m = Handlebars.Utils.escapeExpression(d);
          if ("@" === m.charAt(0) && (m = m.substr(1)), t = {
              user: r.id,
              profile: JSON.stringify({
                username: m
              })
            }, m === r.name) return void TS.web.admin.cancelUsernameForm(r.id);
          n = TS.model.user.id === r.id ? "<p>" + TS.i18n.t("You are about to rename yourself from <strong>{member_name}</strong> to <strong>{new_member_name}</strong>.", "web_admin")({
            member_name: r.name,
            new_member_name: m
          }) + "</p>" : "<p>" + TS.i18n.t("You are about to rename <strong>{member_name}</strong> to <strong>{new_member_name}</strong>.", "web_admin")({
            member_name: r.name,
            new_member_name: m
          }) + "</p>", s.push(n);
          var o = {
            self: "<p>" + TS.i18n.t("The change will take effect immediately and you will be notified.", "web_admin")() + "</p>",
            bot: "<p>" + TS.i18n.t("The change will take effect immediately.", "web_admin")() + "</p>",
            member: "<p>" + TS.i18n.t("The change will take effect immediately and the user will be notified.", "web_admin")() + "</p>",
            disabled: "<p>" + TS.i18n.t("Because this account is disabled, the change will take effect immediately.", "web_admin")() + "</p>"
          };
          r.deleted ? s.push(o.disabled) : TS.model.user.id === r.id ? s.push(o.self) : r.is_bot ? s.push(o.bot) : s.push(o.member), TS.generic_dialog.start({
            title: TS.i18n.t("Confirm username change", "web_admin")(),
            body: s.join("\n"),
            show_cancel_button: !0,
            show_go_button: !0,
            go_button_text: TS.i18n.t("Rename", "web_admin")(),
            onGo: function() {
              i();
            },
            onCancel: function() {
              TS.web.admin.cancelUsernameForm(r.id);
            }
          });
        },
        cancelEmailForm: function(e) {
          var i = TS.members.getMemberById(e);
          TS.web.admin.selectRow(i).find(".inline_email").removeClass("hidden").end().find(".inline_email_edit_form").addClass("hidden");
        },
        submitEmailForm: function(e) {
          function i() {
            TS.api.call("users.profile.set", m, TS.web.admin.onMemberProfileSetEmail), TS.web.admin.rowProcessing(t);
          }
          var n, t = TS.members.getMemberById(e),
            r = TS.web.admin.selectRow(t),
            a = $.trim(r.find('input[name="email"]').val()),
            s = Handlebars.Utils.escapeExpression(a),
            d = [],
            m = {
              user: t.id,
              profile: JSON.stringify({
                email: s
              })
            };
          if (t.profile.email === s) return void TS.web.admin.cancelEmailForm(t.id);
          TS.model.user.id === t.id ? (n = "<p>" + TS.i18n.t("You are about to change your email address from <strong>{member_email}</strong> to <strong>{new_email}</strong>.", "web_admin")({
            member_email: t.profile.email,
            new_email: s
          }) + "</p>", d.push(n)) : (n = "<p>" + TS.i18n.t("You are about to change the email address for <strong>{member_name}</strong> from <strong>{member_email}</strong> to <strong>{new_email}</strong>.", "web_admin")({
            member_name: t.name,
            member_email: t.profile.email,
            new_email: s
          }) + "</p>", d.push(n));
          var o = {
            self: "<p>" + TS.i18n.t("A confirmation email will be sent to your new address. The change will take effect when the new address is confirmed.", "web_admin")() + "</p>",
            member: "<p>" + TS.i18n.t("A notification email will be sent to the user at both the old and new address. The change will take effect immediately.", "web_admin")() + "</p>",
            disabled: "<p>" + TS.i18n.t("Because this account is disabled, the change will take effect immediately.", "web_admin")() + "</p>"
          };
          t.deleted ? d.push(o.disabled) : TS.model.user.id === t.id ? d.push(o.self) : d.push(o.member), TS.generic_dialog.start({
            title: TS.i18n.t("Confirm email change", "web_admin")(),
            body: d.join("\n"),
            show_cancel_button: !0,
            show_go_button: !0,
            go_button_text: TS.i18n.t("Change Email", "web_admin")(),
            onGo: function() {
              i();
            },
            onCancel: function() {
              TS.web.admin.cancelEmailForm(t.id);
            }
          });
        },
        onMemberProfileSet: function(e, i, n) {
          var t, r;
          return r = {
            reserved_name: TS.i18n.t("Unfortunately, that’s a reserved word. Try something else!", "web_admin")()
          }, (t = TS.members.getMemberById(n.user)) ? e ? (TS.members.upsertMember({
            id: t.id,
            profile: i.profile
          }), TS.web.admin.member_profile_set_sig.dispatch(t), void Y(t, {
            processing: !1
          })) : (TS.error("failed onMemberProfileSet"), void(i.error && r[i.error] ? TS.web.admin.rowError(t, r[i.error]) : TS.web.admin.rowError(t))) : void TS.error("no member? user:" + n.user);
        },
        onMemberProfileSetEmail: function(e, i, n) {
          var t, r;
          if (r = {
              email_bad: TS.i18n.t("Please choose a valid new email address.", "web_admin")(),
              email_taken: TS.i18n.t("That email address is being used by another account.", "web_admin")()
            }, !(t = TS.members.getMemberById(n.user))) return void TS.error("no member? user:" + n.user);
          e ? (TS.members.upsertMember({
            id: t.id,
            profile: i.profile
          }), i.email_pending && (t.email_pending = i.email_pending), TS.web.admin.member_profile_set_email_sig.dispatch(t)) : (TS.error("failed onMemberProfileSetEmail"), i.error && r[i.error] ? TS.web.admin.rowError(t, r[i.error]) : TS.web.admin.rowError(t));
        },
        onMemberProfileSetUsername: function(e, i, n) {
          var t, r;
          return t = {
            username_empty: TS.i18n.t("A name is required.", "web_admin")(),
            bad_username: TS.i18n.t("Usernames may only contain lowercase letters, numbers, periods, dashes and underscores and must start with a letter or number.", "web_admin")(),
            long_username: TS.i18n.t("Username must be 21 characters or less.", "web_admin")(),
            username_not_allowed: TS.i18n.t("Unfortunately, that’s a reserved word. Try something else!", "web_admin")(),
            username_same: TS.i18n.t("Username is unchanged.", "web_admin")(),
            username_taken: TS.i18n.t("That username is taken.", "web_admin")(),
            ratelimited: TS.i18n.t("Only two renames are permitted per hour.", "web_admin")()
          }, (r = TS.members.getMemberById(n.user)) ? e ? (TS.members.upsertMember({
            id: r.id,
            profile: i.profile
          }), i.profile && i.username && TS.members.upsertMember({
            id: r.id,
            name: i.username
          }), r = TS.members.getMemberById(r.id), void TS.web.admin.member_profile_set_username_sig.dispatch(r)) : (TS.error("failed onMemberProfileSetUsername"), void(i.error && t[i.error] ? "username_same" === i.error ? TS.web.admin.member_profile_set_username_sig.dispatch(r) : TS.web.admin.rowError(r, t[i.error]) : TS.web.admin.rowError(r))) : void TS.error("no member? user: " + n.user);
        },
        memberProfileSet: function(e) {
          TS.web.admin.rebuildMember(e), TS.web.admin.bindActions(e), TS.web.admin.selectRow(e).find(".inline_name").highlightText();
        },
        memberProfileSetEmail: function(e) {
          TS.web.admin.rebuildMember(e), TS.web.admin.bindActions(e);
          var i = TS.web.admin.selectRow(e);
          e.email_pending ? i.find(".inline_email_pending").show().highlightText() : (i.find(".inline_email_pending").hide(), i.find(".inline_email").highlightText());
        },
        memberProfileSetUsername: function(e) {
          TS.web.admin.rebuildMember(e), TS.web.admin.bindActions(e), TS.web.admin.selectRow(e).find(".inline_username").highlightText();
        },
        onMemberSetAdmin: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.is_admin = !0, TS.members.upsertMember(t), void TS.web.admin.member_admin_set_sig.dispatch(t)) : (TS.error("failed onMemberSetAdmin"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberAdminSet: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.web.admin.selectRow(e),
            n = TS.i18n.t("<strong>{member_name}</strong> is now an Admin.", "web_admin")({
              member_name: _.escape(e.name)
            }),
            t = TS.web.member_actions.actions.demote_admin;
          if (TS.web.member_actions.canPerformAction(t, e)) {
            n += '<a class="api_remove_admin undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
          }
          TS.web.admin.showSuccessMessageOnRow(i, n, !0), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e);
        },
        onMemberRemoveAdmin: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.is_admin = !1, TS.members.upsertMember(t), void TS.web.admin.member_admin_removed_sig.dispatch(t)) : (TS.error("failed onMemberRemoveAdmin"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberAdminRemoved: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.web.admin.selectRow(e),
            n = TS.i18n.t("<strong>{member_name}</strong> is no longer an Admin.", "web_admin")({
              member_name: _.escape(e.name)
            }),
            t = TS.web.member_actions.actions.promote_to_admin;
          if (TS.web.member_actions.canPerformAction(t, e)) {
            n += ' <a class="api_make_admin undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
          }
          TS.web.admin.showSuccessMessageOnRow(i, n, !0), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e);
        },
        onMemberSetOwner: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.is_owner = !0, TS.members.upsertMember(t), void TS.web.admin.member_owner_set_sig.dispatch(t)) : (TS.error("failed onMemberSetOwner"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberOwnerSet: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.web.admin.selectRow(e),
            n = TS.i18n.t("<strong>{member_name}</strong> is now an Owner of this team.", "web_admin")({
              member_name: _.escape(e.name)
            }),
            t = TS.web.member_actions.actions.demote_owner;
          if (TS.web.member_actions.canPerformAction(t, e)) {
            n += ' <a class="api_remove_owner undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
          }
          TS.web.admin.showSuccessMessageOnRow(i, n, !0), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e);
        },
        onMemberRemoveOwner: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.is_admin = i.is_admin, t.is_owner = !1, TS.members.upsertMember(t), void TS.web.admin.member_owner_removed_sig.dispatch(t)) : (TS.error("failed onMemberRemoveOwner"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberOwnerRemoved: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.web.admin.selectRow(e),
            n = TS.i18n.t("<strong>{member_name}</strong> is no longer an Owner of this team.", "web_admin")({
              member_name: _.escape(e.name)
            }),
            t = TS.web.member_actions.actions.promote_to_owner;
          if (TS.web.member_actions.canPerformAction(t, e)) {
            n += ' <a class="api_make_owner undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
          }
          TS.web.admin.showSuccessMessageOnRow(i, n, !0), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e);
        },
        onMemberEnable: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.deleted = !1, t.is_restricted = !1, t.is_ultra_restricted = !1, t.channels = {}, t.groups = {}, TS.members.upsertMember(t), void TS.web.admin.member_enabled_sig.dispatch(t)) : (TS.error("failed onMemberEnable"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberEnabled: function(e) {
          TS.web.admin.rebuildMember(e);
          var i, n = TS.boot_data.page_needs_enterprise,
            t = TS.web.admin.selectRow(e);
          i = n ? TS.i18n.t("This user has been added to the team.", "web_admin")() : TS.i18n.t("<strong>{member_name}</strong> is now enabled.", "web_admin")({
            member_name: _.escape(e.name)
          });
          var r = TS.web.member_actions.actions.deactivate;
          if (TS.web.member_actions.canPerformAction(r, e)) {
            i += ' <a class="api_disable_account undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
          }
          TS.web.admin.showSuccessMessageOnRow(t, i, !0), TS.web.admin.bindActions(e), K(e, TS.web.admin.active_members), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations);
        },
        onMemberDisable: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.deleted = !0, t.is_admin = !1, t.is_owner = !1, t.is_primary_owner = !1, t.is_restricted && t.profile.guest_expiration_ts && delete t.profile.guest_expiration_ts, TS.boot_data.page_needs_enterprise && t.enterprise_user && t.enterprise_user.teams && t.enterprise_user.teams.indexOf(TS.model.team.id) > -1 && t.enterprise_user.teams.splice(t.enterprise_user.teams.indexOf(TS.model.team.id), 1), TS.members.upsertMember(t), void TS.web.admin.member_disabled_sig.dispatch(t)) : (TS.error("failed onMemberDisable"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberDisabled: function(e) {
          TS.web.admin.rebuildMember(e);
          var i, n = TS.web.admin.selectRow(e),
            t = TS.boot_data.page_needs_enterprise;
          i = t ? TS.i18n.t("This user has been removed from the team.", "web_admin")() : TS.i18n.t("This account is now deactivated.", "web_admin")();
          var r = "api_enable_account";
          e.is_restricted && (r = "api_enable_ra");
          var a = i + ' <a class="' + r + ' undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
          TS.web.admin.showSuccessMessageOnRow(n, a, !0), t && n.find(".admin_member_type").text(TS.i18n.t("Removed", "web_admin")()), TS.web.admin.bindActions(e), K(e, TS.web.admin.disabled_members), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations);
        },
        onBotEnable: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (t.deleted = !1, TS.members.upsertMember(t), void TS.web.admin.member_enabled_sig.dispatch(t)) : (TS.error("failed onMemberEnable"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        onMemberSSOBind: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? void TS.web.admin.member_rebind_sig.dispatch(t) : (TS.error("failed onMemberSSOBind"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        memberRebound: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.web.admin.selectRow(e),
            n = TS.i18n.t("<strong>{member_name}</strong> has been sent a re-binding email.", "web_admin")({
              member_name: _.escape(e.name)
            });
          TS.web.admin.showSuccessMessageOnRow(i, n), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e);
        },
        onMemberSetRestricted: function(e, i, n) {
          var t, r = TS.members.getMemberById(n.user);
          if (!r) return void TS.error("no member? user:" + n.user);
          if (e) _.isArray(i.memberships.channels) ? r.channels = {} : r.channels = i.memberships.channels, _.isArray(i.memberships.groups) ? r.groups = {} : r.groups = i.memberships.groups, r.is_restricted = !0, r.is_ultra_restricted = !1, r.deleted = !1, TS.members.upsertMember(r), TS.web.admin.member_restricted_sig.dispatch(r);
          else if (TS.error("failed onMemberSetRestricted"), "not_permitted_for_user_on_enterprise" === i.error) {
            t = TS.i18n.t("Oops! You cannot make this user a Multi-Channel Guest because they are on multiple teams in this Organization.", "web_admin")();
            var a = '<p class="alert alert_info align_left"><i class="ts_icon ts_icon_warning small_right_margin"></i>' + t + "</p>";
            TS.web.admin.rowError(r, t), $("#step2_restricted").find("#convert_to_ra_confirmation").after(a);
          } else $("#step2_restricted").length ? $("#step2_restricted").find(".error_message").removeClass("hidden").end().find(".api_set_restricted").removeClass("disabled").prop("disabled", !1).text(TS.i18n.t("Try Again", "web_admin")()) : "must_join_channel" === i.error ? (t = TS.i18n.t("Oops! You must add this member to at least one channel before converting them to a Multi-Channel Guest.", "web_admin")(), TS.web.admin.rowError(r, t)) : TS.web.admin.rowError(r);
        },
        memberRestricted: function(e) {
          var i = K(e, TS.web.admin.restricted_members);
          TS.web.admin.rebuildMember(e);
          var n = TS.i18n.t("<strong>{member_name}</strong> is now a Multi-Channel Guest.", "web_admin")({
            member_name: _.escape(e.name)
          });
          if (i === TS.web.admin.active_members) {
            var t = '<a class="api_unrestrict_account undo_link" data-member-id="' + e.id + '">' + TS.i18n.t("Undo", "web_admin")() + "</a>";
            n += t;
          }
          var r = Q() ? 1500 : 0;
          setTimeout(function() {
            var i = TS.web.admin.selectRow(e);
            TS.web.admin.showSuccessMessageOnRow(i, n, !0), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations), $("#restrict_account").addClass("hidden"), $("#admin_list").removeClass("hidden"), TS.web.admin.showRestrictedMembersTab();
          }, r);
        },
        onMemberSetUltraRestricted: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          if (!t) return void TS.error("no member? user:" + n.user);
          if (e) _.isArray(i.memberships.channels) ? t.channels = {} : t.channels = i.memberships.channels, _.isArray(i.memberships.groups) ? t.groups = {} : t.groups = i.memberships.groups, t.is_restricted = !0, t.is_ultra_restricted = !0, t.deleted = !1, TS.members.upsertMember(t), TS.web.admin.member_ultra_restricted_sig.dispatch(t);
          else if (TS.error("failed onMemberSetRestricted"), "ura_limit_reached" === i.error) {
            var r = TS.members.getPrefCompliantMemberName(t, !0, !0);
            TS.generic_dialog.start({
              title: TS.i18n.t("Couldn’t convert to Single-Channel Guest", "web_admin")(),
              body: TS.i18n.t('Unfortunately, {member_name_possessive} account couldn’t be converted because your team has already reached its limit for Single-Channel Guest accounts. Teams can have up to 5 Single-Channel Guest accounts per paid account. <a href="https://get.slack.help/hc/{locale}/articles/202518103-Multi-Channel-and-Single-Channel-Guests" target="_blank">Learn more about guests</a>', "web_admin")({
                member_name_possessive: TS.i18n.fullPossessiveString(r),
                locale: TS.i18n.zdLocale()
              }),
              show_cancel_button: !1,
              go_button_text: TS.i18n.t("Got it", "web_admin")(),
              esc_for_ok: !0,
              onGo: TS.web.admin.exitRestrictWorkflow
            });
          } else if ("not_permitted_for_user_on_enterprise" === i.error) {
            var a = TS.i18n.t("Oops! You cannot make this user a Single-Channel Guest because they are on multiple teams in this Organization.", "web_admin")(),
              s = '<p class="alert alert_info align_left"><i class="ts_icon ts_icon_warning small_right_margin"></i>' + a + "</p>";
            TS.web.admin.rowError(t, a), $("#step2_guest").find("#convert_to_ura_confirmation").after(s);
          } else $("#step2_guest").length ? $("#step2_guest").find(".error_message").removeClass("hidden").end().find(".api_set_ultra_restricted").removeClass("disabled").prop("disabled", !1).text(TS.i18n.t("Try Again", "web_admin")()) : TS.web.admin.rowError(t);
        },
        memberUltraRestricted: function(e) {
          K(e, TS.web.admin.ultra_restricted_members), TS.web.admin.rebuildMember(e);
          var i = TS.i18n.t('<strong>{member_name}</strong> is now a Single-Channel Guest. <a class="api_unrestrict_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
              member_name: _.escape(e.name),
              member_id: e.id
            }),
            n = Q() ? 1500 : 0;
          setTimeout(function() {
            var n = TS.web.admin.selectRow(e);
            TS.web.admin.showSuccessMessageOnRow(n, i, !0), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations), $("#restrict_account").addClass("hidden"), $("#admin_list").removeClass("hidden"), TS.web.admin.showRestrictedMembersTab();
          }, n);
        },
        onMemberUnrestricted: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          if (!t) return void TS.error("no member? user:" + n.user);
          if (e) t.profile.guest_expiration_ts && delete t.profile.guest_expiration_ts, t.is_restricted = !1, t.is_ultra_restricted = !1, TS.members.upsertMember(t), TS.web.admin.member_unrestricted_sig.dispatch(t);
          else if (TS.error("failed onMemberUnrestricted"), "not_permitted_for_user_on_enterprise" === i.error) {
            var r = TS.i18n.t("Oops! You cannot make this user a Full Member because they are on multiple teams in this Organization.", "web_admin")();
            TS.web.admin.rowError(t, r);
          } else TS.web.admin.rowError(t);
        },
        memberUnrestricted: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.i18n.t("<strong>{member_name}</strong> is now a full team member.", "web_admin")({
            member_name: _.escape(e.name)
          });
          setTimeout(function() {
            var n = TS.web.admin.selectRow(e);
            TS.web.admin.showSuccessMessageOnRow(n, i, !0), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations), K(e, TS.web.admin.active_members);
          }, 0);
        },
        onMemberInviteChannel: function(e, i, n) {
          var t = TS.members.getMemberById(n.users);
          return t ? e ? (_.isArray(t.channels) && 0 === t.channels.length && (t.channels = {}), t.channels[i.channel.id] = i.channel.name, TS.members.upsertMember(t), void TS.web.admin.member_invited_channel_sig.dispatch(t)) : (TS.error("failed onMemberInviteChannel"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.users);
        },
        onMemberInviteGroup: function(e, i, n) {
          var t = TS.members.getMemberById(n.users);
          return t ? e ? (_.isArray(t.groups) && 0 === t.groups.length && (t.groups = {}), t.groups[i.group.id] = i.group.name, TS.members.upsertMember(t), void TS.web.admin.member_invited_group_sig.dispatch(t)) : (TS.error("failed onMemberInviteGroup"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.users);
        },
        rerenderMember: function(e) {
          TS.web.admin.rebuildMember(e), TS.web.admin.bindActions(e);
        },
        rerenderMemberAndHighlight: function(e) {
          if (TS.web.admin.rerenderMember(e), !e.is_ultra_restricted) {
            TS.web.admin.selectRow(e).addClass("expanded").find(".admin_member_type").highlightText();
          }
        },
        onMemberKickChannel: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (delete t.channels[n.channel], TS.members.upsertMember(t), void TS.web.admin.member_kicked_channel_sig.dispatch(t)) : (TS.error("failed onMemberKickChannel"), TS.web.admin.member_kicked_channel_sig.dispatch(t), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        onMemberKickGroup: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (delete t.groups[n.channel], TS.members.upsertMember(t), void TS.web.admin.member_kicked_group_sig.dispatch(t)) : (TS.error("failed onMemberKickGroup"), TS.web.admin.member_kicked_group_sig.dispatch(t), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        onMemberURAChanged: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (_.isArray(i.memberships.channels) ? t.channels = {} : t.channels = i.memberships.channels, _.isArray(i.memberships.groups) ? (t.groups = {}, t.more_groups = 0) : (t.groups = i.memberships.groups, t.more_groups = i.memberships.more_groups), TS.members.upsertMember(t), void TS.web.admin.member_ura_changed_sig.dispatch(t)) : (TS.error("failed onMemberURAChanged"), void TS.web.admin.rowError(t)) : void TS.error("no member? user:" + n.user);
        },
        onEnableRestrictedMember: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          return t ? e ? (_.isArray(i.memberships.channels) ? t.channels = {} : t.channels = i.memberships.channels, _.isArray(i.memberships.groups) ? t.groups = {} : t.groups = i.memberships.groups, t.deleted = !1, t.is_restricted = !0, t.is_ultra_restricted = !1, TS.members.upsertMember(t), void TS.web.admin.restricted_member_enabled_sig.dispatch(t)) : (TS.error("failed onRestrictedMemberEnable"), TS.web.admin.rowError(t), void $("#step2_restricted").find(".error_message").removeClass("hidden").end().find(".api_set_restricted").removeClass("disabled").prop("disabled", !1).text("Try Again")) : void TS.error("no member? user:" + n.user);
        },
        restrictedMemberEnabled: function(e) {
          TS.web.admin.rebuildMember(e);
          var i, n, t = TS.boot_data.page_needs_enterprise;
          n = t ? TS.i18n.t('This user has been added to the team as a Multi-Channel Guest. <a class="api_disable_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
            member_id: e.id
          }) : TS.i18n.t('<strong>{member_name}</strong> is now enabled as a Multi-Channel Guest. <a class="api_disable_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
            member_name: _.escape(e.name),
            member_id: e.id
          }), i = TS.web.admin.selectRow(e), TS.web.admin.showSuccessMessageOnRow(i, n), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations), K(e, TS.web.admin.restricted_members), TS.web.admin.isAdminListHidden() && ($("#restrict_account").addClass("hidden"), $("#admin_list").removeClass("hidden"), TS.web.admin.showRestrictedMembersTab());
        },
        onEnableUltraRestrictedMember: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          if (!t) return void TS.error("no member? user:" + n.user);
          if (e) _.isArray(i.memberships.channels) ? t.channels = {} : t.channels = i.memberships.channels, _.isArray(i.memberships.groups) ? t.groups = {} : t.groups = i.memberships.groups, t.deleted = !1, t.is_restricted = !0, t.is_ultra_restricted = !0, TS.members.upsertMember(t), TS.web.admin.ultra_restricted_member_enabled_sig.dispatch(t), TS.web.admin.isAdminListHidden() && ($("#restrict_account").addClass("hidden"), $("#admin_list").removeClass("hidden"), TS.web.admin.showRestrictedMembersTab());
          else if (TS.error("failed onEnableUltraRestrictedMember"), "ura_limit_reached" === i.error) {
            var r = '<p class="alert alert_info align_left"><i class="ts_icon ts_icon_warning small_right_margin"></i>' + TS.i18n.t("You’ve reached your limit for the number of Single-Channel Guests you can invite. You must invite more paid team members before you can add more Single-Channel Guests.", "web_admin")() + "</p>";
            $("#step2_guest").find("#convert_to_ura_confirmation").after(r);
          } else $("#step2_guest").find(".error_message").removeClass("hidden").end().find(".api_set_ultra_restricted").removeClass("disabled").prop("disabled", !1).text(TS.i18n.t("Try Again", "web_admin")());
        },
        onMemberDisable2FA: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          if (!t) return void TS.error("no member? user:" + n.user);
          e ? (t.two_factor_auth_enabled = !1, TS.web.admin.rerenderMember(t)) : TS.web.admin.rowError(t);
        },
        onExpirationDateChanged: function(e, i, n) {
          var t = TS.members.getMemberById(n.user);
          if (!t) return void TS.error("No member found for user id: " + n.user);
          if (e) {
            var r, a = _.escape(t.name);
            i.profile.guest_expiration_ts ? (t.profile.guest_expiration_ts = i.profile.guest_expiration_ts, r = TS.i18n.t("Got it! <strong>{member_name}</strong>{possessive_affix} account will be deactivated on {date} at {time}.", "web_admin")({
              member_name: a,
              possessive_affix: TS.i18n.possessive(a),
              date: TS.interop.datetime.formatDate(t.profile.guest_expiration_ts, "{date}"),
              time: TS.interop.datetime.formatDate(t.profile.guest_expiration_ts, "{time}")
            })) : (delete t.profile.guest_expiration_ts, r = TS.i18n.t("Got it! <strong>{member_name}</strong>{possessive_affix} account will stay active until you specify otherwise.", "web_admin")({
              member_name: a,
              possessive_affix: TS.i18n.possessive(a)
            })), TS.members.upsertMember(t), TS.web.admin.rebuildMember(t), _.defer(function() {
              var e = TS.web.admin.selectRow(t);
              TS.web.admin.showSuccessMessageOnRow(e, r, !0), TS.web.admin.bindActions(t), TS.web.admin.rowFadeSuccess(t);
            });
          } else TS.error("Failed to update expiration date for user id: ", n.user), TS.web.admin.rowError(t);
        },
        ultraRestrictedMemberEnabled: function(e) {
          TS.web.admin.rebuildMember(e);
          var i = TS.web.admin.selectRow(e),
            n = TS.i18n.t('<strong>{member_name}</strong> is now a Single-Channel Guest. <a class="api_disable_account undo_link" data-member-id="{member_id}">Undo</a>', "web_admin")({
              member_name: _.escape(e.name),
              member_id: e.id
            });
          TS.web.admin.showSuccessMessageOnRow(i, n), TS.web.admin.bindActions(e), TS.web.admin.rowFadeSuccess(e, TS.web.admin.updateRowLocations), K(e, TS.web.admin.ultra_restricted_members);
        },
        showRestrictedMembersTab: function() {
          $("#restricted_members_tab").click();
        },
        onUserGroupsFetched: function(e) {
          e && $("#user_groups_tab .count").text(e.length);
        },
        getLastSearchRange: function() {
          return T;
        },
        buildRangeURL: function(e) {
          var t, r, a, s;
          if (s = window.location.hash, void 0 === e || !e.toUpperCase) return null;
          var d = $("#team_filter input").val();
          for (e = e.toUpperCase(), t = 0, r = i.length; t < r; t += 1)
            if (-1 !== i[t].range.indexOf(e) && n !== e) return a = i[t].link + "", d.length && (a += "&q=" + encodeURI(d)), a && -1 === a.indexOf("#") && s && (a += "#" + s.replace("#", "")), a;
          return null;
        },
        isSubsetCase: function() {
          return !Q() && boot_data.member_list_subset;
        },
        getMembersForUser: function() {
          return e;
        },
        getRangeFromURL: function() {
          return n;
        },
        showSuccessMessageForMember: function(e, i, n) {
          Y(e, {
            success: !0,
            success_message: i,
            success_highlight_member_type: n,
            processing: !1
          });
        },
        showSuccessMessageOnRow: function(e, i, n) {
          if (!e.length) return void TS.warn("showSuccessMessageOnRow called with an empty jQuery object");
          var t = e.data("member-id");
          if (!t) return void TS.warn("showSuccessMessageOnRow called with a row that has no data-member-id property");
          var r = TS.members.getMemberById(t);
          return r ? TS.web.admin.showSuccessMessageForMember(r, i, n) : void TS.warn("showSuccessMessageOnRow called with a row with a data-member-id that does not map to any known user");
        },
        isAdminListHidden: function() {
          return $("#admin_list").hasClass("hidden");
        },
        test: function() {
          var e = {};
          return Object.defineProperty(e, "_row_states", {
            get: function() {
              return w;
            },
            set: function(e) {
              w = e;
            }
          }), Object.defineProperty(e, "_moveMemberTo", {
            get: function() {
              return K;
            },
            set: function(e) {
              K = e;
            }
          }), e;
        }
      });
      var e, i, n, t, r, a, s, d, m, o, l = 57,
        b = 100,
        c = !1,
        u = !1,
        S = !1,
        T = null,
        w = {},
        p = [],
        g = [],
        h = [],
        f = [],
        v = [],
        M = [],
        y = "",
        k = !1,
        A = 0,
        C = 0,
        I = 0,
        R = function() {
          k || ($("#admin_list .tab_panels .loading_hash_animation").remove(), k = !0);
        },
        E = function() {
          TS.model.ui_state || (TS.model.ui_state = {}), TS.model.ui_state.tab_name = TS.web.admin.active_tab + "_members";
        },
        O = function(e) {
          function i(e, i) {
            var n = _.map(e, "id");
            return e.concat(i.filter(function(e) {
              return e.is_divider || !_.includes(n, e.id);
            }));
          }
          if (Q()) return y = e, {
            active: p,
            disabled: g,
            restricted: h
          };
          var n = N(e),
            t = x(e, n);
          return {
            active: i(n.active, t.active),
            disabled: i(n.disabled, t.disabled),
            restricted: i(n.restricted, t.restricted)
          };
        },
        N = function(e) {
          var i = y && e && _.includes(e, y);
          y = e;
          var n = i ? f : p,
            t = i ? v : g,
            r = i ? M : h;
          return n = _.reject(n, {
            is_divider: !0
          }), t = _.reject(t, {
            is_divider: !0
          }), r = _.reject(r, {
            is_divider: !0
          }), f = TS.utility.members.filterMembersByQuery(n, e), v = TS.utility.members.filterMembersByQuery(t, e), M = TS.utility.members.filterMembersByQuery(r, e), {
            active: f,
            disabled: v,
            restricted: M
          };
        },
        x = function(e, i) {
          var n = function(e, i, n) {
              var t = _.map(n, "id");
              i = _.filter(i, function(e) {
                return !_.includes(t, e.id);
              });
              var r = TS.members.view.findMatchesInMemberList(i, e, !1);
              return Object.keys(r).length ? _(r).map(function(e, i) {
                var n = TS.members.view.getHeaderLabelForMatchKey(i);
                return [{
                  is_divider: !0,
                  html: '<div class="filter_header"><strong>' + _.escape(n) + "</strong></div>"
                }].concat(_.map(e, "member"));
              }).flatten().value() : [];
            },
            t = _.filter(TS.model.members, "deleted"),
            r = _.filter(TS.model.members, "is_restricted");
          return {
            active: n(e, _.difference(TS.model.members, t, r), i.active),
            disabled: n(e, t, i.disabled),
            restricted: n(e, r, i.restricted)
          };
        },
        U = function(e) {
          var i = O(e),
            n = _.reject(i.active, {
              is_divider: !0
            }),
            t = _.reject(i.disabled, {
              is_divider: !0
            }),
            r = _.reject(i.restricted, {
              is_divider: !0
            }),
            a = n.length > 0,
            s = t.length > 0,
            d = r.length > 0;
          [{
            name: "active",
            label: TS.i18n.t("full team members", "web_admin")(),
            list_items: i.active
          }, {
            name: "restricted",
            label: TS.i18n.t("multi-channel guests", "web_admin")(),
            list_items: i.restricted
          }, {
            name: "disabled",
            label: TS.i18n.t("deactivated accounts", "web_admin")(),
            list_items: i.disabled
          }].forEach(function(i) {
            if (!(i.list_items.length > 0)) {
              var m = {
                tab: i,
                query: e,
                pending_matches: [],
                show_pending_matches: !1,
                accepted_matches: [],
                show_accepted_matches: !1,
                active_matches: n,
                disabled_matches: t,
                restricted_matches: r,
                show_active_matches: "active" !== i.name && a,
                show_disabled_matches: "disabled" !== i.name && s,
                show_restricted_matches: "restricted" !== i.name && d
              };
              Q() && (m.active_matches = {
                length: A
              }, m.disabled_matches = {
                length: I
              }, m.restricted_matches = {
                length: C
              });
              var o = TS.templates.team_list_no_results(m);
              i.list_items.push({
                is_divider: !0,
                html: o
              });
            }
          }), $("#active_members .long_list").longListView("setItems", i.active, !0), $("#disabled_members .long_list").longListView("setItems", i.disabled, !0), $("#restricted_members .long_list").longListView("setItems", i.restricted, !0);
        },
        B = function() {
          switch (TS.web.admin.sort_order) {
            case "screen_name":
              return "name";
            case "real_name":
              return "real_name";
            case "display_name":
              return "display_name";
            default:
              return "";
          }
        },
        D = function(e) {
          e && TS.members.view.clearFilter("#team_filter", "#team_list_scroller"), TS.members.view.filterTeam(y, "#team_filter", "#team_list_scroller");
        },
        P = function() {
          $(".tab_panels").on("click.filter", ".clear_members_filter", function() {
            TS.members.view.clearFilter("#team_filter", "#team_list_scroller");
          });
          var e = function() {
            return {
              full_profile_filter: !0,
              is_long_list_view: !0,
              include_bots: 0,
              exclude_slackbot: !0,
              include_deleted: 0,
              sort_dir: "asc",
              sort: B(),
              endpoint: "users.admin.fetchTeamUsers"
            };
          };
          TS.members.view.bindTeamFilter("#team_filter", "#team_list_scroller", e), $("#team_filter input.member_filter").on("focus", function() {
            re("ADMIN_SEARCH");
          });
        },
        L = function() {
          var e = $("input.member_filter");
          $(".tab_panels").on("click", ".clear_members_filter", function() {
            e.val("").focus().trigger("change");
          }), e.on("change keyup cut paste", function() {
            var e = F();
            e != y && U(e);
          }), e.on("focus", function() {
            re("ADMIN_SEARCH");
          });
        },
        F = function() {
          return _.toString($("input.member_filter").val()).trim();
        },
        G = function(e) {
          if (Q()) return W(e, []), [];
          if (!TS.web.admin.restricted_members.length && !TS.web.admin.ultra_restricted_members.length) return e.html(j()), [];
          var i = [];
          return (TS.web.admin.restricted_members.length || TS.boot_data.can_invite_ras) && (i.push({
            is_divider: !0,
            html: m
          }), TS.web.admin.restricted_members.length ? i = i.concat(TS.web.admin.restricted_members) : TS.boot_data.can_invite_ras && !TS.web.admin.subset_data.restricted_members_count ? i.push({
            is_divider: !0,
            html: r
          }) : TS.boot_data.can_invite_ras && i.push({
            is_divider: !0,
            html: a
          })), (TS.web.admin.ultra_restricted_members.length || TS.boot_data.can_invite_ras) && (i.push({
            is_divider: !0,
            html: o
          }), TS.web.admin.ultra_restricted_members.length ? i = i.concat(TS.web.admin.ultra_restricted_members) : TS.boot_data.can_invite_ras && !TS.web.admin.subset_data.ultra_restricted_members_count ? i.push({
            is_divider: !0,
            html: s
          }) : TS.boot_data.can_invite_ras && i.push({
            is_divider: !0,
            html: d
          })), W(e, i), i;
        },
        H = function(e, i) {
          if (Q()) return W(e, []), [];
          var n = _.partition(i, function(e) {
              return e.is_bot || e.is_slackbot;
            }),
            r = n[0],
            a = n[1],
            s = a;
          return r.length && (s.push({
            is_divider: !0,
            html: t
          }), s = s.concat(r)), W(e, s), s;
        },
        z = function(e, i, n) {
          p = H(e, TS.web.admin.active_members), g = H(n, TS.web.admin.disabled_members), h = G(i), TS.web.admin.delegateBindActions();
        },
        j = function() {
          var e = !!TS.boot_data.pay_prod_cur;
          return TS.boot_data.sso_required ? TS.templates.admin_restricted_info_sso(TS.model.team) : TS.templates.admin_restricted_info({
            paid_team: e
          });
        },
        W = function(e, i) {
          e.addClass("long_list").longListView({
            items: i,
            preserve_dom_order: !0,
            approx_item_height: l,
            approx_divider_height: 60,
            scrollable: window,
            calcDividerHeight: function() {
              return this.calcItemHeight.apply(this, arguments);
            },
            calcItemHeight: function(e) {
              return e.height();
            },
            makeDivider: function() {
              return this.makeElement.apply(this, arguments);
            },
            makeElement: function() {
              return $('<div class="list_item_container full_width">');
            },
            renderDivider: function(e, i) {
              e.html(i.html);
            },
            renderItem: function(e, i) {
              var n = TS.web.admin.buildMemberHTML(i, !0, !0);
              e.html(n), i == this.items[this.items.length - 1] && e.addClass("is_last_item");
              var t = w[i.id];
              if (t) {
                var r = e.find(".admin_list_item");
                r.toggleClass("error", !!t.error), r.toggleClass("expanded", !!t.expanded), r.toggleClass("processing", !!t.processing), r.toggleClass("success", !!t.success), r.toggleClass("has_error_detail", !!t.error_detail), t.error && r.find(".error_detail").html(t.error_detail), t.success && (r.find(".success_message").html(t.success_message || ""), t.success_highlight_member_type && r.find(".admin_member_type").highlightText());
              }
            }
          });
        },
        V = function() {
          var e = $("#admin_list .tab_pane.selected .long_list");
          e.longListView("recalculateScrollableOffset"), e.longListView("scrollToPosition", document.body.scrollTop, !0);
        },
        Y = function(e, i) {
          var n = TS.web.admin.selectRow(e);
          w[e.id] = _.merge(w[e.id], i), n.closest(".long_list").longListView("itemUpdated", e);
        },
        q = function(e) {
          C = e.num_found.restricted || 0, I = e.num_found.disabled || 0;
          var i = e.num_found.members || 0;
          A = Math.max(0, i - C);
          var n = $("#restricted_members_tab");
          0 === C ? e.query || n.addClass("hidden") : n.removeClass("hidden");
          var t = $("#disabled_members_tab");
          0 === I ? e.query || t.addClass("hidden") : t.removeClass("hidden"), t.find(".count").text(I), n.find(".count").text(C), $("#active_members_tab").find(".count").text(A);
        },
        K = function(e, i) {
          if (!Q()) {
            var n, t, r = [TS.web.admin.active_members, TS.web.admin.restricted_members, TS.web.admin.ultra_restricted_members, TS.web.admin.disabled_members],
              a = ["active_members_count", "restricted_members_count", "ultra_restricted_members_count", "disabled_members_count"];
            return _.each(r, function(r, s) {
              t = r.length, i !== r ? (_.remove(r, {
                id: e.id
              }), r.length !== t && (n = s, TS.web.admin.subset_data[a[s]] -= 1)) : (-1 === _.findIndex(r, {
                id: e.id
              }) && r.push(e), TS.web.admin.subset_data[a[s]] += 1);
            }), r[n];
          }
        },
        J = function(e) {
          var i = !1;
          if (e.is_restricted || e.is_ultra_restricted) {
            var n = _.get(TS.boot_data.channel_membership, e.id);
            n && (e.channels = n.channels, e.groups = n.groups, e.more_groups = n.more_groups, delete TS.boot_data.channel_membership[e.id], i = !0);
          }
          "normal" !== TS.boot_data.auth_mode || _.isUndefined(e.has_sso_token) || (delete e.has_sso_token, i = !0);
          var t = _.get(TS.boot_data.all_emails, e.id);
          t && (e.profile.email = t, delete TS.boot_data.all_emails[e.id], i = !0), i && TS.members.upsertMember(e);
        },
        Q = function() {
          return (TS.boot_data.page_needs_enterprise || TS.boot_data.feature_api_admin_page_not_ent) && TS.boot_data.feature_api_admin_page && "list" === TS.web.admin.view;
        },
        X = function(e, i) {
          window.navigator.msSaveBlob(e, i);
        },
        Z = function(e, i, n) {
          var t = new Blob([e], {
              type: "text/csv"
            }),
            r = window.URL || window.webkitURL,
            a = r.createObjectURL(t);
          n && (n.href = a, n.download = i, n.click()), r.revokeObjectURL(a), Ladda.stopAll();
        },
        ee = function(e) {
          var i = new Blob([e], {
              type: "text/csv"
            }),
            n = new FileReader;
          n.onloadend = function() {
            var e = n.result;
            window.open(e, "_blank") || (window.location.href = e);
          };
          try {
            n.readAsDataURL(i);
          } catch (e) {
            TS.warn("Failed to download CSV for admin team members for id: " + TS.model.team.id);
          } finally {
            Ladda.stopAll();
          }
        },
        ie = function(e) {
          var i = new Blob([e], {
              type: "application/octet-stream"
            }),
            n = window.URL || window.webkitURL,
            t = n.createObjectURL(i);
          window.location.href = t, Ladda.stopAll();
        },
        ne = function() {
          if (200 === this.status) {
            var e = "slack-" + TS.model.team.domain + "-members.csv",
              i = $("#admin_list").find("[data-admin-csv-download-link]").get(0);
            if (window.navigator.msSaveBlob) return X(this.response, e);
            if ("download" in i) return Z(this.response, e, i);
            if (window.FileReader && !window.safari) return ee(this.response);
            if (window.safari) return ie(this.response);
          }
        },
        te = function() {
          Ladda.bind("#admin_list .ladda-button"), $("#admin_list").on("click", "[data-admin-csv-download]", function(e) {
            e.preventDefault();
            var i = new XMLHttpRequest;
            i.open("POST", TS.model.api_url + "users.admin.fetchTeamUsersCsv", !0), i.responseType = "blob", i.onload = ne;
            var n = new FormData;
            n.append("token", TS.model.api_token), i.send(n);
          });
        },
        re = function(e, i) {
          var n = "invites" === TS.web.admin.view ? "ADMIN_SITE_INVITES_ACTION" : "ADMIN_SITE_LIST_ACTION",
            t = "invites" === TS.web.admin.view ? "ADMIN_INVITES" : "ADMIN_HOME",
            r = {
              contexts: {
                ui_context: {
                  step: t,
                  action: "click",
                  ui_element: e
                }
              }
            };
          i && _.assign(r, i), TS.clog.track(n, r);
        },
        ae = function() {
          var e, i;
          "invites" === TS.web.admin.view ? (i = "ADMIN_SITE_INVITES_PERF_SHOW", e = TS.metrics.measure("admin_invites_load", "start_nav")) : (i = "ADMIN_SITE_LIST_PERF_SHOW", e = TS.metrics.measure("admin_list_load", "start_nav"));
          var n = {
            contexts: {
              perf: {
                elapsed_time: e
              }
            }
          };
          "list" === TS.web.admin.view && (n.is_api_admin_page = Q()), TS.clog.track(i, n);
        };
    }();
  }
}, [2769]);
