import logger from '../logger';
import {remote} from 'electron';

const {BrowserWindow} = remote;

/**
 * Overrides `window.open` to use our `WindowApi` for certain URLs. This
 * gives us finer-grained control over those window interactions and is
 * necessary for some integrations.
 *
 * @param  {Function} overrideMethod  A method that will create a popup window
 * @return {BrowserWindow}            The new BrowserWindow
 */
export default function overrideWindowOpen(overrideMethod) {
  // NB: Save off the original `window.open` for the default behavior
  let windowDotOpen = window.open;

  window.open = (url, frameName, features) => {
    logger.info(`Got window.open with URL: ${url}`);

    // NB: This is a white-list that looks for certain third-party URLs
    // (e.g., Dropbox, Box)
    if (window.TSSSB.canUrlBeOpenedInSSBWindow(url)) {
      let windowCoords = getCoordinatesFromFeatures(features);
      let options = {
        url: url,
        x: windowCoords.left,
        y: windowCoords.top,
        width: windowCoords.width,
        height: windowCoords.height
      };

      let token = overrideMethod(options);
      let browserWindow = BrowserWindow.fromId(token);

      // NB: Box holds a reference to the created window and looks for a
      // `closed` flag. Without it, it will try to reuse the same instance.
      browserWindow.once('close', () => {
        try {
          browserWindow.closed = true;
        } catch (e) { // eslint-disable-line
        }
      });

      // NB: When the web-view goes away, the connection to this window will be
      // severed, so just close it out.
      window.addEventListener('beforeunload', () => {
        browserWindow.close();
      });

      return browserWindow;
    } else {
      return windowDotOpen(url, frameName, features);
    }
  };
}

/**
 * Extracts window size and position from a string.
 *
 * @param  {String} features  Additional information passed to `window.open`,
 * e.g., "width=660,height=440,left=-1212.5,top=197.5"
 *
 * @return {Object}
 * @return {Object}.left    The x position of the window
 * @return {Object}.top     The y position of the window
 * @return {Object}.width   The width of the window
 * @return {Object}.height  The height of the window
 */
function getCoordinatesFromFeatures(features) {
  if (!features || features === '') return {};

  let params = features.split(',');
  if (params.length === 1) return {};

  let result = {};
  let desiredKeys = ['left', 'top', 'width', 'height'];

  for (let param of params) {
    let expression = param.split('=');
    if (desiredKeys.indexOf(expression[0]) > -1) {
      result[expression[0]] = parseInt(expression[1]);
    }
  }
  return result;
}
