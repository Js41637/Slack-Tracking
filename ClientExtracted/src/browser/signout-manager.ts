/**
 * Whenever we want to remove a team, we really need to do two things:
 *
 * 1) Remove the team from the app's team list
 * 2) Remove the cookie for said team
 *
 * We can do 1) in-house, but we're using the help of Slack's backend
 * for 2). This component is in charge of team removal, using the foll-
 * owing flow:
 *
 * - The user requests a team to be removed or signed out (this fires the
 *   `signOutTeamEvent`)
 * - This component is informed by Redux, and immediately removes the team
 *   from our main team list (teamActions.removeTeam). It also adds the team
 *   to the list of teams to sign out (appTeamsActions.signoutTeam).
 * - Now, that the team is on the list of teams to sign out, we will attempt
 *   to call https://slack.com/account-remove-api/<TeamId>. We don't need
 *   anything fancy, we can load this URL in any web session for which we'd
 *   like to remove cookies.
 *
 *   HTTP RESPONSE CODES
 *   200: Cookie removed
 *   404: Team not found
 *   500: Uh-oh!
 *
 * - Optional: Should the user close the app before we managed to sign out,
 *   we'll try again the next time the app is opened.
 * - Once the team was signed out, we remove it from the list of teams to
 *   sign out and close the case.
 *
 * @module Browser
 */ /** for typedoc */

import { BrowserWindow } from 'electron';
import { Observable } from 'rxjs/Observable';

import { ReduxComponent } from '../lib/redux-component';
import { logger } from '../logger';

import { appTeamsActions } from '../actions/app-teams-actions';
import { teamActions } from '../actions/team-actions';
import { appTeamsStore } from '../stores/app-teams-store';

export type DidGetResponseDetailsSelector =
  (event: Electron.Event,
   status: boolean,
   newURL: string,
   originalURL: string,
   httpResponseCode: number,
   requestMethod: string,
   referrer: string,
   headers: any,
   resourceType: string) => Electron.DidGetResponseDetailsArguments;

export type DidFailLoadSelector =
  (event: Electron.Event,
   errorCode: number,
   errorDescription: string,
   validatedURL: string,
   isMainFrame: boolean) => Electron.DidFailLoadArguments;

export interface SignoutManagerState {
  teamsToSignOut: Array<string>;
}

export class SignoutManager extends ReduxComponent<SignoutManagerState> {
  private triedTeams: Array<string>;

  constructor(...args: Array<any>) {
    super(args);
    this.triedTeams = [];
  }

  public syncState(): SignoutManagerState {
    return {
      teamsToSignOut: appTeamsStore.getTeamsToSignOut()
    };
  }

  /**
   * Whenever we get a new team to sign out, we check if we already tried - if
   * not, we go ahead.
   *
   * @param {SignoutManagerState} prevState
   */
  public update(prevState: SignoutManagerState) {
    const teamsToRemove = this.state.teamsToSignOut
      .filter((teamId) => !prevState.teamsToSignOut.includes(teamId));
    const teamsToSignout = teamsToRemove
      .filter((teamId) => !this.triedTeams.includes(teamId));

    teamsToRemove.forEach((teamToRemove) => {
      // Do this right after being done with update()
      setTimeout(() => {
        logger.info(`SignoutManager: Removing team ${teamToRemove} from teams list.`);
        teamActions.removeTeam(teamToRemove);
      }, 0);
    });

    teamsToSignout.forEach((teamToSignOut) => {
      logger.info(`SignoutManager: We got a team to sign out (it's ${teamToSignOut})!`);
      this.signoutSingleTeam(teamToSignOut);
    });
  }

  /**
   * Handles a signout result, accepting both a teamId and a HTTP response code.
   *
   * @param {string} teamId
   * @param {number} code
   */
  private teamWasSignedOut(teamId: string, code: number): void {
    if (!teamId) return;

    logger.info(`SignoutManager: Attempted to sign out of team ${teamId}. Result: ${code}`);

    // 200: We signed out!
    // 404: Team not found (or bad team id)
    // 500: Something else went wrong
    // As long as we got some response from the backend, we'll consider this a success
    if (code === 200) {
      logger.info(`SignoutManager: Successfully removed cookie for team ${teamId}.`);
    } else if (code === 404) {
      logger.info(`SignoutManager: Could not find team ${teamId}. No need to sign out.`);
    } else if (code === 500) {
      logger.info(`SignoutManager: Server error. Considering signout not crucial.`);
    } else {
      logger.info(`SignoutManager: Unexpected response code ${code}, considering signout not crucial.`);
    }

    logger.info(`SignoutManager: We're considering the team singed out, now removing.`);
    appTeamsActions.signedOutTeam(teamId);

    // Ensure that you can remove a team, add it again, and remove it again
    this.triedTeams = this.triedTeams.filter((_teamId) => teamId !== _teamId);
  }

  /**
   * Closes the given BrowserWindow and removes it from the list of windows.
   *
   * @param {Electron.BrowserWindow} browserWindow
   */
  private closeWindow(browserWindow: Electron.BrowserWindow): void {
    // Fun fact: Closing the browserWindow *directly* after receveiving a
    // "did-fail-load" event crashes Electron 1.6+ hard. Delaying the close op
    // by some time fixes that - nextTick is likely fine, but we're going with
    // a full second for that extra safety.
    // Reference: https://github.com/electron/electron/issues/8930
    setTimeout(() => {
      if (!browserWindow.isDestroyed()) {
        try {
          // No reason to be nice about it
          browserWindow.destroy();
        } catch (e) {
          logger.error('Tried to close signout browser window, but failed', e);
        }
      }
    }, 1000);
  }

  /**
   * Signs out a signle team by opening up a BrowserWindow and navigating directly
   * to the backend's signout method.
   *
   * @param {string} teamId
   */
  private signoutSingleTeam(teamId: string): void {
    const signoutUrl = `https://slack.com/account-remove-api/${teamId}`;
    const signoutWindow = new BrowserWindow({ show: false });
    this.triedTeams.push(teamId);

    // Wondering what is happening here? Don't worry, we're just taking all of Electron's event arguments
    // and are mushing them into an object so that RXJS doesn't drop them.
    const responseSelector: DidGetResponseDetailsSelector =
      function(event: Electron.Event, status: boolean, newURL: string, originalURL: string, httpResponseCode: number,
               requestMethod: string, referrer: string, headers: any, resourceType: string): Electron.DidGetResponseDetailsArguments {
        return { event, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType };
    };
    const failSelector: DidFailLoadSelector =
      function(event: Electron.Event, errorCode: number, errorDescription: string, validatedURL: string,
               isMainFrame: boolean): Electron.DidFailLoadArguments {
        return { event, errorCode, errorDescription, validatedURL, isMainFrame };
    };

    // We'll listen for either a succesful load (cool, we're signed out) or a failure
    // (something went wrong, most likely loss of Internet).
    const windowDidLoadOrFail = Observable.merge(
      Observable.fromEvent(signoutWindow.webContents, 'did-get-response-details', responseSelector),
      Observable.fromEvent(signoutWindow.webContents, 'did-fail-load', failSelector)
        .flatMap((errorDetails) => Observable.throw(errorDetails))
    ).take(1);

    const windowDidLoad = ({ httpResponseCode }: Electron.DidGetResponseDetailsArguments) => {
      logger.info(`SignoutManager: Backend attempted to remove cookie: ${httpResponseCode}.`);
      this.teamWasSignedOut(teamId, httpResponseCode);
    };
    const windowDidNotLoad = ({ errorCode, errorDescription }: Electron.DidFailLoadArguments) => {
      logger.error(`SignoutManager: Unable to signout team: ${errorCode}; ${errorDescription}`);
      this.closeWindow(signoutWindow);
    };

    // Subscribe to the events, load the url, and hope for the best ✌️
    logger.info(`SignoutManager: Making signout request: ${signoutUrl}`);
    windowDidLoadOrFail.subscribe(windowDidLoad, windowDidNotLoad, () => this.closeWindow(signoutWindow));
    signoutWindow.loadURL(signoutUrl);
  }
}
