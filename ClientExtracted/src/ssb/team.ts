import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {logger} from '../logger';
import {isObject} from '../utils/is-object';

import {appTeamsActions} from '../actions/app-teams-actions';
import {dialogActions} from '../actions/dialog-actions';
import {Team, teamActions} from '../actions/team-actions';
import {teamStore} from '../stores/team-store';

function fetchRecentMessages() {
  const {msgs} = window.TSSSB.recentMessagesFromCurrentChannel();

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
    }

    dialogActions.hideLoginDialog();
  }

  public didSignOut(teamIds: Array<any> | Object): void {
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

  public fetchContentForChannel(retries: number = 0): void {
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

    fetchWithRetry.subscribe(
      (msgs: string) => window.winssb.spellCheckingHelper.spellCheckHandler.provideHintText(msgs),
      (e: Error) => logger.info(`Failed to get messages from webapp: ${e.message}`));
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

  /**
   * Changes the duration that a team must remain unselected before it will be
   * unloaded.
   *
   * @param  {Number} timeout The timeout duration, in seconds
   */
  public setTeamIdleTimeout(timeout: number): void {
    teamActions.setTeamIdleTimeout(timeout, window.teamId!);
  }

  // We now handle team updates through `didSignIn` / `didSignOut`, so this
  // method is unused
  public update(teamInfo: any): void {
    logger.debug(`Webapp update with teams: ${JSON.stringify(teamInfo)}`);
  }

  public getLastActiveTeamIdForTeamIds(teamsToSelect: any): Array<string> {
    return window.winssb.reduxHelper.getLastActiveTeamIdForTeamIds(teamsToSelect);
  }
}
