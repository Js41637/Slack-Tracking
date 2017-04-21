/**
 * @module Utilities
 */ /** for typedoc */

import * as path from 'path';
import { logger } from '../logger';
import { nativeImage } from 'electron';

/**
 * Creates a `nativeImage` from a static image resource. Tray is currently
 * ASAR-unfriendly so we need to unpack the image before we use it.
 *
 * @param  {String} imageName The name of the resource in the static directory
 * @return {nativeImage}      An Electron `nativeImage`
 */
export function resolveImage(imageName: string): Electron.NativeImage | string {
  const source = path.resolve(__dirname, '..', 'static', imageName).replace('app.asar', 'app.asar.unpacked');
  logger.debug(`About to load image: ${source}`);
  return nativeImage.createFromPath(source);
}
