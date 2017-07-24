/**
 * @module BrowserBehaviors
 */ /** for typedoc */

import { DarwinSwipeBehavior } from './darwin-swipe-behavior';
import { MainWindowCloseBehavior } from './main-window-close-behavior';
import { PersistSettingsWindowBehavior } from './persist-settings-window-behavior';
import { RepositionWindowBehavior } from './reposition-window-behavior';

const behaviors = [MainWindowCloseBehavior,
                   RepositionWindowBehavior,
                   PersistSettingsWindowBehavior,
                   DarwinSwipeBehavior];
export {
  behaviors
};
