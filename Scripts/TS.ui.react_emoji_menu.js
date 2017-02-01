(function() {
  "use strict";
  TS.registerModule("ui.react_emoji_menu", {
    onStart: function() {
      TS.prefs.emoji_mode_changed_sig.add(_reRender);
      TS.prefs.preferred_skin_tone_changed_sig.add(_updateHandyRxnsAndReRender);
      TS.prefs.team_handy_rxns_changed_sig.add(_updateHandyRxnsAndReRender);
      TS.prefs.channel_handy_rxns_changed_sig.add(_updateHandyRxnsAndReRender);
    },
    start: function(args) {
      if (TS.boot_data.feature_react_emoji_picker && TS.client) _start(args);
    }
  });
  var _$trigger;
  var _input_to_fill = "#message-input";
  var _rxn_key;
  var _callback;
  var _coords;
  var _handy_rxns;
  var _start = function(args) {
    _rxn_key = args.rxn_key;
    if (_rxn_key) {
      _updateHandyRxns();
      _callback = function(emoji_name) {
        var adding = !TS.rxns.doesRxnsHaveRxnFromUser(TS.rxns.getExistingRxnsByKey(args.rxn_key), emoji_name);
        TS.rxns.changeRxnsFromUserAction(args.rxn_key, emoji_name, adding);
        if (args.callback) args.callback();
      };
    } else {
      _callback = args.callback;
    }
    _input_to_fill = !_rxn_key && (args.input_to_fill || _input_to_fill);
    if (TS.client && TS.utility.contenteditable.isDisabled(TS.client.ui.$msg_input) && _input_to_fill) {
      var triggered_from_inline_reply = $(_input_to_fill).closest("ts-conversation").length > 0;
      if (!triggered_from_inline_reply) {
        return;
      }
    }
    _$trigger = $(args.e && args.e.target);
    _toggleTriggerStyle({
      open: true,
      is_rxn: !!_rxn_key
    });
    TS.tips.hideAll();
    _coords = _$trigger.dimensions_rect();
    TS.menu.emoji.is_showing = true;
    _render();
  };
  var _end = function() {
    _toggleTriggerStyle({
      open: false,
      is_rxn: !!_rxn_key
    });
    _$trigger = null;
    _input_to_fill = "#message-input";
    _rxn_key = null;
    _callback = null;
    _handy_rxns = null;
    TS.tips.unhideAll();
    TS.menu.emoji.is_showing = false;
    _render();
  };
  var _render = function(picker_args, popover_args) {
    if (!TS.boot_data.feature_react_emoji_picker || !TS.client) return;
    var picker_props = _buildEmojiPickerProps(picker_args);
    var popover_props = _buildPopoverProps(popover_args);
    _renderEmojiPickerPopover(picker_props, popover_props);
  };
  var _toggleTriggerStyle = function(args) {
    if (args.is_rxn) {
      _$trigger.closest(".menu_rxn").toggleClass("active", args.open);
      _$trigger.closest(".rxn_panel").toggleClass("active", args.open);
      _$trigger.closest("ts-message").toggleClass("active", args.open);
      _$trigger.toggleClass("active", args.open);
    } else {
      _$trigger.closest("a.emo_menu").toggleClass("active", args.open);
      _$trigger.closest(".handy_rxns_row").toggleClass("active", args.open);
      _$trigger.closest(".current_status_emoji_picker").toggleClass("active", args.open);
    }
  };
  var _updateHandyRxns = function(rxn_key) {
    var rxns = TS.rxns.getHandyRxnsDisplayDataByRxnKey(rxn_key);
    _handy_rxns = _.map(rxns.items, function(rxn) {
      return rxn.name;
    });
  };
  var _getSkinToneChoices = function() {
    if (TS.model.prefs.emoji_mode === "google") return [];
    return [":hand:", ":hand::skin-tone-2:", ":hand::skin-tone-3:", ":hand::skin-tone-4:", ":hand::skin-tone-5:", ":hand::skin-tone-6:"];
  };
  var _fillInput = function(e, emoji) {
    var $input_to_fill = $(_input_to_fill);
    var should_focus = !(e && e.shiftKey);
    if (TS.boot_data.feature_texty && TS.utility.contenteditable.isContenteditable($input_to_fill)) {
      setTimeout(TS.utility.contenteditable.insertTextAtCursor, 0, _input_to_fill, emoji.name, should_focus);
    } else {
      var current_pos = TS.utility.getCursorPosition($input_to_fill).start;
      var new_pos = current_pos + emoji.name.length;
      var current_val = TS.utility.contenteditable.value($input_to_fill);
      var new_val = current_val.substr(0, current_pos) + emoji.name + current_val.substr(current_pos);
      TS.utility.populateInput($input_to_fill, new_val);
      if (should_focus) setTimeout(TS.utility.setCursorPosition, 0, _input_to_fill, new_pos);
    }
  };
  var _buildEmojiPickerProps = function(args) {
    args = args || {};
    var props = {
      onSkinToneChanged: _onSkinToneChanged,
      groups: TS.model.emoji_groups,
      skinToneChoiceNames: _getSkinToneChoices(),
      activeSkinToneId: args.skin_tone_id || TS.model.prefs.preferred_skin_tone,
      numBackgroundColors: TS.model.emoji_menu_colors,
      onSelected: _onSelect,
      onClosed: _onClose
    };
    if (_rxn_key) props.handyRxnNames = _handy_rxns;
    return props;
  };
  var _buildPopoverProps = function(args) {
    return {
      targetBounds: _coords,
      position: "top-left",
      offsetY: -6,
      isOpen: TS.menu.emoji.is_showing,
      onClose: _onClose
    };
  };
  var _onSelect = function(e, emoji) {
    if (_callback) {
      setTimeout(_callback, 0, emoji.name);
      return;
    }
    if (!_input_to_fill) return TS.error("Could not find an _input_to_fill.");
    _fillInput(e, emoji);
  };
  var _onClose = function() {
    _end();
  };
  var _onSkinToneChanged = function(new_skin_tone_id) {
    TS.prefs.onPrefChanged({
      name: "preferred_skin_tone",
      value: new_skin_tone_id
    });
    TS.prefs.setPrefByAPI({
      name: "preferred_skin_tone",
      value: new_skin_tone_id
    });
    if (_rxn_key) _updateHandyRxns(_rxn_key);
    if (TS.menu.emoji.is_showing) {
      var optimistic_picker_props = {
        skin_tone_id: new_skin_tone_id
      };
      _render(optimistic_picker_props);
    }
  };
  var _reRender = function() {
    if (TS.menu.emoji.is_showing) _.defer(_render);
  };
  var _updateHandyRxnsAndReRender = function() {
    if (_rxn_key) _updateHandyRxns(_rxn_key);
    _reRender();
  };
  var _renderEmojiPickerPopover = function(picker_props, popover_props) {
    TS.metrics.mark("react_emoji_menu_render_mark");
    var emoji_picker = React.createElement(ReactComponents.EmojiPicker, picker_props, null);
    var popover = React.createElement(ReactComponents.Popover, popover_props, emoji_picker);
    ReactDOM.render(popover, document.getElementById("reactroot_emoji_picker"), function() {
      TS.metrics.measureAndClear("react_emoji_menu_render", "react_emoji_menu_render_mark");
    });
  };
})();
