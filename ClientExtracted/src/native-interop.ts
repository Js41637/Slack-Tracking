/**
 * @module NativeInterop
 */ /** for typedoc */

import * as fs from 'graceful-fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'spawn-rx';

import { logger } from './logger';

const globalScope: any = global || window;
let win10OrHigher: boolean | null = null;
let getIdleTime: any = null;

export interface NativeInterop {
  getIdleTimeInMs: () => number;
  getOSVersion: () => {
    major: string;
    minor: string,
    build: string
  };
  is64BitOperatingSystem: () => boolean;
  isWindows10OrHigher: (dontLieToMe?: boolean) => boolean;
}

export const interops = {
  win32: {
    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require('@paulcbetts/system-idle-time').getIdleTime;
      return getIdleTime!();
    },

    getOSVersion: (passedRelease?: string) => {
      const release = passedRelease || os.release() || '';
      const versionMatcher = /(\d{1,2})\.(\d{1,2})\.(\d{1,6})/;
      const result = release.match(versionMatcher);

      if (!result || result.length < 4) {
        logger.error(`Tried to query the OS version, but failed. Data might be incomplete.`);
      }

      return {
        major: result && result[1] ? result[1] : null,
        minor: result && result[2] ? result[2] : null,
        build: result && result[3] ? result[3] : null
      };
    },

    is64BitOperatingSystem: () => {
      if (process.arch === 'x64') return true;

      let sysRoot = 'C:\\Windows';
      if (fs.statSyncNoException(process.env.SYSTEMROOT || 'C:\\__nothere__')) {
        sysRoot = process.env.SYSTEMROOT;
      }

      // If %SystemRoot%\SysNative exists, we are in a WOW64 FS Redirected application.
      return !!fs.statSyncNoException(path.join(sysRoot, 'sysnative'));
    },

    isWindows10OrHigher: (dontLieToMe= false) => {
      if (win10OrHigher || win10OrHigher === false) return win10OrHigher;

      if (globalScope.loadSettings && globalScope.loadSettings.pretendNotReallyWindows10 && !dontLieToMe) {
        win10OrHigher = false;
        return false;
      }

      // NB: Yes, this is the wrong way to do this. Yes, I don't care.
      let sysRoot = 'C:\\Windows';
      if (fs.statSyncNoException(process.env.SYSTEMROOT || 'C:\\__nothere__')) {
        sysRoot = process.env.SYSTEMROOT;
      }

      const is64BitOS = !!fs.statSyncNoException(path.join(sysRoot, 'sysnative'));
      win10OrHigher = !!fs.statSyncNoException(path.join(sysRoot, is64BitOS ? 'SysNative' : 'System32', 'win32kbase.sys'));
      return win10OrHigher;
    }
  },

  darwin: {
    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require('@paulcbetts/system-idle-time').getIdleTime;
      return getIdleTime!();
    },

    getOSVersion: async function() {
      let macOSVersion: string;
      try {
        macOSVersion = await spawn('sw_vers', ['-productVersion']).toPromise();
      } catch (e) {
        logger.error(e);

        // Things have gotten really weird indeed
        macOSVersion = '0.0.0';
      }
      const [major, minor, build] = macOSVersion.split('.').map((v) => v.trim());

      /* tslint:disable */
      return {
        major,

        // NB: Apparently for new (minor) versions of macOS, Apple doesn't
        // include build numbers, so we have to account for it here. Minor
        // version is just a precaution for whenever macOS 11 happens.
        minor: minor || '0',
        build: build || '0'
      };
      /* tslint:enable */
    },

    // NB: OS X is always 64-bit
    is64BitOperatingSystem: () => true,

    isWindows10OrHigher: () => false
  },

  linux: {
    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require('@paulcbetts/system-idle-time').getIdleTime;
      return getIdleTime!();
    },

    // NB: We don't support running the 32-bit version on 64-bit OS's
    is64BitOperatingSystem: () => process.arch === 'x64',

    isWindows10OrHigher: () => false
  }
};

const nativeInterop: NativeInterop = interops[process.platform];
export {
  nativeInterop
}
;