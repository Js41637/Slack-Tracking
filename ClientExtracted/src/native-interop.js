import fs from 'fs';
import path from 'path';
import logger from './logger';

let ref = null;
let refStruct = null;
let refArray = null;
let ffi = null;
let getIdleTime = null;

var OSVERSIONINFO = null;
var pOSVERSIONINFO = null;
let intPtr = null;
let shell32 = null;
let kernel32 = null;

let globalScope = global || window;
let win10OrHigher = null;

let setupWindowsLibs = () => {
  // NB: Work around atom/electron#4025 by delay-loading ref
  ref = ref || require('ref');
  refStruct = refStruct || require('ref-struct');
  refArray = refArray || require('ref-array');
  ffi = ffi || require('ffi');

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
    'SHQueryUserNotificationState': [ 'int', [ intPtr ] ]
  });

  kernel32 = kernel32 || ffi.Library('kernel32', {
    'GetVersionExA': [ 'int', [ pOSVERSIONINFO ] ],
    'GetLastError': [ 'uint32', [] ]
  });
};

exports = {
  'win32': {

    shouldDisplayNotifications: () => {
      setupWindowsLibs();

      let outVal = ref.alloc(intPtr);
      let hr = shell32.SHQueryUserNotificationState(outVal);

      if (hr !== 0) {
        throw new Error(`Failed to query notification state, hr is 0x${hr.toString(16)}`);
      }

      let result = outVal[0];

      // https://msdn.microsoft.com/en-us/library/windows/desktop/bb762533(v=vs.85).aspx
      console.log(`SHQueryUserNotificationState: ${result}`);

      if (result === 0) return true;    // NB: The call can succeed but return an empty state.
      if (result === 1) return true;    // Screensaver is running or machine is locked, who cares?
      if (result === 5) return true;    // All's good under the hood, boss
      if (result === 7) return true;    // Windows Store app is running, who cares?

      logger.info(`Not displaying notifications due to ${result}`);
      return false;
    },

    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require("@paulcbetts/system-idle-time").getIdleTime;
      return getIdleTime();
    },

    getOSVersion: () => {
      setupWindowsLibs();

      let result = new OSVERSIONINFO();
      result.dwOSVersionInfoSize = OSVERSIONINFO.size;

      let failed = (kernel32.GetVersionExA(result.ref()) === 0);
      if (failed) {
        let gle = kernel32.GetLastError();
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

    isWindows10OrHigher: (dontLieToMe=false) => {
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

      let is64BitOS = !!fs.statSyncNoException(path.join(sysRoot, 'sysnative'));
      win10OrHigher = !!fs.statSyncNoException(path.join(sysRoot, is64BitOS ? 'SysNative' : 'System32', 'win32kbase.sys'));
      return win10OrHigher;
    }
  },

  'darwin': {

    // NB: The concept of presentation mode is not the same on OS X, and is
    // also quite a bit trickier to detect. We're just going to punt for now.
    shouldDisplayNotifications: () => true,

    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require("@paulcbetts/system-idle-time").getIdleTime;
      return getIdleTime();
    },

    // NB: OS X is always 64-bit
    is64BitOperatingSystem: () => true,

    isWindows10OrHigher: () => false
  },

  'linux': {

    shouldDisplayNotifications: () => {
      return true;
    },

    getIdleTimeInMs: () => {
      getIdleTime = getIdleTime || require("@paulcbetts/system-idle-time").getIdleTime;
      return getIdleTime();
    },

    // NB: We don't support running the 32-bit version on 64-bit OS's
    is64BitOperatingSystem: () => process.arch === 'x64',

    isWindows10OrHigher: () => false
  }
};

module.exports = exports[process.platform];
