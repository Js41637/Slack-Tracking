@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.container .admin_tabs {
  font-weight: 700;
  margin-bottom: 0
}

#admin_list .admin_tabs.small a {
  padding-left: 1rem;
  padding-right: 1rem
}

#admin_list [data-admin-csv-download]:disabled {
  color: #FFF!important
}

.admin_action_bar {
  border-bottom: 1px solid #ddd;
  padding: 1rem .5rem;
  font-weight: 700;
  font-size: .9rem
}

#admin_sort {
  margin-left: .5rem
}

#admin_range {
  margin-top: -.5rem;
  width: 24%
}

#team_range_alert {
  margin-bottom: -1rem
}

.admin_list_item {
  border-bottom: 1px solid #eee;
  color: #717274;
  line-height: 1.25rem;
  position: relative;
  padding: .5rem .5rem .5rem 3.5rem
}

.admin_list_item:hover {
  background-color: #fdfeff;
  cursor: pointer
}

.admin_list_item .member_image {
  float: left;
  margin: .2rem .5rem 0 -2.75rem
}

.admin_list_item .admin_member_real_name {
  font-weight: 900;
  color: #555459
}

.admin_list_item .admin_member_display_name_and_email,
.admin_list_item .admin_member_real_name,
.admin_list_item .admin_member_username_and_email {
  display: inline-block;
  max-width: 540px
}

.admin_list_item .admin_member_type {
  position: absolute;
  right: 2.5rem;
  top: 1.1rem;
  color: #555459;
  font-size: .9rem
}

.admin_list_item .admin_member_caret {
  position: absolute;
  right: .5rem;
  top: 1rem;
  color: #007AB8
}

.admin_list_item .member_actions,
.admin_list_item .ts_icon_caret_down {
  display: none
}

.admin_list_item .btn {
  margin-right: .2rem
}

.admin_list_item .show_pill_action {
  display: inline
}

.admin_list_item .pill {
  display: inline-block;
  line-height: 1;
  margin: 0 2px 4px 0;
  padding-top: 7px;
  padding-bottom: 7px
}

.admin_list_item .pill .pill_action {
  line-height: 1;
  margin-left: 5px;
  top: 3px;
  right: 4px
}

.admin_list_item .pill .pill_action.ts_icon_pencil {
  padding-right: 5px;
  top: 7px;
  right: 3px
}

.admin_list_item .pill.api_channel_invite {
  padding: 0;
  top: -1px;
  line-height: 1.2
}

.admin_list_item .pill.api_channel_invite .ts_icon_plus {
  display: inline-block;
  padding: 2px 10px
}

.admin_list_item .pill.api_channel_invite .ts_icon_plus::before {
  vertical-align: middle
}

.admin_list_item .pill.api_channel_invite.no_pill_action {
  margin-left: 3px
}

.admin_list_item .pill.group {
  background: #4D394B
}

.admin_list_item .two_factor_auth_badge {
  padding: .3rem .5rem;
  border-radius: 3px
}

.admin_list_item .two_factor_auth_badge:hover {
  background: #E8E8E8
}

.admin_list_item .inline_email:hover,
.admin_list_item .inline_name:hover,
.admin_list_item .inline_username:hover {
  background: #FFFCE0!important;
  cursor: pointer
}

.admin_list_item input[name=first_name],
.admin_list_item input[name=last_name],
.admin_list_item input[name=username],
.admin_list_item input[name=full_name],
.admin_list_item input[name=email] {
  width: 7rem;
  font-size: 14px;
  height: 1.5rem;
  padding: 0rem .5rem
}

.admin_list_item input[name=full_name],
.admin_list_item input[name=email] {
  width: auto
}

.admin_list_item .inline_name_edit_form {
  position: absolute;
  top: 5px
}

.admin_list_item .inline_email_edit_form,
.admin_list_item .inline_username_edit_form {
  position: relative;
  top: -1px;
  margin-bottom: -4px!important
}

.admin_list_item .inline_email_pending {
  white-space: nowrap
}

.admin_list_item .admin_list_item_channel_membership,
.admin_list_item .inline_edit_form_actions {
  font-size: .8rem;
  line-height: 1
}

.restricted_header {
  margin: 1rem 0 .5rem .75rem
}

.admin_list_item.error,
.admin_list_item.expanded,
.admin_list_item.processing,
.admin_list_item.success {
  background-image: none!important;
  background-color: #fdfeff;
  cursor: default
}

.admin_list_item.error .ts_icon_caret_right,
.admin_list_item.expanded .ts_icon_caret_right,
.admin_list_item.processing .ts_icon_caret_right,
.admin_list_item.success .ts_icon_caret_right {
  display: none
}

.admin_list_item.error .ts_icon_caret_down,
.admin_list_item.expanded .ts_icon_caret_down,
.admin_list_item.processing .ts_icon_caret_down,
.admin_list_item.success .ts_icon_caret_down {
  display: block
}

.admin_list_item .error_detail {
  display: none
}

.admin_list_item.error.has_error_detail .error_detail {
  display: inline
}

.admin_list_item.error.has_error_detail .error_generic {
  display: none
}

.admin_list_item.expanded .member_actions {
  display: block;
  font-size: .9rem;
  padding: .5rem 0 .25rem;
  position: relative;
  margin-left: -2.75rem
}

.admin_list_item.expanded .btn_outline {
  color: #007AB8!important;
  border-color: #007AB8
}

.admin_list_item.expanded .btn_outline:hover {
  color: #005E99!important;
  border-color: #005E99
}

.admin_list_item.expanded .sub_action {
  display: inline-block;
  color: #717274;
  text-decoration: underline
}

.admin_list_item.expanded .sub_action:hover {
  color: #005E99
}

@media screen and (max-width:768px) {
  .admin_list_item.expanded .sub_action+.sub_action::before {
    content: "•";
    display: inline-block;
    margin-right: .25rem
  }
  .admin_list_item.expanded .sub_action+.sub_action:hover::before {
    color: #717274
  }
}

@media screen and (min-width:768px) {
  .admin_list_item.expanded .member_actions {
    margin-right: 2rem
  }
  .admin_list_item.expanded .sub_action {
    margin-left: .25em;
    float: right
  }
  .admin_list_item.expanded .sub_action+.sub_action::after {
    content: "•";
    display: inline-block;
    margin-left: .25rem
  }
  .admin_list_item.expanded .sub_action+.sub_action:hover::after {
    color: #717274
  }
}

.admin_list_item.invite_item.pending.expanded .member_actions {
  margin-left: 0
}

.notice_error,
.notice_processing,
.notice_success {
  border-radius: .25rem;
  padding: .25rem .25rem .25rem .5rem;
  margin: .5rem 0 0 -2.75rem;
  color: #FFF;
  font-size: .9rem;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  display: none
}

.notice_success {
  background: #3fba92
}

.notice_success a.undo_link,
.notice_success a.undo_link:hover {
  text-decoration: underline;
  text-shadow: none;
  margin-left: .25rem;
  color: #3C4B5B
}

.notice_error {
  background: #DFA941;
  font-weight: 700
}

.notice_processing {
  color: #717274;
  margin: .25rem 0 0 -3rem;
  text-shadow: none;
  font-weight: 700
}

.admin_list_item .notice_dismiss {
  float: right;
  margin-right: .25rem
}

.btn_outline.notice_dismiss:hover {
  color: #3fba92!important
}

.notice_error .btn_outline.notice_dismiss:hover {
  color: #DFA941!important
}

.admin_list_item.error .notice_error,
.admin_list_item.processing .notice_processing,
.admin_list_item.success .notice_success {
  display: block
}

.restricted_info {
  margin: 3rem auto
}

.account_type {
  margin: 0 auto 2rem;
  max-width: 370px;
  display: flex
}

.guest_account_icon,
.restricted_account_icon {
  background-image: url(/66f9/img/icn_guest-restricted.png);
  width: 70px;
  height: 70px;
  margin: .15rem 1rem 1rem 0;
  flex: none
}

.guest_account_icon {
  background-image: url(/66f9/img/icn_guest-single.png)
}

.account_type_copy {
  flex: 1
}

.admin_banner {
  margin: 3rem auto 2rem;
  padding: 2rem;
  text-align: center
}

.restriction_option {
  font-size: 1.3rem;
  line-height: 2rem;
  font-weight: 900;
  display: block;
  color: #555459;
  padding: .5rem;
  border-radius: .25rem;
  width: 100%;
  text-align: left;
  margin: 0 auto 1rem;
  background: #fbfaf8
}

.restriction_option:hover {
  background: #F0F7FB;
  text-decoration: none
}

.restriction_option:hover .ts_icon_arrow_right {
  color: #005E99
}

.restriction_option i {
  font-size: 1.1rem;
  margin: 0 .5rem
}

.restriction_option .presence {
  margin-top: -5px;
  display: block;
  float: left;
  margin-left: 2px;
  margin-right: 24px
}

.restriction_option .presence:before {
  font-size: 25px
}

.restriction_option .ts_icon_arrow_right {
  float: right;
  line-height: 2rem;
  color: #007AB8
}

@media only screen and (max-width:767px) {
  .admin_action_bar {
    padding: 1rem 0 0;
    border-bottom: none
  }
  .admin_list_item {
    padding-left: 3rem
  }
  .restricted_header {
    margin-left: 0
  }
  .admin_list_item .admin_member_type {
    position: relative;
    top: 0;
    right: 0;
    display: block
  }
  .admin_list_item .admin_member_caret {
    top: .7rem;
    right: .5rem
  }
  .admin_list_item .btn_outline {
    margin-bottom: .5rem;
    margin-right: .25rem
  }
  .admin_list_item .notice_success {
    position: relative;
    padding-right: 3.2rem
  }
  .admin_list_item .notice_dismiss {
    float: none;
    position: absolute;
    top: .25rem;
    right: 0
  }
  .admin_list_item input[name=first_name],
  .admin_list_item input[name=last_name] {
    width: 6.5rem;
    display: inline;
    line-height: 1.5rem;
    font-size: 1rem
  }
  .admin_list_item .mini {
    display: none
  }
}

.admin_action_bar {
  height: auto;
  padding-left: 2rem;
  padding-right: 2rem;
  clear: both;
  display: flex;
  align-items: center;
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -moz-justify-content: space-between;
  justify-content: space-between
}

#admin_sort {
  width: auto
}

.list_item_container.is_last_item .admin_list_item,
:not(.list_item_container)>.admin_list_item:last-child {
  border-bottom: none
}

.invite_form_column {
  padding-left: 3rem;
  background-image: url(/66f9/img/admin_invite_divider.png);
  background-repeat: no-repeat;
  background-position: 0 -15px
}

.name_fields {
  display: flex;
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -moz-justify-content: space-between;
  justify-content: space-between
}

.name_fields input {
  width: auto
}

.admin_banner {
  background: 0 0;
  border: none
}

@media only screen and (max-width:767px) {
  #page_contents .admin_action_bar {
    padding: 1rem .5rem;
    border-bottom: none
  }
  #page_contents .invite_form_column {
    padding-left: 0;
    background-image: none
  }
  .admin_list_item.expanded .sub_actions {
    float: left
  }
}

.admin_list_item.invite_item.active {
  display: flex;
  flex-direction: column;
  min-height: 3.25rem;
  position: relative
}

.admin_list_item_invite_info {
  display: flex;
  flex-grow: 1
}

.admin_list_item_name_email {
  flex-grow: 1;
  max-width: 600px
}

.admin_invite_sent_date {
  position: relative;
  right: auto;
  top: auto;
  flex-grow: 2;
  min-width: 200px;
  max-width: 400px;
  padding-left: 2rem;
  font-size: 15px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis
}

.admin_list_item.invite_item.bouncing {
  background: #FFFCE0
}

.admin_list_item.invite_item.bouncing .email {
  color: #CB5234
}

.admin_list_item.invite_item.pending {
  padding-left: .5rem;
  padding-right: .5rem
}

.admin_list_item.invite_item.pending .admin_member_caret {
  top: .45rem
}

.admin_list_item.invite_item.pending .admin_invite_sent_date {
  padding-right: 1.75rem
}

@media only screen and (max-width:767px) {
  .admin_list_item.invite_item.active,
  .admin_list_item_invite_info {
    display: block
  }
  .admin_invite_sent_date {
    padding: 0;
    min-width: auto;
    max-width: 100%;
    text-align: left;
    white-space: initial
  }
}

.lazy_filter_select .lfs_token.lfs_token_default_group {
  background-color: #9e9ea6;
  border-color: #9e9ea6
}

.lazy_filter_select .lfs_token.lfs_token_user_group {
  background-color: #2ab27b;
  border-color: #2ab27b
}

#admin_invites_container {
  margin: 0 auto;
  max-width: 600px
}

label[for=enable_calls_checkbox] input[type=checkbox] {
  width: 15px
}

.admin_pref {
  margin: 0 2rem
}

.admin_pref.accordion_section {
  border-bottom: none
}

.admin_pref:not(:first-of-type) {
  border-top: 1px solid #E8E8E8
}

.admin_pref.locked {
  background-color: #F9F9F9;
  padding-bottom: 1rem
}

.admin_pref.locked .accordion_subsection form>:not(.alert),
.admin_pref.locked .accordion_subsection form>:not('.clickable') {
  pointer-events: none;
  opacity: .75
}

.admin_pref.locked,
.admin_pref.locked+.admin_pref:not(.locked) {
  margin: 0;
  padding-left: 2rem;
  padding-right: 2rem
}

.admin_pref.locked .accordion_expand,
.admin_pref.locked+.admin_pref:not(.locked) .accordion_expand {
  right: 2rem
}

@media screen and (max-width:640px) {
  .admin_pref.locked,
  .admin_pref.locked+.admin_pref:not(.locked) {
    margin: 0;
    padding-left: .8rem;
    padding-right: .8rem
  }
  .admin_pref.locked .accordion_expand,
  .admin_pref.locked+.admin_pref:not(.locked) .accordion_expand {
    right: .8rem
  }
}

.admin_pref .admin_pref_locked_label {
  margin-bottom: .5rem;
  margin-right: 5rem;
  font-size: 15px;
  color: #717274
}

.admin_pref .accordion_expand {
  text-transform: capitalize
}

.admin_pref .accordion_expand[placeholder]::-webkit-input-placeholder {
  text-transform: none
}

.admin_pref .accordion_expand[placeholder]::-moz-placeholder {
  text-transform: none
}

.admin_pref .accordion_expand[placeholder]:-ms-input-placeholder {
  text-transform: none
}

.admin_pref h4 {
  margin-right: 5rem
}

@media screen and (max-width:640px) {
  .admin_pref {
    margin: 0 .8rem
  }
}

[name=workspace_access_type_closed_option_channel] .lazy_filter_select .lfs_item .ts_icon:before {
  line-height: .9rem
}

.admin__team-name-input-label {
  font-size: .9rem;
  min-height: 1.5rem
}
