/**
 * @module Notifications
 */ /** for typedoc */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../../../rx-operators';
import { NotificationHost } from './notification-host';

// Rendering directly into document.body is discouraged due to third-party scripts
// and browser extensions frequently manipulating it

const reactHost = React.createElement(NotificationHost);
const rootSpan = global.document.createElement('span');
global.document.body.appendChild(rootSpan);
ReactDOM.render(reactHost, rootSpan);
