import React from 'react';
import ReactDOM from 'react-dom';
import AboutBox from './about-box';

let aboutBox = React.createElement(AboutBox);
let host = global.document.createElement('span');
global.document.body.appendChild(host);
ReactDOM.render(aboutBox, host);
