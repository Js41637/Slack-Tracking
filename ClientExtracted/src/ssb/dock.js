import {Subscription} from 'rxjs/Subscription';
import SerialSubscription from 'rxjs-serial-subscription';

import {remote} from 'electron';

const {app} = remote;

import {teamActions} from '../actions/team-actions';

class FakeDock{
  getBadge() {}
  bounce() { return -1; }
  cancelBounce() {}
  setBadge() {}
}

export default class DockIntegration {
  constructor() {
    this.disp = new SerialSubscription();
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

    this.disp.add(() => {
      if (id < 0) return;
      this.dock.cancelBounce(id);
    });
  }

  stopBouncing() {
    this.disp.add(Subscription.EMPTY);
  }

  setBadgeCount(unreadHighlights, unread, showBullet) {
    if (window.teamId) {
      teamActions.updateUnreadsInfo(unread, unreadHighlights, showBullet, window.teamId);
    }
  }
}
