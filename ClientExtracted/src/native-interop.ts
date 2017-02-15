import * as fs from 'graceful-fs';
import * as path from 'path';
import {spawn} from 'spawn-rx';
import {logger} from './logger';

//this is trick to load type definition only when loading module lazy via `require`
//unless imported modules are used as value types, TS won't generate corresponding javascript
//https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-imports-being-elided-in-my-emit
import _ref = require('ref');
import _refStruct = require('ref-struct');
import _refArray = require('ref-array');
import _ffi = require('ffi');

let ref: typeof _ref | null = null;
let refStruct: typeof _refStruct | null = null;
let refArray: typeof _refArray | null = null;
let ffi: typeof _ffi | null = null;
let getIdleTime: any = null;

let OSVERSIONINFO: any = null;
let pOSVERSIONINFO: _ref.Type | null = null;
let intPtr: _ref.Type | null = null;
let shell32: any = null;
let kernel32: any = null;

const globalScope: any = global || window;
let win10OrHigher: boolean | null = null;

export interface NativeInterop {
  shouldDisplayNotifications: () => boolean;
  getIdleTimeInMs: () => number;
  getOSVersion: () => {
    major: string;
    minor: string,
    build: string
  };
  is64BitOperatingSystem: () => boolean;
  isWindows10OrHigher: (dontLieToMe?: boolean) => boolean;
}

const setupWindowsLibs = () => {
  // NB: Work around atom/electron#4025 by delay-loading ref
  ref = ref! || require('ref');
  refStruct = refStruct! || require('ref-struct');
  refArray = refArray! || require('ref-array');
  ffi = ffi! || require('ffi');

  intPtr = intPtr || ref.refType(ref.types.int32);

  OSVERSIONINFO = OSVERSIONINFO || refStruct({
    dwOSVersionInfoSize: ref.types.uint32,
    dwMajorVersion: ref.types.uint32,
    dwMinorVersion: ref.types.uint32,
    dwBuildNumber: ref.types.uint32,
    dwPlatformId: ref.types.uint32,
    szCSDVersion: refArray(ref.types.byte, 128)
  });

  pOSVERSIONINFO = pOSVERSIONINFO || ref.refType(OSVERSIONINFO);

  shell32 = shell32 || ffi.Library('shell32', {
    SHQueryUserNotificationState: [ 'int', [ intPtr ] ]
  });

  kernel32 = kernel32 || ffi.Library('kernel32', {
    GetVersionExA: [ 'int', [ pOSVERSIONINFO ] ],
    GetLastError: [ 'uint32', [] ]
  });
};

const interop = {
  'win32': {

    shouldDisplayNotifications: () => {
      setupWindowsLibs();

      const outVal = ref!.alloc(intPtr!);
      const hr = shell32.SHQueryUserNotificationState(outVal);

      if (hr !== 0) {
        throw new Error(`Failed to query notification state, hr is 0x${hr.toString(16)}`);
      }

      const result = outVal[0];

      if (result === 0) return true;    // NB: The call can succeed but return an empty state.
      if (result === 1) return true;    // Screensaver is running or machine is locked, who cares?
      if (result === 5) return true;    // All's good under the hood, boss
      if (result === 7) return true;    // Windows Store app is running, who cares?

      logger.info(`Suppressing notification due to Presentation Mode: ${result}`);
      return false;
    },

    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require('@paulcbetts/system-idle-time').getIdleTime;
      return getIdleTime!();
    },

    getOSVersion: () => {
      setupWindowsLibs();

      const result = new OSVERSIONINFO();
      result.dwOSVersionInfoSize = OSVERSIONINFO.size;

      const failed = (kernel32.GetVersionExA(result.ref()) === 0);
      if (failed) {
        const gle = kernel32.GetLastError();
        throw new Error(`Failed to get version information: 0x${gle.toString(16)}`);
      }

      return {
        major: result.dwMajorVersion,
        minor: result.dwMinorVersion,
        build: result.dwBuildNumber
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

    // NB: The concept of presentation mode is not the same on OS X, and is
    // also quite a bit trickier to detect. We're just going to punt for now.
    shouldDisplayNotifications: () => true,

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

    shouldDisplayNotifications: () => {
      return true;
    },

    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require('@paulcbetts/system-idle-time').getIdleTime;
      return getIdleTime!();
    },

    // NB: We don't support running the 32-bit version on 64-bit OS's
    is64BitOperatingSystem: () => process.arch === 'x64',

    isWindows10OrHigher: () => false
  }
};

const nativeInterop: NativeInterop = interop[process.platform];
export {
  nativeInterop
}
