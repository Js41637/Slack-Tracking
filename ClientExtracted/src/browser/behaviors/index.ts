import {DarwinSwipeBehavior} from './darwin-swipe-behavior';
import {MainWindowCloseBehavior} from './main-window-close-behavior';
import {RepositionWindowBehavior} from './reposition-window-behavior';
import {PersistSettingsWindowBehavior} from './persist-settings-window-behavior';

const behaviors = [MainWindowCloseBehavior,
                   RepositionWindowBehavior,
                   PersistSettingsWindowBehavior,
                   DarwinSwipeBehavior];
export {
  behaviors
}