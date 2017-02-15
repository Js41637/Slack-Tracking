import {sum} from '../utils/sum';
import {Store} from '../lib/store';

export class TeamStore {
  public get teams() {
    return Store.getState().teams;
  }

  /**
   * Returns the IDs of all currently signed in teams.
   * @return {Array} The IDs of the currently signed in teams.
   */
  public getTeamIds(): Array<string> {
    return Object.keys(this.teams);
  }

  public getTeam(teamId: string) {
    return this.teams[teamId];
  }

  public getNumTeams(): number {
    return this.getTeamIds().length;
  }

  public getCombinedUnreadInfo() {
    const teamList = this.teams;

    return {
      unreads: sum(teamList, 'unreads'),
      unreadHighlights: sum(teamList, 'unreadHighlights'),
      showBullet: Object.keys(teamList).some((key) => {
        const {showBullet, unreads} = teamList[key];
        return showBullet && unreads > 0;
      })
    };
  }
}

const teamStore = new TeamStore();

export {
  teamStore
};
