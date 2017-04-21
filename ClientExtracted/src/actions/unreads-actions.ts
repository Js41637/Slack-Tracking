/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { UNREADS } from './';

import { LogLevels } from '../logger';

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
      logLevel: LogLevels.DEBUG,
      data
    });
  }
}

const unreadsActions = new UnreadsActions();
export {
  unreadsActions
};