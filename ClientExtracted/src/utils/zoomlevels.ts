/**
 * Transform our zoom level into one that matches Chromium, and assign it on
 * the given webContents or webView.
 *
 * @param {Electron.WebContents|Electron.WebViewElement} webContents  The webContents to set zoom
 * @param {Number}  zoomLevel                                         The Electron zoom level
 */
export function setZoomLevelAndLimits(webContents: Electron.WebContents|Electron.WebViewElement, zoomLevel: number): void {
  const factor = zoomLevelToFactor(zoomLevel);
  const level = zoomFactorToLevel(factor);

  (webContents as any).setLayoutZoomLevelLimits(level, level);
  webContents.setZoomLevel(level);
}

/**
 * Takes an Electron zoom level and turns it into a
 * standardized zoomFactor used for a11y.
 *
 * ⚠️ These are different from Electron's default levels
 *
 * @example
 * let zoomLevel = 3;
 * let zoomFactor = zoomLevelToFactor(zoomLevel);
 * let height = originalHeight * zoomFactor;
 *
 * @export
 * @param {Number} [level=0] - Zoom level to turn into factor
 * @returns {Number} factor - Zoom level as a factor
 */
export function zoomLevelToFactor(level: number = 0): number {
  if (!level || typeof level !== 'number' || level === 0 || level < -6 || level > 7) {
    return 1;
  }

  const positive = [1, 1.1, 1.25, 1.5];
  const negative = [1, .9, .8];

  return level > 0 ? positive[level] : negative[level * -1];
}

/**
 * Takes a zoom factor and turns it into a
 * Chromium zoom level.
 *
 * See https://cs.chromium.org/chromium/src/content/common/page_zoom.cc
 * for details, like: "Where the f*** does that Math.log(1.2)" come
 * from? Excellent question, dear wanderer. I'm not sure. But it's in
 * Chrome's source code, and it works, so we shall have it too.
 *
 * @param {number} [factor=1] Zoom factor to turn into level
 * @returns {number} level - Zoom factor as level
 */
export function zoomFactorToLevel(factor: number = 1): number {
  if (!factor || typeof factor !== 'number' || factor === 1) {
    return 0;
  }

  return Math.log(factor) / Math.log(1.2);
}
