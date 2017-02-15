import { createDevTools, IDevTools } from 'redux-devtools';

const LogMonitor = require('redux-devtools-log-monitor').default; // tslint:disable-line
const DockMonitor = require('redux-devtools-dock-monitor').default; // tslint:disable-line

import * as devtron from 'devtron';

import * as React from 'react'; // tslint:disable-line

devtron.install();

const DevTools: IDevTools = createDevTools(
  <DockMonitor
    toggleVisibilityKey='ctrl-h'
    changePositionKey='ctrl-p'
  >
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);

export {
  DevTools
};
