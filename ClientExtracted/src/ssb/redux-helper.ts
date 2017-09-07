/**
 * @module SSBIntegration
 */ /** for typedoc */

import { intl as $intl, localeType } from '../i18n/intl';
import { ReduxComponent } from '../lib/redux-component';
import { logger } from '../logger';
import { appStore } from '../stores/app-store';
import { appTeamsStore } from '../stores/app-teams-store';
import { StoreEvent, eventStore } from '../stores/event-store';
import { settingStore } from '../stores/setting-store';
import { IS_STORE_BUILD, UPDATE_STATUS, UpdateInformation, updateStatusType } from '../utils/shared-constants';
import { getReleaseNotesUrl } from '../utils/url-utils';

export interface ReduxHelperState {
  isMachineAwake: boolean;
  currentTeamId: string | null;
  updateStatus: updateStatusType;
  updateInfo: UpdateInformation | null;
  releaseChannel: string;
  spellcheckerLanguage: string;
  canUpdate: boolean;
  customMenuItemClickedEvent: StoreEvent;
  systemTextSettingsChangedEvent: StoreEvent;
  locale: localeType;
}

// NB: This is a Do Everything Component solely because having too many Redux
// Components in the webapp layer is expensive on IPC dispatch, so we want to
// just have one. Yes, this _does_ suck. Sorry.
export class ReduxHelper extends ReduxComponent<ReduxHelperState> {
  private readonly lastSelectedTeams: Array<string> = [];

  constructor() {
    super();
    this.update();
  }

  public syncState(): ReduxHelperState {
    return {
      isMachineAwake: appStore.getSuspendStatus(),
      currentTeamId: appTeamsStore.getSelectedTeamId(),
      updateStatus: appStore.getUpdateStatus(),
      updateInfo: appStore.getUpdateInfo(),
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      customMenuItemClickedEvent: eventStore.getEvent('customMenuItemClicked'),
      systemTextSettingsChangedEvent: eventStore.getEvent('systemTextSettingsChanged'),
      spellcheckerLanguage: settingStore.getSetting<string>('spellcheckerLanguage'),
      canUpdate: process.platform !== 'linux' && !IS_STORE_BUILD,
      locale: settingStore.getSetting<localeType>('locale'),
    };
  }

  public update(prevState: Partial<ReduxHelperState> = {}): void {
    this.updateLastActiveTeam(prevState);
    this.updateSuspendResume(prevState);
    this.updateUpdateStatus(prevState);
    this.updateSpellcheckerLanguage(prevState);
    this.updateLocale(prevState);
  }

  public updateLastActiveTeam(prevState: Partial<ReduxHelperState>): void {
    const currentTeamId = this.state.currentTeamId;

    if (currentTeamId && currentTeamId !== prevState.currentTeamId) {
      this.lastSelectedTeams.unshift(currentTeamId);

      if (window.TSSSB && window.TSSSB.teamSelectionChanged) {
        window.TSSSB.teamSelectionChanged(currentTeamId);
      }
    }

    while (this.lastSelectedTeams.length > 16) {
      this.lastSelectedTeams.pop();
    }
  }

  /**
   * When the `spellcheckerLanguage` setting is changed, we'll automatically
   * configure the spellchecker to use the given language.
   *
   * @param {Partial<ReduxHelperState>} prevState
   * @returns {void}
   */
  public updateSpellcheckerLanguage(prevState: Partial<ReduxHelperState>): void {
    if (this.state.spellcheckerLanguage === prevState.spellcheckerLanguage) return;

    if (window.desktop && window.desktop.spellCheckingHelper) {
      logger.info(`updateSpellcheckerLanguage: Updating language`, this.state.spellcheckerLanguage);
      window.desktop.spellCheckingHelper.updateLanguage(this.state.spellcheckerLanguage);
    } else {
      logger.warn(`updateSpellcheckerLanguage: Tried to update language, but spellchecker not initialized`);
    }
  }

  public updateSuspendResume(prevState: Partial<ReduxHelperState>): void {
    if (this.state.isMachineAwake === prevState.isMachineAwake) return;

    logger.info(`updateSuspendResume: ${this.state.isMachineAwake}`);
    const eventName = this.state.isMachineAwake ? 'wake' : 'sleep';
    window.dispatchEvent(new Event(eventName));
  }

  /**
   * Potentially show an update banner in the webapp. We send an object wite
   * the following keys:
   *
   *    canUpdate       True if the current app supports auto-updates
   *    learnMoreUrl    URL to the release notes for this platform
   *    releaseVersion  The version number for the available update
   */
  public updateUpdateStatus(prevState: Partial<ReduxHelperState>) {
    const { updateStatus, updateInfo, releaseChannel, canUpdate, locale } = this.state as ReduxHelperState;
    if (updateStatus === prevState.updateStatus) return;

    if (window.TSSSB &&
      window.TSSSB.showUpdateBanner &&
      updateInfo && updateStatus === UPDATE_STATUS.UPDATE_DOWNLOADED) {

      window.TSSSB.showUpdateBanner({
        canUpdate,
        learnMoreUrl: getReleaseNotesUrl(releaseChannel === 'beta', locale),
        releaseVersion: updateInfo.releaseName
      });
    }
  }

  public getLastActiveTeamIdForTeamIds(teamsToSelect: Array<any>) {
    const teamLookup = teamsToSelect.reduce((acc, x) => {
      if (x) acc[x] = true;
      return acc;
    }, {});

    return this.lastSelectedTeams.filter((x) => x in teamLookup);
  }

  public customMenuItemClickedEvent({ itemId }: { itemId: string }): void {
    if (window.TSSSB &&
      window.TSSSB.customMenuItemClicked &&
      this.isSelectedTeam()) {
      window.TSSSB.customMenuItemClicked(itemId);
    }
  }

  public systemTextSettingsChangedEvent(): void {
    if (window.TSSSB && window.TSSSB.systemTextSettingsChanged) {
      window.TSSSB.systemTextSettingsChanged();
    }
  }

  public isSelectedTeam(): boolean {
    return window.teamId === this.state.currentTeamId;
  }

  /**
   * When the `locale` setting is changed, we'll make sure to update
   * any interop contexts (like webapp windows).
   *
   * @param {Partial<ReduxHelperState>} prevState
   */
  private updateLocale(prevState: Partial<ReduxHelperState>) {
    const { locale } = this.state as ReduxHelperState;

    if (locale !== prevState.locale) {
      $intl.applyLocale(locale);
    }
  }
}
