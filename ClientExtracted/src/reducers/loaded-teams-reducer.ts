/**
 * @module Reducers
 */ /** for typedoc */

import { omit } from 'lodash';
import { Store } from 'redux';
import { createAction, createReducer } from 'redux-act';
import { StringMap } from '../utils/shared-constants';
import { RootState } from './index';

const setTeamLoaded = createAction<TeamLoadInfo, void>('Team updated its loaded state');

interface TeamLoadInfo {
  teamId: string;
  /**
   * Indicate whethere team is fully loaded, or unloaded into minweb.
   */
  isFullyLoaded?: boolean;
}

type TeamLoadState = StringMap<TeamLoadInfo>;

/**
 * Add some state to the given team.
 */
function assignToTeam(state: TeamLoadState, data: TeamLoadInfo) {
  return {
    ...state,
    [data.teamId]: {
      ...state[data.teamId],
      ...omit(data, 'teamId')
    }
  };
}

const reduce = createReducer<TeamLoadState>({
  [setTeamLoaded as any]: assignToTeam
}, {});

/**
 * Returns an array of all unloaded team IDs.
 */
const getUnloadedTeams = (store: Store<RootState>) => {
  const teamLoadInfo = store.getState().loadedTeams;
  return Object.keys(teamLoadInfo)
    .filter((teamId) => !teamLoadInfo[teamId].isFullyLoaded);
};

/**
 * Returns whether or not a specific team is unloaded.
 */
const getIsTeamUnloaded = (store: Store<RootState>, teamId: string) => {
  return getUnloadedTeams(store).includes(teamId);
};

export {
  setTeamLoaded,
  TeamLoadInfo,
  TeamLoadState,
  getUnloadedTeams,
  getIsTeamUnloaded,
  reduce
};
