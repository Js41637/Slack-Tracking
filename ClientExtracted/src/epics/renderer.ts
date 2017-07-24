import { Epic, combineEpics } from 'redux-observable';
import { webViewContextEpics } from './web-view-ctx-epics';
import { webAppEpics } from './webapp-epics';

const epics: Epic<any, any> = combineEpics(
  ...webViewContextEpics,
  ...webAppEpics
);

export { epics };
