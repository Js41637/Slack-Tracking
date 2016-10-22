import nativeInterop from '../native-interop';
import Store from '../lib/store';

const {systemPreferences} = process.type === 'browser' ?
  require('electron') :
  require('electron').remote;

class SettingStore {
  getSettings() {
    return Store.getState().settings;
  }

  getSetting(setting) {
    let settings = this.getSettings();

    if (settings[setting] === undefined) {
      throw new Error(`Setting ${setting} does not exist.  Check for existence in SettingStore as well as in the update shape in WindowStore`);
    }
    return settings[setting];
  }

  getSignInUrl() {
    return this.getSetting('devEnv') ?
      `https://${this.getSetting('devEnv')}.slack.com/signin` :
      'https://slack.com/signin';
  }

  isWindows() {
    return this.getSetting('platform') === 'win32';
  }

  isMac() {
    return this.getSetting('platform') === 'darwin';
  }

  isLinux() {
    return this.getSetting('platform') === 'linux';
  }

  // Hardware acceleration is only available on some platforms (Windows 7, 8,
  // and Linux) but defaults to true, so handle that case here
  isUsingHardwareAcceleration() {
    let isAvailable = this.getSetting('isBeforeWin10') || this.isLinux();
    return isAvailable ? this.getSetting('useHwAcceleration') : true;
  }

  isShowingHtmlNotifications() {
    return this.isWindows() &&
      this.isUsingHardwareAcceleration() &&
      systemPreferences.isAeroGlassEnabled() &&
      !nativeInterop.isWindows10OrHigher();
  }
}

export default new SettingStore();
