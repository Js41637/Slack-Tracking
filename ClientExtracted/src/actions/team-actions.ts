/**
 * @module Actions
 */ /** for typedoc */

import { Store } from '../lib/store';
import { StringMap } from '../utils/shared-constants';
import { TEAMS } from './';

export interface TeamIcons {
  image_34: string;
  image_44: string;
  image_68: string;
  image_88: string;
  image_102: string;
  image_132: string;
  image_230: string;
  image_512: string;
  image_original: string;
}

export interface TeamTheme {
  active_item: string;
  active_item_text: string;
  active_presence: string;
  badge: string;
  column_bg: string;
  hover_item: string;
  menu_bg: string;
  text_color: string;
}

export interface TeamBase {
  id?: string;
  name: string;
  team_id: string;
  team_name: string;
  team_url: string;
  initials: string;
  user_id: string;
  theme: TeamTheme;
  icons: TeamIcons;
  usage: number;
  idle_timeout: number;
  showBullet: boolean;
  unreadHighlights: number;
  unreads: number;
  locale: string;
}

export type Team = Readonly<TeamBase>;

export class TeamActions {
  public addTeam(team: Team, selectTeam: boolean): void {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAM,
      data: team,
      omitKeysFromLog: ['name', 'team_name', 'team_url'],
      selectTeam
    });
  }

  public addTeams(teams: Array<Team>, selectTeam: boolean): void {
    Store.dispatch({
      type: TEAMS.ADD_NEW_TEAMS,
      data: teams,
      omitKeysFromLog: ['name', 'team_name', 'team_url'],
      selectTeam,
    });
  }

  public removeTeam(teamId: string): void {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAM,
      data: teamId
    });
  }

  public removeTeams(teamIds: Array<string>): void {
    Store.dispatch({
      type: TEAMS.REMOVE_TEAMS,
      data: teamIds
    });
  }

  public updateTheme(theme: StringMap<string>, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_THEME,
      data: { theme, teamId }
    });
  }

  public updateIcons(icons: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_ICONS,
      data: { icons, teamId }
    });
  }

  public updateTeamUsage(usagePerTeam: StringMap<any>): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_USAGE,
      data: usagePerTeam
    });
  }

  public updateTeamName(name: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_NAME,
      data: { name, teamId },
      omitKeysFromLog: ['name']
    });
  }

  public updateTeamUrl(url: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_URL,
      data: { url, teamId },
      omitKeysFromLog: ['url']
    });
  }

  public updateUserId(userId: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_USER_ID,
      data: { userId, teamId }
    });
  }

  public updateTeamLocale(locale: string, teamId: string): void {
    Store.dispatch({
      type: TEAMS.UPDATE_TEAM_LOCALE,
      data: { locale, teamId }
    });
  }
}

const teamActions = new TeamActions();
export {
  teamActions
};
