/**
 * @module Mocking
 */ /** for typedoc */

import { Mock } from '../lib/mock';
import { themeMock } from './theme-mock';
import { iconsMock } from './icons-mock';

class TeamMock extends Mock {
  public readonly base = {
    icons: iconsMock.get(),
    initials: 'SC',
    name: 'John Cena',
    team_id: 'T024BE7LD',
    team_name: 'Slack Corp',
    team_url: 'https://tinyspeck.slack.com/',
    theme: themeMock.get(),
    unreads: 0,
    unreadHighlights: 0
  };

}

const teamMock = new TeamMock();
export {
  teamMock
};
