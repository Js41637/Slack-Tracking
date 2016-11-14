/**
 * Takes an Electron zoom level and turns it into a
 * standardized zoomFactor used for a11y.
 *
 * @example
 * let zoomLevel = 3;
 * let zoomFactor = zoomLevelToFactor(zoomLevel);
 * let height = originalHeight * zoomFactor;
 *
 * @export
 * @param {Number} level - Zoom level
 * @returns {Number} factor - Zoom level as a factor
 */
export default function zoomLevelToFactor(level = 0) {
  if (!level || typeof level !== 'number' || level === 0 || level < -6 || level > 7) {
    return 1;
  }

  const positive = [1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
  const negative = [1, .9, .75, .67, .5, .33, .25];

  return (level > 0) ? positive[level] : negative[level * -1];
}
