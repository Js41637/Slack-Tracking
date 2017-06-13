webpackJsonp([251], {
  2748: function(o, e) {
    ! function() {
      "use strict";
      TS.registerModule("idp_groups", {
        loaded_sig: new signals.Signal,
        onStart: function() {
          TS.idp_groups.shouldLoad() && TS.api.callImmediately("idpgroups.list", {
            include_users: 1
          }, function(o, e) {
            o ? TS.model.idp_groups = _.toArray(e.idpgroups) : TS.error("Failed to load IDP groups"), TS.idp_groups.loaded_sig.dispatch();
          });
        },
        isLoaded: function() {
          return null !== TS.model.idp_groups;
        },
        shouldLoad: function() {
          return TS.web && TS.boot_data.page_needs_enterprise;
        },
        memberBelongsToGroup: function(o, e) {
          return !(!o || !o.users) && -1 !== _.indexOf(o.users, e);
        },
        memberBelongsToAnyGroup: function(o) {
          if (!TS.idp_groups.isLoaded()) return !1;
          var e = _.find(TS.model.idp_groups, function(e) {
            return TS.idp_groups.memberBelongsToGroup(e, o);
          });
          return !_.isUndefined(e);
        },
        getGroupsForMember: function(o) {
          return TS.idp_groups.isLoaded() ? _.filter(TS.model.idp_groups, function(e) {
            return TS.idp_groups.memberBelongsToGroup(e, o);
          }) : [];
        }
      });
    }();
  }
}, [2748]);
