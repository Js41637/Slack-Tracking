/**
 * @module RendererComponents
 */ /** for typedoc */

import { dialogActions } from '../../actions/dialog-actions';
import { dialogStore } from '../../stores/dialog-store';
import { Component } from '../../lib/component';
import { Modal } from './modal';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

import * as React from 'react'; // tslint:disable-line

export interface BasicAuthViewProps {
  authInfo: Electron.LoginAuthInfo;
}

export interface BasicAuthViewState {
  username: string;
  password: string;
}

export class BasicAuthView extends Component<BasicAuthViewProps, Partial<BasicAuthViewState>> {
  private usernameElement: HTMLElement;
  private passwordElement: HTMLElement;
  private readonly refHandlers = {
    username: (ref: HTMLElement) => this.usernameElement = ref,
    password: (ref: HTMLElement) => this.passwordElement = ref
  };

  constructor() {
    super();

    this.state = Object.assign({}, this.state, dialogStore.getAuthCredentials() || {
      username: null,
      password: null
    });
  }

  public handleSubmit(): void {
    dialogActions.submitCredentials({
      username: this.state.username!,
      password: this.state.password!
    });
  }

  public componentDidMount(): void {
    this.usernameElement.focus();
  }

  public render(): JSX.Element | null {
    const { isProxy, host } = this.props.authInfo;
    const message = $intl.t(`To connect to Slack, you need to enter a username and password for the {hostType} `, LOCALE_NAMESPACE.RENDERER)({
      hostType: isProxy ? $intl.t(`proxy`, LOCALE_NAMESPACE.GENERAL)() : $intl.t(`server`, LOCALE_NAMESPACE.GENERAL)()
    });

    return (
      <Modal
        className='AuthView'
        width={360}
        height={340}
        transitionAppear={true}
      >
        <div className='AuthView-dialog' style={{ height: '100%', backgroundColor: 'white' }}>
          <div className='AuthView-message'>
            {message}
            <strong>{host}</strong>
          </div>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <label htmlFor='username'>{$intl.t(`Username`, LOCALE_NAMESPACE.GENERAL)()}</label>
            <input type='text' id='username' value={this.state.username} onChange={this.handleChange.bind(this)} ref={this.refHandlers.username} />
            <label htmlFor='password'>{$intl.t(`Password`, LOCALE_NAMESPACE.GENERAL)()}</label>
            <input
              type='password'
              id='password'
              value={this.state.password}
              onChange={this.handleChange.bind(this)}
              ref={this.refHandlers.password}
            />
            <button type='submit' className='AuthView-button'>{$intl.t(`Submit`, LOCALE_NAMESPACE.GENERAL)()}</button>
          </form>
        </div>
      </Modal>
    );
  }

  private handleChange(event: Event): void {
    this.setState({
      [(event.target as any).id]: (event.target as any).value
    });
  }
}
