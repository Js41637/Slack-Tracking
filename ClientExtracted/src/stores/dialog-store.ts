import {Store} from '../lib/store';
import {UrlScheme, Credentials, BalloonContent, AuthenticationInfo} from '../actions/dialog-actions';
/*
  Handles all data related to dialogs and other popup-y
  windows.
*/
export class DialogStore {
  private get dialog() {
    return Store.getState().dialog;
  }

  public isShowingLoginDialog(): boolean {
    return this.dialog.isShowingLoginDialog;
  }

  public getInfoForAuthDialog(): AuthenticationInfo {
    return this.dialog.authInfo;
  }

  public getAuthCredentials(): Credentials {
    return this.dialog.credentials;
  }

  public getLastBalloon(): BalloonContent {
    return this.dialog.lastBalloon;
  }

  public getUrlSchemeModal(): UrlScheme {
    return this.dialog.urlSchemeModal;
  }

  public isShowingDevTools(): boolean {
    return this.dialog.isShowingDevTools;
  }
}

const dialogStore = new DialogStore();
export {
  dialogStore
};
