/**
 * @module Epics
 */ /** for typedoc */

import { Epic, combineEpics } from 'redux-observable';
import { browserWindowEpics } from './browser-window-epics';

const epics: Epic<any, any> = combineEpics(...browserWindowEpics);
export {
  epics
};
