/**
 * @module Reducers
 */ /** for typedoc */

import { Action } from '../actions/action';
import { omit } from '../utils/omit';
import { StringMap } from '../utils/shared-constants';
import { UnreadsInfo } from '../actions/unreads-actions';
import { UNREADS, TEAMS } from '../actions';

/**
 * @hidden
 */
export function reduce(state: StringMap<UnreadsInfo> = {}, action: Action<any>): StringMap<UnreadsInfo> {
  switch (action.type) {
  case UNREADS.UPDATE_UNREADS:
    return updateUnreads(state, action.data);
  case TEAMS.REMOVE_TEAM:
  case TEAMS.REMOVE_TEAMS:
    return omit<StringMap<UnreadsInfo>, StringMap<UnreadsInfo>>(state, action.data);
  default:
    return state;
  }
};

function updateUnreads(state: StringMap<UnreadsInfo>, {
  teamId, unreads, unreadHighlights, showBullet
}: UnreadsInfo) {
  return {
    ...state,
    [teamId!]: {
      unreads,
      unreadHighlights,
      showBullet
    }
  };
}
