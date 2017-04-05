(function() {
  "use strict";
  TS.registerModule("format.texty", {
    getFormattedDelta: function(delta) {
      if (!delta) return;
      var normalized_ops = delta.map(_normalizeOperation);
      var compressed_ops = _compressOperations(normalized_ops);
      var last_op = _.last(compressed_ops);
      last_op.insert = last_op.insert.replace(/\n$/, "");
      var formatted_ops = compressed_ops.map(_formatOperation);
      return new Texty.Delta(formatted_ops);
    },
    replaceSmartQuotes: function(str) {
      str = str.replace(/[\u2018|\u2019]/g, "'");
      str = str.replace(/[\u201c|\u201d]/g, '"');
      var replace_contents_map = [];
      str = TSF.replaceFormatContents(replace_contents_map, str, {
        replace_pre: true,
        replace_code: true,
        replace_url: true
      });
      var replace_emoticon_map = [];
      str = _replaceEmoticons(str, replace_emoticon_map);
      str = str.replace(/(\W|^)"(\S)/g, "$1“$2").replace(/(\u201c[^"]*)"([^"]*$|[^\u201c"]*\u201c)/g, "$1”$2").replace(/([^0-9])"/g, "$1”").replace(/(\W|^)'(\S)/g, "$1‘$2").replace(/([a-z])'([a-z])/gi, "$1’$2").replace(/((\u2018[^']*)|[a-z])'([^0-9]|$)/gi, "$1’$3").replace(/(\u2018)([0-9]{2}[^\u2019]*)(\u2018([^0-9]|$)|$|\u2019[a-z])/gi, "’$2$3").replace(/(\B|^)\u2018(?=([^\u2019]*\u2019\b)*([^\u2019\u2018]*\W[\u2019\u2018]\b|[^\u2019\u2018]*$))/gi, "$1’").replace(/'/g, "′");
      str = _swapOutEmoticonPlaceholders(str, replace_emoticon_map);
      str = TSF.swapOutPlaceholders(replace_contents_map, str);
      return str;
    },
    test: function() {
      var tests = {};
      Object.defineProperty(tests, "IGNORED_FORMATS", {
        get: function() {
          return IGNORED_FORMATS;
        },
        set: function(value) {
          IGNORED_FORMATS = value;
        }
      });
      return tests;
    }
  });
  var FORMATTING_SYMBOLS = {
    bold: function(text) {
      return "*" + text + "*";
    },
    italic: function(text) {
      return "_" + text + "_";
    },
    code: function(text) {
      return "`" + text + "`";
    },
    strike: function(text) {
      return "~" + text + "~";
    },
    "code-block": function(text) {
      return "```\n" + text + "\n```";
    },
    bracketed: function(text) {
      return "[" + text + "]";
    }
  };
  var SINGLE_LINE_FORMATS = ["bold", "italic", "code", "strike", "bracketed"];
  var IGNORED_FORMATS = ["code", "code-block"];
  var MONOSPACE_FONTS = ["monospace", "menlo", "consolas", "inconsolata", "courier", "monaco", "anonymous pro", "terminus", "source code pro"];

  function _normalizeOperation(op) {
    var next_op = {
      attributes: {},
      insert: op.insert
    };
    _.each(op.attributes, function(value, key) {
      if (key === "fontFamily" && _isFontFamilyMonospace(value)) {
        key = "code";
      }
      if (!FORMATTING_SYMBOLS[key] || !value) return;
      if (key === "code-block") key = "code";
      next_op.attributes[key] = true;
    });
    return next_op;
  }

  function _compressOperations(ops) {
    var compressed = ops.slice(0, 1);
    _.each(ops.slice(1), function(op) {
      var last_op = _.last(compressed);
      if (_.isEqual(op.attributes, last_op.attributes)) {
        last_op.insert += op.insert;
      } else {
        compressed.push(op);
      }
    });
    return compressed;
  }

  function _formatOperation(op) {
    var next_op = {
      insert: op.insert
    };
    _.each(op.attributes, function(value, format) {
      format = _getFriendlyFormat(next_op.insert, format);
      if (_.includes(IGNORED_FORMATS, format)) return;
      if (_.includes(SINGLE_LINE_FORMATS, format)) {
        var lines = next_op.insert.split("\n").map(function(line) {
          return _wrapWithSymbols(line, FORMATTING_SYMBOLS[format]);
        });
        next_op.insert = lines.join("\n");
      } else {
        next_op.insert = _wrapWithSymbols(next_op.insert, FORMATTING_SYMBOLS[format]);
      }
    });
    return next_op;
  }

  function _wrapWithSymbols(text, fn) {
    if (/^\s*$/.test(text)) return text;
    return text.replace(/^(\s*)((?:.|\n)*?)(\s*)$/, function(full, leading, middle, trailing) {
      return leading + fn(middle) + trailing;
    });
  }

  function _getFriendlyFormat(text, format) {
    if (format === "code-block" && text.match(/^[^\n]*\n?$/)) {
      return "code";
    }
    if (format === "code" && text.match(/\n/g)) {
      return "code-block";
    }
    return format;
  }

  function _isFontFamilyMonospace(font_family) {
    if (!font_family) return false;
    var family_lower = font_family.toLowerCase();
    if (_.includes(family_lower, " mono")) return true;
    return MONOSPACE_FONTS.some(function(typeface) {
      return _.includes(family_lower, typeface);
    });
  }

  function _replaceEmoticons(text, replacements) {
    TS.emoji.eachEmoticon(text, function(emoticon) {
      text = text.replace(emoticon, function(match, offset) {
        var rando = "<emoticon-placeholder-" + Date.now() + ">";
        replacements.push({
          emoticon: match,
          placeholder: rando
        });
        return rando;
      });
    });
    return text;
  }

  function _swapOutEmoticonPlaceholders(text, replacements) {
    replacements.forEach(function(replacement) {
      text = text.replace(replacement.placeholder, replacement.emoticon);
    });
    return text;
  }
})();
