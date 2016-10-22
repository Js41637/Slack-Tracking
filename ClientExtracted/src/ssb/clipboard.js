import {clipboard, NativeImage} from 'electron';

export const FIND_PASTEBOARD_NAME = 'NSFindPboard';

export default class ClipboardIntegration {
  /**
   * Writes plain text onto the OS clipboard
   *
   * @param  {String} text A text string
   */
  writeString(text) {
    clipboard.writeText(text);
  }

  /**
   * Returns text content from the OS clipboard
   *
   * @return {String}  The content as plain text
   */
  readString() {
    return clipboard.readText();
  }

  /**
   * Writes plain text onto the OS find pasteboard
   *
   * @param  {String} text A text string
   */
  writeFindString(text) {
    clipboard.writeText(text, FIND_PASTEBOARD_NAME);
  }

  /**
   * Returns text content from the OS find pasteboard
   *
   * @return {String}  The content as plain text
   */
  readFindString() {
    return clipboard.readText(FIND_PASTEBOARD_NAME);
  }

  /**
   * Writes an image onto the OS clipboard
   *
   * @param  {String} data  A base64-encoded representation of the raw image
   *                        data. The image is expected to be in PNG format.
   */
  writeImage(data) {
    let buffer = new Buffer(data, 'base64');
    let image = NativeImage.createFromBuffer(buffer);
    clipboard.writeImage(image);
  }

  /**
   * Returns image content from the OS clipboard
   *
   * @return {String} A string with the base64-encoded representation of the
   *                  raw image data. The image will be in PNG format.
   */
  readImage() {
    let image = clipboard.readImage();
    let buffer = image.toPng();
    return buffer.toString('base64');
  }
}
