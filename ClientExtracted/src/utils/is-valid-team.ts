import { Team } from '../actions/team-actions';
import { isObject } from './is-object';

/**
 * Every now and then, the webapp accidentially adds a team that doesn't have
 * a url or an id attached. While that *shouldn't* happen, the app enters a
 * weird state when it does - so we're using a typeguard here.
 *
 * @param {*} teamLike
 * @returns {teamLike is Team}
 */
export function isValidTeam(teamLike: any): teamLike is Team {
  return !!(teamLike && isObject(teamLike) && teamLike.team_id && teamLike.team_url);
}
