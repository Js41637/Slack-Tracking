/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { UNREADS } from './';

export interface UnreadsInfo {
  unreads: number;
  unreadHighlights: number;
  showBullet: boolean;
  teamId?: string;
}

export class UnreadsActions {
  public updateUnreadsInfo(data: UnreadsInfo): void {
    Store.dispatch({
      type: UNREADS.UPDATE_UNREADS,
      data,
      omitFromLog: true
    });
  }
}

const unreadsActions = new UnreadsActions();
export {
  unreadsActions
};