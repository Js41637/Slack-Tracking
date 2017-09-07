import { MiddlewareAPI } from 'redux';
import { locale } from '../i18n/locale';
import { logger } from '../logger';
import { RootState } from '../reducers';

const pickLocale = (store: MiddlewareAPI<RootState>) => {
  if (store.getState().appTeams.teamsByIndex.length === 0) {
    return locale.currentLocale.systemLocale;
  }

  const selectedTeam = store.getState().appTeams.selectedTeamId;
  if (!!selectedTeam && store.getState().teams[selectedTeam]) {
    return store.getState().teams[selectedTeam].locale;
  }

  logger.warn('Failed to get team locale state');
  return null;
};

export {
  pickLocale
};
