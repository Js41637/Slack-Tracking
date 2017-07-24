/**
 * @module SSBIntegration
 */ /** for typedoc */

import { nativeImage } from 'electron';

/**
 * An implementation of NativeImage that doesn't
 * expose the "fromBuffer" method.
 *
 * @class NativeImage
 */
export class NativeImageIntegration {
  public static createEmpty() {
    return nativeImage.createEmpty();
  }

  public static createFromPath(path: string) {
    return nativeImage.createFromPath(path);
  }

  public static createFromDataURL(dataURL: string) {
    return nativeImage.createFromDataURL(dataURL);
  }
}
