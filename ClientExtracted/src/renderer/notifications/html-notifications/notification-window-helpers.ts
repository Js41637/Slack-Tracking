/**
 * @module Notifications
 */ /** for typedoc */

export const NOTIFICATION_SIZE = { width: 375, height: 88 };
export const MAX_NOTIFICATIONS = 3;

import { screen as Screen } from 'electron';
import { NotifyPosition } from '../interfaces';

export class NotificationWindowHelpers {
  public static showPositionedNotificationWindow(wnd: Electron.BrowserWindow,
                                                 mainWindow: Electron.BrowserWindow,
                                                 zoomLevel: number,
                                                 notifyPosition: NotifyPosition) {
    // NB: Each zoom level corresponds to a 20% change
    const scaleFactor = 1 + (zoomLevel * 0.2);

    const options = {
      // Scale notifications according to the current zoom level
      size: {
        width: Math.round(NOTIFICATION_SIZE.width * scaleFactor),
        height: Math.round(NOTIFICATION_SIZE.height * scaleFactor)
      },
      screenPosition: notifyPosition,
      maxCount: MAX_NOTIFICATIONS,
      parent: mainWindow,
      screenApi: Screen
    };

    const coords = NotificationWindowHelpers.calculateHostCoordinates(options);

    wnd.setPosition(coords.x, coords.y);
    wnd.setSize(coords.width, coords.height);
    wnd.showInactive();
  }

  /**
   * Calculates the size and position of the host window.
   *
   * @param  {Object} options
   * @param  {Object} options.size  The size of individual notifications
   * @param  {Object} options.parent  The parent window
   * @param  {Object} options.screenPosition  Determines where notifications appear
   * @param  {Object} options.maxCount  The maximum number of notifications to display
   * @param  {Object} options.screenApi  Used to retrieve display information
   * @return {Object}         An object containining size and position
   */
  public static calculateHostCoordinates(options: {
    size: Electron.Size;
    parent: Electron.BrowserWindow;
    screenPosition: NotifyPosition;
    maxCount: number;
    screenApi: Electron.Screen;
  }): Electron.Rectangle {
    const { size, parent, maxCount, screenApi } = options;
    let screenPosition = options.screenPosition;
    screenPosition = screenPosition || { corner: 'bottom_right', display: 'same_as_app' };

    const display = NotificationWindowHelpers.getDisplayForHost(parent, screenPosition, screenApi);
    const bounds = display.workArea;

    // We don't resize the window dynamically, so pick a height that will fit
    // one more than our maximum number of notifications (if there are already
    // maxCount notifications and one is leaving while another is being added,
    // until the leaving element collapses there will be maxCount + 1 notifications)
    const targetHeight = (maxCount + 1) * size.height;

    // In multi-monitor scenarios, `workArea` can contain negative coordinates.
    // Be sure to add x or y to the height or width.
    let targetX = Number.NaN, targetY = Number.NaN;

    switch (screenPosition.corner) {
    case 'top_left':
      targetX = bounds.x;
      targetY = bounds.y;
      break;
    case 'top_right':
      targetX = bounds.x + bounds.width - size.width;
      targetY = bounds.y;
      break;
    case 'bottom_left':
      targetX = bounds.x;
      targetY = bounds.y + bounds.height - targetHeight;
      break;
    case 'bottom_right':
      targetX = bounds.x + bounds.width - size.width;
      targetY = bounds.y + bounds.height - targetHeight;
      break;
    }

    return {
      x: targetX!,
      y: targetY!,
      width: NotificationWindowHelpers.ensureEven(size.width),
      height: NotificationWindowHelpers.ensureEven(targetHeight)
    };
  }

  /**
   * Returns the display that notifications should be positioned on, based on
   * the `screenPosition.display` preference.
   *
   * @param  {BrowserWindow} parent   The parent window
   * @param  {Object} screenPosition  Determines where notifications appear
   * @param  {Screen} screenApi       Used to retrieve display information
   * @return {Object}                 A display object
   */
  public static getDisplayForHost(parent: Electron.BrowserWindow, screenPosition: NotifyPosition = {} as any, screenApi: Electron.Screen) {
    switch (screenPosition.display) {
    case 'same_as_app': {
      // NB: Pick the display based on the center point of the main window.
      // The top-left can be negative for maximized windows.
      const position = parent.getPosition();
      const windowSize = parent.getSize();
      const centerPoint = {
        x: Math.round(position[0] + windowSize[0] / 2.0),
        y: Math.round(position[1] + windowSize[1] / 2.0)
      };

      const sameDisplayAsApp = screenApi.getDisplayNearestPoint(centerPoint);
      return sameDisplayAsApp || screenApi.getPrimaryDisplay();
    }
    default:
      return screenApi.getPrimaryDisplay();
    }
  }

  /**
   * Ensures that the given number is even. Electron transparent windows have
   * rendering glitches when the window size is odd. Refer to
   * https://github.com/atom/electron/issues/1366.
   */
  private static ensureEven(value: number): number {
    return (value % 2 === 0) ? value : value + 1;
  }
}
