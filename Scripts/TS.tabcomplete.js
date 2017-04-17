(function() {
  "use strict";
  TS.registerModule("tabcomplete", {
    positionUIRelativeToInput: function(menu, input) {
      if (!menu || !input) return;
      var offset = $(input).offset();
      menu.style.left = offset.left + "px";
      menu.style.bottom = $(window).height() - offset.top + "px";
      var max_height = _.clamp(offset.top - $(menu).find(".tab_complete_ui_header").outerHeight() - 2, 454);
      $(menu).find(".tab_complete_ui_scroller").css("maxHeight", max_height + "px");
    },
    renderMenu: function(header_html, results_html) {
      return TS.templates.tabcomplete_menu({
        safe_header_html: new Handlebars.SafeString(header_html),
        safe_results_html: new Handlebars.SafeString(results_html)
      });
    },
    onSelectedIndexChange: function(index) {
      var $items = $(".tab_complete_ui_item");
      $items.removeClass("active");
      $items.eq(index).addClass("active");
      $items.eq(index).scrollintoview({
        duration: 0
      });
    },
    isAllowedSurroundingCharacter: function(char) {
      if (!char || !char.trim()) return true;
      return TS.tabcomplete.trimSurroundingSymbols(char) === "";
    },
    trimSurroundingSymbols: function(text) {
      if (!text) return "";
      return text.replace(PRECEDING_SYMBOLS_RX, "");
    },
    test: function() {
      return {
        ALLOWED_PRECEDING_SYMBOLS: ALLOWED_PRECEDING_SYMBOLS
      };
    }
  });
  var ALLOWED_PRECEDING_SYMBOLS = ["{", "[", "(", "*", "_", "/", '"', "“", "'", "‘", "<"];
  var PRECEDING_SYMBOLS_RX = function(symbols) {
    var escaped_symbols = symbols.map(function(symbol) {
      return "\\" + symbol;
    });
    return new RegExp("^(" + escaped_symbols.join("|") + ")+", "g");
  }(ALLOWED_PRECEDING_SYMBOLS);
})();
