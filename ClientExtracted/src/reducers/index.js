import appReducer from './app-reducer';
import appTeamsReducer from './app-teams-reducer';
import downloadsReducer from './downloads-reducer';
import dialogReducer from './dialog-reducer';
import eventsReducer from './events-reducer';
import notificationsReducer from './notifications-reducer';
import settingsReducer from './settings-reducer';
import teamsReducer from './teams-reducer';
import windowsReducer from './windows-reducer';
import windowFrameReducer from './window-frame-reducer';

export default {
  app: appReducer,
  appTeams: appTeamsReducer,
  downloads: downloadsReducer,
  dialog: dialogReducer,
  events: eventsReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  teams: teamsReducer,
  windows: windowsReducer,
  windowFrame: windowFrameReducer
};
