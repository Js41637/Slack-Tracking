/**
 * @module Reducers
 */ /** for typedoc */

import { MiddlewareAPI } from 'redux';
import { createAction, createReducer } from 'redux-act';
import { StringMap } from '../utils/shared-constants';
import { RootState } from './index';

type TokensState = StringMap<TeamTokenPair>;

interface TeamTokenPair {
  teamId: string;
  token: string;
}

const assignApiToken = createAction<TeamTokenPair, void>('Store an API token for a team');

const reduce = createReducer<TokensState>({
  [assignApiToken as any]: (state: TokensState, pair: TeamTokenPair) => {
    return {
      ...state,
      [pair.teamId]: pair
    };
  }
}, {});

function getTokenForTeam(store: MiddlewareAPI<RootState>, teamId: string) {
  const tokens = store.getState().tokens;
  return tokens[teamId]
    ? tokens[teamId].token
    : null;
}

export {
  TokensState,
  TeamTokenPair,
  assignApiToken,
  reduce,
  getTokenForTeam
};
