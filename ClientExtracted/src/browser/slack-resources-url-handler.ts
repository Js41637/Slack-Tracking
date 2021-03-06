/**
 * @module Browser
 */ /** for typedoc */

import { protocol } from 'electron';
import * as LRU from 'lru-cache';
import * as path from 'path';
import { logger } from '../logger';

import { ReduxComponent } from '../lib/redux-component';
import { settingStore } from '../stores/setting-store';

export interface SlackResourcesUrlHandlerState {
  resourcePath: string;
}

 /** @class SlackResourcesUrlHandler
  * Sets up a protocol handler for 'slack-resources', which is used by
  * the SSB to load recached images.  We effectively just treat requests
  * as special file:// URLs that must be files in our app directory
  */
export class SlackResourcesUrlHandler extends ReduxComponent<SlackResourcesUrlHandlerState> {
  constructor() {
    super();

    const { resourcePath } = this.state;
    const resourceCache = LRU<{code: string, binaryData: any}>({ max: 32 });

    protocol.registerBufferProtocol('slack-resources', async (rq, completion) => {
      let relativeFilePath = decodeURIComponent(rq.url)
        .replace(/^slack-resources:(\/\/)?/i, '')
        // Handle trailing slashes
        .replace(/\/$/, '');
      logger.debug(`Want to load: ${relativeFilePath}`);

      // NB: We convert Emoji images to WebP because it saves us a decent chunk
      // of download size
      if (relativeFilePath.match(/^emoji_/i)) {
        relativeFilePath = relativeFilePath.replace(/\.png$/i, '.webp');
      }

      let mimeType = 'application/octet-stream';
      if (relativeFilePath.match(/.png$/i)) mimeType = 'image/png';
      if (relativeFilePath.match(/.webp$/i)) mimeType = 'image/webp';
      if (relativeFilePath.match(/.jpe?g$/i)) mimeType = 'image/jpeg';
      if (relativeFilePath.match(/.mp3$/i)) mimeType = 'audio/mpeg3';
      if (relativeFilePath.match(/.woff2/i)) mimeType = 'application/font-woff';

      let absPath = null;
      try {
        absPath = path.resolve(resourcePath, 'src', 'static', relativeFilePath);

        if (absPath.indexOf(resourcePath) !== 0) {
          throw new Error(`Attempted to use slack-resources to access data outside static: ${absPath}`);
        }
      } catch (e) {
        logger.error(`Failed to load resource ${rq.url}: ${e.message}\n${e.stack}`);
        completion({ error: -6 /*net::ERR_FILE_NOT_FOUND*/ } as any);
        return;
      }

      try {
        const { code, binaryData } = resourceCache.get(absPath) ||
          await (global as any).globalCompilerHost.compile(absPath);

        if (binaryData) {
          completion({ data: binaryData, mimeType });
        } else {
          completion({ data: new Buffer(code), mimeType });
        }

        const timeout = 30 * 1000;
        resourceCache.set(absPath, { code, binaryData });

        setTimeout(() => {
          resourceCache.prune();
        }, timeout + 1000);
      } catch (e) {
        logger.error(`Failed to read file ${absPath}: ${e.message}\n${e.stack}`);
        completion({ error: -2 /*net::FAILED*/ } as any);
        return;
      }
    });

    this.disposables.add(() => protocol.unregisterProtocol('slack-resource'));
  }

  public syncState(): Partial<SlackResourcesUrlHandlerState> {
    return {
      resourcePath: settingStore.getSetting<string>('resourcePath')
    };
  }
}
