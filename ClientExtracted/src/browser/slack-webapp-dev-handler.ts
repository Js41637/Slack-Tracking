/**
 * @module Browser
 */ /** for typedoc */

import { protocol } from 'electron';
import { createCompilerHostFromProjectRootSync } from 'electron-compile';
import * as path from 'path';
import { logger } from '../logger';

import { ReduxComponent } from '../lib/redux-component';
import { settingStore } from '../stores/setting-store';

const PROTOCOL_SCHEME_NAME = 'slack-webapp-dev';

export interface SlackWebappDevHandlerState {
  webappSrcPath: string;
}

export class SlackWebappDevHandler extends ReduxComponent<SlackWebappDevHandlerState> {
  private readonly compilerHost: any;

  constructor() {
    super();

    const { webappSrcPath } = this.state;

    this.compilerHost = createCompilerHostFromProjectRootSync(webappSrcPath);

    const { sanitizeUrl, compilerHost } = this;

    protocol.registerBufferProtocol(PROTOCOL_SCHEME_NAME, async (request, completion) => {
      const relativeFilePath = sanitizeUrl(request.url);

      logger.debug(`[${PROTOCOL_SCHEME_NAME}] Want to load: ${relativeFilePath}`);

      let absolutePath = null;
      try {
        absolutePath = path.join(webappSrcPath, relativeFilePath);

        // TODO: Throw an error if trying to an access a file outside the local assets path
      } catch (e) {
        logger.error(`Failed to load resource ${request.url}: ${e.message}\n${e.stack}`);
        completion({ error: -6 /*net::ERR_FILE_NOT_FOUND*/ } as any);
        return;
      }

      try {
        const { code, binaryData, mimeType } = await compilerHost.compile(absolutePath);

        if (binaryData) {
          completion({ data: binaryData, mimeType });
        } else {
          completion({ data: new Buffer(code), mimeType });
        }
      } catch (e) {
        logger.error(`Failed to read file ${absolutePath}: ${e.message}\n${e.stack}`);
        completion({ error: -2 /*net::FAILED*/ } as any);
        return;
      }
    });

    this.disposables.add(() => protocol.unregisterProtocol(PROTOCOL_SCHEME_NAME));
  }

  public syncState(): Partial<SlackWebappDevHandlerState> {
    return {
      webappSrcPath: settingStore.getSetting<string>('webappSrcPath')
    };
  }

  private sanitizeUrl(url: string): string {
    return decodeURIComponent(url)
      .replace(new RegExp(`^${PROTOCOL_SCHEME_NAME}://localhost/`, 'i'), '')

      // Some assets (JS) can have a cache-busting URL param of the form ?cb=1238483289
      .replace(/\?cb=\d+$/, '')

      // Some assets (CSS) can have a cache-busting version string of the form .v1265487329
      .replace(/\.v\d+/, '')

      // The webapp server treats requests for files with a .more extension as requests to compile
      // Less to CSS
      .replace(/\.more$/, '.less');
  }
}
