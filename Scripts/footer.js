webpackJsonp([151], {
  1727: function(t, c) {
    $(function() {
      $("footer .links .col").click(function(t) {
        if (!$(t.target).closest("a").length) $(this).toggleClass("open");
      });
      $('[data-qa="pricing_footer"]').click(function() {
        TS.clog.track("GROWTH_PRICING", {
          contexts: {
            ui_context: {
              step: "homepage_footer",
              action: "click",
              ui_element: "pricing_link"
            }
          }
        });
      });
    }());
  }
}, [1727]);
