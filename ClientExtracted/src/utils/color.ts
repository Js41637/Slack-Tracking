import * as Kolor from 'color';
import ThemeMock from '../mocks/theme-mock';
import {Team} from '../actions/team-actions';

/**
 * Returns a suitable sidebar color as a hex string.
 */
export function getSidebarColor(team: Team): string {
  return getSidebarColorForTeam(team).rgbString();
}

/**
 * Returns the color that will be most visible against the sidebar color for
 * the given team.
 *
 * @param  {Object} team The team
 * @return {String}      Black or white, as a hex string
 */
export function getTextColor(team: Team): string {
  const sidebarColor = getSidebarColorForTeam(team);

  return sidebarColor.light() ?
    '#000000' :
    '#FFFFFF';
}

/**
 * Returns a suitable sidebar color for the team, given its theme.
 *
 * @param  {Object} team  The team
 * @return {Color}        A `Color` instance
 */
function getSidebarColorForTeam(team: Team): Color.Color {
  const theme = team && team.theme ?
    team.theme :
    ThemeMock.get();

  const column = Kolor(theme.column_bg);

  // NB: Light themes, such as Hoth, look better this way
  if (column.light()) {
    return column.darken(0.10).desaturate(0.10);
  } else {
    return column.darken(0.5);
  }
}
