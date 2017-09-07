/**
 * @module MagicLogin
 */ /** for typedoc */

import { BrowserWindow } from 'electron';
import { executeJavaScriptMethod } from 'electron-remote';
import { Observable } from 'rxjs/Observable';
import { logger } from '../logger';

import { dialogActions } from '../actions/dialog-actions';
import { Team, teamActions } from '../actions/team-actions';

interface MagicLoginResponse {
  team: string;
  team_name: string;
  user: string;
  user_name: string;
  redir: string;
}

 /** @function processMagicLoginLink
  * Handles a magic login link in the format: slack://{teamId}/magic-login/{token}, e.g.,
  * slack://T043R3J9D/magic-login/19218149206-xCrsTWrV4w
  *
  * To do this, we make an API call to auth.loginMagic in a new BrowserWindow.
  * Then we parse the response, which if all went well contains all of the
  * information we need to add a new team.
  */
export function processMagicLoginLink({ teamId, token }: {teamId: string, token: string}): void {

  // The `loginMagic` request will modify the auth cookie for us, but we have
  // to make the request in the context of a BrowserWindow.
  const authWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: require.resolve('./preload')
    }
  });

  const windowDidLoadOrFail = Observable.merge(
    Observable.fromEvent(authWindow.webContents, 'did-finish-load'),
    Observable.fromEvent(authWindow.webContents, 'did-fail-load')
      .flatMap(() => Observable.throw(new Error('Window failed to load')))
  ).take(1);

  // The team info is contained within the JSON response, which is now loaded
  // in the `document.body`. Get at it using remote evaluation.
  windowDidLoadOrFail
    .flatMap(() => executeJavaScriptMethod(authWindow, 'document.body.innerText'))
    .flatMap((response: string) => checkResponseOk(JSON.parse(response)))
    .map((response) => teamFromLoginMagicResponse(response))
    .subscribe(
      (team: Team) => {
        teamActions.addTeam(team, true);
        dialogActions.hideLoginDialog();
      },
      (err) => {
        logger.error(`Unable to add team: ${err.message}`);
        authWindow.close();
      },
      () => authWindow.close()
    );

  const loginMagicUrl = `https://slack.com/api/auth.loginMagic?team=${teamId}&magic_token=${token}&ssb=1`;
  logger.info(`Making loginMagic request: ${loginMagicUrl}`);

  authWindow.loadURL(loginMagicUrl);
}

function checkResponseOk(response: any): Observable<any> {
  if (response.ok) {
    return Observable.of(response);
  } else {
    return Observable.throw(new Error(response.error));
  }
}

function teamFromLoginMagicResponse({ team, team_name, user, user_name, redir }: MagicLoginResponse): Team {
  return {
    team_id: team,
    team_name,
    id: user,
    name: user_name,
    team_url: redir
  } as any as Team;
}
