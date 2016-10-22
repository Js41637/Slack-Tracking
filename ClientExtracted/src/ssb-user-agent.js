import {version} from '../package.json';
import {isWindows10OrHigher, getOSVersion} from './native-interop';

export default function returnSSBUserAgent(inputUserAgent=null) {
  let agent = inputUserAgent || global.navigator.userAgent;
  if (agent.match(/Slack_SSB/)) {
    return agent;
  }

  // NB: We used to pass AtomShell as part of the user agent, but now it's
  // the productName, which is unfortunately also Slack. For sanity's sake,
  // we're going to just patch this for now back to AtomShell.
  let userAgent = agent.replace(/(Slack|Electron)\/([\d\.]+) /, 'AtomShell/$2 ');

  if (process.platform === 'win32') {
    let {major, minor, build} = getOSVersion();
    let versionString = `${major}.${minor}.${build}`;

    // Keep track of Windows Store versions
    if (process.windowsStore) {
      userAgent += ` WindowsStore/${versionString}`;
    }

    // Patch up the agent to avoid Windows 10 version lie
    if (isWindows10OrHigher()) {
      userAgent = userAgent.replace(/Windows NT [0-9]\.[0-9]/, `Windows NT ${versionString}`);
    }
  }

  // NB: This must be the last segment of the user agent.
  userAgent += ` Slack_SSB/${version.split('-')[0]}`;
  return userAgent;
}
