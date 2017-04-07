(function() {
  "use strict";
  TS.registerModule("tabcomplete.channels", {
    getMatch: function(text) {
      if (!_.isString(text)) return;
      var channel_name_regex, match, index;
      if (TS.boot_data.feature_intl_channel_names) {
        channel_name_regex = /(^|\s)(#[^~`!@#$%^&*()+=[\]{}\\|;:'",.<>\/? ]*)$/i;
      } else {
        channel_name_regex = /(^|\s)(#[\w\-]*)$/i;
      }
      TS.i18n.deburr(text).replace(channel_name_regex, function(_, match_prefix, match_text, match_offset) {
        index = match_offset + match_prefix.length;
        match = text.substr(index, match_text.length);
      });
      if (!match) return;
      return {
        match: match,
        index: index
      };
    },
    shouldDisplayResults: function(query, results) {
      if (!query || _.isEmpty(results)) return false;
      var search_text = query.replace(/^#/, "").toLowerCase();
      var is_exact_match = results.length === 1 && results[0].name === search_text;
      return !is_exact_match;
    },
    getResultAtIndex: function(search_results, index) {
      if (!search_results || !_.isNumber(index)) return;
      return search_results[index];
    },
    getInsertData: function(result) {
      if (!result) return;
      var text = "#" + result.name;
      return {
        text: text
      };
    },
    search: function(text, options, callback) {
      var local_results = _getLocalResults(text);
      callback(null, local_results);
    },
    render: function(text, results) {
      var header_html = TS.templates.tabcomplete_channel_header({
        text: text
      });
      var results_html = TS.templates.tabcomplete_channel_results({
        results: results
      });
      return TS.tabcomplete.renderMenu(header_html, results_html);
    },
    onSelect: function(result, query) {
      if (!result) return;
      if (!query) query = "";
      query = query.replace(/^#/, "");
      TS.ui.frecency.record(result, query);
    },
    onSelectedIndexChange: function(index) {
      TS.tabcomplete.onSelectedIndexChange(index);
    }
  });

  function _getLocalResults(text) {
    var search_data = {
      channels: TS.channels.getUnarchivedChannelsForUser()
    };
    var search_options = {
      prefer_exact_match: true,
      frecency: true,
      limit: 25,
      allow_empty_query: true,
      search_previous_channel_names: true
    };
    var search_text = text.replace(/^#/, "");
    var results = TS.sorter.search(search_text, search_data, search_options);
    return _.map(results, "model_ob");
  }
})();
