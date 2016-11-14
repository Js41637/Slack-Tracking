export default function setupCrashReporter(extras) {
  // NB: App Store builds can't use the crashReporter
  if (process.platform === 'darwin' && process.mas) return;

  // NB: OS X version of Breakpad requires it to be set up erry'where
  if (process.type === 'renderer' && process.platform !== 'darwin') return;

  require('electron').crashReporter.start({
    productName: 'Slack',
    companyName: 'Slack Technologies',
    submitURL: 'https://slack.com/apps/breakpad',
    autoSubmit: true,
    extra: extras
  });
}
