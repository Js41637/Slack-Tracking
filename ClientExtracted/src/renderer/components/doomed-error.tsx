/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import { remote } from 'electron';
import * as path from 'path';
import * as React from 'react';
import { Observable } from 'rxjs/Observable';

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { appStore } from '../../stores/app-store';
import { appTeamsStore } from '../../stores/app-teams-store';
import { dialogStore } from '../../stores/dialog-store';
import { LastError } from '../../utils/shared-constants';

export interface DoomedErrorState {
  lastError: LastError | null;
  selectedTeamId: string | null;
  authInfo: Electron.AuthInfo | null;
  isShowingLoginDialog: boolean;
  hide: boolean;
  fadeInTimeout?: NodeJS.Timer;
}

/**
 * The "doomed error screen" sits behind the webviews and should in theory never be visible.
 * In practice, it'll be visible to the user when the webviews silently crash - putting the app
 * in a weird state.
 */
export class DoomedError extends Component<{}, Partial<DoomedErrorState>> {
  /**
   * This method immediately hides the DoomedError screen and slowly
   * fades it back in.
   *
   * @static
   */
  public static hideTemporarily() {
    const doomedErrorElements = document.getElementsByClassName('DoomedError');

    if (doomedErrorElements && doomedErrorElements.length > 0) {
      const element = doomedErrorElements[0] as HTMLDivElement;
      element.classList.remove('DoomedErrorFadeIn');
      element.style.opacity = '0';

      // Triggering a reflow to ensure that the animation is
      // actually restarted
      // tslint:disable-next-line:no-unused-expression-chai
      void element.offsetWidth;

      element.classList.add('DoomedErrorFadeIn');
      element.style.opacity = '1';
    }
  }

  private div: HTMLDivElement | null = null;
  private readonly refHandlers = {
    div: (ref: HTMLDivElement) => this.div = ref
  };

  constructor() {
    super();
    this.triggerFadeIn(true);
  }

  public syncState(): Partial<DoomedErrorState> {
    return {
      lastError: appStore.getLastError(),
      selectedTeamId: appTeamsStore.getSelectedTeamId(),
      authInfo: dialogStore.getInfoForAuthDialog(),
      isShowingLoginDialog: dialogStore.isShowingLoginDialog()
    };
  }

  public componentDidMount() {
    const browserWindow = remote.getCurrentWindow();

    this.disposables.add(Observable.fromEvent(browserWindow, 'resize')
      .throttleTime(500)
      .subscribe(DoomedError.hideTemporarily));
  }

  /**
   * When the component updates, we'll check if the team has been switched.
   * If so, we'll re-trigger the fade-in to ensure that the error doesn't flash up.
   */
  public componentWillUpdate(_nextProps: {}, nextState: DoomedErrorState) {
    // Dialog change? Let's fade in
    const loginDialogChange = this.state.isShowingLoginDialog !== nextState.isShowingLoginDialog;
    const proxyDialogClosed = this.state.authInfo && !nextState.authInfo;

    if (proxyDialogClosed || loginDialogChange) {
      return this.triggerFadeIn(true);
    }

    // Team switch? Let's fade in
    const currentTeamId = this.state.selectedTeamId;
    const nextTeamId = nextState.selectedTeamId;
    const teamSwitched = currentTeamId !== nextTeamId;
    this.triggerFadeIn(teamSwitched);
  }

  /**
   * If called with `true`, triggers a fade in of the doomed error. If set to `false`,
   * it'll permanently show the doomed error.
   *
   * @param {Boolean} triggerFadeIn
   */
  public triggerFadeIn(hide: boolean) {
    DoomedError.hideTemporarily();

    // If a fade-in is scheduled, cancel it
    if (this.state.fadeInTimeout) clearTimeout(this.state.fadeInTimeout);

    // Reset fade-in
    if (this.state.hide !== hide) {
      setTimeout(() => {
        const newState: Partial<DoomedErrorState> = { hide };

        if (hide) {
          newState.fadeInTimeout = setTimeout(() => this.setState({ hide: false }), 3500);
        }

        this.setState(newState);
      }, 0);
    }
  }

  /**
   * Whenever we encounter an error, we store it in the app store's "lastError" property.
   * This allows us to display the last encountered error to the user, thus giving at least
   * a hint around what could have gone wrong. This method renders an error if it exists, or
   * returns null if it doesn't.
   *
   * @returns {(JSX.Element | null)}
   */
  public renderLastError(): JSX.Element | null {
    const { lastError } = this.state;

    if (lastError) {
      const explanation = $intl.t('The last error we encountered had the code', LOCALE_NAMESPACE.RENDERER)();
      const { errorCode } = lastError;
      const description = lastError.errorDescription ? `(${lastError.errorDescription})` : '';
      const error = `${errorCode} ${description}`.trim();

      return (
        <div className='LastKnownError'>
          <p>{explanation} <code>{error}</code></p>
        </div>
      );
    }

    return null;
  }

  public render(): JSX.Element | null {
    const { hide, authInfo } = this.state;
    const className = classNames('DoomedError', { DoomedErrorFadeIn: !hide });
    const style = { opacity: hide || authInfo ? 0 : 1 };
    // tslint:disable-next-line:max-line-length
    const text = $intl.t(`Slack’s failed to boot up, and we’re not sure why. You may want to try restarting the app, or dropping us a line: `, LOCALE_NAMESPACE.RENDERER)();

    return (
      <div ref={this.refHandlers.div} className={className} style={style}>
        <img src={path.join(__dirname, '..', '..', 'static', 'darn-robots.png')} />
        <h1>{$intl.t(`Something’s not working`, LOCALE_NAMESPACE.RENDERER)()}</h1>
        <p>
          {text}
          <strong>support@slack.com</strong>
        </p>
        {this.renderLastError()}
      </div>
    );
  }
}
