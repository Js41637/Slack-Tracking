import * as electron from 'electron';
const net = (electron as any).net;

import {Credentials, AuthenticationInfo} from '../actions/dialog-actions';

/**
 * Uses Electron's `net` module to fetch JSON from a URL.
 *
 * @param  {String|Object} options    If options is a String, it is interpreted
 * as the request URL. If it is an object, it is expected to fully specify an
 * HTTP request.
 * @param  {Credentials} credentials  Optional username & password if authenticating
 *
 * @return {Promise<String>}          A Promise to the JSON string
 */
export function fetchURL(options: string|{}, credentials?: Credentials): Promise<string> {
  const request = net.request(options);

  return new Promise((resolve, reject) => {
    request.on('response', (response: any) => {
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

    request.on('login', (_authInfo: AuthenticationInfo, callback: Function) => {
      if (credentials) {
        callback(credentials.username, credentials.password);
      } else {
        callback();
      }
    });

    request.on('error', (error: Error) => {
      reject(error);
    });

    request.end();
  });
}
