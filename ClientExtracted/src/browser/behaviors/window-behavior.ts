import ReduxComponent from '../../lib/redux-component';
import {Subscription} from 'rxjs/Subscription';

export interface WindowGeometrySetting {
  position: Array<number | undefined>;
  size: Array<number | undefined>;
}

export interface WindowSetting extends WindowGeometrySetting {
  isMaximized: boolean;
}

export interface Region {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export abstract class WindowBehavior extends ReduxComponent {
  public abstract setup(hostWindow: Electron.BrowserWindow): Subscription;
}
