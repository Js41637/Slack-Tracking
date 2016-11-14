import sum from '../utils/sum';
import Store from '../lib/store';

class TeamStore {
  getTeams() {
    return Store.getState().teams;
  }

  /**
   * Returns the IDs of all currently signed in teams.
   * @return {Array} The IDs of the currently signed in teams.
   */
  getTeamIds() {
    return Object.keys(this.getTeams());
  }

  getTeam(teamId) {
    return this.getTeams()[teamId];
  }

  getNumTeams() {
    return this.getTeamIds().length;
  }

  getCombinedUnreadInfo() {
    let teamList = this.getTeams();

    return {
      unreads: sum(teamList, 'unreads'),
      unreadHighlights: sum(teamList, 'unreadHighlights'),
      showBullet: Object.keys(teamList).some((key) => {
        let {showBullet, unreads} = teamList[key];
        return showBullet && unreads > 0;
      })
    };
  }
}

export default new TeamStore();
