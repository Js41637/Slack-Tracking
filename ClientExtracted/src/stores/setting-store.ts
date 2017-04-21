/**
 * @module Stores
 */ /** for typedoc */

import { nativeInterop } from '../native-interop';
import { Store } from '../lib/store';

export class SettingStore {
  public getSettings() {
    return Store.getState().settings;
  }

  public getSetting<T>(setting: string): T {
    const settings = this.getSettings();

    if (settings[setting] === undefined) {
      throw new Error(`Setting ${setting} does not exist.  Check for existence in SettingStore as well as in the update shape in WindowStore`);
    }
    return settings[setting];
  }

  public getSignInUrl(): string {
    return this.getSetting('devEnv') ?
      `https://${this.getSetting('devEnv')}.slack.com/signin` :
      'https://slack.com/signin';
  }

  public isWindows(): boolean {
    return this.getSetting('platform') === 'win32';
  }

  public isMac(): boolean {
    return this.getSetting('platform') === 'darwin';
  }

  public isLinux(): boolean {
    return this.getSetting('platform') === 'linux';
  }

  // Hardware acceleration is only available on some platforms (Windows 7, 8,
  // and Linux) but defaults to true, so handle that case here
  public isUsingHardwareAcceleration(): boolean {
    const isAvailable = this.getSetting('isBeforeWin10') || this.isLinux();
    return isAvailable ? this.getSetting<boolean>('useHwAcceleration') : true;
  }

  public isShowingHtmlNotifications(): boolean {
    return this.isWindows() &&
      this.isUsingHardwareAcceleration() &&
      this.getSetting('isAeroGlassEnabled') &&
      !nativeInterop.isWindows10OrHigher();
  }
}

const settingStore = new SettingStore();
export {
  settingStore
}
