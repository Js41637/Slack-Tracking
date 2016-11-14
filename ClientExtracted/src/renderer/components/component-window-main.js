import React from 'react';
import ReactDOM from 'react-dom';
import logger from '../../logger';

let component = React.createElement(getComponent());
let host = global.document.createElement('span');
global.document.body.appendChild(host);
ReactDOM.render(component, host);

/**
 * Parses the loadSettings in the query paramter string, looking
 * for a previously set `component` property. Returns the React
 * component.
 *
 * @returns {React.Component} component;
 */
function getComponent() {
  if (window.location.search.includes('loadSettings=')) {
    try {
      const loadSettingsString = decodeURIComponent(window.location.search.slice(14));
      const loadSettings = JSON.parse(loadSettingsString);

      if (loadSettings && loadSettings.component) {
        global.window.loadSettings = loadSettings;
        return require(loadSettings.component).default;
      } else {
        throw new Error('Component Window: Could not find component in loadSettings');
      }
    } catch (e) {
      logger.error(`Component Window: Could not require component for component window: ${e.message}`);
    }
  }
}
