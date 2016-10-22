import _ from 'lodash';
import fs from 'fs';
import url from 'url';
import temp from 'temp';

import runScript from '../edge-loader';
import nativeInterop from '../native-interop';
import {requireTaskPool} from 'electron-remote';

const {downloadFileOrUrl} = requireTaskPool(require.resolve('electron-remote/remote-ajax'));

const logger = require('../logger').default;
const notifier = runScript({
  absolutePath: require.resolve('./native-notifications.csx'),
  args: nativeInterop.isWindows10OrHigher()
});

temp.track();

// Public: This class implements the HTML5 Notification class (mostly!), via
// communicating with a bundled C# DLL.
export default class WindowsNativeNotification {
  // Public: Creates a notification and dispatches it (per HTML5 Notification)
  //
  // Note that options contains extra parameter that aren't technically
  // spec (initials, theme) but #yolo.
  constructor(title, options={}) {
    _.extend(this, options);
    _.extend(this, require('../renderer/event-listener'));

    let toSend = _.extend({title}, options);

    this.createNotification(toSend)
      .catch((e) => this.dispatchError(e));
  }

  async createNotification(toSend) {
    let notifyFunc = await notifier;

    if (toSend.imageUri) {
      let target = await this.downloadImage(toSend.imageUri);
      if (target) toSend.imageUri = `file:///${target.replace(/\\/g, '/')}`;
    }

    if (toSend.avatarImage) {
      let target = await this.downloadImage(toSend.avatarImage);
      if (target) toSend.avatarImage = `file:///${target.replace(/\\/g, '/')}`;
    }

    logger.debug(`Creating notification: ${JSON.stringify(toSend)}`);
    this.result = await notifyFunc(JSON.stringify(toSend));
    this.dispatchEvent(this.result ? 'click' : 'close', { target: this });
  }

  // Public: Closes the notification early. Doesn't actually work.
  //
  // Returns nothing.
  close() {
  }

  // Private: This method marshals an {Error} to the 'error' event
  //
  // Returns nothing
  dispatchError(error) {
    logger.warn(`Error while showing notification: ${error.message}`);

    this.dispatchEventWithReplay('error', {
      target: this,
      type: 'error',
      error: error
    });

    this.clearListeners();
  }

  async downloadImage(uri) {
    let u = url.parse(uri);
    let m = u.pathname.match(/\.([a-zA-Z]+)$/);
    if (!m || !m[1]) return null;

    let target = null;
    try {
      let { path } = temp.openSync('notif');
      target = `${path}${m[0]}`;
      fs.renameSync(path, target);
    } catch (e) {
      logger.error(`Failed to set up notification image: ${e.message}`);
      return null;
    }

    setTimeout(() => {
      try {
        fs.unlinkSync(target);
      } catch(e) {
        logger.info(`Couldn't clean up temp notification image: ${e.message}`);
      }
    }, 15*1000);

    if (await downloadFileOrUrl(uri, target) < 10) {
      return null;
    }

    return target;
  }
}
