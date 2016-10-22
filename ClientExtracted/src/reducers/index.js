import appReducer from './app-reducer';
import downloadsReducer from './downloads-reducer';
import eventsReducer from './events-reducer';
import notificationsReducer from './notifications-reducer';
import settingsReducer from './settings-reducer';
import teamsReducer from './teams-reducer';
import windowsReducer from './windows-reducer';

export default {
  app: appReducer,
  downloads: downloadsReducer,
  events: eventsReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  teams: teamsReducer,
  windows: windowsReducer
};
