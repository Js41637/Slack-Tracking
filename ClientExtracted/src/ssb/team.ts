/**
 * @module SSBIntegration
 */ /** for typedoc */

import * as url from 'url';

import { find, isObject } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';

import { appTeamsActions } from '../actions/app-teams-actions';
import { dialogActions } from '../actions/dialog-actions';
import { Team, TeamBase, teamActions } from '../actions/team-actions';
import { logger } from '../logger';
import { settingStore } from '../stores/setting-store';
import { teamStore } from '../stores/team-store';

function fetchRecentMessages() {
  const { msgs } = window.TSSSB.recentMessagesFromCurrentChannel();

  const ret = msgs.reduce((acc: Array<string>, x: any) => {
    if (!x || !x.text) return acc;

    if (x.type !== 'message' || 'subtype' in x) return acc;

    const finalText = x.text
      .replace(/<[^>]+>/g, '')  // <U1234556>
      .replace(/:[a-zA-Z_]:/g, '')  // :slightly_smiling_face:
      .replace(/@[a-zA-Z0-9.-]+/g, '');

    acc.push(finalText);
    return acc;
  }, []);

  return ret;
}

export class TeamIntegration {
  public displayTeam(userId: string): void {
    appTeamsActions.selectTeamByUserId(userId);
  }

  public signInTeam(): void {
    dialogActions.showLoginDialog();
  }

  /**
   * Called from the webapp when the user finishes the sign-in flow.
   *
   * @param  {Array} teams        An array of team objects in the Enterprise
   *                              world, or a single team object pre-Enterprise
   * @param  {Boolean} selectTeam True to make the new team the selected team,
   *                              false to leave selection unchanged
   */
  public didSignIn(teams: Array<Team> | Team, selectTeam: boolean = true): void {
    if (Array.isArray(teams)) {
      teamActions.addTeams(teams, selectTeam);
    } else if (isObject(teams)) {
      teamActions.addTeam(teams, selectTeam);
    } else {
      logger.warn(`didSignIn: didSignIn called with invalid team object, do nothing`, teams);
    }

    dialogActions.hideLoginDialog();
  }

  public didSignOut(teamIds: Array<any> | string | object): void {
    if (Array.isArray(teamIds)) {
      teamActions.removeTeams(teamIds);
    } else {
      teamActions.removeTeam(teamIds as string);
    }
  }

  public refreshTileColors(): void {
    if (window.teamId) {
      teamActions.updateTheme(window.TSSSB.getThemeValues(), window.teamId);
    } else {
      setTimeout(() => this.refreshTileColors(), 500);
    }
  }

  public setImage(imageUrl: string): void {
    if (window.teamId) {
      teamActions.updateIcons(imageUrl, window.teamId);
    } else {
      setTimeout(() => this.setImage(imageUrl), 500);
    }
  }

  /**
   * Returns the IDs of all currently signed in teams.
   * @returns {Array} The IDs of the currently signed in teams.
   */
  public getSignedInTeamIds(): Array<string> {
    return teamStore.getTeamIds();
  }

  /**
   * Find a team by subdomain and returns its team ID.
   *
   * @param {String} subdomain  The subdomain, e.g. 'tinyspeck'
   * @returns {String|null}     The ID of the team that matches, or null
   */
  public findTeamIdForSubdomain(subdomain: string): string|null {
    const matchingTeam = find<TeamBase>(teamStore.teams, (team) => {
      if (!team || !team.team_url) return false;
      const hostname = url.parse(team.team_url).hostname;
      return hostname.split('.')[0] === subdomain;
    });

    return matchingTeam
      ? matchingTeam.team_id
      : null;
  }

  public fetchContentForChannel(retries: number = 0): void {
    // Do nothing if we have a language set
    if (settingStore.getSetting('spellcheckerLanguage')) {
      logger.debug(`Asked to provide hint content for channel, but refusing: spellcheckerLanguage is set`);
      return;
    }

    const observableFetchRecentMessages = Observable.create((subj: Observer<string>) => {
      try {
        const ret = fetchRecentMessages().join('\n');
        if (ret.length < 10) {
          subj.error(new Error('Failed to fetch recent messages'));
        } else {
          subj.next(ret);
          subj.complete();
        }
      } catch (e) {
        subj.error(e);
      }

      return Subscription.EMPTY;
    });

    let fetchWithRetry = observableFetchRecentMessages
      .catch((e: Error) => Observable.timer(2000).flatMap(() => Observable.throw(e)));

    if (retries > 0) {
      fetchWithRetry = fetchWithRetry.retry(retries);
    }

    fetchWithRetry
      .filter(() => !!window.winssb.spellCheckingHelper)
      .subscribe(
        (msgs: string) => window.winssb.spellCheckingHelper!.spellCheckHandler.provideHintText(msgs),
        (e: Error) => logger.info(`Couldn't get hint text from messages in channel: ${e.message}`)
      );
  }

  public displayChannel(channelId: string): void {
    this.fetchContentForChannel(2);
    appTeamsActions.selectChannel(channelId);
  }

  public invalidateAuth(): void {
    window.location.reload();
  }

  public teamNameChanged(name: string): void {
    teamActions.updateTeamName(name, window.teamId!);
  }

  public teamDomainChanged(url: string): void {
    teamActions.updateTeamUrl(url, window.teamId!);
  }

  public setTeamIdleTimeout(): void {
    // Min-web is disabled for 2.7.0
  }

  /**
   * @deprecated use team updates through `didSignIn` / `didSignOut` instead of this.
   */
  public update(teamInfo: any): void {
    logger.debug(`Webapp update with teams: ${JSON.stringify(teamInfo)}`);
  }

  public getLastActiveTeamIdForTeamIds(teamsToSelect: any): Array<string> {
    return window.winssb.reduxHelper.getLastActiveTeamIdForTeamIds(teamsToSelect);
  }

  /**
   * Notify current team's locale into desktop client.
   * Desktop client expects this to be called each time team's bootup (after `DidFinishLoading`)
   * and each time webapp changes its locale preferences to detect locale and switch it accordingly.
   *
   * @param  {String} locale locale of team. Requires form of `${locale}-${region}`,
   * while region code is optional and can be skipped.
   */
  public setTeamLocale(locale: string): void {
    teamActions.updateTeamLocale(locale, window.teamId!);
  }
}
