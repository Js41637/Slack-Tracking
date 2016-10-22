import fs from 'fs';
import path from 'path';
import promisify from '../promisify';

const pfs = promisify(fs);

/**
 * Creates a DOM File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * from the content of the given file path.
 *
 * @param  {String} filePath  The file being read
 * @param  {String} type      The MIME type of the file; defaults to text/plain
 * @return {File}             The DOM File object
 */
export async function domFileFromPath(filePath, type = 'text/plain') {
  // Read the file into a Node Buffer.
  let {buffer, byteOffset, byteLength} = await pfs.readFile(filePath);

  // Buffers are Uint8Arrays, so just grab its underlying ArrayBuffer.
  // The slice is required because small Buffers are views on a shared ArrayBuffer.
  let arrayBuffer = buffer.slice(byteOffset, byteOffset + byteLength);

  let fileName = path.basename(filePath);

  // Create a new File object.
  return new File([arrayBuffer], fileName, {type});
}

export function copySmallFileSync(from, to) {
  let buf = fs.readFileSync(from);
  fs.writeFileSync(to, buf);
}
