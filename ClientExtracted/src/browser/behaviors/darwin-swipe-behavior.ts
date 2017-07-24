/**
 * @module BrowserBehaviors
 */ /** for typedoc */

import { Subscription } from 'rxjs/Subscription';
import { appTeamsActions } from '../../actions/app-teams-actions';
import { WindowBehavior } from './window-behavior';

export class DarwinSwipeBehavior extends WindowBehavior {
  public static isSupported(platform: string): boolean {
    return platform === 'darwin';
  }
  /**
   * Attaches this behavior to the given window, which watches the Swipe gesture
   * on OS X. Note that you must configure Trackpad in System Preferences to "Swipe
   * with Two or Three Fingers" (cf. https://github.com/electron/electron/pull/4843)
   *
   * @param  {BrowserWindow} mainWindow The window to attach the behavior to
   * @return {Subscription}               A Subscription that will unsubscribe any listeners
   */
  public setup(mainWindow: Electron.BrowserWindow): Subscription {
    const handler = (_e: Event, direction: string) => {
      switch (direction) {
      case 'left':
        appTeamsActions.selectPreviousTeam();
        break;
      case 'right':
        appTeamsActions.selectNextTeam();
        break;
      default:
        break;
      }
    };

    mainWindow.addListener('swipe', handler);
    return new Subscription(() => mainWindow.removeListener('swipe', handler));
  }
}
