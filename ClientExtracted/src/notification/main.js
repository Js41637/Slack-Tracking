import React from 'react';
import ReactDOM from 'react-dom';
import '../rx-operators';
import NotificationHost from './notification-host.jsx';

// Rendering directly into document.body is discouraged due to third-party scripts
// and browser extensions frequently manipulating it

let reactHost = React.createElement(NotificationHost);
let rootSpan = global.document.createElement('span');
global.document.body.appendChild(rootSpan);
ReactDOM.render(reactHost, rootSpan);
