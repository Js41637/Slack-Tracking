(function() {
  "use strict";
  TS.registerModule("ui.admin_invites", {
    invites_sent_sig: new signals.Signal,
    emails_parsed_sig: new signals.Signal,
    onStart: function() {
      TS.ui.admin_invites.invites_sent_sig.add(_invitesSent, TS.ui.admin_invites);
      TS.ui.admin_invites.emails_parsed_sig.add(_emailsParsed, TS.ui.admin_invites);
      TS.team.team_email_domain_changed_sig.add(_setPlaceholderEmailAddress, TS.ui.admin_invites);
      TS.prefs.team_auth_mode_changed_sig.add(_applySSORestrictions, TS.ui.admin_invites);
      TS.prefs.team_sso_auth_restrictions_changed_sig.add(_applySSORestrictions, TS.ui.admin_invites);
      TS.prefs.team_invites_only_admins_changed_sig.add(TS.ui.admin_invites.maybeShowInviteLink, TS.ui.admin_invites);
      if (TS.web) TS.web.login_sig.add(TS.ui.admin_invites.onLogin, TS.ui.admin_invites);
      if (TS.client) TS.client.login_sig.add(TS.ui.admin_invites.onLogin, TS.ui.admin_invites);
      _unprocessed_invites = TS.storage.fetchInvitesState();
      $("body").on("click", '[data-action="admin_invites_modal"]', function() {
        if (TS.isPartiallyBooted()) return;
        var options = {};
        if ($(this).data("account-type")) options.account_type = $(this).data("account-type");
        _start(options);
      });
    },
    onLogin: function() {
      _setPlaceholderEmailAddress();
    },
    start: function(options) {
      if (TS.isPartiallyBooted()) return;
      if (_canInvite()) _start(options);
    },
    switchToPicker: function() {
      if (_canInvite()) _switchToPicker();
    },
    maybeShowInviteLink: function() {
      if (!TS.client) return;
      var show_invite_link = false;
      var dim_invite_link = false;
      if (_canInvite() && TS.members.getActiveMembersWithSelfAndNotSlackbot().length < 26) {
        show_invite_link = true;
      }
      if (_canInvite() && TS.members.getActiveMembersWithSelfAndNotSlackbot().length >= 2) {
        dim_invite_link = true;
      }
      $("#channel_list_invites_link").toggleClass("hidden", !show_invite_link).toggleClass("dim", dim_invite_link);
    },
    populateInvites: function(invites) {
      if (!_canInvite()) return;
      if (!invites) return;
      var invites_map = _unprocessed_invites.reduce(function(accumulator, invite) {
        accumulator[invite.email] = true;
        return accumulator;
      }, {});
      invites.forEach(function(invite) {
        if (!invites_map[invite.email]) {
          invites_map[invite.email] = true;
          _unprocessed_invites.push(invite);
        }
      });
      TS.storage.storeInvitesState(_unprocessed_invites);
      if (_unprocessed_invites.length && TS.ui.fs_modal.is_showing) {
        _$div.find(".admin_invite_row").remove();
        _unprocessed_invites.forEach(function(invite) {
          _addRow(invite);
        });
      }
    },
    canInvite: function() {
      return _canInvite();
    },
    test: function() {
      var test_ob = {
        _error_map: _error_map,
        _getError: _getError
      };
      Object.defineProperty(test_ob, "_getError", {
        get: function() {
          return _getError;
        },
        set: function(v) {
          _getError = v;
        }
      });
      Object.defineProperty(test_ob, "_error_map", {
        get: function() {
          return _error_map;
        },
        set: function(v) {
          _error_map = v;
        }
      });
      return test_ob;
    }
  });
  var _$div;
  var _row_index = 0;
  var _queue_size = 0;
  var _success_invites = [];
  var _error_invites = [];
  var _unprocessed_invites = [];
  var _placeholder_email_address_default = TS.i18n.t("name@example.com", "invite")();
  var _placeholder_email_address = _placeholder_email_address_default;
  var _new_email_domains = "";
  var _custom_message = "";
  var _initial_channel_id;
  var _selected_exp_date_unix_ts;
  var _DEFAULT_GUEST_DURATION_DAYS = 7;
  var _DATE_PICKER_TARGET_SELECTOR = "#admin_invites_show_date_picker";
  var _google_contacts_data;
  var _btn_connect_contacts;
  var _google_auth_instance_id;
  var _cancel_google_auth_polling;
  var _event_family_name = "INVITEMODAL";
  var _clog_name = _event_family_name + "_ACTION";
  var _NUM_INVITES = 3;
  var _in_modal_3_fields_group = false;
  var _error_map = {
    url_in_message: TS.i18n.t("Sorry, but URLs are not allowed in the custom message. Please remove it and try again!", "invite")(),
    invalid_email: TS.i18n.t("That doesn’t look like a valid email address!", "invite")(),
    already_in_team: TS.i18n.t("This person is already on your team.", "invite")(),
    user_disabled: function() {
      var deactivated_user = TS.i18n.t('This person is already on your team, but their account is deactivated. You can <a href="{url}#disabled">manage</a> their account.', "invite")({
        url: TS.model.team_url
      });
      return deactivated_user;
    },
    already_invited: TS.i18n.t("This person has already been invited to your team.", "invite")(),
    sent_recently: TS.i18n.t("This person was recently invited. No need to invite them again just yet.", "invite")(),
    invite_failed: TS.i18n.t("Something went wrong with this invite :(", "invite")(),
    ura_limit_reached: TS.i18n.t("You’ve reached your team limit for Single-channel Guests. You must invite more paid team members first.", "invite")(),
    user_limit_reached: TS.i18n.t("You’ve reached the maximum number of users for this team.", "invite")(),
    not_allowed: TS.i18n.t("You can’t invite this type of account based on your current SSO settings.", "invite")(),
    custom_message_not_allowed: TS.i18n.t("Sorry, you can’t add a custom message to this invite. Please remove it and try again!", "invite")(),
    domain_mismatch: TS.i18n.t("Your SSO settings prevent you from inviting people from this email domain.", "invite")(),
    invite_limit_reached: TS.i18n.t("You’ve exceeded the limit on invitations. Once more people have accepted the ones you’ve sent, you can send more. Revoking invitations will not lift the limit. Our Help Center has <a href='https://get.slack.help/hc/articles/201330256#invitation_limits'>more details on invitation limits</a>.", "invite")(),
    too_long: TS.i18n.t("This person’s name exceeds the 35-character limit.", "invite")(),
    org_user_is_disabled: TS.i18n.t("This person has a deactivated account for your organization.", "invite")(),
    org_user_is_disabled_but_present: TS.i18n.t("This person is already on your team, but they have been deactivated by your organization. Contact an organization administrator to re-enable their account", "invite")(),
    mismatch_with_pending_team_invite: function(data) {
      var account_type;
      switch (data.user_type) {
        case "ultra_restricted":
          account_type = TS.i18n.t("Single-Channel Guest", "invite")();
          break;
        case "restricted":
          account_type = TS.i18n.t("Multi-Channel Guest", "invite")();
          break;
        default:
          account_type = TS.i18n.t("full Team Member", "invite")();
          break;
      }
      return TS.i18n.t("This person can’t be invited, because they have already been invited as a {account_type} to your organization", "invite")({
        account_type: account_type
      });
    },
    user_type_mismatch: function(data) {
      var account_type;
      var message;
      switch (data.issue) {
        case "org_user_is_restricted":
          account_type = TS.i18n.t("Multi-Channel Guest", "invite")();
          break;
        case "org_user_is_ultra_restricted":
          account_type = TS.i18n.t("Single-Channel Guest", "invite")();
          break;
        case "org_user_not_restricted":
        case "org_user_not_ultra_restricted":
          account_type = TS.i18n.t("full Team Member", "invite")();
          break;
      }
      if (_.isUndefined(account_type)) {
        message = TS.i18n.t("This person already has an account for your organization", "invite")();
      } else {
        message = TS.i18n.t("This person already has a {account_type} account for your organization, so you can only invite them in that role.", "invite")({
          account_type: account_type
        });
      }
      return message;
    }
  };
  var _start = function(options) {
    var account_type;
    _selected_exp_date_unix_ts = null;
    if (TS.experiment.getGroup("modal_3_fields") === "modal_3_fields" || TS.experiment.getGroup("modal_3_fields_existing_teams") === "modal_3_fields") {
      _in_modal_3_fields_group = true;
    }
    if (_shouldSeeAccountTypeOptions()) {
      if (options && options.account_type) {
        account_type = options.account_type;
      }
    } else {
      account_type = "full";
    }
    if (options && options.initial_channel_id) {
      _initial_channel_id = options.initial_channel_id;
    }
    var body_template_html = TS.templates.admin_invite_modal({
      can_add_ura: TS.model.can_add_ura,
      team_name: TS.model.team.name,
      team_in_org: TS.model.team.enterprise_id,
      hide_full_member_option: TS.utility.invites.hideFullMemberInviteOption(),
      team_signup_url: "https://" + TS.model.team.domain + ".slack.com/signup",
      invites_limit: TS.model.team.plan === "" && TS.model.team.prefs.invites_limit,
      show_custom_message: TS.model.team.plan,
      is_paid_team: TS.model.team.plan
    });
    var settings = {
      body_template_html: body_template_html,
      onShow: _onShow,
      onCancel: _onCancel,
      clog_name: "INVITEMODAL"
    };
    if (TS.client) TS.ui.a11y.saveCurrentFocus();
    TS.ui.fs_modal.start(settings);
    if (account_type) {
      setTimeout(function() {
        _switchAccountType(account_type);
      }, 0);
    }
  };
  var _onShow = function() {
    var $custom_message_container;
    _$div = $("#admin_invites_container");
    _$div.find("#admin_invites_switcher").on("click", '[data-action="switch_type"]', function(e) {
      var $el = $(e.target);
      if ($el.is("a")) return;
      if ($el.closest(".admin_invites_account_type_option").hasClass("disabled")) return;
      _switchAccountType($(this).data("account-type"));
    });
    _$div.find('[data-action="admin_invites_add_row"]').on("click", _addRow);
    _$div.find('a[data-action="admin_invites_switch_view"]').on("click", function() {
      _switchInviteView($(this).data("view"));
    });
    _$div.find('button[data-action="api_send_invites"]').on("click", function(e) {
      e.preventDefault();
      _send();
    });
    _$div.find('button[data-action="api_parse_emails"]').on("click", function(e) {
      e.preventDefault();
      _parseEmails();
      $(this).find(".ladda-label").text(TS.i18n.t("Processing email addresses ...", "invite")());
    });
    $custom_message_container = _$div.find(".admin_invites_custom_message_container");
    _setupGoogleContactsButton();
    _setupInviteSingleChannelGuestsButton();
    _$div.find('a[data-action="admin_invites_show_custom_message"]').on("click", function() {
      _showCustomMessage();
    });
    _$div.find('[data-action="admin_invites_hide_custom_message"]').on("click", function() {
      _hideCustomMessage();
    }).hover(function() {
      $custom_message_container.addClass("delete_highlight");
    }, function() {
      $custom_message_container.removeClass("delete_highlight");
    });
    _$div.find("#admin_invite_custom_message").on("input", _updateSubmitButtonBasedOnCustomMessage);
    _$div.find("#bulk_emails").css("overflow", "hidden").autogrow();
    _unprocessed_invites = TS.storage.fetchInvitesState();
    if (_unprocessed_invites.length) {
      TS.ui.admin_invites.populateInvites(_unprocessed_invites);
    } else {
      _addRow();
    }
    if (_in_modal_3_fields_group) {
      var current_num_of_invite_rows = _$div.find(".admin_invite_row").length;
      if (current_num_of_invite_rows < _NUM_INVITES) {
        var num_of_rows_to_add = _NUM_INVITES - current_num_of_invite_rows;
        _.times(num_of_rows_to_add, _addRow);
      }
    }
  };
  var _onCancel = function() {
    _row_index = 0;
    _queue_size = 0;
    _unprocessed_invites = _error_invites.length ? [] : _prepareInvites();
    _success_invites = [];
    _error_invites = [];
    _clearInitialChannelId();
    if (TS.experiment.getGroup("guest_profiles_and_expiration") === "treatment") _destroyDatePicker();
    if (_cancel_google_auth_polling) _cancel_google_auth_polling();
    TS.storage.storeInvitesState(_unprocessed_invites);
    if (TS.client) TS.ui.a11y.restorePreviousFocus();
  };
  var _setPlaceholderEmailAddress = function() {
    _placeholder_email_address = _placeholder_email_address_default;
  };
  var _setupInviteSingleChannelGuestsButton = function() {
    if (!TS.model.team.plan) return _updateInviteSingleChannelGuestsButton(false);
    TS.api.callImmediately("users.admin.canAddUltraRestricted").then(function(resp) {
      _updateInviteSingleChannelGuestsButton(resp.data.ok);
    }, function(error) {
      _updateInviteSingleChannelGuestsButton(false);
    });
  };
  var _updateInviteSingleChannelGuestsButton = function(can_add_ura) {
    TS.model.can_add_ura = can_add_ura;
    var btn_ultra_restricted = $('.admin_invites_account_type_option[data-account-type="ultra_restricted"]');
    btn_ultra_restricted.toggleClass("disabled", !TS.model.can_add_ura);
    if (!TS.model.can_add_ura) {
      var ultra_restricted_hover = $(".account_type_disabled_hover", btn_ultra_restricted);
      ultra_restricted_hover.removeClass("hidden");
    }
  };
  var _setupGoogleContactsButton = function() {
    _btn_connect_contacts = document.getElementById("btn_connect_contacts");
    if (!_btn_connect_contacts) return;
    _btn_connect_contacts.addEventListener("click", _onConnectContactsClicked);
    _google_auth_instance_id = TS.model.user.id + Date.now();
    TS.google_auth.getAuthLink(_google_auth_instance_id).then(function() {
      TS.utility.disableElement(_btn_connect_contacts, false);
    });
  };
  var _onConnectContactsClicked = function() {
    TS.google_auth.getAuthLink(_google_auth_instance_id).then(function(url) {
      var window_features = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,width=600,height=500";
      var window_ref = window.open(url, "auth_window", window_features);
      _startPollingGoogleAuth(window_ref);
    });
  };
  var _startPollingGoogleAuth = function(window_ref) {
    _cancel_google_auth_polling = TS.google_auth.pollForAuthStatus(_google_auth_instance_id, _googleAuthedCallback, window_ref).cancel;
  };
  var _googleAuthedCallback = function(did_auth) {
    _cancel_google_auth_polling = null;
    if (did_auth) {
      var connection_text = TS.i18n.t("Google contacts connected", "invite")();
      _$div.find(".btn_connect_contacts_text").text(connection_text);
      _btn_connect_contacts.removeEventListener("click", _onConnectContactsClicked);
      TS.clog.track(_clog_name, {
        action: "google_auth_success",
        trigger: "user_allowed_access"
      });
      _setupFilterSelectForConnectedContacts();
    }
  };
  var _setupFilterSelectForConnectedContacts = function() {
    var opts = {
      page: 1,
      count: 1e3
    };
    TS.google_auth.getContactList(_google_auth_instance_id, opts).then(function(data) {
      var empty_rows = $("input.email_field").filter(function() {
        return !this.value;
      });
      if (empty_rows.length === 0) _addRow();
      _startFilterSelectForEmailAddresses(data);
    });
  };
  var _startFilterSelectForEmailAddresses = function(contact_data) {
    if (!contact_data) return;
    _google_contacts_data = _google_contacts_data || contact_data.items;
    $("input.email_field").lazyFilterSelect({
      approx_item_height: 50,
      data: _google_contacts_data,
      single: true,
      placeholder_text: TS.i18n.t("name@example.com", "invite")(),
      onReady: function() {
        _upsertEmailContactsData(this);
      },
      filter: function(item, query) {
        query = query.toLowerCase();
        if (item.full_name) var item_full_name = item.full_name.toLowerCase();
        if (item.email) var item_email = item.email.toLowerCase();
        return item_full_name && item_full_name.indexOf(query) !== -1 || item_email && item_email.indexOf(query) !== -1;
      },
      noResultsTemplate: function(query) {
        var no_results = TS.i18n.t("None of your Google contacts match <strong>{query}</strong>", "invite")({
          query: TS.utility.htmlEntities(query)
        });
        return no_results;
      },
      onItemAdded: function(item) {
        _upsertEmailContactsData(this, item);
        TS.clog.track(_clog_name, {
          action: "add_google_email",
          trigger: "select_google_contact_from_dropdown"
        });
      },
      onInputFocus: function() {
        $(".ts_tip_tip").remove();
        $(".lazy_filter_select").removeClass("ts_tip ts_tip_top ts_tip_float ts_tip_multiline ts_tip_delay_1000");
      },
      onInputBlur: function() {
        _upsertEmailContactsData(this);
      },
      template: function(item) {
        var html = TS.templates.admin_invite_filter_select_contact({
          contact: item
        });
        return new Handlebars.SafeString(html);
      }
    }).addClass("hidden");
    if (contact_data.items !== undefined) {
      var tooltip_text = TS.i18n.t("Type here to search your Google contacts", "invite")();
      var tooltip = '<span class="ts_tip_tip"><span class="ts_tip_multiline_inner">' + tooltip_text + "</span></span>";
      if (_in_modal_3_fields_group) {
        var $first_empty_row = $("input.email_field").filter(function() {
          return !this.value;
        }).first();
        $first_empty_row.lazyFilterSelect("container").addClass("ts_tip ts_tip_top ts_tip_float ts_tip_multiline ts_tip_delay_1000").append(tooltip);
      } else {
        $("input.email_field:last").lazyFilterSelect("container").addClass("ts_tip ts_tip_top ts_tip_float ts_tip_multiline ts_tip_delay_1000").append(tooltip);
      }
    }
  };
  var _upsertEmailContactsData = function(elem, item) {
    var current_invite_email = elem.$container[0];
    var current_invite_row = $(current_invite_email).parents(".admin_invite_row");
    if (item) {
      $(current_invite_row).find("input[name*=first_name]").val(item.given_name);
      $(current_invite_row).find("input[name*=last_name]").val(item.family_name);
      $(current_invite_row).find("input[name*=email_address]").val(item.email);
    } else {
      var custom_input_email = $(current_invite_row).find("input.lfs_input").val();
      var existing_email = $(current_invite_row).find("input[name*=email_address]").val();
      if (custom_input_email) {
        $(current_invite_row).find("input.email_field").lazyFilterSelect("clearValue");
        $(current_invite_row).find("input[name*=email_address]").val(custom_input_email);
      } else if (existing_email) {
        $(current_invite_row).find("input.lfs_input").val(existing_email);
      }
    }
  };
  var _addRow = function(email) {
    var show_delete_btn = true;
    if (_$div.find(".admin_invite_row").length === 0) {
      show_delete_btn = false;
    } else {
      _$div.find(".admin_invite_row").first().find(".delete_row").removeClass("hidden");
    }
    _$div.find("#invite_rows").append(TS.templates.admin_invite_row({
      index: _row_index,
      show_delete_btn: show_delete_btn,
      placeholder_email_address: _placeholder_email_address
    }));
    var $row = _$div.find("#invite_" + _row_index);
    $row.find('[data-action="admin_invites_delete_row"]').on("click", function() {
      _removeRow($row);
    }).hover(function() {
      $row.addClass("delete_highlight");
    }, function() {
      $row.removeClass("delete_highlight");
    });
    $row.find('[name="email_address"]').focus();
    if (email) {
      $row.find('[name="email_address"]').val(email.email);
      $row.find(".lfs_input_container input.lfs_input").val(email.email);
      if (TS.boot_data.feature_name_tagging_client) {
        $row.find('[name="full_name"]').val(email.full_name);
      } else {
        $row.find('[name="first_name"]').val(email.first_name);
        $row.find('[name="last_name"]').val(email.last_name);
      }
    }
    if (!_in_modal_3_fields_group) {
      _updateSendButtonLabel();
    }
    if (TS.google_auth.isAuthed(_google_auth_instance_id) && _google_contacts_data) {
      _startFilterSelectForEmailAddresses(_google_contacts_data);
    }
    _row_index++;
  };
  var _showInfoMessage = function(message_class, html) {
    _$div.find("#invite_notice").toggleClass("alert_warning", message_class === "alert_warning").toggleClass("alert_info", message_class === "alert_info").toggleClass("alert_error", message_class === "alert_error").html(html).slideDown(100);
  };
  var _showCustomMessage = function() {
    _$div.find(".admin_invites_hide_custom_message").addClass("hidden");
    _$div.find(".admin_invites_show_custom_message").removeClass("hidden");
    _updateSubmitButtonBasedOnCustomMessage();
  };
  var _hideCustomMessage = function() {
    _$div.find(".admin_invites_hide_custom_message").removeClass("hidden");
    _$div.find(".admin_invites_show_custom_message").addClass("hidden");
    _updateSubmitButtonBasedOnCustomMessage();
  };
  var _updateSubmitButtonBasedOnCustomMessage = function() {
    var custom_message = _$div.find("#admin_invite_custom_message").val().trim();
    var $show_custom_message = _$div.find(".admin_invites_show_custom_message");
    var disable_submit_btn = !!TS.utility.findUrls(custom_message).length && !$show_custom_message.hasClass("hidden");
    _shouldDisableSubmitButton(disable_submit_btn);
  };
  var _shouldDisableSubmitButton = function(should_disable) {
    _$div.find("#admin_invites_submit_btn").toggleClass("disabled", should_disable);
  };
  var _removeRow = function($row) {
    if (!$row || !$row.length) return;
    $row.slideToggle(100, function() {
      $row.remove();
      var row_count = $(".admin_invite_row").length;
      if (row_count === 0) {
        _addRow();
      } else if (row_count === 1) {
        _$div.find(".admin_invite_row").first().find(".delete_row").addClass("hidden");
      }
      if (!_in_modal_3_fields_group) {
        _updateSendButtonLabel();
      }
    });
  };
  var _updateSendButtonLabel = function() {
    var invite_count = $(".admin_invite_row").length;
    var account_type = $("#account_type").val();
    var label;
    if (account_type == "full") {
      if (_in_modal_3_fields_group) {
        label = TS.i18n.t("Send Invitations", "invite")();
      } else {
        label = TS.i18n.t("{invite_count,plural,=1{Invite 1 Person}other{Invite {invite_count} People}}", "invite")({
          invite_count: invite_count
        });
      }
    } else if (account_type == "restricted") {
      if (_in_modal_3_fields_group) {
        label = TS.i18n.t("Invite Multi-Channel Guests", "invite")();
      } else {
        label = TS.i18n.t("{invite_count,plural,=1{Invite 1 Multi-Channel Guest}other{Invite {invite_count} Multi-Channel Guests}}", "invite")({
          invite_count: invite_count
        });
      }
    } else if (account_type == "ultra_restricted") {
      if (_in_modal_3_fields_group) {
        label = TS.i18n.t("Invite Single-Channel Guests", "invite")();
      } else {
        label = TS.i18n.t("{invite_count,plural,=1{Invite 1 Single-Channel Guest}other{Invite {invite_count} Single-Channel Guests}}", "invite")({
          invite_count: invite_count
        });
        if ($("#ultra_restricted_channel_picker").val()) {
          var ultra_restricted_channel = $("#ultra_restricted_channel_picker")[0].options[$("#ultra_restricted_channel_picker")[0].selectedIndex].text;
          label = TS.i18n.t("{invite_count,plural,=1{Invite 1 Single-Channel Guest to {ultra_restricted_channel}}other{Invite {invite_count} Single-Channel Guests to {ultra_restricted_channel}}}", "invite")({
            invite_count: invite_count,
            ultra_restricted_channel: ultra_restricted_channel
          });
        }
      }
    }
    _$div.find('button[data-action="api_send_invites"]').find(".ladda-label").text(label);
  };
  var _clearInitialChannelId = function() {
    _initial_channel_id = undefined;
  };
  var _applySSORestrictions = function() {
    var invite_type = _$div.find("#account_type").val();
    var show_google_auth_email_domain_notice = false;
    var has_sso_auth_mode = TS.model.team.prefs.auth_mode === "google" || TS.model.team.prefs.auth_mode === "saml";
    var show_sso_signup_notice = false;
    var team_in_enterprise_org = TS.boot_data.page_needs_enterprise;
    var sso_signup_notice_msg = "";
    if (team_in_enterprise_org && invite_type === "full" || has_sso_auth_mode && TS.model.team.prefs.sso_auth_restrictions === 0) {
      show_sso_signup_notice = true;
      var account_type = TS.utility.enterprise.getProviderLabel(TS.model.enterprise, _.get(TS.model, "enterprise.sso_provider.label", "single sign-on"));
      sso_signup_notice_msg = TS.i18n.t("Only people with {account_type} accounts will be able to accept invitations.", "invite")({
        account_type: account_type
      });
    }
    if (TS.model.team.prefs.auth_mode == "google") {
      if (invite_type == "full" && (TS.model.team.prefs.sso_auth_restrictions === 0 || TS.model.team.prefs.sso_auth_restrictions === 1)) {
        show_google_auth_email_domain_notice = true;
      } else if ((invite_type == "restricted" || invite_type == "ultra_restricted") && TS.model.team.prefs.sso_auth_restrictions === 0) {
        show_google_auth_email_domain_notice = true;
      }
    } else if (TS.model.team.prefs.auth_mode == "saml") {
      if (TS.model.team.prefs.sso_auth_restrictions === 0 || TS.model.team.prefs.sso_auth_restrictions === 1) {
        if (invite_type == "full") {
          if (!team_in_enterprise_org) {
            var admin_invites_switcher_html = TS.templates.admin_invite_switcher({
              can_add_ura: TS.model.can_add_ura,
              hide_full_member_option: TS.utility.invites.hideFullMemberInviteOption(),
              team_signup_url: "https://" + TS.model.team.domain + ".slack.com/signup",
              team_in_org: TS.model.team.enterprise_id
            });
            $("#admin_invites_switcher").html(admin_invites_switcher_html);
            _switchToPicker();
          }
        }
      }
    }
    $("#google_auth_email_domain_notice").toggleClass("hidden", !show_google_auth_email_domain_notice);
    $("#sso_signup_notice").html(sso_signup_notice_msg).toggleClass("hidden", !show_sso_signup_notice);
  };
  var _selectRow = function(email) {
    var $row;
    _$div.find('input[name="email_address"]').each(function() {
      if ($(this).val() == email) {
        $row = $(this).closest(".admin_invite_row");
      }
    });
    return $row;
  };
  var _rowError = function($row, error_obj) {
    if (!_.isObject(error_obj)) TS.error("_rowError did not receive an error object: ", error_obj);
    var error_msg = _getError(error_obj);
    if ($row) {
      $row.find("label.email").addClass("error").end().find(".error_msg").removeClass("hidden").html(error_msg);
      if (error_obj.error === "too_long") $row.find("label").addClass("error");
    }
  };
  var _rowValid = function($row) {
    if ($row) {
      $row.find("label").removeClass("error").end().find(".error_msg").addClass("hidden");
    }
  };
  var _resetIndividualForm = function() {
    setTimeout(function() {
      Ladda.stopAll();
      _$div.find(".admin_invite_row").remove();
      _success_invites = [];
      _error_invites = [];
      _updateSendButtonLabel();
      if (_in_modal_3_fields_group) {
        _.times(_NUM_INVITES, _addRow);
      } else {
        _addRow();
      }
    }, 0);
  };
  var _resetBulkForm = function() {
    setTimeout(function() {
      Ladda.stopAll();
      _$div.find('button[data-action="api_parse_emails"]').find(".ladda-label").text(TS.i18n.t("Add Invitees", "invite")());
      _$div.find("#bulk_emails").prop("disabled", false);
    }, 0);
  };
  var _switchToPicker = function() {
    _$div.find("#admin_invites_header").find(".admin_invites_header_type").removeClass("normal").text("people").end().find(".admin_invites_header_team_name").removeClass("hidden");
    _$div.find("#admin_invites_switcher").removeClass("hidden");
    _$div.find("#admin_invites_workflow").addClass("hidden");
    TS.ui.fs_modal.hideBackButton();
  };
  var _switchInviteView = function(view) {
    if (view == "individual") {
      _$div.find("#individual_invites").removeClass("hidden");
      _$div.find("#bulk_invites, #bulk_notice").addClass("hidden");
      _$div.find("#bulk_emails").val("");
      _$div.find(".email_field").first().focus();
      _$div.find(".invite_modal_options_container").removeClass("hidden");
      _resetBulkForm();
    } else if (view == "bulk") {
      _$div.find("#bulk_invites").removeClass("hidden");
      _$div.find("#individual_invites").addClass("hidden");
      _$div.find(".invite_modal_options_container").addClass("hidden");
      var $bulk_submit_btn = _$div.find('button[data-action="api_parse_emails"]');
      if (!$bulk_submit_btn.hasClass("ladda")) {
        Ladda.bind('button[data-action="api_parse_emails"]');
        $bulk_submit_btn.addClass("ladda");
      }
      $bulk_submit_btn.find(".ladda-label").text(TS.i18n.t("Add Invitees", "invite")());
      var invites = _prepareInvites();
      if (invites) {
        var invites_bulk = "";
        $.each(invites, function(index, invite) {
          if (invite.first_name) invites_bulk += invite.first_name + " ";
          if (invite.last_name) invites_bulk += invite.last_name + " ";
          invites_bulk += "<" + invite.email + ">, ";
        });
        _$div.find("#bulk_emails").val(invites_bulk).autogrow();
      }
      _$div.find("#bulk_emails").focus();
    }
  };
  var _switchAccountType = function(invite_type) {
    var default_channels = [];
    var channels = TS.channels.getUnarchivedChannelsForUser();
    if (_.isArray(TS.model.team.prefs.default_channels)) {
      channels.forEach(function(channel) {
        if (TS.model.team.prefs.default_channels.indexOf(channel.id) !== -1) {
          channel.is_default = true;
          default_channels.push(channel);
        }
      });
    }
    var general_channel = TS.channels.getGeneralChannel();
    var general_channel_name = "";
    if (general_channel) {
      general_channel_name = general_channel.name;
      if (!default_channels.length) default_channels.push(general_channel);
    }
    var template_args = {
      invite_type: invite_type,
      channels: channels,
      default_channels: default_channels,
      general_name: general_channel_name,
      groups: TS.groups.getUnarchivedGroups(),
      email_domains: TS.model.team.email_domain.split(","),
      is_admin: TS.model.user.is_admin,
      initial_channel_id: _initial_channel_id
    };
    var channel_picker_html = TS.templates.admin_invite_channel_picker(template_args);
    var invite_type_label = TS.i18n.t("Team Members", "invite")();
    if (invite_type == "restricted") {
      invite_type_label = TS.i18n.t("Multi-Channel Guests", "invite")();
    } else if (invite_type == "ultra_restricted") {
      invite_type_label = TS.i18n.t("Single-Channel Guests", "invite")();
    }
    _$div.find("#admin_invites_header").find(".admin_invites_header_type").addClass("normal").text(invite_type_label).end().find(".admin_invites_header_team_name").addClass("hidden");
    _$div.find("#admin_invites_channel_picker_container").html(channel_picker_html);
    _$div.find("#account_type").val(invite_type);
    _$div.find("#admin_invites_switcher, #admin_invites_workflow").toggleClass("hidden");
    _$div.find("#admin_invites_billing_notice").toggleClass("hidden", !(TS.model.team.plan !== "" && invite_type != "ultra_restricted"));
    _$div.find("#ura_warning").toggleClass("hidden", invite_type != "restricted" && invite_type != "ultra_restricted");
    _$div.find("#invite_notice").hide();
    if (TS.experiment.getGroup("guest_profiles_and_expiration") === "treatment") {
      _$div.find(".admin_invites_guest_expiration_date_container").toggleClass("hidden", invite_type === "full");
      _$div.find(_DATE_PICKER_TARGET_SELECTOR).on("click", _showDatePicker);
    }
    _$div.find("#ultra_restricted_channel_picker").on("change", function() {
      _updateSendButtonLabel();
      _clearInitialChannelId();
    });
    _$div.find(".email_field").first().focus();
    var $submit_btn = _$div.find('button[data-action="api_send_invites"]');
    if (!$submit_btn.hasClass("ladda")) {
      Ladda.bind('button[data-action="api_send_invites"]');
      $submit_btn.addClass("ladda");
    }
    _updateSendButtonLabel();
    _applySSORestrictions();
    _$div.find("#defaultchannelsmulti, #ultra_restricted_channel_picker").lazyFilterSelect({
      onItemRemoved: function(item) {
        if (item.value == _initial_channel_id) {
          _clearInitialChannelId();
        }
      }
    }).addClass("hidden");
    if (_shouldSeeAccountTypeOptions()) {
      TS.ui.fs_modal.bindBackButton(TS.ui.admin_invites.switchToPicker);
      TS.ui.fs_modal.showBackButton();
    }
  };
  var _showDatePicker = function() {
    var today = new Date;
    var default_exp_date = new Date;
    default_exp_date.setHours(0, 0, 0, 0);
    default_exp_date.setDate(today.getDate() + _DEFAULT_GUEST_DURATION_DAYS);
    var today_ts = today.getTime();
    var default_exp_date_ts = _selected_exp_date_unix_ts ? _selected_exp_date_unix_ts * 1e3 : default_exp_date.getTime();
    TS.ui.date_picker.start($(_DATE_PICKER_TARGET_SELECTOR), {
      first_day: TS.i18n.start_of_the_week[TS.i18n.locale()] || 0,
      select_year: false,
      min: today_ts,
      date: default_exp_date_ts,
      format: "s",
      position: "top",
      class_name: "admin_invites_datepicker",
      flat: true,
      hide_on_select: true,
      locale: {
        days: TS.utility.date.day_names,
        daysShort: TS.utility.date.short_day_names,
        daysMin: TS.utility.date.really_short_day_names,
        months: TS.utility.date.month_names,
        monthsShort: TS.utility.date.short_month_names
      },
      change: onExpirationDateChanged,
      hide: function() {
        _.defer(_destroyDatePicker);
      }
    });
  };
  var onExpirationDateChanged = function(date) {
    _selected_exp_date_unix_ts = date;
    var formatted_date = TS.utility.date.formatDate("{date_long}", date);
    var date_html = '<span id="admin_invites_guest_expiration_date_set_date" class="bold">' + TS.utility.htmlEntities(formatted_date) + "</span>";
    var html = TS.i18n.t("These guests will remain active until {date_html}.", "invite")({
      date_html: date_html
    });
    var new_btn_text = TS.i18n.t("Change", "invite")();
    $("#admin_invites_guest_expiration_copy").html(html);
    $("#admin_invites_show_date_picker").text(new_btn_text);
  };
  var _destroyDatePicker = function() {
    var _$date_picker_target = $(_DATE_PICKER_TARGET_SELECTOR);
    if (_$date_picker_target.pickmeup) _$date_picker_target.pickmeup("destroy");
  };
  var _prepareInvites = function() {
    var invites = [];
    var email;
    _$div.find(".admin_invite_row").each(function() {
      email = $.trim($(this).find('[name="email_address"]').val());
      if (TS.boot_data.feature_name_tagging_client) {
        var full_name = $.trim($(this).find('[name="full_name"]').val());
      } else {
        var first_name = $.trim($(this).find('[name="first_name"]').val());
        var last_name = $.trim($(this).find('[name="last_name"]').val());
      }
      if (email) {
        var invite = {};
        invite.email = email;
        if (TS.boot_data.feature_name_tagging_client && full_name) invite.full_name = full_name;
        if (first_name) invite.first_name = first_name;
        if (last_name) invite.last_name = last_name;
        invites.push(invite);
      } else {
        if ($(".admin_invite_row").length > 1) {
          _removeRow($(this));
        }
      }
    });
    _unprocessed_invites = invites;
    TS.storage.storeInvitesState(_unprocessed_invites);
    return invites;
  };
  var _send = function() {
    var validation_error = false;
    _$div.find(".admin_invite_row").each(function() {
      var email = $.trim($(this).find('[name="email_address"]').val());
      if (email) {
        if (!TS.utility.email_regex.test(email)) {
          _rowError($(this), {
            error: "invalid_email"
          });
          validation_error = true;
        } else {
          _rowValid($(this));
        }
      } else {
        if ($(".admin_invite_row").length > 1) {
          _removeRow($(this));
        }
      }
    });
    if (validation_error) {
      setTimeout(Ladda.stopAll, 0);
      return;
    }
    var invites = _prepareInvites();
    if (!invites.length) {
      var message_html = '<i class="ts_icon ts_icon_info_circle"></i> ' + TS.i18n.t("Add at least one email address before sending invitations.", "invite")();
      _showInfoMessage("alert_info", message_html);
      setTimeout(Ladda.stopAll, 0);
    } else if (invites) {
      var account_type = _$div.find("#account_type").val();
      var $show_custom_message = _$div.find(".admin_invites_show_custom_message");
      var $custom_message = _$div.find("#admin_invite_custom_message");
      var channels;
      var invite_mode = TS.google_auth.isAuthed(_google_auth_instance_id) ? "contact" : "manual";
      if (account_type == "full" || account_type == "restricted") {
        var default_channels = _$div.find("#defaultchannelsmulti").val();
        if (default_channels) channels = default_channels.join(",");
      } else if (account_type == "ultra_restricted") {
        channels = _$div.find("#ultra_restricted_channel_picker").val();
      }
      if (!$show_custom_message.hasClass("hidden")) {
        _custom_message = $custom_message.val();
      } else {
        _custom_message = "";
      }
      _queue_size = invites.length;
      $.each(invites, function(index, invite) {
        var args = {
          email: invite.email,
          source: "invite_modal",
          mode: invite_mode
        };
        if (channels) args.channels = channels;
        if (_custom_message) args.extra_message = _custom_message;
        if (invite.full_name) args.full_name = invite.full_name;
        if (invite.first_name) args.first_name = invite.first_name;
        if (invite.last_name) args.last_name = invite.last_name;
        if (account_type == "restricted") {
          args.restricted = 1;
        } else if (account_type == "ultra_restricted") {
          args.ultra_restricted = 1;
        }
        TS.api.call("users.admin.invite", args, _onInviteSent);
      });
    }
  };
  var _onInviteSent = function(ok, data, args) {
    if (ok) {
      _success_invites.push({
        email: args.email,
        full_name: args.full_name,
        first_name: args.first_name,
        last_name: args.last_name
      });
      var $row = _selectRow(args.email);
      _removeRow($row);
    } else {
      if (data.error == "requires_channel") {
        setTimeout(Ladda.stopAll, 0);
        _$div.find("#ra_channel_picker_header").highlightText();
        var pick_at_least_one_channel = TS.i18n.t("Pick at least one channel before inviting Multi-Channel Guests.", "invite")();
        var message_html = '<i class="ts_icon ts_icon_info_circle"></i> ' + pick_at_least_one_channel;
        _showInfoMessage("alert_warning", message_html);
        return;
      } else if (data.error == "requires_one_channel") {
        setTimeout(Ladda.stopAll, 0);
        _$div.find("#ura_channel_picker_header").highlightText();
        var pick_a_channel = TS.i18n.t("Pick a channel before inviting Single-Channel Guests.", "invite")();
        var message_html = '<i class="ts_icon ts_icon_info_circle"></i> ' + pick_a_channel;
        _showInfoMessage("alert_warning", message_html);
        return;
      } else {
        var invitation_error = data.error;
        if (TS.boot_data.page_needs_enterprise) {
          var member_belongs_to_team = TS.members.getMemberByEmail(args.email) !== null;
          if (member_belongs_to_team && invitation_error === "org_user_is_disabled") {
            invitation_error = "org_user_is_disabled_but_present";
          }
        }
        _error_invites.push({
          email: args.email,
          error: invitation_error,
          error_msg: _getError(_.extend({}, data, {
            error: invitation_error
          }))
        });
      }
    }
    _decrementInviteQueue();
  };
  var _decrementInviteQueue = function() {
    _queue_size--;
    if (_queue_size === 0) {
      _unprocessed_invites = [];
      TS.storage.storeInvitesState(_unprocessed_invites);
      var done = function() {
        setTimeout(Ladda.stopAll, 0);
        TS.ui.admin_invites.invites_sent_sig.dispatch();
      };
      _new_email_domains = _collectNewDomains(_success_invites);
      if (_new_email_domains) {
        TS.api.call("team.checkEmailDomains", {
          email_domains: _new_email_domains
        }).then(function(response) {
          if (response.data.ok) {
            _new_email_domains = response.data.email_domains;
          } else {
            _new_email_domains = "";
          }
        }, function(response) {
          _new_email_domains = "";
        }).finally(done);
      } else {
        done();
      }
    }
  };
  var _invitesSent = function() {
    var account_type = $("#account_type").val();
    var success_invites_html;
    if (account_type == "full") {
      var full_member = TS.i18n.t("{invites_length,plural,=1{{invites_length} Team Member}other{{invites_length} Team Members}}", "invite")({
        invites_length: _success_invites.length
      });
      success_invites_html = "<strong>" + full_member + "</strong>";
    } else if (account_type == "restricted") {
      var multi_channel_guest = TS.i18n.t("{invites_length,plural,=1{{invites_length} Multi-Channel Guest}other{{invites_length} Multi-Channel Guests}}", "invite")({
        invites_length: _success_invites.length
      });
      success_invites_html = "<strong>" + multi_channel_guest + "</strong>";
    } else if (account_type == "ultra_restricted") {
      var single_channel_guest = TS.i18n.t("{invites_length,plural,=1{{invites_length} Single-Channel Guest}other{{invites_length} Single-Channel Guests}}", "invite")({
        invites_length: _success_invites.length
      });
      success_invites_html = "<strong>" + single_channel_guest + "</strong>";
    }
    var api_args = {
      success_invites_html: success_invites_html,
      success_invites: _success_invites,
      error_invites: _error_invites,
      team_name: TS.model.team.name,
      domains: _new_email_domains,
      paid_team: TS.model.team.plan !== "",
      is_admin: TS.model.user.is_admin
    };
    if (TS.model.team.plan) {
      api_args["custom_message"] = _custom_message;
    }
    var html = TS.templates.admin_invite_summary(api_args);
    _$div.find("#invite_notice").slideUp(100);
    _$div.find("#admin_invites_workflow, #admin_invites_header").addClass("hidden");
    _$div.find("#admin_invites_success").html(html).removeClass("hidden");

    function resetAndSwitchToIndividualForm() {
      _resetIndividualForm();
      $("#admin_invites_workflow, #admin_invites_success").toggleClass("hidden");
      $("#admin_invites_header").removeClass("hidden");
      TS.ui.fs_modal.bindBackButton(TS.ui.admin_invites.switchToPicker);
    }
    _$div.find('button[data-action="admin_invites_reset"]').on("click", resetAndSwitchToIndividualForm);
    TS.ui.fs_modal.bindBackButton(resetAndSwitchToIndividualForm);
    _$div.find('button[data-action="admin_invites_try_again"]').on("click", function() {
      $.each(_error_invites, function(index, invite_error) {
        var $row = _selectRow(invite_error.email);
        _rowError($row, invite_error);
      });
      $("#admin_invites_workflow, #admin_invites_success").toggleClass("hidden");
      $("#admin_invites_header").removeClass("hidden");
      TS.ui.fs_modal.bindBackButton(TS.ui.admin_invites.switchToPicker);
      _success_invites = [];
      _error_invites = [];
    });
    if (_canSaveDomains()) {
      var $btn = _$div.find('button[data-action="add_signup_domains"]').on("click", _saveDomains);
      _$div.on("keyup", "#invite_signup_domains", TS.ui.resetButtonSpinner.bind(Object.create(null), $btn.get(0)));
    }
  };
  var _parseEmails = function() {
    var emails = $.trim($("#bulk_emails").val().replace(/[\u200B-\u200D\uFEFF]/g, ""));
    _$div.find("#bulk_emails").prop("disabled", true);
    TS.api.call("users.admin.parseEmails", {
      emails: emails
    }, _onEmailsParsed);
  };
  var _onEmailsParsed = function(ok, data, args) {
    if (!ok) {
      TS.error("failed onEmailsParsed");
      var error_text = TS.i18n.t("Oops! There was an error processing those emails. Please try again.", "invite")();
      _$div.find("#bulk_notice").html('<i class="ts_icon ts_icon_warning"></i> ' + error_text).removeClass("hidden");
      _resetBulkForm();
      return;
    }
    if (data.emails.length === 0) {
      var no_emails_in_text = TS.i18n.t("We couldn’t find any email addresses in that text. Please try again.", "invite")();
      _$div.find("#bulk_notice").html('<i class="ts_icon ts_icon_warning"></i> ' + no_emails_in_text).removeClass("hidden");
      _resetBulkForm();
      return;
    }
    TS.ui.admin_invites.emails_parsed_sig.dispatch(data.emails);
  };
  var _emailsParsed = function(emails) {
    _$div.find(".admin_invite_row").remove();
    _switchInviteView("individual");
    var message_html;
    if (emails.length == 1) {
      var found_one_email = TS.i18n.t("We found 1 email address to invite. We’ve done our best to guess a name. See if it looks right, then press Invite.", "invite")();
      message_html = '<i class="ts_icon ts_icon_check_circle_o_large"></i> ' + found_one_email;
    } else {
      var found_many_emails = TS.i18n.t("We found {emails_length} email addresses to invite. We’ve done our best to guess a name for each one. See if everything looks right, then press Invite.", "invite")({
        emails_length: emails.length
      });
      message_html = '<i class="ts_icon ts_icon_check_circle_o_large"></i> ' + found_many_emails;
    }
    _showInfoMessage("alert_info", message_html);
    _$div.find(".admin_invite_row").each(function() {
      var email = $.trim($(this).find('[name="email_address"]').val());
      if (!email) _removeRow($(this));
    });
    $.each(emails, function(index, email) {
      _addRow(email);
    });
    _unprocessed_invites = emails;
    TS.storage.storeInvitesState(_unprocessed_invites);
  };
  var _canSaveDomains = function() {
    var account_type = $("#account_type").val();
    return account_type == "full" && TS.model.user.is_owner && TS.model.team.prefs.auth_mode == "normal";
  };
  var _collectNewDomains = function(invites) {
    if (!_canSaveDomains()) return "";
    var domains = invites.map(function(invite) {
      return invite.email.split("@")[1];
    });
    if (TS.model.team.email_domain) {
      var map = TS.model.team.email_domain.split(",").reduce(function(accumulator, domain) {
        accumulator[domain] = true;
        return accumulator;
      }, {});
      domains = _.uniq(domains.filter(function(domain) {
        return !map[domain];
      }));
    }
    return domains.join(", ");
  };
  var _deduplicateDomains = function(domains) {
    if (!domains) return domains;
    var map = domains.split(",").reduce(function(accumulator, domain) {
      accumulator[domain] = true;
      return accumulator;
    }, {});
    return Object.keys(map).join(",");
  };
  var _saveDomains = function(e) {
    TS.ui.startButtonSpinner(_$div.find('button[data-action="add_signup_domains"]').get(0));
    var domains = _$div.find("#invite_signup_domains").val();
    if (TS.model.team.email_domain) domains = [TS.model.team.email_domain, domains].join(",");
    domains = _deduplicateDomains(domains);
    var args = {
      prefs: JSON.stringify({
        signup_mode: "email",
        signup_domains: domains
      })
    };
    TS.api.call("team.prefs.set", args).then(function(response) {
      TS.ui.stopButtonSpinner(_$div.find('button[data-action="add_signup_domains"]').get(0), true);
      TS.model.team.email_domain = response.data.prefs.signup_domains;
    }, function(response) {
      TS.ui.stopButtonSpinner(_$div.find('button[data-action="add_signup_domains"]').get(0), false);
      var msg = TS.i18n.t("Sorry! Something went wrong. Please try again.", "invite")();
      if (response.data.error === "signup_domains_missing") {
        msg = TS.i18n.t("Please enter a domain", "invite")();
      } else if (response.data.error === "bad_domain") {
        msg = TS.i18n.t("Sorry! You can’t use {response_data_domain}.", "invite")({
          response_data_domain: response.data.domain
        });
      } else if (response.data.error === "invalid_domain") {
        msg = TS.i18n.t("Hmm, this doesn’t look like a domain! Check for typos?", "invite")();
      } else if (response.data.error === "too_many_domains") {
        msg = TS.i18n.t("Sorry! You’ve entered too many domains.", "invite")();
      }
      $("#invite_signup_domains").focus().tooltip({
        title: msg,
        trigger: "manual"
      }).tooltip("show").on("blur", function() {
        $(this).tooltip("destroy");
      });
    });
  };
  var _canNonAdminInvite = function() {
    return !TS.model.team.prefs.invites_only_admins && !TS.model.user.is_restricted;
  };
  var _canInvite = function() {
    return TS.model.user.is_admin || _canNonAdminInvite();
  };
  var _shouldSeeAccountTypeOptions = function() {
    return TS.model.user.is_admin && TS.model.team.plan !== "";
  };
  var _getError = function(data) {
    if (!data || !data.error || !_error_map[data.error]) return "";
    var error_msg = _error_map[data.error];
    return _.isFunction(error_msg) ? error_msg(data) : error_msg;
  };
})();
