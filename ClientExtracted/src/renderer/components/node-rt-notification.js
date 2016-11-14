import {Notification} from 'electron-windows-notifications';
import {getAppId} from '../../utils/app-id';

const appId = getAppId();
const template = (...elements) => `
  <toast activationType="%s" launch="%s">
    <visual>
      <binding template="ToastGeneric">
        <text hint-wrap="false">%s</text>
        <text>%s</text>
        ${elements.join('')}
      </binding>
    </visual>
    <audio silent="true" />
  </toast>`.replace(/\>\s+\</g, '><');

export default function showNotification(options) {
  let mainImageElement = options.imageUri ? `<image placement="hero" src="${options.imageUri}" />`: '';

  // Add avatar image, if it exists
  let avatarImageElement = '';
  if (process.windowsStore && options.avatarImage) {
    avatarImageElement = `<image id="1" src="${options.avatarImage}" />`;
  } else if (options.avatarImage) {
    avatarImageElement = `<image placement="appLogoOverride" hint-crop="circle" src="${options.avatarImage}" />`;
  }

  let activationType = (process.windowsStore || !options.launchUri) ? 'foreground' : 'protocol';
  let launchUri = options.launchUri ? options.launchUri : 'lol.no.op';

  let strings = [activationType, launchUri, options.title, options.body];
  let group = options.channel;
  let toast = new Notification({template: template(avatarImageElement, mainImageElement), strings, appId, group});
  let result = new Promise((resolve, reject) => {
    toast.on('activated', (sender, args) => resolve(args));
    toast.on('dismissed', () => resolve(false));
    toast.on('failed', reject);
  });

  toast.show();
  return result;
}
