import {Subscription} from 'rxjs/Subscription';
import SerialSubscription from 'rxjs-serial-subscription';
import {noop} from '../utils/noop';
import {remote} from 'electron';

const {app} = remote;

import {teamActions} from '../actions/team-actions';

class FakeDock {
  public getBadge = noop;
  public cancelBounce = noop;
  public setBadge = noop;
  public bounce() { return -1; }
}

export class DockIntegration {
  private readonly subscription: Subscription = new SerialSubscription();
  private readonly dock: Electron.Dock = app.dock || new FakeDock();

  public badge() {
    return this.dock.getBadge();
  }

  public bounceOnce() {
    this.bounce('informational');
  }

  public bounceIndefinitely() {
    this.bounce('critical');
  }

  public bounce(type: 'critical' | 'informational') {
    const id = this.dock.bounce(type);

    this.subscription.add(() => {
      if (id < 0) return;
      this.dock.cancelBounce(id);
    });
  }

  public stopBouncing() {
    this.subscription.add(Subscription.EMPTY);
  }

  public setBadgeCount(unreadHighlights: number, unread: number, showBullet: boolean) {
    if (window.teamId) {
      teamActions.updateUnreadsInfo(unread, unreadHighlights, showBullet, window.teamId);
    }
  }
}
