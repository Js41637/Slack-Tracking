webpackJsonp([49], {
  0: function(t, n) {
    t.exports = function(t) {
      if (typeof execScript !== "undefined") execScript(t);
      else eval.call(null, t);
    };
  },
  2752: function(t, n, e) {
    e(0)(e(896));
  },
  896: function(t, n) {
    t.exports = "$(function () {\n\t'use strict';\n\n\t$('footer .links .col').click(function (e) {\n\t\t// only toggle the open class if the target was NOT a footer link\n\t\tif (!$(e.target).closest('a').length) {\n\t\t\t$(this).toggleClass('open');\n\t\t}\n\t});\n\n\t$('[data-qa=\"pricing_footer\"]').click(function () {\n\t\tTS.clog.track('GROWTH_PRICING', { contexts: { ui_context: {\n\t\t\t\t\tstep: 'homepage_footer',\n\t\t\t\t\taction: 'click',\n\t\t\t\t\tui_element: 'pricing_link'\n\t\t\t\t} } });\n\t});\n}());";
  }
}, [2752]);
