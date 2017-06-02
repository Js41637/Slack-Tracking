/**
 * @module WebAppShared
 */ /** for typedoc */

import * as execa from 'execa';
import * as pify from 'pify';
import { logger } from '../logger';
const getos = pify(require('getos'));

export interface OsInfo {
  os: string;
  release: string;
  name: string;
  codename: string;
}

export async function getLinuxDistro(): Promise<OsInfo> {
  if (process.platform !== 'linux') {
    throw new Error('Only Linux systems are supported');
  }

  try {
    const res: any = await execa('lsb_release', ['-a', '--short']);

    // The first line of lsb_release output is always a listing of installed
    // lsb modules
    const osInfo = res.stdout.split('\n').slice(1);

    if (osInfo.some((metadata: string) => metadata.length > 80)) {
      throw new Error('lsb_release returned a non-standard format, bailing');
    }

    const [os, name, release, codename] = osInfo;

    if (!os || !release) throw new Error('lsb_release is missing OS and release info, bailing');

    return {
      os,
      name,
      release,
      codename,
    };
  } catch (err) {
    logger.debug(`Couldn't get Linux distro info from lsb_release`, err);
    logger.debug(`Trying fallback to get Linux distro info`);

    const res: any = await getos();

    return {
      os: res.dist || '',
      name: `${res.dist || ''} ${res.release || ''}`,
      release: res.release || '',
      codename: res.codename || ''
    };
  }
};
