webpackJsonp([241], {
  2338: function(e, i) {
    ! function() {
      "use strict";
      TS.registerModule("ui.admin_invites", {
        invites_sent_sig: new signals.Signal,
        emails_parsed_sig: new signals.Signal,
        onStart: function() {
          TS.ui.admin_invites.invites_sent_sig.add(te, TS.ui.admin_invites), TS.ui.admin_invites.emails_parsed_sig.add(se, TS.ui.admin_invites), TS.team.team_email_domain_changed_sig.add(b, TS.ui.admin_invites), TS.prefs.team_auth_mode_changed_sig.add(j, TS.ui.admin_invites), TS.prefs.team_sso_auth_restrictions_changed_sig.add(j, TS.ui.admin_invites), TS.prefs.team_invites_only_admins_changed_sig.add(TS.ui.admin_invites.maybeShowInviteLink, TS.ui.admin_invites), TS.web && TS.web.login_sig.add(TS.ui.admin_invites.onLogin, TS.ui.admin_invites), TS.client && TS.client.login_sig.add(TS.ui.admin_invites.onLogin, TS.ui.admin_invites), c = TS.storage.fetchInvitesState(), $("body").on("click", '[data-action="admin_invites_modal"]', function() {
            if (!TS.isPartiallyBooted()) {
              var e = {};
              $(this).data("account-type") && (e.account_type = $(this).data("account-type")), p(e);
            }
          });
        },
        onLogin: function() {
          b();
        },
        start: function(e) {
          TS.isPartiallyBooted() || me() && p(e);
        },
        switchToPicker: function() {
          me() && H();
        },
        maybeShowInviteLink: function() {
          if (TS.client) {
            var e = !1,
              i = !1;
            me() && TS.members.getActiveMembersWithSelfAndNotSlackbot().length < 26 && (e = !0), me() && TS.members.getActiveMembersWithSelfAndNotSlackbot().length >= 2 && (i = !0), $("#channel_list_invites_link").toggleClass("hidden", !e).toggleClass("dim", i), TS.client.channel_pane.updateFooterButtons();
          }
        },
        populateInvites: function(i) {
          if (me() && i) {
            var t = c.reduce(function(e, i) {
              return e[i.email] = !0, e;
            }, {});
            i.forEach(function(e) {
              t[e.email] || (t[e.email] = !0, c.push(e));
            }), TS.storage.storeInvitesState(c), c.length && TS.ui.fs_modal.is_showing && (e.find(".admin_invite_row").remove(), c.forEach(function(e) {
              B(e);
            }));
          }
        },
        canInvite: function() {
          return me();
        },
        test: function() {
          var e = {
            _error_map: g,
            _getError: ue
          };
          return Object.defineProperty(e, "_getError", {
            get: function() {
              return ue;
            },
            set: function(e) {
              ue = e;
            }
          }), Object.defineProperty(e, "_error_map", {
            get: function() {
              return g;
            },
            set: function(e) {
              g = e;
            }
          }), e;
        }
      });
      var e, i, t, n, a, s, o, r = 0,
        d = 0,
        l = [],
        m = [],
        c = [],
        u = TS.i18n.t("name@example.com", "invite")(),
        v = u,
        f = "",
        h = "",
        g = {
          url_in_message: TS.i18n.t("Sorry, but URLs are not allowed in the custom message. Please remove it and try again!", "invite")(),
          invalid_email: TS.i18n.t("That doesn’t look like a valid email address!", "invite")(),
          already_in_team: TS.i18n.t("This person is already on your team.", "invite")(),
          user_disabled: function() {
            return TS.i18n.t('This person is already on your team, but their account is deactivated. You can <a href="{url}#disabled">manage</a> their account.', "invite")({
              url: TS.model.team_url
            });
          },
          already_invited: TS.i18n.t("This person has already been invited to your team.", "invite")(),
          sent_recently: TS.i18n.t("This person was recently invited. No need to invite them again just yet.", "invite")(),
          invite_failed: TS.i18n.t("Something went wrong with this invite :(", "invite")(),
          ura_limit_reached: TS.i18n.t("You’ve reached your team limit for Single-channel Guests. You must invite more paid team members first.", "invite")(),
          user_limit_reached: TS.i18n.t("You’ve reached the maximum number of users for this team.", "invite")(),
          not_allowed: TS.i18n.t("You can’t invite this type of account based on your current SSO settings.", "invite")(),
          custom_message_not_allowed: TS.i18n.t("Sorry, you can’t add a custom message to this invite. Please remove it and try again!", "invite")(),
          domain_mismatch: TS.i18n.t("Your SSO settings prevent you from inviting people from this email domain.", "invite")(),
          invite_limit_reached: TS.i18n.t("Your team has exceeded the limit on invitations. After more people have accepted the ones your team has sent, you can send more. Revoking invitations will not lift the limit. Our Help Center has <a href='https://get.slack.help/hc/articles/201330256#invitation_limits'>more details on invitation limits</a>.", "invite")(),
          too_long: TS.i18n.t("This person’s name exceeds the 35-character limit.", "invite")(),
          org_user_is_disabled: TS.i18n.t("This person has a deactivated account for your organization.", "invite")(),
          org_user_is_disabled_but_present: TS.i18n.t("This person is already on your team, but they have been deactivated by your organization. Contact an organization administrator to re-enable their account", "invite")(),
          mismatch_with_pending_team_invite: function(e) {
            var i;
            switch (e.user_type) {
              case "ultra_restricted":
                i = TS.i18n.t("Single-Channel Guest", "invite")();
                break;
              case "restricted":
                i = TS.i18n.t("Multi-Channel Guest", "invite")();
                break;
              default:
                i = TS.i18n.t("full Team Member", "invite")();
            }
            return TS.i18n.t("This person can’t be invited, because they have already been invited as a {account_type} to your organization", "invite")({
              account_type: i
            });
          },
          user_type_mismatch: function(e) {
            var i;
            switch (e.issue) {
              case "org_user_is_restricted":
                i = TS.i18n.t("Multi-Channel Guest", "invite")();
                break;
              case "org_user_is_ultra_restricted":
                i = TS.i18n.t("Single-Channel Guest", "invite")();
                break;
              case "org_user_not_restricted":
              case "org_user_not_ultra_restricted":
                i = TS.i18n.t("full Team Member", "invite")();
            }
            return _.isUndefined(i) ? TS.i18n.t("This person already has an account for your organization", "invite")() : TS.i18n.t("This person already has a {account_type} account for your organization, so you can only invite them in that role.", "invite")({
              account_type: i
            });
          }
        },
        p = function(e) {
          var n;
          t = null, ce() ? e && e.account_type && (n = e.account_type) : n = "full", e && e.initial_channel_id && (i = e.initial_channel_id);
          var a = TS.templates.admin_invite_modal({
              can_add_ura: TS.model.can_add_ura,
              team_name: TS.model.team.name,
              team_in_org: TS.model.team.enterprise_id,
              hide_full_member_option: TS.utility.invites.hideFullMemberInviteOption(),
              team_signup_url: "https://" + TS.model.team.domain + ".slack.com/signup",
              invites_limit: "" === TS.model.team.plan && TS.model.team.prefs.invites_limit,
              show_custom_message: TS.model.team.plan,
              is_paid_team: TS.model.team.plan,
              is_our_app: TS.model.is_our_app
            }),
            s = {
              body_template_html: a,
              onShow: S,
              onCancel: T,
              clog_name: "INVITEMODAL"
            };
          TS.client && TS.ui.a11y.saveCurrentFocus(), TS.ui.fs_modal.start(s), n && setTimeout(function() {
            J(n);
          }, 0);
        },
        S = function() {
          var i = $("#admin_invites_alert");
          TS.model.team.plan ? i.addClass("hidden") : (i.removeClass("hidden"), TS.clog.track("GROWTH_PRICING", {
            contexts: {
              ui_context: {
                step: "admin_invites",
                action: "impression",
                ui_element: "invite_modal_guest_alert"
              }
            }
          }));
          var t;
          e = $("#admin_invites_container"), e.find("#admin_invites_switcher").on("click", '[data-action="switch_type"]', function(e) {
            var i = $(e.target);
            i.is("a") || i.closest(".admin_invites_account_type_option").hasClass("disabled") || J($(this).data("account-type"));
          }), e.find('[data-action="admin_invites_add_row"]').on("click", B), e.find('a[data-action="admin_invites_switch_view"]').on("click", function() {
            V($(this).data("view"));
          }), e.find('button[data-action="api_send_invites"]').on("click", function(e) {
            e.preventDefault(), Z(), TS.model.team.plan || i.css("visibility", "hidden");
          }), e.find('button[data-action="api_parse_emails"]').on("click", function(e) {
            e.preventDefault(), ne(), $(this).find(".ladda-label").text(TS.i18n.t("Processing email addresses ...", "invite")());
          }), t = e.find(".admin_invites_custom_message_container"), k(), y(), e.find('a[data-action="admin_invites_show_custom_message"]').on("click", function() {
            P();
          }), e.find('[data-action="admin_invites_hide_custom_message"]').on("click", function() {
            M();
          }).hover(function() {
            t.addClass("delete_highlight");
          }, function() {
            t.removeClass("delete_highlight");
          }), e.find("#admin_invite_custom_message").on("input", E), e.find("#bulk_emails").css("overflow", "hidden").autogrow(), c = TS.storage.fetchInvitesState(), c.length ? TS.ui.admin_invites.populateInvites(c) : B();
          var n = e.find(".admin_invite_row").length;
          if (n < 3) {
            var a = 3 - n;
            _.times(a, B);
          }
        },
        T = function() {
          r = 0, d = 0, c = m.length ? [] : X(), l = [], m = [], N(), o && o(), TS.storage.storeInvitesState(c), TS.client && TS.ui.a11y.restorePreviousFocus();
        },
        b = function() {
          v = u;
        },
        y = function() {
          if (!TS.model.team.plan) return w(!1);
          TS.api.callImmediately("users.admin.canAddUltraRestricted").then(function(e) {
            w(e.data.ok);
          }, function() {
            w(!1);
          });
        },
        w = function(e) {
          TS.model.can_add_ura = e;
          var i = $('.admin_invites_account_type_option[data-account-type="ultra_restricted"]');
          if (i.toggleClass("disabled", !TS.model.can_add_ura), !TS.model.can_add_ura) {
            $(".account_type_disabled_hover", i).removeClass("hidden");
          }
        },
        k = function() {
          (a = document.getElementById("btn_connect_contacts")) && (a.addEventListener("click", C), s = TS.model.user.id + Date.now(), TS.google_auth.getAuthLink(s).then(function() {
            TS.utility.disableElement(a, !1);
          }));
        },
        C = function() {
          TS.google_auth.getAuthLink(s).then(function(e) {
            var i = window.open(e, "auth_window", "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes,width=600,height=500");
            x(i);
          });
        },
        x = function(e) {
          o = TS.google_auth.pollForAuthStatus(s, I, e).cancel;
        },
        I = function(i) {
          if (o = null, i) {
            var t = TS.i18n.t("Google contacts connected", "invite")();
            e.find(".btn_connect_contacts_text").text(t), a.removeEventListener("click", C), TS.clog.track("INVITEMODAL_ACTION", {
              action: "google_auth_success",
              trigger: "user_allowed_access"
            }), A();
          }
        },
        A = function() {
          var e = {
            page: 1,
            count: 1e3
          };
          TS.google_auth.getContactList(s, e).then(function(e) {
            0 === $("input.email_field").filter(function() {
              return !this.value;
            }).length && B(), L(e);
          });
        },
        L = function(e) {
          if (e && (n = n || e.items, $("input.email_field").lazyFilterSelect({
              approx_item_height: 50,
              data: n,
              single: !0,
              placeholder_text: TS.i18n.t("name@example.com", "invite")(),
              onReady: function() {
                G(this);
              },
              filter: function(e, i) {
                if (i = i.toLowerCase(), e.full_name) var t = e.full_name.toLowerCase();
                if (e.email) var n = e.email.toLowerCase();
                return t && -1 !== t.indexOf(i) || n && -1 !== n.indexOf(i);
              },
              noResultsTemplate: function(e) {
                return TS.i18n.t("None of your Google contacts match <strong>{query}</strong>", "invite")({
                  query: _.escape(e)
                });
              },
              onItemAdded: function(e) {
                G(this, e), TS.clog.track("INVITEMODAL_ACTION", {
                  action: "add_google_email",
                  trigger: "select_google_contact_from_dropdown"
                });
              },
              onInputFocus: function() {
                $(".ts_tip_tip").remove(), $(".lazy_filter_select").removeClass("ts_tip ts_tip_top ts_tip_float ts_tip_multiline ts_tip_delay_1000");
              },
              onInputBlur: function() {
                G(this);
              },
              template: function(e) {
                var i = TS.templates.admin_invite_filter_select_contact({
                  contact: e
                });
                return new Handlebars.SafeString(i);
              }
            }).addClass("hidden"), void 0 !== e.items)) {
            var i = TS.i18n.t("Type here to search your Google contacts", "invite")(),
              t = '<span class="ts_tip_tip"><span class="ts_tip_multiline_inner">' + i + "</span></span>";
            $("input.email_field").filter(function() {
              return !this.value;
            }).first().lazyFilterSelect("container").addClass("ts_tip ts_tip_top ts_tip_float ts_tip_multiline ts_tip_delay_1000").append(t);
          }
        },
        G = function(e, i) {
          var t = e.$container[0],
            n = $(t).parents(".admin_invite_row");
          if (i) TS.boot_data.feature_name_tagging_client ? $(n).find("input[name*=real_name]").val(i.full_name) : ($(n).find("input[name*=first_name]").val(i.given_name), $(n).find("input[name*=last_name]").val(i.family_name)), $(n).find("input[name*=email_address]").val(i.email);
          else {
            var a = $(n).find("input.lfs_input").val(),
              s = $(n).find("input[name*=email_address]").val();
            a ? ($(n).find("input.email_field").lazyFilterSelect("clearValue"), $(n).find("input[name*=email_address]").val(a)) : s && $(n).find("input.lfs_input").val(s);
          }
        },
        B = function(i) {
          var t = !0;
          0 === e.find(".admin_invite_row").length ? t = !1 : e.find(".admin_invite_row").first().find(".delete_row").removeClass("hidden"), e.find("#invite_rows").append(TS.templates.admin_invite_row({
            index: r,
            show_delete_btn: t,
            placeholder_email_address: v
          }));
          var a = e.find("#invite_" + r);
          a.find('[data-action="admin_invites_delete_row"]').on("click", function() {
            D(a);
          }).hover(function() {
            a.addClass("delete_highlight");
          }, function() {
            a.removeClass("delete_highlight");
          }), a.find('[name="email_address"]').focus(), i && (a.find('[name="email_address"]').val(i.email), a.find(".lfs_input_container input.lfs_input").val(i.email), TS.boot_data.feature_name_tagging_client ? a.find('[name="real_name"]').val(i.real_name) : (a.find('[name="first_name"]').val(i.first_name), a.find('[name="last_name"]').val(i.last_name))), TS.google_auth.isAuthed(s) && n && L(n), r += 1;
        },
        O = function(i, t) {
          e.find("#invite_notice").toggleClass("alert_warning", "alert_warning" === i).toggleClass("alert_info", "alert_info" === i).toggleClass("alert_error", "alert_error" === i).html(t).slideDown(100);
        },
        P = function() {
          e.find(".admin_invites_hide_custom_message").addClass("hidden"), e.find(".admin_invites_show_custom_message").removeClass("hidden"), E();
        },
        M = function() {
          e.find(".admin_invites_hide_custom_message").removeClass("hidden"), e.find(".admin_invites_show_custom_message").addClass("hidden"), E();
        },
        E = function() {
          var i = e.find("#admin_invite_custom_message"),
            t = i.val().trim(),
            n = e.find(".admin_invites_show_custom_message"),
            a = !n.hasClass("hidden") && !!i.data("validation") && i.data("validation").includes("hasnourl") && !!TS.utility.findUrls(t).length;
          F(a);
        },
        F = function(i) {
          e.find("#admin_invites_submit_btn").toggleClass("disabled", i);
        },
        D = function(i) {
          i && i.length && i.slideToggle(100, function() {
            i.remove();
            var t = $(".admin_invite_row").length;
            0 === t ? B() : 1 === t && e.find(".admin_invite_row").first().find(".delete_row").addClass("hidden");
          });
        },
        z = function() {
          var i, t = $("#account_type").val();
          "full" === t ? i = TS.i18n.t("Send Invitations", "invite")() : "treatment" === TS.experiment.getGroup("guest_profiles_and_expiration") ? i = TS.i18n.t("Invite Guests", "invite")() : "restricted" === t ? i = TS.i18n.t("Invite Multi-Channel Guests", "invite")() : "ultra_restricted" === t && (i = TS.i18n.t("Invite Single-Channel Guests", "invite")()), e.find('button[data-action="api_send_invites"]').find(".ladda-label").text(i);
        },
        N = function() {
          i = void 0;
        },
        j = function() {
          var i = e.find("#account_type").val(),
            t = !1,
            n = "google" === TS.model.team.prefs.auth_mode || "saml" === TS.model.team.prefs.auth_mode,
            a = !1,
            s = TS.boot_data.page_needs_enterprise,
            o = "";
          if (s && "full" === i || n && 0 === TS.model.team.prefs.sso_auth_restrictions) {
            a = !0;
            var r = TS.utility.enterprise.getProviderLabel(TS.model.enterprise, _.get(TS.model, "enterprise.sso_provider.label", "single sign-on"));
            o = TS.i18n.t("Only people with {account_type} accounts will be able to accept invitations.", "invite")({
              account_type: r
            });
          }
          if ("google" === TS.model.team.prefs.auth_mode) "full" !== i || 0 !== TS.model.team.prefs.sso_auth_restrictions && 1 !== TS.model.team.prefs.sso_auth_restrictions ? "restricted" !== i && "ultra_restricted" !== i || 0 !== TS.model.team.prefs.sso_auth_restrictions || (t = !0) : t = !0;
          else if ("saml" === TS.model.team.prefs.auth_mode && (0 === TS.model.team.prefs.sso_auth_restrictions || 1 === TS.model.team.prefs.sso_auth_restrictions) && "full" === i && !s) {
            var d = TS.templates.admin_invite_switcher({
              can_add_ura: TS.model.can_add_ura,
              hide_full_member_option: TS.utility.invites.hideFullMemberInviteOption(),
              team_signup_url: "https://" + TS.model.team.domain + ".slack.com/signup",
              team_in_org: TS.model.team.enterprise_id
            });
            $("#admin_invites_switcher").html(d), H();
          }
          $("#google_auth_email_domain_notice").toggleClass("hidden", !t), $("#sso_signup_notice").html(o).toggleClass("hidden", !a);
        },
        W = function(i) {
          var t;
          return e.find('input[name="email_address"]').each(function() {
            $(this).val() == i && (t = $(this).closest(".admin_invite_row"));
          }), t;
        },
        Y = function(e, i) {
          _.isObject(i) || TS.error("_rowError did not receive an error object: ", i);
          var t = ue(i);
          e && (e.find("label.email").addClass("error").end().find(".error_msg").removeClass("hidden").html(t), "too_long" === i.error && e.find("label").addClass("error"), e.find("input").on("keyup.admin_invite_error_fixed", function() {
            R(e);
          }));
        },
        R = function(e) {
          e && (e.find("label").removeClass("error").end().find(".error_msg").addClass("hidden"), e.find("input").off(".admin_invite_error_fixed"));
        },
        U = function() {
          setTimeout(function() {
            Ladda.stopAll(), e.find(".admin_invite_row").remove(), l = [], m = [], t = null, z(), _.times(3, B);
          }, 0);
        },
        q = function() {
          setTimeout(function() {
            Ladda.stopAll(), e.find('button[data-action="api_parse_emails"]').find(".ladda-label").text(TS.i18n.t("Add Invitees", "invite")()), e.find("#bulk_emails").prop("disabled", !1);
          }, 0);
        },
        H = function() {
          e.find("#admin_invites_header").find(".admin_invites_header_type").removeClass("normal").text("people").end().find(".admin_invites_header_team_name").removeClass("hidden"), e.find("#admin_invites_switcher").removeClass("hidden"), e.find("#admin_invites_workflow").addClass("hidden"), TS.ui.fs_modal.hideBackButton();
        },
        V = function(i) {
          if ("individual" === i) e.find("#individual_invites").removeClass("hidden"), e.find("#bulk_invites, #bulk_notice").addClass("hidden"), e.find("#bulk_emails").val(""), e.find(".email_field").first().focus(), e.find(".invite_modal_options_container").removeClass("hidden"), q();
          else if ("bulk" === i) {
            e.find("#bulk_invites").removeClass("hidden"), e.find("#individual_invites").addClass("hidden"), e.find(".invite_modal_options_container").addClass("hidden");
            var t = e.find('button[data-action="api_parse_emails"]');
            t.hasClass("ladda") || (Ladda.bind('button[data-action="api_parse_emails"]'), t.addClass("ladda")), t.find(".ladda-label").text(TS.i18n.t("Add Invitees", "invite")());
            var n = X();
            if (n) {
              var a = "";
              $.each(n, function(e, i) {
                i.first_name && (a += i.first_name + " "), i.last_name && (a += i.last_name + " "), a += "<" + i.email + ">, ";
              }), e.find("#bulk_emails").val(a).autogrow();
            }
            e.find("#bulk_emails").focus();
          }
        },
        J = function(t) {
          var n = [],
            a = TS.channels.getUnarchivedChannelsForUser();
          _.isArray(TS.model.team.prefs.default_channels) && a.forEach(function(e) {
            -1 !== TS.model.team.prefs.default_channels.indexOf(e.id) && (e.is_default = !0, n.push(e));
          });
          var s = TS.channels.getGeneralChannel(),
            o = "";
          s && (o = s.name, n.length || n.push(s));
          var r = {
              invite_type: t,
              channels: a,
              default_channels: n,
              general_name: o,
              groups: TS.groups.getUnarchivedGroups(),
              email_domains: TS.model.team.email_domain.split(","),
              is_admin: TS.model.user.is_admin,
              initial_channel_id: i
            },
            d = TS.templates.admin_invite_channel_picker(r),
            l = TS.i18n.t("Team Members", "invite")();
          if ("restricted" === t ? l = TS.i18n.t("Multi-Channel Guests", "invite")() : "ultra_restricted" === t && (l = TS.i18n.t("Single-Channel Guests", "invite")()), e.find("#admin_invites_header").find(".admin_invites_header_type").addClass("normal").text(l).end().find(".admin_invites_header_team_name").addClass("hidden"), e.find("#admin_invites_channel_picker_container").html(d), e.find("#account_type").val(t), e.find("#admin_invites_switcher, #admin_invites_workflow").toggleClass("hidden"), e.find("#admin_invites_billing_notice", "#admin_guide_to_billing_at_slack").toggleClass("hidden", !("" !== TS.model.team.plan && "ultra_restricted" !== t)), e.find("#ura_warning").toggleClass("hidden", "restricted" !== t && "ultra_restricted" !== t), e.find("#invite_notice").hide(), "treatment" === TS.experiment.getGroup("guest_profiles_and_expiration")) {
            var m = "";
            e.find(".admin_invites_guest_expiration_date_container").toggleClass("hidden", "full" === t), e.find("#admin_invites_show_date_picker").on("click", K), "restricted" === t ? m = TS.i18n.t("These guests will only have access to messages and files in specified channels.", "invite")() : "ultra_restricted" === t && (m = TS.i18n.t("These guests will only have access to messages and files in a single channel.", "invite")()), e.find("#admin_invites_subheader").text(m).toggleClass("hidden", "full" === t);
          }
          e.find("#ultra_restricted_channel_picker").on("change", function() {
            z(), N();
          }), e.find(".email_field").first().focus();
          var c = e.find('button[data-action="api_send_invites"]');
          c.hasClass("ladda") || (Ladda.bind('button[data-action="api_send_invites"]'), c.addClass("ladda")), z(), j(), e.find("#defaultchannelsmulti, #ultra_restricted_channel_picker").lazyFilterSelect({
            onItemRemoved: function(e) {
              e.value == i && N();
            }
          }).addClass("hidden"), ce() && (TS.ui.fs_modal.bindBackButton(TS.ui.admin_invites.switchToPicker), TS.ui.fs_modal.showBackButton());
        },
        K = function(e) {
          var i = {
            event: e,
            $target: $("#admin_invites_show_date_picker"),
            onSelect: Q,
            date_picker_args: {}
          };
          t && (i.date_picker_args.selected_expiration_ts = t), TS.menu.date.startWithExpirationPresets(i);
        },
        Q = function(e) {
          if (_.isNumber(e) && e !== t) {
            var i, n;
            0 === e ? (t = null, i = TS.i18n.t("By default, guest accounts stay active indefinitely.", "invite")(), n = TS.i18n.t("Set a time limit", "invite")()) : (t = e, i = TS.i18n.t("These accounts will be deactivated on <strong>{date} at {time}</strong>.", "invite")({
              date: TS.utility.date.formatDate("{date}", e),
              time: TS.utility.date.formatDate("{time}", e)
            }), n = TS.i18n.t("Change", "invite")()), $("#admin_invites_guest_expiration_copy").html(i), $("#admin_invites_show_date_picker").text(n);
          }
        },
        X = function() {
          var i, t = [];
          return e.find(".admin_invite_row").each(function() {
            if (i = $.trim($(this).find('[name="email_address"]').val()), TS.boot_data.feature_name_tagging_client) var e = $.trim($(this).find('[name="real_name"]').val());
            else var n = $.trim($(this).find('[name="first_name"]').val()),
              a = $.trim($(this).find('[name="last_name"]').val());
            if (i) {
              var s = {};
              s.email = i, TS.boot_data.feature_name_tagging_client && e && (s.real_name = e), n && (s.first_name = n), a && (s.last_name = a), t.push(s);
            } else $(".admin_invite_row").length > 1 && D($(this));
          }), c = t, TS.storage.storeInvitesState(c), t;
        },
        Z = function() {
          var i = !1;
          if (e.find(".admin_invite_row").each(function() {
              var e = $.trim($(this).find('[name="email_address"]').val());
              e ? TS.utility.email_regex.test(e) ? R($(this)) : (Y($(this), {
                error: "invalid_email"
              }), i = !0) : $(".admin_invite_row").length > 1 && D($(this));
            }), i) return void setTimeout(Ladda.stopAll, 0);
          var n = X();
          if (n.length) {
            if (n) {
              var a, o = e.find("#account_type").val(),
                r = e.find(".admin_invites_show_custom_message"),
                l = e.find("#admin_invite_custom_message"),
                _ = TS.google_auth.isAuthed(s) ? "contact" : "manual";
              if ("full" === o || "restricted" === o) {
                var m = e.find("#defaultchannelsmulti").val();
                m && (a = m.join(","));
              } else "ultra_restricted" === o && (a = e.find("#ultra_restricted_channel_picker").val());
              h = r.hasClass("hidden") ? "" : l.val(), d = n.length, $.each(n, function(e, i) {
                var n = {
                  email: i.email,
                  source: "invite_modal",
                  mode: _
                };
                a && (n.channels = a), h && (n.extra_message = h), i.real_name && (n.real_name = i.real_name), i.first_name && (n.first_name = i.first_name), i.last_name && (n.last_name = i.last_name), "restricted" !== o && "ultra_restricted" !== o || !t || (n.expiration_ts = t), "restricted" === o ? n.restricted = 1 : "ultra_restricted" === o && (n.ultra_restricted = 1), TS.api.call("users.admin.invite", n, ee);
              });
            }
          } else {
            var c = '<i class="ts_icon ts_icon_info_circle"></i> ' + TS.i18n.t("Add at least one email address before sending invitations.", "invite")();
            O("alert_info", c), setTimeout(Ladda.stopAll, 0);
          }
        },
        ee = function(i, t, n) {
          if (i) {
            l.push({
              email: n.email,
              real_name: n.real_name,
              first_name: n.first_name,
              last_name: n.last_name
            });
            var a = W(n.email);
            D(a);
          } else {
            var s;
            if ("requires_channel" === t.error) {
              setTimeout(Ladda.stopAll, 0), e.find("#ra_channel_picker_header").highlightText();
              return s = '<i class="ts_icon ts_icon_info_circle"></i> ' + TS.i18n.t("Pick at least one channel before inviting Multi-Channel Guests.", "invite")(), void O("alert_warning", s);
            }
            if ("requires_one_channel" === t.error) {
              setTimeout(Ladda.stopAll, 0), e.find("#ura_channel_picker_header").highlightText();
              return s = '<i class="ts_icon ts_icon_info_circle"></i> ' + TS.i18n.t("Pick a channel before inviting Single-Channel Guests.", "invite")(), void O("alert_warning", s);
            }
            var o = t.error;
            if (TS.boot_data.page_needs_enterprise) {
              null !== TS.members.getMemberByEmail(n.email) && "org_user_is_disabled" === o && (o = "org_user_is_disabled_but_present");
            }
            m.push({
              email: n.email,
              error: o,
              error_msg: ue(_.extend({}, t, {
                error: o
              }))
            });
          }
          ie();
        },
        ie = function() {
          if (0 === (d -= 1)) {
            c = [], TS.storage.storeInvitesState(c);
            var e = function() {
              setTimeout(Ladda.stopAll, 0), TS.ui.admin_invites.invites_sent_sig.dispatch();
            };
            f = re(l), f ? TS.api.call("team.checkEmailDomains", {
              email_domains: f
            }).then(function(e) {
              f = e.data.ok ? e.data.email_domains : "";
            }, function() {
              f = "";
            }).finally(e) : e();
          }
        },
        te = function() {
          function i() {
            U(), $("#admin_invites_workflow, #admin_invites_success").toggleClass("hidden"), TS.model.team.plan || $("#admin_invites_alert").css("visibility", "visible"), $("#admin_invites_header, #admin_invites_subheader").removeClass("hidden"), TS.ui.fs_modal.bindBackButton(TS.ui.admin_invites.switchToPicker);
          }
          var n, a, s = $("#account_type").val();
          if ("full" === s) {
            n = "<strong>" + TS.i18n.t("{invites_length,plural,=1{{invites_length} Team Member}other{{invites_length} Team Members}}", "invite")({
              invites_length: l.length
            }) + "</strong>";
          } else if ("restricted" === s) {
            var o = TS.i18n.t("{invites_length,plural,=1{{invites_length} Multi-Channel Guest}other{{invites_length} Multi-Channel Guests}}", "invite")({
              invites_length: l.length
            });
            n = "<strong>" + o + "</strong>";
          } else if ("ultra_restricted" === s) {
            var r = TS.i18n.t("{invites_length,plural,=1{{invites_length} Single-Channel Guest}other{{invites_length} Single-Channel Guests}}", "invite")({
              invites_length: l.length
            });
            n = "<strong>" + r + "</strong>";
          }!t || "restricted" !== s && "ultra_restricted" !== s || "treatment" !== TS.experiment.getGroup("guest_profiles_and_expiration") || (a = TS.i18n.t("{invites_length,plural,=1{This account}other{These accounts}} will be deactivated on {date} at {time}.", "invite")({
            invites_length: l.length,
            date: TS.utility.date.formatDate("{date}", t),
            time: TS.utility.date.formatDate("{time}", t)
          }));
          var d = {
            success_invites_html: n,
            success_invites: l,
            error_invites: m,
            team_name: TS.model.team.name,
            domains: f,
            paid_team: "" !== TS.model.team.plan,
            is_admin: TS.model.user.is_admin,
            expiration_msg: a
          };
          TS.model.team.plan && (d.custom_message = h);
          var _ = TS.templates.admin_invite_summary(d);
          if (e.find("#invite_notice").slideUp(100), e.find("#admin_invites_workflow, #admin_invites_header, #admin_invites_subheader").addClass("hidden"), e.find("#admin_invites_success").html(_).removeClass("hidden"), e.find('button[data-action="admin_invites_reset"]').on("click", i), TS.ui.fs_modal.bindBackButton(i), e.find('button[data-action="admin_invites_try_again"]').on("click", function() {
              $.each(m, function(e, i) {
                var t = W(i.email);
                Y(t, i);
              }), $("#admin_invites_workflow, #admin_invites_success").toggleClass("hidden"), $("#admin_invites_header, #admin_invites_subheader").removeClass("hidden"), TS.ui.fs_modal.bindBackButton(TS.ui.admin_invites.switchToPicker), l = [], m = [];
            }), oe()) {
            var c = e.find('button[data-action="add_signup_domains"]').on("click", le);
            e.on("keyup", "#invite_signup_domains", TS.ui.resetButtonSpinner.bind(Object.create(null), c.get(0)));
          }
        },
        ne = function() {
          var i = $.trim($("#bulk_emails").val().replace(/[\u200B-\u200D\uFEFF]/g, ""));
          e.find("#bulk_emails").prop("disabled", !0), TS.api.call("users.admin.parseEmails", {
            emails: i
          }, ae);
        },
        ae = function(i, t) {
          if (!i) {
            TS.error("failed onEmailsParsed");
            var n = TS.i18n.t("Oops! There was an error processing those emails. Please try again.", "invite")();
            return e.find("#bulk_notice").html('<i class="ts_icon ts_icon_warning"></i> ' + n).removeClass("hidden"), void q();
          }
          if (0 === t.emails.length) {
            var a = TS.i18n.t("We couldn’t find any email addresses in that text. Please try again.", "invite")();
            return e.find("#bulk_notice").html('<i class="ts_icon ts_icon_warning"></i> ' + a).removeClass("hidden"), void q();
          }
          TS.ui.admin_invites.emails_parsed_sig.dispatch(t.emails);
        },
        se = function(i) {
          e.find(".admin_invite_row").remove(), V("individual");
          var t;
          if (1 == i.length) {
            t = '<i class="ts_icon ts_icon_check_circle_o_large"></i> ' + TS.i18n.t("We found 1 email address to invite. We’ve done our best to guess a name. See if it looks right, then press Invite.", "invite")();
          } else {
            t = '<i class="ts_icon ts_icon_check_circle_o_large"></i> ' + TS.i18n.t("We found {emails_length} email addresses to invite. We’ve done our best to guess a name for each one. See if everything looks right, then press Invite.", "invite")({
              emails_length: i.length
            });
          }
          O("alert_info", t), e.find(".admin_invite_row").each(function() {
            $.trim($(this).find('[name="email_address"]').val()) || D($(this));
          }), $.each(i, function(e, i) {
            B(i);
          }), c = i, TS.storage.storeInvitesState(c);
        },
        oe = function() {
          return "full" === $("#account_type").val() && TS.model.user.is_owner && "normal" === TS.model.team.prefs.auth_mode;
        },
        re = function(e) {
          if (!oe()) return "";
          var i = e.map(function(e) {
            return e.email.split("@")[1];
          });
          if (TS.model.team.email_domain) {
            var t = TS.model.team.email_domain.split(",").reduce(function(e, i) {
              return e[i] = !0, e;
            }, {});
            i = _.uniq(i.filter(function(e) {
              return !t[e];
            }));
          }
          return i.join(", ");
        },
        de = function(e) {
          if (!e) return e;
          var i = e.split(",").reduce(function(e, i) {
            return e[i] = !0, e;
          }, {});
          return Object.keys(i).join(",");
        },
        le = function() {
          TS.ui.startButtonSpinner(e.find('button[data-action="add_signup_domains"]').get(0));
          var i = e.find("#invite_signup_domains").val();
          TS.model.team.email_domain && (i = [TS.model.team.email_domain, i].join(",")), i = de(i);
          var t = {
            prefs: JSON.stringify({
              signup_mode: "email",
              signup_domains: i
            })
          };
          TS.api.call("team.prefs.set", t).then(function(i) {
            TS.ui.stopButtonSpinner(e.find('button[data-action="add_signup_domains"]').get(0), !0), TS.model.team.email_domain = i.data.prefs.signup_domains;
          }, function(i) {
            TS.ui.stopButtonSpinner(e.find('button[data-action="add_signup_domains"]').get(0), !1);
            var t = TS.i18n.t("Sorry! Something went wrong. Please try again.", "invite")();
            "signup_domains_missing" === i.data.error ? t = TS.i18n.t("Please enter a domain", "invite")() : "bad_domain" === i.data.error ? t = TS.i18n.t("Sorry! You can’t use {response_data_domain}.", "invite")({
              response_data_domain: i.data.domain
            }) : "invalid_domain" === i.data.error ? t = TS.i18n.t("Hmm, this doesn’t look like a domain! Check for typos?", "invite")() : "too_many_domains" === i.data.error && (t = TS.i18n.t("Sorry! You’ve entered too many domains.", "invite")()), $("#invite_signup_domains").focus().tooltip({
              title: t,
              trigger: "manual"
            }).tooltip("show").on("blur", function() {
              $(this).tooltip("destroy");
            });
          });
        },
        _e = function() {
          return !TS.model.team.prefs.invites_only_admins && !TS.model.user.is_restricted;
        },
        me = function() {
          return TS.model.user.is_admin || _e();
        },
        ce = function() {
          return TS.model.user.is_admin && "" !== TS.model.team.plan;
        },
        ue = function(e) {
          if (!e || !e.error || !g[e.error]) return "";
          var i = g[e.error];
          return _.isFunction(i) ? i(e) : i;
        };
    }();
  }
}, [2338]);
