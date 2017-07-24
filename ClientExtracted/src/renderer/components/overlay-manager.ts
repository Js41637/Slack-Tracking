/**
 * @module RendererComponents
 */ /** for typedoc */

import { ipcRenderer } from 'electron';
import { UnreadsInfo } from '../../actions/unreads-actions';
import { ReduxComponent } from '../../lib/redux-component';
import { unreadsStore } from '../../stores/unreads-store';

const ratio = window.devicePixelRatio;
const scale = (size: number) => size * ratio;

const iconWidth = 16;
const iconHeight = 16;

export interface OverlayState {
  unreadsInfo: UnreadsInfo;
}

export class OverlayManager extends ReduxComponent<Partial<OverlayState>> {
  private readonly canvas: HTMLCanvasElement = document.createElement('canvas');

  constructor(props?: any) {
    super(props);

    this.canvas.width = scale(iconWidth);
    this.canvas.height = scale(iconHeight);
    this.update({});
  }

  public syncState(): Partial<OverlayState> {
    return {
      unreadsInfo: unreadsStore.getCombinedUnreadsInfo()
    };
  }

  public update(prevState: Partial<OverlayState>): void {
    if (prevState.unreadsInfo === this.state.unreadsInfo) return;
    const unreadHighlights = this.state.unreadsInfo ? this.state.unreadsInfo.unreadHighlights : 0;

    const overlayIcon = (!unreadHighlights || unreadHighlights < 1) ? null : this.renderOverlayIcon(unreadHighlights);
    ipcRenderer.send('window:set-overlay-icon', overlayIcon);
  }

  private renderOverlayIcon(unreadHighlights: number): Buffer | null {
    // http://codepen.io/anon/pen/QyjXJZ
    const ctx = this.canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const unreadNumber = unreadHighlights > 99 ? '+' : unreadHighlights.toString();
    const centerX = iconWidth / 2.0;
    const centerY = iconHeight / 2.0;

    const badgeSize = (unreadNumber.length > 1 ? 7 : 6.5);
    ctx.beginPath();
    ctx.fillStyle = '#f66';
    ctx.arc(scale(centerX), scale(centerY), scale(badgeSize), 0, 6.28 /*radians*/, false);
    ctx.fill();

    ctx.font = `${scale(10)}px Slack-Lato`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fff';

    const metrics = ctx.measureText(unreadNumber);

    // NB: In Chrome 45, measureText literally only gives us the width
    // and nothing else :-/
    ctx.fillText(unreadNumber,
      Math.max(0, scale(centerX) - (metrics.width / 2.0) - scale(0.25)), scale(centerY - 4.25));

    const s = this.canvas.toDataURL();
    return new Buffer(s.slice(s.indexOf(',') + 1), 'base64');
  }
}
