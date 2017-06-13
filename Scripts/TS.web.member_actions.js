webpackJsonp([198], {
  2794: function(e, t) {
    ! function() {
      "use strict";
      TS.registerModule("web.member_actions", {
        onStart: function() {
          _.map(TS.web.member_actions.actions, function(e, t) {
            TS.web.member_actions.actions[t] = _.assign(e, {
              name: t
            });
          });
        },
        actions: {
          activate: {
            primary: !0,
            label: function(e) {
              return e.team.is_enterprise ? TS.i18n.t("Add to Team", "member_actions")() : TS.i18n.t("Enable Account", "member_actions")();
            },
            cls: "api_enable_account"
          },
          activate_as_guest: {
            primary: !1,
            label: function(e) {
              var t = "";
              return t = e.member.is_single_channel_guest ? TS.i18n.t("Enable Single-Channel Guest", "member_actions")() : e.member.is_guest ? TS.i18n.t("Enable Multi-Channel Guest", "member_actions")() : TS.i18n.t("Enable Guest", "member_actions")(), t;
            },
            cls: "api_enable_ra"
          },
          cant_reactivate_as_guest: {
            primary: !1,
            label: function(e) {
              var t = TS.members.getPrefCompliantMemberName(e.member.object, !0, !0);
              return e = _.assign({}, e, {
                formatted_member_name: t,
                action: "cant_reactivate_as_guest"
              }), new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(e));
            },
            cls: "inline_flex no_underline"
          },
          deactivate: {
            primary: !1,
            label: function(e) {
              return e.team.is_enterprise ? TS.i18n.t("Remove from Team", "member_actions")() : TS.i18n.t("Deactivate Account", "member_actions")();
            },
            cls: "api_disable_account"
          },
          cant_deactivate: {
            primary: !1,
            label: function(e) {
              if (!TS.boot_data.feature_enterprise_guest_conversion) return new Handlebars.SafeString(TS.i18n.t('Can’t remove or convert member <ts-icon class="very_small_left_padding ts_icon_question_circle"></ts-icon>', "member_actions")());
              var t = TS.members.getPrefCompliantMemberName(e.member.object, !0, !0),
                i = _.map(TS.idp_groups.getGroupsForMember(e.member.object.id), "name"),
                n = r(i),
                a = TS.utility.enterprise.getProviderLabel(_.get(TS.model, "enterprise"), _.get(TS.model, "enterprise.sso_provider.label", "single sign-on"));
              return e = _.assign({}, e, {
                formatted_member_name: t,
                action: "cant_deactivate",
                group_list: i,
                idp_label: a,
                formatted_group_label: n
              }), new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(e));
            },
            cls: TS.boot_data.feature_enterprise_guest_conversion ? "inline_flex no_underline" : "inline_flex no_underline api_cant_deactivate"
          },
          cant_convert_or_deactivate: {
            primary: !1,
            label: function(e) {
              var t = TS.members.getPrefCompliantMemberName(e.member.object, !0, !0),
                i = _.map(TS.idp_groups.getGroupsForMember(e.member.object.id), "name"),
                n = r(i),
                a = TS.utility.enterprise.getProviderLabel(_.get(TS.model, "enterprise"), _.get(TS.model, "enterprise.sso_provider.label", "single sign-on"));
              return e = _.assign({}, e, {
                formatted_member_name: t,
                action: "cant_convert_or_deactivate",
                group_list: i,
                idp_label: a,
                formatted_group_label: n
              }), new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(e));
            },
            cls: "inline_flex no_underline"
          },
          demote_admin: {
            primary: !0,
            label: TS.i18n.t("Remove Admin Privileges", "member_actions")(),
            cls: "api_remove_admin"
          },
          demote_owner: {
            primary: !0,
            label: TS.i18n.t("Remove Ownership", "member_actions")(),
            cls: "api_remove_owner"
          },
          promote_to_member: {
            primary: !0,
            label: TS.i18n.t("Make Full Team Member", "member_actions")(),
            cls: "api_unrestrict_account"
          },
          promote_to_admin: {
            primary: !0,
            label: TS.i18n.t("Make an Admin", "member_actions")(),
            cls: "api_make_admin"
          },
          promote_to_owner: {
            primary: !0,
            label: TS.i18n.t("Make an Owner", "member_actions")(),
            cls: "api_make_owner"
          },
          convert_to_guest: {
            primary: !1,
            label: TS.i18n.t("Convert to Guest", "member_actions")(),
            cls: function(e) {
              return e.team.is_paid ? "admin_member_restrict_link" : "admin_member_restrict_link_unpaid";
            }
          },
          cant_convert_member_role: {
            primary: !1,
            label: function(e) {
              var t = TS.members.getPrefCompliantMemberName(e.member.object, !0, !0);
              return e = _.assign({}, e, {
                formatted_member_name: t,
                action: "cant_convert_member_role"
              }), new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(e));
            },
            cls: "inline_flex no_underline"
          },
          promote_to_mc_guest: {
            primary: !1,
            label: function() {
              return TS.i18n.t("Convert to Multi-Channel Guest", "member_actions")();
            },
            cls: "api_set_restricted"
          },
          demote_to_sc_guest: {
            primary: !1,
            label: TS.i18n.t("Convert to Single-Channel Guest", "member_actions")(),
            cls: "admin_member_restrict_link_ura"
          },
          transfer_ownership: {
            primary: !0,
            label: TS.i18n.t("Transfer team ownership", "member_actions")(),
            href: "/admin/transfer"
          },
          activate_bot: {
            primary: !0,
            label: function(e) {
              return e.team.is_enterprise ? TS.i18n.t("Add to Team", "member_actions")() : TS.i18n.t("Enable Account", "member_actions")();
            },
            cls: "api_enable_bot"
          },
          configure_bot: {
            primary: !1,
            label: TS.i18n.t("Configure", "member_actions")(),
            cls: "api_configure_bot",
            href: function(e) {
              return "/services/" + e.member.object.profile.bot_id;
            }
          },
          send_sso: {
            primary: !1,
            label: TS.i18n.t("Send SSO binding email", "member_actions")(),
            cls: "api_sso_bind"
          },
          disable_2fa: {
            primary: !1,
            label: TS.i18n.t("Disable 2FA", "member_actions")(),
            cls: "admin_member_disable_2fa_link",
            title: TS.i18n.t("Disable two-factor verification for this account", "member_actions")()
          },
          update_expiration_ts: {
            primary: !0,
            label: function(e) {
              return _.get(e, "member.object.profile.guest_expiration_ts") ? TS.i18n.t("Adjust Time Limit", "member_actions")() : TS.i18n.t("Set a Time Limit", "member_actions")();
            },
            cls: "admin_member_update_expiration_ts",
            title: TS.i18n.t("Adjust time limit for this guest", "member_actions")()
          }
        },
        getActionsForMember: function(e) {
          var r = i(e),
            a = [];
          return _.each(TS.web.member_actions.actions, function(e) {
            n(e, r) && a.push(t(e, r));
          }), _.sortBy(a, ["primary"]);
        },
        canPerformAction: function(e, t) {
          var r = i(t);
          return n(e, r);
        },
        test: function() {
          var e = {
            _canPerform: n,
            _getAction: t,
            _getData: i
          };
          return Object.defineProperty(e, "_canPerform", {
            get: function() {
              return n;
            },
            set: function(e) {
              n = e;
            }
          }), Object.defineProperty(e, "_getAction", {
            get: function() {
              return t;
            },
            set: function(e) {
              t = e;
            }
          }), Object.defineProperty(e, "_getData", {
            get: function() {
              return i;
            },
            set: function(e) {
              i = e;
            }
          }), e;
        }
      });
      var e, t = function(e, t) {
          var i = {};
          return _.each(e, function(e, r) {
            i[r] = _.isFunction(e) ? e(t) : e;
          }), i;
        },
        i = function(e) {
          if (!e) return {
            team: {},
            actor: {},
            member: {}
          };
          var t = TS.model.user;
          return {
            team: {
              is_enterprise: TS.boot_data.page_needs_enterprise,
              is_paid: TS.boot_data.pay_prod_cur,
              is_over_integration_limit: TS.boot_data.over_integration_limit,
              is_sso_enabled: "normal" !== TS.boot_data.auth_mode,
              has_other_members: TS.web.admin.active_members.length > 1
            },
            actor: {
              is_admin: t.is_admin,
              is_owner: t.is_owner,
              is_primary_owner: t.is_primary_owner
            },
            member: {
              object: e,
              is_admin: e.is_admin,
              is_owner: e.is_owner,
              is_primary_owner: e.is_primary_owner,
              is_bot: e.is_bot,
              is_human: !e.is_bot && !e.is_slackbot,
              is_deleted: e.deleted,
              is_2fa: e.two_factor_auth_enabled,
              is_guest: e.is_restricted || e.is_ultra_restricted,
              is_single_channel_guest: e.is_ultra_restricted,
              is_multi_channel_guest: e.is_restricted && !e.is_ultra_restricted,
              is_configurable: e.is_bot && e.bot_can_be_configured || e.is_slackbot,
              only_belongs_to_this_team: e.enterprise_user && e.enterprise_user.teams && e.enterprise_user.teams.length <= 1,
              enabled_on_zero_teams: e.enterprise_user && e.enterprise_user.teams && 0 == e.enterprise_user.teams.length,
              has_removal_restriction: TS.idp_groups && TS.idp_groups.memberBelongsToAnyGroup(e.id)
            }
          };
        },
        r = function(e) {
          return _.isEmpty(e) ? void TS.warn("trying to format idp_groups with empty list") : 1 == e.length ? _.head(e) : TS.i18n.t("{group_name} and {num_remaining_groups} more", "web_admin")({
            num_remaining_groups: e.length - 1,
            group_name: _.head(e)
          });
        },
        n = function(t, i) {
          var r = i.team,
            n = i.actor,
            _ = i.member;
          switch (e = e || "treatment" === TS.experiment.getGroup("guest_profiles_and_expiration"), t.name) {
            case "activate":
              return _.is_human && _.is_deleted && n.is_admin && (!r.is_paid || r.is_paid && !_.is_guest) && (!r.is_enterprise || r.is_enterprise && !_.is_guest);
            case "activate_as_guest":
              return _.is_human && _.is_deleted && !_.is_primary_owner && r.is_paid && (!r.is_enterprise || r.is_enterprise && _.is_guest || TS.boot_data.feature_enterprise_guest_conversion && r.is_enterprise && _.enabled_on_zero_teams);
            case "cant_reactivate_as_guest":
              return TS.boot_data.feature_enterprise_guest_conversion && _.is_human && _.is_deleted && !_.is_primary_owner && !_.is_guest && r.is_paid && r.is_enterprise && !_.enabled_on_zero_teams;
            case "deactivate":
              return _.is_human && !_.is_deleted && !_.is_primary_owner && !_.has_removal_restriction && (n.is_primary_owner || n.is_owner && !_.is_owner || n.is_admin && !_.is_admin);
            case "cant_deactivate":
              return _.has_removal_restriction && r.is_enterprise && _.is_human && !_.is_deleted && !_.is_primary_owner && _.only_belongs_to_this_team && (n.is_primary_owner || n.is_owner && !_.is_owner || n.is_admin && !_.is_admin);
            case "cant_convert_or_deactivate":
              return TS.boot_data.feature_enterprise_guest_conversion && _.has_removal_restriction && r.is_enterprise && _.is_human && !_.is_deleted && !_.is_primary_owner && !_.only_belongs_to_this_team && (n.is_primary_owner || n.is_owner && !_.is_owner || n.is_admin && !_.is_admin);
            case "demote_admin":
              return _.is_human && _.is_admin && !_.is_owner && !_.is_deleted && n.is_owner;
            case "demote_owner":
              return _.is_human && _.is_owner && !_.is_deleted && !_.is_primary_owner && n.is_primary_owner;
            case "promote_to_member":
              return _.is_human && _.is_guest && !_.is_deleted && (!r.is_enterprise || r.is_enterprise && _.only_belongs_to_this_team);
            case "promote_to_admin":
              return _.is_human && !_.is_deleted && !_.is_admin && !_.is_guest;
            case "promote_to_owner":
              return _.is_human && !_.is_deleted && !_.is_owner && !_.is_guest && n.is_owner;
            case "convert_to_guest":
              return _.is_human && !_.is_deleted && !_.is_guest && !_.is_admin && (!r.is_enterprise || r.is_enterprise && _.only_belongs_to_this_team);
            case "cant_convert_member_role":
              return TS.boot_data.feature_enterprise_guest_conversion && _.is_human && !_.has_removal_restriction && !_.is_deleted && r.is_paid && r.is_enterprise && !_.only_belongs_to_this_team;
            case "promote_to_mc_guest":
              return _.is_human && !_.is_deleted && _.is_single_channel_guest && r.is_paid && (!r.is_enterprise || r.is_enterprise && _.only_belongs_to_this_team);
            case "demote_to_sc_guest":
              return _.is_human && !_.is_deleted && !_.is_single_channel_guest && _.is_multi_channel_guest && r.is_paid && (!r.is_enterprise || r.is_enterprise && _.only_belongs_to_this_team);
            case "transfer_ownership":
              return n.is_primary_owner && _.is_primary_owner && r.has_other_members;
            case "activate_bot":
              return !_.is_human && _.is_deleted;
            case "configure_bot":
              return !_.is_human && _.is_configurable;
            case "disable_2fa":
              return _.is_human && _.is_2fa && !_.is_deleted && !_.is_primary_owner && (n.is_primary_owner || n.is_owner && !_.is_owner || n.is_admin && !_.is_admin);
            case "send_sso":
              return r.is_sso_enabled && !r.is_enterprise && _.is_human && !_.is_deleted && !_.is_primary_owner && (n.is_primary_owner || n.is_owner && !_.is_owner || n.is_admin && !_.is_admin);
            case "update_expiration_ts":
              return e && _.is_guest && _.is_human && !_.is_deleted;
            default:
              return TS.warn("Unrecognized member action type: " + t), !1;
          }
        };
    }();
  }
}, [2794]);
