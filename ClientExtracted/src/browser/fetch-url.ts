/**
 * @module Browser
 */ /** for typedoc */

import { net } from 'electron';
import * as fs from 'graceful-fs';

import { Credentials } from '../utils/shared-constants';

/**
 * Uses Electron's `net` module to fetch JSON from a URL.
 *
 * @param  {String|Object} options    If options is a String, it is interpreted as the request URL.
 *                                    If it is an object, it is expected to fully specify an HTTP request.
 * @param  {Credentials} credentials  Optional username & password if authenticating
 *
 * @return {Promise<String>}          A Promise to the JSON string
 */
export function fetchURL(options: string|{}, credentials?: Credentials): Promise<string> {
  const request = net.request(options);

  return new Promise((resolve, reject) => {
    request.on('response', (response: Electron.IncomingMessage) => {
      let data = '';

      response.on('data', (buffer: Buffer) => {
        data += buffer.toString();
      });

      response.on('end', () => {
        resolve(data);
      });

      response.on('error', (error: Error) => {
        reject(error);
      });
    });

    request.on('login', (_authInfo: Electron.LoginAuthInfo, callback: Function) => {
      if (credentials) callback(credentials.username, credentials.password);
    });

    request.on('error', (error: Error) => {
      reject(error);
    });

    request.end();
  });
}

/**
 * Uses Electron's `net` module to download remote content to a file.
 *
 * @param  {String|Object} options    If options is a String, it is interpreted as the request URL.
 *                                    If it is an object, it is expected to fully specify an HTTP request.
 * @param  {String} outputPath        The destination path
 * @param  {Credentials} credentials  Optional username & password if authenticating
 *
 * @return {Promise<void>}            A Promise representing completion
 */
export function downloadURL(options: string|{}, outputPath: string, credentials?: Credentials): Promise<void> {
  const request = net.request(options);

  return new Promise<void>((resolve, reject) => {
    request.on('response', (response: Electron.IncomingMessage) => {
      const outputStream = fs.createWriteStream(outputPath);
      response.pipe(outputStream);

      response.on('end', () => {
        resolve();
      });

      response.on('error', (error: Error) => {
        outputStream.close();
        reject(error);
      });
    });

    request.on('login', (_authInfo: Electron.LoginAuthInfo, callback: Function) => {
      if (credentials) callback(credentials.username, credentials.password);
    });
  });
}
