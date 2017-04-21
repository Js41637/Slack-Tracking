/**
 * @module Actions
 */ /** for typedoc */

import { Action as ReduxAction } from 'redux';

//preliminary interface for actions, ongoing progress
export interface Action<T> extends ReduxAction {
  readonly omitFromLog?: boolean;
  readonly omitKeysFromLog?: Array<string>;
  readonly data?: T;
  readonly type: string;
  readonly logLevel?: 'info' | 'debug' | 'warn' | 'error';
}
