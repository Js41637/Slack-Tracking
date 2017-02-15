import {Store} from '../lib/store';
import {EVENTS} from './';

export class EventActions {
  public editingCommand(command: string, windowId?: number): void {
    Store.dispatch({
      type: EVENTS.EDITING_COMMAND,
      data: {windowId, command}
    });
  }

  public appCommand(command: string): void {
    Store.dispatch({
      type: EVENTS.APP_COMMAND,
      data: {command}
    });
  }

  public mainWindowFocused(): void {
    Store.dispatch({
      type: EVENTS.MAIN_WINDOW_FOCUSED,
      omitFromLog: true
    } as any);
  }

  public foregroundApp(): void {
    Store.dispatch({type: EVENTS.FOREGROUND_APP} as any);
  }

  public handleReplyLink(url: string): void {
    Store.dispatch({
      type: EVENTS.HANDLE_REPLY_LINK,
      data: {url}
    });
  }

  public handleDeepLink(url: string): void {
    Store.dispatch({
      type: EVENTS.HANDLE_DEEP_LINK,
      data: {url}
    });
  }

  public handleExternalLink(url: string, disposition: Electron.NewWindowDisposition): void {
    Store.dispatch({
      type: EVENTS.HANDLE_EXTERNAL_LINK,
      data: {url, disposition}
    });
  }

  public quitApp(): void {
    Store.dispatch({type: EVENTS.QUIT_APP} as any);
  }

  public reload(everything: boolean = false): void {
    Store.dispatch({
      type: EVENTS.RELOAD,
      data: {everything}
    });
  }

  public toggleFullScreen(): void {
    Store.dispatch({type: EVENTS.TOGGLE_FULL_SCREEN} as any);
  }

  public toggleDevTools(electronDevTools: boolean = false): void {
    Store.dispatch({
      type: EVENTS.TOGGLE_DEV_TOOLS,
      data: electronDevTools
    });
  }

  public showAbout(): void {
    Store.dispatch({type: EVENTS.SHOW_ABOUT} as any);
  }

  public showReleaseNotes(): void {
    Store.dispatch({type: EVENTS.SHOW_RELEASE_NOTES} as any);
  }

  public showWebappDialog(dialogType: string): void {
    Store.dispatch({
      type: EVENTS.SHOW_WEBAPP_DIALOG,
      data: {dialogType}
    });
  }

  public signOutTeam(teamId: string): void {
    Store.dispatch({
      type: EVENTS.SIGN_OUT_TEAM,
      data: {teamId}
    });
  }

  public refreshTeam(teamId: string): void {
    Store.dispatch({
      type: EVENTS.REFRESH_TEAM,
      data: {teamId}
    });
  }

  public confirmAndResetApp(): void {
    Store.dispatch({type: EVENTS.CONFIRM_AND_RESET_APP} as any);
  }

  public reportIssue(): void {
    Store.dispatch({type: EVENTS.REPORT_ISSUE} as any);
  }

  public prepareAndRevealLogs(): void {
    Store.dispatch({type: EVENTS.PREPARE_AND_REVEAL_LOGS} as any);
  }

  public closeAllUpdateBanners(): void {
    Store.dispatch({type: EVENTS.CLOSE_ALL_UPDATE_BANNERS} as any);
  }

  public popupAppMenu(invokedViaKeyboard: boolean): void {
    Store.dispatch({type: EVENTS.POPUP_APP_MENU, data: {invokedViaKeyboard}});
  }

  public systemTextSettingsChanged(): void {
    Store.dispatch({type: EVENTS.SYSTEM_TEXT_SETTINGS_CHANGED});
  }
}

const eventActions = new EventActions();
export {
  eventActions
};
