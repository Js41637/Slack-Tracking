(function() {
  "use strict";
  TS.registerModule("web.member_actions", {
    onStart: function() {
      _.map(TS.web.member_actions.actions, function(action, name) {
        TS.web.member_actions.actions[name] = _.assign(action, {
          name: name
        });
      });
    },
    actions: {
      activate: {
        primary: true,
        label: function(data) {
          return data.team.is_enterprise ? TS.i18n.t("Add to Team", "member_actions")() : TS.i18n.t("Enable Account", "member_actions")();
        },
        cls: "api_enable_account"
      },
      activate_as_guest: {
        primary: false,
        label: function(data) {
          var label = "";
          if (data.member.is_single_channel_guest) {
            label = TS.i18n.t("Enable Single-Channel Guest", "member_actions")();
          } else if (data.member.is_guest) {
            label = TS.i18n.t("Enable Multi-Channel Guest", "member_actions")();
          } else {
            label = TS.i18n.t("Enable Guest", "member_actions")();
          }
          return label;
        },
        cls: "api_enable_ra"
      },
      cant_reactivate_as_guest: {
        primary: false,
        label: function(data) {
          var formatted_member_name = TS.members.getMemberDisplayName(data.member.object, true, true);
          data = _.assign({}, data, {
            formatted_member_name: formatted_member_name,
            action: "cant_reactivate_as_guest"
          });
          return new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(data));
        },
        cls: "inline_flex no_underline"
      },
      deactivate: {
        primary: false,
        label: function(data) {
          return data.team.is_enterprise ? TS.i18n.t("Remove from Team", "member_actions")() : TS.i18n.t("Deactivate Account", "member_actions")();
        },
        cls: "api_disable_account"
      },
      cant_deactivate: {
        primary: false,
        label: function(data) {
          if (!TS.boot_data.feature_enterprise_guest_conversion) {
            return new Handlebars.SafeString(TS.i18n.t('Can’t remove or convert member <ts-icon class="very_small_left_padding ts_icon_question_circle"></ts-icon>', "member_actions")());
          }
          var formatted_member_name = TS.members.getMemberDisplayName(data.member.object, true, true);
          var group_list = _.map(TS.idp_groups.getGroupsForMember(data.member.object.id), "name");
          var formatted_group_label = _getFormattedIdpGroups(group_list);
          var idp_label = TS.utility.enterprise.getProviderLabel(_.get(TS.model, "enterprise"), _.get(TS.model, "enterprise.sso_provider.label", "single sign-on"));
          data = _.assign({}, data, {
            formatted_member_name: formatted_member_name,
            action: "cant_deactivate",
            group_list: group_list,
            idp_label: idp_label,
            formatted_group_label: formatted_group_label
          });
          return new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(data));
        },
        cls: TS.boot_data.feature_enterprise_guest_conversion ? "inline_flex no_underline" : "inline_flex no_underline api_cant_deactivate"
      },
      cant_convert_or_deactivate: {
        primary: false,
        label: function(data) {
          var formatted_member_name = TS.members.getMemberDisplayName(data.member.object, true, true);
          var group_list = _.map(TS.idp_groups.getGroupsForMember(data.member.object.id), "name");
          var formatted_group_label = _getFormattedIdpGroups(group_list);
          var idp_label = TS.utility.enterprise.getProviderLabel(_.get(TS.model, "enterprise"), _.get(TS.model, "enterprise.sso_provider.label", "single sign-on"));
          data = _.assign({}, data, {
            formatted_member_name: formatted_member_name,
            action: "cant_convert_or_deactivate",
            group_list: group_list,
            idp_label: idp_label,
            formatted_group_label: formatted_group_label
          });
          return new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(data));
        },
        cls: "inline_flex no_underline"
      },
      demote_admin: {
        primary: true,
        label: TS.i18n.t("Remove Admin Privileges", "member_actions")(),
        cls: "api_remove_admin"
      },
      demote_owner: {
        primary: true,
        label: TS.i18n.t("Remove Ownership", "member_actions")(),
        cls: "api_remove_owner"
      },
      promote_to_member: {
        primary: true,
        label: TS.i18n.t("Make Full Team Member", "member_actions")(),
        cls: "api_unrestrict_account"
      },
      promote_to_admin: {
        primary: true,
        label: TS.i18n.t("Make an Admin", "member_actions")(),
        cls: "api_make_admin"
      },
      promote_to_owner: {
        primary: true,
        label: TS.i18n.t("Make an Owner", "member_actions")(),
        cls: "api_make_owner"
      },
      convert_to_guest: {
        primary: false,
        label: TS.i18n.t("Convert to Guest", "member_actions")(),
        cls: function(data) {
          return data.team.is_paid ? "admin_member_restrict_link" : "admin_member_restrict_link_unpaid";
        }
      },
      cant_convert_member_role: {
        primary: false,
        label: function(data) {
          var formatted_member_name = TS.members.getMemberDisplayName(data.member.object, true, true);
          data = _.assign({}, data, {
            formatted_member_name: formatted_member_name,
            action: "cant_convert_member_role"
          });
          return new Handlebars.SafeString(TS.templates.admin_cant_reactivate_or_convert_list_item_label(data));
        },
        cls: "inline_flex no_underline"
      },
      promote_to_mc_guest: {
        primary: false,
        label: function() {
          return TS.i18n.t("Convert to Multi-Channel Guest", "member_actions")();
        },
        cls: "api_set_restricted"
      },
      demote_to_sc_guest: {
        primary: false,
        label: TS.i18n.t("Convert to Single-Channel Guest", "member_actions")(),
        cls: "admin_member_restrict_link_ura"
      },
      transfer_ownership: {
        primary: true,
        label: TS.i18n.t("Transfer team ownership", "member_actions")(),
        href: "/admin/transfer"
      },
      activate_bot: {
        primary: true,
        label: function(data) {
          return data.team.is_enterprise ? TS.i18n.t("Add to Team", "member_actions")() : TS.i18n.t("Enable Account", "member_actions")();
        },
        cls: "api_enable_bot"
      },
      configure_bot: {
        primary: false,
        label: TS.i18n.t("Configure", "member_actions")(),
        cls: "api_configure_bot",
        href: function(data) {
          return "/services/" + data.member.object.profile.bot_id;
        }
      },
      send_sso: {
        primary: false,
        label: TS.i18n.t("Send SSO binding email", "member_actions")(),
        cls: "api_sso_bind"
      },
      disable_2fa: {
        primary: false,
        label: TS.i18n.t("Disable 2FA", "member_actions")(),
        cls: "admin_member_disable_2fa_link",
        title: TS.i18n.t("Disable two-factor verification for this account", "member_actions")()
      },
      update_expiration_ts: {
        primary: true,
        label: function(data) {
          return _.get(data, "member.object.profile.guest_expiration_ts") ? TS.i18n.t("Adjust Time Limit", "member_actions")() : TS.i18n.t("Set a Time Limit", "member_actions")();
        },
        cls: "admin_member_update_expiration_ts",
        title: TS.i18n.t("Update expiration date for this guest", "member_actions")()
      }
    },
    getActionsForMember: function(member) {
      var data = _getData(member);
      var actions = [];
      _.each(TS.web.member_actions.actions, function(action) {
        if (_canPerform(action, data)) actions.push(_getAction(action, data));
      });
      return _.sortBy(actions, ["primary"]);
    },
    canPerformAction: function(action, member) {
      var data = _getData(member);
      return _canPerform(action, data);
    },
    test: function() {
      var test_ob = {
        _canPerform: _canPerform,
        _getAction: _getAction,
        _getData: _getData
      };
      Object.defineProperty(test_ob, "_canPerform", {
        get: function() {
          return _canPerform;
        },
        set: function(v) {
          _canPerform = v;
        }
      });
      Object.defineProperty(test_ob, "_getAction", {
        get: function() {
          return _getAction;
        },
        set: function(v) {
          _getAction = v;
        }
      });
      Object.defineProperty(test_ob, "_getData", {
        get: function() {
          return _getData;
        },
        set: function(v) {
          _getData = v;
        }
      });
      return test_ob;
    }
  });
  var _getAction = function(action, data) {
    var result = {};
    _.each(action, function(value, key) {
      result[key] = _.isFunction(value) ? value(data) : value;
    });
    return result;
  };
  var _getData = function(member) {
    if (!member) {
      return {
        team: {},
        actor: {},
        member: {}
      };
    }
    var actor = TS.model.user;
    return {
      team: {
        is_enterprise: TS.boot_data.page_needs_enterprise,
        is_paid: TS.boot_data.pay_prod_cur,
        is_over_integration_limit: TS.boot_data.over_integration_limit,
        is_sso_enabled: TS.boot_data.auth_mode !== "normal",
        has_other_members: TS.web.admin.active_members.length > 1
      },
      actor: {
        is_admin: actor.is_admin,
        is_owner: actor.is_owner,
        is_primary_owner: actor.is_primary_owner
      },
      member: {
        object: member,
        is_admin: member.is_admin,
        is_owner: member.is_owner,
        is_primary_owner: member.is_primary_owner,
        is_bot: member.is_bot,
        is_human: !member.is_bot && !member.is_slackbot,
        is_deleted: member.deleted,
        is_2fa: member.two_factor_auth_enabled,
        is_guest: member.is_restricted || member.is_ultra_restricted,
        is_single_channel_guest: member.is_ultra_restricted,
        is_multi_channel_guest: member.is_restricted && !member.is_ultra_restricted,
        is_configurable: member.is_bot && member.bot_can_be_configured || member.is_slackbot,
        only_belongs_to_this_team: member.enterprise_user && member.enterprise_user.teams && member.enterprise_user.teams.length <= 1,
        enabled_on_zero_teams: member.enterprise_user && member.enterprise_user.teams && member.enterprise_user.teams.length == 0,
        has_removal_restriction: TS.idp_groups && TS.idp_groups.memberBelongsToAnyGroup(member.id)
      }
    };
  };
  var _getFormattedIdpGroups = function(group_list) {
    if (_.isEmpty(group_list)) {
      TS.warn("trying to format idp_groups with empty list");
      return;
    }
    if (group_list.length == 1) return _.head(group_list);
    var formatted_groups = TS.i18n.t("{group_name} and {num_remaining_groups} more", "web_admin")({
      num_remaining_groups: group_list.length - 1,
      group_name: _.head(group_list)
    });
    return formatted_groups;
  };
  var _canPerform = function(action, data) {
    var team = data.team;
    var actor = data.actor;
    var member = data.member;
    _in_guest_exp_experiment_group = _in_guest_exp_experiment_group || TS.experiment.getGroup("guest_profiles_and_expiration") === "treatment";
    switch (action.name) {
      case "activate":
        return member.is_human && member.is_deleted && actor.is_admin && (!team.is_paid || team.is_paid && !member.is_guest) && (!team.is_enterprise || team.is_enterprise && !member.is_guest);
      case "activate_as_guest":
        return member.is_human && member.is_deleted && !member.is_primary_owner && team.is_paid && (!team.is_enterprise || team.is_enterprise && member.is_guest || TS.boot_data.feature_enterprise_guest_conversion && team.is_enterprise && member.enabled_on_zero_teams);
      case "cant_reactivate_as_guest":
        return TS.boot_data.feature_enterprise_guest_conversion && member.is_human && member.is_deleted && !member.is_primary_owner && !member.is_guest && team.is_paid && team.is_enterprise && !member.enabled_on_zero_teams;
      case "deactivate":
        return member.is_human && !member.is_deleted && !member.is_primary_owner && !member.has_removal_restriction && (actor.is_primary_owner || actor.is_owner && !member.is_owner || actor.is_admin && !member.is_admin);
      case "cant_deactivate":
        return member.has_removal_restriction && team.is_enterprise && member.is_human && !member.is_deleted && !member.is_primary_owner && member.only_belongs_to_this_team && (actor.is_primary_owner || actor.is_owner && !member.is_owner || actor.is_admin && !member.is_admin);
      case "cant_convert_or_deactivate":
        return TS.boot_data.feature_enterprise_guest_conversion && member.has_removal_restriction && team.is_enterprise && member.is_human && !member.is_deleted && !member.is_primary_owner && !member.only_belongs_to_this_team && (actor.is_primary_owner || actor.is_owner && !member.is_owner || actor.is_admin && !member.is_admin);
      case "demote_admin":
        return member.is_human && member.is_admin && !member.is_owner && !member.is_deleted && actor.is_owner;
      case "demote_owner":
        return member.is_human && member.is_owner && !member.is_deleted && !member.is_primary_owner && actor.is_primary_owner;
      case "promote_to_member":
        return member.is_human && member.is_guest && !member.is_deleted && (!team.is_enterprise || team.is_enterprise && member.only_belongs_to_this_team);
      case "promote_to_admin":
        return member.is_human && !member.is_deleted && !member.is_admin && !member.is_guest;
      case "promote_to_owner":
        return member.is_human && !member.is_deleted && !member.is_owner && !member.is_guest && actor.is_owner;
      case "convert_to_guest":
        return member.is_human && !member.is_deleted && !member.is_guest && !member.is_admin && (!team.is_enterprise || team.is_enterprise && member.only_belongs_to_this_team);
      case "cant_convert_member_role":
        return TS.boot_data.feature_enterprise_guest_conversion && member.is_human && !member.has_removal_restriction && !member.is_deleted && team.is_paid && team.is_enterprise && !member.only_belongs_to_this_team;
      case "promote_to_mc_guest":
        return member.is_human && !member.is_deleted && member.is_single_channel_guest && team.is_paid && (!team.is_enterprise || team.is_enterprise && member.only_belongs_to_this_team);
      case "demote_to_sc_guest":
        return member.is_human && !member.is_deleted && !member.is_single_channel_guest && member.is_multi_channel_guest && team.is_paid && (!team.is_enterprise || team.is_enterprise && member.only_belongs_to_this_team);
      case "transfer_ownership":
        return actor.is_primary_owner && member.is_primary_owner && team.has_other_members;
      case "activate_bot":
        return !member.is_human && member.is_deleted;
      case "configure_bot":
        return !member.is_human && member.is_configurable;
      case "disable_2fa":
        return member.is_human && member.is_2fa && !member.is_deleted && !member.is_primary_owner && (actor.is_primary_owner || actor.is_owner && !member.is_owner || actor.is_admin && !member.is_admin);
      case "send_sso":
        return team.is_sso_enabled && !team.is_enterprise && member.is_human && !member.is_deleted && !member.is_primary_owner && (actor.is_primary_owner || actor.is_owner && !member.is_owner || actor.is_admin && !member.is_admin);
      case "update_expiration_ts":
        return _in_guest_exp_experiment_group && member.is_guest && member.is_human && !member.is_deleted;
      default:
        TS.warn("Unrecognized member action type: " + action);
        return false;
    }
  };
  var _in_guest_exp_experiment_group;
})();
