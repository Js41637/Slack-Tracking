/**
 * @module BrowserBehaviors
 */ /** for typedoc */

import { ReduxComponent } from '../../lib/redux-component';
import { Subscription } from 'rxjs/Subscription';

export interface WindowGeometrySetting {
  position: Array<number | undefined>;
  size: Array<number | undefined>;
}

export interface WindowSetting extends WindowGeometrySetting {
  isMaximized: boolean;
}

export abstract class WindowBehavior extends ReduxComponent<any> {
  public static isSupported(_platform: string): boolean {
    return true;
  }
  public abstract setup(hostWindow: Electron.BrowserWindow): Subscription;
}
