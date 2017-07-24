import { MiddlewareAPI } from 'redux';
import { RootState } from '../reducers/index';

export function getSetting<T>(store: MiddlewareAPI<RootState>, setting: string): T {
  const { settings } = store.getState();

  if (settings[setting] === undefined) {
    throw new Error(`Setting ${setting} does not exist. Check for existence in SettingStore as well as in the update shape in WindowStore`);
  }
  return settings[setting];
}
