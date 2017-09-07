/**
 * @module SSBIntegration
 */ /** for typedoc */

import { ipcRenderer, remote, webFrame } from 'electron';
import { executeJavaScriptMethod } from 'electron-remote';
import { WindowSetting } from '../browser/behaviors/window-behavior';

import { Observable } from 'rxjs/Observable';
import { logger } from '../logger';
import { CombinedStats, getMemoryUsage } from '../memory-usage';
import { windowFrameStore } from '../stores/window-frame-store';
import { StopTraceResponse, TRACE_RECORD_CHANNEL, TraceRecordOptions, TraceResponse, defaultTraceCategories } from '../utils/shared-constants';
import { getInstanceUuid, getSessionId } from '../uuid';

/**
 * Provides interfaces to webapp for desktop-application specific data, as well as
 * interfaces for telemetry to be provided to clogs.
 */
export class Stats {
  /**
   * Predefined set of chrome tracing event category set enabled devtools timeline profiling with JS stack trace support.
   */
  public get defaultTraceCategories(): Readonly<Array<string>> {
    return defaultTraceCategories;
  }

  /**
   * Attempts to free memory that is no longer being used (like images from a
   * previous navigation).
   */
  public clearCache(): void {
    webFrame.clearCache();
  }

  /**
   * Returns CPU usage and idle wakeup information.
   *
   * @returns {CPUUsage} Information about CPU usage
   */
  public getCPUUsage() {
    // TODO: Remove this when electron.d.ts is correct
    return (process as any).getCPUUsage();
  }

  /**
   * Returns memory stats for the current team.
   *
   * @return {CombinedStats}  The stats Object
   */
  public getMemoryUsage(): CombinedStats {
    return getMemoryUsage();
  }

  /**
   * Returns memory stats aggregated across all teams.
   *
   * DEPRECATED in favor of getTeamsMemoryUsage.
   * Remove this once the webapp is no longer using it.
   *
   * @return {Promise<CombinedStats>} A Promise to the stats Object
   */
  public getCombinedMemoryUsage(): Promise<CombinedStats> {
    const browserWindow = remote.getCurrentWindow();
    return executeJavaScriptMethod(browserWindow, 'global.application.getCombinedMemoryUsage')
      .catch((error: Error) => logger.warn(`Unable to get memory usage: ${error.message}`));
  }

  /**
   * Returns memory stats for individual teams, and their current state (min vs
   * full client).
   *
   * @return {Promise<StringMap<TeamMemoryStats>>}  A map of teams to their stats
   */
  public getTeamsMemoryUsage() {
    const browserWindow = remote.getCurrentWindow();
    return executeJavaScriptMethod(browserWindow, 'global.application.getTeamsMemoryUsage')
      .catch((error: Error) => logger.warn(`Unable to get memory usage: ${error.message}`));
  }

  /**
   * Returns an object containing information about the current display configuration
   * and window settings.
   *
   * @returns {Object}      Object       Information about the display and current window
   * @property {Display[]}  diplays      https://github.com/electron/electron/blob/master/docs/api/structures/display.md
   * @property {Object}     windowFrame  Object containing details about the current window (size, position, etc)
   */
  public getDisplayInformation(): {
    displays: Array<Electron.Display>;
    windowFrame: WindowSetting | null
  } {
    const displays = remote.screen.getAllDisplays();
    const windowFrame = windowFrameStore.getWindowSettings();

    return { displays, windowFrame };
  }

  /**
   * Starts collecting tracing data from chromium's content module for profiling
   *
   * Note: ENSURE TO CALL stop record
   * To prevent unexpected excessive disk / cpu usage, it won't allow to record more than 60 seconds and will automatically stop recording.
   *
   * @param {Object} options Configuration values to start trace record.
   * @param {string} options.identifier Short description for trace record.
   * @param {string} options.endpoint Endpoint url to upload generated traces.
   * @param {Array<string>} [options.categoryFilter] Custom category filter to override default category.
   * refer about://tracing for available traces, and defaultTraceCategories(desktop.stats.defaultTraceCategories) for default values.
   * If not specified, will run devtools timeline profiling by default.
   * @param {boolean} [options.captureAllProcess = false] Flag to specify traces for all process running (multiple teams, or Electron's browser view)
   * or would like to have profiling data of process who called `startTraceRecord`.
   * @param {Object} [options.metadata] Key-value object for additional metadata to be attached as HTTP header when upload profiling results.
   *
   * @return {Promise<void>} Promise indicates completion of starting record, will be signalled once all of child process started recording.
   */
  public startTraceRecord(options: TraceRecordOptions): Promise<void> {
    const pid = process.pid;

    //early rejection by validating some mandatory values, we don't even log and webapp handles this
    if (!options) {
      return Promise.reject(`missing trace configuration options, can't start trace`);
    }

    if (!options.endpoint || options.endpoint.length === 0) {
      return Promise.reject(`endpoint should be specified, can't start trace`);
    }

    if (!options.identifier || options.identifier.length === 0) {
      return Promise.reject(`identifier is missing, can't start trace`);
    }

    const configuration = { type: 'start', pid, ...options };

    logger.info(`startTraceRecord: ${pid} requests to trigger trace recording`, configuration);

    const ret = Observable.fromEvent(ipcRenderer, TRACE_RECORD_CHANNEL, (_event, args: TraceResponse) => args)
      .do((x) => {
        if (!x) {
          logger.error(`startTraceRecord: something went wrong, main process does not returned correctly`);
          throw new Error(`trace record triggered, but it isn't clear if it's started correctly`);
        }
      })
      .filter((x) => x.pid === pid).take(1)
      .map((x) => {
        if (x.error) { //simply throw to let it forwarded to promise rejection
          logger.error(`startTraceRecord: could not start trace recording`, x.error);
          throw new Error(x.error);
        }
        logger.info(`startTraceRecord: trace recording started...`);
      })
      .toPromise();

    ipcRenderer.send(TRACE_RECORD_CHANNEL, configuration);

    return ret;
  }

  /**
   * Stops collecting tracing data triggered by startContentTrace, post results to specified endpoint when starts recording.
   *
   * @return {Promise<StopTraceResponse>} Promise indicates completion of stop record, returns status of upload request.
   */
  public stopTraceRecord(): Promise<StopTraceResponse> {
    const pid = process.pid;

    logger.info(`stopTraceRecord: ${pid} requests to stop trace recording`);

    const ret = Observable.fromEvent(ipcRenderer, TRACE_RECORD_CHANNEL, (_event, args: StopTraceResponse) => args)
      .filter((x) => x.pid === pid).take(1)
      .map((x) => {
        if (x.error) { //simply throw to let it forwarded to promise rejection
          logger.error(`stopTraceRecord: could not stop trace recording`, x.error);
          throw new Error(x.error);
        }

        logger.info(`stopTraceRecord: trace record completed`);
        return x;
      })
      .toPromise();

    ipcRenderer.send(TRACE_RECORD_CHANNEL, { type: 'stop', pid });

    return ret;
  }

  /**
   * Returns an object containing information about unique Id of desktop client
   * and id of current session in desktop client.
   *
   * NOTE: Desktop client does not define sessionid in 2.7.0, will always return empty string.
   * DESKTOP-1766 tracks sessionid effort.
   */
  public get Id(): { instanceUid: string, sessionId: string } {
    return {
      instanceUid: getInstanceUuid(),
      sessionId: getSessionId()
    };
  }
}
