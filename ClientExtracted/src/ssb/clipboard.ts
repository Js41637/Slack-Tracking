import {clipboard, nativeImage} from 'electron';

export class ClipboardIntegration {
  /**
   * Writes plain text onto the OS clipboard
   *
   * @param  {String} text A text string
   */
  public writeString(text: string): void {
    clipboard.writeText(text);
  }

  /**
   * Returns text content from the OS clipboard
   *
   * @return {String}  The content as plain text
   */
  public readString(): string {
    return clipboard.readText();
  }

  /**
   * Writes plain text onto the macOS find pasteboard.
   *
   * @param  {String} text A text string
   */
  public writeFindString(text: string): void {
    clipboard.writeFindText(text);
  }

  /**
   * Returns text content from the macOS find pasteboard
   *
   * @return {String}  The content as plain text
   */
  public readFindString(): string | null {
    return clipboard.readFindText();
  }

  /**
   * Writes an image onto the OS clipboard
   *
   * @param  {String} data  A base64-encoded representation of the raw image
   *                        data. The image is expected to be in PNG format.
   */
  public writeImage(data: string): void {
    const buffer = new Buffer(data, 'base64');
    const image = nativeImage.createFromBuffer(buffer);
    clipboard.writeImage(image);
  }

  /**
   * Returns image content from the OS clipboard
   *
   * @return {String} A string with the base64-encoded representation of the
   *                  raw image data. The image will be in PNG format.
   */
  public readImage(): string {
    const image = clipboard.readImage();
    const buffer = image.toPNG();
    return buffer.toString('base64');
  }
}
