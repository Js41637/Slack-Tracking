/**
 * @module Reducers
 */ /** for typedoc */

import { omit } from 'lodash';
import { TEAMS, UNREADS } from '../actions';
import { Action } from '../actions/action';
import { UnreadsInfo } from '../actions/unreads-actions';
import { StringMap } from '../utils/shared-constants';

export type UnreadsState = StringMap<UnreadsInfo>;

/**
 * @hidden
 */
export function reduce(state: UnreadsState = {}, action: Action<any>): UnreadsState {
  switch (action.type) {
  case UNREADS.UPDATE_UNREADS:
    return updateUnreads(state, action.data);
  case TEAMS.REMOVE_TEAM:
  case TEAMS.REMOVE_TEAMS:
    return omit<UnreadsState, UnreadsState>(state, action.data);
  default:
    return state;
  }
}

function updateUnreads(state: UnreadsState, {
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
