webpackJsonp([63], {
  16: function(n, t) {
    n.exports = function(n) {
      if ("undefined" !== typeof execScript) execScript(n);
      else eval.call(null, n);
    };
  },
  1927: function(n, t, e) {
    e(16)(e(1928));
  },
  1928: function(n, t) {
    n.exports = "// Show a warning to users that the caps lock key is on when they are typing in a password input.\n// Not a TS module since it is used on the sign in page and no TS.* files are loaded.\n\n// We don't really know if caps lock is on. We can tell if it was pressed but we don't know what state it is in.\n// We can only infer it from the last character typed in the password field.\n\n(function() {\n\njQuery(function($) {\n\t// webkit browsers on macs have a native caps lock warning\n\tvar is_mac = /Macintosh/.test(navigator.userAgent);\n\tvar is_webkit = /webkit/i.test(navigator.userAgent);\n\tif (is_mac && is_webkit) return;\n\n\t// IE10+ also has a native caps lock warning\n\t// IE11 doesn't report itself as MSIE so search for Trident, its rendering engine.\n\tvar is_ie = /Trident/.test(navigator.userAgent);\n\tif (is_ie) return;\n\n\t$(window.document).on('keypress', 'input[type=\"password\"]', function(e) {\n\t\t// http://stackoverflow.com/questions/348792/how-do-you-tell-if-caps-lock-is-on-using-javascript\n\t\tvar l = String.fromCharCode(e.which);\n\t\tvar caps_lock = false;\n\t\tif ((l.toUpperCase() === l && l.toLowerCase() !== l && !e.shiftKey) || (l.toUpperCase() !== l && l.toLowerCase() === l && e.shiftKey)) {\n\t\t\tcaps_lock = true;\n\t\t}\n\t\t\n\t\t// If we detect the caps lock key is on, show a message.\n\t\t// Remove it when the input is defocused or the caps lock key is pressed.\n\t\tif (caps_lock && !_isWarning(this)) {\n\t\t\t_addWarning(this);\n\t\t}\n\t}).on('blur', 'input[type=\"password\"]', function(e) {\n\t\t// remove the warning if the user removes focus from the password box\n\t\tif (_isWarning(this)) {\n\t\t\t_removeWarning(this);\n\t\t}\n\t}).on('keydown', 'input[type=\"password\"]', function(e) {\n\t\t// if caps lock is pressed (key code 20) while the warning is visible, remove the warning\n\t\tif (e.which === 20 && _isWarning(this)) {\n\t\t\t_removeWarning(this);\n\t\t}\n\t});\n});\n\nvar _addWarning = function(input) {\n\tvar warning = $('<label id=\"capslock_warning\" for=\"password\"><i class=\"ts_icon ts_icon_exclamation_triangle mustard_yellow\"></i>' + TS.i18n.t('Caps Lock is on', 'caps_lock_warn')() + '</label>');\n\t$(input).after(warning);\n\t$(input).data('warning_capslock', true);\n};\n\nvar _removeWarning = function(input) {\n\t$('#capslock_warning').remove();\n\t$(input).removeData('warning_capslock');\n};\n\nvar _isWarning = function(input) {\n\treturn !!$(input).data('warning_capslock');\n};\n\n})();";
  }
}, [1927]);
