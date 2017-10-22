@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

html {
  height: 100%
}

body {
  position: relative;
  min-height: 100%
}

footer {
  border-top: 1px solid #e8e8e8;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background: #fff;
  padding: 40px 0 0;
  color: #717274
}

footer section {
  clear: both;
  box-sizing: border-box;
  max-width: 1014px;
  padding: 0 1.5rem!important;
  margin: 0 auto
}

footer section h1 {
  font-size: 30px;
  line-height: 36px;
  font-weight: 400;
  margin: 0
}

footer section p {
  line-height: 26px
}

footer section .grid {
  width: 100%
}

footer section .grid:after,
footer section .grid:before {
  content: " ";
  font-size: 0;
  display: table
}

footer section .grid:after {
  clear: both
}

footer .ts_icon_slack_pillow {
  display: inline-block;
  width: 28px;
  height: 28px;
  color: #a0a0a2;
  margin-left: -3px
}

footer .ts_icon_slack_pillow:hover {
  color: #8c8c94
}

footer .ts_icon_slack_pillow:before {
  font-size: 28px;
  line-height: 48px
}

footer small {
  display: block;
  font-size: 12px;
  line-height: 16px;
  margin: 5px 0 0
}

footer .col {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0)
}

footer .col:focus {
  outline: 0
}

footer ul {
  margin: 0;
  padding: 0;
  list-style-type: none
}

footer ul a,
footer ul a:link,
footer ul a:visited {
  font-size: .82rem;
  color: #717274;
  text-decoration: none
}

footer ul a:hover {
  color: #8c8c94;
  text-decoration: none!important
}

footer ul .cat_1,
footer ul .cat_2,
footer ul .cat_3,
footer ul .cat_4 {
  text-transform: uppercase;
  font-size: 11px;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-weight: 700
}

footer ul .cat_1 {
  color: #ff9000
}

footer ul .cat_2 {
  color: #e32072
}

footer ul .ts_icon_heart:before {
  font-size: 17px;
  margin-left: -2px;
  line-height: 13px
}

footer ul .cat_3 {
  color: #2ea664
}

footer ul .cat_4 {
  color: #4b6bc6
}

footer .footnote {
  margin-top: 1rem;
  background-color: rgba(0, 0, 0, .05);
  overflow: hidden;
  min-height: 50px;
  height: 50px
}

footer .footnote ul {
  margin: 0 20px 0 0;
  padding: 0;
  list-style-type: none;
  float: right
}

footer .footnote ul li {
  display: inline-block;
  list-style: none;
  margin-right: .7rem;
  float: left;
  line-height: 50px
}

footer .footnote ul li.yt {
  line-height: 48px;
  margin-right: 0
}

footer.apps_footer {
  padding: 40px 0
}

footer.apps_footer #apps_footer_content {
  -ms-flex-pack: distribute;
  -webkit-box-pack: distribute;
  -webkit-justify-content: space-around;
  -moz-justify-content: space-around;
  justify-content: space-around;
  max-width: 1024px
}

footer.apps_footer #apps_footer_content a {
  display: inline-block;
  text-decoration: none;
  color: #717274
}

footer.apps_footer #apps_footer_content .slack_twitter {
  padding-left: 1.5rem;
  position: relative
}

footer.apps_footer #apps_footer_content .slack_twitter ts-icon {
  left: 0;
  position: absolute
}

@media only screen and (max-width:768px) {
  footer.apps_footer #apps_footer_content {
    -ms-flex-pack: start;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -moz-justify-content: flex-start;
    justify-content: flex-start;
    padding-top: 0;
    padding-bottom: 6rem!important;
    position: relative
  }
  footer.apps_footer #apps_footer_content .logo_content {
    bottom: 0;
    left: 0;
    position: absolute;
    text-align: center;
    width: 100%
  }
  footer.apps_footer #apps_footer_content a {
    padding-bottom: 1rem;
    padding-top: 1rem;
    width: 50%
  }
}

footer:not(.footer_dark) .footnote .ts_icon_twitter:hover {
  color: #4fa9f1
}

footer:not(.footer_dark) .footnote .ts_icon_youtube:hover {
  color: #d11f10
}

footer.footer_dark {
  background-color: transparent;
  border-top: 1px solid rgba(255, 255, 255, .1)
}

footer.footer_dark .footnote {
  background-color: rgba(255, 255, 255, .12)
}

footer.footer_dark .ts_icon_slack_pillow,
footer.footer_dark a,
footer.footer_dark a:link,
footer.footer_dark a:visited {
  color: rgba(255, 255, 255, .5)
}

footer.footer_dark .ts_icon_slack_pillow:hover,
footer.footer_dark a:hover,
footer.footer_dark a:link:hover,
footer.footer_dark a:visited:hover {
  color: rgba(255, 255, 255, .7)
}

footer.footer_dark .cat_1,
footer.footer_dark .cat_2,
footer.footer_dark .cat_3,
footer.footer_dark .cat_4 {
  color: #fff
}

footer.footer_dark .col:before,
footer.footer_dark.footer_dark_custom .ts_icon_slack_pillow,
footer.footer_dark.footer_dark_custom a,
footer.footer_dark.footer_dark_custom a:link,
footer.footer_dark.footer_dark_custom a:visited {
  color: rgba(255, 255, 255, .7)
}

footer.footer_dark.footer_dark_custom .ts_icon_slack_pillow:hover,
footer.footer_dark.footer_dark_custom a:hover,
footer.footer_dark.footer_dark_custom a:link:hover,
footer.footer_dark.footer_dark_custom a:visited:hover {
  color: #fff
}

@media only screen and (max-width:767px) {
  footer.footer_dark {
    background-color: #000;
    border-top: 0
  }
  footer.footer_dark .links .col {
    border-top: 1px solid rgba(255, 255, 255, .14)
  }
  footer {
    padding: 0!important;
    border-top: 0
  }
  footer li {
    display: none;
    text-indent: 1rem;
    padding: 2px 0
  }
  footer li:first-child {
    text-indent: 0;
    display: block
  }
  footer .links {
    padding: 0!important
  }
  footer .links .col {
    cursor: pointer;
    border-top: 1px solid rgba(0, 0, 0, .09);
    padding: 14px 18px 10px
  }
  footer .links .col:before {
    font-family: Slack;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    display: block;
    content: '\E279';
    position: absolute;
    right: 15px;
    line-height: 32px
  }
  footer .links .col:not(.mobile_col) {
    margin: 0
  }
  footer .links .col:last-child {
    border-bottom: 0
  }
  footer .links .col.open:before {
    content: '\E280'
  }
  footer .links .col.open li {
    display: block
  }
  footer .links .col.open li:first-child {
    margin-bottom: .5rem
  }
  footer .footnote {
    height: 54px;
    margin-top: 0;
    border-top: 1px solid rgba(0, 0, 0, .06)
  }
  footer .footnote .ts_icon_slack_pillow:before {
    line-height: 50px
  }
  footer .footnote ul {
    margin-right: 0
  }
  footer .footnote li {
    text-indent: 0
  }
  footer .footnote section {
    padding: 0 20px!important
  }
}

@media only screen and (max-width:320px) {
  footer .nav_col:not(.mobile_col) {
    width: 100%!important
  }
}
