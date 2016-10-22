import _ from 'lodash';
import Store from '../lib/store';

class TeamStore {
  getTeams() {
    return Store.getState().teams;
  }

  getTeam(teamId) {
    return this.getTeams()[teamId];
  }

  getNumTeams() {
    return Object.keys(this.getTeams()).length;
  }

  getCombinedUnreadInfo() {
    let teamList = this.getTeams();

    return {
      unreads: _.sum(teamList, 'unreads'),
      unreadHighlights: _.sum(teamList, 'unreadHighlights'),
      showBullet: _.some(teamList, ({showBullet, unreads}) => {
        return showBullet && unreads > 0;
      })
    };
  }
}

export default new TeamStore();
