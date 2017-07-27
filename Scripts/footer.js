webpackJsonp([49], {

  /***/
  0:
    /***/
    (function(module, exports) {

      /*
      	MIT License http://www.opensource.org/licenses/mit-license.php
      	Author Tobias Koppers @sokra
      */
      module.exports = function(src) {
        if (typeof execScript !== "undefined")
          execScript(src);
        else
          eval.call(null, src);
      };


      /***/
    }),

  /***/
  895:
    /***/
    (function(module, exports, __webpack_require__) {

      __webpack_require__(0)(__webpack_require__(896));

      /***/
    }),

  /***/
  896:
    /***/
    (function(module, exports) {

      module.exports = "$(function () {\n\t'use strict';\n\n\t$('footer .links .col').click(function (e) {\n\t\t// only toggle the open class if the target was NOT a footer link\n\t\tif (!$(e.target).closest('a').length) {\n\t\t\t$(this).toggleClass('open');\n\t\t}\n\t});\n\n\t$('[data-qa=\"pricing_footer\"]').click(function () {\n\t\tTS.clog.track('GROWTH_PRICING', { contexts: { ui_context: {\n\t\t\t\t\tstep: 'homepage_footer',\n\t\t\t\t\taction: 'click',\n\t\t\t\t\tui_element: 'pricing_link'\n\t\t\t\t} } });\n\t});\n}());";

      /***/
    })

}, [895]);
