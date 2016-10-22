import logger from '../logger';
import path from 'path';
import {protocol} from 'electron';
import promisify from '../promisify';
import {Disposable} from 'rx';

import ReduxComponent from '../lib/redux-component';
import SettingStore from '../stores/setting-store';

const fs = promisify(require('fs'));

const PROTOCOL_SCHEME_NAME = 'slack-webapp-dev';

export default class SlackWebappDevHandler extends ReduxComponent {
  constructor() {
    super();

    let {webappSrcPath} = this.state;
    let {sanitizeUrl, getMimeType} = this;

    protocol.registerBufferProtocol(PROTOCOL_SCHEME_NAME, async function(request, completion) {
      let relativeFilePath = sanitizeUrl(request.url);

      logger.debug(`[${PROTOCOL_SCHEME_NAME}] Want to load: ${relativeFilePath}`);

      let mimeType = getMimeType(relativeFilePath);

      let absolutePath = null;
      try {
        absolutePath = path.join(webappSrcPath, relativeFilePath);

        // TODO: Throw an error if trying to an access a file outside the local assets path
      } catch (e) {
        logger.error(`Failed to load resource ${request.url}: ${e.message}\n${e.stack}`);
        completion({ error: -6 /*net::ERR_FILE_NOT_FOUND*/});
        return;
      }

      try {
        let webappResource = await fs.readFile(absolutePath);

        completion({
          data: webappResource,
          mimeType: mimeType
        });
      } catch (e) {
        logger.error(`Failed to read file ${absolutePath}: ${e.message}\n${e.stack}`);
        completion({ error: -2 /*net::FAILED*/});
        return;
      }
    });

    this.disposables.add(Disposable.create(() => protocol.unregisterProtocol(PROTOCOL_SCHEME_NAME)));
  }

  getMimeType(filePath) {
    let mimeType = 'application/octet-stream';
    if (filePath.match(/.js$/i)) mimeType = 'application/javascript';

    return mimeType;
  }

  sanitizeUrl(url) {
    return decodeURIComponent(url)
      .replace(new RegExp(`^${PROTOCOL_SCHEME_NAME}://localhost/`, 'i'), '')
      .replace(/\?cb=\d+$/, '');
  }

  syncState() {
    return {
      webappSrcPath: SettingStore.getSetting('webappSrcPath')
    };
  }
}
