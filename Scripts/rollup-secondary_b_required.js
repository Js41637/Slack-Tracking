(function() {
  "use strict";
  TS.registerModule("generic_dialog", {
    div: null,
    is_showing: false,
    current_setting: null,
    body_template_html: {},
    Q: [],
    ladda_go: null,
    onKeydown: function(e) {
      var current_setting = TS.generic_dialog.current_setting;
      if (e.which == TS.utility.keymap.enter) {
        if (TS.utility.getActiveElementProp("NODENAME") == "BODY" || current_setting.enter_always_gos) {
          if (current_setting.show_go_button) {
            TS.generic_dialog.go();
            e.preventDefault();
          }
        }
      } else if (e.which == TS.utility.keymap.esc) {
        if (TS.utility.getActiveElementProp("NODENAME") == "BODY") {
          if (current_setting.show_cancel_button) {
            TS.generic_dialog.cancel();
          } else if (current_setting.esc_for_ok) {
            TS.generic_dialog.go();
          }
        }
      }
    },
    alert: function(txt, title, go_button_text) {
      return new Promise(function(resolve) {
        TS.generic_dialog.start({
          title: title || "",
          body: txt,
          show_cancel_button: false,
          esc_for_ok: true,
          fullscreen: false,
          go_button_text: go_button_text,
          onGo: resolve
        });
      });
    },
    graphics: {
      error: "oops"
    },
    dark: function(msg, title, graphic) {
      return new Promise(function(resolve) {
        TS.generic_dialog.start({
          type: "dark",
          graphic: graphic || false,
          title: title || "",
          body: msg,
          show_close_button: false,
          show_cancel_button: true,
          cancel_button_text: _CLOSE_TEXT,
          fullscreen: false,
          show_go_button: false,
          onCancel: resolve
        });
      });
    },
    start: function(setting) {
      if (setting.fullscreen) {
        TS.ui.fs_modal.start(setting);
        return;
      }
      if (TS.generic_dialog.is_showing) {
        if (setting.unique && TS.generic_dialog.current_setting.unique == setting.unique) {
          TS.info("redundant generic dialog not Qed: " + setting.unique);
        } else {
          TS.generic_dialog.Q.push(setting);
        }
        return;
      }
      var current_setting = TS.generic_dialog.current_setting = _.defaults({}, setting, _DEFAULT_SETTING);
      if (typeof setting.show_close_button === "undefined") {
        current_setting.show_close_button = current_setting.show_cancel_button;
      }
      if (!TS.generic_dialog.div) TS.generic_dialog.build();
      var $div = TS.generic_dialog.div;
      var body_html = current_setting.body;
      if (current_setting.body_template) {
        if (TS.generic_dialog.body_template_html[current_setting.body_template]) {
          body_html = TS.generic_dialog.body_template_html[current_setting.body_template];
          if (current_setting.body) {
            TS.warn("both body and body_template were passed on settings, using body_template");
          }
          if (current_setting.$body) {
            TS.warn("both $body and body_template were passed on settings, using body_template");
          }
        } else {
          TS.error(current_setting.body_template + " not found in TS.generic_dialog.body_template_html");
        }
      }
      if (current_setting.dialog_class) {
        $div.addClass(current_setting.dialog_class);
      }
      var html = TS.templates.generic_dialog({
        title: new Handlebars.SafeString(current_setting.title),
        body: new Handlebars.SafeString(body_html),
        ladda: current_setting.ladda,
        type: current_setting.type,
        img: current_setting.graphic
      });
      $div.empty();
      $div.html(html);
      if (current_setting.$body) {
        $div.find(".modal-body").empty().append(current_setting.$body);
      }
      if (current_setting.body_cls) {
        $div.find(".modal-body").addClass(current_setting.body_cls);
      }
      $div.find(".close").bind("click", function() {
        if (current_setting.show_cancel_button) {
          TS.generic_dialog.cancel();
        } else if (current_setting.esc_for_ok) {
          TS.generic_dialog.go();
        }
      });
      $div.find(".dialog_go").click(TS.generic_dialog.go);
      if (current_setting.ladda) {
        $div.find(".dialog_go .ladda-label").html(current_setting.go_button_text);
      } else {
        $div.find(".dialog_go").html(current_setting.go_button_text);
      }
      if (current_setting.show_go_button) {
        $div.find(".dialog_go").removeClass("hidden").addClass(current_setting.go_button_class);
      } else {
        $div.find(".dialog_go").addClass("hidden");
      }
      $div.find(".dialog_secondary_go").click(TS.generic_dialog.secondaryGo);
      $div.find(".dialog_secondary_go").html(current_setting.secondary_go_button_text);
      if (current_setting.show_secondary_go_button) {
        $div.find(".dialog_secondary_go").removeClass("hidden").addClass(current_setting.secondary_go_button_class);
      } else {
        $div.find(".dialog_secondary_go").addClass("hidden");
      }
      $div.find(".dialog_cancel").click(TS.generic_dialog.cancel);
      $div.find(".dialog_cancel").html(current_setting.cancel_button_text);
      $div.find(".dialog_cancel").toggleClass("hidden", !current_setting.show_cancel_button);
      $div.find(".close").toggleClass("hidden", !current_setting.show_close_button);
      if (current_setting.show_throbber) {
        $div.find(".throbber").removeClass("hidden");
      } else {
        $div.find(".throbber").addClass("hidden");
      }
      if (current_setting.title) {
        $div.find(".modal-header").removeClass("hidden");
      } else {
        $div.find(".modal-header").addClass("hidden");
      }
      var has_footer_buttons = current_setting.show_go_button || current_setting.show_secondary_go_button || current_setting.show_cancel_button;
      var hide_footer = !has_footer_buttons || current_setting.hide_footer;
      $div.find(".modal-footer").toggleClass("hidden", !!hide_footer);
      $div.modal("show");
      if (current_setting.backdrop_click_to_dismiss) {
        $(".modal-backdrop").click(function() {
          TS.generic_dialog.cancel();
        });
      }
      if (current_setting.type === "dark") {
        $(".modal-backdrop").addClass("c-modal_backdrop--dark");
      }
      if (current_setting.title || current_setting.force_small) {
        $div.removeClass("small");
      } else {
        $div.addClass("small");
      }
      if (document.activeElement && document.activeElement != document.body) {
        document.activeElement.blur();
      }
      if (current_setting.onShow) {
        current_setting.onShow();
      }
    },
    go: function() {
      if (!TS.generic_dialog.is_showing) {
        TS.error("not showing?");
        return;
      }
      var current_setting = TS.generic_dialog.current_setting;
      var $div = TS.generic_dialog.div;
      if (current_setting.onGo) {
        if (current_setting.onGo() !== false) {
          $div.modal("hide");
        }
      } else {
        $div.modal("hide");
      }
    },
    secondaryGo: function(e) {
      if (!TS.generic_dialog.is_showing) {
        TS.error("not showing?");
        return;
      }
      var current_setting = TS.generic_dialog.current_setting;
      var $div = TS.generic_dialog.div;
      if (current_setting.onSecondaryGo) {
        if (current_setting.onSecondaryGo(e) !== false) {
          $div.modal("hide");
        }
      } else {
        $div.modal("hide");
      }
    },
    cancel: function() {
      var current_setting = TS.generic_dialog.current_setting;
      TS.generic_dialog.div.modal("hide");
      if (current_setting.onCancel) {
        current_setting.onCancel();
      }
    },
    end: function() {
      var current_setting = TS.generic_dialog.current_setting;
      TS.generic_dialog.is_showing = TS.model.dialog_is_showing = false;
      $(window.document).unbind("keydown", TS.generic_dialog.onKeydown);
      if (current_setting.$body) current_setting.$body.detach();
      TS.generic_dialog.div.empty();
      if (current_setting.dialog_class) {
        TS.generic_dialog.div.removeClass(current_setting.dialog_class);
      }
      if (current_setting.onEnd) {
        current_setting.onEnd();
      }
      TS.generic_dialog.ladda_go = null;
      if (!TS.generic_dialog.is_showing && TS.generic_dialog.Q.length) {
        var o = TS.generic_dialog.Q.shift();
        TS.generic_dialog.start(o);
      }
    },
    build: function() {
      var modal_type = TS.generic_dialog.current_setting && TS.generic_dialog.current_setting.type || "default";
      $("body").append('<div id="generic_dialog" class="modal c-modal--' + modal_type + ' hide fade" data-keyboard="false" data-backdrop="static"></div>');
      var $div = TS.generic_dialog.div = $("#generic_dialog");
      $div.on("hidden", function(e) {
        if (e.target != this) return;
        setTimeout(function() {
          TS.generic_dialog.end();
          $div.removeAttr("data-qa");
        }, 200);
      });
      $div.on("show", function(e) {
        if (e.target != this) return;
        TS.generic_dialog.is_showing = TS.model.dialog_is_showing = true;
      });
      $div.on("shown", function(e) {
        if (e.target != this) return;
        setTimeout(function() {
          if (!TS.generic_dialog.is_showing) return;
          $div.find(".title_input").select();
          $(window.document).bind("keydown", TS.generic_dialog.onKeydown);
          $div.attr("data-qa", "generic_dialog_ready");
          if (TS.generic_dialog.current_setting.ladda) {
            TS.generic_dialog.ladda_go = Ladda.create($div.find(".dialog_go")[0]);
          }
        }, 100);
      });
    },
    startLadda: function() {
      if (TS.generic_dialog.ladda_go) TS.generic_dialog.ladda_go.start();
      TS.generic_dialog.div.find(".dialog_go").addClass("disabled");
    },
    stopLadda: function() {
      TS.generic_dialog.div.find(".dialog_go").removeClass("disabled");
      if (TS.generic_dialog.ladda_go) TS.generic_dialog.ladda_go.stop();
    },
    showError: function(txt) {
      var $error = TS.generic_dialog.div.find(".modal-footer .generic_dialog_error");
      if (!$error.length) {
        $error = $('<div class="generic_dialog_error yolk_orange top_margin">');
        TS.generic_dialog.div.find(".modal-footer").append($error);
      }
      $error.text(txt);
    },
    hideError: function() {
      TS.generic_dialog.div.find(".modal-footer .generic_dialog_error").remove();
    }
  });
  var _CANCEL_TEXT = TS.i18n.t("Cancel", "generic_dialog")();
  var _CLOSE_TEXT = TS.i18n.t("Close", "generic_dialog")();
  var _OKAY_TEXT = TS.i18n.t("OK", "generic_dialog")();
  var _DEFAULT_SETTING = {
    type: "default",
    graphic: false,
    title: "",
    body: "BODY",
    body_template: null,
    body_cls: null,
    $body: null,
    show_go_button: true,
    show_secondary_go_button: false,
    show_cancel_button: true,
    go_button_text: _OKAY_TEXT,
    go_button_class: "",
    secondary_go_button_text: _OKAY_TEXT,
    secondary_go_button_class: "",
    cancel_button_text: _CANCEL_TEXT,
    onGo: null,
    onSecondaryGo: null,
    onCancel: null,
    onEnd: null,
    show_throbber: false,
    esc_for_ok: false,
    onShow: null,
    force_small: false,
    enter_always_gos: false,
    fullscreen: false,
    dialog_class: null,
    hide_footer: false,
    backdrop_click_to_dismiss: false
  };
})();
(function() {
  "use strict";
  TS.registerModule("sidebar_themes", {
    default_themes: {
      default_theme: {
        column_bg: "#4D394B",
        menu_bg: "#3E313C",
        active_item: "#4C9689",
        active_item_text: "#FFFFFF",
        hover_item: "#3E313C",
        text_color: "#FFFFFF",
        active_presence: "#38978D",
        badge: "#EB4D5C"
      },
      hoth_theme: {
        column_bg: "#F8F8FA",
        menu_bg: "#F8F8FA",
        active_item: "#CAD1D9",
        active_item_text: "#FFFFFF",
        hover_item: "#FFFFFF",
        text_color: "#383F45",
        active_presence: "#60D156",
        badge: "#FF8669"
      },
      monument_theme: {
        column_bg: "#0D7E83",
        menu_bg: "#076570",
        active_item: "#F79F66",
        active_item_text: "#FFFFFF",
        hover_item: "#D37C71",
        text_color: "#FFFFFF",
        active_presence: "#F79F66",
        badge: "#F15340"
      },
      chocolate_theme: {
        column_bg: "#544538",
        menu_bg: "#42362B",
        active_item: "#5DB09D",
        active_item_text: "#FFFFFF",
        hover_item: "#4A3C30",
        text_color: "#FFFFFF",
        active_presence: "#FFFFFF",
        badge: "#5DB09D"
      },
      ocean_theme: {
        column_bg: "#303E4D",
        menu_bg: "#2C3849",
        active_item: "#6698C8",
        active_item_text: "#FFFFFF",
        hover_item: "#4A5664",
        text_color: "#FFFFFF",
        active_presence: "#94E864",
        badge: "#78AF8F"
      },
      workhard_theme: {
        column_bg: "#4D5250",
        menu_bg: "#444A47",
        active_item: "#D39B46",
        active_item_text: "#FFFFFF",
        hover_item: "#434745",
        text_color: "#FFFFFF",
        active_presence: "#99D04A",
        badge: "#DB6668"
      },
      solanum_theme: {
        column_bg: "#4F2F4C",
        menu_bg: "#452842",
        active_item: "#8C5888",
        active_item_text: "#FFFFFF",
        hover_item: "#3E313C",
        text_color: "#FFFFFF",
        active_presence: "#D0FF00",
        badge: "#889100"
      },
      brinjal_theme: {
        column_bg: "#4F2F4C",
        menu_bg: "#452842",
        active_item: "#8C5888",
        active_item_text: "#FFFFFF",
        hover_item: "#3E313C",
        text_color: "#FFFFFF",
        active_presence: "#00FFB7",
        badge: "#DE4C0D"
      },
      cotton_theme: {
        column_bg: "#BB6A76",
        menu_bg: "#AD5B67",
        active_item: "#62B791",
        active_item_text: "#FFFFFF",
        hover_item: "#A5516A",
        text_color: "#FFFFFF",
        active_presence: "#68F798",
        badge: "#694464"
      },
      eco_theme: {
        column_bg: "#86A34E",
        menu_bg: "#94AF63",
        active_item: "#FFFFFF",
        active_item_text: "#6D8B42",
        hover_item: "#94AF63",
        text_color: "#FFFFFF",
        active_presence: "#FFB10A",
        badge: "#DFA044"
      }
    },
    onStart: function() {
      if (TS.client) TS.client.login_sig.add(TS.sidebar_themes.onLogin, TS.sidebar_themes);
    },
    onLogin: function(ok, data) {
      if (TS.model.prefs.sidebar_theme) TS.prefs.sidebar_theme_changed_sig.dispatch();
    }
  });
})();
(function() {
  "use strict";
  TS.registerModule("ui.tabs", {
    instances: [],
    onStart: function() {},
    create: function(element, config) {
      if (!element) {
        return false;
      }
      return new Tabs(element, config);
    }
  });

  function Tabs(element, config) {
    if (typeof element === "undefined") {
      return null;
    }
    this.element = element;
    var _tabs = _retrieveTabs(element);
    var _panels = _retrievePanels(_tabs);
    this.element.on("click", ".tab", function(e) {
      e.preventDefault();
      return _activate(this, _tabs, _panels).bind(this);
    });
    this.unbind = function() {
      this.element.off();
      this.element = null;
      _tabs = null;
      _panels = null;
    };
    this.element.one("remove", this.unbind);
    var _default_tab = _defaultTab(_tabs, config);
    _activate(_default_tab, _tabs, _panels);
    return this;
  }

  function _defaultTab(tabs, config) {
    if (config && config.default_tab) {
      var default_tab = _.filter(tabs, function(item) {
        if ($(item).attr("href") == "#" + config.default_tab) return true;
        return false;
      })[0];
      if (default_tab) {
        return default_tab;
      } else {
        TS.warn("Default tab was not found, falling back to first tab.");
        return tabs[0];
      }
    } else {
      return tabs[0];
    }
  }
  Tabs.prototype.destroy = function() {
    this.element.off();
    this.element.remove();
  };

  function _retrievePanels(tabs) {
    if (typeof tabs === "undefined") {
      return [];
    }
    return tabs.map(function(index, item) {
      return $(item).attr("href");
    }).map(function(index, id) {
      return $(id);
    });
  }

  function _retrieveTabs(element) {
    if (typeof element === "undefined") {
      return [];
    }
    return element.find(".tab").map(function(index, item) {
      return $(item);
    });
  }

  function _activate(tab, tabs, panels) {
    if (typeof tab === "undefined") {
      return false;
    }
    panels.map(function(index, panel_item) {
      return $(panel_item).removeClass("active");
    });
    tabs.map(function(index, tab_item) {
      return $(tab_item).removeClass("active");
    });
    var $tab = $(tab);
    $tab.addClass("active");
    var $target = $($tab.attr("href"));
    var result = $target.addClass("active");
    $tab = null;
    $target = null;
    return result;
  }
})();
(function() {
  "use strict";
  TS.registerModule("help_modal", {
    onStart: function() {
      TS.help.issues_sorted_sig.add(_issuesSorted);
    },
    start: function() {
      _start();
    }
  });
  var _is_open = false;
  var _showing_list = false;
  var _$div;
  var _$modal;
  var _$modal_footer;
  var _$header;
  var _$footer;
  var _$footer_status;
  var _$list_container;
  var _$filter;
  var _$browse_all;
  var _articles_fetched = null;
  var _articles_filtered = null;
  var _articles_popular = null;
  var _start = function() {
    var settings = {
      body_template_html: TS.templates.help_modal(),
      modal_class: "help_modal fs_modal_footer fs_modal_header",
      show_cancel_button: false,
      go_button_text: TS.i18n.t("Contact Us", "help")(),
      onShow: _onShow,
      onGo: _onGo,
      onEnd: _onEnd,
      clog_name: "HELP_MODAL"
    };
    if (TS.client) TS.ui.a11y.saveCurrentFocus();
    TS.ui.fs_modal.start(settings);
  };
  var _addHeaderLinks = function() {
    _$header = $(TS.templates.help_modal_header()).appendTo(_$modal);
  };
  var _removeHeaderLinks = function() {
    if (_$header) _$header.remove();
    _$header = null;
  };
  var _addFooterItems = function() {
    _$footer = $(TS.templates.help_modal_footer()).appendTo(_$modal_footer);
    _$footer_status = _$modal_footer.find(".help_modal_status");
  };
  var _removeFooterItems = function() {
    if (_$footer) _$footer.remove();
    _$footer = null;
    _$footer_status = null;
  };
  var _issuesSorted = function() {
    if (!_is_open) return;
    _updateTicketStatus();
  };
  var _updateTicketStatus = function() {
    var settings = {
      unread_count: 0,
      open_count: 0,
      all_count: TS.help.issues.length,
      is_unread: false,
      is_unread_many: false,
      is_open: false,
      is_open_many: false,
      is_old_tickets: false
    };
    for (var i = 0; i < TS.help.issues.length; i++) {
      var issue = TS.help.issues[i];
      if (issue.state == "unread") {
        settings.unread_count++;
      } else if (issue.state == "open") {
        settings.open_count++;
      }
    }
    settings.is_unread = settings.unread_count != 0;
    settings.is_unread_many = settings.unread_count > 1;
    settings.is_open = settings.open_count != 0 && settings.unread_count == 0;
    settings.is_open_many = settings.open_count > 1;
    settings.is_old_tickets = settings.all_count && settings.is_unread == 0 && settings.is_open == 0;
    _$footer_status.html(TS.templates.help_modal_footer_status({
      settings: settings
    }));
  };
  var _onShow = function() {
    _is_open = true;
    _$modal = $("#fs_modal");
    _$modal_footer = $("#fs_modal_footer");
    _$div = $("#help_modal_container");
    _$browse_all = _$div.find("#browse_all");
    _$filter = _$div.find("#help_modal_filter");
    _$list_container = _$div.find("#help_modal_list_container");
    _addHeaderLinks();
    _addFooterItems();
    _updateTicketStatus();
    _bindUI();
    TS.api.call("helpdesk.get", {
      locale: TS.i18n.locale().toLowerCase()
    }, _articlesFetched);
  };
  var _onEnd = function() {
    _is_open = false;
    _showing_list = false;
    _$div = null;
    _$modal = null;
    _$modal_footer = null;
    _$header = null;
    _$footer = null;
    _$footer_status = null;
    _$list_container = null;
    _$filter = null;
    _$browse_all = null;
    _articles_filtered = null;
    _articles_popular = null;
    TS.kb_nav.end();
    _removeHeaderLinks();
    _removeFooterItems();
    if (TS.client) TS.ui.a11y.restorePreviousFocus();
  };
  var _bindUI = function() {
    _$modal.find(".keyboard_shortcuts").on("click", function(e) {
      e.preventDefault();
      TS.ui.fs_modal.close(true);
      TS.ui.shortcuts_dialog.start();
    });
    _$filter.on("textchange", function() {
      if (!_is_open || !_showing_list) return;
      _filterList();
    }).on("keydown", function(e) {
      if (e.which === TS.utility.keymap.esc) TS.ui.fs_modal.close();
    });
    _$div.on("click", ".clear_filter_icon", function() {
      _$filter.val("").trigger("textchange").focus();
    });
    _$list_container.on("click", ".help_modal_article_row", function(e) {
      _openArticle($(this), e);
    });
    _$browse_all.on("click", function(e) {
      e.preventDefault();
      var query = _getQuery();
      if (query) {
        TS.utility.openInNewTab(_createSearchUrl(query), "_blank");
        TS.clog.track("HELP_MODAL_SEARCH", {
          search_terms: query
        });
      } else {
        TS.utility.openInNewTab($(this).attr("href"), "_blank");
      }
    });
  };
  var _onGo = function() {
    if (!_is_open) {
      TS.error("not showing?");
      return;
    }
    TS.utility.openInNewTab("/help/requests/new", "_blank");
    TS.ui.fs_modal.close(true);
    TS.clog.track("HELP_MODAL_ACTION", {
      action: "submit_new_request",
      trigger: "click_submit_new_request"
    });
  };
  var _filterList = function() {
    var query = _getQuery();
    if (query) {
      _$filter.parent().addClass("active");
      _articles_filtered = _filterWorker(_articles_fetched, query);
    } else {
      _$filter.parent().removeClass("active");
      _articles_filtered = _concatWithSuggestedTopics(_articles_popular);
    }
    if (query && _articles_filtered.length < 7) {
      _articles_filtered = _concatWithGenericSearch(_articles_filtered, query);
    }
    _$list_container.longListView("setItems", _articles_filtered);
    _$list_container.scrollTop(0);
    TS.utility.rAF(function() {
      TS.ui.utility.updateClosestMonkeyScroller(_$list_container);
    });
    if (query) {
      TS.kb_nav.highlightFirstItem();
    } else {
      TS.kb_nav.clearHighlightedItem();
    }
  };
  var _getQuery = function() {
    return $.trim(_$filter.val());
  };
  var _articlesFetched = function(ok, data, args) {
    if (!ok) {
      TS.error("failed to fetch help articles");
      return;
    }
    _articles_fetched = JSON.parse(data.articles).articles;
    _articles_filtered = _articles_fetched;
    _articles_popular = _getSuggestedTopics(_articles_fetched);
    _$list_container.empty();
    _startListView();
    _filterList();
    _$filter.focus();
  };
  var _concatWithSuggestedTopics = function(popularArticles) {
    var articles = [];
    if (popularArticles.length > 0) {
      articles.push({
        is_divider: true,
        title: TS.i18n.t("Popular help topics", "help")()
      });
      articles = articles.concat(popularArticles);
    }
    return articles;
  };
  var _concatWithGenericSearch = function(filteredArticles, query) {
    filteredArticles.push({
      is_divider: false,
      title: TS.i18n.t('Search for "{query}" on the Help Center', "help")({
        query: query
      }),
      url: _createSearchUrl(query)
    });
    return filteredArticles;
  };
  var _filterWorker = function(articles, query) {
    query = TS.utility.regexpEscape(query);
    var match_regex = new RegExp(query, "i");
    var exact_match_index = -1;
    var filtered = articles.filter(function(item, i) {
      if (item.title.toLowerCase() === query.toLowerCase()) {
        exact_match_index = i;
        return false;
      } else {
        return item.title.match(match_regex);
      }
    });
    if (exact_match_index !== -1) {
      filtered.unshift(articles[exact_match_index]);
    }
    return filtered;
  };
  var _startListView = function() {
    _$list_container.longListView({
      items: _articles_filtered,
      approx_item_height: 40,
      approx_divider_height: 35,
      preserve_dom_order: true,
      makeElement: function(data) {
        var $el = $(TS.templates.help_modal_article_row());
        data.$title = $el.find(".article_title");
        return $el;
      },
      makeDivider: function(data) {
        return $("<div>").addClass("help_modal_divider");
      },
      renderItem: function($el, item, data) {
        data.$title.text(item.title);
        $el.data("url", item.url);
      },
      renderDivider: function($el, item, data) {
        $el.text(item.title);
      },
      calcItemHeight: function($el, item, data) {
        return $el.outerHeight();
      }
    });
    _$list_container.monkeyScroll();
    _showing_list = true;
    TS.kb_nav.start(_$list_container.find(".list_items"), ".help_modal_article_row", _$list_container, {
      use_data_ordering: true,
      px_offset: 0,
      scrollToStartImmediately: function() {
        _$list_container.longListView("scrollToTop", true);
      },
      scrollToEndImmediately: function() {
        _$list_container.longListView("scrollToEnd", true);
      }
    });
    TS.kb_nav.setAllowHighlightWithoutBlurringInput(true);
    TS.kb_nav.setSubmitItemHandler(function(e) {
      _openArticle($(this), e);
    });
  };
  var _getSuggestedTopics = function(articles) {
    var suggested_articles = [];
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].popular) {
        suggested_articles.push(articles[i]);
      }
    }
    suggested_articles.sort(function(a, b) {
      if (a.order == undefined) {
        return 1;
      } else if (b.order == undefined) {
        return -1;
      } else {
        return a.order - b.order;
      }
    });
    return suggested_articles;
  };
  var _openArticle = function($row, e) {
    var the_url = $row.data("url");
    var the_query = _getQuery();
    if (the_url) {
      TS.utility.openInNewTab(the_url, "_blank");
      if (the_url.indexOf("hc/search?") == -1) {
        TS.clog.track("HELP_MODAL_ZD_HIT", {
          zd_article_url: the_url
        });
      }
      if (the_query) TS.clog.track("HELP_MODAL_SEARCH", {
        search_terms: the_query
      });
    }
  };
  var _createSearchUrl = function(query) {
    return "https://get.slack.help/hc/search?utf8=✓&commit=Search&query=" + query;
  };
})();
(function() {
  "use strict";
  TS.registerModule("ui.comments", {
    editing_file: null,
    editing_comment: null,
    editing: false,
    $edit_form: null,
    bound: false,
    onStart: function() {
      TS.ui.comments.$edit_form = $("#file_edit_comment_form");
      if (TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.supportsTexty()) {
        TS.ui.comments.bindInput($("#file_comment"));
      } else {
        var $file_comment = $("#file_comment");
        $file_comment.one("focus.uicomments", function() {
          TS.ui.comments.bindInput($file_comment);
        });
      }
      TS.ui.comments.bindButton($("#file_comment_submit_btn"));
    },
    bindButton: function($button) {
      $button.bind("keydown.cmd_submit", function(e) {
        if (e.which === TS.utility.keymap.enter && $button.is(":focus")) {
          $button.closest("form").submit();
        }
      });
    },
    bindInput: function(input, callback) {
      if (TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.supportsTexty() && TS.tabcomplete) {
        TS.utility.contenteditable.create(input, {
          modules: {
            tabcomplete: {
              completeMemberSpecials: false,
              completers: [TS.tabcomplete.channels, TS.tabcomplete.emoji, TS.tabcomplete.members],
              positionMenu: function(menu) {
                if (TS.web && TS.web.space) {
                  menu.style.width = Math.min(input.outerWidth(), 474) + "px";
                } else {
                  menu.style.width = Math.min(input.outerWidth(), 360) + "px";
                }
                TS.tabcomplete.positionUIRelativeToInput(menu, input);
              }
            }
          },
          onEnter: function(args) {
            if (TS.model.prefs.enter_is_special_in_tbt && TS.utility.contenteditable.isCursorInPreBlock(input)) {
              if (!args.shiftKey) return true;
            } else {
              if (args.shiftKey) return true;
            }
            if (callback) {
              callback();
            } else {
              input.closest("form").submit();
            }
            return false;
          },
          onTextChange: function(source) {
            if (!TS.client) return;
            if (TS.ui.fs_modal_file_viewer.is_showing && $("#file_comment").closest("#fs_modal").length) {
              TS.ui.fs_modal_file_viewer.storeLastCommentInput();
            } else {
              TS.client.ui.files.storeLastCommentInputForPreviewedFile(TS.utility.contenteditable.value(input));
              TS.ui.utility.updateClosestMonkeyScroller($("#file_preview_scroller"));
            }
          },
          onEscape: function() {
            if (TS.client && TS.ui.fs_modal_file_viewer.is_showing && TS.ui.fs_modal_file_viewer.canClose()) {
              TS.ui.fs_modal.close();
            }
          }
        });
        TS.utility.contenteditable.enable(input);
        input.on("keyup", function() {
          var cursor_position = TS.utility.contenteditable.cursorPosition(input);
          if (!cursor_position.length) {
            var $form = input.closest("form");
            var msgs_scroller_dimensions = TS.client && TS.client.ui.getCachedDimensionsRect("cached_msgs_scroller_rect", TS.client.ui.$msgs_scroller_div);
            if (!TS.client || $form.outerHeight() < msgs_scroller_dimensions.height) {
              $form.find("button[type=submit]").scrollintoview({
                px_offset: -50,
                complete: function() {
                  TS.tabcomplete.positionUIRelativeToInput($(".tab_complete_ui")[0], input);
                }
              });
            }
          }
        });
      } else {
        input.TS_tabComplete({
          complete_cmds: false,
          complete_channels: true,
          complete_emoji: true,
          complete_member_specials: false,
          complete_user_groups: true,
          onComplete: function(txt, new_cp) {
            TS.utility.populateInput(input, txt, new_cp);
          },
          include_self: !!TS.boot_data.feature_name_tagging_client
        });
        input.bind("keydown.cmd_submit", function(e) {
          if (e.which === TS.utility.keymap.enter) {
            if (input.tab_complete_ui("isShowing")) {
              e.preventDefault();
              return;
            }
            if (TS.model.prefs.enter_is_special_in_tbt && TS.utility.isCursorWithinTBTs(input)) {
              if (e.shiftKey) {
                $(this).closest("form").submit();
                e.preventDefault();
              }
              return;
            }
            if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
              if (callback) {
                callback();
              } else {
                $(this).closest("form").submit();
              }
              e.preventDefault();
            }
          }
        });
        input.tab_complete_ui({
          id: "comment_input_tab_ui",
          min_width: 300,
          narrow: !!TS.client,
          no_model_ob: true,
          scroll_with_element: !!TS.client
        });
      }
    },
    unbindInput: function($input) {
      if (!$input) return;
      if (!TS.boot_data.feature_texty_takes_over || !TS.utility.contenteditable.supportsTexty()) {
        $input.unbind("keydown.cmd_submit");
        $input.removeData();
      }
    },
    bindEditForm: function() {
      TS.ui.comments.bound = true;
      var $edit_form = TS.ui.comments.$edit_form;
      $("#file_edit_comment").css("overflow", "hidden").autogrow();
      TS.ui.comments.bindInput($("#file_edit_comment"));
      $edit_form.unbind("submit").bind("submit", TS.ui.comments.submitEditForm);
      $edit_form.find(".save").unbind("click").bind("click", function(e) {
        TS.ui.comments.submitEditForm();
        return false;
      });
      $edit_form.find(".cancel").unbind("click").bind("click", function(e) {
        TS.ui.comments.onEndEdit();
        return false;
      });
      $edit_form.unbind("destroyed").bind("destroyed", function() {
        $("#file_comment_form").after($(this)[0].outerHTML);
        TS.ui.comments.$edit_form = $("#file_edit_comment_form");
        TS.ui.comments.bound = false;
        if (!TS.ui.comments.editing) return;
        TS.ui.comments.onEndEdit();
      });
    },
    submitEditForm: function() {
      var val = TS.utility.contenteditable.value($("#file_edit_comment"));
      if (!$.trim(val)) {
        if (TS.client) TS.sounds.play("beep");
        return false;
      }
      TS.ui.comments.saveEdit();
      return false;
    },
    startEdit: function(file_id, comment_id, $originated_from) {
      if (TS.ui.comments.editing) {
        TS.ui.comments.onEndEdit();
      }
      var file = TS.files.getFileById(file_id);
      if (!file) {
        TS.error("no file?");
        return null;
      }
      var comment = TS.files.getFileCommentById(file, comment_id);
      if (!comment) {
        TS.error("no comment?");
        return null;
      }
      var $edit_form = TS.ui.comments.$edit_form;
      var $comment_div;
      if (!$originated_from) {
        $comment_div = $("#" + comment.id);
      } else {
        $comment_div = $originated_from.closest(".comment");
      }
      if (!$comment_div.length) {
        TS.error("no #" + comment.id + "?");
        return;
      }
      $comment_div.addClass("comment_editing").append($edit_form);
      TS.utility.contenteditable.clear($("#file_edit_comment"));
      $("#file_edit_comment").css("height", "");
      if (!TS.ui.comments.bound) {
        TS.ui.comments.bindEditForm();
      }
      $edit_form.removeClass("hidden");
      TS.utility.contenteditable.clearHistory($("#file_edit_comment"));
      TS.utility.contenteditable.value($("#file_edit_comment"), TS.format.unFormatMsg(comment.comment));
      TS.utility.contenteditable.focus($("#file_edit_comment"));
      TS.utility.contenteditable.cursorPosition($("#file_edit_comment"), 1e6);
      if (!TS.boot_data.feature_texty_takes_over || !TS.utility.contenteditable.supportsTexty()) {
        $("#file_edit_comment").trigger("keyup");
      }
      $("#file_comment_form").css("visibility", "hidden");
      TS.ui.comments.editing = true;
      TS.ui.comments.editing_file = file;
      TS.ui.comments.editing_comment = comment;
    },
    saveEdit: function() {
      var file = TS.ui.comments.editing_file;
      var comment = TS.ui.comments.editing_comment;
      var $comment_bodies = $('.comment[data-comment-id="' + comment.id + '"] .comment_body');
      var val = TS.format.cleanMsg(TS.utility.contenteditable.value($("#file_edit_comment")));
      if (val != comment.comment) {
        var was_comment = comment.comment;
        comment.comment = val;
        if ($comment_bodies.length) {
          $comment_bodies.html(TS.format.formatJustText(comment.comment));
        }
        TS.api.call("files.comments.edit", {
          file: file.id,
          id: comment.id,
          comment: val
        }, function(ok, data, args) {
          if (!ok) {
            comment.comment = was_comment;
            if ($comment_bodies.length) {
              $comment_bodies.html(TS.format.formatJustText(comment.comment));
            }
            TS.generic_dialog.alert(TS.i18n.t("Something‘s gone wrong, and your change didn‘t save. If you see this message more than once, you may want to try restarting Slack.", "comments")(), TS.i18n.t("Oh, crumbs!", "comments")(), TS.i18n.t("Got it", "comments")());
          }
        });
      }
      TS.ui.comments.onEndEdit();
    },
    onEndEdit: function() {
      var comment = TS.ui.comments.editing_comment;
      if (!comment) return;
      TS.ui.comments.$edit_form.addClass("hidden");
      $('[data-comment-id="' + comment.id + '"].comment_editing').removeClass("comment_editing");
      $("#file_comment_form").css("visibility", "");
      TS.ui.comments.editing = false;
      TS.ui.comments.editing_file = null;
      TS.ui.comments.editing_comment = null;
    },
    startDelete: function(file_id, comment_id) {
      var file = TS.files.getFileById(file_id);
      if (!file) {
        TS.error("no file?");
        return null;
      }
      var comment = TS.files.getFileCommentById(file, comment_id);
      if (!comment) {
        TS.error("no comment?");
        return null;
      }
      TS.generic_dialog.start({
        title: TS.i18n.t("Delete a file comment", "comments")(),
        body: TS.i18n.t("<p>Are you sure you want to delete this comment? This cannot be undone.</p>", "comments")() + TS.templates.builders.buildCommentHTML({
          comment: comment,
          file: file,
          show_comment_actions: false,
          hide_star: true
        }),
        go_button_text: TS.i18n.t("Yes, delete the comment", "comments")(),
        go_button_class: "btn_danger",
        onGo: function() {
          TS.ui.comments.commitDelete(file_id, comment_id);
        }
      });
    },
    commitDelete: function(file_id, comment_id) {
      var file = TS.files.getFileById(file_id);
      if (!file) {
        TS.error("no file?");
        return null;
      }
      var comment = TS.files.getFileCommentById(file, comment_id);
      if (!comment) {
        TS.error("no comment?");
        return null;
      }
      TS.api.call("files.comments.delete", {
        file: file_id,
        id: comment_id
      }, function(ok, data, args) {
        if (ok) {
          if (TS.client) {} else {
            TS.files.deleteCommentOnFile(comment.id, file);
          }
        } else {
          if (data.error == "comment_not_found") {
            TS.files.deleteCommentOnFile(comment.id, file);
          }
        }
      });
    },
    removeFileComment: function(file, comment_id, completeFunc) {
      $('.comment[data-comment-id="' + comment_id + '"]').slideUp(200, function() {
        var parent_node = this.parentNode;
        $(this).remove();
        if (parent_node.innerHTML.match(/^[\s\r\n]*$/)) $(parent_node).empty();
        if (typeof completeFunc === "function") completeFunc.apply(this, arguments);
      });
    }
  });
})();
(function() {
  "use strict";
  TS.registerModule("ds.msg_handlers", {
    onStart: function() {
      TS.ds.on_msg_sig.add(_msgReceived);
    },
    hello: function(imsg) {
      TS.model.members.forEach(function(member) {
        member.ds_active = false;
      });
      if (!imsg.active || !imsg.active.length) return;
      var member;
      for (var i = 0; i < imsg.active.length; i++) {
        member = TS.members.getMemberById(imsg.active[i]);
        if (!member) {
          TS.error('unknown member: "' + imsg.active[i] + '"');
          return;
        }
        member.ds_active = true;
      }
    },
    presence_change: function(imsg) {
      var member = TS.members.getMemberById(imsg.user);
      if (!member) {
        TS.error('unknown member: "' + imsg.user + '"');
        return;
      }
      if (imsg.presence != "away" && imsg.presence != "active") {
        TS.error('unknown presence: "' + imsg.presence + '"');
        return;
      }
      if (member.ds_active && imsg.presence == "active") return;
      if (!member.ds_active && imsg.presence == "away") return;
      member.ds_active = imsg.presence == "active";
      TS.members.ds_presence_changed_sig.dispatch(member);
    }
  });
  var _msgReceived = function(imsg) {
    if (imsg.reply_to) return;
    if (imsg.event == "rocket") return;
    if (!TS.ds.msg_handlers[imsg.type]) {
      TS.error("non handled non rocket event received\n" + JSON.stringify(imsg, null, "  "));
      return;
    }
    TS.ds.msg_handlers[imsg.type](imsg);
  };
})();
(function() {
  "use strict";
  TS.registerModule("inline_audios", {
    no_scrolling: false,
    expand_sig: new signals.Signal,
    collapse_sig: new signals.Signal,
    onStart: function() {},
    shouldExpand: function(container_id, inline_audio) {
      if (TS.model.expandable_state["aud_" + container_id + TS.utility.htmlEntities(inline_audio.src)]) return true;
      if (TS.model.expandable_state["aud_" + container_id + TS.utility.htmlEntities(inline_audio.src)] === false) return false;
      if (inline_audio.internal_file_id) return TS.model.prefs.expand_internal_inline_imgs;
      return TS.model.prefs.expand_inline_imgs;
    },
    expandAllInCurrent: function() {
      var $collapsed_togglers = $(".msg_inline_media_toggler[data-media-type=audio]:not(.expanded)");
      if (!$collapsed_togglers.length) return;
      TS.inline_audios.no_scrolling = true;
      $collapsed_togglers.trigger("click");
      TS.inline_audios.no_scrolling = false;
      if (TS.client) {
        TS.client.ui.instaScrollMsgsToBottom(false);
      }
    },
    collapseAllInCurrent: function() {
      $(".msg_inline_media_toggler[data-media-type=audio].expanded").trigger("click");
    },
    expand: function(container_id, src) {
      TS.model.expandable_state["aud_" + container_id + TS.utility.htmlEntities(src)] = true;
      TS.storage.storeExpandableState(TS.model.expandable_state);
      var selector = "#" + TS.utility.makeSafeForDomId(container_id);
      var $el = $(selector);
      if (!$el.length) return;
      var was_at_bottom = TS.client && TS.client.ui.areMsgsScrolledToBottom();
      var filter = function(i) {
        return $(this).data("real-src") == src;
      };
      var $holder = TS.boot_data.feature_attachments_inline ? $el.find(".inline_attachment").filter(filter) : null;
      if (!$holder || !$holder.length) $holder = $el.find(".msg_inline_audio_holder").filter(filter);
      $holder.removeClass("hidden");
      $el.find(".msg_inline_media_toggler[data-media-type=audio]:not(.expanded)").filter(filter).addClass("expanded");
      if (TS.client) TS.client.ui.checkInlineImgsAndIframesEverywhere();
      $holder.css("opacity", 0).stop().animate({
        opacity: 1
      }, 300);
      if (!TS.inline_audios.no_scrolling) {
        if (TS.client && was_at_bottom) {
          TS.client.ui.instaScrollMsgsToBottom(false);
          $el.children().first().scrollintoview({
            duration: 0,
            offset: "top",
            px_offset: 10,
            direction: "y"
          });
        } else {
          $el.find(".msg_inline_audio").last().scrollintoview({
            duration: 200,
            offset: "bottom",
            px_offset: -10,
            direction: "y"
          });
        }
      }
      TS.inline_audios.expand_sig.dispatch(container_id);
      if (TS.client) TS.client.ui.checkInlineImgsAndIframesEverywhere();
    },
    collapse: function(container_id, src) {
      TS.model.expandable_state["aud_" + container_id + TS.utility.htmlEntities(src)] = false;
      TS.storage.storeExpandableState(TS.model.expandable_state);
      var selector = "#" + TS.utility.makeSafeForDomId(container_id);
      var $el = $(selector);
      if (!$el.length) return;
      var filter = function(i) {
        return $(this).data("real-src") == src;
      };
      var $holder = TS.boot_data.feature_attachments_inline ? $el.find(".inline_attachment").filter(filter) : null;
      if (!$holder || !$holder.length) $holder = $el.find(".msg_inline_audio_holder").filter(filter);
      $holder.css("visibility", "hidden");
      $el.find(".msg_inline_media_toggler[data-media-type=audio].expanded").filter(filter).removeClass("expanded");
      $holder.find(".msg_inline_audio_iframe_div").html("");
      TS.inline_audios.collapse_sig.dispatch(container_id);
      setTimeout(function() {
        $holder.addClass("hidden");
        $holder.css("visibility", "visible");
      }, 200);
    },
    checkForInlineAudioClick: function(e, match) {
      if (!e.target) return;
      var $el = $(e.target);
      var container_id;
      var $message = $el.closest(".message");
      container_id = $message.attr("id");
      if (!container_id) return;
      var $msg_inline_media_toggler = $el.closest(".msg_inline_media_toggler[data-media-type=audio]");
      if ($msg_inline_media_toggler.length) {
        e.preventDefault();
        var src = $msg_inline_media_toggler.data("real-src");
        if ($msg_inline_media_toggler.hasClass("expanded")) {
          TS.inline_audios.collapse(container_id, src);
        } else {
          TS.inline_audios.expand(container_id, src);
        }
        return;
      }
      var $inline_audio_play_link = $el.closest(".inline_audio_play_link");
      if ($inline_audio_play_link.length) {
        e.preventDefault();
        var url = $inline_audio_play_link.attr("href");
        return alert("play " + url);
      }
    },
    makeInternalInlineAudio: function(key, attachment) {
      if (!attachment.audio_html) return;
      attachment.safe_audio_html = attachment.audio_html;
      attachment.safe_audio_html = TS.utility.swapInRedirUrlForIframe(attachment.safe_audio_html);
      if (TS.client) attachment.safe_audio_html = TS.utility.getPlaceholderHTMLFromIframe(attachment.safe_audio_html);
      TS.model.inline_audios[key] = {
        src: TS.utility.htmlEntities(attachment.audio_url || attachment.audio_html),
        attachment: attachment
      };
    }
  });
})();
(function() {
  "use strict";
  TS.registerModule("privacy_policy_dialog", {
    div: null,
    is_showing: false,
    default_setting: {
      title: "",
      body: "BODY",
      body_template: null,
      onGo: null,
      onCancel: null,
      onEnd: null,
      esc_for_ok: false,
      onShow: null,
      force_small: false,
      enter_always_gos: false
    },
    current_setting: null,
    body_template_html: {},
    Q: [],
    start: function(setting) {
      if (TS.privacy_policy_dialog.is_showing) {
        if (setting.unique && TS.privacy_policy_dialog.current_setting.unique == setting.unique) {
          TS.info("redundant generic dialog not Qed: " + setting.unique);
        } else {
          TS.privacy_policy_dialog.Q.push(setting);
        }
        return;
      }
      var current_setting = TS.privacy_policy_dialog.current_setting = _.defaults({}, setting, TS.privacy_policy_dialog.default_setting);
      if (!TS.privacy_policy_dialog.div) TS.privacy_policy_dialog.build();
      var div = TS.privacy_policy_dialog.div;
      var html = TS.templates.privacy_policy_dialog({
        title: current_setting.title,
        body: current_setting.body,
        footer: current_setting.footer
      });
      div.empty();
      div.html(html);
      div.find(".close").bind("click", function() {
        if (current_setting.show_cancel_button) {
          TS.privacy_policy_dialog.cancel();
        } else if (current_setting.esc_for_ok) {
          TS.privacy_policy_dialog.go();
        }
      });
      div.find(".dialog_go").click(TS.privacy_policy_dialog.go);
      if (current_setting.go_button_text) {
        div.find(".dialog_go").html(current_setting.go_button_text);
      }
      if (current_setting.show_go_button) {
        div.find(".dialog_go").removeClass("hidden").addClass(current_setting.go_button_class);
      }
      div.css("opacity", 0);
      div.css("display", "block");
      window.setTimeout(function() {
        div.css("marginLeft", "0px");
        div.slideDown(function() {
          div.animate({
            opacity: 1
          }, {
            duration: 500,
            complete: function() {
              div.addClass("fading-in");
              div.modal({
                backdrop: false
              }).show();
              if (document.activeElement && document.activeElement != document.body) {
                document.activeElement.blur();
              }
              if (current_setting.onShow) {
                current_setting.onShow();
              }
            }
          });
        });
      }, 1);
    },
    go: function(e) {
      if (!TS.privacy_policy_dialog.is_showing) {
        TS.error("not showing?");
        return;
      }
      var current_setting = TS.privacy_policy_dialog.current_setting;
      var div = TS.privacy_policy_dialog.div;

      function goComplete() {
        div.removeClass("fading-in");
        div.fadeOut(750, function() {
          div.modal("hide");
        });
      }
      if (current_setting.onGo) {
        if (current_setting.onGo(e) !== false) {
          goComplete();
        }
      } else {
        goComplete();
      }
    },
    cancel: function() {
      var current_setting = TS.privacy_policy_dialog.current_setting;
      var div = TS.privacy_policy_dialog.div;
      div.removeClass("fading-in");
      div.fadeOut(750, function() {
        div.modal("hide");
      });
      if (current_setting.onCancel) {
        current_setting.onCancel();
      }
    },
    end: function() {
      var current_setting = TS.privacy_policy_dialog.current_setting;
      TS.privacy_policy_dialog.is_showing = TS.model.dialog_is_showing = false;
      TS.privacy_policy_dialog.div.empty();
      if (current_setting.onEnd) {
        current_setting.onEnd();
      }
      if (!TS.privacy_policy_dialog.is_showing && TS.privacy_policy_dialog.Q.length) {
        var o = TS.privacy_policy_dialog.Q.shift();
        TS.privacy_policy_dialog.start(o);
      }
    },
    build: function() {
      $("body").append('<div id="privacy_policy_dialog" class="modal" data-keyboard="false"></div>');
      var div = TS.privacy_policy_dialog.div = $("#privacy_policy_dialog");
      div.on("hidden", function(e) {
        if (e.target != this) return;
        setTimeout(function() {
          TS.privacy_policy_dialog.end();
        }, 200);
      });
      div.on("show", function(e) {
        if (e.target != this) return;
        TS.privacy_policy_dialog.is_showing = TS.model.dialog_is_showing = true;
      });
    }
  });
})();
(function() {
  "use strict";
  TS.registerModule("clipboard", {
    canWriteText: function() {
      return _implementation._canWriteText();
    },
    writeText: function(str) {
      _implementation._writeText(str);
    },
    canWriteHTML: function() {
      return _implementation._canWriteHTML();
    },
    writeHTML: function(str) {
      _implementation._writeHTML(str);
    },
    writeTextFromEvent: function(e, mime_map) {
      if (!e) return;
      var copy_err;
      var copy_types = [];
      var mime_types = _.keys(mime_map);
      if (!mime_types.length) return;
      TS.info("TS.clipboard.writeTextFromEvent: copying to [" + mime_types + "]");
      try {
        e = e.originalEvent || e;
        var clipboard_data = e.clipboardData || window.clipboardData;
        _.each(mime_map, function(text, mime_type) {
          try {
            clipboard_data.setData(mime_type, text);
            var copied_text = clipboard_data.getData(mime_type) || "";
            if (text === copied_text) copy_types.push(mime_type);
            TS.info("TS.clipboard.writeTextFromEvent: copied " + copied_text.length + ' chars to "' + mime_type + '"');
          } catch (err) {
            TS.warn('TS.clipboard.writeTextFromEvent: error copying to "' + mime_type + '" (' + err + ")");
          }
        });
      } catch (err) {
        copy_err = err;
      }
      if (!copy_err && !copy_types.length) copy_err = "failed to write to clipboard";
      if (!copy_err) {
        e.preventDefault();
        if (e.type === "cut" && TS.utility.isFocusOnInput()) {
          if (TS.utility.contenteditable.supportsTexty()) {
            TS.utility.contenteditable.deleteSelection(document.activeElement);
          } else {
            window.getSelection().deleteFromDocument();
          }
        }
      } else {
        TS.error("TS.clipboard.writeTextFromEvent: " + copy_err);
      }
      TS.clog.track("CLIPBOARD_WRITE", {
        action: e.type,
        err: copy_err,
        types: copy_types.join(",")
      });
    },
    test: function() {
      return {
        detectImplementation: _detectImplementation
      };
    }
  });
  var _implementation;
  var _canCopy = false;
  var _detectImplementation = function() {
    if (_ssbImplementation._canWriteText()) {
      _implementation = _ssbImplementation;
    } else {
      _detectSupport();
      _implementation = _browserImplementation;
    }
  };
  var _detectSupport = function() {
    _canCopy = false;
    if (bowser) {
      if (bowser.chrome && bowser.version >= 42) _canCopy = true;
      if (bowser.firefox && bowser.version >= 41) _canCopy = true;
      if (bowser.msie && bowser.version >= 9) _canCopy = true;
      if (bowser.opera && bowser.version >= 29) _canCopy = true;
    }
    $(window).one("click.check_clipboard_support", function() {
      _canCopy = document.queryCommandSupported("copy");
    });
  };
  var _browserImplementation = {
    _canWriteText: function() {
      return _canCopy;
    },
    _writeText: function(text) {
      var temp_node = document.createElement("textarea");
      temp_node.appendChild(document.createTextNode(text));
      document.body.appendChild(temp_node);
      this._writeNode(temp_node);
      document.body.removeChild(temp_node);
    },
    _canWriteHTML: function() {
      return _canCopy;
    },
    _writeHTML: function(html) {
      var temp_node = $("<p>").html(html);
      $("body").append(temp_node);
      this._writeNode(temp_node);
      temp_node.remove();
    },
    _writeNode: function(node) {
      try {
        this._saveSelection();
        node.select();
        document.execCommand("copy");
      } catch (e) {
        TS.warn("Something bad happened when we tried to copy: " + e);
      } finally {
        this._restoreSelection();
      }
    },
    _saveSelection: function() {
      this._current_ranges = [];
      this._sel = window.getSelection();
      for (var i = 0; i < this._sel.rangeCount; i++) {
        this._current_ranges.push(this._sel.getRangeAt(i));
      }
    },
    _restoreSelection: function() {
      var self = this;
      this._sel.removeAllRanges();
      this._current_ranges.forEach(function(range) {
        self._sel.addRange(range);
      });
    }
  };
  var _ssbImplementation = {
    _canWriteText: function() {
      return window.TSSSB && TSSSB.call("canClipboardWriteString");
    },
    _writeText: function(str) {
      TSSSB.call("clipboardWriteString", str);
    },
    _canWriteHTML: function() {
      return false;
    },
    _writeHTML: function() {
      return TS.warn("We cannot write HTML in SSB");
    }
  };
  _detectImplementation();
})();
(function() {
  "use strict";
  TS.registerModule("inline_imgs", {
    no_scrolling: false,
    expand_sig: new signals.Signal,
    collapse_sig: new signals.Signal,
    onStart: function() {},
    shouldExpand: function(container_id, inline_img, args) {
      if (!inline_img || !inline_img.src) return false;
      if (TS.model.expandable_state["img_" + container_id + inline_img.src]) return true;
      if (TS.model.expandable_state["img_" + container_id + inline_img.src] === false) return false;
      if (inline_img.should_expand === true) return true;
      if (!inline_img.internal_file_id) {
        if (TS.model.prefs.obey_inline_img_limit && inline_img.bytes > TS.model.inline_img_byte_limit) return false;
        if (inline_img.width && inline_img.height) {
          if (inline_img.width * inline_img.height > TS.model.inline_img_pixel_limit) return false;
        }
      }
      if (inline_img.internal_file_id) {
        var inline_file_state = TS.inline_file_previews.expandableState(container_id, inline_img.internal_file_id);
        if (typeof inline_file_state === "boolean") return inline_file_state;
        return TS.model.prefs.expand_internal_inline_imgs;
      }
      if (args && args.is_giphy_shuffle && !TS.model.prefs.expand_inline_imgs) {
        var previous_match = _.pickBy(TS.model.expandable_state, function(value, key) {
          return _.startsWith(key, "img_" + container_id);
        });
        if (previous_match) return _.values(previous_match)[0];
      }
      return TS.model.prefs.expand_inline_imgs;
    },
    expandAllInCurrent: function() {
      TS.inline_imgs.no_scrolling = true;
      $(".msg_inline_img_expander").trigger("click");
      $(".msg_inline_img_toggler.collapsed").trigger("click");
      TS.inline_imgs.no_scrolling = false;
      if (TS.client) {
        TS.client.ui.instaScrollMsgsToBottom(false);
      }
    },
    collapseAllInCurrent: function() {
      $(".msg_inline_img_collapser").trigger("click");
      $(".msg_inline_img_toggler.expanded").trigger("click");
    },
    expand: function(container_id, src) {
      TS.model.expandable_state["img_" + container_id + src] = true;
      TS.storage.storeExpandableState(TS.model.expandable_state);
      var selector = "#" + TS.utility.makeSafeForDomId(container_id);
      var $el = $(selector);
      if (!$el.length) return;
      var was_at_bottom = TS.client && TS.client.ui.areMsgsScrolledToBottom();
      var filter = function(i) {
        return $(this).data("real-src") == src;
      };
      var $holder = TS.boot_data.feature_attachments_inline ? $el.find(".inline_attachment").filter(filter) : null;
      if (!$holder || !$holder.length) $holder = $el.find(".msg_inline_img_holder").filter(filter);
      $holder.removeClass("hidden");
      $el.find(".msg_inline_img_expander").filter(filter).addClass("hidden");
      $el.find(".msg_inline_img_collapser").filter(filter).removeClass("hidden");
      $el.find(".msg_inline_img_toggler").removeClass("collapsed").addClass("expanded");
      $el.find(".too_large_for_auto_expand").addClass("hidden");
      $el.find(".inline_img_bytes").removeClass("hidden");
      if (TS.client) TS.client.ui.checkInlineImgsAndIframesEverywhere();
      $holder.css("opacity", 0).stop().animate({
        opacity: 1
      }, 300);
      if (!TS.inline_imgs.no_scrolling) {
        if (TS.client && was_at_bottom) {
          TS.client.ui.instaScrollMsgsToBottom(false);
          $holder.scrollintoview({
            duration: 0,
            offset: "top",
            px_offset: 10,
            direction: "y"
          });
        } else {
          $holder.scrollintoview({
            duration: 200,
            offset: "bottom",
            px_offset: -10,
            direction: "y"
          });
        }
      }
      TS.inline_imgs.expand_sig.dispatch(container_id);
      if (TS.client) TS.client.ui.checkInlineImgsAndIframesEverywhere();
    },
    collapse: function(container_id, src) {
      TS.model.expandable_state["img_" + container_id + src] = false;
      TS.storage.storeExpandableState(TS.model.expandable_state);
      var selector = "#" + TS.utility.makeSafeForDomId(container_id);
      var $el = $(selector);
      if (!$el.length) return;
      var filter = function(i) {
        return $(this).data("real-src") == src;
      };
      var $holder = TS.boot_data.feature_attachments_inline ? $el.find(".inline_attachment").filter(filter) : null;
      if (!$holder || !$holder.length) $holder = $el.find(".msg_inline_img_holder").filter(filter);
      $el.find(".msg_inline_img_expander").filter(filter).removeClass("hidden");
      $el.find(".msg_inline_img_collapser").filter(filter).addClass("hidden");
      $el.find(".msg_inline_img_toggler").removeClass("expanded").addClass("collapsed");
      TS.inline_imgs.collapse_sig.dispatch(container_id);
      $holder.addClass("hidden");
    },
    checkForInlineImgClick: function(e, match) {
      if (!e.target) return;
      var $el = $(e.target);
      var container_id;
      var $message = $el.closest(".message");
      var container_id = $message.attr("id");
      if (match) {
        container_id = TS.templates.makeMSRDomId(match);
      }
      if (!container_id) return;
      var $too_large_but_expand_anyway = $el.closest(".too_large_but_expand_anyway");
      if ($too_large_but_expand_anyway.length) {
        e.preventDefault();
        TS.inline_imgs.expand(container_id, $too_large_but_expand_anyway.data("real-src"));
      }
      var $msg_inline_img_toggler = $el.closest(".msg_inline_img_toggler");
      if ($msg_inline_img_toggler.length) {
        e.preventDefault();
        var src = $msg_inline_img_toggler.next("*[data-real-src]").data("real-src");
        if (TS.inline_imgs.shouldExpand(container_id, TS.model.inline_imgs[src])) {
          TS.inline_imgs.collapse(container_id, src);
        } else {
          TS.inline_imgs.expand(container_id, src);
        }
        return;
      }
      var $msg_inline_img_expander = $el.closest(".msg_inline_img_expander");
      if ($msg_inline_img_expander.length) {
        e.preventDefault();
        TS.inline_imgs.expand(container_id, $msg_inline_img_expander.data("real-src"));
      }
      var $msg_inline_img_collapser = $el.closest(".msg_inline_img_collapser");
      if ($msg_inline_img_collapser.length) {
        e.preventDefault();
        TS.inline_imgs.collapse(container_id, $msg_inline_img_collapser.data("real-src"));
      }
    },
    makeInternalInlineImg: function(key, img) {
      var max_w = 400;
      var max_h = 500;
      if (TS.model.inline_imgs[key]) {
        img.internal_file_id = TS.model.inline_imgs[key].internal_file_id || img.internal_file_id;
        img.link_url = TS.model.inline_imgs[key].link_url || img.link_url;
        img.src = TS.model.inline_imgs[key].src || img.src;
      }
      TS.model.inline_imgs[key] = img;
      img.src = img.src || key;
      img.bytes = parseInt(img.bytes);
      var opt = {};
      if (img.rotation) {
        opt.rotate = true;
        if (Math.abs(parseInt(img.rotation)) == 90) {
          var old_height = img.height;
          img.height = img.width;
          img.width = old_height;
        }
      }
      img.width = img.display_w = parseInt(img.width);
      img.height = img.display_h = parseInt(img.height);
      if (img.display_w > max_w) {
        img.display_w = max_w;
        img.display_h = parseInt(img.height * (img.display_w / img.width));
        opt.resize = true;
      }
      if (img.display_h > max_h) {
        img.display_h = max_h;
        img.display_w = parseInt(img.width * (img.display_h / img.height));
        opt.resize = true;
      }
      opt.width = img.display_w;
      opt.height = img.display_h;
      if (img.content_type == "image/svg+xml") {
        opt.render_svg = true;
      }
      var proxied_src = TS.utility.getImgProxyURLWithOptions(img.src, opt);
      if (proxied_src != img.src) {
        img.proxied_src = proxied_src;
      } else {
        delete img.proxied_src;
      }
    }
  });
})();
(function() {
  "use strict";
  TS.registerModule("kb_nav", {
    onStart: function() {},
    start: function($context, selector, container_selector, settings) {
      _$context = $context;
      _item_selector = selector;
      _mouse.lastX = null;
      _mouse.lastY = null;
      if (!container_selector) {
        container_selector = "#menu";
      }
      _$container = $(container_selector);
      _use_data_ordering = settings && !!settings.use_data_ordering;
      _settings = settings;
      $(document).on("mousemove.keyboard_navigation", _watchMouse);
      $(document).on("keydown", TS.kb_nav.onKeyDown);
      _$context.on("mouseenter.keyboard_navigation", _item_selector, _onHoverItem);
    },
    end: function() {
      _clearHighlightedItem();
      _disableKeyboardMode();
      if (_$context) {
        _$context.off(".keyboard_navigation");
      }
      _$context = null;
      _item_selector = null;
      _$highlighted_item = null;
      _allow_highlight_without_blurring_input = false;
      _submit_item_handler = null;
      _use_data_ordering = false;
      _settings = null;
      $(document).off("mousemove.keyboard_navigation", _watchMouse);
      $(document).off("keydown", TS.kb_nav.onKeyDown);
    },
    getHighlightedItem: function() {
      return _$highlighted_item;
    },
    getItemByItemId: function(item_id) {
      var $items = _$context.children(_item_selector).filter(":not(.disabled):visible");
      var items = $.makeArray($items);
      for (var i = 0, $elem; i < items.length; ++i) {
        $elem = $(items[i]);
        if (item_id === $elem.data("item-id")) {
          return $elem;
        }
      }
    },
    clearHighlightedItem: function() {
      _clearHighlightedItem();
    },
    highlightFirstItem: function() {
      var first = _getFirst();
      if (first && first.length > 0) {
        _enableKeyboardMode();
        _highlightItemWithKey(first);
      } else {
        _clearHighlightedItem();
      }
    },
    highlightItemWithKey: function($el, no_scroll) {
      _highlightItemWithKey($el, no_scroll);
    },
    setAllowHighlightWithoutBlurringInput: function(bool) {
      _allow_highlight_without_blurring_input = bool;
    },
    setSubmitItemHandler: function(cb) {
      _submit_item_handler = cb;
    },
    onKeyDown: function(e) {
      if (TS.menu.emoji.is_showing) return;
      if (TS.boot_data.feature_texty_takes_over && TS.utility.contenteditable.hasFocus($("#menu_member_dm_input"))) return;
      var keymap = TS.utility.keymap;
      var key = e.which;
      var modifier_pressed = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      if (key == keymap.up && (_allow_highlight_without_blurring_input && !modifier_pressed || !_isElementTextInput(e.target))) {
        e.stopPropagation();
        e.preventDefault();
        _enableKeyboardMode();
        _moveHighlightUp(e);
        return;
      }
      if (key == keymap.down && (_allow_highlight_without_blurring_input && !modifier_pressed || !_isElementTextInput(e.target))) {
        e.stopPropagation();
        e.preventDefault();
        _enableKeyboardMode();
        _moveHighlightDown(e);
        return;
      }
      if (key == keymap.left && !_isElementTextInput(e.target)) {
        e.stopPropagation();
        e.preventDefault();
        _enableKeyboardMode();
        if (_settings && _settings.onLeftKeyDownIfSubmenuExists && _settings.onLeftKeyDownIfSubmenuExists(e)) return;
        _moveHighlightUp(e);
        return;
      }
      if (key == keymap.right && !_isElementTextInput(e.target)) {
        e.stopPropagation();
        e.preventDefault();
        _enableKeyboardMode();
        if (_settings && _settings.onRightKeyDownIfSubmenuExists && _settings.onRightKeyDownIfSubmenuExists(e)) return;
        _moveHighlightDown(e);
        return;
      }
      if (key == keymap.tab) {
        e.stopPropagation();
        e.preventDefault();
        _enableKeyboardMode();
        if (!_allow_highlight_without_blurring_input && _isElementTextInput(e.target)) {
          $(e.target).blur();
        }
        if (e.shiftKey) {
          _moveHighlightUp(e);
        } else {
          _moveHighlightDown(e);
        }
        return;
      }
      if (key == keymap.enter && _$highlighted_item) {
        if (_submit_item_handler) {
          var li = _$highlighted_item.get(0);
          if (li) {
            _submit_item_handler.call(li, e);
          } else {
            _submit_item_handler(e);
          }
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        _submitHighlightedItem();
        return;
      }
    }
  });
  var _css = {
    keyboard_active: "keyboard_active",
    no_pointer_events: "no_pointer_events"
  };
  var _$container = null;
  var _$context = null;
  var _keyboard_active = false;
  var _item_selector = null;
  var _$highlighted_item = null;
  var _allow_highlight_without_blurring_input = false;
  var _submit_item_handler = null;
  var _use_data_ordering = false;
  var _settings;
  var _enableKeyboardMode = function() {
    if (_keyboard_active) return;
    _$container.addClass(_css.keyboard_active);
    _$container.addClass(_css.no_pointer_events);
    _keyboard_active = true;
  };
  var _mouse = {
    lastX: null,
    lastY: null
  };
  var _watchMouse = function(e) {
    if (!_keyboard_active) {
      _mouse.lastX = e.clientX;
      _mouse.lastY = e.clientY;
      return;
    }
    if (_mouse.lastX === null) {
      _mouse.lastX = e.clientX;
      _mouse.lastY = e.clientY;
    } else {
      if (e.clientX !== _mouse.lastX || e.clientY !== _mouse.lastY) {
        _disableKeyboardMode();
      }
      _mouse.lastX = e.clientX;
      _mouse.lastY = e.clientY;
    }
  };
  var _disableKeyboardMode = function() {
    if (!_keyboard_active) return;
    _clearHighlightedItem();
    _$container.removeClass(_css.keyboard_active);
    _$container.removeClass(_css.no_pointer_events);
    _keyboard_active = false;
  };
  var _moveHighlightUp = function(e) {
    var next_item;
    var selector = _item_selector;
    if (_$highlighted_item) {
      next_item = _getPrev(_$highlighted_item);
    } else {
      next_item = _getLast();
    }
    if (next_item && next_item.length > 0) {
      _highlightItemWithKey(next_item);
    } else if (_$context.children(selector).filter(":not(.disabled):visible").length !== 0) {
      _clearHighlightedItem();
      _moveHighlightUp(e);
    }
  };
  var _moveHighlightDown = function(e) {
    var next_item;
    var selector = _item_selector;
    if (_$highlighted_item) {
      next_item = _getNext(_$highlighted_item);
    } else {
      next_item = _getFirst();
    }
    if (next_item && next_item.length > 0) {
      _highlightItemWithKey(next_item);
    } else if (_$context.children(selector).filter(":not(.disabled):visible").length !== 0) {
      _clearHighlightedItem();
      _moveHighlightDown(e);
    }
  };
  var _highlightItemWithKey = function($el, no_scroll) {
    _clearHighlightedItem();
    _$highlighted_item = $el;
    var px_offset = 0;
    if (_settings && _settings.px_offset) px_offset = _settings.px_offset;
    $el.addClass("highlighted");
    if (!no_scroll) $el.scrollintoview({
      offset: "top",
      px_offset: px_offset,
      duration: 0
    });
    if (!_settings || !_settings.no_blur) {
      $el.find("a:first").focus();
    }
    _$highlighted_item.trigger("highlighted");
  };
  var _clearHighlightedItem = function() {
    if (_$highlighted_item) {
      _$highlighted_item.trigger("unhighlighted");
      _$highlighted_item.removeClass("highlighted");
      _$highlighted_item = null;
    }
  };
  var _onHoverItem = function(e) {
    _clearHighlightedItem();
    _$highlighted_item = $(e.target).closest(_item_selector);
    _$highlighted_item.trigger("highlighted");
  };
  var _submitHighlightedItem = function() {
    if (_$highlighted_item) {
      _$highlighted_item.find("a:first").click();
    }
  };
  var _isElementTextInput = function(el) {
    return $(el).is("input, textarea");
  };
  var _getFirst = function() {
    if (_use_data_ordering) {
      if (_settings.scrollToStartImmediately) _settings.scrollToStartImmediately();
      var ordered = _getElementsOrdered();
      if (ordered.length === 0) return null;
      return $(ordered[0]);
    } else {
      return _$context.children(_item_selector).filter(":not(.disabled):visible:first");
    }
  };
  var _getLast = function() {
    if (_use_data_ordering) {
      if (_settings.scrollToEndImmediately) _settings.scrollToEndImmediately();
      var ordered = _getElementsOrdered();
      if (ordered.length === 0) return null;
      return $(ordered[ordered.length - 1]);
    } else {
      return _$context.children(_item_selector).filter(":not(.disabled):visible:last");
    }
  };
  var _getNext = function($current) {
    if (_use_data_ordering) {
      var ordered = _getElementsOrdered();
      var order_index = $current.data("order-index");
      for (var i = 0; i < ordered.length; i++) {
        if ($(ordered[i]).data("order-index") == order_index) {
          if (i + 1 < ordered.length) return $(ordered[i + 1]);
          break;
        }
      }
      return null;
    } else {
      var $context_list = _$context.children(_item_selector).filter(":not(.disabled):visible");
      var current_index = $context_list.index($current);
      return $context_list.eq(current_index + 1);
    }
  };
  var _getPrev = function($current) {
    if (_use_data_ordering) {
      var ordered = _getElementsOrdered();
      var order_index = $current.data("order-index");
      for (var i = 0; i < ordered.length; i++) {
        if ($(ordered[i]).data("order-index") == order_index) {
          if (i - 1 >= 0) return $(ordered[i - 1]);
          break;
        }
      }
      return null;
    } else {
      var $context_list = _$context.children(_item_selector).filter(":not(.disabled):visible");
      var current_index = $context_list.index($current);
      return $context_list.eq(current_index - 1);
    }
  };
  var _getElementsOrdered = function() {
    var $items = _$context.children(_item_selector).filter(":not(.disabled):visible");
    var items = $.makeArray($items);
    items.sort(function(a, b) {
      var a_index = $(a).data("order-index");
      var b_index = $(b).data("order-index");
      return a_index - b_index;
    });
    return items;
  };
})();
(function() {
  "use strict";
  TS.registerModule("sounds", {
    onStart: function() {
      var root_url = TS.boot_data.abs_root_url;
      var all_sounds = [].concat(TS.boot_data.notification_sounds || []).concat(TS.boot_data.alert_sounds || []).concat(TS.boot_data.call_sounds || []);
      var preloadA = [];
      TS.log(37, "adding all_sounds: " + all_sounds.length);
      all_sounds.forEach(function(sound) {
        if (!sound.url) return;
        if (sound.url.indexOf("http") !== 0) sound.url = root_url + sound.url.replace("/", "");
        if (sound.url_ogg && sound.url_ogg.indexOf("http") !== 0) sound.url_ogg = root_url + sound.url_ogg.replace("/", "");
        TS.log(37, "adding sound: " + sound.value);
        _sounds[sound.value] = {
          url: sound.url,
          url_ogg: sound.url_ogg
        };
        TS.log(37, "_sounds[" + sound.value + "] = " + _sounds[sound.value]);
        preloadA.push(sound.url);
      });
      if (window.Audio) {
        soundManager.onready(function() {
          $.each(_sounds, function(key, object) {
            if (object.url_ogg) object.url = [object.url, object.url_ogg];
            _sounds[key] = soundManager.createSound(object);
          });
        });
      }
      try {
        if (TSSSB.call("preloadSounds", preloadA)) {
          TS.log(37, "called TSSSB.call('preloadSounds', '" + preloadA + "')");
        } else {
          TS.log(37, "NOT CALLED TSSSB.call('preloadSounds', '" + preloadA + "')");
        }
      } catch (err) {
        TS.warn("error calling TSSSB.preloadSounds " + err + " " + preloadA);
      }
    },
    shouldMuteSounds: function(options) {
      options = options || {};
      options.ignore_mute = options.ignore_mute || false;
      var should_mute = TS.model && TS.model.prefs && TS.model.prefs.mute_sounds;
      should_mute = should_mute || TSSSB.call("shouldMuteAudio");
      should_mute = should_mute && !options.ignore_mute;
      return should_mute;
    },
    filenameForSoundName: function(which) {
      if (which == "new_message") {
        which = TS.model.prefs.new_msg_snd;
      }
      if (which == "none") {
        return;
      }
      if (which == "beep") {
        which = "frog.mp3";
      }
      if (!(which in _sounds)) {
        TS.warn("unknown sound: " + which);
        return;
      }
      if (TS.sounds.shouldMuteSounds()) {
        return;
      }
      return which;
    },
    soundForName: function(which, options) {
      which = TS.sounds.filenameForSoundName(which);
      if (!which) {
        return;
      }
      if (TS.sounds.shouldMuteSounds(options)) {
        return;
      }
      return _sounds[which];
    },
    play: function(which, options) {
      options = options || {};
      options.should_loop = options.should_loop || false;
      options.playback_device = options.playback_device || "";
      options.ignore_mute = options.ignore_mute || false;
      var sound = TS.sounds.soundForName(which, options);
      if (sound) {
        var args = {
          url: sound.url,
          should_loop: options.should_loop,
          playback_device: options.playback_device
        };
        if (TSSSB.call("playRemoteSound", args)) {
          TS.log(37, "called TSSSB.call('playRemoteSound', '" + JSON.stringify(args) + "'})");
        } else if (_.isFunction(sound.play)) {
          TS.log(37, "calling sound.play()");
          sound.play({
            loops: options.should_loop ? 999999 : 0
          });
        } else {
          TS.log(37, "wanted to call sound.play() but it is not a function");
        }
      } else if (soundManager) {
        TS.warn("sound is null: " + which + " window.Audio: " + window.Audio + " window.winssb: " + window.winssb + " soundManager.ok(): " + soundManager.ok() + " soundManager.html5Only: " + soundManager.html5Only + " soundManager.canPlayMIME('audio/mp3'): " + soundManager.canPlayMIME("audio/mp3"));
      }
    },
    stop: function(which, options) {
      options = options || {};
      options.ignore_mute = options.ignore_mute || false;
      var sound = TS.sounds.soundForName(which, options);
      if (sound) {
        if (TSSSB.call("stopRemoteSound", sound.url)) {
          TS.log(37, "called TSSSB.call('stopRemoteSound', '" + sound.url + "')");
        } else {
          TS.log(37, "calling sound.stop()");
          sound.stop();
        }
      } else if (soundManager) {
        TS.warn("sound is null: " + which + " window.Audio: " + window.Audio + " window.winssb: " + window.winssb + " soundManager.ok(): " + soundManager.ok() + " soundManager.html5Only: " + soundManager.html5Only + " soundManager.canPlayMIME('audio/mp3'): " + soundManager.canPlayMIME("audio/mp3"));
      }
    },
    getNotificationSoundNameFromFilename: function(filename) {
      var notif_sound = _.find(TS.boot_data.notification_sounds, {
        value: filename
      });
      if (!notif_sound) {
        TS.error("No notification sound found matching " + filename);
        return;
      }
      return notif_sound.label;
    }
  });
  var _sounds = {};
})();
(function() {
  "use strict";
  TS.registerModule("bandwidth", {
    onStart: function() {},
    promiseToCheckBandwidth: function() {
      if (_run_test_p) return _run_test_p;
      _run_test_p = _runTest();
      _run_test_p.catch(function() {
        _run_test_p = null;
      });
      return _run_test_p;
    }
  });
  var _bw;
  var _run_test_p;

  function _runTest() {
    return new Promise(function(resolve, reject) {
      _bw = {
        base_url: (window.cdn_url || "") + "/beacons/boomerang1/",
        timeout: 3e4,
        nruns: 5,
        latency_runs: 10,
        results: [],
        latencies: [],
        latency: null,
        runs_left: 0,
        aborted: false,
        complete: false
      };
      _bw.images = [{
        name: "image-0.png",
        size: 11483,
        timeout: 1400
      }, {
        name: "image-1.png",
        size: 40658,
        timeout: 1200
      }, {
        name: "image-2.png",
        size: 164897,
        timeout: 1300
      }, {
        name: "image-3.png",
        size: 381756,
        timeout: 1500
      }, {
        name: "image-4.png",
        size: 1234664,
        timeout: 1200
      }, {
        name: "image-5.png",
        size: 4509613,
        timeout: 1200
      }, {
        name: "image-6.png",
        size: 9084559,
        timeout: 1200
      }];
      _bw.images.end = _bw.images.length;
      _bw.images.start = 0;
      _bw.images.l = {
        name: "image-l.gif",
        size: 35,
        timeout: 1e3
      };
      _bw.images.start = 0;
      _bw.runs_left = _bw.nruns;
      _bw.latency_runs = 10;
      _bw.results = [];
      _bw.latencies = [];
      _bw.latency = null;
      _bw.complete = false;
      _bw.aborted = false;
      _bw.ncmp = function(a, b) {
        return a - b;
      };
      _bw.iqr = function(a) {
        var l = a.length - 1;
        var q1 = (a[Math.floor(l * .25)] + a[Math.ceil(l * .25)]) / 2;
        var q3 = (a[Math.floor(l * .75)] + a[Math.ceil(l * .75)]) / 2;
        var b = [];
        var i;
        var fw = (q3 - q1) * 1.5;
        l++;
        for (i = 0; i < l && a[i] < q3 + fw; i++) {
          if (a[i] > q1 - fw) {
            b.push(a[i]);
          }
        }
        return b;
      };
      _bw.calcLatency = function() {
        var i;
        var n;
        var sum = 0;
        var sumsq = 0;
        var amean;
        var median;
        var std_dev;
        var std_err;
        var lat_filtered;
        lat_filtered = this.iqr(this.latencies.sort(this.ncmp));
        n = lat_filtered.length;
        for (i = 1; i < n; i++) {
          sum += lat_filtered[i];
          sumsq += lat_filtered[i] * lat_filtered[i];
        }
        n--;
        amean = Math.round(sum / n);
        std_dev = Math.sqrt(sumsq / n - sum * sum / (n * n));
        std_err = (1.96 * std_dev / Math.sqrt(n)).toFixed(2);
        std_dev = std_dev.toFixed(2);
        n = lat_filtered.length - 1;
        median = Math.round((lat_filtered[Math.floor(n / 2)] + lat_filtered[Math.ceil(n / 2)]) / 2);
        return {
          mean: amean,
          median: median,
          stddev: std_dev,
          stderr: std_err
        };
      };
      _bw.calcBW = function() {
        var i;
        var j;
        var n = 0;
        var r;
        var bandwidths = [];
        var bandwidths_corrected = [];
        var sum = 0;
        var sumsq = 0;
        var sum_corrected = 0;
        var sumsq_corrected = 0;
        var amean;
        var std_dev;
        var std_err;
        var median;
        var amean_corrected;
        var std_dev_corrected;
        var std_err_corrected;
        var median_corrected;
        var nimgs;
        var bw;
        var bw_c;
        for (i = 0; i < this.nruns; i++) {
          if (!this.results[i] || !this.results[i].r) {
            continue;
          }
          r = this.results[i].r;
          nimgs = 0;
          for (j = r.length - 1; j >= 0 && nimgs < 3; j--) {
            if (typeof r[j] === "undefined") {
              break;
            }
            if (r[j].t === null) {
              continue;
            }
            n++;
            nimgs++;
            bw = this.images[j].size * 1e3 / r[j].t;
            bandwidths.push(bw);
            bw_c = this.images[j].size * 1e3 / (r[j].t - this.latency.mean);
            bandwidths_corrected.push(bw_c);
          }
        }
        if (bandwidths.length > 3) {
          bandwidths = this.iqr(bandwidths.sort(this.ncmp));
          bandwidths_corrected = this.iqr(bandwidths_corrected.sort(this.ncmp));
        } else {
          bandwidths = bandwidths.sort(this.ncmp);
          bandwidths_corrected = bandwidths_corrected.sort(this.ncmp);
        }
        n = Math.max(bandwidths.length, bandwidths_corrected.length);
        for (i = 0; i < n; i++) {
          if (i < bandwidths.length) {
            sum += bandwidths[i];
            sumsq += Math.pow(bandwidths[i], 2);
          }
          if (i < bandwidths_corrected.length) {
            sum_corrected += bandwidths_corrected[i];
            sumsq_corrected += Math.pow(bandwidths_corrected[i], 2);
          }
        }
        n = bandwidths.length;
        amean = Math.round(sum / n);
        std_dev = Math.sqrt(sumsq / n - Math.pow(sum / n, 2));
        std_err = Math.round(1.96 * std_dev / Math.sqrt(n));
        std_dev = Math.round(std_dev);
        n = bandwidths.length - 1;
        median = Math.round((bandwidths[Math.floor(n / 2)] + bandwidths[Math.ceil(n / 2)]) / 2);
        n = bandwidths_corrected.length;
        amean_corrected = Math.round(sum_corrected / n);
        std_dev_corrected = Math.sqrt(sumsq_corrected / n - Math.pow(sum_corrected / n, 2));
        std_err_corrected = (1.96 * std_dev_corrected / Math.sqrt(n)).toFixed(2);
        std_dev_corrected = std_dev_corrected.toFixed(2);
        n = bandwidths_corrected.length - 1;
        median_corrected = Math.round((bandwidths_corrected[Math.floor(n / 2)] + bandwidths_corrected[Math.ceil(n / 2)]) / 2);
        return {
          mean: amean,
          stddev: std_dev,
          stderr: std_err,
          median: median,
          mean_corrected: amean_corrected,
          stddev_corrected: std_dev_corrected,
          stderr_corrected: std_err_corrected,
          median_corrected: median_corrected
        };
      };
      _bw.defer = function(method) {
        var that = this;
        return setTimeout(function() {
          method.call(that);
          that = null;
        }, 10);
      };
      _bw.loadImg = function(i, run, callback) {
        var url = this.base_url + this.images[i].name + "?t=" + Date.now() + Math.random();
        var timer = 0;
        var tstart = 0;
        var img = new Image;
        var that = this;
        img.onload = function() {
          img.onload = img.onerror = null;
          img = null;
          clearTimeout(timer);
          if (callback) {
            callback.call(that, i, tstart, run, true);
          }
          that = callback = null;
        };
        img.onerror = function() {
          img.onload = img.onerror = null;
          img = null;
          clearTimeout(timer);
          if (callback) {
            callback.call(that, i, tstart, run, false);
          }
          that = callback = null;
        };
        timer = setTimeout(function() {
          if (callback) {
            callback.call(that, i, tstart, run, null);
          }
        }, this.images[i].timeout + Math.min(400, this.latency ? this.latency.mean : 400));
        tstart = Date.now();
        img.src = url;
      };
      _bw.latLoaded = function(i, tstart, run, success) {
        if (run !== this.latency_runs + 1) return;
        if (success !== null) {
          var lat = Date.now() - tstart;
          this.latencies.push(lat);
        }
        if (this.latency_runs === 0) {
          this.latency = this.calcLatency();
        }
        this.defer(this.iterate);
      };
      _bw.imgLoaded = function(i, tstart, run, success) {
        if (run !== this.runs_left + 1) return;
        if (this.results[this.nruns - run].r[i]) return;
        if (success === null) {
          this.results[this.nruns - run].r[i + 1] = {
            t: null,
            state: null,
            run: run
          };
          return;
        }
        var result = {
          start: tstart,
          end: Date.now(),
          t: null,
          state: success,
          run: run
        };
        if (success) {
          result.t = result.end - result.start;
        }
        this.results[this.nruns - run].r[i] = result;
        if (i >= this.images.end - 1 || typeof this.results[this.nruns - run].r[i + 1] !== "undefined") {
          if (run === this.nruns) {
            this.images.start = i;
          }
          this.defer(this.iterate);
        } else {
          this.loadImg(i + 1, run, this.imgLoaded);
        }
      };
      _bw.iterate = function() {
        if (this.aborted) {
          return false;
        }
        if (!this.runs_left) {
          this.finish();
        } else if (this.latency_runs) {
          this.loadImg("l", this.latency_runs--, this.latLoaded);
        } else {
          this.results.push({
            r: []
          });
          this.loadImg(this.images.start, this.runs_left--, this.imgLoaded);
        }
      };
      _bw.finish = function() {
        if (!this.latency) {
          this.latency = this.calcLatency();
        }
        var bw = this.calcBW();
        var o = {
          bw: bw.median_corrected,
          bw_err: parseFloat(bw.stderr_corrected, 10),
          lat: this.latency.mean,
          lat_err: parseFloat(this.latency.stderr, 10)
        };
        if (isNaN(o.bw) || isNaN(o.lat)) {
          o.kbps = 0;
          o.mbps = 0;
          reject(new Error("bandwidth test failed"));
          return;
        }
        o.kbps = Math.round(o.bw * 8 / 1024);
        o.mbps = Math.round(10 * o.kbps / 1024) / 10;
        if (_bw.timer) {
          window.clearTimeout(_bw.timer);
        }
        resolve(o);
      };
      _bw.timer = setTimeout(function() {
        _bw.aborted = true;
        _bw.finish();
      }, _bw.timeout);
      _bw.defer(_bw.iterate);
    });
  }
})();
