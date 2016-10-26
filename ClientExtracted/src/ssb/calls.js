/*eslint no-unused-vars:0*/

import logger from '../logger';

let WebRTC = null;
const path = require('path');

export default class Calls {
  constructor() {
    WebRTC = WebRTC || require('@paulcbetts/slack-calls');
    let basepath = path.join(__dirname, '..', 'static').replace('app.asar', 'app.asar.unpacked');
    WebRTC.setResourceBasePath(basepath);

    this.callbacks = {};
  }

  init(obj) {
    this.callbacks = obj.callbacks;
  }

  startNewCall() {
    let version = `${window.TS.model.win_ssb_version}.${window.TS.model.win_ssb_version_minor}`;
    logger.info("Starting new Calls");
    this.session = new WebRTC.SHSession(
      (j) => this.invokeJSMethod(j),
      () => this.onJanusDisconnected(),
      (i,j) => this.onLog(i,j),
      this.onRemoteFrame.bind(this),
      this.onLocalFrame.bind(this),
      version);
  }

  invokeJSMethod(msg_json) {
    // console.log("NATIVE_TO_JS: " + msg_json);
    var msg = JSON.parse(msg_json);

    if (!this.callbacks[msg.method]) {
      logger.error(`Call from NATIVE to invalid JS method: ${msg.method} - ${msg}`);
    } else {
      this.callbacks[msg.method](msg.args);
    }
  }

  invokeNativeMethod(json_str) {
    // console.log('JS_TO_NATIVE: ' + json_str);
    if (this.session) {
      this.session.invokeNativeFunction(json_str);
    } else {
      logger.error('Calls.session is null/not defined; ignoring invokeNativeMethod()');
    }
  }

  setMiniPanelState(active, title, userid, info) {
    logger.debug(`setMiniPanelState: ${active}, title: ${title}`);
  }

  closeWindow() {
    logger.info('Close window called');
  }

  disconnectJanus(webview) {
    logger.info(`disconnect webview ${webview}`);
  }

  onLog(logmsg, level) {
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

  shutdown() {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }

  onJanusDisconnected(session) {
    logger.info(`Session ${session} disconnected`);
    this.shutdown();
    this.callbacks.onJanusDisconnected();
  }

  onRemoteFrame(...args) {
    this.callbacks.onRemoteFrame(...args);
    this.session.signalDoneRenderingFrame();
  }

  onLocalFrame(...args) {
    this.callbacks.onLocalFrame(...args);
    this.session.signalDoneRenderingLocalFrame();
  }

  requestCapabilities() {
    return {
      supports_voice: true,
      supports_video: true,
      supports_screen_sharing: true,
      supports_disconnection_cb: true
    }; 
  }
}