import {browserWindowEpics} from './browser-window-epics';
import {combineEpics, Epic} from 'redux-observable';

const epics: Epic<any> = combineEpics(...browserWindowEpics);
export {
  epics
};
