/**
 * @module Browser
 */ /** for typedoc */

/**
 * Interfaces to windowCreator instance,
 * physically separated to avoid circular module references
 *
 */
export interface WindowCreatorBase {
  createMainWindow(params: any): Electron.BrowserWindow;
  createAboutWindow(): Electron.BrowserWindow;
  createNotificationsWindow(): Electron.BrowserWindow;
}
