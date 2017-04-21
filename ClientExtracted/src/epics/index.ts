/**
 * @module Epics
 */ /** for typedoc */

import { browserWindowEpics } from './browser-window-epics';
import { combineEpics, Epic } from 'redux-observable';

const epics: Epic<any, any> = combineEpics(...browserWindowEpics);
export {
  epics
};
