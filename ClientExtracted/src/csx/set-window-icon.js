import runScript from '../edge-loader';

export default function setWindowIcon(iconPath) {
  // Not Windows? Seeya
  if (process.platform !== 'win32') {
    return null;
  }

  return runScript({
    absolutePath: require.resolve('./set-window-icon.csx'),
    isSync: true,
    args: iconPath
  });
}