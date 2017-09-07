import { logger } from '../logger';

export function shouldDisplayNotifications() {
  if (process.platform !== 'win32') {
    return true;
  }

  let notificationState = null;

  try {
    const { getNotificationState } = require('windows-notification-state');
    notificationState = getNotificationState();
  } catch (error) {
    logger.error('Tried to query notification state, but failed', error);
    return true;
  }

  // NB: The call can succeed but return an empty state.
  if (notificationState === '') return true;
  // Screensaver is running or machine is locked, who cares?
  if (notificationState === 'QUNS_NOT_PRESENT') return true;
  // All's good under the hood, boss
  if (notificationState === 'QUNS_ACCEPTS_NOTIFICATIONS') return true;
  // Windows Store app is running, who cares?
  if (notificationState === 'QUNS_APP') return true;

  logger.info(`Suppressing notification due to Presentation Mode: ${notificationState}`);
  return false;
}
