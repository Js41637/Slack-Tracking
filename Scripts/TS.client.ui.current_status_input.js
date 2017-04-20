(function() {
  "use strict";
  TS.registerComponent("client.ui.CurrentStatusInput", {
    _constructor: function(settings) {
      this._onSave = settings.onSave;
      this._onEscape = settings.onEscape;
      this._onError = settings.onError;
      this._$container = settings.$parent.find(".current_status_input_container").addBack(".current_status_input_container");
      this._$emoji_input = settings.$parent.find('[name="status_emoji"]');
      this._$inline_saver = settings.$parent.find(".current_status_inline_saver");
      this._$input = settings.$parent.find(".current_status_input");
      this._$action_buttons = settings.$parent.find(".current_status_action_buttons");
      this._$cancel_button = this._$action_buttons.find(".current_status_cancel_button");
      this._$save_button = this._$action_buttons.find(".current_status_save_button");
      this._$status_emoji_picker = settings.$parent.find(".current_status_emoji_picker");
      this._$status_clear_icon = settings.$parent.find(".status_clear_icon");
      this._$status_clear_icon_wrap = settings.$parent.find(".status_clear_icon_wrap");
      this._$presets_list = settings.$parent.find(".current_status_presets");
      this._has_form_context = settings.has_form_context;
      this._has_presets_menu = settings.has_presets_menu;
      this._selected_emoji = TS.members.getMemberCurrentStatus(TS.model.user).emoji;
      this._bindFunctions();
      this._bindEvents();
      this._toggleStatusClearIcon();
      if (TS.boot_data.feature_texty_takes_over) {
        this._startTexty();
      } else {
        this._startTabComplete();
      }
      TS.ui.validation.validate(this._$input);
    },
    destroy: function() {
      if (this._$input) {
        if (TS.boot_data.feature_texty_takes_over) {
          TS.utility.contenteditable.unload(this._$input);
        } else {
          this._$input.TS_tabComplete("destroy");
        }
      }
      this._unbindEvents();
      this._$container = null;
      this._$emoji_input = null;
      this._$inline_saver = null;
      this._$input = null;
      this._$action_buttons = null;
      this._$cancel_button = null;
      this._$save_button = null;
      this._$status_clear_icon = null;
      this._$status_clear_icon_wrap = null;
      this._$status_emoji_picker = null;
      this._$presets_list = null;
      this._has_form_context = null;
      this._has_presets_menu = null;
      this._selected_emoji = null;
      this._onSave = null;
      this._onEscape = null;
      this._onError = null;
    },
    focus: function() {
      if (this._$input && this._$input.length) TS.utility.setCursorPosition(this._$input, TS.utility.contenteditable.value(this._$input).length);
    },
    hasText: function() {
      return TS.utility.contenteditable.value(this._$input).trim().length > 0;
    },
    hasNewText: function() {
      return TS.utility.contenteditable.value(this._$input).trim() !== TS.members.getMemberCurrentStatus(TS.model.user).text;
    },
    isEdited: function() {
      return this.hasNewText() || this._selected_emoji !== TS.members.getMemberCurrentStatus(TS.model.user).emoji;
    },
    isSaveable: function() {
      return this.isEdited();
    },
    onEmojiSelected: function(selected_emoji) {
      selected_emoji = selected_emoji || "";
      this._selectEmoji(selected_emoji);
      this._toggleActionButtons();
      this._toggleStatusClearIcon();
      this.focus();
    },
    onTabComplete: function(txt, cursor_pos) {
      TS.utility.populateInput(this._$input, txt, cursor_pos);
      TS.ui.validation.validate(this._$input);
    },
    _bindFunctions: function() {
      this._onFocus = this._onFocus.bind(this);
      this._onCancel = this._onCancel.bind(this);
      this._onKeydown = this._onKeydown.bind(this);
      this._onKeyup = this._onKeyup.bind(this);
      this._onBodyClick = this._onBodyClick.bind(this);
      this.clearCurrentStatus = this.clearCurrentStatus.bind(this);
      this._openEmojiPicker = this._openEmojiPicker.bind(this);
      this._presetChosen = this._presetChosen.bind(this);
      this._editCurrentStatus = this._editCurrentStatus.bind(this);
      this.onEmojiSelected = this.onEmojiSelected.bind(this);
      this.onTabComplete = this.onTabComplete.bind(this);
    },
    _bindEvents: function() {
      if (!TS.boot_data.feature_texty_takes_over) {
        this._$input.on("focus.client_ui_current_status_input", this._onFocus);
      }
      this._$input.on("keydown.client_ui_current_status_input", this._onKeydown);
      this._$input.on("keyup.client_ui_current_status_input", this._onKeyup);
      this._$status_emoji_picker.on("click.client_ui_current_status_input", this._openEmojiPicker);
      this._$status_clear_icon.on("click.client_ui_current_status_input", this.clearCurrentStatus);
      this._$cancel_button.on("click.client_ui_current_status_input", this._onCancel);
      this._$save_button.on("click.client_ui_current_status_input", this._editCurrentStatus);
      if (!this._has_presets_menu) this._$presets_list.on("click.client_ui_current_status_input", ".current_status_preset_option", this._presetChosen);
    },
    _unbindEvents: function() {
      if (this._$input) {
        this._$input.off(".client_ui_current_status_input");
      }
      if (this._$status_clear_icon) {
        this._$status_clear_icon.off(".client_ui_current_status_input");
      }
      if (!this._has_presets_menu) {
        this._$presets_list.off(".client_ui_current_status_input");
      }
      if (this._$status_emoji_picker && this._$status_emoji_picker.length) {
        this._$status_emoji_picker.off(".client_ui_current_status_input");
      }
      if (this._$cancel_button && this._$cancel_button.length) {
        this._$cancel_button.off(".client_ui_current_status_input");
      }
      if (this._$save_button && this._$save_button.length) {
        this._$save_button.off(".client_ui_current_status_input");
      }
      this._maybeRemoveBodyClickHandler();
    },
    _selectEmoji: function(selected_emoji) {
      this._selected_emoji = selected_emoji || "";
      this._$emoji_input.val(this._selected_emoji);
      this._$status_emoji_picker.find(".current_status_empty_emoji").toggleClass("hidden", !!this._selected_emoji);
      this._$status_emoji_picker.find(".current_status_emoji").html(TS.format.formatCurrentStatus(this._selected_emoji, undefined, {
        stop_animations: true,
        transform_missing_emoji: true,
        ignore_emoji_mode_pref: TS.model.prefs.emoji_mode === "as_text"
      }));
    },
    _startTabComplete: function() {
      var $input = this._$input;
      var ui_initer = $input.tab_complete_ui.bind($input, {
        id: "current_status_input_tab_complete_ui",
        min_width: TAB_COMPLETE_UI_MIN_WIDTH
      });
      var options = {
        complete_emoji: true,
        complete_members: false,
        ui_initer: ui_initer,
        onComplete: this.onTabComplete
      };
      this._$input.TS_tabComplete(options);
    },
    _onCancel: function() {
      if (!this._has_form_context) {
        this._maybeRemoveBodyClickHandler();
        this._restoreCurrentStatus();
        TS.utility.contenteditable.blur(this._$input);
        this._maybeHidePresetsMenu();
        if (_.isFunction(this._onEscape)) this._onEscape(TS.members.getMemberCurrentStatus(TS.model.user));
      }
    },
    _onFocus: function(event) {
      if (!this.isEdited() || this._getSelectedPresetIndex() > -1 || !(this.hasText() || this._selected_emoji)) this._maybeShowPresetsMenu(event);
      this._maybeAddBodyClickHandler();
    },
    _onBodyClick: function(event) {
      if (TS.ui.react_emoji_menu.is_showing) return;
      if ($.contains(this._$container.get(0), event.target)) return;
      if (!TS.boot_data.feature_texty_takes_over && (this._$input.tab_complete_ui("isShowing") || this._$input.tab_complete_ui("wasJustHidden"))) return;
      this._onCancel();
    },
    _onKeydown: function(event) {
      if (TS.boot_data.feature_texty_takes_over) {
        if (event.which === TS.utility.keymap.enter) {
          event.stopPropagation();
        } else if (event.which === TS.utility.keymap.tab) {
          event.stopPropagation();
        } else if (event.which === TS.utility.keymap.esc) {
          event.stopPropagation();
          event.preventDefault();
        }
      } else if (!TS.ui.react_emoji_menu.is_showing) {
        if (event.which === TS.utility.keymap.enter && !this._$input.tab_complete_ui("isShowing") && this.isSaveable()) {
          event.stopPropagation();
          this._editCurrentStatus();
        } else if (event.which === TS.utility.keymap.tab && this._$input.tab_complete_ui("isShowing")) {
          event.stopPropagation();
        } else if (event.which === TS.utility.keymap.esc) {
          event.stopPropagation();
          event.preventDefault();
          if (!this._$input.tab_complete_ui("isShowing")) this._onCancel();
        }
      }
    },
    _onKeyup: function(event) {
      if ([TS.utility.keymap.enter, TS.utility.keymap.esc, TS.utility.keymap.tab].indexOf(event.which) > -1) return;
      this._toggleStatusClearIcon();
      this._toggleActionButtons();
      if (this.isEdited()) {
        this._maybeHidePresetsMenu();
      } else {
        this._maybeShowPresetsMenu(event);
      }
    },
    _maybeShowPresetsMenu: function(event) {
      if (this._has_presets_menu) {
        TS.menu.startWithList(event, this._$presets_list, {
          onClick: this._presetChosen,
          close_on_click: true,
          ignore_bounds: true,
          attach_to_target_at_full_width: true,
          keep_menu_open_if_target_clicked_again: true
        });
        TS.kb_nav.setAllowHighlightWithoutBlurringInput(true);
      }
    },
    _maybeHidePresetsMenu: function() {
      if (this._has_presets_menu && TS.model.menu_is_showing) {
        TS.menu.end();
      }
    },
    _maybeAddBodyClickHandler: function() {
      if (!this._has_form_context && this._has_presets_menu) {
        TS.utility.rAF(function() {
          $("body").on("click.client_ui_current_status_input", this._onBodyClick);
        }.bind(this));
      }
    },
    _maybeRemoveBodyClickHandler: function() {
      if (!this._has_form_context && this._has_presets_menu) $(document.body).off(".client_ui_current_status_input");
    },
    _openEmojiPicker: function(event) {
      var target_bounds = $(event.target).closest(".current_status_emoji_picker").dimensions_rect();
      var is_in_team_menu = !this._has_presets_menu;
      TS.ui.react_emoji_menu.start({
        e: event,
        callback: this.onEmojiSelected,
        position: is_in_team_menu ? "bottom-left" : "top-left",
        offset_y: is_in_team_menu ? TEAM_MENU_EMOJI_PICKER_OFFSET_Y : DEFAULT_EMOJI_PICKER_OFFSET_Y,
        target_bounds: target_bounds
      });
    },
    _toggleActionButtons: function() {
      this._$action_buttons.toggleClass("invisible", !this.isSaveable() || !this.hasText() && !this._selected_emoji);
    },
    _toggleStatusClearIcon: function() {
      this._$status_clear_icon_wrap.toggleClass("hidden", !this._selected_emoji && !this.hasText());
    },
    _presetChosen: function(event) {
      var $preset = $(event.target).closest(".current_status_preset_option");
      var preset_text = $preset.data("text") || "";
      var preset_emoji = $preset.data("emoji") || "";
      TS.utility.contenteditable.value(this._$input, preset_text);
      this._selectEmoji(preset_emoji);
      this._toggleStatusClearIcon();
      this._editCurrentStatus();
    },
    clearCurrentStatus: function() {
      TS.utility.contenteditable.clear(this._$input);
      TS.ui.validation.validate(this._$input);
      this._selectEmoji("");
      this._toggleStatusClearIcon();
      this._toggleActionButtons();
      this._editCurrentStatus();
    },
    clogStatusChange: function(new_status_text, new_status_emoji, custom_status_set_origin) {
      var args = {
        custom_status_set_origin: custom_status_set_origin
      };
      if (!new_status_text && !new_status_emoji) {
        args.custom_status = "UNKNOWN";
        TS.clog.track("CUSTOM_STATUS_CLEAR", args);
        return;
      }
      var selected_preset_index = this._getSelectedPresetIndex(new_status_text, new_status_emoji);
      args.custom_status = selected_preset_index > -1 ? PRESETS_FOR_CLOGGING[selected_preset_index] : "USER_DEFINED";
      args.custom_status_text = new_status_text;
      args.custom_status_emoji = new_status_emoji;
      TS.clog.track("CUSTOM_STATUS_SET", args);
    },
    _getSelectedPresetIndex: function(new_status_text, new_status_emoji) {
      if (_.isUndefined(new_status_text)) new_status_text = TS.utility.contenteditable.value(this._$input).trim();
      if (_.isUndefined(new_status_emoji)) new_status_emoji = this._selected_emoji;
      var presets = TS.team.getTeamCustomStatusPresets();
      var preset_text_index = _.findIndex(presets, function(preset) {
        return preset.text === new_status_text;
      });
      var preset_emoji_index = _.findIndex(presets, function(preset) {
        return preset.emoji === new_status_emoji;
      });
      return preset_text_index > -1 && preset_text_index === preset_emoji_index ? preset_text_index : -1;
    },
    _restoreCurrentStatus: function() {
      var current_status = TS.members.getMemberCurrentStatus(TS.model.user);
      TS.utility.contenteditable.value(this._$input, TS.format.unFormatMsg(current_status.text));
      TS.ui.validation.validate(this._$input);
      this._selectEmoji(current_status.emoji);
      this._toggleStatusClearIcon();
      this._toggleActionButtons();
    },
    _editCurrentStatus: function() {
      if (this._has_form_context) return Promise.resolve();
      if (!TS.ui.validation.validate(this._$input, {
          quiet: true,
          fast: true
        })) {
        TS.ui.validation.validate(this._$input);
        return Promise.resolve();
      }
      if (!this.isSaveable()) return Promise.resolve();
      this._maybeRemoveBodyClickHandler();
      var new_status_text = TS.utility.contenteditable.value(this._$input).trim();
      var new_status_emoji = this._selected_emoji || new_status_text && TS.model.team.prefs.custom_status_default_emoji;
      var custom_status_set_origin;
      if (this._has_presets_menu) {
        custom_status_set_origin = "FLEXPANE_PROFILE";
      } else if (!this._has_form_context) {
        custom_status_set_origin = "TEAM_MENU";
      }
      if (!TS.boot_data.feature_texty_takes_over) {
        this._$input.val("").val(new_status_text);
      }
      var calling_args = {
        profile: JSON.stringify({
          status_text: new_status_text,
          status_emoji: this._selected_emoji
        })
      };
      var promise = TS.api.call("users.profile.set", calling_args).catch(function(error) {
        this._restoreCurrentStatus();
        if (_.isFunction(this._onError)) this._onError(TS.members.getMemberCurrentStatus(TS.model.user));
        if (error.data.error === "ratelimited") {
          TS.generic_dialog.alert(TS.i18n.t("You’re changing your status too often! You might have better luck if you try again in a few minutes.", "current_status")());
        } else {
          TS.generic_dialog.alert(TS.i18n.t("Sorry! Something went wrong. Please try again.", "current_status")());
        }
        throw error;
      }.bind(this)).then(function() {
        this.clogStatusChange(new_status_text, new_status_emoji, custom_status_set_origin);
        if (TS.experiment.getGroup("custom_status_callout") !== "treatment" || TS.model.prefs.seen_custom_status_badge) return;
        return TS.prefs.setPrefByAPI({
          name: "seen_custom_status_badge",
          value: true
        });
      }.bind(this));
      TS.ui.inline_saver.show({
        target: this._$inline_saver,
        promise: promise
      });
      if (_.isFunction(this._onSave)) {
        this._onSave({
          text: new_status_text,
          emoji: new_status_emoji
        });
      }
      return promise;
    },
    _startTexty: function() {
      var edit_current_status = this._editCurrentStatus;
      var cancel_edit = this._onCancel;
      var on_focus = this._onFocus;
      var $input = this._$input;
      TS.utility.contenteditable.create($input, {
        modules: {
          tabcomplete: {
            completers: [TS.tabcomplete.emoji],
            positionMenu: function(menu) {
              menu.style.width = $input.outerWidth() + "px";
              menu.style.minWidth = 0;
              TS.tabcomplete.positionUIRelativeToInput(menu, $input);
            }
          }
        },
        singleLineInput: true,
        placeholder: TS.i18n.t("What’s your status?", "current_status")(),
        onFocus: function() {
          on_focus(jQuery.Event("focus", {
            target: $input,
            currentTarget: $input
          }));
        },
        onEnter: function() {
          edit_current_status();
          return false;
        },
        onEscape: function() {
          cancel_edit();
          return false;
        }
      });
      TS.utility.contenteditable.value($input, _.get(TS, "model.user.profile.status_text", ""));
      TS.utility.contenteditable.enable($input);
    }
  });
  var PRESETS_FOR_CLOGGING = ["IN_A_MEETING", "COMMUTING", "OUT_SICK", "VACATIONING", "WORKING_REMOTELY"];
  var TAB_COMPLETE_UI_MIN_WIDTH = 400;
  var DEFAULT_EMOJI_PICKER_OFFSET_Y = -5;
  var TEAM_MENU_EMOJI_PICKER_OFFSET_Y = 5;
})();
