import {Store} from '../lib/store';
import {DIALOG} from './';

export interface BalloonContent {
  title: string;
  content: string;
  icon?: Electron.NativeImage;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthenticationInfo {
  isProxy: boolean;
  scheme: string;
  host: string;
  port: number;
  realm: string;
}

export interface UrlScheme {
  url: string;
  disposition: Electron.NewWindowDisposition;
  isShowing?: boolean;
}

export class DialogActions {
  public showLoginDialog(): void {
    Store.dispatch({type: DIALOG.SET_LOGIN_DIALOG, data: true});
  }

  public hideLoginDialog(): void {
    Store.dispatch({type: DIALOG.SET_LOGIN_DIALOG, data: false});
  }

  public showUrlSchemeModal({url, disposition}: UrlScheme): void {
    Store.dispatch({
      type: DIALOG.SHOW_URL_SCHEME_MODAL,
      data: {isShowing: true, url, disposition},
      omitKeysFromLog: ['url']
    });
  }

  public hideUrlSchemeModal(): void {
    Store.dispatch({
      type: DIALOG.SHOW_URL_SCHEME_MODAL,
      data: {isShowing: false, url: '', disposition: ''}
    });
  }

  public showAuthenticationDialog(authInfo: AuthenticationInfo): void {
    Store.dispatch({type: DIALOG.SHOW_AUTH_DIALOG, data: authInfo});
  }

  public submitCredentials(credentials: Credentials): void {
    Store.dispatch({
      type: DIALOG.SUBMIT_CREDENTIALS,
      shouldSaveToKeychain: true,
      data: credentials,
      omitKeysFromLog: ['password']
    });
  }

  public showBalloon(balloon: BalloonContent): void {
    Store.dispatch({type: DIALOG.SHOW_TRAY_BALLOON, data: balloon});
  }
}

const dialogActions = new DialogActions();
export {
  dialogActions
};
