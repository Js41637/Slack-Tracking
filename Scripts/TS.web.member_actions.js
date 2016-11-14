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
          return data.team.is_enterprise ? "Add to Team" : "Enable Account";
        },
        cls: "api_enable_account"
      },
      activate_as_guest: {
        primary: false,
        label: function(data) {
          var label = "Enable ";
          if (data.member.is_single_channel_guest) {
            label += "Single-Channel Guest";
          } else if (data.member.is_guest) {
            label += TS.templates.builders.raLabel("Restricted Account");
          } else {
            label += "Guest";
          }
          return label;
        },
        cls: "api_enable_ra"
      },
      deactivate: {
        primary: false,
        label: function(data) {
          return data.team.is_enterprise ? "Remove from Team" : "Deactivate Account";
        },
        cls: "api_disable_account"
      },
      demote_admin: {
        primary: true,
        label: "Remove Admin Privileges",
        cls: "api_remove_admin"
      },
      demote_owner: {
        primary: true,
        label: "Remove Ownership",
        cls: "api_remove_owner"
      },
      promote_to_member: {
        primary: true,
        label: "Make Full Team Member",
        cls: "api_unrestrict_account"
      },
      promote_to_admin: {
        primary: true,
        label: "Make an Admin",
        cls: "api_make_admin"
      },
      promote_to_owner: {
        primary: true,
        label: "Make an Owner",
        cls: "api_make_owner"
      },
      convert_to_guest: {
        primary: false,
        label: "Convert to Guest",
        cls: function(data) {
          return data.team.is_paid ? "admin_member_restrict_link" : "admin_member_restrict_link_unpaid";
        }
      },
      promote_to_mc_guest: {
        primary: false,
        label: function(data) {
          return "Convert to " + TS.templates.builders.raLabel("Restricted Account");
        },
        cls: "api_set_restricted"
      },
      demote_to_sc_guest: {
        primary: false,
        label: "Convert to Single-Channel Guest",
        cls: "admin_member_restrict_link_ura"
      },
      transfer_ownership: {
        primary: true,
        label: "Transfer team ownership",
        href: "/admin/transfer"
      },
      activate_bot: {
        primary: true,
        label: function(data) {
          return data.team.is_enterprise ? "Add to Team" : "Enable Account";
        },
        cls: "api_enable_bot"
      },
      configure_bot: {
        primary: false,
        label: "Configure",
        cls: "api_configure_bot",
        href: function(data) {
          return "/services/" + data.member.object.profile.bot_id;
        }
      },
      send_sso: {
        primary: false,
        label: "Send SSO binding email",
        cls: "api_sso_bind"
      },
      disable_2fa: {
        primary: false,
        label: "Disable 2FA",
        cls: "admin_member_disable_2fa_link",
        title: "Disable two-factor verification for this account"
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
        is_multi_channel_guest: member.is_restricted,
        is_configurable: member.is_bot && member.bot_can_be_configured || member.is_slackbot,
        only_belongs_to_this_team: member.enterprise_user && member.enterprise_user.teams && member.enterprise_user.teams.length <= 1
      }
    };
  };
  var _canPerform = function(action, data) {
    var team = data.team;
    var actor = data.actor;
    var member = data.member;
    switch (action.name) {
      case "activate":
        return member.is_human && member.is_deleted && actor.is_admin && (!team.is_paid || team.is_paid && !member.is_guest) && (!team.is_enterprise || team.is_enterprise && !member.is_guest);
      case "activate_as_guest":
        return member.is_human && member.is_deleted && !member.is_primary_owner && team.is_paid && (!team.is_enterprise || team.is_enterprise && member.is_guest);
      case "deactivate":
        return member.is_human && !member.is_deleted && !member.is_primary_owner && (actor.is_primary_owner || actor.is_owner && !member.is_owner || actor.is_admin && !member.is_admin);
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
      default:
        TS.warn("Unrecognized member action type: " + action);
        return false;
    }
  };
})();
