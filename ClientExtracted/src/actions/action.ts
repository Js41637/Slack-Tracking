import {Action as ReduxAction} from 'redux';

//preliminary interface for actions, ongoing progress
export interface Action extends ReduxAction {
  omitFromLog?: boolean;
  omitKeysFromLog?: Array<string>;
  data?: any;
  type: string;
}
