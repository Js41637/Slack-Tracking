import {ReduxComponent} from '../../lib/redux-component';
import {teamStore} from '../../stores/team-store';
import {ipcRenderer} from 'electron';

const ratio = window.devicePixelRatio;
const scale = (size: number) => size * ratio;

const iconWidth = 16;
const iconHeight = 16;

export interface OverlayState {
  unreadInfo?: {
    unreadHighlights: number;
  };
}

export class OverlayManager extends ReduxComponent<OverlayState> {
  private readonly canvas: HTMLCanvasElement = document.createElement('canvas');

  constructor(props: any) {
    super(props);

    this.canvas.width = scale(iconWidth);
    this.canvas.height = scale(iconHeight);
    this.update({});
  }

  public syncState(): OverlayState {
    return {
      unreadInfo: teamStore.getCombinedUnreadInfo()
    };
  }

  public update(prevState: OverlayState): void {
    if (prevState.unreadInfo === this.state.unreadInfo) return;
    const unreadHighlights = this.state.unreadInfo ? this.state.unreadInfo.unreadHighlights : 0;

    ipcRenderer.send('window:set-overlay-icon',
      unreadHighlights < 1 ? null : this.renderOverlayIcon(unreadHighlights));
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
