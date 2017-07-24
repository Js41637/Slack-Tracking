/**
 * @module UserAgent
 */ /** for typedoc */

import * as os from 'os';
import { version } from '../package.json';
import { LinuxSettings } from './browser/application';
import { nativeInterop } from './native-interop';
import { settingStore } from './stores/setting-store';
import { IS_WINDOWS_STORE } from './utils/shared-constants';
const { isWindows10OrHigher, getOSVersion } = nativeInterop;

// NB: This must be the last segment of the user agent.
const userAgentLastSegment = `Slack_SSB/${version.split('-')[0]}`;

// From http://www.ietf.org/rfc/rfc2616.txt
const httpSeparators = /[()<>@,;:\\<>\/\[\]?={}\t\n\r]/g;
let cachedUserAgent = '';

function getLinuxUserAgentSegment(): string {
    let { os: osName, release } = settingStore.getSetting<LinuxSettings>('linux');
    let linuxUserAgentSegment = '';

    // Make sure we don't bork the useragent string
    osName = osName.replace(httpSeparators, '');
    release = release.replace(httpSeparators, '');

    if (!osName || !release) return '';
    linuxUserAgentSegment += `; ${osName} ${release}`;

    let desktopEnvironment = process.env.XDG_CURRENT_DESKTOP;

    if (desktopEnvironment) {
      desktopEnvironment = desktopEnvironment.replace(httpSeparators, '');
      linuxUserAgentSegment += `; ${desktopEnvironment}`;
    }

    return linuxUserAgentSegment;
}

export function getUserAgent(inputUserAgent?: string): string {
  if (cachedUserAgent) return cachedUserAgent;

  const agent = inputUserAgent || global.navigator.userAgent;

  // NB: We used to pass AtomShell as part of the user agent, but now it's
  // the productName, which is unfortunately also Slack. For sanity's sake,
  // we're going to just patch this for now back to AtomShell.
  let userAgent = agent.replace(/(Slack|Electron)\/([\d\.]+) /, 'AtomShell/$2 ');

  if (process.platform === 'win32') {
    const { major, minor, build } = getOSVersion();
    const versionString = `${major}.${minor}.${build}`;

    // Keep track of Windows Store versions
    if (IS_WINDOWS_STORE) {
      userAgent += ` WindowsStore/${versionString}`;
    }

    // Patch up the agent to avoid Windows 10 version lie
    if (isWindows10OrHigher()) {
      userAgent = userAgent.replace(/Windows NT [0-9]\.[0-9]/, `Windows NT ${versionString}`);
    }
  }

  if (process.platform === 'darwin' && process.mas) {
    userAgent += ` MacAppStore/${os.release()}`;
  }

  if (process.platform === 'linux') {
    const userAgentFirstSegment = /^Mozilla[^\)]+/;
    userAgent = userAgent.replace(userAgentFirstSegment, `$&${getLinuxUserAgentSegment()}`);
  }

  cachedUserAgent = `${userAgent} ${userAgentLastSegment}`;
  return cachedUserAgent;
}
