import { app } from 'electron';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Credentials, dialogActions } from '../actions/dialog-actions';
import { dialogStore } from '../stores/dialog-store';
import { logger } from '../logger';
import { ReduxComponent } from '../lib/redux-component';

export interface BasicAuthHandlerState {
  authInfo: Electron.LoginAuthInfo;
  credentials: Credentials;
}

interface LoginEventArgs {
  event: Electron.Event;
  request: Electron.LoginRequest;
  authInfo: Electron.LoginAuthInfo;
  callback: (username: string, password: string) => void;
}

interface LoginCompletedArgs {
  username: string;
  password: string;
  callback: (username: string, password: string) => void;
}

/**
 * When the browser wants to show a basic auth dialog (e.g., when a proxy
 * server is configured), this component will handle the interaction.
 */
export class BasicAuthHandler extends ReduxComponent<BasicAuthHandlerState> {
  private authInfoObservable: Subject<any> = new Subject();

  constructor(options: any = {}) {
    super();

    if (options.authInfoObservable) {
      this.authInfoObservable = options.authInfoObservable;
    }

    // NB: Take the parameters we need from the event
    const loginEvent = options.loginObservable || Observable.fromEvent(app, 'login',
      (e, _webContents, request, authInfo, callback) => ({ event: e, request, authInfo, callback }));

    /**
     * When we get a login event:
     * 1. Show only one dialog at a time
     * 2. Wait for the user to enter their credentials
     * 3. Invoke the callback from the Electron event
     */
    this.disposables.add(loginEvent
      .filter(() => this.state.authInfo === null)
      .do(({ event, authInfo, request }: LoginEventArgs) => this.showAuthDialog(event, authInfo, request))
      .flatMap(({ callback }: { callback: Function }) => this.credentialsFromDialog(callback))
      .subscribe(({ username, password, callback }: LoginCompletedArgs) => callback(username, password)));
  }

  public syncState(): Partial<BasicAuthHandlerState> {
    return {
      authInfo: dialogStore.getInfoForAuthDialog(),
      credentials: dialogStore.getAuthCredentials()
    };
  }

  public update(_prevState: Partial<BasicAuthHandlerState>): void {
    this.authInfoObservable.next(this.state.authInfo);
  }

  /**
   * Prevents the default event behavior (that is, to cancel the auth) and
   * shows our own auth dialog.
   *
   * @param  {Event}          event     The `login` event from Electron
   * @param  {LoginAuthInfo}  authInfo  Contains info about the request
   * @param  {LoginRequest}   request   The login request from Electron
   */
  private showAuthDialog(event: Electron.Event, authInfo: Electron.LoginAuthInfo, request: Electron.LoginRequest): void {
    event.preventDefault();
    logger.info('Got login event, now showing the authentication dialog', { authInfo, request });
    dialogActions.showAuthenticationDialog(authInfo);
  }

  /**
   * Waits for our dialog to close, then returns the submitted credentials
   * along with the event callback.
   *
   * @param  {Function} callback  The callback from the `login` event
   * @return {Observable}         An Observable that emits when credentials are submitted
   */
  private credentialsFromDialog(callback: Function): Observable<LoginCompletedArgs> {
    logger.info('Waiting for user credentials');

    const ret = this.authInfoObservable
      .filter((authInfo) => authInfo === null)
      .map(() => {
        logger.info('Received user credentials, passing on.');
        const { username, password } = this.state.credentials;
        return { callback, username, password };
      })
      .take(1)
      .publish();

    ret.connect();
    return ret;
  }
}
