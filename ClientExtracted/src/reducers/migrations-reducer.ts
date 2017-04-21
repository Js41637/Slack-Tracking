/**
 * @module Reducers
 */ /** for typedoc */

import { Action } from '../actions/action';
import { MIGRATIONS } from '../actions';

export interface MigrationsState {
  redux: boolean;
  macgap: boolean;
}

const initialState: MigrationsState = {
  redux: false,
  macgap: false
};

/**
 * @hidden
 */
export function reduce(state: MigrationsState = initialState, action: Action<any>): MigrationsState {
  switch (action.type) {
  case MIGRATIONS.COMPLETED:
    return { ...state, ...action.data };
  default:
    return state;
  }
};
