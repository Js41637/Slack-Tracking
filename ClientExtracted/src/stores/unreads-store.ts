/**
 * @module Stores
 */ /** for typedoc */

import { sum } from '../utils/sum';
import { Store } from '../lib/store';
import { StringMap } from '../utils/shared-constants';
import { UnreadsInfo } from '../actions/unreads-actions';

export class UnreadsStore {
  public get unreads(): StringMap<UnreadsInfo> {
    return Store.getState().unreads;
  }

  public getCombinedUnreadsInfo() {
    const unreadsPerTeam = this.unreads;

    return {
      unreads: sum(unreadsPerTeam, 'unreads'),
      unreadHighlights: sum(unreadsPerTeam, 'unreadHighlights'),
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