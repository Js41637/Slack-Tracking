import ReduxComponent from '../../lib/redux-component';
import TeamStore from '../../stores/team-store';
import {ipcRenderer} from 'electron';

const ratio = window.devicePixelRatio;
const scale = (size) => size * ratio;

const iconWidth = 16;
const iconHeight= 16;

export default class OverlayManager extends ReduxComponent {
  constructor(props) {
    super(props);

    this.canvas = document.createElement('canvas');
    this.canvas.width = scale(iconWidth);
    this.canvas.height = scale(iconHeight);
    this.update({});
  }

  syncState() {
    return {
      unreadInfo: TeamStore.getCombinedUnreadInfo()
    };
  }

  update(prevState) {
    if (prevState.unreadInfo === this.state.unreadInfo) return;
    let unreadHighlights = this.state.unreadInfo.unreadHighlights;

    if (unreadHighlights < 1) {
      ipcRenderer.send('window:set-overlay-icon', null);
    } else {
      let buf = this.renderOverlayIcon(unreadHighlights);
      ipcRenderer.send('window:set-overlay-icon', buf);
    }
  }

  renderOverlayIcon(unreadHighlights) {
    // http://codepen.io/anon/pen/QyjXJZ
    let ctx = this.canvas.getContext("2d");

    let number = unreadHighlights > 99 ? '+' : unreadHighlights.toString();
    let centerX = iconWidth / 2.0;
    let centerY = iconHeight / 2.0;

    let badgeSize = (number.length > 1 ? 7 : 6.5);
    ctx.beginPath();
    ctx.fillStyle = '#f66';
    ctx.arc(scale(centerX), scale(centerY), scale(badgeSize), 0, 6.28 /*radians*/, false);
    ctx.fill();

    ctx.font = `${scale(10)}px Slack-Lato`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fff';

    let metrics = ctx.measureText(number);

    // NB: In Chrome 45, measureText literally only gives us the width
    // and nothing else :-/
    ctx.fillText(number,
      Math.max(0, scale(centerX) - (metrics.width / 2.0) - scale(0.25)), scale(centerY - 4.25));

    let s = this.canvas.toDataURL();
    return new Buffer(s.slice(s.indexOf(',')+1), 'base64');
  }
}
