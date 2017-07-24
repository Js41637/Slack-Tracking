/**
 * @module Reducers
 */ /** for typedoc */

import { MIGRATIONS } from '../actions';
import { Action } from '../actions/action';

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
}
