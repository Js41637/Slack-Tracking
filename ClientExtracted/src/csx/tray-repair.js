import {runScript} from '../edge-loader';

export async function repairTrayRegistryKey() {
  // Not Windows? Seeya
  if (process.platform !== 'win32') {
    return null;
  }

  let ret = await runScript({
    absolutePath: require.resolve('./tray-repair.csx'),
    args: process.execPath
  });

  // NB: Making RPC calls to Explorer then immediately tearing down the process
  // apparently will in some conditions crash Explorer.exe
  await new Promise((r) => setTimeout(r, 5*1000));
  return ret;
}
