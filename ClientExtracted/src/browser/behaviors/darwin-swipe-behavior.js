import {Disposable} from 'rx';
import WindowBehavior from './window-behavior';
import AppActions from '../../actions/app-actions';

export default class DarwinSwipeBehavior extends WindowBehavior {
  /**
   * Attaches this behavior to the given window, which watches the Swipe gesture
   * on OS X. Note that you must configure Trackpad in System Preferences to "Swipe
   * with Two or Three Fingers" (cf. https://github.com/electron/electron/pull/4843)
   *
   * @param  {BrowserWindow} mainWindow The window to attach the behavior to
   * @return {Disposable}               A Disposable that will unsubscribe any listeners
   */
  setup(mainWindow) {
    let handler = (e, direction) => {
      switch(direction) {
      case 'left':
        AppActions.selectPreviousTeam();
        break;
      case 'right':
        AppActions.selectNextTeam();
        break;
      default:
        break;
      }
    };

    mainWindow.addListener('swipe', handler);
    return Disposable.create(() => mainWindow.removeListener('swipe', handler));
  }
}
