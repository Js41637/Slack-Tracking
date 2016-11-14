export const APP_USER_MODEL_ID_DEV = 'com.squirrel.slack.slack-dev';
export const APP_USER_MODEL_ID = 'com.squirrel.slack.slack';

let isDevBuild;

/**
 * Checks if the app is running in devMode and returns the appropriate
 * appId.
 *
 * @export
 * @returns {string} The current expected appId
 */
export function getAppId() {
  if (isDevBuild === undefined && global && global.loadSettings) {
    isDevBuild = !!global.loadSettings.devMode;
  } else if (isDevBuild === undefined && window && window.loadSettings) {
    isDevBuild = !!window.loadSettings.devMode;
  }

  return (isDevBuild) ? APP_USER_MODEL_ID_DEV : APP_USER_MODEL_ID;
}
