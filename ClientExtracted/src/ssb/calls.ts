/**
 * @module SSBIntegration
 */ /** for typedoc */

import { remote } from 'electron';
import { clipboard } from 'electron';
import { desktopCapturer as ElectronDesktopCapturer } from 'electron';
import { get } from 'lodash';
import { logger } from '../logger';
import { IS_WINDOWS_STORE } from '../utils/shared-constants';

let WebRTC: any = null;
const path = require('path');

interface CallsCallback {
  onLocalFrame(...args: Array<any>): void;
  onRemoteFrame(...args: Array<any>): void;
  onJanusDisconnected(): void;
}

interface MiniPanelReceiver {
  destroy(): void;
  signalDoneRenderingFrame(): void;
}

interface CallsSession extends MiniPanelReceiver {
  invokeNativeFunction(jsonString: string): void;
  waitForAsyncShutdown(): void;
  signalDoneRenderingLocalFrame(): void;
}

export class Calls {
  private callbacks: Partial<CallsCallback> = {};
  private minipanelReceiverCallback: (...args: Array<any>) => void;
  private minipanelReceiver: MiniPanelReceiver | null;
  private session: CallsSession | null;
  private appSleepId: any;

  constructor() {
    WebRTC = WebRTC || require('@slack/slack-calls');
    const basepath = path.join(__dirname, '..', 'static').replace('app.asar', 'app.asar.unpacked');
    WebRTC.setResourceBasePath(basepath);
  }

  public init(obj: { callbacks: any }) {
    this.callbacks = obj.callbacks;
  }

  public startMinipanelReceiver(cb: (...args: Array<any>) => void) {
    this.minipanelReceiver = new WebRTC.MinipanelReceiver(
      this.onMemoryFrame.bind(this),
      this.onLog.bind(this));
    this.minipanelReceiverCallback = cb;
  }

  public stopMinipanelReceiver() {
    if (this.minipanelReceiver) {
      this.minipanelReceiver.destroy();
      this.minipanelReceiver = null;
    }
  }

  public startNewCall(options: any) {
    options = options || {};
    const version = `${window.TS.model.win_ssb_version}.${window.TS.model.win_ssb_version_minor}`;
    logger.info('Starting new Calls');
    this.appSleepId = remote.powerSaveBlocker.start('prevent-display-sleep');
    this.session = new WebRTC.SHSession(
      (j: string) => this.invokeJSMethod(j),
      () => this.onJanusDisconnected(),
      (i: string, j: any) => this.onLog(i, j),
      this.onRemoteFrame.bind(this),
      this.onLocalFrame.bind(this),
      version,
      logger.logLocation,
      get(options, 'is_slim_mode', false),
      get(options, 'should_start_cpu_monitor', true));
  }

  public getScreenPreviewThumbnails(size: Electron.Size, captureTypes?: Array<string>): Promise<Array<Electron.DesktopCapturerSource>> {
    return new Promise(function(resolve: (reason: any) => void, reject: (reason: any) => void) {
      ElectronDesktopCapturer.getSources(
          { types: captureTypes || ['screen'], thumbnailSize: size },
          (err: Error, sources: Array<Electron.DesktopCapturerSource>) => {
            if (err) {
              logger.error('Screen preview failed with error: ', err);
              reject(err);
              return;
            }
            resolve(sources);
          });
    });
  }

  public invokeJSMethod(msg_json: string): void {
    // console.log("NATIVE_TO_JS: " + msg_json);
    const msg = JSON.parse(msg_json);

    if (!this.callbacks[msg.method]) {
      logger.error(`Call from NATIVE to invalid JS method: ${msg.method} - ${msg}`);
    } else {
      this.callbacks[msg.method](msg.args);
    }
  }

  public invokeNativeMethod(json_str: string): void {
    // console.log('JS_TO_NATIVE: ' + json_str);
    if (this.session) {
      this.session.invokeNativeFunction(json_str);
    } else {
      logger.error('Calls.session is null/not defined; ignoring invokeNativeMethod()');
    }
  }

  public setMiniPanelState(active: any, title: string, _userid: any, _info: any): void {
    logger.debug(`setMiniPanelState: ${active}, title: ${title}`);
  }

  public closeWindow(): void {
    logger.info('Close window called');
  }

  public disconnectJanus(webview: any) {
    logger.info(`disconnect webview ${webview}`);
  }

  public onLog(logmsg: string, level?: 'INFO'|'DEBUG'|'WARNING'|'FATAL'): void {
    switch (level) {
    case 'INFO':
      logger.info(logmsg);
      break;
    case 'DEBUG':
      logger.debug(logmsg);
      break;
    case 'WARNING':
      logger.warn(logmsg);
      break;
    case 'FATAL':
      logger.fatal(logmsg);
      break;
    default:
      logger.error(logmsg);
      break;
    }
  }

  public waitForAsyncShutdown(): void {
    if (this.session) {
      this.session.waitForAsyncShutdown();
    }
  }

  public shutdown(): void {
    remote.powerSaveBlocker.stop(this.appSleepId);
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }

  public onJanusDisconnected(session?: any): void {
    logger.info(`Session ${session} disconnected`);
    this.shutdown();
    this.callbacks.onJanusDisconnected!();
  }

  public requestCapabilities() {
    return {
      supports_voice: true,
      supports_video: true,
      supports_screen_sharing: true,
      supports_disconnection_cb: true,
      supports_mmap_minipanel: (process.platform === 'darwin'),
      supports_screenhero: true,
      is_mas: !!process.mas,
      is_ws: !!IS_WINDOWS_STORE
    };
  }

  public readClipboardData() {
    // Eventually, this should also support images, html and rtf
    return clipboard.readText();
  }

  public writeClipboardData(obj: { data: any, dataType: string }): void {
    // Eventually, this should also support images, html and rtf
    if (obj.dataType === 'string') clipboard.writeText(obj.data);
  }

  private onRemoteFrame(...args: Array<any>): void {
    this.callbacks.onRemoteFrame!(...args);
    if (this.session) {
      this.session.signalDoneRenderingFrame();
    } else {
      this.onLog('session to signal renderingframe does not exists', 'WARNING');
    }
  }

  private onMemoryFrame(...args: Array<any>) {
    if (this.minipanelReceiverCallback) this.minipanelReceiverCallback(...args);
    if (this.minipanelReceiver) {
      this.minipanelReceiver.signalDoneRenderingFrame();
    } else {
      this.onLog('minipanel receiver to signal does not exists', 'WARNING');
    }
  }

  private onLocalFrame(...args: Array<any>): void {
    this.callbacks.onLocalFrame!(...args);
    if (this.session) {
      this.session.signalDoneRenderingLocalFrame();
    } else {
      this.onLog('session to signal localframe does not exists', 'WARNING');
    }
  }
}
