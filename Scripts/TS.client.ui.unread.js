(function() {
  "use strict";
  TS.registerModule("client.ui.unread", {
    $channel_pane_item: $("#channels_scroller .all_unreads"),
    $scroller: $("#unread_msgs_scroller_div"),
    $unread_msgs_div: null,
    $container: null,
    unread_groups: [],
    showUnreadView: function() {
      TS.channels.renamed_sig.add(_onRename);
      TS.groups.renamed_sig.add(_onRename);
      TS.inline_file_previews.collapse_sig.add(_updateUnreadGroupPositions);
      TS.inline_file_previews.expand_sig.add(_updateUnreadGroupPositions);
      TS.inline_others.collapse_sig.add(_updateUnreadGroupPositions);
      TS.inline_others.expand_sig.add(_updateUnreadGroupPositions);
      TS.inline_audios.collapse_sig.add(_updateUnreadGroupPositions);
      TS.inline_audios.expand_sig.add(_updateUnreadGroupPositions);
      TS.inline_videos.collapse_sig.add(_updateUnreadGroupPositions);
      TS.inline_videos.expand_sig.add(_updateUnreadGroupPositions);
      TS.inline_room_previews.toggle_sig.add(_updateUnreadGroupPositions);
      TS.inline_imgs.expand_sig.add(_updateUnreadGroupPositions);
      TS.inline_imgs.collapse_sig.add(_updateUnreadGroupPositions);
      TS.inline_attachments.expand_sig.add(_updateUnreadGroupPositions);
      TS.inline_attachments.collapse_sig.add(_updateUnreadGroupPositions);
      TS.prefs.a11y_font_size_changed_sig.add(_updateStickyHeader);
      TS.prefs.a11y_font_size_changed_sig.add(_updateUnreadGroupPositions);
      _initialized_time = Date.now();
      $("#client-ui").addClass("unread_view_is_showing");
      $("#msgs_scroller_div").addClass("hidden");
      $("#archives_return").addClass("hidden");
      if (TS.model.ui_state.flex_name === "details") TS.client.ui.flex.hideFlex(true);
      var skip_mark_msgs_read_immediate_check = true;
      TS.client.msg_pane.hideNewMsgsBar(skip_mark_msgs_read_immediate_check);
      TS.client.ui.unread.$scroller.html(TS.templates.unread_main());
      TS.client.ui.unread.$unread_msgs_div = $("#unread_msgs_div");
      if (TS.environment.supports_custom_scrollbar) {
        TS.client.ui.unread.$container = $("#unread_msgs_scroller_div");
      } else {
        TS.client.ui.unread.$scroller.monkeyScroll();
        TS.client.ui.unread.$container = $("#monkey_scroll_wrapper_for_unread_msgs_scroller_div");
      }
      $("#footer").addClass("invisible");
      _onResize();
      TS.view.resize_sig.add(_onResize);
      TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".bottom_mark_all_read_btn", function() {
        TS.client.unread.markAllAsRead();
      });
      TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".unread_group_mark", function(e) {
        var model_ob_id = $(e.target).closest(".unread_group").data("model-id");
        var group = TS.client.unread.getGroup(model_ob_id);
        if (!group || group.marked_as_read) return;
        TS.client.ui.unread.markGroupAsRead(model_ob_id);
      });
      TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".unread_group_undo > a", function(e) {
        TS.client.ui.unread.markGroupAsUnread($(e.target).closest(".unread_group").data("model-id"));
      });
      TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".unread_group_header_name .channel_link, .unread_group_header_name .mpim_link, .unread_group_header_name .internal_im_link", function(e) {
        if (TS.client.unread.shouldRecordMetrics()) TS.metrics.count("unread_view_channel_navigation");
      });
      TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".unread_group_new", function(e) {
        var group = TS.client.unread.getGroup($(e.target).closest(".unread_group").data("model-id"));
        if (group.collapsed) {
          if (group.marked_as_read) {
            TS.client.unread.moveNewUnreadsOntoHiddenMsgs(group);
          }
          TS.client.ui.unread.expandGroup(group);
        } else {
          TS.client.ui.unread.updateGroupWithNewMessages(group);
        }
      });
      TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".unread_group_collapse_toggle", function(e) {
        var group = TS.client.unread.getGroup($(e.target).closest(".unread_group").data("model-id"));
        if (group) {
          if (group.collapsed) {
            TS.client.ui.unread.expandGroup(group, {
              persist_state: true
            });
          } else {
            var $group = _getGroupElement(group);
            var $msgs_holder = $group.find(".unread_group_msgs");
            TS.client.ui.unread.collapseGroup(group, $msgs_holder, {
              persist_state: true
            });
          }
        }
      });
      if (TS.boot_data.feature_unread_view_keyboard_commands) {
        _currently_changing_active_group = false;
        $(window).on("keydown.unread", function(e) {
          _onKeyDown(e);
        });
      }
      if (!TS.model.supports_sticky_position) {
        if ($("body").hasClass("banner_showing")) {
          _updateBannerHeight();
        }
        TS.ui.banner.show_hide_sig.add(_updateBannerHeight);
        var updated_sig = new signals.Signal;
        _throttled_update_sticky_header = _.throttle(_updateStickyHeader, 16, {
          leading: true,
          trailing: false
        });
        TS.client.ui.unread.$scroller.on("scroll", _throttled_update_sticky_header);
        updated_sig.add(_updateUnreadGroupPositions);
      }
      _msgs_config = {
        name: "unread",
        container: $("#unread_msgs_div"),
        scroller: $("#unread_msgs_scroller_div"),
        page_size: 25,
        sections: [],
        has_more_beginning: false,
        has_more_end: false,
        updated_sig: updated_sig,
        promiseToLoadMoreAtEnd: function() {
          return TS.client.ui.unread.promiseToShowNextPage();
        },
        buildMsgHTML: function(msg, prev_msg, section) {
          var $msg = $(TS.templates.builders.buildMsgHTML({
            msg_dom_id: TS.templates.makeMsgDomIdInUnreadView(msg.ts),
            msg: msg,
            model_ob: section.model_ob,
            prev_msg: prev_msg,
            container_id: "unread_msgs_div",
            enable_slack_action_links: true,
            hide_actions: false
          }));
          if (_fade_in_messages) $msg.css("opacity", 0);
          return $msg;
        },
        buildSection: function(section) {
          return TS.templates.unread_group(_buildTemplateArgs(section));
        },
        buildDayDivider: function(section, msg) {
          var ts = msg.ts;
          var date = TS.utility.date.toDateObject(ts);
          var is_today = TS.utility.date.isToday(date);
          var $divider = $(TS.templates.unread_day_divider({
            ts: ts,
            is_today: is_today
          }));
          if (_fade_in_messages) $divider.css("opacity", 0);
          return $divider;
        },
        updateCallback: function(changes) {
          var manually_marked_unread_msgs = TS.client.unread.getAllGroups().map(function(group) {
            return group.manually_marked_unread_msg;
          });
          changes.added.forEach(function($added_msg) {
            if (!$added_msg.data("ts")) return;
            var msg_id = $added_msg.data("ts");
            if (manually_marked_unread_msgs.indexOf(msg_id) >= 0) {
              var model_ob_id = $added_msg.data("modelObId");
              _setUnreadPoint(msg_id, model_ob_id, $added_msg);
            }
          });
        }
      };
      TS.ui.message_container.register(_msgs_config);
      _preloadEmptyState();
      TS.client.ui.unread.$scroller.attr("tabindex", "-1");
      TS.client.ui.unread.$scroller.get(0).focus();
      TS.client.ui.rebuildAllButMsgs();
      TS.client.ui.unread.promiseToShowNextPage().then(function() {
        if (TS.client.unread.shouldRecordMetrics()) TS.metrics.measureAndClear("unread_view_time_to_display", "unread_view_time_to_display");
        if (!TS.model.unread_view_is_showing) return;
        if (TS.client.unread.getAllGroups().length) {
          _transitionToMessages();
        } else {
          var marked_as_read_cnt;
          var skip_delay = true;
          TS.client.ui.unread.displayEmptyState(marked_as_read_cnt, skip_delay);
        }
      });
      if (TS.boot_data.feature_opt_click_all_unreads) {
        TS.client.ui.unread.$unread_msgs_div.on("click.unread", ".message[data-ts]", function(e) {
          if (e.altKey) {
            var $msg = $(e.target).closest(".message");
            var msg_id = $msg.data("ts");
            var model_ob_id = $(e.target).closest(".message").data("modelObId");
            _setUnreadPoint(msg_id, model_ob_id, $msg);
          }
        });
      }
      TS.utility.queueRAF(function() {
        $(".channels_nav_unread").scrollintoview({
          offset: "top",
          px_offset: 50,
          scroller: TS.client.channel_pane.$scroller
        });
      });
      TS.clog.track("UNREADS_OPEN", {});
    },
    promiseToShowNextPage: function() {
      if (_currently_loading_more_promise && _currently_loading_more_promise.isPending()) return _currently_loading_more_promise;
      _currently_loading_more_promise = TS.client.unread.promiseToGetMoreMessages().then(function(msgs_data) {
        if (!TS.model.unread_view_is_showing) return;
        _tracking_data.unreads_page++;
        TS.client.ui.unread.addMessageContainerGroups(msgs_data.groups);
        TS.client.ui.unread.setMessageContainerHasMoreEnd(!!msgs_data.has_more);
        _onResize();
        _checkToShowEmptyState();
        if (_move_active_marker_after_next_page) {
          var backwards = false;
          var current_group = TS.client.unread.getActiveGroup();
          var target_group = TS.client.unread.moveActiveMarker(backwards);
          _changeActiveElement(target_group, current_group, {
            collapse_current_group: false
          });
          _move_active_marker_after_next_page = false;
        }
        _currently_loading_more_promise = null;
        return null;
      }).catch(function(err) {
        TS.error(err);
      });
      return _currently_loading_more_promise;
    },
    removeMessageContainerGroup: function(model_ob_ids) {
      _msgs_config.sections = _msgs_config.sections.filter(function(section) {
        return model_ob_ids.indexOf(section.id) === -1;
      });
      _msgs_config.has_more_end = true;
      return _msgs_config;
    },
    addMessageContainerGroups: function(groups) {
      _.forEach(groups, function(data_ob) {
        var group = TS.client.unread.getGroup(data_ob.id);
        var inx = _.findIndex(_msgs_config.sections, {
          id: group.id
        });
        if (-1 === inx) {
          _msgs_config.sections.push(group);
        }
      });
    },
    setMessageContainerHasMoreEnd: function(has_more_end) {
      _msgs_config.has_more_end = has_more_end;
    },
    restart: function() {
      TS.client.ui.unread.showOrHideRefreshButton();
      TS.ui.message_container.cleanup(_msgs_config);
      TS.client.ui.unread.$unread_msgs_div.empty();
      _msgs_config.sections = [];
      _msgs_config.has_more_end = false;
      TS.ui.message_container.register(_msgs_config);
      TS.client.ui.unread.$scroller.addClass("loading");
      _preloadEmptyState();
      TS.client.ui.unread.promiseToShowNextPage().then(function() {
        if (!TS.model.unread_view_is_showing) return;
        if (TS.client.unread.getAllGroups().length) {
          _transitionToMessages();
        } else {
          var marked_as_read_cnt;
          var skip_delay = true;
          TS.client.ui.unread.displayEmptyState(marked_as_read_cnt, skip_delay);
        }
      });
    },
    displaySlowLoadingMessage: function() {
      if (TS.client.ui.unread.$scroller.hasClass("loading")) TS.client.ui.unread.$scroller.addClass("loading-slow");
    },
    isFatalErrorDisplaying: function() {
      return $("#messages_container .unread_error_state").length;
    },
    displayFatalError: function() {
      TS.client.ui.unread.$scroller.addClass("invisible");
      $("#messages_container .unread_empty_state_wrapper").remove();
      $("#messages_container").prepend(TS.templates.unread_error({
        emoji: new Handlebars.SafeString(TS.emoji.graphicReplace(":tropical_fish:", {
          jumbomoji: true
        }))
      }));
      $(".unread_error_state_refresh_button").on("click", function() {
        TS.client.unread.reload();
      });
      _.defer(function() {
        $("#messages_container .unread_empty_state").addClass("transitioning");
      });
    },
    displayEmptyState: function(marked_as_read_cnt, skip_delay) {
      TS.client.ui.unread.$scroller.addClass("invisible");
      $("#messages_container .unread_empty_state_wrapper").remove();
      $("#messages_container").prepend(TS.templates.unread_empty_state({
        line_one: _preloaded_empty_state.line_one,
        line_two: _preloaded_empty_state.line_two,
        emoji: _preloaded_empty_state.emoji_url,
        marked_as_read_cnt: marked_as_read_cnt
      }));
      _.defer(function() {
        $("#messages_container .unread_empty_state").addClass("transitioning");
        var $undo = $("#messages_container .unread_empty_state_undo");
        if ($undo.length) {
          $undo.addClass("unread_empty_state_undo_visible");
          _.delay(function() {
            $undo.removeClass("unread_empty_state_undo_visible");
          }, 10300);
          $(".unread_empty_state_undo_action").one("click", function() {
            TS.client.unread.markAllAsUnread();
            TS.client.ui.unread.updateChannelHeader();
          });
        }
      });
      if (TS.boot_data.feature_unread_view_new_empty_state && !skip_delay) {
        _delay_refresh_button = true;
        _.delay(function() {
          _delay_refresh_button = false;
          TS.client.ui.unread.showOrHideRefreshButton();
        }, 5e3);
      } else {
        _delay_refresh_button = false;
      }
      TS.client.ui.unread.updateChannelHeader();
      TS.client.ui.unread.showOrHideRefreshButton();
    },
    removeEmptyState: function() {
      $(window).off("keydown.unread_empty_state");
      $("#messages_container .unread_empty_state_wrapper").remove();
      $("#messages_container .unread_empty_state_undo").remove();
      TS.client.ui.unread.$scroller.removeClass("invisible");
      _delay_refresh_button = false;
    },
    showOrHideRefreshButton: function() {
      var unreads_count = TS.client.unread.getTotalNewUnreadCount();
      var $empty = $("#messages_container .unread_empty_state");
      var $refresh = TS.boot_data.feature_unread_view_new_empty_state ? $(".unread_empty_state_refresh") : $(".unread_empty_state_refresh_old");
      if (unreads_count > 0 && TS.client.unread.new_messages_in_channels.length) {
        $("#channel_header_unread_refresh").removeClass("hidden");
      } else {
        $("#channel_header_unread_refresh").addClass("hidden");
        if ($refresh) $refresh.remove();
      }
      if (unreads_count > 0 && $empty.length && TS.client.unread.new_messages_in_channels.length && !$empty.hasClass("unread_error_state")) {
        if ($refresh.length > 0) {
          if (TS.boot_data.feature_unread_view_new_empty_state) {
            $refresh.html($(TS.templates.unread_empty_state_refresh({
              unreads_count: unreads_count
            })).html());
          } else {
            $refresh.replaceWith(TS.templates.unread_empty_state_refresh_old({
              unreads_count: unreads_count
            }));
          }
        } else {
          if (TS.boot_data.feature_unread_view_new_empty_state) {
            if (_delay_refresh_button) return;
            $empty.append(TS.templates.unread_empty_state_refresh({
              unreads_count: unreads_count
            }));
            $empty.addClass("faded");
            $empty.addClass("with_refresh");
            $(window).on("keydown.unread_empty_state", function(e) {
              if (TS.model.unread_view_is_showing && e.which == TS.utility.keymap.enter && TS.client.ui.isUserAttentionOnChat() && !TS.utility.isFocusOnInput()) {
                TS.client.unread.reload();
              }
            });
          } else {
            $empty.append(TS.templates.unread_empty_state_refresh_old({
              unreads_count: unreads_count
            }));
            $(window).on("keydown.unread_empty_state", function(e) {
              if (TS.model.unread_view_is_showing && e.which == TS.utility.keymap.enter && TS.client.ui.isUserAttentionOnChat() && !TS.utility.isFocusOnInput()) {
                TS.client.unread.reload();
              }
            });
          }
        }
        $(".unread_empty_state_refresh_button").on("click", function() {
          TS.client.unread.reload();
        });
      }
    },
    destroyUnreadView: function() {
      if (!TS.client.ui.unread.isUnreadViewDOMShowing()) return;
      if (TS.boot_data.feature_unread_view_keyboard_commands) {
        $(window).off("keydown.unread");
      }
      if (_currently_loading_more_promise && _currently_loading_more_promise.isPending()) _currently_loading_more_promise.cancel();
      TS.client.ui.unread.$scroller.removeAttr("tabindex");
      var $client_ui = $("#client-ui");
      $client_ui.removeClass("unread_view_is_showing");
      $("#msgs_scroller_div").removeClass("hidden");
      TS.ui.message_container.cleanup(_msgs_config);
      _msgs_config = null;
      TS.client.ui.unread.removeEmptyState();
      TS.client.ui.unread.$unread_msgs_div.off("click.unread", ".unread_group_mark");
      TS.client.ui.unread.$unread_msgs_div.off("click.unread", ".unread_group_undo > a");
      if (!TS.model.supports_sticky_position) {
        TS.client.ui.unread.$scroller.off("scroll", _throttled_update_sticky_header);
        TS.ui.banner.show_hide_sig.remove(_updateBannerHeight);
      }
      TS.client.ui.unread.$unread_msgs_div.empty();
      TS.client.ui.unread.$scroller.addClass("loading");
      $("#footer").removeClass("invisible");
      TS.view.resize_sig.remove(_onResize);
      TS.channels.renamed_sig.remove(_onRename);
      TS.groups.renamed_sig.remove(_onRename);
      if (!TS.model.ui_state.flex_name && TS.model.ui_state.details_tab_active) {
        TS.client.ui.flex.openFlexTab("details", true);
      }
      var payload = TS.client.ui.unread.getTrackingData();
      TS.clog.track("UNREADS_CLOSE", payload);
      _initialized_time = 0;
      _tracking_data = {
        unreads_event_seq_id: 0,
        unreads_elasped_time: 0,
        unreads_page: 0,
        unreads_page_message_index: 0
      };
    },
    isUnreadViewDOMShowing: function() {
      return $("#client-ui").hasClass("unread_view_is_showing");
    },
    collapseGroup: function(group, $msgs_holder, opts) {
      opts = _.extend({
        persist_state: false,
        add_classname: true,
        scroll_group: true
      }, opts || {});
      if (group.collapsed) return Promise.resolve(group);
      TS.client.unread.collapseGroup(group, opts.persist_state);
      return new Promise(function(resolve, reject) {
        var $group = _getGroupElement(group);
        var collapsed_group_offset = $group.offset().top;
        $group.addClass("collapsing");
        TS.client.ui.unread.updateHeader(group);
        $msgs_holder.animate({
          opacity: 0
        }, 300, function() {
          $group.removeClass("collapsing");
          if (opts.add_classname) $group.addClass("collapsed");
          TS.client.ui.unread.updateMsgs();
          if (opts.scroll_group && collapsed_group_offset < 0) {
            _scrollGroupElementToTop($group);
          }
          _updateUnreadGroupPositions();
          if (!TS.model.supports_sticky_position) _updateStickyHeader();
          $msgs_holder.css("opacity", 1);
          resolve(group);
        });
      });
    },
    expandGroup: function(group, opts) {
      opts = _.extend({
        persist_state: false
      }, opts || {});
      var $group = _getGroupElement(group);
      if (!group.collapsed || $group.hasClass("collapsing") || !$group.hasClass("collapsed")) return Promise.resolve(group);
      return new Promise(function(resolve, reject) {
        TS.client.unread.expandGroup(group, opts.persist_state);
        TS.client.ui.unread.updateHeader(group);
        $group.removeClass("collapsed");
        $group.removeClass("marked_as_read");
        $group.removeClass("with_footer");
        _fade_in_messages = true;
        TS.client.ui.unread.$unread_msgs_div.css("height", TS.client.ui.unread.$unread_msgs_div.height());
        var changes = TS.client.ui.unread.updateMsgsWithFocus($group);
        _fade_in_messages = false;
        if (_currently_loading_more_promise) {
          _currently_loading_more_promise.then(function() {
            TS.client.ui.unread.$unread_msgs_div.css("height", "auto");
          });
        } else {
          TS.client.ui.unread.$unread_msgs_div.css("height", "auto");
        }
        TS.client.ui.unread.updateNewMessagesMessage(group);
        changes.added.forEach(function($msg) {
          $msg.animate({
            opacity: 1
          }, 300);
        });
        _updateUnreadGroupPositions();
        if (!TS.model.supports_sticky_position) _updateStickyHeader();
        resolve(group);
      });
    },
    markGroupAsRead: function(model_ob_id) {
      var group = TS.client.unread.getGroup(model_ob_id);
      if (!group) return;
      TS.client.unread.markGroupAsRead(group);
      TS.client.ui.unread.updateChannelHeader();
      var $group = _getGroupElement(group);
      var $msgs_holder = $group.find(".unread_group_msgs");
      if (group.new_unread_cnt < 1) {
        $group.addClass("marked_as_read");
      }
      if ($msgs_holder.length) {
        if (!group.new_unread_cnt) {
          _checkToShowEmptyState();
        }
        if (group.collapsed) {
          TS.client.ui.unread.updateHeader(group);
        } else {
          var opts = {
            add_classname: group.new_unread_cnt < 1
          };
          return TS.client.ui.unread.collapseGroup(group, $msgs_holder, opts).then(function(group) {
            if (group.new_unread_cnt > 0) {
              TS.client.ui.unread.updateGroupWithNewMessages(group);
            } else {
              TS.client.ui.unread.updateHeader(group);
            }
          });
        }
      } else {
        TS.client.ui.unread.updateMsgs();
      }
      return Promise.resolve();
    },
    markGroupAsUnread: function(model_ob_id) {
      var group = TS.client.unread.getGroup(model_ob_id);
      if (!group) return;
      TS.client.unread.markGroupAsUnread(group);
      TS.client.ui.unread.expandGroup(group);
      TS.client.ui.unread.updateChannelHeader();
    },
    updateNewMessagesMessage: function(group) {
      if (group.has_more) return;
      var $group = _getGroupElement(group);
      var $group_footer = $group.find(".unread_group_footer");
      if (group.collapsed) {
        TS.client.ui.unread.updateHeader(group);
      } else {
        if (group.new_unread_cnt > 0 && group.new_unread_msgs) {
          $group_footer.find(".unread_group_new_text").text(group.new_unread_cnt + " " + TS.utility.pluralize(group.new_unread_cnt, "new message", "new messages"));
          $group.addClass("with_footer");
        } else if ($group_footer) {
          $group.removeClass("with_footer");
        }
      }
    },
    updateHeader: function(group) {
      var $group = _getGroupElement(group);
      $group.find(".unread_group_header").html(TS.templates.unread_group_header(_buildTemplateArgs(group)));
    },
    updateMsgs: function() {
      return TS.ui.message_container.update(_msgs_config);
    },
    updateMsgsWithFocus: function($section) {
      return TS.ui.message_container.updateWithFocus(_msgs_config, $section);
    },
    updateGroupWithNewMessages: function(group) {
      var $group = _getGroupElement(group);
      var original_height = $group.height();
      $group.height(original_height);
      TS.client.unread.updateGroupWithNewMessages(group);
      _fade_in_messages = true;
      var changes = TS.client.ui.unread.updateMsgsWithFocus($group);
      _fade_in_messages = false;
      $group.css("height", "auto");
      var new_height = $group.height();
      $group.removeClass("with_footer");
      $group.height(original_height).animate({
        height: new_height,
        margin: 0
      }, 300, function() {
        $group.css("height", "");
        $group.css("margin", "");
        changes.added.forEach(function($msg) {
          $msg.animate({
            opacity: 1
          }, 300);
        });
      });
      $group.removeClass("collapsed").removeClass("marked_as_read");
      TS.client.ui.unread.updateHeader(group);
      _updateUnreadGroupPositions();
    },
    updateSidebarLink: function() {
      if (TS.model.unread_view_is_showing) {
        $("#channels_scroller li.active").removeClass("active");
        $('li[data-action="show_unread_view"]').addClass("active");
      } else {
        $('li[data-action="show_unread_view"]').removeClass("active");
      }
    },
    toggleUnreadView: function() {
      if (TS.model.prefs.enable_unread_view) {
        $(".channels_nav_unread").removeClass("hidden");
        $("#channels_nav").addClass("unread_enabled");
      } else {
        $(".channels_nav_unread").addClass("hidden");
        $(".all_unreads").removeClass("active");
        $("#channels_nav").removeClass("unread_enabled");
      }
    },
    updateChannelPaneUnreadState: function(is_unread) {
      TS.client.ui.unread.$channel_pane_item.toggleClass("unread", is_unread);
    },
    rebuildMsgFile: function(msg, file) {
      var $msg = TS.client.ui.unread.$unread_msgs_div.find("#" + TS.templates.makeMsgDomIdInUnreadView(msg.ts));
      if (!$msg || !$msg.length) return;
      var $file_container = $msg.find(".file_container");
      if (!$file_container || !$file_container.length) return;
      var data = {
        file: file,
        is_message: true,
        msg_dom_id: $msg.attr("id")
      };
      if (file.mode === "post" || file.mode === "space") {
        $file_container.replaceWith(TS.templates.file_post(data));
      } else if (file.mode === "snippet") {
        $file_container.replaceWith(TS.templates.file_snippet(data));
      } else if (file.mode === "email") {
        $file_container.replaceWith(TS.templates.file_email(data));
      } else if (file.mode === "multnomah") {
        $file_container.replaceWith(TS.templates.file_multnomah(data));
      } else {
        return TS.warn("Trying to rebuild message file, but cannot rebuild " + file.mode);
      }
      TS.utility.makeSureAllLinksHaveTargets($msg);
      TS.ui.utility.updateClosestMonkeyScroller($msg);
    },
    updateChannelHeader: function() {
      var output = TS.templates.unread_header_info({
        is_showing: TS.model.unread_view_is_showing,
        has_new_messages: TS.model.unread_view_is_showing && TS.client.unread.new_messages_in_channels.length,
        messages_loaded: TS.client.unread.messages_loaded,
        total_unread_count: TS.client.unread.getTotalMessagesCount(),
        sort_order: TS.client.unread.getSortOrder()
      });
      TS.client.channel_header.updateChannelHeaderInfo(output);
    },
    setUnreadPoint: function(msg_ts) {
      var $msg = TS.client.ui.unread.$unread_msgs_div.find('ts-message[data-ts="' + msg_ts + '"]');
      var model_ob_id = $msg.data("modelObId");
      _setUnreadPoint(msg_ts, model_ob_id, $msg);
    },
    getTrackingData: function(msg_ts) {
      var payload = {
        is_unreads_view: true,
        unreads_event_seq_id: _tracking_data.unreads_event_seq_id,
        unreads_elasped_time: Date.now() - _initialized_time,
        unreads_page: _tracking_data.unreads_page
      };
      if (msg_ts) {
        payload.unreads_page_message_index = _.findIndex(_.flatten(TS.client.unread.getAllGroups().map(function(group) {
          return group.msgs;
        })), {
          ts: msg_ts
        });
      }
      return payload;
    },
    incrementTrackingSeqId: function() {
      _tracking_data.unreads_event_seq_id++;
    }
  });
  var _msgs_config;
  var _fade_in_messages = false;
  var $_currently_sticky = false;
  var _throttled_update_sticky_header;
  var _banner_height = 0;
  var _preloaded_empty_state;
  var _currently_loading_more_promise = null;
  var _currently_changing_active_group = false;
  var _move_active_marker_after_next_page = false;
  var _skip_next_sticky_header_active_update = false;
  var _initialized_time = 0;
  var _tracking_data = {
    unreads_event_seq_id: 0,
    unreads_elasped_time: 0,
    unreads_page: 0,
    unreads_page_message_index: 0
  };
  var _delay_refresh_button;
  var CLIENT_HEADER_OVERHANG = 8;
  var _preloadEmptyState = function() {
    var done_message_combo_options = [{
      emoji: "tada",
      skintone: false,
      line_one: "Ta-da!",
      line_two: "You’ve read everything there is to read."
    }, {
      emoji: "victory",
      skintone: true,
      line_one: "All caught up.",
      line_two: "What’s next?"
    }, {
      emoji: "ok",
      skintone: true,
      line_one: "There.",
      line_two: "All caught up."
    }, {
      emoji: "rocket",
      skintone: false,
      line_one: "All done.",
      line_two: "The future is yours."
    }, {
      emoji: "octopus",
      skintone: false,
      line_one: "All done.",
      line_two: "The world is your oyster."
    }, {
      emoji: "high5",
      skintone: true,
      line_one: "That’s everything!",
      line_two: ""
    }, {
      emoji: "apple",
      skintone: false,
      line_one: "You’ve read all you needed.",
      line_two: "Take a moment."
    }, {
      emoji: "sunglasses",
      skintone: false,
      line_one: "All clear.",
      line_two: ""
    }, {
      emoji: "thumbup",
      skintone: true,
      line_one: "That’s that.",
      line_two: "You’re good to go."
    }, {
      emoji: "boom",
      skintone: false,
      line_one: "Boom.",
      line_two: "You’re up to date."
    }, {
      emoji: "bee",
      skintone: false,
      line_one: "You’re up to date.",
      line_two: "Go forth and do great things."
    }, {
      emoji: "clap",
      skintone: true,
      line_one: "Everything unread is now read.",
      line_two: "You’ve done it."
    }, {
      emoji: "crystalball",
      skintone: false,
      line_one: "All that was unread is now read.",
      line_two: "What’s next?"
    }, {
      emoji: "tada",
      skintone: false,
      line_one: "Ta-da!",
      line_two: "You’re up to date."
    }, {
      emoji: "tractor",
      skintone: false,
      line_one: "You’re all read.",
      line_two: "Here’s a tractor."
    }, {
      emoji: "pony",
      skintone: false,
      line_one: "You’re all read.",
      line_two: "Here’s a pony."
    }, {
      emoji: "chick",
      skintone: false,
      line_one: "Everything’s sorted!",
      line_two: "Let’s start something new."
    }, {
      emoji: "sun",
      skintone: false,
      line_one: "You’re all caught up!",
      line_two: "Clear screens ahead."
    }, {
      emoji: "balloon",
      skintone: false,
      line_one: "There! Caught up.",
      line_two: "Set your mind to something new."
    }, {
      emoji: "sweetpotato",
      skintone: false,
      line_one: "Sweet potato!",
      line_two: "You’re all done."
    }, {
      emoji: "leafs",
      skintone: false,
      line_one: "Done and done.",
      line_two: ""
    }];
    var emoji_paths = {
      "default": {
        tada: cdn_url + "/3976a/img/unread/empty/default/tada.png",
        victory: {
          1: cdn_url + "/3976a/img/unread/empty/default/victory_1.png",
          2: cdn_url + "/3976a/img/unread/empty/default/victory_2.png",
          3: cdn_url + "/3976a/img/unread/empty/default/victory_3.png",
          4: cdn_url + "/3976a/img/unread/empty/default/victory_4.png",
          5: cdn_url + "/3976a/img/unread/empty/default/victory_5.png",
          6: cdn_url + "/3976a/img/unread/empty/default/victory_6.png"
        },
        ok: {
          1: cdn_url + "/3976a/img/unread/empty/default/ok_1.png",
          2: cdn_url + "/3976a/img/unread/empty/default/ok_2.png",
          3: cdn_url + "/3976a/img/unread/empty/default/ok_3.png",
          4: cdn_url + "/3976a/img/unread/empty/default/ok_4.png",
          5: cdn_url + "/3976a/img/unread/empty/default/ok_5.png",
          6: cdn_url + "/3976a/img/unread/empty/default/ok_6.png"
        },
        rocket: cdn_url + "/3976a/img/unread/empty/default/rocket.png",
        octopus: cdn_url + "/3976a/img/unread/empty/default/octopus.png",
        high5: {
          1: cdn_url + "/3976a/img/unread/empty/default/high5_1.png",
          2: cdn_url + "/3976a/img/unread/empty/default/high5_2.png",
          3: cdn_url + "/3976a/img/unread/empty/default/high5_3.png",
          4: cdn_url + "/3976a/img/unread/empty/default/high5_4.png",
          5: cdn_url + "/3976a/img/unread/empty/default/high5_5.png",
          6: cdn_url + "/3976a/img/unread/empty/default/high5_6.png"
        },
        apple: cdn_url + "/3976a/img/unread/empty/default/apple.png",
        sunglasses: cdn_url + "/3976a/img/unread/empty/default/sunglasses.png",
        thumbup: {
          1: cdn_url + "/3976a/img/unread/empty/default/thumbup_1.png",
          2: cdn_url + "/3976a/img/unread/empty/default/thumbup_2.png",
          3: cdn_url + "/3976a/img/unread/empty/default/thumbup_3.png",
          4: cdn_url + "/3976a/img/unread/empty/default/thumbup_4.png",
          5: cdn_url + "/3976a/img/unread/empty/default/thumbup_5.png",
          6: cdn_url + "/3976a/img/unread/empty/default/thumbup_6.png"
        },
        boom: cdn_url + "/3976a/img/unread/empty/default/boom.png",
        bee: cdn_url + "/3976a/img/unread/empty/default/bee.png",
        clap: {
          1: cdn_url + "/3976a/img/unread/empty/default/clap_1.png",
          2: cdn_url + "/3976a/img/unread/empty/default/clap_2.png",
          3: cdn_url + "/3976a/img/unread/empty/default/clap_3.png",
          4: cdn_url + "/3976a/img/unread/empty/default/clap_4.png",
          5: cdn_url + "/3976a/img/unread/empty/default/clap_5.png",
          6: cdn_url + "/3976a/img/unread/empty/default/clap_6.png"
        },
        crystalball: cdn_url + "/3976a/img/unread/empty/default/crystalball.png",
        tractor: cdn_url + "/3976a/img/unread/empty/default/tractor.png",
        pony: cdn_url + "/3976a/img/unread/empty/default/pony.png",
        chick: cdn_url + "/3976a/img/unread/empty/default/chick.png",
        sun: cdn_url + "/3976a/img/unread/empty/default/sun.png",
        balloon: cdn_url + "/3976a/img/unread/empty/default/balloon.png",
        sweetpotato: cdn_url + "/3976a/img/unread/empty/default/sweetpotato.png",
        leafs: cdn_url + "/3976a/img/unread/empty/default/leafs.png"
      },
      google: {
        tada: cdn_url + "/42c04/img/unread/empty/google/tada.png",
        victory: {
          1: cdn_url + "/42c04/img/unread/empty/google/victory_1.png",
          2: cdn_url + "/42c04/img/unread/empty/google/victory_2.png",
          3: cdn_url + "/42c04/img/unread/empty/google/victory_3.png",
          4: cdn_url + "/42c04/img/unread/empty/google/victory_4.png",
          5: cdn_url + "/42c04/img/unread/empty/google/victory_5.png",
          6: cdn_url + "/42c04/img/unread/empty/google/victory_6.png"
        },
        ok: {
          1: cdn_url + "/42c04/img/unread/empty/google/ok_1.png",
          2: cdn_url + "/42c04/img/unread/empty/google/ok_2.png",
          3: cdn_url + "/42c04/img/unread/empty/google/ok_3.png",
          4: cdn_url + "/42c04/img/unread/empty/google/ok_4.png",
          5: cdn_url + "/42c04/img/unread/empty/google/ok_5.png",
          6: cdn_url + "/42c04/img/unread/empty/google/ok_6.png"
        },
        rocket: cdn_url + "/42c04/img/unread/empty/google/rocket.png",
        octopus: cdn_url + "/42c04/img/unread/empty/google/octopus.png",
        high5: {
          1: cdn_url + "/42c04/img/unread/empty/google/high5_1.png",
          2: cdn_url + "/42c04/img/unread/empty/google/high5_2.png",
          3: cdn_url + "/42c04/img/unread/empty/google/high5_3.png",
          4: cdn_url + "/42c04/img/unread/empty/google/high5_4.png",
          5: cdn_url + "/42c04/img/unread/empty/google/high5_5.png",
          6: cdn_url + "/42c04/img/unread/empty/google/high5_6.png"
        },
        apple: cdn_url + "/42c04/img/unread/empty/google/apple.png",
        sunglasses: cdn_url + "/42c04/img/unread/empty/google/sunglasses.png",
        thumbup: {
          1: cdn_url + "/42c04/img/unread/empty/google/thumbup_1.png",
          2: cdn_url + "/42c04/img/unread/empty/google/thumbup_2.png",
          3: cdn_url + "/42c04/img/unread/empty/google/thumbup_3.png",
          4: cdn_url + "/42c04/img/unread/empty/google/thumbup_4.png",
          5: cdn_url + "/42c04/img/unread/empty/google/thumbup_5.png",
          6: cdn_url + "/42c04/img/unread/empty/google/thumbup_6.png"
        },
        boom: cdn_url + "/42c04/img/unread/empty/google/boom.png",
        bee: cdn_url + "/42c04/img/unread/empty/google/bee.png",
        clap: {
          1: cdn_url + "/42c04/img/unread/empty/google/clap_1.png",
          2: cdn_url + "/d90ef/img/unread/empty/google/clap_2.png",
          3: cdn_url + "/42c04/img/unread/empty/google/clap_3.png",
          4: cdn_url + "/42c04/img/unread/empty/google/clap_4.png",
          5: cdn_url + "/42c04/img/unread/empty/google/clap_5.png",
          6: cdn_url + "/42c04/img/unread/empty/google/clap_6.png"
        },
        crystalball: cdn_url + "/42c04/img/unread/empty/google/crystalball.png",
        tractor: cdn_url + "/42c04/img/unread/empty/google/tractor.png",
        pony: cdn_url + "/42c04/img/unread/empty/google/pony.png",
        chick: cdn_url + "/42c04/img/unread/empty/google/chick.png",
        sun: cdn_url + "/42c04/img/unread/empty/google/sun.png",
        balloon: cdn_url + "/42c04/img/unread/empty/google/balloon.png",
        sweetpotato: cdn_url + "/42c04/img/unread/empty/google/sweetpotato.png",
        leafs: cdn_url + "/7fa97/img/unread/empty/google/leafs.png"
      },
      twitter: {
        tada: cdn_url + "/42c04/img/unread/empty/twitter/tada.png",
        victory: {
          1: cdn_url + "/42c04/img/unread/empty/twitter/victory_1.png",
          2: cdn_url + "/42c04/img/unread/empty/twitter/victory_2.png",
          3: cdn_url + "/42c04/img/unread/empty/twitter/victory_3.png",
          4: cdn_url + "/42c04/img/unread/empty/twitter/victory_4.png",
          5: cdn_url + "/42c04/img/unread/empty/twitter/victory_5.png",
          6: cdn_url + "/42c04/img/unread/empty/twitter/victory_6.png"
        },
        ok: {
          1: cdn_url + "/42c04/img/unread/empty/twitter/ok_1.png",
          2: cdn_url + "/42c04/img/unread/empty/twitter/ok_2.png",
          3: cdn_url + "/42c04/img/unread/empty/twitter/ok_3.png",
          4: cdn_url + "/42c04/img/unread/empty/twitter/ok_4.png",
          5: cdn_url + "/42c04/img/unread/empty/twitter/ok_5.png",
          6: cdn_url + "/42c04/img/unread/empty/twitter/ok_6.png"
        },
        rocket: cdn_url + "/42c04/img/unread/empty/twitter/rocket.png",
        octopus: cdn_url + "/42c04/img/unread/empty/twitter/octopus.png",
        high5: {
          1: cdn_url + "/42c04/img/unread/empty/twitter/high5_1.png",
          2: cdn_url + "/42c04/img/unread/empty/twitter/high5_2.png",
          3: cdn_url + "/42c04/img/unread/empty/twitter/high5_3.png",
          4: cdn_url + "/42c04/img/unread/empty/twitter/high5_4.png",
          5: cdn_url + "/42c04/img/unread/empty/twitter/high5_5.png",
          6: cdn_url + "/42c04/img/unread/empty/twitter/high5_6.png"
        },
        apple: cdn_url + "/42c04/img/unread/empty/twitter/apple.png",
        sunglasses: cdn_url + "/42c04/img/unread/empty/twitter/sunglasses.png",
        thumbup: {
          1: cdn_url + "/42c04/img/unread/empty/twitter/thumbup_1.png",
          2: cdn_url + "/42c04/img/unread/empty/twitter/thumbup_2.png",
          3: cdn_url + "/42c04/img/unread/empty/twitter/thumbup_3.png",
          4: cdn_url + "/42c04/img/unread/empty/twitter/thumbup_4.png",
          5: cdn_url + "/42c04/img/unread/empty/twitter/thumbup_5.png",
          6: cdn_url + "/42c04/img/unread/empty/twitter/thumbup_6.png"
        },
        boom: cdn_url + "/42c04/img/unread/empty/twitter/boom.png",
        bee: cdn_url + "/42c04/img/unread/empty/twitter/bee.png",
        clap: {
          1: cdn_url + "/42c04/img/unread/empty/twitter/clap_1.png",
          2: cdn_url + "/42c04/img/unread/empty/twitter/clap_2.png",
          3: cdn_url + "/42c04/img/unread/empty/twitter/clap_3.png",
          4: cdn_url + "/42c04/img/unread/empty/twitter/clap_4.png",
          5: cdn_url + "/42c04/img/unread/empty/twitter/clap_5.png",
          6: cdn_url + "/42c04/img/unread/empty/twitter/clap_6.png"
        },
        crystalball: cdn_url + "/42c04/img/unread/empty/twitter/crystalball.png",
        tractor: cdn_url + "/42c04/img/unread/empty/twitter/tractor.png",
        pony: cdn_url + "/42c04/img/unread/empty/twitter/pony.png",
        chick: cdn_url + "/42c04/img/unread/empty/twitter/chick.png",
        sun: cdn_url + "/42c04/img/unread/empty/twitter/sun.png",
        balloon: cdn_url + "/42c04/img/unread/empty/twitter/balloon.png",
        sweetpotato: cdn_url + "/42c04/img/unread/empty/twitter/sweetpotato.png",
        leafs: cdn_url + "/7fa97/img/unread/empty/twitter/leafs.png"
      },
      emojione: {
        tada: cdn_url + "/42c04/img/unread/empty/emojione/tada.png",
        victory: {
          1: cdn_url + "/42c04/img/unread/empty/emojione/victory_1.png",
          2: cdn_url + "/42c04/img/unread/empty/emojione/victory_2.png",
          3: cdn_url + "/42c04/img/unread/empty/emojione/victory_3.png",
          4: cdn_url + "/42c04/img/unread/empty/emojione/victory_4.png",
          5: cdn_url + "/42c04/img/unread/empty/emojione/victory_5.png",
          6: cdn_url + "/42c04/img/unread/empty/emojione/victory_6.png"
        },
        ok: {
          1: cdn_url + "/42c04/img/unread/empty/emojione/ok_1.png",
          2: cdn_url + "/42c04/img/unread/empty/emojione/ok_2.png",
          3: cdn_url + "/42c04/img/unread/empty/emojione/ok_3.png",
          4: cdn_url + "/42c04/img/unread/empty/emojione/ok_4.png",
          5: cdn_url + "/42c04/img/unread/empty/emojione/ok_5.png",
          6: cdn_url + "/42c04/img/unread/empty/emojione/ok_6.png"
        },
        rocket: cdn_url + "/42c04/img/unread/empty/emojione/rocket.png",
        octopus: cdn_url + "/42c04/img/unread/empty/emojione/octopus.png",
        high5: {
          1: cdn_url + "/42c04/img/unread/empty/emojione/high5_1.png",
          2: cdn_url + "/42c04/img/unread/empty/emojione/high5_2.png",
          3: cdn_url + "/42c04/img/unread/empty/emojione/high5_3.png",
          4: cdn_url + "/42c04/img/unread/empty/emojione/high5_4.png",
          5: cdn_url + "/42c04/img/unread/empty/emojione/high5_5.png",
          6: cdn_url + "/42c04/img/unread/empty/emojione/high5_6.png"
        },
        apple: cdn_url + "/42c04/img/unread/empty/emojione/apple.png",
        sunglasses: cdn_url + "/42c04/img/unread/empty/emojione/sunglasses.png",
        thumbup: {
          1: cdn_url + "/42c04/img/unread/empty/emojione/thumbup_1.png",
          2: cdn_url + "/42c04/img/unread/empty/emojione/thumbup_2.png",
          3: cdn_url + "/42c04/img/unread/empty/emojione/thumbup_3.png",
          4: cdn_url + "/42c04/img/unread/empty/emojione/thumbup_4.png",
          5: cdn_url + "/42c04/img/unread/empty/emojione/thumbup_5.png",
          6: cdn_url + "/42c04/img/unread/empty/emojione/thumbup_6.png"
        },
        boom: cdn_url + "/42c04/img/unread/empty/emojione/boom.png",
        bee: cdn_url + "/42c04/img/unread/empty/emojione/bee.png",
        clap: {
          1: cdn_url + "/42c04/img/unread/empty/emojione/clap_1.png",
          2: cdn_url + "/42c04/img/unread/empty/emojione/clap_2.png",
          3: cdn_url + "/42c04/img/unread/empty/emojione/clap_3.png",
          4: cdn_url + "/42c04/img/unread/empty/emojione/clap_4.png",
          5: cdn_url + "/42c04/img/unread/empty/emojione/clap_5.png",
          6: cdn_url + "/42c04/img/unread/empty/emojione/clap_6.png"
        },
        crystalball: cdn_url + "/42c04/img/unread/empty/emojione/crystalball.png",
        tractor: cdn_url + "/42c04/img/unread/empty/emojione/tractor.png",
        pony: cdn_url + "/42c04/img/unread/empty/emojione/pony.png",
        chick: cdn_url + "/42c04/img/unread/empty/emojione/chick.png",
        sun: cdn_url + "/42c04/img/unread/empty/emojione/sun.png",
        balloon: cdn_url + "/42c04/img/unread/empty/emojione/balloon.png",
        sweetpotato: cdn_url + "/42c04/img/unread/empty/emojione/sweetpotato.png",
        leafs: cdn_url + "/42c04/img/unread/empty/emojione/sweetpotato.png"
      }
    };
    var selected_combo = done_message_combo_options[Math.floor(Math.random() * done_message_combo_options.length)];
    var emoji_mode = TS.model.prefs.emoji_mode;
    if (emoji_mode === "as_text") emoji_mode = "default";
    var preferred_skintone = TS.model.prefs.preferred_skin_tone || "1";
    var emoji_url = selected_combo.skintone ? emoji_paths[emoji_mode][selected_combo.emoji][preferred_skintone] : emoji_paths[emoji_mode][selected_combo.emoji];
    selected_combo.emoji_url = emoji_url;
    var img_element = new Image;
    img_element.src = selected_combo.emoji_url;
    _preloaded_empty_state = selected_combo;
  };
  var _onResize = function() {
    TS.client.ui.unread.$scroller.height(TS.view.cached_wh - $("#client_header").outerHeight() - CLIENT_HEADER_OVERHANG);
    if (!TS.environment.supports_custom_scrollbar) TS.ui.utility.updateClosestMonkeyScroller(TS.client.ui.unread.$scroller);
    if (!TS.model.supports_sticky_position) {
      _updateBannerHeight();
      _updateUnreadGroupPositions();
    }
  };
  var _onRename = function(model_ob) {
    var group = TS.client.unread.getGroup(model_ob.id);
    if (group) TS.client.ui.unread.updateHeader(group);
  };
  var _onKeyDown = function(e) {
    var target_group;
    if (TS.menu.emoji.is_showing) return;
    if ([TS.utility.keymap.left, TS.utility.keymap.right, 82].indexOf(e.which) === -1) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (_currently_loading_more_promise && _currently_loading_more_promise.isPending()) return;
    if (!_currently_changing_active_group && TS.client.ui.isUserAttentionOnChat() && !TS.utility.isFocusOnInput() && !$("#messages_container .unread_empty_state").length && !TS.client.ui.unread.$scroller.hasClass("loading") && !TS.client.ui.unread.$scroller.hasClass("transitioning") && !TS.client.ui.unread.$unread_msgs_div.find(".collapsing").length) {
      var current_group = TS.client.unread.getActiveGroup();
      if (e.which === TS.utility.keymap.right || e.which === TS.utility.keymap.left) {
        e.preventDefault();
        var backwards = e.which === TS.utility.keymap.left ? true : false;
        target_group = TS.client.unread.moveActiveMarker(backwards);
        if (!current_group && !_getGroupElement(target_group).length) {
          var $target_group = TS.client.ui.unread.$unread_msgs_div.find(".unread_group").first();
          var target_group_id = $target_group.data("model-id");
          target_group = TS.client.unread.setActiveGroup(TS.client.unread.getGroup(target_group_id));
        }
        if (target_group) {
          _changeActiveElement(target_group, current_group, {
            collapse_current_group: !backwards
          });
        } else if (!TS.client.unread.areAllMessagesFetched() && !backwards) {
          var last_group = _.last(TS.client.unread.getAllGroups());
          if (last_group.id === current_group.id) {
            _move_active_marker_after_next_page = true;
            var $current_group = _getGroupElement(current_group);
            var $msgs_holder = $current_group.find(".unread_group_msgs");
            TS.client.ui.unread.collapseGroup(current_group, $msgs_holder);
          }
        }
      } else if (e.which === 82) {
        if (!current_group) {
          current_group = _.first(TS.client.unread.getAllGroups());
          if (!_getGroupElement(current_group).length) return;
          TS.client.unread.setActiveGroup(current_group);
        }
        if (current_group) {
          if (current_group.marked_as_read) {
            TS.client.ui.unread.markGroupAsUnread(current_group.id);
          } else {
            _currently_changing_active_group = true;
            TS.client.ui.unread.markGroupAsRead(current_group.id).then(function() {
              if (current_group.marked_as_read) {
                target_group = TS.client.unread.moveActiveMarker();
                _changeActiveElement(target_group, current_group);
              } else {
                _currently_changing_active_group = false;
              }
            });
          }
        }
      }
    }
  };
  var _changeActiveElement = function(target_group, current_group, opts) {
    opts = _.defaults(opts, {
      collapse_current_group: false,
      scroll_and_expand: true
    });
    var updateTargetGroup = function() {
      var $target_group = _getGroupElement(target_group);
      $target_group.toggleClass("active", target_group.active);
      TS.client.ui.unread.updateHeader(target_group);
      if (!target_group.marked_as_read) {
        if (opts.scroll_and_expand) TS.client.ui.unread.expandGroup(target_group);
      }
      if (opts.scroll_and_expand) {
        var $previous_group = $target_group.prev();
        if (current_group && $previous_group.length && $previous_group.data("model-id") === current_group.id) {
          _skip_next_sticky_header_active_update = true;
          _scrollGroupElementToTop($current_group);
        } else {
          _scrollGroupElementToTop($target_group);
        }
      }
      _currently_changing_active_group = false;
      return null;
    };
    if (target_group) {
      _move_active_marker_after_next_page = false;
      _currently_changing_active_group = true;
      if (current_group) {
        var $current_group = _getGroupElement(current_group);
        if (opts.collapse_current_group) {
          var $msgs_holder = $current_group.find(".unread_group_msgs");
          TS.client.ui.unread.collapseGroup(current_group, $msgs_holder, {
            scroll_group: false
          }).then(function() {
            $current_group.toggleClass("active", current_group.active);
            TS.client.ui.unread.updateHeader(current_group);
            updateTargetGroup();
          });
        } else {
          $current_group.toggleClass("active", current_group.active);
          TS.client.ui.unread.updateHeader(current_group);
          updateTargetGroup();
        }
      } else {
        updateTargetGroup();
      }
    } else {
      _currently_changing_active_group = false;
    }
    return null;
  };
  var _scrollGroupElementToTop = function($group) {
    if (!$group.length) return;
    var $scroller = $group.closest(".monkey_scroller");
    if (!$scroller.length) $scroller = $group.closest(":scrollable(vertical)");
    if ($scroller.is("html")) $scroller = $("body");
    $scroller.scrollTop(Math.round($group[0].offsetTop - 8));
  };
  var _getGroupElement = function(group) {
    return TS.client.ui.unread.$unread_msgs_div.find("[data-model-id=" + group.model_ob.id + "]");
  };
  var _updateStickyHeader = function(e) {
    var current_scroll_offset = TS.client.ui.unread.$scroller.scrollTop();
    var groups = TS.client.ui.unread.unread_groups.toArray();
    if (!groups.length) return;
    var group_in_view = groups.reduce(function(previous_unread_group, current_unread_group) {
      if (current_scroll_offset + CLIENT_HEADER_OVERHANG >= current_unread_group.y) {
        return current_unread_group;
      } else {
        return previous_unread_group;
      }
    });
    if (!group_in_view) return;
    var sticky_top = _banner_height;
    if (TS.model.prefs.a11y_font_size === "110") {
      sticky_top += 6;
    } else if (TS.model.prefs.a11y_font_size === "125") {
      sticky_top += 15;
    } else if (TS.model.prefs.a11y_font_size === "150") {
      sticky_top += 30;
    }
    if (TS.environment.isSSBAndAtLeastVersion("2.2.8") && TS.boot_data.feature_channels_list_refresh) {
      sticky_top -= 2;
    }
    if (!$_currently_sticky) {
      $_currently_sticky = group_in_view.$node;
      $_currently_sticky.find(".unread_group_header").css("top", sticky_top);
      $_currently_sticky.addClass("currently_sticky");
    }
    if ($_currently_sticky !== group_in_view.$node) {
      $_currently_sticky.find(".unread_group_header").css("top", "0");
      $_currently_sticky.removeClass("currently_sticky");
      $_currently_sticky = group_in_view.$node;
      $_currently_sticky.find(".unread_group_header").css("top", sticky_top);
      $_currently_sticky.addClass("currently_sticky");
    }
    if (TS.boot_data.feature_unread_view_keyboard_commands && !_currently_changing_active_group && !_skip_next_sticky_header_active_update) {
      var current_group = TS.client.unread.getActiveGroup();
      if (current_group) {
        if ($_currently_sticky.data("model-id") != current_group.id) {
          var target_group = TS.client.unread.getGroup($_currently_sticky.data("model-id"));
          target_group = TS.client.unread.setActiveGroup(target_group);
          _changeActiveElement(target_group, current_group, {
            collapse_current_group: false,
            scroll_and_expand: false
          });
        }
      }
    }
    _skip_next_sticky_header_active_update = false;
  };
  var _updateUnreadGroupPositions = function(changes) {
    var $unread_groups = TS.client.ui.unread.$scroller.find(".unread_group");
    TS.client.ui.unread.unread_groups = $unread_groups.map(function(index, unread_group) {
      return {
        $node: $(unread_group),
        y: unread_group.offsetTop
      };
    });
  };
  var _updateBannerHeight = function() {
    _banner_height = $("#banner").height();
  };
  var _buildTemplateArgs = function(group) {
    return {
      model_ob: group.model_ob,
      model_ob_id: group.model_ob.id,
      has_new_unreads: group.new_unread_cnt > 0,
      unread_cnt: group.total_unreads || 0,
      new_unread_cnt: group.new_unread_cnt,
      marked_as_read_cnt: group.marked_as_read_cnt || 0,
      show_footer: group.new_unread_cnt > 0,
      name: group.model_ob.name,
      display_name: TS.shared.getDisplayNameForModelObNoSigns(group.model_ob),
      name_with_sign: TS.shared.getDisplayNameForModelOb(group.model_ob),
      marked_as_read: group.marked_as_read,
      collapsed: group.collapsed,
      active: TS.boot_data.feature_unread_view_keyboard_commands && group.active,
      is_channel: group.model_ob.is_channel,
      is_group: group.model_ob.is_group,
      is_mpim: group.model_ob.is_mpim,
      is_im: group.model_ob.is_im,
      im_user: group.model_ob.user ? TS.members.getMemberById(group.model_ob.user) : null,
      supports_sticky_position: TS.model.supports_sticky_position,
      supports_keyboard_commands: TS.boot_data.feature_unread_view_keyboard_commands
    };
  };
  var _checkToShowEmptyState = function() {
    if (!TS.client.unread.areAllMessagesFetched()) return;
    var all_groups = TS.client.unread.getAllGroups();
    var all_channels_read = true;
    if (all_groups.length) {
      all_channels_read = _.reduce(all_groups, function(result, g) {
        return result && g.marked_as_read;
      }, all_groups[0].marked_as_read);
    }
    if (all_channels_read) TS.client.ui.unread.displayEmptyState();
  };
  var _transitionToMessages = function() {
    TS.client.ui.unread.$scroller.removeClass("loading");
    TS.client.ui.unread.$scroller.removeClass("loading-slow");
    TS.client.ui.unread.$scroller.addClass("transitioning");
    TS.client.ui.unread.updateChannelHeader();
    TS.client.ui.unread.updateMsgs();
    TS.client.ui.unread.$scroller.removeClass("transitioning");
  };
  var _setUnreadPoint = function(msg_id, model_ob_id, $msg) {
    if (!TS.boot_data.feature_opt_click_all_unreads) return;
    var group = TS.client.unread.getGroup(model_ob_id);
    var model_ob = group.model_ob;
    var mark_msg_ts = TS.utility.msgs.getMarkMsgTSForUnreadPoint(msg_id, group.msgs, model_ob);
    var marked_msg_index = _.findIndex(group.msgs, {
      ts: mark_msg_ts
    });
    var $group = $msg.closest(".unread_group");
    $group.find(".unread_divider").remove();
    $group.find(".unread_day_container").removeClass("unread_day_container");
    if (!mark_msg_ts) return false;
    group.manually_marked_unread_msg = msg_id;
    TS.shared.markReadMsg(group.model_ob.id, mark_msg_ts, TS.model.marked_reasons.back);
    TS.client.markLastReadsWithAPI();
    if (msg_id === parseFloat(group.msgs[group.msgs.length - 1].ts)) return;
    var divider_html = TS.templates.messages_unread_divider({
      label: "UNREAD MESSAGES"
    });
    var $last_read_msg = TS.client.ui.unread.$unread_msgs_div.find('ts-message[data-ts="' + group.msgs[marked_msg_index].ts + '"]');
    $last_read_msg.after(divider_html);
    var $divider = $msg.closest(".unread_group").find(".unread_divider");
    if ($divider.next(".day_divider").length || $divider.is(":last-child")) {
      $divider.addClass("adjacent_to_date");
      $divider.closest(".day_container").next(".day_container").addClass("unread_day_container");
    }
    return true;
  };
})();
