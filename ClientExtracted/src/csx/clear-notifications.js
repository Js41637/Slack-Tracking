import runScript from '../edge-loader';
import nativeInterop from '../native-interop';

export default function clearNotificationsForChannel(channelId) {
  if (process.platform !== 'win32') {
    return null;
  }

  if (!channelId || channelId.length === 0) {
    return null;
  }

  return runScript({
    absolutePath: require.resolve('./clear-notifications.csx'),
    isSync: true,
    args: { channelId, isWin10: nativeInterop.isWindows10OrHigher() }
  });
}
