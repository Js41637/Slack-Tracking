(function() {
  "use strict";
  TS.registerModule("tabcomplete.commands", {
    getMatch: function(text, is_user_solicited, start_index) {
      if (!_.isString(text)) return;
      if (_.isNumber(start_index) && start_index !== 0) return;
      var match, index;
      _.deburr(text).replace(/^(\/[\w\-]*)$/i, function(_, match_text, match_offset) {
        index = match_offset;
        match = text.substr(index, match_text.length);
      });
      if (!match) return;
      return {
        match: match,
        index: index
      };
    },
    getResultAtIndex: function(search_results, index) {
      if (!search_results || !_.isNumber(index)) return;
      var all_cmds = _.flatMap(search_results, "cmds");
      return _.find(all_cmds, {
        index: index
      });
    },
    getInsertData: function(result, query) {
      if (!result) return;
      var text = result.name;
      return {
        text: text
      };
    },
    search: function(text, options, callback) {
      var local_results = _getLocalResults(text);
      callback(null, local_results);
    },
    render: function(text, results) {
      var header_html = TS.templates.tabcomplete_command_header({
        text: text
      });
      var results_html = TS.templates.tabcomplete_command_results({
        results: results
      });
      return TS.tabcomplete.renderMenu(header_html, results_html);
    },
    onSelectedIndexChange: function(index) {
      TS.tabcomplete.onSelectedIndexChange(index);
    }
  });

  function _getLocalResults(text) {
    var cmds = _getLocalCmds();
    var search_text = text.toLowerCase();
    if (search_text) {
      cmds = cmds.filter(function(cmd) {
        if (cmd.name.indexOf(search_text) === 0) return true;
        if (cmd.aliases) {
          return cmd.aliases.some(function(alias) {
            return alias.indexOf(search_text) === 0;
          });
        }
        return false;
      });
    }
    var names = _.map(cmds, "name");
    var sorted_names = TS.cmd_handlers.sortNames(names);
    var sorted_cmds = sorted_names.map(function(name, i) {
      return _.assign({
        index: i,
        name: name
      }, TS.cmd_handlers[name]);
    });
    return TS.cmd_handlers.groupCmdsByType(sorted_cmds);
  }

  function _getLocalCmds() {
    var cmds_ob = TS.cmd_handlers.getAvailableUserCmds();
    var cmds = _.map(cmds_ob, function(cmd, name) {
      return _.assign({
        name: name
      }, cmd);
    });
    return cmds;
  }
})();
