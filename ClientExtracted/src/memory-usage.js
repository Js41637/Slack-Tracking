/**
 * @typedef MemoryStats
 * @property {Number} workingSetSize      Amount of memory allocated to actual physical RAM
 * @property {Number} peakWorkingSetSize  Maximum amount that has ever been allocated to physical RAM
 * @property {Number} privateBytes        Amount of memory not shared by other processes, such as JS heap or HTML content
 * @property {Number} sharedBytes         Amount of memory shared between processes, typically the Electron code itself
 */

/**
 * @typedef ResourceStats
 * @property {Number} count         Number of objects allocated
 * @property {Number} size          Size of all objects
 * @property {Number} liveSize      Size of those currently referenced
 * @property {Number} decodedSize   Size of decoded objects (only applies to images)
 * @property {Number} purgedSize    Size of all unreferenced objects
 * @property {Number} purgeableSize Size that can be unreferenced
 */

 /**
  * @typedef ResourceUsage
  * @property {ResourceStats} images          Stats on image resources
  * @property {ResourceStats} scripts         Stats on script resources
  * @property {ResourceStats} cssStyleSheets  Stats on cascading style sheets
  * @property {ResourceStats} xslStyleSheets  Stats on XSL style sheets
  * @property {ResourceStats} fonts           Stats on fonts
  * @property {ResourceStats} other           Stats on other resources
  */

/**
 * @typedef CombinedStats
 * @property {MemoryStats}    memory    Information about allocated memory
 * @property {ResourceUsage}  resources Information about in-memory resources, if a renderer process
 */

/**
 * Returns information about the current process' memory and resource usage.
 *
 * @return {CombinedStats}  The stats object
 */
export function getMemoryUsage() {
  let stats = {
    memory: process.getProcessMemoryInfo()
  };

  if (process.type === 'renderer') {
    const webFrame = require('electron').webFrame;
    Object.assign(stats, {
      resources: webFrame.getResourceUsage()
    });
  }

  return stats;
}
