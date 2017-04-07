(function() {
  "use strict";
  TS.registerModule("tabcomplete.emoji", {
    getMatch: function(text, is_user_solicited) {
      if (!_.isString(text)) return;
      var match, index;
      _.deburr(text).replace(/(^|\s+)([\+\-]?:[\w\-\+]*)$/i, function(_, match_prefix, match_text, match_offset) {
        index = match_offset + match_prefix.length;
        match = text.substr(index, match_text.length);
      });
      if (!match) return;
      if (!is_user_solicited) {
        if (match.length < MIN_MATCH_LENGTH) return;
      }
      return {
        match: match,
        index: index
      };
    },
    shouldDisplayResults: function(query, data, is_user_solicited) {
      if (!query || _.isEmpty(data) || _.isEmpty(data.results)) return false;
      if (data.results.length === 1 && is_user_solicited) return false;
      return true;
    },
    getResultAtIndex: function(search_results, index) {
      if (!search_results || !search_results.results || !_.isNumber(index)) return;
      var result = search_results.results[index];
      if (!result) return;
      return {
        action: search_results.action,
        emoji: result
      };
    },
    getInsertData: function(result) {
      if (!result || !result.emoji) return;
      var text = result.emoji.name_with_colons;
      if (result.emoji.is_skin) text += TS.emoji.getChosenSkinToneModifier() || "";
      if (result.action === "add_rxn") {
        text = "+" + text;
      } else if (result.action === "remove_rxn") {
        text = "-" + text;
      }
      return {
        text: text
      };
    },
    getNextSelectedIndex: function(params) {
      var direction;
      switch (params.keyCode) {
        case TS.utility.keymap.right:
          direction = "right";
          break;
        case TS.utility.keymap.left:
          direction = "left";
          break;
        case TS.utility.keymap.up:
          direction = "up";
          break;
        case TS.utility.keymap.down:
          direction = "down";
          break;
        default:
          break;
      }
      if (!direction) return;
      var elements = _getResultElements(params.menu);
      if (elements.length === 1) return 0;
      if (direction === "right") {
        return params.selectedIndex < elements.length - 1 ? params.selectedIndex + 1 : 0;
      }
      if (direction === "left") {
        return params.selectedIndex > 0 ? params.selectedIndex - 1 : elements.length - 1;
      }
      if (!TS.boot_data.feature_tinyspeck) return;
      var items = _.map(elements, function(element, i) {
        var data = _resultElementToData(element);
        data.index = i;
        return data;
      });
      var anchor = items[params.selectedIndex];
      var next_row = _getNextRow(anchor, items, direction === "down");
      var next_item = _itemWithHighestOverlap(anchor, next_row);
      if (!next_item) {
        if (direction === "down") return elements.length - 1;
        if (direction === "up") return 0;
      }
      return next_item.index;
    },
    search: function(text, options, callback) {
      var prefix = /^(\+|\-):/.test(text) ? text[0] : "";
      var index = options.index;
      var local_results = _getLocalResults(text);
      var data;
      if (index === 0 && prefix) {
        var model_ob = TS.shared.getActiveModelOb();
        var rxns = _getPrevMsgRxns(model_ob);
        if (prefix === "-") {
          var rxns_filtered;
          if (TS.boot_data.feature_tinyspeck) {
            rxns_filtered = _sortResults(text, rxns);
          } else {
            rxns_filtered = local_results;
          }
          if (!_.isEmpty(rxns_filtered)) {
            data = {
              action: "remove_rxn",
              results: rxns_filtered
            };
          }
        } else if (prefix === "+") {
          var local_results_without_rxns;
          if (TS.boot_data.feature_tinyspeck) {
            local_results_without_rxns = _.difference(local_results, rxns);
          } else {
            local_results_without_rxns = local_results;
          }
          if (!_.isEmpty(local_results_without_rxns)) {
            data = {
              action: "add_rxn",
              results: local_results_without_rxns
            };
          }
        }
      } else {
        data = {
          action: "search",
          results: local_results
        };
      }
      if (data && !data.results.length) data = null;
      callback(null, data);
    },
    render: function(text, data) {
      var header_html = TS.templates.tabcomplete_emoji_header({
        text: text,
        action: data.action
      });
      var emoji = _.map(data.results, function(result) {
        return _getTemplateArgsForEmoji(result, data.action);
      });
      var results_html = TS.templates.tabcomplete_emoji_results({
        results: emoji
      });
      return TS.tabcomplete.renderMenu(header_html, results_html);
    },
    onSelect: function(result, query) {
      if (!result || !result.emoji) return;
      if (!query) query = "";
      query = query.replace(/^:/, "");
      TS.ui.frecency.record(result.emoji, query);
    },
    onSelectedIndexChange: function(index) {
      TS.tabcomplete.onSelectedIndexChange(index);
    },
    test: function() {
      var tests = {};
      Object.defineProperty(tests, "_getResultElements", {
        get: function() {
          return _getResultElements;
        },
        set: function(value) {
          _getResultElements = value;
        }
      });
      Object.defineProperty(tests, "_getLocalResults", {
        get: function() {
          return _getLocalResults;
        },
        set: function(value) {
          _getLocalResults = value;
        }
      });
      Object.defineProperty(tests, "_getPrevMsgRxns", {
        get: function() {
          return _getPrevMsgRxns;
        },
        set: function(value) {
          _getPrevMsgRxns = value;
        }
      });
      Object.defineProperty(tests, "_sortResults", {
        get: function() {
          return _sortResults;
        },
        set: function(value) {
          _sortResults = value;
        }
      });
      return tests;
    }
  });
  var MIN_MATCH_LENGTH = 3;
  var _getPrevMsgRxns = function(model_ob) {
    var visible_msgs = TS.utility.msgs.getDisplayedMsgs(model_ob.msgs);
    var prev_msg = _.find(visible_msgs, function(msg) {
      return !msg.is_ephemeral;
    });
    if (!prev_msg) return;
    var rxns = TS.rxns.getMemberRxnsFromMessage(prev_msg, TS.model.user.id);
    var emoji = _.map(rxns, function(rxn) {
      var name_without_skin = rxn.name.replace(/(:.+)$/, "");
      return TS.emoji.getEmojiByName(name_without_skin);
    });
    return _.compact(emoji);
  };
  var _getResultElements = function(menu) {
    if (!menu) return [];
    return _.toArray(menu.querySelectorAll(".tab_complete_ui_item"));
  };
  var _resultElementToData = function(element) {
    var offset_left = element.offsetLeft;
    return {
      left: offset_left,
      right: offset_left + element.offsetWidth,
      top: element.offsetTop
    };
  };
  var _getNextRow = function(anchor, items, is_down) {
    if (!anchor || !items || !items.length) return;
    var rows_by_top = _.groupBy(items, "top");
    var tops = _.map(_.keys(rows_by_top), _.toNumber);
    var anchor_top_index = tops.indexOf(anchor.top);
    var next_top_index = is_down ? anchor_top_index + 1 : anchor_top_index - 1;
    var next_top = tops[next_top_index];
    return rows_by_top[next_top];
  };
  var _itemWithHighestOverlap = function(anchor, items) {
    if (!anchor || !items || !items.length) return;
    var overlapping_items = items.filter(function(item) {
      if (_.inRange(item.left, anchor.left, anchor.right)) return true;
      if (_.inRange(item.right, anchor.left, anchor.right)) return true;
      if (item.left < anchor.left && item.right > anchor.right) return true;
      return false;
    });
    if (!overlapping_items) return;
    var most_in_common = _.maxBy(overlapping_items, function(item) {
      var start = Math.max(item.left, anchor.left);
      var end = Math.min(item.right, anchor.right);
      return end - start;
    });
    return most_in_common;
  };
  var _getLocalResults = function(text) {
    return _sortResults(text, TS.model.emoji_map);
  };
  var _sortResults = function(text, results) {
    if (!results || !results.length) return [];
    var search_data = {
      emoji: results
    };
    var search_options = {
      allow_empty_query: true,
      frecency: true,
      limit: 50,
      prefer_exact_match: true
    };
    var search_text = text.replace(/^(\+|\-)?:/, "");
    results = TS.sorter.search(search_text, search_data, search_options);
    return _.map(results, "model_ob");
  };
  var _getTemplateArgsForEmoji = function(emoji) {
    var args = {
      emoji_is_plain_text_only: TS.model.prefs.emoji_mode === "as_text",
      emoji: emoji
    };
    if (emoji.is_skin) {
      args.show_skin_tone_variant = emoji.is_skin;
      args.emoji_name_with_colons_and_skin = emoji.name_with_colons + TS.emoji.getChosenSkinToneModifier();
    }
    return args;
  };
})();
