import fs from 'fs';
import path from 'path';
import {ZipFile} from 'yazl';
import logger from '../logger';
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

/**
 * Creates a Zip archive and saves it to a path.
 *
 * @param  {String} filePath        The files to add to the Zip archive
 * @param  {String} destination     The file path to save the Zip archive to
 */
export function createZipArchive(files, destination) {
  return new Promise((resolve, reject) => {
    let writeStream = fs.createWriteStream(destination);
    let fileArchive = new ZipFile();

    fileArchive.outputStream
      .on('error', reject)
      .pipe(writeStream)
        .on('error', reject)
        .on('finish', () => {
          resolve(true);
        });
    
    for (let file of files) {
      try {
        fs.statSync(file);
        fileArchive.addFile(file, path.basename(file));
      } catch(e) {
        logger.error(`Couldn't find ${file} to include in Zip archive: ${e}`);
      }
    }
    
    fileArchive.end();
  });
}
