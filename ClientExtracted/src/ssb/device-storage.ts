import {executeJavaScriptMethod} from 'electron-remote';
import {remote} from 'electron';

export class DeviceStorage {
  private readonly wnd: Electron.BrowserWindow = remote.getCurrentWindow();

  public getItem(key: string): Promise<string> {
    return executeJavaScriptMethod(this.wnd, 'localStorage.getItem', `deviceStorage_${key}`);
  }

  public setItem(key: string, value: any): Promise<void> {
    return executeJavaScriptMethod(this.wnd, 'localStorage.setItem', `deviceStorage_${key}`, value);
  }

  public removeItem(key: string): Promise<void> {
    return executeJavaScriptMethod(this.wnd, 'localStorage.removeItem', `deviceStorage_${key}`);
  }
}
