import path from 'path';
import logger from '../logger';
import {nativeImage} from 'electron';

// Creates a {nativeImage} from a static image resource. Tray is currently
// ASAR-unfriendly so we need to unpack the image before we use it.
//
// imageName - The name of the image file, located under static
//
// Returns a fully qualified path
export default function resolveImage(imageName) {
  let source = path.resolve(__dirname, '..', 'static', imageName).replace('app.asar', 'app.asar.unpacked');
  logger.debug(`About to load image: ${source}`);
  return nativeImage.createFromPath(source);
}
