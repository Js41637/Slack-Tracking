/**
 * @module Reducers
 */ /** for typedoc */

import { ReducersMapObject } from 'redux';

import { eventsType } from '../actions/index';
import { AppState, reduce as appReducer } from './app-reducer';
import { AppTeamsState, reduce as appTeamsReducer } from './app-teams-reducer';
import { DialogState, reduce as dialogReducer } from './dialog-reducer';
import { DownloadsState, reduce as downloadsReducer } from './downloads-reducer';
import { reduce as eventsReducer } from './events-reducer';
import { TeamLoadState, reduce as loadedTeamsReducer } from './loaded-teams-reducer';
import { MigrationsState, reduce as migrationsReducer } from './migrations-reducer';
import { NotificationState, reduce as notificationsReducer } from './notifications-reducer';
import { SettingsState, reduce as settingsReducer } from './settings-reducer';
import { TeamsState, reduce as teamsReducer } from './teams-reducer';
import { TokensState, reduce as tokensReducer } from './tokens-reducer';
import { UnreadsState, reduce as unreadsReducer } from './unreads-reducer';
import { WindowFrameState, reduce as windowFrameReducer } from './window-frame-reducer';
import { WindowsState, reduce as windowsReducer } from './windows-reducer';

/**
 * Interface defines shape of our application's root state.
 */
export interface RootState {
  app: AppState;
  appTeams: AppTeamsState;
  dialog: DialogState;
  downloads: DownloadsState;
  events: Record<eventsType, any>;
  migrations: MigrationsState;
  notifications: NotificationState;
  settings: SettingsState;
  teams: TeamsState;
  tokens: TokensState;
  unreads: UnreadsState;
  windowFrame: WindowFrameState;
  windows: WindowsState;
  loadedTeams: TeamLoadState;
}

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
  tokens: tokensReducer,
  unreads: unreadsReducer,
  windows: windowsReducer,
  windowFrame: windowFrameReducer,
  loadedTeams: loadedTeamsReducer
};

export {
  reducers
};
