/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';
import { nativeInterop } from '../native-interop';
import { getSetting } from './setting-store-helper';

export class SettingStore {
  public getSettings() {
    return Store.getState().settings;
  }

  public getSetting<T>(setting: string): T {
    return getSetting<T>(Store, setting);
  }
  public getSignInUrl(): string {
    return getSetting(Store, 'devEnv') ?
      `https://${getSetting(Store, 'devEnv')}.slack.com/signin` :
      'https://slack.com/signin';
  }

  public isWindows(): boolean {
    return getSetting(Store, 'platform') === 'win32';
  }

  public isMac(): boolean {
    return getSetting(Store, 'platform') === 'darwin';
  }

  public isLinux(): boolean {
    return getSetting(Store, 'platform') === 'linux';
  }

  // Hardware acceleration is only available on some platforms (Windows 7, 8,
  // and Linux) but defaults to true, so handle that case here
  public isUsingHardwareAcceleration(): boolean {
    const isAvailable = getSetting(Store, 'isBeforeWin10') || this.isLinux();
    return isAvailable ? getSetting<boolean>(Store, 'useHwAcceleration') : true;
  }

  public isShowingHtmlNotifications(): boolean {
    const isWin = this.isWindows();
    const isWin10 = nativeInterop.isWindows10OrHigher();
    const notificationMethod = getSetting(Store, 'notificationMethod');
    const isPreferred = notificationMethod === 'html';
    const isRejected = notificationMethod && notificationMethod !== 'html';
    const isHW = !!(isWin && this.isUsingHardwareAcceleration() && getSetting(Store, 'isAeroGlassEnabled'));

    // We will show html notifications if:
    // • You're on Windows 7, 8, 8.1 - and hardware acceleration is enabled
    //   and you haven't chosen something else
    // • You selected html notifications (notificationMethod) and transparent
    //   windows are available to you (either because you have hardware or
    //   because you're running something else than Windows)
    return (isWin && isHW && !isWin10 && !isRejected) || (isPreferred && (isHW || !isWin));
  }
}

const settingStore = new SettingStore();
export {
  settingStore
};
