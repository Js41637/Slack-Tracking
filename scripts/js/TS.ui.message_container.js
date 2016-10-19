(function() {
  "use strict";
  TS.registerModule("ui.message_container", {
    register: function(config) {
      if (!config.container) {
        TS.error("TS.ui.message_container.register requires a container!");
        return
      }
      if (!config.updateCallback) config.updateCallback = _.noop;
      _setVisibleRange(config);
      var visible_sections = _getVisibleRange(config);
      var $container = $(config.container);
      $container.data("message-container-config", config);
      $container.addClass("message_container");
      _buildSections(config, visible_sections);
      config._state = visible_sections;
      _buildLoadingIndicators(config);
      _bindUI(config)
    },
    cleanup: function(config) {
      var $container = $(config.container);
      var $scroller = $container;
      if (config.scroller) $scroller = $(config.scroller);
      $scroller.off("scroll.message_container");
      if (config._pending_op) config._pending_op.cancel()
    },
    update: function(config) {
      _changes = {
        added: [],
        removed: [],
        replaced: []
      };
      var $container = $(config.container);
      if (config._range) {
        _setVisibleRange(config, config._range.start)
      } else {
        _setVisibleRange(config)
      }
      var sections = _getVisibleRange(config);
      var current_state = config._state;
      var sections_resolution = _resolveSections(current_state, sections);
      var $current_section;
      _resolutionIterator(sections_resolution, function(step) {
        var section = step.item;
        if (step.action === "continue") {
          $current_section = $container.children('[data-section-id="' + section.id + '"]');
          _updateSection(config, section)
        } else if (step.action === "delete") {
          $container.children('[data-section-id="' + section.id + '"]').remove()
        } else if (step.action === "insert") {
          var $inserting = _buildSection(config, section);
          if ($current_section && $current_section.length) {
            $current_section.after($inserting)
          } else {
            $container.prepend($inserting)
          }
          $current_section = $inserting
        } else if (step.action === "append") {
          var $appending = _buildSection(config, section);
          $container.append($appending);
          $current_section = $appending
        }
      });
      config._state = sections;
      _buildLoadingIndicators(config);
      if (TS.client && config.name) {
        TS.client.ui.checkInlineImgsAndIframes(config.name)
      }
      var $scroller = $container;
      if (config.scroller) $scroller = $(config.scroller);
      TS.ui.utility.updateClosestMonkeyScroller($scroller);
      if (config.updated_sig) {
        config.updated_sig.dispatch(_changes)
      }
      if (config.page_size) {
        var num_msgs = _.reduce(sections, function(sum, section) {
          return sum + section.msgs.length
        }, 0);
        if (num_msgs < 2 * config.page_size) {
          var loader;
          if (config.has_more_end && config.promiseToLoadMoreAtEnd) {
            loader = config.promiseToLoadMoreAtEnd
          } else if (config.has_more_beginning && config.promiseToLoadMoreAtBeginning) {
            loader = config.config.promiseToLoadMoreAtBeginning
          }
          if (loader) {
            config._pending_op = loader().then(function() {
              TS.ui.message_container.updateWithFocus(config, $container.find("ts-message").first())
            }).finally(function() {
              config._pending_op = null
            })
          }
        }
      }
      var result = _changes;
      config.updateCallback(result);
      _changes = null;
      return result
    },
    updateWithFocus: function(config, $element) {
      if (!$element || !$element.length) return TS.ui.message_container.update(config);
      var $focus = $($element);
      var changes;
      if ($element.is("ts-message")) {
        var $message_body = $element.find(".message_body");
        if ($message_body.length) $focus = $message_body
      }
      TS.ui.utility.preventElementFromScrolling($focus, function() {
        changes = TS.ui.message_container.update(config)
      }, function() {
        var $container = $(config.container);
        if ($.contains($container[0], $focus[0])) return $focus;
        if ($element.is("ts-message")) {
          var id = $element.attr("id");
          $element = $container.find("#" + id);
          $message_body = $element.find(".message_body");
          if ($message_body.length) return $message_body
        }
        return $element
      });
      return changes
    },
    pageUp: function(config, $element) {
      if (!config._range || !config.page_size) return;
      _moveVisibleRangeBack(config);
      TS.ui.message_container.updateWithFocus(config, $element)
    },
    pageDown: function(config, $element) {
      if (!config._range || !config.page_size) return;
      _moveVisibleRangeForward(config);
      TS.ui.message_container.updateWithFocus(config, $element)
    },
    test: function() {
      return {
        resolveOrderedLists: _resolveOrderedLists
      }
    }
  });
  var _changes;
  var _loaded_but_not_shown = false;
  var _logRemove = function($msg) {
    if (!_changes) return;
    _changes.removed.push($msg)
  };
  var _logAdd = function($msg) {
    if (!_changes) return;
    _changes.added.push($msg)
  };
  var _logReplace = function($msg) {
    if (!_changes) return;
    _changes.replaced.push($msg)
  };
  var _bindUI = function(config) {
    if (!config.page_size) return;
    var $container = $(config.container);
    var $scroller = $container;
    var $scroller_holder = $scroller.parent();
    if (config.scroller) $scroller = $(config.scroller);
    var scroll_handler = _.debounce(function(scroller) {
      if (scroller.scrollTop + $scroller_holder.height() > scroller.scrollHeight * .25) {
        _loadMoreMessages(config)
      }
      if (scroller.scrollTop === 0) {
        _handleScrolledToTop(config, $container)
      } else if (scroller.scrollTop + $scroller_holder.height() > scroller.scrollHeight * .9) {
        _appendMoreMessages(config, $container)
      }
      if (TS.client) {
        TS.client.ui.checkInlineImgsAndIframes("unread")
      }
    }, 250);
    $scroller.on("scroll.message_container", function() {
      scroll_handler(this)
    })
  };
  var _handleScrolledToTop = function(config, $container) {
    var all = _flattenAllMsgs(config);
    if (!all.length) return;
    var $first = $container.find("ts-message").first();
    var first_msg = _.first(all);
    if (_.isEqual(first_msg, config._range.start)) {
      if (config.has_more_beginning && config.promiseToLoadMoreAtBeginning) {
        config._pending_op = config.promiseToLoadMoreAtBeginning().then(function() {
          TS.ui.message_container.pageUp(config, $first)
        }).finally(function() {
          config._pending_op = null
        })
      }
    } else {
      TS.ui.message_container.pageUp(config, $first)
    }
  };
  var _loadMoreMessages = function(config) {
    if (!config._pending_op && _loaded_but_not_shown !== true) {
      if (config.has_more_end && config.promiseToLoadMoreAtEnd) {
        _debug("Start pre-emptive load of more messages", config);
        config._pending_op = config.promiseToLoadMoreAtEnd().then(function() {
          _debug("End pre-emptive load of more messages", config);
          config._pending_op = null;
          _loaded_but_not_shown = true
        })
      }
    }
  };
  var _appendMoreMessages = function(config, $container) {
    var $last = $container.find("ts-message").last();
    if (_loaded_but_not_shown) {
      _debug("Start appending loaded but not shown messages", config);
      _loaded_but_not_shown = false;
      TS.ui.message_container.pageDown(config, $last);
      _debug("End appending loaded but not shown messages", config)
    } else {
      if (!config._pending_op && (config.has_more_end && config.promiseToLoadMoreAtEnd)) {
        _debug("Start load of more messages at append point", config);
        config._pending_op = config.promiseToLoadMoreAtEnd().then(function() {
          _debug("End load of more messages at append point", config);
          _debug("Start appending loaded messages at append point", config);
          config._pending_op = null;
          _loaded_but_not_shown = false;
          TS.ui.message_container.pageDown(config, $last);
          _debug("End appending loaded messages at append point", config)
        })
      } else {
        if (config._pending_op) {
          config._pending_op.then(function() {
            if (_loaded_but_not_shown) {
              _debug("Start appending loaded but not shown messages after pending", config);
              config._pending_op = null;
              _loaded_but_not_shown = false;
              TS.ui.message_container.pageDown(config, $last);
              _debug("End appending loaded but not shown messages after pending", config)
            }
          })
        } else {
          _debug("Appending loaded and shown messages hidden by message_container at append point", config);
          TS.ui.message_container.pageDown(config, $last)
        }
      }
    }
  };
  var _updateSection = function(config, section) {
    var $container = $(config.container);
    var section_state = _.find(config._state, {
      id: section.id
    });
    if (!section) {
      TS.error("TS.ui.message_container.update could not find section " + section.id + " to update.");
      return
    }
    if (!section_state) {
      TS.error("TS.ui.message_container.update could not find section_state for " + section.id + " to update.");
      return
    }
    var $section = $container.children('[data-section-id="' + section.id + '"]');
    if (!$section.length) {
      TS.error("TS.ui.message_container.updateSection could not find section " + section.id);
      return
    }
    if (section.completeness) {
      $section.removeClass("complete partial_start partial_end");
      if (section.completeness.start && section.completeness.end) {
        $section.addClass("complete")
      } else {
        if (!section.completeness.start) {
          $section.addClass("partial_start")
        }
        if (!section.completeness.end) {
          $section.addClass("partial_end")
        }
      }
    }
    var days = _groupMsgsIntoDays(section.msgs);
    var days_state = _groupMsgsIntoDays(section_state.msgs);
    var days_resolution = _resolveDays(days_state, days);
    _updateDays(config, section, $section, days, days_state, days_resolution)
  };
  var _updateDays = function(config, section, $section, days, days_state, resolution) {
    var $current;
    var $msgs_holder = $section.find(".msgs_holder");
    if (!$msgs_holder.length) $msgs_holder = $section;
    var $days = $msgs_holder.find(".day_container");
    var $findDay = function(ts) {
      return $days.filter(function() {
        var this_ts = $(this).attr("data-ts");
        var date_a = TS.utility.date.toDateObject(ts);
        var date_b = TS.utility.date.toDateObject(this_ts);
        return TS.utility.date.sameDay(date_a, date_b)
      })
    };
    var findDay = function(msg_groups, msg) {
      return _.find(msg_groups, function(msgs) {
        var first_msg = msgs[0];
        return TS.utility.msgs.areMsgsSameDay(first_msg, msg)
      })
    };
    _resolutionIterator(resolution, function(step) {
      var first_msg = step.item;
      var msgs = findDay(days, first_msg);
      if (step.action === "continue") {
        $current = $findDay(first_msg.ts);
        var msgs_resolution = _resolveMsgs(findDay(days_state, first_msg), msgs);
        _updateMsgs(config, section, $current, msgs, msgs_resolution)
      } else if (step.action === "delete") {
        $findDay(first_msg.ts).remove()
      } else if (step.action === "insert") {
        var $inserting = _buildDay(config, section, findDay(days, first_msg));
        if ($current && $current.length) {
          $current.after($inserting)
        } else if ($days.length) {
          $days.first().before($inserting)
        } else {
          $msgs_holder.append($inserting)
        }
        $current = $inserting
      } else if (step.action === "append") {
        var $appending = _buildDay(config, section, findDay(days, first_msg));
        $msgs_holder.append($appending);
        $current = $appending
      }
    })
  };
  var _updateMsgs = function(config, section, $day, msgs, resolution) {
    var $current;
    var $msgs = $day.find("ts-message");
    var msg_dom_map = {};
    $msgs.each(function() {
      var ts = $(this).attr("data-ts");
      msg_dom_map[ts] = this
    });
    var msg_map = {};
    var prev_msg_map = {};
    var prev_msg;
    msgs.forEach(function(msg) {
      msg_map[msg.ts] = msg;
      prev_msg_map[msg.ts] = prev_msg;
      prev_msg = msg
    });
    var last_action;
    _resolutionIterator(resolution, function(step) {
      var msg = step.item;
      var id = msg.ts;
      var action = step.action;
      if (action === "edited") action = "replace";
      if (action === "continue" && (last_action === "insert" || last_action === "delete")) action = "replace";
      if (action === "continue") {
        $current = $(msg_dom_map[id])
      } else if (action === "replace") {
        var $replacing = $(msg_dom_map[id]);
        var $edited = $(config.buildMsgHTML(msg_map[id], prev_msg_map[id], section));
        $replacing.replaceWith($edited);
        _logReplace($edited);
        $current = $edited
      } else if (action === "delete") {
        var $deleting = $(msg_dom_map[id]);
        _logRemove($deleting);
        $deleting.remove()
      } else if (action === "insert") {
        var $inserting = $(config.buildMsgHTML(msg_map[id], prev_msg_map[id], section));
        if ($current && $current.length) {
          $current.after($inserting)
        } else if ($msgs.length) {
          $msgs.first().before($inserting)
        } else {
          $day.append($inserting)
        }
        _logAdd($inserting);
        $current = $inserting
      } else if (action === "append") {
        var $appending = $(config.buildMsgHTML(msg_map[id], prev_msg_map[id], section));
        $day.append($appending);
        _logAdd($appending);
        $current = $appending
      }
      last_action = step.action
    })
  };
  var _buildSections = function(config, sections) {
    var $container = $(config.container);
    _.forEach(sections, function(section) {
      var $section = _buildSection(config, section);
      $container.append($section)
    })
  };
  var _buildSection = function(config, section) {
    var section_html = config.buildSection(section);
    var $section = $(section_html);
    $section.attr("data-section-id", section.id);
    if (section.completeness) {
      if (section.completeness.start && section.completeness.end) {
        $section.addClass("complete")
      } else {
        if (!section.completeness.start) {
          $section.addClass("partial_start")
        }
        if (!section.completeness.end) {
          $section.addClass("partial_end")
        }
      }
    }
    var $msgs_holder = $section.find(".msgs_holder");
    if (!$msgs_holder.length) $msgs_holder = $section;
    var days = _groupMsgsIntoDays(section.msgs);
    _.forEach(days, function(msgs) {
      var $day = _buildDay(config, section, msgs);
      $msgs_holder.append($day)
    });
    return $section
  };
  var _buildDay = function(config, section, msgs) {
    var first_msg = msgs[0];
    var $day = $('<div class="day_container" data-ts="' + first_msg.ts + '"></div>');
    var $divider = $(config.buildDayDivider(section, first_msg));
    $day.append($divider);
    _logAdd($divider);
    var prev_msg;
    var $msgs = _.map(msgs, function(msg) {
      var $msg = config.buildMsgHTML(msg, prev_msg, section);
      prev_msg = msg;
      return $msg
    });
    $msgs.forEach(function($msg) {
      $day.append($msg);
      _logAdd($msg)
    });
    return $day
  };
  var _buildLoadingIndicators = function(config) {
    var $container = $(config.container);
    var all = _flattenAllMsgs(config);
    var first = _.first(all);
    var last = _.last(all);
    var start = config._range && config._range.start;
    var end = config._range && config._range.end;
    var more_at_beginning = config.has_more_beginning;
    if (!more_at_beginning) {
      if (first && start && !_.isEqual(first, start)) more_at_beginning = true
    }
    var more_at_end = config.has_more_end;
    if (!more_at_end) {
      if (last && end && !_.isEqual(last, end)) more_at_end = true
    }
    var $beginning = $container.find(".and_more_beginning");
    $beginning.remove();
    if (more_at_beginning) {
      $container.prepend('<div class="and_more_beginning italic align_center large_top_margin large_bottom_margin">And more...</div>')
    }
    var $end = $container.find(".and_more_end");
    $end.remove();
    if (more_at_end) {
      $container.append('<div class="and_more_end italic align_center large_top_margin large_bottom_margin">Loading more messages...</div>')
    } else {
      $container.find(".unread_group:last").addClass("at_bottom")
    }
  };
  var _resolveSections = function(sections_current, sections_new) {
    return _resolveOrderedLists(sections_current, sections_new, function(a, b) {
      var a_inx = a.order || 0;
      var b_inx = b.order || 0;
      return a_inx - b_inx
    })
  };
  var _resolveDays = function(days_current, days_new) {
    var current_msgs = _.map(days_current, function(msgs) {
      return msgs[0]
    });
    var new_msgs = _.map(days_new, function(msgs) {
      return msgs[0]
    });
    return _resolveOrderedLists(current_msgs, new_msgs, function(a, b) {
      if (TS.utility.msgs.areMsgsSameDay(a, b)) return 0;
      if (a.ts < b.ts) return -1;
      if (a.ts > b.ts) return 1
    })
  };
  var _resolveMsgs = function(msgs_current, msgs_new) {
    return _resolveOrderedLists(msgs_current, msgs_new, function(a, b) {
      if (a.ts === b.ts) return 0;
      if (a.ts < b.ts) return -1;
      if (a.ts > b.ts) return 1
    }, function(old_msg, new_msg) {
      var old_edited = old_msg.edited;
      var new_edited = new_msg.edited;
      return !_.isEqual(old_edited, new_edited)
    })
  };
  var _resolutionIterator = function(steps, cb) {
    while (steps) {
      cb(steps);
      steps = steps.next
    }
  };
  var _resolveOrderedLists = function(old_items, new_items, compare_fn, is_edited_fn) {
    var a = _toLinkedList(old_items, 0);
    var b = _toLinkedList(new_items, 0);
    return _resolveWorker(a, b, compare_fn, is_edited_fn)
  };
  var _resolveWorker = function(a, b, compare_fn, is_edited_fn) {
    if (!a && !b) return null;
    if (!a) {
      return {
        action: "append",
        item: b.item,
        next: _resolveWorker(a, b.next, compare_fn, is_edited_fn)
      }
    }
    if (!b) {
      return {
        action: "delete",
        item: a.item,
        next: _resolveWorker(a.next, b, compare_fn, is_edited_fn)
      }
    }
    var cmp_val = compare_fn(a.item, b.item);
    if (cmp_val === 0) {
      if (is_edited_fn && is_edited_fn(a.item, b.item)) {
        return {
          action: "edited",
          item: b.item,
          next: _resolveWorker(a.next, b.next, compare_fn, is_edited_fn)
        }
      } else {
        return {
          action: "continue",
          item: b.item,
          next: _resolveWorker(a.next, b.next, compare_fn, is_edited_fn)
        }
      }
    }
    if (cmp_val < 0) {
      return {
        action: "delete",
        item: a.item,
        next: _resolveWorker(a.next, b, compare_fn, is_edited_fn)
      }
    }
    if (cmp_val > 0) {
      return {
        action: "insert",
        item: b.item,
        next: _resolveWorker(a, b.next, compare_fn, is_edited_fn)
      }
    }
  };
  var _toLinkedList = function(items, i, prev) {
    if (i >= items.length) return null;
    var node = {
      item: items[i],
      prev: prev
    };
    node.next = _toLinkedList(items, i + 1, node);
    return node
  };
  var _setVisibleRange = function(config, start_at) {
    if (!config.page_size) return;
    var all = _flattenAllMsgs(config);
    if (!all.length) return;
    var max = 2 * config.page_size;
    var range = {};
    var start_index = 0;
    if (start_at) {
      var found_section = false;
      start_index = _.findIndex(all, function(m) {
        if (m.section_id === start_at.section_id) {
          if (m.msg_ts == -1) return true;
          if (!found_section) found_section = true;
          return m.msg_ts >= start_at.msg_ts
        }
        if (found_section && m.section_id !== start_at.section_id) {
          return true
        }
        return false
      });
      if (start_index < 0) start_index = 0
    }
    var end_index = Math.min(max + start_index, all.length);
    range.start = all[start_index];
    range.end = all[end_index - 1];
    if (start_index > 0 && end_index - start_index < max) {
      var unused_space = max - (end_index - start_index);
      start_index = Math.max(0, start_index - unused_space);
      range.start = all[start_index]
    }
    config._range = range
  };
  var _getVisibleRange = function(config) {
    if (!config._range) {
      return _.map(config.sections, function(s) {
        var section = _.create(s);
        section.msgs = _.map(s.msgs, _.clone);
        section.completeness = {
          start: true,
          end: true
        };
        return section
      })
    }
    var visible = [];
    var start = config._range.start;
    var end = config._range.end;
    _.forEach(config.sections, function(section) {
      if (!_isSectionInVisibleRange(section, config)) return;
      var s = _.create(section);
      var msgs = _processMessages(section.msgs);
      s.msgs = _.filter(msgs, function(msg) {
        if (start.section_id === end.section_id) {
          return msg.ts >= start.msg_ts && msg.ts <= end.msg_ts
        }
        if (section.id === start.section_id) {
          return msg.ts >= start.msg_ts
        } else if (section.id === end.section_id) {
          return msg.ts <= end.msg_ts
        } else {
          return true
        }
      });
      s.completeness = {
        start: _.last(s.msgs) === _.last(msgs),
        end: _.first(s.msgs) === _.first(msgs)
      };
      if (section === _.first(config.sections) && config.has_more_beginning) {
        s.completeness.start = false
      }
      if (section === _.last(config.sections) && config.has_more_end) {
        s.completeness.end = false
      }
      s.msgs = _.map(s.msgs, _.clone);
      visible.push(s)
    });
    return visible
  };
  var _moveVisibleRangeBack = function(config) {
    var all = _flattenAllMsgs(config);
    var range = config._range;
    var before = _.takeWhile(all, function(msg) {
      return !(msg.section_id === range.start.section_id && msg.msg_ts >= range.start.msg_ts)
    });
    if (!before.length) return;
    var visible = _.drop(all, before.length);
    var found_end = false;
    visible = _.takeWhile(visible, function(msg) {
      if (found_end) return false;
      var at_end = msg.section_id === range.end.section_id && msg.msg_ts >= range.end.msg_ts;
      if (at_end) found_end = true;
      return true
    });
    var adding = _.takeRight(before, config.page_size);
    var survivors = _.take(visible, visible.length - adding.length);
    range.start = _.first(adding);
    range.end = _.last(survivors)
  };
  var _moveVisibleRangeForward = function(config) {
    var all = _flattenAllMsgs(config);
    var range = config._range;
    all = _.dropWhile(all, function(msg) {
      return !(msg.section_id === range.start.section_id && msg.msg_ts >= range.start.msg_ts)
    });
    var found_end = false;
    var visible = _.takeWhile(all, function(msg) {
      if (found_end) return false;
      var at_end = msg.section_id === range.end.section_id && msg.msg_ts >= range.end.msg_ts;
      if (at_end) found_end = true;
      return true
    });
    var tail = _.drop(all, visible.length);
    if (!tail.length) return;
    var adding = _.take(tail, config.page_size);
    var survivors = _.drop(visible, adding.length);
    range.start = _.first(survivors);
    range.end = _.last(adding)
  };
  var _isSectionInVisibleRange = function(section, config) {
    if (!config._range) return true;
    var reached_beginning = false;
    var s;
    for (var i = 0; i < config.sections.length; i++) {
      s = config.sections[i];
      if (!reached_beginning && s.id === config._range.start.section_id) {
        reached_beginning = true
      }
      if (reached_beginning && s.id === section.id) return true;
      if (s.id === config._range.end.section_id) {
        break
      }
    }
    return false
  };
  var _flattenAllMsgs = function(config) {
    var all = [];
    _.forEach(config.sections, function(section) {
      if (!section.msgs.length) {
        all.push({
          section_id: section.id,
          msg_ts: "-1"
        })
      } else {
        var msgs = _processMessages(section.msgs);
        _.forEachRight(msgs, function(msg) {
          all.push({
            section_id: section.id,
            msg_ts: msg.ts
          })
        })
      }
    });
    return all
  };
  var _groupMsgsIntoDays = function(msgs) {
    if (!msgs) return [];
    var prev_msg;
    var all_days = [];
    var day = [];
    _.forEachRight(msgs, function(msg) {
      if (!prev_msg || !TS.utility.msgs.areMsgsSameDay(msg, prev_msg)) {
        if (day.length) all_days.push(day);
        day = [msg]
      } else {
        day.push(msg)
      }
      prev_msg = msg
    });
    if (day.length) all_days.push(day);
    return all_days
  };
  var _processMessages = function(msgs) {
    var processed = [];
    var jl_rolled_up_msgs = [];
    var i, rollup, msg;
    for (i = msgs.length - 1; i > -1; i--) {
      msg = msgs[i];
      if (TS.utility.msgs.isMsgHidden(msg)) continue;
      rollup = TS.utility.msgs.msgRollUpWorker(i, msg, msgs, jl_rolled_up_msgs);
      if (rollup === "continue") {
        continue
      } else if (rollup === "swap") {
        msg = jl_rolled_up_msgs[0];
        jl_rolled_up_msgs.length = 0
      }
      processed.unshift(msg)
    }
    return processed
  };
  var _debug = function(msg, config) {
    var all = _flattenAllMsgs(config);
    var messages_count = all.length;
    var sections_count = config.sections.length;
    var range_start_index = config._range ? _.findIndex(all, {
      msg_ts: config._range.start.msg_ts
    }) : null;
    var range_end_index = config._range ? _.findIndex(all, {
      msg_ts: config._range.end.msg_ts
    }) : null;
    var has_more_end = config.has_more_end;
    TS.log(102, "[msg_container] " + msg, {
      sections: sections_count,
      messages: messages_count,
      range_start: range_start_index,
      range_end: range_end_index,
      has_more_end: has_more_end
    })
  }
})();
