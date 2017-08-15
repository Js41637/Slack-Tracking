.monkey_scroll_wrapper.debug {
  background: rgba(0, 0, 0, .5)
}

.monkey_scroll_hider {
  overflow: hidden
}

.monkey_scroll_hider.debug {
  overflow: visible!important;
  background: green
}

.monkey_scroll_bar,
.monkey_scroll_bar * {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box
}

.monkey_scroll_bar {
  position: absolute;
  margin-top: 3px;
  margin-bottom: 3px;
  background: #f9f9f9;
  width: 10px;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  -khtml-border-radius: 10px;
  border-radius: 10px
}

.monkey_scroll_bar_native_scrollbar_shim {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 17px;
  background-color: #fff
}

.monkey_scroll_bar.debug {
  background: red
}

.monkey_scroll_handle {
  position: absolute;
  width: 10px
}

.monkey_scroll_handle_inner {
  width: 100%;
  height: 100%;
  background: #d9d9de;
  border: 1px solid #FFF;
  -moz-border-radius: 8px;
  -webkit-border-radius: 8px;
  -khtml-border-radius: 8px;
  border-radius: 8px
}

.monkey_scroll_handle_inner.debug {
  border: 1px solid #000
}

#client-ui .monkey_scroll_bar {
  width: 8px;
  background: #f3f3f3;
  -moz-border-radius: 8px;
  -webkit-border-radius: 8px;
  -khtml-border-radius: 8px;
  border-radius: 8px
}

#client-ui .monkey_scroll_handle {
  width: 14px
}

#client-ui .monkey_scroll_handle_inner {
  border: 3px solid #fff;
  background: #d9d9de;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  -khtml-border-radius: 6px;
  border-radius: 6px;
  -webkit-transition: background .5s;
  -moz-transition: background .5s;
  -ms-transition: background .5s;
  transition: background .5s
}

#monkey_scroll_wrapper_for_channels_scroller .monkey_scroll_bar {
  visibility: hidden;
  background: #453744
}

#monkey_scroll_wrapper_for_channels_scroller .monkey_scroll_handle_inner {
  border: 3px solid #453744;
  background: #937e90
}

#col_channels:hover #monkey_scroll_wrapper_for_channels_scroller .monkey_scroll_bar {
  visibility: visible
}

.monkey_scroller {
  overflow-x: hidden
}

.monkey_scroller::-webkit-scrollbar {
  width: 0;
  height: 0
}

.ladda-button {
  position: relative
}

.ladda-button .ladda-spinner {
  position: absolute;
  z-index: 2;
  display: inline-block;
  width: 32px;
  height: 32px;
  top: 50%;
  margin-top: -16px;
  opacity: 0;
  pointer-events: none
}

.ladda-button .ladda-label {
  position: relative;
  z-index: 3
}

.ladda-button .ladda-progress {
  position: absolute;
  width: 0;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, .2);
  visibility: hidden;
  opacity: 0;
  -webkit-transition: .1s linear padding!important;
  -moz-transition: .1s linear padding!important;
  -ms-transition: .1s linear padding!important;
  -o-transition: .1s linear padding!important;
  transition: .1s linear padding!important
}

.ladda-button[data-loading] .ladda-progress {
  opacity: 1;
  visibility: visible
}

.ladda-button,
.ladda-button .ladda-label,
.ladda-button .ladda-spinner {
  -webkit-transition: .3s cubic-bezier(.175, .885, .32, 1.275) padding!important;
  -moz-transition: .3s cubic-bezier(.175, .885, .32, 1.275) padding!important;
  -ms-transition: .3s cubic-bezier(.175, .885, .32, 1.275) padding!important;
  -o-transition: .3s cubic-bezier(.175, .885, .32, 1.275) padding!important;
  transition: .3s cubic-bezier(.175, .885, .32, 1.275) padding!important
}

.ladda-button[data-style=zoom-in],
.ladda-button[data-style=zoom-in] .ladda-label,
.ladda-button[data-style=zoom-in] .ladda-spinner,
.ladda-button[data-style=zoom-out],
.ladda-button[data-style=zoom-out] .ladda-label,
.ladda-button[data-style=zoom-out] .ladda-spinner {
  -webkit-transition: .3s ease padding!important;
  -moz-transition: .3s ease padding!important;
  -ms-transition: .3s ease padding!important;
  -o-transition: .3s ease padding!important;
  transition: .3s ease padding!important
}

.ladda-button[data-style=expand-right] .ladda-spinner {
  right: 14px
}

.ladda-button[data-style=expand-right][data-size="s"] .ladda-spinner,
.ladda-button[data-style=expand-right][data-size=xs] .ladda-spinner {
  right: 4px
}

.ladda-button[data-style=expand-right][data-loading] {
  padding-right: 56px!important
}

.ladda-button[data-style=expand-right][data-loading] .ladda-spinner {
  opacity: 1
}

.ladda-button[data-style=expand-right][data-loading][data-size="s"],
.ladda-button[data-style=expand-right][data-loading][data-size=xs] {
  padding-right: 40px
}

.ladda-button[data-style=expand-left] .ladda-spinner {
  left: 14px
}

.ladda-button[data-style=expand-left][data-size="s"] .ladda-spinner,
.ladda-button[data-style=expand-left][data-size=xs] .ladda-spinner {
  left: 4px
}

.ladda-button[data-style=expand-left][data-loading] {
  padding-left: 56px
}

.ladda-button[data-style=expand-left][data-loading] .ladda-spinner {
  opacity: 1
}

.ladda-button[data-style=expand-left][data-loading][data-size="s"],
.ladda-button[data-style=expand-left][data-loading][data-size=xs] {
  padding-left: 40px
}

.ladda-button[data-style=expand-up] {
  overflow: hidden
}

.ladda-button[data-style=expand-up] .ladda-spinner {
  top: -32px;
  left: 50%;
  margin-left: -16px
}

.ladda-button[data-style=expand-up][data-loading] {
  padding-top: 54px
}

.ladda-button[data-style=expand-up][data-loading] .ladda-spinner {
  opacity: 1;
  top: 14px;
  margin-top: 0
}

.ladda-button[data-style=expand-up][data-loading][data-size="s"],
.ladda-button[data-style=expand-up][data-loading][data-size=xs] {
  padding-top: 32px
}

.ladda-button[data-style=expand-up][data-loading][data-size="s"] .ladda-spinner,
.ladda-button[data-style=expand-up][data-loading][data-size=xs] .ladda-spinner {
  top: 4px
}

.ladda-button[data-style=expand-down] {
  overflow: hidden
}

.ladda-button[data-style=expand-down] .ladda-spinner {
  top: 62px;
  left: 50%;
  margin-left: -16px
}

.ladda-button[data-style=expand-down][data-size="s"] .ladda-spinner,
.ladda-button[data-style=expand-down][data-size=xs] .ladda-spinner {
  top: 40px
}

.ladda-button[data-style=expand-down][data-loading] {
  padding-bottom: 54px
}

.ladda-button[data-style=expand-down][data-loading] .ladda-spinner {
  opacity: 1
}

.ladda-button[data-style=expand-down][data-loading][data-size="s"],
.ladda-button[data-style=expand-down][data-loading][data-size=xs] {
  padding-bottom: 32px
}

.ladda-button[data-style=slide-left] {
  overflow: hidden
}

.ladda-button[data-style=slide-left] .ladda-label {
  position: relative
}

.ladda-button[data-style=slide-left] .ladda-spinner {
  left: 100%;
  margin-left: -16px
}

.ladda-button[data-style=slide-left][data-loading] .ladda-label {
  opacity: 0;
  left: -100%
}

.ladda-button[data-style=slide-left][data-loading] .ladda-spinner {
  opacity: 1;
  left: 50%
}

.ladda-button[data-style=slide-right] {
  overflow: hidden
}

.ladda-button[data-style=slide-right] .ladda-label {
  position: relative
}

.ladda-button[data-style=slide-right] .ladda-spinner {
  right: 100%;
  margin-left: -16px
}

.ladda-button[data-style=slide-right][data-loading] .ladda-label {
  opacity: 0;
  left: 100%
}

.ladda-button[data-style=slide-right][data-loading] .ladda-spinner {
  opacity: 1;
  left: 50%
}

.ladda-button[data-style=slide-up] {
  overflow: hidden
}

.ladda-button[data-style=slide-up] .ladda-label {
  position: relative
}

.ladda-button[data-style=slide-up] .ladda-spinner {
  left: 50%;
  margin-left: -16px;
  margin-top: 1em
}

.ladda-button[data-style=slide-up][data-loading] .ladda-label {
  opacity: 0;
  top: -1em
}

.ladda-button[data-style=slide-up][data-loading] .ladda-spinner {
  opacity: 1;
  margin-top: -16px
}

.ladda-button[data-style=slide-down] {
  overflow: hidden
}

.ladda-button[data-style=slide-down] .ladda-label {
  position: relative
}

.ladda-button[data-style=slide-down] .ladda-spinner {
  left: 50%;
  margin-left: -16px;
  margin-top: -2em
}

.ladda-button[data-style=slide-down][data-loading] .ladda-label {
  opacity: 0;
  top: 1em
}

.ladda-button[data-style=slide-down][data-loading] .ladda-spinner {
  opacity: 1;
  margin-top: -16px
}

.ladda-button[data-style=zoom-out] {
  overflow: hidden
}

.ladda-button[data-style=zoom-out] .ladda-spinner {
  left: 50%;
  margin-left: -16px;
  -webkit-transform: scale(2.5);
  -moz-transform: scale(2.5);
  -ms-transform: scale(2.5);
  -o-transform: scale(2.5);
  transform: scale(2.5)
}

.ladda-button[data-style=zoom-out] .ladda-label {
  position: relative;
  display: inline-block
}

.ladda-button[data-style=zoom-out][data-loading] .ladda-label {
  opacity: 0;
  -webkit-transform: scale(.5);
  -moz-transform: scale(.5);
  -ms-transform: scale(.5);
  -o-transform: scale(.5);
  transform: scale(.5)
}

.ladda-button[data-style=zoom-out][data-loading] .ladda-spinner {
  opacity: 1;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  -o-transform: none;
  transform: none
}

.ladda-button[data-style=zoom-in] {
  overflow: hidden
}

.ladda-button[data-style=zoom-in] .ladda-spinner {
  left: 50%;
  margin-left: -16px;
  -webkit-transform: scale(.2);
  -moz-transform: scale(.2);
  -ms-transform: scale(.2);
  -o-transform: scale(.2);
  transform: scale(.2)
}

.ladda-button[data-style=zoom-in] .ladda-label {
  position: relative;
  display: inline-block
}

.ladda-button[data-style=zoom-in][data-loading] .ladda-label {
  opacity: 0;
  -webkit-transform: scale(2.2);
  -moz-transform: scale(2.2);
  -ms-transform: scale(2.2);
  -o-transform: scale(2.2);
  transform: scale(2.2)
}

.ladda-button[data-style=zoom-in][data-loading] .ladda-spinner {
  opacity: 1;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  -o-transform: none;
  transform: none
}

.ladda-button[data-style=contract] {
  overflow: hidden;
  width: 100px
}

.ladda-button[data-style=contract] .ladda-spinner {
  left: 50%;
  margin-left: -16px
}

.ladda-button[data-style=contract][data-loading] {
  border-radius: 50%;
  width: 52px
}

.ladda-button[data-style=contract][data-loading] .ladda-label {
  opacity: 0
}

.ladda-button[data-style=contract][data-loading] .ladda-spinner {
  opacity: 1
}

.ladda-button[data-style=contract-overlay] {
  overflow: hidden;
  width: 100px;
  box-shadow: 0 0 0 3000px rgba(0, 0, 0, 0)
}

.ladda-button[data-style=contract-overlay] .ladda-spinner {
  left: 50%;
  margin-left: -16px
}

.ladda-button[data-style=contract-overlay][data-loading] {
  border-radius: 50%;
  width: 52px;
  box-shadow: 0 0 0 3000px rgba(0, 0, 0, .8)
}

.ladda-button[data-style=contract-overlay][data-loading] .ladda-label {
  opacity: 0
}

.ladda-button[data-style=contract-overlay][data-loading] .ladda-spinner {
  opacity: 1
}


/*!
 * Bootstrap v3.2.0 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

.modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1040;
  background-color: #000
}

.modal-backdrop.fade {
  opacity: 0
}

.modal-backdrop,
.modal-backdrop.fade.in {
  opacity: .8;
  filter: alpha(opacity=80)
}

.modal {
  position: fixed;
  top: 10%;
  left: 50%;
  z-index: 1050;
  width: 560px;
  margin-left: -280px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, .3);
  *border: 1px solid #999;
  -webkit-border-radius: 6px;
  -moz-border-radius: 6px;
  outline: 0;
  -webkit-box-shadow: 0 3px 7px rgba(0, 0, 0, .3);
  -moz-box-shadow: 0 3px 7px rgba(0, 0, 0, .3);
  -webkit-background-clip: padding-box;
  -moz-background-clip: padding-box;
  background-clip: padding-box
}

.modal.hide {
  -ms-pointer-events: none;
  -webkit-pointer-events: none;
  pointer-events: none
}

.modal.fade {
  top: -100%;
  -webkit-transition: opacity .15s linear, top .15s ease-out;
  -moz-transition: opacity .15s linear, top .15s ease-out;
  -o-transition: opacity .15s linear, top .15s ease-out;
  transition: opacity .15s linear, top .15s ease-out
}

.modal.fade.in {
  top: 10%;
  -ms-pointer-events: auto;
  -webkit-pointer-events: auto;
  pointer-events: auto
}

.modal-header .close {
  margin-top: 2px
}

.modal-body {
  position: relative;
  max-height: 400px;
  overflow-y: auto
}

.modal-form {
  margin-bottom: 0
}

.modal-footer {
  margin-bottom: 0;
  text-align: right;
  background-color: #f5f5f5;
  -webkit-border-radius: 0 0 6px 6px;
  -moz-border-radius: 0 0 6px 6px;
  border-radius: 0 0 6px 6px;
  *zoom: 1;
  -webkit-box-shadow: inset 0 1px 0 #fff;
  -moz-box-shadow: inset 0 1px 0 #fff
}

.modal-footer:after,
.modal-footer:before {
  display: table;
  line-height: 0;
  content: ""
}

.modal-footer:after {
  clear: both
}

.modal-footer .btn+.btn {
  margin-bottom: 0;
  margin-left: 5px
}

.modal-footer .btn-group .btn+.btn {
  margin-left: -1px
}

.modal-footer .btn-block+.btn-block {
  margin-left: 0
}

.fade {
  opacity: 0;
  -webkit-transition: opacity .1s linear;
  -moz-transition: opacity .1s linear;
  -o-transition: opacity .1s linear;
  transition: opacity .1s linear
}

.fade.in {
  opacity: 1
}

.tooltip {
  position: absolute;
  z-index: 1070;
  display: block;
  visibility: visible;
  font-size: 14px;
  line-height: 1.2rem;
  opacity: 0;
  filter: alpha(opacity=0)
}

.tooltip.in {
  opacity: 1;
  filter: alpha(opacity=1)
}

.tooltip.top {
  margin-top: -3px;
  padding: 8px 0
}

.tooltip.right {
  margin-left: 3px;
  padding: 0 8px
}

.tooltip.bottom {
  margin-top: 3px;
  padding: 8px 0
}

.tooltip.left {
  margin-left: -3px;
  padding: 0 8px
}

.tooltip-inner {
  max-width: 240px;
  padding: 8px 12px;
  color: #fff;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  background-color: #555549;
  border-radius: .25rem
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid
}

.tooltip.top .tooltip-arrow {
  bottom: 0;
  left: 50%;
  margin-left: -8px;
  border-width: 8px 8px 0;
  border-top-color: #555549
}

.tooltip.top-left .tooltip-arrow {
  bottom: 0;
  left: 8px;
  border-width: 8px 8px 0;
  border-top-color: #555549
}

.tooltip.top-right .tooltip-arrow {
  bottom: 0;
  right: 8px;
  border-width: 8px 8px 0;
  border-top-color: #555549
}

.tooltip.right .tooltip-arrow {
  top: 50%;
  left: 0;
  margin-top: -8px;
  border-width: 8px 8px 8px 0;
  border-right-color: #555549
}

.tooltip.left .tooltip-arrow {
  top: 50%;
  right: 0;
  margin-top: -8px;
  border-width: 8px 0 8px 8px;
  border-left-color: #555549
}

.tooltip.bottom .tooltip-arrow {
  top: 0;
  left: 50%;
  margin-left: -8px;
  border-width: 0 8px 8px;
  border-bottom-color: #555549
}

.tooltip.bottom-left .tooltip-arrow {
  top: 0;
  left: 8px;
  border-width: 0 8px 8px;
  border-bottom-color: #555549
}

.tooltip.bottom-right .tooltip-arrow {
  top: 0;
  right: 8px;
  border-width: 0 8px 8px;
  border-bottom-color: #555549
}


/*!
 * Quill Editor v1.2.4
 * https://quilljs.com/
 * Copyright (c) 2014, Jason Chen
 * Copyright (c) 2013, salesforce.com
 */

.ql-container {
  box-sizing: border-box;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 13px;
  height: 100%;
  margin: 0;
  position: relative
}

.ql-container.ql-disabled .ql-tooltip {
  visibility: hidden
}

.ql-container.ql-disabled .ql-editor ul[data-checked]>li::before {
  pointer-events: none
}

.ql-clipboard {
  left: -100000px;
  height: 1px;
  overflow-y: hidden;
  position: absolute
}

.ql-clipboard p {
  margin: 0;
  padding: 0
}

.ql-editor {
  box-sizing: border-box;
  cursor: text;
  height: 100%;
  outline: 0;
  overflow-y: auto;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word
}

.ql-editor blockquote,
.ql-editor h1,
.ql-editor h2,
.ql-editor h3,
.ql-editor h4,
.ql-editor h5,
.ql-editor h6,
.ql-editor ol,
.ql-editor p,
.ql-editor pre,
.ql-editor ul {
  margin: 0;
  padding: 0;
  counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9
}

.ql-editor ol,
.ql-editor ul {
  padding-left: 1.5em
}

.ql-editor ol>li,
.ql-editor ul>li {
  list-style-type: none
}

.ql-editor ul>li::before {
  content: '\2022'
}

.ql-editor ul[data-checked=false],
.ql-editor ul[data-checked=true] {
  pointer-events: none
}

.ql-editor ul[data-checked=false]>li *,
.ql-editor ul[data-checked=true]>li * {
  pointer-events: all
}

.ql-editor ul[data-checked=false]>li::before,
.ql-editor ul[data-checked=true]>li::before {
  color: #777;
  cursor: pointer;
  pointer-events: all
}

.ql-editor ul[data-checked=true]>li::before {
  content: '\2611'
}

.ql-editor ul[data-checked=false]>li::before {
  content: '\2610'
}

.ql-editor li::before {
  display: inline-block;
  margin-right: .3em;
  text-align: right;
  white-space: nowrap;
  width: 1.2em
}

.ql-editor li:not(.ql-direction-rtl)::before {
  margin-left: -1.5em
}

.ql-editor ol li,
.ql-editor ul li {
  padding-left: 1.5em
}

.ql-editor ol li {
  counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
  counter-increment: list-num
}

.ql-editor ol li:before {
  content: counter(list-num, decimal) '. '
}

.ql-editor ol li.ql-indent-1 {
  counter-increment: list-1;
  counter-reset: list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9
}

.ql-editor ol li.ql-indent-1:before {
  content: counter(list-1, lower-alpha) '. '
}

.ql-editor ol li.ql-indent-2 {
  counter-increment: list-2;
  counter-reset: list-3 list-4 list-5 list-6 list-7 list-8 list-9
}

.ql-editor ol li.ql-indent-2:before {
  content: counter(list-2, lower-roman) '. '
}

.ql-editor ol li.ql-indent-3 {
  counter-increment: list-3;
  counter-reset: list-4 list-5 list-6 list-7 list-8 list-9
}

.ql-editor ol li.ql-indent-3:before {
  content: counter(list-3, decimal) '. '
}

.ql-editor ol li.ql-indent-4 {
  counter-increment: list-4;
  counter-reset: list-5 list-6 list-7 list-8 list-9
}

.ql-editor ol li.ql-indent-4:before {
  content: counter(list-4, lower-alpha) '. '
}

.ql-editor ol li.ql-indent-5 {
  counter-increment: list-5;
  counter-reset: list-6 list-7 list-8 list-9
}

.ql-editor ol li.ql-indent-5:before {
  content: counter(list-5, lower-roman) '. '
}

.ql-editor ol li.ql-indent-6 {
  counter-increment: list-6;
  counter-reset: list-7 list-8 list-9
}

.ql-editor ol li.ql-indent-6:before {
  content: counter(list-6, decimal) '. '
}

.ql-editor ol li.ql-indent-7 {
  counter-increment: list-7;
  counter-reset: list-8 list-9
}

.ql-editor ol li.ql-indent-7:before {
  content: counter(list-7, lower-alpha) '. '
}

.ql-editor ol li.ql-indent-8 {
  counter-increment: list-8;
  counter-reset: list-9
}

.ql-editor ol li.ql-indent-8:before {
  content: counter(list-8, lower-roman) '. '
}

.ql-editor ol li.ql-indent-9 {
  counter-increment: list-9
}

.ql-editor ol li.ql-indent-9:before {
  content: counter(list-9, decimal) '. '
}

.ql-editor .ql-indent-1:not(.ql-direction-rtl) {
  padding-left: 3em
}

.ql-editor li.ql-indent-1:not(.ql-direction-rtl) {
  padding-left: 4.5em
}

.ql-editor .ql-indent-1.ql-direction-rtl.ql-align-right {
  padding-right: 3em
}

.ql-editor li.ql-indent-1.ql-direction-rtl.ql-align-right {
  padding-right: 4.5em
}

.ql-editor .ql-indent-2:not(.ql-direction-rtl) {
  padding-left: 6em
}

.ql-editor li.ql-indent-2:not(.ql-direction-rtl) {
  padding-left: 7.5em
}

.ql-editor .ql-indent-2.ql-direction-rtl.ql-align-right {
  padding-right: 6em
}

.ql-editor li.ql-indent-2.ql-direction-rtl.ql-align-right {
  padding-right: 7.5em
}

.ql-editor .ql-indent-3:not(.ql-direction-rtl) {
  padding-left: 9em
}

.ql-editor li.ql-indent-3:not(.ql-direction-rtl) {
  padding-left: 10.5em
}

.ql-editor .ql-indent-3.ql-direction-rtl.ql-align-right {
  padding-right: 9em
}

.ql-editor li.ql-indent-3.ql-direction-rtl.ql-align-right {
  padding-right: 10.5em
}

.ql-editor .ql-indent-4:not(.ql-direction-rtl) {
  padding-left: 12em
}

.ql-editor li.ql-indent-4:not(.ql-direction-rtl) {
  padding-left: 13.5em
}

.ql-editor .ql-indent-4.ql-direction-rtl.ql-align-right {
  padding-right: 12em
}

.ql-editor li.ql-indent-4.ql-direction-rtl.ql-align-right {
  padding-right: 13.5em
}

.ql-editor .ql-indent-5:not(.ql-direction-rtl) {
  padding-left: 15em
}

.ql-editor li.ql-indent-5:not(.ql-direction-rtl) {
  padding-left: 16.5em
}

.ql-editor .ql-indent-5.ql-direction-rtl.ql-align-right {
  padding-right: 15em
}

.ql-editor li.ql-indent-5.ql-direction-rtl.ql-align-right {
  padding-right: 16.5em
}

.ql-editor .ql-indent-6:not(.ql-direction-rtl) {
  padding-left: 18em
}

.ql-editor li.ql-indent-6:not(.ql-direction-rtl) {
  padding-left: 19.5em
}

.ql-editor .ql-indent-6.ql-direction-rtl.ql-align-right {
  padding-right: 18em
}

.ql-editor li.ql-indent-6.ql-direction-rtl.ql-align-right {
  padding-right: 19.5em
}

.ql-editor .ql-indent-7:not(.ql-direction-rtl) {
  padding-left: 21em
}

.ql-editor li.ql-indent-7:not(.ql-direction-rtl) {
  padding-left: 22.5em
}

.ql-editor .ql-indent-7.ql-direction-rtl.ql-align-right {
  padding-right: 21em
}

.ql-editor li.ql-indent-7.ql-direction-rtl.ql-align-right {
  padding-right: 22.5em
}

.ql-editor .ql-indent-8:not(.ql-direction-rtl) {
  padding-left: 24em
}

.ql-editor li.ql-indent-8:not(.ql-direction-rtl) {
  padding-left: 25.5em
}

.ql-editor .ql-indent-8.ql-direction-rtl.ql-align-right {
  padding-right: 24em
}

.ql-editor li.ql-indent-8.ql-direction-rtl.ql-align-right {
  padding-right: 25.5em
}

.ql-editor .ql-indent-9:not(.ql-direction-rtl) {
  padding-left: 27em
}

.ql-editor li.ql-indent-9:not(.ql-direction-rtl) {
  padding-left: 28.5em
}

.ql-editor .ql-indent-9.ql-direction-rtl.ql-align-right {
  padding-right: 27em
}

.ql-editor li.ql-indent-9.ql-direction-rtl.ql-align-right {
  padding-right: 28.5em
}

.ql-editor .ql-video {
  display: block;
  max-width: 100%
}

.ql-editor .ql-video.ql-align-center {
  margin: 0 auto
}

.ql-editor .ql-video.ql-align-right {
  margin: 0 0 0 auto
}

.ql-editor .ql-bg-black {
  background-color: #000
}

.ql-editor .ql-bg-red {
  background-color: #e60000
}

.ql-editor .ql-bg-orange {
  background-color: #f90
}

.ql-editor .ql-bg-yellow {
  background-color: #ff0
}

.ql-editor .ql-bg-green {
  background-color: #008a00
}

.ql-editor .ql-bg-blue {
  background-color: #06c
}

.ql-editor .ql-bg-purple {
  background-color: #93f
}

.ql-editor .ql-color-white {
  color: #fff
}

.ql-editor .ql-color-red {
  color: #e60000
}

.ql-editor .ql-color-orange {
  color: #f90
}

.ql-editor .ql-color-yellow {
  color: #ff0
}

.ql-editor .ql-color-green {
  color: #008a00
}

.ql-editor .ql-color-blue {
  color: #06c
}

.ql-editor .ql-color-purple {
  color: #93f
}

.ql-editor .ql-font-serif {
  font-family: Georgia, Times New Roman, serif
}

.ql-editor .ql-font-monospace {
  font-family: Monaco, Courier New, monospace
}

.ql-editor .ql-size-small {
  font-size: .75em
}

.ql-editor .ql-size-large {
  font-size: 1.5em
}

.ql-editor .ql-size-huge {
  font-size: 2.5em
}

.ql-editor .ql-direction-rtl {
  direction: rtl;
  text-align: inherit
}

.ql-editor .ql-align-center {
  text-align: center
}

.ql-editor .ql-align-justify {
  text-align: justify
}

.ql-editor .ql-align-right {
  text-align: right
}

.ql-editor.ql-blank::before {
  color: rgba(0, 0, 0, .6);
  content: attr(data-placeholder);
  font-style: italic;
  pointer-events: none;
  position: absolute
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

@font-face {
  font-family: Slack;
  src: url(/a425/fonts/slack-icons-Regular.woff2) format('woff2'), url(/a425/fonts/slack-icons-Regular.woff) format('woff');
  font-style: normal;
  font-weight: 400
}

.ts_icon:before,
ts-icon:before {
  font-family: Slack;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  display: inline-block
}

.ts_icon.ts_icon_inherit:before,
ts-icon.ts_icon_inherit:before {
  font-size: inherit
}

.ts_icon.ts_icon_align_bottom:before,
ts-icon.ts_icon_align_bottom:before {
  vertical-align: bottom
}

h1 .ts_icon:not(.ts_icon_base_size):before,
h1 ts-icon:not(.ts_icon_base_size):before,
h2 .ts_icon:not(.ts_icon_base_size):before,
h2 ts-icon:not(.ts_icon_base_size):before,
h3 .ts_icon:not(.ts_icon_base_size):before,
h3 ts-icon:not(.ts_icon_base_size):before {
  font-size: inherit
}

.ts_icon_spin {
  -webkit-animation: 1s linear 0s infinite normal none spin;
  -moz-animation: 1s linear 0s infinite normal none spin;
  -o-animation: 1s linear 0s infinite normal none spin;
  animation: 1s linear 0s infinite normal none spin
}

.ts_icon_spin.ts_icon_spinner,
svg.ts_icon_spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin: 0 .125em;
  -webkit-animation: 1s linear 0s infinite normal none spin;
  -moz-animation: 1s linear 0s infinite normal none spin;
  -o-animation: 1s linear 0s infinite normal none spin;
  animation: 1s linear 0s infinite normal none spin
}

.ts_icon_spin.ts_icon_spinner:before,
svg.ts_icon_spinner:before {
  display: none
}

.ts_icon_spin.ts_icon_spinner.ts_icon_inherit,
svg.ts_icon_spinner.ts_icon_inherit {
  width: .75em;
  height: .75em
}

.ts_icon_spin.ts_icon_spinner:empty,
svg.ts_icon_spinner:empty {
  background: url(/b2b1/img/starburst.svg);
  background-size: 100% auto
}

.ts_icon_spin.ts_icon_spinner,
.ts_icon_spin.ts_icon_spinner svg,
.ts_icon_spin.ts_icon_spinner svg *,
svg.ts_icon_spinner,
svg.ts_icon_spinner svg,
svg.ts_icon_spinner svg * {
  fill: currentColor;
  color: inherit;
  vertical-align: baseline
}

.ts_icon_spin.ts_icon_spinner svg,
svg.ts_icon_spinner svg {
  width: 100%;
  height: 100%
}

.ts_icon_star_o:before {
  content: '\E001'
}

.ts_icon_unstar_o:before {
  content: '\E002'
}

.ts_icon_user:before {
  content: '\E003'
}

.ts_icon_comment_alt:before {
  content: '\E004'
}

.ts_icon_comment_o:before {
  content: '\E005'
}

.ts_icon_home:before {
  content: '\E006'
}

.ts_icon_info:before {
  content: '\E007'
}

.ts_icon_channel_info:before,
.ts_icon_info_circle:before {
  content: '\E008'
}

.ts_icon_mentions:before {
  content: '\E009'
}

.ts_icon_search:before {
  content: '\E010'
}

.ts_icon_bolt:before {
  content: '\E011'
}

.ts_icon_mobile:before {
  content: '\E012'
}

.ts_icon_tablet:before {
  content: '\E013'
}

.ts_icon_laptop:before {
  content: '\E014'
}

.ts_icon_bell_o:before {
  content: '\E015'
}

.ts_icon_bell_slash:before {
  content: '\E016'
}

.ts_icon_team_directory:before {
  content: '\E017'
}

.ts_icon_cloud_upload:before {
  content: '\E018'
}

.ts_icon_cloud_download:before {
  content: '\E019'
}

.ts_icon_cog_o:before {
  content: '\E020'
}

.ts_icon_cogs:before {
  content: '\E021'
}

.ts_icon_key:before {
  content: '\E022'
}

.ts_icon_calendar:before {
  content: '\E023'
}

.ts_icon_pencil:before {
  content: '\E024'
}

.ts_icon_lightbulb_o:before {
  content: '\E025'
}

.ts_icon_magic:before {
  content: '\E026'
}

.ts_icon_external_link:before {
  content: '\E027'
}

.ts_icon_external_link_square:before {
  content: '\E028'
}

.ts_icon_lock_o:before {
  content: '\E029'
}

.ts_icon_unlock:before {
  content: '\E030'
}

.ts_icon_folder:before {
  content: '\E031'
}

.ts_icon_folder_open:before {
  content: '\E032'
}

.ts_icon_archive:before {
  content: '\E033'
}

.ts_icon_inbox:before {
  content: '\E034'
}

.ts_icon_sitemap:before {
  content: '\E035'
}

.ts_icon_book:before {
  content: '\E036'
}

.ts_icon_envelope_o:before {
  content: '\E037'
}

.ts_icon_image:before {
  content: '\E038'
}

.ts_icon_building:before {
  content: '\E039'
}

.ts_icon_plug:before {
  content: '\E040'
}

.ts_icon_paper_plane:before {
  content: '\E041'
}

.ts_icon_credit_card:before {
  content: '\E042'
}

.ts_icon_life_ring:before {
  content: '\E043'
}

.ts_icon_thumb_tack:before {
  content: '\E044'
}

.ts_icon_thumb_tack_filled:before {
  content: '\E547'
}

.ts_icon_trash:before {
  content: '\E045'
}

.ts_icon_print:before {
  content: '\E046'
}

.ts_icon_quote_o:before {
  content: '\E047'
}

.ts_icon_th_large:before {
  content: '\E048'
}

.ts_icon_eye:before {
  content: '\E049'
}

.ts_icon_eye_closed:before {
  content: '\E050'
}

.ts_icon_volume_off:before {
  content: '\E051'
}

.ts_icon_volume_down:before {
  content: '\E052'
}

.ts_icon_volume_medium:before {
  content: '\E053'
}

.ts_icon_volume_up:before {
  content: '\E054'
}

.ts_icon_volume_off_alt:before {
  content: '\E055'
}

.ts_icon_heart_o:before {
  content: '\E056'
}

.ts_icon_wrench:before {
  content: '\E057'
}

.ts_icon_file:before {
  content: '\E058'
}

.ts_icon_all_files:before {
  content: '\E059'
}

.ts_icon_your_files:before {
  content: '\E060'
}

.ts_icon_align_left:before {
  content: '\E061'
}

.ts_icon_align_center:before {
  content: '\E062'
}

.ts_icon_align_right:before {
  content: '\E063'
}

.ts_icon_align_justify:before {
  content: '\E064'
}

.ts_icon_paragraph:before {
  content: '\E065'
}

.ts_icon_code:before {
  content: '\E066'
}

.ts_icon_ellipsis:before {
  content: '\E067'
}

.ts_icon_ellipsis_baseline:before {
  content: '\E068'
}

.ts_icon_spinner:before {
  content: '\E069'
}

.ts_icon_spiral:before {
  content: '\E070'
}

.ts_icon_random:before {
  content: '\E071'
}

.ts_icon_repeat:before {
  content: '\E072'
}

.ts_icon_share_square_o:before {
  content: '\E073'
}

.ts_icon_link:before {
  content: '\E074'
}

.ts_icon_undo:before {
  content: '\E075'
}

.ts_icon_history:before {
  content: '\E076'
}

.ts_icon_hourglass_empty:before {
  content: '\E077'
}

.ts_icon_hourglass:before {
  content: '\E078'
}

.ts_icon_clock_o:before {
  content: '\E079'
}

.ts_icon_dashboard:before {
  content: '\E080'
}

.ts_icon_power_off:before {
  content: '\E081'
}

.ts_icon_sign_in:before {
  content: '\E082'
}

.ts_icon_sign_out:before {
  content: '\E083'
}

.ts_icon_jump:before {
  content: '\E084'
}

.ts_icon_globe:before {
  content: '\E085'
}

.ts_icon_filter:before {
  content: '\E086'
}

.ts_icon_microphone:before {
  content: '\E087'
}

.ts_icon_microphone_slash:before {
  content: '\E088'
}

.ts_icon_paperclip:before {
  content: '\E089'
}

.ts_icon_video_camera:before {
  content: '\E090'
}

.ts_icon_stop_video:before {
  content: '\E091'
}

.ts_icon_phone:before {
  content: '\E092'
}

.ts_icon_end_call:before {
  content: '\E093'
}

.ts_icon_smile_o:before {
  content: '\E094'
}

.ts_icon_share_screen:before {
  content: '\E095'
}

.ts_icon_stop_screen_sharing:before {
  content: '\E096'
}

.ts_icon_stop_screen_sharing_alt:before {
  content: '\E097'
}

.ts_icon_feedback:before {
  content: '\E098'
}

.ts_icon_paper_plane_alt:before {
  content: '\E099'
}

.ts_icon_share:before {
  content: '\E100'
}

.ts_icon_save:before {
  content: '\E101'
}

.ts_icon_message_notification:before {
  content: '\E102'
}

.ts_icon_list:before {
  content: '\E103'
}

.ts_icon_channel:before {
  content: '\E104'
}

.ts_icon_share_other_alt:before {
  content: '\E105'
}

.ts_icon_broadcast:before {
  content: '\E106'
}

.ts_icon_all_files_alt:before {
  content: '\E107'
}

.ts_icon_search_files:before {
  content: '\E108'
}

.ts_icon_add_user:before {
  content: '\E109'
}

.ts_icon_switch_team:before {
  content: '\E110'
}

.ts_icon_create_snippet:before {
  content: '\E111'
}

.ts_icon_create_post:before {
  content: '\E112'
}

.ts_icon_upload:before {
  content: '\E113'
}

.ts_icon_download:before {
  content: '\E114'
}

.ts_icon_share_email:before {
  content: '\E115'
}

.ts_icon_import_email:before {
  content: '\E116'
}

.ts_icon_ellipsis_o:before {
  content: '\E117'
}

.ts_icon_add_reaction:before {
  content: '\E118'
}

.ts_icon_happy_smile:before {
  content: '\E119'
}

.ts_icon_mark_unread:before {
  content: '\E120'
}

.ts_icon_camera:before {
  content: '\E121'
}

.ts_icon_phone_flat:before {
  content: '\E122'
}

.ts_icon_sparkles:before {
  content: '\E123'
}

.ts_icon_location_pin:before {
  content: '\E124'
}

.ts_icon_channel_pane_hash:before {
  content: '\E125'
}

.ts_icon_emoji_nature:before {
  content: '\E126'
}

.ts_icon_emoji_food:before {
  content: '\E127'
}

.ts_icon_emoji_celebration:before {
  content: '\E128'
}

.ts_icon_emoji_activities:before {
  content: '\E129'
}

.ts_icon_emoji_travel:before {
  content: '\E130'
}

.ts_icon_emoji_objects:before {
  content: '\E131'
}

.ts_icon_file_gdrive:before {
  content: '\E133'
}

.ts_icon_play:before {
  content: '\E134'
}

.ts_icon_stream:before {
  content: '\E135'
}

.ts_icon_field_text:before {
  content: '\E136'
}

.ts_icon_poo:before {
  content: '\E137'
}

.ts_icon_channel_list:before {
  content: '\E138'
}

.ts_icon_share_android:before {
  content: '\E139'
}

.ts_icon_highlight:before {
  content: '\E140'
}

.ts_icon_flag:before {
  content: '\E141'
}

.ts_icon_grabby_patty:before {
  content: '\E142'
}

.ts_icon_backspace:before {
  content: '\E143'
}

.ts_icon_android_keyboard:before {
  content: '\E144'
}

.ts_icon_side_panel:before {
  content: '\E145'
}

.ts_icon_search_small:before {
  content: '\E146'
}

.ts_icon_reload_small:before {
  content: '\E147'
}

.ts_icon_vertical_ellipsis:before {
  content: '\E148'
}

.ts_icon_disable:before {
  content: '\E149'
}

.ts_icon_bold_hash_small:before {
  content: '\E150'
}

.ts_icon_cart:before {
  content: '\E151'
}

.ts_icon_snooze_outline:before {
  content: '\E152'
}

.ts_icon_new_window:before {
  content: '\E153'
}

.ts_icon_h1:before {
  content: '\E154'
}

.ts_icon_h2:before {
  content: '\E155'
}

.ts_icon_h3:before {
  content: '\E156'
}

.ts_icon_bullet_list:before {
  content: '\E157'
}

.ts_icon_numbered_list:before {
  content: '\E158'
}

.ts_icon_text_format_menu:before {
  content: '\E159'
}

.ts_icon_bold:before {
  content: '\E160'
}

.ts_icon_italic:before {
  content: '\E161'
}

.ts_icon_underline:before {
  content: '\E162'
}

.ts_icon_strikethrough:before {
  content: '\E163'
}

.ts_icon_tag:before {
  content: '\E164'
}

.ts_icon_org_shared_channel:before {
  content: '\E165'
}

.ts_icon_shared_channel:before {
  content: '\E166'
}

.ts_icon_external_channel:before {
  content: '\E167'
}

.ts_icon_small_reaction:before {
  content: '\E170'
}

.ts_icon_small_reply:before {
  content: '\E171'
}

.ts_icon_small_ellipsis:before {
  content: '\E172'
}

.ts_icon_small_star:before {
  content: '\E173'
}

.ts_icon_small_quote:before {
  content: '\E174'
}

.ts_icon_keyboard:before {
  content: '\E175'
}

.ts_icon_share_action:before {
  content: '\E176'
}

.ts_icon_handset:before {
  content: '\E177'
}

.ts_icon_bluetooth_sound:before {
  content: '\E178'
}

.ts_icon_bluetooth:before {
  content: '\E179'
}

.ts_icon_bot:before {
  content: '\E180'
}

.ts_icon_globe_plus:before {
  content: '\E181'
}

.ts_icon_user_groups:before {
  content: '\E182'
}

.ts_icon_frowning_face:before {
  content: '\E183'
}

.ts_icon_mobile_notification:before {
  content: '\E184'
}

.ts_icon_desktop_notification:before {
  content: '\E185'
}

.ts_icon_collab_screenshare_on:before {
  content: '\E186'
}

.ts_icon_collab_screenshare_off:before {
  content: '\E187'
}

.ts_icon_thumbs_up:before {
  content: '\E188'
}

.ts_icon_thumbs_down:before {
  content: '\E189'
}

.ts_icon_expand:before {
  content: '\E200'
}

.ts_icon_reduce:before {
  content: '\E201'
}

.ts_icon_arrows_alt:before {
  content: '\E202'
}

.ts_icon_reduce_alt:before {
  content: '\E203'
}

.ts_icon_check_square_o:before {
  content: '\E204'
}

.ts_icon_check_circle_o:before {
  content: '\E205'
}

.ts_icon_check_circle_o_large:before {
  content: '\E206'
}

.ts_icon_question:before {
  content: '\E207'
}

.ts_icon_exclamation:before {
  content: '\E208'
}

.ts_icon_warning:before {
  content: '\E209'
}

.ts_icon_exclamation_circle:before {
  content: '\E210'
}

.ts_icon_question_circle:before {
  content: '\E211'
}

.ts_icon_plus_circle:before {
  content: '\E212'
}

.ts_icon_minus_circle:before {
  content: '\E213'
}

.ts_icon_times_circle:before {
  content: '\E214'
}

.ts_icon_square_warning:before {
  content: '\E230'
}

.ts_icon_square_question:before {
  content: '\E231'
}

.ts_icon_plus_square_o:before {
  content: '\E232'
}

.ts_icon_minus_square_o:before {
  content: '\E233'
}

.ts_icon_square_times:before {
  content: '\E234'
}

.ts_icon_times:before {
  content: '\E278'
}

.ts_icon_plus:before {
  content: '\E279'
}

.ts_icon_minus:before {
  content: '\E280'
}

.ts_icon_plus_small:before {
  content: '\E281'
}

.ts_icon_minus_small:before {
  content: '\E282'
}

.ts_icon_exclamation_small:before {
  content: '\E283'
}

.ts_icon_question_small:before {
  content: '\E284'
}

.ts_icon_check_small:before {
  content: '\E285'
}

.ts_icon_times_small:before {
  content: '\E294'
}

.ts_icon_sync:before {
  content: '\E295'
}

.ts_icon_replies:before {
  content: '\E296'
}

.ts_icon_check_small_bold:before {
  content: '\E301'
}

.ts_icon_enter:before {
  content: '\E302'
}

.ts_icon_expand_vertical:before {
  content: '\E303'
}

.ts_icon_collapse_vertical:before {
  content: '\E304'
}

.ts_icon_android_upload:before {
  content: '\E305'
}

.ts_icon_plus_thick:before {
  content: '\E306'
}

.ts_icon_check_large_bold:before {
  content: '\E319'
}

.ts_icon_check_large:before {
  content: '\E320'
}

.ts_icon_calls:before {
  content: '\E478'
}

.ts_icon_calls_small:before {
  content: '\E479'
}

.ts_icon_calls_ended:before {
  content: '\E480'
}

.ts_icon_calls_ended_small:before {
  content: '\E481'
}

.ts_icon_star:before {
  content: '\E500'
}

.ts_icon_unstar:before {
  content: '\E501'
}

.ts_icon_bell:before {
  content: '\E502'
}

.ts_icon_lock:before {
  content: '\E503'
}

.ts_icon_external_link_small:before {
  content: '\E504'
}

.ts_icon_external_link_large:before {
  content: '\E505'
}

.ts_icon_presence_online:before {
  content: '\E506'
}

.ts_icon_presence_offline:before {
  content: '\E507'
}

.ts_icon_presence_dnd:before {
  content: '\E508'
}

.ts_icon_presence_external_online:before,
.ts_icon_presence_ra_online:before,
.ts_icon_restricted_user:before {
  content: '\E509'
}

.ts_icon_presence_external_offline:before,
.ts_icon_presence_ra_offline:before {
  content: '\E510'
}

.ts_icon_presence_external_dnd:before,
.ts_icon_presence_ra_dnd:before {
  content: '\E511'
}

.ts_icon_presence_ura_online:before,
.ts_icon_single_channel_guest:before {
  content: '\E512'
}

.ts_icon_presence_ura_offline:before {
  content: '\E513'
}

.ts_icon_presence_ura_dnd:before {
  content: '\E514'
}

.ts_icon_heart:before {
  content: '\E515'
}

.ts_icon_quote:before {
  content: '\E516'
}

.ts_icon_cog:before {
  content: '\E517'
}

.ts_icon_comment:before {
  content: '\E518'
}

.ts_icon_minus_circle_small:before {
  content: '\E519'
}

.ts_icon_times_circle_small:before {
  content: '\E520'
}

.ts_icon_multiparty_dm_2:before {
  content: '\E521'
}

.ts_icon_multiparty_dm_3:before {
  content: '\E522'
}

.ts_icon_multiparty_dm_4:before {
  content: '\E523'
}

.ts_icon_multiparty_dm_5:before {
  content: '\E524'
}

.ts_icon_multiparty_dm_6:before {
  content: '\E525'
}

.ts_icon_multiparty_dm_7:before {
  content: '\E526'
}

.ts_icon_multiparty_dm_8:before {
  content: '\E527'
}

.ts_icon_multiparty_dm_9:before {
  content: '\E528'
}

.ts_icon_poo_filled:before {
  content: '\E529'
}

.ts_icon_circle_fill:before {
  content: '\E530'
}

.ts_icon_flag_filled:before {
  content: '\E531'
}

.ts_icon_refresh_small:before {
  content: '\E532'
}

.ts_icon_snooze_filled:before {
  content: '\E533'
}

.ts_icon_archived_channel:before {
  content: '\E534'
}

.ts_icon_presence_dnd_offline:before {
  content: '\E535'
}

.ts_icon_presence_external_dnd_offline:before,
.ts_icon_presence_ra_dnd_offline:before {
  content: '\E536'
}

.ts_icon_presence_ura_dnd_offline:before {
  content: '\E537'
}

.ts_icon_presence_mobile_dnd:before {
  content: '\E538'
}

.ts_icon_play_filled:before {
  content: '\E539'
}

.ts_icon_broadcast_filled:before {
  content: '\E540'
}

.ts_icon_small_star_filled:before {
  content: '\E541'
}

.ts_icon_small_comment_filled:before {
  content: '\E542'
}

.ts_icon_paperplane_filled:before {
  content: '\E543'
}

.ts_icon_filebg_large_filled:before {
  content: '\E544'
}

.ts_icon_filebg_small_filled:before {
  content: '\E545'
}

.ts_icon_highlight_filled:before {
  content: '\E546'
}

.ts_icon_pin_filled:before {
  content: '\E547'
}

.ts_icon_close_filled:before {
  content: '\E548'
}

.ts_icon_share_filled:before {
  content: '\E549'
}

.ts_icon_pencil_filled:before {
  content: '\E550'
}

.ts_icon_side_panel_filled:before {
  content: '\E551'
}

.ts_icon_add_reaction_filled:before {
  content: '\E552'
}

.ts_icon_mentions_filled:before {
  content: '\E553'
}

.ts_icon_small_reply_filled:before {
  content: '\E554'
}

.ts_icon_user_filled:before {
  content: '\E555'
}

.ts_icon_microphone_on:before {
  content: '\E556'
}

.ts_icon_camera_on:before {
  content: '\E557'
}

.ts_icon_screenshare_on:before {
  content: '\E558'
}

.ts_icon_shared_channels:before {
  content: '\E559'
}

.ts_icon_heart_large_filled:before {
  content: '\E560'
}

.ts_icon_thumbs_up_filled:before {
  content: '\E561'
}

.ts_icon_thumbs_down_filled:before {
  content: '\E562'
}

.ts_icon_slow_network:before {
  content: '\E563'
}

.ts_icon_sparkles_filled:before {
  content: '\E564'
}

.ts_icon_small_warning_filled:before {
  content: '\E565'
}

.ts_icon_deactivated_user:before {
  content: '\E566'
}

.ts_icon_shared_channels_baseline:before {
  content: '\E568'
}

.ts_icon_arrow_right:before {
  content: '\E286'
}

.ts_icon_arrow_left:before {
  content: '\E287'
}

.ts_icon_arrow_up:before {
  content: '\E288'
}

.ts_icon_arrow_down:before {
  content: '\E289'
}

.ts_icon_arrow_right_medium:before {
  content: '\E290'
}

.ts_icon_arrow_left_medium:before {
  content: '\E291'
}

.ts_icon_arrow_up_medium:before {
  content: '\E292'
}

.ts_icon_arrow_down_medium:before {
  content: '\E293'
}

.ts_icon_angle_arrow_down_right_alt:before {
  content: '\E297'
}

.ts_icon_angle_arrow_up_right_alt:before {
  content: '\E298'
}

.ts_icon_angle_arrow_up_left_alt:before {
  content: '\E299'
}

.ts_icon_angle_arrow_down_left_alt:before {
  content: '\E300'
}

.ts_icon_arrow_circle_o_up:before {
  content: '\E215'
}

.ts_icon_arrow_circle_o_down:before {
  content: '\E216'
}

.ts_icon_arrow_circle_o_right:before {
  content: '\E217'
}

.ts_icon_arrow_circle_o_left:before {
  content: '\E218'
}

.ts_icon_chevron_circle_left:before {
  content: '\E219'
}

.ts_icon_chevron_circle_right:before {
  content: '\E220'
}

.ts_icon_chevron_circle_down:before {
  content: '\E221'
}

.ts_icon_chevron_circle_up:before {
  content: '\E222'
}

.ts_icon_plus_circle_small:before {
  content: '\E223'
}

.ts_icon_circle_small:before {
  content: '\E224'
}

.ts_icon_circle_large:before {
  content: '\E225'
}

.ts_icon_plus_circle_medium:before {
  content: '\E228'
}

.ts_icon_times_circle_medium:before {
  content: '\E229'
}

.ts_icon_square_arrow_up:before {
  content: '\E235'
}

.ts_icon_square_arrow_down:before {
  content: '\E236'
}

.ts_icon_square_arrow_right:before {
  content: '\E237'
}

.ts_icon_square_arrow_left:before {
  content: '\E238'
}

.ts_icon_square_chevron_left:before {
  content: '\E239'
}

.ts_icon_square_chevron_right:before {
  content: '\E240'
}

.ts_icon_square_chevron_down:before {
  content: '\E241'
}

.ts_icon_square_chevron_up:before {
  content: '\E242'
}

.ts_icon_chevron_right:before {
  content: '\E250'
}

.ts_icon_chevron_left:before {
  content: '\E251'
}

.ts_icon_chevron_down:before {
  content: '\E252'
}

.ts_icon_chevron_up:before {
  content: '\E253'
}

.ts_icon_chevron_medium_right:before {
  content: '\E254'
}

.ts_icon_chevron_medium_left:before {
  content: '\E255'
}

.ts_icon_chevron_medium_down:before {
  content: '\E256'
}

.ts_icon_chevron_medium_up:before {
  content: '\E257'
}

.ts_icon_chevron_large_right:before {
  content: '\E258'
}

.ts_icon_chevron_large_left:before {
  content: '\E259'
}

.ts_icon_chevron_large_up:before {
  content: '\E260'
}

.ts_icon_chevron_large_down:before {
  content: '\E261'
}

.ts_icon_arrow_large_right:before {
  content: '\E262'
}

.ts_icon_arrow_large_left:before {
  content: '\E263'
}

.ts_icon_arrow_large_up:before {
  content: '\E264'
}

.ts_icon_arrow_large_down:before {
  content: '\E265'
}

.ts_icon_caret_outline_left:before {
  content: '\E266'
}

.ts_icon_caret_outline_right:before {
  content: '\E267'
}

.ts_icon_caret_outline_up:before {
  content: '\E268'
}

.ts_icon_caret_outline_down:before {
  content: '\E269'
}

.ts_icon_caret_up:before {
  content: '\E270'
}

.ts_icon_caret_down:before {
  content: '\E271'
}

.ts_icon_caret_right:before {
  content: '\E272'
}

.ts_icon_caret_left:before {
  content: '\E273'
}

.ts_icon_angle_arrow_down_left:before {
  content: '\E274'
}

.ts_icon_angle_arrow_down_right:before {
  content: '\E275'
}

.ts_icon_angle_arrow_up_right:before {
  content: '\E276'
}

.ts_icon_angle_arrow_up_left:before {
  content: '\E277'
}

.ts_icon_arrow_ne_large:before {
  content: '\E307'
}

.ts_icon_arrow_nw_large:before {
  content: '\E308'
}

.ts_icon_arrow_sw_large:before {
  content: '\E309'
}

.ts_icon_arrow_se_large:before {
  content: '\E310'
}

.ts_icon_arrow_ne_medium:before {
  content: '\E311'
}

.ts_icon_arrow_nw_medium:before {
  content: '\E312'
}

.ts_icon_arrow_sw_medium:before {
  content: '\E313'
}

.ts_icon_arrow_se_medium:before {
  content: '\E314'
}

.ts_icon_arrow_ne_small:before {
  content: '\E315'
}

.ts_icon_arrow_nw_small:before {
  content: '\E316'
}

.ts_icon_arrow_sw_small:before {
  content: '\E317'
}

.ts_icon_arrow_se_small:before {
  content: '\E318'
}

.ts_icon_slack:before {
  content: '\E800'
}

.ts_icon_slack_pillow:before {
  content: '\E801'
}

.ts_icon_apple:before {
  content: '\E802'
}

.ts_icon_android:before {
  content: '\E803'
}

.ts_icon_twitter:before {
  content: '\E804'
}

.ts_icon_github:before {
  content: '\E805'
}

.ts_icon_dropbox:before {
  content: '\E806'
}

.ts_icon_google:before {
  content: '\E807'
}

.ts_icon_windows:before {
  content: '\E808'
}

.ts_icon_youtube:before {
  content: '\E809'
}

.ts_icon_google_drive:before {
  content: '\E810'
}

.ts_icon_skype:before {
  content: '\E811'
}

.ts_icon_rss:before {
  content: '\E812'
}

.ts_icon_facebook:before {
  content: '\E813'
}

.ts_icon_asana:before {
  content: '\E814'
}

.ts_icon_linkedin:before {
  content: '\E815'
}

.ts_icon_tumblr:before {
  content: '\E816'
}

.ts_icon_instagram:before {
  content: '\E817'
}

.ts_icon_google_plus:before {
  content: '\E818'
}

.ts_icon_soundcloud:before {
  content: '\E819'
}

.ts_icon_flickr:before {
  content: '\E820'
}

.ts_icon_pinterest:before {
  content: '\E821'
}

.ts_icon_tripit:before {
  content: '\E822'
}

.ts_icon_hangouts:before {
  content: '\E823'
}

.ts_icon_viber:before {
  content: '\E824'
}

.ts_icon_line:before {
  content: '\E825'
}

.ts_icon_facebook_messenger:before {
  content: '\E826'
}

.ts_icon_1password:before {
  content: '\E827'
}

.ts_icon_box:before {
  content: '\E828'
}

.ts_icon_box_square:before {
  content: '\E829'
}

.ts_icon_google_play:before {
  content: '\E830'
}

.ts_icon_spotify:before {
  content: '\E831'
}

.ts_icon_siriusxm:before {
  content: '\E832'
}

.ts_icon_stitcher:before {
  content: '\E833'
}

.ts_icon_pocket_casts:before {
  content: '\E834'
}

.ts_icon_onedrive:before {
  content: '\E835'
}

.ts_icon_file_generic:before {
  content: '\E400';
  font-size: 50px
}

.ts_icon_file_generic_small:before {
  content: '\E401';
  font-size: 40px
}

.filetype_icon.space.s30:before,
.filetype_icon.space.s48:before,
.ts_icon_file_spaces:before {
  content: '\E402';
  font-size: 50px;
  color: #66C79E
}

.filetype_icon.space.s24:before,
.ts_icon_file_spaces_small:before {
  content: '\E403';
  font-size: 40px;
  color: #66C79E
}

.filetype_icon.bmp.s30:before,
.filetype_icon.bmp.s48:before,
.filetype_icon.eps.s30:before,
.filetype_icon.eps.s48:before,
.filetype_icon.gif.s30:before,
.filetype_icon.gif.s48:before,
.filetype_icon.image.s30:before,
.filetype_icon.image.s48:before,
.filetype_icon.jpeg.s30:before,
.filetype_icon.jpeg.s48:before,
.filetype_icon.jpg.s30:before,
.filetype_icon.jpg.s48:before,
.filetype_icon.pages.s30:before,
.filetype_icon.pages.s48:before,
.filetype_icon.png.s30:before,
.filetype_icon.png.s48:before,
.filetype_icon.svg.s30:before,
.filetype_icon.svg.s48:before,
.filetype_icon.tiff.s30:before,
.filetype_icon.tiff.s48:before,
.ts_icon_file_image:before {
  content: '\E404';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.bmp.s24:before,
.filetype_icon.eps.s24:before,
.filetype_icon.gif.s24:before,
.filetype_icon.image.s24:before,
.filetype_icon.jpeg.s24:before,
.filetype_icon.jpg.s24:before,
.filetype_icon.pages.s24:before,
.filetype_icon.png.s24:before,
.filetype_icon.svg.s24:before,
.filetype_icon.tiff.s24:before,
.ts_icon_file_image_small:before {
  content: '\E405';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.pdf.s30:before,
.filetype_icon.pdf.s48:before,
.ts_icon_file_pdf:before {
  content: '\E406';
  font-size: 50px;
  color: #db4437
}

.filetype_icon.pdf.s24:before,
.ts_icon_file_pdf_small:before {
  content: '\E407';
  font-size: 40px;
  color: #db4437
}

.filetype_icon.audio.s30:before,
.filetype_icon.audio.s48:before,
.filetype_icon.m4a.s30:before,
.filetype_icon.m4a.s48:before,
.filetype_icon.mp3.s30:before,
.filetype_icon.mp3.s48:before,
.filetype_icon.ogg.s30:before,
.filetype_icon.ogg.s48:before,
.filetype_icon.wav.s30:before,
.filetype_icon.wav.s48:before,
.ts_icon_file_audio:before {
  content: '\E408';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.audio.s24:before,
.filetype_icon.m4a.s24:before,
.filetype_icon.mp3.s24:before,
.filetype_icon.ogg.s24:before,
.filetype_icon.wav.s24:before,
.ts_icon_file_audio_small:before {
  content: '\E409';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.avi.s30:before,
.filetype_icon.avi.s48:before,
.filetype_icon.flv.s30:before,
.filetype_icon.flv.s48:before,
.filetype_icon.mov.s30:before,
.filetype_icon.mov.s48:before,
.filetype_icon.mp4.s30:before,
.filetype_icon.mp4.s48:before,
.filetype_icon.video.s30:before,
.filetype_icon.video.s48:before,
.ts_icon_file_video:before {
  content: '\E410';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.avi.s24:before,
.filetype_icon.flv.s24:before,
.filetype_icon.mov.s24:before,
.filetype_icon.mp4.s24:before,
.filetype_icon.video.s24:before,
.ts_icon_file_video_small:before {
  content: '\E411';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.key.s30:before,
.filetype_icon.key.s48:before,
.filetype_icon.keynote.s30:before,
.filetype_icon.keynote.s48:before,
.filetype_icon.presentation.s30:before,
.filetype_icon.presentation.s48:before,
.ts_icon_file_presentation:before {
  content: '\E412';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.key.s24:before,
.filetype_icon.keynote.s24:before,
.filetype_icon.presentation.s24:before,
.ts_icon_file_presentation_small:before {
  content: '\E413';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.email.s30:before,
.filetype_icon.email.s48:before,
.ts_icon_file_email:before {
  content: '\E414';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.email.s24:before,
.ts_icon_file_email_small:before {
  content: '\E415';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.vector.s30:before,
.filetype_icon.vector.s48:before,
.ts_icon_file_vector:before {
  content: '\E416';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.vector.s24:before,
.ts_icon_file_vector_small:before {
  content: '\E417';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.csv.s30:before,
.filetype_icon.csv.s48:before,
.filetype_icon.numbers.s30:before,
.filetype_icon.numbers.s48:before,
.filetype_icon.spreadsheet.s30:before,
.filetype_icon.spreadsheet.s48:before,
.filetype_icon.tsv.s30:before,
.filetype_icon.tsv.s48:before,
.ts_icon_file_spreadsheet:before {
  content: '\E418';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.csv.s24:before,
.filetype_icon.numbers.s24:before,
.filetype_icon.spreadsheet.s24:before,
.filetype_icon.tsv.s24:before,
.ts_icon_file_spreadsheet_small:before {
  content: '\E419';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.iso.s30:before,
.filetype_icon.iso.s48:before,
.ts_icon_file_media_archive:before {
  content: '\E420';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.iso.s24:before,
.ts_icon_file_media_archive_small:before {
  content: '\E421';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.zip.s30:before,
.filetype_icon.zip.s48:before,
.ts_icon_file_archive:before {
  content: '\E422';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.zip.s24:before,
.ts_icon_file_archive_small:before {
  content: '\E423';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.exe.s30:before,
.filetype_icon.exe.s48:before,
.ts_icon_file_executable:before {
  content: '\E424';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.exe.s24:before,
.ts_icon_file_executable_small:before {
  content: '\E425';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.dmg.s30:before,
.filetype_icon.dmg.s48:before,
.ts_icon_file_disk_image:before {
  content: '\E426';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.dmg.s24:before,
.ts_icon_file_disk_image_small:before {
  content: '\E427';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.cad.s30:before,
.filetype_icon.cad.s48:before,
.ts_icon_file_cad:before {
  content: '\E428';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.cad.s24:before,
.ts_icon_file_cad_small:before {
  content: '\E429';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.gfx3d.s30:before,
.filetype_icon.gfx3d.s48:before,
.ts_icon_file_3d_graphic:before {
  content: '\E430';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.gfx3d.s24:before,
.ts_icon_file_3d_graphic_small:before {
  content: '\E431';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.db.s30:before,
.filetype_icon.db.s48:before,
.filetype_icon.sql.s30:before,
.filetype_icon.sql.s48:before,
.ts_icon_file_database:before {
  content: '\E432';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.db.s24:before,
.filetype_icon.sql.s24:before,
.ts_icon_file_database_small:before {
  content: '\E433';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.binary.s30:before,
.filetype_icon.binary.s48:before,
.ts_icon_file_binary:before {
  content: '\E434';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.binary.s24:before,
.ts_icon_file_binary_small:before {
  content: '\E435';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.markdown.s30:before,
.filetype_icon.markdown.s48:before,
.filetype_icon.md.s30:before,
.filetype_icon.md.s48:before,
.ts_icon_file_markdown:before {
  content: '\E436';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.markdown.s24:before,
.filetype_icon.md.s24:before,
.ts_icon_file_markdown_small:before {
  content: '\E437';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.post.s30:before,
.filetype_icon.post.s48:before,
.filetype_icon.rtf.s30:before,
.filetype_icon.rtf.s48:before,
.filetype_icon.text.s30:before,
.filetype_icon.text.s48:before,
.filetype_icon.txt.s30:before,
.filetype_icon.txt.s48:before,
.ts_icon_file_text_post:before {
  content: '\E438';
  font-size: 50px;
  color: #66C79E
}

.filetype_icon.post.s24:before,
.filetype_icon.rtf.s24:before,
.filetype_icon.text.s24:before,
.filetype_icon.txt.s24:before,
.ts_icon_file_text_post_small:before {
  content: '\E439';
  font-size: 40px;
  color: #66C79E
}

.filetype_icon.html.s30:before,
.filetype_icon.html.s48:before,
.ts_icon_file_html:before {
  content: '\E440';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.html.s24:before,
.ts_icon_file_html_small:before {
  content: '\E441';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.c.s30:before,
.filetype_icon.c.s48:before,
.filetype_icon.code.s30:before,
.filetype_icon.code.s48:before,
.filetype_icon.cpp.s30:before,
.filetype_icon.cpp.s48:before,
.filetype_icon.csharp.s30:before,
.filetype_icon.csharp.s48:before,
.filetype_icon.diff.s30:before,
.filetype_icon.diff.s48:before,
.filetype_icon.erb.s30:before,
.filetype_icon.erb.s48:before,
.filetype_icon.erlang.s30:before,
.filetype_icon.erlang.s48:before,
.filetype_icon.java.s30:before,
.filetype_icon.java.s48:before,
.filetype_icon.javascript.s30:before,
.filetype_icon.javascript.s48:before,
.filetype_icon.objc.s30:before,
.filetype_icon.objc.s48:before,
.filetype_icon.perl.s30:before,
.filetype_icon.perl.s48:before,
.filetype_icon.python.s30:before,
.filetype_icon.python.s48:before,
.filetype_icon.rb.s30:before,
.filetype_icon.rb.s48:before,
.filetype_icon.ruby.s30:before,
.filetype_icon.ruby.s48:before,
.filetype_icon.xml.s30:before,
.filetype_icon.xml.s48:before,
.ts_icon_file_code:before {
  content: '\E442';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.c.s24:before,
.filetype_icon.code.s24:before,
.filetype_icon.cpp.s24:before,
.filetype_icon.csharp.s24:before,
.filetype_icon.diff.s24:before,
.filetype_icon.erb.s24:before,
.filetype_icon.erlang.s24:before,
.filetype_icon.java.s24:before,
.filetype_icon.javascript.s24:before,
.filetype_icon.objc.s24:before,
.filetype_icon.perl.s24:before,
.filetype_icon.python.s24:before,
.filetype_icon.rb.s24:before,
.filetype_icon.ruby.s24:before,
.filetype_icon.xml.s24:before,
.ts_icon_file_code_small:before {
  content: '\E443';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.css.s30:before,
.filetype_icon.css.s48:before,
.ts_icon_file_css:before {
  content: '\E444';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.css.s24:before,
.ts_icon_file_css_small:before {
  content: '\E445';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.php.s30:before,
.filetype_icon.php.s48:before,
.ts_icon_file_php:before {
  content: '\E446';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.php.s24:before,
.ts_icon_file_php_small:before {
  content: '\E447';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.snippet.s30:before,
.filetype_icon.snippet.s48:before,
.ts_icon_file_snippet:before {
  content: '\E448';
  font-size: 50px;
  color: #4D394B
}

.filetype_icon.snippet.s24:before,
.ts_icon_file_snippet_small:before {
  content: '\E449';
  font-size: 40px;
  color: #4D394B
}

.filetype_icon.doc.s30:before,
.filetype_icon.doc.s48:before,
.filetype_icon.docx.s30:before,
.filetype_icon.docx.s48:before,
.ts_icon_file_word:before {
  content: '\E450';
  font-size: 50px;
  color: #2C4098
}

.filetype_icon.doc.s24:before,
.filetype_icon.docx.s24:before,
.ts_icon_file_word_small:before {
  content: '\E451';
  font-size: 40px;
  color: #2C4098
}

.filetype_icon.xls.s30:before,
.filetype_icon.xls.s48:before,
.filetype_icon.xlsm.s30:before,
.filetype_icon.xlsm.s48:before,
.filetype_icon.xlsx.s30:before,
.filetype_icon.xlsx.s48:before,
.filetype_icon.xltx.s30:before,
.filetype_icon.xltx.s48:before,
.ts_icon_file_excel:before {
  content: '\E452';
  font-size: 50px;
  color: #377437
}

.filetype_icon.xls.s24:before,
.filetype_icon.xlsm.s24:before,
.filetype_icon.xlsx.s24:before,
.filetype_icon.xltx.s24:before,
.ts_icon_file_excel_small:before {
  content: '\E453';
  font-size: 40px;
  color: #377437
}

.filetype_icon.ppt.s30:before,
.filetype_icon.ppt.s48:before,
.filetype_icon.pptx.s30:before,
.filetype_icon.pptx.s48:before,
.ts_icon_file_powerpoint:before {
  content: '\E454';
  font-size: 50px;
  color: #E05A30
}

.filetype_icon.ppt.s24:before,
.filetype_icon.pptx.s24:before,
.ts_icon_file_powerpoint_small:before {
  content: '\E455';
  font-size: 40px;
  color: #E05A30
}

.filetype_icon.ai.s30:before,
.filetype_icon.ai.s48:before,
.ts_icon_file_illustrator:before {
  content: '\E456';
  font-size: 50px;
  color: #F4993C
}

.filetype_icon.ai.s24:before,
.ts_icon_file_illustrator_small:before {
  content: '\E457';
  font-size: 40px;
  color: #F4993C
}

.filetype_icon.psd.s30:before,
.filetype_icon.psd.s48:before,
.ts_icon_file_photoshop:before {
  content: '\E458';
  font-size: 50px;
  color: #56B6DE
}

.filetype_icon.psd.s24:before,
.ts_icon_file_photoshop_small:before {
  content: '\E459';
  font-size: 40px;
  color: #56B6DE
}

.filetype_icon.indd.s30:before,
.filetype_icon.indd.s48:before,
.ts_icon_file_indesign:before {
  content: '\E460';
  font-size: 50px;
  color: #EB81AB
}

.filetype_icon.indd.s24:before,
.ts_icon_file_indesign_small:before {
  content: '\E461';
  font-size: 40px;
  color: #EB81AB
}

.filetype_icon.fla.s30:before,
.filetype_icon.fla.s48:before,
.ts_icon_file_adobe_flash:before {
  content: '\E462';
  font-size: 50px;
  color: #A72428
}

.filetype_icon.fla.s24:before,
.ts_icon_file_adobe_flash_small:before {
  content: '\E463';
  font-size: 40px;
  color: #A72428
}

.filetype_icon.swf.s30:before,
.filetype_icon.swf.s48:before,
.ts_icon_file_adobe_swf:before {
  content: '\E464';
  font-size: 50px;
  color: #A72428
}

.filetype_icon.swf.s24:before,
.ts_icon_file_adobe_swf_small:before {
  content: '\E465';
  font-size: 40px;
  color: #A72428
}

.filetype_icon.ipa.s30:before,
.filetype_icon.ipa.s48:before,
.ts_icon_file_iphone_app:before {
  content: '\E466';
  font-size: 50px;
  color: #9EA0A7
}

.filetype_icon.ipa.s24:before,
.ts_icon_file_iphone_app_small:before {
  content: '\E467';
  font-size: 40px;
  color: #9EA0A7
}

.filetype_icon.apk.s30:before,
.filetype_icon.apk.s48:before,
.ts_icon_file_android_app:before {
  content: '\E468';
  font-size: 50px;
  color: #A4CA3A
}

.filetype_icon.apk.s24:before,
.ts_icon_file_android_app_small:before {
  content: '\E469';
  font-size: 40px;
  color: #A4CA3A
}

.filetype_icon.dropbox.s30:before,
.filetype_icon.dropbox.s48:before,
.ts_icon_file_dropbox:before {
  content: '\E470';
  font-size: 50px;
  color: #007ee5
}

.filetype_icon.dropbox.s24:before,
.ts_icon_file_dropbox_small:before {
  content: '\E471';
  font-size: 40px;
  color: #007ee5
}

.filetype_icon.gpres.s30:before,
.filetype_icon.gpres.s48:before,
.ts_icon_file_google_presentation:before {
  content: '\E472';
  font-size: 50px;
  color: #f4b400
}

.filetype_icon.gpres.s24:before,
.ts_icon_file_google_presentation_small:before {
  content: '\E473';
  font-size: 40px;
  color: #f4b400
}

.filetype_icon.gsheet.s30:before,
.filetype_icon.gsheet.s48:before,
.ts_icon_file_google_spreadsheet:before {
  content: '\E472';
  font-size: 50px;
  color: #0f9d58
}

.filetype_icon.gsheet.s24:before,
.ts_icon_file_google_spreadsheet_small:before {
  content: '\E473';
  font-size: 40px;
  color: #0f9d58
}

.filetype_icon.gdoc.s30:before,
.filetype_icon.gdoc.s48:before,
.ts_icon_file_google_document:before {
  content: '\E472';
  font-size: 50px;
  color: #4285f4
}

.filetype_icon.gdoc.s24:before,
.ts_icon_file_google_document_small:before {
  content: '\E473';
  font-size: 40px;
  color: #4285f4
}

.filetype_icon.gdraw.s30:before,
.filetype_icon.gdraw.s48:before,
.filetype_icon.gform.s30:before,
.filetype_icon.gform.s48:before,
.ts_icon_file_google_form:before {
  content: '\E472';
  font-size: 50px;
  color: #db4437
}

.filetype_icon.gdraw.s24:before,
.filetype_icon.gform.s24:before,
.ts_icon_file_google_form_small:before {
  content: '\E473';
  font-size: 40px;
  color: #db4437
}

.filetype_icon.qtz.s30:before,
.filetype_icon.qtz.s48:before,
.ts_icon_file_qtz:before {
  content: '\E474';
  font-size: 50px;
  color: #3aa3e3
}

.filetype_icon.qtz.s24:before,
.ts_icon_file_qtz_small:before {
  content: '\E475';
  font-size: 40px;
  color: #3aa3e3
}

.filetype_icon.sketch.s30:before,
.filetype_icon.sketch.s48:before,
.ts_icon_file_sketch:before {
  content: '\E476';
  font-size: 50px;
  color: #F4993C
}

.filetype_icon.sketch.s24:before,
.ts_icon_file_sketch_small:before {
  content: '\E477';
  font-size: 40px;
  color: #F4993C
}

.ts_icon_presence:before {
  content: '\E506'
}

.away>.ts_icon_presence:before {
  content: '\E507'
}

.dnd>.ts_icon_presence:before {
  content: '\E508'
}

.dnd.away>.ts_icon_presence:before {
  content: '\E535'
}

.ts_icon_presence_external:before,
.ts_icon_presence_ra:before {
  content: '\E509'
}

.away>.ts_icon_presence_external:before,
.away>.ts_icon_presence_ra:before {
  content: '\E510'
}

.dnd>.ts_icon_presence_external:before,
.dnd>.ts_icon_presence_ra:before {
  content: '\E511'
}

.dnd.away>.ts_icon_presence_external:before,
.dnd.away>.ts_icon_presence_ra:before {
  content: '\E536'
}

.ts_icon_presence_ura:before {
  content: '\E512'
}

.away>.ts_icon_presence_ura:before {
  content: '\E513'
}

.dnd>.ts_icon_presence_ura:before {
  content: '\E514'
}

.dnd.away>.ts_icon_presence_ura:before {
  content: '\E537'
}

.filetype_icon {
  display: inline-block
}

.filetype_icon:before {
  font-family: Slack;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  display: inline-block
}

.filetype_icon.ts_icon_inherit:before {
  font-size: inherit
}

.filetype_icon.s24 {
  width: 24px;
  height: 32px
}

.filetype_icon.s24:before {
  content: '\E401';
  font-size: 40px;
  margin: 2px 0 0 -8px
}

.filetype_icon.s30,
.filetype_icon.s48 {
  width: 30px;
  height: 38px
}

.filetype_icon.s30:before,
.filetype_icon.s48:before {
  content: '\E400';
  font-size: 50px;
  margin: 4px 0 0 -10px
}

.filetype_icon.rtf.s24:before,
.filetype_icon.rtf.s30:before,
.filetype_icon.rtf.s48:before,
.filetype_icon.text.s24:before,
.filetype_icon.text.s30:before,
.filetype_icon.text.s48:before,
.filetype_icon.txt.s24:before,
.filetype_icon.txt.s30:before,
.filetype_icon.txt.s48:before {
  color: #3aa3e3
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.alert {
  padding: .75rem 1rem .75rem 3rem;
  border: 1px solid #E8E8E8;
  background: #fff;
  color: #555459;
  border-left-width: 5px;
  margin: 0 auto 1rem;
  border-radius: .25rem
}

.alert>i.ts_icon:first-of-type,
.alert>ts-icon:first-of-type {
  margin-right: .5rem;
  margin-left: -2rem;
  width: 1.25rem;
  text-align: center;
  float: left
}

.alert.alert_info {
  border-left-color: #3aa3e3
}

.alert.alert_info>i:first-of-type,
.alert.alert_info>ts-icon:first-of-type {
  color: #3aa3e3
}

.alert.alert_warning {
  border-left-color: #EDB431
}

.alert.alert_warning>i:first-of-type,
.alert.alert_warning>ts-icon:first-of-type {
  color: #EDB431
}

.alert.alert_success {
  border-left-color: #2ab27b
}

.alert.alert_success>i:first-of-type,
.alert.alert_success>ts-icon:first-of-type {
  color: #2ab27b
}

.alert.alert_error {
  border-left-color: #CB5234
}

.alert.alert_error>i:first-of-type,
.alert.alert_error>ts-icon:first-of-type {
  color: #CB5234
}

.alert .btn.float_right {
  margin-top: -2px;
  margin-right: -5px
}

.alert_page {
  position: fixed;
  top: 5rem;
  left: 0;
  right: 0;
  width: 100%;
  padding: .3rem 1rem .4rem;
  background: #2ab27b;
  color: #fff;
  font-weight: 700;
  text-align: center;
  font-size: 1rem;
  line-height: 1.4rem;
  opacity: 1;
  -moz-opacity: 1;
  -khtml-opacity: 1
}

.alert_page i:first-of-type {
  margin-right: .5rem
}

.alert_page a,
.alert_page a:link,
.alert_page a:visited {
  color: #fff;
  font-weight: 900
}

html.no_touch .alert_page a:active,
html.no_touch .alert_page a:hover {
  color: #fff;
  text-decoration: underline
}

.alert_page.fade {
  opacity: 0;
  -moz-opacity: 0;
  -khtml-opacity: 0;
  -webkit-transform: translate(-100%, 0);
  -moz-transform: translate(-100%, 0);
  -ms-transform: translate(-100%, 0);
  transform: translate(-100%, 0);
  -webkit-transition: opacity 2s ease-out 2s;
  -moz-transition: opacity 2s ease-out 2s;
  transition: opacity 2s ease-out 2s;
  -webkit-animation: alert_page_fade 4s ease-out;
  -moz-animation: alert_page_fade 4s ease-out;
  animation: alert_page_fade 4s ease-out
}

@-webkit-keyframes alert_page_fade {
  50%,
  from {
    opacity: 1;
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  99% {
    opacity: 0;
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  to {
    opacity: 0;
    -webkit-transform: translate(-100%, 0);
    -moz-transform: translate(-100%, 0);
    -ms-transform: translate(-100%, 0);
    transform: translate(-100%, 0)
  }
}

@-moz-keyframes alert_page_fade {
  50%,
  from {
    opacity: 1;
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  99% {
    opacity: 0;
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  to {
    opacity: 0;
    -webkit-transform: translate(-100%, 0);
    -moz-transform: translate(-100%, 0);
    -ms-transform: translate(-100%, 0);
    transform: translate(-100%, 0)
  }
}

@keyframes alert_page_fade {
  50%,
  from {
    opacity: 1;
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  99% {
    opacity: 0;
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  to {
    opacity: 0;
    -webkit-transform: translate(-100%, 0);
    -moz-transform: translate(-100%, 0);
    -ms-transform: translate(-100%, 0);
    transform: translate(-100%, 0)
  }
}

.alert_page.alert_warning {
  background: #EDB431
}

.alert_page.alert_error {
  background: #CB5234
}

.alert_page.alert_success {
  background: #2ab27b
}

@media only screen and (max-width:640px) {
  .alert_page {
    top: 4rem
  }
  .alert_page.mega {
    font-size: 1.5rem;
    line-height: 2rem;
    padding: .75rem .5rem
  }
}

@media only screen and (max-height:768px) {
  .alert_page {
    top: 4rem
  }
}

.alert_page.alert_bottom {
  bottom: 0;
  top: auto!important;
  padding: 1.3rem 1rem 1.4rem;
  z-index: 1042
}

.alert_page.toast {
  font-weight: 400
}

.alert_page.toast .toast_actions {
  position: absolute;
  top: .625rem;
  right: .625rem
}

.alert_page.toast .toast_actions .dismiss_toast,
.alert_page.toast .toast_actions .retry_toast {
  padding-left: .625rem;
  cursor: pointer
}

#toast.toast_in .toast:not(.no_slide) {
  -webkit-transform: translate(0, 0);
  -moz-transform: translate(0, 0);
  -ms-transform: translate(0, 0);
  transform: translate(0, 0);
  -webkit-animation: toast_in .2s ease-out;
  -moz-animation: toast_in .2s ease-out;
  animation: toast_in .2s ease-out
}

@-webkit-keyframes toast_in {
  from {
    -webkit-transform: translate(0, 100%);
    -moz-transform: translate(0, 100%);
    -ms-transform: translate(0, 100%);
    transform: translate(0, 100%)
  }
  to {
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
}

@-moz-keyframes toast_in {
  from {
    -webkit-transform: translate(0, 100%);
    -moz-transform: translate(0, 100%);
    -ms-transform: translate(0, 100%);
    transform: translate(0, 100%)
  }
  to {
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
}

@keyframes toast_in {
  from {
    -webkit-transform: translate(0, 100%);
    -moz-transform: translate(0, 100%);
    -ms-transform: translate(0, 100%);
    transform: translate(0, 100%)
  }
  to {
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
}

#toast.toast_out .toast {
  -webkit-transform: translate(0, 100%);
  -moz-transform: translate(0, 100%);
  -ms-transform: translate(0, 100%);
  transform: translate(0, 100%);
  -webkit-animation: toast_out .2s ease-out;
  -moz-animation: toast_out .2s ease-out;
  animation: toast_out .2s ease-out
}

@-webkit-keyframes toast_out {
  from {
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  to {
    -webkit-transform: translate(0, 100%);
    -moz-transform: translate(0, 100%);
    -ms-transform: translate(0, 100%);
    transform: translate(0, 100%)
  }
}

@-moz-keyframes toast_out {
  from {
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  to {
    -webkit-transform: translate(0, 100%);
    -moz-transform: translate(0, 100%);
    -ms-transform: translate(0, 100%);
    transform: translate(0, 100%)
  }
}

@keyframes toast_out {
  from {
    -webkit-transform: translate(0, 0);
    -moz-transform: translate(0, 0);
    -ms-transform: translate(0, 0);
    transform: translate(0, 0)
  }
  to {
    -webkit-transform: translate(0, 100%);
    -moz-transform: translate(0, 100%);
    -ms-transform: translate(0, 100%);
    transform: translate(0, 100%)
  }
}

.ts_toggle {
  display: inline-block;
  margin: 0 0 1rem;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  height: 27px
}

.ts_toggle .ts_toggle_button {
  background: #E8E8E8;
  color: #9e9ea6;
  display: inline-block;
  border-radius: 1rem;
  margin-right: .5rem;
  padding: .1rem 1rem .1rem 2rem;
  font-size: .9rem;
  font-weight: 700;
  -webkit-transition: 70ms ease-out;
  -moz-transition: 70ms ease-out;
  transition: 70ms ease-out;
  cursor: pointer;
  position: relative;
  text-align: center;
  overflow: hidden;
  height: 27px;
  line-height: 23px;
  float: left
}

.ts_toggle .ts_toggle_button .ts_toggle_handle {
  background: #fff;
  display: inline-block;
  width: 23px;
  height: 23px;
  border-radius: 1rem;
  position: absolute;
  left: 0;
  top: 0;
  -webkit-transition: 70ms ease-out;
  -moz-transition: 70ms ease-out;
  transition: 70ms ease-out;
  margin: 2px
}

.ts_toggle .ts_toggle_button .ts_toggle_on_text {
  visibility: hidden
}

.ts_toggle .ts_toggle_button .ts_toggle_off_text {
  visibility: visible
}

.ts_toggle .ts_toggle_secondary_label {
  display: inline-block;
  color: #555459;
  font-size: 1rem;
  cursor: pointer
}

.ts_toggle .ts_toggle_secondary_label .ts_toggle_on_label {
  display: none
}

.ts_toggle.checked .ts_toggle_button {
  background: #2ab27b;
  color: #fff;
  padding: .1rem 2rem .1rem 1rem
}

.ts_toggle.checked .ts_toggle_button .ts_toggle_handle {
  left: 100%;
  margin-left: -25px
}

.ts_toggle.checked .ts_toggle_button .ts_toggle_on_text {
  visibility: visible;
  -webkit-transform: translateY(-100%);
  -moz-transform: translateY(-100%);
  -ms-transform: translateY(-100%);
  transform: translateY(-100%)
}

.ts_toggle.checked .ts_toggle_button .ts_toggle_off_text {
  visibility: hidden
}

.ts_toggle.checked .ts_toggle_secondary_label .ts_toggle_on_label {
  display: block
}

.ts_toggle.checked .ts_toggle_secondary_label .ts_toggle_off_label {
  display: none
}

.ts_toggle.ts_toggle_orange .ts_toggle_button {
  background: #FF8B00;
  color: #fff
}

.ts_toggle.disabled {
  pointer-events: none;
  opacity: .5
}

.ts_tip {
  display: inline-block;
  position: relative;
  z-index: 1;
  font-family: Slack-Lato, appleLogo, sans-serif!important
}

.ts_tip.ts_tip_multiline .ts_tip_tip {
  width: 250px
}

.ts_tip.ts_tip_multiline_top_rightish .ts_tip_multiline_inner {
  position: relative;
  left: -40px;
  min-width: 170px
}

.ts_tip.ts_tip_multiline_top_leftish .ts_tip_multiline_inner {
  position: relative;
  left: 40px;
  min-width: 170px
}

.ts_tip.ts_tip_multiline_top_right .ts_tip_multiline_inner {
  position: relative;
  left: -70px;
  min-width: 170px
}

.ts_tip.ts_tip_multiline_top_left .ts_tip_multiline_inner {
  position: relative;
  left: 70px;
  min-width: 170px
}

.ts_tip:not(.ts_tip_multiline) .ts_tip_tip {
  white-space: nowrap
}

.ts_tip .ts_tip_multiline_inner,
.ts_tip:not(.ts_tip_multiline) .ts_tip_tip {
  margin: 0;
  padding: 8px 12px;
  background: #000;
  border-radius: 6px
}

.ts_tip:not(.ts_tip_multiline) .ts_tip_tip.ts_tip_tip_with_emoji {
  padding-right: 30px
}

.ts_tip:not(.ts_tip_multiline) .ts_tip_tip.ts_tip_tip_with_emoji .ts_tip_emoji {
  height: 20px;
  width: 20px;
  -webkit-transform: translateY(-3px);
  -moz-transform: translateY(-3px);
  -ms-transform: translateY(-3px);
  transform: translateY(-3px)
}

.ts_tip.ts_tip_member .ts_tip_tip {
  max-width: 500px;
  padding: 6px 12px 6px 6px
}

.ts_tip .ts_tip_tip {
  display: block;
  position: absolute;
  z-index: 1030;
  top: 50%;
  left: 50%;
  max-width: 250px;
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  transform: translateX(-50%);
  text-align: left;
  opacity: 0;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  font-style: normal;
  line-height: 1.3;
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-transition: opacity 70ms linear 50ms;
  -moz-transition: opacity 70ms linear 50ms;
  transition: opacity 70ms linear 50ms
}

.ts_tip .ts_tip_tip .ts_tip_multiline_inner {
  display: table
}

.ts_tip .ts_tip_tip:after {
  position: absolute;
  top: 50%;
  left: 50%;
  content: '';
  width: 0;
  height: 0;
  margin: -6px;
  border: 7px solid transparent
}

.ts_tip.ts_tip_bottom .ts_tip_tip .ts_tip_multiline_inner,
.ts_tip.ts_tip_top .ts_tip_tip .ts_tip_multiline_inner {
  margin-left: auto;
  margin-right: auto
}

.ts_tip.success:not(.ts_tip_multiline) .ts_tip_tip {
  background: #2ab27b
}

.ts_tip.success.ts_tip_multiline .ts_tip_multiline_inner {
  background: #2ab27b
}

.ts_tip.success.ts_tip_left .ts_tip_tip:after {
  border-left-color: #2ab27b
}

.ts_tip.success.ts_tip_right .ts_tip_tip:after {
  border-right-color: #2ab27b
}

.ts_tip.success.ts_tip_top .ts_tip_tip:after {
  border-top-color: #2ab27b
}

.ts_tip.success.ts_tip_bottom .ts_tip_tip:after {
  border-bottom-color: #2ab27b
}

.ts_tip:not(.ts_tip_hidden).ts_tip_delay_0:hover .ts_tip_tip,
.ts_tip:not(.ts_tip_hidden).ts_tip_delay_none:hover .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: 0s;
  -moz-transition-delay: 0s;
  transition-delay: 0s
}

.ts_tip:not(.ts_tip_hidden).ts_tip_delay_150:hover .ts_tip_tip,
.ts_tip:not(.ts_tip_hidden):hover .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: 150ms;
  -moz-transition-delay: 150ms;
  transition-delay: 150ms
}

.ts_tip:not(.ts_tip_hidden).ts_tip_delay_300:hover .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: .3s;
  -moz-transition-delay: .3s;
  transition-delay: .3s
}

.ts_tip:not(.ts_tip_hidden).ts_tip_delay_600:hover .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: .6s;
  -moz-transition-delay: .6s;
  transition-delay: .6s
}

.ts_tip:not(.ts_tip_hidden).ts_tip_delay_1000:hover .ts_tip_tip {
  opacity: 1;
  -webkit-transition: opacity 270ms linear 1s;
  -moz-transition: opacity 270ms linear 1s;
  transition: opacity 270ms linear 1s
}

.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden).ts_tip_delay_0 .ts_tip_tip,
.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden).ts_tip_delay_none .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: 0s;
  -moz-transition-delay: 0s;
  transition-delay: 0s
}

.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden) .ts_tip_tip,
.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden).ts_tip_delay_150 .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: 150ms;
  -moz-transition-delay: 150ms;
  transition-delay: 150ms
}

.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden).ts_tip_delay_300 .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: .3s;
  -moz-transition-delay: .3s;
  transition-delay: .3s
}

.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden).ts_tip_delay_600 .ts_tip_tip {
  opacity: 1;
  -webkit-transition-delay: .6s;
  -moz-transition-delay: .6s;
  transition-delay: .6s
}

.ts_tip#ts_tip_float_floater.ts_tip:not(.ts_tip_hidden).ts_tip_delay_1000 .ts_tip_tip {
  opacity: 1;
  -webkit-transition: opacity 270ms linear 1s;
  -moz-transition: opacity 270ms linear 1s;
  transition: opacity 270ms linear 1s
}

.ts_tip#ts_tip_float_floater {
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  z-index: 1000000;
  position: absolute;
  top: 0;
  left: 0
}

.ts_tip.ts_tip_hide .ts_tip_tip {
  visibility: hidden
}

.ts_tip.ts_tip_hidden.ts_tip_float .ts_tip_tip {
  display: none
}

.ts_tip.ts_tip_left .ts_tip_tip {
  left: -8px;
  -webkit-transform: translateX(-100%) translateY(-50%);
  -moz-transform: translateX(-100%) translateY(-50%);
  -ms-transform: translateX(-100%) translateY(-50%);
  transform: translateX(-100%) translateY(-50%)
}

.ts_tip.ts_tip_left .ts_tip_tip:after {
  left: auto;
  right: -6px;
  border-left-color: #000
}

.ts_tip.ts_tip_right .ts_tip_tip {
  left: auto;
  right: -8px;
  -webkit-transform: translateX(100%) translateY(-50%);
  -moz-transform: translateX(100%) translateY(-50%);
  -ms-transform: translateX(100%) translateY(-50%);
  transform: translateX(100%) translateY(-50%)
}

.ts_tip.ts_tip_right .ts_tip_tip:after {
  right: auto;
  left: -6px;
  border-right-color: #000
}

.ts_tip.ts_tip_bottom .ts_tip_tip,
.ts_tip.ts_tip_top .ts_tip_tip {
  text-align: center;
  margin: 8px 0
}

.ts_tip.ts_tip_bottom .ts_tip_tip:after,
.ts_tip.ts_tip_top .ts_tip_tip:after {
  border-color: transparent
}

.ts_tip.ts_tip_align_left.ts_tip_bottom .ts_tip_tip,
.ts_tip.ts_tip_align_left.ts_tip_top .ts_tip_tip {
  text-align: left
}

.ts_tip.ts_tip_top .ts_tip_tip {
  top: auto;
  bottom: 100%
}

.ts_tip.ts_tip_top .ts_tip_tip:after {
  top: auto;
  bottom: -6px;
  border-top-color: #000
}

.ts_tip.ts_tip_bottom .ts_tip_tip {
  top: 100%
}

.ts_tip.ts_tip_bottom .ts_tip_tip:after {
  top: -6px;
  border-bottom-color: #000
}

.ts_tip.ts_tip_bottom.ts_tip_left .ts_tip_tip,
.ts_tip.ts_tip_top.ts_tip_left .ts_tip_tip {
  left: -9px;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  transform: none
}

.ts_tip.ts_tip_bottom.ts_tip_left .ts_tip_tip:after,
.ts_tip.ts_tip_top.ts_tip_left .ts_tip_tip:after {
  left: 19px;
  right: auto
}

.ts_tip.ts_tip_bottom.ts_tip_leftish .ts_tip_tip,
.ts_tip.ts_tip_top.ts_tip_leftish .ts_tip_tip {
  left: -39px;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  transform: none
}

.ts_tip.ts_tip_bottom.ts_tip_leftish .ts_tip_tip:after,
.ts_tip.ts_tip_top.ts_tip_leftish .ts_tip_tip:after {
  left: 49px
}

.ts_tip.ts_tip_bottom.ts_tip_rightish .ts_tip_tip,
.ts_tip.ts_tip_top.ts_tip_rightish .ts_tip_tip {
  left: auto;
  right: -40px;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  transform: none
}

.ts_tip.ts_tip_bottom.ts_tip_rightish .ts_tip_tip:after,
.ts_tip.ts_tip_top.ts_tip_rightish .ts_tip_tip:after {
  left: auto;
  right: 50px
}

.ts_tip.ts_tip_bottom.ts_tip_right .ts_tip_tip,
.ts_tip.ts_tip_top.ts_tip_right .ts_tip_tip {
  left: auto;
  right: -8px;
  -webkit-transform: none;
  -moz-transform: none;
  -ms-transform: none;
  transform: none
}

.ts_tip.ts_tip_bottom.ts_tip_right .ts_tip_tip:after,
.ts_tip.ts_tip_top.ts_tip_right .ts_tip_tip:after {
  left: auto;
  right: 18px
}

.ts_tip.btn.ts_tip_bottom.ts_tip_left .ts_tip_tip,
.ts_tip.btn.ts_tip_top.ts_tip_left .ts_tip_tip,
.ts_tip.ts_tip_bottom.ts_tip_left .btn~.ts_tip_tip,
.ts_tip.ts_tip_top.ts_tip_left .btn~.ts_tip_tip {
  left: 0
}

.ts_tip.btn.ts_tip_bottom.ts_tip_leftish .ts_tip_tip:after,
.ts_tip.btn.ts_tip_top.ts_tip_leftish .ts_tip_tip:after,
.ts_tip.ts_tip_bottom.ts_tip_leftish .btn~.ts_tip_tip:after,
.ts_tip.ts_tip_top.ts_tip_leftish .btn~.ts_tip_tip:after {
  left: 57px
}

.ts_tip.btn.ts_tip_bottom.ts_tip_rightish .ts_tip_tip:after,
.ts_tip.btn.ts_tip_top.ts_tip_rightish .ts_tip_tip:after,
.ts_tip.ts_tip_bottom.ts_tip_rightish .btn~.ts_tip_tip:after,
.ts_tip.ts_tip_top.ts_tip_rightish .btn~.ts_tip_tip:after {
  right: 58px
}

.ts_tip.btn.ts_tip_bottom.ts_tip_right .ts_tip_tip,
.ts_tip.btn.ts_tip_top.ts_tip_right .ts_tip_tip,
.ts_tip.ts_tip_bottom.ts_tip_right .btn~.ts_tip_tip,
.ts_tip.ts_tip_top.ts_tip_right .btn~.ts_tip_tip {
  right: 0
}

.ts_tip .ts_tip_btn.btn.ts_icon:before {
  display: block;
  height: 17px;
  margin: 1px -6px
}

.float_left {
  float: left!important
}

.float_right {
  float: right!important
}

.float_none {
  float: none!important
}

.clear_left {
  clear: left
}

.clear_right {
  clear: right
}

.clear_both {
  clear: both
}

.position_relative {
  position: relative!important
}

.position_absolute {
  position: absolute!important
}

.position_absolute_left {
  position: absolute!important;
  left: 0!important
}

.position_absolute_right {
  position: absolute!important;
  right: 0!important
}

.position_absolute_top {
  position: absolute!important;
  top: 0!important
}

.constrain_triple_clicks,
.offscreen {
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px;
  width: 1px;
  margin: -1px;
  padding: 0;
  border: 0
}

.user_select_text {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text
}

.block {
  display: block!important
}

.inline_block {
  display: inline-block!important
}

.inline_flex {
  display: inline-flex!important
}

.inline {
  display: inline!important
}

.display_none {
  display: none
}

.z_index_auto {
  z-index: auto
}

.z_index_0 {
  z-index: 0
}

.z_index_1 {
  z-index: 1
}

.no_list_style {
  list-style-type: none
}

.align_left {
  text-align: left!important
}

.align_center,
.centered {
  text-align: center!important
}

.align_right {
  text-align: right!important
}

.align_top,
.align_top:before {
  vertical-align: top!important
}

.align_middle,
.align_middle:before {
  vertical-align: middle!important
}

.align_bottom,
.align_bottom:before {
  vertical-align: bottom!important
}

.align_text_bottom,
.align_text_bottom:before {
  vertical-align: text-bottom!important
}

.helvetica {
  font-family: "Helvetica Neue", Helvetica, "Segoe UI", Tahoma, Arial, sans-serif
}

.lato {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-weight: 400
}

.lato_black {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-weight: 900
}

.lato_bold {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-weight: 700
}

.lato_regular {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-weight: 500
}

.lato_light {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-weight: 300
}

.monospace {
  font-family: Consolas, monaco, "Ubuntu Mono", courier, monospace!important;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none
}

[lang=en-US] .copy_font_family,
[lang=de-DE] .copy_font_family,
[lang=es-ES] .copy_font_family,
[lang=fr-FR] .copy_font_family {
  font-family: Slack-Lato, appleLogo, sans-serif
}

[lang=ja-JP] .copy_font_family {
  font-family: NotoSansJP, Slack-Lato, appleLogo, sans-serif
}

.light {
  font-weight: 300!important
}

.medium {
  font-weight: 500!important
}

.normal {
  font-weight: 400!important
}

.bold {
  font-weight: 700!important
}

.black {
  font-weight: 900!important
}

.italic {
  font-style: italic
}

.underline {
  text-decoration: underline!important
}

.no_underline,
.no_underline:hover {
  text-decoration: none!important
}

.tiny {
  font-size: .7rem
}

.small {
  font-size: .9rem
}

.lowercase {
  text-transform: lowercase
}

.lowercase[placeholder]::-webkit-input-placeholder {
  text-transform: none
}

.lowercase[placeholder]::-moz-placeholder {
  text-transform: none
}

.lowercase[placeholder]:-ms-input-placeholder {
  text-transform: none
}

.uppercase {
  text-transform: uppercase
}

.uppercase[placeholder]::-webkit-input-placeholder {
  text-transform: none
}

.uppercase[placeholder]::-moz-placeholder {
  text-transform: none
}

.uppercase[placeholder]:-ms-input-placeholder {
  text-transform: none
}

.capitalize {
  text-transform: capitalize
}

.capitalize[placeholder]::-webkit-input-placeholder {
  text-transform: none
}

.capitalize[placeholder]::-moz-placeholder {
  text-transform: none
}

.capitalize[placeholder]:-ms-input-placeholder {
  text-transform: none
}

.text_transform_reset {
  text-transform: none
}

.overflow_ellipsis {
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap
}

.overflow_hidden {
  overflow: hidden
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme {
  border-right: .25rem solid transparent
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 8px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #4D394B
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme::-webkit-scrollbar-track {
  background: #3e313c;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme::-webkit-scrollbar-thumb {
  background: #AB9BA9;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar_theme::-webkit-scrollbar-corner {
  background: #4D394B
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar_theme {
  margin-right: 2px
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar_theme::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar_theme::-webkit-scrollbar-thumb {
  background-color: rgba(171, 155, 169, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #AB9BA9;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar_theme::-webkit-scrollbar-thumb:hover {
  background-color: rgba(171, 155, 169, .8)
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar {
  border-right: .25rem solid transparent
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 8px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #fff
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .slack_scrollbar::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar {
  margin-right: 2px
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(113, 114, 116, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #717274;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar .slack_scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(113, 114, 116, .8)
}

.break_all {
  word-break: break-all
}

.break_word {
  word-wrap: break-word
}

.no_wrap {
  white-space: nowrap
}

.code_wrap {
  white-space: pre;
  word-wrap: break-word
}

.normal_wrap {
  white-space: normal!important
}

.full_height {
  height: 100%
}

.full_max_width {
  max-width: 100%
}

.no_max_width {
  max-width: none!important
}

.full_width {
  width: 100%!important;
  max-width: 100%!important
}

.half_width {
  width: 50%!important;
  max-width: 50%!important;
  margin-left: auto!important;
  margin-right: auto!important
}

.no_min_width {
  min-width: 0!important
}

.no_min_height {
  min-height: 0!important
}

.auto_width {
  width: auto!important
}

.inherit_width {
  width: inherit!important
}

.cursor_default {
  cursor: default!important
}

.cursor_pointer {
  cursor: pointer
}

.no_pointer_events {
  -ms-pointer-events: none;
  -webkit-pointer-events: none;
  pointer-events: none
}

.no_margin {
  margin: 0!important
}

.very_small_margin {
  margin: .25rem!important
}

.small_margin {
  margin: .5rem!important
}

.normal_margin {
  margin: 1rem!important
}

.large_margin {
  margin: 2rem!important
}

.larger_margin {
  margin: 3rem!important
}

.very_large_margin {
  margin: 4rem!important
}

.no_top_margin {
  margin-top: 0!important
}

.no_bottom_margin {
  margin-bottom: 0!important
}

.no_left_margin {
  margin-left: 0!important
}

.no_right_margin {
  margin-right: 0!important
}

.tiny_top_margin {
  margin-top: .1rem!important
}

.tiny_left_margin {
  margin-left: .1rem!important
}

.tiny_right_margin {
  margin-right: .1rem!important
}

.tiny_bottom_margin {
  margin-bottom: .1rem!important
}

.very_small_top_margin {
  margin-top: .25rem!important
}

.very_small_bottom_margin {
  margin-bottom: .25rem!important
}

.very_small_left_margin {
  margin-left: .25rem!important
}

.very_small_right_margin {
  margin-right: .25rem!important
}

.small_top_margin {
  margin-top: .5rem!important
}

.small_bottom_margin {
  margin-bottom: .5rem!important
}

.small_left_margin {
  margin-left: .5rem!important
}

.small_right_margin {
  margin-right: .5rem!important
}

.top_margin {
  margin-top: 1rem!important
}

.bottom_margin {
  margin-bottom: 1rem!important
}

.left_margin {
  margin-left: 1rem!important
}

.right_margin {
  margin-right: 1rem!important
}

.medium_top_margin {
  margin-top: 1.5rem!important
}

.medium_bottom_margin {
  margin-bottom: 1.5rem!important
}

.medium_left_margin {
  margin-left: 1.5rem!important
}

.medium_right_margin {
  margin-right: 1.5rem!important
}

.large_top_margin {
  margin-top: 2rem!important
}

.large_bottom_margin {
  margin-bottom: 2rem!important
}

.large_left_margin {
  margin-left: 2rem!important
}

.large_right_margin {
  margin-right: 2rem!important
}

.larger_top_margin {
  margin-top: 3rem!important
}

.larger_bottom_margin {
  margin-bottom: 3rem!important
}

.larger_left_margin {
  margin-left: 3rem!important
}

.larger_right_margin {
  margin-right: 3rem!important
}

.very_large_top_margin {
  margin-top: 4rem!important
}

.very_large_bottom_margin {
  margin-bottom: 4rem!important
}

.very_large_left_margin {
  margin-left: 4rem!important
}

.very_large_right_margin {
  margin-right: 4rem!important
}

.margin_auto {
  margin-left: auto!important;
  margin-right: auto!important
}

.auto_left_margin {
  margin-left: auto!important
}

.auto_right_margin {
  margin-right: auto!important
}

.no_padding {
  padding: 0!important
}

.very_small_padding {
  padding: .25rem!important
}

.small_padding {
  padding: .5rem!important
}

.normal_padding {
  padding: 1rem!important
}

.large_padding {
  padding: 2rem!important
}

.larger_padding {
  padding: 3rem!important
}

.very_large_padding {
  padding: 4rem!important
}

.no_top_padding {
  padding-top: 0!important
}

.no_bottom_padding {
  padding-bottom: 0!important
}

.no_left_padding {
  padding-left: 0!important
}

.no_right_padding {
  padding-right: 0!important
}

.very_small_top_padding {
  padding-top: .25rem!important
}

.very_small_bottom_padding {
  padding-bottom: .25rem!important
}

.very_small_left_padding {
  padding-left: .25rem!important
}

.very_small_right_padding {
  padding-right: .25rem!important
}

.small_top_padding {
  padding-top: .5rem!important
}

.small_bottom_padding {
  padding-bottom: .5rem!important
}

.small_left_padding {
  padding-left: .5rem!important
}

.small_right_padding {
  padding-right: .5rem!important
}

.top_padding {
  padding-top: 1rem!important
}

.bottom_padding {
  padding-bottom: 1rem!important
}

.left_padding {
  padding-left: 1rem!important
}

.right_padding {
  padding-right: 1rem!important
}

.medium_top_padding {
  padding-top: 1.5rem!important
}

.medium_bottom_padding {
  padding-bottom: 1.5rem!important
}

.medium_left_padding {
  padding-left: 1.5rem!important
}

.medium_right_padding {
  padding-right: 1.5rem!important
}

.large_top_padding {
  padding-top: 2rem!important
}

.large_bottom_padding {
  padding-bottom: 2rem!important
}

.large_left_padding {
  padding-left: 2rem!important
}

.large_right_padding {
  padding-right: 2rem!important
}

.larger_top_padding {
  padding-top: 3rem!important
}

.larger_bottom_padding {
  padding-bottom: 3rem!important
}

.larger_left_padding {
  padding-left: 3rem!important
}

.larger_right_padding {
  padding-right: 3rem!important
}

.very_large_top_padding {
  padding-top: 4rem!important
}

.very_large_bottom_padding {
  padding-bottom: 4rem!important
}

.very_large_left_padding {
  padding-left: 4rem!important
}

.very_large_right_padding {
  padding-right: 4rem!important
}

.bordered {
  border: 1px solid #E8E8E8
}

.top_border {
  border-top: 1px solid #E8E8E8
}

.bottom_border {
  border-bottom: 1px solid #E8E8E8
}

.left_border {
  border-left: 1px solid #E8E8E8
}

.right_border {
  border-right: 1px solid #E8E8E8
}

.no_border {
  border: none!important
}

.no_top_border {
  border-top: none!important
}

.no_bottom_border {
  border-bottom: none!important
}

.no_left_border {
  border-left: none!important
}

.no_right_border {
  border-right: none
}

.rounded,
.small_border_radius {
  border-radius: .25rem
}

.rounded_top {
  border-radius: .25rem .25rem 0 0
}

.rounded_bottom {
  border-radius: 0 0 .25rem .25rem
}

.hidden {
  display: none!important;
  visibility: hidden!important
}

.invisible {
  visibility: hidden
}

.no_opacity {
  opacity: 0
}

.half_opacity {
  opacity: .5
}

.null_transform {
  -webkit-transform: translateZ(0)
}

.no_transition {
  -webkit-transition: none!important;
  -moz-transition: none!important;
  -o-transition: none!important;
  transition: none!important
}

.display_flex {
  display: flex
}

.align_items_center {
  align-items: center
}

.align_items_baseline {
  align-items: baseline
}

.align_items_start {
  align-items: flex-start
}

.align_items_end {
  align-items: flex-end
}

.align_self_center {
  align-self: center
}

.align_self_start {
  align-self: start
}

.align_self_end {
  align-self: end
}

.align_self_stretch {
  align-self: stretch
}

.justify_content_center {
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center
}

.justify_content_around {
  -ms-flex-pack: distribute;
  -webkit-box-pack: distribute;
  -webkit-justify-content: space-around;
  -moz-justify-content: space-around;
  justify-content: space-around
}

.justify_content_between {
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -moz-justify-content: space-between;
  justify-content: space-between
}

.justify_content_start {
  -ms-flex-pack: start;
  -webkit-box-pack: start;
  -webkit-justify-content: flex-start;
  -moz-justify-content: flex-start;
  justify-content: flex-start
}

.justify_content_end {
  -ms-flex-pack: end;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  -moz-justify-content: flex-end;
  justify-content: flex-end
}

.flex_direction_column {
  flex-direction: column
}

.flex_direction_row_reverse {
  flex-direction: row-reverse
}

.flex_none {
  flex: none
}

.flex_one {
  flex: 1
}

.flex_wrap {
  flex-wrap: wrap
}

.flex_nowrap {
  flex-wrap: nowrap
}

.transparent {
  color: transparent!important
}

.transparent_bg {
  background-color: transparent!important
}

.flexpane_grey {
  color: #F7F7F7!important
}

.flexpane_grey_bg {
  background-color: #F7F7F7!important
}

.neutral_white {
  color: #fff!important
}

.neutral_white_bg {
  background-color: #fff!important
}

.off_white {
  color: #F9F9F9!important
}

.off_white_bg {
  background-color: #F9F9F9!important
}

.neutral_grey {
  color: #FBFBFA!important
}

.neutral_grey_bg {
  background-color: #FBFBFA!important
}

.indifferent_grey {
  color: #555459!important
}

.indifferent_grey_bg {
  background-color: #555459!important
}

.flat_grey {
  color: #434245!important
}

.subtle_silver {
  color: #9e9ea6!important
}

.subtle_silver_bg {
  background-color: #9e9ea6!important
}

.soft_grey {
  color: #E8E8E8!important
}

.soft_grey_bg {
  background-color: #E8E8E8!important
}

.severe_grey {
  color: #3D3C40!important
}

.severe_grey_bg {
  background-color: #3D3C40!important
}

.dull_grey {
  color: #8B898F!important
}

.dull_grey_bg {
  background-color: #8B898F!important
}

.plastic_grey {
  color: #88919B!important
}

.plastic_grey_bg {
  background-color: #88919B!important
}

.cloud_silver {
  color: #BABBBF!important
}

.cloud_silver_bg {
  background-color: #BABBBF!important
}

.warm_white {
  color: #fbfaf8!important
}

.warm_white_bg {
  background-color: #fbfaf8!important
}

.cloud_white {
  color: #f2f2f5!important
}

.cloud_white_bg {
  background-color: #f2f2f5!important
}

.charcoal_grey_bg {
  background-color: #2C2D30!important
}

.old_petunia_grey_bg {
  background-color: #A0A0A2!important
}

.greigh {
  color: #717274!important
}

.greigh_bg {
  background-color: #717274!important
}

.seafoam_green {
  color: #2ab27b!important
}

.seafoam_green_bg {
  background-color: #2ab27b!important
}

.clear_blue {
  color: #3aa3e3!important
}

.clear_blue_bg {
  background-color: #3aa3e3!important
}

.solid_blue {
  color: #2780F8!important
}

.solid_blue_bg {
  background-color: #2780F8!important
}

.candy_red,
.candy_red_on_hover:hover {
  color: #eb4d5c!important
}

.candy_red_bg {
  background-color: #eb4d5c!important
}

.code_red {
  color: #c25!important
}

.highlight_yellow_bg {
  background-color: #FFFCE0!important
}

.highlight_red_bg {
  background-color: #FFCFCF!important
}

.mention_yellow_bg {
  background-color: #FFF3B8!important
}

.star_yellow {
  color: #fC0!important
}

.star_yellow_bg {
  background-color: #fC0!important
}

.yolk_orange {
  color: #EDB431!important
}

.yolk_orange_bg {
  background-color: #EDB431!important
}

.thrills_purple {
  color: #7D60C5!important
}

.thrills_purple_bg {
  background-color: #7D60C5!important
}

.miami_pink {
  color: #e32072!important
}

.mantis_green {
  color: #64D367!important
}

.burnt_violet {
  color: #4D394B!important
}

.burnt_violet_bg {
  background-color: #4D394B!important
}

.ocean_teal {
  color: #4c9689!important
}

.ocean_teal_bg {
  background-color: #4c9689!important
}

.havana_blue {
  color: #2a80b9!important
}

.havana_blue_bg {
  background-color: #2a80b9!important
}

.pale_blue {
  color: #F0F7FB!important
}

.pale_blue_bg {
  background-color: #F0F7FB!important
}

.sky_blue {
  color: #439fe0!important
}

.sky_blue_bg {
  background-color: #439fe0!important
}

.slate_blue {
  color: #3C4B5B!important
}

.slate_blue_bg {
  background-color: #3C4B5B!important
}

.muddy_lilac {
  color: #937e91!important
}

.muddy_lilac_bg {
  background-color: #937e91!important
}

.moscow_red,
.moscow_red_on_hover:hover,
moscow_red_bg {
  color: #CB5234!important
}

.moscow_red_dark {
  color: #870000!important
}

.moscow_red_dark_bg {
  background-color: #870000!important
}

.mustard_yellow {
  color: #DFA941!important
}

.mustard_yellow_bg {
  background-color: #DFA941!important
}

.kelly_green {
  color: #36a64f!important
}

.kelly_green_dark {
  color: #257337!important
}

.kelly_green_bg {
  background-color: #36a64f!important
}

.channel_page_blue {
  color: #2D9CF5!important
}

.pin_orange {
  color: #FF876D!important
}

.charcoal_grey {
  color: #2C2D30!important
}

.old_petunia_grey {
  color: #A0A0A2!important
}

.cool_purple {
  color: #4d6dc3!important
}

.cool_purple_bg {
  background-color: #4d6dc3!important
}

.dusty_springfield_grey {
  color: #565759!important
}

.dropbox_blue {
  color: #007ee5!important
}

.dropbox_blue_bg {
  background-color: #007ee5!important
}

.twitter_blue {
  color: #55ACEE!important
}

.twitter_blue_bg {
  background-color: #55ACEE!important
}

.gdrive_blue_bg {
  background-color: #4285f4!important
}

.screenhero_blue {
  color: #1A9CDB!important
}

.screenhero_blue_bg {
  background-color: #1A9CDB!important
}

.blue_link {
  color: #007AB8
}

.blue_hover {
  color: #005E99
}

.blue_fill {
  color: #2D9EE0
}

.blue_fill_bg {
  background-color: #2D9EE0!important
}

.i18n_wordwrap {
  display: inline-block
}

.show_on_mobile {
  display: none!important
}

@media only screen and (max-width:768px) {
  .hide_on_mobile {
    display: none!important
  }
  .show_on_mobile {
    display: block!important
  }
  .show_on_mobile.inline {
    display: inline!important
  }
  .align_center_mobile {
    text-align: center
  }
}

@media only screen and (min-width:768px) {
  .align_right_desktop {
    text-align: right
  }
  .float_left_desktop {
    float: left
  }
  .float_right_desktop {
    float: right
  }
  .multicolumn_2 {
    -moz-column-count: 2;
    -webkit-column-count: 2;
    column-count: 2
  }
}

@media only screen and (max-width:640px) {
  .hide_on_mobile_landscape {
    display: none
  }
  .show_on_mobile_landscape {
    display: block
  }
}

* {
  -ms-box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box
}

img {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  border: 0
}

.clearfix {
  *zoom: 1
}

.clearfix:after,
.clearfix:before {
  display: table;
  line-height: 0;
  content: ''
}

.clearfix:after {
  clear: both
}

.print_only,
.print_only_inline {
  display: none
}

.constrain_24 {
  width: 24px;
  height: 24px
}

.constrain_32 {
  width: 32px;
  height: 32px
}

.constrain_48 {
  width: 48px;
  height: 48px
}

.constrain_64 {
  width: 64px;
  height: 64px
}

.constrain_72 {
  width: 72px;
  height: 72px
}

a[name] {
  display: block;
  position: relative;
  top: -92px;
  visibility: hidden
}

a:not([href]) {
  cursor: pointer
}

.copy_only,
.copyonly {
  -moz-box-orient: vertical;
  display: inline-block;
  vertical-align: baseline;
  *vertical-align: auto;
  *zoom: 0;
  *display: inline;
  width: 1px;
  height: 0;
  background-size: 0;
  background-repeat: no-repeat;
  font-size: 0;
  color: transparent;
  float: left;
  text-rendering: auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  opacity: 0
}

.responsive_image {
  width: 100%;
  height: auto
}

img.grayscale {
  filter: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImdyYXlzY2FsZSI+PGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAgMCAwIDEgMCIvPjwvZmlsdGVyPjwvc3ZnPgo=#grayscale);
  -webkit-filter: grayscale(100%)
}

.mini {
  font-size: .8rem;
  line-height: 1.2rem;
  color: #666
}

a.mini,
a.mini:link,
a.mini:visited {
  color: #007AB8
}

a.mini:active,
a.mini:hover {
  color: #005E99
}

.link:hover {
  color: #005E99;
  text-decoration: underline
}

.inline_color_block {
  display: inline-block;
  margin: 0 .1rem -1px 0;
  width: 13px;
  height: 13px;
  border: 1px solid #555459;
  border-radius: 3px
}

.well {
  border-radius: 1rem;
  padding: .25rem .5rem .35rem;
  font-size: 1rem;
  line-height: 1rem;
  background: #eee;
  border: 1px solid #E8E8E8;
  color: #9e9ea6;
  display: inline-block;
  text-shadow: 0 1px 1px rgba(255, 255, 255, .5)
}

.well a,
.well span {
  padding: 0 .5rem
}

.log_output {
  padding: .25rem;
  text-align: left;
  font-family: Consolas, monaco, "Ubuntu Mono", courier, monospace!important;
  font-size: .9rem;
  border-bottom: 1px solid #ccc
}

.letter {
  background-image: url(/66f9/img/email-ribbon_@2x.png);
  background-repeat: repeat-x;
  background-size: 130px;
  background-position: -10px 0
}

.square_icon {
  color: #fff;
  width: 48px;
  height: 48px;
  text-align: center;
  line-height: 48px;
  border-radius: .25rem;
  margin-right: .5rem
}

.square_icon:before {
  font-size: 30px
}

table {
  border-collapse: collapse;
  border-spacing: 0;
  margin: 0 0 1rem
}

table tr:first-child th:not(:only-of-type) {
  font-weight: 700;
  border-bottom: 2px solid #2ab27b;
  text-align: left
}

table.gray_header_border tr:first-child th:not(:only-of-type) {
  font-weight: 700;
  border-bottom: 2px solid #9e9ea6;
  text-align: left
}

table.error th {
  border-color: #CB5234!important
}

table td,
table th {
  padding: .5rem 1rem .5rem 0
}

table tr {
  border-bottom: 1px solid #E8E8E8
}

table tr:last-child {
  border-bottom: none
}

.team_icon {
  display: inline-block;
  margin-right: .5rem;
  font-style: normal;
  border-radius: .25rem;
  height: 3rem;
  width: 3rem;
  padding: .4rem .5rem;
  line-height: 2.25rem;
  text-align: center;
  font-weight: 900;
  color: #fff;
  font-size: 1rem;
  letter-spacing: -1px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  float: left;
  background-size: 100%
}

.team_icon.default {
  background: #4D394B
}

.team_icon.small {
  height: 2.25rem;
  width: 2.25rem;
  padding: .2rem .5rem;
  line-height: 1.9rem
}

.action_cog {
  font-size: .8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #9e9ea6
}

.action_cog i {
  margin-left: .75rem;
  float: right
}

html.no_touch .action_cog:hover {
  color: #3aa3e3;
  text-decoration: none
}

html.no_touch .action_cog:hover i {
  color: #3aa3e3
}

@media only screen and (max-width:640px) {
  .action_cog span {
    display: none
  }
}

.highlight_page_load {
  -webkit-animation: highlight_page_load 6s;
  -moz-animation: highlight_page_load 6s;
  -ms-animation: highlight_page_load 6s;
  animation: highlight_page_load 6s
}

@keyframes highlight_page_load {
  from {
    background-color: #FFFCE0
  }
  to {
    background-color: transparent
  }
}

@-moz-keyframes highlight_page_load {
  from {
    background-color: #FFFCE0
  }
  to {
    background-color: transparent
  }
}

@-webkit-keyframes highlight_page_load {
  from {
    background-color: #FFFCE0
  }
  to {
    background-color: transparent
  }
}

@-ms-keyframes highlight_page_load {
  from {
    background-color: #FFFCE0
  }
  to {
    background-color: transparent
  }
}

.quote_block {
  color: #555459;
  margin-top: 1px;
  padding: 0 0 0 1rem;
  position: relative
}

.quote_block:before {
  border-radius: 2px;
  content: '';
  display: block;
  background-color: #E8E8E8;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px
}

.quote_block.seafoam_green:before {
  background-color: #2ab27b
}

.pager {
  margin: 0;
  text-align: center;
  list-style: none;
  height: 2.5rem
}

.pager:after {
  clear: both
}

.pager li {
  display: inline
}

.pager li>a,
.pager li>span {
  display: inline-block;
  color: #555459;
  background-image: url(/66f9/img/pager_sprite.png);
  width: 98px;
  height: 35px;
  line-height: 35px;
  font-size: 1rem;
  font-weight: 700
}

.pager li.next>a,
.pager li.next>span {
  float: right;
  background-position: 99px 35px;
  padding-left: 25px;
  text-align: left
}

.pager li.previous>a,
.pager li.previous>span {
  float: left;
  background-position: 0 35px;
  text-align: right;
  padding-right: 13px
}

.pager .disabled>a,
.pager .disabled>span {
  color: #9e9ea6;
  cursor: default
}

html.no_touch .pager li>a:focus,
html.no_touch .pager li>a:hover {
  text-decoration: none;
  color: #3aa3e3
}

html.no_touch .pager .disabled>a:focus,
html.no_touch .pager .disabled>a:hover {
  color: #9e9ea6;
  cursor: default
}

html.no_touch .pager .next>a:focus,
html.no_touch .pager .next>a:hover {
  background-position: 99px -74px
}

html.no_touch .pager .previous>a:focus,
html.no_touch .pager .previous>a:hover {
  background-position: 0 -74px
}

.pagination {
  margin: 2rem auto
}

.pagination ul {
  display: inline-block;
  *display: inline;
  margin-bottom: 0;
  margin-left: 0;
  border-radius: .25rem;
  *zoom: 1
}

.pagination ul>li {
  display: inline
}

.pagination ul>li>a,
.pagination ul>li>span {
  float: left;
  padding: .25rem .75rem;
  line-height: 20px;
  background-color: #fff;
  border: 1px solid #E8E8E8;
  border-left-width: 0;
  text-decoration: none!important
}

.pagination ul>.active>a,
.pagination ul>.active>span,
.pagination ul>li>a:focus {
  background-color: #3aa3e3;
  color: #fff;
  cursor: default
}

html.no_touch .pagination ul>li>a:hover {
  background-color: #3aa3e3;
  color: #fff
}

html.no_touch .pagination ul>.disabled>a:hover {
  color: #9e9ea6;
  background: #fff
}

.pagination ul>.disabled>a,
.pagination ul>.disabled>a:focus,
.pagination ul>.disabled>span {
  color: #9e9ea6;
  cursor: default;
  background: #fff
}

.pagination ul>li:first-child>a,
.pagination ul>li:first-child>span {
  border-left-width: 1px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: .25rem;
  border-top-left-radius: .25rem;
  background-clip: padding-box
}

.pagination ul>li:last-child>a,
.pagination ul>li:last-child>span {
  border-top-right-radius: .25rem;
  border-bottom-right-radius: .25rem;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  background-clip: padding-box
}

.pagination-centered {
  text-align: center
}

.pagination-right {
  text-align: right
}

.service_row {
  padding: .5rem 0;
  border-bottom: 1px solid #E8E8E8;
  color: #9e9ea6;
  position: relative
}

.service_row a.summary {
  color: #555459;
  word-wrap: break-word;
  word-break: break-word;
  display: block;
  margin-right: 3rem
}

.service_row .summary strong {
  background: #F0F7FB;
  font-weight: 400;
  color: #3aa3e3
}

.service_row .service_chevron {
  font-size: 1rem;
  padding: 1rem;
  float: right
}

.service.no_hover h4,
.service.no_hover h4 a {
  cursor: default;
  text-decoration: none
}

.service .btn_outline .ts_icon_chevron_medium_down {
  display: none
}

.service .btn_outline .ts_icon_chevron_medium_right {
  display: inline-block
}

.service.open {
  background: #FBFBFA!important;
  border: 1px solid #E8E8E8
}

.service.open .btn_outline .ts_icon_chevron_medium_down {
  display: inline-block
}

.service.open .btn_outline .ts_icon_chevron_medium_right {
  display: none
}

.service_row:last-child {
  border-bottom: none
}

html.no_touch .service h4:hover {
  cursor: pointer;
  text-decoration: underline
}

html.no_touch .service_row:not(.no_hover):hover .service_chevron,
html.no_touch .service_row:not(.no_hover):hover a.summary {
  color: #3aa3e3
}

html.no_touch .service:not(.no_hover):hover h4,
html.no_touch .service:not(.no_hover):hover h4 a {
  color: #3aa3e3
}

@media only screen and (max-width:640px) {
  .service_row .service_chevron {
    display: none
  }
  .service_row a.summary {
    margin-right: 0
  }
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  .pager li>a,
  .pager li>span {
    background-image: url(/66f9/img/pager_sprite_@2x.png);
    background-size: 200%
  }
  .pager li.previous>a,
  .pager li.previous>span {
    background-position: 0 34.5px
  }
  .pager li.next>a,
  .pager li.next>span {
    background-position: 98px 34.5px
  }
  html.no_touch .pager .next>a:focus,
  html.no_touch .pager .next>a:hover {
    background-position: 98px -72.5px
  }
  html.no_touch .pager .previous>a:focus,
  html.no_touch .pager .previous>a:hover {
    background-position: 0 -72.5px
  }
}

.loading_hash_animation {
  text-align: center;
  color: #999;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: .9rem;
  margin: 9rem 0
}

#file_page_comments .loading_hash_animation {
  margin: 0 0 1rem
}

.loading_hash_animation img {
  width: 40px;
  height: 40px;
  margin: 0 1rem .5rem .5rem
}

span.emoji {
  -moz-box-orient: vertical;
  display: inline-block;
  overflow: hidden;
  *vertical-align: auto;
  *zoom: 1;
  *display: inline;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  text-align: left
}

.emoji-sizer,
.no_jumbomoji .emoji-sizer.emoji-only,
.no_jumbomoji.emoji-sizer.emoji-only {
  line-height: 18px;
  font-size: 22px;
  vertical-align: middle;
  margin-top: -4px
}

.message_icon .emoji-sizer {
  margin-top: 0
}

.current_status .emoji-sizer,
.current_user_current_status .emoji-sizer,
.message_current_status .emoji-sizer {
  width: 1rem;
  height: 1rem;
  font-size: 1rem
}

.current_status .ts_icon,
.current_user_current_status .ts_icon,
.message_current_status .ts_icon {
  position: relative;
  top: -4px
}

.ts_tip .ts_tip_inner_current_status {
  line-height: 1.6
}

.current_status ts-icon,
.message_current_status ts-icon {
  color: #717274
}

span.emoji-outer {
  background-size: 4100%;
  display: inline-block;
  height: 1em;
  overflow: hidden;
  width: 1em
}

span.emoji-bg-contain {
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: contain!important
}

a span.emoji-outer:not(:empty),
a:hover span.emoji-outer:not(:empty),
span.emoji-outer:not(:empty),
span.emoji:not(:empty) {
  color: transparent!important;
  text-indent: 100%;
  text-shadow: none
}

.light_theme .emoji-only {
  line-height: 32px;
  font-size: 32px;
  margin-top: 2px
}

.light_theme br+.emoji-only,
.light_theme br+.emoji-only~.emoji-only {
  margin-top: 0!important
}

img.emoji {
  width: 1em;
  height: 1em
}

.icon_comment {
  width: 16px;
  height: 16px;
  color: #fff;
  text-shadow: 0 0 2px #000;
  display: inline-block
}

.icon_search_input {
  position: absolute;
  font-size: 1rem;
  top: 6px;
  left: 8px;
  color: #9e9ea6
}

.icon_search_close {
  position: absolute;
  right: 8px;
  top: 6px;
  color: #E8E8E8;
  font-size: 20px
}

.icon_search_close:hover {
  color: #3aa3e3;
  text-decoration: none!important
}

input.search_input {
  margin: 0;
  padding-left: 30px!important;
  padding-right: 30px!important
}

.deleted .member_image {
  opacity: .6;
  -moz-opacity: .6;
  -khtml-opacity: .6;
  -webkit-filter: grayscale(1)
}

body.plaid {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAhwAAAIcCAMAAACKIIdOAAAA81BMVEX3+/r29vf19PX69vj79vj+/P3///7+/Pj9+/b5+fX4+fX5+/r5/P39/v75/Pr+/v779/j+/f33+/n19fb8/fz8+Pn79/f9+fb+/Pr6/f3//v769vb89fX2+vr1+fj2+vn79fX7/fz8+Pj79vb9+vb89vX5/Pv3+/v6/Pv+/fn79/b5+vj8+vb89/n49vf39fb3+vn49fb89/j8+/b6+/n59/j7/Pv4/Pv39/j9+/z9+/f3+fX4/Pr39/f5+vb+/fz9/v39+fr8+fb1+vn9+/r7+Pf4/Pz9/Pz29fX3+fj4+vf+/Pv+/fv49/f8/Pz5+/j9/Ptz18JjAAAd00lEQVR42szSO1JUAQBFwUFh5CqKqPgX2f8qDTswMHg1dew19Ol09YLMy+ubM5lXt3tN5s3d2zOZdyc70hvXdpQ3bu0ob9zd3f8XN+xIb9iR3rAjvWFHesOO9IYd6Q070ht2pDfsSG/Ykd6wI71hR3rDjvSGHeUNlt6wI75hR3rDjvIGS2/YEd+wI71hR3mDpTfsiG/Ykd6wo7zB0ht2xDfsKG9gB1z4Bktv2BHfsCO9YUd5g6U37Ihv2JHesKO8wdIbdsQ37Ehv2FHeYOkNO+IbdqQ37ChvsPSGHfENO9IbdpQ3WHrDjviGHekNO8obLL1hR3zDjvSGHeUNlt84vuP4Da7SG3aUN1h6w474hh3pDTvKGyy9YUd8w470hh3lDZbesCO+YUd6w47yBktv2BHfsCO9YUd5g6U37Ihv2JHesKO8wdIbdsQ37Ehv2FHeYOkNO+IbdqQ37LjYjX6HGwD38Q070ht2lDdYesOO+IYd6Q07yhssvWFHfMOO9IYd5Q2W3rAjvmFHesOO8gZLb9gR37AjvWFHeYOlN+yIb9iR3rCjvMHSG3bEN+wIb/D+obzB0ht2xDfsSG/YUd5g6Q074ht2pDfsKG+w9IYd8Q070ht2lDdYesOO9AYfPqY37ChvsPSGHfENO9IbdpQ3WHrDjviGHekNO8obLL1hR3zDjvSGHeUNlt6wI75hR3rDjvIGS2/YEd+wI71hR3mDpTfsiG/Ykd6wo7zB0ht2xDfsSG/Y0d6wA7jsDTviG3akN+wob7D0hh3xDTvSG3aUN1h6w474hh3pDTvKGyy9YUd8w470hh3lDZbesCO+YUd6w47yBktv2BHfsCO9YUd5g6U37Ihv2JHesKO8wdIbdsQ37Dhyg8M7yhssvWFHfMOO9IYd5Q2W3rAjvmFHesOO8gZLb9gR37AjvWFHeYOlN+yIb9iR3rCjvMHSG3bEN+xIb9hR3mDpDTviG3akN+wob7D0hh3xDTvSG3aUN9gFbxzY4Ua2w41yhxuFpTfsqG/Y0d+ww43G4ht29DfscKPc4UZl/Q073Eh3uFHucKOz+oYdbqQ73Ch3uFFae8MON9odbqQ73CjNjXSHG/EON9IdbpTmRrrDjXhHdeOvHW505ka6w414hxvljhs3SnMj3eFG6tPjNZ3PX27pfP12R+dEeuP83Y7wxo+fdoQ3zmc7Or+efv8fN852lDeen+0ob9hR3niyI71hR3vDjvKGHekNO9IbdrQ37Chv2JHesCO9YUd7w47yhh3pDTvaG3akN+xIb9hR3rCjvcHDY3rDjvSGHeUNO+obdqQ37Ehv2FHesKO+YUd6w470hh3lDTvqG3akN+xIb9hR3rCjvmFHesOO9IYd5Q076ht2pDfsSG/YUd6wo75hR3rDjvSGHeUNO+obdrQ37Ohv/HvHZW/YUd+wI71hR3rDjvKGHfUNO9IbdqQ37Chv2FHfsCO9YUd6w47yhh31DTvSG3akN+wob9hR37AjvWFHesOO8oYd9Q070ht2pDfsKG/YUd+wI71hR3rDjvSGHf2N4zsAN5odbqQ73Eh3uNHucKPc4Ua6w410hxvtDjfKHW6kO9xId7jR7nCj3OFGusONdIcb7Q43yh1upDvcSHe40e5wo9zhRrrDjXSHG+0ON8odbqQ73Eh3uNHucKPc4Ua8ww2CHW6UO9wod7iR7nAj3eFGu8ONcocb6Q430h1utDvcKHe4ke5wI93hRrvDjXKHG+kON9IdbrQ73Ch3uJHucCPd4Ua7w41yhxvpDjfSHW60O9wod7gR73Cj3+HG8R3RDezIbthR3rCjvmFHesOO9IYd5Q076ht2pDfsSG/YUd6w48CNdocb5Q430h1upDvcaHe40e5wo99xeqLY4Ua7w41yhxvpDjfSHW60O9wod7iR7nAj3eFGu8ONcocb6Q430h1utDvcKHe4ke5wI93hRrvDjXKHG+kON9IdbrQ73Ch3uJHucCPd4Ua7w41yhxvpDjfSHW4EOw7e+EMsnaTWYQABFPwYRxFG0MnOJouOMznzcP/LBbSpA4jm1RnqYIcb4Q43rm19w470hh3pDTvCG2x9w470hh3pDTvCG2x9w470hh3pDTvCG2x9w470hh3pDTvCG2x9w470hh3pDTvCG2x9w470hh3pDTvCG2x9w478hh24ke64vwF2VDfsSG/Ykd6wI7zB1jfsSG/Ykd6wI7zB1jfsiG/Y0d+ww43C5jfs6G/Y4Ua5w43G1jfsyG/Y4Ua5w43K1jfsiG/Y4Ua5w43O5jfscKPc4Ua6w43Q1jfscKPf8fEp9smN0LpR73Aj3eFGusON0LpR73Aj3eFGusONdsfnJ8IdP7gR+tGNlBvtjpd5IvP1Tz9/3/vum/dfPZH55bFdCb48XuwIbzw/21HeeG9HeeNhR3jj5fFiR3nDjvSGHekNO8obrznsyG7Ykd6wI71hR3njNYcd2Q070ht2pDfsKG+85rAju2FHesOO8gZb3pDDjuaGHekNO8obbHdDDjuqG3akN+wob7DVDTns6G7Ykd6wo7zBNjfksCO9YUd/ww64v8EWN+Rg0ht2JDf6Hb8+YIsbcjDpDTvSG3aUN9jihhxMesOO9IYd5Q22uCEHk96wI71hR3mDLW7IwaQ37Ehv2FHeYIsbcjDpDTvSG3aUN9jihhxMesOO9IYd5Q22uCEHE9wIdriR7XCj3+EGcjDdDexobthR3mDvbyAHdpQ37Ehv2FHeYK9vIAdMesOO9IYd5Q32+AZywOWO354pdriR7nCj3uEGcsCkN+xIb9hR3mCvbyAHTHrDjvSGHeUN9voGcsCkN+xIb9hR3mCvbyAHTHrDjvSGHeUN9voGcsCkN+xIb9hR3mCvbyAHTHrDjvSGHeUN9voGcsCkN+xIb9jR3cCOuxtygB3pDTvSG3aUN9jrG3IAk96wI71hR3mDvb4hBzDpDTvSG3aUN9jrG3IAk96wI71hR3mDvb4hBzDpDTvSG3aUN9jrG3IAk96wI71hR3mDvb4hBzDpDTvSG3aUN9jrG3IAk93ADoIbdjQ32OsbcgCT3rAjvWFHeYO9uYEcwKQ37Ehv2FHeYI9uyAHYkd6wI71hR3mDvbkhB8CkN+xIb9hR3mBvbsgBMOkNO9IbdpQ32JsbcgBMesOO9IYd5Q324IYcBzvcSHe4Ee9wo9/x5eUghx3ZDTvSG3aUN9ibG3IATHrDjvSGHeUN9uaGHACT3rAjvWFHeYO9uSEHwKQ37Ehv2FHeYA9uyMEbd7iR7nAj3eFGucONqxxMfMOO/oYd4Ea5w427HEx/ww5wI93hRrnDjcscTHvDDt5842CHG+EON25zMO0NO8CNdIcb5Q43rnMw7Q07wI1whxvlDjfuczDxDTv6G3bgRrvDjfscTH/DDtxId7hR73DjPgdT37ADN9IdbvQ73LjPwbQ37MCNeIcb/Q437nMw7Q07cCPc4Ua5w42zHGBHfMOO/oYdbpQ73Chy2OFGusONdIcb5Q43ihx2uJHucCPd4Ua5w40ihx1upDvcKHe4UVo3ihyMG+kON9IdbpTWjSIH40a6w410hxuldaPIwbiR7nAj3eFGad0ocjBulDt+dyPd4UZp3Uhz/PHnM52Pf4Ul+HsfdD5/KnO48eGDHeGNp2/t6Pzz7t2/j97np6c0hxt2lDee7Ehv2JHesCPI4YYd6Q070ht2lDdeZTncsCO9YUd6w472xqsohxt2pDfsSG/YUd941eRww470hh3pDTvKGzQ53LAjvWFHesOO8gZNDjfsSG/Ykd6wo7xBk8MNO8Ib2AHnN+wobxDkcAM7mht2pDfsKG9wnwM3sCO9YUd6w47yBvc5cAM70ht2pDfsKG9wnwM3sCO9YUd6w47yBvc5cAM70ht2pDfsKG9wn8MNsCO9YUd6w47yBvc53AA70ht2pDfsKG/wlhy84YYd5Q070ht2lDe4z+EG2JHesCO9YUd5g/scboAd6Q070ht2lDc4y+FGvMONfsd/7wA7yhtc5XADsCO9YUd6w47yBlc53ADsSG/Ykd6wo7zBQQ430h1upDvcSHe4cbXjcXDDjvSGHekNO8obHORwI9vhRrrDjXSHG3c7Hic37Ehv2JHesKO8wZtz4Ea6w410hxvpDjcudzxObvxPLN2k2FkGUBh8wXC9DR3UiWAGnYyyAH+jJtHE/e9J6EmNm4/DU2so7Ehu2JHesKO8waUcuJHucCPd4Ua6w43tjjO7YUd6w470hh3lDS7kwI1whxvpDjfSHW6sd5zhDTvSG3akN+wob3AxhxvpDjfSHW6kO9zY7zjTG3akN+xIb9hR3uBCDjfSHW6kO9xY7WB8gws53Ah3uJHucKPe4cZ+x1nfsCO9YUd6w47yBhdyuBHtcCPd4Ua/w439jrO/YUd6w470hh3lDV6cw410hxvxDjf6HW7sd5zdDexIb9iR3rCjv2EHnOEN7Ehv2JHesKO8wQtyuBHucONGscONdIcb7Hec6Q3sSG/Ykd6wI75hB5ztDexIb9iR3rCjvMELcrgR7XAj3eFGvcMN9jvO+gZ2pDfsSG/YEd+wAzlwI93hRrrDjX6HG+x3nOCGHc0NO+IbdvQ37OAEN+yIbthR37CD6ze4tuMEN+yobtiR3rCjv2EHJ7hhR3bDjvSGHfkNOzjBDTu6G3akN+yob9jBCW7YEd6wI71hR3zDDk51ww7cSHe4ke5wo9pxoht24Ea6w410hxvZjtPcsAM30h1upDvc6Hac5oYdzG+AHd0NO8obyNHcsCO+YUd/ww43EnK4Ue5wI93hRrnDjYgcbnQ73Eh3uFHucCMjhxvVDje6HT+3N+xwIySHG80ON9IdbqQ73Kh3HDfCHW6kO9xId7gR7zhulDvcSHe4ke5wo91x3Cj94ka6w410hxvpjvNreQI30h2/lSf4/Ubo3B+6Ebx/fH3rfffH+dCN4JtXf956P/x17naUNx7tKG8cO8obr+wIb9zP3Y7yhh3pDTvSG3aUN55z2JHdsCO9YUd6w47yxnMOO7IbdqQ37Ehv2FHeeM5hR3bDjvSGHekNO8obctjR3LAjvWFHesOO7oYcdlQ37Ehv2JHesKO6IYcd3Q070ht2pDfsaG7IYUd5w470hh3pDTuSG3LYkd6wI79hBwxvxDvckMOO9IYd6Q070ht2JDfksCO9YUd6w470hh3JDTnsSG/Ykd6wI71hR3JDDjvSG3akN+xIb9iR3JDDjvSGHekNO9IbdiQ35LAjvWFHesOO9IYdxQ05eEhv2JHesCO9YUdwQ47LOwDcyHa4ke5wo9zhBnJgR3nDjvaGHf0NO/Y3kGO/w410hxvpDjfiHW4gB3akN+xIb9gR37CD/Q059jvcSHe40e5wo9/hBnJgR3rDjvSGHeUN7NjfkAM70ht2tDfs6G/Ysb8hx36HG+kON8odbtDscAPkwI70hh3pDTviG3bsb8ix3+FGusONdIcb/Q43QA54SG/Ykd6wI71hx/yGHGBHesOO9IYd6Q075jfkADvSG3akN+xIb9ixvyHHfsffbjQ73Eh3uJHvcAPkADvSG3akN+xIb9gxvSHHdIcb6Q430h1ulDvcuJDDjvSGHekNO9IbdgxvyLHc4Ua/440bzQ43+h1ugBzDHW70O958PBQ73Ch3uHE5hx3pDTvSG3akN+xY3ZBjtcONdIcb6Q434h1uXM9hR3rDjvIGn9IbdmxuyLHZ4Ua6w412hxv9Djeu57AjvWFHesOO9IYdixtyLHa4ke5wI93hRrnDjUEOO6IbdqQ37Ehv2DG4IcdghxvhDjfSHW6UO9wY5LAjvGFHesOO9IYdgxtyDHa4Ee1wI93hRrnDjUUO7ID1DTvSG3akN+wY3JCDizvcSHe4ke5wo9zhxjqHHeBGusONdIcb5Q431jnsADfSHW6kO9wod7ixzmEHuJHucCPd4Ua5w411DjvAjXSHG+kON8odbqxzYAdupDvcSHe4ke5wY5/DjvSGHekNO67c2O5wY5/Djv6GHbiR7nAj3+HGPocd9Q07cKPd4Ua/w419DjvaG3bgRrrDjXKHG0EOO9yg2OFGusONcocbRQ473Eh3uJHucKPc4UaRww430h1upDvcKHe4UeSww410hxvpDjfKHW4EOeyY3QCww41uhxvlDjeSHHa4ke5wI93hRrrDjSSHHW6kO9xId7iR7nAjyWGHG+kON9IdbsQ73IBtDj67ke5wo/TBjXTHt3fCHP/89Ejn7SH075duBN//+LXM4cbtZkd44+m/Q3fjdrMjvPHu3dcyhxt2lDee7Ehv2JHesCPI4YYd6Q070ht2pDfsCHK4YUd6w470hh3pDTuCHG7Ykd6wI71hR3rDjiKHG3aUN+xob9iR3rAjyeGGHeUNO9obdqQ37EhyuGFHecOO9oYd6Q07khxu2FHesKO9YUd4Azvgf+LtHlXMAoqi6C0eLykiWFi9CEZiBiGkEfyZ/4yE16xS5OOw9xgW51Z3gIMN0VHZoKO1QUdpQ3TscbAhOkobdMQ26Oht0LHHwUasgw3R0dqgI7dBxx4HG7kONkRHa4OO2gYdexxs9DrYEB2tDTpSG3TscbCR6mAj1cFGroMNPddxj22IjtIGHa0NOlIbdGxxsJHqYGOnQw9s0FHaoGOJg41UBxupDjZSHWwMdNzABh2RDTpaG3SkNuhY4WAj1cFGqoONVAcbEx03sEFHZoOO1gYdqQ06FjjYSHWwkepgI9XBxkjHDWzQEdqgo7VBR2qDjgEONjodbKQ62Eh1sDHTcf/LRqqDjVQHG6kONnY6bmKDjtIGHa0NOhY2hjpuY4OO0gYdsQ06eht0PMfBRqqDjVQHG6kONqY6bmWDjtIGHa0NOmIbdDzHwUasg41ex0+vKnSwMdZxAxsDHWyEOthIdbCx1nFDG3SUNuhobdCR2qDjGQ42Uh1spDrYSHWwsddxUxt0hDb0y8BGoIONsY7b2qCjtEFHa4OO1AYdD3Cw0elgI9bBRq+Dja2OW9ugY2Zjr4ONUIfd+PxFSx03t0HHyMZeBxu9Djdlr+P2NugobdBR26Cjt0GHdDMboqO0QUdsg47eBh3S7WyIjtIGHa0NOnobdEg3tCE6Sht0tDboyG3QId3ShugobdDR2qCjtkGHdFMboqO0QUdrg47Qhn6mQ3DsbdBR2qAjtkFHb4MOwSE2Uh1spDrYqHWwob2OW9sQHaUNOkobevsjtkGH4BAbqQ42Uh1s9DrY0F7HBTboSGzQ0dqgo7MhOnSBDToaG3TENujobdChC2zQEdmgo7VBR2+DDl1gg47KBh2tDTpyG3ToAht0ZDboaG3QUdugQxfYoKOzQUdrg47QhuiAg41YBxuhDjZSHWxUOi6wQUdpg47WBh25DTrgYCPVwUaqg41UBxudjkts0FHaoKO1QUdqgw442Eh1sJHqYCPVwUap49hIdbCR6mAj1cFGquPYKHWwkepgI9XBRqvj2Ah1sJHqYCPU8cCG9ETHsdHpYCPVwUaqg41ax7ER6mCj1MFGq4ONWMexUepgo9TBRquDjVbHsZHqYKPUwUasg41Sx/35qq63K1HQ8eurut7+8kdf6riX31+V9f0sR2jj708/vCrrw8dvX/q+/ngvdJQ2jo7Sxic6Shsf6QhtvNwLHaUNOlIbdKQ26ChtvOOgI7NBR2qDjtQGHaWNdxx0ZDboSG3Qkdqgo7TxjoOOzAYdqQ06Uht0lDbgoKOxQUdqg47UBh2dDTjoqGzQkdqgI7VBR2UDDjo6G3SkNuhIbdDR2ICDjtIGHakNOlIbdCQ24KAjtUFHboMOaWgj1sEGHHSkNuhIbdCR2qAjsQEHHakNOlIbdKQ26ChswKF/AhuRDjZSHWzUOtiAI9DBRqeDjVQHG7kONuAIdLCR6WAj1cFGr4MNOAIdbFQ62Eh1sJHrYENw0JHaoCO1QUdoQ799C2zAIToSG3QENgIdbDQ62BAcoqO0QUdrg47eBh17G4Jjr4ONVAcbqQ42Yh1sCA7RkdqgI7VBR2yDDu1twLHXwUaqg41WBxu9DjYEh+hIbdCR2qCjtUGH1jbgEB2pDTpSG3S0NujQ2gYcomNu47mOuQ06cht07G3AsdfBRqqDjVQHG7kONiQ4REdqg47UBh2pDTr2NuCQ6Cht0JHaoCO1QcfcBhxzHWykOthIdbBR6mDjAQ46Eht0pDboSG3QMbcBh0RHaoOO1AYdqQ06tjbg2OpgI9XBRqqDjVDHf9uAY6qDjVQHG6kONkodbDzAQUdqg47UBh2pDTqGNuAY6mAj1cFGqoONUgcbD3HQkdqgI7VBR2qDjpkNOGY62Eh1sJHqYCPVwcZzHHSkNuhIbdCR2qBjZAOOkQ42Uh1spDrYyHWw8RwHHakNOlY2pjrY6HWw8RwHHakNOlIbdKQ26FjYgGOhg41UBxupDjZKHWwMcNAR2aAjtUFHaoOOgQ04BjrYCHWwkepgo9TBxgAHHaENOlIbdKQ26BjYgGOgg41IBxupDjZKHWxMcNCR2qAjtUFHaoOOBzae4BAdoQ06Uht0pDboGNiAQ490sJHqYCPVwUapg401DjokNlIdbLQ62Oh1fGZjhYMOiY1UBxupDjZKHWyscdAhsZHqYCPVwUapg401DtEhNlIdbKQ62Ih1sLHHQUdvgw6xkepgI9bBxh4HHb0NOsRGqoONXAcbexx01DboEButDjZ6HWzscdDR2qBDbKQ62Ch1sBHgoCOxQccjG/8WS69GUgBQFAVfIUaswiDYGBB4DDj+kH80yNbU1K3TMfRghxvlDjeKHHa4ke5wI93hRrnDjSKHHW6kO9xId7hR7nCjyGGHG+kON9IdbpQ73Chy2OFGusONdIcb5Q43khx2uJHucCPd4Ua6w40khx1upDvcSHe4ke5wI8lhhxvpDjfSHW6kO9yA53L81w43Sm60O9xId7hR5nj79dvR+fw+LMH3D+EJfnwpc7jx5o0d4Y3Hw47wxsuLHZ2fj9cvZQ437Ehv2JHesKO88bAjyOGGHekNO9IbdqQ37AhyuGFHesOO9IYd6Q07ghxu2JHesCO9YUd6w44ihxt2pDfsSG/Ykd6wI8nhhh3pDTvSG3akN+xIcrhhR3rDjvSGHekNO4IcbqQ73MAOmN+wo71hB/McbqQ73Ih3uNHvcAM79jncaHe4gR3tDTv6G3bsc7hR73ADO9IbduQ37NjncKPf4QZ2pDfsyG/Ysc/hRr/DDexIb9iR3rBjnsMNsCO9YUd6w470hh3rHG6kO9xId7iR73CD53fIwRM37Chv2JHesCO9YccyhxvpDjfSHW6kO9wY7LjBDTuqG3akN+xIb9ixyuFGusONdIcb6Q43JjtucMOO7oYd6Q070ht2LHK4ke5wI93hRrrDjdGOG9ywo7xhR3rDjvSGHYMcbnQ73Eh3uDHYMbthxySHG80ON9IdbqQ73NjtuMkNO9IbdqQ37FjcGO64zQ070ht2pDfsKG/Y8e65HLiR7nAj3eFGusON6Y4b3BjscCPd4Ua6w43tjpvdsCO9YUd7w47+hh3A7W7Ykd6wI7zBpw/9DTuAG96wI71hR3rDjvyGHcAtb9iR3rAjvWFHfcMO4KY37Ehv2JHesCO+YQdw2xt2pDfsSG/Y0d6wA7jxDTvSG3akN+zIb9gBcoAb6Q430h1u5Dvc2O+4+Q070ht2pDfsCG9gB9z6BnYAuNHucKPf4cZ+x+1v8C29YUd7w47+hh1wuxvYkd6wI71hR3/DDrjhDexIb9iR3rAjv2EH3PIGdqQ37Ehv2FHfsANuegM70ht2pDfsiG/YAbe9gR3pDTvaG3b0N+xADtxId7iR7nCj3+EG6x23voEd6Q070ht2xDfsQA7cSHe4ke5wo9/hBvsdF9ywo7lhR3rDju4GdnDBDTuiG3a0N+zob9jBBTfsqG7Ykd6wo79hBxfcsCO7YUd6w478hh1ccMOO7oYd6Q076ht2cMENOzY3nt7hRrrDjWjHVTfswI10hxvpDjeqHRfdsAM30h1upDvcyHZcc8MO3Eh3uJHucKPbcc0NO3Cj3OFGusONcMe5QbHDjXSHG+kON8od50a6w410hxvpDjfSHedG5GN+ww430h1utDvOjXCHG+kON9IdbsQ7zo1uhxvpDjfSHW7UO86NcIcb6Q430h1uxDvOjXKHG+kON9IdbrQ7zo10hxvpDjfSHW6kO+5XeYLfDzqvf14Id/x90Hn9B6rUZ0+8nsBAAAAAAElFTkSuQmCC)
}

.platform_icon {
  width: 108px;
  height: 116px;
  display: inline-block;
  background-repeat: no-repeat;
  vertical-align: middle
}

.platform_icon img {
  width: 96px;
  height: 96px
}

.platform_icon a {
  display: block;
  width: 100%;
  height: 100%
}

.finder_icon {
  background-image: url(/66f9/img/finder_icon@2x.png);
  background-size: 100%
}

.chrome_icon {
  background-image: url(/272a/img/chrome_icon@2x.png)
}

.windows_icon {
  background-image: url(/0180/img/windows_icon@2x.png);
  background-size: 100%
}

.windows_icon_blue {
  background-image: url(/97d7c/img/windows_icon_blue@2x.png);
  background-size: 100%
}

.mac_icon {
  background-image: url(/0180/img/mac_icon@2x.png);
  background-size: 100%
}

.ubuntu_icon {
  background-image: url(/0180/img/ubuntu_icon@2x.png);
  background-size: 100%
}

.linux_icons_2 {
  background-image: url(/09c2/img/linux_icons_2@2x.png);
  background-size: 100%;
  background-position: 50%
}

.linux_icons_3 {
  background-image: url(/09c2/img/linux_icons_3@2x.png);
  background-size: 100%;
  background-position: 50%
}

.android_icon {
  background-image: url(/97d7c/img/icons/android-200.png);
  background-size: 100%
}

.ios_icon {
  background-image: url(/66f9/img/icons/ios-256.png);
  background-size: 100%
}

.winphone_icon {
  background-image: url(/97d7c/img/icons/winphone-200.png);
  background-size: 100%
}

.platform_icon_140 {
  width: 140px;
  height: 140px
}

.platform_icon_100 {
  width: 100px;
  height: 100px
}

.new_badge {
  position: relative;
  top: -1px;
  display: inline-block;
  padding: 0 4px 1px;
  margin-left: 3px;
  line-height: .9rem;
  border-radius: 3px;
  background: #2D9EE0;
  color: #fff;
  font-size: .64rem;
  text-shadow: none
}

.striped {
  background-image: url(/0180/img/striped_bg.png);
  background-repeat: repeat
}

.delete_link,
a.delete_link {
  color: #AB6767
}

a.delete_link:hover {
  color: #870000
}

@keyframes bouncy_slide {
  60%,
  80%,
  to {
    opacity: 1
  }
  60% {
    transform: translate(0, 2px)
  }
  80% {
    transform: translate(0, -1px)
  }
  to {
    transform: translate(0, 0)
  }
}

.slide_n_fade {
  transform: translate(0, -20px);
  opacity: 0
}

.slide_n_fade.in {
  animation-name: bouncy_slide;
  animation-duration: .3s;
  animation-fill-mode: forwards;
  animation-iteration-count: 1;
  animation-timing-function: ease-out
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

body {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-variant-ligatures: common-ligatures;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  color: #555459;
  line-height: 1.5rem
}

h1,
h2,
h3,
h4,
h5 {
  font-weight: 700;
  font-family: Slack-Lato, appleLogo, sans-serif;
  margin: 0 0 1rem
}

h1 {
  font-size: 2rem;
  line-height: 2.5rem;
  letter-spacing: -1px
}

h2 {
  font-size: 1.75rem;
  line-height: 2rem
}

h3 {
  font-size: 1.5rem;
  line-height: 1.75rem
}

h4 {
  font-size: 1.25rem;
  line-height: 1.5rem;
  margin-bottom: .5rem
}

h5 {
  font-size: .9rem;
  margin-bottom: 0;
  text-transform: uppercase;
  letter-spacing: 1px
}

h1.large {
  font-size: 3.5rem;
  line-height: 4rem;
  letter-spacing: -2px
}

.header_icon {
  width: 1.4rem;
  font-size: 1.25rem;
  display: block;
  float: left;
  line-height: 1.8rem;
  text-align: center;
  margin-right: .5rem
}

h1 i:first-of-type {
  margin-right: .75rem;
  font-size: 30px;
  float: left
}

a,
a:link,
a:visited {
  color: #007AB8;
  text-decoration: none
}

.no_touch a:hover,
a.active {
  text-decoration: underline
}

a:active {
  color: #007AB8
}

a.sub_link {
  color: #9e9ea6
}

p {
  margin: 0 0 1rem
}

a.small,
div.small,
p.small,
span.small,
table.small td,
ul.small li {
  font-size: 1rem
}

b.tiny,
i.tiny,
p.tiny,
span.tiny {
  font-size: .9375rem
}

p.large {
  font-size: 1.5rem;
  line-height: 2rem
}

code.small,
pre.small {
  font-size: .8rem
}

div.mini,
p.mini,
span.mini {
  font-size: .8rem;
  line-height: 1rem;
  font-family: "Helvetica Neue", Helvetica, "Segoe UI", Tahoma, Arial, sans-serif
}

a.small_height,
div.small_height,
i.small_height,
p.small_height,
span.small_height,
strong.small_height,
ul.small_height {
  line-height: 1rem
}

a.medium_height,
div.medium_height,
i.medium_height,
p.medium_height,
span.medium_height,
strong.medium_height,
ul.medium_height {
  line-height: 1.5rem
}

a.large_height,
div.large_height,
i.large_height,
p.large_height,
span.large_height,
strong.large_height,
ul.large_height {
  line-height: 2rem
}

.para_break {
  display: block;
  height: .5rem
}

.help {
  font-size: 1rem;
  color: #9e9ea6;
  line-height: 1.3rem;
  padding-top: 1rem;
  border-top: 5px solid #2ab27b;
  margin: 2rem 0
}

code,
pre {
  font-size: 14px;
  font-family: Consolas, monaco, "Ubuntu Mono", courier, monospace!important;
  border: 1px solid #E8E8E8;
  padding: .1rem .4rem;
  border-radius: .2rem;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  tab-size: 4;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  -webkit-tab-size: 4
}

pre {
  margin: 0 0 1rem;
  background-image: url(/4666/img/snippet_bg.png);
  background-repeat: repeat;
  overflow-x: scroll;
  white-space: pre
}

code {
  background: #F9F9F9;
  color: #c25;
  font-size: .75rem;
  padding: 2px 3px 1px;
  white-space: normal
}

code.special_formatting a {
  color: inherit
}

@media screen and (-webkit-min-device-pixel-ratio:0) {
  code {
    padding-left: .25rem;
    padding-right: 0
  }
  code:after,
  code:before {
    letter-spacing: -.25rem;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text
  }
  code:after {
    content: "\00a0"
  }
  pre code:after,
  pre code:before {
    letter-spacing: normal;
    content: ""
  }
}

pre code {
  background: 0 0;
  border: none;
  padding: 0;
  color: #555459;
  font-size: inherit;
  white-space: pre
}

code.larger {
  font-size: .9rem
}

pre.special_formatting {
  margin: .5rem 0 .2rem;
  font-size: .75rem;
  line-height: 1.15rem;
  overflow-x: auto;
  background: #fbfaf8;
  padding: .5rem;
  word-break: normal;
  white-space: pre;
  white-space: pre-wrap
}

pre.special_formatting a {
  color: inherit
}

hr {
  border: none;
  border-top: 1px solid #E8E8E8;
  margin: 2rem auto;
  clear: both
}

ol,
ul {
  padding-left: 0;
  margin-left: 2rem
}

ul {
  margin: 0 0 1rem 2rem
}

ul.no_bullets li {
  list-style-type: none;
  clear: both
}

ul.compact li,
ul.compact p {
  margin-bottom: .25rem
}

dl {
  margin: 0 0 1.25rem;
  padding-left: 1.25rem;
  position: relative
}

dl:before {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 3px;
  display: block;
  content: '';
  border-radius: 2px;
  background-color: #E8E8E8
}

dl.purple_bar:before {
  background: #7D60C5
}

dl dd,
dl dt {
  line-height: 1;
  font-size: .9375rem
}

dl dt {
  font-weight: 600
}

dl dd {
  color: #434245;
  margin: 0;
  padding: 0
}

dl dd+dd {
  margin-top: .5rem
}

s {
  position: relative
}

s::after {
  border-bottom: 2px solid #555459;
  content: "";
  left: 0;
  position: absolute;
  right: 0;
  top: 47%
}

.pill {
  background: #2ab27b;
  color: #fff;
  padding: .2rem .8rem .3rem;
  border-radius: 1rem;
  font-size: .9rem;
  margin: 0 .1rem;
  white-space: nowrap;
  position: relative
}

.pill i.ts_icon_times_circle {
  position: absolute;
  right: 2px;
  top: 0;
  line-height: 1.5rem
}

.pill i.ts_icon_plus:before {
  vertical-align: bottom
}

.pill_action {
  font-size: .9rem;
  color: #fff;
  text-shadow: none;
  position: absolute;
  right: 8px;
  opacity: .5;
  -moz-opacity: .5;
  -khtml-opacity: .5
}

.pill:active {
  color: #fff
}

.pill_container {
  line-height: 2rem
}

.show_pill_action .pill:not(.no_pill_action) {
  padding-right: 1.8rem
}

.pill:hover .pill_action.edit,
.pill_action:hover {
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .15);
  opacity: 1;
  -moz-opacity: 1;
  -khtml-opacity: 1
}

@media only screen and (max-width:640px) {
  h1 {
    font-size: 1.75rem;
    line-height: 2rem
  }
  h2 {
    font-size: 1.5rem;
    line-height: 1.75rem
  }
  h3 {
    font-size: 1.25rem;
    line-height: 1.5rem
  }
  h4 {
    font-size: 1.1rem;
    line-height: 1.25rem
  }
  h1.large {
    font-size: 2.25rem;
    line-height: 2.5rem;
    letter-spacing: -1px
  }
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

body,
html {
  width: 100%;
  overflow-x: hidden
}

body {
  margin: 0;
  background: #F9F9F9;
  font-size: 1.125rem
}

html.no_scroll {
  overflow-y: hidden
}

#page,
.log_output,
header {
  width: 100%;
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transition: -webkit-transform .15s cubic-bezier(.2, .3, .25, .9);
  -moz-transition: -moz-transform .15s cubic-bezier(.2, .3, .25, .9);
  transition: transform .15s cubic-bezier(.2, .3, .25, .9)
}

.is_safari_desktop #page,
.is_safari_desktop .log_output,
.is_safari_desktop header {
  -webkit-transition: none;
  -moz-transition: none;
  transition: none
}

#header_logo {
  display: inline-block;
  padding: 1.4rem 1.2rem 1rem;
  height: 5rem
}

#header_logo img {
  width: 120px;
  height: 36px;
  border: none
}

#page {
  top: 0;
  left: 0;
  bottom: 0;
  right: 0
}

#page_contents {
  margin: 0 auto;
  padding: 8rem 2rem
}

body.no_header #page_contents {
  padding-top: 2rem
}

.section_contents {
  max-width: 1024px;
  margin: auto;
  padding: 4rem 2rem
}

@media only screen and (max-width:640px) {
  .section_contents {
    padding: 2rem 1rem
  }
}

.full_width_fixed_section {
  position: fixed;
  z-index: 1040;
  max-width: 1024px;
  width: 100%
}

body.full_height #page {
  overflow: auto
}

body.full_bleed #page_contents {
  width: auto;
  padding: 0
}

body.full_bleed section:first-of-type {
  padding-top: 8rem
}

@media only screen and (max-width:767px) {
  body.full_bleed section:first-of-type {
    padding-top: 7rem
  }
}

@media only screen and (max-width:640px) {
  body.full_bleed section:first-of-type {
    padding-top: 3rem
  }
}

body.deprecated {
  margin-top: 2rem;
  position: relative
}

#nojs_banner {
  width: 100%;
  padding: .75rem 2rem;
  text-align: center;
  font-size: 1rem;
  line-height: 1.5rem;
  background: #FFFCE0;
  border-bottom: 1px solid #DFA941;
  border-top: 1px solid #DFA941;
  position: fixed;
  margin-top: 5rem;
  z-index: 1000
}

nav#site_nav {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: #3C4B5B;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  -webkit-transform: translate3d(-280px, 0, 0);
  -moz-transform: translate3d(-280px, 0, 0);
  -ms-transform: translate3d(-280px, 0, 0);
  transform: translate3d(-280px, 0, 0);
  -webkit-transition: -webkit-transform .15s cubic-bezier(.2, .3, .25, .9);
  -moz-transition: -moz-transform .15s cubic-bezier(.2, .3, .25, .9);
  transition: transform .15s cubic-bezier(.2, .3, .25, .9)
}

nav#site_nav #site_nav_contents {
  flex: 1
}

nav#site_nav #user_menu_contents {
  color: #fff;
  font-weight: 700;
  display: block;
  cursor: pointer;
  height: 5rem;
  padding-top: 1rem
}

html.no_touch nav#site_nav #user_menu_contents:hover {
  background: #435466
}

html.no_touch nav#site_nav #user_menu_contents:hover .member_type_badge .member_type_badge_background_ra #badge_bg,
html.no_touch nav#site_nav #user_menu_contents:hover .member_type_badge .member_type_badge_background_ura #badge_bg {
  fill: #435466
}

nav#site_nav #user_menu_avatar {
  float: left;
  margin: 0 1rem 0 1.5rem
}

nav#site_nav #user_menu_avatar .thumb_48 {
  display: block
}

nav#site_nav #user_menu_avatar .thumb_36 {
  display: none
}

nav#site_nav #user_menu_avatar .member_type_badge .member_type_badge_background_ra #badge_bg,
nav#site_nav #user_menu_avatar .member_type_badge .member_type_badge_background_ura #badge_bg {
  fill: #F9F9F9
}

nav#site_nav #user_menu_name {
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 175px;
  margin-top: -5px;
  margin-bottom: -4px;
  color: #fff
}

nav#site_nav .nav_contents {
  padding: .5rem 1.5rem 1rem
}

nav#site_nav .nav_contents ul:last-child {
  margin-bottom: 0
}

nav#site_nav h3 {
  text-transform: uppercase;
  margin-bottom: 0;
  color: #6B7682;
  font-weight: 400;
  letter-spacing: .5px;
  font-size: .8rem
}

nav#site_nav ul {
  list-style: none;
  padding: 0;
  margin-top: 0;
  margin-bottom: 1.5rem;
  margin-left: 0
}

nav#site_nav ul a,
nav#site_nav ul a:active,
nav#site_nav ul a:hover,
nav#site_nav ul a:link,
nav#site_nav ul a:visited {
  color: #fff;
  text-decoration: none;
  padding: .25rem 0;
  display: block;
  font-size: 1rem;
  font-weight: 700
}

html.no_touch nav#site_nav ul a:hover {
  text-decoration: underline
}

nav#site_nav ul a i {
  margin-right: .75rem
}

nav#site_nav ul.primary_nav i {
  float: left
}

nav#site_nav .ts_icon_file,
nav#site_nav .ts_icon_home {
  color: #5F9EEE
}

nav#site_nav .ts_icon_dashboard,
nav#site_nav .ts_icon_user {
  color: #76C187
}

nav#site_nav .ts_icon_magic,
nav#site_nav .ts_icon_plug {
  color: #DEB63B
}

nav#site_nav .ts_icon_archive {
  color: #9E7DA6
}

nav#site_nav .ts_icon_team_directory {
  color: #DE797C
}

nav#site_nav #footer {
  padding: 1.5rem
}

nav#site_nav #footer_nav {
  margin-bottom: .5rem
}

nav#site_nav #footer_nav a {
  font-size: .9rem;
  color: #B1B7BD
}

nav#site_nav #footer_signature {
  color: #eb4d5c;
  font-size: .9rem;
  margin-bottom: 0
}

.is_safari_desktop nav#site_nav {
  -webkit-transition: none;
  -moz-transition: none;
  transition: none
}

.nav_open nav#site_nav {
  -webkit-transform: translate3d(0, 0, 0);
  -moz-transform: translate3d(0, 0, 0);
  -ms-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0)
}

.nav_open nav#site_nav #user_menu_avatar .member_type_badge .member_type_badge_background_ra #badge_bg,
.nav_open nav#site_nav #user_menu_avatar .member_type_badge .member_type_badge_background_ura #badge_bg {
  fill: #3C4B5B
}

.nav_open #page,
.nav_open .log_output,
.nav_open header,
.nav_open nav.top {
  -webkit-transform: translate3d(280px, 0, 0);
  -moz-transform: translate3d(280px, 0, 0);
  -ms-transform: translate3d(280px, 0, 0);
  transform: translate3d(280px, 0, 0)
}

.nav_open #menu_toggle {
  color: #3aa3e3;
  text-decoration: none
}

.nav_open #menu_toggle .menu_icon {
  background-position: 0 2px
}

.nav_open #overlay {
  display: block;
  background-color: rgba(0, 0, 0, .1)
}

#overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  z-index: 1000;
  display: none;
  background-color: rgba(0, 0, 0, 0);
  -webkit-transition: background-color .15s ease-out 0s;
  -moz-transition: background-color .15s ease-out 0s;
  transition: background-color .15s ease-out 0s
}

header {
  background: #fff;
  height: 5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100
}

header.empty {
  background: 0 0;
  height: auto;
  box-shadow: none;
  position: static
}

header #menu_toggle {
  display: inline-block;
  height: 5rem;
  color: #404B55;
  font-weight: 700;
  padding: 1.8rem 1.7rem 1.6rem 2rem;
  float: left;
  position: relative;
  -webkit-transition: -webkit-transform .15s cubic-bezier(.2, .3, .25, .9);
  -moz-transition: -moz-transform .15s cubic-bezier(.2, .3, .25, .9);
  transition: transform .15s cubic-bezier(.2, .3, .25, .9)
}

header .vert_divider {
  height: 2.5rem;
  border-left: 1px solid #DDD;
  display: inline-block;
  margin: 1.25rem 0;
  position: absolute;
  top: 0;
  right: 0
}

header #header_team_name {
  margin-bottom: 0;
  -webkit-transition: -webkit-transform .15s cubic-bezier(.2, .3, .25, .9);
  -moz-transition: -moz-transform .15s cubic-bezier(.2, .3, .25, .9);
  transition: transform .15s cubic-bezier(.2, .3, .25, .9)
}

header #header_team_name a {
  max-width: 450px;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: #404B55;
  font-size: 1.4rem;
  font-weight: 700;
  float: left;
  padding: 1.4rem 1rem 1rem;
  margin-bottom: 0;
  cursor: pointer
}

header #header_team_name a i {
  font-size: 28px;
  width: 36px;
  margin: -2px .5rem 0;
  display: block;
  float: left
}

header .menu_icon {
  background-image: url(/07fd/img/icn_menu.png);
  background-repeat: no-repeat;
  width: 24px;
  height: 20px;
  display: inline-block;
  margin-right: 1rem;
  background-position: 0 -21px;
  float: left
}

html.no_touch header #header_team_name a:hover,
html.no_touch header #menu_toggle:hover {
  color: #3aa3e3;
  text-decoration: none
}

html.no_touch header #header_team_name a:hover .menu_icon,
html.no_touch header #menu_toggle:hover .menu_icon {
  background-position: 0 2px
}

header .header_nav {
  position: absolute;
  right: 0;
  top: 0;
  height: 5rem
}

header .header_links {
  margin-right: .75rem
}

header .header_links a {
  padding: 1.7rem .75rem;
  color: #404B55;
  display: inline-block;
  font-size: 1rem;
  font-weight: 700
}

header .header_links a.active {
  padding: .45rem .75rem .4rem;
  border-radius: .25rem;
  text-decoration: none;
  background: #F9F9F9
}

header .header_btn {
  margin: 1.4rem 1.4rem 1.4rem 0
}

header .header_btns .btn_basic,
header .header_btns a {
  text-align: center;
  font-size: .8rem;
  color: #404B55;
  cursor: pointer;
  display: inline-block;
  float: left;
  font-weight: 700;
  padding: 1.4rem 1.2rem .6rem;
  line-height: 1.25rem
}

header .header_btns .btn_basic i,
header .header_btns a i {
  font-size: 28px;
  width: 28px
}

header .header_btns .btn_basic .label,
header .header_btns a .label {
  color: #717274;
  margin-left: -1px
}

header .header_btns .btn_basic img,
header .header_btns a img {
  margin: -4px .5rem 2px;
  width: 30px;
  height: 30px
}

header #header_team_nav {
  display: none;
  position: absolute;
  top: 90%;
  right: 9.5rem;
  background: #fff;
  list-style: none;
  margin: 0;
  min-width: 260px;
  padding: .25rem;
  border: 1px solid #DDD;
  border-radius: .25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .5);
  font-weight: 700;
  max-height: 340px;
  overflow-y: auto
}

header #header_team_nav li a {
  padding: .25rem;
  display: block;
  color: #555459;
  border-radius: .25rem;
  font-size: 1rem;
  height: 2.75rem
}

header #header_team_nav li a .team_name {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 160px;
  display: inline-block
}

header #header_team_nav li a .switcher_label {
  line-height: 2.25rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 185px;
  display: inline-block
}

header #header_team_nav li a .team_icon.ts_icon_plus {
  background: #E8E8E8;
  color: #9e9ea6;
  font-size: 18px;
  text-shadow: none
}

header #header_team_nav li a .active_icon {
  float: right;
  padding: .2rem .7rem
}

header #header_team_nav li a .active_icon~.switcher_label {
  max-width: 155px
}

header #header_team_nav li.active a {
  background: #F9F9F9
}

header #header_team_nav #add_team_option {
  border-top: 2px solid #E8E8E8;
  margin-top: .25rem;
  padding-top: .25rem
}

header #header_team_nav #add_team_option .switcher_label {
  font-size: .9rem
}

html.no_touch header #header_team_nav li a:hover {
  background: #F9F9F9;
  text-decoration: none
}

html.no_touch header .header_btns .btn_basic:hover,
html.no_touch header .header_btns a:hover {
  text-decoration: none;
  color: #3aa3e3
}

html.no_touch header .header_btns .btn_basic:hover .label,
html.no_touch header .header_btns a:hover .label {
  color: #3aa3e3
}

header #header_team_nav.open {
  display: block
}

header .deprecate_banner.alert_page {
  background-color: #2c2d30;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, .15)
}

header .deprecate_banner.alert_page ts-icon {
  vertical-align: middle;
  margin: 0 4px
}

.headroom--pinned {
  -webkit-transform: translateY(0);
  -moz-transform: translateY(0);
  -ms-transform: translateY(0);
  transform: translateY(0)
}

.headroom--unpinned {
  -webkit-transform: translateY(-100%);
  -moz-transform: translateY(-100%);
  -ms-transform: translateY(-100%);
  transform: translateY(-100%)
}

.log_output:first-child {
  margin-top: 5rem
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  header .menu_icon {
    background-image: url(/0180/img/icn_menu@2x.png);
    background-size: 100%
  }
}

.card {
  background-color: #fff;
  border-radius: .25rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, .25);
  padding: 2rem 2rem 1rem;
  margin: 0 auto 2rem;
  position: relative;
  border: 1px solid #E8E8E8
}

.card.compact {
  padding: 1rem
}

.card.framed {
  border-width: 2px;
  box-shadow: none
}

.card.card_info {
  border-color: #3aa3e3
}

.card.card_warning {
  border-color: #EDB431
}

.card.card_success {
  border-color: #2ab27b
}

.card.card_error {
  border-color: #CB5234
}

.card h3 a {
  color: #555459
}

@media only screen and (min-width:1024px) {
  .card.card--thick_sides {
    padding: 2rem 2.6rem
  }
}

.member_card {
  display: flex;
  padding: .75rem;
  border-radius: 5px;
  border: 1px solid #E8E8E8
}

.member_card_details {
  align-self: center
}

.plastic_row {
  display: block;
  border-radius: .25rem;
  padding: .5rem;
  margin: 0 0 .25rem;
  position: relative;
  padding-left: 4.5rem;
  padding-right: 100px;
  border: 1px solid transparent
}

.plastic_row h3 {
  margin-top: -.1rem;
  margin-bottom: 0;
  color: #555459
}

.plastic_row h4 {
  margin-bottom: .1rem
}

.plastic_row h4 a {
  color: #555459
}

.plastic_row .icon {
  color: #fff;
  width: 48px;
  height: 48px;
  font-size: 30px;
  text-align: center;
  line-height: 48px;
  border-radius: .25rem;
  float: left;
  margin-left: -4rem;
  cursor: pointer
}

.plastic_row .icon:before {
  font-size: inherit
}

.plastic_row .chevron {
  position: absolute;
  right: 1rem;
  top: 1.4rem;
  font-size: 1.5rem;
  color: #E8E8E8
}

.plastic_row .btn:not(.inline_block) {
  position: absolute;
  right: 1rem;
  top: .9rem
}

.plastic_row .description {
  color: #717274;
  display: block;
  word-wrap: break-word;
  word-break: break-word;
  margin-right: 5rem
}

.plastic_row:active {
  background: #FBFBFA;
  border-color: #E8E8E8;
  text-decoration: none
}

.plastic_row:active h3 {
  text-decoration: none
}

.plastic_row:active .chevron {
  color: #555459
}

html.no_touch .plastic_row:hover {
  background: #FBFBFA;
  border-color: #E8E8E8;
  text-decoration: none
}

html.no_touch .plastic_row:hover h3 {
  text-decoration: none
}

html.no_touch .plastic_row:hover .chevron {
  color: #555459
}

@media only screen and (max-width:640px) {
  .plastic_row {
    padding-left: 3.25rem
  }
  .plastic_row .icon {
    width: 32px;
    height: 32px;
    font-size: 1.5rem;
    line-height: 32px;
    margin-left: -2.75rem
  }
  .plastic_row .chevron {
    display: none
  }
  .plastic_row .btn {
    position: relative;
    top: 0;
    right: 0;
    margin-top: .25rem
  }
  .plastic_row .description {
    margin-right: 0
  }
}

.tab_set {
  position: relative;
  max-height: 3rem;
  display: flex
}

.tab_set a {
  padding: 12px 32px 11px;
  font-weight: 700;
  margin-bottom: -1px;
  border: 1px solid transparent;
  border-top-right-radius: .25rem;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: .25rem;
  background-clip: padding-box;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%
}

.tab_set.compressed a {
  padding-left: 22px;
  padding-right: 22px
}

.tab_set a.secondary.selected,
.tab_set a.selected {
  border: 1px solid #E8E8E8;
  background: #fff;
  border-bottom-color: #fff;
  color: #555459;
  cursor: default
}

.tab_set a.selected.is_linked {
  cursor: pointer
}

.tab_set a.selected:hover {
  text-decoration: none
}

.tab_set a.secondary {
  margin-left: auto;
  color: #9e9ea6
}

.tab_set a.secondary~a.secondary {
  margin-left: 0
}

.tab_set .tab_caret {
  display: none
}

.tab_pane {
  display: none;
  background: #fff;
  border-radius: 0 0 .25rem .25rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, .25);
  padding: 2rem 2rem 1rem;
  margin: 0 auto 3rem;
  border: 1px solid #E8E8E8
}

.tab_pane.selected {
  display: block
}

.tab_pane.selected.display_flex {
  display: flex
}

.tab_actions {
  background: #fff;
  height: 4.5rem;
  padding: 1rem;
  border: 1px solid #E8E8E8;
  margin-bottom: -1px
}

.admin_tabs a,
.customize_tab_set a {
  padding: 12px 22px 11px
}

.accordion_section {
  border-bottom: 1px solid #E8E8E8;
  padding: 1rem 6rem 1rem 0;
  position: relative
}

.accordion_section h4,
.accordion_section h4 a {
  color: #3C4B5B
}

.no_touch .accordion_section h4 a:hover {
  color: #3aa3e3
}

.accordion_section:last-of-type {
  border-bottom: 0
}

.accordion_expand,
.accordion_expand.btn {
  position: absolute;
  top: 1rem;
  right: 0;
  text-transform: lowercase
}

.accordion_section_fixed {
  border-bottom: 1px solid #E8E8E8!important
}

.prevent_copy_paste:before {
  content: attr(aria-label)
}

@media only screen and (min-width:1441px) {
  .widescreen:not(.nav_open) nav#site_nav {
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    background: 0 0;
    margin-top: 5.5rem;
    position: absolute;
    z-index: 100;
    text-shadow: none;
    overflow: visible
  }
  .widescreen:not(.nav_open) nav#site_nav h3 {
    color: #555459
  }
  .widescreen:not(.nav_open) nav#site_nav ul a,
  .widescreen:not(.nav_open) nav#site_nav ul a:active,
  .widescreen:not(.nav_open) nav#site_nav ul a:hover,
  .widescreen:not(.nav_open) nav#site_nav ul a:link,
  .widescreen:not(.nav_open) nav#site_nav ul a:visited {
    color: #555459
  }
  .widescreen:not(.nav_open) nav#site_nav #user_menu_name {
    color: #555459
  }
  html.no_touch .widescreen:not(.nav_open) nav#site_nav #user_menu_contents:hover {
    background: 0 0
  }
  html.no_touch .widescreen:not(.nav_open) nav#site_nav #user_menu_contents:hover .member_type_badge .member_type_badge_background_ra #badge_bg,
  html.no_touch .widescreen:not(.nav_open) nav#site_nav #user_menu_contents:hover .member_type_badge .member_type_badge_background_ura #badge_bg {
    fill: #F9F9F9
  }
  .widescreen:not(.nav_open) nav#site_nav #user_menu_contents {
    cursor: default
  }
  .widescreen:not(.nav_open) nav#site_nav #footer_nav a {
    color: #9e9ea6
  }
  .widescreen:not(.nav_open) header #menu_toggle {
    -webkit-transform: translate3d(-146px, 0, 0);
    -moz-transform: translate3d(-146px, 0, 0);
    -ms-transform: translate3d(-146px, 0, 0);
    transform: translate3d(-146px, 0, 0);
    -webkit-transition: -webkit-transform .15s cubic-bezier(.2, .3, .25, .9);
    -moz-transition: -moz-transform .15s cubic-bezier(.2, .3, .25, .9);
    transition: transform .15s cubic-bezier(.2, .3, .25, .9)
  }
  .widescreen:not(.nav_open) header #header_team_name {
    -webkit-transform: translate3d(-146px, 0, 0);
    -moz-transform: translate3d(-146px, 0, 0);
    -ms-transform: translate3d(-146px, 0, 0);
    transform: translate3d(-146px, 0, 0);
    -webkit-transition: -webkit-transform .15s cubic-bezier(.2, .3, .25, .9);
    -moz-transition: -moz-transform .15s cubic-bezier(.2, .3, .25, .9);
    transition: transform .15s cubic-bezier(.2, .3, .25, .9)
  }
  .widescreen:not(.nav_open) #page_contents.full_width {
    padding-left: 280px
  }
}

@media only screen and (min-width:1440px) and (max-height:768px) {
  .widescreen:not(.nav_open) nav#site_nav {
    margin-top: 4.5rem
  }
  .widescreen:not(.nav_open) header #header_team_name {
    -webkit-transform: translate3d(-124px, 0, 0);
    -moz-transform: translate3d(-124px, 0, 0);
    -ms-transform: translate3d(-124px, 0, 0);
    transform: translate3d(-124px, 0, 0)
  }
  .widescreen:not(.nav_open) header i {
    margin: 0 .25rem 0 0
  }
}

@media only screen and (max-height:768px),
screen and (max-width:640px) {
  #page_contents {
    padding: 6rem 2rem
  }
  body.no_header #page_contents {
    padding-top: 2rem
  }
  header {
    height: 4rem
  }
  header #menu_toggle {
    height: 4rem;
    padding: 1.4rem
  }
  header .vert_divider {
    margin: .75rem 0
  }
  header #header_team_name {
    padding: 0;
    line-height: 1.7rem
  }
  header #header_team_name a {
    padding-top: 1.25rem
  }
  header #header_logo {
    padding: .9rem;
    height: 4rem
  }
  header .header_links a {
    padding: 1.3rem .7rem
  }
  header .header_btn {
    margin: .9rem .9rem .9rem .7rem
  }
  header .header_btns .btn_basic,
  header .header_btns a {
    line-height: 1.2rem;
    padding: .9rem 1rem .4rem
  }
  header .header_btns .btn_basic i,
  header .header_btns a i {
    font-size: 24px
  }
  header .header_btns .btn_basic img,
  header .header_btns a img {
    margin-top: -3px;
    margin-bottom: 3px;
    width: 26px;
    height: 26px
  }
  header #header_team_nav {
    top: 73%;
    right: 9rem
  }
  .log_output:first-child {
    margin-top: 4rem
  }
  nav#site_nav #user_menu_contents {
    height: 4rem;
    padding-top: .7rem
  }
  nav#site_nav #user_menu_avatar {
    margin-right: .75rem;
    margin-top: .3rem
  }
  nav#site_nav #user_menu_avatar .thumb_48 {
    display: none
  }
  nav#site_nav #user_menu_avatar .thumb_36 {
    display: block
  }
}

@media only screen and (min-width:1024px) {
  #page_contents {
    width: 1024px
  }
  .full_width_fixed_section {
    left: 50%;
    margin-left: -512px
  }
}

@media only screen and (max-width:1024px) {
  .tab_set a {
    padding: 12px 16px 11px;
    font-size: 1rem
  }
}

@media only screen and (max-width:768px) {
  .tab_set {
    height: 3rem;
    z-index: 10;
    margin-bottom: -1px;
    display: block
  }
  .tab_set a {
    display: block;
    position: absolute;
    width: 100%;
    background: #fff;
    border: 1px solid #E8E8E8;
    padding: 12px 3rem 11px 1rem;
    cursor: pointer;
    border-top-right-radius: .25rem;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-top-left-radius: .25rem;
    background-clip: padding-box
  }
  html.no_touch .tab_set .tab_caret:hover,
  html.no_touch .tab_set a:hover {
    background: #FBFBFA
  }
  .tab_set a.secondary.selected,
  .tab_set a.selected {
    z-index: 10;
    border-bottom-color: #E8E8E8;
    cursor: pointer
  }
  .tab_set .tab_caret {
    position: absolute;
    top: 11px;
    right: 24px;
    z-index: 1000;
    font-size: 28px;
    cursor: pointer
  }
  .tab_set .tab_caret.ts_icon_caret_down {
    display: inline-block
  }
  html.no_touch .tab_set:not(.open):hover a:first-of-type {
    background: #FBFBFA
  }
  .tab_set.open a {
    position: relative;
    border-radius: 0
  }
  .tab_set.open a:first-of-type {
    border-top-right-radius: .25rem;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-top-left-radius: .25rem;
    background-clip: padding-box
  }
  .tab_set.open a.secondary {
    float: none
  }
  .tab_set.open .tab_caret.ts_icon_caret_up {
    display: inline-block;
    top: 10px
  }
  .tab_set.open .tab_caret.ts_icon_caret_down {
    display: none
  }
  .tab_pane {
    padding: 2rem 1rem 1rem
  }
  header .header_btns .btn_basic img,
  header .header_btns a img {
    float: none
  }
  header #header_team_name a {
    max-width: 320px
  }
  .full_width_fixed_section {
    padding: 0 1rem
  }
}

@media only screen and (max-height:768px) {
  header #header_team_name a i {
    margin: -2px .25rem 0 0
  }
  nav#site_nav #user_menu_name {
    margin-top: -8px
  }
  .full_width_fixed_section {
    padding: 0 1rem
  }
}

@media only screen and (max-width:640px) {
  #page_contents {
    width: 100%;
    padding: 1rem .8rem;
    margin-top: 4rem
  }
  body.no_header #page_contents {
    padding-top: 1rem;
    margin-top: 0
  }
  #nojs_banner {
    margin-top: 4rem
  }
  nav#site_nav {
    width: 260px;
    -webkit-transform: translate3d(-260px, 0, 0);
    -moz-transform: translate3d(-260px, 0, 0);
    -ms-transform: translate3d(-260px, 0, 0);
    transform: translate3d(-260px, 0, 0)
  }
  nav#site_nav #user_menu_name {
    margin-top: -5px
  }
  .nav_open #page,
  .nav_open header,
  .nav_open nav.top {
    -webkit-transform: translate3d(260px, 0, 0);
    -moz-transform: translate3d(260px, 0, 0);
    -ms-transform: translate3d(260px, 0, 0);
    transform: translate3d(260px, 0, 0)
  }
  header #header_team_name a {
    max-width: 272px;
    font-size: 1.2rem
  }
  header #header_team_name a i {
    font-size: 26px;
    margin: 0
  }
  header #menu_toggle {
    padding-right: .4rem
  }
  header .header_links,
  header .menu_label {
    display: none
  }
  header .header_btns .btn_basic,
  header .header_btns a {
    padding: 1.4rem .5rem 1.1rem
  }
  header .header_btns .btn_basic .label,
  header .header_btns a .label {
    display: none!important
  }
  header .header_btns .btn_basic img,
  header .header_btns a img {
    margin-right: .25rem;
    margin-left: 0
  }
  header #header_team_nav {
    right: 6rem
  }
  .tab_set a {
    padding-left: .8rem;
    font-size: 1rem
  }
  .tab_pane {
    padding: 1rem .8rem
  }
  .card {
    padding: 1rem
  }
  .header_icon {
    margin-left: 0
  }
  .accordion_section {
    padding-right: 0
  }
  .accordion_section>h4 {
    margin-right: 5rem
  }
  .accordion_expand {
    top: .75rem
  }
}

@media only screen and (max-width:480px) {
  header #header_team_name a {
    max-width: 254px
  }
  header #help_link {
    display: none
  }
  header #header_team_nav {
    right: .5rem
  }
}

@media only screen and (max-width:400px) {
  header #header_team_name a {
    max-width: 174px
  }
  header #header_team_nav {
    right: .1rem
  }
}

section {
  clear: both;
  padding: 0;
  margin: 0;
  width: 100%
}

.col {
  display: block;
  float: left;
  margin: 0 0 2%;
  padding-right: 2%
}

.col+.col {
  margin-left: 1.6%
}

.span_1_of_1 {
  width: 100%;
  padding-right: 0
}

.span_1_of_2 {
  width: 49.2%
}

.span_2_of_2 {
  width: 100%;
  padding-right: 0
}

.span_1_of_3 {
  width: 32.26%
}

.span_2_of_3 {
  width: 66.13%
}

.span_3_of_3 {
  width: 100%;
  padding-right: 0
}

.span_1_of_4 {
  width: 23.8%
}

.span_2_of_4 {
  width: 49.2%
}

.span_3_of_4 {
  width: 74.6%
}

.span_4_of_4 {
  width: 100%;
  padding-right: 0
}

.span_1_of_5 {
  width: 18.72%
}

.span_2_of_5 {
  width: 39.04%
}

.span_3_of_5 {
  width: 59.36%
}

.span_4_of_5 {
  width: 79.68%;
  padding-right: 0
}

.span_5_of_5 {
  width: 100%;
  padding-right: 0
}

.span_1_of_6 {
  width: 15.33%
}

.span_2_of_6 {
  width: 32.26%
}

.span_3_of_6 {
  width: 49.2%
}

.span_4_of_6 {
  width: 66.13%
}

.span_5_of_6 {
  width: 83.06%
}

.span_6_of_6 {
  width: 100%;
  padding-right: 0
}

.span_1_of_12 {
  width: 6.86%
}

.span_2_of_12 {
  width: 15.33%
}

.span_3_of_12 {
  width: 23.8%
}

.span_4_of_12 {
  width: 32.26%
}

.span_5_of_12 {
  width: 40.73%
}

.span_6_of_12 {
  width: 49.2%
}

.span_7_of_12 {
  width: 57.66%
}

.span_8_of_12 {
  width: 66.13%
}

.span_9_of_12 {
  width: 74.6%
}

.span_10_of_12 {
  width: 83.06%
}

.span_11_of_12 {
  width: 91.53%
}

.span_12_of_12 {
  width: 100%;
  padding-right: 0
}

@media only screen and (max-width:767px) {
  .col:not(.mobile_col) {
    margin: 0 0 2%;
    width: 100%!important;
    padding-right: 0
  }
  .col+.col {
    margin-left: 0
  }
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.btn {
  background: #2ab27b;
  color: #fff;
  font-family: Slack-Lato, appleLogo, sans-serif;
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
  color: #007AB8!important;
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
  color: #007AB8!important
}

.btn_outline.hover:after,
.btn_outline:focus:after,
.btn_outline:hover:after {
  box-shadow: none
}

.btn_outline:active {
  color: #007AB8
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
  font-family: Slack-Lato, appleLogo, sans-serif;
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
  font-family: Slack-Lato, appleLogo, sans-serif;
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
  font-family: Slack-Lato, appleLogo, sans-serif;
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
  color: #007AB8;
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
  max-width: 150px;
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

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.plastic_select,
input[type=url],
input[type=text],
input[type=tel],
input[type=number],
input[type=email],
input[type=password],
select,
textarea {
  font-size: 1.25rem;
  line-height: normal;
  padding: .75rem;
  border: 1px solid #A0A0A2;
  border-radius: .25rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: 0;
  color: #555459;
  width: 100%;
  max-width: 100%;
  font-family: Slack-Lato, appleLogo, sans-serif;
  margin: 0 0 .5rem;
  font-variant-ligatures: none;
  -webkit-transition: box-shadow 70ms ease-out, border-color 70ms ease-out;
  -moz-transition: box-shadow 70ms ease-out, border-color 70ms ease-out;
  transition: box-shadow 70ms ease-out, border-color 70ms ease-out;
  box-shadow: none;
  height: auto
}

.plastic_select::-ms-clear,
input[type=url]::-ms-clear,
input[type=text]::-ms-clear,
input[type=tel]::-ms-clear,
input[type=number]::-ms-clear,
input[type=email]::-ms-clear,
input[type=password]::-ms-clear,
select::-ms-clear,
textarea::-ms-clear {
  display: none
}

input[type=file] {
  font-size: 12px;
  line-height: 12px;
  width: auto;
  font-weight: 400;
  font-family: sans-serif
}

.no_touch .plastic_select:hover,
.no_touch input:hover,
.no_touch select:hover,
.no_touch textarea:hover {
  border-color: #717274
}

.focus,
.plastic_select:active,
.plastic_select:focus,
input[type=url]:active,
input[type=url]:focus,
input[type=text]:active,
input[type=text]:focus,
input[type=number]:active,
input[type=number]:focus,
input[type=email]:active,
input[type=email]:focus,
input[type=password]:active,
input[type=password]:focus,
select:active,
select:focus,
textarea:active,
textarea:focus {
  border-color: #717274;
  outline-offset: 0;
  outline: 0;
  box-shadow: none
}

input.borderless,
input.borderless:active,
input.borderless:focus {
  border: none;
  box-shadow: none
}

input[type=text].ts_icon_placeholder::-webkit-input-placeholder {
  font-family: slack;
  position: relative;
  top: -.0625rem
}

input[type=text].ts_icon_placeholder:-moz-placeholder {
  font-family: slack;
  position: relative;
  top: -.0625rem
}

input[type=text].ts_icon_placeholder::-moz-placeholder {
  font-family: slack;
  position: relative;
  top: -.0625rem
}

input[type=text].ts_icon_placeholder:-ms-input-placeholder {
  font-family: slack;
  position: relative;
  top: -.0625rem
}

input[data-plastic-type=date]~div .pickmeup {
  margin-bottom: 4rem;
  position: absolute!important;
  top: 0!important;
  left: 0!important;
  z-index: 1
}

.plastic_date_picker.pickmeup .pmu-button.pmu-month,
.plastic_date_picker.pickmeup .pmu-button.pmu-next,
.plastic_date_picker.pickmeup .pmu-button.pmu-prev {
  color: #fff;
  background-color: #2ab27b
}

.plastic_date_picker.pickmeup .pmu-button.pmu-month {
  margin: 0 .125rem
}

body input[readonly] {
  cursor: default;
  background: #fff
}

input.input_inline {
  width: auto
}

input.small,
select.small {
  font-size: 1rem;
  padding: .45rem .75rem .55rem
}

@-moz-document url-prefix() {
  .plastic_row .description {
    word-break: break-all
  }
  select.small {
    padding-top: .35rem;
    padding-bottom: .45rem
  }
}

input.mini {
  font-size: 1rem;
  padding: .45rem .75rem .55rem;
  width: 84px
}

textarea {
  font-size: 1rem;
  line-height: 1.25rem;
  width: 100%;
  height: 108px;
  padding: .75rem .5rem .75rem .75rem;
  vertical-align: top;
  tab-size: 4;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  -webkit-tab-size: 4
}

textarea.small {
  padding: .5rem
}

.plastic_contenteditable,
.plastic_pre_wrap {
  white-space: pre-wrap;
  word-wrap: break-word
}

::-webkit-input-placeholder {
  color: #aaa
}

:-moz-placeholder {
  color: #aaa
}

::-moz-placeholder {
  color: #aaa
}

:-ms-input-placeholder {
  color: #aaa
}

input:disabled,
input:disabled:active,
select:disabled,
textarea:disabled {
  background: #F9F9F9;
  border-color: #C5C5C5!important;
  box-shadow: none;
  color: #9e9ea6
}

.checkbox input[type=checkbox],
.radio input[type=radio] {
  float: none
}

.error input,
.error select,
.error textarea {
  border: 1px solid #CB5234;
  background: #FFF6F6
}

.error input:focus,
.error select:focus,
.error textarea:focus {
  border-color: #CB5234;
  box-shadow: 0 0 7px rgba(255, 0, 0, .15)
}

select {
  background: #fff;
  padding-right: 3rem
}

select.small {
  padding-right: 2.5rem
}

label {
  font-weight: 700;
  margin: 0 0 .25rem;
  display: block;
  font-size: 1rem;
  line-height: 1.5rem
}

label.checkbox,
label.radio {
  padding-left: 1.5rem;
  cursor: pointer
}

label.checkbox input[type=radio],
label.checkbox input[type=checkbox],
label.radio input[type=radio],
label.radio input[type=checkbox] {
  margin: -2px .4rem 0 -1.5rem;
  vertical-align: middle
}

label.disabled {
  color: #9e9ea6
}

label select {
  margin-top: .25rem
}

label select::-ms-expand {
  display: none
}

label.select {
  position: relative
}

label.select:after {
  content: "\E271";
  font-family: Slack;
  position: absolute;
  right: 22px;
  bottom: 22px;
  font-size: 20px;
  pointer-events: none
}

label.select.with_hint:after {
  bottom: 14px
}

label.select.with_hint.small:after {
  bottom: 6px
}

label.select.disabled:after {
  color: #9e9ea6
}

label.select.small:after {
  right: 14px;
  bottom: 16px;
  font-size: 20px
}

@-moz-document url-prefix() {
  label.select.small:after {
    bottom: 16px
  }
}

@media only screen and (max-width:410px) {
  label.select.small:after {
    bottom: 16px
  }
}

.no_touch label.select:hover select {
  border-color: #717274
}

.no_touch label.select:not(.disabled):hover:after {
  color: #717274
}

.input_note {
  font-size: .9rem;
  line-height: 1.25rem;
  color: #9e9ea6
}

label.countdown {
  position: relative
}

label.countdown:after {
  content: attr(data-countdown);
  color: #9e9ea6;
  font-size: 1rem;
  font-weight: 400;
  position: absolute;
  right: 22px;
  bottom: -41px;
  pointer-events: none
}

label.countdown.small:after {
  right: 14px;
  bottom: -35px;
  font-size: .8125rem
}

label.countdown.validation_error:after {
  color: #CB5234
}

label.countdown.validation_count:after {
  bottom: -37px
}

label.countdown.validation_count.small:after {
  bottom: -31px
}

[data-validation]+label.countdown:after,
label.countdown.validation_error:after,
label.countdown.validation_success:after,
label.countdown.validation_warning:after {
  bottom: -41px
}

[data-validation]+label.countdown.small:after,
label.countdown.validation_error.small:after,
label.countdown.validation_success.small:after,
label.countdown.validation_warning.small:after {
  bottom: -35px
}

label .validation_message {
  flex: 1;
  display: none;
  padding-right: .125rem
}

label .validation_message:before {
  content: attr(title);
  font-style: italic;
  margin-left: .5rem
}

label .validation_message:not(.overflow_ellipsis)::before {
  display: inline-block
}

label.validation_count {
  margin-bottom: 0
}

label.validation_count .validation_message:before {
  margin-left: 0
}

[data-validation]+label,
label.validation_error,
label.validation_success,
label.validation_warning {
  margin-bottom: .25rem!important;
  display: flex
}

[data-validation]+label.select,
label.validation_error.select,
label.validation_success.select,
label.validation_warning.select {
  flex-wrap: wrap
}

[data-validation][disabled]+label {
  display: none
}

label.validation_error .validation_message,
label.validation_error .validation_message:before {
  color: #CB5234
}

label.validation_warning .validation_message,
label.validation_warning .validation_message:before {
  color: #FFA940
}

label.validation_success .validation_message,
label.validation_success .validation_message:before {
  color: #007AB8
}

.feature_name_tagging_client .username_input_container::before {
  content: ''
}

.feature_name_tagging_client .username_input_container input[type=text].username_input {
  padding-left: .75rem
}

.username_input_container {
  position: relative
}

.username_input_container::before {
  content: '@';
  left: .75rem;
  line-height: 48px;
  position: absolute;
  color: #9e9ea6
}

.username_input_container.small::before {
  left: .9rem;
  line-height: 35px
}

.username_input_container input[type=text].username_input {
  padding-left: 1.75rem
}

.username_input_container input[type=text].username_input.validation_error,
.username_input_container input[type=text].username_input.validation_warning {
  background-color: #FFF1E1;
  border-color: #FFA940
}

.username_input_container .username_input~label[for] {
  display: block;
  margin: 0
}

.username_input_container .username_input~label[for] .validation_message {
  overflow: visible;
  white-space: normal
}

.username_input_container .username_input~label[for] .validation_message::before {
  margin-left: 0
}

input.validation_warning,
select.validation_warning,
textarea.validation_warning {
  border: 1px solid #FFA940!important
}

input.validation_warning:focus,
select.validation_warning:focus,
textarea.validation_warning:focus {
  border-color: #FFA940;
  box-shadow: 0 0 7px rgba(255, 185, 100, .15)
}

@media only screen and (max-width:767px) {
  label .validation_message:before {
    margin-left: 0
  }
  label.validation_error,
  label.validation_success,
  label.validation_warning {
    flex-direction: column
  }
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.modal-backdrop {
  background: #fff
}

.modal {
  box-shadow: 0 4px 16px rgba(0, 0, 0, .5);
  border-radius: .5rem;
  font-family: Slack-Lato, appleLogo, sans-serif;
  border: none
}

.modal-header {
  padding: .75rem 1.5rem .75rem 2rem;
  background: #FBFBFA;
  color: #555459;
  font-weight: 900;
  border-bottom: none;
  border-top-right-radius: .5rem;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: .5rem;
  background-clip: padding-box
}

.modal-header h3 {
  font-weight: 900;
  font-size: 1.25rem;
  line-height: 1.5rem;
  margin: .3rem 0
}

.modal-header-image {
  display: inline-block;
  width: 200px;
  height: 200px
}

.modal-header-image--oops {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url(/ff72/img/modal-graphics/oops.png)
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  .modal-header-image--oops {
    background-image: url(/ff72/img/modal-graphics/oops@2x.png)
  }
}

.modal .close {
  color: #555459;
  font-size: 2rem;
  line-height: 1.5rem;
  text-shadow: none;
  opacity: .25;
  -moz-opacity: .25;
  -khtml-opacity: .25;
  -webkit-transition: opacity .1s ease-out 0s;
  -moz-transition: opacity .1s ease-out 0s;
  transition: opacity .1s ease-out 0s;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: 0 0;
  -webkit-appearance: none;
  font-weight: 700;
  float: right;
  font-family: "Helvetica Neue", Helvetica, "Segoe UI", Tahoma, Arial, sans-serif
}

.modal .close:hover {
  opacity: 1;
  -moz-opacity: 1;
  -khtml-opacity: 1
}

.modal p {
  line-height: 1.5rem
}

.modal p.mini {
  line-height: 1.25rem
}

.modal-body {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
  padding: 2rem 2rem 0
}

.modal-body.share_dialog {
  max-height: 480px
}

.modal_input_note {
  font-size: .9rem;
  color: #9e9ea6;
  display: block;
  line-height: 1.25rem;
  margin-top: .5rem
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_input_container .lfs_item .ts_icon:not(.presence_icon):before,
#share_dialog .lazy_filter_select .lfs_input_container .lfs_item .ts_icon:not(.presence_icon):before {
  font-size: 20px;
  top: 0
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_input_container .lfs_item .ts_icon:not(.presence_icon).ts_icon_channel:before,
#share_dialog .lazy_filter_select .lfs_input_container .lfs_item .ts_icon:not(.presence_icon).ts_icon_channel:before {
  top: 1px
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_input_container .lfs_item .presence,
#share_dialog .lazy_filter_select .lfs_input_container .lfs_item .presence {
  top: 6px
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item,
#share_dialog .lazy_filter_select .lfs_item {
  position: relative;
  padding-left: 1.5rem
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon),
#share_dialog .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon) {
  line-height: .9rem;
  color: #9e9ea6
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon):before,
#share_dialog .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon):before {
  position: absolute;
  top: 4px;
  left: 1px;
  font-size: 18px
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon).ts_icon_channel:before,
#share_dialog .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon).ts_icon_channel:before {
  top: 5px
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item ts-icon.ts_icon_shared_channel,
#share_dialog .lazy_filter_select .lfs_item ts-icon.ts_icon_shared_channel {
  line-height: 0
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item .presence,
#share_dialog .lazy_filter_select .lfs_item .presence {
  position: absolute;
  top: 9px;
  left: 3px
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_item .presence:not(.away):not(.active),
#share_dialog .lazy_filter_select .lfs_item .presence:not(.away):not(.active) {
  color: #9e9ea6
}

#generic_dialog.basic_share_dialog .lazy_filter_select .lfs_group,
#share_dialog .lazy_filter_select .lfs_group {
  color: #9e9ea6
}

#generic_dialog.basic_share_dialog .lfs_input_container .lfs_item {
  padding-left: 0;
  font-weight: 700
}

#generic_dialog.basic_share_dialog .lfs_input_container .lfs_item .share_prefix {
  font-weight: 400
}

#generic_dialog.basic_share_dialog .lfs_input_container .lfs_item .ts_icon:not(.presence_icon):before {
  position: static
}

#generic_dialog.basic_share_dialog .lfs_input_container .lfs_item .ts_icon:not(.presence_icon).ts_icon_channel {
  vertical-align: middle
}

#generic_dialog.basic_share_dialog .lfs_input_container .lfs_item .presence {
  position: relative;
  top: 6px
}

#generic_dialog.basic_share_dialog .lfs_input_container .lfs_item .presence .presence_icon {
  top: -16px;
  left: -9px
}

#generic_dialog.basic_share_dialog .lfs_list_container .share_prefix {
  display: none
}

.modal-body-scrollable {
  max-height: 450px;
  overflow-y: scroll!important;
  overflow-x: hidden;
  padding-right: 1.5rem
}

.modal-footer {
  background: #fff;
  box-shadow: none;
  border-top: none;
  padding: 2rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: .5rem;
  border-bottom-left-radius: .5rem;
  border-top-left-radius: 0;
  background-clip: padding-box
}

.modal.small {
  width: auto;
  max-width: 560px;
  min-width: 200px
}

.modal#generic_dialog {
  z-index: 1052
}

@media only screen and (min-height:700px) {
  .modal#generic_dialog.modal.fade.in {
    top: 12%
  }
}

@media only screen and (max-width:480px) {
  .modal.fade.in {
    max-width: 100%;
    left: 0;
    top: 0;
    margin: 0;
    bottom: 0
  }
  #generic_dialog {
    bottom: auto
  }
}

@media only screen and (max-height:650px) {
  .modal.fade.in {
    top: 5%
  }
  .modal-body {
    max-height: 400px
  }
  .modal-body #file_comment_textarea {
    max-height: 90px!important
  }
}

@media only screen and (max-height:550px) {
  .modal.fade.in {
    top: 3%
  }
}

@media only screen and (max-height:500px) {
  .modal.fade.in {
    top: 1%
  }
}

.c-modal--dark {
  text-align: center
}

.c-modal_backdrop--dark {
  background: #000
}

.c-modal_header--dark {
  background: inherit;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 30px;
  margin-bottom: 15px
}

.c-modal_header--dark .modal-header-image {
  margin-top: -100px
}

.c-modal_body--dark {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 15px;
  margin-bottom: 15px;
  overflow-x: hidden
}

.c-modal_footer--dark {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 25px;
  margin-bottom: 30px
}

.c-modal_body--default {
  overflow-x: hidden
}

.c-modal_body--overflow_visible {
  overflow: visible
}

.c-modal--quick_promo {
  width: 460px;
  border-top-right-radius: .375rem;
  border-bottom-right-radius: .375rem;
  border-bottom-left-radius: .375rem;
  border-top-left-radius: .375rem;
  background-clip: padding-box
}

.c-modal_body--quick_promo {
  position: relative;
  padding: 0;
  margin: 0
}

.c-modal_close--quick_promo {
  position: absolute;
  top: 2px;
  right: 8px
}

.c-modal_graphic_wrapper--quick_promo {
  display: flex;
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center;
  align-items: flex-end;
  height: 200px;
  margin-bottom: 30px;
  border-bottom: solid 1px rgba(44, 45, 48, .11);
  background-color: #F9F9F9;
  border-top-right-radius: .375rem;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: .375rem;
  background-clip: padding-box
}

.c-modal_graphic--quick_promo {
  height: 150px;
  width: 377px
}

.c-modal_copy_header--quick_promo {
  margin: 0 30px 9px;
  font-weight: 900;
  color: #2C2D30;
  font-size: 1.125rem
}

.c-modal_copy--quick_promo {
  margin: 0 30px 25px;
  color: #2C2D30;
  font-size: .9375rem
}

.c-modal_footer--quick_promo {
  padding: 0 30px 30px;
  font-size: .9375rem;
  display: flex;
  -ms-flex-pack: end;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  -moz-justify-content: flex-end;
  justify-content: flex-end
}

.c-modal_footer__go--quick_promo {
  order: 0;
  margin-left: 0
}

.c-modal_footer__secondary_go--quick_promo {
  order: 1
}

.c-modal_footer__cancel--quick_promo,
.c-modal_footer__secondary_go--quick_promo {
  margin-left: 10px
}

.c-modal_footer__cancel--quick_promo {
  order: 2
}

.modal#generic_dialog.c-modal--onboarding_dialog {
  z-index: 1041
}

.c-modal--onboarding_dialog {
  width: 370px;
  top: 50%;
  right: 0;
  left: initial;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  -webkit-transform: translate3d(500px, -50%, 0);
  -moz-transform: translate3d(500px, -50%, 0);
  -ms-transform: translate3d(500px, -50%, 0);
  transform: translate3d(500px, -50%, 0);
  -webkit-transition: transform .5s ease-out 0s;
  -moz-transition: transform .5s ease-out 0s;
  transition: transform .5s ease-out 0s
}

.c-modal--onboarding_dialog.in {
  -webkit-transform: translate3d(0, -50%, 0);
  -moz-transform: translate3d(0, -50%, 0);
  -ms-transform: translate3d(0, -50%, 0);
  transform: translate3d(0, -50%, 0)
}

.c-modal_body--onboarding_dialog {
  max-height: 526px;
  height: 526px;
  padding: 0;
  margin: 0
}

.c-modal__close--onboarding_dialog {
  top: 7px;
  right: 15px;
  background: 0 0;
  font-size: 1.5rem;
  color: #717274
}

.c-modal__close--onboarding_dialog_white {
  color: #fff
}

.c-modal__media_container--onboarding_dialog {
  display: flex;
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center;
  align-items: center;
  height: 280px;
  padding: 28px 28px 0;
  border-top-left-radius: 4px;
  color: #fff
}

.c-modal__left_navigation--onboarding_dialog,
.c-modal__right_navigation--onboarding_dialog {
  height: 52px;
  width: 26px;
  overflow: hidden;
  background: rgba(44, 45, 48, .25);
  color: #fff
}

.c-modal__left_navigation--onboarding_dialog {
  left: 0;
  border-top-right-radius: 104px;
  border-bottom-right-radius: 104px
}

.c-modal__right_navigation--onboarding_dialog {
  right: 0;
  border-top-left-radius: 104px;
  border-bottom-left-radius: 104px
}

.c-modal__left_caret--onboarding_dialog {
  top: 12px;
  left: -10px
}

.c-modal__right_caret--onboarding_dialog {
  top: 12px;
  right: -9px
}

.c-modal__left_caret--onboarding_dialog::before,
.c-modal__right_caret--onboarding_dialog::before {
  font-size: 2.5rem
}

.c-modal__media--onboarding_dialog {
  max-height: 100%
}

.c-modal__copy--onboarding_dialog {
  height: 246px;
  padding: 0 22px 22px;
  color: #2C2D30
}

.c-modal__copy--onboarding_dialog>p {
  margin-bottom: 24px;
  font-size: .9375rem
}

.c-modal__quest_circle_buttons {
  display: flex;
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center;
  align-items: center;
  height: 56px
}

.c-modal__quest_circle_button {
  height: 19px;
  width: 19px;
  background: 0 0
}

.c-modal__circle_fill--onboarding-dialog {
  color: #E8E8E8
}

.c-modal__media_container--onboarding_dialog_blue {
  background-color: rgba(45, 158, 224, .9)
}

.c-modal__circle_fill--onboarding_dialog_blue {
  color: rgba(45, 158, 224, .9)
}

.c-modal--onboarding_dialog+.modal-backdrop {
  opacity: 0;
  -webkit-transition: opacity .5s ease-out 0s;
  -moz-transition: opacity .5s ease-out 0s;
  transition: opacity .5s ease-out 0s
}

.c-modal--onboarding_dialog.in+.modal-backdrop {
  opacity: .4
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

html.fs_modal_active {
  overflow: hidden
}

#fs_modal_bg,
.fs_modal_bg {
  position: fixed;
  top: 100%;
  right: 0;
  bottom: 0;
  left: 0;
  background: #fff;
  z-index: 1040;
  opacity: 0;
  -webkit-transition: opacity 250ms cubic-bezier(.2, .8, .5, 1) .1s, top 0s linear 250ms, left 250ms ease-in-out;
  -moz-transition: opacity 250ms cubic-bezier(.2, .8, .5, 1) .1s, top 0s linear 250ms, left 250ms ease-in-out;
  transition: opacity 250ms cubic-bezier(.2, .8, .5, 1) .1s, top 0s linear 250ms, left 250ms ease-in-out
}

#fs_modal_bg.active,
.fs_modal_bg.active {
  top: 0;
  opacity: 1;
  -webkit-transition: opacity 250ms cubic-bezier(.2, .8, .5, 1), top 0s linear 0s, left 250ms ease-in-out;
  -moz-transition: opacity 250ms cubic-bezier(.2, .8, .5, 1), top 0s linear 0s, left 250ms ease-in-out;
  transition: opacity 250ms cubic-bezier(.2, .8, .5, 1), top 0s linear 0s, left 250ms ease-in-out
}

#fs_modal {
  position: fixed;
  top: 100%;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1041;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: 18px;
  height: 100%;
  line-height: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  opacity: 0;
  -webkit-transform: translateY(5px);
  -moz-transform: translateY(5px);
  -ms-transform: translateY(5px);
  transform: translateY(5px);
  -moz-transition: opacity 150ms cubic-bezier(.2, .8, .5, 1) .1s, transform 150ms cubic-bezier(.2, .8, .5, 1) .1s, top 0s linear 250ms;
  transition: opacity 150ms cubic-bezier(.2, .8, .5, 1) .1s, transform 150ms cubic-bezier(.2, .8, .5, 1) .1s, top 0s linear 250ms;
  -webkit-transition: opacity 150ms cubic-bezier(.2, .8, .5, 1) .1s, -webkit-transform 150ms cubic-bezier(.2, .8, .5, 1) .1s, top 0s linear 250ms
}

#fs_modal.active {
  top: 0;
  opacity: 1;
  -webkit-transform: translateY(0);
  -moz-transform: translateY(0);
  -ms-transform: translateY(0);
  transform: translateY(0);
  -moz-transition: opacity 150ms cubic-bezier(.2, .8, .5, 1) .1s, transform 150ms cubic-bezier(.2, .8, .5, 1) .1s, left 250ms ease-in-out;
  transition: opacity 150ms cubic-bezier(.2, .8, .5, 1) .1s, transform 150ms cubic-bezier(.2, .8, .5, 1) .1s, left 250ms ease-in-out;
  -webkit-transition: opacity 150ms cubic-bezier(.2, .8, .5, 1) .1s, -webkit-transform 150ms cubic-bezier(.2, .8, .5, 1) .1s, left 250ms ease-in-out
}

#fs_modal h1,
#fs_modal h2,
#fs_modal h3,
#fs_modal h4,
#fs_modal h5 {
  color: #2C2D30
}

#fs_modal #fs_modal_sidebar {
  margin: 0 4rem 0 0;
  min-width: 185px;
  position: -webkit-sticky;
  top: 0
}

#fs_modal #fs_modal_sidebar a {
  margin: 0 .9375rem
}

#fs_modal .fs_modal_btn {
  position: absolute;
  top: 3rem;
  width: 4rem;
  height: 4rem;
  z-index: 1;
  text-align: center;
  cursor: pointer;
  color: #717274;
  font-size: .8rem;
  line-height: 1.5rem;
  border-radius: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none
}

#fs_modal .fs_modal_btn#fs_modal_close_btn {
  right: 3rem
}

#fs_modal .fs_modal_btn#fs_modal_back_btn {
  left: 3rem
}

#fs_modal .fs_modal_btn .ts_icon {
  position: absolute;
  top: 1rem;
  left: 0;
  width: 100%;
  display: block
}

#fs_modal .fs_modal_btn .ts_icon:before {
  font-size: 2rem
}

#fs_modal .fs_modal_btn .key_label {
  position: absolute;
  top: 2.25rem;
  left: 0;
  width: 100%;
  display: block
}

#fs_modal .fs_modal_btn:hover {
  color: #555459;
  background: #E8E8E8
}

#fs_modal .fs_modal_btn:active {
  color: #fff;
  background: #2ab27b
}

#fs_modal #fs_modal_header {
  display: flex;
  align-items: center;
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .15)
}

#fs_modal #fs_modal_header h3 {
  margin: 0;
  font-weight: 900;
  font-size: 1.4rem;
  white-space: nowrap
}

#fs_modal.fs_modal_header .fs_modal_btn {
  top: 6px;
  width: 3rem;
  height: 3rem;
  line-height: 1.2rem
}

#fs_modal.fs_modal_header .fs_modal_btn#fs_modal_close_btn {
  right: 1rem
}

#fs_modal.fs_modal_header .fs_modal_btn#fs_modal_back_btn {
  left: 1rem
}

#fs_modal.fs_modal_header .fs_modal_btn:hover {
  background: 0 0
}

#fs_modal.fs_modal_header .fs_modal_btn:active {
  color: #2ab27b;
  background: 0 0
}

#fs_modal.fs_modal_header .fs_modal_btn .key_label {
  display: none
}

#fs_modal.fs_modal_header .contents_container {
  top: 3.75rem;
  padding: 2rem
}

#fs_modal.fs_modal_header #fs_modal_header+.monkey_scroll_wrapper>.monkey_scroll_bar {
  top: 3.75rem;
  z-index: 1
}

#fs_modal .contents_container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  -ms-flex-pack: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  justify-content: center;
  align-items: flex-start;
  padding: 15vh 2rem 2rem
}

#fs_modal .contents_container .contents {
  width: 640px;
  max-width: 100%;
  padding-bottom: 2rem
}

#fs_modal #fs_modal_footer {
  display: flex;
  align-items: center;
  -ms-flex-pack: end;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  -moz-justify-content: flex-end;
  justify-content: flex-end;
  padding: 1rem;
  background-color: #F7F7F7;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4.5rem
}

#fs_modal #fs_modal_footer .btn {
  min-width: 132px
}

#fs_modal.fs_modal_footer .contents_container {
  bottom: 4.5rem
}

#fs_modal.fs_modal_internal_scroll .contents_container {
  padding: 0 2rem;
  overflow-y: hidden
}

#fs_modal .actions {
  margin: 2rem auto
}

#fs_modal .actions .btn {
  margin-right: .25rem
}

.deprecate_modal#fs_modal .actions .btn_link {
  line-height: 1.2rem;
  text-shadow: none
}

.deprecate_modal#fs_modal .actions .btn_link:after {
  display: none
}

.deprecate_modal#fs_modal .actions .btn_link:active,
.deprecate_modal#fs_modal .actions .btn_link:focus,
.deprecate_modal#fs_modal .actions .btn_link:hover {
  background: 0 0;
  box-shadow: none
}

.deprecate_modal#fs_modal .actions .btn_link:hover {
  text-decoration: underline
}

#fs_modal~.modal-backdrop {
  z-index: 1042
}

#fs_modal.convert_to_shared_dialog .contents_container {
  padding-top: 0vh
}

#fs_modal.deprecate_modal {
  line-height: 1.65
}

#fs_modal.deprecate_modal .emoji-only {
  vertical-align: top
}

#fs_modal.deprecate_modal .btn {
  font-size: 1.125rem;
  padding: 12px 16px 11px
}

#fs_modal.deprecate_modal .btn.dialog_go {
  float: left
}

#fs_modal.p-apps_browser_modal .contents_container {
  align-items: stretch
}

#fs_modal.p-apps_browser_modal .contents_container .contents {
  width: 660px;
  display: flex;
  padding: 0
}

#fs_modal.p-apps_browser_modal .contents_container .contents .links_container {
  display: flex;
  position: absolute;
  left: 3%;
  top: 2rem;
  font-size: 15px
}

#fs_modal.p-apps_browser_modal .contents_container .contents .links_container a {
  color: #717274
}

#fs_modal.p-apps_browser_modal .contents_container .contents .links_container a:active,
#fs_modal.p-apps_browser_modal .contents_container .contents .links_container a:hover,
#fs_modal.p-apps_browser_modal .contents_container .contents .links_container a:visited {
  color: #717274;
  cursor: pointer
}

#fs_modal.p-apps_browser_modal .contents_container .contents .links_container .view_tutorial_link {
  margin-left: 25px
}

#fs_modal.p-apps_browser_modal .contents_container .contents .links_container ts-icon {
  position: relative;
  top: 4px;
  margin-right: .5rem
}

#fs_modal.p-apps_browser_modal .contents_container .contents #apps_browser_container {
  display: flex;
  flex: 1 1 0;
  overflow: hidden
}

@media only screen and (max-width:1023px) {
  #fs_modal.fs_modal_sidebar.show_sidebar .contents_container {
    display: block
  }
  #fs_modal.fs_modal_sidebar.show_sidebar .contents_container .contents {
    margin: 0 auto
  }
  #fs_modal.fs_modal_sidebar.show_sidebar #fs_modal_sidebar {
    top: auto;
    position: relative;
    margin: 0 auto 1.5rem;
    text-align: center;
    max-width: 560px
  }
  #fs_modal.fs_modal_sidebar.show_sidebar #fs_modal_sidebar li {
    display: inline-block
  }
  #fs_modal.fs_modal_sidebar.show_sidebar #fs_modal_sidebar li a {
    margin: 0
  }
  #fs_modal.fs_modal_sidebar #fs_modal_sidebar {
    margin-right: 1rem
  }
}

@media only screen and (max-width:767px) {
  #fs_modal:not(.p-apps_browser_modal) .fs_modal_btn {
    top: 1rem
  }
  #fs_modal:not(.p-apps_browser_modal) .fs_modal_btn#fs_modal_close_btn {
    right: 1rem
  }
  #fs_modal:not(.p-apps_browser_modal) .fs_modal_btn#fs_modal_back_btn {
    left: 1rem
  }
  #fs_modal:not(.p-apps_browser_modal).fs_modal_sidebar .contents_container {
    display: block
  }
  #fs_modal:not(.p-apps_browser_modal).fs_modal_sidebar .contents_container .contents {
    margin: 0 auto
  }
  #fs_modal:not(.p-apps_browser_modal).fs_modal_sidebar #fs_modal_sidebar {
    top: auto;
    position: relative;
    margin: 0 auto 1.5rem;
    text-align: center;
    max-width: 560px
  }
  #fs_modal:not(.p-apps_browser_modal).fs_modal_sidebar #fs_modal_sidebar li {
    display: inline-block
  }
  #fs_modal:not(.p-apps_browser_modal).fs_modal_sidebar #fs_modal_sidebar li a {
    margin: 0
  }
}

@media only screen and (max-width:640px) {
  #fs_modal .fs_modal_btn {
    width: 3rem;
    height: 3rem;
    line-height: 1rem
  }
  #fs_modal .fs_modal_btn .ts_icon {
    top: 1.1rem
  }
  #fs_modal .fs_modal_btn .key_label {
    display: none
  }
}

@media only screen and (max-width:900px) {
  #fs_modal.p-apps_browser_modal .fs_modal_btn {
    top: 1rem
  }
  #fs_modal.p-apps_browser_modal .fs_modal_btn#fs_modal_close_btn {
    right: 1rem
  }
  #fs_modal.p-apps_browser_modal .fs_modal_btn#fs_modal_back_btn {
    left: 1rem
  }
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.menu {
  position: absolute;
  z-index: 1042;
  display: inline-block;
  vertical-align: top;
  min-width: 220px;
  font-family: Slack-Lato, appleLogo, sans-serif;
  color: #2C2D30;
  background: #fff;
  box-shadow: 0 5px 10px rgba(0, 0, 0, .12);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, .15)
}

.menu .menu_content {
  position: relative;
  z-index: 1043;
  overflow: hidden
}

.menu .monkey_scroll_hider.scrolling ul li {
  margin-right: 1.0625rem
}

.menu ul {
  list-style-type: none;
  margin: .9375rem 0;
  padding: 0
}

.menu ul:empty {
  margin: 0
}

.menu ul li.divider {
  border-bottom: 1px solid rgba(0, 0, 0, .15);
  margin: .9375rem 0
}

.menu ul li.divider:first-child,
.menu ul li.divider:last-child {
  display: none
}

.menu ul li.divider.subdivider {
  width: 40%;
  margin: .9375rem 1.4375rem
}

.menu ul li i {
  margin-right: .5rem;
  color: #BABBBF
}

#client-ui .menu ul li i {
  display: inline-block
}

.menu ul li i:before {
  font-size: 17px
}

.menu ul li i.file_menu_icon.ts_icon_create_post,
.menu ul li i.file_menu_icon.ts_icon_laptop {
  position: relative;
  top: 1px
}

.menu ul li:not(.dm_list_item) .member_image {
  vertical-align: top;
  margin-left: -11px;
  margin-right: 8px;
  width: 22px;
  height: 22px;
  margin-top: 1px
}

.menu ul li a {
  display: block;
  text-decoration: none;
  padding: 0 1rem 0 .5rem;
  margin: 0 .9375rem;
  border-radius: .25rem;
  white-space: nowrap;
  outline: 0;
  font-size: 15px;
  line-height: 25px;
  background: 0 0;
  color: #2C2D30
}

.menu ul li a.delete_link {
  color: #870000
}

.menu ul li.danger a {
  color: #eb4d5c
}

.menu ul li.disabled a {
  color: #BABBBF;
  cursor: default
}

.menu ul li.has_submenu a {
  position: relative
}

.menu ul li.has_submenu .submenu_caret {
  position: absolute;
  right: 0
}

.menu ul li.highlighted a,
.menu:not(.keyboard_active) ul li:hover:not(.disabled) a {
  background: #2D9EE0;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .1)
}

.menu ul li.highlighted a .prefix,
.menu ul li.highlighted a i,
.menu ul li.highlighted a ts-icon,
.menu ul li.highlighted a.delete_link,
.menu:not(.keyboard_active) ul li:hover:not(.disabled) a .prefix,
.menu:not(.keyboard_active) ul li:hover:not(.disabled) a i,
.menu:not(.keyboard_active) ul li:hover:not(.disabled) a ts-icon,
.menu:not(.keyboard_active) ul li:hover:not(.disabled) a.delete_link {
  color: #fff
}

.menu ul li.highlighted a,
.menu:not(.keyboard_active) ul li:hover a {
  text-decoration: none
}

.menu ul li.highlighted.danger a,
.menu:not(.keyboard_active) ul li.danger:hover:not(.disabled) a {
  background: #eb4d5c
}

.menu .section_header {
  cursor: default;
  margin: .625rem .875rem;
  position: relative
}

.menu .section_header .header_label {
  background-color: #fff;
  color: #9e9ea6;
  padding-right: .8rem
}

.menu .section_header .header_label.menu_mini {
  font-size: .8125rem;
  line-height: 1rem
}

.menu .section_header>.header_label {
  position: relative
}

.menu .section_header>div.header_label_container {
  color: #9e9ea6;
  padding-right: .375rem;
  position: relative
}

.menu .section_header hr {
  position: absolute;
  left: 1rem;
  right: 0;
  margin-top: .6rem;
  margin-bottom: 0
}

.menu.submenu .section_header {
  margin: .625rem .9375rem .25rem;
  padding: 0 1rem 0 .5rem
}

.menu.submenu .section_header .header_label {
  text-transform: uppercase;
  font-size: .75rem
}

.menu.submenu.submenu_help {
  background: #FBFBFA;
  color: #565759;
  line-height: 1;
  width: 250px
}

.menu.submenu.submenu_help ul {
  margin: .9375rem
}

.menu.submenu.submenu_help .help_message {
  font-size: .9rem
}

.menu.submenu.submenu_help ts-icon {
  position: relative;
  top: 2px
}

.menu #menu_header .menu_simple_header {
  font-size: 1rem;
  line-height: 1.5rem;
  padding: .6rem 1rem;
  background: #fbfaf8;
  color: #555459;
  font-weight: 700;
  border-bottom: 1px solid rgba(0, 0, 0, .15);
  border-top-right-radius: .25rem;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: .25rem;
  background-clip: padding-box
}

.menu #menu_header .menu_close {
  float: right;
  color: #555459;
  font-size: 1.25rem;
  line-height: 1.25rem;
  text-shadow: none;
  text-decoration: none!important;
  opacity: .25;
  -moz-opacity: .25;
  -khtml-opacity: .25;
  -webkit-transition: .1s;
  -moz-transition: .1s;
  transition: .1s
}

.menu #menu_header .menu_close:hover {
  opacity: 1;
  -moz-opacity: 1;
  -khtml-opacity: 1
}

.menu #menu_header .menu_simple_header a {
  color: #555459;
  font-weight: 700;
  text-decoration: underline
}

.menu #menu_header .menu_simple_header a:hover {
  color: #555459;
  text-decoration: underline
}

.menu #menu_items_scroller {
  max-height: calc(100vh - 99px);
  overflow-y: auto;
  overflow-x: hidden
}

.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller {
  border-right: .25rem solid transparent;
  border-right: none
}

.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 16px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  color: #fff;
  border-left: 4px solid #fff;
  border-right: 4px solid #fff;
  border-radius: 6px/4px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .menu #menu_items_scroller::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar .menu #menu_items_scroller {
  margin-right: 2px;
  border-right: none
}

.supports_custom_scrollbar.slim_scrollbar .menu #menu_items_scroller::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 16px
}

.supports_custom_scrollbar.slim_scrollbar .menu #menu_items_scroller::-webkit-scrollbar-thumb {
  background-color: rgba(217, 217, 222, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #d9d9de;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar .menu #menu_items_scroller::-webkit-scrollbar-thumb:hover {
  background-color: rgba(217, 217, 222, .8)
}

.supports_custom_scrollbar.slim_scrollbar .menu #menu_items_scroller::-webkit-scrollbar-thumb,
.supports_custom_scrollbar.slim_scrollbar .menu #menu_items_scroller::-webkit-scrollbar-track {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-radius: 6px/4px
}

.menu #monkey_scroll_wrapper_for_menu_items_scroller {
  background: #fff;
  border-radius: 6px
}

.menu #menu_promise_spinner {
  text-align: center;
  height: 26px;
  line-height: 30px;
  margin-top: 10px
}

.menu #menu_list_container {
  margin: .75rem 0 -.75rem
}

.menu #menu_list_container.populated {
  padding: 0 0 .75rem
}

.menu #menu_list_container #menu_list {
  overflow: auto;
  max-height: 454px
}

.menu #menu_list_container #menu_list .menu_list_item {
  line-height: 1.5rem;
  margin: 0;
  width: 100%;
  height: 25px;
  display: block
}

.menu #menu_list_container #menu_list .menu_list_item a {
  display: block;
  text-decoration: none;
  padding: 0 1rem 0 .5rem;
  margin: 0 .9375rem;
  border-radius: .25rem;
  white-space: nowrap;
  outline: 0;
  font-size: 15px;
  line-height: 25px;
  background: 0 0;
  color: #2C2D30
}

.menu #menu_list_container #menu_list .menu_list_item a .member_image {
  margin-right: .5rem;
  vertical-align: top;
  margin-left: -11px;
  width: 22px;
  height: 22px;
  margin-top: 1px
}

.menu #menu_list_container #menu_list .menu_list_item.active a {
  background: #2D9EE0;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .1);
  text-decoration: none
}

.menu #menu_list_container .monkey_scroll_hider.scrolling #menu_list .menu_list_item {
  padding-right: 1.0625rem
}

.menu #menu_footer .menu_footer {
  background: #fbfaf8;
  padding: .5rem .75rem;
  border-top: 1px solid rgba(0, 0, 0, .15);
  border-radius: 0 0 6px 6px
}

.menu .menu_context {
  padding: 1rem 1.75rem .25rem 1.5rem;
  font-size: .9375rem;
  line-height: 1.4;
  background: #E8E8E8;
  color: #717274
}

.menu .menu_filter_container {
  background: #fff;
  position: relative;
  padding: 7px;
  max-width: 275px
}

.menu .menu_filter_container input.menu_filter {
  padding: .1rem 1.8rem 0;
  height: 1.75rem;
  line-height: 1rem;
  font-size: .9rem;
  border-radius: 1rem;
  border: 1px solid #DDD;
  outline: 0
}

.menu .menu_filter_container input.menu_filter::-ms-clear {
  display: none
}

.menu .menu_filter_container input.menu_filter:focus {
  border-color: #BABBBF
}

.menu .menu_filter_container .icon_search {
  position: absolute;
  font-size: .9rem;
  top: 8x;
  left: 15px;
  color: #CCC
}

.menu .menu_filter_container .icon_close {
  position: absolute;
  right: 12px;
  top: 8px;
  text-decoration: none;
  color: #CCC!important;
  font-size: 14px
}

.menu .menu_filter_container .filter_no_matches {
  margin: 0;
  text-align: center;
  padding: .6rem .75rem 1.1rem;
  overflow: hidden
}

.menu.team_menu {
  min-width: 240px
}

.menu.selectable li {
  position: relative
}

.menu.selectable li a {
  padding-left: 31px
}

.menu.selectable li.selected,
.menu.selectable li.selected a {
  color: #007AB8
}

.menu.selectable li.selected a:hover,
.menu.selectable li.selected.highlighted a,
.menu.selectable li.selected:hover {
  color: #fff
}

.menu.selectable li.selected:before {
  position: absolute;
  top: 1px;
  left: 22px;
  font-family: Slack;
  font-weight: 400;
  font-size: 19px;
  content: '\E285'
}

#emoji_menu {
  position: absolute;
  min-width: 361px;
  max-width: 361px;
  color: #555459;
  z-index: 1053;
  font-size: .95rem;
  font-family: Slack-Lato, appleLogo, sans-serif;
  background: #F7F7F7;
  line-height: 1rem;
  outline: 0
}

#emoji_menu #emoji_menu_content {
  position: relative;
  z-index: 151;
  overflow: hidden
}

#emoji_menu h3 {
  margin: 0 6px;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5rem;
  position: relative;
  background: rgba(255, 255, 255, .95)
}

#emoji_menu h3#emoji_h3_handy_rxns {
  float: left;
  margin: 4px 2px;
  background-color: transparent;
  width: 141px
}

.supports_sticky_position #emoji_menu h3 {
  position: sticky;
  position: -webkit-sticky;
  top: 0
}

body.winssb #emoji_menu {
  overflow: visible
}

#emoji_menu #emoji_menu_footer #emoji_preview {
  opacity: 0;
  -webkit-transition: opacity .1s ease-in .9s;
  -moz-transition: opacity .1s ease-in .9s;
  transition: opacity .1s ease-in .9s;
  padding: .3rem 0 0 .7rem
}

#emoji_menu #emoji_menu_footer.previewing #emoji_preview {
  -webkit-transition: opacity .1s ease-in;
  -moz-transition: opacity .1s ease-in;
  transition: opacity .1s ease-in;
  opacity: 1
}

#emoji_menu #emoji_preview_text {
  font-size: .9rem;
  line-height: .9rem;
  padding: .6rem .7rem .8rem 0;
  background: #F7F7F7;
  color: #555459;
  font-weight: 700;
  float: left;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap
}

#emoji_menu #emoji_preview_text.is_shortened {
  width: 180px
}

#emoji_menu #emoji_menu_footer #emoji_preview_img span.emoji-sizer {
  margin-top: -.3rem;
  vertical-align: top;
  font-size: 2.25rem;
  line-height: 2.25rem
}

#emoji_menu #emoji_menu_items_scroller {
  max-height: 270px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  position: relative;
  border-right: 0!important
}

#emoji_menu .emoji_menu_items_scroller {
  outline: 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller {
  border-right: .25rem solid transparent
}

.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 8px
}

.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #fff
}

.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar #emoji_menu .emoji_menu_items_scroller {
  margin-right: 2px
}

.supports_custom_scrollbar.slim_scrollbar #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.supports_custom_scrollbar.slim_scrollbar #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-thumb {
  background-color: rgba(113, 114, 116, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #717274;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar #emoji_menu .emoji_menu_items_scroller::-webkit-scrollbar-thumb:hover {
  background-color: rgba(113, 114, 116, .8)
}

#emoji_menu .icon_search {
  top: .8125rem;
  left: 1rem;
  text-shadow: none;
  display: block;
  position: absolute
}

#emoji_menu ul {
  list-style-type: none;
  margin: 0
}

#emoji_menu ul li {
  margin: 0;
  padding: 0;
  overflow: hidden
}

#emoji_menu ul li a {
  display: block;
  font-weight: 400;
  text-decoration: none;
  padding: .25rem .7rem;
  overflow: hidden;
  border-radius: 6px;
  background: 0 0;
  margin: 0;
  height: 2rem
}

#emoji_menu ul li a:hover {
  text-decoration: none;
  overflow: hidden
}

#emoji_menu.skin_tone_1 .skin_tone:not(.skin_tone_1),
#emoji_menu.skin_tone_2 .skin_tone:not(.skin_tone_2),
#emoji_menu.skin_tone_3 .skin_tone:not(.skin_tone_3),
#emoji_menu.skin_tone_4 .skin_tone:not(.skin_tone_4),
#emoji_menu.skin_tone_5 .skin_tone:not(.skin_tone_5),
#emoji_menu.skin_tone_6 .skin_tone:not(.skin_tone_6) {
  display: none!important
}

#emoji_menu a {
  font-weight: 400;
  text-decoration: none;
  padding: .25rem 0;
  overflow: hidden;
  border-radius: 6px;
  background: 0 0;
  margin: 0;
  height: 2rem
}

#emoji_menu a:hover {
  text-decoration: none;
  overflow: hidden
}

#emoji_menu #emoji_menu_items_div {
  position: relative;
  padding: 33px 0 0 8px;
  margin-top: -33px;
  min-height: 270px
}

#emoji_menu #emoji_menu_footer {
  background: #F7F7F7;
  padding-bottom: .4rem;
  border-top: 1px solid rgba(0, 0, 0, .15);
  position: relative
}

#emoji_menu #monkey_scroll_wrapper_for_emoji_menu_items_scroller {
  background: #fff
}

#emoji_menu #emoji_menu_header {
  padding: 4px 0 0 7px;
  border-bottom: 1px solid rgba(0, 0, 0, .15);
  height: 38px
}

#emoji_menu #emoji_menu_header .emoji_grouping_tab {
  height: 100%
}

#emoji_menu #emoji_menu_header .emoji_grouping_tab.active {
  margin-bottom: -1px
}

#emoji_menu .emoji_sticky_header {
  position: absolute;
  width: 100%;
  z-index: 10;
  top: -1px;
  padding-top: 1px
}

#emoji_menu .emoji_sticky_header h3 {
  position: absolute!important;
  right: 12px;
  left: 0;
  padding: 0 8px
}

#emoji_menu .emoji_li {
  border-color: transparent!important;
  font-size: 20px;
  text-align: center;
  line-height: 21px;
  width: 36px;
  height: 32px;
  margin-bottom: -1px;
  margin-right: 1px;
  float: none;
  display: inline-block
}

#emoji_menu .emoji_li span.emoji-sizer {
  line-height: 20px
}

#emoji_menu .emoji_li a {
  color: #26454d!important;
  text-shadow: 0 1px #fff;
  padding: .25rem 0 .2rem!important;
  -webkit-transition: background .15s ease-out 50ms;
  -moz-transition: background .15s ease-out 50ms;
  transition: background .15s ease-out 50ms
}

#emoji_menu .emoji_li a:hover {
  -webkit-transition: background 50ms ease-out;
  -moz-transition: background 50ms ease-out;
  transition: background 50ms ease-out
}

#emoji_menu .emoji_li a.disabled,
#emoji_menu .emoji_li.disabled {
  background: #E8E8E8!important;
  opacity: .8
}

#emoji_menu #emoji_menu_items_scroller .emoji_li {
  border-color: transparent!important;
  font-size: 20px;
  text-align: center;
  line-height: 21px;
  width: 36px;
  height: 32px;
  margin-bottom: -1px;
  margin-right: 1px;
  float: none;
  display: inline-block;
  color: #26454d!important;
  text-shadow: 0 1px #fff;
  padding: .25rem 0 .2rem!important;
  -webkit-transition: background .15s ease-out 50ms;
  -moz-transition: background .15s ease-out 50ms;
  transition: background .15s ease-out 50ms
}

#emoji_menu #emoji_menu_items_scroller .emoji_li:hover {
  -webkit-transition: background 50ms ease-out;
  -moz-transition: background 50ms ease-out;
  transition: background 50ms ease-out
}

#emoji_menu #emoji_preview_img {
  float: left;
  font-size: 2rem;
  height: 54px;
  line-height: 2rem;
  padding: .6rem .5rem 0 .1rem;
  vertical-align: middle;
  width: 46px
}

#emoji_menu #emoji_div_handy_rxns {
  margin-top: -1px;
  padding: .3rem .7rem;
  border-bottom: 1px solid rgba(0, 0, 0, .15)
}

#emoji_menu #emoji_ul_handy_rxns .emoji_li {
  margin-right: 1px
}

#emoji_menu #emoji_skin_button_container,
#emoji_menu #emoji_skin_picker,
#emoji_menu #emoji_skin_tip {
  position: absolute;
  font-size: 1.2rem;
  color: #989ba0;
  padding: 3px;
  right: 16px;
  bottom: -33px;
  -webkit-transition: opacity .1s ease-in 0s;
  -moz-transition: opacity .1s ease-in 0s;
  transition: opacity .1s ease-in 0s
}

#emoji_menu #emoji_skin_button_container {
  opacity: 1;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 7px 3px 2px;
  display: flex
}

#emoji_menu #emoji_skin_button_container span.emoji-sizer {
  font-size: 23px
}

#emoji_menu #emoji_skin_picker_label {
  font-size: .9rem;
  display: inline-block;
  margin: 0 3px;
  font-weight: 700
}

#emoji_menu #emoji_menu_content:hover #emoji_skin_button_container {
  border: 1px solid #fff;
  background: #fff
}

#emoji_menu #emoji_skin_picker {
  opacity: 0;
  background: #fff;
  border-radius: 10px;
  pointer-events: none;
  padding: 7px 3px 2px;
  border: 1px solid transparent;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none
}

#emoji_menu #emoji_skin_picker.shown {
  opacity: 1;
  pointer-events: all
}

#emoji_menu #emoji_skin_tip {
  opacity: 0;
  font-size: .68rem;
  bottom: -50px;
  right: 14px;
  z-index: 2;
  pointer-events: none;
  font-weight: 700
}

#emoji_menu #emoji_skin_tip.shown {
  opacity: 1
}

#emoji_menu #emoji_skin_picker>span {
  border-radius: 2px
}

#emoji_menu #emoji_skin_picker>span[data-preferred=true] {
  background: #fff
}

#emoji_menu #emoji_skin_picker span.emoji-sizer {
  font-size: 23px
}

#emoji_menu #emoji_skin_picker span.emoji,
#emoji_menu #emoji_skin_picker span.emoji-outer {
  cursor: pointer
}

#emoji_menu #emoji_preview_deluxe {
  position: absolute;
  font-size: 1.2rem;
  color: #989ba0;
  bottom: -26px;
  left: 14px;
  opacity: 1;
  -webkit-transition: opacity .1s ease-in 1.1s;
  -moz-transition: opacity .1s ease-in 1.1s;
  transition: opacity .1s ease-in 1.1s
}

#emoji_menu #emoji_menu_footer.previewing #emoji_preview_deluxe {
  opacity: 0;
  -webkit-transition: opacity 50ms ease-in;
  -moz-transition: opacity 50ms ease-in;
  transition: opacity 50ms ease-in
}

#emoji_menu .emoji_tip {
  clear: both;
  font-weight: 400;
  font-size: .8rem;
  margin: 10px 0;
  text-align: center;
  color: #696969
}

#emoji_menu .emoji_tip .ts_icon_plus {
  vertical-align: middle
}

#emoji_menu .can_add_emoji_tip {
  margin-top: 0
}

#emoji_menu #emoji_zero_results {
  clear: both;
  font-weight: 400;
  font-size: 1rem;
  padding-top: 70px;
  padding-right: 0;
  padding-bottom: 10px;
  color: #bababa;
  text-align: center
}

#emoji_menu #emoji_input {
  font-size: 15px;
  margin: 0;
  height: 28px;
  width: 100%;
  border-radius: 1rem;
  padding: 2px 32px
}

#emoji_menu #emoji_input:focus {
  box-shadow: inset 0 0 0 rgba(0, 0, 0, .3);
  border-color: #C5C5C5
}

#emoji_menu #emoji_input_container {
  background: #fff;
  padding: 8px;
  position: relative
}

#emoji_menu #emoji_menu.key_mode .emoji_li:not(.key_selection) a:hover {
  background: 0 0!important
}

#emoji_menu #emoji_aliases {
  font-size: .8rem;
  font-weight: 400
}

#emoji_menu a.emoji_grouping_tab {
  color: #9e9ea6;
  display: inline-block;
  padding: 4px 5.8px 6px;
  border-radius: .6rem .6rem 0 0;
  margin-right: 3px;
  border-bottom: 3px solid transparent
}

#emoji_menu a.emoji_grouping_tab:hover {
  color: #555459;
  text-decoration: none;
  background: #fbfaf8
}

#emoji_menu a.emoji_grouping_tab.active {
  color: #9e9ea6;
  background: #fbfaf8;
  padding-top: 3px;
  border-bottom: 3px solid #2ab27b
}

.is_apple_webkit #emoji_menu .emoji_li {
  margin-bottom: 1px!important
}

#emoji_menu .emoji_tip i,
#emoji_menu div#emoji_zero_results i {
  color: #bababa
}

#emoji_menu .emoji_li[data-color-index="0"].key_selection,
#emoji_menu .emoji_li[data-color-index="0"]:hover {
  background: #b7e887
}

#emoji_menu .emoji_li[data-color-index="1"].key_selection,
#emoji_menu .emoji_li[data-color-index="1"]:hover {
  background: #b5e0fe
}

#emoji_menu .emoji_li[data-color-index="2"].key_selection,
#emoji_menu .emoji_li[data-color-index="2"]:hover {
  background: #f9ef67
}

#emoji_menu .emoji_li[data-color-index="3"].key_selection,
#emoji_menu .emoji_li[data-color-index="3"]:hover {
  background: #F3C1FD
}

#emoji_menu .emoji_li[data-color-index="4"].key_selection,
#emoji_menu .emoji_li[data-color-index="4"]:hover {
  background: #FFE1AE
}

#emoji_menu .emoji_li[data-color-index="5"].key_selection,
#emoji_menu .emoji_li[data-color-index="5"]:hover {
  background: #E0DFFF
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="0"]:hover {
  background: 0 0
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="0"].key_selection {
  background: #b7e887
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="1"]:hover {
  background: 0 0
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="1"].key_selection {
  background: #b5e0fe
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="2"]:hover {
  background: 0 0
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="2"].key_selection {
  background: #f9ef67
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="3"]:hover {
  background: 0 0
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="3"].key_selection {
  background: #F3C1FD
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="4"]:hover {
  background: 0 0
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="4"].key_selection {
  background: #FFE1AE
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="5"]:hover {
  background: 0 0
}

#emoji_menu[data-using-keyboard=true] .emoji_li[data-color-index="5"].key_selection {
  background: #E0DFFF
}

.popover_menu {
  background-color: #fff;
  border-top: 1px solid #E0E0E0;
  border-right: 1px solid rgba(0, 0, 0, .07);
  border-left: 1px solid rgba(0, 0, 0, .07);
  border-bottom: 1px solid rgba(0, 0, 0, .07);
  box-shadow: 0 0 1px rgba(0, 0, 0, .04), 0 2px 8px rgba(0, 0, 0, .1);
  border-radius: 10px;
  background-clip: padding-box;
  overflow: visible
}

.popover_menu .arrow,
.popover_menu .arrow_shadow {
  position: absolute;
  top: -5px;
  left: 31px;
  -webkit-transform: scaleY(.8);
  -moz-transform: scaleY(.8);
  -ms-transform: scaleY(.8);
  transform: scaleY(.8)
}

.popover_menu .arrow:after,
.popover_menu .arrow_shadow:after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background-clip: padding-box;
  background-color: #fff;
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg)
}

.popover_menu .arrow_shadow:after {
  z-index: -1;
  box-shadow: -1px -1px 0 0 #E0E0E0, -1px -1px 2px rgba(0, 0, 0, .08)
}

.popover_menu.showing_header .arrow:after,
.popover_menu.showing_header .arrow_shadow:after {
  background-color: #fafafa
}

.popover_menu .content {
  background-color: #fff;
  border-radius: 10px;
  position: relative
}

.popover_menu.menu .menu_simple_header {
  position: relative
}

.popover_menu.menu .menu_footer,
.popover_menu.menu .menu_simple_header {
  border-radius: 10px
}

body.ReactModal__Body--open {
  position: relative
}

.popover_mask.react_popover_mask {
  z-index: 1053;
  position: absolute
}

#menu.search_filter_menu {
  max-width: none
}

#menu.search_filter_menu #menu_items_scroller {
  width: auto
}

#menu.search_filter_menu #monkey_scroll_wrapper_for_menu_items_scroller {
  border-radius: 10px;
  position: relative
}

#menu.search_filter_menu .arrow,
#menu.search_filter_menu .arrow_shadow {
  left: 24px
}

#menu.search_filter_menu ul {
  margin: 0
}

#menu.search_filter_menu li {
  padding: 12px 16px
}

#menu.search_filter_menu li:last-child {
  padding-bottom: 9px
}

#menu.search_filter_menu input {
  width: auto;
  font-size: 1rem;
  -webkit-transform: translateY(-3px);
  -moz-transform: translateY(-3px);
  -ms-transform: translateY(-3px);
  transform: translateY(-3px)
}

#menu.search_filter_menu label {
  font-weight: 400;
  font-size: .9rem;
  padding: 0;
  margin-right: 0
}

#chat_input_tab_ui~#client-ui #convo_scroller,
#chat_input_tab_ui~#client-ui #threads_msgs_scroller_div {
  overflow: hidden
}

#menu.notifications_menu {
  max-width: 300px;
  background: 0 0
}

#menu.notifications_menu .menu_content {
  border-radius: 6px
}

.supports_custom_scrollbar #menu.notifications_menu .menu_content {
  background: #fff
}

#menu.notifications_menu .dnd_banner {
  padding: 60px .9375rem .9375rem;
  background-color: #202C3A;
  background-image: linear-gradient(#202731, #202C3A 100%);
  line-height: 25px;
  color: #fff;
  position: relative
}

#menu.notifications_menu .dnd_banner:before {
  content: '';
  position: absolute;
  top: 15px;
  right: 5px;
  width: 180px;
  height: 80px;
  background-image: url(/436da/img/notifications_menu/dnd_menu_header_bg.svg);
  background-size: 190px;
  background-repeat: no-repeat
}

#menu.notifications_menu .dnd_banner .dnd_on_label {
  font-weight: 700
}

#menu.notifications_menu .dnd_banner .dnd_on_label,
#menu.notifications_menu .dnd_banner .dnd_schedule_label,
#menu.notifications_menu .dnd_banner .snooze_time_label {
  padding: 0 .9375rem
}

#menu.notifications_menu .dnd_banner .dnd_schedule_label,
#menu.notifications_menu .dnd_banner .snooze_time_label {
  margin-top: -3px
}

#menu.notifications_menu .dnd_banner .dnd_illustration,
#menu.notifications_menu .dnd_banner .snooze_illustration {
  width: 48px;
  height: 39px;
  position: absolute;
  top: 15px;
  right: 20px
}

#menu.notifications_menu .dnd_banner .dnd_illustration {
  background: url(/29ab/img/notifications_menu/dnd_zzz_emoji@2x.png) right no-repeat;
  background-size: contain
}

#menu.notifications_menu .dnd_banner .snooze_illustration {
  background: url(/29ab/img/notifications_menu/dnd_snooze_emoji@2x.png) right no-repeat;
  background-size: contain
}

#menu.notifications_menu #monkey_scroll_wrapper_for_menu_items_scroller {
  border-radius: 0
}

.menu_launcher,
.menu_launcher_large {
  border: 1px solid #E8E8E8;
  cursor: pointer;
  display: inline-block;
  line-height: 24px;
  background-color: #fff;
  padding: .5rem 2rem .5rem .5rem;
  position: relative;
  border-radius: 6px
}

.menu_launcher:before,
.menu_launcher_large:before {
  position: absolute;
  right: .5rem;
  top: 50%;
  transform: translateY(-50%);
  content: '\E271';
  display: inline-block;
  font-family: Slack;
  font-size: 20px;
  font-style: normal;
  font-weight: 400
}

.menu_launcher img,
.menu_launcher_large img {
  display: block;
  float: left;
  height: 24px;
  margin-right: .5rem;
  width: 24px
}

.menu_launcher_large {
  border: 1px solid #C5C5C5;
  padding: 10px 32px 10px 12px
}

.menu_launcher_large img {
  height: 28px;
  width: 28px;
  margin-right: 12px
}

.menu_launcher_large .selected_team_name {
  font-size: 20px;
  line-height: 28px
}

.menu.avatar_menu {
  z-index: 1052
}

.menu.avatar_menu ul li.highlighted a ts-icon,
.menu.avatar_menu:not(.keyboard_active) ul li:hover:not(.disabled) a ts-icon {
  color: #007AB8
}

.menu.avatar_menu ul {
  margin: .5rem 0
}

.menu.avatar_menu ul li {
  margin: 0 .5rem
}

.menu.avatar_menu ul li:hover ts-icon {
  color: #007AB8;
  background: #fff
}

.menu.avatar_menu ul li a {
  color: inherit;
  margin: 0;
  padding: 4px
}

.menu.avatar_menu ul li a img,
.menu.avatar_menu ul li a ts-icon {
  color: #fff;
  display: inline-block;
  height: 24px;
  margin-right: .5rem;
  border-radius: .25rem;
  text-align: center;
  width: 24px
}

.menu.avatar_menu ul li a ts-icon {
  background-color: #2D9EE0
}

.menu.avatar_menu ul li a ts-icon:before {
  display: inline-block;
  font-size: .75rem;
  height: 24px;
  text-shadow: none;
  -webkit-font-smoothing: none;
  width: 24px
}

#toggle-subscription-status {
  min-height: 44px
}

#toggle-subscription-status.fetching_status {
  min-width: 269px
}

#toggle-subscription-status .subscription_desc {
  font-size: 12px;
  line-height: 15px;
  color: #717274;
  padding-bottom: 4px
}

#toggle-subscription-status:hover .subscription_desc {
  color: inherit
}

#toggle-subscription-status .follow_message,
#toggle-subscription-status .follow_thread,
#toggle-subscription-status .unfollow_message,
#toggle-subscription-status .unfollow_thread {
  display: none
}

#toggle-subscription-status .loading_subscription_status {
  line-height: 44px
}

#toggle-subscription-status[data-subscribed] .loading_subscription_status {
  display: none
}

#toggle-subscription-status[data-subscribed][data-subscribed=true][data-thread-ts] .unfollow_thread {
  display: inline
}

#toggle-subscription-status[data-subscribed][data-subscribed=true]:not([data-thread-ts]) .unfollow_message {
  display: inline
}

#toggle-subscription-status[data-subscribed][data-subscribed=false][data-thread-ts] .follow_thread {
  display: inline
}

#toggle-subscription-status[data-subscribed][data-subscribed=false]:not([data-thread-ts]) .follow_message {
  display: inline
}

.avatar_menu_signin_item {
  color: #007AB8
}

.avatar_menu_signin_item:hover {
  color: #fff
}

.popover_mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%
}

.menu.keep_menu_open_if_target_clicked_again .popover_mask {
  display: none
}

.menu.file_menu {
  min-width: 250px
}

#recap_menu_items .inline-emoji {
  padding-right: 10px
}

#recap_menu_items .recap_description {
  display: block;
  text-decoration: none;
  padding: 0 1rem 0 .5rem;
  margin: 0 .9375rem;
  border-radius: .25rem;
  white-space: nowrap;
  outline: 0;
  font-size: 15px;
  line-height: 25px;
  background: 0 0;
  color: #2C2D30
}

#recap_menu_items .recap_learn_more {
  display: block;
  text-decoration: none;
  padding: 0 1rem 0 .5rem;
  margin: 0 .9375rem;
  border-radius: .25rem;
  white-space: nowrap;
  outline: 0;
  font-size: 15px;
  line-height: 25px;
  background: 0 0;
  color: #007AB8
}

#recap_menu_items .recap_learn_more:hover {
  text-decoration: underline
}

.member_file_filter_menu #menu_items_scroller {
  display: none
}

.member_file_filter_menu #menu_list_container {
  margin-bottom: 1rem
}

.sounds_menu_option {
  display: flex
}

.sounds_menu_option a {
  flex: 1
}

.sounds_menu_option .sound_preview_button {
  visibility: hidden;
  margin-right: 15px;
  height: 25px
}

.sounds_menu_option .sound_preview_button:before {
  position: relative;
  top: -1px
}

.sounds_menu_option.highlighted .sound_preview_button,
.sounds_menu_option:hover .sound_preview_button {
  visibility: visible
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.sidebar_menu {
  margin-bottom: 2rem
}

.sidebar_menu_header {
  font-size: 18px;
  font-weight: 900;
  line-height: 22px;
  padding: 0 9px;
  margin-bottom: 12px
}

.sidebar_menu_list {
  list-style-type: none;
  margin: 0
}

.sidebar_menu_list>:not(:first-child) {
  margin-top: 3px
}

.sidebar_menu_list_item {
  cursor: pointer;
  font-size: 15px!important;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: #555459;
  line-height: 15px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 4px
}

.sidebar_menu_list_item.is_active {
  background-color: #3aa3e3;
  border-color: #3aa3e3;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .1)
}

.sidebar_menu_list_item:not(.is_active):hover {
  background-color: #edf7fd;
  border-color: #dcf0fb
}

a.sidebar_menu_list_item {
  color: #555459
}

a.sidebar_menu_list_item:hover {
  text-decoration: none
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.plastic_typeahead_wrapper {
  position: relative
}

.plastic_typeahead {
  background: #fff;
  border: 1px solid #E8E8E8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, .2);
  left: 0;
  list-style-type: none;
  margin: 5px 0 0;
  overflow: hidden;
  position: absolute;
  border-radius: 4px;
  top: 100%;
  width: 100%
}

.plastic_typeahead_item {
  align-items: center;
  color: #555459;
  cursor: pointer;
  display: flex;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: .5rem;
  padding-top: .5rem
}

.plastic_typeahead_item+.plastic_typeahead_item {
  border-top: 1px solid #E8E8E8
}

.plastic_typeahead_item:not(.plastic_typeahead_item_no_results).is_active {
  background: #2D9EE0;
  border-top-color: #2D9EE0;
  color: #fff;
  text-decoration: none
}

.plastic_typeahead_item:not(.plastic_typeahead_item_no_results).is_active ts-icon {
  color: #555459
}

.plastic_typeahead_item:not(.plastic_typeahead_item_no_results)~.is_active {
  border-color: transparent
}

.plastic_typeahead_item:not(.plastic_typeahead_item_no_results):not(.is_active):hover {
  background: #edf7fd;
  border-color: #d3ecfa
}

.plastic_typeahead_item:not(.plastic_typeahead_item_no_results):not(.is_active):hover+.plastic_typeahead_item {
  border-color: #d3ecfa
}

a.plastic_typeahead_item {
  color: #555459;
  text-decoration: none
}

a.plastic_typeahead_item:hover {
  text-decoration: none
}

.plastic_typeahead_input {
  margin-bottom: 0
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.tab_menu {
  display: block;
  background-color: #fff;
  box-shadow: inset 0 -2px 0 0 #E8E8E8
}

.tab_menu:after,
.tab_menu:before {
  display: table;
  content: ' ';
  clear: both
}

.tab_menu .tab {
  background: 0 0;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  border: 0;
  padding: 0 0 .75rem;
  font-size: .85rem;
  font-family: Slack-Lato, appleLogo, sans-serif;
  line-height: 20px;
  color: #9e9ea6;
  display: inline-block;
  text-align: center;
  float: left;
  box-shadow: inset 0 -2px 0 0 transparent
}

.tab_menu .tab .ts_icon:before {
  vertical-align: top
}

.tab_menu .tab:hover {
  color: #555459;
  text-decoration: none
}

.tab_menu .tab.active,
.tab_menu .tab:active,
.tab_menu .tab:focus {
  outline: 0;
  color: #555459;
  box-shadow: inset 0 -2px 0 0 #2ab27b;
  text-decoration: none
}

.tab_menu .tab:disabled {
  cursor: not-allowed;
  color: #BABBBF
}

.tab_menu .tab:not(:last-child) {
  margin-right: 1.5rem
}

.tab_panels .panel {
  width: 100%;
  display: none
}

.tab_panels .panel.active {
  display: block
}

@media screen and (min-width:30rem) {
  .tab_menu.even_2 .tab {
    width: 50%
  }
  .tab_menu.even_3 .tab,
  .tab_menu.even_4 .tab {
    width: 33.33%
  }
}

.infinite_spinner {
  position: relative;
  margin: 0 auto
}

.infinite_spinner_large {
  width: 80px;
  height: 80px
}

.infinite_spinner_medium {
  width: 52px;
  height: 52px
}

.infinite_spinner_small {
  width: 24px;
  height: 24px
}

.infinite_spinner_spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
  -webkit-animation: 1.2s cubic-bezier(.25, .29, .54, .86) 0s infinite normal none spin;
  -moz-animation: 1.2s cubic-bezier(.25, .29, .54, .86) 0s infinite normal none spin;
  -o-animation: 1.2s cubic-bezier(.25, .29, .54, .86) 0s infinite normal none spin;
  animation: 1.2s cubic-bezier(.25, .29, .54, .86) 0s infinite normal none spin
}

.infinite_spinner_tail {
  -webkit-animation: 1.2s cubic-bezier(.41, .24, .64, .69) 0s infinite normal none spin;
  -moz-animation: 1.2s cubic-bezier(.41, .24, .64, .69) 0s infinite normal none spin;
  -o-animation: 1.2s cubic-bezier(.41, .24, .64, .69) 0s infinite normal none spin;
  animation: 1.2s cubic-bezier(.41, .24, .64, .69) 0s infinite normal none spin
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0)
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg)
  }
}

@-moz-keyframes spin {
  0% {
    -moz-transform: rotate(0);
    transform: rotate(0)
  }
  100% {
    -moz-transform: rotate(360deg);
    transform: rotate(360deg)
  }
}

@-ms-keyframes spin {
  0% {
    -ms-transform: rotate(0);
    transform: rotate(0)
  }
  100% {
    -ms-transform: rotate(360deg);
    transform: rotate(360deg)
  }
}

@keyframes spin {
  0% {
    transform: rotate(0)
  }
  100% {
    transform: rotate(360deg)
  }
}

.infinite_spinner_bg,
.infinite_spinner_path {
  stroke-width: 8;
  fill: none
}

.infinite_spinner_white {
  stroke: #fff
}

.infinite_spinner_blue {
  stroke: #50acf4
}

.infinite_spinner_bg {
  opacity: .2;
  stroke: grey
}

.infinite_spinner_path {
  stroke-dasharray: 55, 200;
  stroke-dashoffset: 90;
  stroke-linecap: round
}

.infinite_spinner_fast {
  animation-duration: .6s
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.member_image {
  border-radius: .2rem;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
  position: relative
}

.member_image_unknown {
  background: #E8E8E8
}

.member_image:focus {
  outline: 0
}

.member_image.thumb_16 {
  width: 16px;
  height: 16px
}

.member_image.thumb_20 {
  width: 20px;
  height: 20px
}

.member_image.thumb_24 {
  width: 24px;
  height: 24px
}

.member_image.thumb_28 {
  width: 28px;
  height: 28px
}

.member_image.thumb_32 {
  width: 32px;
  height: 32px
}

.member_image.thumb_36 {
  width: 36px;
  height: 36px
}

.member_image.thumb_48 {
  width: 48px;
  height: 48px
}

.member_image.thumb_56 {
  width: 56px;
  height: 56px
}

.member_image.thumb_72 {
  width: 72px;
  height: 72px
}

.member_image.thumb_192 {
  width: 192px;
  height: 192px
}

.member_image.thumb_512 {
  width: 512px;
  height: 512px
}

.member_image.thumb_24 .emoji-sizer {
  font-size: 24px
}

.member_image.thumb_32 .emoji-sizer {
  font-size: 32px
}

.member_image.thumb_36 .emoji-sizer {
  font-size: 36px
}

.member_image.thumb_48 .emoji-sizer {
  font-size: 48px
}

.member_image.thumb_72 .emoji-sizer {
  font-size: 64px;
  margin: 4px
}

.member_image.thumb_192 .emoji-sizer {
  font-size: 64px;
  margin: 64px
}

.bot_icon_default {
  -webkit-border-radius: 36px!important;
  -moz-border-radius: 36px!important;
  border-radius: 36px!important
}

.slackbot_icon {
  color: #38978D;
  float: left;
  margin-top: -3px;
  margin-left: -2px
}

.slackbot_icon:before {
  font-size: 18px
}

.channels_list_holder ul li a:hover .slackbot_icon,
.channels_list_holder ul li.active .slackbot_icon,
.channels_list_holder ul li.unread .slackbot_icon {
  opacity: 1;
  -moz-opacity: 1;
  -khtml-opacity: 1
}

.channels_list_holder ul li.active .slackbot_icon {
  color: #fff
}

.ts_icon_guest_large:before {
  margin: 0 -9px 0 -4px;
  font-size: 25px
}

.presence {
  width: 9px;
  height: 9px;
  margin: 0 .15rem;
  display: inline-block;
  vertical-align: baseline;
  background: 0 0;
  position: relative;
  color: #555459
}

.presence i.presence_icon {
  display: inline-block;
  font-size: 20px;
  line-height: 20px;
  position: absolute;
  top: -10px;
  left: -5px
}

.presence.away {
  opacity: .6;
  -moz-opacity: .6;
  -khtml-opacity: .6
}

.presence.active {
  color: #93cc93
}

h1 .presence {
  margin-bottom: .3rem
}

h3 .presence {
  margin-bottom: .1rem
}

#channels_scroller .presence.active {
  color: #38978D
}

#channels_scroller .presence.away {
  color: inherit
}

#channels_scroller.show_which_channel_is_active li.member.active .presence {
  color: #fff
}

#channels_scroller.show_which_channel_is_active li.member.active .presence.away {
  color: #625361;
  box-shadow: none;
  text-shadow: 1px 1px rgba(0, 0, 0, .1);
  opacity: 1;
  -moz-opacity: 1;
  -khtml-opacity: 1
}

.feature_name_tagging_client .team_list_item .member_name {
  font-size: .9375rem
}

#team_list {
  margin-bottom: 2rem
}

.team_list_item {
  line-height: 1.25rem;
  color: #555459;
  font-family: Slack-Lato, appleLogo, sans-serif;
  position: relative;
  clear: both;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
  word-break: break-word;
  font-size: .9375rem;
  cursor: default;
  margin: 0 1px 0 0;
  padding-top: 1rem;
  padding-bottom: 1rem;
  min-height: 72px;
  border-radius: 0;
  border-bottom: none;
  border-top: 1px solid #E8E8E8;
  width: 100%
}

.team_list_item .member_name_and_title {
  padding-top: .375rem
}

.team_list_item .member_name_and_title .current_status {
  margin-left: .2rem
}

.team_list_item:last-of-type {
  border-bottom-color: transparent
}

#member_preview_scroller a:not(.member_name):not(.current_status_preset_option):not(.member_details_manage_link):not(.current_status_presets_edit_link),
.team_list_item a:not(.member_name):not(.current_status_preset_option):not(.member_details_manage_link):not(.current_status_presets_edit_link) {
  color: #555459
}

body:not(.unify_user) #member_preview_scroller a:not(.member_name):not(.current_status_preset_option):not(.member_details_manage_link):not(.current_status_presets_edit_link):hover,
body:not(.unify_user) .team_list_item a:not(.member_name):not(.current_status_preset_option):not(.member_details_manage_link):not(.current_status_presets_edit_link):hover {
  color: #005E99;
  text-decoration: underline
}

.team_list_item a.member_preview_link:hover,
.team_list_item:hover a.member_preview_link {
  color: inherit
}

.team_list_item .member_details {
  padding: 0;
  min-height: 72px
}

.unify_user .team_list_item .member_details {
  min-height: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center
}

body:not(.unify_user) .team_list_item .member_item_inset {
  padding-left: 82px
}

body:not(.unify_user) .team_list_item .member_image {
  float: left;
  margin: 0 0 0 -82px
}

.team_list_item .member_name {
  font-weight: 900;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: 1.125rem;
  color: #555459;
  display: inline-block;
  margin: 0 0 .1rem
}

.team_list_item .member_meta {
  overflow: hidden
}

#disabled_members_tab a {
  color: #9e9ea6;
  font-size: .8rem;
  border: none
}

#disabled_members_tab a:hover {
  background: #fff;
  color: #005E99
}

#disabled_members_tab.active a {
  color: #555459
}

#member_preview_scroller .team_list_item:first-child,
#member_preview_scroller h5+.team_list_item,
#team_list .team_list_item:first-child,
#team_list h5+.team_list_item {
  border-top: none
}

#member_preview_scroller .member_image,
#team_list .member_image {
  flex: none
}

#member_preview_scroller .member_details .disclosure_arrow,
#team_list .member_details .disclosure_arrow {
  margin-left: auto;
  visibility: hidden;
  -webkit-transform: rotateX(0) scale(1);
  -moz-transform: rotateX(0) scale(1);
  -ms-transform: rotateX(0) scale(1);
  transform: rotateX(0) scale(1);
  transition: transform .1s
}

#member_preview_scroller .member_details p,
#team_list .member_details p {
  margin-bottom: 0
}

#member_preview_scroller .team_list_item.expanded .disclosure_arrow,
#team_list .team_list_item.expanded .disclosure_arrow {
  -webkit-transform: rotateX(180deg) scale(1);
  -moz-transform: rotateX(180deg) scale(1);
  -ms-transform: rotateX(180deg) scale(1);
  transform: rotateX(180deg) scale(1)
}

#member_preview_scroller .team_list_item:active .disclosure_arrow,
#team_list .team_list_item:active .disclosure_arrow {
  -webkit-transform: rotateX(0) scale(1.1);
  -moz-transform: rotateX(0) scale(1.1);
  -ms-transform: rotateX(0) scale(1.1);
  transform: rotateX(0) scale(1.1)
}

#member_preview_scroller .team_list_item.expanded:active .disclosure_arrow,
#team_list .team_list_item.expanded:active .disclosure_arrow {
  -webkit-transform: rotateX(180deg) scale(1.1);
  -moz-transform: rotateX(180deg) scale(1.1);
  -ms-transform: rotateX(180deg) scale(1.1);
  transform: rotateX(180deg) scale(1.1)
}

#member_preview_scroller .expanded_member_details,
#team_list .expanded_member_details {
  display: none
}

#member_preview_scroller .team_list_item.expanded .expanded_member_details,
#team_list .team_list_item.expanded .expanded_member_details {
  display: block
}

#member_preview_scroller .member_data_table,
#team_list .member_data_table {
  margin-bottom: 0
}

#member_preview_scroller .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link),
#team_list .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link) {
  color: #555459
}

#member_preview_scroller .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link):hover,
#team_list .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link):hover {
  color: #005E99
}

#member_preview_scroller a.member_action_button,
#team_list a.member_action_button {
  font-size: 14px;
  border-width: 1px;
  max-width: 300px;
  color: #9e9ea6!important
}

#member_preview_scroller a.member_action_button:hover,
#team_list a.member_action_button:hover {
  border-width: 1px;
  text-decoration: none;
  color: #005E99!important;
  border-color: #005E99!important
}

#member_preview_scroller .team_directory_icon,
#team_list .team_directory_icon {
  background: url(/66f9/img/team_directory_icons.png) no-repeat;
  vertical-align: middle
}

#member_preview_scroller .team_directory_icon.message_icon,
#team_list .team_directory_icon.message_icon {
  background-position: 0 0;
  width: 16px;
  height: 16px
}

#member_preview_scroller .team_directory_icon.more_icon,
#team_list .team_directory_icon.more_icon {
  background-position: 0 -40px;
  width: 16px;
  height: 4px
}

#member_preview_scroller .member_action_button:hover .team_directory_icon.message_icon,
#team_list .member_action_button:hover .team_directory_icon.message_icon {
  background-position: 0 -20px
}

#member_preview_scroller .member_action_button:hover .team_directory_icon.more_icon,
#team_list .member_action_button:hover .team_directory_icon.more_icon {
  background-position: 0 -46px
}

#member_preview_scroller .ts_icon_shared_channels,
#team_list .ts_icon_shared_channels {
  position: relative;
  top: 3px
}

#member_preview_scroller .ts_icon_shared_channels:before,
#team_list .ts_icon_shared_channels:before {
  line-height: 0
}

.filter_header {
  background-color: #E8E8E8;
  font-family: Slack-Lato, appleLogo, sans-serif;
  line-height: 1.5rem;
  font-size: .9375rem;
  padding: 0 .5rem;
  margin-right: .0625rem
}

#client-ui #team_list .filter_header {
  margin: .0625rem .0625rem 0 0
}

@media only screen and (-webkit-min-device-pixel-ratio:2),
only screen and (min-resolution:192dpi),
only screen and (min-resolution:2dppx) {
  #member_preview_scroller .team_directory_icon,
  #team_list .team_directory_icon {
    background: url(/2603/img/team_directory_icons@2x.png) no-repeat;
    background-size: 100%
  }
}

#client-ui #team_list .members_long_list,
#member_preview_scroller .members_long_list {
  margin-top: .125rem
}

#client-ui #team_list .members_long_list .team_list_item,
#member_preview_scroller .members_long_list .team_list_item {
  left: 0;
  right: 0;
  padding: .5625rem
}

#client-ui #team_list .team_list_item,
#member_preview_scroller .team_list_item {
  padding: .5rem;
  cursor: pointer
}

body:not(.unify_user) #client-ui #team_list .team_list_item,
body:not(.unify_user) #member_preview_scroller .team_list_item {
  border-radius: 5px;
  border: 1px solid transparent
}

body:not(.unify_user) #client-ui #team_list .team_list_item:hover,
body:not(.unify_user) #member_preview_scroller .team_list_item:hover {
  border-color: #E0E0E0
}

.unify_user #client-ui #team_list .team_list_item,
.unify_user #member_preview_scroller .team_list_item {
  border-bottom: 1px solid #E0E0E0;
  border-top: none;
  padding-left: 12px
}

.unify_user #client-ui #team_list .team_list_item:hover,
.unify_user #member_preview_scroller .team_list_item:hover {
  background: #f9f9f9
}

#client-ui #team_list .team_list_item .disclosure_arrow,
#member_preview_scroller .team_list_item .disclosure_arrow {
  position: absolute;
  right: -8px;
  top: 29px
}

#client-ui #team_list .team_list_item .member_name_and_title,
#member_preview_scroller .team_list_item .member_name_and_title {
  padding-top: .375rem
}

#client-ui #team_list .team_list_item .member_name_and_title .member_title,
#member_preview_scroller .team_list_item .member_name_and_title .member_title {
  line-height: 1.25rem;
  margin-top: 0
}

#client-ui #team_list .team_list_item.expanded,
#member_preview_scroller .team_list_item.expanded {
  border-color: rgba(217, 217, 217, .5)
}

#client-ui #team_list .team_list_item:hover,
#member_preview_scroller .team_list_item:hover {
  border-color: #d9d9d9
}

#client-ui #team_list .team_list_item:hover .member_details .disclosure_arrow,
#member_preview_scroller .team_list_item:hover .member_details .disclosure_arrow {
  visibility: visible
}

#client-ui #team_list .member_details,
#member_preview_scroller .member_details {
  padding-right: 32px
}

body:not(.unify_user) #client-ui #team_list .member_details,
body:not(.unify_user) #member_preview_scroller .member_details {
  align-items: center
}

#client-ui #team_list .member_action_button,
#member_preview_scroller .member_action_button {
  width: 48%
}

#client-ui #team_list .member_action_button+.member_action_button,
#member_preview_scroller .member_action_button+.member_action_button {
  margin-left: .5rem
}

#client-ui #team_list .team_directory_buttons,
#member_preview_scroller .team_directory_buttons {
  display: flex;
  -ms-flex-pack: justify;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -moz-justify-content: space-between;
  justify-content: space-between
}

#client-ui #team_list .member_action_button .more_icon,
#member_preview_scroller .member_action_button .more_icon {
  -webkit-transform: translateY(-1px);
  -moz-transform: translateY(-1px);
  -ms-transform: translateY(-1px);
  transform: translateY(-1px)
}

#team_list_scroller {
  margin-top: 6px
}

#client-ui #team_list {
  margin-left: 8px
}

#client-ui #team_list .expanded_member_details {
  opacity: 0;
  -webkit-transition: opacity .1s;
  -moz-transition: opacity .1s;
  transition: opacity .1s
}

#client-ui #team_list .show_extra_data .expanded_member_details {
  opacity: 1
}

.member_details_divider.with_current_status .small_margin_top {
  margin-bottom: 20px
}

.member_details_divider.with_current_status .small_margin_bottom {
  margin-top: 20px
}

.current_status_status_label {
  position: relative;
  top: 7px
}

#member_preview_scroller .member_data_table .current_status_cell,
.statuses_container {
  padding: 0
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container,
.statuses_container .current_status_container {
  position: relative;
  left: -12px;
  width: calc(100% + 12px)
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container .current_status_cover,
.statuses_container .current_status_container .current_status_cover {
  position: relative;
  padding: .45rem .65rem .55rem;
  background-clip: padding-box;
  min-height: 36px;
  display: inline-block;
  width: 100%;
  border: 1px solid transparent;
  cursor: pointer;
  border-radius: 4px
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container .current_status_cover .current_status_cover_content,
.statuses_container .current_status_container .current_status_cover .current_status_cover_content {
  padding-left: 27px;
  line-height: normal
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container .current_status_cover .current_status_clear_icon_cover,
.statuses_container .current_status_container .current_status_cover .current_status_clear_icon_cover {
  position: absolute;
  right: 7px;
  top: 2.5px;
  line-height: normal
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container .current_status_cover:hover,
.statuses_container .current_status_container .current_status_cover:hover {
  border-color: #C5C5C5
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container .current_status_cover:hover .current_status_clear_icon_cover,
.statuses_container .current_status_container .current_status_cover:hover .current_status_clear_icon_cover {
  opacity: 1
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container .current_status_input_container,
.statuses_container .current_status_container .current_status_input_container {
  opacity: 0;
  display: none;
  -webkit-transition: opacity .15s ease;
  -moz-transition: opacity .15s ease;
  transition: opacity .15s ease
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active) .current_status_cover.without_status_set,
.statuses_container .current_status_container:not(.active) .current_status_cover.without_status_set {
  display: block
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active) .current_status_cover.without_status_set .current_status_placeholder,
.statuses_container .current_status_container:not(.active) .current_status_cover.without_status_set .current_status_placeholder {
  color: rgba(0, 0, 0, .35)!important
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active) .current_status_cover.without_status_set .current_status_placeholder .current_status_empty_emoji_cover .ts_icon,
.statuses_container .current_status_container:not(.active) .current_status_cover.without_status_set .current_status_placeholder .current_status_empty_emoji_cover .ts_icon {
  top: -2px
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active) .current_status_cover.with_status_set,
.statuses_container .current_status_container:not(.active) .current_status_cover.with_status_set {
  display: none
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active).with_status_set .current_status_cover,
.statuses_container .current_status_container:not(.active).with_status_set .current_status_cover {
  padding: .35rem .75rem .25rem .55rem
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active).with_status_set .current_status_cover .current_status_emoji_picker_cover,
.statuses_container .current_status_container:not(.active).with_status_set .current_status_cover .current_status_emoji_picker_cover {
  position: relative;
  display: inline-block;
  width: auto;
  height: auto;
  left: 2px;
  top: 1px;
  margin-right: 5px
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active).with_status_set .current_status_cover .current_status_cover_content,
.statuses_container .current_status_container:not(.active).with_status_set .current_status_cover .current_status_cover_content {
  padding-left: 0;
  line-height: 1.4
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active).with_status_set .current_status_cover.without_status_set,
.statuses_container .current_status_container:not(.active).with_status_set .current_status_cover.without_status_set {
  display: none
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active).with_status_set .current_status_cover.with_status_set,
.statuses_container .current_status_container:not(.active).with_status_set .current_status_cover.with_status_set {
  display: block
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container:not(.active).with_status_set .current_status_cover.not_editable:hover,
.statuses_container .current_status_container:not(.active).with_status_set .current_status_cover.not_editable:hover {
  cursor: default;
  border-color: transparent
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container.active .current_status_input_container,
.statuses_container .current_status_container.active .current_status_input_container {
  display: block;
  opacity: 1
}

#member_preview_scroller .member_data_table .current_status_cell .current_status_container.active .current_status_cover,
.statuses_container .current_status_container.active .current_status_cover {
  display: none
}

.current_status_input_wrap {
  position: relative
}

.current_status_input_wrap .current_status_input {
  font-size: 15px;
  padding-right: 33px;
  padding-left: 50px
}

.current_status_input_wrap .status_clear_icon_wrap {
  position: absolute;
  right: 8px;
  top: 9.5px
}

.current_status_input_wrap .status_clear_icon_wrap.hidden~.current_status_input {
  padding-right: 0
}

#member_preview_scroller .current_status_input_wrap .status_clear_icon_wrap {
  top: 7.5px
}

.current_status_emoji_picker,
.current_status_emoji_picker_cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-clip: padding-box;
  border-right-width: 1px;
  border-right-style: solid;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-radius: 4px 0 0 4px
}

.current_status_emoji_picker {
  bottom: 0;
  border-right-color: #C5C5C5
}

.current_status_emoji_picker .current_status_emoji {
  line-height: 36px
}

.current_status_emoji_picker_cover {
  border-right-color: transparent;
  height: 36px;
  line-height: normal
}

.current_status_emoji_picker_cover .current_status_emoji_cover .emoji-sizer {
  position: relative;
  left: -1px
}

.current_status_clear_icon_cover,
.status_clear_icon {
  opacity: .5
}

.current_status_clear_icon_cover:hover,
.status_clear_icon:hover {
  opacity: 1
}

.current_status_input_container:not(.current_status_input_for_edit_profile) {
  font-family: Slack-Lato, appleLogo, sans-serif;
  min-height: 36px
}

.current_status_input_container:not(.current_status_input_for_edit_profile) .current_status_action_buttons {
  margin-top: 6px;
  -webkit-transition: opacity .15s ease, max-height .15s ease;
  -moz-transition: opacity .15s ease, max-height .15s ease;
  transition: opacity .15s ease, max-height .15s ease;
  max-height: 3rem;
  margin-bottom: 0
}

.current_status_input_container:not(.current_status_input_for_edit_profile) .current_status_action_buttons.invisible {
  max-height: 0;
  opacity: 0;
  margin-top: 0
}

.current_status_input_container:not(.current_status_input_for_edit_profile) .current_status_input_label_content,
.current_status_input_container:not(.current_status_input_for_edit_profile) .validation_message {
  display: none!important
}

.current_status_input_container:not(.current_status_input_for_edit_profile) ts-inline-saver {
  display: none;
  margin-left: 4px;
  font-size: .9rem
}

.current_status_input_container:not(.current_status_input_for_edit_profile) label[for=current_status],
.current_status_input_container:not(.current_status_input_for_edit_profile) label[for=current_status_for_team_menu] {
  margin: 0!important
}

.current_status_input_container:not(.current_status_input_for_edit_profile) label[for=current_status].countdown:after,
.current_status_input_container:not(.current_status_input_for_edit_profile) label[for=current_status_for_team_menu].countdown:after {
  bottom: -30px
}

.current_status_input_container label.countdown:after {
  margin-right: 18px;
  z-index: 1
}

.current_status_input_container #menu_items {
  margin: 6px 0
}

.current_status_input_container #menu_items li a.current_status_preset_option {
  text-decoration: none;
  margin: 0 2px;
  line-height: 2rem
}

.current_status_input_container #menu_items li a.current_status_preset_option .current_status {
  margin-left: 15px
}

.current_status_input_container .current_status_presets {
  list-style-type: none;
  margin: 0
}

#member_preview_scroller .member_data_table,
#member_preview_web_container .member_data_table,
#team_list .member_data_table,
.menu_member_header .member_data_table {
  table-layout: fixed;
  width: 100%
}

#member_preview_scroller .member_data_table tr,
#member_preview_web_container .member_data_table tr,
#team_list .member_data_table tr,
.menu_member_header .member_data_table tr {
  color: #2C2D30;
  font-size: .9375rem;
  height: 1.5625rem;
  line-height: 1.25rem;
  padding: 0;
  margin: 0;
  border: none;
  vertical-align: top
}

#member_preview_scroller .member_data_table td,
#member_preview_web_container .member_data_table td,
#team_list .member_data_table td,
.menu_member_header .member_data_table td {
  padding: 0 0 .3125rem;
  margin: 0
}

#member_preview_scroller .member_data_table td:first-child,
#member_preview_web_container .member_data_table td:first-child,
#team_list .member_data_table td:first-child,
.menu_member_header .member_data_table td:first-child {
  width: 40%
}

#member_preview_scroller .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link),
#member_preview_web_container .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link),
#team_list .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link),
.menu_member_header .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link) {
  color: #2C2D30;
  font-weight: 400!important
}

#member_preview_scroller .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link):hover,
#member_preview_web_container .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link):hover,
#team_list .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link):hover,
.menu_member_header .member_data_table a:not(.current_status_preset_option):not(.current_status_presets_edit_link):not(.member_details_manage_link):hover {
  color: #005E99
}

#member_preview_scroller .member_data_table i:not([data-stringify-prefix]),
#member_preview_web_container .member_data_table i:not([data-stringify-prefix]),
#team_list .member_data_table i:not([data-stringify-prefix]),
.menu_member_header .member_data_table i:not([data-stringify-prefix]) {
  margin: -.0625rem .25rem -.0625rem 0;
  float: left
}

#member_preview_scroller .member_data_table i:not([data-stringify-prefix]):before,
#member_preview_web_container .member_data_table i:not([data-stringify-prefix]):before,
#team_list .member_data_table i:not([data-stringify-prefix]):before,
.menu_member_header .member_data_table i:not([data-stringify-prefix]):before {
  font-size: 1.125rem
}

#member_preview_scroller .member_data_table .current_status_empty_emoji i:not([data-stringify-prefix]),
#member_preview_scroller .member_data_table .current_status_empty_emoji_cover i:not([data-stringify-prefix]),
#member_preview_web_container .member_data_table .current_status_empty_emoji i:not([data-stringify-prefix]),
#member_preview_web_container .member_data_table .current_status_empty_emoji_cover i:not([data-stringify-prefix]),
#team_list .member_data_table .current_status_empty_emoji i:not([data-stringify-prefix]),
#team_list .member_data_table .current_status_empty_emoji_cover i:not([data-stringify-prefix]),
.menu_member_header .member_data_table .current_status_empty_emoji i:not([data-stringify-prefix]),
.menu_member_header .member_data_table .current_status_empty_emoji_cover i:not([data-stringify-prefix]) {
  margin: 0
}

#member_preview_scroller .member_data_table .bot_label,
#member_preview_web_container .member_data_table .bot_label,
#team_list .member_data_table .bot_label,
.menu_member_header .member_data_table .bot_label {
  color: #A0A0A2;
  font-weight: 500;
  font-size: .75rem;
  line-height: 1.125rem;
  margin: 0 .15rem;
  padding: 0 .1rem;
  vertical-align: middle;
  background: #f1f1f1
}

#member_preview_scroller,
#member_preview_web_container,
.menu_member_header {
  background-color: #fff
}

#member_preview_scroller .member_data_table td,
#member_preview_web_container .member_data_table td,
.menu_member_header .member_data_table td {
  padding-bottom: 4px
}

#member_preview_scroller .member_details .member_image,
#member_preview_web_container .member_details .member_image,
.menu_member_header .member_details .member_image {
  margin-right: 0
}

#member_preview_scroller .member_preview_timezone i.ts_icon,
#member_preview_web_container .member_preview_timezone i.ts_icon,
.menu_member_header .member_preview_timezone i.ts_icon {
  display: none
}

#member_preview_scroller .member_name+.presence,
#member_preview_web_container .member_name+.presence,
.menu_member_header .member_name+.presence {
  -webkit-transform: translateY(-2px);
  -moz-transform: translateY(-2px);
  -ms-transform: translateY(-2px);
  transform: translateY(-2px)
}

#member_preview_scroller .member_details,
#member_preview_web_container .member_details,
.menu_member_header .member_details {
  padding: 0
}

#member_preview_scroller .member_details .member_image.thumb_512,
#member_preview_web_container .member_details .member_image.thumb_512,
.menu_member_header .member_details .member_image.thumb_512 {
  float: none;
  margin: 0 0 1rem;
  cursor: zoom-out;
  cursor: -moz-zoom-out;
  cursor: -webkit-zoom-out;
  width: 360px;
  height: 360px
}

#member_preview_scroller .member_details.cropped_preview .member_image.thumb_512,
#member_preview_web_container .member_details.cropped_preview .member_image.thumb_512,
.menu_member_header .member_details.cropped_preview .member_image.thumb_512 {
  cursor: zoom-in;
  cursor: -moz-zoom-in;
  cursor: -webkit-zoom-in;
  height: 216px;
  background-position: 0 -72px, 0 -72px
}

#member_preview_scroller .member_details .member_name_and_presence,
#member_preview_web_container .member_details .member_name_and_presence,
.menu_member_header .member_details .member_name_and_presence {
  font-size: 1.375rem;
  line-height: 1.625rem
}

#member_preview_scroller .member_details .member_name_and_presence .member_name,
#member_preview_web_container .member_details .member_name_and_presence .member_name,
.menu_member_header .member_details .member_name_and_presence .member_name {
  color: #2C2D30
}

#member_preview_scroller .member_details .member_restriction,
#member_preview_scroller .member_details .member_title,
#member_preview_web_container .member_details .member_restriction,
#member_preview_web_container .member_details .member_title,
.menu_member_header .member_details .member_restriction,
.menu_member_header .member_details .member_title {
  font-size: .9375rem;
  line-height: 1.375rem
}

#member_preview_scroller .member_details .member_title,
#member_preview_web_container .member_details .member_title,
.menu_member_header .member_details .member_title {
  color: #2C2D30
}

#member_preview_scroller .member_details .member_restriction,
#member_preview_web_container .member_details .member_restriction,
.menu_member_header .member_details .member_restriction {
  color: #A0A0A2
}

#member_preview_scroller .member_details .member_restriction .ts_icon_question_circle,
#member_preview_web_container .member_details .member_restriction .ts_icon_question_circle,
.menu_member_header .member_details .member_restriction .ts_icon_question_circle {
  top: .0625rem
}

#member_preview_scroller .member_details .member_restriction .ts_icon_question_circle:focus,
#member_preview_scroller .member_details .member_restriction .ts_icon_question_circle:hover,
#member_preview_web_container .member_details .member_restriction .ts_icon_question_circle:focus,
#member_preview_web_container .member_details .member_restriction .ts_icon_question_circle:hover,
.menu_member_header .member_details .member_restriction .ts_icon_question_circle:focus,
.menu_member_header .member_details .member_restriction .ts_icon_question_circle:hover {
  color: #2C2D30
}

#member_preview_scroller .member_details .member_restriction .ts_icon_question_circle:before,
#member_preview_web_container .member_details .member_restriction .ts_icon_question_circle:before,
.menu_member_header .member_details .member_restriction .ts_icon_question_circle:before {
  font-size: 1rem
}

#member_preview_scroller .member_details .member_action_bar,
#member_preview_web_container .member_details .member_action_bar,
.menu_member_header .member_details .member_action_bar {
  margin-top: 1rem
}

#member_preview_scroller .member_details .member_action_bar .btn,
#member_preview_web_container .member_details .member_action_bar .btn,
.menu_member_header .member_details .member_action_bar .btn {
  width: auto
}

#member_preview_scroller .member_details .member_action_bar .btn+.btn,
#member_preview_web_container .member_details .member_action_bar .btn+.btn,
.menu_member_header .member_details .member_action_bar .btn+.btn {
  margin-left: .25rem
}

#member_preview_scroller .member_details .member_action_bar .btn i.ts_icon_chevron_large_down,
#member_preview_web_container .member_details .member_action_bar .btn i.ts_icon_chevron_large_down,
.menu_member_header .member_details .member_action_bar .btn i.ts_icon_chevron_large_down {
  padding-left: .0625rem;
  margin: 0
}

#member_preview_scroller .member_details .member_action_bar .btn i.ts_icon_chevron_large_down:before,
#member_preview_web_container .member_details .member_action_bar .btn i.ts_icon_chevron_large_down:before,
.menu_member_header .member_details .member_action_bar .btn i.ts_icon_chevron_large_down:before {
  position: relative;
  top: .125rem
}

#member_preview_scroller .member_details_divider,
#member_preview_web_container .member_details_divider,
.menu_member_header .member_details_divider {
  border-bottom: none;
  margin: 1rem 0;
  width: 100%
}

#member_preview_scroller .member_details_manage_link .ts_icon_cog_o::before,
#member_preview_web_container .member_details_manage_link .ts_icon_cog_o::before,
.menu_member_header .member_details_manage_link .ts_icon_cog_o::before {
  font-size: 18px;
  position: relative;
  top: 3px;
  line-height: 0;
  margin-right: 3px
}

#member_preview_scroller {
  width: 392px
}

.supports_custom_scrollbar #member_preview_scroller {
  width: 384px
}

#member_preview_scroller .member_details {
  padding: 0 .5rem
}

#member_preview_scroller .member_details .member_image.thumb_512 {
  margin-top: .5rem
}

#member_preview_web_container .member_details {
  max-width: 540px;
  margin: 0 auto
}

#member_preview_web_container .member_details .member_image.thumb_512 {
  cursor: default
}

#member_preview_web_container .member_action_bar {
  display: flex
}

#member_preview_web_container .account_settings_link .ts_icon_cog_o {
  margin-right: 0;
  font-size: 20px;
  line-height: .6
}

#member_preview_web_container .account_settings_link .ts_icon_cog_o:before {
  line-height: 1
}

.menu_member_header .member_details {
  width: 320px;
  cursor: pointer;
  position: relative
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512 {
  cursor: pointer;
  border-top-right-radius: .25rem;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: .25rem;
  background-clip: padding-box;
  margin: 0;
  width: 320px;
  height: 224px;
  background-position: 0 -448px, 0 -48px, 0 -48px;
  background-size: 100% 300%, 100%, 100%, 100%;
  -webkit-transition: background-position 150ms ease;
  -moz-transition: background-position 150ms ease;
  transition: background-position 150ms ease
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_current_status {
  line-height: 1.875rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_current_status~.member_restriction {
  padding-top: 1rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_current_status~.member_restriction+.member_timezone_value {
  padding-bottom: 1rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_current_status~.member_restriction+.member_timezone_value+.member_details_over_image {
  bottom: 6.875rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_current_status~.member_timezone_value {
  line-height: 1.875rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_current_status~.member_timezone_value+.member_details_over_image {
  bottom: 4.75rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_restriction {
  padding-top: 1rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_restriction+.member_timezone_value {
  padding-bottom: 1rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_restriction+.member_timezone_value+.member_details_over_image {
  bottom: 4.75rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_timezone_value {
  line-height: 1.875rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512+.member_timezone_value+.member_details_over_image {
  bottom: 2.625rem
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512:hover {
  background-position: 0 0, 0 -48px, 0 -48px
}

.menu_member_header .member_details.cropped_preview .member_image.thumb_512:hover~.member_details_over_image,
.menu_member_header .member_details.cropped_preview .member_image.thumb_512:hover~.member_restriction_over_image {
  opacity: 0
}

.menu_member_header .member_details .member_details_over_image {
  opacity: 1;
  pointer-events: none;
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: .75rem;
  -webkit-transition: opacity 150ms ease;
  -moz-transition: opacity 150ms ease;
  transition: opacity 150ms ease
}

.menu_member_header .member_details .member_restriction_over_image {
  opacity: 1;
  -webkit-transition: opacity 150ms ease;
  -moz-transition: opacity 150ms ease;
  transition: opacity 150ms ease;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  border-radius: .2rem .2rem 0 0;
  background-color: rgba(44, 45, 48, .8);
  color: #fff;
  padding: 10px 14px;
  font-size: 13px
}

.menu_member_header .member_details .member_restriction_over_image.external {
  padding-right: 32px
}

.menu_member_header .member_details .member_restriction_over_image .ts_icon {
  line-height: 0
}

.menu_member_header .member_details .member_restriction_over_image .ts_icon:before {
  margin-left: -5px
}

.menu_member_header .member_details .member_restriction_over_image .external_team_badge {
  top: 9px;
  right: 9px
}

.menu_member_header .member_details .member_name_and_presence {
  color: #fff;
  font-size: 1.125rem;
  line-height: 1.5625rem;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis
}

.menu_member_header .member_details .member_name_and_presence .member_name {
  color: #fff;
  text-decoration: none
}

.menu_member_header .member_details .member_name_and_presence .presence.away {
  color: #fff
}

.menu_member_header .member_details .member_title {
  color: #fff;
  font-size: .9375rem;
  line-height: 1.375rem;
  margin: 0
}

.menu_member_header .member_details .member_current_status,
.menu_member_header .member_details .member_restriction,
.menu_member_header .member_details .member_timezone_value {
  color: #2C2D30;
  font-size: .75rem;
  line-height: 1rem;
  padding: 0 1rem;
  margin: 0
}

.menu_member_header .member_details .member_current_status a,
.menu_member_header .member_details .member_restriction a,
.menu_member_header .member_details .member_timezone_value a {
  color: #2C2D30
}

.menu_member_header .member_details .member_current_status a:hover,
.menu_member_header .member_details .member_restriction a:hover,
.menu_member_header .member_details .member_timezone_value a:hover {
  color: #005E99
}

.menu_member_header .member_details .member_current_status {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: inline-block
}

.menu_member_header .member_details .member_current_status .member_current_status_label {
  color: #717274
}

.menu_member_header .member_details .member_current_status .current_status {
  margin-left: 5px
}

.menu_member_header .member_details .member_current_status .current_status .emoji-sizer:first-of-type {
  margin-right: 2px
}

.menu_member_header .member_details_divider {
  border-color: #f2f2f5;
  margin: 0
}

.menu_member_footer {
  max-width: 320px;
  padding: .75rem;
  border-top: 1px solid #f2f2f5;
  border-radius: 0 0 6px 6px;
  background: #fbfaf8
}

.menu_member_footer input {
  margin-bottom: 0
}

.menu_member_footer .menu_member_footer_notice {
  margin: 0;
  padding: 0 .75rem .25rem;
  color: #717274;
  line-height: 1.4
}

@media screen and (max-width:424px) {
  #member_preview_web_container .member_details .member_image.thumb_512 {
    width: 192px;
    height: 192px
  }
}

@media screen and (min-width:1367px) {
  #member_preview_scroller {
    width: 442px
  }
  .supports_custom_scrollbar #member_preview_scroller {
    width: 434px
  }
  #member_preview_scroller .member_details .member_image.thumb_512 {
    width: 410px;
    height: 410px
  }
  #member_preview_scroller .member_details.cropped_preview .member_image.thumb_512 {
    height: 246px;
    background-position: 0 -82px, 0 -82px
  }
}

@media screen and (min-width:1441px) {
  #member_preview_scroller {
    width: 492px
  }
  .supports_custom_scrollbar #member_preview_scroller {
    width: 483px
  }
  #member_preview_scroller .member_details .member_image.thumb_512 {
    width: 460px;
    height: 460px
  }
  #member_preview_scroller .member_details.cropped_preview .member_image.thumb_512 {
    height: 276px;
    background-position: 0 -92px, 0 -92px
  }
}

#team_tab #member_preview_container .heading {
  width: auto;
  padding-right: 1rem
}

#team_tab #member_preview_scroller {
  width: 100%
}

#team_tab #member_preview_scroller .member_details {
  padding: 0 .25rem 0 8px
}

#team_tab #member_preview_scroller .member_details .member_image.thumb_512 {
  display: block;
  width: 100%;
  background-size: cover;
  background-position-x: 50%
}

#team_tab #member_preview_container .member_action_bar {
  display: flex
}

#team_tab #member_preview_container .member_action_bar .btn {
  line-height: 1.2
}

#team_tab #member_preview_container .account_settings_link .ts_icon_cog_o,
#team_tab #member_preview_container .member_preview_menu_target .ts_icon_chevron_large_down {
  margin-right: 0;
  font-size: 20px;
  line-height: .6
}

#team_tab #member_preview_container .account_settings_link .ts_icon_cog_o:before {
  line-height: 1
}

.member_details {
  padding-left: 164px;
  position: relative
}

.member_details p {
  margin-bottom: .5rem;
  line-height: 1.5rem;
  font-size: .9rem
}

.member_profile_card {
  padding: 1rem .5rem;
  width: 192px
}

.member_meta {
  color: #555459;
  font-size: .8rem;
  line-height: 1.2rem
}

#team_list_container .team_list_item {
  padding-left: .5rem
}

#team_list_container #team_list {
  margin-bottom: 0
}

#member_preview_scroller {
  padding: 0 1% 0 0;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
  position: relative
}

.monkey_scroll_hider.scrolling #member_preview_scroller {
  padding: 0 1rem 0 0
}

#member_preview_container .member_details {
  position: relative
}

#member_preview_container .member_details .member_image {
  margin: 0 0 .5rem -80px;
  float: left;
  cursor: nesw-resize;
  cursor: -moz-zoom-in;
  cursor: -webkit-zoom-in
}

#member_preview_container .member_details.expanded_member_image {
  padding-left: 0
}

#member_preview_container .member_details.expanded_member_image .member_image {
  cursor: -moz-zoom-out;
  cursor: -webkit-zoom-out;
  margin-left: 0;
  float: none
}

.member_type_and_description {
  max-width: 100%;
  font-size: 1.125rem;
  line-height: 1.375rem
}

.member_restriction_banner {
  position: relative;
  margin: 8px auto 0;
  width: 360px;
  max-width: 100%;
  padding: 10px 32px 10px 14px;
  border-radius: .2rem .2rem 0 0;
  background-color: #2C2D30;
  color: #fff;
  font-size: 13px;
  line-height: 1.23
}

@media screen and (max-width:424px) {
  .member_restriction_banner {
    width: 192px
  }
}

#member_preview_scroller .member_restriction_banner {
  width: 100%
}

.member_restriction_banner .ts_icon {
  line-height: 0
}

.member_restriction_banner .ts_icon:before {
  margin-left: -5px
}

.member_restriction_banner .external_team_badge,
.member_restriction_banner .ts_icon_question_circle {
  position: absolute;
  top: 9px;
  right: 9px;
  line-height: .8
}

.member_details .member_restriction_banner~.member_image {
  border-radius: 0 0 .2rem .2rem;
  margin-top: 0!important
}

.menu_member_header {
  cursor: pointer
}

.menu_member_header:hover .member_name {
  text-decoration: underline
}

#file_member_filter {
  background: #fff
}

#file_member_filter_no_matches {
  margin: 0;
  text-align: center;
  padding: .6rem .75rem 1.1rem;
  max-width: 220px
}

.member_item {
  display: none
}

.member_item.active {
  display: block
}

#team_filter .member_filter,
#user_group_filter .member_filter {
  padding-left: 1.9rem;
  padding-right: 1.9rem
}

#client-ui .member_file_filter_menu .searchable_member_list_input,
#client-ui .member_filter {
  padding: .1rem 1.8rem 0;
  height: 1.75rem;
  line-height: 1rem;
  font-size: .9rem;
  border-radius: 1rem;
  border: 1px solid #BABBBF;
  outline: 0;
  box-shadow: none
}

#client-ui .member_file_filter_menu {
  width: 222px;
  height: 334px
}

#client-ui .member_file_filter_menu #menu_list_container {
  display: none
}

#client-ui .member_file_filter_menu .searchable_member_list_search_bar {
  padding: .5rem
}

#client-ui .member_file_filter_menu .searchable_member_list_search_bar .icon_search {
  top: .3rem
}

#client-ui .member_file_filter_menu .searchable_member_list_search_bar .icon_close {
  top: .4rem;
  right: .3rem
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller {
  height: 280px;
  overflow-y: auto;
  overflow-x: hidden
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller .team_list_item {
  min-height: 0;
  padding: 0 .3rem .2rem;
  margin: 0;
  border: none;
  width: 100%
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller .team_list_item .channel_page_member_row {
  margin: 0;
  padding: .2rem;
  border: 1px solid transparent;
  border-radius: 5px
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller .team_list_item .member_image {
  margin: 0 .3rem 0 0
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller .team_list_item:hover .channel_page_member_row {
  background: #2D9EE0
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller .team_list_item:hover .member {
  color: #fff;
  text-decoration: none
}

#client-ui .member_file_filter_menu .searchable_member_list_scroller .channel_page_member_row {
  height: auto
}

#client-ui #team_list_container #team_filter,
#client-ui #user_groups_container #user_group_filter {
  margin-right: 0;
  margin-top: -1px
}

#client-ui #team_list_container #team_filter .member_filter,
#client-ui #user_groups_container #user_group_filter .member_filter {
  border: none;
  box-shadow: none;
  border-left: 1px solid #f0f0f0;
  border-radius: 0;
  width: 8rem;
  padding-right: .8rem;
  padding-top: 0;
  height: 1.5rem
}

#client-ui #file_member_filter .member_filter {
  margin: .5rem .3rem .35rem .6rem!important;
  border-color: #DDD;
  width: 200px
}

#client-ui .team_tabs_container {
  border-bottom: 1px solid #f0f0f0;
  width: 99%!important
}

#client-ui #channel_member_list_container.searchable_member_list .no_results {
  margin-top: 1rem
}

#client-ui .searchable_member_list_search_bar a.icon_close {
  top: .3rem
}

#client-ui .searchable_member_list_input {
  padding-left: 1.8rem
}

#client-ui .searchable_member_list .member_item,
#client-ui .searchable_member_list .team_list_item {
  cursor: pointer;
  width: calc(100% - 1rem)
}

.unify_user #client-ui .searchable_member_list .member_item,
.unify_user #client-ui .searchable_member_list .team_list_item {
  width: 100%
}

#client-ui .searchable_member_list .team_list_item {
  padding: .75rem .5rem .75rem .75rem
}

body:not(.unify_user) #client-ui .searchable_member_list .team_list_item {
  margin: .5rem;
  padding: .5rem;
  border-radius: 5px;
  border: 1px solid transparent
}

body:not(.unify_user) #client-ui .searchable_member_list .team_list_item:hover {
  border-color: #E0E0E0
}

.unify_user #client-ui .searchable_member_list .team_list_item {
  border-bottom: 1px solid #E0E0E0;
  border-top: none
}

.unify_user #client-ui .searchable_member_list .team_list_item:hover {
  background: #f9f9f9
}

#client-ui .searchable_member_list .searchable_member_list_scroller {
  margin-top: 0
}

#client-ui #team_list_container .searchable_member_list_search {
  border-bottom: 1px solid #E8E8E8
}

#client-ui #team_list_container .searchable_member_list_search .icon_search {
  top: .8rem;
  left: .9rem
}

#client-ui #team_list_container .searchable_member_list_search .icon_close {
  top: .8rem;
  right: .8rem
}

#client-ui #team_list_container .searchable_member_list_input {
  border: none;
  padding: .7rem .75rem .7rem 2.4rem
}

#client-ui #team_list_container .searchable_member_list_input:focus {
  box-shadow: none
}

#client-ui #team_list_container .searchable_member_list_input:focus~.icon_search {
  color: #A0A0A2
}

#team_filter .icon_search,
#team_filter .ts_icon_spinner,
#user_group_filter .icon_search,
#user_group_filter .ts_icon_spinner,
.searchable_member_list_search_bar .icon_search,
.searchable_member_list_search_bar .ts_icon_spinner {
  position: absolute;
  font-size: 1rem;
  top: 5px;
  left: 8px;
  color: #9e9ea6
}

#team_filter .ts_icon_spinner,
#user_group_filter .ts_icon_spinner,
.searchable_member_list_search_bar .ts_icon_spinner {
  top: 10px
}

#team_filter .icon_search.indifferent_grey+.ts_icon_spinner,
#user_group_filter .icon_search.indifferent_grey+.ts_icon_spinner,
.searchable_member_list_search_bar .icon_search.indifferent_grey+.ts_icon_spinner {
  color: #555459
}

#team_filter a.icon_close,
#user_group_filter a.icon_close,
.searchable_member_list_search_bar a.icon_close {
  position: absolute;
  right: 8px;
  top: 6px;
  color: #BABBBF;
  font-size: 20px
}

#team_filter a.icon_close:hover,
#user_group_filter a.icon_close:hover,
.searchable_member_list_search_bar a.icon_close:hover {
  color: #007AB8;
  text-decoration: none
}

#client-ui .icon_search {
  position: absolute;
  font-size: .9rem;
  top: 3px;
  left: 7px;
  color: #CCC
}

#client-ui #file_member_filter .icon_search {
  top: 13px;
  left: 17px
}

#client-ui .ts_icon_spinner {
  top: 4px
}

#client-ui .icon_search.indifferent_grey+.ts_icon_spinner {
  color: #555459
}

#client-ui a.icon_close {
  top: 4px;
  position: absolute;
  color: #BABBBF;
  font-size: 18px
}

#client-ui a.icon_close:hover {
  color: #007AB8;
  text-decoration: none
}

#client-ui #file_member_filter .icon_close {
  right: 9px;
  top: 13px
}

#slackbot_meta,
.dm_badge,
.mpdm_badge {
  margin: 0
}

.dm_badge,
.mpdm_badge {
  margin-bottom: 1.5rem
}

.dm_badge i,
.mpdm_badge i {
  margin-right: .2rem
}

.dm_badge .member_image,
.mpdm_badge .member_image {
  float: left
}

body:not(.unify_user) .dm_badge .member_image,
body:not(.unify_user) .mpdm_badge .member_image {
  margin: 0 .75rem 0 0;
  flex: none;
  align-self: start
}

.dm_badge .dm_badge_meta,
.mpdm_badge .dm_badge_meta {
  margin: 0 0 .5rem;
  padding-top: 0;
  font-size: 1rem;
  line-height: 1.25rem;
  color: #555459;
  margin-left: 0!important;
  margin-bottom: 0!important
}

.dm_badge .dm_badge_meta .member_team_name,
.mpdm_badge .dm_badge_meta .member_team_name {
  color: #a0a0a2
}

body:not(.unify_user) .dm_badge a.app_preview_link,
body:not(.unify_user) .dm_badge a.member_preview_link,
body:not(.unify_user) .mpdm_badge a.app_preview_link,
body:not(.unify_user) .mpdm_badge a.member_preview_link {
  font-weight: 600;
  font-size: 1rem;
  color: #555459
}

.dm_badge .dm_badge:hover a.member_preview_link,
.mpdm_badge .dm_badge:hover a.member_preview_link {
  color: inherit
}

body:not(.unify_user) .dm_badge a,
body:not(.unify_user) .mpdm_badge a {
  color: #9e9ea6;
  -webkit-transition: .1s;
  -moz-transition: .1s;
  transition: .1s
}

.dm_badge .dm_badge:hover a,
.mpdm_badge .dm_badge:hover a {
  color: #007AB8
}

.dm_badge .hint,
.mpdm_badge .hint {
  color: #9e9ea6
}

.dm_badge .member_type_and_description,
.mpdm_badge .member_type_and_description {
  font-size: 1rem
}

body:not(.unify_user) .dm_badge .presence,
body:not(.unify_user) .mpdm_badge .presence {
  margin: 0 .25rem
}

.mpdm_badge .member_image {
  margin: 0 .75rem 0 0
}

.member_small .enter_icon {
  display: none
}

.lfs_item.active .member_small .enter_icon {
  display: block
}

.member_preview_link .member_type_badge {
  pointer-events: none
}

.unknown_member {
  display: inline-block;
  background: #E8E8E8;
  width: 80px;
  height: 10px;
  position: relative;
  top: 0;
  border-radius: 5px
}

.member_type_badge {
  display: inline-block
}

.member_type_badge.ts_icon_restricted_user,
.member_type_badge.ts_icon_single_channel_guest {
  line-height: 1.375rem
}

.member_type_badge.ts_icon_restricted_user:before,
.member_type_badge.ts_icon_single_channel_guest:before {
  font-size: 29px
}

.member_type_badge svg {
  display: inline;
  vertical-align: bottom
}

.member_type_badge svg.member_type_badge_background_ra,
.member_type_badge svg.member_type_badge_background_ura {
  position: absolute;
  bottom: 6px;
  right: 6px
}

.member_type_badge svg.member_type_badge_background_ra {
  width: .8125rem;
  height: .8125rem
}

.member_type_badge svg.member_type_badge_background_ura {
  width: 1rem;
  height: 1rem
}

.member_type_badge svg.member_type_badge_icon {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: .625rem;
  height: .625rem
}

.member_type_and_description .member_type_badge.ts_icon_restricted_user,
.member_type_and_description .member_type_badge.ts_icon_single_channel_guest {
  line-height: 1.375rem;
  margin-right: -8px;
  margin-left: -6px
}

.member_type_and_description .member_type_badge.ts_icon_restricted_user:before,
.member_type_and_description .member_type_badge.ts_icon_single_channel_guest:before {
  font-size: 29px
}

.member_timezone_value .member_type_badge.ts_icon_restricted_user,
.member_timezone_value .member_type_badge.ts_icon_single_channel_guest {
  margin-right: -5px;
  margin-left: -5px
}

.member_timezone_value .member_type_badge.ts_icon_restricted_user:before,
.member_timezone_value .member_type_badge.ts_icon_single_channel_guest:before {
  font-size: 20px
}

.member_image.thumb_20 .member_type_badge,
.member_image.thumb_24 .member_type_badge {
  position: absolute;
  right: -3px;
  bottom: -3px
}

.member_image.thumb_20 .member_type_badge.member_type_badge_10,
.member_image.thumb_24 .member_type_badge.member_type_badge_10 {
  right: -6px;
  bottom: -6px
}

.member_image.thumb_32 .member_type_badge,
.member_image.thumb_36 .member_type_badge,
.member_image.thumb_48 .member_type_badge,
.member_image.thumb_56 .member_type_badge,
.member_image.thumb_72 .member_type_badge {
  position: absolute;
  right: -6px;
  bottom: -6px
}

.member_image.thumb_72 .member_type_badge svg.member_type_badge_background_ra {
  width: 1.21875rem;
  height: 1.21875rem
}

.member_image.thumb_72 .member_type_badge svg.member_type_badge_background_ura {
  width: 1.5rem;
  height: 1.5rem
}

.member_image.thumb_72 .member_type_badge svg.member_type_badge_icon {
  width: .9375rem;
  height: .9375rem
}

.member_image.thumb_192 .member_type_badge {
  position: absolute;
  right: -6px;
  bottom: -6px
}

.member_image.thumb_192 .member_type_badge svg.member_type_badge_background_ra {
  width: 1.3rem;
  height: 1.3rem
}

.member_image.thumb_192 .member_type_badge svg.member_type_badge_background_ura {
  width: 1.6rem;
  height: 1.6rem
}

.member_image.thumb_192 .member_type_badge svg.member_type_badge_icon {
  width: 1rem;
  height: 1rem
}

.member_image.thumb_512 .member_type_badge {
  position: absolute;
  right: -36px;
  bottom: -36px
}

.member_image.thumb_512 .member_type_badge svg.member_type_badge_background_ra {
  width: 6.5rem;
  height: 6.5rem
}

.member_image.thumb_512 .member_type_badge svg.member_type_badge_background_ura {
  width: 8rem;
  height: 8rem
}

.member_image.thumb_512 .member_type_badge svg.member_type_badge_icon {
  width: 5rem;
  height: 5rem
}

.external_team_badge {
  display: inline-block;
  vertical-align: bottom;
  position: absolute;
  bottom: -2px;
  right: -2px;
  border-radius: 3px;
  box-shadow: 0 0 0 2px #fff;
  background-size: 100%;
  background-color: #fff;
  background-repeat: no-repeat
}

.external_team_badge:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 0 1px rgba(44, 45, 48, .08);
  border-radius: 3px
}

.external_team_badge.default {
  background-color: #717274;
  font-weight: 800;
  font-size: 10px;
  line-height: 1.6;
  color: #fff;
  font-style: normal;
  letter-spacing: 0;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  float: left
}

.external_team_badge.team_badge_16 {
  width: 16px;
  height: 16px
}

.external_team_badge.team_badge_22 {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  box-shadow: 0 0 0 3px #fff
}

.external_team_badge.team_badge_22.default {
  font-size: 13px;
  line-height: 1.8
}

#channel_list .ts_icon_shared_channel {
  margin-left: -2px
}

#channel_list .ts_icon_shared_channel:before {
  font-size: 1.625rem;
  margin-top: -2px
}

#channel_list .shared_team .member_image {
  margin-top: -5px
}

#channel_list .shared_team .shared_team_name_and_owner {
  margin-left: 45px
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.loading .tab_complete_ui {
  display: none
}

.tab_complete_ui {
  position: absolute;
  background: #fff;
  z-index: 100000;
  padding: 0;
  line-height: 1.4rem;
  box-shadow: 0 5px 10px rgba(0, 0, 0, .12);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, .15);
  min-width: 300px
}

.supports_custom_scrollbar .tab_complete_ui {
  overflow: hidden
}

.tab_complete_ui .tab_complete_ui_content {
  position: relative;
  z-index: 100001
}

.tab_complete_ui .tab_complete_ui_scroller {
  max-height: 454px;
  overflow-y: auto;
  overflow-x: hidden
}

.feature_texty .tab_complete_ui .tab_complete_ui_scroller {
  height: calc(100% - 32px)
}

.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller {
  border-right: .25rem solid transparent;
  border-right: none
}

.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 16px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  color: #fff;
  border-left: 4px solid #fff;
  border-right: 4px solid #fff;
  border-radius: 6px/4px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar .tab_complete_ui .tab_complete_ui_scroller {
  margin-right: 2px;
  border-right: none
}

.supports_custom_scrollbar.slim_scrollbar .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 16px
}

.supports_custom_scrollbar.slim_scrollbar .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-thumb {
  background-color: rgba(217, 217, 222, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #d9d9de;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-thumb:hover {
  background-color: rgba(217, 217, 222, .8)
}

.supports_custom_scrollbar.slim_scrollbar .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-thumb,
.supports_custom_scrollbar.slim_scrollbar .tab_complete_ui .tab_complete_ui_scroller::-webkit-scrollbar-track {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-radius: 6px/4px
}

.tab_complete_ui .tab_complete_ui_header {
  padding: 5px 10px 4px;
  background: #FaF8F6;
  color: #7F7F83;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, .15);
  background-clip: padding-box;
  height: 32px;
  overflow: hidden;
  border-radius: 6px 6px 0 0
}

.tab_complete_ui .tab_complete_ui_header .header_help {
  float: right;
  margin-left: 1rem
}

.tab_complete_ui.narrow {
  min-width: 0
}

.tab_complete_ui.narrow .header_help,
.tab_complete_ui.narrow .not_in_channel,
.tab_complete_ui.narrow .type_cmds .tab_complete_ui_item .cmddesc {
  display: none
}

.tab_complete_ui ul {
  list-style-type: none;
  margin: 0;
  background-clip: padding-box;
  overflow: hidden;
  border-radius: 0 0 6px 6px
}

.supports_custom_scrollbar .tab_complete_ui ul {
  border-radius: 0
}

.tab_complete_ui ul.type_emoji {
  padding: 3px 8px 5px
}

.tab_complete_ui ul.type_emoji li {
  display: inline-block;
  padding: 0 10px 0 8px;
  margin: 0 1px -4px;
  border-radius: 1rem;
  color: #797979;
  line-height: 1.5
}

body:not(.unify_user) .tab_complete_ui ul.type_emoji li {
  padding: 3px 7px 3px 8px;
  line-height: .8rem
}

body:not(.unify_user) .tab_complete_ui ul.type_members .member_image {
  margin-right: .4rem;
  margin-top: -2px;
  vertical-align: middle
}

.tab_complete_ui ul.type_members .broadcast,
.tab_complete_ui ul.type_members .username {
  font-weight: 900;
  margin-right: .4rem
}

body:not(.unify_user) .tab_complete_ui ul.type_members .broadcast {
  display: inline-block;
  color: #555459;
  font-weight: 900;
  margin-left: 0
}

.tab_complete_ui ul.type_members .unify_broadcast {
  display: flex;
  align-items: center;
  color: #2c2d30;
  font-weight: 700
}

.tab_complete_ui ul.type_members .unify_broadcast .ts_icon_broadcast {
  color: #717274;
  margin-right: .5rem;
  width: 20px;
  height: 20px;
  text-align: center;
  align-self: baseline
}

.tab_complete_ui ul.type_members .unify_broadcast .ts_icon_broadcast:before {
  font-size: 1rem
}

body:not(.unify_user) .tab_complete_ui ul.type_members .unify_broadcast {
  display: inline-block;
  color: #555459;
  font-weight: 900;
  margin-left: 0
}

.tab_complete_ui ul.type_members .broadcast_info {
  font-weight: 400;
  margin-left: .25rem
}

.tab_complete_ui ul.type_members .broadcast_info,
.tab_complete_ui ul.type_members .realname,
.tab_complete_ui ul.type_members .team_name {
  margin-right: .4rem;
  color: #717274
}

.tab_complete_ui ul.type_members .current_status {
  margin-right: .4rem
}

.tab_complete_ui ul.type_members .current_status .emoji-sizer:first-of-type {
  margin-right: 2px
}

.tab_complete_ui ul.type_members .primary_name {
  font-weight: 900;
  margin-right: .4rem
}

.tab_complete_ui ul.type_members .secondary_name {
  margin-right: .4rem;
  color: #717274
}

.feature_texty:not(.unify_user) .tab_complete_ui ul.type_members .broadcast,
.feature_texty:not(.unify_user) .tab_complete_ui ul.type_members .bullet,
.feature_texty:not(.unify_user) .tab_complete_ui ul.type_members .display_name,
.feature_texty:not(.unify_user) .tab_complete_ui ul.type_members .presence,
.feature_texty:not(.unify_user) .tab_complete_ui ul.type_members .secondary_name,
.feature_texty:not(.unify_user) .tab_complete_ui ul.type_members .username {
  margin-right: 6px
}

.feature_texty .tab_complete_ui ul.type_members .bullet {
  margin-left: 6px
}

.tab_complete_ui ul.type_members .app_label {
  border-radius: .125rem;
  background-color: #E8E8E8;
  color: #A0A0A2;
  font-size: .625rem;
  line-height: 1;
  padding: .1rem .2rem;
  vertical-align: .1rem;
  margin-right: .4rem
}

.tab_complete_ui ul.type_cmds li.tab_complete_ui_group {
  display: flex;
  padding-bottom: 4px;
  padding-top: 5px
}

.tab_complete_ui ul.type_cmds li.tab_complete_ui_group .group_name {
  font-weight: 700;
  padding-right: .5rem;
  color: #717274;
  font-size: .8rem
}

.tab_complete_ui ul.type_cmds li.tab_complete_ui_group .group_divider {
  flex: 1;
  border-top-color: #f2f2f5;
  margin: .8rem 0 0
}

.tab_complete_ui ul.type_cmds li.tab_complete_ui_group .not_in_channel {
  color: #717274;
  font-size: .7rem;
  line-height: 1.5rem
}

.tab_complete_ui ul.type_cmds li.tab_complete_ui_item {
  padding: 6px 10px;
  line-height: 1.2rem
}

body:not(.unify_user) .tab_complete_ui ul.type_cmds li.tab_complete_ui_item {
  padding: 6px 10px;
  line-height: 1.2rem
}

.tab_complete_ui ul.type_cmds .cmdname {
  color: #000;
  font-weight: 900
}

.tab_complete_ui ul.type_cmds .cmddesc {
  display: block;
  overflow: hidden;
  color: #717274;
  text-overflow: ellipsis
}

.tab_complete_ui ul.type_channels .channelname {
  font-weight: 900
}

.tab_complete_ui ul.type_channels .topic .emoji-sizer {
  font-size: 1rem;
  line-height: 1rem
}

.tab_complete_ui ul.type_channels .not_in_channel {
  color: #717274;
  font-size: .7rem
}

.tab_complete_ui li.tab_complete_ui_group,
.tab_complete_ui li.tab_complete_ui_item {
  border: 0;
  cursor: pointer;
  background: 0 0;
  padding: 0 10px;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: 15px;
  line-height: 2;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis
}

body:not(.unify_user) .tab_complete_ui li.tab_complete_ui_group,
body:not(.unify_user) .tab_complete_ui li.tab_complete_ui_item {
  padding: 3px 10px;
  font-size: .9rem;
  line-height: 1.5rem
}

.tab_complete_ui li.tab_complete_ui_group.active,
.tab_complete_ui li.tab_complete_ui_item.active {
  background: #2D9EE0;
  color: #fff!important;
  text-shadow: 0 1px rgba(0, 0, 0, .1)
}

.tab_complete_ui li.tab_complete_ui_group.active .cmd-left-td,
.tab_complete_ui li.tab_complete_ui_group.active .cmd-right-td,
.tab_complete_ui li.tab_complete_ui_group.active .presence.active,
.tab_complete_ui li.tab_complete_ui_group.active span,
.tab_complete_ui li.tab_complete_ui_item.active .cmd-left-td,
.tab_complete_ui li.tab_complete_ui_item.active .cmd-right-td,
.tab_complete_ui li.tab_complete_ui_item.active .presence.active,
.tab_complete_ui li.tab_complete_ui_item.active span {
  color: #fff!important
}

.tab_complete_ui li.tab_complete_ui_group.active .presence,
.tab_complete_ui li.tab_complete_ui_item.active .presence {
  opacity: 1
}

.tab_complete_ui li.tab_complete_ui_group.active .app_label,
.tab_complete_ui li.tab_complete_ui_item.active .app_label {
  background-color: rgba(255, 255, 255, .3)
}

.tab_complete_ui li.tab_complete_ui_group.active .ts_icon_broadcast,
.tab_complete_ui li.tab_complete_ui_item.active .ts_icon_broadcast {
  color: #fff
}

.tab_complete_ui li.tab_complete_ui_group .emoji-sizer,
.tab_complete_ui li.tab_complete_ui_item .emoji-sizer {
  font-size: 1rem;
  line-height: 14px;
  vertical-align: middle
}

.tab_complete_ui li.tab_complete_ui_group .ts_icon_shared_channels,
.tab_complete_ui li.tab_complete_ui_item .ts_icon_shared_channels {
  position: relative;
  right: 0;
  bottom: -1px;
  float: right;
  height: 24px
}

.unify_user .tab_complete_ui li.tab_complete_ui_group .ts_icon_shared_channels,
.unify_user .tab_complete_ui li.tab_complete_ui_item .ts_icon_shared_channels {
  bottom: 4px
}

.tab_complete_ui li.tab_complete_ui_group .ts_icon_shared_channels:before,
.tab_complete_ui li.tab_complete_ui_item .ts_icon_shared_channels:before {
  position: absolute;
  right: 0
}

.unify_user .tab_complete_ui li.tab_complete_ui_group .ts_icon_shared_channel:before,
.unify_user .tab_complete_ui li.tab_complete_ui_item .ts_icon_shared_channel:before {
  line-height: 20px
}

.tab_complete_ui li.tab_complete_ui_item[data-type=member] {
  padding: 0 10px 0 4px
}

.tab_complete_ui li.tab_complete_ui_item[data-type=usergroup],
.tab_complete_ui li.tab_complete_ui_item[data-type=keyword] {
  padding-right: 10px;
  padding-left: calc(.4rem + 22px)
}

.tab_complete_ui .not_in_channel {
  color: #717274;
  font-size: .7rem;
  line-height: 1
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.token_input {
  border: 1px solid #C5C5C5;
  border-radius: .25rem;
  cursor: text;
  color: #555459;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: 1rem;
  line-height: normal;
  height: auto;
  min-height: 3.125rem;
  width: 100%;
  max-width: 100%;
  margin: 0 0 .5rem;
  padding: .1875rem;
  -webkit-transition: box-shadow 70ms ease-out, border-color 70ms ease-out;
  -moz-transition: box-shadow 70ms ease-out, border-color 70ms ease-out;
  transition: box-shadow 70ms ease-out, border-color 70ms ease-out;
  display: flex;
  flex-wrap: wrap;
  align-items: center
}

.token_input.small {
  font-size: 1rem;
  min-height: 2.3125rem
}

.token_input.small .token {
  padding: 0 .375rem .125rem
}

.token_input.small input {
  font-size: 1rem!important;
  padding: .0625rem 0 .1875rem
}

.token_input.active {
  border-color: #2780F8;
  box-shadow: 0 0 7px rgba(39, 128, 248, .15);
  outline-offset: 0;
  outline: 0
}

.token_input:hover {
  border-color: #2780F8
}

.token_input .token {
  border: 1px solid #2D9EE0;
  border-radius: .25rem;
  background-color: #2D9EE0;
  color: #fff;
  font-weight: 400;
  padding: .3125rem .375rem;
  margin: .1875rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  -webkit-transition: background-color 150ms, border-color 150ms;
  -moz-transition: background-color 150ms, border-color 150ms;
  transition: background-color 150ms, border-color 150ms;
  flex: initial;
  cursor: pointer
}

.token_input .token.warning {
  background-color: #FFA940;
  border-color: #FFA940
}

.token_input .token.error {
  background-color: #eb4d5c;
  border-color: #eb4d5c
}

.token_input .token:after {
  content: '  \00d7'
}

.token_input input {
  border: none!important;
  width: auto;
  min-width: 6rem;
  padding: .375rem .5rem .375rem .375rem;
  margin: .1875rem;
  flex: 1
}

.token_input input:active,
.token_input input:focus {
  box-shadow: none!important
}

.warning .token_input {
  border-color: #FFA940;
  background-color: #FFF1E1
}

.warning .token_input.active {
  border-color: #FFF1E1;
  box-shadow: 0 0 7px rgba(255, 185, 100, .15)
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.channel_modal_header {
  font-size: 34px;
  line-height: 41px;
  font-weight: 900
}

.channel_modal .channel_modal_filter_container {
  position: relative
}

.channel_modal .channel_modal_filter_container input[type=text] {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 3rem;
  padding-top: .65rem
}

.channel_modal .channel_modal_filter_container .search_icon {
  position: absolute;
  top: 8px;
  left: 13px
}

.channel_modal .channel_modal_filter_container .clear_filter_icon {
  position: absolute;
  top: 8px;
  right: 10px;
  cursor: pointer;
  visibility: hidden
}

.channel_modal .channel_modal_filter_container.active .clear_filter_icon {
  visibility: visible
}

.channel_modal .btn_large {
  padding-left: 18px;
  padding-right: 18px
}

.channel_modal_title_input_container {
  position: relative
}

.channel_modal_title_input_container input[type=text] {
  padding-left: 2rem
}

.channel_modal_title_input_container .channel_icon {
  position: absolute;
  top: 10px;
  left: 9px
}

.channel_modal_with_list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 9.5rem
}

@media only screen and (max-height:600px) {
  .channel_modal_with_list {
    padding-top: 7.5rem
  }
}

@media only screen and (max-height:600px) and (min-width:900px),
only screen and (max-width:767px) {
  .channel_modal_with_list {
    padding-top: 6rem
  }
}

.channel_modal_with_list .monkey_scroll_hider,
.channel_modal_with_list .monkey_scroll_wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0
}

.channel_modal_with_list .channel_modal_list {
  min-height: 0;
  flex: 1;
  padding-right: 17px
}

html:not(.supports_flexbox) .channel_modal_with_list .channel_modal_list {
  height: 400px
}

.supports_custom_scrollbar .channel_modal_with_list .channel_modal_list {
  overflow-y: scroll
}

.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list {
  border-right: .25rem solid transparent
}

.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 8px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #fff
}

.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar .channel_modal_with_list .channel_modal_list {
  margin-right: 2px
}

.supports_custom_scrollbar.slim_scrollbar .channel_modal_with_list .channel_modal_list::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.supports_custom_scrollbar.slim_scrollbar .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-thumb {
  background-color: rgba(113, 114, 116, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #717274;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar .channel_modal_with_list .channel_modal_list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(113, 114, 116, .8)
}

.channel_modal_with_list .lazy_filter_select:not(.team_picker):not(.show_which_channels_selector):not(.channel_browser_sort) {
  overflow-y: hidden
}

#channel_browser .channel_browser_row {
  width: 100%;
  min-height: 60px;
  padding-top: 12px;
  padding-right: 5rem;
  padding-bottom: 12px;
  padding-left: 10px;
  border: 1px solid transparent;
  border-top: 1px solid #E8E8E8;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.4;
  color: #717274
}

#channel_browser .channel_browser_joined {
  font-size: 11px;
  margin-left: .25rem
}

#channel_browser .channel_browser_row_header {
  font-size: 16px;
  line-height: 1.2rem;
  margin-bottom: 3px;
  color: #555459
}

#channel_browser .channel_browser_creator_name {
  color: #2C2D30
}

#channel_browser .channel_browser_type_icon {
  margin-right: -1px;
  margin-left: -5px
}

#channel_browser .shared_channel_icon {
  margin-left: 4px
}

#channel_browser .shared_channels_icon .ts_icon_shared_channels {
  position: relative;
  right: 0;
  bottom: -3px
}

#channel_browser .channel_browser_teams_info {
  color: #2C2D30
}

#channel_browser .channel_browser_shared_teams {
  top: 5px
}

#channel_browser .channel_browser_member_count_container {
  position: absolute;
  right: 10px;
  top: 12px
}

#channel_browser .channel_browser_member_count_container .ts_icon_user:before {
  font-size: 16px;
  position: relative;
  top: 1px
}

#channel_browser .channel_browser_open,
#channel_browser .channel_browser_preview {
  display: none;
  color: #439fe0;
  position: absolute;
  right: 10px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: .9rem;
  line-height: 1rem
}

#channel_browser .channel_browser_open {
  right: 26px
}

#channel_browser #channel_list_container:not(.keyboard_active).not_scrolling .channel_browser_row:hover,
#channel_browser .channel_browser_row.highlighted {
  background: #edf7fd;
  border: 1px solid #d3ecfa;
  border-radius: 6px
}

#channel_browser #channel_list_container:not(.keyboard_active).not_scrolling .channel_browser_row:hover .channel_browser_open,
#channel_browser #channel_list_container:not(.keyboard_active).not_scrolling .channel_browser_row:hover .channel_browser_preview,
#channel_browser .channel_browser_row.highlighted .channel_browser_open,
#channel_browser .channel_browser_row.highlighted .channel_browser_preview {
  display: block
}

#channel_browser #channel_list_container:not(.keyboard_active).not_scrolling .channel_browser_row:hover .channel_browser_member_count_container,
#channel_browser .channel_browser_row.highlighted .channel_browser_member_count_container {
  display: none
}

#channel_browser #channel_list_container:not(.keyboard_active).not_scrolling .channel_browser_row:hover+.channel_browser_row,
#channel_browser .channel_browser_row.highlighted+.channel_browser_row {
  border-color: transparent
}

#channel_browser .channel_browser_filter_container {
  width: 40%
}

#channel_browser #channel_browser_empty {
  height: 100px;
  width: 75%
}

#channel_browser .channel_browser_divider {
  color: #67686e;
  font-size: 14px;
  height: 35px;
  line-height: 35px;
  width: 100%;
  padding-left: 1rem;
  font-weight: 700;
  background: #fff
}

#channel_browser #channel_browser_sort {
  width: auto;
  padding-left: 4.5rem
}

html:not(.supports_flexbox) #channel_browser .channel_browser_sort_container,
html:not(.supports_flexbox) #channel_browser .new_channel {
  float: right
}

html:not(.supports_flexbox) #channel_browser .channel_browser_filter_container,
html:not(.supports_flexbox) #channel_browser .channel_modal_header {
  display: inline-block
}

html:not(.supports_flexbox) #channel_browser .channel_browser_sort_container {
  margin-top: -3px
}

.channel_modal_footer {
  position: absolute;
  left: 3%;
  top: 2rem;
  font-size: 15px
}

#channel_browser_footer a .ts_icon:before {
  position: relative;
  top: 2px
}

#new_channel_modal input[type=text],
#new_channel_modal textarea {
  font-size: 18px;
  margin-bottom: 0
}

#new_channel_modal .ts_toggle {
  margin-bottom: .5rem
}

#new_channel_modal .create_share_channel {
  top: 20px;
  left: 40px;
  font-size: 1rem
}

#new_channel_modal .create_share_channel ts-icon {
  top: 3px
}

#new_channel_modal #invite_members_container .lazy_filter_select .lfs_list .lfs_item {
  padding: 0
}

body:not(.unify_user) #new_channel_modal #invite_members_container .lazy_filter_select .lfs_list .lfs_item {
  padding: .375rem
}

.new_channel_modal_footer {
  padding-top: .75rem
}

.kb_nav_label {
  visibility: hidden;
  font-size: 13px
}

.kb_nav_label .ts_icon_arrow_up {
  margin-right: -6px
}

.kb_nav_label .ts_icon:before {
  position: relative;
  top: 3px
}

.kb_nav_label .ts_icon.ts_icon_enter:before {
  font-size: 14px
}

#im_browser {
  position: absolute;
  max-width: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
  padding-left: 30px;
  padding-right: 30px;
  width: 700px
}

#im_browser .im_browser_row {
  width: 100%;
  height: 64px;
  cursor: pointer;
  border: 1px solid transparent;
  border-top: 1px solid #E8E8E8;
  padding-left: 10px;
  padding-right: 12px;
  padding-top: 11px
}

body:not(.unify_user) #im_browser .im_browser_row {
  padding-left: 62px
}

body:not(.unify_user) #im_browser .im_browser_row .member_image {
  position: absolute;
  left: 12px;
  top: 13px
}

#im_browser .im_browser_row.multiparty {
  padding-left: 62px;
  color: #2c2d30
}

body:not(.unify_user) #im_browser .im_browser_row.multiparty {
  color: inherit
}

#im_browser .im_browser_row.multiparty .im_display_name_container {
  margin-top: 10px
}

body:not(.unify_user) #im_browser .im_browser_row.multiparty .im_display_name_container {
  margin-top: 0
}

#im_browser .im_browser_row.multiparty .member_image {
  position: absolute;
  left: 10px;
  top: 11px
}

#im_browser .im_browser_row.multiparty .member_image+.member_image {
  position: absolute;
  left: 20px;
  top: 22px;
  z-index: 1
}

#im_browser .im_browser_row.multiparty .member_image+.member_image:not(.ra):not(.ura) {
  border-radius: 5px;
  border: 2px solid #fff
}

#im_browser .im_browser_row .im_display_name_container {
  font-size: 15px;
  line-height: 21px;
  height: 21px
}

#im_browser .im_browser_row .im_last_msg,
#im_browser .im_browser_row .im_member_title,
#im_browser .im_browser_row .im_slackbot_greeting {
  height: 21px;
  line-height: 21px;
  font-size: 15px
}

#im_browser .im_browser_row .im_last_msg .emoji-sizer {
  font-size: 16px;
  line-height: 14px
}

#im_browser .im_browser_row .im_last_msg_time {
  font-size: 12px;
  line-height: 12px
}

#im_browser .im_browser_row .im_last_msg_time .ts_icon {
  font-size: 16px;
  position: relative;
  top: 4px;
  left: -2px
}

#im_browser .im_browser_row .im_unread_cnt {
  color: #fff;
  background: #FF876D;
  border-radius: 9px;
  font-size: .9rem;
  line-height: .9rem;
  bottom: 13px;
  position: relative;
  padding: 2px 8px
}

body:not(.unify_user) #im_browser .im_browser_row .im_unread_cnt {
  bottom: 0
}

#im_browser .im_browser_row .enter_icon {
  display: none;
  font-size: 18px
}

#im_browser .im_browser_row .mpim_member_count:before {
  margin-left: -4px;
  margin-top: -2px
}

#im_browser .im_browser_row:not(.multiparty) .im_last_msg,
#im_browser .im_browser_row:not(.multiparty) .im_last_msg_time,
#im_browser .im_browser_row:not(.multiparty) .im_unread_cnt {
  display: none
}

#im_browser .im_browser_row:not(.multiparty) .im_member_title {
  display: block
}

#im_browser .im_browser_row.disabled {
  cursor: default;
  color: #2780F8
}

#im_browser .im_browser_row .current_status {
  margin-left: 5px
}

#im_browser .im_browser_row .current_status .emoji-sizer:first-of-type {
  margin-right: 2px
}

#im_browser .remaining_participant_hint {
  display: none;
  font-size: 13px;
  position: absolute
}

#im_browser .recent_label {
  visibility: hidden
}

#im_browser.filter_active .clear_filter_icon,
#im_browser.filter_active .kb_nav_label {
  visibility: visible
}

#im_browser.filter_active .recent_label,
#im_browser.filter_active .return_hint {
  visibility: hidden
}

#im_browser.filter_active .remaining_participant_hint {
  display: none
}

#im_browser.filter_active.no_filter_matches .kb_nav_label {
  visibility: hidden
}

#im_browser.filter_active .im_browser_go:not(.disabled) {
  opacity: .5
}

#im_browser.showing_recent .im_browser_row:not(.multiparty) .im_last_msg,
#im_browser.showing_recent .im_browser_row:not(.multiparty) .im_last_msg_time,
#im_browser.showing_recent .im_browser_row:not(.multiparty) .im_member_title.no_last_msg,
#im_browser.showing_recent .im_browser_row:not(.multiparty) .im_unread_cnt {
  display: block
}

#im_browser.showing_recent .im_browser_row:not(.multiparty) .im_member_title {
  display: none
}

#im_browser.showing_recent .return_hint {
  visibility: hidden
}

#im_browser.showing_recent .recent_label {
  visibility: visible
}

#im_browser.reached_maximum:not(.filter_active) .remaining_participant_hint,
#im_browser:not(.showing_recent):not(.filter_active) .remaining_participant_hint {
  display: block
}

#im_browser #im_list_container:not(.keyboard_active).not_scrolling .im_browser_row:hover,
#im_browser .im_browser_row.highlighted {
  background: #edf7fd;
  border: 1px solid #d3ecfa;
  border-radius: 6px
}

#im_browser #im_list_container:not(.keyboard_active).not_scrolling .im_browser_row:hover .im_last_msg_time,
#im_browser #im_list_container:not(.keyboard_active).not_scrolling .im_browser_row:hover .im_unread_cnt,
#im_browser .im_browser_row.highlighted .im_last_msg_time,
#im_browser .im_browser_row.highlighted .im_unread_cnt {
  display: none
}

#im_browser #im_list_container:not(.keyboard_active).not_scrolling .im_browser_row:hover .enter_icon,
#im_browser .im_browser_row.highlighted .enter_icon {
  display: inline
}

#im_browser #im_list_container:not(.keyboard_active).not_scrolling .im_browser_row:hover+.im_browser_row,
#im_browser .im_browser_row.highlighted+.im_browser_row {
  border-color: transparent
}

#im_browser #im_browser_empty {
  height: 100px;
  width: 75%
}

#im_browser .im_browser_go {
  float: right;
  padding-top: 16px;
  padding-bottom: 17px
}

#im_browser .create_private_channel_container,
#im_browser.reached_maximum #im_list_container,
#im_browser.reached_maximum #monkey_scroll_wrapper_for_im_list_container,
#im_browser.reached_maximum .recent_label {
  display: none
}

#im_browser.reached_maximum .create_private_channel_container {
  display: block
}

@media only screen and (max-height:575px) {
  #im_browser.showing_alert {
    padding-top: 20vh
  }
}

#im_browser_alert {
  position: absolute;
  top: 10px;
  top: 2vh;
  width: 100%;
  padding-right: 50px
}

#im_browser_tokens {
  padding: .5rem .75rem .75rem;
  border: 1px solid #A0A0A2;
  border-radius: .25rem;
  cursor: text;
  display: flex;
  flex-wrap: wrap
}

#im_browser_tokens.active {
  border-color: #717274;
  outline-offset: 0;
  outline: 0
}

html:not(.supports_flexbox) #im_browser_tokens {
  width: 85%;
  display: inline-block
}

#im_browser_tokens #im_browser_filter {
  border: none;
  box-shadow: none;
  width: 150px;
  padding: 0;
  margin-bottom: 0;
  flex: 1
}

#im_browser_tokens #im_browser_filter:first-child {
  width: 100%
}

#im_browser_tokens #im_browser_filter,
#im_browser_tokens .member_token {
  margin-top: .25rem;
  margin-right: 6px;
  height: 26px;
  line-height: 26px
}

#channel_invite_spinner,
#im_browser_spinner {
  width: 20px;
  height: 20px;
  margin-top: 7px
}

#monkey_scroll_wrapper_for_channel_invite_container,
#monkey_scroll_wrapper_for_im_list_container {
  position: relative
}

#monkey_scroll_wrapper_for_channel_invite_container .monkey_scroll_mask,
#monkey_scroll_wrapper_for_im_list_container .monkey_scroll_mask {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  background: rgba(255, 255, 255, .85)
}

#channel_invite_tokens {
  padding: .5rem .75rem .75rem;
  border: 1px solid #C5C5C5;
  border-radius: .25rem;
  cursor: text;
  display: flex;
  flex-wrap: wrap
}

#channel_invite_tokens.active {
  border-color: #2780F8;
  box-shadow: 0 0 7px rgba(39, 128, 248, .15);
  outline-offset: 0;
  outline: 0
}

html:not(.supports_flexbox) #channel_invite_tokens {
  width: 85%;
  display: inline-block
}

#channel_invite_tokens #channel_invite_filter {
  border: none;
  box-shadow: none;
  width: 150px;
  padding: 0;
  margin-bottom: 0;
  flex: 1
}

#channel_invite_tokens #channel_invite_filter:first-child {
  width: 100%
}

#channel_invite_tokens #channel_invite_filter,
#channel_invite_tokens .member_token {
  margin-top: .25rem;
  margin-right: 6px;
  height: 26px;
  line-height: 26px
}

#channel_invite_tokens .member_token,
#im_browser_tokens .member_token {
  position: relative;
  background: #2D9EE0;
  color: #fff;
  border-radius: .2rem;
  font-weight: 700;
  font-size: 15px;
  padding-left: 32px;
  padding-right: 24px;
  cursor: pointer;
  flex: none
}

html:not(.supports_flexbox) #channel_invite_tokens .member_token,
html:not(.supports_flexbox) #im_browser_tokens .member_token {
  display: inline-block
}

#channel_invite_tokens .member_token .member_image,
#im_browser_tokens .member_token .member_image {
  position: absolute;
  left: 1px;
  top: 1px;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0
}

#channel_invite_tokens .member_token .remove_member_icon,
#im_browser_tokens .member_token .remove_member_icon {
  position: absolute;
  right: 3px;
  top: 2px
}

.channel_invite_member,
.channel_invite_member_small,
.channel_invite_pending_user_small {
  font-size: 14px;
  position: relative
}

body:not(.unify_user) .channel_invite_member,
body:not(.unify_user) .channel_invite_member_small,
body:not(.unify_user) .channel_invite_pending_user_small {
  padding-left: 42px;
  height: 36px
}

.channel_invite_member .add_icon,
.channel_invite_member .enter_icon,
.channel_invite_member_small .add_icon,
.channel_invite_member_small .enter_icon,
.channel_invite_pending_user_small .add_icon,
.channel_invite_pending_user_small .enter_icon {
  display: none
}

.lfs_item.active .channel_invite_member .add_icon,
.lfs_item.active .channel_invite_member .enter_icon,
.lfs_item.active .channel_invite_member_small .add_icon,
.lfs_item.active .channel_invite_member_small .enter_icon,
.lfs_item.active .channel_invite_pending_user_small .add_icon,
.lfs_item.active .channel_invite_pending_user_small .enter_icon {
  display: inline
}

.channel_invite_member .add_icon,
.channel_invite_member_small .add_icon,
.channel_invite_pending_user_small .add_icon {
  font-size: 1.6rem;
  color: #439fe0;
  align-self: center
}

body:not(.unify_user) .channel_invite_member .invite_user_group_avatar,
body:not(.unify_user) .channel_invite_member .member_image,
body:not(.unify_user) .channel_invite_member_small .invite_user_group_avatar,
body:not(.unify_user) .channel_invite_member_small .member_image,
body:not(.unify_user) .channel_invite_pending_user_small .invite_user_group_avatar,
body:not(.unify_user) .channel_invite_pending_user_small .member_image {
  margin-right: .5rem;
  position: absolute;
  left: 0;
  top: 0
}

.channel_invite_member .invite_user_group_avatar,
.channel_invite_member_small .invite_user_group_avatar,
.channel_invite_pending_user_small .invite_user_group_avatar {
  width: 36px;
  height: 36px;
  background-color: #2D9EE0;
  padding-top: 12px;
  padding-left: 8px;
  color: #fff;
  border-radius: 3px
}

.channel_invite_member .invite_user_group_avatar i:before,
.channel_invite_member_small .invite_user_group_avatar i:before,
.channel_invite_pending_user_small .invite_user_group_avatar i:before {
  font-size: 25px
}

.channel_invite_member .name_container,
.channel_invite_member_small .name_container,
.channel_invite_pending_user_small .name_container {
  display: flex;
  flex-direction: column;
  -ms-flex-pack: distribute;
  -webkit-box-pack: distribute;
  -webkit-justify-content: space-around;
  -moz-justify-content: space-around;
  justify-content: space-around;
  height: 36px
}

.channel_invite_member .name_container .not_in_token,
.channel_invite_member_small .name_container .not_in_token,
.channel_invite_pending_user_small .name_container .not_in_token {
  font-size: 12px
}

.lfs_item.lfs_token .channel_invite_member,
.lfs_item.lfs_token .channel_invite_member_small,
.lfs_item.lfs_token .channel_invite_pending_user_small {
  height: 28px;
  padding-left: 36px
}

.lfs_item.lfs_token .channel_invite_member .name_container,
.lfs_item.lfs_token .channel_invite_member_small .name_container,
.lfs_item.lfs_token .channel_invite_pending_user_small .name_container {
  height: 28px
}

.lfs_item.lfs_token .channel_invite_member .not_in_token,
.lfs_item.lfs_token .channel_invite_member_small .not_in_token,
.lfs_item.lfs_token .channel_invite_pending_user_small .not_in_token {
  display: none
}

.lfs_item.lfs_token .channel_invite_member .member_image,
.lfs_item.lfs_token .channel_invite_member_small .member_image,
.lfs_item.lfs_token .channel_invite_pending_user_small .member_image {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0
}

.lfs_item.lfs_token .channel_invite_member .invite_user_group_avatar,
.lfs_item.lfs_token .channel_invite_member_small .invite_user_group_avatar,
.lfs_item.lfs_token .channel_invite_pending_user_small .invite_user_group_avatar {
  height: 28px;
  width: 28px;
  margin-right: .3rem;
  border-radius: 0;
  padding-top: 0;
  padding-left: 6px;
  margin-top: -1px
}

.lfs_item.lfs_token .channel_invite_member .invite_user_group_avatar i:before,
.lfs_item.lfs_token .channel_invite_member_small .invite_user_group_avatar i:before,
.lfs_item.lfs_token .channel_invite_pending_user_small .invite_user_group_avatar i:before {
  font-size: 22px
}

.channel_invite_member {
  display: flex
}

body:not(.unify_user) .channel_invite_member {
  padding-left: 50px;
  height: 40px
}

.channel_invite_member .invite_user_group_avatar {
  width: 40px;
  height: 40px
}

.channel_invite_member .name_container {
  height: 40px
}

.channel_invite_member .c-member {
  flex-grow: 1
}

.channel_invite_member_token,
.channel_invite_pending_user_token {
  font-size: 14px;
  position: relative;
  height: 24px;
  line-height: 24px;
  padding-left: 32px
}

.channel_invite_member_token .member_image,
.channel_invite_pending_user_token .member_image {
  position: absolute;
  left: 0;
  top: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0
}

.input_note_special {
  font-size: .9rem;
  line-height: 1.25rem;
  color: #717274;
  margin-top: 1rem
}

#channel_invite_container .lfs_item.lfs_token,
#invite_members_container .lfs_item.lfs_token {
  padding-left: 0;
  padding-top: 0;
  padding-bottom: 0;
  top: 0;
  margin: 6px 6px 6px 0
}

#channel_invite_container .lfs_input_container,
#invite_members_container .lfs_input_container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  min-height: 46px;
  max-height: 230px;
  overflow-y: scroll;
  padding: 5px 0 5px 6px!important
}

#invite_members_container .lfs_input_container {
  min-height: 46px;
  padding: 0 0 0 .75rem!important
}

#invite_members_container .lfs_input {
  padding: .75rem .25rem
}

#invite_members_container .search_icon {
  display: inline;
  position: absolute;
  top: 8px;
  left: 15px
}

#channel_invite_container {
  max-height: 1000px;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column
}

#channel_invite_container .lazy_filter_select {
  flex: 1;
  display: flex;
  flex-direction: column
}

#channel_invite_container .lfs_input {
  font-size: 1.25rem
}

#channel_invite_container .lfs_list_container {
  flex: 1;
  min-height: 0;
  max-height: none;
  display: flex;
  position: static;
  margin-top: 2rem;
  padding: 0;
  border: none;
  box-shadow: none;
  overflow: hidden
}

#channel_invite_container .lfs_list_container .lfs_list {
  max-height: none
}

#channel_invite_container .lfs_list_container .lfs_item {
  border: 1px solid transparent;
  border-top: 1px solid #E8E8E8;
  padding: 10px
}

#channel_invite_container .lfs_list_container .lfs_item.active {
  border: 1px solid #d3ecfa;
  border-radius: 6px
}

#channel_invite_container .lfs_list_container .lfs_item.active+.lfs_item {
  border-color: transparent
}

#channel_invite_container .lfs_list_container .monkey_scroll_wrapper {
  position: relative
}

#channel_invite_container.page_needs_enterprise {
  flex-direction: row;
  max-height: none
}

#channel_invite_container.page_needs_enterprise .list_items {
  width: 100%
}

#channel_invite_container.page_needs_enterprise .channel_invite_row {
  width: 100%;
  height: 64px;
  cursor: pointer;
  border: 1px solid transparent;
  border-top: 1px solid #E8E8E8;
  padding: .625rem .75rem
}

body:not(.unify_user) #channel_invite_container.page_needs_enterprise .channel_invite_row {
  height: 64px
}

.unify_user #channel_invite_container.page_needs_enterprise .channel_invite_row {
  height: 58px
}

#channel_invite_container.page_needs_enterprise .channel_invite_row.disabled {
  cursor: default;
  color: #717274
}

#channel_invite_container.page_needs_enterprise .channel_invite_row.disabled .add_icon {
  visibility: hidden;
  display: none
}

body:not(.unify_user) #channel_invite_container.page_needs_enterprise .channel_invite_row .channel_invite_member {
  height: 42px
}

body:not(.unify_user) #channel_invite_container.page_needs_enterprise .channel_invite_row .channel_invite_member .member_image {
  top: 3px
}

#channel_invite_container.page_needs_enterprise .channel_invite_row .name_container {
  height: 42px;
  display: block;
  flex-grow: 1
}

#channel_invite_container.page_needs_enterprise .channel_invite_row .name_container>div {
  height: 21px;
  line-height: 21px
}

#channel_invite_modal .channel_invite_filter_container {
  margin-bottom: 27px
}

#channel_invite_modal .kb_nav_label {
  visibility: visible
}

#channel_invite_modal .enter_to_go_label {
  position: absolute;
  top: 54px
}

#channel_invite_modal .enter_to_go_label .ts_icon_enter:before {
  position: relative;
  top: 2px
}

#channel_invite_modal .ts_icon_shared_channels {
  right: 2px;
  top: 5px
}

#channel_invite_modal #channel_invite_container:not(.keyboard_active).not_scrolling .channel_invite_row:not(.disabled):hover,
#channel_invite_modal .channel_invite_row.highlighted:not(.disabled) {
  background: #edf7fd;
  border: 1px solid #d3ecfa;
  border-radius: 6px
}

#channel_invite_modal #channel_invite_container:not(.keyboard_active).not_scrolling .channel_invite_row:not(.disabled):hover .add_icon,
#channel_invite_modal .channel_invite_row.highlighted:not(.disabled) .add_icon {
  display: inline
}

#channel_invite_modal #channel_invite_container:not(.keyboard_active).not_scrolling .channel_invite_row:not(.disabled):hover+.channel_invite_row,
#channel_invite_modal .channel_invite_row.highlighted:not(.disabled)+.channel_invite_row {
  border-color: transparent
}

#channel_invite_modal #channel_invite_container .channel_invite_row.disabled {
  background: #F9F9F9
}

#channel_invite_modal .enter_to_go_label {
  right: 16px
}

#channel_invite_tokens .member_token.ra,
#im_browser_tokens .member_token.ra,
.lfs_token.ra {
  background-color: #A0A0A2;
  border-color: #A0A0A2
}

#generic_dialog.modal.all_members_dialog {
  width: 400px;
  z-index: 1041
}

#generic_dialog.modal.all_members_dialog .modal-header h3 {
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap
}

#generic_dialog.modal.all_members_dialog .modal-body {
  margin-left: 0;
  margin-top: 0;
  padding: 0
}

#generic_dialog.modal.all_members_dialog #all_members_filter input {
  border: none;
  border-radius: 0;
  height: 47px;
  padding-left: 44px
}

#generic_dialog.modal.all_members_dialog #all_members_filter input,
#generic_dialog.modal.all_members_dialog #all_members_filter input:active,
#generic_dialog.modal.all_members_dialog #all_members_filter input:focus {
  border-bottom: 1px solid rgba(0, 0, 0, .065);
  box-shadow: none
}

#generic_dialog.modal.all_members_dialog #all_members_filter ts-icon {
  position: absolute;
  left: 16px;
  top: 14px
}

#generic_dialog.modal.all_members_dialog #all_members_no_matches {
  top: 65px
}

#generic_dialog.modal.all_members_dialog #all_members_container {
  padding-left: 15px;
  padding-top: 1rem;
  height: 400px;
  overflow: auto
}

#generic_dialog.modal.all_members_dialog #all_members_container .list_item_container {
  width: 360px
}

#generic_dialog.modal.all_members_dialog #all_members_container a.member {
  display: block
}

.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container {
  border-right: .25rem solid transparent
}

.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 8px
}

.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #fff
}

.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar #generic_dialog.modal.all_members_dialog #all_members_container {
  margin-right: 2px
}

.supports_custom_scrollbar.slim_scrollbar #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.supports_custom_scrollbar.slim_scrollbar #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-thumb {
  background-color: rgba(113, 114, 116, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #717274;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar #generic_dialog.modal.all_members_dialog #all_members_container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(113, 114, 116, .8)
}

#channel_membership_dialog_container #channel_membership_dialog_scroller {
  overflow-y: auto;
  overflow-x: hidden;
  padding: .8rem;
  height: 392px
}

#channel_membership_dialog_container #channel_membership_dialog_scroller .member_item {
  width: 100%
}

@media only screen and (max-height:650px) {
  #channel_membership_dialog_container #channel_membership_dialog_scroller {
    height: 354px
  }
}

#channel_membership_dialog_container .searchable_member_list_search input {
  width: 100%;
  border: none;
  border-radius: none;
  border-bottom: 1px solid #E8E8E8;
  padding-left: 2.8rem;
  padding-top: .8rem;
  padding-bottom: .8rem
}

#channel_membership_dialog_container .ts_icon_search {
  top: .85rem;
  left: 1rem;
  color: #555459
}

#channel_membership_dialog_container .icon_close {
  top: .9rem;
  right: .9rem
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.lazy_filter_select {
  position: relative;
  display: block;
  font-weight: 400
}

.lazy_filter_select.disabled,
.lazy_filter_select.disabled input.lfs_input {
  background: #F9F9F9
}

.lazy_filter_select.disabled .lfs_input_container {
  color: #c5c5c5
}

.lazy_filter_select.disabled .lfs_input_container:active,
.lazy_filter_select.disabled .lfs_input_container:hover {
  border-color: #c5c5c5
}

.lazy_filter_select input.lfs_input {
  border: none;
  font-size: 1rem;
  outline: 0;
  display: inline-block;
  width: auto;
  padding: .45rem .75rem .55rem;
  box-shadow: none!important;
  margin: 0;
  vertical-align: middle
}

.lazy_filter_select .lfs_input_container {
  border: 1px solid #A0A0A2;
  font: 400 1rem Slack-Lato, appleLogo, sans-serif;
  position: relative;
  border-radius: .25rem;
  display: block;
  width: 100%;
  cursor: text;
  padding: .1rem 0;
  max-height: 250px;
  overflow-y: auto
}

.lazy_filter_select .lfs_input_container.active,
.lazy_filter_select .lfs_input_container:hover {
  border-color: #717274
}

.lazy_filter_select .lfs_input_container.active {
  box-shadow: 0 0 7px rgba(39, 128, 248, .15)
}

.lazy_filter_select .lfs_input_container.empty .lfs_input {
  width: 100%;
  height: 30px
}

body:not(.unify_user) .lazy_filter_select .lfs_input_container.empty .lfs_input {
  height: inherit
}

.lazy_filter_select .lfs_input_container.monkey_scroller {
  max-height: 150px
}

.lazy_filter_select .lfs_input_container.error {
  border-color: #CB5234
}

.lazy_filter_select .lfs_list_container {
  display: none;
  position: absolute;
  z-index: 200;
  width: 100%;
  max-height: 250px;
  top: 100%;
  left: 0;
  overflow: auto;
  margin-top: 3px;
  margin-bottom: 3px;
  border: 1px solid #D8D8D8;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, .1);
  padding: 4px 3px 4px 4px
}

.lazy_filter_select .lfs_list_container.visible {
  display: block
}

.lazy_filter_select .lfs_list_container.position_above {
  top: auto;
  bottom: 100%
}

.lazy_filter_select .lfs_list_container .monkey_scroll_bar:not(.hidden)+.monkey_scroll_hider>.lfs_list {
  padding-right: 17px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list {
  overflow-y: auto;
  border-right: .25rem solid transparent;
  border-right: none
}

.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 12px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-thumb,
.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-track {
  background-clip: padding-box!important;
  color: #fff;
  border-left: 4px solid #fff;
  border-radius: 8px 4px 4px 8px/4px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-track {
  background: #f3f3f3;
  box-shadow: inset 0 -4px 0 0, inset 0 4px 0 0
}

.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-thumb {
  background: #d9d9de;
  box-shadow: inset 0 -2px, inset 0 -3px, inset 0 2px, inset 0 3px;
  min-height: 36px
}

.supports_custom_scrollbar:not(.slim_scrollbar) .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-corner {
  background: #fff
}

.supports_custom_scrollbar.slim_scrollbar .lazy_filter_select .lfs_list_container .lfs_list {
  overflow-y: auto;
  margin-right: 2px;
  border-right: none
}

.supports_custom_scrollbar.slim_scrollbar .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 12px
}

.supports_custom_scrollbar.slim_scrollbar .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-thumb {
  background-color: rgba(217, 217, 222, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #d9d9de;
  min-height: 36px
}

.supports_custom_scrollbar.slim_scrollbar .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(217, 217, 222, .8)
}

.supports_custom_scrollbar.slim_scrollbar .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-thumb,
.supports_custom_scrollbar.slim_scrollbar .lazy_filter_select .lfs_list_container .lfs_list::-webkit-scrollbar-track {
  border-left: 4px solid transparent;
  border-radius: 8px 4px 4px 8px/4px
}

.lazy_filter_select .lfs_list_container .lfs_status {
  display: none;
  font-size: .85rem;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  width: 100%;
  padding: 4px
}

.lazy_filter_select .lfs_list_container .lfs_status .lfs_status_content,
.lazy_filter_select .lfs_list_container .lfs_status .lfs_status_loading_indicator {
  display: inline-block;
  line-height: 1;
  vertical-align: middle
}

.lazy_filter_select .lfs_list_container.show_status .lfs_list {
  display: none
}

.lazy_filter_select .lfs_list_container.show_status .lfs_status {
  display: block
}

.lazy_filter_select .lfs_list {
  max-height: 250px;
  overflow: auto;
  margin-right: 1px;
  width: 100%
}

.lazy_filter_select .lfs_list .lfs_group,
.lazy_filter_select .lfs_list .lfs_item {
  padding: .375rem;
  font-size: .85rem
}

.lazy_filter_select .lfs_list .lfs_group {
  font-weight: 700;
  line-height: 1.5;
  width: 100%
}

.lazy_filter_select .lfs_list .lfs_item {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  line-height: 1rem;
  width: 100%;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap
}

.lazy_filter_select .lfs_list .lfs_item.selected,
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__current-status .prevent_copy_paste,
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__current-status--small:before,
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__display-name,
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__name,
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__secondary-name {
  color: #2780F8
}

.lazy_filter_select .lfs_list .lfs_item.selected .c-member__current-status .prevent_copy_paste .ts_icon:not(.presence_icon),
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__current-status--small:before .ts_icon:not(.presence_icon),
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__display-name .ts_icon:not(.presence_icon),
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__name .ts_icon:not(.presence_icon),
.lazy_filter_select .lfs_list .lfs_item.selected .c-member__secondary-name .ts_icon:not(.presence_icon),
.lazy_filter_select .lfs_list .lfs_item.selected .ts_icon:not(.presence_icon) {
  color: #2780F8
}

.lazy_filter_select .lfs_list .lfs_item.active {
  background-color: #edf7fd;
  border-color: #d3ecfa
}

.lazy_filter_select .lfs_list .lfs_item .current_status {
  margin-left: 5px
}

.lazy_filter_select .lfs_list .lfs_item .current_status .emoji-sizer:first-of-type {
  margin-right: 2px
}

.lazy_filter_select .lfs_list .lfs_item .multipary_dm_icon {
  margin-left: 2px;
  margin-right: 2px
}

body:not(.unify_user) .lazy_filter_select .lfs_list .lfs_item .multipary_dm_icon {
  margin: 0
}

.lazy_filter_select .lfs_item_icon {
  border-radius: 2px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 16px 16px;
  display: inline-block;
  height: 16px;
  margin-right: 3px;
  vertical-align: middle;
  width: 16px
}

.lazy_filter_select .lfs_item_desc {
  color: #9e9ea6;
  margin-left: 2px
}

.lazy_filter_select .lfs_token {
  display: inline-block;
  margin: .2rem 0 .2rem .4rem;
  padding: .1875rem 1.5rem .1875rem .3125rem;
  border: 1px solid #439fe0;
  border-radius: 3px;
  background: #439fe0;
  color: #fff;
  cursor: pointer;
  font-size: .85rem;
  font-weight: 700;
  position: relative;
  vertical-align: middle
}

.lazy_filter_select .lfs_token:not(.disabled):after {
  content: '\00D7';
  font-weight: 400;
  line-height: 0;
  color: #fff;
  display: inline-block;
  margin-left: 8px;
  font-size: 1.3rem;
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%)
}

.lazy_filter_select .lfs_token.lfs_token_user_groups {
  background: #56B68B;
  border: 1px solid #56B68B
}

.lazy_filter_select .lfs_token.lfs_token_members {
  border: 1px solid #E8E8E8;
  color: #232323;
  background: #E8E8E8
}

.lazy_filter_select .lfs_token.lfs_token_members:after {
  color: #232323
}

.lazy_filter_select .lfs_token.lfs_invalid_slug {
  background: #eb4d5c;
  border-color: #eb4d5c
}

.lazy_filter_select .lfs_token.disabled {
  background: #A0A0A2;
  border-color: #A0A0A2;
  padding-right: .5rem
}

.lazy_filter_select .lfs_token.lfs_token_pending_user {
  background: #A0A0A2;
  border-color: #A0A0A2
}

.lazy_filter_select .group_token_sizer {
  height: 1.25rem;
  display: block;
  line-height: 1.5rem;
  text-align: left;
  padding: 0 .6rem;
  margin-bottom: .1875rem
}

.lazy_filter_select.single .lfs_input_container:after {
  content: "\E271";
  font-family: Slack;
  position: absolute;
  right: .7rem;
  top: 3px;
  font-size: 20px;
  pointer-events: none
}

body:not(.unify_user) .lazy_filter_select.single .lfs_input_container:after {
  top: 4px
}

.lazy_filter_select.single .lfs_input_container.active:after,
.lazy_filter_select.single .lfs_input_container:hover:after {
  color: #717274
}

.lazy_filter_select.single.disabled .lfs_input_container.active:after,
.lazy_filter_select.single.disabled .lfs_input_container:hover:after {
  color: currentColor
}

.lazy_filter_select.single .lfs_item {
  line-height: normal;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap
}

.lazy_filter_select.single .lfs_input,
.lazy_filter_select.single .lfs_input_container {
  cursor: default
}

.lazy_filter_select.single .lfs_input {
  padding-left: .75rem
}

.lazy_filter_select.single.value .active .lfs_value,
.lazy_filter_select.single.value .lfs_input {
  display: none
}

.lazy_filter_select.single.value .active .lfs_input {
  display: block
}

.lazy_filter_select.single:not(.value) .lfs_value {
  display: none
}

body:not(.unify_user) .lazy_filter_select .lfs_value {
  padding: .45rem 2.5rem .55rem 8px
}

body:not(.unify_user) .lazy_filter_select .lfs_value .ts_icon_shared_channels {
  top: 0
}

.lazy_filter_select .lfs_token .addl_text,
.lazy_filter_select .lfs_value .addl_text {
  display: none
}

.lazy_filter_select .addl_icon {
  line-height: .5rem
}

.lazy_filter_select .addl_icon.ts_icon_shared_channels {
  top: 4px
}

.lazy_filter_select .team_image {
  border-radius: 3px;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
  position: relative;
  top: 1px
}

.lazy_filter_select .team_image:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 0 1px rgba(44, 45, 48, .08);
  border-radius: 3px
}

.lazy_filter_select .team_image.default {
  background-color: #717274;
  font-weight: 800;
  font-size: 18px;
  line-height: 1.9;
  color: #fff;
  font-style: normal;
  letter-spacing: 0;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .2)
}

.lazy_filter_select .team_image.icon_16 {
  width: 16px;
  height: 16px;
  font-size: 9px
}

.lazy_filter_select.channel_browser_sort .lfs_value,
.lazy_filter_select.show_which_channels_selector .lfs_value {
  padding: .45rem 2.5rem .55rem 8px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_value {
  padding: 0 2.5rem .15rem 8px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_value .lfs_item.selected {
  height: 25px;
  color: #2c2d30;
  font-weight: 700
}

.unify_user #select_share_channels .lazy_filter_select .lfs_value .lfs_item.selected .ts_icon_shared_channels {
  margin-right: 40px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_value .lfs_item.selected .ts_icon:not(.presence_icon) {
  color: #717274;
  position: relative;
  top: 1px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_item {
  color: #2c2d30;
  font-weight: 700;
  font-size: 15px;
  padding: 0;
  margin: 0 0 3px;
  height: 32px;
  width: calc(99%)
}

.unify_user #select_share_channels .lazy_filter_select .lfs_item .c-member--small {
  margin-right: 6px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_item .ts_icon_channel:before {
  font-size: 18px;
  margin-left: 3px;
  margin-right: 3px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_item .ts_icon:not(.presence_icon) {
  color: #717274
}

.unify_user #select_share_channels .lazy_filter_select .lfs_item .ts_icon_lock {
  padding-right: 3px;
  padding-left: 1px
}

.unify_user #select_share_channels .lazy_filter_select .lfs_item .ts_icon_channel {
  position: relative;
  top: 1px
}

.lazy_filter_select.normal_style .lfs_input_container,
.lazy_filter_select.small_style .lfs_input_container {
  border-radius: .25rem
}

.lazy_filter_select.normal_style .lfs_input_container .lfs_input,
.lazy_filter_select.small_style .lfs_input_container .lfs_input {
  line-height: normal;
  margin: 0
}

.lazy_filter_select.normal_style .lfs_input_container .lfs_token,
.lazy_filter_select.small_style .lfs_input_container .lfs_token {
  line-height: 1.5rem;
  padding: 0 1.5rem 0 0;
  top: auto
}

.lazy_filter_select.normal_style .lfs_input_container .lfs_token.disabled,
.lazy_filter_select.small_style .lfs_input_container .lfs_token.disabled {
  padding-right: .3125rem
}

.lazy_filter_select.normal_style.single .lfs_input_container .lfs_value,
.lazy_filter_select.small_style.single .lfs_input_container .lfs_value {
  padding: 0 2rem 0 0
}

.lazy_filter_select.normal_style.single .lfs_input_container .lfs_input,
.lazy_filter_select.small_style.single .lfs_input_container .lfs_input {
  padding-right: 2rem
}

.lazy_filter_select.normal_style .lfs_input_container {
  min-height: 3.125rem;
  padding: .375rem
}

.lazy_filter_select.normal_style .lfs_input_container .lfs_input {
  font-size: 1.25rem;
  padding: .375rem .5rem .375rem .375rem
}

.lazy_filter_select.normal_style .lfs_input_container .lfs_token {
  margin: .3125rem
}

.lazy_filter_select.normal_style.single .lfs_input_container:after {
  top: .5rem
}

.lazy_filter_select.small_style .lfs_input_container {
  min-height: 2.3125rem;
  padding: .125rem
}

.lazy_filter_select.small_style .lfs_input_container.empty .lfs_input {
  padding-left: .625rem
}

.lazy_filter_select.small_style .lfs_input_container .lfs_input {
  font-size: 1rem;
  padding: .375rem .5rem .375rem .375rem
}

.lazy_filter_select.small_style .lfs_input_container .lfs_token {
  margin: .1875rem .1875rem .125rem
}

.lazy_filter_select.small_style.single .lfs_input_container:after {
  top: .125rem
}

.lazy_filter_select.has_restricted_input_container_height>.monkey_scroll_wrapper {
  border: 1px solid #2780F8;
  border-radius: 3px
}

.lazy_filter_select.has_restricted_input_container_height>.monkey_scroll_wrapper .lfs_input_container {
  border: 1px solid transparent
}

.lazy_filter_select.single.filter_in_list_style {
  width: 180px
}

.lazy_filter_select.single.filter_in_list_style ._input_style {
  font-size: 13px;
  padding: 6px 27px 6px 10px
}

.lazy_filter_select.single.filter_in_list_style .lfs_input_container {
  padding: 0
}

.lazy_filter_select.single.filter_in_list_style .lfs_input_container .lfs_input,
.lazy_filter_select.single.filter_in_list_style .lfs_input_container .lfs_value {
  font-size: 13px;
  padding: 6px 27px 6px 10px
}

.lazy_filter_select.single.filter_in_list_style .lfs_input_container:hover:not(.active) {
  border-color: #9e9ea6
}

.lazy_filter_select.single.filter_in_list_style .lfs_input_container:hover:not(.active)::after {
  color: #555459
}

.lazy_filter_select.single.filter_in_list_style .lfs_input_container::after {
  color: #555459;
  font-size: 18px;
  line-height: 1;
  right: 5px;
  top: 5px
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item,
.lazy_filter_select.single.filter_in_list_style .lfs_value .lfs_item {
  color: #2C2D30;
  font-size: 13px
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item .ts_icon::before,
.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item ts-icon::before,
.lazy_filter_select.single.filter_in_list_style .lfs_value .lfs_item .ts_icon::before,
.lazy_filter_select.single.filter_in_list_style .lfs_value .lfs_item ts-icon::before {
  font-size: 13px;
  line-height: 1
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item .ts_icon:first-child::before,
.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item ts-icon:first-child::before,
.lazy_filter_select.single.filter_in_list_style .lfs_value .lfs_item .ts_icon:first-child::before,
.lazy_filter_select.single.filter_in_list_style .lfs_value .lfs_item ts-icon:first-child::before {
  margin-right: .25rem
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item .ts_icon_shared_channel::before,
.lazy_filter_select.single.filter_in_list_style .lfs_value .lfs_item .ts_icon_shared_channel::before {
  vertical-align: text-top
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container {
  max-width: 350px;
  min-width: 250px;
  overflow: hidden;
  padding: 4px;
  z-index: 201
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_filter_input {
  font-size: 13px;
  margin-bottom: 4px;
  padding: 6px 27px 6px 10px
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_group {
  color: #9e9ea6;
  font-size: 14px
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_item.group_item {
  padding-left: 12px
}

.lazy_filter_select.single.filter_in_list_style .lfs_list_container .lfs_status_loading_indicator {
  margin-bottom: 6px
}

.lazy_filter_select.single.filter_in_list_style .emoji-outer {
  height: 1rem;
  width: 1rem
}

.lazy_filter_select.single.filter_in_list_style.disabled .lfs_input_container .lfs_item {
  color: #9e9ea6
}

.lazy_filter_select.single.filter_in_list_style.disabled .lfs_input_container .lfs_item_desc {
  color: #BABBBF
}

.lazy_filter_select.single.filter_in_list_style.disabled .lfs_input_container::hover {
  border-color: #c5c5c5
}

label.select[data-lazy-filter-select]:after,
label[data-lazy-filter-select] select,
select[data-lazy-filter-select] {
  min-height: 39px;
  visibility: hidden
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.rxn_panel {
  position: relative;
  z-index: 5;
  opacity: .85;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-family: "Helvetica Neue", Helvetica, "Segoe UI", Tahoma, Arial, sans-serif
}

.rxn_panel .rxn_hover_container {
  transition: opacity .2s linear;
  margin-left: 4px;
  visibility: hidden;
  opacity: 0
}

.rxn_panel .rxn_hover_container .rxn {
  margin-right: 2px!important
}

.rxn_panel .rxn+.rxn_hover_container {
  margin-left: .125rem
}

.rxn_panel:not(:empty) {
  padding-top: 1px
}

.rxn_panel.active .rxn_hover_container,
.rxn_panel:hover .rxn_hover_container {
  visibility: visible;
  opacity: 1
}

.rxn_panel:hover {
  z-index: 97
}

ts-message.selected .rxn_panel .rxn_panel .rxn_hover_container {
  visibility: visible;
  opacity: 1
}

.message:hover .rxn_panel,
.rxn_panel.active {
  opacity: 1
}

.rxn {
  display: inline-block;
  margin-top: 2px;
  margin-bottom: 2px;
  background: #fff;
  border: 1px solid #E8E8E8;
  margin-right: 6px!important;
  border-radius: 5px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: pointer;
  height: 1.4rem;
  line-height: 23px;
  vertical-align: baseline;
  padding: 1px 3px
}

.rxn.active,
.rxn:hover {
  border-color: #4fb0fc
}

.rxn.active .emoji_rxn_count,
.rxn:hover .emoji_rxn_count {
  color: #4fb0fc
}

.rxn.user_reacted {
  border: 1px solid;
  border-color: rgba(79, 176, 252, .4)!important;
  background-color: rgba(79, 176, 252, .08);
  padding: 1px 3px
}

.rxn.user_reacted .emoji_rxn_count {
  color: #4fb0fc;
  font-weight: 700
}

.feature_texty_mentions .rxn.user_reacted {
  background: rgba(0, 122, 184, .05);
  border-color: rgba(0, 122, 184, .3)!important
}

.feature_texty_mentions .rxn.user_reacted .emoji_rxn_count {
  color: #007AB8
}

.rxn .emoji-sizer {
  line-height: 20px;
  font-size: 16px;
  text-indent: 0!important;
  vertical-align: baseline
}

.rxn .emoji_rxn_count {
  font-size: 11px;
  font-family: helvetica, arial;
  position: relative;
  top: -4px;
  padding: 0 1px 0 3px;
  color: #959595
}

.rxn .emoji_rxn_count:before {
  content: attr(aria-label)
}

.rxn.menu_rxn {
  position: relative
}

.rxn.menu_rxn .ts_icon {
  z-index: 1;
  position: absolute;
  margin-left: -1px;
  color: rgba(0, 0, 0, .25);
  top: 0;
  left: 0;
  width: 100%;
  display: block;
  text-align: center;
  line-height: 21px;
  padding-left: 1px
}

.rxn.menu_rxn .ts_icon:before {
  font-size: 18px
}

.rxn.menu_rxn .ts_icon_circle_fill {
  opacity: 0;
  z-index: 0
}

.rxn.menu_rxn .emoji-sizer {
  line-height: 16px
}

.rxn.menu_rxn.active .ts_icon,
.rxn.menu_rxn:hover .ts_icon {
  color: rgba(0, 0, 0, .2)
}

.rxn.menu_rxn.active .ts_icon_circle_fill,
.rxn.menu_rxn:hover .ts_icon_circle_fill {
  opacity: 1;
  color: #ffd06d
}

.rxn.menu_rxn.active .ts_icon_add_reaction,
.rxn.menu_rxn:hover .ts_icon_add_reaction {
  opacity: 1;
  color: #c39a48
}

.rxn:focus {
  outline: 0
}

#files_tab .rxn_panel .rxn {
  line-height: 22px
}

.mention_rxn {
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: 15px;
  line-height: 22px;
  position: relative;
  padding-left: 3rem
}

.mention_rxn .rxn_emoji_icon {
  width: 40px;
  position: absolute;
  top: 3px;
  left: 0;
  float: left;
  text-align: center
}

.mention_rxn .rxn_emoji_icon .rxn_emoji {
  display: inline-block
}

.mention_rxn .rxn_emoji_icon.rxn_1 span.emoji-sizer {
  font-size: 36px;
  vertical-align: baseline
}

.mention_rxn .rxn_emoji_icon.rxn_2 span.emoji-sizer,
.mention_rxn .rxn_emoji_icon.rxn_3 span.emoji-sizer,
.mention_rxn .rxn_emoji_icon.rxn_4 span.emoji-sizer {
  font-size: 18px
}

.mention_rxn .mention_rxn_summary {
  font-style: italic;
  color: #9e9ea6
}

.mention_rxn .mention_rxn_summary .app_preview_link,
.mention_rxn .mention_rxn_summary .member_preview_link,
.mention_rxn .mention_rxn_summary .mention_rxn_summary_members {
  font-weight: 900!important;
  font-style: normal;
  color: #3D3C40
}

.mention_rxn .mention_rxn_summary .mention_rxn_summary_members .ts_tip {
  z-index: 1030
}

.mention_rxn .mention_rxn_msg_holder .message,
.mention_rxn .mention_rxn_msg_holder .message_content {
  padding-left: 0;
  padding-right: 0
}

.mention_rxn .mention_rxn_msg_holder .message>.member_image,
.mention_rxn .mention_rxn_msg_holder .message>.message_content_header,
.mention_rxn .mention_rxn_msg_holder .message>.message_gutter,
.mention_rxn .mention_rxn_msg_holder .message>.message_sender,
.mention_rxn .mention_rxn_msg_holder .message>.message_star_holder,
.mention_rxn .mention_rxn_msg_holder .message>a.member,
.mention_rxn .mention_rxn_msg_holder .message>a.msg_right_link,
.mention_rxn .mention_rxn_msg_holder .message>a.timestamp,
.mention_rxn .mention_rxn_msg_holder .message>i,
.mention_rxn .mention_rxn_msg_holder .message_content>.member_image,
.mention_rxn .mention_rxn_msg_holder .message_content>.message_content_header,
.mention_rxn .mention_rxn_msg_holder .message_content>.message_gutter,
.mention_rxn .mention_rxn_msg_holder .message_content>.message_sender,
.mention_rxn .mention_rxn_msg_holder .message_content>.message_star_holder,
.mention_rxn .mention_rxn_msg_holder .message_content>a.member,
.mention_rxn .mention_rxn_msg_holder .message_content>a.msg_right_link,
.mention_rxn .mention_rxn_msg_holder .message_content>a.timestamp,
.mention_rxn .mention_rxn_msg_holder .message_content>i {
  display: none!important
}

.dense_theme .mention_rxn_summary,
.dense_theme .mention_rxn_summary_left {
  display: inline
}

.light_theme .mention_rxn .mention_rxn_summary {
  display: flex;
  align-items: baseline
}

.light_theme .mention_rxn .mention_rxn_summary .mention_rxn_summary_left {
  flex: 1 1 auto
}

#poll_dialog_input_container .message_input {
  width: 100%;
  padding-right: 8px;
  margin-bottom: .25rem;
  height: 96px;
  max-height: 112px!important
}

#handy_rxns_controller {
  max-width: 600px
}

#handy_rxns_controller #poll_table {
  position: relative
}

#handy_rxns_controller #suggestions_ui {
  margin-bottom: 1rem;
  line-height: 1.9rem
}

#handy_rxns_controller .handy_rxns_row {
  display: block;
  margin-top: 3px
}

#handy_rxns_controller .handy_rxns_row a.btn {
  width: 3.56rem;
  height: 2.31rem;
  padding-top: 9px;
  padding-bottom: 8px
}

#handy_rxns_controller #handy_rxns_restricter {
  display: block;
  margin: 1rem 0
}

#handy_rxns_controller .handy_rxns_row a.btn .ts_icon {
  margin-right: 0
}

#handy_rxns_controller .handy_rxns_row.empty input.title {
  border: 1px solid transparent;
  visibility: hidden
}

#handy_rxns_controller .handy_rxns_row.empty a.btn {
  font-size: 1.4rem
}

#handy_rxns_controller .handy_rxns_row.empty a.btn .ts_icon {
  margin-right: 0
}

#handy_rxns_controller .handy_rxns_row input.title:focus::-webkit-input-placeholder {
  color: transparent
}

#handy_rxns_controller .handy_rxns_row input.title:focus:-moz-placeholder {
  color: transparent
}

#handy_rxns_controller .handy_rxns_row input.title:focus::-moz-placeholder {
  color: transparent
}

#handy_rxns_controller .handy_rxns_row input.title:focus:-ms-input-placeholder {
  color: transparent
}

#handy_rxns_controller .handy_rxns_row:not(.empty):hover .handy_rxns_remover {
  display: inline
}

#handy_rxns_controller .handy_rxns_remover {
  display: none
}

#handy_rxns_controller #handy_rxns_controller_empty {
  position: absolute;
  top: 34px;
  left: 60px;
  padding: 0 30px
}

#handy_rxns_controller #handy_rxns_controller_empty p {
  font-size: 1.3rem;
  line-height: 1.6rem
}

.c-member,
.c-usergroup {
  display: flex
}

.c-member__display-name,
.c-usergroup__handle {
  color: #2c2d30;
  font-weight: 700
}

.c-member .presence.active {
  color: #93cc93
}

.c-member .presence.away {
  opacity: .6
}

.c-member .member_image,
.c-usergroup .c-usergroup__icon {
  display: inline-block;
  position: relative;
  border-radius: .2rem;
  background-size: 100%;
  background-repeat: no-repeat;
  flex: 0 0 auto
}

.c-member__linked {
  cursor: pointer;
  text-decoration: none
}

.c-member__linked:hover {
  text-decoration: none
}

.c-member__current-status .emoji-outer.emoji-sizer {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  background-size: 4100%!important;
  overflow: hidden;
  font-size: 1rem;
  line-height: 1;
  vertical-align: middle;
  margin-top: -4px;
  margin-left: .1rem
}

.c-member__current-status--small:before,
.c-member__secondary-name--large+.c-member__current-status--large:before,
.c-member__secondary-name--medium+.c-member__current-status--medium:before {
  padding: 0 .2rem 0 .4rem;
  color: rgba(113, 114, 116, .3);
  content: '|'
}

.c-member__current-status .prevent_copy_paste:before {
  content: attr(aria-label)
}

.c-member__current-status .prevent_copy_paste {
  margin-left: .125rem
}

.c-member .external_team_badge {
  display: inline-block;
  vertical-align: bottom;
  position: absolute;
  bottom: -2px;
  right: -2px;
  border-radius: 3px;
  box-shadow: 0 0 0 2px #fff;
  background-size: 100%;
  background-color: #fff;
  background-repeat: no-repeat
}

.c-member .external_team_badge.team_badge_16 {
  width: 16px;
  height: 16px
}

.c-member .external_team_badge.default {
  background-color: #717274;
  font-weight: 800;
  font-size: 10px;
  line-height: 1.6;
  color: #fff;
  font-style: normal;
  letter-spacing: 0;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .2)
}

.c-member .external_team_badge:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 0 1px rgba(44, 45, 48, .08);
  border-radius: 3px
}

.c-member--small,
.c-usergroup--small {
  align-items: center;
  font-size: 15px;
  line-height: 2
}

.c-member__large-font--small {
  font-size: 16px
}

.c-member__name--small,
.c-usergroup__name--small {
  color: #717274;
  font-weight: 400;
  word-break: break-word;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex: 1 1 auto;
  margin-left: .25rem
}

.c-member__with-avatar--small .c-member__name--small,
.c-usergroup__with-icon--small .c-usergroup__name--small {
  margin-left: .5rem
}

.c-member__context--small {
  line-height: 1.9
}

.c-member__unread-context--small {
  order: 4;
  position: relative;
  bottom: 1px
}

.c-member--small .team_image~.c-member__not-in-channel-context--small {
  padding-right: .5rem
}

.c-member--small .presence {
  width: 18px;
  height: 30px;
  margin: 0 0 0 .15rem;
  position: relative;
  color: #717274;
  flex: 0 0 6px
}

.c-member--small .presence .presence_icon {
  font-size: 20px;
  line-height: 1;
  top: 0;
  left: 0;
  position: relative
}

.c-member__large-font--small .presence .presence_icon {
  top: -2px
}

.c-member--small .member_image,
.c-usergroup--small .c-usergroup__icon {
  width: 20px;
  height: 20px
}

.c-member--small .member_image {
  margin-left: .25rem
}

.c-member--small .team_image.icon_16 {
  width: 16px;
  height: 16px;
  line-height: 1.6;
  flex: 0 0 16px;
  order: 3;
  border: 1px solid #fff;
  border-radius: 3px;
  background-size: 100%;
  background-repeat: no-repeat;
  display: inline-block;
  position: relative
}

.c-member--small .team_image.default {
  background-color: #717274;
  font-weight: 800;
  line-height: 1.6;
  font-size: 9.5px;
  color: #fff;
  font-style: normal;
  letter-spacing: 0;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0, 0, 0, .2)
}

.c-member__secondary-name--small,
.c-usergroup__description--small {
  margin-left: .25rem
}

.c-member__deleted--small {
  width: 18px;
  margin: 0 0 3px 2px;
  height: 15px
}

.c-member__context.c-member__not-in-channel-context--small,
.c-usergroup__context.c-usergroup__not-in-channel-context--small {
  margin-left: .25rem;
  line-height: 0;
  white-space: nowrap
}

.c-member__frecency-score--small.frecency_score {
  order: 3
}

.c-member--dark .c-member__current-status,
.c-member--dark .c-member__current-status:before,
.c-member--dark .c-member__name,
.c-member--dark .c-member__secondary-name {
  color: #a0a0a2
}

.c-member--dark .c-member__display-name,
.c-member--dark .presence {
  color: #fff
}

.c-member--dark .team_image {
  margin-left: 10px
}

.c-member--medium {
  position: relative;
  align-items: center;
  font-size: 15px;
  color: #717274;
  font-weight: 400;
  height: 42px
}

.c-member__flex-container--medium {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.c-member__name--medium,
.c-member__title--medium {
  line-height: 1.1;
  word-break: break-word;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-bottom: 2px;
  padding-left: 12px;
  flex: 0 0 auto
}

.c-member__name--medium {
  font-size: 0
}

.c-member__display-name--medium,
.c-member__secondary-name--medium {
  font-size: 15px
}

.c-member__secondary-name--medium {
  color: #2c2d30
}

.c-member--medium .presence {
  color: #717274;
  margin: 0;
  width: 22px;
  height: 18px
}

.c-member--medium .presence .presence_icon {
  margin: 0 .25rem;
  font-size: 20px;
  line-height: .4;
  top: 0;
  left: -3px;
  position: relative
}

.c-member--medium .member_image {
  width: 36px;
  height: 36px
}

.c-member__display-name--medium,
.c-member__secondary-name--medium {
  line-height: 1.4;
  vertical-align: middle
}

.c-member__current-status--medium .emoji,
.c-member__current-status--medium .emoji-outer.emoji-sizer {
  margin-top: 0
}

.c-member--large {
  position: relative;
  font-size: 15px;
  color: #717274;
  font-weight: 400
}

.c-member__flex-container--large {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-height: 56px;
  overflow: hidden;
  text-overflow: ellipsis
}

.c-member__display-name--large,
.c-member__other-names--large,
.c-member__title--large {
  line-height: 18px;
  word-break: break-word;
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-left: 12px;
  flex: 0 0 auto
}

.c-member__title--large {
  white-space: pre-wrap
}

.c-member__display-name--large,
.c-member__title--large {
  color: #2c2d30
}

.c-member__other-names--large {
  color: #717274
}

.c-member__display-name--large {
  font-weight: 700
}

.c-member--large .member_image {
  width: 56px;
  height: 56px
}

.c-usergroup--small .c-usergroup__icon {
  background-color: #717274;
  color: #fff;
  text-align: center;
  line-height: 1.3
}

.c-usergroup--small .c-usergroup__icon:before {
  font-size: 1rem
}

.c-usergroup__not-in-channel-context--small {
  color: #717274;
  font-size: .7rem
}

@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

.ql-clipboard {
  top: -100000px
}

.ql-editor,
.ql-placeholder {
  padding: 9px 30px 9px 9px
}

.supports_custom_scrollbar .ql-editor,
.supports_custom_scrollbar .ql-placeholder {
  padding: 8px 30px 8px 9px
}

.ql-editor {
  tab-size: 8;
  -moz-tab-size: 8;
  font-variant-ligatures: none;
  line-height: 1.2rem;
  -webkit-user-select: text;
  overflow: auto;
  max-height: 10rem;
  max-width: 100%;
  min-height: 39px;
  margin-right: 2px;
  position: relative
}

.ql-editor::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.ql-editor::-webkit-scrollbar-thumb {
  background-color: rgba(113, 114, 116, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #717274;
  min-height: 36px
}

.ql-editor::-webkit-scrollbar-thumb:hover {
  background-color: rgba(113, 114, 116, .8)
}

.supports_custom_scrollbar .ql-container:not(.texty_single_line_input) .ql-editor {
  min-height: 21px
}

.ql-editor.ql-blank:before {
  display: none
}

.ql-editor.ql-blank~.ql-placeholder {
  display: block
}

.ql-placeholder {
  color: #000;
  opacity: .375;
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: none;
  font-style: normal;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  max-height: 100%
}

.ql-placeholder ::selection {
  background: 0 0
}

.supports_custom_scrollbar .ql-placeholder {
  min-height: 21px
}

.ql-container.texty_single_line_input .ql-editor,
.ql-container.texty_single_line_input .ql-placeholder {
  width: 100%;
  margin: 0;
  white-space: pre;
  overflow: hidden;
  padding: 0
}

.ql-container.texty_single_line_input .ql-editor {
  height: 19px;
  min-height: 19px;
  max-height: 19px
}

.inline_message_input_container {
  max-width: 100%
}

.inline_message_input_container .ql-editor {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text
}

.inline_message_input_container .ql-container {
  border: 1px solid #A0A0A2;
  font-family: Slack-Lato, appleLogo, sans-serif;
  height: auto;
  border-radius: .25rem
}

.inline_message_input_container .ql-container.focus,
.inline_message_input_container .ql-container:active,
.inline_message_input_container .ql-container:hover {
  border-color: #717274
}

.inline_message_input_container .ql-container~.emo_menu {
  width: 36px;
  right: 10px
}

#msg_input.ql-container {
  padding: 0 0 0 2.625rem;
  height: auto;
  max-height: none;
  min-height: 41px
}

.feature_texty_mentions #msg_input.ql-container~.msg_mentions_button {
  width: 30px;
  right: 38px
}

.feature_texty_mentions #msg_input.ql-container .ql-editor {
  padding-right: 78px
}

.supports_custom_scrollbar .feature_texty_mentions #msg_input.ql-container .ql-editor {
  padding-right: 66px
}

#msg_input.ql-container .ql-placeholder {
  left: 2.625rem;
  right: 30px
}

#message_edit_form .ql-container~.emo_menu,
#msg_form .ql-container~.emo_menu {
  width: 30px;
  right: 8px
}

.feature_texty_mentions #message_edit_form .ql-editor,
.feature_texty_mentions #message_edit_form .ql-placeholder,
.feature_texty_mentions #msg_form .ql-editor,
.feature_texty_mentions #msg_form .ql-placeholder {
  line-height: 1.46667
}

#message_edit_form .ql-editor,
#message_edit_form .ql-placeholder,
#msg_form .ql-editor,
#msg_form .ql-placeholder {
  padding-bottom: 9px;
  padding-top: 9px
}

#msg_edit_container .message_input {
  min-height: 0
}

#share_dialog_input_container #file_comment_textarea.ql-container {
  border: 1px solid #A0A0A2;
  border-radius: 4px;
  padding-right: 2px
}

#share_dialog_input_container #file_comment_textarea.ql-container .ql-editor {
  margin: 0
}

#share_dialog_input_container #file_comment_textarea.ql-container~.emo_menu {
  right: 32px
}

.supports_custom_scrollbar #share_dialog_input_container #file_comment_textarea.ql-container~.emo_menu {
  right: 16px
}

#share_dialog_input_container #file_comment_textarea.ql-container.focus,
#share_dialog_input_container #file_comment_textarea.ql-container:hover {
  border-color: #717274
}

#reply_container .inline_message_input_container .ql-editor {
  min-height: 34px;
  padding-bottom: 7px
}

#reply_container .inline_message_input_container .emo_menu {
  top: 1px
}

.reply_input_container .ql-container {
  background-color: #fff;
  border: 1px solid #E0E0E0;
  border-radius: 0 0 10px 10px
}

.reply_input_container .ql-container.focus,
.reply_input_container .ql-container:hover {
  border-color: #717274
}

.reply_input_container .ql-container.focus~.emo_menu {
  color: #717274
}

.reply_input_container .ql-container~.emo_menu {
  top: 0!important;
  color: #bbbdbf
}

.reply_input_container .ql-editor,
.reply_input_container .ql-placeholder {
  padding: 11px 30px 11px 13px
}

.supports_custom_scrollbar .reply_input_container .ql-editor,
.supports_custom_scrollbar .reply_input_container .ql-placeholder {
  padding: 10px 30px 10px 13px
}

.reply_input_container .ql-editor {
  margin-right: 2px;
  border: none
}

.reply_input_container .ql-editor::-webkit-scrollbar {
  position: absolute;
  -webkit-appearance: none;
  width: 6px
}

.reply_input_container .ql-editor::-webkit-scrollbar-thumb {
  background-color: rgba(113, 114, 116, .5);
  background-clip: padding-box!important;
  border-radius: 3px;
  color: #717274;
  min-height: 36px
}

.reply_input_container .ql-editor::-webkit-scrollbar-thumb:hover {
  background-color: rgba(113, 114, 116, .8)
}

#menu_member_dm_input.texty_single_line_input {
  width: 296px
}

#menu_member_dm_input.texty_single_line_input .ql-placeholder {
  padding: 10px .75rem
}

.supports_custom_scrollbar #menu_member_dm_input.texty_single_line_input .ql-placeholder {
  padding: 9px .75rem
}

.current_status_input_wrap .current_status_input.texty_single_line_input {
  padding-right: 33px;
  padding-left: 50px
}

.current_status_input_wrap .current_status_input.texty_single_line_input .ql-editor.ql-blank~.ql-placeholder {
  padding-right: 2.0625rem;
  padding-left: 3.125rem;
  padding-top: 0;
  padding-bottom: 0;
  margin: 0;
  height: 19px;
  min-height: 19px;
  top: .4rem
}

.current_status_input_wrap .current_status_input.texty_single_line_input p {
  line-height: normal;
  font-size: 15px
}

#current_status_for_team_menu.current_status_input.texty_single_line_input .ql-editor.ql-blank~.ql-placeholder {
  top: .5rem
}

.current_status_input_for_edit_profile .current_status_input.texty_single_line_input {
  padding-top: 12px;
  padding-bottom: 12px
}

.current_status_input_for_edit_profile .current_status_input.texty_single_line_input .ql-editor {
  height: 24px;
  min-height: 24px;
  max-height: 24px
}

.current_status_input_for_edit_profile .current_status_input.texty_single_line_input .ql-editor.ql-blank~.ql-placeholder {
  padding-left: 3.875rem;
  padding-right: 2.5rem;
  top: .75rem;
  bottom: .75rem;
  margin: 0;
  height: 24px;
  min-height: 24px
}

.current_status_input_for_edit_profile .current_status_input.texty_single_line_input p {
  font-size: 1.25rem
}

.current_status_input_for_edit_profile .current_status_input.texty_single_line_input .ql-editor.ql-blank:before {
  top: 3px
}

.ql-container.texty_single_line_input {
  background: #fff;
  font-family: Slack-Lato, appleLogo, sans-serif;
  font-size: .9375rem;
  color: #555459;
  border: 1px solid #A0A0A2;
  border-radius: .25rem;
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
  -webkit-appearance: none;
  outline: 0;
  padding: .45rem .75rem .5rem
}

.ql-container.texty_single_line_input.focus,
.ql-container.texty_single_line_input:hover {
  border-color: #717274;
  outline-offset: 0;
  outline: 0
}

.ql-container.texty_single_line_input .ql-editor {
  width: 100%;
  margin: 0;
  white-space: pre;
  overflow: hidden;
  padding: 0
}

#file_comment_textarea.texty_comment_input,
.comment_form .texty_comment_input,
.edit_comment_form .texty_comment_input {
  overflow: auto;
  height: auto;
  background: #fff;
  -webkit-user-select: auto;
  -moz-user-select: auto;
  -ms-user-select: auto;
  user-select: auto;
  font-family: Slack-Lato, appleLogo, sans-serif;
  width: 100%;
  border: 1px solid #A0A0A2;
  border-radius: .25rem;
  -webkit-appearance: none;
  box-shadow: none;
  outline: 0;
  resize: none!important;
  margin: 0 0 .5rem;
  font-size: 15px;
  line-height: 1.4;
  color: #3D3C40
}

.feature_texty_mentions #file_comment_textarea.texty_comment_input,
.feature_texty_mentions .comment_form .texty_comment_input,
.feature_texty_mentions .edit_comment_form .texty_comment_input {
  line-height: 1.46667
}

#file_comment_textarea.texty_comment_input.focus,
#file_comment_textarea.texty_comment_input:hover,
.comment_form .texty_comment_input.focus,
.comment_form .texty_comment_input:hover,
.edit_comment_form .texty_comment_input.focus,
.edit_comment_form .texty_comment_input:hover {
  border-color: #717274;
  outline-offset: 0;
  outline: 0
}

#file_comment_textarea.texty_comment_input .ql-editor,
.comment_form .texty_comment_input .ql-editor,
.edit_comment_form .texty_comment_input .ql-editor {
  max-height: none
}

#file_comment_textarea.texty_comment_input {
  max-height: none!important;
  overflow: visible;
  position: relative
}

#file_comment_textarea.texty_comment_input .ql-editor {
  min-height: 66px;
  max-height: 112px
}

#file_page .comment_form .texty_comment_input .ql-editor,
#post_page .comment_form .texty_comment_input .ql-editor {
  min-height: 102px
}

#channel_purpose_input.ql-container,
#purpose_input.ql-container {
  border: 1px solid #A0A0A2;
  border-radius: .25rem;
  font-family: Slack-Lato, appleLogo, sans-serif
}

#channel_purpose_input.ql-container.focus,
#channel_purpose_input.ql-container:hover,
#purpose_input.ql-container.focus,
#purpose_input.ql-container:hover {
  border-color: #717274
}

#channel_purpose_input.ql-container.small,
#purpose_input.ql-container.small {
  margin-bottom: .5rem;
  font-size: .9rem
}

#channel_purpose_input.ql-container.small .ql-editor,
#purpose_input.ql-container.small .ql-editor {
  padding: .5rem
}

#channel_purpose_input.ql-container.texty_single_line_input,
#purpose_input.ql-container.texty_single_line_input {
  font-size: 18px;
  margin-bottom: 0;
  padding: 0
}

#channel_purpose_input.ql-container.texty_single_line_input .ql-editor,
#purpose_input.ql-container.texty_single_line_input .ql-editor {
  min-height: 46px;
  padding: .75rem
}

#purpose_input.ql-container {
  height: 4.5rem;
  font-size: 1rem;
  width: 72%;
  margin: 0;
  display: inline-block;
  vertical-align: top
}

.channel_option_content #purpose_input.ql-container {
  width: 100%;
  margin-bottom: .5rem;
  display: block
}

.search_input.ql-container .ql-placeholder {
  margin-top: 1px
}

.feature_name_tagging_client .channel_topic_dialog .ql-editor {
  height: 6rem
}

#ts_tip_texty_tip {
  transition: all .1s;
  position: absolute;
  z-index: 1;
  opacity: 0
}
