import {app} from 'electron';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {logger} from '../logger';

import {AuthenticationInfo, Credentials, dialogActions} from '../actions/dialog-actions';
import {networkStatusType} from '../utils/shared-constants';
import {appStore} from '../stores/app-store';
import {dialogStore} from '../stores/dialog-store';
import {ReduxComponent} from '../lib/redux-component';

export interface BasicAuthHandlerState {
  authInfo: AuthenticationInfo;
  credentials: Credentials;
  networkStatus: networkStatusType;
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
      (e, _webContents, _request, authInfo, callback) => ({e, authInfo, callback}));

    /**
     * When we get a login event:
     * 1. Show only one dialog at a time
     * 2. Wait for the user to enter their credentials
     * 3. Invoke the callback from the Electron event
     */
    this.disposables.add(loginEvent
      .filter(() => this.state.authInfo === null)
      .do(({e, authInfo}: {e: Electron.Event, authInfo: AuthenticationInfo}) => this.showAuthDialog(e, authInfo))
      .flatMap(({callback}: {callback: Function}) => this.credentialsFromDialog(callback))
      .subscribe(({callback, username, password}: {callback: Function, username: string, password: string}) => callback(username, password)));
  }

  public syncState(): Partial<BasicAuthHandlerState> {
    return {
      authInfo: dialogStore.getInfoForAuthDialog(),
      credentials: dialogStore.getAuthCredentials(),
      networkStatus: appStore.getNetworkStatus()
    };
  }

  public update(_prevState: Partial<BasicAuthHandlerState>): void {
    this.authInfoObservable.next(this.state.authInfo);
  }

  /**
   * Prevents the default event behavior (that is, to cancel the auth) and
   * shows our own auth dialog.
   *
   * @param  {Object} e         The `login` event from Electron
   * @param  {Object} authInfo  Contains info about the request
   */
  private showAuthDialog(e: Electron.Event, authInfo: AuthenticationInfo): void {
    e.preventDefault();
    logger.info(`Got login event for ${JSON.stringify(authInfo)}`);
    dialogActions.showAuthenticationDialog(authInfo);
  }

  /**
   * Waits for our dialog to close, then returns the submitted credentials
   * along with the event callback.
   *
   * @param  {Function} callback  The callback from the `login` event
   * @return {Observable}         An Observable that emits when credentials are submitted
   */
  private credentialsFromDialog(callback: Function): Observable<{callback: Function, username: string, password: string}> {
    logger.info('Waiting for user credentials');

    const ret = this.authInfoObservable
      .filter((authInfo) => authInfo === null)
      .map(() => {
        const {username, password} = this.state.credentials;
        return {callback, username, password};
      })
      .take(1)
      .publish();

    ret.connect();
    return ret;
  }
}
