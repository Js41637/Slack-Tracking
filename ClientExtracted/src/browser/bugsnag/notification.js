
var Utils = require("./utils"),
    Configuration = require("./configuration"),
    requestInfo = require("./request_info");

const { requireTaskPool } = require('electron-remote');
const remoteAjax = requireTaskPool(require.resolve('electron-remote/remote-ajax'));

var NOTIFIER_NAME = "Bugsnag Node Notifier",
    NOTIFIER_VERSION = '1.9.0',// original pkg read reporter version from package.json, but we can't - manually hardcode it.
    NOTIFIER_URL = "https://github.com/bugsnag/bugsnag-node",
    SUPPORTED_SEVERITIES = ["error", "warning", "info"];

function Notification(bugsnagErrors, options) {
    if (!options) {
        options = {};
    }
    var event = {
        exceptions: bugsnagErrors,
        metaData: {},
    };

    var domainOptions = Utils.cloneObject(process.domain && process.domain._bugsnagOptions || {});

    if (options.userId || domainOptions.userId) {
        event.user = event.user || {};
        event.user.id = options.userId || domainOptions.userId;
        delete options.userId;
        delete domainOptions.userId;
    }

    if (options.user || domainOptions.user) {
        event.user = options.user || domainOptions.user;
        delete options.user;
        delete domainOptions.user;
    }

    if (options.context || domainOptions.context) {
        event.context = options.context || domainOptions.context;
        delete options.context;
        delete domainOptions.context;
    }

    if (options.groupingHash || domainOptions.groupingHash) {
        event.groupingHash = options.groupingHash || domainOptions.groupingHash;
        delete options.groupingHash;
        delete domainOptions.groupingHash;
    }

    if (Configuration.appVersion) {
        event.appVersion = Configuration.appVersion;
    }

    if (Configuration.releaseStage) {
        event.releaseStage = Configuration.releaseStage;
    }

    if (Configuration.payloadVersion) {
        event.payloadVersion = Configuration.payloadVersion;
    }

    if (options.severity && SUPPORTED_SEVERITIES.indexOf(options.severity) >= 0) {
        event.severity = options.severity;
    } else {
        event.severity = "warning";
    }

    if (Configuration.metaData && Object.keys(Configuration.metaData).length > 0) {
        event.metaData = Utils.cloneObject(Configuration.metaData);
    }

    if (Configuration.hostname) {
        event.device = {
            hostname: Configuration.hostname
        };
    }

    if (options.req) {
        this.processRequest(event, requestInfo(options.req));
        delete options.req;
    } else if (domainOptions.cleanedRequest) {
        this.processRequest(event, domainOptions.cleanedRequest);
    }
    delete domainOptions.cleanedRequest;

    if (options.apiKey) {
        this.apiKey = options.apiKey;
        delete options.apiKey;
    } else {
        this.apiKey = Configuration.apiKey;
    }

    if (Object.keys(domainOptions).length > 0) {
        Utils.mergeObjects(event.metaData, domainOptions);
    }

    if (Object.keys(options).length > 0) {
        Utils.mergeObjects(event.metaData, options);
    }

    this.notifier = {
        name: NOTIFIER_NAME,
        version: NOTIFIER_VERSION,
        url: NOTIFIER_URL
    };

    this.events = [event];
}

Notification.prototype.deliver = function(cb) {

    // run before notify callbacks
    var shouldNotify = true;
    Configuration.beforeNotifyCallbacks.forEach(function (fn) {
        var ret = fn(this);
        if (ret === false) {
            shouldNotify = false;
        }
    }.bind(this));

    if (!shouldNotify) {
        return;
    }

    this._deliver(cb);
};

Notification.prototype._deliver = function (cb) {

    if (typeof cb !== "function") {
        cb = null;
    }

    // Filter before sending
    this.events[0].metaData = Utils.filterObject(this.events[0].metaData, Configuration.filters);

    var port = Configuration.notifyPort || (Configuration.useSSL ? 443 : 80);

    Configuration.logger.info("Delivering exception to " + (Configuration.useSSL ? "https" : "http") + "://" + Configuration.notifyHost + ":" + port + Configuration.notifyPath);

    // We stringify, ignoring circular structures
    var cache = [];

    var payload = JSON.stringify(this, function(key, value) {
        if (Utils.typeOf(value) === "object") {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    });

    var headers = Utils.cloneObject(Configuration.headers || {});
    headers["Content-Type"] = "application/json";

    var options = {
        url: "" + (Configuration.useSSL ? "https" : "http") + "://" + Configuration.notifyHost + ":" + port + Configuration.notifyPath,
        proxy: Configuration.proxy,
        body: payload,
        headers: headers,
        crossDomain: true
    };

    Configuration.logger.info(payload);

    console.log(options.url, JSON.stringify(options.body));
    return remoteAjax.post(options)
        .then((res) => {
            if (cb) {
                if (res.status === 200) {
                    return cb(null, res.response);
                } else {
                    return cb(new Error(res.body));
                }
            }
        })
        .catch((err) => {
            console.error("COULDNT SEND ERROR: " + err);
            if (cb) {
                return cb(err);
            } else {
                return Configuration.logger.error(err);
            }
        });
};

Notification.prototype.processRequest = function(event, cleanRequest) {
    if (!event.metaData) {
        event.metaData = {};
    }
    event.metaData.request = cleanRequest;
    if (!event.context) {
        event.context = cleanRequest.path || cleanRequest.url;
    }
    if (!event.userId) {
        if (cleanRequest.headers && cleanRequest.headers['x-forwarded-for']) {
            event.userId = cleanRequest.headers['x-forwarded-for'];
        } else if (cleanRequest.connection && cleanRequest.connection.remoteAddress) {
            event.userId = cleanRequest.connection.remoteAddress;
        }
    }
};

Notification.prototype.loadCode = function (callback) {
    return Promise.all(this.events.map(function (event) {
        return Promise.all(event.exceptions.map(function (error) {
            return new Promise(function (resolve) {
                error.loadCode(resolve);
            });
        }));
    })).then(callback);
};

module.exports = Notification;
