import * as fs from 'graceful-fs';
import * as path from 'path';

import * as jszip from 'jszip';
import {logger} from '../logger';
import promisify from '../promisify';
import {spawnPromise} from 'spawn-rx';
import {Observable} from 'rxjs/Observable';

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
 * Creates a jsZip archiver instance by reading given files
 *
 * @param  {String[]} files         The files to add to the Zip archive, should be plain text
 * @param  {number} quota           Maximum size of raw files to be included in archive, in MB.
 *                                  There isn't good prediction of how large archive size will be, so this parmater
 *                                  specficis original files maximum size in total instead. Default is 50MB.
 */
export function createZipArchiver(files: Array<string>, quota: number = 50): Observable<JSZip> {
  //bindNodeCallback has type issue with reafile (supplying 'utf-8' for secondary option), cast to any
  const readFileAsObservable = Observable.bindNodeCallback(fs.readFile) as any;
  const archiver = new jszip();

  return Observable.from(files)
    .map((file) => ({
      name: file,
      stat: fs.statSyncNoException(file)
    }))
    .filter((file) => !!file.stat && !!file.stat.size)
    .mergeMap((file) => {
      return (readFileAsObservable(file.name, 'utf-8') as Observable<string>).catch((err: Error) => {
        const message = `could not read log file ${file.name}, ${err}`;
        logger.error(message);
        return Observable.of(message);
      }).map((content: string) => ({ file: file.name, content, size: file.stat.size / 1000000.0 }));
    }).reduce((acc: { archiver: JSZip, rawFileSize: number }, value: { file: string, content: string, size: number }) => {
      if (acc.rawFileSize + value.size <= quota) {
        acc.archiver.file(path.basename(value.file), value.content);
        acc.rawFileSize += value.size;
      } else {
        logger.warn(`raw file size in total is exceeded given quota ${quota}, skipping file ${value.file} to archive`);
      }
      return acc;
    }, {
      archiver,
      rawFileSize: 0
    }).map((x) => x.archiver);
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
  return spawnPromise('powershell.exe', args);
}

export async function getCurrentUser(): Promise<{uid: number, gid: number}> {
  const { uid, gid } = await pfs.stat(process.env.HOME);
  return { uid, gid };
}
