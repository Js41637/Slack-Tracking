/**
 * @module Stores
 */ /** for typedoc */

import { sumBy } from 'lodash';
import { Store } from '../lib/store';
import { UnreadsState } from '../reducers/unreads-reducer';

export class UnreadsStore {
  public get unreads(): UnreadsState {
    return Store.getState().unreads;
  }

  public getCombinedUnreadsInfo() {
    const unreadsPerTeam = Object.keys(this.unreads).map((k) => this.unreads[k]);

    return {
      unreads: sumBy(unreadsPerTeam as any, 'unreads'),
      unreadHighlights: sumBy(unreadsPerTeam as any, 'unreadHighlights'),
      showBullet: Object.keys(unreadsPerTeam).some((key) => {
        const { showBullet, unreads } = unreadsPerTeam[key];
        return showBullet && unreads > 0;
      })
    };
  }
}

const unreadsStore = new UnreadsStore();
export {
  unreadsStore
};