import {Disposable, SerialDisposable} from 'rx';
import {remote} from 'electron';

const {app} = remote;

import TeamActions from '../actions/team-actions';

class FakeDock{
  getBadge() {}
  bounce() { return -1; }
  cancelBounce() {}
  setBadge() {}
}

export default class DockIntegration {
  constructor() {
    this.disp = new SerialDisposable();
    this.dock = app.dock || new FakeDock();
  }

  badge() { 
    return this.dock.getBadge(); 
  }

  bounceOnce() { 
    this.bounce('informational'); 
  }

  bounceIndefinitely() { 
    this.bounce('critical'); 
  }

  bounce(type) {
    let id = this.dock.bounce(type);

    this.disp.setDisposable(new Disposable(() => {
      if (id < 0) return;
      this.dock.cancelBounce(id);
    }));
  }

  stopBouncing() {
    this.disp.setDisposable(Disposable.empty);
  }

  setBadgeCount(unreadHighlights, unread, showBullet) {
    if (window.teamId) {
      TeamActions.updateUnreadsInfo(unread, unreadHighlights, showBullet, window.teamId);
    }
  }
}
