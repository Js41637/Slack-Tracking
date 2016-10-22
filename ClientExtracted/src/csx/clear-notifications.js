import runScript from '../edge-loader';
import nativeInterop from '../native-interop';

export default function clearNotificationsForTeam(teamId) {
  if (process.platform !== 'win32') {
    return null;
  }

  if (!teamId || !teamId.match(/T[0-9A-Za-z]+/)) {
    return null;
  }

  return runScript({
    absolutePath: require.resolve('./clear-notifications.csx'),
    isSync: true,
    args: { teamId: teamId, isWin10: nativeInterop.isWindows10OrHigher() }
  });
}
