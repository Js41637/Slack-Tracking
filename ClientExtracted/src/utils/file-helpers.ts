import * as fs from 'fs';
import * as path from 'path';
import {ZipFile} from 'yazl';
import {logger} from '../logger';
import promisify from '../promisify';
import {spawn} from 'spawn-rx';

const pfs = promisify(fs);

/**
 * Creates a DOM File (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * from the content of the given file path.
 *
 * @param  {String} filePath  The file being read
 * @param  {String} type      The MIME type of the file; defaults to text/plain
 * @return {File}             The DOM File object
 */
export async function domFileFromPath(filePath: string, type: string = 'text/plain'): Promise<File> {
  // Read the file into a Node Buffer.
  const {buffer, byteOffset, byteLength} = await pfs.readFile(filePath);

  // Buffers are Uint8Arrays, so just grab its underlying ArrayBuffer.
  // The slice is required because small Buffers are views on a shared ArrayBuffer.
  const arrayBuffer = buffer.slice(byteOffset, byteOffset + byteLength);

  const fileName = path.basename(filePath);

  // Create a new File object.
  return new File([arrayBuffer], fileName, {type});
}

export function copySmallFileSync(from: string, to: string): void {
  const buf = fs.readFileSync(from);
  fs.writeFileSync(to, buf);
}

/**
 * Creates a Zip archive and saves it to a path.
 *
 * @param  {String[]} files         The files to add to the Zip archive
 * @param  {String} destination     The file path to save the Zip archive to
 */
export function createZipArchive(files: Array<string>, destination: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(destination);
    const fileArchive = new ZipFile();

    fileArchive.outputStream
      .on('error', reject)
      .pipe(writeStream)
        .on('error', reject)
        .on('finish', () => {
          resolve(true);
        });

    for (const file of files) {
      try {
        fs.statSync(file);
        fileArchive.addFile(file, path.basename(file));
      } catch (e) {
        logger.error(`Couldn't find ${file} to include in Zip archive: ${e}`);
      }
    }

    fileArchive.end();
  });
}

/**
 * Creates a Zip archive and saves it to a path, using Windows 10 capabilities.
 *
 * @param  {String} sourceDirectory The files to add to the Zip archive
 * @param  {String} destination     The file path to save the Zip archive to
 * @returns {Promise<boolean>}
 */
export function createZipArchiveWithPowershell(sourceDirectory: string, destination: string): Promise<boolean> {
  const eSource = sourceDirectory.replace(/\\/g, '/');
  const eDestination = destination.replace(/\\/g, '/');
  const dotnet = `Add-Type -A 'System.IO.Compression.FileSystem';`;
  const args = [
    '-nologo',
    '-noprofile',
    '-command',
    `& { ${dotnet} [IO.Compression.ZipFile]::CreateFromDirectory('${eSource}', '${eDestination}'); exit;}`
  ];

  logger.info(`Creating zip archive using PowerShell with args: ${JSON.stringify(args)}`);

  return spawn('powershell.exe', args).toPromise();
}
