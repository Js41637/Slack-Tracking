import {crashReporter} from 'electron';

export default function setupCrashReporter(extras) {
  // NB: OS X version of Breakpad requires it to be set up erry'where
  if (process.type === 'renderer' && process.platform !== 'darwin') return;

  crashReporter.start({
    productName: 'Slack',
    companyName: 'Slack Technologies',
    submitURL: 'https://slack.com/apps/breakpad',
    autoSubmit: true,
    extra: extras
  });
}
