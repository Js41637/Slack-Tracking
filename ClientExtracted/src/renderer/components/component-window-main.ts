/**
 * @module RendererComponents
 */ /** for typedoc */

import * as ReactDOM from 'react-dom';
import { logger } from '../../logger';

import * as React from 'react'; // tslint:disable-line

const component = React.createElement(getComponent()!);
const host = global.document.createElement('span');
global.document.body.appendChild(host);
ReactDOM.render(component, host);

/**
 * Parses the loadSettings in the query paramter string, looking
 * for a previously set `component` property. Returns the React
 * component.
 *
 * @returns {React.Component} component;
 */
function getComponent(): React.ComponentClass<any> | null {
  if (window.location.search.includes('loadSettings=')) {
    try {
      const loadSettingsString = decodeURIComponent(window.location.search.slice(14));
      const loadSettings = JSON.parse(loadSettingsString);

      if (loadSettings && loadSettings.component) {
        (global.window as any).loadSettings = loadSettings;
        const componentModule = require(loadSettings.component);
        //supports named export via specifying named exported component in loadSettings.name
        const componentClass = componentModule['default'] || componentModule[loadSettings.name];

        if (!componentClass) {
          throw new Error(`loaded module ${loadSettings.name} does not contain any class to create`);
        }
        return componentClass;
      } else {
        throw new Error('Component Window: Could not find component in loadSettings');
      }
    } catch (e) {
      logger.error(`Component Window: Could not require component for component window: ${e.message}`);
    }
  } else {
    logger.warn('Component Window: window does not includes any loadSettings, skipping to create component.');
  }
  return null;
};
