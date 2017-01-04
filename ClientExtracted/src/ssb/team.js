import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {logger} from '../logger';
import {isObject} from '../utils/is-object';

import {appTeamsActions} from '../actions/app-teams-actions';
import {dialogActions} from '../actions/dialog-actions';
import {teamActions} from '../actions/team-actions';
import TeamStore from '../stores/team-store';

function fetchRecentMessages() {
  let {msgs} = window.TSSSB.recentMessagesFromCurrentChannel();

  let ret = msgs.reduce((acc,x) => {
    if (!x || !x.text) return acc;

    if (x.type !== 'message' || 'subtype' in x) return acc;

    let finalText = x.text
      .replace(/<[^>]+>/g, '')  // <U1234556>
      .replace(/:[a-zA-Z_]:/g, '')  // :slightly_smiling_face:
      .replace(/@[a-zA-Z0-9.-]+/g, '');

    acc.push(finalText);
    return acc;
  }, []);

  return ret;
}

export default class TeamIntegration {
  displayTeam(userId) {
    appTeamsActions.selectTeamByUserId(userId);
  }

  signInTeam() {
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
  didSignIn(teams, selectTeam = true) {
    if (Array.isArray(teams)) {
      teamActions.addTeams(teams, selectTeam);
    } else if (isObject(teams)) {
      teamActions.addTeam(teams, selectTeam);
    }

    dialogActions.hideLoginDialog();
  }

  didSignOut(teamIds) {
    if (Array.isArray(teamIds)) {
      teamActions.removeTeams(teamIds);
    } else {
      teamActions.removeTeam(teamIds);
    }
  }

  refreshTileColors() {
    if (window.teamId) {
      teamActions.updateTheme(window.TSSSB.getThemeValues(), window.teamId);
    } else {
      setTimeout(() => this.refreshTileColors(), 500);
    }
  }

  setImage(imageUrl) {
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
  getSignedInTeamIds() {
    return TeamStore.getTeamIds();
  }

  fetchContentForChannel(retries=0) {
    let observableFetchRecentMessages = Observable.create((subj) => {
      try {
        let ret = fetchRecentMessages().join("\n");
        if (ret.length < 10) {
          subj.error(new Error("Failed to fetch recent messages"));
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
      .catch((e) => Observable.timer(2000).flatMap(() => Observable.throw(e)));

    if (retries > 0) {
      fetchWithRetry = fetchWithRetry.retry(retries);
    }

    fetchWithRetry.subscribe(
      (msgs) => window.winssb.spellCheckingHelper.spellCheckHandler.provideHintText(msgs),
      (e) => logger.info(`Failed to get messages from webapp: ${e.message}`));
  }

  displayChannel(channelId) {
    this.fetchContentForChannel(2);
    appTeamsActions.selectChannel(channelId);
  }

  invalidateAuth() {
    window.location.reload();
  }

  teamNameChanged(name) {
    teamActions.updateTeamName(name, window.teamId);
  }

  teamDomainChanged(url) {
    teamActions.updateTeamUrl(url, window.teamId);
  }

  /**
   * Changes the duration that a team must remain unselected before it will be
   * unloaded.
   *
   * @param  {Number} timeout The timeout duration, in seconds
   */
  setTeamIdleTimeout(timeout) {
    teamActions.setTeamIdleTimeout(timeout, window.teamId);
  }

  // We now handle team updates through `didSignIn` / `didSignOut`, so this
  // method is unused
  update(teamInfo) {
    logger.debug(`Webapp update with teams: ${JSON.stringify(teamInfo)}`);
  }

  getLastActiveTeamIdForTeamIds(teamsToSelect) {
    return window.winssb.reduxHelper.getLastActiveTeamIdForTeamIds(teamsToSelect);
  }
}
