/**
 * @module Reducers
 */ /** for typedoc */

import { reduce as appReducer } from './app-reducer';
import { reduce as appTeamsReducer } from './app-teams-reducer';
import { reduce as downloadsReducer } from './downloads-reducer';
import { reduce as dialogReducer } from './dialog-reducer';
import { reduce as eventsReducer } from './events-reducer';
import { reduce as migrationsReducer } from './migrations-reducer';
import { reduce as notificationsReducer } from './notifications-reducer';
import { reduce as settingsReducer } from './settings-reducer';
import { reduce as teamsReducer } from './teams-reducer';
import { reduce as unreadsReducer } from './unreads-reducer';
import { reduce as windowsReducer } from './windows-reducer';
import { reduce as windowFrameReducer } from './window-frame-reducer';
import { ReducersMapObject } from 'redux';

const reducers: ReducersMapObject = {
  app: appReducer,
  appTeams: appTeamsReducer,
  downloads: downloadsReducer,
  dialog: dialogReducer,
  events: eventsReducer,
  migrations: migrationsReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  teams: teamsReducer,
  unreads: unreadsReducer,
  windows: windowsReducer,
  windowFrame: windowFrameReducer
};

export {
  reducers
};
