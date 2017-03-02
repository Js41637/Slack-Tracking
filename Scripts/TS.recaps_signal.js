(function() {
  "use strict";
  TS.registerModule("recaps_signal", {
    onStart: function() {
      if (!TS.client || !TS.boot_data.feature_sli_recaps) return;
      if (TS.recaps_signal.canHaveHighlightsUI() && TS.recaps_signal.canHaveArrowsAndMarkers()) {
        $("#messages_container").delegate(".recap_highlight_marker", "mouseenter", _onMouseEnter);
        $("#messages_container").delegate(".recap_highlight_marker", "mouseleave", _onMouseLeave);
        _subscribeScrollEvent();
        var _debounced_resize = _.debounce(_onResize, 200, {
          leading: false,
          trailing: true
        });
        $(window).on("resize", _debounced_resize);
        TS.channels.history_fetched_sig.add(_historyFetched);
        TS.groups.history_fetched_sig.add(_historyFetched);
        TS.inline_file_previews.collapse_sig.add(_onInlineExpandCollapse);
        TS.inline_file_previews.expand_sig.add(_onInlineExpandCollapse);
      }
    },
    canHaveHighlights: function() {
      if (!TS.client || !TS.boot_data.feature_sli_recaps) return false;
      return true;
    },
    canHaveHighlightsUI: function() {
      return !!TS.boot_data.feature_sli_recaps_interface;
    },
    canHaveArrowsAndMarkers: function() {
      return !!TS.boot_data.feature_sli_recaps_arrows_and_markers;
    },
    channelAllowHighlights: function() {
      var model_ob = TS.shared.getActiveModelOb();
      return !(model_ob.is_mpim || model_ob.is_im);
    },
    remove: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      $("#markers_container").remove();
      _last_message_in_frame = null;
      TS.recaps_signal.hideHighlightsPills();
    },
    maybeMarkChannelAsDirty: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (_last_channel_id != TS.model.active_cid) {
        _last_channel_id = TS.model.active_cid;
        _channel_is_dirty = true;
        var model_ob = TS.shared.getActiveModelOb();
        _channel_unread_data = {
          count: model_ob.unread_cnt,
          last_read_ts: model_ob.last_read,
          oldest_unread_ts: model_ob.oldest_unread_ts,
          channel_open_ts: TS.utility.date.makeTsStamp(new Date, "0")
        };
        var min_num_unreads = 10;
        if (model_ob.unread_cnt < min_num_unreads) _channel_is_dirty = false;
        _channelSwitched();
      }
    },
    retrieveHighlights: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.channelAllowHighlights()) return;
      var model_ob = TS.shared.getActiveModelOb();
      if (_is_checking_membership_count_for_model_ob[model_ob.id]) return;
      _is_checking_membership_count_for_model_ob[model_ob.id] = true;
      TS.membership.promiseToGetMembershipCounts(model_ob).then(function(counts) {
        var min_number_of_members = 5;
        if (counts.member_count < min_number_of_members) return;
        _retrieveHighlights(model_ob);
      }).finally(function() {
        delete _is_checking_membership_count_for_model_ob[model_ob.id];
      });
    },
    handleUpdateScrollbar: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      TS.recaps_signal.remove();
      if (_channel_is_dirty) {
        _maybeAutoHighlight();
      }
      if (_highlights_mode === _HIGHLIGHTS_MODE_OFF) return;
      var messages = _retrieveAllHighlightMsgs();
      if (!messages.length) return;
      if (!TS.recaps_signal.channelAllowHighlights()) return;
      if (TS.recaps_signal.canHaveArrowsAndMarkers()) {
        TS.recaps_signal.displayRecapNavigation();
      }
      var at_the_bottom = TS.client.ui.areMsgsScrolledToBottom(1);
      TS.recaps_signal.displayHighlightsPills(messages);
      if (at_the_bottom) {
        TS.client.ui.instaScrollMsgsToBottom();
      }
      _buildMarkers(messages);
      _resetContext();
      if (_hasViewSwitched()) {
        _viewSwitched();
        _subscribeScrollEvent();
      }
      if (messages.length > 0) {
        _last_message_in_frame = messages.last().get(0);
        _first_message_in_frame = messages.first().get(0);
      }
      _handleHighlightsNavArrowUI();
    },
    redrawMarkersOnly: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (_highlights_mode === _HIGHLIGHTS_MODE_OFF) return;
      if (!TS.recaps_signal.channelAllowHighlights()) return;
      var messages = _retrieveAllHighlightMsgs();
      if (!messages.length) return;
      _buildMarkers(messages);
    },
    displayRecapNavigation: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      if (_highlights_mode != _HIGHLIGHTS_MODE_OFF) {
        $("#msg_form").addClass("show_recap_nav");
        $("#recap_nav").removeClass("hidden");
        _displayArrowsCoachmark();
      }
    },
    hideRecapNavigation: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      $("#msg_form").removeClass("show_recap_nav");
      $("#recap_nav").addClass("hidden");
    },
    displayHighlightsPills: function($msgs) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      $msgs.addClass("show_recap");
    },
    hideHighlightsPills: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      $("ts-message.is_recap").removeClass("show_recap");
    },
    toggleOnHighlights: function(user_action) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (user_action) _channel_is_dirty = false;
      if (user_action) {
        _highlights_mode = _HIGHLIGHTS_MODE_MANUAL;
      } else {
        _highlights_mode = _HIGHLIGHTS_MODE_AUTO;
      }
      if (user_action) {
        TS.recaps_signal.retrieveHighlights();
      } else {
        TS.recaps_signal.handleUpdateScrollbar();
      }
    },
    toggleOffHighlights: function(user_action) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      TS.recaps_signal.hideRecapNavigation();
      TS.recaps_signal.remove();
      TS.recaps_signal.hideHighlightsPills();
      if (user_action) _channel_is_dirty = false;
      _highlights_mode = _HIGHLIGHTS_MODE_OFF;
    },
    toggleChannelOverflowPref: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      var user_action = true;
      if (_highlights_mode !== _HIGHLIGHTS_MODE_OFF) {
        TS.recaps_signal.logToggleClick(false);
        TS.recaps_signal.toggleOffHighlights(user_action);
      } else {
        TS.recaps_signal.logToggleClick(true);
        TS.recaps_signal.toggleOnHighlights(user_action);
      }
    },
    isHighlightsOn: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      return _highlights_mode !== _HIGHLIGHTS_MODE_OFF;
    },
    msgShouldBeHighlighted: function(msg) {
      return TS.recaps_signal.isMessageHighlight(msg) && (_highlights_mode == _HIGHLIGHTS_MODE_MANUAL || _highlights_mode == _HIGHLIGHTS_MODE_AUTO && _tsIsUnread(msg.ts));
    },
    navigateRecap: function(direction) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      if (direction === "prev" && _shouldRetrieveHistory()) {
        TS.recaps_signal.logNavClick(direction, null, true, false);
        return _retrieveHistory();
      }
      if (direction === "next" && _shouldRetreiveRecentMessages()) {
        TS.recaps_signal.logNavClick(direction, null, true, false);
        return _retrieveRecentMessages();
      }
      _navigationClicked();
      var marker = _getMarkerFromMsg(_last_scrolled_el);
      if (_isElementInViewport(_last_scrolled_el) || _getMilliTime() - _last_scrolled_time < _MESSAGE_SCROLL_DURATION) {
        marker = direction === "next" ? _getNextMarker(marker) : _getPreviousMarker(marker);
        marker = _isMarker(marker) ? marker : null;
      } else {
        if (!TS.model.archive_view_is_showing) {
          var last_marker = $(".recap_highlight_marker").last().get(0);
          var last_msg = _getMsgFromMarker(last_marker);
          if (!_last_scrolled_el && _isElementInViewport(last_msg)) {
            marker = last_marker;
          } else {
            var msg_to_scroll_to = _retrieveClosestMessage(direction);
            marker = _getMarkerFromMsg(msg_to_scroll_to);
          }
        } else {
          var msg_to_scroll_to = _retrieveClosestMessage(direction);
          marker = _getMarkerFromMsg(msg_to_scroll_to);
        }
      }
      if (!marker) {
        if (direction === "next") {
          TS.recaps_signal.logNavClick(direction, null, false, true);
          TS.client.ui.slowScrollMsgsToBottom();
          _last_scrolled_el = null;
          _disableRecapNav("next");
        }
        return;
      }
      TS.recaps_signal.logNavClick(direction, $(marker), false);
      TS.recaps_signal.scrollRecapMessageIntoView(marker);
      if (direction === "prev") {
        _enableRecapNav("next");
      }
      if (_getMsgFromMarker(marker) == _last_message_in_frame && TS.client.ui.areMsgsScrolledToBottom(1, true)) {
        _disableRecapNav("next");
      }
      var enable_prev_arrow = true;
      if (!_isMarker(_getPreviousMarker(marker)) && !_channelHasMoreMessage()) {
        enable_prev_arrow = false;
      }
      if (enable_prev_arrow) {
        _enableRecapNav("prev");
      } else {
        _disableRecapNav("prev");
      }
    },
    arrowsCoachmarkResolved: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      TS.model.prefs.seen_highlights_arrows_coachmark = true;
      TS.prefs.setPrefByAPI({
        name: "seen_highlights_arrows_coachmark",
        value: true
      });
    },
    messageCoachmarkResolved: function() {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      TS.model.prefs.seen_highlights_coachmark = true;
      TS.prefs.setPrefByAPI({
        name: "seen_highlights_coachmark",
        value: true
      });
      TS.coachmark.end(true);
    },
    sendFeedback: function(channel_ob, msg, feedback) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      var clog_args = {
        request_id: _last_request_id,
        channel_id: channel_ob.id,
        message_timestamp: msg.ts,
        channel_type: channel_ob.id[0] || "",
        message_request_id: msg.recap.data.request_id
      };
      if (feedback) {
        TS.clog.track("MSG_RECAP_POSITIVE_CLICK", clog_args);
      } else {
        TS.clog.track("MSG_RECAP_NEGATIVE_CLICK", clog_args);
      }
    },
    sendSuggestion: function(channel, ts) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      var model_ob = TS.shared.getActiveModelOb();
      var msg = _getMsgObjFromModelOb(model_ob, ts);
      var clog_args = {
        request_id: _last_request_id,
        channel_id: channel,
        message_timestamp: ts,
        channel_type: channel[0] || "",
        message_request_id: msg.recap.data.request_id
      };
      TS.clog.track("MSG_RECAP_SUGGEST_CLICK", clog_args);
    },
    scrollRecapMessageIntoView: function(marker) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!TS.recaps_signal.canHaveHighlightsUI()) return;
      if (!marker) return;
      var ts = $(marker).data("ts");
      _scrollMessageToCenter(ts);
      _last_scrolled_el = _getMsgFromMarker(marker);
      _last_scrolled_time = _getMilliTime();
    },
    logMarkerClick: function($marker) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!$marker) return;
      var msg_ts = $marker.data("ts") + "";
      var model_ob = TS.shared.getActiveModelOb();
      if (!msg_ts || !model_ob) return;
      var msg = _getMsgObjFromModelOb(model_ob, msg_ts);
      TS.clog.track("MSG_RECAP_MARKER_CLICK", {
        request_id: _last_request_id,
        message_timestamp: msg_ts,
        channel_id: model_ob.id,
        channel_type: model_ob.id ? model_ob.id.charAt(0) : "",
        message_request_id: msg.recap.data.request_id
      });
    },
    logMarkerHover: function($marker) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!$marker) return;
      var msg_ts = $marker.data("ts") + "";
      var model_ob = TS.shared.getActiveModelOb();
      if (!msg_ts || !model_ob) return;
      var msg = _getMsgObjFromModelOb(model_ob, msg_ts);
      TS.clog.track("MSG_RECAP_MARKER_HOVER", {
        request_id: _last_request_id,
        message_timestamp: msg_ts,
        channel_id: model_ob.id,
        channel_type: model_ob.id ? model_ob.id.charAt(0) : "",
        message_request_id: msg.recap.data.request_id
      });
    },
    logMarkerUnhover: function($marker) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      if (!$marker) return;
      var msg_ts = $marker.data("ts") + "";
      var model_ob = TS.shared.getActiveModelOb();
      if (!msg_ts || !model_ob) return;
      var msg = _getMsgObjFromModelOb(model_ob, msg_ts);
      TS.clog.track("MSG_RECAP_MARKER_UNHOVER", {
        request_id: _last_request_id,
        message_timestamp: msg_ts,
        channel_id: model_ob.id,
        channel_type: model_ob.id ? model_ob.id.charAt(0) : "",
        message_request_id: msg.recap.data.request_id
      });
    },
    logNavClick: function(direction, $marker, fetch_history, scroll_bottom) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      var model_ob = TS.shared.getActiveModelOb();
      if (!model_ob) return;
      var payload = {
        request_id: _last_request_id,
        channel_id: model_ob.id,
        channel_type: model_ob.id ? model_ob.id.charAt(0) : "",
        direction: direction,
        fetch_history: fetch_history,
        scroll_bottom: scroll_bottom
      };
      if ($marker) {
        var msg_ts = $marker.data("ts") + "";
        if (msg_ts) {
          payload["message_timestamp"] = msg_ts;
          var msg = _getMsgObjFromModelOb(model_ob, msg_ts);
          payload["message_request_id"] = msg.recap.data.request_id;
        }
      }
      TS.clog.track("MSG_RECAP_NAV_CLICK", payload);
    },
    logToggleClick: function(enable) {
      if (!TS.recaps_signal.canHaveHighlights()) return;
      var model_ob = TS.shared.getActiveModelOb();
      if (!model_ob) return;
      TS.clog.track("MSG_RECAP_TOGGLE_CLICK", {
        request_id: _last_request_id,
        channel_id: model_ob.id,
        channel_type: model_ob.id ? model_ob.id.charAt(0) : "",
        enable: enable
      });
    },
    isMessageHighlight: function(msg) {
      if (!TS.recaps_signal.canHaveHighlights()) return false;
      return msg.recap && msg.recap.data && msg.recap.data.show_recap;
    },
    isMessageHighlightedUnfurl: function(msg) {
      if (!TS.recaps_signal.canHaveHighlights()) return false;
      return _.get(msg, "recap.data.is_unfurl");
    },
    markFeedbackForMessage: function(msg_ts, positive) {
      var model_ob = TS.shared.getActiveModelOb();
      var msg = _getMsgObjFromModelOb(model_ob, msg_ts);
      msg._sli_received_feedback = true;
      msg._sli_feedback_value = positive;
      TS.recaps_signal.sendFeedback(model_ob, msg, positive);
    }
  });
  var _is_checking_membership_count_for_model_ob = {};
  var _MESSAGE_SCROLL_DURATION = 350;
  var _MARKER_HEIGHT = 3;
  var _MESSAGE_PANE_BEFORE_HEIGHT = 8;
  var _MESSAGE_PREVIEW_HEIGHT = 58;
  var _MESSAGE_PREVIEW_VERTICAL_PADDING = 2;
  var _MARKER_MINIMUM_PADDING = 1;
  var _HIGHLIGHTS_MODE_OFF = 0;
  var _HIGHLIGHTS_MODE_AUTO = 1;
  var _HIGHLIGHTS_MODE_MANUAL = 2;
  var _highlights_mode = _HIGHLIGHTS_MODE_OFF;
  var _last_request_id = null;
  var _last_scrolled_el = null;
  var _last_scrolled_time = 0;
  var _last_message_in_frame = null;
  var _first_message_in_frame = null;
  var _viewport_bottom_edge = null;
  var _viewport_top_edge = null;
  var _channel_has_more_message = null;
  var _channel_has_more_recent_message = null;
  var _scrolling_to_top = false;
  var _loading_history = false;
  var _last_updated_view = "";
  var _last_channel_id = false;
  var _channel_is_dirty = false;
  var _channel_unread_data = null;
  var _subscribeScrollEvent = function() {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (!TS.recaps_signal.canHaveArrowsAndMarkers()) return;
    var debouced_scrolling = _.debounce(_onScroll, 500, {
      leading: false,
      trailing: true
    });
    if (TS.model.archive_view_is_showing) {
      $("#archive_msgs_scroller_div").on("scroll", debouced_scrolling);
    } else {
      $("#msgs_scroller_div").on("scroll", debouced_scrolling);
    }
  };
  var _onScroll = function() {
    if (_highlights_mode === _HIGHLIGHTS_MODE_OFF) return;
    if (!_isElementInViewport(_last_scrolled_el)) _last_scrolled_el = null;
    _handleHighlightsNavArrowUI();
    _displayMessageCoachmark();
  };
  var _onResize = function() {
    TS.recaps_signal.handleUpdateScrollbar();
    _clearViewportEdgeCache();
  };
  var _onInlineExpandCollapse = function() {
    TS.recaps_signal.redrawMarkersOnly();
  };
  var _handleHighlightsNavArrowUI = function() {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (!_last_message_in_frame) {
      _disableRecapNav("both");
      return;
    }
    if (_highlights_mode === _HIGHLIGHTS_MODE_AUTO && (_last_message_in_frame === _first_message_in_frame || TS.model.archive_view_is_showing)) {
      TS.recaps_signal.hideRecapNavigation();
      return;
    }
    if (_loading_history) return;
    if (TS.model.archive_view_is_showing || !TS.client.ui.areMsgsScrolledToBottom(1, true) || _last_scrolled_el != _last_message_in_frame && _last_scrolled_el != null) {
      _enableRecapNav("next");
    } else {
      _disableRecapNav("next");
    }
    var enable_prev_arrow = true;
    if (!_channelHasMoreMessage()) {
      var rect = _first_message_in_frame.getBoundingClientRect();
      if (rect.top > _getViewportTopEdge()) {
        if (_isElementInViewport(_last_scrolled_el)) {
          if (_last_scrolled_el == _first_message_in_frame) {
            enable_prev_arrow = false;
          }
        } else {
          enable_prev_arrow = false;
        }
      }
    }
    if (_last_scrolled_el == null && TS.client.ui.areMsgsScrolledToBottom(1, true)) {
      enable_prev_arrow = true;
    }
    if (enable_prev_arrow) {
      _enableRecapNav("prev");
    } else {
      _disableRecapNav("prev");
    }
  };
  var _resetContext = function() {
    _channel_has_more_message = null;
    _channel_has_more_recent_message = null;
    _last_message_in_frame = null;
    _first_message_in_frame = null;
  };
  var _channelSwitched = function(highlighted_messages) {
    _last_request_id = null;
    _viewSwitched();
    TS.recaps_signal.toggleOffHighlights();
  };
  var _viewSwitched = function() {
    _last_scrolled_el = null;
    _last_scrolled_time = 0;
  };
  var _hasViewSwitched = function() {
    var new_view;
    if (TS.model.archive_view_is_showing) {
      new_view = "archive";
    } else {
      new_view = "normal";
    }
    if (_last_updated_view == new_view) {
      return false;
    } else {
      _last_updated_view = new_view;
      return true;
    }
  };
  var _viewPortAboveTopMessage = function() {
    if (!_first_message_in_frame) return true;
    var rect = _first_message_in_frame.getBoundingClientRect();
    return rect.top > _getViewportBottomEdge();
  };
  var _viewPortBelowBottomMessage = function() {
    if (!_last_message_in_frame) return true;
    var rect = _last_message_in_frame.getBoundingClientRect();
    return rect.bottom < _getViewportTopEdge();
  };
  var _isElementInViewport = function(el) {
    if (!el) return false;
    var rect = el.getBoundingClientRect();
    return rect.top >= _getViewportTopEdge() && rect.bottom <= _getViewportBottomEdge() || rect.top <= _getViewportTopEdge() && rect.bottom >= _getViewportTopEdge() || rect.top <= _getViewportBottomEdge() && rect.bottom >= _getViewportBottomEdge();
  };
  var _clearViewportEdgeCache = function() {
    _viewport_bottom_edge = null;
    _viewport_top_edge = null;
  };
  var _getViewportTopEdge = function() {
    if (!_viewport_top_edge) {
      _viewport_top_edge = $("#client_header").height();
    }
    return _viewport_top_edge;
  };
  var _getViewportBottomEdge = function() {
    if (!_viewport_bottom_edge) {
      _viewport_bottom_edge = document.documentElement.clientHeight - $("#msg_form").height();
    }
    return _viewport_bottom_edge;
  };
  var _retrieveClosestMessage = function(direction) {
    var recaps = _retrieveAllHighlightMsgs();
    var cur_index = 0;
    var rect = null;
    var found = false;
    var local_viewport_bottom_edge = _getViewportBottomEdge();
    var local_viewport_top_edge = _getViewportTopEdge();
    for (var i = 0; i < recaps.length; i++) {
      cur_index = direction === "next" ? recaps.length - 1 - i : i;
      rect = recaps[cur_index].getBoundingClientRect();
      if (direction === "next") {
        if (rect.bottom < local_viewport_bottom_edge) {
          found = true;
          break;
        }
      } else {
        if (rect.top > local_viewport_top_edge) {
          found = true;
          break;
        }
      }
    }
    if (direction === "next") {
      if (found) cur_index += 1;
    } else {
      if (found) cur_index -= 1;
    }
    return recaps[cur_index];
  };
  var _channelHasMoreMessage = function() {
    if (_channel_has_more_message == null) {
      if (TS.model.archive_view_is_showing) {
        _channel_has_more_message = $("#archives_top_div a").length > 0;
      } else {
        var model_ob = TS.shared.getActiveModelOb();
        var status = TS.utility.msgs.getOlderMsgsStatus(model_ob);
        _channel_has_more_message = status.more;
        if (_highlights_mode === _HIGHLIGHTS_MODE_AUTO) {
          if (parseFloat(model_ob.msgs[model_ob.msgs.length - 1].ts) <= parseFloat(_channel_unread_data.last_read_ts)) {
            _channel_has_more_message = false;
          }
        }
      }
    }
    return _channel_has_more_message;
  };
  var _channelHasMoreRecentMessage = function() {
    if (_channel_has_more_recent_message == null) {
      if (TS.model.archive_view_is_showing) {
        _channel_has_more_recent_message = $("#archives_bottom_div a").length > 0;
      } else {
        _channel_has_more_recent_message = false;
      }
    }
    return _channel_has_more_recent_message;
  };
  var _historyFetched = function() {
    if (_loading_history) {
      var marker = _getMarkerFromMsg(_last_scrolled_el);
      marker = _getPreviousMarker(marker);
      if (marker) {
        TS.recaps_signal.scrollRecapMessageIntoView(marker);
      }
      _loading_history = false;
    }
  };
  var _retrieveHistory = function() {
    if (_scrolling_to_top) return;
    if (_channelHasMoreMessage()) {
      _scrolling_to_top = true;
      _loading_history = true;
      _disableRecapNav("both");
      var scroller_div;
      if (TS.model.archive_view_is_showing) {
        scroller_div = $("#archive_msgs_scroller_div");
      } else {
        scroller_div = $("#msgs_scroller_div");
      }
      scroller_div.animate({
        scrollTop: 0
      }, "fast", function() {
        if (TS.model.archive_view_is_showing) {
          TS.client.archives.loadMoreTop();
        }
        _scrolling_to_top = false;
      });
    }
    return;
  };
  var _retrieveRecentMessages = function() {
    if (_scrolling_to_top) return;
    if (_last_updated_view != "archive") return;
    if (_channelHasMoreRecentMessage()) {
      _scrolling_to_top = true;
      _loading_history = true;
      _disableRecapNav("both");
      var scroller_div;
      if (TS.model.archive_view_is_showing) {
        scroller_div = $("#archive_msgs_scroller_div");
      } else {
        scroller_div = $("#msgs_scroller_div");
      }
      scroller_div.animate({
        scrollTop: scroller_div.get(0).scrollHeight - scroller_div.get(0).clientHeight
      }, "fast", function() {
        TS.client.archives.loadMoreBottom();
        _scrolling_to_top = false;
      });
    }
    return;
  };
  var _shouldRetrieveHistory = function() {
    if (!_channelHasMoreMessage()) return false;
    if (_first_message_in_frame == null) return true;
    if (_viewPortAboveTopMessage()) return true;
    if (_isElementInViewport(_first_message_in_frame)) {
      if (_last_scrolled_el == null) return true;
      if ($(_last_scrolled_el).data("ts") == $(_first_message_in_frame).data("ts")) return true;
      if (!_isElementInViewport(_last_scrolled_el)) return true;
    }
    return false;
  };
  var _shouldRetreiveRecentMessages = function() {
    if (!_channelHasMoreRecentMessage()) return false;
    if (_last_message_in_frame == null) return true;
    if (_viewPortBelowBottomMessage()) return true;
    if (_isElementInViewport(_last_message_in_frame)) {
      if (_last_scrolled_el == null) return true;
      if ($(_last_scrolled_el).data("ts") == $(_last_message_in_frame).data("ts")) return true;
      if (!_isElementInViewport(_last_scrolled_el)) return true;
    }
    return false;
  };
  var _maybeAutoHighlight = function() {
    var highlighted_messages = _retrieveAllHighlightMsgs();
    var latest_highlight_ts = highlighted_messages.last().data("ts");
    if (!_tsIsUnread(latest_highlight_ts)) return;
    _channel_is_dirty = false;
    TS.recaps_signal.toggleOnHighlights();
    _highlights_mode = _HIGHLIGHTS_MODE_AUTO;
  };
  var _disableRecapNav = function(button) {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (button == "next" || button == "both") {
      $("#recap_nav button.next").addClass("disabled");
    }
    if (button == "prev" || button == "both") {
      $("#recap_nav button.prev").addClass("disabled");
    }
  };
  var _enableRecapNav = function(button) {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (button == "next" || button == "both") {
      $("#recap_nav button.next").removeClass("disabled");
    }
    if (button == "prev" || button == "both") {
      $("#recap_nav button.prev").removeClass("disabled");
    }
  };
  var _callHighlightsList = function(channel_id, msgs) {
    return TS.api.call("highlights.list", {
      channel: channel_id,
      messages: JSON.stringify(msgs),
      channel_open_ts: _channel_unread_data.channel_open_ts,
      channel_open_last_read_ts: _channel_unread_data.last_read_ts
    }).then(function(r) {
      _last_request_id = r.request_id;
      return r;
    }).catch(function(e) {
      throw e;
    });
  };
  var _addMsgRecap = function(model_ob, msg, promise) {
    if (msg.recap) return;
    msg.recap = {
      promise: Promise.resolve(promise).then(function(r) {
        var self = msg.recap;
        self.data = (r.data.messages[model_ob.id] || {})[msg.ts] || {};
        self.data.request_id = r.request_id;
        return msg;
      }).catch(function(e) {
        var self = msg.recap;
        self.error = e.data.error;
        throw e;
      }),
      data: null,
      error: null
    };
    return msg.recap.promise;
  };
  var _highlightChannelMsgs = function(msgs) {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    var highlights = {};
    var unfurls = {};
    msgs.forEach(function(msg) {
      if (TS.recaps_signal.isMessageHighlight(msg)) highlights[msg.ts] = true;
      if (TS.recaps_signal.isMessageHighlightedUnfurl(msg)) unfurls[msg.ts] = true;
    });
    var $msg_divs = _retrieveAllMsgs();
    var $selection = $("");
    var $unfurls = $("");
    for (var i = 0; i < $msg_divs.length; i++) {
      var ts = $($msg_divs[i]).data("ts");
      if (highlights[ts]) $selection = $selection.add($msg_divs[i]);
      if (unfurls[ts]) $unfurls = $unfurls.add($msg_divs[i]);
    }
    $unfurls.addClass("is_recap_unfurl");
    $selection.addClass("is_recap");
  };
  var _buildMarkers = function(messages) {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (!TS.recaps_signal.canHaveArrowsAndMarkers()) return;
    var scroll_content;
    if (TS.model.archive_view_is_showing) {
      scroll_content = $("#archive_msgs_scroller_div #archives_msgs_div").get(0);
    } else {
      scroll_content = $("#msgs_scroller_div #msgs_div").get(0);
    }
    var content_height = scroll_content.clientHeight;
    if (content_height == 0) return;
    var markers = [];
    var $scroll_wrapper = $("#messages_container");
    var message_pane_rect = $scroll_wrapper.get(0).getBoundingClientRect();
    var message_pane_height = message_pane_rect.height;
    var marker_offset_perc = _MARKER_HEIGHT / 2 / message_pane_height * 100;
    var top_message_pane_preview_offset = _MESSAGE_PREVIEW_HEIGHT / 2 + _MESSAGE_PANE_BEFORE_HEIGHT + _MESSAGE_PREVIEW_VERTICAL_PADDING;
    var bottom_message_pane_preview_offset = message_pane_height - _MESSAGE_PREVIEW_HEIGHT / 2 - _MESSAGE_PREVIEW_VERTICAL_PADDING;
    var minimum_marker_top_pct = (_MESSAGE_PANE_BEFORE_HEIGHT + _MARKER_MINIMUM_PADDING) / message_pane_height * 100;
    var maximum_marker_top_pct = 100 - (_MARKER_HEIGHT + _MARKER_MINIMUM_PADDING) / message_pane_height * 100;
    var marker = null;
    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var offset_top = msg.offsetTop;
      var parent_offset_top = msg.offsetParent.offsetTop;
      var msg_height_half = $(msg).outerHeight(true) / 2;
      var offset_top_pct = (offset_top + parent_offset_top + msg_height_half - message_pane_rect.top) / content_height * 100;
      offset_top_pct -= marker_offset_perc;
      if (offset_top_pct < minimum_marker_top_pct) {
        offset_top_pct = minimum_marker_top_pct;
      }
      if (offset_top_pct > maximum_marker_top_pct) {
        offset_top_pct = maximum_marker_top_pct;
      }
      marker = {
        position: offset_top_pct,
        ts: msg.dataset.ts
      };
      if (i > 0) {
        var perc_difference = (marker.position - markers[i - 1].position) / 100;
        if (perc_difference * message_pane_height < _MARKER_HEIGHT) {
          marker.no_before = true;
          markers[i - 1].no_after = true;
        }
      }
      var preview_px_offset = offset_top_pct / 100 * message_pane_height;
      if (preview_px_offset > bottom_message_pane_preview_offset) {
        marker.hover_position_top = _pxToRem(bottom_message_pane_preview_offset - preview_px_offset - _MESSAGE_PREVIEW_HEIGHT / 2);
      }
      if (preview_px_offset < top_message_pane_preview_offset) {
        marker.hover_position_top = _pxToRem(top_message_pane_preview_offset - preview_px_offset - _MESSAGE_PREVIEW_HEIGHT / 2);
      }
      markers.push(marker);
    }
    $("#markers_container").remove();
    $scroll_wrapper.append(TS.templates.markers_view({
      markers: markers
    }));
    $("#markers_container").height(message_pane_height);
  };
  var _displayMessageCoachmark = function() {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (!TS.recaps_signal.canHaveArrowsAndMarkers()) return;
    if (TS.client && !TS.model.prefs.seen_highlights_coachmark && !TS.coachmark.is_showing) {
      if (!_last_message_in_frame) return;
      var $msg_to_coach = _firstHighlightMessageInViewport();
      if (!$msg_to_coach) return;
      $(".highlights_message_to_coach").removeClass("highlights_message_to_coach");
      $msg_to_coach.children(".is_highlights_holder").children(".highlights_feedback_trigger").addClass("highlights_message_to_coach");
      if (TS.coachmark.$coachmark) {
        TS.coachmark.end(true);
      }
      TS.coachmark.start(TS.coachmarks.coachmarks.highlights_message, true);
      var coachmark_footer = $("#highlights_message_coachmark_div").next();
      coachmark_footer.children(".coachmark_got_it").removeClass("hidden");
      coachmark_footer.children(".coachmark_next_tip").addClass("hidden");
    }
  };
  var _displayArrowsCoachmark = function() {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    if (!TS.recaps_signal.canHaveArrowsAndMarkers()) return;
    if (!TS.model.prefs.seen_highlights_coachmark) return;
    if (TS.client && !TS.model.prefs.seen_highlights_arrows_coachmark && !TS.coachmark.is_showing) {
      var all_highlighted_msgs = _retrieveAllHighlightMsgs();
      if (all_highlighted_msgs.length < 2) return;
      TS.coachmark.start(TS.coachmarks.coachmarks.highlights_arrows);
      var coachmark_footer = $("#highlights_arrows_coachmark_div").next();
      coachmark_footer.children(".coachmark_got_it").removeClass("hidden");
      coachmark_footer.children(".coachmark_next_tip").addClass("hidden");
    }
  };
  var _navigationClicked = function() {
    if (TS.model.prefs.seen_highlights_coachmark) return;
    TS.model.prefs.seen_highlights_coachmark = true;
    TS.prefs.setPrefByAPI({
      name: "seen_highlights_coachmark",
      value: true
    });
  };
  var _onMouseEnter = function(e) {
    var $marker = $(e.currentTarget);
    if ($marker.has(".recap_hover").length) return;
    TS.recaps_signal.logMarkerHover($marker);
    var recap_hover = TS.templates.builders.strBuilder('<div class="recap_hover" style="width:${w}px; height:${h}px;"><div class="recap_hover_message_preview"></div></div>', {
      w: 400,
      h: 58
    });
    recap_hover = $(recap_hover);
    if ($marker.attr("data-hover-position-top")) {
      recap_hover.css("top", $marker.attr("data-hover-position-top") + "rem");
    }
    $marker.append(recap_hover);
    var ts = $marker.attr("data-ts");
    var model_ob = TS.shared.getActiveModelOb();
    var msg = _getMsgObjFromModelOb(model_ob, ts);
    var cloned_msg = jQuery.extend(true, {}, msg);
    if (msg.attachments && !msg.text && msg.subtype != "reply_broadcast") {
      cloned_msg.text = "Shared a message from " + msg.attachments[0].author_name;
    }
    var preview_msg = TS.templates.builders.msgs.buildHTML({
      msg: cloned_msg,
      model_ob: model_ob,
      hide_actions: true,
      full_date: true
    });
    recap_hover.children(".recap_hover_message_preview").append(preview_msg);
  };
  var _onMouseLeave = function(e) {
    var $marker = $(e.currentTarget);
    TS.recaps_signal.logMarkerUnhover($marker);
    $marker.empty();
  };
  var _firstHighlightMessageInViewport = function() {
    var $all_msgs = _retrieveAllHighlightMsgs();
    var num_msgs = $all_msgs.length;
    if (!num_msgs) return null;
    for (var i = 0; i < num_msgs; i++) {
      var rect = $all_msgs[i].getBoundingClientRect();
      if (rect.top >= _getViewportTopEdge() && rect.top < _getViewportBottomEdge() - 20) {
        return $($all_msgs[i]);
      }
    }
    return null;
  };
  var _retrieveAllMsgs = function() {
    if (TS.model.archive_view_is_showing) {
      return $("#archive_msgs_scroller_div ts-message");
    } else {
      return $("#msgs_scroller_div ts-message");
    }
  };
  var _retrieveAllHighlightMsgs = function() {
    var $msgs;
    if (TS.model.archive_view_is_showing) {
      $msgs = $("#archive_msgs_scroller_div ts-message.is_recap");
    } else {
      $msgs = $("#msgs_scroller_div ts-message.is_recap");
    }
    if (_highlights_mode === _HIGHLIGHTS_MODE_AUTO) {
      $msgs = $msgs.filter(function(index) {
        return _tsIsUnread($(this).data("ts"));
      });
    }
    return $msgs;
  };
  var _getMsgObjFromModelOb = function(model_ob, ts) {
    var msg;
    if (TS.model.archive_view_is_showing) {
      msg = TS.utility.msgs.getMsgByProp("ts", ts, model_ob._archive_msgs);
    } else {
      msg = TS.utility.msgs.getMsgByProp("ts", ts, model_ob.msgs);
    }
    return msg;
  };
  var _getMarkerByTs = function(ts) {
    return $('.recap_highlight_marker[data-ts="' + ts + '"]').get(0);
  };
  var _getMsgByTs = function(ts) {
    if (TS.model.archive_view_is_showing) {
      return $('#archive_msgs_scroller_div #archives_msgs_div ts-message.is_recap[data-ts="' + ts + '"]').get(0);
    } else {
      return $('#msgs_scroller_div #msgs_div ts-message.is_recap[data-ts="' + ts + '"]').get(0);
    }
  };
  var _getPreviousMarker = function(marker) {
    var prev_marker = $(marker).prev().get(0);
    return _isMarker(prev_marker) ? prev_marker : null;
  };
  var _getNextMarker = function(marker) {
    var next_marker = $(marker).next().get(0);
    return _isMarker(next_marker) ? next_marker : null;
  };
  var _getMsgFromMarker = function(marker) {
    if (!$(marker).hasClass("recap_highlight_marker")) return null;
    return _getMsgByTs($(marker).data("ts"));
  };
  var _getMarkerFromMsg = function(msg) {
    if (!$(msg).hasClass("is_recap")) return null;
    return _getMarkerByTs($(msg).data("ts"));
  };
  var _isMarker = function(el) {
    if (!el) return false;
    return $(el).hasClass("recap_highlight_marker");
  };
  var _getMilliTime = function() {
    var d = new Date;
    return d.getTime();
  };
  var _pxToRem = function(px) {
    return px / 16;
  };
  var _tsIsUnread = function(ts) {
    return parseFloat(ts) > parseFloat(_channel_unread_data.last_read_ts);
  };
  var _scrollMessageToCenter = function(ts) {
    if (!TS.recaps_signal.canHaveHighlightsUI()) return;
    var $div = TS.model.archive_view_is_showing ? TS.client.msg_pane.getDivForArchiveMsg(ts) : TS.client.msg_pane.getCanonicalDivForMsg(ts);
    if (!$div.length) return;
    var $scroller = TS.model.archive_view_is_showing ? TS.client.archives.$scroller : TS.client.ui.$msgs_scroller_div;
    if (!$scroller.length) return;
    var d_rect = $div[0].getBoundingClientRect();
    var s_rect = $scroller[0].getBoundingClientRect();
    var offset = Math.max((s_rect.height - d_rect.height) / 2, 0);
    var scrolltop = Math.max($scroller.scrollTop() + (d_rect.top - s_rect.top) - offset, 1);
    TS.client.ui.slowScrollMsgsToPosition(scrolltop, false, function() {
      $div.addClass("show_recap_flash").one("webkitAnimationEnd oanimationend animationend", function() {
        $(this).removeClass("show_recap_flash");
      });
    });
  };
  var _retrieveHighlights = function(model_ob) {
    var msgs = model_ob.msgs;
    var msg_length = msgs.length;
    var msgs_to_fetch = [];
    var msgs_to_fetch_args = [];
    for (var i = 0; i < msg_length; i++) {
      if (msgs[i].recap) continue;
      var is_unread = _tsIsUnread(msgs[i].ts);
      if (is_unread || _highlights_mode === _HIGHLIGHTS_MODE_MANUAL) {
        msgs_to_fetch_args.push({
          ts: msgs[i].ts,
          is_unread: is_unread
        });
        msgs_to_fetch.push(msgs[i]);
      }
    }
    if (msgs_to_fetch.length) {
      var promise = _callHighlightsList(model_ob.id, msgs_to_fetch_args);
      var promises = [];
      msgs_to_fetch.forEach(function(msg) {
        promises.push(_addMsgRecap(model_ob, msg, promise));
      });
      Promise.all(promises).then(function(msgs) {
        _highlightChannelMsgs(msgs);
        var recap_debug_group = TS.experiment.getGroup("sli_recaps_debug");
        if (recap_debug_group === "sli_debug_info") {
          TS.client.msg_pane.rebuildMsgs();
        } else {
          TS.recaps_signal.handleUpdateScrollbar();
        }
      }).catch(function(e) {});
    } else {
      TS.recaps_signal.handleUpdateScrollbar();
    }
  };
})();
