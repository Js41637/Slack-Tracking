import {sum} from '../utils/sum';
import * as sortBy from 'lodash.sortby';

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
export function getMostUsedTeams(teams: Object, usageTarget: number = 0.7) {
  const usagePairs = Object.keys(teams).map((id) => [id, teams[id].usage || 0]);

  const sortedPairs = sortBy(usagePairs, ([, usage]: Array<number>) => usage).reverse();
  const totalTimeUsed = sum(usagePairs, ([, usage]) => usage);

  const mostUsedTeams: Array<string> = [];
  let usageTotal = 0.0;

  for (const [teamId, usage] of sortedPairs) {
    mostUsedTeams.push(teamId);

    usageTotal += (usage / totalTimeUsed);
    if (usageTotal >= usageTarget) break;
  }

  return mostUsedTeams;
}
