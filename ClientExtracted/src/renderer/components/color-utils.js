import Color from 'color';
import ThemeMock from '../../mocks/theme-mock';

/**
 * Returns a suitable sidebar color as a hex string.
 */ 
export function getSidebarColor(team) {
  return getSidebarColorForTeam(team).rgbString();
}

/**
 * Returns the color that will be most visible against the sidebar color for
 * the given team.
 *  
 * @param  {Object} team The team 
 * @return {String}      Black or white, as a hex string
 */ 
export function getTextColor(team) {
  let sidebarColor = getSidebarColorForTeam(team);
  
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
function getSidebarColorForTeam(team) {
  let theme = team && team.theme ?
    team.theme :
    ThemeMock.get();
  
  let column = Color(theme.column_bg);
  
  // NB: Light themes, such as Hoth, look better this way 
  if (column.light()) {
    return column.darken(0.10).desaturate(0.10);
  } else {
    return column.darken(0.5);
  }
}