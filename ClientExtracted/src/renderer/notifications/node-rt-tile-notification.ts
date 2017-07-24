/**
 * @module Notifications
 */ /** for typedoc */

import { TileNotification } from 'electron-windows-notifications';
import { logger } from '../../logger';
import { IS_WINDOWS_STORE } from '../../utils/shared-constants';
import { NativeNotificationOptions } from './interfaces';

function getTemplate(image: string, base: boolean) {
  return `<tile>
            <visual>

              <binding template="TileMedium" branding="logo">
                ${image ? `<image placement="peek" src="${image}" />` : ''}
                <text>%s</text>
                <text hint-style="captionSubtle" hint-wrap="true">%s</text>
              </binding>

              <binding template="TileWide" branding="nameAndLogo">
                ${image ? `<image placement="peek" src="${image}" />` : ''}
                <text hint-style="subtitle">%s</text>
                ${base ? `<text hint-style="base" hint-wrap="true">%s</text>` : ''}
                <text hint-style="captionSubtle" hint-wrap="true">%s</text>
              </binding>

              <binding template="TileLarge" branding="nameAndLogo">
                ${image ? `<image placement="peek" src="${image}" />` : ''}
                <text hint-style="subtitle">%s</text>
                ${base ? `<text hint-style="base" hint-wrap="true">%s</text>` : ''}
                <text hint-style="captionSubtle" hint-wrap="true">%s</text>
              </binding>

            </visual>
          </tile>`.replace(/\>\s+\</g, '><');
}

export class NodeRTTileNotification {
  constructor(title: string, options: NativeNotificationOptions) {
    if (!IS_WINDOWS_STORE) return;

    logger.debug('NativeNotification: Creating new NodeRT tile notification.');

    options.title = title;
    this.showNotification(options);
  }

  private showNotification(options: NativeNotificationOptions) {
    const body = options.body || '';
    const title = options.title || '';
    let avatar = options.avatarImageWeb || '';
    let strings = [];
    let template = '';

    // Format title and body. The webapp is pretty creative, but we're formatting
    // the most common use cases:
    //
    // New message from {name}
    // New message in {channel}
    // [{team_domain}] in {channel}
    const parts = /((?:\[(.*)\])|(New message)) (from|in) (.*)/.exec(title);

    // Decode image URLs, we'll use the raw URLs
    if (avatar && avatar.includes('?s=')) {
      avatar = decodeURI(avatar.slice(avatar.indexOf('?s=')));
    }

    if (parts && parts.length === 6) {
      // Subtitle: Can be either "in" or "from", we'll capitalize it
      const subtitle = `${parts[4] === 'in' ? 'In' : 'From'} ${parts[5]}`;
      // Base: Will be either the team name without "[" & "]" for users
      // with multiple teams, or a "New message" for users with one team.
      const base = parts[2] || parts[3];

      template = getTemplate(avatar, true);
      strings = [title, body, subtitle, base, body, subtitle, base, body];
    } else {
      template = getTemplate(avatar, false);
      strings = [title, body, title, body, title, body];
    }

    logger.debug('Sending tile notification', { template, strings });
    const tile = new TileNotification({ template, strings });

    tile.show();
  }
}
