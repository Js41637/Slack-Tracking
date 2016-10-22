const {clipboard, NativeImage} = require('electron');

module.exports =
class ClipboardIntegration {
  // Public: Writes plain text onto the OS clipboard
  //
  // text - A text string
  writeString(text) {
    clipboard.writeText(text);
  }

  // Public: Returns text content from the OS clipboard
  //
  // Returns the content as plain text
  readString() {
    return clipboard.readText();
  }

  // Public: Writes an image onto the OS clipboard
  //
  // data - A base64-encoded representation of the raw image data. The image is
  // expected to be in PNG format.
  writeImage(data) {
    let buffer = new Buffer(data, 'base64');
    let image = NativeImage.createFromBuffer(buffer);
    clipboard.writeImage(image);
  }

  // Public: Returns image content from the OS clipboard
  //
  // Returns a string with the base64-encoded representation of the raw image
  // data. The image will be in PNG format.
  readImage() {
    let image = clipboard.readImage();
    let buffer = image.toPng();
    return buffer.toString('base64');
  }
};
