/**
 * @module Stores
 */ /** for typedoc */

import { Store } from '../lib/store';

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

  public getInfoForAuthDialog() {
    return this.dialog.authInfo;
  }

  public getAuthCredentials() {
    return this.dialog.credentials;
  }

  public getLastBalloon() {
    return this.dialog.lastBalloon;
  }

  public getUrlSchemeModal() {
    return this.dialog.urlSchemeModal;
  }
}

const dialogStore = new DialogStore();
export {
  dialogStore
};
