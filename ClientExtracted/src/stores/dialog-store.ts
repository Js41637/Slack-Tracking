/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';
import { UrlScheme, BalloonContent } from '../actions/dialog-actions';
import { Credentials } from '../utils/shared-constants';

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

  public getInfoForAuthDialog(): Electron.LoginAuthInfo {
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
}

const dialogStore = new DialogStore();
export {
  dialogStore
};
