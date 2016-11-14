import sum from '../utils/sum';
import sortBy from 'lodash.sortby';

/**  
 * Returns an array of teams sorted by usage, that accounts for at least 70%
 * of the total time spent in app. This could be a subset of all signed in
 * teams, if one or two account for the majority of usage.
 *    
 * @param  {Object} teams         A hash of all current teams
 * @param  {Number} usageTarget   A tuning constraint, where 1.0 returns all
 * teams, and 0.0 returns only the most used team.
 * 
 * @return {Array}                An array of the n most used team IDs
 */   
export default function getMostUsedTeams(teams, usageTarget = 0.7) {
  let usagePairs = Object.keys(teams).map((id) => {
    return [id, teams[id].usage || 0];
  });
  
  let sortedPairs = sortBy(usagePairs, ([,usage]) => usage).reverse();
  let totalTimeUsed = sum(usagePairs, ([,usage]) => usage);
  
  let mostUsedTeams = [];
  let usageTotal = 0.0;
  
  for (let [teamId, usage] of sortedPairs) {
    mostUsedTeams.push(teamId);
    
    usageTotal += (usage / totalTimeUsed);
    if (usageTotal >= usageTarget) break;
  }
  
  return mostUsedTeams;
}