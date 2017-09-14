@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.btn {
  background: #2ab27b;
  color: #fff;
  line-height: 1.2rem;
  font-weight: 900;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-decoration: none;
  cursor: pointer;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .1);
  border: none;
  border-radius: .25rem;
  box-shadow: none;
  position: relative;
  display: inline-block;
  vertical-align: bottom;
  text-align: center;
  white-space: nowrap;
  margin: 0;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent
}

.btn:after {
  position: absolute;
  content: '';
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: .25rem
}

a.btn {
  color: #fff
}

.no_touch .btn.hover,
.no_touch .btn:focus,
.no_touch .btn:hover {
  outline: 0;
  text-decoration: none
}

.btn.hover,
.btn:focus,
.btn:hover {
  background: #2ab27b;
  color: #fff
}

.btn.hover:after,
.btn:focus:after,
.btn:hover:after {
  box-shadow: inset 0 -2px rgba(0, 0, 0, .25)
}

.btn.active,
.btn:active {
  color: #fff
}

.btn.active:after,
.btn:active:after {
  box-shadow: inset 0 2px 1px rgba(0, 0, 0, .2)
}

.btn_outline {
  background: #FBFBFA;
  color: #555459!important;
  font-weight: 700;
  text-shadow: none
}

.btn_outline:after {
  border: 1px solid #C7CACD
}

.btn_outline.btn_transparent {
  background-color: transparent!important;
  color: rgba(255, 255, 255, .9)!important
}

.btn_outline.btn_transparent:after {
  border: 1px solid rgba(255, 255, 255, .5)
}

.btn_outline.btn_transparent.active,
.btn_outline.btn_transparent.hover,
.btn_outline.btn_transparent:active,
.btn_outline.btn_transparent:focus,
.btn_outline.btn_transparent:hover {
  color: #0576B9!important;
  background: rgba(255, 255, 255, .9)!important
}

.btn_outline.btn_transparent.active:after,
.btn_outline.btn_transparent.hover:after,
.btn_outline.btn_transparent:active:after,
.btn_outline.btn_transparent:focus:after,
.btn_outline.btn_transparent:hover:after {
  box-shadow: none;
  border-color: transparent
}

.btn_outline.btn_transparent.active,
.btn_outline.btn_transparent:active {
  background-color: rgba(255, 255, 255, .8)!important
}

.btn_outline.hover,
.btn_outline:focus,
.btn_outline:hover {
  background: #fff;
  color: #0576B9!important
}

.btn_outline.hover:after,
.btn_outline:focus:after,
.btn_outline:hover:after {
  box-shadow: none
}

.btn_outline:active {
  color: #0576B9
}

.btn_outline:active:after {
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, .2)
}

.btn_outline.active {
  color: #666!important;
  margin-top: 0;
  font-weight: 900
}

.btn.btn_outline.btn_danger,
.btn.btn_outline.btn_warning {
  background: #FBFBFA!important
}

.btn.btn_outline.btn_danger:focus,
.btn.btn_outline.btn_danger:hover,
.btn.btn_outline.btn_warning:focus,
.btn.btn_outline.btn_warning:hover {
  background: #fff!important
}

.btn.btn_outline.btn_warning:focus,
.btn.btn_outline.btn_warning:hover {
  color: #DFA941!important
}

.btn.btn_outline.btn_warning:focus:after,
.btn.btn_outline.btn_warning:hover:after {
  border-color: #DFA941
}

.btn.btn_outline.btn_danger:focus,
.btn.btn_outline.btn_danger:hover {
  color: #eb4d5c!important
}

.btn.btn_outline.btn_danger:focus:after,
.btn.btn_outline.btn_danger:hover:after {
  border-color: #eb4d5c
}

.btn.btn_outline.disabled,
.btn.btn_outline.disabled:hover {
  color: #717274!important;
  background: #fff!important
}

.btn_unstyle {
  background: 0 0;
  border: none;
  padding: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: 0
}

.btn_basic {
  background: 0 0;
  border: none;
  padding: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: 0;
  color: inherit
}

.btn_basic:focus,
.btn_basic:hover {
  color: #005E99
}

.btn_link {
  background: 0 0;
  border: none;
  padding: 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: 0;
  color: #0576B9;
  vertical-align: baseline;
  cursor: pointer
}

.btn_link:focus,
.btn_link:hover {
  color: #005E99;
  text-decoration: underline
}

.btn.btn_border {
  background: 0 0;
  border: 2px solid #fff
}

.btn.btn_border:after {
  box-shadow: none
}

.btn.disabled,
.btn.disabled:active,
.btn.disabled:hover,
.btn:disabled,
.btn:disabled:active,
.btn:disabled:hover {
  background-color: #717274!important;
  color: #fff;
  opacity: .35;
  -moz-opacity: .35;
  -khtml-opacity: .35;
  box-shadow: none!important;
  pointer-events: none
}

.btn {
  padding: 8px 14px 9px;
  font-size: 15px
}

.btn_small {
  font-size: 14px;
  padding: 5px 10px
}

.btn_small i:before {
  font-size: 15px
}

.btn_large {
  padding: 14px 32px 16px;
  font-size: 20px
}

.btn_extra_large {
  font-size: 1.125rem;
  padding: 1.25rem
}

.btn_expand {
  width: 100%;
  display: block
}

@media only screen and (max-width:640px) {
  .btn_large {
    padding: 14px 20px 16px
  }
  .btn_extra_large {
    padding: .9375rem 2rem
  }
}

.btn_info {
  background: #2D9EE0!important
}

.btn_warning {
  background: #DFA941!important
}

.btn_danger {
  background: #eb4d5c!important
}

.btn_twitter {
  background: #55ACEE!important
}

.btn_facebook {
  background: #3b5998!important
}

.btn_transparent {
  background: rgba(255, 255, 255, .25)!important
}

.btn.btn_success {
  background-color: #56B68B
}

.btn.btn_success.disabled,
.btn.btn_success:disabled {
  background-color: #56B68B!important
}

.btn .ts_icon,
.btn i,
.btn ts-icon {
  margin-right: .25rem
}

.btn .ts_icon:before,
.btn i:before,
.btn ts-icon:before {
  font-size: inherit;
  vertical-align: bottom
}

.btn_large .ts_icon,
.btn_large i,
.btn_large ts-icon {
  margin-right: .5rem;
  font-size: 18px
}

.btn_extra_large .ts_icon,
.btn_extra_large i,
.btn_extra_large ts-icon {
  vertical-align: middle;
  font-size: 1.25rem
}

.btn_with_icon {
  position: relative;
  padding-left: 3rem!important
}

.btn_with_icon .ts_icon,
.btn_with_icon i,
.btn_with_icon ts-icon {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  padding: .5rem .75rem;
  border-right: 1px solid rgba(255, 255, 255, .5);
  background: rgba(0, 0, 0, .2);
  display: inline-block;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: .25rem;
  border-top-left-radius: .25rem;
  background-clip: padding-box;
  font-size: 1.4rem!important;
  line-height: 2.25rem
}

.btn_icon {
  width: 32px;
  height: 30px;
  padding: 0
}

.btn_icon:before {
  display: block
}

.btn.dropdown-toggle .caret {
  border-top-color: #fff
}

.pill_btn {
  border-radius: 2rem;
  padding: 5px 13px 6px;
  font-weight: 600
}

.pill_btn:after {
  border-radius: 2rem
}

.pill_btn .ts_icon,
.pill_btn i,
.pill_btn ts-icon {
  margin-right: .1rem
}

.pill_btn.btn_small {
  padding: 3px 10px
}

.pill_btn.btn_large {
  padding: 14px 32px 16px
}

.pill_btn.btn_large .ts_icon,
.pill_btn.btn_large i,
.pill_btn.btn_large ts-icon {
  margin-right: .4rem
}

.btn.btn_attachment {
  vertical-align: middle;
  background-color: transparent;
  border: 1px solid rgba(160, 160, 162, .5);
  color: #565759;
  max-width: 220px;
  font-size: 13px;
  font-weight: 700;
  height: 30px;
  padding: 0 10px;
  margin: 0 8px 8px 0;
  text-shadow: none
}

.btn.btn_attachment .emoji-outer {
  height: 1rem;
  margin-top: -5px;
  width: 1rem
}

.btn.btn_attachment:focus,
.btn.btn_attachment:hover {
  background-color: #F9F9F9;
  border-color: #A0A0A2
}

.btn.btn_attachment:focus::after,
.btn.btn_attachment:hover::after {
  box-shadow: none
}

.btn.btn_attachment:active {
  background-color: rgba(160, 160, 162, .05);
  border-color: #A0A0A2;
  box-shadow: inset 0 1px 1px 0 rgba(160, 160, 162, .2)
}

.btn.btn_attachment:active::after {
  box-shadow: none!important
}

.btn.btn_attachment:disabled {
  background-color: transparent!important;
  opacity: .4!important
}

.btn.btn_attachment:disabled .emoji-outer {
  opacity: .4
}

.btn.btn_attachment.loading {
  background-color: rgba(160, 160, 162, .05)!important;
  border-color: rgba(160, 160, 162, .5);
  color: rgba(86, 87, 89, .8);
  opacity: 1!important
}

.btn.btn_attachment.btn_primary {
  background-color: transparent!important;
  border-color: rgba(42, 178, 123, .5);
  color: #2ab27b
}

.btn.btn_attachment.btn_primary:focus,
.btn.btn_attachment.btn_primary:hover {
  border-color: #2ab27b
}

.btn.btn_attachment.btn_primary:active {
  background-color: rgba(42, 178, 123, .04)!important;
  box-shadow: inset 0 1px 1px 0 rgba(42, 178, 123, .2);
  border-color: #2ab27b
}

.btn.btn_attachment.btn_primary.loading {
  background-color: rgba(42, 178, 123, .04)!important;
  border-color: rgba(42, 178, 123, .5);
  color: rgba(42, 178, 123, .8)
}

.btn.btn_attachment.btn_danger {
  background-color: transparent!important;
  border-color: rgba(235, 77, 92, .5);
  color: #eb4d5c
}

.btn.btn_attachment.btn_danger:focus,
.btn.btn_attachment.btn_danger:hover {
  border-color: #eb4d5c
}

.btn.btn_attachment.btn_danger:active {
  background-color: rgba(235, 77, 92, .02)!important;
  box-shadow: inset 0 1px 1px 0 rgba(235, 77, 92, .2);
  border-color: #eb4d5c
}

.btn.btn_attachment.btn_danger.loading {
  background-color: rgba(235, 77, 92, .02)!important;
  border-color: rgba(235, 77, 92, .5);
  color: rgba(235, 77, 92, .8)
}

.btn_ios,
.btn_ios:focus,
.btn_ios:hover {
  width: 127px;
  height: 38px;
  background-image: url(/66f9/img/ios_app_store_badge.png);
  background-size: 127px 38px
}

.btn_macos,
.btn_macos:focus,
.btn_macos:hover {
  width: 127px;
  height: 38px;
  background-image: url(/ea2d3/img/ios_mac_app_store_badge.png);
  background-size: 127px 38px
}

.btn_ios_large,
.btn_ios_large:focus,
.btn_ios_large:hover {
  width: 175px;
  height: 52px;
  background-image: url(/d1609/img/ios_app_store_badge_large.png);
  background-size: 175px 52px
}

.btn_android,
.btn_android:focus,
.btn_android:hover {
  width: 110px;
  height: 38px;
  background-image: url(/66f9/img/google_play_badge.png);
  background-size: 110px 39px
}

.btn_windows,
.btn_windows:focus,
.btn_windows:hover {
  width: 146px;
  height: 38px;
  background-image: url(/97d7c/img/windows_store_badge.png);
  background-size: 146px 38px
}

.btn_android,
.btn_ios,
.btn_ios_large,
.btn_windows {
  border-radius: 0;
  background-color: transparent;
  border-bottom: 0
}

.btn_android:focus,
.btn_android:hover,
.btn_ios:focus,
.btn_ios:hover,
.btn_ios_large:focus,
.btn_ios_large:hover,
.btn_windows:focus,
.btn_windows:hover {
  background-color: transparent
}

.btn_android:after,
.btn_ios:after,
.btn_ios_large:after,
.btn_windows:after {
  display: none
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  .btn_ios,
  .btn_ios:focus,
  .btn_ios:hover {
    background-image: url(/66f9/img/ios_app_store_badge@2x.png)
  }
  .btn_macos,
  .btn_macos:focus,
  .btn_macos:hover {
    background-image: url(/ea2d3/img/ios_mac_app_store_badge@2x.png)
  }
  .btn_ios_large,
  .btn_ios_large:focus,
  .btn_ios_large:hover {
    background-image: url(/d1609/img/ios_app_store_badge_large@2x.png)
  }
  .btn_android,
  .btn_android:focus,
  .btn_android:hover {
    background-image: url(/66f9/img/google_play_badge@2x.png)
  }
  .btn_windows,
  .btn_windows:focus,
  .btn_windows:hover {
    background-image: url(/97d7c/img/windows_store_badge@2x.png)
  }
}

.link_btn {
  color: currentColor
}

.link_btn,
a.link_btn {
  text-decoration: underline
}

.link_btn:hover {
  filter: brightness(75%)
}

.index .authcode {
  position: relative
}

.index .authcode:before {
  position: absolute;
  left: 14px;
  top: 12px
}

.index .authcode input {
  padding-left: 2.5rem
}

.index .main_image {
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 228px
}

.index .mandatory_blocker {
  background-image: url(/66f9/img/mandatory2FA.png)
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  .index .mandatory_blocker {
    background-image: url(/66f9/img/mandatory2FA@2x.png)
  }
}

.index .slackbot_frowny {
  background-image: url(/76afb/img/slackbot/slackbot_frowny_192.png)
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  .index .slackbot_frowny {
    background-image: url(/76afb/img/slackbot/slackbot_frowny_512.png)
  }
}

@media screen and (min-width:640px) {
  .index .configure_btn {
    padding: 14px 32px 16px;
    font-size: 20px
  }
}

@media only screen and (max-width:480px) {
  .index h1 {
    font-size: 1.5rem;
    margin-left: -.5rem;
    margin-right: -.5rem
  }
}
