import {executeJavaScriptMethod} from 'electron-remote';
import {remote} from 'electron';

export default class DeviceStorage {
  constructor() {
    this.wnd = remote.getCurrentWindow();
  }

  getItem(key) {
    return executeJavaScriptMethod(this.wnd, 'localStorage.getItem', `deviceStorage_${key}`);
  }

  setItem(key, value) {
    return executeJavaScriptMethod(this.wnd, 'localStorage.setItem', `deviceStorage_${key}`, value);
  }

  removeItem(key) {
    return executeJavaScriptMethod(this.wnd, 'localStorage.removeItem', `deviceStorage_${key}`);
  }
}
