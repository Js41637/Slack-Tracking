@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

body {
  font-size: 16px
}

nav .logo {
  background: url(/66f9/img/landing/header_logo_sprite.png) left top no-repeat;
  background-size: 106px 60px;
  height: 30px;
  width: 106px;
  float: left;
  margin: 20px 0 0 1rem
}

nav .logo.electron {
  float: none;
  display: inline-block;
  margin-left: 0;
  position: relative;
  left: 50%;
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  transform: translateX(-50%)
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  nav .logo {
    background-image: url(/66f9/img/landing/header_logo_sprite@2x.png)
  }
}

nav h1 {
  float: left;
  margin: 20px 0 0 20px;
  padding: 0 20px;
  border-left: 1px solid #BABBBF;
  font-size: .96rem;
  line-height: 1.86rem;
  color: #555459
}

nav.top {
  position: fixed;
  top: 0;
  width: 100%;
  height: 70px;
  z-index: 99;
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transition: -webkit-transform 420ms cubic-bezier(.165, .84, .44, 1);
  -moz-transition: -moz-transform 420ms cubic-bezier(.165, .84, .44, 1);
  transition: transform 420ms cubic-bezier(.165, .84, .44, 1)
}

nav.top.side_menu {
  -webkit-transition: -webkit-transform 150ms cubic-bezier(.2, .3, .25, .9);
  -moz-transition: -moz-transform 150ms cubic-bezier(.2, .3, .25, .9);
  transition: transform 150ms cubic-bezier(.2, .3, .25, .9)
}

@media only screen and (max-width:1024px) {
  nav h1 {
    display: none
  }
  nav.top {
    box-shadow: inset 0 1px rgba(0, 0, 0, .2)
  }
}

.scrolled nav.top {
  -webkit-transform: translate3d(0, -70px, 0);
  -moz-transform: translate3d(0, -70px, 0);
  -ms-transform: translate3d(0, -70px, 0);
  transform: translate3d(0, -70px, 0)
}

nav.top h1 {
  border-color: #fff
}

nav.top ul {
  list-style-type: none;
  margin: 0 20px 0 0;
  padding: 0;
  float: right;
  line-height: 70px
}

nav.top ul li {
  display: inline-block
}

nav.top ul .mobile_btn {
  display: none
}

@media only screen and (max-width:768px) {
  nav.top ul li {
    display: none
  }
  nav.top ul .mobile_btn {
    display: inline-block
  }
  nav.top ul .mobile_btn a {
    margin-left: 6px
  }
}

@media screen and (max-width:320px) {
  nav.top ul .sign_in {
    display: none
  }
}

@media only screen and (max-width:353px) {
  nav.top ul .mobile_btn.download_slack a {
    display: none
  }
}

nav.top ul a {
  color: #fff;
  text-decoration: none;
  display: inline-block;
  font-size: 15px;
  font-weight: 700;
  margin-left: 9px;
  position: relative;
  cursor: pointer;
  line-height: 1em;
  padding: 8px 7px 9px;
  border-radius: 5px;
  opacity: .8
}

nav.top ul a.has_icon span {
  line-height: 2.25rem
}

nav.top ul a:hover {
  opacity: 1;
  background: rgba(0, 0, 0, .1)
}

nav.top ul a .team_icon {
  text-shadow: none
}

nav.top ul .btn_sticky {
  display: inline-block;
  padding: 10px 14px 12px;
  line-height: 1em;
  text-decoration: none;
  color: #fff;
  border-radius: 4px;
  font-size: 12pt;
  margin-left: 17px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .75)
}

nav.top ul .btn_sticky:hover {
  box-shadow: inset 0 0 0 2px #fff, 0 1px 1px rgba(0, 0, 0, .1);
  background: 0 0
}

nav.top.fixed {
  -webkit-transform: translate3d(0, -80px, 0);
  -moz-transform: translate3d(0, -80px, 0);
  -ms-transform: translate3d(0, -80px, 0);
  transform: translate3d(0, -80px, 0);
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .1)
}

.scrolled nav.top.fixed {
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0)
}

nav.top.fixed .logo {
  background-position: left bottom
}

nav.top.fixed h1 {
  border-color: rgba(0, 0, 0, .2)
}

nav.top.fixed h1,
nav.top.fixed ul a {
  color: #404B55
}

nav.top.fixed .btn_sticky {
  box-shadow: inset 0 0 0 2px #404B55
}

nav.top.fixed .btn_sticky:hover {
  box-shadow: inset 0 0 0 2px #404B55;
  background: 0 0
}

nav.top.fixed .mobile_btn a {
  color: #48BA87
}

nav.top.fixed .mobile_btn a:hover {
  background: 0 0;
  box-shadow: none
}

nav.top.fixed .mobile_btn a.btn_sticky {
  box-shadow: inset 0 0 0 2px #48BA87
}

nav.top.fixed .mobile_btn a.btn_sticky:hover {
  box-shadow: inset 0 0 0 2px #48BA87;
  background: 0 0
}

nav.top.with_color {
  -webkit-transition: -webkit-transform 0s ease-out;
  -moz-transition: -moz-transform 0s ease-out;
  transition: transform 0s ease-out
}

nav.top.with_color:not(.fixed) {
  box-shadow: none
}

nav.top.with_color .mobile_btn a {
  color: #48BA87
}

nav.top.with_color .mobile_btn a:hover {
  background: 0 0;
  box-shadow: none
}

nav.top.with_color .mobile_btn a.btn_sticky {
  box-shadow: inset 0 0 0 2px #48BA87
}

nav.top.with_color .mobile_btn a.btn_sticky:hover {
  box-shadow: inset 0 0 0 2px #48BA87;
  background: 0 0
}

nav.top.with_color .mobile_btn a.btn_sticky_filled {
  color: #fff;
  background: #48BA87;
  box-shadow: none
}

nav.top.with_color .mobile_btn a.btn_sticky_filled:hover {
  box-shadow: none;
  background: #48BA87
}

nav.top.persistent,
nav.top.with_color {
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .1)
}

nav.top.persistent .logo,
nav.top.with_color .logo {
  background-position: left bottom
}

nav.top.persistent ul a,
nav.top.with_color ul a {
  color: #404B55
}

nav.top.persistent ul a:hover,
nav.top.with_color ul a:hover {
  text-decoration: none
}

nav.top.persistent .btn_sticky,
nav.top.with_color .btn_sticky {
  box-shadow: inset 0 0 0 2px #404B55
}

nav.top.persistent .btn_sticky:hover,
nav.top.with_color .btn_sticky:hover {
  box-shadow: inset 0 0 0 2px #404B55;
  background: 0 0
}

nav.top.persistent .btn_sticky_filled,
nav.top.with_color .btn_sticky_filled {
  color: #fff;
  background: #48BA87;
  box-shadow: none
}

nav.top.persistent .btn_sticky_filled:hover,
nav.top.with_color .btn_sticky_filled:hover {
  box-shadow: none;
  background: #48BA87
}

nav.top.subdued h1 {
  border-left: 1px solid rgba(255, 255, 255, .4);
  color: #fff
}

nav.top.subdued ul a {
  opacity: .5
}

nav.top.subdued ul a:hover {
  opacity: 1
}

nav.top.subdued ul .btn_sticky {
  opacity: 1;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .25)
}

nav.top.subdued ul .btn_sticky:hover {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .75)
}

nav.top:not(.fixed).inverted {
  background-color: transparent;
  box-shadow: none;
  -webkit-transition: all 180ms;
  -moz-transition: all 180ms;
  transition: all 180ms;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  transform: none
}

nav.top.apps_nav {
  position: relative
}

@media only screen and (max-width:1024px) {
  nav.top.apps_nav {
    position: absolute
  }
}

nav.top.apps_nav.persistent .nav_title {
  border-color: rgba(0, 0, 0, .2)
}

nav.top.apps_nav.persistent.splash {
  box-shadow: none
}

nav.top.apps_nav.clear_nav .logo,
nav.top.apps_nav.clear_nav .nav_title,
nav.top.apps_nav.clear_nav ul li {
  box-shadow: 0 0 20px 10px #4d6dc3;
  background-color: rgba(77, 109, 195, .8)
}

nav.top.apps_nav .nav_title a {
  color: #2C2D30
}

nav.top.apps_nav.clear_nav .nav_title a {
  color: #fff
}

nav.top.apps_nav ul {
  margin-right: 0
}

nav.top.apps_nav ul a.active {
  color: #2C2D30;
  opacity: 1
}

nav.top.apps_nav ul a:hover {
  text-decoration: none
}

nav.top.apps_nav .search_input_container {
  width: 100%;
  min-width: 210px;
  max-width: 300px
}

nav.top.apps_nav .mobile_menu_actions {
  display: none
}

nav.top.apps_nav .mobile_menu_actions ts-icon {
  opacity: .6
}

nav.top.apps_nav .mobile_menu_actions ts-icon:hover {
  opacity: .8;
  cursor: pointer
}

nav.top.apps_nav .mobile_menu_actions ul {
  margin-right: 0
}

nav.top.apps_nav .mobile_menu_actions ul li {
  display: inline-block
}

nav.top.apps_nav #mobile_search {
  display: none;
  visibility: hidden;
  opacity: 0;
  left: 0;
  top: 0
}

nav.top.apps_nav #mobile_search .mobile_search_input {
  outline: 0;
  border: none;
  box-shadow: none
}

nav.top.apps_nav #mobile_search #mobile_search_close {
  opacity: .8
}

nav.top.apps_nav #mobile_search #mobile_search_close:hover {
  opacity: 1;
  cursor: pointer
}

@media only screen and (max-width:768px) {
  nav.top.apps_nav {
    padding-left: 0!important;
    padding-right: 1rem!important
  }
  nav.top.apps_nav .menu_actions,
  nav.top.apps_nav .search_input_container {
    display: none;
    visibility: hidden
  }
  nav.top.apps_nav .mobile_menu_actions {
    display: flex;
    align-items: center
  }
  nav.top.apps_nav #mobile_search {
    display: inherit;
    visibility: visible
  }
}

#ellipsis_menu {
  height: 2.25rem;
  width: 2.25rem;
  text-align: center;
  padding: .625rem 0 0!important
}

#ellipsis_menu .ts_icon {
  vertical-align: sub
}

#menu_items {
  overflow: auto
}

#signup_dropdown {
  display: none;
  top: 80px;
  right: 1.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .5)
}

.scrolled nav.top:not(.inverted) #signup_dropdown {
  top: 150px
}

#signup_dropdown ul {
  max-height: 340px;
  width: 260px;
  margin: .25rem
}

#signup_dropdown li {
  display: block
}

#signup_dropdown li a {
  padding: .25rem;
  margin: 0rem;
  display: block;
  color: #555459;
  border-radius: .25rem;
  font-size: 1rem;
  height: 2.75rem
}

#signup_dropdown li a .switcher_label {
  line-height: 2.25rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 190px;
  display: inline-block;
  font-weight: 700
}

#signup_dropdown li a .active_icon {
  float: right;
  padding: .2rem .7rem
}

#signup_dropdown .divider {
  border-bottom: 1px solid #E8E8E8;
  margin: .25rem
}

#signup_dropdown .ts_icon_slack_pillow {
  padding-top: 2px
}

#signup_dropdown ul li.highlighted a,
#signup_dropdown ul li:hover a {
  background: #F9F9F9;
  color: #555459;
  text-decoration: none;
  text-shadow: none
}

#signup_dropdown.open {
  display: block
}

body.show_mobile_nav {
  overflow: hidden
}

nav.mobile_menu {
  display: none;
  opacity: 0;
  -webkit-transform: translate3d(0, 150%, 0);
  -moz-transform: translate3d(0, 150%, 0);
  -ms-transform: translate3d(0, 150%, 0);
  transform: translate3d(0, 150%, 0);
  -webkit-transition: -webkit-transform 1ms ease 250ms, opacity 250ms cubic-bezier(.165, .84, .44, 1);
  -moz-transition: -moz-transform 1ms ease 250ms, opacity 250ms cubic-bezier(.165, .84, .44, 1);
  transition: transform 1ms ease 250ms, opacity 250ms cubic-bezier(.165, .84, .44, 1);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #492D78;
  z-index: 999
}

nav.mobile_menu ul {
  list-style-type: none;
  margin: 125px 0 0 45px;
  padding: 0;
  -webkit-transform: translate(0, 20px);
  -moz-transform: translate(0, 20px);
  -ms-transform: translate(0, 20px);
  transform: translate(0, 20px);
  opacity: .5;
  -webkit-transition: -webkit-transform 250ms cubic-bezier(.165, .84, .44, 1), opacity 230ms cubic-bezier(.165, .84, .44, 1);
  -moz-transition: -moz-transform 250ms cubic-bezier(.165, .84, .44, 1), opacity 230ms cubic-bezier(.165, .84, .44, 1);
  transition: transform 250ms cubic-bezier(.165, .84, .44, 1), opacity 230ms cubic-bezier(.165, .84, .44, 1)
}

nav.mobile_menu ul a {
  display: block;
  color: #fff;
  text-decoration: none;
  font-size: 40px;
  line-height: 80px
}

@media only screen and (max-height:666px) {
  nav.mobile_menu ul {
    margin-top: 80px
  }
  nav.mobile_menu ul a {
    font-size: 36px;
    line-height: 70px
  }
}

@media only screen and (max-height:567px) {
  nav.mobile_menu ul {
    margin-top: 70px
  }
  nav.mobile_menu ul a {
    font-size: 30px;
    line-height: 60px
  }
}

@media only screen and (max-height:435px) {
  nav.mobile_menu ul {
    margin-top: 70px
  }
  nav.mobile_menu ul a {
    font-size: 24px;
    line-height: 50px
  }
}

nav.mobile_menu .sign_up {
  display: block;
  font-size: 22px;
  font-weight: 900;
  line-height: 70px;
  position: absolute;
  width: 100%;
  height: 70px;
  bottom: 0;
  left: 0;
  text-align: center;
  background: #3E1D56;
  color: #fff;
  text-decoration: none
}

nav.mobile_menu .logo {
  opacity: .25;
  margin-left: 1rem
}

nav.mobile_menu .close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #fff;
  -webkit-transform: rotate(-20deg);
  -moz-transform: rotate(-20deg);
  -ms-transform: rotate(-20deg);
  transform: rotate(-20deg);
  -webkit-transform-origin: center 40%;
  transform-origin: center 40%;
  -webkit-transition: -webkit-transform .2s ease-out;
  -moz-transition: -moz-transform .2s ease-out;
  transition: transform .2s ease-out
}

nav.mobile_menu .close .ts_icon_times:before {
  font-size: 30px
}

body.show_mobile_nav nav.mobile_menu {
  -webkit-transition: opacity 250ms cubic-bezier(.165, .84, .44, 1);
  -moz-transition: opacity 250ms cubic-bezier(.165, .84, .44, 1);
  transition: opacity 250ms cubic-bezier(.165, .84, .44, 1);
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  opacity: .99
}

body.show_mobile_nav nav.mobile_menu ul {
  -webkit-transform: translate(0, 0);
  -moz-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  transform: translate(0, 0);
  opacity: 1
}

body.show_mobile_nav nav.mobile_menu .close {
  -webkit-transform: rotate(0);
  -moz-transform: rotate(0);
  -ms-transform: rotate(0);
  transform: rotate(0)
}

nav.mobile_menu.menu_scroll {
  overflow-y: scroll
}

nav.mobile_menu .mobile_menu_wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -moz-justify-content: space-between;
  justify-content: space-between
}

nav.mobile_menu .mobile_menu_wrapper ul {
  padding: 35px 40px 35px 45px;
  margin: 0
}

nav.mobile_menu .mobile_menu_wrapper ul a {
  font-size: 28px
}

nav.mobile_menu .mobile_menu_wrapper .mobile_menu_header {
  display: block
}

nav.mobile_menu .mobile_menu_wrapper .mobile_menu_footer {
  background: #3E1D56;
  z-index: 10
}

nav.mobile_menu .mobile_menu_wrapper .mobile_menu_footer li {
  width: 100%
}

nav.mobile_menu .mobile_menu_wrapper .mobile_menu_footer li a {
  font-size: 22px;
  line-height: 70px;
  width: 100%;
  height: 70px;
  color: #fff;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden
}

nav.mobile_menu .mobile_menu_wrapper .mobile_menu_footer li a .signup_icon {
  background: #fff;
  color: #3E1D56
}

@media only screen and (max-width:768px) {
  nav.mobile_menu {
    display: block
  }
}

nav.mobile_menu.apps_nav {
  overflow-y: auto
}

nav.mobile_menu.apps_nav .close {
  cursor: pointer
}

nav.mobile_menu.apps_nav .mobile_menu_teams_list_icon {
  background: #fff;
  color: #4D394B;
  display: inline-block;
  height: 36px;
  line-height: 2rem;
  margin-right: .5rem;
  border-radius: 6px;
  text-align: center;
  width: 36px
}

nav.mobile_menu.apps_nav .mobile_menu_footer {
  background: #2b427f
}

@media screen and (max-width:390px) {
  .optional_desktop_nav_message {
    display: none
  }
}
