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
    const [os, name, release, codename] = res.stdout.split('\n')
      .filter((line: string) => line !== 'No LSB modules are available.');

    if (!os || !release) throw new Error();

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
