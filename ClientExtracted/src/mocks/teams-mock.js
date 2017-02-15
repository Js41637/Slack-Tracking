/*eslint no-unused-vars:0*/

import Mock from '../lib/mock';
import TeamMock from './team-mock';
import cloneDeep from 'lodash.clonedeep';
import values from 'lodash.values';

class TeamsMock extends Mock {

  base() {
    let teams = {};
    let team = TeamMock.get();
    for(let i = 0; i < 3; i++) {
      team.team_id = `id${i}`;
      team.webViewId = `webView${i}`;
      teams[team.team_id] = cloneDeep(team);
    }
    return teams;
  }

  // Similar to the way we receive it from the ssb
  array(original) {
    return values(original);
  }

  empty(original) {
    return {};
  }

}

let mock = new TeamsMock();
export default mock;
