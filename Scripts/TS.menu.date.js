(function() {
  "use strict";
  TS.registerModule("menu.date", {
    onStart: function() {},
    startWithExpirationPresets: function(options) {
      _date_picker_args = options.date_picker_args;
      _onSelect = options.onSelect;
      _setupPresetsMenu();
      _showMenu(options);
    }
  });
  var _date_picker_args;
  var _onSelect;
  var _DEFAULT_Y_OFFSET = 5;
  var _showMenu = function(options) {
    var attach_to_target = _.isUndefined(options.attach_to_target) ? true : options.attach_to_target;
    TS.menu.start(options.event, false, {
      attach_to_target_at_full_width: attach_to_target,
      onClose: options.onClose
    });
    if (attach_to_target) {
      var top = TS.menu.$menu.outerHeight() * -1 - _DEFAULT_Y_OFFSET;
      var left = options.$target.position().left - TS.menu.$menu.outerWidth() / 2 + options.$target.outerWidth() / 2;
      TS.menu.$menu.css({
        top: Math.floor(top),
        left: Math.floor(left)
      });
    } else {
      var x = options.$target.outerWidth() / 2 * -1;
      var y = options.$target.outerHeight() + _DEFAULT_Y_OFFSET;
      TS.menu.positionAt(options.$target, Math.floor(x), Math.floor(y));
    }
  };
  var _setupPresetsMenu = function() {
    TS.menu.buildIfNeeded();
    TS.menu.clean();
    TS.menu.$menu.addClass("expiration_date_picker");
    TS.menu.$menu_header.addClass("hidden").empty();
    TS.menu.$menu_items.html(TS.templates.menu_expiration_date_items());
    TS.menu.$menu_items.on("click.menu", "li", _onExpirationPresetClick);
    TS.menu.$menu_footer.removeClass("hidden").html(TS.templates.menu_expiration_context());
  };
  var _setupDatePickerMenu = function() {
    TS.menu.buildIfNeeded();
    TS.menu.clean();
    TS.menu.$menu.addClass("date_picker expiration_date_picker");
    TS.menu.$menu_header.addClass("hidden").empty();
    TS.menu.$menu_footer.addClass("hidden").empty();
    TS.menu.$menu_items.html(TS.templates.menu_expiration_date_picker());
    TS.menu.$menu_items.on("click.menu", "li#date_picker_back_item", function(e) {
      _setupPresetsMenu();
      e.stopPropagation();
    });
    var date_picker_args = {
      onChange: _onDateSelected,
      onHide: _destroyDatePicker
    };
    _.assign(date_picker_args, _date_picker_args);
    var $date_picker_container = TS.menu.$menu.find("#date_picker_container");
    TS.ui.date_picker.startExpirationDatePicker($date_picker_container, date_picker_args);
  };
  var _onDateSelected = function(date_ts) {
    if (typeof date_ts === "string") date_ts = parseInt(date_ts, 10);
    if (isNaN(date_ts)) {
      TS.warn("date_ts could not be parsed as a number.");
      return;
    }
    if (_onSelect) _onSelect(date_ts);
    TS.menu.end();
  };
  var _onExpirationPresetClick = function(e) {
    if (TS.menu.isRedundantClick(e)) return;
    var option = $(this).attr("data-expiration-option");
    if (!option) {
      TS.warn("Selected an invalid expiration date menu item.");
      return;
    }
    var date_ts;
    switch (option) {
      case "none":
        _onDateSelected(0);
        break;
      case "7days":
        date_ts = _makeExpirationDateUnixTsFromDays(7);
        _onDateSelected(date_ts);
        break;
      case "30days":
        date_ts = _makeExpirationDateUnixTsFromDays(30);
        _onDateSelected(date_ts);
        break;
      case "60days":
        date_ts = _makeExpirationDateUnixTsFromDays(60);
        _onDateSelected(date_ts);
        break;
      case "custom":
        _setupDatePickerMenu();
        break;
      default:
        break;
    }
    e.stopPropagation();
  };
  var _destroyDatePicker = function() {
    var $date_picker_target = $("#date_picker_container");
    if ($date_picker_target.pickmeup) _.defer(function() {
      $date_picker_target.pickmeup("destroy");
    });
  };
  var _makeExpirationDateUnixTsFromDays = function(num_days) {
    if (!_.isNumber(num_days)) {
      TS.error("num_days must be a number.");
      return;
    }
    var date = new Date;
    date.setHours(23, 59, 59, 0);
    date.setDate(date.getDate() + num_days);
    var unix_ts = date.getTime() / 1e3;
    return unix_ts;
  };
})();
