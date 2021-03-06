/**
 * @module Stores
 */ /** for typedoc */

import { TeamBase } from '../actions/team-actions';
import { Store } from '../lib/store';
import { StringMap } from '../utils/shared-constants';

export class TeamStore {
  public get teams(): StringMap<TeamBase> {
    return Store.getState().teams;
  }

  /**
   * Returns the IDs of all currently signed in teams.
   * @return {Array} The IDs of the currently signed in teams.
   */
  public getTeamIds(): Array<string> {
    return Object.keys(this.teams);
  }

  public getTeam(teamId: string | null) {
    if (!teamId) return null;
    return this.teams[teamId];
  }

  public getNumTeams(): number {
    return this.getTeamIds().length;
  }
}

const teamStore = new TeamStore();

export {
  teamStore
};
