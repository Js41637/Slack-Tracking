import _ from 'lodash';
import {Disposable, Observable} from 'rx';
import logger from '../logger';

import AppActions from '../actions/app-actions';
import TeamActions from '../actions/team-actions';

function fetchRecentMessages(userIdToFind="__current__") {
  let {user_id, msgs} = window.TSSSB.recentMessagesFromCurrentChannel();
  if (userIdToFind === "__current__") userIdToFind = user_id;

  let ret = msgs.reduce((acc,x) => {
    if (!x || !x.text) return acc;
    if (userIdToFind && x.user !== userIdToFind) return acc;

    if (x.type !== 'message' || 'subtype' in x) return acc;

    acc.push(x.text.replace(/<[^>]+>/g, ''));
    return acc;
  }, []);

  // If we can't find enough messages written by the current user, just
  // return the latest messages
  let textLength = ret.reduce((acc,x) => acc + x.length, 0);
  if (textLength < 10 && userIdToFind) return fetchRecentMessages(null);

  return ret;
}

export default class TeamIntegration {
  displayTeam(userId) {
    AppActions.selectTeamByUserId(userId);
  }

  signInTeam() {
    AppActions.showLoginDialog();
  }

  signOutTeam() {
    if (window.TS && window.TS.boot_data.logout_url) {
      window.TS.utility.loadUrlInWindowIfOnline(window.TS.boot_data.logout_url);
      return true;
    } else {
      return false;
    }
  }

  /**
   * Called from the webapp when the user finishes the sign-in flow.
   *
   * @param  {Array} teams  An array of team objects in the Enterprise world,
   * or a single team object pre-Enterprise
   */
  didSignIn(teams) {
    if (_.isArray(teams)) {
      TeamActions.addTeams(teams);
    } else if (_.isObject(teams)) {
      TeamActions.addTeam(teams);
    }

    AppActions.hideLoginDialog();
  }

  didSignOut(teamIds) {
    if (_.isArray(teamIds)) {
      TeamActions.removeTeams(teamIds);
    } else {
      TeamActions.removeTeam(teamIds);
    }
  }

  refreshTileColors() {
    if (window.teamId) {
      TeamActions.updateTheme(window.TSSSB.getThemeValues(), window.teamId);
    } else {
      setTimeout(() => this.refreshTileColors(), 500);
    }
  }

  setImage(imageUrl) {
    if (window.teamId) {
      TeamActions.updateIcons(imageUrl, window.teamId);
    } else {
      setTimeout(() => this.setImage(imageUrl), 500);
    }
  }

  fetchContentForChannel(retries=0) {
    let observableFetchRecentMessages = Observable.create((subj) => {
      try {
        let ret = fetchRecentMessages().join("\n");
        if (ret.length < 10) {
          subj.onError(new Error("Failed to fetch recent messages"));
        } else {
          subj.onNext(ret);
          subj.onCompleted();
        }
      } catch (e) {
        subj.onError(e);
      }

      return Disposable.empty;
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
    AppActions.selectChannel(channelId);
  }

  invalidateAuth() {
    window.location.reload();
  }

  teamNameChanged(name) {
    TeamActions.updateTeamName(name, window.teamId);
  }

  teamDomainChanged(url) {
    TeamActions.updateTeamUrl(url, window.teamId);
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
