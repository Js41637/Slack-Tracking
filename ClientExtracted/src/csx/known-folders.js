import runScript from '../edge-loader';

export default function getKnownFolder(folderName) {
  // Not Windows? Seeya
  if (process.platform !== 'win32') {
    return null;
  }

  return runScript({
    absolutePath: require.resolve('./known-folders.csx'),
    isSync: true,
    args: folderName
  }).path;
}
