import {nativeInterop} from '../native-interop';
import {history} from 'electron-windows-notifications';
import {getAppId} from '../utils/app-id';
import {logger} from '../logger';

const appId = getAppId();
const isWindows10OrHigher = nativeInterop.isWindows10OrHigher(true);

export function clearNotificationsForChannel(group) {
  if (process.platform !== 'win32') return null;
  if (!isWindows10OrHigher) return null;
  if (!group || group.length === 0) return null;

  try {
    return history.removeGroup({group, appId});
  } catch (err) {
    logger.error(`Unable to remove ${group} from Action Center: ${err.message}`);
    return false;
  }
}
