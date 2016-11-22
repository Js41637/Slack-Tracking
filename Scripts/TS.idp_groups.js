(function() {
  "use strict";
  TS.registerModule("idp_groups", {
    loaded_sig: new signals.Signal,
    onStart: function() {
      if (TS.idp_groups.shouldLoad()) {
        TS.api.callImmediately("idpgroups.list", {
          include_users: 1
        }, function(ok, data) {
          if (!ok) {
            TS.error("Failed to load IDP groups");
          } else {
            TS.model.idp_groups = _.toArray(data.idpgroups);
          }
          TS.idp_groups.loaded_sig.dispatch();
        });
      }
    },
    isLoaded: function() {
      return TS.model.idp_groups !== null;
    },
    shouldLoad: function() {
      return TS.web && TS.boot_data.page_needs_enterprise;
    },
    memberBelongsToGroup: function(group, member_id) {
      if (!group || !group.users) return false;
      return _.indexOf(group.users, member_id) !== -1;
    },
    memberBelongsToAnyGroup: function(member_id) {
      if (!TS.idp_groups.isLoaded()) return false;
      var found = _.find(TS.model.idp_groups, function(group) {
        return TS.idp_groups.memberBelongsToGroup(group, member_id);
      });
      return !_.isUndefined(found);
    },
    getGroupsForMember: function(member_id) {
      if (!TS.idp_groups.isLoaded()) return [];
      return _.filter(TS.model.idp_groups, function(group) {
        return TS.idp_groups.memberBelongsToGroup(group, member_id);
      });
    }
  });
})();
