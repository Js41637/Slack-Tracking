(function() {
  "use strict";
  TS.registerModule("files.gdrive", {
    onStart: function() {
      if (!TS.client) return;
      TS.files.team_file_shared_sig.add(_runGdriveCoachmark)
    },
    openPickerWindow: function() {
      var message_listener = null;
      return new Promise(function(resolve, reject) {
        var token = TS.utility.window.open({
          url: _GDRIVE_IMPORT_URL,
          try_window_open_in_ssb: true,
          height: _GDRIVE_WINDOW_HEIGHT
        });
        if (!token) {
          reject(new Error("could not open window"))
        }
        message_listener = _getMessageListenerForPicker(resolve, reject);
        window.addEventListener("message", message_listener);
        if (_promise_picker_has_been_promised) {
          reject("Promise already made")
        }
        _promise_picker_has_been_promised = true
      }).then(function(data) {
        _promise_picker_has_been_promised = false;
        return _importFiles(data.chosen_files, TS.shared.getActiveModelOb())
      }).catch(function(err) {
        if (err == "Promise already made") {
          return
        }
        var ephemeral_text = "Darn, that didn't work. Try again or <http://my.slack.com/help.requests/new|contact us> if it's still not working.";
        var model_ob = TS.shared.getActiveModelOb();
        TS.error(err);
        if ((err.data.error == "unidentified_external_url" || err.data.error == "file_type_has_no_handler") && err.args.link) {
          ephemeral_text = "We don't currently support importing that type of Google Drive file, but we included the link so that others can access it.";
          _postMessage(model_ob.id, err.args.link)
        }
        if (err.data.error == "filename_too_long") {
          ephemeral_text = "Sorry! The name of that file is too long for us to handle. Please try importing a file with a shorter filename."
        }
        TS.client.ui.addEphemeralBotMsg({
          text: ephemeral_text,
          ephemeral_type: "file_type_has_no_handler",
          slackbot_feels: "sad_surprise"
        });
        _promise_picker_has_been_promised = false;
        return
      }).finally(function() {
        window.removeEventListener("message", message_listener)
      })
    },
    createAndShare: function(type) {
      return _gdriveCreateFileDialog(type).then(function(share_settings) {
        TS.files.gdrive.create(type, share_settings)
      }).catch(function(err) {
        TS.menu.file.onGDriveCreateComplete(false)
      })
    },
    create: function(type, share_settings) {
      if (share_settings && share_settings.channel) {
        var channel = TS.channels.getChannelById(share_settings.channel);
        if (channel && channel.name) {
          TS.channels.join(channel.name, false)
        } else if (TS.ims.getImByMemberId(share_settings.channel)) {
          TS.ims.startImByMemberId(share_settings.channel)
        } else if (TS.mpims.getMpimById(share_settings.channel)) {
          TS.mpims.displayMpim(share_settings.channel)
        } else if (TS.groups.getGroupById(share_settings.channel)) {
          TS.groups.displayGroup(share_settings.channel)
        } else {
          TS.error("no valid shared channel/im/mpim/group to display")
        }
      }
      return TS.api.call("files.createExternal", {
        service_stub: "gdrive",
        mime_type: _GDRIVE_MIMETYPE_PREFIX + "." + type,
        filename: share_settings.title || "",
        open_edit: share_settings.channel ? true : false
      }).then(function(response) {
        TS.utility.window.alwaysOpenInBrowser(response.data.url);
        if (share_settings && share_settings.channel) {
          _gdriveShareFileInChannel(response.data.url, share_settings.channel, share_settings.comment)
        }
        TS.menu.file.onGDriveCreateComplete(true, response)
      }).catch(function(err) {
        TS.menu.file.onGDriveCreateComplete(false);
        var ephemeral_text = "Darn, that didn't work. Try again or <http://my.slack.com/help/requests/new|contact us> if it's still not working.";
        if (err.data.error == "use_auth_url") {
          return _authThenCreate(type, share_settings)
        }
        if (err.data.error == "filename_too_long") {
          ephemeral_text = "Sorry! The name of that file is too long for us to handle. Please try importing a file with a shorter filename."
        }
        TS.error(err);
        TS.client.ui.addEphemeralBotMsg({
          text: ephemeral_text,
          ephemeral_type: "unhandled_gdrive_create",
          slackbot_feels: "sad_surprise"
        })
      })
    }
  });
  var _GDRIVE_IMPORT_URL = TS.boot_data.team_url + "files/import/gdrive";
  var _GDRIVE_CREATE_AUTH_URL = TS.boot_data.team_url + "files/create/gdrive/auth";
  var _GDRIVE_MIMETYPE_PREFIX = "application/vnd.google-apps";
  var _GDRIVE_WINDOW_HEIGHT = 675;
  var _promise_picker_has_been_promised = false;
  var _getMessageListenerForPicker = function(resolve, reject) {
    return _getMessageListener({
      resolve: resolve,
      reject: reject,
      method: "gdrive_picker"
    })
  };
  var _getMessageListenerForAuth = function(resolve, reject) {
    return _getMessageListener({
      resolve: resolve,
      reject: reject,
      method: "google_auth"
    })
  };
  var _getMessageListener = function(params) {
    return function(e) {
      if (e.data.method !== params.method) return;
      if (!e.data.ok) {
        params.reject(new Error(params.method + " not ok"))
      } else {
        params.resolve(e.data)
      }
    }
  };
  var _importFiles = function(files, model_ob) {
    var promises = files.map(function(file) {
      return _promiseToImportFile(file, model_ob)
    });
    return Promise.all(promises)
  };
  var _promiseToImportFile = function(file, model_ob) {
    return TS.api.call("files.uploadExternal", {
      channels: model_ob.id,
      link: file.url
    }).then(function(response) {
      if (model_ob.user && TS.ims.getImByMemberId(model_ob.user) && TS.model.team.enterprise_id) {
        _postMessage(model_ob.id, response.data.file.url_private, true, true)
      }
    })
  };
  var _authThenCreate = function(type, share_settings) {
    var message_listener = null;
    return new Promise(function(resolve, reject) {
      var token = TS.utility.window.open({
        url: _GDRIVE_CREATE_AUTH_URL,
        try_window_open_in_ssb: true,
        height: _GDRIVE_WINDOW_HEIGHT
      });
      if (!token) {
        reject(new Error("could not open window"))
      }
      message_listener = _getMessageListenerForAuth(resolve, reject);
      window.addEventListener("message", message_listener)
    }).then(function() {
      return TS.files.gdrive.create(type, share_settings)
    }).catch(function(err) {
      TS.error(err)
    }).finally(function() {
      window.removeEventListener("message", message_listener)
    })
  };
  var _gdriveCreateFileDialog = function(type) {
    return new Promise(function(resolve, reject) {
      var file = {
        type: _GDRIVE_MIMETYPE_PREFIX + type
      };
      var sharing_html = TS.templates.builders.buildFileSharingControls(file, false, false, true, null);
      TS.generic_dialog.start({
        title: "Create a Google " + _.capitalize(type),
        body: TS.templates.gdrive_create_dialog({
          sharing_html: new Handlebars.SafeString(sharing_html)
        }),
        show_cancel_button: true,
        esc_for_ok: false,
        fullscreen: false,
        go_button_text: "Create",
        type: "new_gdrive",
        onGo: function() {
          var gdrive_sharing_settings = {
            title: $("#document_title").val(),
            comment: $("#file_comment_textarea").val(),
            channel: $("#share_cb").is(":checked") ? $("#share_model_ob_id").val() : false
          };
          resolve(gdrive_sharing_settings)
        },
        onCancel: reject
      });
      $("#share_cb").removeAttr("checked");
      TS.ui.file_share.bindFileShareDropdowns();
      TS.ui.file_share.bindFileShareShareToggle();
      TS.ui.file_share.bindFileShareCommentField()
    })
  };
  var _gdriveShareFileInChannel = function(fileUrl, channel_id, comment) {
    var is_IM = false;
    if (TS.ims.getImByMemberId(channel_id)) {
      is_IM = true
    }
    return TS.api.call("files.uploadExternal", {
      link: fileUrl,
      channels: is_IM ? "" : channel_id
    }).then(function(response) {
      if (is_IM) {
        _postMessage(channel_id, response.data.file.url_private, true, true)
      }
      if (comment) {
        TS.api.call("files.comments.add", {
          file: response.data.file.id,
          comment: comment,
          channel: channel_id
        })
      }
    }).catch(function(err) {
      TS.error(err);
      TS.client.ui.addEphemeralBotMsg({
        text: "Oh no! I couldn't import your newly created file",
        ephemeral_type: "gdrive_share_file_error",
        slackbot_feels: "sad_surprise"
      })
    })
  };
  var _postMessage = function(channel_id, text, unfurl_links, unfurl_media) {
    TS.api.call("chat.postMessage", {
      channel: channel_id,
      text: text,
      unfurl_links: unfurl_links || false,
      unfurl_media: unfurl_media || false
    }).catch(function(err) {
      TS.error(err)
    })
  };
  var _runGdriveCoachmark = function(file) {
    if (_.get(file, "external_type") !== "gdrive") return;
    if (_.get(file, "user") !== TS.model.user.id) return;
    if (!TS.model.prefs.gdrive_enabled) return;
    if (TS.model.prefs.seen_gdrive_coachmark) return;
    TS.experiment.loadUserAssignments().then(function() {
      var group = TS.experiment.getGroup("gdrive_1_5_coachmark_experiment");
      if (group === "yes_coach_mark") {
        TS.coachmark.start(TS.coachmarks.coachmarks.gdrive);
        TS.model.prefs.seen_gdrive_coachmark = true;
        TS.prefs.setPrefByAPI({
          name: "seen_gdrive_coachmark",
          value: true
        })
      }
    })
  }
})();