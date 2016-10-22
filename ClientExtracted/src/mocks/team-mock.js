import Mock from '../lib/mock';
import ThemeMock from './theme-mock';
import IconsMock from './icons-mock';

class TeamMock extends Mock {

  base = {
    icons: IconsMock.get(),
    initials: "SC",
    name: "John Cena",
    team_id: "T024BE7LD",
    team_name: "Slack Corp",
    team_url: "https://tinyspeck.slack.com/",
    theme: ThemeMock.get(),
    unreads: 0,
    unreadHighlights: 0
  };

}

let mock = new TeamMock();
export default mock;
