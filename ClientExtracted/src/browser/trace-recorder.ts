import * as JSONStream from 'JSONStream';
import * as archiver from 'archiver';
import { app, contentTracing, ipcMain, net } from 'electron';
import * as fs from 'graceful-fs';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import { p } from '../get-path';
import { logger } from '../logger';
import { promisify } from '../promisify';

import { noop } from '../utils/noop';
import {
  StopTraceArgument,
  StopTraceResponse,
  StringMap,
  TRACE_RECORD_CHANNEL,
  TraceResponse,
  defaultTraceCategories,
  startTraceArgumentType,
  traceUploadStatus
} from '../utils/shared-constants';
import { getInstanceUuid } from '../uuid';


/**
 * Trigger profiler (https://github.com/electron/electron/blob/master/docs/api/content-tracing.md) per signalled request
 *
 */
class TraceRecorder {
  private isTraceRunning: boolean = false;
  private state: startTraceArgumentType;

  private readonly traceLocation = p`${'userData'}/logs/recorded-trace`;

  // set of categories we won't offer capture support for
  private readonly excludedCategories: Readonly<Array<string>> = ['disabled-by-default-devtools.screenshot'];

  constructor() {
    if (process.type !== 'browser') {
      throw new Error('Content trace cannot be initiated other than main process');
    }

    logger.info(`TraceRecorder: setting up trace recorder, trace will be stored under`, this.traceLocation);
    this.initTraceLocation();
    this.cleanupTraces();
  }

  public initializeListener(): void {
    const [startEventObservable, stopEventObservable] =
      Observable.fromEvent(ipcMain, TRACE_RECORD_CHANNEL,
        (event: Electron.Event, args: { type: 'start' | 'stop' }) => ({ sender: event.sender, args }))
        .partition((x) => x.args.type === 'start');

    startEventObservable.subscribe((x) => this.startTrace(x.sender, x.args as startTraceArgumentType));
    stopEventObservable.subscribe((x) => this.stopTrace(x.sender, x.args as StopTraceArgument));
  }

  private initTraceLocation(): void {
    if (!fs.statSyncNoException(this.traceLocation)) {
      try {
        require('mkdirp').sync(this.traceLocation);
      } catch (e) {
        logger.error(`initTraceLocation: could not initialize location for trace`, e);
      }
    }
  }

  /**
   * Delete existing trace.
   * Unlike logs, we don't leave traces behind due to size concerns, as well as traces will be sent out once generated immediately
   */
  private async cleanupTraces(): Promise<void> {
    const pfs = promisify(fs);

    try {
      const traceFiles = fs.readdirSync(this.traceLocation)
        .filter((file) => path.extname(file) === '.trace' || path.extname(file) === '.zip')
        .map((file) => path.join(this.traceLocation, file));

      for (const traceFile of traceFiles) {
        try {
          await pfs.unlink(traceFile);
        } catch (e) {
          logger.error(`cleanupTraces: couldn't remove ${traceFile}`, e);
        }
      }
    } catch (e) {
      logger.error(`cleanupTraces: unexpected error occurred while clean up traces`, e);
    }
  }

  private clearState(): void {
    this.isTraceRunning = false;
    this.state = {} as any;
  }

  private startTrace(sender: Electron.WebContents, args: startTraceArgumentType): void {
    const respondResult = (error?: string) => {
      const response: TraceResponse = { pid: args.pid, error };
      logger.info(`startTrace: sending response to ${args.pid}`, response);
      sender.send(TRACE_RECORD_CHANNEL, response);
      if (!!error) {
        this.clearState();
      }
    };

    if (!app.isReady) {
      respondResult(`application is not ready, cannot start trace`);
      return;
    }

    if (this.isTraceRunning) {
      respondResult(`another profiling requested by ${this.state.pid} is already running`);
      return;
    }

    this.isTraceRunning = true;
    this.state = args;

    try {
      //if state is not valid, something went wrong with given args and should not proceed trace
      if (!this.state || Object.keys(this.state).length === 0) {
        throw new Error('startTrace: something went wrong, ipc did not deliver correct parameter');
      }

      //construct content-trace options. `sampling-frequency` is included regardless of category configuration
      //cause for non-perf profiling it'll be just no-op but for perf profiling it should be included.
      const traceOptions = {
        categoryFilter: (args.categoryFilter ? args.categoryFilter : defaultTraceCategories)
          .filter((x) => !this.excludedCategories.includes(x)).join(','),
        traceOptions: 'record-until-full',
        options: 'sampling-frequency=10000'
      };

      logger.info(`startTrace: triggering trace`, traceOptions);

      contentTracing.startRecording(traceOptions, () => respondResult());

      //webview can possibly crash before try to stop record, or either forget to stop record
      //main process manages to stop trace if it's accidentally exceed too long time for record
      Observable.timer(60000).filter(() => this.isTraceRunning)
        .do(() => logger.warn(`startTrace: Trace not stopped within time limit, forcefully stopping it`))
        .subscribe(() => {
          try {
            //.finally() runs on every completion, so will trigger stopTrace all time. Instead, subscribe to filtered value.
            this.stopTrace(sender, { type: 'stop', pid: args.pid });
          } catch (e) {
            this.clearState();
            logger.error(`startTrace: unexpected error occurred while terminating profiling`, e);
          }
        });
    } catch (e) {
      logger.error(`startTrace: unexpected error occurred`, e);
      respondResult(`unexpected error occurred, ${e}`);
    }
  }

  private stopTrace(sender: Electron.WebContents, args: StopTraceArgument): void {
    const respondResult = (error: string | null, result?: { status: traceUploadStatus, filePath?: string }) => {
      const response: StopTraceResponse = { pid: args.pid, ...result };
      logger.info(`stopTrace: sending response to ${args.pid}`, response);
      sender.send(TRACE_RECORD_CHANNEL, response);
      if (!!error) {
        this.clearState();
      }
    };

    if (!this.isTraceRunning) {
      respondResult(`there isn't any trace running`);
      return;
    }

    const senderId = this.state.pid;
    const captureAllProcess = !!this.state.captureAllProcess ? this.state.captureAllProcess : false;

    if (args.pid !== senderId) {
      respondResult(`stop request sender does not match to trace request sender ${senderId}`);
      return;
    }

    const traceTimeStamp = Date.now();
    //generate file name based on timestamp with instance uuid, to avoid conflict when upload files.
    const uniqueFileName = `${traceTimeStamp}_${getInstanceUuid()}_${this.state.identifier}`;
    const fullProcessTraceFilePath = path.join(this.traceLocation, `full_${uniqueFileName}.trace`);
    const outputZipFilePath = path.join(this.traceLocation, `${captureAllProcess ? 'full' : 'filtered'}_${uniqueFileName}.zip`);

    const filterPredicate = (x: { pid: number }) => x.pid && x.pid === senderId || x.pid === process.pid;
    const getMetadata = () => ({
      token: this.state.token,
      identifier: this.state.identifier,
      instanceUuid: getInstanceUuid(),
      ...this.state.metadata
    });

    const stopRecordingObservable = Observable.bindCallback(contentTracing.stopRecording);
    stopRecordingObservable(fullProcessTraceFilePath)
      .catch((e: any) => {
        logger.error(`stopTrace: stop trace recording failed`, e);
        respondResult(`could not save trace recording ${e}`);
        return Observable.of(null);
      })
      //stop recording should emit at least one callback
      .first()
      .filter((traceFilePath) => !!traceFilePath)
      //based on captureAllProcess flags, either generate filtered trace or return original path
      .mergeMap((traceFilePath) => captureAllProcess ?
        Observable.of(traceFilePath) :
        this.generateFilteredTrace(traceFilePath!, filterPredicate).catch((e) => {
          logger.warn(`stopTrace: something went wrong while filtering trace, falls back to original trace instead`, e);
          return Observable.of(traceFilePath);
        }))
      .do((traceFilePath) => logger.debug(`stopTrace: trace file generated at ${traceFilePath}`))
      .mergeMap((traceFilePath) => this.generateArchive(traceFilePath!, outputZipFilePath))
      .mergeMap((archivePath) => this.uploadTraceRecord(archivePath, this.state.endpoint, getMetadata()))
      //clear up state once archive - upload chain is completed and responded to webapp its result.
      .finally(() => {
        this.clearState();
        logger.info(`stopTrace: trace completed, resetting state to non-recording`);
      })
      .subscribe((path) => respondResult(null, path));
  }

  /**
   * Upload trace record into specified endpoint. File'll be uploaded via PUT method, metadata will be attached as header if specified.
   *
   * @param {string} source path to file to be uploaded.
   * @param {string} endpoint endpoint to upload files.
   * @param {StringMap<string>} metadata additional metadata to be attached as HTTP header
   *
   * @return {Observable<{status: traceUploadStatus, filePath?: string}>} Observable contains
   * status of upload. If fails, it'll also attach local path to trace file.
   */
  private uploadTraceRecord(filePath: string, endpoint: string, metadata?: Partial<StringMap<string>>): Observable<{
    status: traceUploadStatus,
    filePath?: string
  }> {
    const options = { url: endpoint, method: 'PUT' };

    logger.info(`uploadTraceRecord: trying to upload ${filePath}`);

    const request = net.request(options);
    request.chunkedEncoding = true;

    //set metadata into HTTP headers
    if (!!metadata) {
      Object.keys(metadata).filter((key) => !!metadata[key]).forEach((key) => request.setHeader(key, metadata[key]));
    }

    //observe few events for verbose detailed progress
    const requestFinishEventObservable = Observable.fromEvent(request, `finish`).take(1);
    const errorEventObservable = Observable.fromEvent(request, 'error').take(1);
    const abortEventObservable = Observable.fromEvent(request, 'abort').take(1);

    const closeEventObservable = Observable.fromEvent(request, 'close')
      .take(1).do(() => logger.info(`uploadTraceRecord: upload request is closed, no more response or request should follow`));

    //simply subscribe to events setup to log behaviors
    Observable.merge(
      closeEventObservable,
      requestFinishEventObservable.do(() => logger.info(`uploadTraceRecord: upload request successfully finished`)),
      errorEventObservable.do((e) => logger.error(`uploadTraceRecord: unexpected error occurred while request upload`, e)),
      abortEventObservable.do((e) => logger.warn(`uploadTraceRecord: upload request aborted`, e))
    ).subscribe(() => noop());

    //we're watching response status code, as well as observe request failed or aborted
    const [succeedObservable, failedObservable] =
      Observable.fromEvent(request, 'response').partition((x: Electron.IncomingMessage) => x.statusCode === 200);

    //if succeed, response path to webapp will include endpoint with filename generated
    const succeedStateObservable = succeedObservable
      .do((x: Electron.IncomingMessage) => logger.info(`uploadTraceRecord: uploading trace succeed`, x.statusCode))
      .mapTo(({ status: 'UPLOAD_SUCCEEDED' }));

    //if failed, simply return local path to file generated
    const failedPath = failedObservable.merge(errorEventObservable, abortEventObservable)
      .do((x: any) => logger.warn(`uploadTraceRecord: uploading trace failed`, x))
      .mapTo(({ status: 'UPLOAD_FAILED', filePath }));

    try {
      //pipe read stream into ClientRequest directly
      const stream = fs.createReadStream(filePath);
      stream.pipe(request as any);
    } catch (e) {
      logger.warn(`uploadTraceRecord: uploading trace failed while creating request stream`, e);
      return Observable.of({ status: 'UPLOAD_FAILED' as traceUploadStatus, filePath });
    }


    return Observable.merge(succeedStateObservable, failedPath).first();
  }

  /**
   * Take raw trace JSON blob and archive it.
   *
   * Note: jszip doesn't support passthrough input stream to zip file directly, so can't use it here
   * due to original json could be large. Uses archiver here instead for those purpose.
   *
   * @param {string} source path to JSON blob to archive
   * @param {string} outputPath full path of zip archive to be generated
   *
   * @return {string} path to archive generated. If failed to generate, returns source path instead.
   */
  private generateArchive(source: string, outputPath: string): Observable<string> {
    try {
      const output = fs.createWriteStream(outputPath);
      //finalizing archive will not flush opened write stream immediately, need to wait until it's done
      const ret = Observable.fromEvent(output, 'close').first().mapTo(outputPath)
        .do(() => logger.info(`generateArchive: archive file buffer flushed successfully`))
        .catch((e) => {
          logger.error(`generateArchive: unexpected error occurred while flushing archive file`, e);
          return Observable.of(source);
        });

      const archive = archiver('zip', { gzipOptions: { level: 9 } });
      archive.pipe(output);
      archive.append(fs.createReadStream(source), { name: path.basename(source) });
      archive.finalize();

      logger.info(`generateArchive: archive file generated, start flushing buffer`, outputPath);
      return ret;
    } catch (e) {
      logger.error(`generateArchive: failed to generate archive`, e);
      return Observable.of(source);
    }
  }

  /**
   * Generate filtered trace from raw traces.
   *
   * By default raw content trace includes traces from all process, opening up in devtools will display
   * BrowserView's profile instead of specific sender process profile. Trace events includes pid property we can use for filtering out.
   */
  private generateFilteredTrace(source: string, predicate: (x: { pid: number }) => boolean): Observable<string> {
    const outputPath = path.join(this.traceLocation, `${path.basename(source, '.trace').replace('full_', 'filtered_')}.trace`);
    const writeStream = fs.createWriteStream(outputPath);
    //opening up json structs, picking up `traceEvents` and `metadata`
    //(https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview)
    writeStream.write(new Buffer('{\n"traceEvents":[\n'));

    //setting up json parser does stream-load
    const traceEventParser = JSONStream.parse(['traceEvents', true]);
    const metadataParser = JSONStream.parse(['metadata']);

    //each time stream json loader passes data satisfies predicate, pass through to write stream immediately
    Observable.fromEvent(traceEventParser, 'data')
      .filter(predicate)
      .map((x, idx) => new Buffer(`${idx === 0 ? '' : ','}${JSON.stringify(x)}`))
      .subscribe((x) => writeStream.write(x));

    //once `traceEvents` filtering is done, pick up `metadata` property and close out json structure
    const ret = Observable.fromEvent(traceEventParser, 'end')
      .first()
      .do(() => writeStream.write(new Buffer('],\n')))
      //use `null` as signal to start read metadata stream
      .mergeMap(() => Observable.fromEvent(metadataParser, 'data').startWith(null))
      //trigger side effect to start read metadata stream by prepended signal
      .do((x) => {
        if (!x) {
          fs.createReadStream(source).pipe(metadataParser);
        }
      })
      //ignore prepended signal
      .filter((x) => !!x)
      //we know there are only one metadata object
      .first()
      .map((x) => new Buffer(`"metadata": ${JSON.stringify(x)}\n}`))
      .do((x) => writeStream.write(x))
      .finally(() => writeStream.end())
      .mapTo(outputPath);

    fs.createReadStream(source).pipe(traceEventParser);

    return ret;
  }
}

export const traceRecorder = new TraceRecorder();
