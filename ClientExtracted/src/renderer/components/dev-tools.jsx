import React from 'react';

import { createDevTools } from 'redux-devtools';

import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

import devtron from 'devtron';

devtron.install();

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h'
               changePositionKey='ctrl-p'>
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);

export default DevTools;
