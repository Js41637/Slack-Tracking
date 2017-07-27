webpackJsonp([450], {

  /***/
	166:
    /***/
    (function(module, exports) {

      /* eslint indent: ["error", "tab", { "outerIIFEBody": 0 }] */

      /**
       * @module TS.clog
       * @desc Used to send custom client event logs to our data warehouse
       * @example TS.clog.track(eventName, optional_args); // A simple track event
       */

	;
	(function() {
        // eslint-disable-line slack/no-import, slack/no-export

		'use strict';

		TS.registerModule('clog', {

			onStart: /* istanbul ignore next */ function onStart() {
            // ensure we have TS.log present, before enabling pri-based logging
				_pri = TS.log && TS.has_pri[_pri] ? _pri : null;
            // Set up a timer to send all of the logs to the backend. Add some noise so that
            // every user has a slightly different interval duration, which prevents load spikes on the
            // endpoint after bulk client reloads.

            // send logs roughly every 30 seconds
				var interval_duration_ms = 30 * 1000;
				var interval_duration_noise_ms = 5 * 1000;

				var noise_ms = Math.floor(Math.random() * interval_duration_noise_ms);
				setInterval(_sendDataAndEmptyQueue, interval_duration_ms + noise_ms);

            // Empty the queue and send the data back before the window closes, so that we don't lose any data.
				$(window).on('beforeunload pagehide', _sendDataAndEmptyQueue);

            // Use event delegation to listen for anything that we consider a click
				$('body').on('click', '[data-clog-click="true"], [data-clog-ui-action="click"], [data-clog-event=WEBSITE_CLICK]', _onClick);

            // set TS.clog to use TS.model properties
				_fetchModelValues();

            // flush just in case
				TS.clog.flush();
			},

          /**
           * Set the user id manually
           * @param {string} id - User ID, as raw number or alphanumeric
           * @return {void}
           */
			setUser: function setUser(id) {
				_user_id = id;
			},

          /**
           * Set the team id manually
           * @param {string} id - Team ID, as raw number or alphanumeric
           * @return {void}
           */
			setTeam: function setTeam(id) {
				_team_id = id;
			},

          /**
           * Set the enterprise id manually
           * @param {string} id - Enterprise ID, as raw number or alphanumeric
           * @return {void}
           */
			setEnterprise: function setEnterprise(id) {
				_enterprise_id = id;
			},

          /**
           * Turn Debug Mode ON/OFF
           * @return {void}
           */
			toggleDebugMode: function toggleDebugMode() {
				_is_debug_mode = !_is_debug_mode;
				return _is_debug_mode;
			},

          /**
           * Track a single clog event
           * @param {string} event - Unique identifier for the logged event (ex. "FooButtonClicked")
           * @param {Array} args - Optional set of arguments to pass
           * @return {void}
           */
			track: function track(event, args) {
				_recordLog(event, args);
			},

          /**
           * Track a click event on a DOM element
           * @param {string} selector - ID or class of element to track click events
           * @param {string} event - Unique identifier for the logged event (ex. "FooButtonClicked")
           * @param {Array} args - Optional set of arguments to pass
           * @return {void}
           */
			trackClick: function trackClick(selector, event, args) {
				$(selector).on('click', function() {
					_recordLog(event, args);
				});
			},

          /**
           * Track a submit event on a form
           * @param {string} selector - ID or class of form element to track click events
           * @param {string} event - Unique identifier for the logged event (ex. "FooButtonClicked")
           * @param {Array} args - Optional set of arguments to pass
           * @return {void}
           */
			trackForm: function trackForm(selector, event, args) {
				$(selector).on('submit', function() {
					_recordLog(event, args);
				});
			},

          /**
           * Clear out any unsent logs
           * @return {void}
           */
			flush: function flush() {
				_sendDataAndEmptyQueue();
			},

			test: function test() {
				return {
					createLogURLs: _createLogURLs,
					sendDataAndEmptyQueue: _sendDataAndEmptyQueue,
					detectClogEndpoint: _detectClogEndpoint,
					getLogs: function getLogs() {
						return _logs;
					},
					getClogEndpoint: function getClogEndpoint() {
						return _CLOG_ENDPOINT_URL;
					},
					reset: function reset() {
						_logs = [];
						_CLOG_ENDPOINT_URL = undefined;
					}
				};
			},

			parseParams: function parseParams(params) {
				if (!params) return {};

				params = params.split(',');
				var args = {};
				var i = 0;
				var len = params.length;
				var arg;

				for (i; i < len; i += 1) {
					arg = params[i].split('=');
					args[arg[0]] = arg[1];
				}

				return args;
			}
		});

        // private
		var _CLOG_ENDPOINT_URL;
		var _MAX_URL_LENGTH = 2000; // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
		var _LOG_PRI = 1000;
		var _pri = _LOG_PRI;

        // stored logs to be sent to the data warehouse -- cleared out after sending
		var _logs = [];

        // stored team and user IDs
		var _team_id;
		var _enterprise_id;
		var _user_id;

		var _is_debug_mode = false;

        /**
         * Detect if we're on dev, staging, or prod, and set _CLOG_ENDPOINT_URL to the appropriate URL
         * @param {string} host - the target url to infer clog entpoint from (usually location.host)
         * @return {void}
         */
		var _detectClogEndpoint = function _detectClogEndpoint(host) {
			var is_dev = host.match(/^([^.]+\.)?(?:enterprise\.)?(dev[0-9]*)\.slack\.com/);
			var is_qa = host.match(/^([^.]+\.)?(?:enterprise\.)?(qa[0-9]*)\.slack\.com/);
			var is_staging = host.match(/^([^.]+\.)?(?:enterprise\.)?(staging)\.slack\.com/);

			if (is_dev) {
            // Create clog endpoint specific to this dev env
				_CLOG_ENDPOINT_URL = 'https://' + is_dev[2] + '.slack.com/clog/track/';
			} else if (is_qa) {
            // Create clog endpoint specific to this qa env
				_CLOG_ENDPOINT_URL = 'https://' + is_qa[2] + '.slack.com/clog/track/';
			} else if (is_staging) {
				_CLOG_ENDPOINT_URL = 'https://staging.slack.com/clog/track/';
			} else {
				_CLOG_ENDPOINT_URL = 'https://slack.com/clog/track/';
			}
		};

        /**
         * Store a single log entry in the shared logs object
         * @param {string} event - Unique identifier for the logged event (ex. "FooButtonClicked")
         * @param {Array} args - Optional set of arguments to pass
         * @return {void}
         */
		var _recordLog = function _recordLog(event, args) {
			if (typeof event !== 'string') return;
			if (!args) args = null;

			var payload = {
				tstamp: Date.now(),
				event: event,
				args: args
			};

          // Try to get team, user and enterprise values from TS.model
			_fetchModelValues();

          // Use the values if they are set
			if (_team_id) payload.team_id = _team_id;
			if (_enterprise_id) payload.enterprise_id = _enterprise_id;
			if (_user_id) payload.user_id = _user_id;

			_logs.push(payload);

			if (TS.log) {
				if (_is_debug_mode) TS.console.log(_LOG_PRI, payload);
				if (TS.has_pri[_pri]) TS.log(_pri, 'Event called:', event, args);
			} else if (_is_debug_mode) {
            /* no TS.log on marketing pages */
				try {
					console.log(payload);
				} catch (e) {} /* noop */ // eslint-disable-line no-console
			}
		};

        /**
         * Package the queued logs into URLs, send them off to be processed by the backend
         * @return {void}
         */
		var _sendDataAndEmptyQueue = function _sendDataAndEmptyQueue() {
          // Bail early if there is nothing to pass to the data warehouse.
			if (_logs.length === 0) return;

			if (TS.log && TS.has_pri[_pri]) {
				TS.log(_pri, 'Sending clog data, emptying queue');
				TS.log(_pri, 'Logs: ', _logs);
			}

			var log_urls = _createLogURLs(_logs);

			var log_url;
			for (var i = 0; i < log_urls.length; i += 1) {
				log_url = log_urls[i];
				var log = new Image();
				log.src = log_url;

				if (TS.log && TS.has_pri[_pri]) TS.log(_pri, 'Logged event: ' + log_url);
			}

          // Clear out the logs
			_logs = [];
		};

        /**
         * Create URLs with stringified data to POST to the PHP.
         * @param {Array} logs - An array of objects containing a timestamp, string identifier, and array of optional args.
         * @return {Array} of escaped URLs
         */
		var _createLogURLs = function _createLogURLs(logs) {
			if (!_CLOG_ENDPOINT_URL) _detectClogEndpoint(location.host);
			var urls = [];
			var data = [];
			var url = '';

			var makeUrl = function makeUrl(log_data) {
				return _CLOG_ENDPOINT_URL + '?logs=' + encodeURIComponent(JSON.stringify(log_data));
			};

			var log;
			for (var i = 0; i < logs.length; i += 1) {
				log = logs[i];
				data.push(log);
				url = makeUrl(data);

            // Handle URLs that are too long
				if (url.length > _MAX_URL_LENGTH) {
              // pop off the item that made it too long
					data.pop();

              // remake the url and add it to the return array
					urls.push(makeUrl(data));

              // reset data to contain only the popped item
					data = [log];
				}
			}

			urls.push(makeUrl(data));

			if (TS.log && TS.has_pri[_pri]) TS.log(_pri, 'URLs:', urls);
			return urls;
		};

        /**
         * Click handler for when elements with data-clog-click are clicked.
         * @return {void}
         */
		var _onClick = function _onClick() {
			var event = this.getAttribute('data-clog-event');
			if (!event) {
				if (TS.warn) TS.warn('Logging clicks with data-clog-click requires a data-clog-event attribute');
				return;
			}

			var args = {};
			var params = TS.clog.parseParams(this.getAttribute('data-clog-params'));

          // Parses new UI Clogging Framework attrs
          // @see https://docs.google.com/a/slack-corp.com/presentation/d/1SevtBWV_Yzd1f-ifI_6iWiQSNMozR6Ga08-hD082mo4
			var ui_context_action = this.getAttribute('data-clog-ui-action');
			if (ui_context_action) {
				args = {
					ui_element: this.getAttribute('data-clog-ui-element'),
					action: this.getAttribute('data-clog-ui-action'),
					step: this.getAttribute('data-clog-ui-step')
				};
				args = {
					contexts: {
						ui_context: args
					}
				};

            /* todo - smart "memory" and a way to set ReferringUIContext */
			}

          /* Custom, per-event prefills */
			switch (event.toUpperCase()) {
			case 'WEBSITE_CLICK':
				params.page_url = location.href;
				break;

			default:
				break;
			}

			args = _mergeParams(params, args);
			TS.clog.track(event, args);
		};

        /**
         * @description takes two objects and merges them together the way _.assign does
         * @param {object} obj1 destination - unique keys are copied from source to this object
         * @param {object} obj2 source - unique keys are taken from this and copied to destination
         * @return {object} obj3 merged object
         */
		var _mergeParams = function _mergeParams(obj1, obj2) {
			var obj3 = {};
			Object.keys(obj1).forEach(function(attrname) {
				obj3[attrname] = obj1[attrname];
			});
			Object.keys(obj2).forEach(function(property) {
				obj3[property] = obj2[property];
			});
			return obj3;
		};

        /**
         *
         * @description fetches TS.model.team.id, .user.id and .enterprise.id if they are available
         * @return {void}
         */
		var _fetchModelValues = function _fetchModelValues() {
			if (TS.model) {
				if (TS.model.enterprise && TS.model.enterprise.id) TS.clog.setEnterprise(TS.model.enterprise.id);
				if (TS.model.team && TS.model.team.id) TS.clog.setTeam(TS.model.team.id);
				if (TS.model.user && TS.model.user.id) TS.clog.setUser(TS.model.user.id);
			}
		};
	})();

      /***/
})

}, [166]);
