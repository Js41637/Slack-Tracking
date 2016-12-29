(function() {
  "use strict";
  TS.registerModule("ms.flannel", {
    onStart: function() {
      var handler_priority = Infinity;
      TS.ms.on_msg_sig.add(TS.ms.flannel.preprocessMessage, this, handler_priority);
    },
    isFlannelMessage: function(imsg) {
      return imsg.type == "flannel";
    },
    call: function(command_type, args) {
      var imsg = {
        type: "flannel",
        subtype: command_type
      };
      if (_.isObject(args)) {
        if (args.hasOwnProperty("type") || args.hasOwnProperty("subtype")) {
          throw new Error("Arguments must not include `type` or `subtype` fields");
        }
        _.merge(imsg, args);
      }
      if (!TS.ms.hasOpenWebSocket()) {
        TS.log(1989, "Flannel: received a " + command_type + " call while we are not connected; deferring");
        var this_context = this;
        var args = arguments;
        var requirements = Promise.join(TS.ms.promiseToHaveOpenWebSocket(), TS.api.connection.waitForAPIConnection());
        return requirements.then(function() {
          TS.log(1989, "Flannel: connected! Continuing deferred " + command_type + " call");
          return TS.ms.flannel.call.apply(this_context, args);
        });
      }
      return new Promise(function(resolve, reject) {
        var lostConnectionReject = function() {
          reject(new Error("Lost Flannel connection"));
        };
        TS.ms.disconnected_sig.addOnce(lostConnectionReject);
        TS.ms.send(imsg, function(ok, imsg) {
          TS.ms.disconnected_sig.remove(lostConnectionReject);
          if (ok) {
            resolve(imsg);
          } else {
            var e = new Error("Flannel call failed");
            e.imsg = imsg;
            reject(e);
          }
        });
      });
    },
    preprocessMessage: function(imsg) {
      if (!TS.lazyLoadMembersAndBots()) return;
      if (!imsg.annotations) return;
      var objects = _.values(imsg.annotations);
      TS.flannel.batchUpsertObjects(objects);
    }
  });
})();
