/**
 * @module Mocking
 */ /** for typedoc */

import { Mock } from '../lib/mock';
import { teamMock } from './team-mock';
import { StringMap } from '../utils/shared-constants';
import * as cloneDeep from 'lodash.clonedeep';
import * as values from 'lodash.values';

class TeamsMock extends Mock {
  public base() {
    const teams = {};
    const team = teamMock.get<StringMap<any>>();
    for (let i = 0; i < 3; i++) {
      team.team_id = `id${i}`;
      team.webViewId = `webView${i}`;
      teams[team.team_id] = cloneDeep(team);
    }
    return teams;
  }

  // Similar to the way we receive it from the ssb
  public array(original: any): any {
    return values(original);
  }

  public empty(_original: any): {} {
    return {};
  }

}

const teamsMock = new TeamsMock();
export {
  teamsMock
};
