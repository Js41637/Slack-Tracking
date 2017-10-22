@font-face {
  font-family: appleLogo;
  src: local("Lucida Grande");
  unicode-range: U+F8FF
}

form .domain_input {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  -ms-flex-pack: end;
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  -moz-justify-content: flex-end;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden
}

form .domain_input #domain {
  flex-shrink: 10;
  flex-grow: 10;
  min-width: 150px
}

form .domain_input .domain {
  font-weight: 700;
  font-size: 1.3rem;
  flex-shrink: 0;
  flex-grow: 0
}

form .text_or {
  background: #fff;
  margin: -2.9rem auto 1.5rem;
  text-align: center;
  width: 3rem;
  color: #717274;
  font-size: 1rem
}

#magic_login_cta .or {
  display: table;
  width: 94%;
  margin: 0 auto
}

#magic_login_cta .or:after,
#magic_login_cta .or:before {
  border-top: 1px solid #e8e8e8;
  content: '';
  display: table-cell;
  position: relative;
  top: .8em;
  width: 45%
}

#magic_login_cta .or:before {
  right: 3%
}

#magic_login_cta .or:after {
  left: 3%
}

.taller_line_height {
  line-height: 2.25rem
}

@media only screen and (min-width:768px) {
  .signed_out_two_thirds_callout_box {
    max-width: 66.66%
  }
}
