import {app} from 'electron';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {requireTaskPool} from 'electron-remote';
import logger from '../logger';

import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import ReduxComponent from '../lib/redux-component';

const {getJSON} = requireTaskPool(require.resolve('electron-remote/remote-ajax'));

/**
 * When the browser wants to show a basic auth dialog (e.g., when a proxy
 * server is configured), this component will handle the interaction.
 */
export default class BasicAuthHandler extends ReduxComponent {

  constructor(options={}) {
    super();

    this.authInfoObservable = options.authInfoObservable || new Subject();

    // NB: Take the parameters we need from the event
    let loginEvent = options.loginObservable || Observable.fromEvent(app, 'login',
      (e, webContents, request, authInfo, callback) => {
        return {e, authInfo, callback};
      });

    /**
     * When we get a login event:
     * 1. Show only one dialog at a time
     * 2. Wait for the user to enter their credentials
     * 3. Invoke the callback from the Electron event
     */
    this.disposables.add(loginEvent
      .filter(() => this.state.authInfo === null)
      .do(({e, authInfo}) => this.showAuthDialog(e, authInfo))
      .flatMap(({callback}) => this.credentialsFromDialog(callback))
      .subscribe(({callback, username, password}) => callback(username, password)));
  }

  syncState() {
    return {
      authInfo: AppStore.getInfoForAuthDialog(),
      credentials: AppStore.getAuthCredentials(),
      networkStatus: AppStore.getNetworkStatus()
    };
  }

  /**
   * Prevents the default event behavior (that is, to cancel the auth) and
   * shows our own auth dialog.
   *
   * @param  {Object} e         The `login` event from Electron
   * @param  {Object} authInfo  Contains info about the request
   */
  showAuthDialog(e, authInfo) {
    e.preventDefault();
    logger.info(`Got login event for ${JSON.stringify(authInfo)}`);
    AppActions.showAuthenticationDialog(authInfo);
  }

  /**
   * Waits for our dialog to close, then returns the submitted credentials
   * along with the event callback.
   *
   * @param  {Function} callback  The callback from the `login` event
   * @return {Observable}         An Observable that emits when credentials are submitted
   */
  credentialsFromDialog(callback) {
    logger.info('Waiting for user credentials');

    let ret = this.authInfoObservable
      .filter((authInfo) => authInfo === null)
      .map(() => {
        let {username, password} = this.state.credentials;
        return {callback, username, password};
      })
      .take(1)
      .publish();

    ret.connect();
    return ret;
  }

  /**
   * Makes a single request to Slack's API to verify that the network is up.
   *
   * @param  {Observable} networkCheckOverride  Override the network check for testing
   * @return {Observable} An Observable that emits true when network is available,
   *                      or throws an error if not
   */
  checkForNetworkOrError(networkCheckOverride) {
    logger.info('Waiting for network to come back');

    let networkCheck = networkCheckOverride ||
      Observable.fromPromise(getJSON('https://slack.com/api/api.test?error='));

    let ret = networkCheck
      .catch(() => Observable.throw(new Error('No Network')))
      .flatMap(({ok}) => ok ?
        Observable.of(true) :
        Observable.throw('Bad Response'))
      .publishLast();

    ret.connect();
    return ret;
  }

  update() {
    this.authInfoObservable.next(this.state.authInfo);
  }
}
